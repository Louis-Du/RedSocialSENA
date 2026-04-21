import { chatState } from './chatState.js';

class ChatFirebase {
    isAvailable() {
        return false;
    }

    async initialize() {
        return chatState.getChats();
    }

    async createPrivateChat() {
        throw new Error('Chat en Firebase no está habilitado en este refactor');
    }

    async createGroupChat() {
        throw new Error('Chat en Firebase no está habilitado en este refactor');
    }

    async sendMessage() {
        throw new Error('Chat en Firebase no está habilitado en este refactor');
    }

    listenToMessages(chatId, callback) {
        return chatState.subscribeMessages(chatId, messages => callback(null, messages));
    }

    listenToUserChats(callback) {
        return chatState.subscribeChats(chats => callback(null, chats));
    }

    async markMessageAsRead() {
        return undefined;
    }

    async setTyping() {
        return undefined;
    }

    listenToTyping(chatId, callback) {
        return chatState.subscribeTyping(chatId, typingUserIds => callback(null, typingUserIds));
    }

    async addGroupParticipants() {
        throw new Error('Chat en Firebase no está habilitado en este refactor');
    }

    async removeGroupParticipant() {
        throw new Error('Chat en Firebase no está habilitado en este refactor');
    }

    async getChat(chatId) {
        return chatState.getChatById(chatId);
    }

    cleanup() {
        return undefined;
    }
}

export const chatFirebase = new ChatFirebase();