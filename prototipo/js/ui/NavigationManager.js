/**
 * NavigationManager - Gestor centralizado de navegación entre vistas
 * 
 * Responsabilidades:
 * - Cambiar entre vistas principales (login, app, perfil, chat, etc.)
 * - Manejar el estado de las vistas
 * - Guardas de navegación (protección de rutas)
 * - Sistema de routing con hash (#login, #app, etc.)
 * - Persistencia de vista actual
 * - Triggers al cambiar de vista (init iconos, etc.)
 * 
 * MEJORAS FASE 4:
 * - Guardas de navegación para vistas protegidas
 * - Rutas por hash para soporte de navegación del navegador
 * - Persistencia de vista para continuidad de uso
 */

import { userService } from '../services/UserService.js';

class NavigationManager {
    constructor() {
        // Cache de elementos del DOM
        this.views = {
            login: document.getElementById('loginView'),
            app: document.getElementById('appView'),
            editProfile: document.getElementById('editProfileView'),
            chat: document.getElementById('chatView'),
            otherProfile: document.getElementById('otherProfileView')
        };

        this.currentView = null;
        
        // Vistas que requieren autenticación
        this.protectedViews = ['app', 'editProfile', 'chat', 'otherProfile'];
        
        // Mapeo de hash a vista
        this.hashToView = {
            '': 'login',
            'login': 'login',
            'app': 'app',
            'feed': 'app',
            'profile': 'editProfile',
            'editProfile': 'editProfile',
            'chat': 'chat',
            'messages': 'chat',
            'otherProfile': 'otherProfile'
        };

        // Inicializar
        this.setupListeners();
        this.setupHashRouting();
        this.restoreLastView();
    }

    /**
     * Configura el sistema de routing con hash
     */
    setupHashRouting() {
        // Escuchar cambios en el hash
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Manejar hash inicial
        this.handleHashChange();
    }

    /**
     * Maneja cambios en el hash de la URL
     */
    handleHashChange() {
        const hash = window.location.hash.slice(1); // Remover el #
        const viewName = this.hashToView[hash] || 'login';
        
        // Intentar navegar a la vista
        this.showView(viewName, { updateHash: false });
    }

    /**
     * Guarda la vista actual en localStorage
     */
    saveCurrentView() {
        if (this.currentView && this.currentView !== 'login') {
            localStorage.setItem('lastView', this.currentView);
        }
    }

    /**
     * Restaura la última vista guardada (si hay sesión activa)
     */
    restoreLastView() {
        // Solo restaurar si hay sesión activa
        if (!userService.isLoggedIn()) {
            this.showView('login');
            return;
        }

        // Intentar restaurar desde hash
        const hash = window.location.hash.slice(1);
        if (hash && this.hashToView[hash]) {
            const viewName = this.hashToView[hash];
            if (this.canAccessView(viewName)) {
                this.showView(viewName, { updateHash: false });
                return;
            }
        }

        // Intentar restaurar desde localStorage
        const lastView = localStorage.getItem('lastView');
        if (lastView && this.views[lastView] && this.canAccessView(lastView)) {
            this.showView(lastView);
        } else {
            this.showView('app');
        }
    }

    /**
     * Verifica si el usuario puede acceder a una vista (Guarda de navegación)
     * @param {string} viewName - Nombre de la vista
     * @returns {boolean} - true si puede acceder
     */
    canAccessView(viewName) {
        // Si es una vista pública, siempre permitir
        if (!this.protectedViews.includes(viewName)) {
            return true;
        }

        // Si es una vista protegida, verificar sesión
        return userService.isLoggedIn();
    }

    /**
     * Configura los listeners de navegación
     */
    setupListeners() {
        // Botones de navegación dentro del app
        const goToProfileEditBtn = document.getElementById('goToProfileEditBtn');
        const goToChatBtn = document.getElementById('goToChatBtn');
        const returnToAppBtnProfile = document.getElementById('returnToAppBtnProfile');
        const returnToAppBtnChat = document.getElementById('returnToAppBtnChat');
        const returnToAppBtnOtherProfile = document.getElementById('returnToAppBtnOtherProfile');
        const logoutBtn = document.getElementById('logoutBtn');

        goToProfileEditBtn?.addEventListener('click', () => this.showView('editProfile'));
        goToChatBtn?.addEventListener('click', () => this.showView('chat'));
        returnToAppBtnProfile?.addEventListener('click', () => this.showView('app'));
        returnToAppBtnChat?.addEventListener('click', () => this.showView('app'));
        returnToAppBtnOtherProfile?.addEventListener('click', () => this.showView('app'));
        logoutBtn?.addEventListener('click', () => this.showView('login'));

        // Navegación a perfil de otro usuario (delegado en el renderizador)
        this.setupOtherProfileNavigation();
    }

