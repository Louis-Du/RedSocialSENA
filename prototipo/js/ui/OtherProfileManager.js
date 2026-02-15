/**
 * OtherProfileManager - Gestor de vista de perfil público
 * 
 * Responsabilidades:
 * - Renderizar perfil de otros usuarios
 * - Mostrar información del usuario y sus publicaciones
 * - Diferenciar entre ver perfil propio y de otro usuario
 */

import { userService } from '../services/UserService.js';
import { postService } from '../services/PostService.js';
import { commentService } from '../services/CommentService.js';
import { navigationManager } from './NavigationManager.js';
import { messageManager } from './MessageManager.js';
import { escapeHTML } from '../utils.js';

class OtherProfileManager {
    constructor() {
        this.currentViewedUserId = null;
        
        // Escuchar cuando se muestre la vista
        window.addEventListener('otherProfileShown', (e) => {
            const params = e.detail?.params || {};
            
            // Si no hay userId, ignorar el evento (puede ser un evento duplicado o error)
            if (!params.userId) {
                return;
            }
            
            this.loadUserProfile(params.userId);
        });
        
        // Listener para botón de volver
        document.getElementById('returnToAppBtnOtherProfile')?.addEventListener('click', () => {
            navigationManager.showView('app');
        });
    }
    
    /**
     * Carga el perfil de un usuario
     * @param {string} userId - ID del usuario a mostrar
     */
    loadUserProfile(userId) {
        if (!userId) {
            messageManager.error('No se especificó usuario');
            navigationManager.showView('app');
            return;
        }
        
        // Obtener usuario
        const user = userService.getUserById(userId);
        
        if (!user) {
            messageManager.error('Usuario no encontrado');
            navigationManager.showView('app');
            return;
        }
        
        this.currentViewedUserId = userId;
        this.renderProfile(user);
        this.loadUserPosts(userId);
        this.loadUserComments(userId);
    }
    
    /**
     * Renderiza la información del usuario en el perfil
     * @param {Object} user - Usuario a renderizar
     */
    renderProfile(user) {
        const profileView = document.getElementById('otherProfileView');
        if (!profileView) {
            return;
        }
        
        // 1. Actualizar foto de perfil (NUEVA)
        const profilePhotoElement = profileView.querySelector('.w-32.h-32.rounded-full.overflow-hidden img');
        if (profilePhotoElement && user.profilePicture) {
            profilePhotoElement.src = escapeHTML(user.profilePicture);
            profilePhotoElement.alt = `Foto de ${escapeHTML(user.nombre || 'Usuario')}`;
        }

        // 2. Actualizar nombre principal (h2)
        const nameElement = profileView.querySelector('h2');
        if (nameElement) {
            nameElement.textContent = escapeHTML(user.nombre || 'Usuario');
        }

        // 3. Actualizar apodo/username (@username)
        const apokoElement = profileView.querySelector('h2 + p');
        if (apokoElement) {
            apokoElement.textContent = `@${escapeHTML(user.apodo || user.nombre || 'usuario')}`;
        }

        // 4. Actualizar ubicación (si hay campo)
        const locationElement = profileView.querySelector('.flex.items-center.gap-2:has(i[data-lucide="map-pin"])');
        if (locationElement && user.ciudad) {
            locationElement.innerHTML = `
                <i data-lucide="map-pin" class="w-5 h-5 text-sena-verde"></i>
                <span class="text-gray-700">${escapeHTML(user.ciudad || 'Sin ubicación')}</span>
            `;
        }
        
        // 5. Actualizar biografía
        const bioElement = profileView.querySelector('.text-gray-700.leading-relaxed');
        if (bioElement) {
            bioElement.textContent = escapeHTML(user.bio || 'Este usuario no ha agregado una biografía.');
        }
        
        // 6. Actualizar Programa
        const programaField = profileView.querySelector('#programaField');
        if (programaField) {
            programaField.textContent = escapeHTML(user.programa || 'Sin programa especificado');
        }

        // 7. Actualizar Trimestre/Etapa
        const trimestreField = profileView.querySelector('#trimestreField');
        if (trimestreField) {
            trimestreField.textContent = escapeHTML(`${user.trimestre || 'Sin trimestre'} - ${user.etapa || 'Etapa Lectiva'}`);
        }

        // 8. Actualizar Regional
        const regionalField = profileView.querySelector('#regionalField');
        if (regionalField) {
            regionalField.textContent = escapeHTML(user.regional || 'Sin regional asignada');
        }

        // 9. Actualizar Centro
        const centroField = profileView.querySelector('#centroField');
        if (centroField) {
            centroField.textContent = escapeHTML(user.centro || 'Sin centro asignado');
        }

        // 10. Actualizar Modalidad
        const modalidadField = profileView.querySelector('#modalidadField');
        if (modalidadField) {
            modalidadField.textContent = escapeHTML(user.modalidad || 'Sin información de modalidad');
        }

        // 11. Actualizar Documento
        const documentoField = profileView.querySelector('#documentoField');
        if (documentoField) {
            const docText = user.tipoDoc && user.documento 
                ? `${user.tipoDoc} ${user.documento}`
                : escapeHTML(user.documento || 'No disponible');
            documentoField.textContent = docText;
        }

        // 12. Verificar si es el perfil del usuario actual
        const currentUser = userService.getCurrentUser();
        const isOwnProfile = user.id === currentUser.id;

        // 13. Mostrar/ocultar botón según si es perfil propio o ajeno
        const sendMessageBtn = document.getElementById('sendMessageToUserBtn');
        if (sendMessageBtn) {
            // Clonar el botón para eliminar listeners anteriores
            const newBtn = sendMessageBtn.cloneNode(true);
            sendMessageBtn.parentNode.replaceChild(newBtn, sendMessageBtn);
            
            if (isOwnProfile) {
                // Si es perfil propio, cambiar a "Editar Perfil"
                newBtn.innerHTML = '<i data-lucide="edit-3" class="w-5 h-5"></i><span>Editar Perfil</span>';
                newBtn.style.display = 'flex';
                
                // Agregar listener para ir a editar perfil
                newBtn.addEventListener('click', () => {
                    navigationManager.showView('editProfile');
                });
            } else {
                // Si es perfil ajeno, mostrar "Enviar Mensaje"
                newBtn.innerHTML = '<i data-lucide="message-circle" class="w-5 h-5"></i><span>Enviar Mensaje</span>';
                newBtn.style.display = 'flex';
                
                // Agregar listener para abrir chat
                newBtn.addEventListener('click', () => {
                    if (this.currentViewedUserId) {
                        messageManager.info('Función de mensajería próximamente disponible');
                    }
                });
            }
        }

        // 14. Reiniciar iconos de Lucide
        if (window.loadLucideIcons) {
            loadLucideIcons();
        }
    }
    
