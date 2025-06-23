// globals.js - Funciones globales reutilizables para ERGOApp
// Este archivo debe cargarse antes que cualquier otro script de la aplicación

// ===== CONFIGURACIÓN GLOBAL =====
window.ERGOConfig = {
    USE_SUPABASE: true,
    SUPABASE_URL: 'https://ywfmcvmpzvqzkatbkvqo.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zm1jdm1wenZxemthdGJrdnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzcxMjUsImV4cCI6MjA2NDkxMzEyNX0.WNW_EkEvhyw5p0xrQ4SYv4DORidnONhsr-8vUbdzNKM',
    SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 horas en millisegundos
    ACTIVITY_CHECK_INTERVAL: 60000 // 1 minuto
};

// ===== SISTEMA DE PERMISOS UNIFICADO =====
window.ERGOAuth = {
    getCurrentUser() {
        try {
            const userData = sessionStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    },

    hasPermission(action) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const rango = currentUser.rango;
        
        switch (action) {
            case 'read':
                return [1, 2, 3].includes(rango); // Todos pueden leer
            case 'create':
                return [1, 2].includes(rango); // Admin y Editor
            case 'update':
                return [1].includes(rango); // Solo Admin
            case 'delete':
                return [1].includes(rango); // Solo Admin
            default:
                return false;
        }
    },

    checkPermissionAndShowError(action) {
        if (!this.hasPermission(action)) {
            ERGOUtils.showToast('No tienes permisos para realizar esta acción', 'error');
            return false;
        }
        return true;
    },

    checkSession() {
        const userData = sessionStorage.getItem('currentUser');
        const sessionExpiry = sessionStorage.getItem('sessionExpiry');
        
        if (!userData || !sessionExpiry) {
            return false; // NO redirigir, solo retornar false
        }
        
        if (new Date().getTime() > parseInt(sessionExpiry)) {
            this.logout('Sesión expirada');
            return false;
        }
        
        return true;
    },

    updateActivity() {
        localStorage.setItem('lastActivity', new Date().getTime().toString());
    },
    
    redirectToLogin() {
    const path = window.location.pathname;
    if (path !== '/index.html' && path !== '/') {
        window.location.href = 'index.html';
    }
    },

logout(reason = null) {
    // Limpiar storage
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('sessionExpiry');
    localStorage.removeItem('lastActivity');
    
    if (reason) {
        alert(reason);
    }
    
    // Redirigir directamente si no estamos en index.html
    const path = window.location.pathname;
    if (path !== '/index.html' && path !== '/') {
        window.location.href = 'index.html';
    }
},

    applyPermissionControls() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            console.warn('No hay usuario logueado');
            return;
        }
        
        console.log(`👤 Usuario: ${currentUser.nombre} - Rango: ${currentUser.rango}`);
        
        // Ocultar botones según permisos
        if (!this.hasPermission('create')) {
            this.hideCreateButtons();
        }
        
        if (!this.hasPermission('delete')) {
            this.hideDeleteButtons();
        }
        
        // Mostrar indicador de permisos
        const rangoTexto = {
            1: 'Administrador (CRUD completo)',
            2: 'Editor (Crear y leer)',
            3: 'Visualizador (Solo lectura)'
        };
        
        console.log(`✅ Permisos aplicados: ${rangoTexto[currentUser.rango] || 'Rango desconocido'}`);
    },

    hideCreateButtons() {
        const createButtons = document.querySelectorAll(
            'button[onclick*="openAreaModal"], button[onclick*="openWorkCenterModal"], ' +
            'button[onclick*="openEvaluacionModal"], .btn-add-note'
        );
        createButtons.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
    },

    hideDeleteButtons() {
        const deleteButtons = document.querySelectorAll(
            'button[onclick*="delete"], .btn-danger, .foto-delete'
        );
        deleteButtons.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
    },

    setupSessionMonitoring() {
        // Monitorear actividad cada minuto
        setInterval(() => {
            const lastActivity = localStorage.getItem('lastActivity');
            const sessionExpiry = sessionStorage.getItem('sessionExpiry');
            
            if (lastActivity && sessionExpiry) {
                const now = new Date().getTime();
                const timeSinceActivity = now - parseInt(lastActivity);
                const maxInactivity = 30 * 60 * 1000; // 30 minutos
                
                if (timeSinceActivity > maxInactivity) {
                    this.logout('Sesión cerrada por inactividad');
                }
            }
        }, 60000); // Cada minuto
    }
};

