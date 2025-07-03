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
                
                // --- INICIO DE LA CORRECCIÓN ---
                // Se reemplaza el tiempo de expiración fijo de 8 horas por el real que entrega Supabase.
                // Se multiplica por 1000 porque Supabase devuelve el tiempo en segundos y JavaScript usa milisegundos.
                const expiryTime = authResult.session.expires_at * 1000; 
                // --- FIN DE LA CORRECCIÓN ---

                ERGOStorage.setSession('currentUser', this.currentUser);
                ERGOStorage.setSession('sessionToken', authResult.session.access_token);
                ERGOStorage.setSession('sessionExpiry', expiryTime); // Ahora se guarda el tiempo de expiración correcto
                
                
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
            // Hacemos las consultas en paralelo para mayor eficiencia
            const [dashboardData, pictogramSummary] = await Promise.all([
                dataClient.getDashboardData(),
                dataClient.getGlobalPictogramSummary() // Llamamos a la nueva función
            ]);

            this.updateDashboardTables(dashboardData);
            this.updateTopKPIs(dashboardData);
            this.renderGlobalRiskChart(pictogramSummary); // Llamamos a la nueva función de la gráfica

            // Crear el mapa con los datos (sin cambios)
            if (typeof ERGOMap !== 'undefined' && !this.ergoMap) {
                this.ergoMap = new ERGOMap('risk-map', dashboardData);
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
        
        // La llamada a this.updateRiskChart(areas) que causaba el error ha sido eliminada.
    }

renderGlobalRiskChart(summary) {
        const chartContainer = document.getElementById('risk-chart');
        if (!chartContainer || !summary) {
            if(chartContainer) chartContainer.innerHTML = '<p class="no-data-chart">No hay datos para la gráfica.</p>';
            return;
        }

        // Extraemos solo los conteos "Críticos" (que en la tabla se muestran como "Alto")
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
        // Ahora busca evaluaciones donde la columna es NULA O es un objeto JSON vacío '{}'.
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


document.addEventListener('DOMContentLoaded', () => {
    // ... tu código de inicialización existente ...
    window.indexApp = new IndexApp();

});



