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
import { validateCredentials, getOtherUsers } from '../data/MockUsers.js';
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

            // Guardar sesión en AppState (que maneja localStorage correctamente)
            appState.currentUser = user;
            appState.saveToStorage(); // Guardar en 'appState'
            localStorage.setItem('userSession', JSON.stringify({ tipoDoc, documento })); // Guardar sesión
            
            // Notificar a suscriptores
            appState.notifySubscribers('currentUser');

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
     * Registra un nuevo usuario
     * 
     * @param {Object} userData - Datos del usuario a registrar
     * @param {string} userData.tipoDoc - Tipo de documento
     * @param {string} userData.documento - Número de documento
     * @param {string} userData.password - Contraseña
     * @param {string} userData.nombre - Nombre completo
     * @param {string} userData.email - Email
     * @param {string} userData.rol - Rol del usuario ('Aprendiz' | 'Instructor' | 'Coordinador')
     * @param {string} userData.programa - Programa de formación
     * @param {string} userData.ciudad - Ciudad
     * 
     * @returns {Promise<Object>} Respuesta con formato:
     * {
     *   success: boolean,
     *   user: Object | null,
     *   message: string,
     *   error: string | null
     * }
     */
    async register(userData) {
        try {
            const { tipoDoc, documento, password, nombre, email, rol, programa, ciudad } = userData;

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
                    'La contraseña debe tener al menos 6 caracteres'
                );
                return { success: false, error: error.message, user: null };
            }

            if (!nombre || nombre.trim().length < 3) {
                return { 
                    success: false, 
                    error: 'El nombre debe tener al menos 3 caracteres', 
                    user: null 
                };
            }

            if (!email || !email.includes('@')) {
                return { 
                    success: false, 
                    error: 'Email inválido', 
                    user: null 
                };
            }

            if (!rol || !['Aprendiz', 'Egresado'].includes(rol)) {
                return { 
                    success: false, 
                    error: 'Rol inválido. Debe ser Aprendiz o Egresado', 
                    user: null 
                };
            }

            // Verificar si el usuario ya existe
            const existingUser = validateCredentials(tipoDoc, documento, password);
            if (existingUser) {
                return { 
                    success: false, 
                    error: 'Ya existe un usuario con este documento', 
                    user: null 
                };
            }

            // TODO BACKEND: await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) });
            
            // Crear nuevo usuario
            const newUser = {
                id: `user_${Date.now()}`,
                tipoDoc,
                documento,
                nombre,
                apodo: nombre.split(' ')[0], // Primer nombre como apodo por defecto
                rol,
                email: email || `${documento}@sena.edu.co`,
                programa: programa || 'No especificado',
                ciudad: ciudad || 'No especificado',
                bio: `${rol} del SENA`,
                profilePicture: 'assets/placeholders/avatar-placeholder.svg',
                trimestre: rol === 'Aprendiz' ? '1° Trimestre' : 'N/A',
                regional: 'Centro SENA',
                centro: ciudad || 'No especificado',
                etapa: rol === 'Aprendiz' ? 'Lectiva' : 'N/A',
                modalidad: 'Presencial',
                isLoggedIn: true
            };

            // Mapear a formato interno
            const user = dataMapper.mapUser(newUser, 'mock');

            // Guardar en AppState
            appState.currentUser = user;
            appState.users.push(user); // Agregar a lista de usuarios
            appState.saveToStorage();
            localStorage.setItem('userSession', JSON.stringify({ tipoDoc, documento }));
            
            // Notificar a suscriptores
            appState.notifySubscribers('currentUser');

            return {
                success: true,
                user: user,
                message: 'Cuenta creada exitosamente. Bienvenido(a) a la Red Social SENA.'
            };

        } catch (error) {
            const normalizedError = errorHandler.handleError(error, 'UserService.register');
            errorHandler.logError(normalizedError, 'medium');
            
            return {
                success: false,
                error: normalizedError.message || 'Error al crear la cuenta',
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

    /**
     * Obtiene lista de todos los usuarios registrados
     * Incluye usuarios Mock y usuarios registrados en AppState
     * Excluye al usuario actual
     * 
     * @returns {Array<Object>} Lista de usuarios
     * 
     * @example
     * const users = userService.getUsers();
     * const otherUsers = users.filter(u => u.id !== currentUser.id);
     */
    getUsers() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            // Retornar usuarios disponibles si no hay usuario logeado
            return getOtherUsers(null, appState);
        }
        // Retorna todos los usuarios excepto el actual (incluye Mock + AppState)
        return getOtherUsers(currentUser.id, appState);
    }
}

export const userService = new UserService();
