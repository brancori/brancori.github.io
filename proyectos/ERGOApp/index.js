import data from './componentes/cuestionario-data.js';
// index.js - Sistema de Evaluación Ergonómica
// REEMPLAZA la clase existente en index.js con este bloque completo


const ERGODashboard = {
  mapContainer: null,
  fullscreenContainer: null,
  fullscreenBody: null,
  originalMapParent: null,
  ergoMapInstance: null,

  initMapFullscreen(mapInstance) {
    this.ergoMapInstance = mapInstance;
    this.mapContainer = document.getElementById("risk-map");
    this.fullscreenContainer = document.getElementById("map-fullscreen");
    this.fullscreenBody = document.querySelector(".map-fullscreen-body");
    this.originalMapParent = this.mapContainer.parentNode;
  },

  openMapFullscreen() {
    if (!this.mapContainer) return; // Salvaguarda

    // Mueve el mapa al contenedor fullscreen
    this.fullscreenBody.appendChild(this.mapContainer);
    this.fullscreenContainer.classList.remove("hidden");
    document.body.style.overflow = 'hidden'; // Evita el scroll

    // Redibuja el mapa para ajustarse al nuevo tamaño
    if (this.ergoMapInstance) {
      this.ergoMapInstance.destroy();
      this.ergoMapInstance = new ERGOMap("risk-map");
    }
  },

  exitFullscreen() {
    if (!this.mapContainer) return; // Salvaguarda

    // Devuelve el mapa a su contenedor original
    this.originalMapParent.appendChild(this.mapContainer);
    this.fullscreenContainer.classList.add("hidden");
    document.body.style.overflow = 'auto'; // Restaura el scroll

    // Redibuja el mapa al tamaño original
    if (this.ergoMapInstance) {
      this.ergoMapInstance.destroy();
      this.ergoMapInstance = new ERGOMap("risk-map");
       ERGODashboard.initMapFullscreen(ergoMapInstance);
    }
  }
};
class IndexApp {
    
    constructor() {
        if (window.ergoAppInstance) {
            return window.ergoAppInstance;
        }

        this.currentUser = null;
        this.mapInstances = [];
        this.currentMapIndex = 0;
        this.mapContainers = [];
        this.isInitialized = false;
        this.sessionCheckInProgress = false;
        
        // Evitar múltiples inicializaciones
        window.ergoAppInstance = this;
        this.init();
        return this;
        
    }

    

    init() {
        if (!window.dataClient || !window.dataClient.supabase) {
    console.error("❌ Supabase client no está inicializado. Verifica supabase-config.js");
    return;
}
        if (this.isInitialized) {
            console.warn('⚠️ IndexApp ya está inicializado');
            return;
        }

        this.setupEventListeners(); 
        this.checkExistingSession();
        ERGOAuth.setupSessionMonitoring();
        this.isInitialized = true;
    }
showLoginForm() {
    // Puede reutilizar tu modal de login
    this.showLoginModal();
}

clearInvalidSession() {
    // Limpiar variables de sesión
    this.currentUser = null;
    ERGOStorage.removeItem('currentUser');
    ERGOStorage.removeItem('sessionToken');
    ERGOStorage.removeItem('sessionExpiry');
    this.hideMainContent();
}
createDefaultMapContainer() {
    const mapSection = document.querySelector('.map-section') || 
                      document.querySelector('#risk-map') ||
                      document.querySelector('.dashboard-content');

    if (document.getElementById('risk-map')) {
        // Ya existe contenedor principal
        return;
    }

    if (mapSection) {
        const defaultContainer = document.createElement('div');
        defaultContainer.className = 'map-instance';
        defaultContainer.id = 'risk-map'; // importante: map.js y otras partes esperan 'risk-map'
        defaultContainer.dataset.mapSource = './assets/acondi.svg'; // valor por defecto
        defaultContainer.dataset.mapName = 'Mapa Principal';

        mapSection.appendChild(defaultContainer);

        // Reintentar setup del carrusel y del mapa
        setTimeout(() => {
            this.setupMapCarousel();
            // si ERGOMap aún no está disponible, intentar cargar
            if (typeof ERGOMap === 'undefined') this.loadERGOMapScript();
        }, 200);
    } else {
        console.warn('No se pudo crear contenedor default de mapa: no hay sección adecuada en DOM');
    }
}

