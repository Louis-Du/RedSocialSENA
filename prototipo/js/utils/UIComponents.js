export function renderComponent(componentName, props) {
    // Renderiza un componente simulado
    return `<div>${componentName}</div>`;
}
/**
 * UIComponents - Componentes UI reutilizables
 * 
 * Proporciona componentes consistentes para estados vacíos,
 * errores, placeholders y otros elementos UI comunes.
 */

class UIComponents {
    /**
     * Genera un estado vacío unificado
     * @param {Object} options - Configuración del empty state
     * @returns {string} - HTML del componente
     */
    emptyState(options = {}) {
        const {
            icon = 'inbox',
            title = 'No hay contenido',
            message = 'Aún no hay información para mostrar aquí',
            actionText = null,
            actionCallback = null,
            actionId = null
        } = options;

        const iconMap = {
            inbox: `<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>`,
            chat: `<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>`,
            post: `<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
            </svg>`,
            user: `<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>`,
            search: `<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>`
        };

        const actionButton = actionText ? `
            <button 
                ${actionId ? `id="${actionId}"` : ''}
                class="mt-4 px-6 py-2 bg-sena-verde hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
                ${actionText}
            </button>
        ` : '';

        const html = `
            <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
                ${iconMap[icon] || iconMap.inbox}
                <h3 class="mt-4 text-lg font-semibold text-gray-700">${title}</h3>
                <p class="mt-2 text-sm text-gray-500 max-w-md">${message}</p>
                ${actionButton}
            </div>
        `;

        // Si hay callback y actionId, adjuntar evento después
        if (actionCallback && actionId) {
            setTimeout(() => {
                const btn = document.getElementById(actionId);
                if (btn) btn.addEventListener('click', actionCallback);
            }, 100);
        }

        return html;
    }

    /**
     * Genera un bloque de error visual
     * @param {Object} options - Configuración del error
     * @returns {string} - HTML del componente
     */
    errorBlock(options = {}) {
        const {
            title = 'Ocurrió un error',
            message = 'No fue posible completar la operación. Por favor, intenta nuevamente.',
            actionText = 'Reintentar',
            actionCallback = null,
            actionId = null,
            type = 'error' // 'error', 'warning', 'info'
        } = options;

        const colorMap = {
            error: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                icon: 'text-red-500',
                title: 'text-red-800',
                text: 'text-red-700',
                button: 'bg-red-600 hover:bg-red-700'
            },
            warning: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                icon: 'text-yellow-500',
                title: 'text-yellow-800',
                text: 'text-yellow-700',
                button: 'bg-yellow-600 hover:bg-yellow-700'
            },
            info: {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                icon: 'text-blue-500',
                title: 'text-blue-800',
                text: 'text-blue-700',
                button: 'bg-blue-600 hover:bg-blue-700'
            }
        };

        const colors = colorMap[type];

        const iconMap = {
            error: `<svg class="w-8 h-8 ${colors.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
            warning: `<svg class="w-8 h-8 ${colors.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>`,
            info: `<svg class="w-8 h-8 ${colors.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        };

        const actionButton = actionText ? `
            <button 
                ${actionId ? `id="${actionId}"` : ''}
                class="mt-4 px-4 py-2 ${colors.button} text-white rounded-lg transition-colors font-medium text-sm"
            >
                ${actionText}
            </button>
        ` : '';

        const html = `
            <div class="${colors.bg} ${colors.border} border-l-4 p-6 rounded-lg">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        ${iconMap[type]}
                    </div>
                    <div class="ml-4 flex-1">
                        <h3 class="text-base font-semibold ${colors.title}">${title}</h3>
                        <p class="mt-1 text-sm ${colors.text}">${message}</p>
                        ${actionButton}
                    </div>
                </div>
            </div>
        `;

        // Si hay callback y actionId, adjuntar evento después
        if (actionCallback && actionId) {
            setTimeout(() => {
                const btn = document.getElementById(actionId);
                if (btn) btn.addEventListener('click', actionCallback);
            }, 100);
        }

        return html;
    }

    /**
     * Genera un placeholder consistente para imágenes
     * @param {Object} options - Configuración del placeholder
     * @returns {string} - HTML del componente
     */
    imagePlaceholder(options = {}) {
        const {
            type = 'post', // 'post', 'avatar', 'banner'
            text = null
        } = options;

        const sizeMap = {
            post: 'aspect-video',
            avatar: 'aspect-square rounded-full w-12 h-12',
            banner: 'aspect-[3/1]'
        };

        const iconMap = {
            post: `<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>`,
            avatar: `<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>`,
            banner: `<svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>`
        };

        return `
            <div class="${sizeMap[type]} bg-gray-100 flex items-center justify-center">
                ${iconMap[type]}
                ${text ? `<span class="text-xs text-gray-500 mt-2">${text}</span>` : ''}
            </div>
        `;
    }

    /**
     * Genera un skeleton loader
     * @param {string} type - Tipo de skeleton ('post', 'comment', 'chat')
     * @returns {string} - HTML del skeleton
     */
    skeleton(type = 'post') {
        const skeletonMap = {
            post: `
                <div class="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div class="flex-1">
                            <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div class="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                    <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            `,
            comment: `
                <div class="bg-gray-50 rounded-lg p-3 animate-pulse">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div class="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div class="h-3 bg-gray-200 rounded w-full"></div>
                </div>
            `,
            chat: `
                <div class="flex items-center gap-3 p-3 animate-pulse">
                    <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                </div>
            `
        };

        return skeletonMap[type] || skeletonMap.post;
    }
}

export const uiComponents = new UIComponents();
