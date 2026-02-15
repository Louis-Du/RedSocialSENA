/**
 * main.js - Punto de entrada de la aplicación
 * 
 * Inicializa todos los módulos y gestores
 * Configura las suscripciones a cambios de estado
 */

// Importar AppState
import { appState } from './AppState.js';

// Importar servicios
import { userService } from './services/UserService.js';
import { postService } from './services/PostService.js';
import { commentService } from './services/CommentService.js';
import { chatService } from './services/ChatService.js';

// Importar gestores de UI
import { navigationManager } from './ui/NavigationManager.js';
import { modalManager } from './ui/ModalManager.js';
import { messageManager } from './ui/MessageManager.js';
import { authManager } from './ui/AuthManager.js';
import { registerManager } from './ui/RegisterManager.js';
import { postManager } from './ui/PostManager.js';
import { chatManager } from './ui/ChatManager.js';
import { tabManager } from './ui/TabManager.js';
import { feedRenderer } from './ui/FeedRenderer.js';
import { profileManager } from './ui/ProfileManager.js';
import { otherProfileManager } from './ui/OtherProfileManager.js';
import { filterManager } from './ui/FilterManager.js';
import { newsManager } from './ui/NewsManager.js';
import { feedControlsManager } from './ui/FeedControlsManager.js';
import { searchManager } from './ui/SearchManager.js';

// Importar datos de ejemplo
import { initializeMockPosts } from './data/MockPosts.js';

/**
 * Inicializa la aplicación
 */
async function initializeApp() {
    try {
        // 1. Esperar a que Firebase Auth se inicialice
        await waitForAuthInit();

        // 2. Verificar sesión existente
        const isLoggedIn = userService.isLoggedIn();

        // 3. Inicializar datos de ejemplo si es necesario
        initializeMockPosts();

        // 4. Suscribirse a cambios de posts
        appState.subscribe('posts', async () => {
            const posts = await postService.getFeed();
            feedRenderer.renderFeed(posts);
        });

        // 5. Suscribirse a cambios de comentarios
        appState.subscribe('comments', () => {
            // Los comentarios se renderizarán cuando se abra un post
        });

        // 6. Suscribirse a cambios de usuario
        appState.subscribe('currentUser', () => {
        });

        // 7. Suscribirse a cambios de chats
        appState.subscribe('chats', () => {
            chatManager.loadConversationsList();
        });

        // 8. Cargar y renderizar feed inicial (solo si está logueado)
        if (isLoggedIn) {
            const posts = await postService.getFeed();
            feedRenderer.renderFeed(posts);
        }
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
