






























































window.logout = auth.logout;// Exponer logout globalmente para mantener compatibilidad};    }        }            return false;        } catch {            return session.permissions?.includes(permission) || false;            const session = JSON.parse(localStorage.getItem('userSession') || '{}');        try {    hasPermission(permission) {    },        }            window.location.reload();            console.error('Error durante el logout:', error);        } catch (error) {            return false;            window.location.replace('/index.html');            sessionStorage.clear();            localStorage.removeItem('userSession');        try {    logout() {    },        }            return false;            console.error('Login error:', error);        } catch (error) {            return false;            }                return true;                localStorage.setItem('userSession', JSON.stringify(userData));                                };                    timestamp: Date.now()                    permissions: users[username].permissions,                    role: users[username].role,                    username,                const userData = {            if (users[username] && users[username].password === password) {        try {    async login(username, password) {export const auth = {};    }        permissions: ['update']        role: 'Autorizador',        password: 'auth123',    auth: {    },        permissions: ['create', 'read']        role: 'Supervisor',        password: 'super123',    superv: {    },        permissions: ['create', 'read', 'update', 'delete']        role: 'Administrador',        password: '123',    admin: {const users = {