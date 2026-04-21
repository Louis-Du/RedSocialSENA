import { userService } from '../UserService.js';
import { chatState } from './chatState.js';
import { generateId, getFromStorage, readFileAsDataURL, saveToStorage } from '../../utils/utils.js';

const STORAGE_KEY = 'redSocialSena.chats.v1';

class ChatLocal {
    constructor() {
        this.initialized = false;
        this.persistenceUnsubscribe = null;
    }

    _getCurrentUser() {
        const currentUser = userService.getCurrentUser();
        return currentUser?.isLoggedIn && currentUser?.uid ? { uid: currentUser.uid } : null;
    }

    _getPrivateChatId(userId1, userId2) {
        return [String(userId1 || '').trim(), String(userId2 || '').trim()].sort().join('_');
    }

    _normalizeChat(chat) {
        if (!chat?.id) return null;

        return {
            id: chat.id,
            type: chat.type || 'private',
            participants: Array.isArray(chat.participants) ? [...new Set(chat.participants.map(id => String(id || '').trim()).filter(Boolean))] : [],
            createdBy: chat.createdBy || null,
            name: chat.name || null,
            photoURL: chat.photoURL || null,
            lastMessage: chat.lastMessage ? { ...chat.lastMessage } : null,
            createdAt: chat.createdAt || new Date().toISOString(),
            updatedAt: chat.updatedAt || new Date().toISOString(),
            messages: Array.isArray(chat.messages) ? chat.messages : [],
            typingUserIds: Array.isArray(chat.typingUserIds) ? chat.typingUserIds : []
        };
    }

    _normalizeMessage(message) {
        if (!message?.id) return null;

        return {
            id: message.id,
            fromUserId: message.fromUserId,
            content: String(message.content || ''),
            imageUrl: message.imageUrl || null,
            readBy: Array.isArray(message.readBy) ? [...new Set(message.readBy)] : [],
            createdAt: message.createdAt || new Date().toISOString()
        };
    }

    _loadStored() {
        const stored = getFromStorage(STORAGE_KEY, null);
        if (!stored || typeof stored !== 'object') {
            return { chats: [] };
        }

        return {
            chats: Array.isArray(stored.chats) ? stored.chats : []
        };
    }

    _persistSnapshot(snapshot) {
        saveToStorage(STORAGE_KEY, snapshot);
    }

