/**
 * ProfileManager - Gestor de perfil de usuario
 * 
 * Responsabilidades:
 * - Distinguir entre perfil propio (currentUser) y perfil de otro (viewedUser)
 * - Cargar datos del usuario correspondiente
 * - Permitir edición solo del perfil propio
 * - Mostrar publicaciones del usuario correspondiente
 * - Sincronizar vista con navegación (#profile vs #profile?userId=X)
 */

import { appState } from '../AppState.js';
import { userService } from '../services/UserService.js';
import { postService } from '../services/PostService.js';
import { messageManager } from './MessageManager.js';
import { navigationManager } from './NavigationManager.js';

class ProfileManager {
    constructor() {
        this.currentEditingData = {};
        this.viewedUserId = null; // ID del usuario siendo visualizado
        this.isOwnProfile = true; // Si es el perfil del usuario autenticado
        
        this.setupEventListeners();
        
        // Escuchar cuando se muestre la vista de editar perfil
        window.addEventListener('editProfileShown', (e) => {
            try {
                const params = e.detail?.params || {};
                
                // Validar que la vista está disponible antes de continuar
                const editProfileView = document.getElementById('editProfileView');
                if (!editProfileView || editProfileView.classList.contains('hidden')) {
                    console.warn('Edit profile view not visible yet');
                    return;
                }
                
                // Esperar un tick más para asegurar que todo está listo
                setTimeout(() => {
                    this.loadProfile(params.userId);
                }, 50);
            } catch (error) {
                console.warn('Error al mostrar perfil:', error.message);
            }
        });
    }

    /**
     * Carga el perfil de un usuario
     * @param {string} userId - ID del usuario (null para perfil propio)
     */
    loadProfile(userId = null) {
        try {
            const currentUser = userService.getCurrentUser();
            
            // Determine if it's own profile or another user's profile
            this.isOwnProfile = !userId || userId === currentUser.id;
            this.viewedUserId = this.isOwnProfile ? currentUser.id : userId;
            
            // Get user data
            const viewedUser = this.isOwnProfile 
                ? currentUser 
                : userService.getUserById(userId);
            
            if (!viewedUser) {
                messageManager.error('Usuario no encontrado');
                navigationManager.showView('app');
                return;
            }
            
            // Verify the view is visible and ready
            const editProfileView = document.getElementById('editProfileView');
            if (!editProfileView || editProfileView.classList.contains('hidden')) {
                console.warn('Edit profile view not visible, skipping loadProfile');
                return;
            }
            
            // Verify DOM elements are ready
            if (!document.querySelector('#content1')) {
                console.warn('DOM elements not ready yet, skipping loadProfile');
                return;
            }
            
            // Load data into the form
            this.loadProfileData(viewedUser);
            
            // Show/hide edit controls
            this.updateEditControls();
            
            // Load user posts
            this.loadUserPosts(this.viewedUserId);
        } catch (error) {
            console.error('Error en loadProfile:', error);
            messageManager.error('Error al cargar perfil');
        }
    }

    /**
     * Configura los listeners para el formulario
     */
    setupEventListeners() {
        // Cambiar foto de perfil
        const changePhotoBtn = document.getElementById('changeProfilePictureBtn');
        const photoInput = document.getElementById('profilePictureInput');
        
        if (changePhotoBtn && photoInput) {
            changePhotoBtn.addEventListener('click', () => {
                photoInput.click();
            });

            photoInput.addEventListener('change', async (e) => {
                await this.handleProfilePictureChange(e);
            });
        }

        // Guardar información general
        document.addEventListener('click', (e) => {
            const saveBtn = e.target.closest('#content1 button');
            if (saveBtn && saveBtn.textContent.includes('Guardar')) {
                this.saveGeneralInfo();
            }
        });

        // Guardar contraseña
        document.addEventListener('click', (e) => {
            const securityBtn = e.target.closest('#content4 button');
            if (securityBtn && securityBtn.textContent.includes('Actualizar Contraseña')) {
                this.updatePassword(e);
            }
        });
    }

