/**
 * AI: Ubicación: componentes/pages/globals.js
 * --- Theme Manager ---
 * Gestiona el cambio de tema (claro/oscuro) y guarda la preferencia
 * del usuario en el localStorage.
 */
const themeManager = {
    init() {
        this.toggle = document.getElementById('theme-toggle');
        if (!this.toggle) return;

        // 1. Aplicar tema guardado al cargar
        this.applyTheme(this.getTheme());

        // 2. Escuchar cambios en el interruptor
        this.toggle.addEventListener('change', () => {
            const newTheme = this.toggle.checked ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    },

    getTheme() {
        // Obtiene el tema de localStorage o usa 'light' como predeterminado
        return localStorage.getItem('theme') || 'light';
    },

    setTheme(theme) {
        localStorage.setItem('theme', theme);
        this.applyTheme(theme);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        // Sincronizar el interruptor con el tema actual
        if (this.toggle) {
            this.toggle.checked = theme === 'dark';
        }
    }
};

// Inicializar el gestor de temas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});

// globals.js - Funciones globales reutilizables para ERGOApp
// Este archivo debe cargarse antes que cualquier otro script de la aplicación

// ===== CONFIGURACIÓN GLOBAL =====
window.ERGOConfig = {
    USE_SUPABASE: true,
    SUPABASE_URL: 'https://ywfmcvmpzvqzkatbkvqo.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zm1jdm1wenZxemthdGJrdnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzcxMjUsImV4cCI6MjA2NDkxMzEyNX0.WNW_EkEvhyw5p0xrQ4SYv4DORidnONhsr-8vUbdzNKM',
    SESSION_DURATION: 8 * 60 * 60 * 1000,
    ACTIVITY_CHECK_INTERVAL: 60000
};

// ===== SISTEMA DE PERMISOS UNIFICADO =====
window.ERGOAuth = {
    getCurrentUser: () => ERGOStorage.getItem('currentUser'),

    hasPermission(action) {
        const user = this.getCurrentUser();
        if (!user || !user.rango) return false;
        const rango = user.rango;
        if (rango === 1) return true; // Admin
        if (rango === 2) return ['read', 'create'].includes(action); // Editor
        if (rango === 3) return action === 'read'; // Visualizador
        return false;
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
        // Redirección robusta que funciona desde subcarpetas
        window.location.href = '../index.html';
    },

// En el archivo globals.js, dentro del objeto ERGOAuth

    logout(reason = 'Cierre de sesión manual') {
        console.log(`Cerrando sesión: ${reason}`);
        if (window.authClient) window.authClient.logout();
        ERGOStorage.clearSession();
        // Redirige a la raíz del sitio
        window.location.href = './index.html'; 
    },

        initializeAuthContext() {
        const token = ERGOStorage.getItem('sessionToken');
        const expiry = ERGOStorage.getItem('sessionExpiry');
        const user = ERGOStorage.getItem('currentUser');

        if (!token || !expiry || !user || new Date().getTime() > expiry) {
            if (new Date().getTime() > expiry) this.logout('Sesión expirada');
            return false;
        }
        
        if (window.dataClient && window.dataClient.supabase) {
            window.dataClient.setAuth(token);
            window.dataClient.supabase.auth.setSession({ access_token: token, refresh_token: '' });
            return true;
        }
        return false;
    },
    
    // El resto de funciones se mantienen como estaban
    applyPermissionControls() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;
        if (!this.hasPermission('create')) this.hideCreateButtons();
        if (!this.hasPermission('delete')) this.hideDeleteButtons();
    },
    hideCreateButtons() {
        document.querySelectorAll('button[onclick*="openAreaModal"], button[onclick*="openWorkCenterModal"]').forEach(btn => btn.style.display = 'none');
    },
    hideDeleteButtons() {
        document.querySelectorAll('button[onclick*="deleteArea"], button[onclick*="deleteWorkCenter"]').forEach(btn => btn.style.display = 'none');
    },

    setupSessionMonitoring() {
        // Monitorear actividad cada minuto
        setInterval(() => {
            const lastActivity = localStorage.getItem('lastActivity');
            const sessionExpiry = sessionStorage.getItem('sessionExpiry');
            
            if (lastActivity && sessionExpiry) {
                const now = new Date().getTime();
                const timeSinceActivity = now - parseInt(lastActivity);
                const maxInactivity = 2 * 60 * 60 * 1000; // 2 horas
                
                if (timeSinceActivity > maxInactivity) {
                    this.logout('Sesión cerrada por inactividad');
                }
            }
        }, 60000); // Cada minuto
    },
    initializeAuthContext() {
        const token = ERGOStorage.getItem('sessionToken');
        const expiry = ERGOStorage.getItem('sessionExpiry');
        const user = ERGOStorage.getItem('currentUser');

        if (!token || !expiry || !user) {
            console.error('Auth Fallo: Faltan datos de sesión.');
            return false;
        }
        if (new Date().getTime() > expiry) {
            console.error('Auth Fallo: Sesión expirada.');
            this.logout('Sesión expirada');
            return false;
        }
        try {
            if (window.dataClient && window.dataClient.supabase) {
                window.dataClient.setAuth(token);
                window.dataClient.supabase.auth.setSession({ access_token: token, refresh_token: '' });
                console.log('%cAuth Éxito: Contexto de sesión establecido.', 'color: green; font-weight: bold;');
                return true;
            }
        } catch (e) {
            console.error('Auth Fallo: Error al procesar token.', e);
        }
        
        return false;
    }



};

// ===== UTILIDADES GENERALES =====
window.ERGOUtils = {
    // ... (tus otras funciones como showToast, formatDate, etc.)

    /**
     * Convierte una fecha a un formato de tiempo relativo (ej. "hace 5 minutos").
     * @param {string | Date} date - La fecha a convertir.
     * @returns {string} El texto del tiempo relativo.
     */
    timeAgo: function(date) {
        if (!date) return 'fecha desconocida';

        const now = new Date();
        const past = new Date(date);
        const seconds = Math.floor((now - past) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) {
            const years = Math.floor(interval);
            return `hace ${years} año${years > 1 ? 's' : ''}`;
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            const months = Math.floor(interval);
            return `hace ${months} mes${months > 1 ? 'es' : ''}`;
        }
        interval = seconds / 86400;
        if (interval > 1) {
            const days = Math.floor(interval);
            return `hace ${days} día${days > 1 ? 's' : ''}`;
        }
        interval = seconds / 3600;
        if (interval > 1) {
            const hours = Math.floor(interval);
            return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        }
        interval = seconds / 60;
        if (interval > 1) {
            const minutes = Math.floor(interval);
            return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        }
        return `hace ${Math.floor(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
    },

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
    },
    createWorkCenterCard(center, scoreInfo, areaName, viewType = 'grid') {
    if (viewType === 'list') {
        return `
            <div class="card-list" onclick="ERGONavigation.navigateToWorkCenter('${center.id}', '${center.area_id}', '${encodeURIComponent(areaName)}', '${encodeURIComponent(center.name)}', '${encodeURIComponent(center.responsible)}')">
                <div class="card-list__header">
                    <span class="card-list__id">${center.id}</span>
                    <span class="card-list__name">${center.name}</span>
                </div>
                <div class="card-list__details">
                    <div class="card-list__detail">📍 ${areaName}</div>
                    <div class="card-list__detail">👤 ${center.responsible}</div>
                    <div class="card-list__detail card-list__detail--score">
                        <span class="card-list__score-indicator" style="background-color: ${scoreInfo.color_riesgo};"></span>
                        ${scoreInfo.nivel_riesgo_ergonomico} - ${scoreInfo.categoria_riesgo}
                    </div>
                </div>
                <div class="card-list__footer">${this.formatDate(center.created_at)}</div>
            </div>
        `;
    }
    
    // Vista 'grid' por defecto
    return `
        <div class="card" onclick="ERGONavigation.navigateToWorkCenter('${center.id}', '${center.area_id}', '${encodeURIComponent(areaName)}', '${encodeURIComponent(center.name)}', '${encodeURIComponent(center.responsible)}')">
            <div class="card-header"><div class="card-id">${center.id}</div></div>
            <h3>${center.name}</h3>
            <div class="card-responsible">
                <div style="margin-bottom: 0.5rem;">👤 ${center.responsible}</div>
                <div style="font-size: 0.75rem; color: var(--gray-500); font-weight: 500;">📍 ${areaName}</div>
            </div>
            <div class="summary-badge" style="border-left-color: ${scoreInfo.color_riesgo};">
                📊 Riesgo: ${center.score_actual} - ${scoreInfo.categoria_riesgo}
            </div>
            <div class="card-footer">
                <div class="card-stats">Creado ${this.formatDate(center.created_at)}</div>
            </div>
        </div>
    `;
}
};


window.ERGONavigation = {
    /**
     * Detecta la ruta base del proyecto de forma inteligente.
     * Funciona si la app está en la raíz o en una subcarpeta como /ERGOApp/.
     */
    basePath: (() => {
        const path = window.location.pathname;
        const ergoAppIndex = path.indexOf('/ERGOApp/');
        if (ergoAppIndex > -1) {
            // Si encuentra /ERGOApp/, construye la ruta hasta ese punto
            return path.substring(0, ergoAppIndex + 8); // +8 para incluir "ERGOApp"
        }
        // Si no, asume que está en la raíz (para cuando abres la carpeta ERGOApp directamente)
        return '';
    })(),

    /**
     * Construye una URL completa y segura desde la ruta base detectada.
     */
    buildUrl(filePath, params = {}) {
        const cleanFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        // Combina la base detectada con la ruta del archivo
        let url = `${this.basePath}/${cleanFilePath}`;
        
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
            url += '?' + queryString;
        }
        return url;
    },

    // El resto de las funciones de navegación no cambian, pero ahora usarán buildUrl correctamente
    navigateToAreas(areaId = null, areaName = '') {
        const params = areaId ? { area: areaId, areaName: areaName } : {};
        window.location.href = this.buildUrl('areas.html', params);
    },

    navigateToWorkCenter(workCenterId, areaId, areaName, centerName, responsible) {
        const params = {
            workCenter: workCenterId,
            area: areaId,
            areaName: areaName || '',
            centerName: centerName || '',
            responsible: responsible || ''
        };
        window.location.href = this.buildUrl('centro-trabajo/centro-trabajo.html', params);
    },

    navigateToEvaluation(workCenterId, areaId, areaName, centerName, responsible, evaluacionId) {
        const params = {
            workCenter: workCenterId,
            area: areaId,
            areaName: areaName || '',
            centerName: centerName || '',
            responsible: responsible || '',
            evaluacionId: evaluacionId
        };
        window.location.href = this.buildUrl('componentes/evaluacion_ini/eval_int.html', params);
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
            tipo: type,
            evalId: ERGOUtils.generateShortId()
        };
        const filePath = evaluationFiles[type] || evaluationFiles['REBA'];
        window.location.href = this.buildUrl(`componentes/${filePath}`, params);
    }
};

window.ERGOData = {
    async getWorkCenterScore(workCenterId) {
        try {
            const evaluaciones = await dataClient.getEvaluaciones(workCenterId);
            if (evaluaciones && evaluaciones.length > 0) {
                evaluaciones.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                const evalReciente = evaluaciones[0];
                return {
                    score_actual: evalReciente.score_final || 0,
                    categoria_riesgo: evalReciente.categoria_riesgo || 'Sin datos',
                    color_riesgo: evalReciente.color_riesgo || '#d1d5db',
                    nivel_riesgo_ergonomico: evalReciente.nivel_riesgo_ergonomico || `${evalReciente.score_final || 0}%`
                };
            }
            return { score_actual: 0, categoria_riesgo: 'Sin evaluación', color_riesgo: '#d1d5db', nivel_riesgo_ergonomico: '0%' };
        } catch (error) {
            console.error(`Error getting score for center ${workCenterId}:`, error);
            return { score_actual: 0, categoria_riesgo: 'Error', color_riesgo: '#ef4444', nivel_riesgo_ergonomico: 'Error' };
        }
    },

    async getWorkCenterDetails(workCenterId) {
    try {
        // Esta función asume que tienes un método en tu cliente de datos
        // que consulta la tabla scores_resumen.
        const summary = await dataClient.getScoreSummary(workCenterId);

        if (summary) {
            return {
                score_actual: summary.score_final || 0,
                categoria_riesgo: summary.categoria_riesgo || 'Sin Datos',
                color_riesgo: summary.color_riesgo || '#d1d5db',
                nivel_riesgo_ergonomico: summary.nivel_riesgo_ergonomico || '0%',
                is_closed: summary.is_closed || false
            };
        }
        
        return { score_actual: 0, categoria_riesgo: 'Sin Evaluación', color_riesgo: '#d1d5db', nivel_riesgo_ergonomico: '0%', is_closed: false };

    } catch (error) {
        console.error(`Error getting details for center ${workCenterId}:`, error);
        return { score_actual: 0, categoria_riesgo: 'Error', color_riesgo: '#ef4444', nivel_riesgo_ergonomico: 'Error', is_closed: false };
    }
},

    async loadAreas() {
        try {
            return await dataClient.getAreas();
        } catch (error) {
            console.error('Error loading areas:', error);
            return JSON.parse(localStorage.getItem('areas')) || [];
        }
    },
    
    async loadAllWorkCenters() {
        try {
            return await dataClient.getWorkCenters();
        } catch (error) {
            console.error('Error loading all work centers:', error);
            return JSON.parse(localStorage.getItem('workCenters')) || [];
        }
    }
};



// ===== MANEJO DE STORAGE =====
window.ERGOStorage = {
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error guardando en localStorage ('${key}'):`, e);
        }
    },
    getItem(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error(`Error leyendo de localStorage ('${key}'):`, e);
            return defaultValue;
        }
    },
    removeItem(key) {
        localStorage.removeItem(key);
    },
    clearSession() {
        this.removeItem('currentUser');
        this.removeItem('sessionToken');
        this.removeItem('sessionExpiry');
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

        // El bloque "if (!isLoginPage)" ha sido eliminado.

        // El resto de la función se mantiene igual, lo cual es correcto.
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
