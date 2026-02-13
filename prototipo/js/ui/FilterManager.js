/**
 * FilterManager - Gestor de filtros de publicaciones
 * 
 * Responsabilidades:
 * - Manejar toggleado del panel de filtros
 * - Aplicar y limpiar filtros
 * - Actualizar la vista del feed cuando cambian los filtros
 */

import { appState } from '../AppState.js';
import { postService } from '../services/PostService.js';
import { feedRenderer } from './FeedRenderer.js';
import { messageManager } from './MessageManager.js';

class FilterManager {
    constructor() {
        this.filterPanel = document.getElementById('filterPanel');
        this.filterBtn = document.getElementById('toggleFilterBtn');
        this.applyBtn = document.getElementById('applyFiltersBtn');
        this.clearBtn = document.getElementById('clearFiltersBtn');
        
        this.filterSelects = {
            centro: document.getElementById('filterCentro'),
            regional: document.getElementById('filterRegional'),
            etapa: document.getElementById('filterEtapa'),
            modalidad: document.getElementById('filterModalidad')
        };
        
        this.setupEventListeners();
        this.restoreFilters();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Toggle del panel de filtros
        this.filterBtn?.addEventListener('click', () => {
            this.toggleFilterPanel();
        });

        // Botón aplicar filtros
        this.applyBtn?.addEventListener('click', () => {
            this.applyFilters();
        });

        // Botón limpiar filtros
        this.clearBtn?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Escuchar cambios en los filtros en AppState (para sincronizar entre tabs, etc)
        appState.subscribeFilters(() => {
            this.restoreFilters();
        });
    }

    /**
     * Alterna la visibilidad del panel de filtros
     */
    toggleFilterPanel() {
        if (!this.filterPanel) return;
        
        this.filterPanel.classList.toggle('hidden');
        
        // Cambiar texto del botón
        const filterText = document.getElementById('filterText');
        if (filterText) {
            const isHidden = this.filterPanel.classList.contains('hidden');
            filterText.textContent = isHidden ? 'Filtros Avanzados' : 'Ocultar Filtros';
        }
    }

    /**
     * Aplica los filtros seleccionados
     */
    applyFilters() {
        try {
            if (!this.filterPanel) return;

            // Obtener valores de los selects
            const filters = {
                centro: this.filterSelects.centro?.value || '',
                regional: this.filterSelects.regional?.value || '',
                etapa: this.filterSelects.etapa?.value || '',
                modalidad: this.filterSelects.modalidad?.value || ''
            };

            // Guardar en AppState
            appState.setFilters(filters);

            // Obtener posts filtrados
            const filteredPosts = postService.getFilteredPosts(filters);

            // Limpiar el feed y renderizar posts filtrados
            if (feedRenderer.feedContainer) {
                feedRenderer.feedContainer.innerHTML = '';
                
                if (filteredPosts.length === 0) {
                    feedRenderer.feedContainer.innerHTML = `
                        <div class="bg-white rounded-3xl shadow-lg p-12 text-center">
                            <i data-lucide="search" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">Sin resultados</h3>
                            <p class="text-gray-600">No hay publicaciones que coincidan con los filtros seleccionados.</p>
                        </div>
                    `;
                    if (window.loadLucideIcons) loadLucideIcons();
                } else {
                    filteredPosts.forEach((post, index) => {
                        feedRenderer.renderPost(post, index === 0 ? 'top' : 'bottom');
                    });
                }
            }

            // Cerrar panel y mostrar mensaje
            this.filterPanel.classList.add('hidden');
            const filterText = document.getElementById('filterText');
            if (filterText) filterText.textContent = 'Filtros Avanzados';

            const hasActiveFilters = Object.values(filters).some(v => v !== '');
            if (hasActiveFilters) {
                messageManager.success(`Mostrando ${filteredPosts.length} publicación${filteredPosts.length !== 1 ? 'es' : ''} con los filtros aplicados`);
            }
        } catch (error) {
            console.error('Error al aplicar filtros:', error);
            messageManager.error('Error al aplicar los filtros');
        }
    }

    /**
     * Limpia todos los filtros
     */
    clearFilters() {
        try {
            // Resetear valores de selects
            Object.values(this.filterSelects).forEach(select => {
                if (select) select.value = '';
            });

            // Limpiar filtros en AppState
            appState.clearFilters();

            // Renderizar todos los posts nuevamente
            feedRenderer.renderFullFeed();

            // Cerrar panel
            if (this.filterPanel) {
                this.filterPanel.classList.add('hidden');
                const filterText = document.getElementById('filterText');
                if (filterText) filterText.textContent = 'Filtros Avanzados';
            }

            messageManager.success('Filtros limpios. Mostrando todas las publicaciones');
        } catch (error) {
            console.error('Error al limpiar filtros:', error);
            messageManager.error('Error al limpiar los filtros');
        }
    }

    /**
     * Restaura los filtros guardados en los selects
     */
    restoreFilters() {
        const filters = appState.getFilters();
        
        if (this.filterSelects.centro && filters.centro) {
            this.filterSelects.centro.value = filters.centro;
        }
        if (this.filterSelects.regional && filters.regional) {
            this.filterSelects.regional.value = filters.regional;
        }
        if (this.filterSelects.etapa && filters.etapa) {
            this.filterSelects.etapa.value = filters.etapa;
        }
        if (this.filterSelects.modalidad && filters.modalidad) {
            this.filterSelects.modalidad.value = filters.modalidad;
        }
    }
}

export const filterManager = new FilterManager();
