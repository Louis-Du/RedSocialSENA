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

        // Listener para botón de enviar mensaje
        document.getElementById('sendMessageToUserBtn')?.addEventListener('click', () => {
            if (this.currentViewedUserId) {
                // TODO: Implementar navegación a chat con este usuario
                messageManager.info('Función de mensajería próximamente disponible');
            }
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
        
        // 1. Actualizar nombre principal (h2)
        const nameElement = profileView.querySelector('h2');
        if (nameElement) {
            nameElement.textContent = escapeHTML(user.nombre || 'Usuario');
        }

        // 2. Actualizar apodo/username (@username)
        const apokoElement = profileView.querySelector('h2 + p');
        if (apokoElement) {
            apokoElement.textContent = `@${escapeHTML(user.apodo || user.nombre || 'usuario')}`;
        }

        // 3. Actualizar ubicación (si hay campo)
        const locationElement = profileView.querySelector('.flex.items-center.gap-2:has(i[data-lucide="map-pin"])');
        if (locationElement && user.ciudad) {
            locationElement.innerHTML = `
                <i data-lucide="map-pin" class="w-5 h-5 text-sena-verde"></i>
                <span class="text-gray-700">${escapeHTML(user.ciudad || 'Sin ubicación')}</span>
            `;
        }
        
        // 4. Actualizar biografía
        const bioElement = profileView.querySelector('.text-gray-700.leading-relaxed');
        if (bioElement) {
            bioElement.textContent = escapeHTML(user.bio || 'Este usuario no ha agregado una biografía.');
        }
        
        // 5. Actualizar Programa
        const programaField = profileView.querySelector('#programaField');
        if (programaField) {
            programaField.textContent = escapeHTML(user.programa || 'Sin programa especificado');
        }

        // 6. Actualizar Trimestre/Etapa
        const trimestreField = profileView.querySelector('#trimestreField');
        if (trimestreField) {
            trimestreField.textContent = escapeHTML(`${user.trimestre || 'Sin trimestre'} - ${user.etapa || 'Etapa Lectiva'}`);
        }

        // 7. Actualizar Regional
        const regionalField = profileView.querySelector('#regionalField');
        if (regionalField) {
            regionalField.textContent = escapeHTML(user.regional || 'Sin regional asignada');
        }

        // 8. Actualizar Centro
        const centroField = profileView.querySelector('#centroField');
        if (centroField) {
            centroField.textContent = escapeHTML(user.centro || 'Sin centro asignado');
        }

        // 9. Actualizar Modalidad
        const modalidadField = profileView.querySelector('#modalidadField');
        if (modalidadField) {
            modalidadField.textContent = escapeHTML(user.modalidad || 'Sin información de modalidad');
        }

        // 10. Actualizar Documento
        const documentoField = profileView.querySelector('#documentoField');
        if (documentoField) {
            const docText = user.tipoDoc && user.documento 
                ? `${user.tipoDoc} ${user.documento}`
                : escapeHTML(user.documento || 'No disponible');
            documentoField.textContent = docText;
        }

        // 11. Verificar si es el perfil del usuario actual
        const currentUser = userService.getCurrentUser();
        const isOwnProfile = user.id === currentUser.id;

        // 12. Mostrar/ocultar botón según si es perfil propio o ajeno
        const sendMessageBtn = document.getElementById('sendMessageToUserBtn');
        if (sendMessageBtn) {
            if (isOwnProfile) {
                // Si es perfil propio, cambiar a "Editar Perfil"
                sendMessageBtn.innerHTML = '<i data-lucide="edit-3" class="w-5 h-5"></i><span>Editar Perfil</span>';
                sendMessageBtn.style.display = 'flex';
                
                // Cambiar el listener del botón
                const newBtn = sendMessageBtn.cloneNode(true);
                sendMessageBtn.parentNode.replaceChild(newBtn, sendMessageBtn);
                newBtn.addEventListener('click', () => {
                    navigationManager.showView('editProfile');
                });
            } else {
                // Si es perfil ajeno, mostrar "Enviar Mensaje"
                sendMessageBtn.innerHTML = '<i data-lucide="message-circle" class="w-5 h-5"></i><span>Enviar Mensaje</span>';
                sendMessageBtn.style.display = 'flex';
            }
        }

        // 13. Reiniciar iconos de Lucide
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
}

// Crear instancia y exportarla
export const otherProfileManager = new OtherProfileManager();
