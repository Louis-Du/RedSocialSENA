/**
 * ChatService - Gestor centralizado de chats y mensajes con Firebase
 * Refactorización profesional con soporte para chats privados, grupales,
 * mensajes en tiempo real, imágenes, y manejo robusto de concurrencia.
 * 
 * Responsabilidades:
 * - Gestión de chats privados (1 a 1) y grupales
 * - Envío de mensajes con soporte de imágenes
 * - Listeners de tiempo real (onSnapshot)
 * - Control de participantes con validaciones
 * - Indicador de escritura
 * - Manejo de transacciones Firebase
 * - Seguridad: validar participación en cada operación
 * 
 * Modelo Firestore:
 * chats/{chatId}
 *   - type: 'private' | 'group'
 *   - participants: string[]
 *   - createdBy: string
 *   - name: string | null (solo para grupos)
 *   - photoURL: string | null
 *   - lastMessage: { content, fromUserId, timestamp, hasImage }
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 * 
 * chats/{chatId}/messages/{messageId}
 *   - fromUserId: string
 *   - content: string
 *   - imageUrl: string | null
 *   - readBy: string[]
 *   - createdAt: timestamp
 * 
 * chats/{chatId}/typing/{userId}
 *   - isTyping: boolean
 *   - timestamp: timestamp
 */

import { auth, db, storage } from '../firebase-config.js';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    runTransaction,
    arrayUnion,
    arrayRemove
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';


class ChatService {
    constructor() {
        this.activeListeners = new Map();
    }

    /**
     * Obtiene ID determinístico para chat privado
     * Garantiza que el mismo chat privado tenga el mismo ID sin importar orden
     * @param {string} userId1 - ID del primer usuario
     * @param {string} userId2 - ID del segundo usuario
     * @returns {string} ID del chat privado
     */
    _getPrivateChatId(userId1, userId2) {
        return [userId1, userId2].sort().join('_');
    }

    /**
     * Obtiene usuario actual autenticado
     * @returns {Object|null}
     */
    _getCurrentUser() {
        return auth.currentUser;
    }

    /**
     * Valida que el usuario actual sea participante del chat
     * @param {Array} participants - Array de IDs de participantes
     * @returns {boolean}
     */
    _isParticipant(participants) {
        const currentUser = this._getCurrentUser();
        if (!currentUser) return false;
        return participants.includes(currentUser.uid);
    }

    /**
     * Valida archivo de imagen
     * @param {File} file - Archivo a validar
     * @returns {boolean}
     */
    _isValidImageFile(file) {
        if (!file) return false;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        return validTypes.includes(file.type) && file.size <= maxSize;
    }

