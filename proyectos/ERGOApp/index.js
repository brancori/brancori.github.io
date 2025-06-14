// index.js - Sistema de Evaluación Ergonómica
class IndexApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.showLoginModal();
    }

checkExistingSession() {
    const userData = localStorage.getItem('currentUser');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (userData && sessionExpiry) {
        const now = new Date().getTime();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutos en ms
        const lastActivityTime = lastActivity ? parseInt(lastActivity) : now;
        
        // Verificar si la sesión no ha expirado Y no han pasado 30 min de inactividad
        if (now < parseInt(sessionExpiry) && (now - lastActivityTime) < thirtyMinutes) {
            try {
                this.currentUser = JSON.parse(userData);
                // Actualizar última actividad
                localStorage.setItem('lastActivity', now.toString());
                this.hideLoginModal();
                this.showMainContent();
                this.updateUserInterface();
                this.loadDashboardData();
                return;
            } catch (error) {
                console.error('Error al cargar sesión:', error);
            }
        }
    }
    
    // Si no hay sesión válida o ha expirado, limpiar y mostrar login
    this.hideMainContent();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('lastActivity');
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
               const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 horas (se controla por inactividad)
                const now = new Date().getTime();
                localStorage.setItem('lastActivity', now.toString());
                localStorage.setItem('currentUser', JSON.stringify(userData));
                localStorage.setItem('sessionExpiry', expiryTime.toString());
                
                this.hideLoginModal();
                this.showMainContent();
                this.updateUserInterface();
                this.showToast('Bienvenido al sistema', 'success');
                
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

    // Mostrar modal de login
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('show');
            // Focus en el campo usuario
            setTimeout(() => {
                const usuarioInput = document.getElementById('usuario');
                if (usuarioInput) usuarioInput.focus();
            }, 100);
        }
    }

    // Ocultar modal de login
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('show');
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

        showMainContent() {
            const container = document.querySelector('.container');
            if (container) {
                container.style.setProperty('display', 'block', 'important');
                container.style.opacity = '0';
                container.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    container.style.transition = 'all 0.5s ease';
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                }, 100);
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
        this.updateActivity();
        if (!this.currentUser) {
            this.showToast('Debes iniciar sesión primero', 'error');
            this.showLoginModal();
            return;
        }

        // Guardar timestamp de último acceso
        const accessData = {
            ...this.currentUser,
            lastAccess: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(accessData));

        // Navegar a áreas
        window.location.href = 'areas.html';
    }

    // Manejar logout
    handleLogout() {
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('sessionExpiry');
            this.hideMainContent();
            this.currentUser = null;
            this.showToast('Sesión cerrada correctamente', 'success');
            
            // Mostrar login modal después de un breve delay
            setTimeout(() => {
                this.showLoginModal();
                // Limpiar campos
                document.getElementById('usuario').value = '';
                document.getElementById('password').value = '';
                document.getElementById('loginError').style.display = 'none';
            }, 1000);
        }
    }

    // Mostrar notificaciones toast
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Verificar permisos del usuario
    hasPermission(action) {
        if (!this.currentUser) return false;

        const rango = this.currentUser.rango;
        
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
    }

    // Obtener datos del usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Navegar a los centros de trabajo de un área específica
navigateToAreaWorkCenters(areaId, areaName) {
    if (!this.currentUser) {
        this.showToast('Debes iniciar sesión primero', 'error');
        this.showLoginModal();
        return;
    }

    // Guardar timestamp de último acceso
    const accessData = {
        ...this.currentUser,
        lastAccess: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(accessData));

    // Navegar directamente a la vista de centros de trabajo del área
    window.location.href = `areas.html?area=${areaId}&areaName=${encodeURIComponent(areaName)}`;
}

// Navegar a un centro de trabajo específico
navigateToWorkCenter(evaluacion) {
    if (!this.currentUser) {
        this.showToast('Debes iniciar sesión primero', 'error');
        this.showLoginModal();
        return;
    }

    // Guardar timestamp de último acceso
    const accessData = {
        ...this.currentUser,
        lastAccess: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(accessData));

    // Construir URL para ir directamente al centro de trabajo
    const params = new URLSearchParams({
        workCenter: evaluacion.work_center_id || evaluacion.id,
        area: evaluacion.area_id,
        areaName: evaluacion.nombre_area || 'Área',
        centerName: evaluacion.center_name || 'Centro',
        responsible: evaluacion.responsible || 'N/A'
    });

    window.location.href = `centro-trabajo.html?${params.toString()}`;
}

async loadDashboardData() {
    try {
        const [areas, evaluaciones] = await Promise.all([
            supabase.getAreas(),
            supabase.getEvaluaciones()
        ]);
        
        this.updateDashboardTables({ areas, evaluaciones });
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
    }
}

updateDashboardTables(data) {
    const { areas, evaluaciones } = data;
    
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
            
            const promedio = parseFloat(area.promedio_score || 0);
            totalPromedio += promedio;
            
            // Agregar evento click para navegar a los centros de trabajo del área
            row.onclick = () => {
                this.navigateToAreaWorkCenters(area.id, area.name);
            };
            
            row.innerHTML = `
                <div class="cell">${area.name || 'Área sin nombre'}</div>
                <div class="cell">${promedio.toFixed(2)}%</div>
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
    if (topRiskTableBody && evaluaciones) {
        // Limpiar tabla
        topRiskTableBody.innerHTML = '';
        
        // Ordenar por nivel_riesgo_ergonomico descendente y tomar top 10
        const topRisk = evaluaciones
            .filter(evaluacion => evaluacion.nivel_riesgo_ergonomico != null && evaluacion.nivel_riesgo_ergonomico !== '')
            .sort((a, b) => parseFloat(b.nivel_riesgo_ergonomico) - parseFloat(a.nivel_riesgo_ergonomico))
            .slice(0, 10);
        
        // Crear filas
        topRisk.forEach((evaluacion, index) => {
            const row = document.createElement('div');
            
            // Determinar clase de riesgo
            const riesgo = parseFloat(evaluacion.nivel_riesgo_ergonomico);
            let rowClass = 'table-row clickable';
            let scoreClass = 'cell';
            
            if (index < 3) { // Primeros 3 en rojo
                rowClass += ' high-risk';
                scoreClass += ' score-high';
            } else if (riesgo >= 50) {
                rowClass += ' medium-risk';
                scoreClass += ' score-medium';
            }
            
            // Agregar evento click para navegar al centro de trabajo específico
            row.onclick = () => {
                this.navigateToWorkCenter(evaluacion);
            };
            
            row.className = rowClass;
            row.innerHTML = `
                <div class="cell">${evaluacion.ubicacion_area || 'N/A'}</div>
                <div class="cell">${evaluacion.nombre_area || 'N/A'}</div>
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
    updateActivity() {
        const now = new Date().getTime();
        localStorage.setItem('lastActivity', now.toString());
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

// Actualizar actividad en cualquier interacción
['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, () => {
        if (window.indexApp && window.indexApp.currentUser) {
            window.indexApp.updateActivity();
        }
    }, { passive: true, once: false });
});