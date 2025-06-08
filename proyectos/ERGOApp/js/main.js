// ===== ARCHIVO PRINCIPAL DE INICIALIZACIÓN =====

import { SUPABASE_CONFIG, APP_CONFIG } from './core/constants.js';
import { initializeDataManager } from './core/data-manager.js';
import { messageManager, loadingManager } from './modules/ui-helpers.js';

class AppInitializer {
    constructor() {
        this.supabaseClient = null;
        this.dataManager = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log(`🚀 Inicializando ${APP_CONFIG.name} v${APP_CONFIG.version}`);
            
            // Mostrar loading
            loadingManager.show();
            
            // Inicializar Supabase
            await this.initializeSupabase();
            
            // Inicializar DataManager
            await this.initializeDataManager();
            
            // Configurar app
            this.setupApp();
            
            this.isInitialized = true;
            
            console.log('✅ Aplicación inicializada correctamente');
            messageManager.success('Aplicación lista para usar');
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            messageManager.error(`Error inicializando: ${error.message}`);
            throw error;
        } finally {
            loadingManager.hide();
        }
    }

    async initializeSupabase() {
        try {
            // Validar configuración
            if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
                throw new Error('Configuración de Supabase incompleta');
            }

            // Verificar que Supabase esté disponible
            if (!window.supabase) {
                // Intentar importar desde CDN si no está disponible
                await this.loadSupabaseFromCDN();
            }

            if (!window.supabase) {
                throw new Error('Cliente de Supabase no disponible');
            }

            this.supabaseClient = window.supabase;
            console.log('✅ Supabase inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
            throw new Error(`Error de Supabase: ${error.message}`);
        }
    }

    async loadSupabaseFromCDN() {
        // Esta función se ejecutaría si el cliente de Supabase no está disponible
        // En tu caso, ya tienes supabase-client.js, así que esto es un fallback
        console.warn('⚠️ Cliente de Supabase no encontrado, intentando cargar desde CDN...');
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
            script.type = 'module';
            script.onload = () => {
                console.log('✅ Supabase cargado desde CDN');
                resolve();
            };
            script.onerror = () => {
                reject(new Error('No se pudo cargar Supabase desde CDN'));
            };
            document.head.appendChild(script);
            
            // Timeout de 10 segundos
            setTimeout(() => {
                reject(new Error('Timeout cargando Supabase'));
            }, 10000);
        });
    }

    async initializeDataManager() {
        try {
            this.dataManager = await initializeDataManager(this.supabaseClient);
            console.log('✅ DataManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando DataManager:', error);
            throw new Error(`Error de DataManager: ${error.message}`);
        }
    }

    setupApp() {
        // Configurar eventos globales
        this.setupGlobalEvents();
        
        // Configurar service worker si está disponible
        this.setupServiceWorker();
        
        // Configurar manejo de errores
        this.setupErrorHandling();
        
        // Configurar configuraciones específicas del dispositivo
        this.setupDeviceSpecificConfig();
    }

    setupGlobalEvents() {
        // Evento de visibilidad de página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.dataManager) {
                // Verificar conexión cuando la página vuelve a ser visible
                this.dataManager.testConnection().then(isConnected => {
                    if (!isConnected) {
                        messageManager.warning('⚠️ Conexión a la base de datos perdida');
                    }
                });
            }
        });

        // Evento de conexión de red
        window.addEventListener('online', () => {
            messageManager.info('🌐 Conexión restaurada');
            if (this.dataManager) {
                this.dataManager.testConnection();
            }
        });

        window.addEventListener('offline', () => {
            messageManager.warning('📡 Sin conexión a internet');
        });

        // Evento antes de cerrar/recargar
        window.addEventListener('beforeunload', (e) => {
            // Verificar si hay cambios sin guardar
            const hasUnsavedChanges = this.checkUnsavedChanges();
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '¿Tienes cambios sin guardar. ¿Estás seguro de salir?';
            }
        });
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('❌ Error registrando Service Worker:', error);
                });
        }
    }

    setupErrorHandling() {
        // Manejo de errores no capturados
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise no manejada:', event.reason);
            messageManager.error('Error inesperado en la aplicación');
            event.preventDefault();
        });

        // Manejo de errores de JavaScript
        window.addEventListener('error', (event) => {
            console.error('Error de JavaScript:', event.error);
            messageManager.error('Error en la aplicación');
        });
    }

    setupDeviceSpecificConfig() {
        // Configuración para dispositivos móviles
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Prevenir zoom con doble tap
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (event) => {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);

            // Configurar viewport para móviles
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
        }

        // Configuración específica para EMUI/HarmonyOS
        if (/EMUI|HarmonyOS|Huawei/i.test(navigator.userAgent)) {
            console.log('📱 Dispositivo EMUI/Huawei detectado - configurando optimizaciones');
            // Configuraciones específicas para estos dispositivos
            document.documentElement.style.setProperty('--webkit-optimization', 'optimizeSpeed');
        }
    }

    checkUnsavedChanges() {
        // Verificar si hay formularios con cambios no guardados
        const forms = document.querySelectorAll('form');
        for (let form of forms) {
            for (let element of form.elements) {
                if (element.type !== 'submit' && element.type !== 'button') {
                    if (element.value && !element.hasAttribute('data-saved')) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Métodos públicos
    getSupabaseClient() {
        return this.supabaseClient;
    }

    getDataManager() {
        return this.dataManager;
    }

    isReady() {
        return this.isInitialized;
    }

    async restart() {
        this.isInitialized = false;
        await this.init();
    }
}

// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================

// Crear instancia global
const appInitializer = new AppInitializer();

// Función de inicialización que puede ser llamada desde cualquier página
export async function initializeApp() {
    if (!appInitializer.isReady()) {
        await appInitializer.init();
    }
    return appInitializer;
}

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeApp();
    } catch (error) {
        console.error('Error en auto-inicialización:', error);
    }
});

// Exportar instancia para uso en otros módulos
export { appInitializer };
export default appInitializer;

// ==========================================
// FUNCIONES GLOBALES PARA COMPATIBILIDAD
// ==========================================

// Estas funciones mantienen compatibilidad con el código existente
window.initializeApp = initializeApp;
window.getDataManager = () => appInitializer.getDataManager();
window.getSupabaseClient = () => appInitializer.getSupabaseClient();