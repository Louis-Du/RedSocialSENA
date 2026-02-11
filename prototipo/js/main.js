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
import { postManager } from './ui/PostManager.js';
import { chatManager } from './ui/ChatManager.js';
import { tabManager } from './ui/TabManager.js';
import { feedRenderer } from './ui/FeedRenderer.js';
import { profileManager } from './ui/ProfileManager.js';
import { otherProfileManager } from './ui/OtherProfileManager.js';

// Importar utils
import { debug } from './utils.js';

/**
 * Inicializa la aplicación
 */
async function initializeApp() {
    try {
        // 1. Verificar sesión existente
        const isLoggedIn = userService.isLoggedIn();

        // 2. Suscribirse a cambios de posts
        appState.subscribe('posts', async () => {
            const posts = await postService.getFeed();
            feedRenderer.renderFeed(posts);
        });

        // 3. Suscribirse a cambios de comentarios
        appState.subscribe('comments', () => {
            // Los comentarios se renderizarán cuando se abra un post
        });

        // 4. Suscribirse a cambios de usuario
        appState.subscribe('currentUser', () => {
        });

        // 5. Suscribirse a cambios de chats
        appState.subscribe('chats', () => {
            chatManager.loadConversationsList();
        });

        // 6. Cargar y renderizar feed inicial si está logueado
        if (isLoggedIn) {
            const posts = await postService.getFeed();
            feedRenderer.renderFeed(posts);
        }
    } catch (error) {
        void error;
    }
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Función global para reload de feed (útil desde consola)
window.reloadFeed = async () => {
    const posts = await postService.getFeed();
    feedRenderer.renderFeed(posts);
};
