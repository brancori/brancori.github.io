// === Lógica para Bloqueo de Licencia (Versión con Sesión Persistente) ===

/**
 * Activa el overlay de bloqueo y guarda el timestamp final en localStorage.
 */
function activateLicenseLock() {
    const overlay = document.getElementById('license-overlay');
    const mainContent = document.getElementById('main-content');
    const lockKey = 'demoLockTimestamp';

    if (overlay && mainContent) {
        overlay.classList.add('active');
        mainContent.classList.add('content-blurred');
        document.body.style.overflow = 'hidden';

        // Guarda el timestamp del bloqueo final para persistir en futuras visitas.
        localStorage.setItem(lockKey, Date.now().toString());
    }
}

/**
 * Lógica principal que se ejecuta al cargar la página.
 */
function initDemoProtection() {
    const lockKey = 'demoLockTimestamp'; // Clave para cuando ya está bloqueado.
    const sessionKey = 'sessionStartTime'; // NUEVA CLAVE: para el inicio del conteo.
    const storedTimestamp = localStorage.getItem(lockKey);
    const activationTime = 90000; // 90 segundos
    const lockDuration = 24 * 60 * 60 * 1000; // 24 horas

    // --- 1. Comprobar si ya está permanentemente bloqueado ---
    if (storedTimestamp) {
        const lockTime = parseInt(storedTimestamp, 10);
        const currentTime = Date.now();

        if (currentTime - lockTime < lockDuration) {
            activateLicenseLock(); // Bloquear inmediatamente.
            return; // Detenemos la ejecución aquí.
        } else {
            // Si pasaron 24h, se limpia todo para reiniciar.
            localStorage.removeItem(lockKey);
            localStorage.removeItem(sessionKey);
        }
    }

    // --- 2. Gestionar el temporizador de sesión ---
    let sessionStartTime = localStorage.getItem(sessionKey);

    if (!sessionStartTime) {
        // ¿Es la primera visita en la sesión?
        // Guardamos el tiempo de inicio y configuramos el temporizador completo.
        sessionStartTime = Date.now();
        localStorage.setItem(sessionKey, sessionStartTime.toString());
        setTimeout(activateLicenseLock, activationTime);
    } else {
        // Ya hay una sesión en curso.
        const startTime = parseInt(sessionStartTime, 10);
        const elapsedTime = Date.now() - startTime;
        const remainingTime = activationTime - elapsedTime;

        if (remainingTime <= 0) {
            // El tiempo ya expiró, bloquear ahora mismo.
            activateLicenseLock();
        } else {
            // Aún queda tiempo, configurar un temporizador por el tiempo restante.
            setTimeout(activateLicenseLock, remainingTime);
        }
    }
}

// Iniciar el sistema de protección.
document.addEventListener('DOMContentLoaded', initDemoProtection);