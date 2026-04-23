/**
 * FeedRenderer - Renderizador de posts en el feed
 * 
 * Responsabilidades:
 * - Generar HTML de posts de forma segura
 * - Renderizar comentarios
 * - Manejar la inserción de posts en el DOM
 * - Escuchar eventos de cambios de estado
 */

import { escapeHTML, formatTime } from '../utils/utils.js';
import { postService } from './postService.js';
import { commentService } from './CommentService.js';
import { userService } from './userService.js';
import { messageManager } from '../common/MessageManager.js';
import { uiComponents } from '../utils/UIComponents.js';
import { navigationManager } from './NavigationManager.js';

class FeedRenderer {
    constructor() {
        this.currentUser = userService.getCurrentUser();
        this.feedContainer = document.getElementById('postsFeed');
        this.postsUnsubscribe = null;
        this.setupEventDelegation();
    }

    /**
     * Configura event delegation para posts y comentarios
     */
    setupEventDelegation() {
        if (!this.feedContainer) return;

        // Event delegation para botones de comentarios y eliminación
        this.feedContainer.addEventListener('click', (e) => {
            // Click en perfil de autor
            if (e.target.closest('.view-other-profile')) {
                const profileDiv = e.target.closest('.view-other-profile');
                const userId = profileDiv.getAttribute('data-user-id');
                if (userId) {
                    this.handleViewProfile(userId);
                }
                return; // Evitar que se ejecuten otros handlers
            }

            // Botón de upvote
            if (e.target.closest('.upvote-btn')) {
                const btn = e.target.closest('.upvote-btn');
                const postId = btn.getAttribute('data-post-id');
                this.handleUpvote(postId);
            }

            // Botón de downvote
            if (e.target.closest('.downvote-btn')) {
                const btn = e.target.closest('.downvote-btn');
                const postId = btn.getAttribute('data-post-id');
                this.handleDownvote(postId);
            }

            // Botón de enviar comentario
            if (e.target.closest('.send-comment-btn')) {
                const btn = e.target.closest('.send-comment-btn');
                const postId = btn.getAttribute('data-post-id');
                this.handleSendComment(postId);
            }

            // Botón de eliminar post
            if (e.target.closest('.delete-post-btn')) {
                const btn = e.target.closest('.delete-post-btn');
                const postId = btn.getAttribute('data-post-id');
                this.handleDeletePost(postId);
            }

            // Botón de eliminar comentario
            if (e.target.closest('.delete-comment-btn')) {
                const btn = e.target.closest('.delete-comment-btn');
                const postId = btn.getAttribute('data-post-id');
                const commentId = btn.getAttribute('data-comment-id');
                this.handleDeleteComment(postId, commentId);
            }
        });

        // Event delegation para archivos en comentarios
        this.feedContainer.addEventListener('change', (e) => {
            const fileInput = e.target.closest('input[type="file"]');
            if (fileInput) {
                const postId = fileInput.id.split('-')[1];
                if (fileInput.getAttribute('accept') === 'image/*') {
                    this.handleCommentImageSelected(postId, fileInput);
                }
            }
        });
    }

    /**
     * Renderiza un post y lo inserta en el feed
     * @param {Object} post - Objeto post con autor
     * @param {string} position - 'top' o 'bottom' para inserción
     */
    renderPost(post, position = 'top') {
        if (!this.feedContainer) return;

        const html = this.generatePostHTML(post);
        
        if (position === 'top') {
            this.feedContainer.insertAdjacentHTML('afterbegin', html);
        } else {
            this.feedContainer.insertAdjacentHTML('beforeend', html);
        }

        // Reinitialize icons
        if (window.loadLucideIcons) {
            loadLucideIcons();
        }
    }

