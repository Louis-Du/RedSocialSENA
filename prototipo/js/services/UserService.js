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
 * 
 * CONTRATOS: Ver docs/CONTRATOS_SERVICIOS.md
 */

import { appState } from '../AppState.js';
import { isValidDocument, isValidPassword } from '../utils.js';
import { validateCredentials } from '../data/MockUsers.js';
import { errorHandler } from '../utils/ErrorHandler.js';
import { dataMapper } from '../utils/DataMapper.js';

class UserService {
    /**
     * Autentica un usuario
     * 
     * @param {string} tipoDoc - Tipo de documento ('CC', 'TI', 'CE')
     * @param {string} documento - Número de documento
     * @param {string} password - Contraseña (mínimo 6 caracteres)
     * 
     * @returns {Promise<Object>} Respuesta con formato:
     * {
     *   success: boolean,
     *   user: Object | null,
     *   message: string,
     *   error: string | null
     * }
     * 
     * @example
     * const result = await userService.login('CC', '1234567890', 'sena123');
     * if (result.success) {
     *   console.log('Usuario autenticado:', result.user);
     * }
     */
    async login(tipoDoc, documento, password) {
        try {
            // Validaciones básicas
            if (!isValidDocument(tipoDoc, documento)) {
                const error = errorHandler.createError(
                    errorHandler.ERROR_CODES.VALIDATION_FORMAT,
                    'Documento inválido'
                );
                return { success: false, error: error.message, user: null };
            }
            
            if (!isValidPassword(password)) {
                const error = errorHandler.createError(
                    errorHandler.ERROR_CODES.VALIDATION_LENGTH,
                    'Contraseña inválida (mínimo 6 caracteres)'
                );
                return { success: false, error: error.message, user: null };
            }

            // Validar credenciales contra MockUsers
            // TODO BACKEND: Reemplazar por await fetch('/api/auth/login', {...})
            const mockUser = validateCredentials(tipoDoc, documento, password);
            
            if (!mockUser) {
                const error = errorHandler.createError(
                    errorHandler.ERROR_CODES.AUTH_INVALID_CREDENTIALS
                );
                errorHandler.logError(error, 'low');
                return { success: false, error: error.message, user: null };
            }

            // Mapear usuario a formato interno consistente
            const user = dataMapper.mapUser(
                { ...mockUser, isLoggedIn: true },
                'mock'
            );

            // Guardar en localStorage
            appState.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));

