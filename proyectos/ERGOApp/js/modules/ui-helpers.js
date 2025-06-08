// ===== HELPERS DE INTERFAZ DE USUARIO =====

import { MESSAGES, RISK_CATEGORIES } from '../core/constants.js';

// Gestión de mensajes de estado
export class MessageManager {
    constructor(containerId = 'statusMessages') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Contenedor de mensajes ${containerId} no encontrado`);
        }
    }

    show(type, message, duration = 5000) {
        if (!this.container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message status-${type}`;
        messageDiv.textContent = message;
        
        this.container.appendChild(messageDiv);
        
        // Auto-remove después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, duration);
        }
        
        return messageDiv;
    }

    success(message, duration = 5000) {
        return this.show('success', message, duration);
    }

    error(message, duration = 7000) {
        return this.show('error', message, duration);
    }

    warning(message, duration = 6000) {
        return this.show('warning', message, duration);
    }

    info(message, duration = 4000) {
        return this.show('info', message, duration);
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Gestión de spinners de carga
export class LoadingManager {
    constructor() {
        this.activeSpinners = new Set();
    }

    show(spinnerId = 'spinner') {
        const spinner = document.getElementById(spinnerId);
        if (spinner) {
            spinner.classList.remove('hidden');
            this.activeSpinners.add(spinnerId);
        }
    }

    hide(spinnerId = 'spinner') {
        const spinner = document.getElementById(spinnerId);
        if (spinner) {
            spinner.classList.add('hidden');
            this.activeSpinners.delete(spinnerId);
        }
    }

    hideAll() {
        this.activeSpinners.forEach(spinnerId => {
            this.hide(spinnerId);
        });
        this.activeSpinners.clear();
    }

    isActive(spinnerId = 'spinner') {
        return this.activeSpinners.has(spinnerId);
    }
}

// Gestión de modales
export class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.setupGlobalEvents();
    }

    setupGlobalEvents() {
        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });

        // Cerrar modal haciendo clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.close(e.target.id);
            }
        });
    }

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            this.activeModals.add(modalId);
            
            // Focus en el primer input si existe
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            this.activeModals.delete(modalId);
            
            // Limpiar formularios si existen
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
        }
    }

    closeAll() {
        this.activeModals.forEach(modalId => {
            this.close(modalId);
        });
    }

    closeTopModal() {
        if (this.activeModals.size > 0) {
            const topModal = Array.from(this.activeModals).pop();
            this.close(topModal);
        }
    }

    isOpen(modalId) {
        return this.activeModals.has(modalId);
    }
}

// Utilidades para el DOM
export class DOMUtils {
    static createElement(tag, classes = '', content = '') {
        const element = document.createElement(tag);
        if (classes) element.className = classes;
        if (content) element.textContent = content;
        return element;
    }

    static createElementHTML(tag, classes = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (classes) element.className = classes;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static clearContainer(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }

    static hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    static showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    static toggleElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle('hidden');
        }
    }

    static scrollToElement(elementId, behavior = 'smooth') {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior, block: 'start' });
        }
    }
}

// Gestión de riesgo y colores
export class RiskDisplayManager {
    static getRiskCategory(score) {
        const numScore = parseFloat(score);
        
        if (numScore <= RISK_CATEGORIES.LOW.max) {
            return RISK_CATEGORIES.LOW;
        } else if (numScore <= RISK_CATEGORIES.MODERATE.max) {
            return RISK_CATEGORIES.MODERATE;
        } else if (numScore <= RISK_CATEGORIES.HIGH.max) {
            return RISK_CATEGORIES.HIGH;
        } else {
            return RISK_CATEGORIES.CRITICAL;
        }
    }

    static getRiskClass(riskPercentage) {
        if (!riskPercentage || riskPercentage === 0) return 'risk-none';
        
        const category = this.getRiskCategory(riskPercentage);
        return category.class;
    }

    static updateRiskDisplay(elementId, score) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const category = this.getRiskCategory(score);
        element.textContent = score > 0 ? `${score}%` : 'Sin evaluar';
        element.className = `value area-risk ${category.class}`;
        element.style.color = category.color;
    }
}

// Gestión de formularios
export class FormManager {
    static validateRequired(formId, requiredFields) {
        const form = document.getElementById(formId);
        if (!form) return false;

        const errors = [];
        
        requiredFields.forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            if (!field || !field.value.trim()) {
                errors.push(`El campo ${fieldId} es requerido`);
            }
        });

        return errors.length === 0 ? true : errors;
    }

    static getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    static setFormData(formId, data) {
        const form = document.getElementById(formId);
        if (!form) return;

        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"], #${key}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = Boolean(data[key]);
                } else if (field.type === 'radio') {
                    const radioButton = form.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                    if (radioButton) radioButton.checked = true;
                } else {
                    field.value = data[key] || '';
                }
            }
        });
    }

    static clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    static disableForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input, textarea, select, button');
            inputs.forEach(input => input.disabled = true);
        }
    }

    static enableForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input, textarea, select, button');
            inputs.forEach(input => input.disabled = false);
        }
    }
}

// Utilidades de archivo
export class FileUtils {
    static validateFileType(file, allowedTypes) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        return allowedTypes.includes(fileExtension);
    }

    static validateFileSize(file, maxSize) {
        return file.size <= maxSize;
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static downloadFile(content, filename, mimeType = 'application/json') {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
    }

    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsText(file);
        });
    }
}

// Utilidades de fecha y tiempo
export class DateUtils {
    static formatDate(date, locale = 'es-ES') {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString(locale);
    }

    static formatDateTime(date, locale = 'es-ES') {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString(locale);
    }

    static getCurrentDateString() {
        return new Date().toISOString().split('T')[0];
    }

    static getCurrentTimestamp() {
        return new Date().toISOString();
    }

    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
}

// Utilidades de string
export class StringUtils {
    static truncate(str, length, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + suffix;
    }

    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static kebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/\s+/g, '-')
            .toLowerCase();
    }

    static camelCase(str) {
        return str
            .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
            .replace(/^[A-Z]/, char => char.toLowerCase());
    }

    static generateId(prefix = '', suffix = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}${timestamp}_${random}${suffix}`;
    }

    static sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9.-]/gi, '_');
    }
}

// Utilidades de performance
export class PerformanceUtils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static measureTime(label) {
        console.time(label);
        return () => console.timeEnd(label);
    }
}

// Detectores de dispositivo
export class DeviceUtils {
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    static isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    static isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    static isEMUI() {
        return /EMUI|HarmonyOS|Huawei/i.test(navigator.userAgent);
    }

    static getDeviceInfo() {
        return {
            isMobile: this.isMobile(),
            isAndroid: this.isAndroid(),
            isIOS: this.isIOS(),
            isEMUI: this.isEMUI(),
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };
    }
}

// Crear instancias globales
export const messageManager = new MessageManager();
export const loadingManager = new LoadingManager();
export const modalManager = new ModalManager();

// Exportar clases individuales para uso específico
export {
    MessageManager,
    LoadingManager, 
    ModalManager,
    DOMUtils,
    RiskDisplayManager,
    FormManager,
    FileUtils,
    DateUtils,
    StringUtils,
    PerformanceUtils,
    DeviceUtils
};