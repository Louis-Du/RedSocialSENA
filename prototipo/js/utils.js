export function isValidImageFile(file) {
    if (!file) return false;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeMB = 5;
    return validTypes.includes(file.type) && file.size <= maxSizeMB * 1024 * 1024;
}
export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
// utils.js
// Exporta funciones utilitarias globales

export function getFromStorage(key) {
    return JSON.parse(localStorage.getItem(key) || 'null');
}

export function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function removeFromStorage(key) {
    localStorage.removeItem(key);
}

export function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

export function isValidText(text) {
    return typeof text === 'string' && text.trim().length > 0;
}
