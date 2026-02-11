/**
 * FormValidator - Validación en tiempo real de formularios
 * 
 * Proporciona validación inline con mensajes visibles
 * bajo cada campo para mejorar UX y reducir errores.
 */

class FormValidator {
    constructor() {
        this.validators = {
            required: (value) => value && value.trim() !== '',
            minLength: (value, min) => value.length >= min,
            maxLength: (value, max) => value.length <= max,
            numeric: (value) => /^\d+$/.test(value),
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            documento: (value) => /^\d{6,12}$/.test(value),
            password: (value) => value.length >= 6
        };

        this.messages = {
            required: 'Este campo es obligatorio',
            minLength: (min) => `Mínimo ${min} caracteres`,
            maxLength: (max) => `Máximo ${max} caracteres`,
            numeric: 'Solo se permiten números',
            email: 'Correo electrónico no válido',
            documento: 'Documento debe tener entre 6 y 12 dígitos',
            password: 'La contraseña debe tener al menos 6 caracteres'
        };
    }

    /**
     * Valida un campo individual
     * @param {HTMLElement} field - Campo a validar
     * @param {Array} rules - Reglas de validación
     * @returns {Object} - { valid: boolean, message: string }
     */
    validateField(field, rules = []) {
        const value = field.value;

        for (const rule of rules) {
            const [ruleName, ...params] = Array.isArray(rule) ? rule : [rule];
            const validator = this.validators[ruleName];

            if (!validator) continue;

            const isValid = validator(value, ...params);

            if (!isValid) {
                const message = typeof this.messages[ruleName] === 'function'
                    ? this.messages[ruleName](...params)
                    : this.messages[ruleName];

                return { valid: false, message };
            }
        }

        return { valid: true, message: '' };
    }

    /**
     * Muestra un mensaje de error bajo el campo
     * @param {HTMLElement} field - Campo
     * @param {string} message - Mensaje de error
     */
    showFieldError(field, message) {
        // Buscar o crear contenedor de error
        let errorEl = field.parentElement.querySelector('.field-error');

        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'field-error text-red-600 text-xs mt-1';
            field.parentElement.appendChild(errorEl);
        }

        errorEl.textContent = message;
        field.classList.add('border-red-500');
        field.classList.remove('border-green-500');
    }

    /**
     * Limpia el mensaje de error de un campo
     * @param {HTMLElement} field - Campo
     */
    clearFieldError(field) {
        const errorEl = field.parentElement.querySelector('.field-error');
        if (errorEl) {
            errorEl.textContent = '';
        }
        field.classList.remove('border-red-500');
        field.classList.add('border-green-500');
    }

    /**
     * Configura validación en tiempo real para un campo
     * @param {HTMLElement} field - Campo
     * @param {Array} rules - Reglas de validación
     * @param {Object} options - Opciones adicionales
     */
    setupRealTimeValidation(field, rules, options = {}) {
        const { validateOn = 'blur', showSuccess = false } = options;

        const validate = () => {
            const result = this.validateField(field, rules);

            if (!result.valid) {
                this.showFieldError(field, result.message);
            } else {
                this.clearFieldError(field);
                if (!showSuccess) {
                    field.classList.remove('border-green-500');
                }
            }

            return result.valid;
        };

        // Eventos de validación
        if (validateOn === 'blur') {
            field.addEventListener('blur', validate);
        } else if (validateOn === 'input') {
            field.addEventListener('input', validate);
        } else if (validateOn === 'both') {
            field.addEventListener('blur', validate);
            field.addEventListener('input', validate);
        }

        return validate;
    }

    /**
     * Valida un formulario completo
     * @param {HTMLFormElement} form - Formulario
     * @param {Object} fieldRules - Mapa de campo -> reglas
     * @returns {boolean} - true si el formulario es válido
     */
    validateForm(form, fieldRules) {
        let isValid = true;

        for (const [fieldId, rules] of Object.entries(fieldRules)) {
            const field = form.querySelector(`#${fieldId}`);
            if (!field) continue;

            const result = this.validateField(field, rules);

            if (!result.valid) {
                this.showFieldError(field, result.message);
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        }

        return isValid;
    }

    /**
     * Configura validación para todo un formulario
     * @param {HTMLFormElement} form - Formulario
     * @param {Object} fieldRules - Mapa de campo -> reglas
     * @param {Object} options - Opciones
     */
    setupFormValidation(form, fieldRules, options = {}) {
        const { validateOn = 'blur', submitButtonId = null } = options;

        // Configurar validación por campo
        const validators = {};
        for (const [fieldId, rules] of Object.entries(fieldRules)) {
            const field = form.querySelector(`#${fieldId}`);
            if (!field) continue;

            validators[fieldId] = this.setupRealTimeValidation(field, rules, { validateOn });
        }

        // Validar al enviar
        form.addEventListener('submit', (e) => {
            const isValid = this.validateForm(form, fieldRules);
            if (!isValid) {
                e.preventDefault();
            }
        });

        // Actualizar estado del botón de submit
        if (submitButtonId) {
            const updateSubmitButton = () => {
                const allValid = Object.keys(fieldRules).every(fieldId => {
                    const field = form.querySelector(`#${fieldId}`);
                    return field && this.validateField(field, fieldRules[fieldId]).valid;
                });

                const submitBtn = form.querySelector(`#${submitButtonId}`);
                if (submitBtn) {
                    submitBtn.disabled = !allValid;
                    submitBtn.classList.toggle('opacity-50', !allValid);
                    submitBtn.classList.toggle('cursor-not-allowed', !allValid);
                }
            };

            // Escuchar cambios en todos los campos
            Object.keys(fieldRules).forEach(fieldId => {
                const field = form.querySelector(`#${fieldId}`);
                if (field) {
                    field.addEventListener('input', updateSubmitButton);
                    field.addEventListener('blur', updateSubmitButton);
                }
            });

            // Validación inicial
            updateSubmitButton();
        }
    }
}

export const formValidator = new FormValidator();
