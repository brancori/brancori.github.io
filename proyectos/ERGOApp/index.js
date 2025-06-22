// index.js - Sistema de Evaluación Ergonómica
class IndexApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
        
        // AGREGAR:
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
        
        // ← AGREGAR ESTA LÍNEA NUEVA:
        setTimeout(async () => {
            await this.debugAcondicionadoCalculation();
        }, 3000);
        
        return;
    }
    
    console.log('🧹 Limpiando sesión...');
    this.hideMainContent();
}

    // Configurar event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Ir a áreas button
        const goToAreasBtn = document.getElementById('goToAreasBtn');
        if (goToAreasBtn) {
            goToAreasBtn.addEventListener('click', () => this.navigateToAreas());
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Enter key in login form
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleLogin(e);
                }
            });
        }
    }

    // Manejar el login
    async handleLogin(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const loginError = document.getElementById('loginError');
        
        if (!usuario || !password) {
            this.showLoginError('Por favor completa todos los campos');
            return;
        }

        // Mostrar loading
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="icon">⏳</span> Verificando...';
        loginError.style.display = 'none';

        try {
            // Intentar login con Supabase
            const userData = await supabase.loginUser(usuario, password);
            
            if (userData) {
                // Login exitoso
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
                
                // Opcional: log de acceso
                console.log('Usuario logueado:', {
                    nombre: userData.nombre,
                    puesto: userData.puesto,
                    rango: userData.rango
                });
            } else {
                this.showLoginError('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            console.error('Error en login:', error);
            this.showLoginError('Error de conexión. Intenta nuevamente.');
        } finally {
            // Restaurar botón
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span class="icon">🔐</span> Iniciar Sesión';
        }
    }

    // Mostrar error en login
    showLoginError(message) {
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
        }
    }

// Cambiar estas funciones:
showLoginModal() {
    if (typeof ERGOModal === 'undefined') {
        console.error('ERGOModal no está disponible');
        // Fallback temporal
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
        return;
    }
    ERGOModal.open('loginModal');
}

hideLoginModal() {
    if (typeof ERGOModal === 'undefined') {
        console.error('ERGOModal no está disponible');
        // Fallback temporal  
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
        return;
    }
    ERGOModal.close('loginModal');
}
    hidePreloader() {
        const preloader = document.getElementById('preloader-overlay');
        if (preloader) {
            // Inicia la transición de desvanecimiento
            preloader.classList.add('hidden');
            
            // Después de que la animación termine, oculta el elemento
            // para que no ocupe recursos.
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500); // Debe coincidir con la duración de la transición en CSS
        }
    }

    // Actualizar interfaz con datos del usuario
    updateUserInterface() {
        if (!this.currentUser) return;

        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');

        // Mostrar el NOMBRE (no el usuario) en la interfaz
        if (userName) {
            userName.textContent = this.currentUser.nombre || 'Usuario';
        }

        if (userRole) {
            userRole.textContent = this.currentUser.puesto || 'Sin cargo definido';
        }

        // Debug - mostrar estructura del usuario
        console.log('Datos del usuario logueado:', {
            id: this.currentUser.id,
            usuario: this.currentUser.usuario, // Campo para login
            nombre: this.currentUser.nombre,   // Nombre visible
            puesto: this.currentUser.puesto,
            rango: this.currentUser.rango
        });

        // Mostrar permisos en consola para debug
        this.logUserPermissions();
    }

            // AGREGAR estas funciones nuevas:
        showMainContent() {
            const container = document.querySelector('.container');
            if (container) {
                container.style.display = 'block';  // ← Esto debería sobrescribir el CSS
                container.style.opacity = '0';
                container.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    container.style.transition = 'all 0.5s ease';
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                }, 100);
            }
        }

        hideMainContent() {
            const container = document.querySelector('.container');
            if (container) {
                container.classList.add('hidden');
            }
        }
    // Log de permisos del usuario
    logUserPermissions() {
        const rangoTexto = {
            1: 'Administrador (CRUD completo)',
            2: 'Editor (Leer y crear)',
            3: 'Visualizador (Solo lectura)'
        };

        console.log('Permisos del usuario:', {
            rango: this.currentUser.rango,
            descripcion: rangoTexto[this.currentUser.rango] || 'Rango desconocido'
        });
    }

    // Navegar a la página de áreas
navigateToAreas() {
    ERGOAuth.updateActivity();
    if (!this.currentUser) {
        ERGOUtils.showToast('Debes iniciar sesión primero', 'error');
        this.showLoginModal();
        return;
    }
    ERGONavigation.navigateToAreas();
}

    // Manejar logout