    // Nuevo método para cargar ERGOMap dinámicamente
    loadERGOMapScript() {
        if (document.querySelector('script[src*="map.js"]')) {
            return; // Ya está cargado
        }

        const script = document.createElement('script');
        script.src = './componentes/map.js';
        script.onload = () => {
            console.log('✅ ERGOMap cargado dinámicamente');
            setTimeout(() => this.setupMapCarousel(), 100);
        };
        script.onerror = () => {
            console.error('❌ Error cargando ERGOMap');
        };
        document.head.appendChild(script);
    }

checkExistingSession() {
        if (this.sessionCheckInProgress) {
            console.log('🔄 Verificación de sesión ya en progreso...');
            return;
        }
        
        this.sessionCheckInProgress = true;
        
        try {
            // Intentar inicializar contexto de autenticación
            const authInitialized = ERGOAuth.initializeAuthContext();
            
            if (authInitialized) {
                const user = ERGOAuth.getCurrentUser();
                const token = ERGOStorage.getItem('sessionToken');
                const expiry = ERGOStorage.getItem('sessionExpiry');
                
                // Verificar que la sesión sea válida
                if (user && token && expiry && Date.now() < expiry) {
                    this.currentUser = user;
                    this.hidePreloader();
                    this.hideLoginModal();
                    this.showMainContent();
                    this.updateUserInterface();
                    this.setupRealtimeListeners();
                    
                    // PROBLEMA 3: Mapas no se cargan después del login
                    // SOLUCIÓN: Retrasar inicialización de mapas
                    setTimeout(() => {
                        this.setupMapCarousel();
                        this.loadDashboardData();
                    }, 500);
                    
                } else {
                    // Sesión inválida o expirada
                    this.clearInvalidSession();
                    this.showLoginForm();
                }
            } else {
                this.showLoginForm();
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
            this.clearInvalidSession();
            this.showLoginForm();
        } finally {
            this.sessionCheckInProgress = false;
        }
    }

setupMapCarousel() {
        // Verificar que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupMapCarousel());
            return;
        }

        // Si ya hay mapas inicializados, limpiarlos primero
        if (this.mapInstances.length > 0) {
            console.log('🔄 Limpiando mapas existentes...');
            this.mapInstances.forEach(map => {
                if (map && typeof map.destroy === 'function') {
                    map.destroy();
                }
            });
            this.mapInstances = [];
        }

        this.mapContainers = document.querySelectorAll('.map-instance');
        if (this.mapContainers.length === 0) {
            console.warn('⚠️ No se encontraron contenedores de mapa (.map-instance)');
            // Intentar crear contenedor por defecto si no existe
            this.createDefaultMapContainer();
            return;
        }

        console.log(`🗺️ Inicializando ${this.mapContainers.length} mapas...`);

        this.mapContainers.forEach((container, index) => {
            const mapId = `ergo-map-${index}`;
            container.id = mapId;
            
            if (typeof ERGOMap !== 'undefined') {
                try {
                    const map = new ERGOMap(mapId); 
                    this.mapInstances.push(map);
                    console.log(`✅ Mapa ${index} inicializado`);
                } catch (error) {
                    console.error(`Error creando mapa ${index}:`, error);
                }
            } else {
                console.error(`Error: ERGOMap no está definido al crear mapa ${index}`);
                // Intentar cargar ERGOMap si no está disponible
                this.loadERGOMapScript();
            }
        });
        
        if (this.mapInstances.length > 0) {
            this.showMap(this.currentMapIndex);
            this.setupMapNavigation();
        }
    }

        setupMapNavigation() {
        const prevBtn = document.getElementById('prev-map-btn');
        const nextBtn = document.getElementById('next-map-btn');
        
        // Remover listeners anteriores para evitar duplicados
        if (prevBtn) {
            prevBtn.replaceWith(prevBtn.cloneNode(true));
            document.getElementById('prev-map-btn').addEventListener('click', () => this.showPreviousMap());
        }
        if (nextBtn) {
            nextBtn.replaceWith(nextBtn.cloneNode(true));
            document.getElementById('next-map-btn').addEventListener('click', () => this.showNextMap());
        }
    }

showMap(index) {
    // Validar índice
    if (index < 0 || index >= this.mapContainers.length) {
        console.warn('Índice de mapa inválido:', index);
        return;
    }

    // Ocultar todos los mapas
    this.mapContainers.forEach(container => container.classList.remove('active'));
    
    // Mostrar mapa activo
    const activeMapContainer = this.mapContainers[index];
    activeMapContainer.classList.add('active');
    
    // Actualizar título
    const mapTitle = document.getElementById('map-title');
    if (mapTitle) {
        mapTitle.textContent = activeMapContainer.dataset.mapName || 'Mapa de Riesgos';
    }
    
    // Actualizar instancia de mapa con datos si están disponibles
    if (this.mapInstances[index] && this.areas && this.areas.length > 0) {
        this.mapInstances[index].updateRiskData(this.areas);
    }
    
    this.currentMapIndex = index;
}

showNextMap() {
    let newIndex = (this.currentMapIndex + 1) % this.mapContainers.length;
    this.showMap(newIndex);
}

showPreviousMap() {
    let newIndex = this.currentMapIndex - 1;
    if (newIndex < 0) {
        newIndex = this.mapContainers.length - 1; // Va al final
    }
    this.showMap(newIndex);
}


    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        const goToAreasBtn = document.getElementById('goToAreasBtn');
        if (goToAreasBtn) goToAreasBtn.addEventListener('click', () => this.navigateToAreas());

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());

        const passwordInput = document.getElementById('password');
        if (passwordInput) passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleLogin(e);
            }
        });
    }

