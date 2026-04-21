import { userState } from './authState.js';

class UserFirebase {
    isAvailable() {
        return false;
    }

    async initialize() {
        return userState.snapshot();
    }

    async login() {
        throw new Error('Firebase auth no está conectado en este refactor');
    }

    async register() {
        throw new Error('Firebase auth no está conectado en este refactor');
    }

    async logout() {
        return { success: true, message: 'Sesión cerrada' };
    }

    async updateProfile() {
        throw new Error('Firebase auth no está conectado en este refactor');
    }

    getCurrentUser() {
        const currentUser = userState.getCurrentUser();
        if (!currentUser) {
            return { id: null, uid: null, isLoggedIn: false };
        }

        return {
            id: currentUser.id || currentUser.uid,
            uid: currentUser.uid || currentUser.id,
            ...currentUser,
            isLoggedIn: true
        };
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
        return post?.userId === userState.getCurrentUser()?.uid;
    }

    canDeletePost(post) {
        return this.canEditPost(post);
    }

    canDeleteComment(comment) {
        return comment?.userId === userState.getCurrentUser()?.uid;
    }

    getUserPosts() {
        return [];
    }

    subscribe(listener) {
        return userState.subscribe(listener);
    }
}

export const userFirebase = new UserFirebase();