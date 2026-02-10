/**
 * NavigationManager - Gestor centralizado de navegación entre vistas
 * 
 * Responsabilidades:
 * - Cambiar entre vistas principales (login, app, perfil, chat, etc.)
 * - Manejar el estado de las vistas
 * - Triggers al cambiar de vista (init iconos, etc.)
 */

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

        // Inicializar listeners
        this.setupListeners();
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
     */
    showView(viewName) {
        if (!this.views[viewName]) {
            console.error(`Vista desconocida: ${viewName}`);
            return;
        }

        // Ocultar todas las vistas
        Object.values(this.views).forEach(view => {
            if (view) view.classList.add('hidden');
        });

        // Mostrar la vista solicitada
        this.views[viewName]?.classList.remove('hidden');
        this.currentView = viewName;

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
        window.dispatchEvent(new CustomEvent('navigationChanged', { detail: { viewName } }));
    }

    /**
     * Obtiene la vista actual
     * @returns {string}
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
}

export const navigationManager = new NavigationManager();
