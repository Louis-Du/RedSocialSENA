/**
 * NewsManager - Gestor del panel de noticias
 * 
 * Responsabilidades:
 * - Renderizar lista de noticias
 * - Renderizar noticia individual
 * - Manejar filtros por categoría
 * - Mostrar noticias destacadas
 */

import { 
    initializeMockNews, 
    getNewsById,
    getFeaturedNews,
    sortNewsByDate,
    sortNewsByReads,
    getNewsByCategory 
} from '../data/MockNews.js';
import { escapeHTML } from '../utils/utils.js';
import { messageManager } from '../common/MessageManager.js';

class NewsManager {
    constructor() {
        this.newsContainer = document.getElementById('newsContainer');
        this.currentViewedNewsId = null;
        this.currentCategory = null;
        this.sortBy = 'date'; // 'date' o 'reads'
        
        this.setupEventListeners();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Listener para botón de volver a lista de noticias
        document.getElementById('backToNewsListBtn')?.addEventListener('click', () => {
            this.showNewsList();
        });

        // Delegación de eventos para noticias
        document.addEventListener('click', (e) => {
            // Click en noticia para verla
            if (e.target.closest('.news-card')) {
                const newsCard = e.target.closest('.news-card');
                const newsId = newsCard.getAttribute('data-news-id');
                if (newsId) {
                    this.showNewsDetail(newsId);
                }
            }
        });
    }

