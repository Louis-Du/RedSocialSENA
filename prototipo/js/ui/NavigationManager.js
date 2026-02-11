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
        
        // Estado de navegación (para query params)
        this.navigationParams = {};

        // Inicializar
        this.setupListeners();
        this.setupHashRouting();
        this.restoreLastView();
    }

    /**
     * Extrae query params del hash
     * @param {string} hash - Hash completo (ej: "profile?userId=123")
     * @returns {Object} - { view: string, params: Object }
     */
    parseHash(hash) {
        const [view, queryString] = hash.split('?');
        const params = {};
        
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            });
        }
        
        return { view, params };
    }

    /**
     * Construye hash con query params
     * @param {string} view - Nombre de la vista
     * @param {Object} params - Parámetros adicionales
     * @returns {string} - Hash completo
     */
    buildHash(view, params = {}) {
        const hash = this.getHashForView(view);
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        
        return queryString ? `${hash}?${queryString}` : hash;
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
        const hashFull = window.location.hash.slice(1); // Remover el #
        const { view: hashView, params } = this.parseHash(hashFull);
        const viewName = this.hashToView[hashView] || 'login';
        
        // Guardar params para acceso posterior
        this.navigationParams = params;
        
        // Intentar navegar a la vista
        this.showView(viewName, { updateHash: false, params });
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
     * @param {Object} options.params - Parámetros adicionales para la navegación
     */
    showView(viewName, options = {}) {
        const { updateHash = true, force = false, params = {} } = options;

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

        // Guardar params para acceso posterior
        this.navigationParams = params;

        // ACTUALIZAR HASH (si está habilitado)
        if (updateHash) {
            const hash = this.buildHash(viewName, params);
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
                console.log('[NavigationManager] Dispatching editProfileShown with params:', params);
                // Disparar evento para reinicializar tabs con params
                window.dispatchEvent(new CustomEvent('editProfileShown', { detail: { params } }));
            }, 50);
        }

        // Si mostramos otherProfile, inicializar con userId
        if (viewName === 'otherProfile') {
            setTimeout(() => {
                console.log('[NavigationManager] Dispatching otherProfileShown with params:', params);
                // Solo disparar si hay userId en params
                if (params.userId) {
                    window.dispatchEvent(new CustomEvent('otherProfileShown', { detail: { params } }));
                }
            }, 50);
        }

        // Disparar evento personalizado para que otros sistemas reaccionen
        window.dispatchEvent(new CustomEvent('navigationChanged', { 
            detail: { 
                viewName,
                previousView: this.currentView,
                params
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
     * @param {Object} params - Parámetros adicionales
     * @returns {boolean} - true si la navegación fue exitosa
     */
    navigateTo(viewName, params = {}) {
        if (this.canAccessView(viewName)) {
            this.showView(viewName, { params });
            return true;
        }
        return false;
    }

    /**
     * Navega al perfil de un usuario
     * @param {string} userId - ID del usuario (null para perfil propio)
     */
    navigateToProfile(userId = null) {
        const currentUser = userService.getCurrentUser();
        
        console.log('[NavigationManager] navigateToProfile - userId:', userId);
        console.log('[NavigationManager] navigateToProfile - currentUser.id:', currentUser.id);
        console.log('[NavigationManager] navigateToProfile - comparison:', userId === currentUser.id);
        
        if (!userId || userId === currentUser.id) {
            // Perfil propio: usar editProfile
            console.log('[NavigationManager] navigateToProfile - perfil propio');
            this.navigateTo('editProfile');
        } else {
            // Perfil de otro: usar otherProfile
            console.log('[NavigationManager] navigateToProfile - perfil de otro:', userId);
            this.navigateTo('otherProfile', { userId });
        }
    }

    /**
     * Obtiene los parámetros de navegación actuales
     * @returns {Object}
     */
    getNavigationParams() {
        return { ...this.navigationParams };
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
