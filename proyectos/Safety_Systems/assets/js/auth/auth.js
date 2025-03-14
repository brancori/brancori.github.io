export const auth = {
    // ...existing code...
    logout() {
        try {
            localStorage.removeItem('userSession');
            sessionStorage.clear();
            window.location.replace('../index.html');
            return false;
        } catch (error) {
            console.error('Error durante el logout:', error);
            window.location.reload();
        }
    }
    // ...existing code...
};
