/**
 * Utilidades globales para la aplicación
 * Incluye helpers para escapado HTML, validaciones, formateo de fechas, etc.
 */

// === ESCAPADO Y SEGURIDAD ===
/**
 * Escapa caracteres HTML especiales para prevenir inyección XSS
 * @param {string} str - Texto a escapar
 * @returns {string} Texto escapado
 */
export function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// === VALIDACIONES ===
/**
 * Valida si un texto no está vacío
 * @param {string} text - Texto a validar
 * @returns {boolean}
 */
export function isValidText(text) {
    return text && text.trim().length > 0;
}

/**
 * Valida si un documento es válido
 * @param {string} tipo - Tipo de documento (CC, TI, CE)
 * @param {string} numero - Número de documento
 * @returns {boolean}
 */
export function isValidDocument(tipo, numero) {
    if (!tipo || !numero) return false;
    const validTypes = ['CC', 'TI', 'CE'];
    if (!validTypes.includes(tipo)) return false;
    return numero.trim().length > 0 && /^\d+$/.test(numero);
}

/**
 * Valida contraseña básica (para demostración)
 * @param {string} password - Contraseña
 * @returns {boolean}
 */
export function isValidPassword(password) {
    return password && password.length >= 6;
}

// === FORMATEO DE FECHAS ===
/**
 * Formatea una fecha al formato de hora colombiano
 * @param {Date|number} date - Fecha a formatear
 * @returns {string} Hora formateada (ej: "14:30")
 */
export function formatTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Retorna texto relativo de tiempo (ej: "Recién publicado", "Hace 5 min")
 * @param {Date|number} date - Fecha a comparar
 * @returns {string}
 */
export function getRelativeTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Recién publicado';
    if (diffMins === 1) return 'Hace 1 minuto';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Hace 1 hora';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
}

// === GENERADOR DE IDS ===
/**
 * Genera un ID único basado en timestamp y random
 * @returns {string} ID único
 */
export function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Genera un ID corto para debugging
 * @returns {string} ID corto
 */
export function generateShortId() {
    return Math.random().toString(36).substr(2, 9);
}

// === LOCALSTORAGE HELPERS ===
/**
 * Obtiene un item de localStorage de forma segura
 * @param {string} key - Clave
 * @param {*} defaultValue - Valor por defecto
 * @returns {*}
 */
export function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

/**
 * Guarda un item en localStorage de forma segura
 * @param {string} key - Clave
 * @param {*} value - Valor a guardar
 * @returns {boolean} true si tuvo éxito
 */
export function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Elimina un item de localStorage
 * @param {string} key - Clave
 */
export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
    }
}

// === ARCHIVOS ===
/**
 * Lee un archivo como Data URL (para previsualizaciones)
 * @param {File} file - Archivo a leer
 * @returns {Promise<string>} Data URL del archivo
 */
export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Valida si un archivo es imagen válida
 * @param {File} file - Archivo a validar
 * @returns {boolean}
 */
export function isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return file && validTypes.includes(file.type) && file.size < 5 * 1024 * 1024; // 5MB max
}

// === NOTIFICACIONES (simple) ===
/**
 * Muestra una notificación al usuario
 * @param {string} message - Mensaje
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duración en ms
 */
export function showNotification(message, type = 'info', duration = 3000) {
    // TODO: Implementar sistema de notificaciones toast
    // Por ahora usa MessageManager directamente desde los componentes
}

// === DEBUG ===
// Control de debug: cambiar a true solo durante desarrollo
const DEBUG_MODE = false;

/**
 * Log de debug condicional - Solo activo cuando DEBUG_MODE = true
 * @param {*} args - Argumentos a loguear
 */
export function debug(...args) {
    if (DEBUG_MODE) {
        console.log('[DEBUG]', ...args);
    }
}
