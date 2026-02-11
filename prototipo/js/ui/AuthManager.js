/**
 * AuthManager - Gestor de autenticación desde la UI
 * 
 * Responsabilidades:
 * - Manejar login/logout
 * - Validar credenciales en el formulario
 * - Cambiar entre vistas de login y app
 * - Mostrar errores y feedback visual
 * - Actualizar indicador de sesión
 */

import { userService } from '../services/UserService.js';
import { navigationManager } from './NavigationManager.js';
import { messageManager } from './MessageManager.js';
import { formValidator } from '../utils/FormValidator.js';
import { buttonHelper } from '../utils/ButtonHelper.js';

class AuthManager {
    constructor() {
        this.setupLoginForm();
        this.setupLogoutButton();
        this.setupInputValidation();
        this.checkExistingSession();
    }

    /**
     * Configura el formulario de login
     */
    setupLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    /**
     * Configura validación en tiempo real de inputs
     */
    setupInputValidation() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        // Configurar validación con FormValidator
        formValidator.setupFormValidation(form, {
            tipoDoc: ['required'],
            documento: ['required', 'documento'],
            password: ['required', 'password']
        }, {
            validateOn: 'blur',
            submitButtonId: 'loginSubmitBtn'
        });
    }

    /**
     * Configura el botón de logout
     */
    setupLogoutButton() {
        const btn = document.getElementById('logoutBtn');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            await this.handleLogout();
        });
    }

    /**
     * Verifica si hay una sesión existente
     */
    checkExistingSession() {
        if (userService.isLoggedIn()) {
            // NavigationManager ahora maneja la restauración de vista
            // navigationManager.showView('app');
            this.updateSessionIndicator();
        } else {
            navigationManager.redirectToLogin();
        }
    }

    /**
     * Actualiza el indicador de sesión activa
     */
    updateSessionIndicator() {
        const user = userService.getCurrentUser();
        const sessionIndicator = document.getElementById('sessionIndicator');
        
        if (!sessionIndicator) return;

        if (user && user.isLoggedIn) {
            sessionIndicator.innerHTML = `
                <div class="bg-sena-verde-claro border-l-4 border-sena-verde p-3 rounded">
                    <p class="text-sm text-gray-700">
                        <span class="font-semibold">Sesión activa:</span> ${user.nombre}
                    </p>
                </div>
            `;
            sessionIndicator.classList.remove('hidden');
        } else {
            sessionIndicator.classList.add('hidden');
        }
    }

    /**
     * Maneja el login del usuario
     */
    async handleLogin() {
        const tipoDoc = document.getElementById('tipoDoc')?.value;
        const documento = document.getElementById('documento')?.value;
        const password = document.getElementById('password')?.value;

        if (!tipoDoc || !documento || !password) {
            messageManager.error('Por favor completa todos los campos para continuar.');
            return;
        }

        const submitBtn = document.querySelector('#loginForm button[type="submit"]') || document.getElementById('loginSubmitBtn');
        if (!submitBtn) return;

        // Mostrar estado global de carga
        const loadingBanner = messageManager.showLoading('Validando credenciales...');

        try {
            // Usar buttonHelper para manejar estado del botón
            await buttonHelper.withLoading(submitBtn, async () => {
                const result = await userService.login(tipoDoc, documento, password);

                if (!result.success) {
                    loadingBanner.dismiss();
                    messageManager.error(result.error);
                    throw new Error(result.error);
                }

                // Éxito - actualizar banner
                loadingBanner.update('Acceso confirmado. Bienvenido(a) a la Red Social SENA.', 'success');

                // Limpiar formulario
                document.getElementById('loginForm')?.reset();

                // Actualizar indicador de sesión
                this.updateSessionIndicator();

                // Esperar antes de cambiar vista
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Cambiar a vista de app
                navigationManager.showView('app');

                // Cerrar banner
                loadingBanner.dismiss();
            }, {
                loadingText: 'Validando...'
            });

        } catch (error) {
            loadingBanner.dismiss();
            if (error.message !== 'Credenciales inválidas' && error.message !== 'Usuario no encontrado') {
                messageManager.error('No fue posible iniciar sesión. Intenta de nuevo.');
            }
        }
    }

    /**
     * Maneja el logout del usuario
     */
    async handleLogout() {
        try {
            messageManager.confirm(
                'Cerrar sesión',
                '¿Estás seguro que deseas cerrar sesión?',
                async () => {
                    await userService.logout();

                    // Limpiar indicador de sesión
                    const sessionIndicator = document.getElementById('sessionIndicator');
                    if (sessionIndicator) {
                        sessionIndicator.classList.add('hidden');
                    }

                    // Limpiar formulario
                    document.getElementById('loginForm')?.reset();

                    // Limpiar estado de navegación
                    navigationManager.clearSavedView();

                    messageManager.success('Sesión cerrada correctamente');

                    // Esperar antes de cambiar vista
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Redirigir a login
                    navigationManager.redirectToLogin();
                }
            );
        } catch (error) {
            messageManager.error('No fue posible cerrar sesión. Intenta de nuevo.');
        }
    }
}

export const authManager = new AuthManager();
