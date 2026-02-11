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
            console.log('[OtherProfileManager] Event otherProfileShown received:', e.detail);
            const params = e.detail?.params || {};
            console.log('[OtherProfileManager] Extracted params:', params);
            console.log('[OtherProfileManager] userId from params:', params.userId);
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
        console.log('[OtherProfileManager] loadUserProfile called with userId:', userId);
        
        if (!userId) {
            console.error('[OtherProfileManager] No userId provided');
            messageManager.error('No se especificó usuario');
            navigationManager.showView('app');
            return;
        }
        
        const currentUser = userService.getCurrentUser();
        
        // Si es el perfil propio, redirigir a editProfile
        if (userId === currentUser.id) {
            console.log('[OtherProfileManager] Es perfil propio, redirigiendo a editProfile');
            navigationManager.showView('editProfile');
            return;
        }
        
        // Obtener usuario
        const user = userService.getUserById(userId);
        
        if (!user) {
            console.error('[OtherProfileManager] Usuario no encontrado:', userId);
            messageManager.error('Usuario no encontrado');
            navigationManager.showView('app');
            return;
        }
        
        console.log('[OtherProfileManager] Usuario encontrado:', user.nombre);
        
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
            console.error('[OtherProfileManager] Vista otherProfileView no encontrada');
            return;
        }
        
        // Actualizar nombre
        const nameElement = profileView.querySelector('h2');
        if (nameElement) {
            nameElement.textContent = escapeHTML(user.nombre || 'Usuario');
            console.log('[OtherProfileManager] Nombre actualizado:', user.nombre);
        }
        
        // Actualizar descripción (programa)
        const descElements = profileView.querySelectorAll('p');
        if (descElements[0]) {
            descElements[0].textContent = `Aprendiz - ${escapeHTML(user.programa || 'Sin programa')}`;
        }
        
        // Actualizar trimestre
        if (descElements[1]) {
            descElements[1].textContent = escapeHTML(user.trimestre || 'Sin trimestre');
        }
        
        // Actualizar biografía
        const bioElement = profileView.querySelector('.text-gray-700.leading-relaxed');
        if (bioElement) {
            bioElement.textContent = escapeHTML(user.bio || 'Sin biografía');
            console.log('[OtherProfileManager] Biografía actualizada');
        }
        
        // Actualizar programa en la sección de detalles
        const programElement = profileView.querySelector('.grid .font-semibold');
        if (programElement) {
            programElement.textContent = escapeHTML(user.programa || 'Sin programa');
        }
        
        // Actualizar trimestre en la sección de detalles
        const trimestreElements = profileView.querySelectorAll('.grid .font-semibold');
        if (trimestreElements[1]) {
            trimestreElements[1].textContent = escapeHTML(user.trimestre || 'Sin trimestre');
        }
        
        // Ocultar botón "Editar Perfil" (no es su perfil)
        const editButton = profileView.querySelector('button:has(i[data-lucide="edit"])');
        if (editButton) {
            editButton.style.display = 'none';
        }
    }
    
    /**
     * Carga las publicaciones del usuario
     * @param {string} userId - ID del usuario
     */
    async loadUserPosts(userId) {
        const posts = await postService.getUserPosts(userId);
        console.log(`[OtherProfileManager] Usuario ${userId} tiene ${posts.length} publicaciones`);
        
        // TODO: Renderizar publicaciones en la vista de perfil
        // Por ahora solo logueamos
    }
}

// Crear instancia y exportarla
export const otherProfileManager = new OtherProfileManager();
