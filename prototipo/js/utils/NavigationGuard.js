/**
 * NavigationGuard - Middleware de navegación
 * 
 * Proporciona funciones auxiliares para:
 * - Validar permisos antes de navegar
 * - Shortcuts de teclado para navegación
 * - Historial de navegación
 * - Breadcrumbs
 */

import { userService } from '../services/UserService.js';
import { navigationManager } from '../ui/NavigationManager.js';
import { messageManager } from '../ui/MessageManager.js';

class NavigationGuard {
    constructor() {
        this.navigationHistory = [];
        this.maxHistorySize = 10;
        
        this.setupKeyboardShortcuts();
        this.setupNavigationTracking();
    }

    /**
     * Configura atajos de teclado para navegación
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Solo si está autenticado
            if (!userService.isLoggedIn()) return;

            // Ignorar si está escribiendo en un input
            if (e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' || 
                e.target.isContentEditable) {
                return;
            }

            // Atajos con Alt + tecla
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                switch(e.key.toLowerCase()) {
                    case 'h': // Alt + H = Home/Feed
                        e.preventDefault();
                        this.navigateWithGuard('app');
                        break;
                    case 'p': // Alt + P = Perfil
                        e.preventDefault();
                        this.navigateWithGuard('editProfile');
                        break;
                    case 'm': // Alt + M = Mensajes/Chat
                        e.preventDefault();
                        this.navigateWithGuard('chat');
                        break;
                    case 'backspace': // Alt + Backspace = Volver
                        e.preventDefault();
                        this.goBack();
                        break;
                }
            }

            // Escape para volver
            if (e.key === 'Escape' && navigationManager.getCurrentView() !== 'app') {
                const currentView = navigationManager.getCurrentView();
                if (currentView !== 'login') {
                    this.navigateWithGuard('app');
                }
            }
        });
    }

    /**
     * Configura el tracking de navegación
     */
    setupNavigationTracking() {
        window.addEventListener('navigationChanged', (e) => {
            const { viewName, previousView } = e.detail;
            
            // Agregar al historial
            if (previousView) {
                this.addToHistory(previousView);
            }

            // Log para debugging (opcional)
            if (window.DEBUG_NAVIGATION) {
                console.log(`📍 Navegación: ${previousView || 'inicio'} → ${viewName}`);
            }
        });
    }

    /**
     * Navega con validación de guardas
     * @param {string} viewName - Vista destino
     * @param {Object} options - Opciones adicionales
     */
    navigateWithGuard(viewName, options = {}) {
        const { showError = true } = options;

        // Verificar permisos
        if (!navigationManager.canAccessView(viewName)) {
            if (showError) {
                messageManager.warning('Debes iniciar sesión para acceder a esta sección');
            }
            navigationManager.redirectToLogin();
            return false;
        }

        // Si ya está en esa vista, no hacer nada
        if (navigationManager.getCurrentView() === viewName) {
            return true;
        }

        // Navegar
        navigationManager.showView(viewName);
        return true;
    }

    /**
     * Agrega una vista al historial
     * @param {string} viewName - Vista a agregar
     */
    addToHistory(viewName) {
        // No agregar duplicados consecutivos
        const lastInHistory = this.navigationHistory[this.navigationHistory.length - 1];
        if (lastInHistory === viewName) {
            return;
        }

        this.navigationHistory.push(viewName);

        // Limitar tamaño del historial
        if (this.navigationHistory.length > this.maxHistorySize) {
            this.navigationHistory.shift();
        }
    }

    /**
     * Vuelve a la vista anterior
     * @returns {boolean} - true si pudo volver
     */
    goBack() {
        if (this.navigationHistory.length === 0) {
            // Si no hay historial, ir al app
            this.navigateWithGuard('app');
            return true;
        }

        // Obtener última vista del historial
        const previousView = this.navigationHistory.pop();
        
        // Validar que pueda acceder
        if (navigationManager.canAccessView(previousView)) {
            navigationManager.showView(previousView);
            return true;
        }

        // Si no puede acceder a esa vista, intentar con la anterior
        return this.goBack();
    }

    /**
     * Obtiene el historial de navegación
     * @returns {Array<string>}
     */
    getHistory() {
        return [...this.navigationHistory];
    }

    /**
     * Limpia el historial de navegación
     */
    clearHistory() {
        this.navigationHistory = [];
    }

    /**
     * Verifica si puede navegar a una vista
     * @param {string} viewName - Vista a verificar
     * @returns {Object} - { canAccess: boolean, reason: string }
     */
    checkAccess(viewName) {
        // Vista pública
        if (viewName === 'login') {
            return { canAccess: true, reason: 'Vista pública' };
        }

        // Verificar sesión
        if (!userService.isLoggedIn()) {
            return { 
                canAccess: false, 
                reason: 'Sesión requerida. Por favor, inicia sesión.' 
            };
        }

        // Vista protegida con sesión activa
        return { canAccess: true, reason: 'Acceso autorizado' };
    }

    /**
     * Genera breadcrumbs para la navegación actual
     * @returns {Array<Object>} - Array de breadcrumbs
     */
    getBreadcrumbs() {
        const currentView = navigationManager.getCurrentView();
        const breadcrumbs = [];

        const viewNames = {
            'login': 'Inicio de Sesión',
            'app': 'Inicio',
            'editProfile': 'Editar Perfil',
            'chat': 'Conversaciones',
            'otherProfile': 'Perfil de Usuario'
        };

        // Siempre incluir inicio si no estamos en login
        if (currentView !== 'login') {
            breadcrumbs.push({
                name: 'Inicio',
                view: 'app',
                active: currentView === 'app'
            });
        }

        // Agregar vista actual si no es inicio ni login
        if (currentView !== 'app' && currentView !== 'login') {
            breadcrumbs.push({
                name: viewNames[currentView] || currentView,
                view: currentView,
                active: true
            });
        }

        return breadcrumbs;
    }

    /**
     * Renderiza breadcrumbs en un contenedor
     * @param {HTMLElement} container - Contenedor para los breadcrumbs
     */
    renderBreadcrumbs(container) {
        if (!container) return;

        const breadcrumbs = this.getBreadcrumbs();
        
        container.innerHTML = breadcrumbs.map((crumb, index) => `
            <span class="breadcrumb-item ${crumb.active ? 'font-semibold text-sena-verde' : 'text-gray-600'}">
                ${crumb.active ? crumb.name : `
                    <button 
                        onclick="navigationGuard.navigateWithGuard('${crumb.view}')"
                        class="hover:text-sena-verde transition-colors"
                    >
                        ${crumb.name}
                    </button>
                `}
                ${index < breadcrumbs.length - 1 ? '<span class="mx-2">/</span>' : ''}
            </span>
        `).join('');
    }
}

export const navigationGuard = new NavigationGuard();

// Hacer disponible globalmente para uso en HTML
window.navigationGuard = navigationGuard;
