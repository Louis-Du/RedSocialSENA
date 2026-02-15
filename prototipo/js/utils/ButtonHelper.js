export function enableButton(button) {
    button.disabled = false;
}

export function disableButton(button) {
    button.disabled = true;
}
/**
 * ButtonHelper - Helper para estados de botones
 * 
 * Proporciona métodos para manejar estados de loading,
 * disabled y feedback visual en botones.
 */

class ButtonHelper {
    /**
     * Establece un botón en estado de carga
     * @param {HTMLButtonElement} button - Botón
     * @param {string} loadingText - Texto durante carga
     * @returns {Function} - Función para restaurar el estado original
     */
    setLoading(button, loadingText = 'Cargando...') {
        if (!button) return () => {};

        // Guardar estado original
        const originalText = button.innerHTML;
        const originalDisabled = button.disabled;

        // Establecer estado de carga
        button.disabled = true;
        button.classList.add('opacity-75', 'cursor-wait');
        
        button.innerHTML = `
            <svg class="animate-spin inline-block w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${loadingText}
        `;

        // Retornar función para restaurar
        return () => {
            button.innerHTML = originalText;
            button.disabled = originalDisabled;
            button.classList.remove('opacity-75', 'cursor-wait');
        };
    }

    /**
     * Ejecuta una acción async con feedback de loading
     * @param {HTMLButtonElement} button - Botón
     * @param {Function} action - Acción async a ejecutar
     * @param {Object} options - Opciones
     */
    async withLoading(button, action, options = {}) {
        const {
            loadingText = 'Cargando...',
            successText = null,
            errorText = null,
            successDuration = 2000
        } = options;

        const restore = this.setLoading(button, loadingText);

        try {
            const result = await action();

            // Mostrar éxito temporalmente si se especifica
            if (successText) {
                button.innerHTML = `
                    <svg class="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    ${successText}
                `;
                button.classList.add('bg-green-600');
                
                setTimeout(() => {
                    restore();
                    button.classList.remove('bg-green-600');
                }, successDuration);
            } else {
                restore();
            }

            return result;

        } catch (error) {
            // Mostrar error temporalmente si se especifica
            if (errorText) {
                button.innerHTML = `
                    <svg class="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    ${errorText}
                `;
                button.classList.add('bg-red-600');
                
                setTimeout(() => {
                    restore();
                    button.classList.remove('bg-red-600');
                }, successDuration);
            } else {
                restore();
            }

            throw error;
        }
    }

    /**
     * Deshabilita un botón
     * @param {HTMLButtonElement} button - Botón
     * @param {string} reason - Razón (opcional)
     */
    disable(button, reason = null) {
        if (!button) return;

        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
        
        if (reason) {
            button.title = reason;
        }
    }

    /**
     * Habilita un botón
     * @param {HTMLButtonElement} button - Botón
     */
    enable(button) {
        if (!button) return;

        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        button.title = '';
    }

    /**
     * Establece el estado de un grupo de botones
     * @param {HTMLButtonElement[]} buttons - Array de botones
     * @param {boolean} enabled - true para habilitar, false para deshabilitar
     */
    setGroupState(buttons, enabled) {
        buttons.forEach(button => {
            if (enabled) {
                this.enable(button);
            } else {
                this.disable(button);
            }
        });
    }
}

export const buttonHelper = new ButtonHelper();