    /**
     * Renderiza la lista completa de noticias
     */
    showNewsList() {
        if (!this.newsContainer) return;

        const allNews = initializeMockNews();
        let displayNews = allNews;

        // Aplicar filtro de categoría si existe
        if (this.currentCategory) {
            displayNews = getNewsByCategory(this.currentCategory);
        }

        // Aplicar ordenamiento
        if (this.sortBy === 'reads') {
            displayNews = sortNewsByReads(displayNews);
        } else {
            displayNews = sortNewsByDate(displayNews);
        }

        const newsListHTML = `
            <div class="space-y-6">
                <!-- Noticias Destacadas -->
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i data-lucide="star" class="w-8 h-8 text-yellow-500"></i>
                        Noticias Destacadas
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${getFeaturedNews().map(news => this.generateFeaturedNewsHTML(news)).join('')}
                    </div>
                </div>

                <!-- Controles de Filtro y Ordenamiento -->
                <div class="bg-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div class="flex gap-2 flex-wrap">
                        <button class="category-filter px-4 py-2 rounded-full font-semibold transition-colors ${!this.currentCategory ? 'bg-sena-verde text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}" data-category="">
                            Todos
                        </button>
                        <button class="category-filter px-4 py-2 rounded-full font-semibold transition-colors ${this.currentCategory === 'Convocatoria' ? 'bg-sena-verde text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}" data-category="Convocatoria">
                            Convocatorias
                        </button>
                        <button class="category-filter px-4 py-2 rounded-full font-semibold transition-colors ${this.currentCategory === 'Empleo' ? 'bg-sena-verde text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}" data-category="Empleo">
                            Empleo
                        </button>
                        <button class="category-filter px-4 py-2 rounded-full font-semibold transition-colors ${this.currentCategory === 'Capacitación' ? 'bg-sena-verde text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}" data-category="Capacitación">
                            Capacitación
                        </button>
                        <button class="category-filter px-4 py-2 rounded-full font-semibold transition-colors ${this.currentCategory === 'Formación' ? 'bg-sena-verde text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}" data-category="Formación">
                            Formación
                        </button>
                    </div>

                    <div class="flex gap-2">
                        <button class="sort-btn px-4 py-2 rounded-lg font-semibold transition-colors ${this.sortBy === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}" data-sort="date">
                            <i data-lucide="clock" class="w-4 h-4 inline mr-2"></i>Recientes
                        </button>
                        <button class="sort-btn px-4 py-2 rounded-lg font-semibold transition-colors ${this.sortBy === 'reads' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}" data-sort="reads">
                            <i data-lucide="eye" class="w-4 h-4 inline mr-2"></i>Populares
                        </button>
                    </div>
                </div>

                <!-- Lista de Noticias -->
                <div class="space-y-4">
                    <h2 class="text-2xl font-bold text-gray-900 mt-8">Todas las Noticias</h2>
                    ${displayNews.length > 0 
                        ? displayNews.map(news => this.generateNewsCardHTML(news)).join('')
                        : '<div class="text-center py-12 text-gray-500"><p class="text-lg">No hay noticias en esta categoría</p></div>'
                    }
                </div>
            </div>
        `;

        this.newsContainer.innerHTML = newsListHTML;

        // Agregar listeners para filtros
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.target.getAttribute('data-category') || null;
                this.showNewsList();
            });
        });

        // Agregar listeners para ordenamiento
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sortBy = e.target.getAttribute('data-sort');
                this.showNewsList();
            });
        });

        if (window.loadLucideIcons) loadLucideIcons();
    }

    /**
     * Muestra el detalle de una noticia individual
     * @param {string} newsId - ID de la noticia
     */
    showNewsDetail(newsId) {
        const news = getNewsById(newsId);
        if (!news || !this.newsContainer) return;

        const newsDetailHTML = `
            <article class="space-y-6">
                <button id="backToNewsListBtn" class="flex items-center gap-2 text-sena-verde hover:text-green-700 font-semibold mb-6 transition-colors">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                    Volver a Noticias
                </button>

                <div class="bg-white rounded-3xl overflow-hidden shadow-xl">
                    <!-- Imagen de portada -->
                    <div class="relative h-96 overflow-hidden bg-gray-300">
                        <img src="${escapeHTML(news.imagen)}" alt="${escapeHTML(news.titulo)}" class="w-full h-full object-cover" />
                        <div class="absolute top-4 right-4">
                            <span class="bg-sena-verde text-white px-4 py-2 rounded-full text-sm font-semibold">
                                ${escapeHTML(news.categoria)}
                            </span>
                        </div>
                    </div>

                    <div class="p-8 space-y-6">
                        <!-- Título y Metadatos -->
                        <div>
                            <h1 class="text-4xl font-bold text-gray-900 mb-4">${escapeHTML(news.titulo)}</h1>
                            <div class="flex flex-wrap gap-6 text-gray-600 text-sm">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="user" class="w-4 h-4 text-sena-verde"></i>
                                    <span>${escapeHTML(news.autor)}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="calendar" class="w-4 h-4 text-sena-verde"></i>
                                    <span>${this.formatDate(news.fecha)}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="eye" class="w-4 h-4 text-sena-verde"></i>
                                    <span>${news.lecturas} lecturas</span>
                                </div>
                            </div>
                        </div>

                        <!-- Contenido principal -->
                        <div class="border-t pt-6">
                            <h2 class="text-xl font-bold text-gray-800 mb-3">Resumen</h2>
                            <p class="text-gray-700 text-lg leading-relaxed mb-6">${escapeHTML(news.descripcion)}</p>
                        </div>

                        <div class="border-t pt-6">
                            <h2 class="text-xl font-bold text-gray-800 mb-3">Contenido Completo</h2>
                            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${escapeHTML(news.contenido)}</p>
                        </div>

                        <!-- Acciones -->
                        <div class="border-t pt-6 flex gap-4">
                            <button class="flex items-center gap-2 px-6 py-3 bg-sena-verde text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                                <i data-lucide="bookmark" class="w-5 h-5"></i>
                                Guardar Noticia
                            </button>
                            <button class="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                                <i data-lucide="share-2" class="w-5 h-5"></i>
                                Compartir
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;

        this.newsContainer.innerHTML = newsDetailHTML;
        window.scrollTo(0, 0);

        // Re-attachar listener para volver
        document.getElementById('backToNewsListBtn')?.addEventListener('click', () => {
            this.showNewsList();
        });

        if (window.loadLucideIcons) loadLucideIcons();
    }

    /**
     * Genera HTML para una noticia destacada
     * @param {Object} news - Noticia
     * @returns {string} HTML
     */
    generateFeaturedNewsHTML(news) {
        return `
            <div class="news-card cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-news-id="${news.id}">
                <div class="relative h-40 bg-gray-300 overflow-hidden">
                    <img src="${escapeHTML(news.imagen)}" alt="${escapeHTML(news.titulo)}" class="w-full h-full object-cover" />
                </div>
                <div class="p-4">
                    <span class="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                        <i data-lucide="star" class="w-3 h-3 inline mr-1"></i>Destacada
                    </span>
                    <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">${escapeHTML(news.titulo)}</h3>
                    <p class="text-gray-600 text-sm line-clamp-2 mb-3">${escapeHTML(news.descripcion)}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <span>${this.getTimeAgo(news.fecha)}</span>
                        <span><i data-lucide="eye" class="w-3 h-3 inline"></i> ${news.lecturas}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Genera HTML para una tarjeta de noticia en la lista
     * @param {Object} news - Noticia
     * @returns {string} HTML
     */
    generateNewsCardHTML(news) {
        return `
            <div class="news-card cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow flex gap-4 p-4" data-news-id="${news.id}">
                <div class="flex-shrink-0 w-32 h-32 bg-gray-300 rounded-xl overflow-hidden">
                    <img src="${escapeHTML(news.imagen)}" alt="${escapeHTML(news.titulo)}" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-sena-verde text-white px-3 py-1 rounded-full text-xs font-semibold">
                                ${escapeHTML(news.categoria)}
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${escapeHTML(news.titulo)}</h3>
                        <p class="text-gray-600 line-clamp-2">${escapeHTML(news.descripcion)}</p>
                    </div>
                    <div class="flex items-center justify-between text-sm text-gray-500 mt-3">
                        <div class="flex gap-4">
                            <span><i data-lucide="user" class="w-4 h-4 inline mr-1"></i>${escapeHTML(news.autor)}</span>
                            <span>${this.getTimeAgo(news.fecha)}</span>
                        </div>
                        <span><i data-lucide="eye" class="w-4 h-4 inline mr-1"></i>${news.lecturas}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Formatea una fecha
     * @param {string} dateString - Fecha en ISO string
     * @returns {string} Fecha formateada
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Calcula tiempo relativo desde una fecha
     * @param {string} dateString - Fecha en ISO string
     * @returns {string} Tiempo relativo
     */
    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Hace momentos';
        if (diffMins === 1) return 'Hace 1 minuto';
        if (diffMins < 60) return `Hace ${diffMins} minutos`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return 'Hace 1 hora';
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks === 1) return 'Hace 1 semana';
        if (diffWeeks < 4) return `Hace ${diffWeeks} semanas`;
        
        return this.formatDate(dateString);
    }
}

export const newsManager = new NewsManager();
