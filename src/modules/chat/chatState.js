class ChatState {
    constructor() {
        this.chats = [];
        this.messagesByChatId = {};
        this.typingByChatId = {};
        this.chatSubscribers = new Set();
        this.messageSubscribers = new Map();
        this.typingSubscribers = new Map();
    }

    _cloneChat(chat) {
        return chat ? { ...chat } : null;
    }

    _cloneMessage(message) {
        return message ? { ...message, readBy: Array.isArray(message.readBy) ? [...message.readBy] : [] } : null;
    }

    _cloneChats(chats) {
        return Array.isArray(chats) ? chats.map(chat => this._cloneChat(chat)) : [];
    }

    _cloneMessages(messages) {
        return Array.isArray(messages) ? messages.map(message => this._cloneMessage(message)) : [];
    }

    getChats() {
        return this._cloneChats(this.chats);
    }

    getChatById(chatId) {
        const normalizedChatId = String(chatId || '').trim();
        if (!normalizedChatId) return null;

        const chat = this.chats.find(candidate => String(candidate.id || '').trim() === normalizedChatId);
        return this._cloneChat(chat);
    }

    getMessages(chatId) {
        const normalizedChatId = String(chatId || '').trim();
        if (!normalizedChatId) return [];

        return this._cloneMessages(this.messagesByChatId[normalizedChatId] || []);
    }

    getTypingUsers(chatId) {
        const normalizedChatId = String(chatId || '').trim();
        if (!normalizedChatId) return [];

        return Array.isArray(this.typingByChatId[normalizedChatId]) ? [...this.typingByChatId[normalizedChatId]] : [];
    }

    setChats(chats) {
        this.chats = this._cloneChats(chats);
        this.notifyChats();
    }

    upsertChat(chat) {
        if (!chat?.id) return null;

        const nextChat = this._cloneChat(chat);
        const index = this.chats.findIndex(candidate => candidate.id === nextChat.id);
        if (index === -1) {
            this.chats.unshift(nextChat);
        } else {
            this.chats[index] = nextChat;
        }

        this.notifyChats();
        return this._cloneChat(nextChat);
    }

    setMessages(chatId, messages) {
        const normalizedChatId = String(chatId || '').trim();
        if (!normalizedChatId) return;

        this.messagesByChatId[normalizedChatId] = this._cloneMessages(messages);
        this.notifyMessages(normalizedChatId);
    }

    setTypingUsers(chatId, userIds) {
        const normalizedChatId = String(chatId || '').trim();
        if (!normalizedChatId) return;

        this.typingByChatId[normalizedChatId] = Array.isArray(userIds)
            ? [...new Set(userIds.map(id => String(id || '').trim()).filter(Boolean))]
            : [];
        this.notifyTyping(normalizedChatId);
    }

    subscribeChats(listener) {
        if (typeof listener !== 'function') return () => {};

        this.chatSubscribers.add(listener);
        listener(this.getChats());
        return () => {
            this.chatSubscribers.delete(listener);
        };
    }

    subscribeMessages(chatId, listener) {
        const normalizedChatId = String(chatId || '').trim();
        if (!normalizedChatId || typeof listener !== 'function') return () => {};

        if (!this.messageSubscribers.has(normalizedChatId)) {
            this.messageSubscribers.set(normalizedChatId, new Set());
        }

        const listeners = this.messageSubscribers.get(normalizedChatId);
        listeners.add(listener);
        listener(this.getMessages(normalizedChatId));

        return () => {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.messageSubscribers.delete(normalizedChatId);
            }
        };
    }

    subscribeTyping(chatId, listener) {
        const normalizedChatId = String(chatId || '').trim();
        if (!normalizedChatId || typeof listener !== 'function') return () => {};

        if (!this.typingSubscribers.has(normalizedChatId)) {
            this.typingSubscribers.set(normalizedChatId, new Set());
        }

        const listeners = this.typingSubscribers.get(normalizedChatId);
        listeners.add(listener);
        listener(this.getTypingUsers(normalizedChatId));

        return () => {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.typingSubscribers.delete(normalizedChatId);
            }
        };
    }

    notifyChats() {
        const snapshot = this.getChats();
        this.chatSubscribers.forEach(listener => {
            try {
                listener(snapshot);
            } catch (error) {
                console.error('[chatState] chats subscriber error', error);
            }
        });
    }

    notifyMessages(chatId) {
        const listeners = this.messageSubscribers.get(chatId);
        if (!listeners) return;

        const snapshot = this.getMessages(chatId);
        listeners.forEach(listener => {
            try {
                listener(snapshot);
            } catch (error) {
                console.error('[chatState] messages subscriber error', error);
            }
        });
    }

    notifyTyping(chatId) {
        const listeners = this.typingSubscribers.get(chatId);
        if (!listeners) return;

        const snapshot = this.getTypingUsers(chatId);
        listeners.forEach(listener => {
            try {
                listener(snapshot);
            } catch (error) {
                console.error('[chatState] typing subscriber error', error);
            }
        });
    }
}

export const chatState = new ChatState();