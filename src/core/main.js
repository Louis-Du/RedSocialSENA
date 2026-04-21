/**
 * main.js - Punto de entrada de la aplicación
 * 
 * Inicializa todos los módulos y gestores
 * Configura las suscripciones a cambios de estado
 */

// Importar servicios desde módulos
import { userService } from '../modules/auth/userService.js';
import { postService } from '../modules/post/postService.js';

// Importar estado por dominio
import { postState } from '../modules/post/postState.js';

// Importar gestores de UI desde módulos
import { navigationManager } from '../modules/common/NavigationManager.js';
import { modalManager } from '../modules/common/ModalManager.js';
import { messageManager } from '../modules/common/MessageManager.js';
import { authManager } from '../modules/auth/AuthManager.js';
import { registerManager } from '../modules/auth/RegisterManager.js';
import { postManager } from '../modules/post/PostManager.js';
import { chatManager } from '../modules/chat/ChatManager.js';
import { tabManager } from '../modules/post/TabManager.js';
import { feedRenderer } from '../modules/post/FeedRenderer.js';
import { profileManager } from '../modules/auth/ProfileManager.js';
import { otherProfileManager } from '../modules/auth/OtherProfileManager.js';
import { filterManager } from '../modules/post/FilterManager.js';
import { newsManager } from '../modules/post/NewsManager.js';
import { feedControlsManager } from '../modules/post/FeedControlsManager.js';
import { searchManager } from '../modules/post/SearchManager.js';

/**
 * Inicializa la aplicación
 */
async function initializeApp() {
    try {
        // 1. Esperar a que Firebase Auth se inicialice
        await waitForAuthInit();

        // 2. Inicializar el flujo de posts (Firebase o local)
        await postService.initialize();

        // 3. Suscribirse a cambios de posts
        postState.subscribe(async () => {
            const posts = await postService.getFeed();
            feedRenderer.renderFeed(posts);
        });
    } catch (error) {
        // Error durante inicialización - la app continuará funcionando
        console.error('[INIT_ERROR]', error?.message);
    }
}

/**
 * Espera a que Firebase Auth se inicialice
 */
function waitForAuthInit() {
    return new Promise((resolve) => {
        if (userService.authInitialized) {
            resolve();
            return;
        }
        
        const checkInterval = setInterval(() => {
            if (userService.authInitialized) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
        
        // Timeout después de 5 segundos
        setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
        }, 5000);
    });
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
