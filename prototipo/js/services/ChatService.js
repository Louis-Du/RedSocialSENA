/**
 * ChatService - Gestor centralizado de mensajes y conversaciones
 * 
 * Responsabilidades:
 * - Envío de mensajes
 * - Obtención de conversaciones
 * - Validaciones de negocio (ej: primer mensaje solo texto)
 */

import { appState } from '../AppState.js';
import { isValidText, isValidImageFile, readFileAsDataURL } from '../utils.js';
import { userService } from './UserService.js';

class ChatService {
    /**
     * Envía un mensaje
     * @param {string} toUserId - ID del destinatario
     * @param {string} content - Contenido del mensaje
     * @param {File|null} imageFile - Archivo de imagen (opcional, validar según reglas)
     * @returns {Promise<Object>}
     */
    async sendMessage(toUserId, content, imageFile = null) {
        try {
            // Validación básica
            if (!toUserId) throw new Error('Destinatario inválido');
            if (!isValidText(content) && !imageFile) {
                throw new Error('El mensaje no puede estar vacío');
            }

            // REGLA DE NEGOCIO: El primer mensaje solo puede ser texto
            const existingMessages = appState.getMessages(toUserId);
            if (existingMessages.length === 0 && imageFile) {
                throw new Error('El primer mensaje solo puede contener texto');
            }

            // Validar imagen si la hay
            let imageUrl = null;
            if (imageFile) {
                if (!isValidImageFile(imageFile)) {
                    throw new Error('Imagen inválida o demasiado grande');
                }
                imageUrl = await readFileAsDataURL(imageFile);
            }

            // En el futuro: await fetch(`/api/chats/send`, { method: 'POST', body: JSON.stringify({ toUserId, content, imageUrl }) });
            const message = appState.sendMessage(toUserId, content, imageUrl);

            return {
                success: true,
                message,
                messageText: 'Mensaje enviado'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: null
            };
        }
    }

    /**
     * Obtiene mensajes de una conversación
     * @param {string} userId - ID del otro usuario
     * @returns {Array}
     */
    getMessages(userId) {
        const messages = appState.getMessages(userId);
        const currentUser = userService.getCurrentUser();

        // Enriquecer mensajes con info de los usuarios
        return messages.map(msg => ({
            ...msg,
            sender: msg.fromUserId === currentUser.id ? currentUser : userService.getUserById(msg.fromUserId)
        }));
    }

    /**
     * Obtiene el estado de una conversación
     * @param {string} userId - ID del otro usuario
     * @returns {Object}
     */
    getConversationState(userId) {
        const messages = this.getMessages(userId);
        const otherUser = userService.getUserById(userId);

        return {
            otherUser,
            messageCount: messages.length,
            lastMessage: messages.length > 0 ? messages[messages.length - 1] : null,
            messages
        };
    }

    /**
     * Obtiene todas las conversaciones activas
     * @returns {Array}
     */
    getAllConversations() {
        // En el futuro: await fetch('/api/chats');
        
        // Por ahora, retorna los usuarios simulados con info de conversación
        return userService.users.map(user => {
            const conversation = this.getConversationState(user.id);
            return {
                user,
                ...conversation
            };
        });
    }

    /**
     * Verifica si se puede enviar un mensaje con imagen
     * @param {string} userId - ID del destinatario
     * @returns {boolean}
     */
    canSendImageMessage(userId) {
        const messages = appState.getMessages(userId);
        // Solo si ya hay mensajes en la conversación
        return messages.length > 0;
    }

    /**
     * Obtiene el estado del chat (primer mensaje, conversación existente, etc.)
     * @param {string} userId - ID del otro usuario
     * @returns {Object}
     */
    getChatState(userId) {
        const messages = appState.getMessages(userId);
        
        return {
            isFirstMessage: messages.length === 0,
            canSendImages: messages.length > 0,
            messageCount: messages.length,
            hasMessages: messages.length > 0
        };
    }
}

export const chatService = new ChatService();
