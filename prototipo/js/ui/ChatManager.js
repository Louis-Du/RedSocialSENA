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
import { messageManager } from './MessageManager.js';
import { uiComponents } from '../utils/UIComponents.js';

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
        const imageInput = document.getElementById('chatImageDesktop');

        sendBtn?.addEventListener('click', () => this.sendMessage('desktop'));
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage('desktop');
            }
        });

        // Agregar preview de imagen
        imageInput?.addEventListener('change', (e) => {
            this.handleImageSelected('desktop', e.target);
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
        const imageInput = document.getElementById('chatImageMobile');

        sendBtn?.addEventListener('click', () => this.sendMessage('mobile'));
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage('mobile');
            }
        });

        // Agregar preview de imagen
        imageInput?.addEventListener('change', (e) => {
            this.handleImageSelected('mobile', e.target);
        });
    }

    /**
     * Maneja la selección de imagen para preview
     * @param {string} source - 'desktop' o 'mobile'
     * @param {HTMLInputElement} fileInput - Input de archivo
     */
    handleImageSelected(source, fileInput) {
        if (!fileInput.files || fileInput.files.length === 0) return;

        const file = fileInput.files[0];
        
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            messageManager.error('Por favor selecciona un archivo de imagen válido');
            fileInput.value = '';
            return;
        }

        // Validar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            messageManager.error('La imagen debe ser menor a 5MB');
            fileInput.value = '';
            return;
        }

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            const containerId = source === 'mobile' ? 'mobileConversationView' : 'activeChatArea';
            const container = document.getElementById(containerId);
            
            if (!container) return;

            // Remover preview anterior si existe
            const oldPreview = document.getElementById(`chatImagePreview-${source}`);
            if (oldPreview) oldPreview.remove();

            // Crear nuevo preview
            const previewDiv = document.createElement('div');
            previewDiv.id = `chatImagePreview-${source}`;
            previewDiv.className = 'p-3 border-t border-gray-200 bg-gray-50';
            previewDiv.innerHTML = `
                <div class="relative inline-block">
                    <img src="${imageUrl}" class="max-h-32 rounded-lg border-2 border-sena-verde" alt="Preview" />
                    <button class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600" onclick="document.getElementById('${fileInput.id}').value=''; this.parentElement.parentElement.remove();">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            `;

            // Insertar antes del formulario de envío
            const form = container.querySelector('.bg-gray-100.p-4.border-t');
            if (form) {
                form.parentNode.insertBefore(previewDiv, form);
                if (window.loadLucideIcons) {
                    window.loadLucideIcons();
                }
            }
        };

        reader.readAsDataURL(file);
    }

    /**
     * Carga la lista de conversaciones
     */
    loadConversationsList() {
        try {
            const conversations = chatService.getAllConversations();
            const chatList = document.querySelector('.chat-list');

            if (!chatList) return;

            if (conversations.length === 0) {
                // Mostrar mensaje si no hay conversaciones
                // pero permitir comenzar una nueva
                chatList.innerHTML = `
                    <li class="p-6 text-center text-gray-500">
                        <p>No hay conversaciones activas.</p>
                        <p class="text-xs mt-2">Selecciona un usuario para iniciar</p>
                    </li>
                `;
            } else {
                chatList.innerHTML = '';
                conversations.forEach(conv => {
                    chatList.insertAdjacentHTML('beforeend', this.generateChatListItemHTML(conv));
                });
            }

            // Re-attach event listeners
            this.attachChatListListeners();
        } catch (error) {
            console.error('Error cargando lista de conversaciones:', error);
            messageManager.error('Error al cargar chats');
        }
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
        try {
            if (!userId) {
                messageManager.error('Usuario no válido');
                return;
            }

            this.currentChatUserId = userId;
            const user = userService.getUserById(userId);

            if (!user) {
                messageManager.error('No se encontró el usuario solicitado.');
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
        } catch (error) {
            console.error('Error abriendo chat:', error);
            messageManager.error('Error al abrir chat');
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
            if (messages.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-gray-500 py-8">
                        Aun no hay mensajes en esta conversacion.
                    </div>
                `;
            } else {
                container.innerHTML = messages.map(msg => this.generateMessageHTML(msg, userId)).join('');
            }
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

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    Aun no hay mensajes en esta conversacion.
                </div>
            `;
        } else {
            container.innerHTML = messages.map(msg => this.generateMessageHTML(msg, userId)).join('');
        }
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
                messageManager.error('Selecciona una conversación para continuar.');
                return;
            }

            const inputId = source === 'mobile' ? 'chatInputMobile' : 'chatInput';
            const imageInputId = source === 'mobile' ? 'chatImageMobile' : 'chatImageDesktop';
            
            const input = document.getElementById(inputId);
            const imageInput = document.getElementById(imageInputId);
            
            if (!input || !imageInput) {
                console.error('No se encontraron los inputs de chat');
                messageManager.error('Error: No se puede enviar el mensaje');
                return;
            }
            
            const content = input.value.trim();
            const imageFile = imageInput.files[0];

            // Validar que hay contenido (texto o imagen)
            if (!content && !imageFile) {
                messageManager.error('El mensaje no puede estar vacío.');
                return;
            }

            // Validar regla: primer mensaje solo texto
            const chatState = chatService.getConversationState(this.currentChatUserId);
            const isFirstMessage = chatState.messageCount === 0;
            
            if (isFirstMessage && imageFile) {
                messageManager.error('El primer mensaje solo puede contener texto.');
                return;
            }

            // Enviar mensaje
            const result = await chatService.sendMessage(this.currentChatUserId, content, imageFile);

            if (!result.success) {
                messageManager.error(result.error);
                return;
            }

            // Mostrar éxito
            messageManager.success('Mensaje enviado');

            // Limpiar inputs
            input.value = '';
            imageInput.value = '';
            
            // Limpiar preview de imagen si existe
            const preview = document.getElementById(`chatImagePreview-${source}`);
            if (preview) preview.remove();

            // Re-renderizar mensajes
            this.renderMessages(this.currentChatUserId);

            // En mobile también
            if (source === 'mobile' || window.innerWidth < 768) {
                this.showMobileConversation(this.currentChatUserId);
            }

        } catch (error) {
            console.error('Error enviando mensaje:', error);
            messageManager.error('Error: ' + error.message);
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