    /**
     * Configura la navegación a perfiles de otros usuarios
     */
    setupOtherProfileNavigation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.view-other-profile');
            if (link) {
                const profileElement = link.querySelector('h3') || link;
                const profileName = profileElement.textContent.trim();
                
                const nameElement = document.getElementById('otherProfileName');
                if (nameElement) {
                    nameElement.textContent = profileName;
                }

                this.showView('otherProfile');
            }
        });
    }

    /**
     * Muestra una vista específica
     * @param {string} viewName - Nombre de la vista: 'login', 'app', 'editProfile', 'chat', 'otherProfile'
     * @param {Object} options - Opciones adicionales
     * @param {boolean} options.updateHash - Si se debe actualizar el hash de la URL (default: true)
     * @param {boolean} options.force - Forzar navegación aunque no tenga permisos (default: false)
     */
    showView(viewName, options = {}) {
        const { updateHash = true, force = false } = options;

        if (!this.views[viewName]) {
            console.warn(`Vista no encontrada: ${viewName}`);
            return;
        }

        // GUARDA DE NAVEGACIÓN: Verificar permisos
        if (!force && !this.canAccessView(viewName)) {
            console.warn(`Acceso denegado a vista: ${viewName}. Sesión requerida.`);
            this.showView('login', { force: true });
            return;
        }

        // Ocultar todas las vistas
        Object.values(this.views).forEach(view => {
            if (view) view.classList.add('hidden');
        });

        // Mostrar la vista solicitada
        this.views[viewName]?.classList.remove('hidden');
        this.currentView = viewName;

        // ACTUALIZAR HASH (si está habilitado)
        if (updateHash) {
            const hash = this.getHashForView(viewName);
            if (window.location.hash !== `#${hash}`) {
                window.location.hash = hash;
            }
        }

        // PERSISTENCIA: Guardar vista actual
        this.saveCurrentView();

        // Reinicializar iconos (Lucide)
        if (window.loadLucideIcons) {
            loadLucideIcons();
        }

        // Si mostramos la vista de editProfile, inicializar las tabs
        if (viewName === 'editProfile') {
            // Esperar un tick para que el DOM se actualice
            setTimeout(() => {
                // Disparar evento para reinicializar tabs
                window.dispatchEvent(new CustomEvent('editProfileShown'));
            }, 50);
        }

        // Disparar evento personalizado para que otros sistemas reaccionen
        window.dispatchEvent(new CustomEvent('navigationChanged', { 
            detail: { 
                viewName,
                previousView: this.currentView
            } 
        }));
    }

    /**
     * Obtiene el hash correspondiente a una vista
     * @param {string} viewName - Nombre de la vista
     * @returns {string} - Hash para la URL
     */
    getHashForView(viewName) {
        const viewToHash = {
            'login': 'login',
            'app': 'app',
            'editProfile': 'profile',
            'chat': 'chat',
            'otherProfile': 'otherProfile'
        };

        return viewToHash[viewName] || viewName;
    }

    /**
     * Obtiene la vista actual
     * @returns {string|null}
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * Obtiene si el usuario está en la vista de login
     * @returns {boolean}
     */
    isLoginView() {
        return this.currentView === 'login';
    }

    /**
     * Obtiene si el usuario está en el app principal
     * @returns {boolean}
     */
    isAppView() {
        return this.currentView === 'app';
    }

    /**
     * Navega a una vista con validación de permisos
     * @param {string} viewName - Nombre de la vista
     * @returns {boolean} - true si la navegación fue exitosa
     */
    navigateTo(viewName) {
        if (this.canAccessView(viewName)) {
            this.showView(viewName);
            return true;
        }
        return false;
    }

    /**
     * Limpia la vista guardada (útil al hacer logout)
     */
    clearSavedView() {
        localStorage.removeItem('lastView');
    }

    /**
     * Redirige a login y limpia estado de navegación
     */
    redirectToLogin() {
        this.clearSavedView();
        this.showView('login', { force: true });
    }
}

export const navigationManager = new NavigationManager();
