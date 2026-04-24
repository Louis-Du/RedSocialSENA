/**
 * ChatManager - Gestor de UI de chats con Firebase
 * 
 * Responsabilidades:
 * - Gestionar listeners de tiempo real para chats y mensajes
 * - Renderizar lista de chats y conversaciones
 * - Manejar envío de mensajes (texto e imágenes)
 * - Mostrar indicadores de escritura (typing)
 * - Navegación entre chats
 * - Limpiar listeners al cambiar de chat o desmontar
 * 
 * Arquitectura:
 * - chatService maneja la lógica (Firebase)
 * - chatManager maneja la UI y listeners
 * - messageManager maneja feedback visual
 */

import { chatService } from './chatService.js';
import { userService } from '../auth/userService.js';
import { escapeHTML, formatTime } from '../../utils/utils.js';
import { messageManager } from '../common/MessageManager.js';

class ChatManager {
    constructor() {
        this.currentChatId = null;
        this.currentChatData = null;
        this.messagesUnsubscribe = null;
        this.typingUnsubscribe = null;
        this.chatsUnsubscribe = null;
        this.typingTimeout = null;
        this.isTyping = false;
        
        this.setupEventHandlers();
        this.initializeChatsListener();
    }

    /**
     * Configura handlers del DOM
     */
    setupEventHandlers() {
        // Desktop send
        const sendBtn = document.getElementById('sendChatBtn');
        const input = document.getElementById('chatInput');
        const imageInput = document.getElementById('chatImageDesktop');

        sendBtn?.addEventListener('click', () => this.sendMessage('desktop'));
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage('desktop');
            }
            this.handleTypingIndicator();
        });
        input?.addEventListener('input', () => this.handleTypingIndicator());

        imageInput?.addEventListener('change', (e) => {
            this.handleImageSelected('desktop', e.target);
        });

        // Mobile send
        const sendBtnMobile = document.getElementById('sendChatBtnMobile');
        const inputMobile = document.getElementById('chatInputMobile');
        const imageInputMobile = document.getElementById('chatImageMobile');

        sendBtnMobile?.addEventListener('click', () => this.sendMessage('mobile'));
        inputMobile?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage('mobile');
            }
            this.handleTypingIndicator();
        });
        inputMobile?.addEventListener('input', () => this.handleTypingIndicator());

        imageInputMobile?.addEventListener('change', (e) => {
            this.handleImageSelected('mobile', e.target);
        });

        // Back button en mobile
        document.getElementById('backToChatList')?.addEventListener('click', () => {
            this.backToChatList();
        });
    }

    /**
     * Inicializa listener para lista de chats del usuario actual
     */
    initializeChatsListener() {
        this.chatsUnsubscribe = chatService.listenToUserChats((error, chats) => {
            if (error) {
                messageManager.error('Error al cargar chats: ' + error.message);
                return;
            }
            this.renderChatsList(chats);
        });
    }

    /**
     * Renderiza la lista de chats
     * @param {Array} chats - Array de chats
     */
    renderChatsList(chats) {
        const chatList = document.querySelector('.chat-list');
        if (!chatList) return;

        if (chats.length === 0) {
            chatList.innerHTML = `
                <li class="p-6 text-center text-gray-500">
                    <p>No hay conversaciones activas</p>
                    <p class="text-xs mt-2">Inicia un nuevo chat</p>
                </li>
            `;
            return;
        }

        chatList.innerHTML = chats.map(chat => this.generateChatListItemHTML(chat)).join('');
        this.attachChatListListeners();
    }

    /**
     * Normaliza distintos formatos de timestamp a Date.
     * Acepta Firestore Timestamp, Date, string ISO y números.
     */
    _toDate(value) {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value.toDate === 'function') return value.toDate();

        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    /**
     * Genera HTML para un item en lista de chats
     * @param {Object} chat - Documento de chat
     * @returns {string}
     */
    generateChatListItemHTML(chat) {
        const isGroup = chat.type === 'group';
        const title = isGroup ? chat.name : this._getChatOtherUserName(chat);
        const preview = chat.lastMessage 
            ? escapeHTML(chat.lastMessage.content.substring(0, 40))
            : 'Sin mensajes';
        const timestampDate = this._toDate(chat.updatedAt);
        const timestamp = timestampDate
            ? timestampDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            : '';

        return `
            <li class="chat-list-item p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors" data-chat-id="${chat.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="bg-sena-verde rounded-full p-2 flex-shrink-0">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                ${isGroup ? '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>' : '<circle cx="8" cy="9" r="4"/><circle cx="16" cy="9" r="4"/><path d="M8 15h8v4H8z"/>'}
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-gray-900 truncate">${escapeHTML(title)}</p>
                            <p class="text-sm text-gray-600 truncate">${preview}</p>
                        </div>
                    </div>
                    <span class="text-xs text-gray-400 ml-2 flex-shrink-0">${timestamp}</span>
                </div>
            </li>
        `;
    }

    /**
     * Obtiene el nombre del otro usuario en un chat privado
     * @param {Object} chat - Documento de chat
     * @returns {string}
     */
    _getChatOtherUserName(chat) {
        const currentUser = userService.getCurrentUser();
        if (!currentUser) return 'Chat';

        const otherUserId = chat.participants.find(id => id !== currentUser.uid);
        const otherUser = userService.getUserById(otherUserId);
        return otherUser ? (otherUser.apodo || otherUser.nombre) : 'Usuario desconocido';
    }

    /**
     * Adjunta listeners a items de chat
     */
    attachChatListListeners() {
        document.querySelectorAll('.chat-list-item').forEach(item => {
            item.addEventListener('click', async () => {
                const chatId = item.getAttribute('data-chat-id');
                await this.openChat(chatId);
            });
        });
    }

    /**
     * Abre una conversación
     * @param {string} chatId - ID del chat
     */
    async openChat(chatId) {
        try {
            if (!chatId) {
                messageManager.error('Chat no válido');
                return;
            }

            // Limpiar listeners anteriores
            this.cleanupChatListeners();

            this.currentChatId = chatId;

            // Obtener datos del chat
            const chat = await chatService.getChat(chatId);
            if (!chat) {
                messageManager.error('No tienes acceso a este chat');
                this.currentChatId = null;
                return;
            }

            this.currentChatData = chat;

            // Actualizar títulos
            const title = chat.type === 'group' ? chat.name : this._getChatOtherUserName(chat);
            const header = document.querySelector('#activeChatArea h2');
            if (header) header.textContent = title;

            // Iniciar listeners reales
            this.messagesUnsubscribe = chatService.listenToMessages(chatId, (error, messages) => {
                if (error) {
                    messageManager.error('Error cargando mensajes');
                    return;
                }
                this.renderMessages(messages, chatId);
            });

            this.typingUnsubscribe = chatService.listenToTyping(chatId, (error, typingUserIds) => {
                if (error) return;
                this.displayTypingIndicator(typingUserIds);
            });

            // En mobile, mostrar conversación
            if (window.innerWidth < 768) {
                this.showMobileConversation(chat);
            }

        } catch (error) {
            messageManager.error('Error al abrir chat: ' + error.message);
        }
    }

    /**
     * Renderiza mensajes de la conversación actual
     * @param {Array} messages - Array de mensajes
     * @param {string} chatId - ID del chat
     */
    renderMessages(messages, chatId) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        const currentUser = userService.getCurrentUser();

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    No hay mensajes en esta conversación
                </div>
            `;
        } else {
            container.innerHTML = messages
                .map(msg => this.generateMessageHTML(msg, currentUser))
                .join('');

            // Marcar mensajes como leídos
            messages.forEach(msg => {
                if (msg.fromUserId !== currentUser.uid && !msg.readBy.includes(currentUser.uid)) {
                    chatService.markMessageAsRead(chatId, msg.id).catch(err => 
                        console.error('Error marcando como leído:', err)
                    );
                }
            });
        }

        // Scroll al final
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 0);
    }

    /**
     * Genera HTML de un mensaje
     * @param {Object} msg - Mensaje
     * @param {Object} currentUser - Usuario actual
     * @returns {string}
     */
    generateMessageHTML(msg, currentUser) {
        const isOwn = msg.fromUserId === currentUser.uid;
        const alignment = isOwn ? 'justify-end' : 'justify-start';
        const bubbleClass = isOwn 
            ? 'bg-sena-verde text-white rounded-tl-lg rounded-bl-lg' 
            : 'bg-gray-100 text-gray-900 rounded-tr-lg rounded-br-lg';
        
        const imageBlock = msg.imageUrl
            ? `<img src="${escapeHTML(msg.imageUrl)}" alt="Imagen" class="mt-2 rounded max-w-xs max-h-48 object-cover" />`
            : '';

        const readStatus = isOwn && msg.readBy && msg.readBy.length > 1
            ? '<svg class="w-4 h-4 text-blue-300 ml-1 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
            : '';

        const timestampDate = this._toDate(msg.createdAt);
        const timestamp = timestampDate
            ? timestampDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            : '';

        return `
            <div class="flex ${alignment} mb-3">
                <div class="${bubbleClass} p-3 max-w-xs md:max-w-md shadow-sm rounded-3xl break-words">
                    <p class="text-sm">${escapeHTML(msg.content)}</p>
                    ${imageBlock}
                    <div class="flex items-center justify-end gap-1 mt-1">
                        <span class="text-xs opacity-70">${timestamp}</span>
                        ${readStatus}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Muestra indicador de escritura
     * @param {Array} typingUserIds - IDs de usuarios escribiendo
     */
    displayTypingIndicator(typingUserIds) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        // Remover indicador anterior
        const oldIndicator = document.getElementById('typingIndicator');
        if (oldIndicator) oldIndicator.remove();

        // Si no hay nadie escribiendo, salir
        if (!typingUserIds || typingUserIds.length === 0) return;

        const currentUser = userService.getCurrentUser();
        const otherTyping = typingUserIds.filter(id => id !== currentUser.uid);
        
        if (otherTyping.length === 0) return;

        // Crear indicador
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'flex gap-1 mb-2 px-3';
        indicator.innerHTML = `
            <div class="bg-gray-300 rounded-full w-2 h-2 animate-bounce"></div>
            <div class="bg-gray-300 rounded-full w-2 h-2 animate-bounce" style="animation-delay: 0.1s;"></div>
            <div class="bg-gray-300 rounded-full w-2 h-2 animate-bounce" style="animation-delay: 0.2s;"></div>
            <span class="text-xs text-gray-500 ml-1">está escribiendo...</span>
        `;

        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Maneja indicador de escritura (envía evento cada 2 segundos)
     */
    handleTypingIndicator() {
        if (!this.currentChatId) return;

        if (!this.isTyping) {
            this.isTyping = true;
            chatService.setTyping(this.currentChatId, true);
        }

        // Resettear timeout
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            chatService.setTyping(this.currentChatId, false);
        }, 3000); // Detener después de 3 segundos sin escribir
    }

    /**
     * Maneja selección de imagen
     * @param {string} source - 'desktop' o 'mobile'
     * @param {HTMLInputElement} fileInput - Input de archivo
     */
    handleImageSelected(source, fileInput) {
        if (!fileInput.files || fileInput.files.length === 0) return;

        const file = fileInput.files[0];

        if (!file.type.startsWith('image/')) {
            messageManager.error('Por favor selecciona una imagen');
            fileInput.value = '';
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            messageManager.error('La imagen debe ser menor a 5MB');
            fileInput.value = '';
            return;
        }

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewId = `chatImagePreview-${source}`;
            const oldPreview = document.getElementById(previewId);
            if (oldPreview) oldPreview.remove();

            const previewDiv = document.createElement('div');
            previewDiv.id = previewId;
            previewDiv.className = 'p-3 bg-gray-50 border-b';
            previewDiv.innerHTML = `
                <div class="relative inline-block">
                    <img src="${e.target.result}" class="max-h-32 rounded-lg border-2 border-sena-verde" alt="Preview" />
                    <button type="button" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600">
                        ✕
                    </button>
                </div>
            `;

            previewDiv.querySelector('button').addEventListener('click', () => {
                fileInput.value = '';
                previewDiv.remove();
            });

            const form = document.querySelector('.border-t.bg-gray-100');
            if (form) {
                form.parentNode.insertBefore(previewDiv, form);
            }
        };

        reader.readAsDataURL(file);
    }

    /**
     * Envía un mensaje
     * @param {string} source - 'desktop' o 'mobile'
     */
    async sendMessage(source) {
        try {
            if (!this.currentChatId) {
                messageManager.error('Selecciona un chat para continuar');
                return;
            }

            const inputId = source === 'mobile' ? 'chatInputMobile' : 'chatInput';
            const imageInputId = source === 'mobile' ? 'chatImageMobile' : 'chatImageDesktop';

            const input = document.getElementById(inputId);
            const imageInput = document.getElementById(imageInputId);

            if (!input || !imageInput) {
                messageManager.error('Error en el formulario');
                return;
            }

            const content = input.value.trim();
            const imageFile = imageInput.files[0];

            if (!content && !imageFile) {
                messageManager.warning('El mensaje no puede estar vacío');
                return;
            }

            // Detener indicador de escritura
            this.isTyping = false;
            clearTimeout(this.typingTimeout);
            await chatService.setTyping(this.currentChatId, false);

            // Enviar mensaje
            const result = await chatService.sendMessage(this.currentChatId, content, imageFile);

            if (!result.success) {
                messageManager.error(result.error || 'Error al enviar mensaje');
                return;
            }

            messageManager.success('Mensaje enviado');

            // Limpiar inputs
            input.value = '';
            imageInput.value = '';

            const preview = document.getElementById(`chatImagePreview-${source}`);
            if (preview) preview.remove();

        } catch (error) {
            messageManager.error('Error: ' + error.message);
        }
    }

    /**
     * Muestra conversación en mobile
     * @param {Object} chat - Documento de chat
     */
    showMobileConversation(chat) {
        const mobileConv = document.getElementById('mobileConversationView');
        const chatAside = document.getElementById('chatListAside');
        const title = document.getElementById('mobileConversationTitle');

        if (title) {
            title.textContent = chat.type === 'group' ? chat.name : this._getChatOtherUserName(chat);
        }

        mobileConv?.classList.remove('hidden');
        chatAside?.classList.add('hidden');
    }

    /**
     * Vuelve a lista de chats en mobile
     */
    backToChatList() {
        const mobileConv = document.getElementById('mobileConversationView');
        const chatAside = document.getElementById('chatListAside');

        mobileConv?.classList.add('hidden');
        chatAside?.classList.remove('hidden');
    }

    /**
     * Limpia listeners del chat actual
     */
    cleanupChatListeners() {
        if (this.messagesUnsubscribe) {
            this.messagesUnsubscribe();
            this.messagesUnsubscribe = null;
        }
        if (this.typingUnsubscribe) {
            this.typingUnsubscribe();
            this.typingUnsubscribe = null;
        }
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
        this.isTyping = false;
    }

    /**
     * Limpia todos los listeners (llamar al desmontar)
     */
    destroy() {
        this.cleanupChatListeners();
        if (this.chatsUnsubscribe) {
            this.chatsUnsubscribe();
            this.chatsUnsubscribe = null;
        }
        this.currentChatId = null;
        this.currentChatData = null;
    }
}

export const chatManager = new ChatManager();