    /**
     * Maneja el cambio de foto de perfil
     * @param {Event} event - Evento de cambio del input file
     */
    async handleProfilePictureChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            messageManager.error('Por favor selecciona un archivo de imagen válido');
            return;
        }

        // Validar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024; // 5MB en bytes
        if (file.size > maxSize) {
            messageManager.error('La imagen debe ser menor a 5MB');
            return;
        }

        try {
            // Leer la imagen como Data URL
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageDataUrl = e.target.result;
                
                // Actualizar preview
                const preview = document.getElementById('profilePicturePreview');
                if (preview) {
                    preview.src = imageDataUrl;
                }

                // Guardar en el perfil del usuario
                const result = await userService.updateProfile({
                    profilePicture: imageDataUrl
                });

                if (result.success) {
                    messageManager.success('Foto de perfil actualizada correctamente');
                } else {
                    messageManager.error(result.error || 'Error al actualizar la foto');
                }
            };

            reader.onerror = () => {
                messageManager.error('Error al leer la imagen');
            };

            reader.readAsDataURL(file);

        } catch (error) {
            messageManager.error('Error al procesar la imagen');
            console.error(error);
        }
    }

    /**
     * Carga los datos del usuario en los campos del formulario
     * @param {Object} user - Usuario a mostrar
     */
    loadProfileData(user) {
        if (!user) {
            return;
        }
        
        // === FOTO DE PERFIL ===
        try {
            const profilePicPreview = document.getElementById('profilePicturePreview');
            if (profilePicPreview && profilePicPreview.parentElement && user.profilePicture) {
                // Verificar que el elemento aún está en el DOM
                profilePicPreview.src = user.profilePicture;
            }
        } catch (error) {
            console.warn('No se pudo cargar foto de perfil:', error.message);
        }
        
        // === INFORMACIÓN GENERAL ===
        try {
            const content1 = document.querySelector('#content1');
            if (content1 && content1.parentElement) {
                const inputs = content1.querySelectorAll('input');
                const textarea = content1.querySelector('textarea');
                
                // Primer input: nombre
                if (inputs[0]) {
                    inputs[0].value = user.nombre || 'Aprendiz Sin Nombre';
                    inputs[0].setAttribute('data-field', 'nombre');
                    inputs[0].readOnly = !this.isOwnProfile;
                }

                // Segundo input: apodo/usuario
                if (inputs[1]) {
                    inputs[1].value = user.apodo || 'usuario_' + user.id;
                    inputs[1].setAttribute('data-field', 'apodo');
                    inputs[1].readOnly = !this.isOwnProfile;
                }

                // Textarea: bio
                if (textarea) {
                    textarea.value = user.bio || 'Sin biografía';
                    textarea.setAttribute('data-field', 'bio');
                    textarea.readOnly = !this.isOwnProfile;
                }
            }
        } catch (error) {
            console.warn('No se pudo cargar información general:', error.message);
        }

        // === CONTACTO ===
        this.loadContactInfo(user);

        // === FORMACIÓN ===
        this.loadEducationInfo(user);
    }

    /**
     * Carga información de contacto
     * @param {Object} user - Usuario
     */
    loadContactInfo(user) {
        try {
            const content2 = document.querySelector('#content2');
            
            // Validar que el elemento existe, está en el DOM y es accesible
            if (!content2) {
                console.warn('No se encontró content2 en el DOM');
                return;
            }
            
            if (!content2.parentElement || !document.body.contains(content2)) {
                console.warn('content2 no está conectado al DOM');
                return;
            }
            
            const inputs = content2.querySelectorAll('input');
            
            // Email (solo lectura)
            if (inputs.length > 0 && inputs[0]) {
                try {
                    inputs[0].value = user.email
                        ? user.email
                        : user.documento
                            ? `${user.documento}@soy.sena.edu.co`
                            : 'correo@soy.sena.edu.co';
                    inputs[0].setAttribute('readonly', 'readonly');
                } catch (e) {
                    console.warn('Error cargando email:', e.message);
                }
            }

            // Teléfono
            if (inputs.length > 1 && inputs[1]) {
                try {
                    inputs[1].value = user.telefono || '+57 300 0000000';
                    inputs[1].setAttribute('data-field', 'telefono');
                    inputs[1].readOnly = !this.isOwnProfile;
                } catch (e) {
                    console.warn('Error cargando teléfono:', e.message);
                }
            }
        } catch (error) {
            console.warn('No se pudo cargar información de contacto:', error.message);
        }
    }

    /**
     * Carga información de formación
     * @param {Object} user - Usuario
     */
    loadEducationInfo(user) {
        try {
            const content3 = document.querySelector('#content3');
            
            // Validar que el elemento existe, está en el DOM y es accesible
            if (!content3) {
                console.warn('No se encontró content3 en el DOM');
                return;
            }
            
            if (!content3.parentElement || !document.body.contains(content3)) {
                console.warn('content3 no está conectado al DOM');
                return;
            }
            
            const inputs = content3.querySelectorAll('input');
            const selects = content3.querySelectorAll('select');
            
            // Programa (solo lectura) - input[0]
            if (inputs.length > 0 && inputs[0]) {
                try {
                    inputs[0].value = user.programa || 'Programa no definido';
                    inputs[0].setAttribute('readonly', 'readonly');
                } catch (e) {
                    console.warn('Error cargando programa:', e.message);
                }
            }

            // Trimestre (solo lectura) - input[1]
            if (inputs.length > 1 && inputs[1]) {
                try {
                    inputs[1].value = user.trimestre || 'Sin trimestre definido';
                    inputs[1].setAttribute('readonly', 'readonly');
                } catch (e) {
                    console.warn('Error cargando trimestre:', e.message);
                }
            }

            // Regional (solo lectura) - input[2]
            if (inputs.length > 2 && inputs[2]) {
                try {
                    inputs[2].value = user.regional || 'Regional no definida';
                    inputs[2].setAttribute('readonly', 'readonly');
                } catch (e) {
                    console.warn('Error cargando regional:', e.message);
                }
            }

            // Centro (solo lectura) - input[3]
            if (inputs.length > 3 && inputs[3]) {
                try {
                    inputs[3].value = user.centro || 'Centro no definido';
                    inputs[3].setAttribute('readonly', 'readonly');
                } catch (e) {
                    console.warn('Error cargando centro:', e.message);
                }
            }

            // Etapa - select[0]
            if (selects.length > 0 && selects[0]) {
                try {
                    selects[0].value = user.etapa || 'Lectiva';
                    selects[0].setAttribute('data-field', 'etapa');
                    selects[0].disabled = true;
                } catch (e) {
                    console.warn('Error cargando etapa:', e.message);
                }
            }

            // Modalidad - select[1]
            if (selects.length > 1 && selects[1]) {
                try {
                    selects[1].value = user.modalidad || 'Presencial';
                    selects[1].setAttribute('data-field', 'modalidad');
                    selects[1].disabled = true;
                } catch (e) {
                    console.warn('Error cargando modalidad:', e.message);
                }
            }
        } catch (error) {
            console.warn('No se pudo cargar información de formación:', error.message);
        }
    }

    /**
     * Actualiza la visibilidad de controles de edición
     */
    updateEditControls() {
        // Botones de guardar
        const saveButtons = document.querySelectorAll('#content1 button, #content2 button, #content3 button');
        saveButtons.forEach(btn => {
            if (btn.textContent.includes('Guardar') || btn.textContent.includes('Actualizar')) {
                btn.style.display = this.isOwnProfile ? 'block' : 'none';
            }
        });

        // Sección de seguridad (solo para perfil propio)
        const securityTab = document.querySelector('#content4');
        if (securityTab) {
            securityTab.style.display = this.isOwnProfile ? 'block' : 'none';
        }

        // Actualizar título del perfil si es necesario
        const profileTitle = document.querySelector('#editProfileView h2');
        if (profileTitle && !this.isOwnProfile) {
            const viewedUser = userService.getUserById(this.viewedUserId);
            profileTitle.textContent = `Perfil de ${viewedUser?.nombre || 'Usuario'}`;
        } else if (profileTitle) {
            profileTitle.textContent = 'Editar Perfil';
        }
    }

    /**
     * Carga las publicaciones del usuario
     * @param {string} userId - ID del usuario
     */
    async loadUserPosts(userId) {
        const posts = await postService.getUserPosts(userId);
        
        // TODO: Renderizar publicaciones en una sección del perfil
    }

    /**
     * Guarda la información general del perfil
     */
    saveGeneralInfo() {
        // Solo permitir guardar si es perfil propio
        if (!this.isOwnProfile) {
            messageManager.warning('No puedes editar el perfil de otro usuario');
            return;
        }

        const content1 = document.querySelector('#content1');
        if (!content1) return;

        const inputs = content1.querySelectorAll('input');
        const textarea = content1.querySelector('textarea');

        const nombre = inputs[0]?.value || 'Aprendiz Sin Nombre';
        const apodo = inputs[1]?.value || 'usuario';
        const bio = textarea?.value || 'Sin biografía';

        // Validaciones básicas
        if (!nombre || !apodo) {
            this.showErrorMessage('Por favor completa el nombre y el usuario antes de guardar.');
            return;
        }

        // Actualizar AppState
        appState.updateCurrentUserProfile({
            nombre,
            apodo,
            bio
        });

        this.showSuccessMessage('Información general actualizada correctamente.');
    }

    /**
     * Actualiza la contraseña
     */
    updatePassword(e) {
        e.preventDefault();
        
        const form = document.querySelector('#content4 form');
        const currentPasswordInput = form.querySelector('input[type="password"]:nth-of-type(1)');
        const newPasswordInput = form.querySelector('input[type="password"]:nth-of-type(2)');
        const confirmPasswordInput = form.querySelector('input[type="password"]:nth-of-type(3)');

        const currentPassword = currentPasswordInput?.value;
        const newPassword = newPasswordInput?.value;
        const confirmPassword = confirmPasswordInput?.value;

        // Validaciones básicas
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showErrorMessage('Completa los tres campos de contraseña para continuar.');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showErrorMessage('Las contraseñas nuevas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            this.showErrorMessage('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        // En producción, aquí se enviaría a un backend
        this.showSuccessMessage('Contraseña actualizada correctamente.');

        // Limpiar campos
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
    }

    /**
     * Muestra un mensaje de éxito
     */
    showSuccessMessage(message) {
        messageManager.success(message);
    }

    /**
     * Muestra un mensaje de error
     */
    showErrorMessage(message) {
        messageManager.error(message);
    }
}

// Crear instancia y exportarla
export const profileManager = new ProfileManager();
