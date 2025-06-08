// Sistema de Navegación Modular
class NavigationManager {
    constructor(currentPage = 'home') {
        this.currentPage = currentPage;
        this.init();
    }

    init() {
        this.createNavbar();
        this.setupNavigationListeners();
    }

    createNavbar() {
        const navHTML = `
            <nav class="app-navbar">
                <div class="navbar-container">
                    <div class="navbar-brand">
                        <span class="brand-text">Sistema Ergonómico</span>
                    </div>
                    
                    <div class="navbar-nav">
                        ${this.createNavButtons()}
                    </div>
                    
                    <div class="navbar-actions">
                        <button class="nav-btn nav-btn-secondary" onclick="navigation.showQuickActions()">
                            ⚙️ Acciones
                        </button>
                    </div>
                </div>
            </nav>
        `;

        // Insertar al inicio del body
        document.body.insertAdjacentHTML('afterbegin', navHTML);
        
        // Añadir estilos
        this.addNavbarStyles();
        
        // Ajustar padding del contenido principal
        this.adjustMainContent();
    }

    createNavButtons() {
        const buttons = [];
        
        // Botón Home (siempre visible)
        buttons.push(`
            <button class="nav-btn ${this.currentPage === 'home' ? 'active' : ''}" 
                    onclick="navigation.goHome()">
                🏠 Inicio
            </button>
        `);
        
        // Botón Atrás (solo si no estamos en home)
        if (this.currentPage !== 'home') {
            buttons.push(`
                <button class="nav-btn nav-btn-primary" onclick="navigation.goBack()">
                    ← Atrás
                </button>
            `);
        }
        
        // Botones específicos según la página
        switch (this.currentPage) {
            case 'area-detail':
                const areaId = localStorage.getItem('selectedAreaId');
                const area = this.getAreaById(areaId);
                const areaName = area ? area.name : 'Área';
                
                buttons.push(`
                    <span class="nav-breadcrumb">📍 ${areaName}</span>
                `);
                break;
                
            case 'evaluation':
                const workCenterId = localStorage.getItem('selectedWorkCenterId');
                const workCenter = this.getWorkCenterById(workCenterId);
                const centerName = workCenter ? workCenter.name : 'Centro';
                
                buttons.push(`
                    <span class="nav-breadcrumb">📋 ${centerName}</span>
                `);
                break;
        }
        
        return buttons.join('');
    }