handleLogout() {
    this.currentUser = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('sessionExpiry');
    localStorage.removeItem('lastActivity');
    
    
    setTimeout(() => {
        window.location.reload();
    }, 1000); // Wait 1 second before reloading
}


    // Navegar a los centros de trabajo de un área específica
navigateToAreaWorkCenters(areaId, areaName) {
    ERGOAuth.updateActivity();
    if (!this.currentUser) {
        ERGOUtils.showToast('Debes iniciar sesión primero', 'error');
        this.showLoginModal();
        return;
    }
    ERGONavigation.navigateToAreas(areaId);
}

// Navegar a un centro de trabajo específico
navigateToWorkCenter(evaluacion) {
    ERGOAuth.updateActivity();
    if (!this.currentUser) {
        ERGOUtils.showToast('Debes iniciar sesión primero', 'error');
        this.showLoginModal();
        return;
    }
    
    ERGONavigation.navigateToWorkCenter(
        evaluacion.work_center_id || evaluacion.id,
        evaluacion.area_id,
        evaluacion.nombre_area || 'Área',
        evaluacion.center_name || 'Centro',
        evaluacion.responsible || 'N/A'
    );
}

async loadDashboardData() {
    try {
        const [dashboardData, allWorkCenters] = await Promise.all([
            supabase.getDashboardData(),
            supabase.query('work_centers', 'GET', null, '') // Obtenemos la lista completa de centros
        ]);

        dashboardData.allWorkCenters = allWorkCenters || [];

        this.updateDashboardTables(dashboardData);
        this.updateTopKPIs(dashboardData);
        this.initializeMap(dashboardData);
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
    }
}

async initializeMap(dashboardData) {
    if (typeof ERGOMap !== 'undefined') {
        this.map = new ERGOMap('risk-map', dashboardData);
        await this.map.loadSVG('./assets/acondi.svg');
        this.map.updateRiskData(dashboardData.areas);
    }
}

updateDashboardTables(data) {
    const { areas, topRisk, allWorkCenters } = data;

    // ===================================
    // === TABLA 1: PORCENTAJE POR ÁREA ===
    // ===================================
    const areasTableBody = document.getElementById('areas-table-body');
    if (areasTableBody && areas) {
        areasTableBody.innerHTML = '';
        const fragment = document.createDocumentFragment();
        let totalPromedio = 0;

        areas.forEach(area => {
            const row = document.createElement('div');
            row.className = 'table-row'; // Clase genérica para la fila
            row.onclick = () => this.navigateToAreaWorkCenters(area.id, area.name);

            const promedioParaCalculo = parseFloat(area.promedio_calculo || area.promedio_score || 0);
            totalPromedio += promedioParaCalculo;

            const centerCount = allWorkCenters ? allWorkCenters.filter(wc => wc.area_id === area.id).length : 0;
            const centerText = `${centerCount} ${centerCount === 1 ? 'centro' : 'centros'}`;

            // Agregamos clases específicas para alinear cada celda
            row.innerHTML = `
                <div class="cell cell-text">${area.name || 'Área sin nombre'}</div>
                <div class="cell cell-number">${parseFloat(area.promedio_score || 0).toFixed(2)}%</div>
                <div class="cell cell-number">${centerText}</div>
            `;
            // NOTA: Ocultamos la columna de "centros" para coincidir con el diseño de la imagen. Si la necesitas, puedes añadirla aquí.

            fragment.appendChild(row);
        });

        areasTableBody.appendChild(fragment);

        if (areas.length > 0) {
            const promedioGeneral = (totalPromedio / areas.length).toFixed(2);
            const promGeneralCell = document.getElementById('promedio-general');
            if (promGeneralCell) promGeneralCell.textContent = `${promedioGeneral}%`;
        }
    }

    // ========================================
    // === TABLA 2: TOP 10 CENTROS CON RIESGO ===
    // ========================================
const topRiskTableBody = document.getElementById('top-risk-table-body');
if (topRiskTableBody && topRisk) {
    topRiskTableBody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    topRisk.forEach(item => {
        const row = document.createElement('div');
        const riesgo = parseFloat(item.score);
        
        // Determinar las clases según el score
        let riskClass = '';
        let rowClass = 'table-row';
        
        if (riesgo > 80) {
            riskClass = 'critical-risk-glass';
            rowClass = 'table-row high-risk-row';
        } else if (riesgo > 60) {
            riskClass = 'high-risk-glass';
            rowClass = 'table-row high-risk-row';
        } else {
            // Para scores menores, usar el sistema original
            const categoriaRiesgo = ERGOUtils.getScoreCategory(riesgo);
            riskClass = 'normal-risk';
        }
        
        row.className = rowClass;
        row.onclick = () => this.navigateToSpecificEvaluation(item);

        // Generar el HTML según si es riesgo alto o normal
        if (riesgo > 60) {
            // Riesgo alto - usar efecto cristal
            row.innerHTML = `
                <div class="cell cell-text">${item.area_name || 'N/A'}</div>
                <div class="cell cell-text">${item.center_name || 'N/A'}</div>
                <div class="cell cell-risk">
                    <span class="risk-pill ${riskClass}">
                        ${riesgo.toFixed(1)}%
                    </span>
                </div>
            `;
        } else {
            // Riesgo normal - usar sistema original
            const categoriaRiesgo = ERGOUtils.getScoreCategory(riesgo);
            row.innerHTML = `
                <div class="cell cell-text">${item.area_name || 'N/A'}</div>
                <div class="cell cell-text">${item.center_name || 'N/A'}</div>
                <div class="cell cell-risk">
                    <span class="risk-pill" style="background-color: ${categoriaRiesgo.color};">
                        ${riesgo.toFixed(2)}%
                    </span>
                </div>
            `;
        }
        
        fragment.appendChild(row);
    });

    topRiskTableBody.appendChild(fragment);
}
}