async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');

        if (!email || !password) {
            this.showLoginError('Por favor completa todos los campos');
            return;
        }
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="icon">⏳</span> Verificando...';

        try {
            const authResult = await authClient.login(email, password);

            if (authResult && authResult.user) {
                dataClient.setAuth(authResult.session.access_token);
                this.currentUser = authResult.user;
                
                // --- INICIO DE LA CORRECCIÓN ---
                // Se reemplaza el tiempo de expiración fijo de 8 horas por el real que entrega Supabase.
                // Se multiplica por 1000 porque Supabase devuelve el tiempo en segundos y JavaScript usa milisegundos.
                const expiryTime = authResult.session.expires_at * 1000; 
                // --- FIN DE LA CORRECCIÓN ---

                ERGOStorage.setItem('currentUser', this.currentUser);
                ERGOStorage.setItem('sessionToken', authResult.session.access_token);
                ERGOStorage.setItem('sessionExpiry', expiryTime);
                
                
                this.hidePreloader();
                this.hideLoginModal();
                this.showMainContent();
                this.updateUserInterface();
                this.loadDashboardData();
            } else {
                this.showLoginError('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            console.error('Error en el flujo de login:', error);
            this.showLoginError('Error de conexión. Intenta nuevamente.');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span class="icon">🔐</span> Iniciar Sesión';
        }
    }

    showLoginError(message) {
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
        }
    }

    showLoginModal() { ERGOModal.open('loginModal'); }
    hideLoginModal() { ERGOModal.close('loginModal'); }

    hidePreloader() {
        const preloader = document.getElementById('preloader-overlay');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => { preloader.style.display = 'none'; }, 500);
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;
        document.getElementById('userName').textContent = this.currentUser.nombre || 'Usuario';
        document.getElementById('userRole').textContent = this.currentUser.puesto || 'Sin cargo definido';
        if (this.ergoMap) {
            this.loadMapData();
        }
    }

async loadMapData() {
    const localStorageKey = 'workCentersWithRisk';

    // 1. Intenta cargar desde la Caché
    const cachedData = LocalStorageCache.loadCachedData(localStorageKey);
    if (cachedData) {
        console.log('📦 Mapa cargado desde: Caché (LocalStorage)');
        this.ergoMap.update(cachedData);
    }

    // 2. Busca datos frescos en la Red
    try {
        const freshData = await dataClient.getWorkCentersWithRisk();
        if (freshData) {
            if (JSON.stringify(freshData) !== JSON.stringify(cachedData)) {
                console.log('🌐 Mapa actualizado desde: Red (Supabase)');
                this.ergoMap.update(freshData);
                LocalStorageCache.cacheData(localStorageKey, freshData);
            } else {
                // Si los datos no han cambiado, no hacemos nada, pero es bueno saberlo.
                console.log('✔️ Los datos de la caché ya estaban actualizados.');
            }
        }
    } catch (error) {
        console.error('❌ Error al buscar datos frescos para el mapa.', error);
    }
}

    setupRealtimeListeners() {
        // Verificar si ya existe una suscripción antes de crear nueva
        if (window.realtimeSubscriptions && window.realtimeSubscriptions['dashboard-updates']) {
            console.log('⚠️ Suscripción realtime ya existe, saltando...');
            return;
        }

        realtimeClient.subscribeAndCache(
            'dashboard-updates',
            'evaluaciones',
            (payload) => {
                console.log('⚡ ¡Actualización Realtime recibida! Refrescando el mapa...');
                this.loadMapData();
            },
            'evaluaciones_cache_dummy'
        );
    }

showMainContent() {
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'block'; // Mostrar primero
        container.classList.add('authenticated'); // Luego animar
        
        // Forzar reflow para que la animación funcione
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 50);
    }
}

