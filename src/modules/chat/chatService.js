import { chatRepository } from './chatRepository.js';

class ChatService {
    async initialize() {
        return chatRepository.initialize();
    }

    async createPrivateChat(otherUserId) {
        return chatRepository.createPrivateChat(otherUserId);
    }

    async createGroupChat(groupName, participantsIds = [], photoURL = null) {
        return chatRepository.createGroupChat(groupName, participantsIds, photoURL);
    }

    async sendMessage(chatId, content = '', imageFile = null) {
        return chatRepository.sendMessage(chatId, content, imageFile);
    }

    listenToMessages(chatId, callback) {
        return chatRepository.listenToMessages(chatId, callback);
    }

    listenToUserChats(callback) {
        return chatRepository.listenToUserChats(callback);
    }

    async markMessageAsRead(chatId, messageId) {
        return chatRepository.markMessageAsRead(chatId, messageId);
    }

    async setTyping(chatId, isTyping) {
        return chatRepository.setTyping(chatId, isTyping);
    }

    listenToTyping(chatId, callback) {
        return chatRepository.listenToTyping(chatId, callback);
    }

    async addGroupParticipants(chatId, userIds) {
        return chatRepository.addGroupParticipants(chatId, userIds);
    }

    async removeGroupParticipant(chatId, userId) {
        return chatRepository.removeGroupParticipant(chatId, userId);
    }

    async getChat(chatId) {
        return chatRepository.getChat(chatId);
    }

    cleanup() {
        return chatRepository.cleanup();
    }
}

export const chatService = new ChatService();