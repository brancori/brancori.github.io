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
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
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