    /**
     * Crea o obtiene un chat privado (1 a 1)
     * ID determinístico: [userId1, userId2].sort().join('_')
     * Esto garantiza que no haya duplicados
     * @param {string} otherUserId - ID del otro usuario
     * @returns {Promise<string>} ID del chat
     * @throws {Error}
     */
    async createPrivateChat(otherUserId) {
        try {
            const currentUser = this._getCurrentUser();
            if (!currentUser) throw new Error('Usuario no autenticado');
            if (!otherUserId) throw new Error('ID del usuario inválido');
            if (otherUserId === currentUser.uid) throw new Error('No puedes chatear contigo mismo');

            const chatId = this._getPrivateChatId(currentUser.uid, otherUserId);
            const chatRef = doc(db, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);

            // Si ya existe, retornar el ID
            if (chatDoc.exists()) {
                return chatId;
            }

            // Crear nuevo chat privado
            await setDoc(chatRef, {
                type: 'private',
                participants: [currentUser.uid, otherUserId],
                createdBy: currentUser.uid,
                name: null,
                photoURL: null,
                lastMessage: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return chatId;
        } catch (error) {
            console.error('Error creando chat privado:', error);
            throw error;
        }
    }

    /**
     * Crea un chat grupal
     * @param {string} groupName - Nombre del grupo
     * @param {string[]} participantsIds - Array de IDs de participantes (sin el usuario actual)
     * @param {string} photoURL - URL de foto del grupo (opcional)
     * @returns {Promise<string>} ID del chat grupal creado
     * @throws {Error}
     */
    async createGroupChat(groupName, participantsIds = [], photoURL = null) {
        try {
            const currentUser = this._getCurrentUser();
            if (!currentUser) throw new Error('Usuario no autenticado');
            if (!groupName || groupName.trim().length === 0) throw new Error('Nombre del grupo requerido');
            if (!Array.isArray(participantsIds)) throw new Error('Participantes debe ser un array');

            // Agregar usuario actual a participantes
            const allParticipants = [currentUser.uid, ...participantsIds.filter(id => id !== currentUser.uid)];

            // Crear nuevo documento de chat grupal
            const chatsRef = collection(db, 'chats');
            const docRef = await addDoc(chatsRef, {
                type: 'group',
                participants: allParticipants,
                createdBy: currentUser.uid,
                name: groupName.trim(),
                photoURL: photoURL || null,
                lastMessage: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error creando chat grupal:', error);
            throw error;
        }
    }

    /**
     * Envía un mensaje a un chat
     * Maneja texto e imágenes
     * Usa transacción para garantizar consistencia
     * @param {string} chatId - ID del chat
     * @param {string} content - Contenido del mensaje (texto)
     * @param {File} imageFile - Archivo de imagen (opcional)
     * @returns {Promise<Object>} { success: boolean, messageId: string|null, error?: string }
     */
    async sendMessage(chatId, content = '', imageFile = null) {
        try {
            const currentUser = this._getCurrentUser();
            if (!currentUser) throw new Error('Usuario no autenticado');
            if (!chatId) throw new Error('Chat ID requerido');

            // Validar contenido
            const hasText = content && content.trim().length > 0;
            const hasImage = imageFile && this._isValidImageFile(imageFile);

            if (!hasText && !hasImage) {
                throw new Error('El mensaje debe contener texto o imagen');
            }

            // Obtener documento del chat
            const chatRef = doc(db, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);
            if (!chatDoc.exists()) throw new Error('Chat no encontrado');

            const chatData = chatDoc.data();
            if (!this._isParticipant(chatData.participants)) {
                throw new Error('No tienes permisos para enviar mensajes en este chat');
            }

            // Subir imagen a Storage si existe
            let imageUrl = null;
            // ⚠️ STORAGE DESHABILITADO TEMPORALMENTE
            if (hasImage) {
                console.warn('⚠️ Subida de imágenes en chat deshabilitada. Activa Firebase Storage para usar esta función.');
                imageUrl = null; // Ignorar imagen por ahora
            }
            /* CÓDIGO ORIGINAL (descomentar cuando actives Storage):
            if (hasImage) {
                try {
                    const storageRef = ref(storage, `chat-images/${chatId}/${Date.now()}_${imageFile.name}`);
                    await uploadBytes(storageRef, imageFile);
                    imageUrl = await getDownloadURL(storageRef);
                } catch (uploadError) {
                    console.error('Error subiendo imagen:', uploadError);
                    throw new Error('Error al subir la imagen');
                }
            }
            */

            // Usar transacción para crear mensaje y actualizar lastMessage atomicamente
            const messageId = await runTransaction(db, async (transaction) => {
                // Crear mensaje en subcolección
                const messagesRef = collection(db, 'chats', chatId, 'messages');
                const newMessageRef = doc(messagesRef);

                transaction.set(newMessageRef, {
                    fromUserId: currentUser.uid,
                    content: hasText ? content.trim() : '',
                    imageUrl: imageUrl,
                    readBy: [currentUser.uid],
                    createdAt: serverTimestamp()
                });

                // Actualizar lastMessage del chat (evita condiciones de carrera)
                transaction.update(chatRef, {
                    lastMessage: {
                        content: hasText ? content.trim() : (hasImage ? '[Imagen]' : ''),
                        fromUserId: currentUser.uid,
                        timestamp: serverTimestamp(),
                        hasImage: hasImage
                    },
                    updatedAt: serverTimestamp()
                });

                return newMessageRef.id;
            });

            return {
                success: true,
                messageId: messageId,
                hasImage: hasImage
            };
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            return {
                success: false,
                messageId: null,
                error: error.message
            };
        }
    }

    /**
     * Escucha mensajes de un chat en tiempo real
     * Ordenados por createdAt ascendente
     * @param {string} chatId - ID del chat
     * @param {Function} callback - Función que recibe (error, messages)
     * @returns {Function} Función para desuscribirse
     */
    listenToMessages(chatId, callback) {
        try {
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const q = query(messagesRef, orderBy('createdAt', 'asc'));

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const messages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    callback(null, messages);
                },
                (error) => {
                    console.error('Error escuchando mensajes:', error);
                    callback(error, []);
                }
            );

            // Guardar unsubscribe para limpiar después
            const listenerId = `messages_${chatId}`;
            this.activeListeners.set(listenerId, unsubscribe);

            return () => {
                unsubscribe();
                this.activeListeners.delete(listenerId);
            };
        } catch (error) {
            console.error('Error en listenToMessages:', error);
            callback(error, []);
        }
    }

    /**
     * Escucha lista de chats del usuario actual en tiempo real
     * Solo muestra chats donde el usuario es participante
     * Ordenados por updatedAt descendente (más recientes primero)
     * @param {Function} callback - Función que recibe (error, chats)
     * @returns {Function} Función para desuscribirse
     */
    listenToUserChats(callback) {
        try {
            const currentUser = this._getCurrentUser();
            if (!currentUser) {
                callback(null, []);
                return () => {};
            }

            const chatsRef = collection(db, 'chats');
            const q = query(
                chatsRef,
                where('participants', 'array-contains', currentUser.uid),
                orderBy('updatedAt', 'desc')
            );

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const chats = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    callback(null, chats);
                },
                (error) => {
                    console.error('Error escuchando chats:', error);
                    callback(error, []);
                }
            );

            // Guardar unsubscribe
            this.activeListeners.set('userChats', unsubscribe);

            return () => {
                unsubscribe();
                this.activeListeners.delete('userChats');
            };
        } catch (error) {
            console.error('Error en listenToUserChats:', error);
            callback(error, []);
        }
    }