    /**
     * Carga las publicaciones del usuario
     * @param {string} userId - ID del usuario
     */
    async loadUserPosts(userId) {
        const posts = await postService.getUserPosts(userId);
        this.renderUserPosts(posts);
    }

    /**
     * Renderiza las publicaciones del usuario en su perfil
     * @param {Array} posts - Publicaciones del usuario
     */
    renderUserPosts(posts) {
        const profileView = document.getElementById('otherProfileView');
        if (!profileView) return;

        // Buscar la sección de publicaciones por ID
        const postsSection = document.getElementById('otherProfilePostsSection');
        if (!postsSection) return;

        // Limpiar contenido actual (excepto el título)
        const title = postsSection.querySelector('h3');
        postsSection.innerHTML = '';
        if (title) {
            postsSection.appendChild(title);
        }

        if (posts.length === 0) {
            postsSection.insertAdjacentHTML('beforeend', `
                <p class="text-center text-gray-600 mt-6">Este usuario aún no ha publicado nada.</p>
            `);
            return;
        }

        // Renderizar cada publicación
        posts.forEach(post => {
            const postHTML = this.generatePostHTML(post);
            postsSection.insertAdjacentHTML('beforeend', postHTML);
        });

        // Reiniciar iconos
        if (window.loadLucideIcons) {
            loadLucideIcons();
        }
    }

    /**
     * Genera HTML para una publicación en el perfil
     * @param {Object} post - Publicación
     * @returns {string} HTML
     */
    generatePostHTML(post) {
        const imageBlock = post.imageUrl
            ? `<img src="${escapeHTML(post.imageUrl)}" alt="Publicación" class="w-full rounded-xl shadow-lg mt-3" />`
            : '';

        const timeAgo = this.getTimeAgo(new Date(post.createdAt));

        return `
            <article class="bg-white rounded-2xl shadow-md overflow-hidden mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
                <div class="p-6">
                    <p class="text-gray-800 font-semibold text-lg mb-3">${escapeHTML(post.content)}</p>
                    ${imageBlock}
                </div>
                <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                        <div class="flex items-center gap-1">
                            <i data-lucide="message-circle" class="w-4 h-4"></i>
                            <span>${post.commentCount || 0} comentario${post.commentCount !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <span class="text-sm text-gray-500">${timeAgo}</span>
                </div>
            </article>
        `;
    }