            return {
                success: true,
                user: user,
                message: 'Acceso confirmado. Bienvenido(a) a la Red Social SENA.'
            };
            
        } catch (error) {
            const normalizedError = errorHandler.handleError(error, 'UserService.login');
            errorHandler.logError(normalizedError, 'medium');
            
            return {
                success: false,
                error: normalizedError.message,
                user: null
            };
        }
    }

    /**
     * Cierra sesión del usuario actual
     * 
     * @returns {Promise<Object>} Respuesta con formato:
     * {
     *   success: boolean,
     *   message: string,
     *   error: string | null
     * }
     * 
     * @example
     * const result = await userService.logout();
     */
    async logout() {
        try {
            // TODO BACKEND: await fetch('/api/auth/logout', { method: 'POST' });
            appState.logoutUser();
            
            return { 
                success: true,
                message: 'Sesión cerrada correctamente'
            };
            
        } catch (error) {
            const normalizedError = errorHandler.handleError(error, 'UserService.logout');
            errorHandler.logError(normalizedError, 'low');
            
            return { 
                success: false, 
                error: normalizedError.message 
            };
        }
    }

    /**
     * Obtiene el usuario actualmente autenticado
     * 
     * @returns {Object|null} Usuario con formato:
     * {
     *   id: string,
     *   tipoDoc: string,
     *   documento: string,
     *   nombre: string,
     *   apodo: string,
     *   trimestre: string,
     *   programa: string,
     *   profilePicture: string,
     *   bio: string,
     *   email: string,
     *   isLoggedIn: boolean
     * }
     * 
     * @example
     * const user = userService.getCurrentUser();
     */
    getCurrentUser() {
        return appState.getCurrentUser();
    }

    /**
     * Verifica si hay un usuario autenticado
     * 
     * @returns {boolean} true si hay sesión activa
     * 
     * @example
     * if (userService.isLoggedIn()) {
     *   // Usuario autenticado
     * }
     */
    isLoggedIn() {
        return appState.currentUser.isLoggedIn;
    }

    /**
     * Actualiza el perfil del usuario actual
     * 
     * @param {Object} updates - Campos a actualizar
     * @param {string} [updates.nombre] - Nombre completo
     * @param {string} [updates.apodo] - Apodo/nickname
     * @param {string} [updates.bio] - Biografía
     * @param {string} [updates.profilePicture] - URL de imagen de perfil
     * @param {string} [updates.trimestre] - Trimestre actual
     * @param {string} [updates.programa] - Programa académico
     * 
     * @returns {Promise<Object>} Respuesta con formato:
     * {
     *   success: boolean,
     *   user: Object | null,
     *   message: string,
     *   error: string | null
     * }
     * 
     * @example
     * const result = await userService.updateProfile({
     *   nombre: 'Juan Pérez',
     *   bio: 'Desarrollador SENA'
     * });
     */
    async updateProfile(updates) {
        try {
            // Validar que no estén intentando cambiar campos inmutables
            const safeUpdates = { ...updates };
            delete safeUpdates.id;
            delete safeUpdates.documento;
            delete safeUpdates.tipoDoc;
            delete safeUpdates.isLoggedIn;

            // TODO BACKEND: 
            // const response = await fetch('/api/users/profile', {
            //   method: 'PUT',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(dataMapper.mapUserToAPI(safeUpdates))
            // });
            
            appState.updateCurrentUserProfile(safeUpdates);

            return {
                success: true,
                user: appState.getCurrentUser(),
                message: 'Perfil actualizado correctamente'
            };
            
        } catch (error) {
            const normalizedError = errorHandler.handleError(error, 'UserService.updateProfile');
            errorHandler.logError(normalizedError, 'medium');
            
            return {
                success: false,
                user: null,
                error: normalizedError.message
            };
        }
    }

    /**
     * Obtiene datos de un usuario por ID
     * 
     * @param {string} userId - ID del usuario a consultar
     * @returns {Object|null} Usuario o null si no existe
     * 
     * @example
     * const user = userService.getUserById('user_2');
     */
    getUserById(userId) {
        // TODO BACKEND: 
        // const response = await fetch(`/api/users/${userId}`);
        // const apiUser = await response.json();
        // return dataMapper.mapUser(apiUser, 'api');
        
        return appState.getUserById(userId);
    }

    /**
     * Obtiene las publicaciones de un usuario
     * 
     * @param {string} userId - ID del usuario
     * @returns {Array<Object>} Array de publicaciones
     * 
     * @example
     * const posts = userService.getUserPosts('user_1');
     */
    getUserPosts(userId) {
        // TODO BACKEND: 
        // const response = await fetch(`/api/users/${userId}/posts`);
        // const apiPosts = await response.json();
        // return dataMapper.mapCollection(apiPosts, 'post', 'api');
        
        return appState.getPostsByUserId(userId);
    }

    /**
     * Verifica si el usuario actual puede editar una publicación
     * 
     * @param {Object} post - La publicación a verificar
     * @returns {boolean} true si puede editar
     * 
     * @example
     * if (userService.canEditPost(post)) {
     *   // Mostrar botón de editar
     * }
     */
    canEditPost(post) {
        const currentUser = this.getCurrentUser();
        return post.userId === currentUser.id;
    }

    /**
     * Verifica si el usuario actual puede eliminar una publicación
     * 
     * @param {Object} post - La publicación a verificar
     * @returns {boolean} true si puede eliminar
     * 
     * @example
     * if (userService.canDeletePost(post)) {
     *   // Mostrar botón de eliminar
     * }
     */
    canDeletePost(post) {
        return this.canEditPost(post);
    }

    /**
     * Verifica si el usuario actual puede eliminar un comentario
     * 
     * @param {Object} comment - El comentario a verificar
     * @returns {boolean} true si puede eliminar
     * 
     * @example
     * if (userService.canDeleteComment(comment)) {
     *   // Mostrar botón de eliminar
     * }
     */
    canDeleteComment(comment) {
        const currentUser = this.getCurrentUser();
        return comment.userId === currentUser.id;
    }
}

export const userService = new UserService();