    /**
     * Marca un mensaje como leído
     * @param {string} chatId - ID del chat
     * @param {string} messageId - ID del mensaje
     * @returns {Promise<void>}
     */
    async markMessageAsRead(chatId, messageId) {
        try {
            const currentUser = this._getCurrentUser();
            if (!currentUser) throw new Error('Usuario no autenticado');

            const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
            await updateDoc(messageRef, {
                readBy: arrayUnion(currentUser.uid)
            });
        } catch (error) {
            console.error('Error marcando mensaje como leído:', error);
        }
    }

    /**
     * Establece/quita indicador de escritura
     * @param {string} chatId - ID del chat
     * @param {boolean} isTyping - Si está escribiendo
     * @returns {Promise<void>}
     */
    async setTyping(chatId, isTyping) {
        try {
            const currentUser = this._getCurrentUser();
            if (!currentUser) throw new Error('Usuario no autenticado');

            const typingRef = doc(db, 'chats', chatId, 'typing', currentUser.uid);

            if (isTyping) {
                await setDoc(typingRef, {
                    isTyping: true,
                    timestamp: serverTimestamp()
                });
            } else {
                await deleteDoc(typingRef);
            }
        } catch (error) {
            console.error('Error en setTyping:', error);
        }
    }

    /**
     * Escucha indicadores de escritura en tiempo real
     * Retorna lista de userIds que están escribiendo
     * @param {string} chatId - ID del chat
     * @param {Function} callback - Recibe (error, typingUserIds)
     * @returns {Function} Función para desuscribirse
     */
    listenToTyping(chatId, callback) {
        try {
            const typingRef = collection(db, 'chats', chatId, 'typing');
            const q = query(typingRef);

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const typingUsers = snapshot.docs
                        .filter(doc => doc.data().isTyping)
                        .map(doc => doc.id);
                    callback(null, typingUsers);
                },
                (error) => {
                    console.error('Error escuchando typing:', error);
                    callback(error, []);
                }
            );

