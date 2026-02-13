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
            const params = e.detail?.params || {};
            this.loadProfile(params.userId);
        });
    }

    /**
     * Carga el perfil de un usuario
     * @param {string} userId - ID del usuario (null para perfil propio)
     */
    loadProfile(userId = null) {
        const currentUser = userService.getCurrentUser();
        
        // Determinar si es perfil propio o de otro usuario
        this.isOwnProfile = !userId || userId === currentUser.id;
        this.viewedUserId = this.isOwnProfile ? currentUser.id : userId;
        
        // Obtener datos del usuario a mostrar
        const viewedUser = this.isOwnProfile 
            ? currentUser 
            : userService.getUserById(userId);
        
        if (!viewedUser) {
            messageManager.error('Usuario no encontrado');
            navigationManager.showView('app');
            return;
        }
        
        // Cargar datos en el formulario
        this.loadProfileData(viewedUser);
        
        // Mostrar/ocultar controles de edición
        this.updateEditControls();
        
        // Cargar publicaciones del usuario
        this.loadUserPosts(this.viewedUserId);
    }

    /**
     * Configura los listeners para el formulario
     */
    setupEventListeners() {
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
     * Carga los datos del usuario en los campos del formulario
     * @param {Object} user - Usuario a mostrar
     */
    loadProfileData(user) {
        if (!user) {
            return;
        }
        
        // === INFORMACIÓN GENERAL ===
        const content1 = document.querySelector('#content1');
        if (content1) {
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
        const content2 = document.querySelector('#content2');
        if (content2) {
            const inputs = content2.querySelectorAll('input');
            
            // Email (solo lectura)
            if (inputs[0]) {
                inputs[0].value = user.email
                    ? user.email
                    : user.documento
                        ? `${user.documento}@soy.sena.edu.co`
                        : 'correo@soy.sena.edu.co';
                inputs[0].setAttribute('readonly', 'readonly');
            }

            // Teléfono
            if (inputs[1]) {
                inputs[1].value = user.telefono || '+57 300 0000000';
                inputs[1].setAttribute('data-field', 'telefono');
                inputs[1].readOnly = !this.isOwnProfile;
            }
        }
    }

    /**
     * Carga información de formación
     * @param {Object} user - Usuario
     */
    loadEducationInfo(user) {
        const content3 = document.querySelector('#content3');
        if (content3) {
            const inputs = content3.querySelectorAll('input');
            const selects = content3.querySelectorAll('select');
            
            // Programa (solo lectura) - input[0]
            if (inputs[0]) {
                inputs[0].value = user.programa || 'Programa no definido';
                inputs[0].setAttribute('readonly', 'readonly');
            }

            // Trimestre (solo lectura) - input[1]
            if (inputs[1]) {
                inputs[1].value = user.trimestre || 'Sin trimestre definido';
                inputs[1].setAttribute('readonly', 'readonly');
            }

            // Regional (solo lectura) - input[2]
            if (inputs[2]) {
                inputs[2].value = user.regional || 'Regional no definida';
                inputs[2].setAttribute('readonly', 'readonly');
            }

            // Centro (solo lectura) - input[3]
            if (inputs[3]) {
                inputs[3].value = user.centro || 'Centro no definido';
                inputs[3].setAttribute('readonly', 'readonly');
            }

            // Etapa - select[0]
            if (selects[0]) {
                selects[0].value = user.etapa || 'Lectiva';
                selects[0].setAttribute('data-field', 'etapa');
                selects[0].disabled = true; // Siempre deshabilitado para el usuario
            }

            // Modalidad - select[1]
            if (selects[1]) {
                selects[1].value = user.modalidad || 'Presencial';
                selects[1].setAttribute('data-field', 'modalidad');
                selects[1].disabled = true; // Siempre deshabilitado para el usuario
            }
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
