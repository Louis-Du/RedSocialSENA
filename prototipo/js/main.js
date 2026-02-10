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

// Importar utils
import { debug } from './utils.js';

/**
 * Inicializa la aplicación
 */
async function initializeApp() {
    console.log('🚀 Inicializando aplicación de red social SENA...');

    try {
        // 1. Verificar sesión existente
        const isLoggedIn = userService.isLoggedIn();
        console.log('✓ Estado de sesión verificado:', isLoggedIn);

        // 2. Suscribirse a cambios de posts
        appState.subscribe('posts', async () => {
            console.log('📰 Posts actualizados');
            const posts = await postService.getFeed();
            feedRenderer.renderFeed(posts);
        });

        // 3. Suscribirse a cambios de comentarios
        appState.subscribe('comments', () => {
            console.log('💬 Comentarios actualizados');
            // Los comentarios se renderizarán cuando se abra un post
        });

        // 4. Suscribirse a cambios de usuario
        appState.subscribe('currentUser', () => {
            console.log('👤 Usuario actualizado');
        });

        // 5. Suscribirse a cambios de chats
        appState.subscribe('chats', () => {
            console.log('💬 Chats actualizados');
            chatManager.loadConversationsList();
        });

        // 6. Cargar y renderizar feed inicial si está logueado
        if (isLoggedIn) {
            const posts = await postService.getFeed();
            console.log(`✓ ${posts.length} posts cargados`);
            feedRenderer.renderFeed(posts);
        }

        // 7. Habilitar modo debug si está en development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.__DEBUG_MODE = true;
            console.log('🐛 Modo debug habilitado');
            
            // Exponer objetos globales para debugging
            window.__APP__ = {
                appState,
                userService,
                postService,
                commentService,
                chatService,
                navigationManager,
                modalManager,
                authManager,
                postManager,
                chatManager,
                feedRenderer
            };
            console.log('📦 Objetos disponibles en window.__APP__');
        }

        console.log('✅ Aplicación inicializada correctamente');

    } catch (error) {
        console.error('❌ Error al inicializar aplicación:', error);
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

console.log('📝 Red Social SENA cargada. Use window.reloadFeed() para actualizar feed.');
