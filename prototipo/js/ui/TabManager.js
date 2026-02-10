/**
 * TabManager - Gestor de tabs/pestañas en perfiles y feeds
 * 
 * Responsabilidades:
 * - Cambiar entre tabs de perfil (Perfil, Publicaciones, Información)
 * - Cambiar entre tabs de feed (Inicio, Noticias)
 * - Sincronizar estado visual entre desktop y mobile
 */

class TabManager {
    constructor() {
        this.handlersInitialized = false;
        this.setupTabHandlers();
        this.setupFeedTabs();
        
        // Escuchar cuando se muestre la vista de editProfile
        window.addEventListener('editProfileShown', () => {
            this.reinitializeTabs();
        });

        // Reconfigurar tabs del feed cuando se muestre la vista principal
        window.addEventListener('navigationChanged', (event) => {
            if (event?.detail?.viewName === 'app') {
                this.setupFeedTabs();
            }
        });
    }

    /**
     * Configura los handlers de tabs de feed (Inicio/Noticias)
     */
    setupFeedTabs() {
        if (this.feedTabsDelegatedHandler) {
            return;
        }

        this.feedTabsDelegatedHandler = (event) => {
            const target = event.target.closest('#tabInicio, #tabNoticias');
            if (!target) return;

            const tabInicio = document.getElementById('tabInicio');
            const tabNoticias = document.getElementById('tabNoticias');
            const homeFeed = document.getElementById('homeFeed');
            const newsFeed = document.getElementById('newsFeed');

            if (!tabInicio || !tabNoticias || !homeFeed || !newsFeed) {
                return;
            }

            if (target.id === 'tabInicio') {
                homeFeed.classList.remove('hidden');
                newsFeed.classList.add('hidden');

                tabInicio.classList.remove('bg-gray-300', 'text-gray-600', 'border-transparent');
                tabInicio.classList.add('bg-gray-200', 'text-gray-900', 'border-sena-verde');

                tabNoticias.classList.remove('bg-gray-200', 'text-gray-900', 'border-sena-verde');
                tabNoticias.classList.add('bg-gray-300', 'text-gray-600', 'border-transparent');
            } else {
                homeFeed.classList.add('hidden');
                newsFeed.classList.remove('hidden');

                tabNoticias.classList.remove('bg-gray-300', 'text-gray-600', 'border-transparent');
                tabNoticias.classList.add('bg-gray-200', 'text-gray-900', 'border-sena-verde');

                tabInicio.classList.remove('bg-gray-200', 'text-gray-900', 'border-sena-verde');
                tabInicio.classList.add('bg-gray-300', 'text-gray-600', 'border-transparent');
            }
        };

        document.addEventListener('click', this.feedTabsDelegatedHandler);
        document.__feedTabsDelegatedHandler = this.feedTabsDelegatedHandler;
    }

    /**
     * Configura los handlers de tabs de perfil
     */
    setupTabHandlers() {
        // Desktop nav links
        const navLinks = document.querySelectorAll('.profile-nav-link');
        navLinks.forEach(link => {
            // Remover listener anterior si existe
            const oldHandler = link._tabClickHandler;
            if (oldHandler) {
                link.removeEventListener('click', oldHandler);
            }
            
            // Crear nuevo handler
            const newHandler = (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                this.setActiveTab(tabId);
            };
            
            // Guardar referencia y registrar
            link._tabClickHandler = newHandler;
            link.addEventListener('click', newHandler);
        });

        // Mobile tab buttons
        const tabButtons = document.querySelectorAll('.tab-button[data-tab]');
        tabButtons.forEach(btn => {
            // Remover listener anterior si existe
            const oldHandler = btn._tabClickHandler;
            if (oldHandler) {
                btn.removeEventListener('click', oldHandler);
            }
            
            // Crear nuevo handler
            const newHandler = (e) => {
                e.preventDefault();
                const tabId = btn.getAttribute('data-tab');
                this.setActiveTab(tabId);

                // Scroll al contenido en mobile
                const contentArea = document.getElementById('profileContentArea');
                if (contentArea && window.innerWidth < 640) {
                    contentArea.scrollIntoView({ behavior: 'smooth' });
                }
            };
            
            // Guardar referencia y registrar
            btn._tabClickHandler = newHandler;
            btn.addEventListener('click', newHandler);
        });
    }

    /**
     * Activa una pestaña específica
     * @param {string} tabId - ID de la pestaña
     */
    setActiveTab(tabId) {
        console.log(`🔵 setActiveTab llamado con tabId: ${tabId}`);
        
        // Ocultar todos los contenidos
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Mostrar contenido seleccionado
        const target = document.getElementById(tabId);
        if (target) {
            target.classList.remove('hidden');
            console.log(`✅ Mostrando contenido: ${tabId}`);
        } else {
            console.error(`❌ No se encontró el elemento con id: ${tabId}`);
        }

        // Actualizar nav desktop
        document.querySelectorAll('.profile-nav-link').forEach(link => {
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('nav-active');
            } else {
                link.classList.remove('nav-active');
            }
        });

        // Actualizar botones mobile
        document.querySelectorAll('.tab-button').forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('bg-sena-verde', 'text-white');
                btn.classList.remove('text-sena-azul-oscuro');
            } else {
                btn.classList.remove('bg-sena-verde', 'text-white');
                btn.classList.add('text-sena-azul-oscuro');
            }
        });

        // Reinicializar iconos
        if (window.loadLucideIcons) {
            loadLucideIcons();
        }
    }

    /**
     * Inicializa la primera tab
     */
    initializeFirstTab() {
        // Buscar el primer elemento con data-tab
        const firstBtn = document.querySelector('[data-tab]');
        if (firstBtn) {
            const tabId = firstBtn.getAttribute('data-tab');
            if (tabId) {
                this.setActiveTab(tabId);
            }
        }
    }

    /**
     * Reinicializa las tabs cuando se muestra una vista
     */
    reinitializeTabs() {
        console.log('🔄 Reinicializando tabs...');
        // Re-configurar los event listeners (por si los elementos se cargaron después)
        this.setupTabHandlers();
        // Inicializar la primera tab
        this.initializeFirstTab();
        console.log('✅ Tabs reinicializadas');
    }

    /**
     * Expone el método globalmente para compatibilidad
     */
    static init() {
        window.setActiveTab = (tabId) => {
            const manager = new TabManager();
            manager.setActiveTab(tabId);
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new TabManager();
    TabManager.init();
});

export const tabManager = new TabManager();