hideMainContent() {
    const container = document.querySelector('.container');
    if (container) {
        container.classList.remove('authenticated');
        container.style.display = 'none';
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
    }
}

    navigateToAreas() {
        ERGOAuth.updateActivity();
        if (!this.currentUser) {
            ERGOUtils.showToast('Debes iniciar sesión primero', 'error');
            this.showLoginModal();
            return;
        }
        ERGONavigation.navigateToAreas();
    }

    handleLogout() {
        // Simplemente llama a la función global. ¡Eso es todo!
        ERGOAuth.logout();
    }
    
async loadDashboardData() {
    const maxRetries = 3;
    let currentRetry = 0;

    // 1. Cargar cache antes de intentar Supabase
    const cached = ERGOStorage.getItem("dashboardData");
    if (cached) {
        console.log("📦 Dashboard cargado desde cache");
        this.updateDashboardTables(cached);
        this.updateTopKPIs(cached);
        if (this.mapInstances?.length > 0) {
            this.mapInstances.forEach(mapInstance => {
                if (mapInstance?.updateRiskData) {
                    mapInstance.updateRiskData(cached.areas || []);
                }
            });
        }
    }

    while (currentRetry < maxRetries) {
        try {
            console.log(`📊 Cargando datos del dashboard (intento ${currentRetry + 1}/${maxRetries})`);

            // Verificar cliente
            if (!window.dataClient) {
                throw new Error("dataClient no está inicializado");
            }

            // Consultar Supabase
            const [dashboardData, pictogramSummary] = await Promise.all([
                window.dataClient.getDashboardData(),
                window.dataClient.getGlobalPictogramSummary()
            ]);

            if (!dashboardData) throw new Error("No se recibieron datos del dashboard");

            // 2. Actualizar UI con datos frescos
            this.updateDashboardTables(dashboardData);
            this.updateTopKPIs(dashboardData);
            this.renderGlobalRiskChart(pictogramSummary);

            // 3. Guardar cache
            ERGOStorage.setItem("dashboardData", dashboardData);

            // Actualizar mapas
            if (this.mapInstances?.length > 0) {
                this.mapInstances.forEach(mapInstance => {
                    if (mapInstance?.updateRiskData) {
                        mapInstance.updateRiskData(dashboardData.areas || []);
                    }
                });
            } else {
                console.log("🔄 No hay mapas disponibles, reintentando inicialización...");
                setTimeout(() => {
                    this.setupMapCarousel();
                    if (this.mapInstances.length > 0) {
                        this.loadDashboardData();
                    }
                }, 1000);
            }

            console.log("✅ Datos del dashboard cargados correctamente");
            return;

        } catch (error) {
            currentRetry++;
            console.error(`❌ Error cargando datos del dashboard (intento ${currentRetry}):`, error);

            if (currentRetry < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * currentRetry));
            } else {
                ERGOUtils.showToast("Error al cargar datos del dashboard", "error");
                this.handleDashboardLoadError();
            }
        }
    }
}


        handleDashboardLoadError() {
        // Mostrar datos desde caché si están disponibles
        const cachedAreas = ERGOStorage.getItem('areasCache');
        if (cachedAreas && cachedAreas.data) {
            console.log('📦 Usando datos desde caché');
            this.updateDashboardTables({ areas: cachedAreas.data });
            ERGOUtils.showToast('Mostrando datos desde caché', 'warning');
        } else {
            // Sin datos disponibles
            console.log('❌ Sin datos disponibles');
            this.showNoDashboardData();
        }
    }

        showNoDashboardData() {
        const areasTbody = document.getElementById('areas-table-body');
        const topRiskTbody = document.getElementById('top-risk-table-body');
        
        if (areasTbody) {
            areasTbody.innerHTML = '<div class="table-row"><div class="cell">Error cargando datos. <button onclick="location.reload()">Recargar página</button></div></div>';
        }
        
        if (topRiskTbody) {
            topRiskTbody.innerHTML = '<div class="table-row"><div class="cell">Error cargando datos. <button onclick="location.reload()">Recargar página</button></div></div>';
        }
    }

    updateDashboardTables(data) {
        if (!data) return;

        const { areas, topRisk } = data;
        const areasTbody = document.getElementById('areas-table-body');
        const topRiskTbody = document.getElementById('top-risk-table-body');

        if (areasTbody) areasTbody.innerHTML = '';
        if (topRiskTbody) topRiskTbody.innerHTML = '';

        if (areas && areas.length > 0 && areasTbody) {
            areas.forEach(area => {
                const score = parseFloat(area.promedio_score || 0);
                const color = ERGOUtils.getScoreColor(score);
                const row = document.createElement('div');
                row.className = 'table-row clickable';
                row.setAttribute('onclick', `ERGONavigation.navigateToAreas('${area.id}', '${encodeURIComponent(area.name)}')`);                if (score > 60) row.classList.add('high-risk-row');
                row.innerHTML = `
                    <div class="cell">${area.name || 'Sin nombre'}</div>
                    <div class="cell">
                        <div class="score-indicator" style="background-color: ${color};"></div>
                        ${score.toFixed(2)}%
                    </div>
                    <div class="cell">${area.centros_evaluados} / ${area.total_centros}</div>
                `;
                areasTbody.appendChild(row);
            });
        } else if (areasTbody) {
            areasTbody.innerHTML = '<div class="table-row placeholder"><div class="cell" colspan="3">No hay datos de áreas.</div></div>';
        }

        if (topRisk && topRisk.length > 0 && topRiskTbody) {
            topRisk.forEach(centro => {
                const score = parseFloat(centro.score || 0);
                const row = document.createElement('div');
                row.className = 'table-row clickable';
                row.setAttribute('onclick', `ERGONavigation.navigateToWorkCenter('${centro.work_center_id}', '${centro.area_id}', '${encodeURIComponent(centro.area_name)}', '${encodeURIComponent(centro.center_name)}', '')`);
                
                let riesgoHtml = '';
                if (score >= 60) {
                    const riskClass = score >= 80 ? 'risk-pill critical-risk-glass' : 'risk-pill high-risk-glass';
                    riesgoHtml = `<div class="${riskClass}">${score.toFixed(2)}%</div>`;
                } else {
                    riesgoHtml = `<span>${score.toFixed(2)}%</span>`;
                }

                if (score > 60) row.classList.add('high-risk-row');
                
                row.innerHTML = `
                    <div class="cell">${centro.area_name || 'Sin área'}</div>
                    <div class="cell">${centro.center_name || 'Sin nombre'}</div>
                    <div class="cell">${riesgoHtml}</div>
                `;
                topRiskTbody.appendChild(row);
            });
        } else if (topRiskTbody) {
            topRiskTbody.innerHTML = '<div class="table-row placeholder"><div class="cell" colspan="3">No hay datos de riesgo.</div></div>';
        }

        const promGral = document.getElementById('promedio-general');
        if (promGral) {
             const scoreGlobal = areas && areas.length > 0 
                ? (areas.reduce((sum, area) => sum + parseFloat(area.promedio_calculo || 0), 0) / areas.length).toFixed(2)
                : '0.00';
            promGral.textContent = `${scoreGlobal}%`;
        }
    }

