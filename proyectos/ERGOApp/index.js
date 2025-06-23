import data from './componentes/cuestionario-data.js';
// index.js - Sistema de Evaluación Ergonómica
class IndexApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
        ERGOAuth.setupSessionMonitoring();
        if (!this.currentUser) {
            this.showLoginModal();
        }
    }

    checkExistingSession() {
        if (ERGOAuth.checkSession()) {
            this.currentUser = ERGOAuth.getCurrentUser();
            console.log('✅ Sesión válida, usuario:', this.currentUser.nombre);
            this.hidePreloader();
            this.hideLoginModal();
            this.showMainContent();
            this.updateUserInterface();
            this.loadDashboardData();
        } else {
            console.log('🧹 Limpiando sesión...');
            this.hideMainContent();
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
        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');

        if (!usuario || !password) {
            this.showLoginError('Por favor completa todos los campos');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="icon">⏳</span> Verificando...';

        try {
            const userData = await supabase.loginUser(usuario, password);
            if (userData) {
                this.currentUser = userData;
                const expiryTime = new Date().getTime() + ERGOConfig.SESSION_DURATION;
                ERGOStorage.setSession('currentUser', userData);
                ERGOStorage.setSession('sessionExpiry', expiryTime);
                ERGOAuth.updateActivity();
                
                this.hidePreloader();
                this.hideLoginModal();
                this.showMainContent();
                this.updateUserInterface();
                this.loadDashboardData();
            } else {
                this.showLoginError('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            console.error('Error en login:', error);
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
        ERGOAuth.logout();
        setTimeout(() => window.location.reload(), 500);
    }
    
    async loadDashboardData() {
        try {
            const dashboardData = await supabase.getDashboardData();
            this.updateDashboardTables(dashboardData);
            this.updateTopKPIs(dashboardData);
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
        }
    }
    

// REEMPLAZA esta función en index.js

    updateDashboardTables(data) {
        if (!data) return;

        const { areas, topRisk } = data;
        const areasTbody = document.getElementById('areas-table-body');
        const topRiskTbody = document.getElementById('top-risk-table-body');

        if (areasTbody) areasTbody.innerHTML = '';
        if (topRiskTbody) topRiskTbody.innerHTML = '';

        // Rellenar la tabla de Áreas con el número de centros correcto
        if (areas && areas.length > 0 && areasTbody) {
            areas.forEach(area => {
                const score = parseFloat(area.promedio_score || 0);
                const color = ERGOUtils.getScoreColor(score);

                const row = document.createElement('div');
                row.className = 'table-row';
                if (score > 60) row.classList.add('high-risk-row');
                
                // CORRECCIÓN: Se añade la columna 'Centros' que faltaba
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

        // Rellenar la tabla de Top 10 Riesgos con píldoras de colores
        if (topRisk && topRisk.length > 0 && topRiskTbody) {
            topRisk.forEach(centro => {
                const score = parseFloat(centro.score || 0);
                
                // Lógica para determinar la clase de la píldora de riesgo
                let riskClass = '';
                if (score >= 80) riskClass = 'risk-pill critical-risk-glass';
                else if (score >= 60) riskClass = 'risk-pill high-risk-glass';
                else riskClass = 'risk-pill'; // Clase base para estilos de píldora si la tienes
                
                const color = ERGOUtils.getScoreColor(score); // El color de fondo se puede controlar por CSS o aquí

                const row = document.createElement('div');
                row.className = 'table-row';
                if (score > 60) row.classList.add('high-risk-row');
                
                // CORRECCIÓN: Se añade el div con las clases para la píldora de color
                row.innerHTML = `
                    <div class="cell">${centro.area_name || 'Sin área'}</div>
                    <div class="cell">${centro.center_name || 'Sin nombre'}</div>
                    <div class="cell">
                        <div class="${riskClass}" style="background-color: ${score < 60 ? color : ''};">${score.toFixed(2)}%</div>
                    </div>
                `;
                topRiskTbody.appendChild(row);
            });
        } else if (topRiskTbody) {
            topRiskTbody.innerHTML = '<div class="table-row placeholder"><div class="cell" colspan="3">No hay datos de riesgo.</div></div>';
        }

        // Actualizar el promedio general
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
        if (!chartContainer) return;

        const pictogramasBase = {
            R01: { count: 0, nombre: 'Carga Manual', pictograma: '▲', color: '#3498db' },
            R02: { count: 0, nombre: 'Posturas Forzadas', pictograma: '●', color: '#e74c3c' },
            R03: { count: 0, nombre: 'Mov. Repetitivos', pictograma: '↻', color: '#f1c40f' },
            R04: { count: 0, nombre: 'Empuje/Tracción', pictograma: '→', color: '#9b59b6' },
            R05: { count: 0, nombre: 'Circulación y Rampas', pictograma: '⇘', color: '#e67e22' },
            R06: { count: 0, nombre: 'Alcance y Herramientas', pictograma: '🛠️', color: '#34495e' },
            R07: { count: 0, nombre: 'Entorno Visual', pictograma: '💻', color: '#1abc9c' }
        };

        if (areasData) {
            areasData.forEach(area => {
                if (area.resumen_pictogramas) {
                    for (const key in area.resumen_pictogramas) {
                        if (pictogramasBase[key]) {
                            pictogramasBase[key].count += area.resumen_pictogramas[key].count;
                        }
                    }
                }
            });
        }
        
        const pictogramasParaGraficar = Object.values(pictogramasBase);
        const maxCount = Math.max(...pictogramasParaGraficar.map(p => p.count));

        if (maxCount === 0) {
            chartContainer.innerHTML = '<p class="no-data-chart">Aún no hay datos de pictogramas para mostrar.</p>';
            return;
        }
        
        chartContainer.innerHTML = pictogramasParaGraficar.map(data => {
            const height = data.count > 0 ? Math.max(10, (data.count / maxCount) * 100) : 2;
            const barClass = data.count === 0 ? 'empty' : '';

            return `
                <div class="graf-container" title="${data.nombre}: ${data.count} casos">
                    <div class="graf ${barClass}" style="height: ${height}px; background-color: ${data.color};">
                        <span class="graf-count">${data.count}</span>
                    </div>
                    <h4 class="graf-label">${data.pictograma}</h4>
                </div>
            `;
        }).join('');
    }

      async verificarResumenes() {
        console.log("🔎 Verificando datos de resumen en la tabla 'areas'...");
        ERGOUtils.showToast('Verificando datos...', 'info');
        const areasData = await supabase.getAllAreasConResumen(); // Usaremos una nueva función de supabase
        if (areasData) {
            console.log("Este es el contenido actual de la columna 'resumen_pictogramas':");
            console.table(areasData);
            alert("Verificación completada. Revisa la consola (F12) para ver el estado de los datos.");
        } else {
            alert("No se pudo obtener la información de las áreas.");
        }
    }


    async procesarEvaluacionesAntiguas() {
        if (!confirm("Este proceso actualizará TODAS las evaluaciones antiguas con el nuevo análisis de pictogramas. Es lento y solo debe hacerse una vez. ¿Continuar?")) return;

        ERGOUtils.showToast('Iniciando procesamiento de datos antiguos...', 'info');
        try {
            if (typeof data === 'undefined') {
                alert("ERROR: El objeto 'data' con las preguntas no se encontró. Asegúrate de haberlo copiado desde eval_int.js al inicio de este archivo.");
                return;
            }

            const todasLasEvals = await supabase.getAllEvaluations();
            if (!todasLasEvals || todasLasEvals.length === 0) {
                alert("No se encontraron evaluaciones para procesar.");
                return;
            }

            alert(`Se procesarán ${todasLasEvals.length} evaluaciones. Por favor, ten paciencia y no cierres esta ventana. Revisa la consola (F12) para ver el progreso.`);
            let evaluacionesProcesadas = 0;

            for (let i = 0; i < todasLasEvals.length; i++) {
                const evaluacion = todasLasEvals[i];
                
                // --- INICIO DEL BLOQUE DE DEPURACIÓN ---
                try {
                    // Solo procesar si no tiene el nuevo análisis
                    if (!evaluacion.riesgos_por_categoria || !evaluacion.riesgos_por_categoria.resumen) {
                        
                        // Validar que 'respuestas' no sea nulo o inválido
                        if (!evaluacion.respuestas) {
                            console.warn(`Saltando evaluación ${evaluacion.id} porque no tiene respuestas.`);
                            continue; // Saltar a la siguiente iteración
                        }

                        const respuestas = JSON.parse(evaluacion.respuestas);
                        const resultadosPictogramas = ERGOAnalytics.analizarRiesgosPorPictograma(respuestas, data);
                        
                        await supabase.updateEvaluacion(evaluacion.id, { riesgos_por_categoria: resultadosPictogramas });
                        
                        console.log(`✅ (${i + 1}/${todasLasEvals.length}) Evaluación ${evaluacion.id} procesada.`);
                        evaluacionesProcesadas++;
                    }
                } catch (error) {
                    // Si una evaluación falla, nos dirá cuál es y continuará con las demás
                    console.error(`❌ Error procesando la evaluación ${evaluacion.id}. Causa:`, error);
                }
                // --- FIN DEL BLOQUE DE DEPURACIÓN ---
            }
            
            console.log(`Terminado el procesamiento individual. ${evaluacionesProcesadas} evaluaciones fueron actualizadas.`);

            // Una vez que todas las evaluaciones individuales están actualizadas,
            // ahora sí, ejecutamos el script para recalcular los resúmenes por área.
            await this.backfillPictogramSummaries();

        } catch (error) {
            console.error("Error general en el script:", error);
            alert("Ocurrió un error durante el procesamiento. Revisa la consola para más detalles.");
        }
    }
    
    async backfillPictogramSummaries() {
        console.log('--- INICIANDO RELLENO DE RESÚMENES POR ÁREA ---');
        try {
            const todasLasEvaluaciones = await supabase.getAllEvaluations();
            const todasLasAreas = await supabase.getAllAreas();

            if (!todasLasEvaluaciones || !todasLasAreas) {
                ERGOUtils.showToast('No se pudieron obtener los datos para actualizar los resúmenes.', 'error');
                return;
            }

            for (const area of todasLasAreas) {
                const evalsDeEstaArea = todasLasEvaluaciones.filter(ev => ev.area_id === area.id);
                if (evalsDeEstaArea.length === 0) continue;

                const resumen = {};
                evalsDeEstaArea.forEach(ev => {
                    if (ev.riesgos_por_categoria) {
                        for (const key in ev.riesgos_por_categoria) {
                            if(key === 'resumen') continue; // Ignorar la clave de resumen
                            const pictoInfo = ev.riesgos_por_categoria[key];
                            if (!resumen[key]) {
                                resumen[key] = {
                                    count: 0,
                                    nombre: ERGOAnalytics.pictogramasConfig[key].nombre,
                                    pictograma: ERGOAnalytics.pictogramasConfig[key].pictograma || '?'
                                };
                            }
                            resumen[key].count++;
                        }
                    }
                });

                await supabase.updateArea(area.id, { resumen_pictogramas: resumen });
                console.log(`✅ Área '${area.name}' actualizada con ${Object.keys(resumen).length} tipos de pictogramas.`);
            }

            ERGOUtils.showToast('¡Actualización de datos completada! Recargando...', 'success');
            setTimeout(() => window.location.reload(), 2000);

        } catch (error) {
            console.error("Error durante el relleno de resúmenes:", error);
            ERGOUtils.showToast('Ocurrió un error durante la actualización de resúmenes.', 'error');
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

