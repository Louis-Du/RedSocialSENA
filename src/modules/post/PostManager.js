/**
 * PostManager - Gestor de creación y edición de posts desde la UI
 * 
 * Responsabilidades:
 * - Manejar formularios de creación de posts
 * - Validar entradas del usuario
 * - Llamar a PostService
 * - Actualizar UI con resultados
 */

import { postService } from './postService.js';
import { modalManager } from './ModalManager.js';
import { messageManager } from '../common/MessageManager.js';
import { formValidator } from '../utils/FormValidator.js';
import { buttonHelper } from '../utils/ButtonHelper.js';

class PostManager {
    constructor() {
        this.setupCreatePostModal();
        this.setupQuickPostForm();
        this.setupCreateButton();
        this.setupValidation();
    }

    /**
     * Configura validación de formularios de publicaciones
     */
    setupValidation() {
        // Modal de crear publicación
        const modalForm = document.getElementById('newPostForm');
        if (modalForm) {
            formValidator.setupFormValidation(modalForm, {
                postContent: ['required', ['minLength', 1], ['maxLength', 500]]
            }, {
                validateOn: 'blur'
            });
        }

        // Formulario rápido
        const quickForm = document.getElementById('quickPostForm');
        if (quickForm) {
            const quickContent = document.getElementById('quickPostContent');
            if (quickContent) {
                formValidator.setupRealTimeValidation(quickContent, [
                    'required',
                    ['minLength', 1],
                    ['maxLength', 500]
                ], {
                    validateOn: 'input'
                });
            }
        }
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
        let content, imageFile, button;

        if (source === 'modal') {
            content = document.getElementById('postContent')?.value || '';
            imageFile = document.getElementById('postImageUpload')?.files[0] || null;
            button = document.querySelector('#newPostForm button[type="submit"]');
        } else if (source === 'quick') {
            content = document.getElementById('quickPostContent')?.value || '';
            imageFile = document.getElementById('quickPostImage')?.files[0] || null;
            button = document.getElementById('quickPublishBtn');
        }

        if (!button) return;

        const loadingBanner = messageManager.showLoading('Creando publicación...');

        try {
            await buttonHelper.withLoading(button, async () => {
                const result = await postService.createPost(content, imageFile);

                if (!result.success) {
                    loadingBanner.dismiss();
                    modalManager.showError(result.error);
                    throw new Error(result.error);
                }

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

                loadingBanner.update('Publicación creada exitosamente', 'success');
                setTimeout(() => loadingBanner.dismiss(), 2000);

                modalManager.showSuccess(result.message);
            }, {
                loadingText: 'Publicando...',
                successText: '✓ Publicado'
            });

        } catch (error) {
            loadingBanner.dismiss();
            if (error.message !== 'El contenido es obligatorio' && 
                error.message !== 'El contenido no puede exceder los 500 caracteres') {
                modalManager.showError('No fue posible crear la publicación: ' + error.message);
            }
        }
    }

    /**
     * Maneja la edición de un post (para futuro)
     * @param {string} postId - ID del post
     */
    async handleEditPost(postId) {
        messageManager.info('La edición de publicaciones se habilitara en la siguiente fase.');
    }
}

export const postManager = new PostManager();