updateTopKPIs(data) {
    const { areas, totalWorkCenters, totalEvaluaciones, score_global } = data;
    
    document.getElementById('kpi-areas-total').textContent = areas ? areas.length : 0;
    document.getElementById('kpi-centros-total').textContent = totalWorkCenters || 0;
    document.getElementById('kpi-evaluaciones-total').textContent = totalEvaluaciones || 0;
    // Usamos el score_global que ya viene calculado correctamente.
    document.getElementById('kpi-score-global').textContent = `${(score_global || 0).toFixed(2)}%`;
}

renderGlobalRiskChart(summary) {
        const chartContainer = document.getElementById('risk-chart');
        if (!chartContainer || !summary) {
            if(chartContainer) chartContainer.innerHTML = '<p class="no-data-chart">No hay datos para la gráfica.</p>';
            return;
        }

        // Extraemos solo los conteos "Crí­ticos" (que en la tabla se muestran como "Alto")
        const riskData = Object.entries(summary).map(([id, data]) => ({
            id: id,
            nombre: ERGOAnalytics.pictogramasConfig[id].nombre,
            count: data.Critico
        })).filter(item => item.count > 0); // Mostramos solo los que tienen al menos un riesgo

        if (riskData.length === 0) {
            chartContainer.innerHTML = '<p class="no-data-chart">✅<br>Sin riesgos de alta prioridad detectados.</p>';
            return;
        }

        // Ordenamos de mayor a menor para ver "de cuál hay más"
        riskData.sort((a, b) => b.count - a.count);

        const maxValue = Math.max(...riskData.map(item => item.count));

        chartContainer.innerHTML = riskData.map(data => {
            const barHeight = maxValue > 0 ? (data.count / maxValue) * 100 : 0;
            return `
                <div class="bar-chart-item" title="${data.nombre}: ${data.count} hallazgos de riesgo alto">
                    <div class="bar-value">${data.count}</div>
                    <div class="bar-wrapper">
                        <div class="bar" style="height: ${barHeight}%;"></div>
                    </div>
                    <div class="bar-label">${data.id}</div>
                </div>
            `;
        }).join('');
    }

    async verificarResumenes() {
        console.log("🔎 Verificando datos de resumen en la tabla 'areas'...");
        ERGOUtils.showToast('Verificando datos...', 'info');
        const areasData = await supabase.getAllAreasConResumen();
        if (areasData) {
            console.log("Este es el contenido actual de la columna 'resumen_pictogramas':");
            console.table(areasData);
            alert("Verificación completada. Revisa la consola (F12) para ver el estado de los datos.");
        } else {
            alert("No se pudo obtener la información de las áreas.");
        }
    }

    async procesarEvaluacionesAntiguas() {
        if (!confirm("Este proceso actualizará TODAS las evaluaciones antiguas. ¿Continuar?")) return;

        ERGOUtils.showToast('Iniciando procesamiento de datos antiguos...', 'info');
        try {
            if (typeof data === 'undefined') {
                alert("ERROR: El objeto 'data' no se encontró.");
                return;
            }

            const todasLasEvals = await supabase.getAllEvaluations();
            if (!todasLasEvals || todasLasEvals.length === 0) {
                alert("No se encontraron evaluaciones para procesar.");
                return;
            }

            alert(`Se procesarán ${todasLasEvals.length} evaluaciones. Revisa la consola (F12) para ver el progreso.`);

            for (let i = 0; i < todasLasEvals.length; i++) {
                const evaluacion = todasLasEvals[i];
                try {
                    if (typeof evaluacion.respuestas !== 'string' || !evaluacion.respuestas.startsWith('{')) {
                        console.warn(`Saltando evaluación ${evaluacion.id} por 'respuestas' no válidas.`);
                        continue;
                    }

                    const respuestas = JSON.parse(evaluacion.respuestas);
                    const resultadosPictogramas = ERGOAnalytics.analizarRiesgosPorPictograma(respuestas, data);
                    await supabase.updateEvaluacion(evaluacion.id, { riesgos_por_categoria: resultadosPictogramas });
                    console.log(`✅ (${i + 1}/${todasLasEvals.length}) Evaluación ${evaluacion.id} procesada.`);

                } catch (error) {
                    console.error(`❌ Error procesando la evaluación ${evaluacion.id}. Causa:`, error);
                }
            }
            
            console.log("Procesamiento individual terminado. Creando resúmenes por área...");
            await this.backfillPictogramSummaries();

        } catch (error) {
            console.error("Error general en el script:", error);
            alert("Ocurrió un error durante el procesamiento. Revisa la consola.");
        }
    }
    
    async backfillPictogramSummaries() {
        console.log('--- INICIANDO RELLENO DE RESÚMENES DE SEVERIDAD POR ÁREA ---');
        try {
            const todasLasEvaluaciones = await supabase.getAllEvaluations();
            const todasLasAreas = await supabase.getAllAreas();

            if (!todasLasEvaluaciones || !todasLasAreas) {
                ERGOUtils.showToast('No se pudieron obtener datos para actualizar resúmenes.', 'error');
                return;
            }

            for (const area of todasLasAreas) {
                const evalsDeEstaArea = todasLasEvaluaciones.filter(ev => ev.area_id === area.id);
                if (evalsDeEstaArea.length === 0) continue;

                const resumenSeveridad = {};

                evalsDeEstaArea.forEach(ev => {
                    if (ev.riesgos_por_categoria) {
                        for (const key in ev.riesgos_por_categoria) {
                            const pictoResultado = ev.riesgos_por_categoria[key];
                            if (!pictoResultado || typeof pictoResultado.severidad === 'undefined') continue;

                            if (!resumenSeveridad[key]) {
                                resumenSeveridad[key] = { severidad: 0 };
                            }

                            if (pictoResultado.severidad > resumenSeveridad[key].severidad) {
                                resumenSeveridad[key].severidad = pictoResultado.severidad;
                            }
                        }
                    }
                });

                await supabase.updateArea(area.id, { resumen_pictogramas: resumenSeveridad });
                console.log(`✅ Área '${area.name}' actualizada con resumen de severidad.`);
            }

            ERGOUtils.showToast('¡Actualización de datos completada! Recargando...', 'success');
            setTimeout(() => window.location.reload(), 2000);

        } catch (error) {
            console.error("Error durante el relleno de resúmenes de severidad:", error);
            ERGOUtils.showToast('Ocurrió un error durante la actualización.', 'error');
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;
        document.getElementById('userName').textContent = this.currentUser.nombre || 'Usuario';
        document.getElementById('userRole').textContent = this.currentUser.puesto || 'Sin cargo definido';

        // Muestra la tarjeta de configuración solo si es admin (rango 1)
        if (this.currentUser.rango === 1) {
            document.getElementById('config-card').style.display = 'block';
        }
    }
}


