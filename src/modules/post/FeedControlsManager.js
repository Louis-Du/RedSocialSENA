/**
 * FeedControlsManager - Gestor de controles en el feed
 * 
 * Responsabilidades:
 * - Renderizar barra superior con botones (Crear Post, Filtros)
 * - Renderizar panel de filtros
 * - Manejar eventos de los controles
 */

import { postManager } from './PostManager.js';
import { filterManager } from './FilterManager.js';

class FeedControlsManager {
    constructor() {
        this.homeFeed = document.getElementById('homeFeed');
        this.renderControls();
    }

    /**
     * Renderiza los controles del feed
     */
    renderControls() {
        if (!this.homeFeed) return;

        const controlsHTML = `
            <div class="mb-6">
                <div class="bg-sena-azul-oscuro rounded-2xl p-4 flex gap-4 shadow-lg">
                    <button id="createPostBtn" class="bg-sena-verde hover:bg-green-700 text-white p-3 rounded-xl transition-all flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-6 h-6"></i>
                        <span class="hidden sm:inline">Mi Aporte</span>
                    </button>
                    <button id="toggleFilterBtn" class="bg-sena-verde hover:bg-green-700 text-white p-3 rounded-xl transition-all flex items-center gap-2">
                        <i data-lucide="filter" class="w-6 h-6"></i>
                        <span id="filterText" class="hidden sm:inline">Filtros Avanzados</span>
                    </button>
                </div>

                <!-- Inline Quick-Post Panel -->
                <div id="quickPostInline" class="collapsed bg-white rounded-2xl p-4 shadow-md mt-4">
                    <form id="quickPostForm" class="flex flex-col gap-3">
                        <textarea id="quickPostContent" class="w-full h-28 px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-sena-verde focus:outline-none transition-colors resize-none" placeholder="¿Qué quieres compartir con los aprendices?"></textarea>

                        <div class="flex items-center gap-3">
                            <label for="quickPostImage" class="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
                                <i data-lucide="image" class="w-5 h-5"></i>
                                <span class="text-sm">Subir Imagen</span>
                            </label>
                            <input type="file" id="quickPostImage" class="hidden" accept="image/*">
                            <span id="quickImageFileName" class="text-gray-600 text-sm flex-1 truncate">Ningún archivo seleccionado</span>

                            <div class="ml-auto">
                                <button type="button" id="quickPublishBtn" class="px-5 py-2 bg-sena-verde text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                                    <i data-lucide="send" class="w-5 h-5"></i>
                                    <span>Publicar</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div id="filterPanel" class="hidden bg-white p-6 rounded-2xl shadow-xl mt-4 border border-gray-200">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Filtrar Publicaciones por Formación</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Centro de Formación</label>
                            <select id="filterCentro" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-sena-verde focus:outline-none">
                                <option value="">Todos los Centros</option>
                                <option value="Barrancabermeja">Centro para la Industria Petroquímica</option>
                                <option value="Bogotá">Centro de Gestión Administrativa</option>
                                <option value="Cali">Centro de Tecnologías de la Información</option>
                                <option value="Barranquilla">Centro de Comercio y Servicios</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Regional</label>
                            <select id="filterRegional" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-sena-verde focus:outline-none">
                                <option value="">Todos los Regionales</option>
                                <option value="Centro para la Industria Petroquímica">Centro para la Industria Petroquímica</option>
                                <option value="Centro de Gestión Administrativa">Centro de Gestión Administrativa</option>
                                <option value="Centro de Tecnologías de la Información">Centro de Tecnologías de la Información</option>
                                <option value="Centro de Comercio y Servicios">Centro de Comercio y Servicios</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Etapa</label>
                            <select id="filterEtapa" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-sena-verde focus:outline-none">
                                <option value="">Todas las Etapas</option>
                                <option value="Lectiva">Lectiva</option>
                                <option value="Productiva">Productiva</option>
                                <option value="Egresado">Egresado</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
                            <select id="filterModalidad" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-sena-verde focus:outline-none">
                                <option value="">Todas las Modalidades</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Virtual">Virtual</option>
                                <option value="Mixta">Mixta</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end gap-3">
                        <button id="clearFiltersBtn" class="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors">
                            Limpiar Filtros
                        </button>
                        <button id="applyFiltersBtn" class="px-5 py-2 bg-sena-verde text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.homeFeed.insertAdjacentHTML('afterbegin', controlsHTML);

        // Re-inicializar iconos
        if (window.loadLucideIcons) loadLucideIcons();

        this.bindPostControls();
    }

    /**
     * Vincula controles del post una vez renderizados en el DOM
     */
    bindPostControls() {
        postManager.setupCreateButton();
        postManager.setupQuickPostForm();
        postManager.setupValidation();

        // Asegurar que el modal manager encuentre el panel renderizado
        if (window.loadLucideIcons) loadLucideIcons();
    }
}

export const feedControlsManager = new FeedControlsManager();
