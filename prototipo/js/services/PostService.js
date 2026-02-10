/**
 * PostService - Gestor centralizado de publicaciones
 * 
 * Responsabilidades:
 * - CRUD de publicaciones
 * - Validaciones de negocio
 * - Filtrados y búsquedas
 * 
 * TRANSICIÓN A BACKEND:
 * Reemplazar appState calls por fetch HTTP
 */

import { appState } from '../AppState.js';
import { isValidText, isValidImageFile, readFileAsDataURL } from '../utils.js';
import { userService } from './UserService.js';

class PostService {
    /**
     * Crea una nueva publicación
     * @param {string} content - Contenido de la publicación
     * @param {File|null} imageFile - Archivo de imagen
     * @returns {Promise<Object>}
     */
    async createPost(content, imageFile = null) {
        try {
            // Validaciones
            if (!isValidText(content) && !imageFile) {
                throw new Error('Debes escribir algo o seleccionar una imagen');
            }

            let imageUrl = null;
            if (imageFile) {
                if (!isValidImageFile(imageFile)) {
                    throw new Error('Imagen inválida o demasiado grande (máx 5MB)');
                }
                imageUrl = await readFileAsDataURL(imageFile);
            }

            // En el futuro: await fetch('/api/posts', { method: 'POST', body: JSON.stringify({ content, imageUrl }) });
            const post = appState.createPost(content, imageUrl);

            return {
                success: true,
                post,
                message: 'Publicación creada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                post: null
            };
        }
    }

    /**
     * Obtiene todas las publicaciones
     * @returns {Promise<Array>}
     */
    async getPosts() {
        try {
            // En el futuro: await fetch('/api/posts');
            return appState.getPosts();
        } catch (error) {
            console.error('Error al obtener posts:', error);
            return [];
        }
    }

    /**
     * Obtiene una publicación por ID
     * @param {string} postId - ID del post
     * @returns {Object|null}
     */
    getPostById(postId) {
        return appState.getPostById(postId);
    }

    /**
     * Obtiene posts de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Array}
     */
    getPostsByUserId(userId) {
        return appState.getPostsByUserId(userId);
    }

    /**
     * Actualiza una publicación
     * @param {string} postId - ID del post
     * @param {string} newContent - Nuevo contenido
     * @returns {Promise<Object>}
     */
    async updatePost(postId, newContent) {
        try {
            const post = this.getPostById(postId);
            if (!post) throw new Error('Publicación no encontrada');

            if (!userService.canEditPost(post)) {
                throw new Error('No tienes permiso para editar esta publicación');
            }

            if (!isValidText(newContent)) {
                throw new Error('El contenido no puede estar vacío');
            }

            // En el futuro: await fetch(`/api/posts/${postId}`, { method: 'PUT', body: JSON.stringify({ content: newContent }) });
            appState.updatePost(postId, { content: newContent });

            return {
                success: true,
                post: this.getPostById(postId),
                message: 'Publicación actualizada'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                post: null
            };
        }
    }

    /**
     * Elimina una publicación
     * @param {string} postId - ID del post
     * @returns {Promise<Object>}
     */
    async deletePost(postId) {
        try {
            const post = this.getPostById(postId);
            if (!post) throw new Error('Publicación no encontrada');

            if (!userService.canDeletePost(post)) {
                throw new Error('No tienes permiso para eliminar esta publicación');
            }

            // Pedir confirmación al usuario (esto debería hacerlo la UI)
            // Por ahora solo validamos en backend

            // En el futuro: await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            appState.deletePost(postId);

            return {
                success: true,
                message: 'Publicación eliminada'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene las datos de un post enriquecidos (incluye autor y comentarios)
     * @param {string} postId - ID del post
     * @returns {Object|null}
     */
    getPostWithDetails(postId) {
        const post = this.getPostById(postId);
        if (!post) return null;

        const author = userService.getUserById(post.userId);
        const comments = appState.getComments(postId);

        return {
            ...post,
            author,
            comments,
            commentCount: comments.length
        };
    }

    /**
     * Obtiene los posts del feed (publico actual)
     * Aquí se pueden agregar filtros, ordenamientos, paginación, etc.
     * @param {Object} options - Opciones de filtrado
     * @returns {Promise<Array>}
     */
    async getFeed(options = {}) {
        try {
            let posts = await this.getPosts();

            // En el futuro, aquí se pueden agregar:
            // - Filtros por trimestre, programa, tags
            // - Búsqueda de texto
            // - Paginación
            // - Ordenamiento (reciente, popular, etc.)

            // Enriquecer cada post con info del autor
            posts = posts.map(post => ({
                ...post,
                author: userService.getUserById(post.userId) || {},
                commentCount: appState.getCommentCount(post.id)
            }));

            return posts;
        } catch (error) {
            console.error('Error al obtener feed:', error);
            return [];
        }
    }

    /**
     * Verifica si el usuario actual puede realizar acciones en un post
     * @param {string} postId - ID del post
     * @param {string} action - Acción: 'edit' o 'delete'
     * @returns {boolean}
     */
    canUserPerformAction(postId, action = 'delete') {
        const post = this.getPostById(postId);
        if (!post) return false;

        if (action === 'edit' || action === 'delete') {
            return userService.canEditPost(post);
        }

        return false;
    }
}

export const postService = new PostService();
