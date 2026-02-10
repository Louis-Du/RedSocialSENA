/**
 * ChatManager - Gestor de chats desde la UI
 * 
 * Responsabilidades:
 * - Manejar envío de mensajes
 * - Renderizar conversaciones
 * - Validar reglas de negocio (primer mensaje solo texto)
 * - Navegar entre chats
 */

import { chatService } from '../services/ChatService.js';
import { userService } from '../services/UserService.js';
import { escapeHTML, formatTime } from '../utils.js';
import { modalManager } from './ModalManager.js';

class ChatManager {
    constructor() {
        this.currentChatUserId = null;
        this.setupChatHandlers();
        this.setupMobileChat();
    }

    /**
     * Configura handlers de chat desktop
     */
    setupChatHandlers() {
        const sendBtn = document.getElementById('sendChatBtn');
        const input = document.getElementById('chatInput');

        sendBtn?.addEventListener('click', () => this.sendMessage('desktop'));
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage('desktop');
            }
        });

        // Cargar conversaciones iniciales
        this.loadConversationsList();
    }

    /**
     * Configura handlers de chat mobile
     */
    setupMobileChat() {
        const sendBtn = document.getElementById('sendChatBtnMobile');
        const input = document.getElementById('chatInputMobile');

        sendBtn?.addEventListener('click', () => this.sendMessage('mobile'));
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage('mobile');
            }
        });
    }

    /**
     * Carga la lista de conversaciones
     */
    loadConversationsList() {
        const conversations = chatService.getAllConversations();
        const chatList = document.querySelector('.chat-list');

        if (!chatList) return;

        chatList.innerHTML = '';
        conversations.forEach(conv => {
            chatList.insertAdjacentHTML('beforeend', this.generateChatListItemHTML(conv));
        });

        // Re-attach event listeners
        this.attachChatListListeners();
    }

    /**
     * Genera HTML para un item en la lista de chats
     * @param {Object} conv - Conversación
     * @returns {string} HTML
     */
    generateChatListItemHTML(conv) {
        const user = conv.user || {};
        const lastMsg = conv.lastMessage;
        const preview = lastMsg ? escapeHTML(lastMsg.content.substring(0, 30)) : 'Sin mensajes';

        return `
            <li class="chat-list-item p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors" data-user-id="${user.id}">
                <div class="flex items-center gap-3">
                    <div class="bg-sena-verde rounded-full p-2">
                        <i data-lucide="user" class="w-6 h-6 text-white"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-900 truncate">${escapeHTML(user.apodo || user.nombre)}</p>
                        <p class="text-sm text-gray-600 truncate">${preview}</p>
                    </div>
                </div>
            </li>
        `;
    }

    /**
     * Adjunta listeners a items de chat
     */
    attachChatListListeners() {
        document.querySelectorAll('.chat-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.getAttribute('data-user-id');
                this.openChat(userId);
            });
        });
    }

    /**
     * Abre una conversación
     * @param {string} userId - ID del usuario
     */
    openChat(userId) {
        this.currentChatUserId = userId;
        const user = userService.getUserById(userId);

        if (!user) {
            modalManager.showError('Usuario no encontrado');
            return;
        }

        // Actualizar título de chat
        const title = document.querySelector('#activeChatArea h2');
        if (title) {
            title.textContent = user.apodo || user.nombre;
        }

        // Renderizar mensajes
        this.renderMessages(userId);

        // En mobile, mostrar conversación
        if (window.innerWidth < 768) {
            this.showMobileConversation(userId);
        }
    }

    /**
     * Muestra conversación en mobile
     * @param {string} userId - ID del usuario
     */
    showMobileConversation(userId) {
        const user = userService.getUserById(userId);
        const mobileConv = document.getElementById('mobileConversationView');
        const chatAside = document.getElementById('chatListAside');
        const title = document.getElementById('mobileConversationTitle');
        const container = document.getElementById('messagesContainerMobile');

        if (title && user) title.textContent = user.apodo || user.nombre;
        if (container) {
            const messages = chatService.getMessages(userId);
            container.innerHTML = messages.map(msg => this.generateMessageHTML(msg, userId)).join('');
            if (window.loadLucideIcons) loadLucideIcons();
        }

        mobileConv?.classList.remove('hidden');
        chatAside?.classList.add('hidden');
    }

    /**
     * Renderiza mensajes de una conversación
     * @param {string} userId - ID del usuario
     */
    renderMessages(userId) {
        const messages = chatService.getMessages(userId);
        const container = document.getElementById('messagesContainer');

        if (!container) return;

        container.innerHTML = messages.map(msg => this.generateMessageHTML(msg, userId)).join('');
        container.scrollTop = container.scrollHeight;
        if (window.loadLucideIcons) loadLucideIcons();
    }

    /**
     * Genera HTML de un mensaje
     * @param {Object} message - Mensaje
     * @param {string} userId - ID del otro usuario
     * @returns {string} HTML
     */
    generateMessageHTML(message, userId) {
        const currentUser = userService.getCurrentUser();
        const isOwn = message.fromUserId === currentUser.id;
        const alignment = isOwn ? 'justify-end' : 'justify-start';
        const bubbleClass = isOwn ? 'bubble-self' : 'bubble-other';
        const imageBlock = message.imageUrl
            ? `<img src="${escapeHTML(message.imageUrl)}" alt="Imagen" class="mt-2 rounded max-w-xs max-h-48 object-cover" />`
            : '';

        return `
            <div class="flex ${alignment}">
                <div class="${bubbleClass} p-3 max-w-xs md:max-w-md shadow-md">
                    <p class="text-sm">${escapeHTML(message.content)}</p>
                    ${imageBlock}
                    <p class="text-xs text-gray-700 text-right mt-1">${formatTime(message.createdAt)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Envía un mensaje
     * @param {string} source - 'desktop' o 'mobile'
     */
    async sendMessage(source) {
        try {
            if (!this.currentChatUserId) {
                modalManager.showError('Por favor selecciona una conversación');
                return;
            }

            const inputId = source === 'mobile' ? 'chatInputMobile' : 'chatInput';
            const input = document.getElementById(inputId);
            const content = input?.value.trim();

            if (!content) {
                modalManager.showError('El mensaje no puede estar vacío');
                return;
            }

            // Validar regla: primer mensaje solo texto
            const chatState = chatService.getChatState(this.currentChatUserId);
            if (chatState.isFirstMessage) {
                // Solo permitir texto en primer mensaje
                const result = await chatService.sendMessage(this.currentChatUserId, content, null);

                if (!result.success) {
                    modalManager.showError(result.error);
                    return;
                }
            } else {
                // Ya hay mensajes, se pueden enviar imágenes en el futuro
                const result = await chatService.sendMessage(this.currentChatUserId, content, null);

                if (!result.success) {
                    modalManager.showError(result.error);
                    return;
                }
            }

            // Limpiar input
            input.value = '';

            // Re-renderizar mensajes
            this.renderMessages(this.currentChatUserId);

            // En mobile también
            if (source === 'mobile' || window.innerWidth < 768) {
                this.showMobileConversation(this.currentChatUserId);
            }

        } catch (error) {
            modalManager.showError('Error: ' + error.message);
        }
    }

    /**
     * Vuelve a la lista de chats en mobile
     */
    backToChatList() {
        const mobileConv = document.getElementById('mobileConversationView');
        const chatAside = document.getElementById('chatListAside');

        mobileConv?.classList.add('hidden');
        chatAside?.classList.remove('hidden');
    }
}

export const chatManager = new ChatManager();
