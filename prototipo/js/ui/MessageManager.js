/**
 * MessageManager - Gestor centralizado de mensajes
 * 
 * Responsabilidades:
 * - Mostrar errores, advertencias, éxito en la UI
 * - Reemplazar alert() con componentes visuales
 * - Mantener consistencia en mensajes
 * - Proporcionar feedback visual al usuario
 */

class MessageManager {
    constructor() {
        this.messageContainer = null;
        this.setupContainer();
    }

    /**
     * Configura el contenedor de mensajes si no existe
     */
    setupContainer() {
        // Buscar contenedor existente
        this.messageContainer = document.getElementById('messageContainer');
        
        // Si no existe, crearlo
        if (!this.messageContainer) {
            this.messageContainer = document.createElement('div');
            this.messageContainer.id = 'messageContainer';
            this.messageContainer.className = 'fixed top-0 left-0 right-0 z-50 pointer-events-none';
            document.body.insertBefore(this.messageContainer, document.body.firstChild);
        }
    }

    /**
     * Muestra un mensaje genérico
     * @param {string} message - Texto del mensaje
     * @param {string} type - 'error', 'warning', 'success', 'info'
     * @param {number} duration - Duración en ms (0 = no auto-cerrar)
     */
    show(message, type = 'info', duration = 4000) {
        const messageEl = document.createElement('div');
        messageEl.className = `messageAlert messageAlert--${type} pointer-events-auto`;
        
        // Icono según tipo
        const iconMap = {
            error: '✕',
            warning: '⚠',
            success: '✓',
            info: 'ℹ'
        };
        
        messageEl.innerHTML = `
            <div class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg">
                <span class="text-xl font-bold">${iconMap[type]}</span>
                <span class="text-sm font-medium">${message}</span>
                <button class="messageAlert__close ml-2 text-lg leading-none">×</button>
            </div>
        `;
        
        // Botón de cerrar
        messageEl.querySelector('.messageAlert__close').addEventListener('click', () => {
            messageEl.remove();
        });
        
        this.messageContainer.appendChild(messageEl);
        
        // Auto-cerrar después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                messageEl.classList.add('messageAlert--exit');
                setTimeout(() => messageEl.remove(), 300);
            }, duration);
        }
        
        return messageEl;
    }

    /**
     * Muestra un error
     * @param {string} message - Texto del error
     */
    error(message) {
        return this.show(message, 'error', 5000);
    }

    /**
     * Muestra una advertencia
     * @param {string} message - Texto de la advertencia
     */
    warning(message) {
        return this.show(message, 'warning', 4000);
    }

    /**
     * Muestra un mensaje de éxito
     * @param {string} message - Texto de éxito
     */
    success(message) {
        return this.show(message, 'success', 3000);
    }

    /**
     * Muestra un mensaje informativo
     * @param {string} message - Texto informativo
     */
    info(message) {
        return this.show(message, 'info', 3000);
    }

    /**
     * Limpia todos los mensajes
     */
    clearAll() {
        if (this.messageContainer) {
            this.messageContainer.innerHTML = '';
        }
    }

    /**
     * Muestra un mensaje de confirmación
     * @param {string} title - Título de la confirmación
     * @param {string} message - Mensaje
     * @param {Function} onConfirm - Callback si confirma
     * @param {Function} onCancel - Callback si cancela
     */
    confirm(title, message, onConfirm, onCancel) {
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'messageDialog__overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease-out forwards;
        `;

        // Crear diálogo
        const dialog = document.createElement('div');
        dialog.className = 'messageDialog';
        dialog.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 24px;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            pointer-events: all;
            animation: scaleIn 0.3s ease-out forwards;
        `;

        // Título
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
            color: #333;
        `;

        // Mensaje
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin: 0 0 24px 0;
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        `;

        // Botones
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            color: #333;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        `;

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirmar';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            background: #DC2626;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        `;

        // Event listeners
        const cleanup = () => {
            overlay.remove();
        };

        cancelBtn.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        confirmBtn.addEventListener('click', () => {
            cleanup();
            if (onConfirm) onConfirm();
        });

        // Cerrar con Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEscape);
                cleanup();
                if (onCancel) onCancel();
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Montar elementos
        buttonsContainer.appendChild(cancelBtn);
        buttonsContainer.appendChild(confirmBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonsContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Focus en botón de confirmación
        confirmBtn.focus();
    }
}

export const messageManager = new MessageManager();
