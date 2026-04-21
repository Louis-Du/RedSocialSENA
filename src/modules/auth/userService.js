import { userRepository } from './userRepository.js';

class UserService {
    constructor() {
        this.authInitialized = true;
    }

    get auth() {
        const currentUser = userRepository.getCurrentUser();
        return {
            currentUser: currentUser?.uid ? { uid: currentUser.uid } : null
        };
    }

    get currentUserData() {
        return userRepository.getCurrentUser();
    }

    async initialize() {
        return userRepository.initialize();
    }

    async login(tipoDoc, documento, password) {
        return userRepository.login(tipoDoc, documento, password);
    }

    async register(userData) {
        return userRepository.register(userData);
    }

    async logout() {
        return userRepository.logout();
    }

    async updateProfile(updates) {
        return userRepository.updateProfile(updates);
    }

    getCurrentUser() {
        return userRepository.getCurrentUser();
    }

    isLoggedIn() {
        return userRepository.isLoggedIn();
    }

    getUserById(userId) {
        return userRepository.getUserById(userId);
    }

    getUsers() {
        return userRepository.getUsers();
    }

    canEditPost(post) {
        return userRepository.canEditPost(post);
    }

    canDeletePost(post) {
        return userRepository.canDeletePost(post);
    }

    canDeleteComment(comment) {
        return userRepository.canDeleteComment(comment);
    }

    getUserPosts(userId) {
        return userRepository.getUserPosts(userId);
    }

    subscribe(listener) {
        return userRepository.subscribe(listener);
    }
}

export const userService = new UserService();