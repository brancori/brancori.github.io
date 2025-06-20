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
                
                this.hideLoginModal();
                this.showMainContent();
                this.updateUserInterface();
                ERGOUtils.showToast('Bienvenido al sistema', 'success');
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
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        // Limpiar datos localmente (sin usar ERGOAuth.logout)
        this.currentUser = null;
        this.hideMainContent();
        
        // Limpiar storage directamente
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('sessionExpiry');
        localStorage.removeItem('lastActivity');
        
        ERGOUtils.showToast('Sesión cerrada correctamente', 'success');
        
        // Mostrar modal de login
        setTimeout(() => {
            this.showLoginModal();
            document.getElementById('usuario').value = '';
            document.getElementById('password').value = '';
            document.getElementById('loginError').style.display = 'none';
        }, 1000);
    }
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
        const dashboardData = await supabase.getDashboardData();
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
    const { areas, topRisk } = data;
    
    // === TABLA 1: ÁREAS ===
    const areasTableBody = document.getElementById('areas-table-body');
    if (areasTableBody && areas) {
        // Limpiar tabla
        areasTableBody.innerHTML = '';
        
        // Crear filas dinámicamente
        let totalPromedio = 0;
        areas.forEach(area => {
            const row = document.createElement('div');
            row.className = 'table-row clickable';
            
            const promedioParaCalculo = parseFloat(area.promedio_calculo || area.promedio_score || 0);
            totalPromedio += promedioParaCalculo;
            
            // Agregar evento click para navegar a los centros de trabajo del área
            row.onclick = () => {
                this.navigateToAreaWorkCenters(area.id, area.name);
            };
            
            row.innerHTML = `
                <div class="cell">${area.name || 'Área sin nombre'}</div>
                <div class="cell">${parseFloat(area.promedio_score || 0).toFixed(2)}%</div>
            `;
            
            areasTableBody.appendChild(row);
        });
        
        // Actualizar promedio general
        if (areas.length > 0) {
            const promedioGeneral = (totalPromedio / areas.length).toFixed(2);
            const promGeneralCell = document.getElementById('promedio-general');
            if (promGeneralCell) promGeneralCell.textContent = `${promedioGeneral}%`;
        }
    }
    
    // === TABLA 2: TOP 10 RIESGO ===
    const topRiskTableBody = document.getElementById('top-risk-table-body');
    if (topRiskTableBody && topRisk) {
        // Limpiar tabla
        topRiskTableBody.innerHTML = '';
        
        // Crear filas directamente desde topRisk
        topRisk.forEach((item, index) => {
            const row = document.createElement('div');
            
            // Determinar clase de riesgo
            const riesgo = parseFloat(item.score);
            let rowClass = 'table-row clickable';
            let scoreClass = 'cell';
            
            if (index < 3) { // Primeros 3 en rojo
                rowClass += ' high-risk';
                scoreClass += ' score-high';
            } else if (riesgo >= 50) {
                rowClass += ' medium-risk';
                scoreClass += ' score-medium';
            }
            
            row.className = rowClass;
            
            // ✅ AGREGAR ESTE EVENTO CLICK:
            row.onclick = () => {
                // Buscar la evaluación completa para obtener todos los datos necesarios
                this.navigateToSpecificEvaluation(item);
            };
            
            row.innerHTML = `
                <div class="cell">${item.area_name || 'N/A'}</div>
                <div class="cell">${item.center_name || 'N/A'}</div>
                <div class="${scoreClass}">${riesgo.toFixed(2)}%</div>
            `;
            
            topRiskTableBody.appendChild(row);
        });
        
        // Rellenar filas vacías si hay menos de 10
        for (let i = topRisk.length; i < 10; i++) {
            const row = document.createElement('div');
            row.className = 'table-row placeholder';
            row.innerHTML = `
                <div class="cell">---</div>
                <div class="cell">---</div>
                <div class="cell">---</div>
            `;
            topRiskTableBody.appendChild(row);
        }
    }
}

