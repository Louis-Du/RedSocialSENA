/**
 * AppState - Gestor centralizado de estado global de la aplicación
 * 
 * ARQUITECTURA:
 * - Mantiene el estado único de verdad para usuarios, posts, chats, comentarios
 * - Los servicios consultan y actualizan AppState
 * - La UI se suscribe a cambios en AppState
 * - Separa completamente la lógica de datos de la UI
 * 
 * TRANSICIÓN A BACKEND:
 * Los datos se cargan de localStorage inicialmente, pero cuando se conecte un backend:
 * 1. Los servicios harán fetch() en lugar de localStorage
 * 2. AppState seguirá siendo el "cache" en cliente
 * 3. La UI no cambiará
 */

import { getFromStorage, saveToStorage, removeFromStorage, generateId } from './utils.js';

class AppState {
    constructor() {
        // === USUARIO ACTIVO (simulado) ===
        this.currentUser = {
            id: 'user_1',
            tipoDoc: 'CC',
            documento: '1234567890',
            nombre: 'Daniel Esteban',
            apodo: 'Aprendiz SENA (Tú)',
            trimestre: '3° Trimestre',
            programa: 'Tecnólogo en Análisis y Desarrollo de Software',
            profilePicture: null,
            bio: 'Aprendiz apasionado por la tecnología',
            isLoggedIn: false
        };

        // === USUARIOS SIMULADOS (para perfiles de otros) ===
        this.users = [
            {
                id: 'user_2',
                nombre: 'María García',
                apodo: 'María',
                trimestre: '2° Trimestre',
                programa: 'Técnica en Administración de Sistemas',
                bio: 'Especialista en redes',
                profilePicture: null
            },
            {
                id: 'user_3',
                nombre: 'Carlos López',
                apodo: 'Carlos',
                trimestre: '1° Trimestre',
                programa: 'Técnica en Programación',
                bio: 'Frontend developer en formación',
                profilePicture: null
            }
        ];

        // === PUBLICACIONES ===
        this.posts = [];

        // === COMENTARIOS ===
        this.comments = {}; // { postId: [comments...] }

        // === CHATS ===
        this.chats = {}; // { userId: [messages...] }

        // === SUSCRIPTORES PARA CAMBIOS ===
        this.subscribers = {
            posts: [],
            comments: [],
            currentUser: [],
            chats: []
        };

        // Cargar datos desde localStorage
        this.loadFromStorage();
    }

    // ==================== PERSISTENCIA ====================

    /**
     * Carga datos desde localStorage
     * En producción con backend, esto sería una llamada a API
     */
    loadFromStorage() {
        const stored = getFromStorage('appState', null);
        if (stored) {
            this.posts = stored.posts || [];
            this.comments = stored.comments || {};
            this.chats = stored.chats || {};
            this.currentUser = { ...this.currentUser, ...stored.currentUser };
        }
        
        // Cargar sesión de usuario
        const session = getFromStorage('userSession', null);
        if (session) {
            this.currentUser.isLoggedIn = true;
        }
    }

    /**
     * Guarda datos en localStorage
     * En producción con backend, esto sería sincronizar cambios con API
     */
    saveToStorage() {
        const state = {
            posts: this.posts,
            comments: this.comments,
            chats: this.chats,
            currentUser: this.currentUser
        };
        saveToStorage('appState', state);
    }

    // ==================== USUARIO ACTIVO ====================