window.navigateToConfig = function() {
    // La ruta es relativa a index.html
    window.location.href = 'componentes/pages/gestion_usuarios.html';
}
// Funciones auxiliares globales
window.indexApp = null;

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Sistema de Evaluación Ergonómica');
    
    // Verificar que Supabase esté disponible
    if (typeof supabase === 'undefined') {
        console.error('⌧ Supabase no está disponible. Verifica que supabase-config.js esté cargado.');
        alert('Error: No se pudo conectar con la base de datos. Recarga la página.');
        return;
    }

    // SINGLETON: Solo una instancia de la aplicación
    if (window.ergoAppInstance) {
        console.warn('⚠️ Aplicación ya inicializada, evitando duplicación.');
        return;
    }

    try {
        window.ergoAppInstance = new IndexApp();
        console.log('✅ Sistema inicializado correctamente');
    } catch (error) {
        console.error('Error crítico al inicializar la aplicación:', error);
    }
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    // e.error puede ser null; mostrar info útil
    console.error('Error global:', e.message || e.reason || e.error || e);
});
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason || e);
});

// Manejar promesas rechazadas
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});

// === FUNCIONES DEL DASHBOARD ===
window.ERGODashboard = {
    // Navegación desde botones del dashboard
    navigateTo(section) {
        switch(section) {
            case 'centros':
                window.location.href = 'areas.html';
                break;
            case 'mapas':
                ERGOUtils.showToast('Funcionalidad de mapas en desarrollo', 'info');
                break;
            case 'riesgos':
                ERGOUtils.showToast('Vista de riesgos en desarrollo', 'info');
                break;
            case 'ruido':
                ERGOUtils.showToast('Medición de ruido en desarrollo', 'info');
                break;
        }
    },

    // Abrir mapa en fullscreen
    openMapFullscreen() {
        const fullscreen = document.getElementById("map-fullscreen");
        fullscreen.classList.remove("hidden");

        // mover el carrusel al contenedor fullscreen
        const carousel = document.querySelector(".map-carousel");
        const container = document.getElementById("map-carousel-container");
        if (carousel && container) {
            container.appendChild(carousel);
        }
    },

    // Salir del fullscreen
    exitFullscreen() {
        const fullscreen = document.getElementById("map-fullscreen");
        fullscreen.classList.add("hidden");

        // regresar el carrusel a su contenedor original
        const carousel = document.querySelector(".map-carousel");
        const originalContainer = document.getElementById("original-map-container");
        if (carousel && originalContainer) {
            originalContainer.appendChild(carousel);
        }
    }
};

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const main = document.querySelector('.main-content');
    if (main) {
        main.style.setProperty('--scroll-y', scrolled);
        main.classList.add('parallax-scroll');
    }
});