// Actualizar KPIs superiores
updateTopKPIs(data) {
    const { areas, topRisk, totalWorkCenters, totalEvaluaciones } = data;
    
    // Usar los totales correctos de la base de datos
    const totalAreas = totalWorkCenters || 0; // ← Centros de trabajo, no áreas
    const totalEvals = totalEvaluaciones || 0; // ← Total de evaluaciones real
    
    // Calcular score global promedio CON 2 DECIMALES
    const scoreGlobal = areas.length > 0 
        ? (areas.reduce((sum, area) => sum + parseFloat(area.promedio_calculo || 0), 0) / areas.length).toFixed(2) // ← CAMBIAR a .toFixed(2)
        : '0.00'; // ← CAMBIAR a 0.00

    // Actualizar DOM de los KPIs superiores
    const kpiAreasTotal = document.getElementById('kpi-areas-total');
    const kpiEvaluacionesTotal = document.getElementById('kpi-evaluaciones-total');
    const kpiScoreGlobal = document.getElementById('kpi-score-global');

    if (kpiAreasTotal) kpiAreasTotal.textContent = totalAreas;
    if (kpiEvaluacionesTotal) kpiEvaluacionesTotal.textContent = totalEvals;
    if (kpiScoreGlobal) kpiScoreGlobal.textContent = `${scoreGlobal}%`;

    // Debug - mostrar en consola los valores
    console.log('📊 KPIs actualizados:', {
        totalWorkCenters: totalAreas,
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

    // Mostrar panel de detalles
    showDetailsPanel(type, data) {
        const panel = document.getElementById('details-panel');
        const title = document.getElementById('details-title');
        const body = document.getElementById('details-body');

        if (!panel || !title || !body) return;

        // Configurar título
        title.textContent = type === 'area' ? 'Detalles del Área' : 'Detalles del Centro';

        // Generar contenido según tipo
        if (type === 'area') {
            body.innerHTML = this.generateAreaDetails(data);
        } else if (type === 'workCenter') {
            body.innerHTML = this.generateWorkCenterDetails(data);
        }

        // Mostrar panel
        panel.classList.remove('hidden');
        panel.classList.add('show');
    },

    // Cerrar panel de detalles
    closeDetailsPanel() {
        const panel = document.getElementById('details-panel');
        if (panel) {
            panel.classList.remove('show');
            setTimeout(() => {
                panel.classList.add('hidden');
            }, 300);
        }
    },

    // Generar detalles de área
    generateAreaDetails(area) {
        const scoreColor = ERGOUtils.getScoreColor(parseFloat(area.promedio_score || 0));
        
        return `
            <div class="detail-item">
                <div class="detail-label">ID del Área</div>
                <div class="detail-value">${area.id}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Nombre</div>
                <div class="detail-value">${area.name}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Responsable</div>
                <div class="detail-value">${area.responsible || 'No especificado'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Score Promedio</div>
                <div class="detail-score" style="background-color: ${scoreColor}20; color: ${scoreColor};">
                    ${area.promedio_score || '0.00'}%
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Centros de Trabajo</div>
                <div class="detail-value">${area.total_centros || 0} total</div>
            </div>
            
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" 
                    onclick="ERGONavigation.navigateToAreas('${area.id}')">
                Ver Área Completa
            </button>
        `;
    },

    // Generar detalles de centro de trabajo
    generateWorkCenterDetails(center) {
        const scoreColor = ERGOUtils.getScoreColor(center.score_final || 0);
        
        return `
            <div class="detail-item">
                <div class="detail-label">ID del Centro</div>
                <div class="detail-value">${center.id}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Nombre</div>
                <div class="detail-value">${center.name}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Responsable</div>
                <div class="detail-value">${center.responsible || 'No especificado'}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Score Actual</div>
                <div class="detail-score" style="background-color: ${scoreColor}20; color: ${scoreColor};">
                    ${center.score_final || '0.00'}%
                </div>
            </div>
            
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" 
                    onclick="window.indexApp.navigateToWorkCenter({id: '${center.id}', area_id: '${center.area_id}', center_name: '${center.name}', responsible: '${center.responsible}'})">
                Ver Centro Completo
            </button>
        `;
    }
};