    _touchChat(chatId, updates) {
        const currentChat = chatState.getChatById(chatId);
        if (!currentChat) return null;

        const nextChat = {
            ...currentChat,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        chatState.upsertChat(nextChat);
        return nextChat;
    }

    _getChatSnapshot() {
        return {
            chats: chatState.getChats().map(chat => ({
                ...chat,
                messages: chatState.getMessages(chat.id),
                typingUserIds: chatState.getTypingUsers(chat.id)
            }))
        };
    }

    async initialize() {
        if (!this.initialized) {
            const stored = this._loadStored();
            const chats = stored.chats.map(chat => this._normalizeChat(chat)).filter(Boolean);
            chatState.setChats(chats);

            chats.forEach(chat => {
                chatState.setMessages(chat.id, Array.isArray(chat.messages) ? chat.messages.map(message => this._normalizeMessage(message)).filter(Boolean) : []);
                chatState.setTypingUsers(chat.id, Array.isArray(chat.typingUserIds) ? chat.typingUserIds : []);
            });

            if (this.persistenceUnsubscribe) {
                this.persistenceUnsubscribe();
            }

            this.persistenceUnsubscribe = chatState.subscribeChats(() => {
                this._persistSnapshot(this._getChatSnapshot());
            });

            this.initialized = true;
        }

        return chatState.getChats();
    }

    async createPrivateChat(otherUserId) {
        await this.initialize();

        const currentUser = this._getCurrentUser();
        if (!currentUser) throw new Error('Usuario no autenticado');

        const normalizedOtherUserId = String(otherUserId || '').trim();
        if (!normalizedOtherUserId) throw new Error('ID del usuario inválido');
        if (normalizedOtherUserId === currentUser.uid) throw new Error('No puedes chatear contigo mismo');

        const chatId = this._getPrivateChatId(currentUser.uid, normalizedOtherUserId);
        const existingChat = chatState.getChatById(chatId);
        if (existingChat) return chatId;

        chatState.upsertChat({
            id: chatId,
            type: 'private',
            participants: [currentUser.uid, normalizedOtherUserId],
            createdBy: currentUser.uid,
            name: null,
            photoURL: null,
            lastMessage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        chatState.setMessages(chatId, []);
        chatState.setTypingUsers(chatId, []);
        return chatId;
    }

    async createGroupChat(groupName, participantsIds = [], photoURL = null) {
        await this.initialize();

        const currentUser = this._getCurrentUser();
        if (!currentUser) throw new Error('Usuario no autenticado');
        if (!groupName || groupName.trim().length === 0) throw new Error('Nombre del grupo requerido');
        if (!Array.isArray(participantsIds)) throw new Error('Participantes debe ser un array');

        const chatId = generateId();
        const participants = [currentUser.uid, ...participantsIds.map(id => String(id || '').trim()).filter(Boolean)];

        chatState.upsertChat({
            id: chatId,
            type: 'group',
            participants: [...new Set(participants)],
            createdBy: currentUser.uid,
            name: groupName.trim(),
            photoURL: photoURL || null,
            lastMessage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        chatState.setMessages(chatId, []);
        chatState.setTypingUsers(chatId, []);
        return chatId;
    }

    async sendMessage(chatId, content = '', imageFile = null) {
        await this.initialize();

        const currentUser = this._getCurrentUser();
        if (!currentUser) throw new Error('Usuario no autenticado');

        const normalizedChatId = String(chatId || '').trim();
        if (!normalizedChatId) throw new Error('Chat ID requerido');

        const hasText = String(content || '').trim().length > 0;
        const hasImage = Boolean(imageFile);

        if (!hasText && !hasImage) {
            throw new Error('El mensaje debe contener texto o imagen');
        }

        const chat = chatState.getChatById(normalizedChatId);
        if (!chat) throw new Error('Chat no encontrado');
        if (!chat.participants.includes(currentUser.uid)) {
            throw new Error('No tienes permisos para enviar mensajes en este chat');
        }

        let imageUrl = null;
        if (hasImage) {
            imageUrl = await readFileAsDataURL(imageFile);
        }

        const messageId = generateId();
        const message = this._normalizeMessage({
            id: messageId,
            fromUserId: currentUser.uid,
            content: hasText ? String(content).trim() : '',
            imageUrl,
            readBy: [currentUser.uid],
            createdAt: new Date().toISOString()
        });

        const nextMessages = [...chatState.getMessages(normalizedChatId), message];
        chatState.setMessages(normalizedChatId, nextMessages);
        this._touchChat(normalizedChatId, {
            lastMessage: {
                content: hasText ? String(content).trim() : '[Imagen]',
                fromUserId: currentUser.uid,
                timestamp: new Date().toISOString(),
                hasImage
            }
        });

        return {
            success: true,
            messageId,
            hasImage
        };
    }

    listenToMessages(chatId, callback) {
        return chatState.subscribeMessages(chatId, messages => callback(null, messages));
    }

    listenToUserChats(callback) {
        const currentUser = this._getCurrentUser();
        if (!currentUser) {
            callback(null, []);
            return () => {};
        }

        return chatState.subscribeChats((chats) => {
            const visibleChats = chats
                .filter(chat => Array.isArray(chat.participants) && chat.participants.includes(currentUser.uid))
                .sort((left, right) => String(right.updatedAt || '').localeCompare(String(left.updatedAt || '')));
            callback(null, visibleChats);
        });
    }

    async markMessageAsRead(chatId, messageId) {
        await this.initialize();

        const currentUser = this._getCurrentUser();
        if (!currentUser) throw new Error('Usuario no autenticado');

        const normalizedChatId = String(chatId || '').trim();
        const normalizedMessageId = String(messageId || '').trim();
        const messages = chatState.getMessages(normalizedChatId);
        const nextMessages = messages.map(message => {
            if (message.id !== normalizedMessageId) return message;

            const readBy = Array.isArray(message.readBy) ? [...message.readBy] : [];
            if (!readBy.includes(currentUser.uid)) {
                readBy.push(currentUser.uid);
            }

            return { ...message, readBy };
        });

        chatState.setMessages(normalizedChatId, nextMessages);
    }

    async setTyping(chatId, isTyping) {
        await this.initialize();

        const currentUser = this._getCurrentUser();
        if (!currentUser) throw new Error('Usuario no autenticado');

        const normalizedChatId = String(chatId || '').trim();
        const currentTypingUsers = chatState.getTypingUsers(normalizedChatId);
        const nextTypingUsers = isTyping
            ? Array.from(new Set([...currentTypingUsers, currentUser.uid]))
            : currentTypingUsers.filter(userId => userId !== currentUser.uid);

        chatState.setTypingUsers(normalizedChatId, nextTypingUsers);
    }

    listenToTyping(chatId, callback) {
        return chatState.subscribeTyping(chatId, typingUserIds => callback(null, typingUserIds));
    }

    async addGroupParticipants(chatId, userIds) {
        await this.initialize();

        const currentUser = this._getCurrentUser();
        if (!currentUser) throw new Error('Usuario no autenticado');

        const chat = chatState.getChatById(chatId);
        if (!chat) throw new Error('Chat no encontrado');
        if (chat.type !== 'group') throw new Error('Solo se puede agregar participantes a chats grupales');
        if (chat.createdBy !== currentUser.uid) throw new Error('Solo el creador puede agregar participantes');

        const nextParticipants = Array.from(new Set([
            ...chat.participants,
            ...userIds.map(id => String(id || '').trim()).filter(Boolean)
        ]));

        this._touchChat(chatId, { participants: nextParticipants });
    }

    async removeGroupParticipant(chatId, userId) {
        await this.initialize();

        const currentUser = this._getCurrentUser();
        if (!currentUser) throw new Error('Usuario no autenticado');

        const chat = chatState.getChatById(chatId);
        if (!chat) throw new Error('Chat no encontrado');
        if (chat.type !== 'group') throw new Error('Solo es válido para chats grupales');
        if (chat.createdBy !== currentUser.uid && String(userId || '').trim() !== currentUser.uid) {
            throw new Error('No tienes permisos para remover participantes');
        }

        const normalizedUserId = String(userId || '').trim();
        const nextParticipants = chat.participants.filter(participantId => participantId !== normalizedUserId);
        this._touchChat(chatId, { participants: nextParticipants });
    }

    async getChat(chatId) {
        await this.initialize();

        const currentUser = this._getCurrentUser();
        if (!currentUser) return null;

        const chat = chatState.getChatById(chatId);
        if (!chat) return null;
        if (!Array.isArray(chat.participants) || !chat.participants.includes(currentUser.uid)) {
            return null;
        }

        return chat;
    }

    cleanup() {
        if (this.persistenceUnsubscribe) {
            this.persistenceUnsubscribe();
            this.persistenceUnsubscribe = null;
        }
    }
}

export const chatLocal = new ChatLocal();