// Actualizar KPIs superiores
updateTopKPIs(data) {
    const { areas, topRisk, totalWorkCenters, totalEvaluaciones } = data;
    
    // Corrección: Hacemos que el KPI "Areas Totales" muestre el conteo del array de áreas.
    const totalDeAreas = areas ? areas.length : 0;
    const totalEvals = totalEvaluaciones || 0;
    
    // Calcular score global promedio CON 2 DECIMALES
    const scoreGlobal = areas.length > 0 
        ? (areas.reduce((sum, area) => sum + parseFloat(area.promedio_calculo || 0), 0) / areas.length).toFixed(2)
        : '0.00';
    const totalCentros = data.allWorkCenters ? data.allWorkCenters.length : 0;

    // Actualizar DOM de los KPIs superiores
    const kpiAreasTotal = document.getElementById('kpi-areas-total');
    const kpiCentrosTotal = document.getElementById('kpi-centros-total'); // Nuevo elemento
    const kpiEvaluacionesTotal = document.getElementById('kpi-evaluaciones-total');
    const kpiScoreGlobal = document.getElementById('kpi-score-global');

    // Ahora 'kpi-areas-total' muestra el número correcto de áreas.
    if (kpiAreasTotal) kpiAreasTotal.textContent = totalDeAreas;
    if (kpiCentrosTotal) kpiCentrosTotal.textContent = totalCentros; // Asignamos el valor
    if (kpiEvaluacionesTotal) kpiEvaluacionesTotal.textContent = totalEvals;
    if (kpiScoreGlobal) kpiScoreGlobal.textContent = `${scoreGlobal}%`;

    // Debug - mostrar en consola los valores
    console.log('📊 KPIs actualizados:', {
        totalDeAreas: totalDeAreas, // Actualizado para claridad
        totalEvaluaciones: totalEvals,
        scoreGlobal: scoreGlobal,
        areasConDatos: areas.length
    });

    // Actualizar gráfico de riesgos
    this.updateRiskChart(topRisk);
}

// Actualizar gráfico de riesgos
updateRiskChart(topRisk) {
    const chartContainer = document.getElementById('risk-chart');
    
    if (!chartContainer || !topRisk) return;

    // Agrupar por rangos de riesgo
    const riskRanges = {
        'R01': { count: 0, label: 'Bajo', color: '#28a745' },
        'R02': { count: 0, label: 'Medio', color: '#ffc107' },
        'R03': { count: 0, label: 'Alto', color: '#fd7e14' },
        'R04': { count: 0, label: 'Crítico', color: '#dc3545' }
    };

    topRisk.forEach(item => {
        const score = parseFloat(item.score);
        if (score <= 25) riskRanges.R01.count++;
        else if (score <= 50) riskRanges.R02.count++;
        else if (score <= 75) riskRanges.R03.count++;
        else riskRanges.R04.count++;
    });

    // Generar barras
    const maxCount = Math.max(...Object.values(riskRanges).map(r => r.count));
    const maxHeight = 80;

    chartContainer.innerHTML = Object.entries(riskRanges).map(([key, data]) => {
        const height = maxCount > 0 ? (data.count / maxCount) * maxHeight : 20;
        
        return `
            <div class="graf" style="height: ${height}px; background-color: ${data.color};">
                <h4>${key}</h4>
            </div>
        `;
    }).join('');
}

