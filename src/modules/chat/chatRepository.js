import { chatState } from './chatState.js';
import { chatFirebase } from './chatFirebase.js';
import { chatLocal } from './chatLocal.js';

class ChatRepository {
    _getSource() {
        return chatFirebase.isAvailable() ? chatFirebase : chatLocal;
    }

    async initialize() {
        return this._getSource().initialize();
    }

    async createPrivateChat(otherUserId) {
        return this._getSource().createPrivateChat(otherUserId);
    }

    async createGroupChat(groupName, participantsIds = [], photoURL = null) {
        return this._getSource().createGroupChat(groupName, participantsIds, photoURL);
    }

    async sendMessage(chatId, content = '', imageFile = null) {
        return this._getSource().sendMessage(chatId, content, imageFile);
    }

    listenToMessages(chatId, callback) {
        return this._getSource().listenToMessages(chatId, callback);
    }

    listenToUserChats(callback) {
        return this._getSource().listenToUserChats(callback);
    }

    async markMessageAsRead(chatId, messageId) {
        return this._getSource().markMessageAsRead(chatId, messageId);
    }

    async setTyping(chatId, isTyping) {
        return this._getSource().setTyping(chatId, isTyping);
    }

    listenToTyping(chatId, callback) {
        return this._getSource().listenToTyping(chatId, callback);
    }

    async addGroupParticipants(chatId, userIds) {
        return this._getSource().addGroupParticipants(chatId, userIds);
    }

    async removeGroupParticipant(chatId, userId) {
        return this._getSource().removeGroupParticipant(chatId, userId);
    }

    async getChat(chatId) {
        return this._getSource().getChat(chatId);
    }

    cleanup() {
        return this._getSource().cleanup();
    }

    subscribeChats(listener) {
        return chatState.subscribeChats(listener);
    }
}

export const chatRepository = new ChatRepository();