// utils.js - Re-export canónico desde utils/utils.js
// Este archivo existe para compatibilidad con imports relativos tipo '../utils.js'
// La implementación real y completa está en ./utils/utils.js

export {
    escapeHTML,
    isValidText,
    isValidDocument,
    isValidPassword,
    formatTime,
    getRelativeTime,
    generateId,
    generateShortId,
    getFromStorage,
    saveToStorage,
    removeFromStorage,
    readFileAsDataURL,
    isValidImageFile,
    showNotification,
    debug
} from './utils/utils.js';
