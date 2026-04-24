/**
 * CommentService - Gestor centralizado de comentarios
 * 
 * Responsabilidades:
 * - CRUD de comentarios
 * - Validaciones de negocio
 * - Asociación comentarios-publicaciones
 */

import { isValidText, isValidImageFile, readFileAsDataURL } from '../../utils/utils.js';
import { userService } from '../auth/userService.js';
import { postRepository } from './postRepository.js';
import { postState } from './postState.js';

class CommentService {
    /**
     * Añade un comentario a una publicación
     * @param {string} postId - ID de la publicación
     * @param {string} content - Contenido del comentario
     * @param {File|null} imageFile - Archivo de imagen (opcional)
     * @returns {Promise<Object>}
     */
    async addComment(postId, content, imageFile = null) {
        try {
            // Validaciones
            if (!isValidText(content) && !imageFile) {
                throw new Error('El comentario no puede estar vacío');
            }

            // Verificar que el post exista
            const post = await postRepository.getById(postId);
            if (!post) {
                throw new Error('Publicación no encontrada');
            }

            let imageUrl = null;
            if (imageFile) {
                if (!isValidImageFile(imageFile)) {
                    throw new Error('Imagen inválida o demasiado grande');
                }
                imageUrl = await readFileAsDataURL(imageFile);
            }

            // En el futuro: await fetch(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content, imageUrl }) });
            const comment = postState.addComment(postId, content, imageUrl);
            
            // Set the userId on the comment
            comment.userId = userService.getCurrentUser()?.id;

            return {
                success: true,
                comment,
                message: 'Comentario creado'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                comment: null
            };
        }
    }

    /**
     * Obtiene comentarios de una publicación
     * @param {string} postId - ID de la publicación
     * @returns {Array}
     */
    getComments(postId) {
        const comments = postState.getComments(postId);
        
        // Enriquecer con info del autor
        return comments.map(comment => ({
            ...comment,
            author: userService.getUserById(comment.userId) || {}
        }));
    }

    /**
     * Obtiene todos los comentarios de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Array}
     */
    getUserComments(userId) {
        const allComments = [];
        
        // Iterar sobre todos los posts y recolectar comentarios del usuario
        const posts = postState.getPosts();
        posts.forEach(post => {
            const postComments = postState.getComments(post.id);
            const userPostComments = postComments.filter(c => c.userId === userId);
            allComments.push(...userPostComments);
        });
        
        // Enriquecer con info del post
        return allComments.map(comment => ({
            ...comment,
            author: userService.getUserById(comment.userId) || {}
        }));
    }

    /**
     * Obtiene el conteo de comentarios
     * @param {string} postId - ID de la publicación
     * @returns {number}
     */
    getCommentCount(postId) {
        return postState.getCommentCount(postId);
    }

    /**
     * Obtiene un comentario específico
     * @param {string} postId - ID de la publicación
     * @param {string} commentId - ID del comentario
     * @returns {Object|null}
     */
    getCommentById(postId, commentId) {
        const comments = postState.getComments(postId);
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return null;

        return {
            ...comment,
            author: userService.getUserById(comment.userId) || {}
        };
    }

    /**
     * Elimina un comentario
     * @param {string} postId - ID de la publicación
     * @param {string} commentId - ID del comentario
     * @returns {Promise<Object>}
     */
    async deleteComment(postId, commentId) {
        try {
            const comment = this.getCommentById(postId, commentId);
            if (!comment) {
                throw new Error('Comentario no encontrado');
            }

            if (!userService.canDeleteComment(comment)) {
                throw new Error('No tienes permiso para eliminar este comentario');
            }

            // En el futuro: await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
            postState.deleteComment(postId, commentId);

            return {
                success: true,
                message: 'Comentario eliminado'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verifica si el usuario actual puede eliminar un comentario
     * @param {string} postId - ID de la publicación
     * @param {string} commentId - ID del comentario
     * @returns {boolean}
     */
    canDeleteComment(postId, commentId) {
        const comment = this.getCommentById(postId, commentId);
        if (!comment) return false;
        return userService.canDeleteComment(comment);
    }
}

export const commentService = new CommentService();
