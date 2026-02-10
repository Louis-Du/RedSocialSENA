/**
 * PostManager - Gestor de creación y edición de posts desde la UI
 * 
 * Responsabilidades:
 * - Manejar formularios de creación de posts
 * - Validar entradas del usuario
 * - Llamar a PostService
 * - Actualizar UI con resultados
 */

import { postService } from '../services/PostService.js';
import { modalManager } from './ModalManager.js';
import { feedRenderer } from './FeedRenderer.js';

class PostManager {
    constructor() {
        this.setupCreatePostModal();
        this.setupQuickPostForm();
        this.setupCreateButton();
    }

    /**
     * Configura la modal de crear publicación
     */
    setupCreatePostModal() {
        const form = document.getElementById('newPostForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreatePost('modal');
        });
    }

    /**
     * Configura el formulario rápido inline
     */
    setupQuickPostForm() {
        const form = document.getElementById('quickPostForm');
        if (!form) return;

        const publishBtn = document.getElementById('quickPublishBtn');
        publishBtn?.addEventListener('click', async () => {
            await this.handleCreatePost('quick');
        });
    }

    /**
     * Configura el botón principal de crear publicación
     */
    setupCreateButton() {
        const btn = document.getElementById('createPostBtn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const quickPanel = document.getElementById('quickPostInline');
            
            if (quickPanel) {
                modalManager.toggleQuickPostPanel();
            } else {
                modalManager.openCreatePostModal();
            }
        });
    }

    /**
     * Maneja la creación de un post
     * @param {string} source - 'modal' o 'quick'
     */
    async handleCreatePost(source) {
        try {
            let content, imageFile;

            if (source === 'modal') {
                content = document.getElementById('postContent')?.value || '';
                imageFile = document.getElementById('postImageUpload')?.files[0] || null;
            } else if (source === 'quick') {
                content = document.getElementById('quickPostContent')?.value || '';
                imageFile = document.getElementById('quickPostImage')?.files[0] || null;
            }

            const result = await postService.createPost(content, imageFile);

            if (!result.success) {
                modalManager.showError(result.error);
                return;
            }

            // Renderizar el nuevo post
            feedRenderer.renderPost(result.post, 'top');

            // Limpiar formulario y cerrar modal
            if (source === 'modal') {
                const form = document.getElementById('newPostForm');
                form?.reset();
                const fileName = document.getElementById('imageFileName');
                if (fileName) fileName.textContent = 'Ningún archivo seleccionado';
                modalManager.closeCreatePostModal();
            } else if (source === 'quick') {
                const form = document.getElementById('quickPostForm');
                form?.reset();
                const fileName = document.getElementById('quickImageFileName');
                if (fileName) fileName.textContent = 'Ningún archivo seleccionado';
                modalManager.closeQuickPostPanel();
            }

            modalManager.showSuccess(result.message);

        } catch (error) {
            modalManager.showError('Error al crear publicación: ' + error.message);
        }
    }

    /**
     * Maneja la edición de un post (para futuro)
     * @param {string} postId - ID del post
     */
    async handleEditPost(postId) {
        // TODO: Implementar edición de posts
        console.warn('Edición de posts no implementada aún');
    }
}

export const postManager = new PostManager();
