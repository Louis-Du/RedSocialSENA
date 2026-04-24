/**
 * SearchManager - Gestor de búsqueda global
 * 
 * Responsabilidades:
 * - Búsqueda de posts por contenido, autor
 * - Búsqueda de usuarios
 * - Búsqueda de noticias
 * - Debounce para no sobrecargar el sistema
 */

import { postState } from './postState.js';
import { userService } from '../auth/userService.js';
import { getNewsById, getAllNews } from './MockNews.js';
import { escapeHTML } from '../../utils/utils.js';

class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchContainer = document.getElementById('searchContainer');
        this.debounceTimer = null;
        this.resultsContainer = null;
        
        this.setupSearchListener();
    }

    /**
     * Configura el listener de búsqueda con debounce
     */
    setupSearchListener() {
        if (!this.searchInput) return;

        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            const query = e.target.value.trim();

            if (query.length === 0) {
                this.clearResults();
                return;
            }

            if (query.length < 2) {
                return;
            }

            // Debounce: 300ms de espera
            this.debounceTimer = setTimeout(() => {
                this.search(query);
            }, 300);
        });

        // Cerrar resultados al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
                this.clearResults();
            }
        });
    }

    /**
     * Realiza la búsqueda
     * @param {string} query - Término de búsqueda
     */
    search(query) {
        const results = {
            posts: this.searchPosts(query),
            users: this.searchUsers(query),
            news: this.searchNews(query)
        };

        this.displayResults(results, query);
    }

    /**
     * Busca en posts
     * @param {string} query - Término de búsqueda
     * @returns {Array} Posts encontrados
     */
    searchPosts(query) {
        const posts = postState.getPosts();
        const lowerQuery = query.toLowerCase();
        
        return posts.filter(post => {
            const content = (post.content || '').toLowerCase();
            const author = userService.getUserById(post.userId);
            const authorName = author ? (author.nombre + ' ' + author.apodo).toLowerCase() : '';
            const programa = author ? (author.programa || '').toLowerCase() : '';
            
            return content.includes(lowerQuery) || 
                   authorName.includes(lowerQuery) || 
                   programa.includes(lowerQuery);
        }).slice(0, 5); // Máximo 5 resultados
    }

    /**
     * Busca en usuarios
     * @param {string} query - Término de búsqueda
     * @returns {Array} Usuarios encontrados
     */
    searchUsers(query) {
        const lowerQuery = query.toLowerCase();
        const users = [userService.getCurrentUser(), ...userService.getUsers()];
        
        return users.filter(user => {
            const name = (user.nombre || '').toLowerCase();
            const username = (user.apodo || '').toLowerCase();
            const programa = (user.programa || '').toLowerCase();
            
            return name.includes(lowerQuery) || 
                   username.includes(lowerQuery) || 
                   programa.includes(lowerQuery);
        }).slice(0, 5); // Máximo 5 resultados
    }

    /**
     * Busca en noticias
     * @param {string} query - Término de búsqueda
     * @returns {Array} Noticias encontradas
     */
    searchNews(query) {
        const news = getAllNews();
        const lowerQuery = query.toLowerCase();
        
        return news.filter(n => {
            const titulo = (n.titulo || '').toLowerCase();
            const descripcion = (n.descripcion || '').toLowerCase();
            const contenido = (n.contenido || '').toLowerCase();
            const categoria = (n.categoria || '').toLowerCase();
            
            return titulo.includes(lowerQuery) || 
                   descripcion.includes(lowerQuery) || 
                   contenido.includes(lowerQuery) || 
                   categoria.includes(lowerQuery);
        }).slice(0, 5); // Máximo 5 resultados
    }

    /**
     * Muestra los resultados de búsqueda
     * @param {Object} results - Resultados organizados por tipo
     * @param {string} query - Término de búsqueda
     */
    displayResults(results, query) {
        let html = '<div id="searchResults" class="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-2xl mt-2 z-50 max-h-96 overflow-y-auto">';
        
        let hasResults = false;

        // Posts
        if (results.posts.length > 0) {
            hasResults = true;
            html += '<div class="border-b"><div class="p-3 px-4 font-semibold text-sm text-gray-500 bg-gray-50">Publicaciones</div>';
            results.posts.forEach(post => {
                const author = userService.getUserById(post.userId) || {};
                html += `
                    <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b search-post" data-post-id="${post.id}">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-sena-verde text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                ${escapeHTML(author.apodo ? author.apodo.charAt(0) : '?')}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-sm text-gray-800">${escapeHTML(author.nombre || 'Usuario')}</p>
                                <p class="text-sm text-gray-600 line-clamp-1">${escapeHTML(post.content)}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Usuarios
        if (results.users.length > 0) {
            hasResults = true;
            html += '<div class="border-b"><div class="p-3 px-4 font-semibold text-sm text-gray-500 bg-gray-50">Usuarios</div>';
            results.users.forEach(user => {
                html += `
                    <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b search-user" data-user-id="${user.id}">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-sena-azul-oscuro text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                ${escapeHTML(user.apodo ? user.apodo.charAt(0) : '?')}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-sm text-gray-800">@${escapeHTML(user.apodo || user.nombre)}</p>
                                <p class="text-xs text-gray-600">${escapeHTML(user.programa || 'Sin programa')}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Noticias
        if (results.news.length > 0) {
            hasResults = true;
            html += '<div class="border-b"><div class="p-3 px-4 font-semibold text-sm text-gray-500 bg-gray-50">Noticias</div>';
            results.news.forEach(news => {
                html += `
                    <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b search-news" data-news-id="${news.id}">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                <i data-lucide="newspaper" class="w-5 h-5"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-sm text-gray-800 line-clamp-1">${escapeHTML(news.titulo)}</p>
                                <p class="text-xs text-gray-600">${escapeHTML(news.categoria)}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        if (!hasResults) {
            html += '<div class="p-6 text-center text-gray-500"><i data-lucide="search" class="w-8 h-8 mx-auto mb-2 opacity-50"></i><p>No se encontraron resultados para "<strong>' + escapeHTML(query) + '</strong>"</p></div>';
        }

        html += '</div>';

        // Limpiar resultados anteriores
        const oldResults = document.getElementById('searchResults');
        if (oldResults) oldResults.remove();

        // Insertar nuevos resultados
        if(this.searchInput) {
            this.searchInput.insertAdjacentHTML('afterend', html);
        }

        // Reinicializar iconos
        if (window.loadLucideIcons) loadLucideIcons();

        // Agregar event listeners
        this.setupResultsListeners();
    }

    /**
     * Configura los listeners para los resultados
     */
    setupResultsListeners() {
        // Click en post
        document.querySelectorAll('.search-post').forEach(el => {
            el.addEventListener('click', (e) => {
                const postId = el.getAttribute('data-post-id');
                // Implementar navegación al post o mostrar expandido
                this.clearResults();
            });
        });

        // Click en usuario
        document.querySelectorAll('.search-user').forEach(el => {
            el.addEventListener('click', (e) => {
                const userId = el.getAttribute('data-user-id');
                // Implementar navegación al perfil del usuario
                this.clearResults();
            });
        });

        // Click en noticia
        document.querySelectorAll('.search-news').forEach(el => {
            el.addEventListener('click', (e) => {
                const newsId = el.getAttribute('data-news-id');
                // Implementar navegación a la noticia
                this.clearResults();
            });
        });
    }

    /**
     * Limpia los resultados de búsqueda
     */
    clearResults() {
        const results = document.getElementById('searchResults');
        if (results) results.remove();
    }

    /**
     * Retorna los usuarios registrados
     * @returns {Array}
     */
    getUsers() {
        return userService.getUsers?.() || [];
    }
}

export const searchManager = new SearchManager();