// --- SCRIPT DE ACTUALIZACIÓN (AGREGAR AL FINAL DE index.js) ---

/**
 * Función de 'backfilling' para actualizar evaluaciones antiguas que no tienen
 * el campo 'riesgos_por_categoria' calculado.
 */
// --- REEMPLAZA LA FUNCIÓN CON ESTA VERSIÓN MÁS ROBUSTA ---

async function actualizarEvaluacionesAntiguas() {
    if (!confirm("Este proceso buscará y actualizará TODAS las evaluaciones antiguas. Puede tardar varios minutos y es irreversible. ¿Deseas continuar?")) {
        return;
    }

    try {
        ERGOUtils.showToast('Iniciando actualización... Revisa la consola (F12) para ver el progreso.', 'info');
        
        // --- CORRECCIÓN CLAVE EN LA CONSULTA ---
        // Ahora busca evaluaciones donde la columna es NULA O es un objeto JSON vací­o '{}'.
        const queryFiltro = '?or=(riesgos_por_categoria.is.null,riesgos_por_categoria.eq.{})&select=id,respuestas';
        
        const evaluacionesAntiguas = await dataClient.query('evaluaciones', 'GET', null, queryFiltro);

        if (!evaluacionesAntiguas || evaluacionesAntiguas.length === 0) {
            ERGOUtils.showToast('¡Excelente! No se encontraron evaluaciones antiguas que necesiten ser actualizadas.', 'success');
            return;
        }

        ERGOUtils.showToast(`Se actualizarán ${evaluacionesAntiguas.length} evaluaciones.`, 'info');
        
        for (let i = 0; i < evaluacionesAntiguas.length; i++) {
            const evaluacion = evaluacionesAntiguas[i];
            
            try {
                let respuestasObj;
                if (typeof evaluacion.respuestas === 'string') {
                    respuestasObj = JSON.parse(evaluacion.respuestas);
                } else if (typeof evaluacion.respuestas === 'object' && evaluacion.respuestas !== null) {
                    respuestasObj = evaluacion.respuestas;
                } else {
                    console.warn(`Saltando evaluación ${evaluacion.id}: 'respuestas' tiene un formato no válido.`);
                    continue;
                }
                
                const nuevosResultados = ERGOAnalytics.analizarRiesgosPorPictograma(respuestasObj, data);
                
                await dataClient.updateEvaluacion(evaluacion.id, { 
                    riesgos_por_categoria: nuevosResultados 
                });
                
                console.log(`✅ (${i + 1}/${evaluacionesAntiguas.length}) Evaluación ${evaluacion.id} actualizada.`);

            } catch (error) {
                console.error(`❌ Error procesando la evaluación ${evaluacion.id}. Causa:`, error);
            }
        }
        
        console.log('🎉 ¡Proceso de actualización completado!');
        ERGOUtils.showToast('Todas las evaluaciones antiguas han sido actualizadas.', 'success');

    } catch (error) {
        console.error("Error general en el script de actualización:", error);
        ERGOUtils.showToast("Ocurrió un error durante el proceso. Revisa la consola.", 'error');
    }
}