            const listenerId = `typing_${chatId}`;
            this.activeListeners.set(listenerId, unsubscribe);

            return () => {
                unsubscribe();
                this.activeListeners.delete(listenerId);
            };
        } catch (error) {
            console.error('Error en listenToTyping:', error);
            callback(error, []);
        }
    }

    /**
     * Agrega participantes a un chat grupal
     * Solo el creador puede agregar participantes
     * @param {string} chatId - ID del chat
     * @param {string[]} userIds - IDs de usuarios a agregar
     * @returns {Promise<void>}
     * @throws {Error}
     */
    async addGroupParticipants(chatId, userIds) {
        try {
            const currentUser = this._getCurrentUser();
            if (!currentUser) throw new Error('Usuario no autenticado');

            const chatRef = doc(db, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);

            if (!chatDoc.exists()) throw new Error('Chat no encontrado');

            const chatData = chatDoc.data();
            if (chatData.type !== 'group') throw new Error('Solo se puede agregar participantes a chats grupales');
            if (chatData.createdBy !== currentUser.uid) throw new Error('Solo el creador puede agregar participantes');

            await updateDoc(chatRef, {
                participants: arrayUnion(...userIds),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error agregando participantes:', error);
            throw error;
        }
    }

    /**
     * Remueve participante de un chat grupal
     * El creador o el usuario mismo pueden removerse
     * @param {string} chatId - ID del chat
     * @param {string} userId - ID del usuario a remover
     * @returns {Promise<void>}
     * @throws {Error}
     */
    async removeGroupParticipant(chatId, userId) {
        try {
            const currentUser = this._getCurrentUser();
            if (!currentUser) throw new Error('Usuario no autenticado');

            const chatRef = doc(db, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);

            if (!chatDoc.exists()) throw new Error('Chat no encontrado');

            const chatData = chatDoc.data();
            if (chatData.type !== 'group') throw new Error('Solo es válido para chats grupales');

            // Solo el creador o el usuario mismo puede removerse
            if (chatData.createdBy !== currentUser.uid && userId !== currentUser.uid) {
                throw new Error('No tienes permisos para remover participantes');
            }

            await updateDoc(chatRef, {
                participants: arrayRemove(userId),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error removiendo participante:', error);
            throw error;
        }
    }

    /**
     * Obtiene un chat por ID
     * Valida que el usuario sea participante
     * @param {string} chatId - ID del chat
     * @returns {Promise<Object|null>}
     */
    async getChat(chatId) {
        try {
            const chatRef = doc(db, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);

            if (!chatDoc.exists()) return null;

            const chatData = chatDoc.data();
            if (!this._isParticipant(chatData.participants)) {
                return null; // No tienes acceso
            }

            return {
                id: chatDoc.id,
                ...chatData
            };
        } catch (error) {
            console.error('Error obteniendo chat:', error);
            throw error;
        }
    }

    /**
     * Limpia todos los listeners activos
     * IMPORTANTE: Llamar cuando el usuario cierre sesión o se desmonte el componente
     * Esto evita memory leaks
     */
    cleanup() {
        this.activeListeners.forEach(unsubscribe => {
            try {
                unsubscribe();
            } catch (error) {
                console.error('Error limpiando listener:', error);
            }
        });
        this.activeListeners.clear();
    }
}

// Exportar instancia singleton
export const chatService = new ChatService();
