/**
 * MockPosts - Datos de ejemplo para publicaciones
 * 
 * Genera publicaciones de ejemplo para demostración
 * Se cargan automáticamente al iniciar la app si no hay posts
 */

import { appState } from '../AppState.js';

/**
 * Crea publicaciones de ejemplo para demostración
 */
export function initializeMockPosts() {
    // Verificar si hay posts existentes
    const existingPosts = appState.getPosts();
    
    // Si hay posts y el primero contiene contenido de prueba inválido, limpiar
    const shouldReset = existingPosts.length > 0 && 
                       (existingPosts.some(p => p.content === 'ojd' || p.content.length < 10));
    
    if (shouldReset) {
        // Limpiar posts viejos
        appState.posts = [];
    } else if (existingPosts.length > 0) {
        // Ya hay posts válidos, no crear más
        return;
    }

    // Posts de Daniel Esteban (user_1) - usuario actual logueado
    appState.createPost(
        'Trabajando en un nuevo proyecto de análisis de datos con Python. ¿Alguien tiene experiencia con pandas? 🐼',
        null
    );

    // Cambiar temporalmente el usuario para crear posts de otros
    const originalUser = { ...appState.currentUser };

    // Posts de María García (user_2)
    appState.currentUser.id = 'user_2';
    appState.createPost(
        '¡Proyecto final completado! 🎉 Sistema de gestión de inventarios con interfaz moderna y API REST. Agradecido con mi equipo de trabajo.',
        'assets/placeholders/post-2.svg'
    );

    appState.createPost(
        'Buscando recomendaciones de libros sobre arquitectura de software. ¿Alguna sugerencia? 📚',
        null
    );

    // Post de Carlos López
    appState.currentUser.id = 'user_3';
    appState.createPost(
        'Me pregunto si alguien más ha trabajado con React. Necesito ayuda con hooks personalizados.',
        null
    );

    appState.createPost(
        'Terminé mi primer proyecto web responsive. ¡Qué satisfacción ver cómo se adapta a todos los dispositivos! 📱💻',
        'assets/placeholders/post-3.svg'
    );

    // Post de Ana Martínez
    appState.currentUser.id = 'user_4';
    appState.createPost(
        'Nueva campaña de marketing digital para proyecto final. ¿Alguien quiere colaborar en redes sociales? 🚀',
        null
    );

    // Restaurar usuario original
    appState.currentUser = originalUser;

    // Agregar algunos comentarios de ejemplo
    const posts = appState.getPosts();
    if (posts.length > 0) {
        // Comentario en el primer post
        appState.currentUser.id = 'user_2';
        appState.addComment(posts[0].id, '¡Felicidades por tu proyecto! Se ve muy profesional 👏', null);
        
        appState.currentUser.id = 'user_3';
        appState.addComment(posts[0].id, 'Excelente trabajo, me gustaría ver más detalles', null);

        // Restaurar
        appState.currentUser = originalUser;
    }
}

/**
 * Limpia todas las publicaciones de ejemplo
 */
export function clearMockPosts() {
    appState.reset();
}
