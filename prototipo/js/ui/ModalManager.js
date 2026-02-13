/**
 * ModalManager - Gestor centralizado de modales y panels flotantes
 * 
 * Responsabilidades:
 * - Abrir/cerrar modales
 * - Gestionar el quick-post inline panel
 * - Manejar confirmaciones de eliminación
 */

import { messageManager } from './MessageManager.js';

class ModalManager {
    constructor() {
        this.modals = {
            createPost: document.getElementById('createPostModal'),
            quickPostInline: document.getElementById('quickPostInline')
        };

        this.setupCreatePostModal();
        this.setupQuickPostPanel();
    }

    getQuickPostPanel() {
        if (!this.modals.quickPostInline) {
            this.modals.quickPostInline = document.getElementById('quickPostInline');
        }
        return this.modals.quickPostInline;
    }

    /**
     * Configura los handlers de la modal de crear publicación
     */
    setupCreatePostModal() {
        const modal = this.modals.createPost;
        if (!modal) return;

        const closeBtn = document.getElementById('closePostModalBtn');
        const cancelBtn = document.getElementById('cancelPostBtn');
        const form = document.getElementById('newPostForm');

        const closeModal = () => {
            modal.classList.add('hidden');
            form?.reset();
            const fileName = document.getElementById('imageFileName');
            if (fileName) fileName.textContent = 'Ningún archivo seleccionado';
            if (window.loadLucideIcons) loadLucideIcons();
        };

        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);

        // Manejar cambio de archivo
        const fileInput = document.getElementById('postImageUpload');
        const fileNameSpan = document.getElementById('imageFileName');
        fileInput?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                fileNameSpan.textContent = e.target.files[0].name;
            } else {
                fileNameSpan.textContent = 'Ningún archivo seleccionado';
            }
        });
    }

    /**
     * Configura el panel rápido de creación de posts
     */
    setupQuickPostPanel() {
        const panel = this.modals.quickPostInline;
        if (!panel) return;

        // El panel se abre/cierra desde el botón de crear publicación
        // (ver los métodos openQuickPost y closeQuickPost)
    }

    /**
     * Abre la modal de crear publicación
     */
    openCreatePostModal() {
        const modal = this.modals.createPost;
        if (modal) {
            modal.classList.remove('hidden');
            if (window.loadLucideIcons) loadLucideIcons();
        }
    }

    /**
     * Cierra la modal de crear publicación
     */
    closeCreatePostModal() {
        const modal = this.modals.createPost;
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Abre el panel rápido de crear post
     */
    openQuickPostPanel() {
        const panel = this.getQuickPostPanel();
        if (panel) {
            panel.classList.remove('collapsed');
            panel.classList.add('expanded');
            
            // Enfocar el textarea después de la transición
            setTimeout(() => {
                const textarea = document.getElementById('quickPostContent');
                textarea?.focus();
            }, 180);
        }
    }

    /**
     * Cierra el panel rápido de crear post
     */
    closeQuickPostPanel() {
        const panel = this.getQuickPostPanel();
        if (panel) {
            panel.classList.remove('expanded');
            panel.classList.add('collapsed');
        }
    }

    /**
     * Alterna el panel rápido (abre si está cerrado, cierra si está abierto)
     */
    toggleQuickPostPanel() {
        const panel = this.getQuickPostPanel();
        if (!panel) return;

        if (panel.classList.contains('expanded')) {
            this.closeQuickPostPanel();
        } else {
            this.openQuickPostPanel();
        }
    }

    /**
     * Muestra una confirmación de eliminación
     * @param {string} message - Mensaje a mostrar
     * @returns {Promise<boolean>} true si el usuario confirma
     */
    async showDeleteConfirmation(message = '¿Estás seguro de que quieres eliminar esto?') {
        return confirm(message);
    }

    /**
     * Muestra una alerta de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        messageManager.error(message);
    }

    /**
     * Muestra una alerta de éxito
     * @param {string} message - Mensaje de éxito
     */
    showSuccess(message) {
        messageManager.success(message);
    }
}

export const modalManager = new ModalManager();
