/**
 * ProfileManager - Gestor del formulario de editar perfil
 * 
 * Responsabilidades:
 * - Cargar datos del usuario actual en los campos del formulario
 * - Permitir edición de información personal
 * - Guardar cambios en AppState
 * - Sincronizar vista con los datos del usuario logueado
 */

import { appState } from '../AppState.js';
import { messageManager } from './MessageManager.js';

class ProfileManager {
    constructor() {
        this.currentEditingData = {};
        this.setupEventListeners();
        
        // Escuchar cuando se muestre la vista de editar perfil
        window.addEventListener('editProfileShown', () => {
            this.loadProfileData();
        });
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
     * Carga los datos del usuario actual en los campos del formulario
     */
    loadProfileData() {
        const currentUser = appState.getCurrentUser();
        
        // === INFORMACIÓN GENERAL ===
        const content1 = document.querySelector('#content1');
        if (content1) {
            const inputs = content1.querySelectorAll('input');
            const textarea = content1.querySelector('textarea');
            
            // Primer input: nombre
            if (inputs[0]) {
                inputs[0].value = currentUser.nombre || 'Aprendiz Sin Nombre';
                inputs[0].setAttribute('data-field', 'nombre');
            }

            // Segundo input: apodo/usuario
            if (inputs[1]) {
                inputs[1].value = currentUser.apodo || 'usuario_' + currentUser.id;
                inputs[1].setAttribute('data-field', 'apodo');
            }

            // Textarea: bio
            if (textarea) {
                textarea.value = currentUser.bio || 'Sin biografía';
                textarea.setAttribute('data-field', 'bio');
            }
        }

        // === CONTACTO ===
        this.loadContactInfo(currentUser);

        // === FORMACIÓN ===
        this.loadEducationInfo(currentUser);

    }

    /**
     * Carga información de contacto
     */
    loadContactInfo(currentUser) {
        const content2 = document.querySelector('#content2');
        if (content2) {
            const inputs = content2.querySelectorAll('input');
            
            // Email (solo lectura)
            if (inputs[0]) {
                inputs[0].value = currentUser.email
                    ? currentUser.email
                    : currentUser.documento
                        ? `${currentUser.documento}@soy.sena.edu.co`
                        : 'correo@soy.sena.edu.co';
                inputs[0].setAttribute('readonly', 'readonly');
            }

            // Teléfono
            if (inputs[1]) {
                inputs[1].value = currentUser.telefono || '+57 300 0000000';
                inputs[1].setAttribute('data-field', 'telefono');
            }
        }
    }

    /**
     * Carga información de formación
     */
    loadEducationInfo(currentUser) {
        const content3 = document.querySelector('#content3');
        if (content3) {
            const inputs = content3.querySelectorAll('input');
            const select = content3.querySelector('select');
            
            // Programa (solo lectura)
            if (inputs[0]) {
                inputs[0].value = currentUser.programa || 'Programa no definido';
                inputs[0].setAttribute('readonly', 'readonly');
            }

            // Etapa/Trimestre
            if (select) {
                const trimestres = ['Lectiva', 'Productiva', 'Egresado'];
                const currentTrimestre = currentUser.trimestre?.includes('Productiva') ? 'Productiva' 
                                        : currentUser.trimestre?.includes('Egresado') ? 'Egresado' 
                                        : 'Lectiva';
                
                select.value = currentTrimestre;
                select.setAttribute('data-field', 'etapa');
            }
        }
    }

    /**
     * Guarda la información general del perfil
     */
    saveGeneralInfo() {
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