// ===== UTILIDADES GENERALES =====
window.ERGOUtils = {
    generateShortId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    formatDate(dateString) {
        if (!dateString) return 'No especificada';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'hace 1 día';
        } else if (diffDays < 7) {
            return `hace ${diffDays} días`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
        } else {
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    },

    formatDateTime(dateString) {
        if (!dateString) return 'No especificada';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (!toast || !toastMessage) {
            // Fallback a alert si no hay sistema de toast
            alert(message);
            return;
        }
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    getScoreColor(score) {
        if (score <= 25) return "#28a745";
        else if (score <= 50) return "#ffc107";  
        else if (score <= 75) return "#fd7e14";
        else return "#dc3545";
    },

    getScoreCategory(score) {
        if (score <= 25) {
            return {texto: "Riesgo Bajo - Condiciones ergonómicas aceptables", color: "#28a745"};
        } else if (score <= 50) {
            return {texto: "Riesgo Moderado - Se requieren mejoras", color: "#ffc107"};
        } else if (score <= 75) {
            return {texto: "Riesgo Alto - Intervención necesaria", color: "#fd7e14"};
        } else {
            return {texto: "Riesgo Crítico - Intervención urgente", color: "#dc3545"};
        }
    },

    sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    },

    debounce(func, wait) {
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
};


window.ERGONavigation = {
    /**
     * Detecta la ruta base de la aplicación de forma automática.
     * Ejemplo: si estás en "/proyectos/ERGOApp/index.html", esto devolverá "/proyectos/ERGOApp/"
     */
    basePath: (() => {
        const path = window.location.pathname;
        return path.substring(0, path.lastIndexOf('/') + 1);
    })(),

    /**
     * Construye una URL completa y segura a partir de la ruta base detectada.
     */
    buildUrl(filePath, params = {}) {
        // Une la ruta base con el nombre del archivo
        let url = this.basePath + filePath;
        
        // Añade los parámetros
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
            url += '?' + queryString;
        }
        return url;
    },

    navigateToAreas(areaId = null) {
        // La ruta ahora es solo el nombre del archivo
        const url = areaId ? `areas.html#area-${areaId}` : 'areas.html';
        window.location.href = this.basePath + url;
    },

    navigateToWorkCenter(workCenterId, areaId, areaName, centerName, responsible) {
        const params = {
            workCenter: workCenterId,
            area: areaId,
            areaName: areaName || '',
            centerName: centerName || '',
            responsible: responsible || ''
        };
        // La ruta ahora es solo el nombre del archivo, sin './'
        const url = this.buildUrl('centro-trabajo.html', params);
        window.location.href = url;
    },

    navigateToEvaluation(workCenterId, areaId, areaName, centerName, responsible) {
        const params = {
            workCenter: workCenterId,
            area: areaId,
            areaName: areaName || '',
            centerName: centerName || '',
            responsible: responsible || ''
        };
        // La ruta incluye su carpeta
        const url = this.buildUrl('evaluacion_ini/eval_int.html', params);
        window.location.href = url;
    },

    navigateToSpecificEvaluation(type, workCenterId, areaId, areaName, centerName, responsible) {
        const evaluationFiles = {
            'REBA': 'evaluacion_ini/especificas/formulario_reba_completo.html',
            'RULA': 'evaluacion_ini/especificas/formulario_rula_completo.html', 
            'OCRA': 'evaluacion_ini/especificas/formulario_ocra_completo.html',
            'NIOSH': 'evaluacion_ini/especificas/calculadora_niosh_excel.html'
        };
        
        const params = {
            workCenter: workCenterId,
            area: areaId,
            areaName: areaName || '',
            centerName: centerName || '',
            responsible: responsible || '',
            tipo: type
        };
        
        const filePath = evaluationFiles[type] || evaluationFiles['REBA'];
        const url = this.buildUrl(filePath, params);
        window.location.href = url;
    }
};

// ===== MANEJO DE STORAGE =====
window.ERGOStorage = {
    // localStorage helpers
    setLocal(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    getLocal(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    removeLocal(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // sessionStorage helpers
    setSession(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to sessionStorage:', error);
            return false;
        }
    },

    getSession(key, defaultValue = null) {
        try {
            const value = sessionStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Error reading from sessionStorage:', error);
            return defaultValue;
        }
    },

    removeSession(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from sessionStorage:', error);
            return false;
        }
    },

    // Limpieza completa
    clearAll() {
        try {
            sessionStorage.clear();
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
};

// ===== MANEJO DE MODALES =====
window.ERGOModal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;
        
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Focus en el primer input si existe
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
        
        return true;
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;
        
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            // Limpiar formularios dentro del modal
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
        }, 200);
        
        return true;
    },

    setupCloseOnOverlay(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close(modalId);
            }
        });
    }
};

// ===== VALIDACIONES =====
window.ERGOValidation = {
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },

    isValidId(id) {
        return id && id.length >= 3 && /^[A-Z0-9]+$/.test(id);
    },

    validateRequired(fields) {
        const errors = [];
        
        fields.forEach(field => {
            const element = document.getElementById(field.id);
            const value = element ? element.value.trim() : '';
            
            if (!value) {
                errors.push(`${field.name} es requerido`);
                if (element) {
                    element.classList.add('error');
                }
            } else {
                if (element) {
                    element.classList.remove('error');
                }
            }
        });
        
        return errors;
    },

    clearValidationErrors() {
        const errorElements = document.querySelectorAll('.error');
        errorElements.forEach(el => el.classList.remove('error'));
    }
};

// ===== INICIALIZACIÓN GLOBAL =====
window.ERGOGlobal = {
    init() {
        console.log('🌐 ERGOGlobal iniciado');

        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.endsWith('/index.html') || currentPath === '/';

        if (!isLoginPage) {
            console.log('📍 No estamos en login, verificando sesión...');
            if (!ERGOAuth.checkSession()) {
                console.log('❌ Sesión inválida, redirigiendo a login');
                window.location.href = 'index.html'; // Ajusta la ruta si es necesario
                return;
            }
        } else {
            console.log('📍 Estamos en página de login, omitiendo verificación de sesión');
        }

        setInterval(() => {
            if (ERGOAuth.getCurrentUser()) {
                ERGOAuth.updateActivity();
            }
        }, ERGOConfig.ACTIVITY_CHECK_INTERVAL);

        document.addEventListener('DOMContentLoaded', () => {
            ERGOAuth.applyPermissionControls();
        });

        window.addEventListener('error', (event) => {
            console.error('Error global:', event.error);
        });

        console.log('✅ ERGOGlobal configurado correctamente');
    }
};

// ===== AUTO-INICIALIZACIÓN =====
ERGOGlobal.init();

// ===== AUTO-INICIALIZACIÓN =====
// Inicializar automáticamente cuando se carga el script
ERGOGlobal.init();