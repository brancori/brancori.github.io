// header-component.js - Componente de header reutilizable
class HeaderComponent {
    constructor() {
        this.currentUser = null;
        this.navigationStack = ['Dashboard'];
        this.pageHistory = [{ title: 'Dashboard', subtitle: 'Dashboard de Control y Monitoreo', url: 'index.html' }];
        this.basePath = this.detectBasePath(); // ← AGREGAR ESTA LÍNEA
        this.init();
    }
    detectBasePath() {
    const currentPath = window.location.pathname;
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
    
    // Si estamos en una subcarpeta, necesitamos subir un nivel
    if (currentDir.includes('/evaluacion_ini') || 
        currentDir.includes('/especificas') || 
        currentDir.includes('/reportes') ||
        currentDir.includes('/componentes')) {
        return '../';  // Subir un nivel
    }
    
    // Si estamos en la raíz
    return './';
}

    init() {
        this.injectCSS();
        this.loadUserData();
        this.render();
        this.setupEventListeners();
    }

    // Inyectar CSS del componente
    injectCSS() {
        if (document.getElementById('header-component-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'header-component-styles';
        style.textContent = `
        /* Header Component CSS */
        .app-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: rgba(255, 255, 255, 0.95);
            border-bottom: 1px solid var(--gray-200);
            box-shadow: var(--shadow-sm);
            backdrop-filter: blur(12px);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, box-shadow 0.3s ease;
            transform: translateY(0);
        }

        .app-header.hidden {
            transform: translateY(-100%);
            opacity: 0.8;
        }

        .app-header.scrolled {
            background: rgba(255, 255, 255, 0.98);
            box-shadow: var(--shadow-md);
            border-bottom-color: var(--gray-300);
        }

        body {
            padding-top: 80px;
        }

        .app-header-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
        }

        .header-nav {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            flex: 1;
        }

        .breadcrumb-container {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .nav-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: none;
            border-radius: var(--border-radius-md);
            background: var(--gray-100);
            color: var(--gray-600);
            cursor: pointer;
            transition: var(--transition);
            font-size: 1.2rem;
        }

        .nav-btn:hover {
            background: var(--gray-200);
            color: var(--gray-800);
            transform: translateY(-1px);
        }

        .nav-btn:active {
            transform: translateY(0);
        }

        .home-btn:hover {
            background: var(--primary-100);
            color: var(--primary-600);
        }

        .back-btn:hover {
            background: var(--gray-200);
            color: var(--gray-900);
        }

        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        }

        .breadcrumb-item {
            color: var(--gray-500);
            text-decoration: none;
            padding: 0.25rem 0.5rem;
            border-radius: var(--border-radius-sm);
            transition: var(--transition);
            cursor: pointer;
            white-space: nowrap;
        }

        .breadcrumb-item:hover:not(.active) {
            color: var(--primary-600);
            background: var(--primary-50);
        }

        .breadcrumb-item.active {
            color: var(--gray-900);
            font-weight: 600;
            background: var(--gray-100);
        }

        .breadcrumb-separator {
            color: var(--gray-300);
            margin: 0 0.25rem;
            font-size: 0.75rem;
        }

        .page-title-container {
            flex: 1;
            min-width: 0;
        }

        .page-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gray-900);
            margin: 0 0 0.25rem 0;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .page-subtitle {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .header-user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-shrink: 0;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius-lg);
            background: var(--gray-50);
            border: 1px solid var(--gray-200);
            transition: var(--transition);
        }

        .user-profile:hover {
            background: var(--gray-100);
            border-color: var(--gray-300);
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-400), var(--primary-600));
            border: 2px solid white;
            box-shadow: var(--shadow-sm);
            flex-shrink: 0;
        }

        .user-details {
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .user-name {
            font-weight: 600;
            color: var(--gray-900);
            font-size: 0.875rem;
            line-height: 1.2;
        }

        .user-role {
            font-size: 0.75rem;
            color: var(--gray-600);
            line-height: 1.2;
        }

        .user-status {
            position: absolute;
            bottom: -2px;
            right: -8px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            border: 2px solid white;
        }

        .user-status.online {
            background: var(--green-500);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            border: none;
            border-radius: var(--border-radius-md);
            background: transparent;
            color: var(--gray-600);
            cursor: pointer;
            transition: var(--transition);
            font-size: 0.875rem;
            position: relative;
        }

        .action-btn:hover {
            background: var(--gray-100);
            color: var(--gray-900);
        }

        .logout-btn:hover {
            background: var(--red-50);
            color: var(--red-600);
        }

        .action-btn .icon {
            font-size: 1rem;
        }

        .action-btn .text {
            font-weight: 500;
        }

        .badge {
            position: absolute;
            top: 0;
            right: 0;
            background: var(--red-500);
            color: white;
            font-size: 0.625rem;
            font-weight: 600;
            padding: 0.125rem 0.375rem;
            border-radius: 10px;
            min-width: 16px;
            text-align: center;
            transform: translate(25%, -25%);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .app-header-content {
                padding: 1rem;
                gap: 1rem;
            }
            
            .header-nav {
                gap: 1rem;
            }
            
            .page-title {
                font-size: 1.25rem;
            }
            
            .action-btn .text {
                display: none;
            }
            
            .user-profile {
                padding: 0.5rem;
            }
            
            .user-details {
                display: none;
            }
        }

        @media (max-width: 480px) {
            .breadcrumb {
                display: none;
            }
            
            .page-title-container {
                text-align: center;
            }
            
            .notifications-btn,
            .settings-btn {
                display: none;
            }
        }
        `;
        document.head.appendChild(style);
    }

    // HTML del componente
    getHTML() {
        return `
        <div class="app-header">
            <div class="app-header-content">
                <div class="header-nav">
                    <div class="breadcrumb-container">
                        <button class="nav-btn back-btn" id="backBtn" title="Regresar" style="display: none;">
                            <span class="icon">←</span>
                        </button>
                        <button class="nav-btn home-btn" id="homeBtn" title="Ir al inicio">
                            <span class="icon">🏠</span>
                        </button>
                        <nav class="breadcrumb" id="breadcrumb">
                            <span class="breadcrumb-item active">Dashboard</span>
                        </nav>
                    </div>
                    
                    <div class="page-title-container">
                        <h1 class="page-title" id="pageTitle">Sistema de Evaluación Ergonómica</h1>
                    </div>
                </div>

                <div class="header-user-info">
                    <div class="user-profile">
                        <div class="user-avatar"></div>
                        <div class="user-details">
                            <span class="user-name" id="headerUserName">Usuario</span>
                            <span class="user-role" id="headerUserRole">Cargo</span>
                            <span class="user-status online" title="En línea"></span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="action-btn notifications-btn" title="Notificaciones">
                            <span class="icon">🔔</span>
                            <span class="badge"></span>
                        </button>
                        <button class="action-btn settings-btn" title="Configuración">
                            <span class="icon">⚙️</span>
                        </button>
                        <button class="action-btn logout-btn" id="headerLogoutBtn" title="Cerrar sesión">
                            <span class="icon">🚪</span>
                            <span class="text">Salir</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    

    // Renderizar el componente
    render() {
        const existingHeader = document.querySelector('.app-header');
        if (existingHeader) {
            existingHeader.remove();
        }

        // Insertar al inicio del body
        document.body.insertAdjacentHTML('afterbegin', this.getHTML());
        this.updateUserInterface();
        this.updateBreadcrumb();
    }

    // Cargar datos del usuario
loadUserData() {
    // Usamos la función global que ya sabe dónde buscar al usuario (sessionStorage)
    this.currentUser = ERGOAuth.getCurrentUser();
}

    // Actualizar interfaz de usuario
    updateUserInterface() {
        if (!this.currentUser) return;

        const userName = document.getElementById('headerUserName');
        const userRole = document.getElementById('headerUserRole');

        if (userName) userName.textContent = this.currentUser.nombre || 'Usuario';
        if (userRole) userRole.textContent = this.currentUser.puesto || 'Sin cargo';
    }

    // Configurar event listeners
    setupEventListeners() {
        const backBtn = document.getElementById('backBtn');
        const homeBtn = document.getElementById('homeBtn');
        const logoutBtn = document.getElementById('headerLogoutBtn');

        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }

        if (homeBtn) {
            homeBtn.addEventListener('click', () => this.goHome());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

setupScrollBehavior() {
    let ticking = false;
    
    const updateHeader = () => {
        const header = document.querySelector('.app-header');
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (currentScrollY > this.lastScrollY && currentScrollY > 80) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        
        this.lastScrollY = currentScrollY;
        ticking = false;
    };
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

goBack() {
    window.history.back();
}

// Navegación: Ir al inicio
goHome() {
    console.log('🏠 Navegando a Home...');
    
    // FUNCIÓN INTELIGENTE PARA ENCONTRAR LA RAÍZ DEL PROYECTO
    function getRootPath() {
        // 1. Obtiene la ruta de la página actual.
        const currentPath = window.location.pathname;

        // 2. Busca la carpeta "ERGOApp" como el ancla de nuestro proyecto.
        const ergoAppIndex = currentPath.indexOf('/ERGOApp/');

        if (ergoAppIndex > -1) {
            // 3. Si la encuentra, construye la ruta base hasta ese punto.
            // ej: de "/proyectos/ERGOApp/centro-trabajo/..." obtiene "/proyectos/ERGOApp"
            return currentPath.substring(0, ergoAppIndex + 8); // +8 para incluir "ERGOApp"
        }

        // 4. Si no la encuentra (porque ya estamos en la raíz), devuelve una ruta vacía.
        return '';
    }

    const rootPath = getRootPath();
    window.location.href = `${rootPath}/index.html`;
}

    // Logout
logout() {
    // Usamos la función global que ya sabe cómo cerrar la sesión y redirigir
    ERGOAuth.logout('Has cerrado la sesión.');
}

    // Actualizar breadcrumb
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        const backBtn = document.getElementById('backBtn');
        
        if (!breadcrumb) return;

        let breadcrumbHTML = '';
        
        this.navigationStack.forEach((item, index) => {
            const isLast = index === this.navigationStack.length - 1;
            const isClickable = index < this.navigationStack.length - 1;
            
            if (index > 0) {
                breadcrumbHTML += '<span class="breadcrumb-separator">›</span>';
            }
            
            breadcrumbHTML += `
                <span class="breadcrumb-item ${isLast ? 'active' : ''}" 
                      ${isClickable ? `onclick="headerComponent.navigateToLevel(${index})"` : ''}>
                    ${item}
                </span>
            `;
        });

        breadcrumb.innerHTML = breadcrumbHTML;
        
        // Mostrar/ocultar botón back
        if (backBtn) {
            backBtn.style.display = this.navigationStack.length > 1 ? 'inline-flex' : 'none';
        }
    }

    // Navegar a un nivel específico del breadcrumb
    navigateToLevel(level) {
        if (level < this.pageHistory.length - 1) {
            const targetPage = this.pageHistory[level];
            window.location.href = targetPage.url;
        }
    }

    // Actualizar página actual
    updatePage(title, subtitle = '', breadcrumbTitle = null) {
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        
        if (pageTitle) pageTitle.textContent = title;
        if (pageSubtitle) pageSubtitle.textContent = subtitle;

        // Actualizar navigation stack si se proporciona breadcrumbTitle
        if (breadcrumbTitle) {
            // Si es una nueva página, agregarla al stack
            if (!this.navigationStack.includes(breadcrumbTitle)) {
                this.navigationStack.push(breadcrumbTitle);
                this.pageHistory.push({
                    title: title,
                    subtitle: subtitle,
                    url: window.location.pathname + window.location.search
                });
            }
        }

        this.updateBreadcrumb();
    }

    // Método para usar desde otras páginas
    static init(pageConfig = {}) {
        if (window.headerComponent) {
            // Si ya existe, solo actualizar
            if (pageConfig.title) {
                window.headerComponent.updatePage(
                    pageConfig.title,
                    pageConfig.subtitle || '',
                    pageConfig.breadcrumb || pageConfig.title
                );
            }
        } else {
            // Crear nuevo componente
            window.headerComponent = new HeaderComponent();
            
            // Configurar página actual si se proporciona
            if (pageConfig.title) {
                setTimeout(() => {
                    window.headerComponent.updatePage(
                        pageConfig.title,
                        pageConfig.subtitle || '',
                        pageConfig.breadcrumb || pageConfig.title
                    );
                }, 100);
            }
        }
    }
}

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (!window.headerComponent) {
        HeaderComponent.init();
    }
});

// Exportar para uso global
window.HeaderComponent = HeaderComponent;