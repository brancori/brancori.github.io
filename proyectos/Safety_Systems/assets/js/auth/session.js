export const session = {
    check() {
        const session = localStorage.getItem('userSession');
        const currentPath = window.location.pathname.toLowerCase();
        const isDashboard = currentPath.includes('dashboard.html');
        const isLoginPage = currentPath.endsWith('index.html') || currentPath.endsWith('/');

        if (session && isLoginPage) {
            window.location.replace('./pages/dashboard.html');
            return true;
        }

        if (isDashboard && !session) {
            localStorage.clear();
            window.location.href = '../index.html';
            return false;
        }

        return !!session;
    }
};
