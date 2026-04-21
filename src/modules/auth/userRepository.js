import { userState } from './authState.js';
import { userFirebase } from './userFirebase.js';
import { userLocal } from './userLocal.js';

class UserRepository {
    _getSource() {
        return userFirebase.isAvailable() ? userFirebase : userLocal;
    }

    async initialize() {
        const source = this._getSource();
        const snapshot = await source.initialize();

        if (snapshot?.users) {
            userState.setUsers(snapshot.users);
        }

        if (Object.prototype.hasOwnProperty.call(snapshot || {}, 'currentUser')) {
            userState.setCurrentUser(snapshot.currentUser);
        }

        return userState.snapshot();
    }

    async login(tipoDoc, documento, password) {
        return this._getSource().login(tipoDoc, documento, password);
    }

    async register(userData) {
        return this._getSource().register(userData);
    }

    async logout() {
        return this._getSource().logout();
    }

    async updateProfile(updates) {
        return this._getSource().updateProfile(updates);
    }

    getCurrentUser() {
        return userState.getCurrentUser();
    }

    isLoggedIn() {
        return userState.getCurrentUser() !== null;
    }

    getUserById(userId) {
        return userState.getUserById(userId);
    }

    getUsers() {
        return userState.getUsers();
    }

    canEditPost(post) {
        return this._getSource().canEditPost(post);
    }

    canDeletePost(post) {
        return this._getSource().canDeletePost(post);
    }

    canDeleteComment(comment) {
        return this._getSource().canDeleteComment(comment);
    }

    getUserPosts(userId) {
        return this._getSource().getUserPosts(userId);
    }

    subscribe(listener) {
        return userState.subscribe(listener);
    }
}

export const userRepository = new UserRepository();