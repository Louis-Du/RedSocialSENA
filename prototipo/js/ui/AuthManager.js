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
        const tipoDoc = document.getElementById('tipoDoc');
        const documento = document.getElementById('documento');
        const password = document.getElementById('password');
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');

        if (!tipoDoc || !documento || !password || !submitBtn) return;

        const validateForm = () => {
            const isValid = tipoDoc.value && documento.value && password.value;
            submitBtn.disabled = !isValid;
            submitBtn.classList.toggle('opacity-50', !isValid);
            submitBtn.classList.toggle('cursor-not-allowed', !isValid);
        };

        tipoDoc.addEventListener('change', validateForm);
        documento.addEventListener('input', validateForm);
        password.addEventListener('input', validateForm);

        // Validación inicial
        validateForm();
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
            navigationManager.showView('app');
            this.updateSessionIndicator();
        } else {
            navigationManager.showView('login');
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
        try {
            const tipoDoc = document.getElementById('tipoDoc')?.value;
            const documento = document.getElementById('documento')?.value;
            const password = document.getElementById('password')?.value;

            if (!tipoDoc || !documento || !password) {
                messageManager.error('Por favor completa todos los campos para continuar.');
                return;
            }

            // Deshabilitar botón durante el login
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Validando...';
            }

            const result = await userService.login(tipoDoc, documento, password);

            if (!result.success) {
                messageManager.error(result.error);
                // Re-habilitar botón
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Ingresar';
                }
                return;
            }

            // Éxito
            messageManager.success('Acceso confirmado. Bienvenido(a) a la Red Social SENA.');

            // Limpiar formulario
            document.getElementById('loginForm')?.reset();

            // Actualizar indicador de sesión
            this.updateSessionIndicator();

            // Esperar un poco para que se vea el mensaje de éxito
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Cambiar a vista de app
            navigationManager.showView('app');

            // Re-habilitar botón
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Ingresar';
            }

        } catch (error) {
            messageManager.error('No fue posible iniciar sesión. Intenta de nuevo.');
            
            // Re-habilitar botón
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Ingresar';
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

                    messageManager.success('Sesión cerrada correctamente');

                    // Esperar antes de cambiar vista
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Cambiar a vista de login
                    navigationManager.showView('login');
                }
            );
        } catch (error) {
            messageManager.error('No fue posible cerrar sesión. Intenta de nuevo.');
        }
    }
}

export const authManager = new AuthManager();