// Debug específico para el problema de Acondicionado
async debugAcondicionadoCalculation() {
    console.log('🔍 === DEBUG ESPECÍFICO ACONDICIONADO ===');
    
    try {
        // 1. Obtener todos los datos
        const [scores, areas, workCenters] = await Promise.all([
            supabase.query('scores_resumen', 'GET', null, ''),
            supabase.query('areas', 'GET', null, ''),
            supabase.query('work_centers', 'GET', null, '')
        ]);
        
        console.log('📊 Datos totales:', {
            scores: scores?.length || 0,
            areas: areas?.length || 0,
            workCenters: workCenters?.length || 0
        });
        
        // 2. Buscar el área "Acondicionado"
        const acondicionadoArea = areas?.find(area => 
            area.name.toLowerCase().includes('acondicionado')
        );
        
        if (!acondicionadoArea) {
            console.log('❌ No se encontró área Acondicionado');
            console.log('🏢 Áreas disponibles:', areas?.map(a => a.name) || []);
            return;
        }
        
        console.log('✅ Área Acondicionado encontrada:', {
            id: acondicionadoArea.id,
            name: acondicionadoArea.name,
            promedio_score: acondicionadoArea.promedio_score
        });
        
        // 3. Buscar todos los scores de esta área
        const scoresAcondicionado = scores?.filter(score => 
            score.area_id === acondicionadoArea.id
        ) || [];
        
        console.log('📊 Scores de Acondicionado:', {
            cantidad: scoresAcondicionado.length,
            scores: scoresAcondicionado.map(s => ({
                work_center_id: s.work_center_id,
                score_actual: parseFloat(s.score_actual),
                categoria_riesgo: s.categoria_riesgo
            }))
        });
        
        // 4. Calcular promedio manualmente
        if (scoresAcondicionado.length > 0) {
            const suma = scoresAcondicionado.reduce((total, score) => {
                return total + parseFloat(score.score_actual);
            }, 0);
            
            const promedioCalculado = suma / scoresAcondicionado.length;
            
            console.log('🧮 Cálculo manual:', {
                suma: suma.toFixed(2),
                cantidad: scoresAcondicionado.length,
                promedio: promedioCalculado.toFixed(2)
            });
            
            // 5. Comparar con lo que muestra la tabla
            const dashboardData = await supabase.getDashboardData();
            const areaEnDashboard = dashboardData.areas?.find(area => 
                area.id === acondicionadoArea.id
            );
            
            console.log('📋 En dashboard:', {
                promedio_score: areaEnDashboard?.promedio_score || 'No encontrado',
                promedio_calculo: areaEnDashboard?.promedio_calculo || 'No encontrado'
            });
            
        } else {
            console.log('❌ No hay scores para Acondicionado');
        }
        
    } catch (error) {
        console.error('❌ Error en debug Acondicionado:', error);
    }
    
    console.log('🔍 === FIN DEBUG ACONDICIONADO ===');
}



    // Método para verificar el estado de la conexión
    async checkConnection() {
        try {
            await supabase.query('usuarios', 'GET', null, '?limit=1');
            return true;
        } catch (error) {
            console.error('Error de conexión:', error);
            return false;
        }
    } 
    async navigateToSpecificEvaluation(item) {
        if (!this.currentUser) {
            ERGOUtils.showToast('Debes iniciar sesión primero', 'error');
            this.showLoginModal();
            return;
        }

        ERGOAuth.updateActivity();

        try {
            // Buscar el work center ID y área ID desde la base de datos
            const workCenters = await supabase.getWorkCenters();
            const workCenter = workCenters.find(wc => wc.name === item.center_name);
            
            if (workCenter) {
                // Construir URL para ir al centro de trabajo
                const params = new URLSearchParams({
                    workCenter: workCenter.id,
                    area: workCenter.area_id,
                    areaName: item.area_name,
                    centerName: item.center_name,
                    responsible: workCenter.responsible || 'N/A'
                });

                window.location.href = `centro-trabajo.html?${params.toString()}`;
            } else {
                ERGOUtils.showToast('No se pudo encontrar el centro de trabajo', 'error');
            }
        } catch (error) {
            console.error('Error navegando a evaluación:', error);
            ERGOUtils.showToast('Error al navegar al centro', 'error');
        }
    }
// Función de debug para verificar cálculos por área
async debugAreaCalculations() {
    console.log('🔍 Debug de cálculos iniciado...');
    
    try {
        const scores = await supabase.query('scores_resumen', 'GET', null, '');
        const areas = await supabase.query('areas', 'GET', null, '');
        
        console.log('✅ Scores obtenidos:', scores?.length || 0);
        console.log('✅ Áreas obtenidas:', areas?.length || 0);
        
        if (scores && scores.length > 0) {
            console.log('📊 Primeros 3 scores:', scores.slice(0, 3));
        }
        
        if (areas && areas.length > 0) {
            console.log('🏢 Áreas disponibles:', areas.map(a => ({ id: a.id, name: a.name })));
        }
        
    } catch (error) {
        console.error('❌ Error en debug:', error);
    }
}


} //FIN DE INDEXAPP

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