async function diagnosticarDatos() {
    console.log("--- INICIANDO DIAGNÓSTICO ---");
    try {
        console.log("Obteniendo las 5 evaluaciones más recientes para analizar su estructura...");

        // Consulta que trae todo de las 5 filas más nuevas, sin filtros.
        const evaluacionesRecientes = await dataClient.query(
            'evaluaciones', 'GET', null, '?select=*&order=created_at.desc&limit=5'
        );

        if (!evaluacionesRecientes || evaluacionesRecientes.length === 0) {
            console.error("DIAGNÓSTICO: No se encontró NINGUNA evaluación en la tabla.");
            return;
        }

        console.log("✅ Se encontraron las siguientes evaluaciones. Revisa su estructura:");
        
        // console.table es la mejor forma de visualizar objetos en la consola.
        console.table(evaluacionesRecientes);

        console.log("--- ANÁLISIS ---");
        console.log("Por favor, revisa la tabla de arriba y responde a estas preguntas:");
        console.log("1. En la columna 'riesgos_por_categoria', ¿qué valor ves? ¿Es 'null', '{}', un espacio vacío, o algo más?");
        console.log("2. En la columna 'respuestas', ¿contiene un objeto o un texto que empieza con '{' y termina con '}'?");
        console.log("--- FIN DEL DIAGNÓSTICO ---");

    } catch (error) {
        console.error("Error durante el diagnóstico:", error);
    }
}


document.addEventListener("DOMContentLoaded", () => {
  // Definimos lista de mapas disponibles
  const mapas = [
    { title: "Acondicionado", src: "./assets/acondi.svg" },
    { title: "Almacén Planta", src: "./assets/alma_plant_.svg" },
    { title: "Almacén Deliver", src: "./assets/deliver_.svg" },
    { title: "Laboratorio de Control de Calidad", src: "./assets/Labcoca.svg" },
    { title: "Laboratorio de Microbiologia", src: "./assets/labmicro.svg" },
    { title: "Fabricación", src: "./assets/fabricacion_lineas_curvas.svg" }
  ];

  let currentMap = 0;
  const mapContainer = document.getElementById("risk-map");
  const mapTitle = document.getElementById("map-title");
  let ergoMapInstance = null;

  function loadMap(index) {
    currentMap = index;
    mapContainer.dataset.mapSource = mapas[index].src;
    mapTitle.textContent = mapas[index].title;

    if (ergoMapInstance) {
      ergoMapInstance.destroy();
    }
    ergoMapInstance = new ERGOMap("risk-map");
    ERGODashboard.initMapFullscreen(ergoMapInstance);
  }

  // Controles
  document.getElementById("map-prev").addEventListener("click", () => {
    const newIndex = (currentMap - 1 + mapas.length) % mapas.length;
    loadMap(newIndex);
  });

  document.getElementById("map-next").addEventListener("click", () => {
    const newIndex = (currentMap + 1) % mapas.length;
    loadMap(newIndex);
  });

  // Cargar primer mapa
  loadMap(0);
});

