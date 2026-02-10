/**
 * UserService - Gestor centralizado de usuarios y autenticación
 * 
 * Responsabilidades:
 * - Autenticación (login/logout)
 * - Gestión de perfil
 * - Obtención de datos de usuarios
 * 
 * TRANSICIÓN A BACKEND:
 * Reemplazar fetch de localStorage por llamadas HTTP
 * El resto de la aplicación no cambiará
 */

import { appState } from '../AppState.js';
import { isValidDocument, isValidPassword } from '../utils.js';
import { validateCredentials } from '../data/MockUsers.js';

class UserService {
    /**
     * Autentica un usuario
     * @param {string} tipoDoc - Tipo de documento
     * @param {string} documento - Número de documento
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Usuario autenticado o error
     */
    async login(tipoDoc, documento, password) {
        try {
            // Validaciones básicas
            if (!isValidDocument(tipoDoc, documento)) {
                throw new Error('Documento inválido');
            }
            if (!isValidPassword(password)) {
                throw new Error('Contraseña inválida (mínimo 6 caracteres)');
            }

            // Validar credenciales contra MockUsers
            const mockUser = validateCredentials(tipoDoc, documento, password);
            if (!mockUser) {
                throw new Error('Credenciales inválidas');
            }

            // Crear usuario autenticado en appState
            const user = {
                ...mockUser,
                isLoggedIn: true
            };

            // Guardar en localStorage
            appState.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));

            return {
                success: true,
                user: user,
                message: 'Bienvenido a la red social SENA'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                user: null
            };
        }
    }

    /**
     * Cierra sesión del usuario actual
     * @returns {Promise<Object>}
     */
    async logout() {
        try {
            // En el futuro: await fetch('/api/auth/logout');
            appState.logoutUser();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene el usuario actual
     * @returns {Object}
     */
    getCurrentUser() {
        return appState.getCurrentUser();
    }

    /**
     * Obtiene si hay un usuario autenticado
     * @returns {boolean}
     */
    isLoggedIn() {
        return appState.currentUser.isLoggedIn;
    }

    /**
     * Actualiza el perfil del usuario actual
     * @param {Object} updates - Campos a actualizar (nombre, bio, profilePicture, etc.)
     * @returns {Promise<Object>}
     */
    async updateProfile(updates) {
        try {
            // Validar que no estén intentando cambiar el ID o documento
            const safeUpdates = { ...updates };
            delete safeUpdates.id;
            delete safeUpdates.documento;
            delete safeUpdates.tipoDoc;
            delete safeUpdates.isLoggedIn;

            // En el futuro: await fetch('/api/users/profile', { method: 'PUT', body: JSON.stringify(safeUpdates) });
            appState.updateCurrentUserProfile(safeUpdates);

            return {
                success: true,
                user: appState.getCurrentUser()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene datos de un usuario por ID
     * @param {string} userId - ID del usuario
     * @returns {Object|null}
     */
    getUserById(userId) {
        // En el futuro: await fetch(`/api/users/${userId}`);
        return appState.getUserById(userId);
    }

    /**
     * Obtiene posts de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Array}
     */
    getUserPosts(userId) {
        // En el futuro: await fetch(`/api/users/${userId}/posts`);
        return appState.getPostsByUserId(userId);
    }

    /**
     * Verifica si el usuario actual puede editar un post
     * @param {Object} post - El post a verificar
     * @returns {boolean}
     */
    canEditPost(post) {
        const currentUser = this.getCurrentUser();
        return post.userId === currentUser.id;
    }

    /**
     * Verifica si el usuario actual puede eliminar un post
     * @param {Object} post - El post a verificar
     * @returns {boolean}
     */
    canDeletePost(post) {
        return this.canEditPost(post);
    }

    /**
     * Verifica si el usuario actual puede eliminar un comentario
     * @param {Object} comment - El comentario a verificar
     * @returns {boolean}
     */
    canDeleteComment(comment) {
        const currentUser = this.getCurrentUser();
        return comment.userId === currentUser.id;
    }
}

export const userService = new UserService();