    /**
     * Calcula el tiempo transcurrido desde una fecha
     * @param {Date} date - Fecha
     * @returns {string} Texto relativo (ej: "Hace 2 horas")
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Recién publicado';
        if (diffMins === 1) return 'Hace 1 minuto';
        if (diffMins < 60) return `Hace ${diffMins} minutos`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return 'Hace 1 hora';
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Hace 1 día';
        if (diffDays < 30) return `Hace ${diffDays} días`;
        
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths === 1) return 'Hace 1 mes';
        return `Hace ${diffMonths} meses`;
    }

    /**
     * Carga los comentarios recientes del usuario
     * @param {string} userId - ID del usuario
     */
    loadUserComments(userId) {
        // Obtener todos los comentarios del usuario
        const userComments = commentService.getUserComments(userId);
        
        // Ordenar por fecha descendente y tomar los últimos 5
        const recentComments = userComments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        this.renderUserComments(recentComments, userId);
    }

    /**
     * Renderiza los comentarios recientes del usuario
     * @param {Array} comments - Comentarios del usuario
     * @param {string} userId - ID del usuario
     */
    renderUserComments(comments, userId) {
        const profileView = document.getElementById('otherProfileView');
        if (!profileView) return;

        // Buscar o crear la sección de comentarios
        let commentsSection = document.getElementById('otherProfileCommentsSection');
        
        if (!commentsSection) {
            // Crear la sección si no existe
            const postsSection = document.getElementById('otherProfilePostsSection');
            if (postsSection && postsSection.parentNode) {
                commentsSection = document.createElement('div');
                commentsSection.id = 'otherProfileCommentsSection';
                commentsSection.className = 'mt-8 pt-6 border-t border-gray-200';
                commentsSection.innerHTML = '<h3 class="text-2xl font-bold text-gray-800 mb-6">Comentarios Recientes</h3>';
                postsSection.parentNode.insertBefore(commentsSection, postsSection.nextSibling);
            }
        }

        if (!commentsSection) return;

        // Limpiar contenido actual (excepto el título)
        const title = commentsSection.querySelector('h3');
        commentsSection.innerHTML = '';
        if (title) {
            commentsSection.appendChild(title);
        }

        if (comments.length === 0) {
            commentsSection.insertAdjacentHTML('beforeend', `
                <p class="text-center text-gray-600 mt-6">Este usuario aún no ha realizado comentarios.</p>
            `);
            return;
        }

        // Renderizar cada comentario
        comments.forEach(comment => {
            const commentHTML = this.generateCommentHTML(comment);
            commentsSection.insertAdjacentHTML('beforeend', commentHTML);
        });

        // Reiniciar iconos
        if (window.loadLucideIcons) {
            loadLucideIcons();
        }
    }

    /**
     * Genera HTML para un comentario en el perfil
     * @param {Object} comment - Comentario
     * @returns {string} HTML
     */
    generateCommentHTML(comment) {
        const imageBlock = comment.imageUrl
            ? `<img src="${escapeHTML(comment.imageUrl)}" alt="Imagen en comentario" class="w-full rounded-xl shadow-lg mt-3 max-w-xs" />`
            : '';

        const timeAgo = this.getTimeAgo(new Date(comment.createdAt));
        
        // Obtener información del post para mostrar contexto
        const post = postService.getPostById(comment.postId);
        const postPreview = post ? post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '') : 'Publicación eliminada';

        return `
            <div class="bg-white rounded-2xl shadow-md overflow-hidden mb-4 border border-gray-200 hover:shadow-lg transition-shadow p-4">
                <div class="mb-3">
                    <p class="text-xs text-gray-500 font-semibold">Comentario en: <span class="text-gray-700">"${escapeHTML(postPreview)}"</span></p>
                </div>
                <p class="text-gray-800 font-medium mb-3">${escapeHTML(comment.content)}</p>
                ${imageBlock}
                <div class="text-sm text-gray-500 mt-3">${timeAgo}</div>
            </div>
        `;
    }
}

// Crear instancia y exportarla
export const otherProfileManager = new OtherProfileManager();
