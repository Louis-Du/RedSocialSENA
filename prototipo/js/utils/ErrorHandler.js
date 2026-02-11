/**
 * ErrorHandler - Manejo centralizado de errores
 * 
 * Normaliza errores de diferentes fuentes (localStorage, API, validación)
 * en un formato consistente con código, mensaje y acción sugerida.
 * 
 * Prepara el código para integrarse con respuestas de API REST.
 */

class ErrorHandler {
    constructor() {
        // Códigos de error estándar
        this.ERROR_CODES = {
            // Autenticación
            AUTH_INVALID_CREDENTIALS: 'AUTH_001',
            AUTH_USER_NOT_FOUND: 'AUTH_002',
            AUTH_SESSION_EXPIRED: 'AUTH_003',
            AUTH_UNAUTHORIZED: 'AUTH_004',

            // Validación
            VALIDATION_REQUIRED: 'VAL_001',
            VALIDATION_FORMAT: 'VAL_002',
            VALIDATION_LENGTH: 'VAL_003',
            VALIDATION_TYPE: 'VAL_004',

            // Operaciones de datos
            DATA_NOT_FOUND: 'DATA_001',
            DATA_SAVE_FAILED: 'DATA_002',
            DATA_DELETE_FAILED: 'DATA_003',
            DATA_UPDATE_FAILED: 'DATA_004',

            // Red/API
            NETWORK_ERROR: 'NET_001',
            NETWORK_TIMEOUT: 'NET_002',
            API_ERROR: 'NET_003',
            API_UNAVAILABLE: 'NET_004',

            // Permisos
            PERMISSION_DENIED: 'PERM_001',
            PERMISSION_INVALID: 'PERM_002',

            // General
            UNKNOWN_ERROR: 'GEN_001',
            OPERATION_FAILED: 'GEN_002'
        };

        // Mensajes de error en español
        this.ERROR_MESSAGES = {
            // Autenticación
            AUTH_001: 'Credenciales inválidas. Verifica tus datos.',
            AUTH_002: 'Usuario no encontrado.',
            AUTH_003: 'Tu sesión ha expirado. Por favor, ingresa nuevamente.',
            AUTH_004: 'No tienes autorización para realizar esta acción.',

            // Validación
            VAL_001: 'Este campo es obligatorio.',
            VAL_002: 'El formato ingresado no es válido.',
            VAL_003: 'La longitud del texto no es válida.',
            VAL_004: 'El tipo de dato no es correcto.',

            // Operaciones de datos
            DATA_001: 'No se encontró la información solicitada.',
            DATA_002: 'No fue posible guardar los datos. Intenta de nuevo.',
            DATA_003: 'No fue posible eliminar. Intenta de nuevo.',
            DATA_004: 'No fue posible actualizar. Intenta de nuevo.',

            // Red/API
            NET_001: 'No hay conexión a internet. Verifica tu conexión.',
            NET_002: 'La operación tardó demasiado. Intenta de nuevo.',
            NET_003: 'Error al comunicarse con el servidor.',
            NET_004: 'El servicio no está disponible en este momento.',

            // Permisos
            PERM_001: 'No tienes permiso para realizar esta acción.',
            PERM_002: 'Permisos insuficientes.',

            // General
            GEN_001: 'Ocurrió un error inesperado.',
            GEN_002: 'No fue posible completar la operación.'
        };

        // Acciones sugeridas por tipo de error
        this.SUGGESTED_ACTIONS = {
            AUTH_001: 'Verifica tu documento y contraseña.',
            AUTH_002: 'Verifica que el documento sea correcto.',
            AUTH_003: 'Inicia sesión nuevamente.',
            AUTH_004: 'Contacta al administrador si crees que es un error.',
            
            VAL_001: 'Completa todos los campos requeridos.',
            VAL_002: 'Revisa el formato del campo.',
            VAL_003: 'Ajusta la longitud del texto.',
            
            DATA_002: 'Revisa los datos e intenta guardar nuevamente.',
            DATA_003: 'Intenta eliminar nuevamente.',
            DATA_004: 'Revisa los cambios e intenta actualizar.',
            
            NET_001: 'Verifica tu conexión a internet.',
            NET_002: 'Intenta nuevamente en unos momentos.',
            NET_003: 'Intenta nuevamente o contacta soporte.',
            NET_004: 'Intenta más tarde.',
            
            PERM_001: 'Contacta al administrador.',
            
            GEN_001: 'Intenta nuevamente o contacta soporte.',
            GEN_002: 'Intenta nuevamente.'
        };
    }