    addNavbarStyles() {
        if (document.getElementById('navbar-styles')) return;
        
        const styles = `
            <style id="navbar-styles">
                .app-navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: #2c3e50;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    border-bottom: 3px solid #34495e;
                }
                
                .navbar-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    height: 60px;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                
                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: white;
                    font-weight: 600;
                    font-size: 1.1em;
                }
                
                .brand-icon {
                    font-size: 1.4em;
                }
                
                .brand-text {
                    display: none;
                }
                
                .navbar-nav {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .navbar-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .nav-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85em;
                    font-weight: 600;
                    transition: all 0.2s;
                    white-space: nowrap;
                    min-height: 36px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .nav-btn:hover {
                    transform: translateY(-1px);
                    opacity: 0.9;
                }
                
                .nav-btn-primary {
                    background: #3498db;
                    color: white;
                }
                
                .nav-btn-secondary {
                    background: #95a5a6;
                    color: white;
                }
                
                .nav-btn.active {
                    background: #27ae60;
                    color: white;
                }
                
                .nav-btn:not(.nav-btn-primary):not(.nav-btn-secondary):not(.active) {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }
                
                .nav-breadcrumb {
                    color: #ecf0f1;
                    font-size: 0.9em;
                    font-weight: 500;
                    padding: 8px 12px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 6px;
                }
                
                .quick-actions-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                    min-width: 200px;
                    z-index: 1001;
                    padding: 10px 0;
                    display: none;
                }
                
                .quick-actions-dropdown.show {
                    display: block;
                }
                
                .dropdown-item {
                    display: block;
                    width: 100%;
                    padding: 10px 20px;
                    border: none;
                    background: none;
                    text-align: left;
                    cursor: pointer;
                    font-size: 0.9em;
                    color: #2c3e50;
                    transition: background 0.2s;
                }
                
                .dropdown-item:hover {
                    background: #f8f9fa;
                }
                
                .dropdown-divider {
                    height: 1px;
                    background: #e9ecef;
                    margin: 5px 0;
                }
                
                /* Ajustar contenido principal */
                body {
                    padding-top: 60px !important;
                }
                
                .container, .area-detail-container {
                    margin-top: 0 !important;
                }
                
                /* Responsive */
                @media (min-width: 768px) {
                    .brand-text {
                        display: inline;
                    }
                    
                    .navbar-container {
                        height: 70px;
                    }
                    
                    body {
                        padding-top: 70px !important;
                    }
                }
                
                @media (max-width: 767px) {
                    .navbar-container {
                        height: auto;
                        min-height: 60px;
                        padding: 10px 15px;
                    }
                    
                    .navbar-nav {
                        order: 3;
                        width: 100%;
                        justify-content: flex-start;
                        margin-top: 10px;
                    }
                    
                    .nav-btn {
                        font-size: 0.8em;
                        padding: 6px 12px;
                    }
                    
                    body {
                        padding-top: 80px !important;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    adjustMainContent() {
        // Asegurar que el contenido principal no quede oculto detrás del navbar
        const mainContainers = document.querySelectorAll('.container, .area-detail-container');
        mainContainers.forEach(container => {
            container.style.marginTop = '0';
        });
    }

    setupNavigationListeners() {
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.quick-actions-dropdown');
            const actionsBtn = document.querySelector('.navbar-actions .nav-btn');
            
            if (dropdown && !dropdown.contains(e.target) && !actionsBtn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Métodos de navegación
// Métodos de navegación
goHome() {
    // **CAMBIADO: Siempre navegar en la misma pestaña**
    window.location.href = 'index.html';
}

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.goHome();
        }
    }

    showQuickActions() {
        const existingDropdown = document.querySelector('.quick-actions-dropdown');
        
        if (existingDropdown) {
            existingDropdown.classList.toggle('show');
            return;
        }
        
        const dropdownHTML = `
            <div class="quick-actions-dropdown">
                <button class="dropdown-item" onclick="navigation.goHome()">
                    🏠 Ir al Inicio
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" onclick="navigation.exportData()">
                    📤 Exportar Datos
                </button>
                <button class="dropdown-item" onclick="navigation.importData()">
                    📥 Importar Datos
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" onclick="navigation.showHelp()">
                    ❓ Ayuda
                </button>
                <button class="dropdown-item" onclick="navigation.closeWindow()">
                    ❌ Cerrar Ventana
                </button>
            </div>
        `;
        
        document.querySelector('.app-navbar').insertAdjacentHTML('beforeend', dropdownHTML);
        document.querySelector('.quick-actions-dropdown').classList.add('show');
    }

    // Acciones rápidas
    newEvaluation() {
        window.open('formulario_.html', '_blank');
        this.hideDropdown();
    }

    exportData() {
        // Implementar exportación
        const areas = JSON.parse(localStorage.getItem('ergonomic_areas') || '[]');
        const data = {
            areas: areas,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        this.downloadJSON(data, `backup_${new Date().toISOString().split('T')[0]}.json`);
        this.hideDropdown();
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.areas) {
                            localStorage.setItem('ergonomic_areas', JSON.stringify(data.areas));
                            alert('✅ Datos importados correctamente');
                            window.location.reload();
                        }
                    } catch (error) {
                        alert('❌ Error al importar archivo');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
        this.hideDropdown();
    }

    showHelp() {
        alert(`📊 Sistema de Evaluación Ergonómica

 Inicio: Gestión de áreas
Evaluación: Formulario de evaluación
Ver: Visualizar evaluación completa
Editar: Modificar evaluación existente

 Consejos:
- Use IDs únicos para identificar centros
- Exporte datos regularmente como respaldo
- Las evaluaciones se guardan automáticamente`);
        this.hideDropdown();
    }

    closeWindow() {
        if (window.history.length > 1) {
            window.close();
        } else {
            this.goHome();
        }
        this.hideDropdown();
    }

    hideDropdown() {
        const dropdown = document.querySelector('.quick-actions-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    // Métodos auxiliares
    getAreaById(areaId) {
        const areas = JSON.parse(localStorage.getItem('ergonomic_areas') || '[]');
        return areas.find(a => a.id === areaId);
    }

    getWorkCenterById(workCenterId) {
        const areaId = localStorage.getItem('selectedAreaId');
        const workCenters = JSON.parse(localStorage.getItem(`work_centers_${areaId}`) || '[]');
        return workCenters.find(wc => wc.id === workCenterId);
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Variable global para el sistema de navegación
let navigation;

// Inicializar automáticamente
document.addEventListener('DOMContentLoaded', function() {
    // Detectar página actual basada en el nombre del archivo
    const currentPage = window.location.pathname.includes('area_detail.html') ? 'area-detail' :
                       window.location.pathname.includes('formulario_') ? 'evaluation' : 'home';
    
    navigation = new NavigationManager(currentPage);
    window.navigation = navigation;
});