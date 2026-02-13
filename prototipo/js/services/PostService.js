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
     * Obtiene posts de un usuario con información enriquecida
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} Posts con autor y comentarios
     */
    async getUserPosts(userId) {
        try {
            const posts = this.getPostsByUserId(userId);
            
            // Enriquecer cada post con info del autor y comentarios
            const enrichedPosts = posts.map(post => ({
                ...post,
                author: userService.getUserById(post.userId) || {},
                commentCount: appState.getCommentCount(post.id)
            }));
            
            return enrichedPosts;
        } catch (error) {
            return [];
        }
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

    /**
     * Alterna un voto positivo en un post
     * @param {string} postId - ID del post
     * @returns {Promise<Object>}
     */
    async toggleUpvote(postId) {
        try {
            const userId = userService.getCurrentUser().id;
            appState.toggleUpvote(postId, userId);
            return {
                success: true,
                post: this.getPostById(postId)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Alterna un voto negativo en un post
     * @param {string} postId - ID del post
     * @returns {Promise<Object>}
     */
    async toggleDownvote(postId) {
        try {
            const userId = userService.getCurrentUser().id;
            appState.toggleDownvote(postId, userId);
            return {
                success: true,
                post: this.getPostById(postId)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene el voto actual del usuario en un post
     * @param {string} postId - ID del post
     * @returns {string|null} 'up', 'down' o null
     */
    getUserVote(postId) {
        const post = this.getPostById(postId);
        if (!post || !post.votes) return null;
        
        const userId = userService.getCurrentUser().id;
        return post.votes.usersVoted[userId] || null;
    }

    /**
     * Obtiene el balance neto de votaciones de un post
     * @param {string} postId - ID del post
     * @returns {number} upvotes - downvotes
     */
    getVoteBalance(postId) {
        const post = this.getPostById(postId);
        if (!post || !post.votes) return 0;
        return post.votes.upvotes - post.votes.downvotes;
    }

    /**
     * Obtiene posts filtrados según criterios
     * @param {Object} filters - Objeto con filtros { centro, regional, etapa, modalidad }
     * @returns {Array} Posts filtrados con autor
     */
    getFilteredPosts(filters = {}) {
        try {
            const allPosts = appState.getPosts();
            
            // Si no hay filtros activos, retornar todos los posts
            if (!filters.centro && !filters.regional && !filters.etapa && !filters.modalidad) {
                return allPosts.map(post => ({
                    ...post,
                    author: userService.getUserById(post.userId) || {},
                    commentCount: appState.getCommentCount(post.id)
                }));
            }
            
            // Aplicar filtros
            const filtered = allPosts.filter(post => {
                const author = userService.getUserById(post.userId);
                if (!author) return false;
                
                // Filtro centro
                if (filters.centro && author.centro !== filters.centro) {
                    return false;
                }
                
                // Filtro regional
                if (filters.regional && author.regional !== filters.regional) {
                    return false;
                }
                
                // Filtro etapa
                if (filters.etapa && author.etapa !== filters.etapa) {
                    return false;
                }
                
                // Filtro modalidad
                if (filters.modalidad && author.modalidad !== filters.modalidad) {
                    return false;
                }
                
                return true;
            });
            
            // Enriquecer los posts filtrados
            return filtered.map(post => ({
                ...post,
                author: userService.getUserById(post.userId) || {},
                commentCount: appState.getCommentCount(post.id)
            }));
        } catch (error) {
            console.error('Error al filtrar posts:', error);
            return [];
        }
    }
}

export const postService = new PostService();
