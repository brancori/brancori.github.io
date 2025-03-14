// Sistema de autenticación mejorado
(function() {
    // Verificación inmediata
    const currentPath = window.location.pathname.toLowerCase();
    const session = localStorage.getItem('userSession');
    const isLoginPage = currentPath.endsWith('index.html') || currentPath.endsWith('/');

    if (session && isLoginPage) {
        window.location.replace('dashboard.html');
        return;
    }
})();

const users = {
    admin: {
        password: '123',
        role: 'Administrador',
        permissions: ['create', 'read', 'update', 'delete']
    },
    superv: {
        password: 'super123',
        role: 'Supervisor',
        permissions: ['create', 'read']
    },
    auth: {
        password: 'auth123',
        role: 'Autorizador',
        permissions: ['update']
    }
};

// Función unificada para verificar sesión
function checkAuth() {
    const session = localStorage.getItem('userSession');
    if (!session) {
        return false;
    }

    try {
        const sessionData = JSON.parse(session);
        return !!(sessionData.username && sessionData.role);
    } catch (e) {
        localStorage.removeItem('userSession');
        return false;
    }
}

// Función para proteger rutas
function protectRoute() {
    const session = localStorage.getItem('userSession');
    const currentPath = window.location.pathname.toLowerCase();
    
    if (!session && currentPath.includes('/html/dashboard.html')) {
        window.location.href = '../index.html'; // Corregida la ruta
        return false;
    }
    
    return true;
}

// Modificar la función login para usar autenticación local
async function login(username, password) {
    try {
        // Verificar las credenciales contra el objeto users local
        if (users[username] && users[username].password === password) {
            const userData = {
                username,
                role: users[username].role,
                permissions: users[username].permissions,
                timestamp: Date.now()
            };
            
            localStorage.setItem('userSession', JSON.stringify(userData));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// Actualizar el manejador del formulario de login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.toLowerCase().trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('Por favor complete todos los campos');
            return;
        }

        const success = await login(username, password);
        if (success) {
            window.location.href = './HTML/dashboard.html'; // Actualizada la ruta
        } else {
            showError('Usuario o contraseña incorrectos');
            document.getElementById('password').value = '';
        }
    });
}

// Función para hacer peticiones autenticadas
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('index.html');
        return;
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        window.location.replace('index.html');
        return;
    }

    return response;
}

function showError(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.textContent = message;
        setTimeout(() => errorElement.textContent = '', 3000);
    }
}

function logout() {
    localStorage.removeItem('userSession');
    sessionStorage.clear();
    window.location.href = '../index.html'; // Corregida la ruta
}

// Exponer la función logout globalmente
window.logout = logout;

function hasPermission(permission) {
    try {
        const session = JSON.parse(localStorage.getItem('userSession') || '{}');
        return session.permissions?.includes(permission) || false;
    } catch {
        return false;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.toLowerCase();
    
    if (currentPath.includes('dashboard.html')) {
        protectRoute();
    }
    
    // Actualizar UI si hay sesión
    const session = localStorage.getItem('userSession');
    if (session) {
        try {
            const userData = JSON.parse(session);
            const usernameDisplay = document.getElementById('username_display');
            const roleDisplay = document.getElementById('role_display');
            
            if (usernameDisplay) usernameDisplay.textContent = userData.username;
            if (roleDisplay) roleDisplay.textContent = userData.role;
        } catch (e) {
            console.error('Error parsing session data:', e);
        }
    }
});

export const auth = {
    login,
    logout,
    checkAuth,
    protectRoute,
    hasPermission
};