    /**
     * Crea un error normalizado
     * @param {string} code - Código de error del catálogo
     * @param {string} customMessage - Mensaje personalizado (opcional)
     * @param {Object} details - Detalles adicionales (opcional)
     * @returns {Object} - Error normalizado
     */
    createError(code, customMessage = null, details = {}) {
        return {
            code: code,
            message: customMessage || this.ERROR_MESSAGES[code] || 'Error desconocido',
            action: this.SUGGESTED_ACTIONS[code] || 'Intenta nuevamente.',
            details: details,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Procesa un error de cualquier fuente y lo normaliza
     * @param {Error|Object|string} error - Error original
     * @param {string} context - Contexto donde ocurrió el error
     * @returns {Object} - Error normalizado
     */
    handleError(error, context = 'unknown') {
        // Si ya es un error normalizado
        if (error.code && error.message && error.action) {
            return error;
        }

        // Si es un Error estándar de JavaScript
        if (error instanceof Error) {
            return this.normalizeJSError(error, context);
        }

        // Si es un objeto con mensaje
        if (typeof error === 'object' && error.message) {
            return this.createError(
                this.ERROR_CODES.UNKNOWN_ERROR,
                error.message,
                { context, originalError: error }
            );
        }

        // Si es un string
        if (typeof error === 'string') {
            return this.createError(
                this.ERROR_CODES.UNKNOWN_ERROR,
                error,
                { context }
            );
        }

        // Caso por defecto
        return this.createError(
            this.ERROR_CODES.UNKNOWN_ERROR,
            'Ocurrió un error inesperado',
            { context, originalError: error }
        );
    }

    /**
     * Normaliza errores de JavaScript nativos
     * @param {Error} error - Error de JavaScript
     * @param {string} context - Contexto
     * @returns {Object} - Error normalizado
     */
    normalizeJSError(error, context) {
        const message = error.message.toLowerCase();

        // Detectar tipo de error por mensaje
        if (message.includes('network') || message.includes('fetch')) {
            return this.createError(this.ERROR_CODES.NETWORK_ERROR, null, { context, stack: error.stack });
        }

        if (message.includes('timeout')) {
            return this.createError(this.ERROR_CODES.NETWORK_TIMEOUT, null, { context, stack: error.stack });
        }

        if (message.includes('credential') || message.includes('password')) {
            return this.createError(this.ERROR_CODES.AUTH_INVALID_CREDENTIALS, null, { context });
        }

        if (message.includes('not found')) {
            return this.createError(this.ERROR_CODES.DATA_NOT_FOUND, null, { context });
        }

        if (message.includes('permission') || message.includes('unauthorized')) {
            return this.createError(this.ERROR_CODES.PERMISSION_DENIED, null, { context });
        }

        // Error genérico
        return this.createError(
            this.ERROR_CODES.UNKNOWN_ERROR,
            error.message,
            { context, stack: error.stack }
        );
    }

    /**
     * Procesa errores de respuestas HTTP (preparado para API)
     * @param {Response} response - Respuesta HTTP
     * @param {Object} data - Datos de respuesta parseados
     * @returns {Object} - Error normalizado
     */
    handleHTTPError(response, data = {}) {
        const status = response.status;

        switch (status) {
            case 400:
                return this.createError(
                    this.ERROR_CODES.VALIDATION_FORMAT,
                    data.message || 'Solicitud inválida',
                    { status, data }
                );
            case 401:
                return this.createError(
                    this.ERROR_CODES.AUTH_UNAUTHORIZED,
                    data.message || 'No autorizado',
                    { status, data }
                );
            case 403:
                return this.createError(
                    this.ERROR_CODES.PERMISSION_DENIED,
                    data.message || 'Acceso denegado',
                    { status, data }
                );
            case 404:
                return this.createError(
                    this.ERROR_CODES.DATA_NOT_FOUND,
                    data.message || 'No encontrado',
                    { status, data }
                );
            case 408:
                return this.createError(
                    this.ERROR_CODES.NETWORK_TIMEOUT,
                    data.message || 'Tiempo de espera agotado',
                    { status, data }
                );
            case 500:
            case 502:
            case 503:
                return this.createError(
                    this.ERROR_CODES.API_UNAVAILABLE,
                    data.message || 'Servicio no disponible',
                    { status, data }
                );
            default:
                return this.createError(
                    this.ERROR_CODES.API_ERROR,
                    data.message || 'Error del servidor',
                    { status, data }
                );
        }
    }

    /**
     * Maneja errores de validación de formularios
     * @param {Object} validationErrors - Errores de validación por campo
     * @returns {Object} - Error normalizado
     */
    handleValidationErrors(validationErrors) {
        const fields = Object.keys(validationErrors);
        const firstError = validationErrors[fields[0]];

        return this.createError(
            this.ERROR_CODES.VALIDATION_FORMAT,
            firstError,
            { fields: validationErrors }
        );
    }

    /**
     * Log de error (preparado para enviar a servicio de logging)
     * @param {Object} error - Error normalizado
     * @param {string} severity - Nivel de severidad: 'low', 'medium', 'high', 'critical'
     */
    logError(error, severity = 'medium') {
        const logEntry = {
            ...error,
            severity,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Por ahora solo console, pero puede enviarse a un servicio
        if (severity === 'critical' || severity === 'high') {
            console.error('❌ [ERROR]', logEntry);
        } else {
            console.warn('⚠️ [WARNING]', logEntry);
        }

        // TODO: Cuando haya backend, enviar a API de logging
        // await fetch('/api/logs/error', { method: 'POST', body: JSON.stringify(logEntry) });
    }
}

export const errorHandler = new ErrorHandler();