    /**
     * Renderiza todos los posts del feed
     * @param {Array} posts - Posts a renderizar
     */
    async renderFeed(posts) {
        if (!this.feedContainer) return;

        if (posts.length === 0) {
            this.feedContainer.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i data-lucide="inbox" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
                    <p class="text-lg">No hay publicaciones registradas</p>
                    <p class="text-sm">Comparte un aporte para iniciar el intercambio academico.</p>
                </div>
            `;
            if (window.loadLucideIcons) loadLucideIcons();
            return;
        }

        this.feedContainer.innerHTML = '';
        posts.forEach(post => this.renderPost(post, 'bottom'));
    }

    /**
     * Renderiza el feed completo usando el estado actual de posts
     */
    async renderFullFeed() {
        try {
            const posts = await postService.getFeed();
            this.renderFeed(posts);
        } catch (error) {
            messageManager.error('Error al cargar publicaciones');
            console.error('Error rendering full feed:', error);
        }
    }

    /**
     * Limpia listeners activos
     */
    cleanup() {
        if (this.postsUnsubscribe) {
            this.postsUnsubscribe();
            this.postsUnsubscribe = null;
        }
    }

    /**
     * Genera el HTML de un post
     * @param {Object} post - Post con autor
     * @returns {string} HTML del post
     */
    generatePostHTML(post) {
        const author = post.author || {};
        const commentCount = post.commentCount || 0;
        const canDelete = userService.canDeletePost(post);
        
        // Datos de votación
        const votes = post.votes || { upvotes: 0, downvotes: 0, usersVoted: {} };
        const currentUser = userService.getCurrentUser();
        const userVote = votes.usersVoted[currentUser.id] || null;
        const voteBalance = votes.upvotes - votes.downvotes;
        
        // Colores de botones según voto
        const upvoteClass = userVote === 'up' ? 'bg-green-200 text-sena-verde' : 'bg-white text-gray-700 hover:bg-green-100';
        const downvoteClass = userVote === 'down' ? 'bg-red-200 text-red-600' : 'bg-white text-gray-700 hover:bg-red-100';
        const balanceClass = voteBalance > 0 ? 'text-green-600' : voteBalance < 0 ? 'text-red-600' : 'text-gray-600';
        
        const imageBlock = post.imageUrl
            ? `<img src="${escapeHTML(post.imageUrl)}" alt="Post del usuario" class="w-full rounded-2xl shadow-lg max-h-64 object-cover" loading="lazy" />`
            : '';

        const deleteBtn = canDelete
            ? `<button class="delete-post-btn text-red-600 hover:text-red-700 p-2" data-post-id="${post.id}" title="Eliminar publicación">
                <i data-lucide="trash-2" class="w-5 h-5"></i>
              </button>`
            : '';

        // Usar foto de perfil si existe, si no mostrar icono
        const avatarBlock = author.profilePicture && author.profilePicture !== 'assets/placeholders/avatar-placeholder.svg'
            ? `<img src="${escapeHTML(author.profilePicture)}" alt="Avatar de ${escapeHTML(author.apodo || 'Usuario')}" class="w-16 h-16 rounded-full object-cover border-3 border-white" />`
            : `<div class="bg-sena-verde rounded-full p-3 w-16 h-16 flex items-center justify-center">
                <i data-lucide="user" class="w-8 h-8 text-white"></i>
              </div>`;

        return `
            <article class="bg-white rounded-3xl shadow-xl overflow-hidden" data-post-id="${post.id}">
                <div class="bg-sena-verde-claro p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex items-start gap-4">
                            ${avatarBlock}
                            <div class="flex-1 view-other-profile cursor-pointer hover:opacity-80" data-user-id="${post.userId || ''}">
                                <h3 class="text-xl font-bold text-gray-900">${escapeHTML(author.apodo || 'Usuario')}</h3>
                                <p class="text-gray-800 font-semibold">${escapeHTML(author.trimestre || '')}</p>
                                <p class="text-gray-700 text-sm">${escapeHTML(author.programa || '')}</p>
                            </div>
                        </div>
                        ${deleteBtn}
                    </div>
                </div>

                <div class="p-6">
                    <p class="text-gray-800 text-lg mb-4">${escapeHTML(post.content)}</p>
                    ${imageBlock}
                </div>

                <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div class="flex items-center justify-between gap-2 mb-4">
                        <div class="flex items-center gap-2">
                            <button class="upvote-btn ${upvoteClass} p-2 rounded-lg transition-all flex items-center gap-1" data-post-id="${post.id}" title="Votar positivo">
                                <i data-lucide="thumbs-up" class="w-5 h-5"></i>
                                <span class="text-sm font-semibold">${votes.upvotes}</span>
                            </button>
                            <button class="downvote-btn ${downvoteClass} p-2 rounded-lg transition-all flex items-center gap-1" data-post-id="${post.id}" title="Votar negativo">
                                <i data-lucide="thumbs-down" class="w-5 h-5"></i>
                                <span class="text-sm font-semibold">${votes.downvotes}</span>
                            </button>
                            <div class="px-3 py-1 rounded-lg bg-gray-200 text-sm font-semibold ${balanceClass}">
                                ${voteBalance > 0 ? '+' : ''}${voteBalance}
                            </div>
                        </div>
                        <span class="text-gray-500 text-sm">${formatTime(post.createdAt)}</span>
                    </div>
                </div>

                <div class="bg-gray-100 p-6">
                    <div id="commentsContainer-${post.id}" class="comments-section space-y-4 border-b border-gray-300 pb-4 mb-4">
                    </div>
            
                    <div class="flex items-center gap-4">
                        <div class="bg-gray-800 rounded-full p-2">
                            <i data-lucide="user" class="w-6 h-6 text-white"></i>
                        </div>
                        <input type="text" placeholder="Crea un comentario" class="comment-input flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-300 focus:border-sena-verde focus:outline-none transition-colors" data-post-id="${post.id}" />
                    
                        <label for="commentFile-${post.id}" class="bg-white hover:bg-gray-100 p-3 rounded-xl transition-colors cursor-pointer">
                            <i data-lucide="paperclip" class="w-6 h-6 text-gray-700"></i>
                        </label>
                        <input type="file" id="commentFile-${post.id}" class="hidden" />

                        <label for="commentCamera-${post.id}" class="bg-white hover:bg-gray-100 p-3 rounded-xl transition-colors cursor-pointer">
                            <i data-lucide="camera" class="w-6 h-6 text-gray-700"></i>
                        </label>
                        <input type="file" id="commentCamera-${post.id}" accept="image/*" class="hidden" />

                        <button class="send-comment-btn bg-sena-verde hover:bg-green-700 text-white p-3 rounded-xl transition-all" data-post-id="${post.id}">
                            <i data-lucide="send" class="w-6 h-6"></i>
                        </button>
                    </div>
                
                    <p class="comment-count text-gray-600 text-sm mt-3 ml-14">${commentCount} comentario${commentCount !== 1 ? 's' : ''}</p>
                </div>
            </article>
        `;
    }

    /**
     * Renderiza comentarios de un post
     * @param {string} postId - ID del post
     */
    renderComments(postId) {
        const comments = commentService.getComments(postId);
        const container = document.getElementById(`commentsContainer-${postId}`);
        if (!container) return;

        if (comments.length === 0) {
            container.innerHTML = `
                <div class="text-sm text-gray-500 text-center py-4">
                    Aun no hay comentarios. Tu aporte puede iniciar la conversacion.
                </div>
            `;
        } else {
            container.innerHTML = '';
            comments.forEach(comment => {
                container.insertAdjacentHTML('beforeend', this.generateCommentHTML(comment, postId));
            });
        }

        if (window.loadLucideIcons) loadLucideIcons();
    }

    /**
     * Genera HTML de un comentario
     * @param {Object} comment - Comentario con autor
     * @param {string} postId - ID del post propietario
     * @returns {string} HTML del comentario
     */
    generateCommentHTML(comment, postId) {
        const author = comment.author || {};
        const canDelete = userService.canDeleteComment(comment);
        const imageBlock = comment.imageUrl
            ? `<img src="${escapeHTML(comment.imageUrl)}" alt="Imagen comentario" class="mt-2 rounded max-w-xs max-h-48 object-cover" />`
            : '';

        const deleteBtn = canDelete
            ? `<button class="delete-comment-btn text-red-500 hover:text-red-600 ml-2 text-xs" data-post-id="${postId}" data-comment-id="${comment.id}" title="Eliminar comentario">Eliminar</button>`
            : '';

        return `
            <div class="flex items-start gap-3" data-comment-id="${comment.id}">
                <div class="bg-gray-800 rounded-full p-2 flex-shrink-0">
                    <i data-lucide="user" class="w-4 h-4 text-white"></i>
                </div>
                <div class="flex-1 bg-gray-200 p-3 rounded-lg">
                    <p class="text-sm font-semibold text-gray-800">${escapeHTML(author.apodo || 'Usuario')}</p>
                    <p class="text-gray-700 text-sm">${escapeHTML(comment.content)}</p>
                    ${imageBlock}
                    <p class="text-xs text-gray-600 text-right mt-1">${formatTime(comment.createdAt)}</p>
                    ${deleteBtn}
                </div>
            </div>
        `;
    }

    /**
     * Maneja el upvote de un post
     * @param {string} postId - ID del post
     */
    async handleUpvote(postId) {
        const btn = document.querySelector(`.upvote-btn[data-post-id="${postId}"]`);
        if (!btn) return;

        // Añadir estado de carga
        btn.disabled = true;
        btn.style.opacity = '0.6';

        try {
            const result = await postService.toggleUpvote(postId);
            if (!result.success) {
                messageManager.error(`No fue posible registrar el voto: ${result.error}`);
                return;
            }

            // El listener en tiempo real actualizará automáticamente el UI
            messageManager.success('Voto registrado');
        } catch (error) {
            messageManager.error('Error al procesar el voto. Intenta novamente.');
        } finally {
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

    /**
     * Maneja el downvote de un post
     * @param {string} postId - ID del post
     */
    async handleDownvote(postId) {
        const btn = document.querySelector(`.downvote-btn[data-post-id="${postId}"]`);
        if (!btn) return;

        // Añadir estado de carga
        btn.disabled = true;
        btn.style.opacity = '0.6';

        try {
            const result = await postService.toggleDownvote(postId);
            if (!result.success) {
                messageManager.error(`No fue posible registrar el voto: ${result.error}`);
                return;
            }

            // El listener en tiempo real actualizará automáticamente el UI
            messageManager.success('Voto registrado');
        } catch (error) {
            messageManager.error('Error al procesar el voto. Intenta novamente.');
        } finally {
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

    /**
     * Maneja el envío de comentarios
     * @param {string} postId - ID del post
     */
    async handleSendComment(postId) {
        const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        const commentText = input?.value.trim();
        
        // Obtener archivo de imagen si existe
        const fileInput = document.getElementById(`commentFile-${postId}`);
        const cameraInput = document.getElementById(`commentCamera-${postId}`);
        const imageFile = fileInput?.files[0] || cameraInput?.files[0];

        if (!commentText && !imageFile) {
            messageManager.error('El comentario no puede estar vacío. Por favor agrega texto o una imagen.');
            return;
        }

        try {
            const result = await commentService.addComment(postId, commentText, imageFile);
            
            if (!result.success) {
                messageManager.error(`No fue posible registrar el comentario: ${result.error}`);
                return;
            }

            // Limpiar inputs
            if (input) input.value = '';
            if (fileInput) fileInput.value = '';
            if (cameraInput) cameraInput.value = '';
            
            // Limpiar preview de imagen si existe
            const preview = document.getElementById(`commentImagePreview-${postId}`);
            if (preview) preview.remove();

            this.renderComments(postId);

            // Actualizar contador
            const countEl = document.querySelector(`[data-post-id="${postId}"] .comment-count`);
            if (countEl) {
                const count = commentService.getCommentCount(postId);
                countEl.textContent = `${count} comentario${count !== 1 ? 's' : ''}`;
            }
            
            messageManager.success('Comentario publicado correctamente');
        } catch (error) {
            messageManager.error('Error al publicar el comentario. Intenta de nuevo.');
        }
    }

    /**
     * Maneja la visualización del perfil de un usuario
     * @param {string} userId - ID del usuario a visualizar
     */
    handleViewProfile(userId) {
        if (!userId) {
            return;
        }
        navigationManager.navigateToProfile(userId);
    }

    /**
     * Maneja eliminación de posts
     * @param {string} postId - ID del post
     */
    async handleDeletePost(postId) {
        const confirmed = await new Promise(resolve => {
            messageManager.confirm(
                'Eliminar publicacion',
                'Esta accion eliminara la publicacion y sus comentarios asociados. ¿Deseas continuar?',
                () => resolve(true),
                () => resolve(false)
            );
        });
        if (!confirmed) return;

        const result = await postService.deletePost(postId);
        if (!result.success) {
            messageManager.error(`No fue posible eliminar la publicacion: ${result.error}`);
            return;
        }

        // Remover el post del DOM
        const postEl = document.querySelector(`article[data-post-id="${postId}"]`);
        postEl?.remove();
    }

    /**
     * Maneja eliminación de comentarios
     * @param {string} postId - ID del post
     * @param {string} commentId - ID del comentario
     */
    async handleDeleteComment(postId, commentId) {
        const confirmed = await new Promise(resolve => {
            messageManager.confirm(
                'Eliminar comentario',
                'Esta accion eliminara el comentario seleccionado. ¿Deseas continuar?',
                () => resolve(true),
                () => resolve(false)
            );
        });
        if (!confirmed) return;

        const result = await commentService.deleteComment(postId, commentId);
        if (!result.success) {
            messageManager.error(`No fue posible eliminar el comentario: ${result.error}`);
            return;
        }

        this.renderComments(postId);

        // Actualizar contador
        const countEl = document.querySelector(`[data-post-id="${postId}"] .comment-count`);
        if (countEl) {
            const count = commentService.getCommentCount(postId);
            countEl.textContent = `${count} comentario${count !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Maneja selección de imagen en comentario
     * @param {string} postId - ID del post
     * @param {HTMLInputElement} fileInput - Input de archivo
     */
    async handleCommentImageSelected(postId, fileInput) {
        if (fileInput.files.length === 0) return;
        
        const file = fileInput.files[0];
        
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            messageManager.error('Por favor selecciona un archivo de imagen válido');
            fileInput.value = '';
            return;
        }

        // Validar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            messageManager.error('La imagen debe ser menor a 5MB');
            fileInput.value = '';
            return;
        }

        // Crear preview de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            
            // Buscar o crear contenedor de preview
            let previewContainer = document.getElementById(`commentImagePreview-${postId}`);
            
            if (!previewContainer) {
                const commentSection = document.querySelector(`[data-post-id="${postId}"]`)?.closest('.post-card')?.querySelector('.bg-gray-100');
                if (commentSection) {
                    previewContainer = document.createElement('div');
                    previewContainer.id = `commentImagePreview-${postId}`;
                    previewContainer.className = 'mb-3 relative inline-block';
                    commentSection.insertBefore(previewContainer, commentSection.lastElementChild);
                }
            }
            
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <div class="relative inline-block">
                        <img src="${imageUrl}" class="max-h-32 rounded-lg border-2 border-sena-verde" alt="Preview" />
                        <button class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600" onclick="document.getElementById('${fileInput.id}').value=''; this.parentElement.parentElement.remove();">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                `;
                
                if (window.loadLucideIcons) {
                    window.loadLucideIcons();
                }
            }
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Muestra estado vacío en el feed
     */
    showEmptyState() {
        if (!this.feedContainer) return;

        const emptyHTML = uiComponents.emptyState({
            icon: 'post',
            title: 'Aún no hay publicaciones',
            message: 'Sé el primero en compartir algo con la comunidad. ¡Crea tu primera publicación!',
            actionText: 'Crear Publicación',
            actionId: 'emptyCreatePostBtn',
            actionCallback: () => {
                const createBtn = document.getElementById('createPostBtn');
                if (createBtn) createBtn.click();
            }
        });

        this.feedContainer.innerHTML = emptyHTML;
    }

    /**
     * Verifica si el feed está vacío y muestra el estado correspondiente
     */
    checkEmptyFeed() {
        if (!this.feedContainer) return;

        const posts = this.feedContainer.querySelectorAll('.post-card');
        if (posts.length === 0) {
            this.showEmptyState();
        }
    }
}

export const feedRenderer = new FeedRenderer();
