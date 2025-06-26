import data from './componentes/cuestionario-data.js';
// index.js - Sistema de Evaluación Ergonómica
// REEMPLAZA la clase existente en index.js con este bloque completo
class IndexApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession(); // Ahora encontrará la función de abajo
        ERGOAuth.setupSessionMonitoring();
        if (!this.currentUser) {
            this.showLoginModal();
        }
    }

checkExistingSession() {
    if (ERGOAuth.initializeAuthContext()) {
        this.currentUser = ERGOAuth.getCurrentUser();
        
        this.hidePreloader();
        this.hideLoginModal();
        this.showMainContent();
        this.updateUserInterface();
        
        // Verificar que ERGOMap esté disponible antes de crear la instancia
        if (typeof ERGOMap !== 'undefined') {
            this.ergoMap = new ERGOMap('risk-map');
        } else {
            console.warn('⚠️ ERGOMap no está disponible aún, se creará después');
            // Reintentar después de un momento
            setTimeout(() => {
                if (typeof ERGOMap !== 'undefined') {
                    this.ergoMap = new ERGOMap('risk-map');
                    console.log('✅ ERGOMap creado con retraso');
                }
            }, 500);
        }
        
        this.loadDashboardData();
        
    } else {
        console.log('🧹 No hay sesión válida. Se mostrará el login.');
        this.hideMainContent();
        this.hidePreloader();
    }
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
                
                const expiryTime = new Date().getTime() + ERGOConfig.SESSION_DURATION;
                ERGOStorage.setSession('currentUser', this.currentUser);
                ERGOStorage.setSession('sessionToken', authResult.session.access_token);
                ERGOStorage.setSession('sessionExpiry', expiryTime);
                
                
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
    }

    showMainContent() {
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'block';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }
    }

    hideMainContent() {
        const container = document.querySelector('.container');
        if (container) container.classList.add('hidden');
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
    try {
        const dashboardData = await dataClient.getDashboardData();
        this.updateDashboardTables(dashboardData);
        this.updateTopKPIs(dashboardData);

        // Crear el mapa aquí con los datos ya disponibles
        if (typeof ERGOMap !== 'undefined' && !this.ergoMap) {
            this.ergoMap = new ERGOMap('risk-map', dashboardData);
            console.log('✅ Mapa creado con datos iniciales');
        } else if (this.ergoMap && dashboardData.areas) {
            this.ergoMap.updateRiskData(dashboardData.areas);
        }

    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
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
        const { areas, totalWorkCenters, totalEvaluaciones } = data;
        const scoreGlobal = areas && areas.length > 0 
            ? (areas.reduce((sum, area) => sum + parseFloat(area.promedio_calculo || 0), 0) / areas.length).toFixed(2)
            : '0.00';
        
        document.getElementById('kpi-areas-total').textContent = areas ? areas.length : 0;
        document.getElementById('kpi-centros-total').textContent = totalWorkCenters || 0;
        document.getElementById('kpi-evaluaciones-total').textContent = totalEvaluaciones || 0;
        document.getElementById('kpi-score-global').textContent = `${scoreGlobal}%`;
        
        this.updateRiskChart(areas);
    }

    updateRiskChart(areasData) {
        const chartContainer = document.getElementById('risk-chart');
        if (!chartContainer || !areasData) return;
        
        const pictogramasInfo = {
            R01: { nombre: 'Carga Manual', pictograma: '▲' },
            R02: { nombre: 'Posturas Forzadas', pictograma: '●' },
            R03: { nombre: 'Mov. Repetitivos', pictograma: '↻' },
            R04: { nombre: 'Empuje/Tracción', pictograma: '→' },
            R05: { nombre: 'Circulación y Rampas', pictograma: '⇘' },
            R06: { nombre: 'Alcance y Herramientas', pictograma: '🛠️' },
            R07: { nombre: 'Entorno Visual', pictograma: '💻' }
        };

        const maxSeveridades = {};

        areasData.forEach(area => {
            if (area.resumen_pictogramas) {
                for (const key in area.resumen_pictogramas) {
                    const severidadEnArea = area.resumen_pictogramas[key].severidad;
                    if (!maxSeveridades[key] || severidadEnArea > maxSeveridades[key]) {
                        maxSeveridades[key] = severidadEnArea;
                    }
                }
            }
        });

        const riesgosPrioritarios = Object.entries(maxSeveridades)
            .map(([id, severidad]) => ({ id, severidad, ...pictogramasInfo[id] }))
            .filter(p => p.severidad >= 2)
            .sort((a, b) => b.severidad - a.severidad);

        if (riesgosPrioritarios.length === 0) {
            chartContainer.innerHTML = '<p class="no-data-chart">✅<br>Sin riesgos de alta prioridad detectados.</p>';
            return;
        }
        
        chartContainer.innerHTML = riesgosPrioritarios.map(data => {
            const severidadInfo = ERGOAnalytics.getNivelSeveridad(data.severidad);
            const height = data.severidad === 3 ? 100 : 60;

            return `
                <div class="graf-container" title="${data.nombre}: Riesgo ${severidadInfo.nivel}">
                    <div class="graf" style="height: ${height}px; background-color: ${severidadInfo.color};">
                    </div>
                    <h4 class="graf-label">${data.pictograma}</h4>
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
}

// Funciones auxiliares globales
window.indexApp = null;

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Sistema de Evaluación Ergonómica');
    
    // Verificar que Supabase esté disponible
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase no está disponible. Verifica que supabase-config.js esté cargado.');
        alert('Error: No se pudo conectar con la base de datos. Recarga la página.');
        return;
    }

    // Inicializar aplicación
    window.indexApp = new IndexApp();
    
    console.log('✅ Sistema inicializado correctamente');
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
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

};
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const main = document.querySelector('.main-content');
    if (main) {
        main.style.setProperty('--scroll-y', scrolled);
        main.classList.add('parallax-scroll');
    }
});