    /**
     * Autentica el usuario (simulado)
     * @param {string} tipoDoc - Tipo de documento
     * @param {string} documento - Número de documento
     * @param {string} password - Contraseña
     * @returns {boolean} true si es válido
     */
    loginUser(tipoDoc, documento, password) {
        // Simulación básica - en backend sería validación real
        if (tipoDoc && documento && password) {
            this.currentUser.tipoDoc = tipoDoc;
            this.currentUser.documento = documento;
            this.currentUser.isLoggedIn = true;
            saveToStorage('userSession', { tipoDoc, documento });
            this.notifySubscribers('currentUser');
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Cierra sesión del usuario
     */
    logoutUser() {
        this.currentUser.isLoggedIn = false;
        removeFromStorage('userSession');
        removeFromStorage('appState');
        this.posts = [];
        this.comments = {};
        this.chats = {};
        this.notifySubscribers('currentUser');
    }

    /**
     * Actualiza perfil del usuario actual
     * @param {Object} updates - Campos a actualizar
     */
    updateCurrentUserProfile(updates) {
        this.currentUser = { ...this.currentUser, ...updates };
        this.notifySubscribers('currentUser');
        this.saveToStorage();
    }

    /**
     * Obtiene el usuario actual
     * @returns {Object} Usuario actual
     */
    getCurrentUser() {
        return { ...this.currentUser };
    }

    /**
     * Obtiene otro usuario por ID
     * @param {string} userId - ID del usuario
     * @returns {Object|null} Usuario o null
     */
    getUserById(userId) {
        if (userId === this.currentUser.id) return this.getCurrentUser();
        const user = this.users.find(u => u.id === userId);
        return user ? { ...user } : null;
    }

    // ==================== PUBLICACIONES ====================

    /**
     * Crea una nueva publicación
     * @param {string} content - Contenido de la publicación
     * @param {string|null} imageUrl - URL de la imagen (puede ser data URL)
     * @returns {Object} Post creado
     */
    createPost(content, imageUrl = null) {
        const post = {
            id: generateId(),
            userId: this.currentUser.id,
            content,
            imageUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            likesBy: []
        };
        this.posts.unshift(post); // Insertar al inicio
        this.notifySubscribers('posts');
        this.saveToStorage();
        return post;
    }

    /**
     * Obtiene todas las publicaciones
     * @returns {Array} Publicaciones
     */
    getPosts() {
        return this.posts.map(p => ({ ...p })); // Return copies
    }

    /**
     * Obtiene una publicación por ID
     * @param {string} postId - ID del post
     * @returns {Object|null}
     */
    getPostById(postId) {
        const post = this.posts.find(p => p.id === postId);
        return post ? { ...post } : null;
    }

    /**
     * Obtiene publicaciones de un usuario específico
     * @param {string} userId - ID del usuario
     * @returns {Array} Posts del usuario
     */
    getPostsByUserId(userId) {
        return this.posts
            .filter(p => p.userId === userId)
            .map(p => ({ ...p }));
    }

    /**
     * Actualiza una publicación (solo el propietario)
     * @param {string} postId - ID del post
     * @param {Object} updates - Cambios
     * @returns {boolean} true si fue actualizado
     */
    updatePost(postId, updates) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return false;
        if (post.userId !== this.currentUser.id) return false; // Solo el autor puede editar
        
        Object.assign(post, updates, { updatedAt: new Date().toISOString() });
        this.notifySubscribers('posts');
        this.saveToStorage();
        return true;
    }

    /**
     * Elimina una publicación (solo el propietario)
     * @param {string} postId - ID del post
     * @returns {boolean} true si fue eliminado
     */
    deletePost(postId) {
        const index = this.posts.findIndex(p => p.id === postId);
        if (index === -1) return false;
        
        const post = this.posts[index];
        if (post.userId !== this.currentUser.id) return false; // Solo el autor puede eliminar
        
        this.posts.splice(index, 1);
        // Eliminar también comentarios asociados
        delete this.comments[postId];
        
        this.notifySubscribers('posts');
        this.saveToStorage();
        return true;
    }

    // ==================== COMENTARIOS ====================

    /**
     * Añade un comentario a una publicación
     * @param {string} postId - ID del post
     * @param {string} content - Contenido del comentario
     * @param {string|null} imageUrl - URL de imagen del comentario
     * @returns {Object} Comentario creado
     */
    addComment(postId, content, imageUrl = null) {
        if (!this.comments[postId]) {
            this.comments[postId] = [];
        }

        const comment = {
            id: generateId(),
            postId,
            userId: this.currentUser.id,
            content,
            imageUrl,
            createdAt: new Date().toISOString(),
            likes: 0
        };

        this.comments[postId].unshift(comment);
        this.notifySubscribers('comments');
        this.saveToStorage();
        return comment;
    }

    /**
     * Obtiene comentarios de una publicación
     * @param {string} postId - ID del post
     * @returns {Array} Comentarios
     */
    getComments(postId) {
        return (this.comments[postId] || []).map(c => ({ ...c }));
    }

    /**
     * Obtiene el conteo de comentarios de un post
     * @param {string} postId - ID del post
     * @returns {number}
     */
    getCommentCount(postId) {
        return (this.comments[postId] || []).length;
    }

    /**
     * Elimina un comentario (solo el propietario)
     * @param {string} postId - ID del post
     * @param {string} commentId - ID del comentario
     * @returns {boolean}
     */
    deleteComment(postId, commentId) {
        if (!this.comments[postId]) return false;
        
        const index = this.comments[postId].findIndex(c => c.id === commentId);
        if (index === -1) return false;

        const comment = this.comments[postId][index];
        if (comment.userId !== this.currentUser.id) return false; // Solo el autor

        this.comments[postId].splice(index, 1);
        this.notifySubscribers('comments');
        this.saveToStorage();
        return true;
    }

    // ==================== CHATS ====================

    /**
     * Obtiene o crea una conversación con un usuario
     * @param {string} userId - ID del otro usuario
     * @returns {string} Clave de conversación
     */
    getConversationKey(userId) {
        return `chat_${[this.currentUser.id, userId].sort().join('_')}`;
    }

    /**
     * Envía un mensaje
     * @param {string} userId - ID del destinatario
     * @param {string} content - Contenido del mensaje
     * @param {string|null} imageUrl - URL de imagen
     * @returns {Object} Mensaje creado
     */
    sendMessage(userId, content, imageUrl = null) {
        const key = this.getConversationKey(userId);
        
        if (!this.chats[key]) {
            this.chats[key] = [];
        }

        const message = {
            id: generateId(),
            fromUserId: this.currentUser.id,
            toUserId: userId,
            content,
            imageUrl,
            createdAt: new Date().toISOString(),
            read: false
        };

        this.chats[key].push(message);
        this.notifySubscribers('chats');
        this.saveToStorage();
        return message;
    }

    /**
     * Obtiene mensajes de una conversación
     * @param {string} userId - ID del otro usuario
     * @returns {Array} Mensajes
     */
    getMessages(userId) {
        const key = this.getConversationKey(userId);
        return (this.chats[key] || []).map(m => ({ ...m }));
    }

    // ==================== SISTEMA DE SUSCRIPTORES ====================

    /**
     * Se suscribe a cambios en una parte del estado
     * @param {string} dataType - Tipo de dato: 'posts', 'comments', 'currentUser', 'chats'
     * @param {Function} callback - Función a ejecutar cuando cambie
     * @returns {Function} Función para desuscribirse
     */
    subscribe(dataType, callback) {
        if (!this.subscribers[dataType]) {
            this.subscribers[dataType] = [];
        }
        this.subscribers[dataType].push(callback);

        // Retornar función para desuscribirse
        return () => {
            const index = this.subscribers[dataType].indexOf(callback);
            if (index > -1) {
                this.subscribers[dataType].splice(index, 1);
            }
        };
    }

    /**
     * Notifica a todos los suscriptores de un tipo de dato
     * @param {string} dataType - Tipo de dato que cambió
     */
    notifySubscribers(dataType) {
        if (this.subscribers[dataType]) {
            this.subscribers[dataType].forEach(callback => {
                try {
                    callback();
                } catch (e) {
                    console.error(`Error en suscriptor de ${dataType}:`, e);
                }
            });
        }
    }

    // ==================== RESETEO Y DEBUG ====================

    /**
     * Limpia todos los datos (para testing)
     */
    reset() {
        this.posts = [];
        this.comments = {};
        this.chats = {};
        this.currentUser.isLoggedIn = false;
        removeFromStorage('appState');
        removeFromStorage('userSession');
    }

    /**
     * Retorna el estado completo (para debugging)
     * @returns {Object}
     */
    getDebugState() {
        return {
            currentUser: this.currentUser,
            postsCount: this.posts.length,
            commentsCount: Object.keys(this.comments).length,
            chatsCount: Object.keys(this.chats).length,
            posts: this.posts,
            comments: this.comments,
            chats: this.chats
        };
    }
}

// Crear instancia única y exportarla
export const appState = new AppState();
