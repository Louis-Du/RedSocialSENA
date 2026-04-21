/**
 * RegisterManager - Gestor de registro de usuarios
 * 
 * Responsabilidades:
 * - Manejar el formulario de registro
 * - Validar datos del formulario
 * - Mostrar errores y feedback visual
 * - Cambiar entre vistas de registro y login
 * - Crear nuevos usuarios
 */

import { userService } from './userService.js';
import { navigationManager } from './NavigationManager.js';
import { messageManager } from './MessageManager.js';
import { formValidator } from '../utils/FormValidator.js';
import { buttonHelper } from '../utils/ButtonHelper.js';

class RegisterManager {
    constructor() {
        this.setupRegisterForm();
        this.setupNavigationButtons();
        this.setupInputValidation();
    }

    /**
     * Configura el formulario de registro
     */
    setupRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });
    }

    /**
     * Configura botones de navegación
     */
    setupNavigationButtons() {
        // Botón "Regístrate aquí" en login
        const goToRegisterBtn = document.getElementById('goToRegisterBtn');
        if (goToRegisterBtn) {
            goToRegisterBtn.addEventListener('click', () => {
                this.showRegisterView();
            });
        }

        // Botón "Cancelar" en registro
        const backToLoginBtn = document.getElementById('backToLoginBtn');
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', () => {
                this.showLoginView();
            });
        }

        // Botón "Inicia sesión" alternativo
        const backToLoginBtn2 = document.getElementById('backToLoginBtn2');
        if (backToLoginBtn2) {
            backToLoginBtn2.addEventListener('click', () => {
                this.showLoginView();
            });
        }
    }

    /**
     * Configura validación en tiempo real de inputs
     */
    setupInputValidation() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        // Configurar validación con FormValidator
        formValidator.setupFormValidation(form, {
            registerTipoDoc: ['required'],
            registerDocumento: ['required', 'documento'],
            registerNombre: ['required'],
            registerEmail: ['required', 'email'],
            registerRol: ['required'],
            registerPrograma: ['required'],
            registerCiudad: ['required'],
            registerPassword: ['required', 'password'],
            registerPasswordConfirm: ['required', 'password']
        }, {
            validateOn: 'blur',
            submitButtonId: 'registerSubmitBtn'
        });

        // Validar que las contraseñas coincidan
        const passwordInput = document.getElementById('registerPassword');
        const passwordConfirmInput = document.getElementById('registerPasswordConfirm');

        if (passwordConfirmInput) {
            passwordConfirmInput.addEventListener('blur', () => {
                this.validatePasswordMatch();
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                if (passwordConfirmInput.value) {
                    this.validatePasswordMatch();
                }
            });
        }
    }

    /**
     * Valida que las contraseñas coincidan
     */
    validatePasswordMatch() {
        const password = document.getElementById('registerPassword')?.value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value;
        const confirmInput = document.getElementById('registerPasswordConfirm');

        if (!password || !passwordConfirm || !confirmInput) return true;

        if (password !== passwordConfirm) {
            confirmInput.classList.add('border-red-500');
            confirmInput.classList.remove('border-gray-300');
            
            // Mostrar mensaje de error
            let errorMsg = confirmInput.nextElementSibling;
            if (!errorMsg || !errorMsg.classList.contains('error-message')) {
                errorMsg = document.createElement('p');
                errorMsg.className = 'error-message text-red-500 text-xs mt-1';
                confirmInput.parentNode.insertBefore(errorMsg, confirmInput.nextSibling);
            }
            errorMsg.textContent = 'Las contraseñas no coinciden';
            return false;
        } else {
            confirmInput.classList.remove('border-red-500');
            confirmInput.classList.add('border-gray-300');
            
            // Remover mensaje de error
            const errorMsg = confirmInput.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.remove();
            }
            return true;
        }
    }

    /**
     * Muestra la vista de registro
     */
    showRegisterView() {
        const loginView = document.getElementById('loginView');
        const registerView = document.getElementById('registerView');

        if (loginView) loginView.classList.add('hidden');
        if (registerView) registerView.classList.remove('hidden');

        // Limpiar formulario
        const form = document.getElementById('registerForm');
        if (form) form.reset();

        // Cargar iconos de Lucide
        if (window.loadLucideIcons) {
            window.loadLucideIcons();
        }
    }

    /**
     * Muestra la vista de login
     */
    showLoginView() {
        const loginView = document.getElementById('loginView');
        const registerView = document.getElementById('registerView');

        if (registerView) registerView.classList.add('hidden');
        if (loginView) loginView.classList.remove('hidden');

        // Limpiar formulario de registro
        const form = document.getElementById('registerForm');
        if (form) form.reset();

        // Cargar iconos de Lucide
        if (window.loadLucideIcons) {
            window.loadLucideIcons();
        }
    }

    /**
     * Maneja el registro del usuario
     */
    async handleRegister() {
        // Validar que las contraseñas coincidan
        if (!this.validatePasswordMatch()) {
            messageManager.error('Las contraseñas no coinciden');
            return;
        }

        const tipoDoc = document.getElementById('registerTipoDoc')?.value;
        const documento = document.getElementById('registerDocumento')?.value;
        const nombre = document.getElementById('registerNombre')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const rol = document.getElementById('registerRol')?.value;
        const programa = document.getElementById('registerPrograma')?.value;
        const ciudad = document.getElementById('registerCiudad')?.value;
        const password = document.getElementById('registerPassword')?.value;

        // Validar campos requeridos
        if (!tipoDoc || !documento || !nombre || !email || !rol || !programa || !ciudad || !password) {
            messageManager.error('Por favor completa todos los campos obligatorios.');
            return;
        }

        const submitBtn = document.getElementById('registerSubmitBtn');
        if (!submitBtn) return;

        // Mostrar estado de carga
        const loadingBanner = messageManager.showLoading('Creando tu cuenta...');

        try {
            // Usar buttonHelper para manejar estado del botón
            await buttonHelper.withLoading(submitBtn, async () => {
                const result = await userService.register({
                    tipoDoc,
                    documento,
                    nombre,
                    email,
                    rol,
                    programa,
                    ciudad,
                    password
                });

                if (!result.success) {
                    loadingBanner.dismiss();
                    messageManager.error(result.error);
                    throw new Error(result.error);
                }

                // Éxito - actualizar banner
                loadingBanner.update('¡Cuenta creada exitosamente! Bienvenido(a) a la Red Social SENA.', 'success');

                // Limpiar formulario
                document.getElementById('registerForm')?.reset();

                // Esperar antes de cambiar vista
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Forzar ocultar el registro antes de mostrar la app
                document.getElementById('registerView')?.classList.add('hidden');

                // Cambiar a vista de app
                navigationManager.showView('app');

                // Cerrar banner
                loadingBanner.dismiss();
            }, {
                loadingText: 'Creando cuenta...'
            });

        } catch (error) {
            loadingBanner.dismiss();
            if (!error.message.includes('Ya existe un usuario')) {
                messageManager.error('No fue posible crear la cuenta. Intenta de nuevo.');
            }
        }
    }
}

export const registerManager = new RegisterManager();
