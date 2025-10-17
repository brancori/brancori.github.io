// auth.js

/**
 * ARCHIVO DE AUTENTICACIÓN (ANULADO)
 * Toda la lógica de usuarios, contraseñas y protección de rutas
 * ha sido eliminada para permitir el acceso directo.
 * Se restaurará con un sistema más robusto (Supabase) en el futuro.
 */

function logout() {
    // Limpia el almacenamiento por si hubiera datos de sesión antiguos.
    localStorage.removeItem('userSession');
    sessionStorage.clear();
    // Redirige a la página de inicio. La ruta puede necesitar ajuste.
    window.location.href = '../index.html'; 
}

// Expone la función logout globalmente para que pueda ser llamada desde el HTML.
window.logout = logout;

// Objeto de exportación vacío para mantener la consistencia del módulo.
export const auth = {
    logout
};