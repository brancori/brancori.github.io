/**
 * Controlador para la pantalla de bienvenida
 */
document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.querySelector('.welcome-screen');
    const modeLabel = document.querySelector('.mode-label');
    
    // Función para manejar los gestos de swipe
    function setupWelcomeSwipe() {
        let touchstartX = 0;
        let touchendX = 0;
        const SWIPE_THRESHOLD = 50;

        const handleSwipe = () => {
            if (touchstartX - touchendX > SWIPE_THRESHOLD) {
                dismissWelcomeScreen();
            }
        };

        document.addEventListener('touchstart', e => touchstartX = e.changedTouches[0].screenX);
        document.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        document.addEventListener('mousedown', e => touchstartX = e.screenX);
        document.addEventListener('mouseup', e => {
            touchendX = e.screenX;
            handleSwipe();
        });
    }
    
    // Función para ocultar la pantalla de bienvenida
    function dismissWelcomeScreen() {
        welcomeScreen.classList.add('slide-out');
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            
            // Activar animación fadeOutLabel para mode-label
            if (modeLabel && window.innerWidth <= 768) {
                setTimeout(() => {
                    modeLabel.classList.add('animate-fade');
                }, 1000);
            }
        }, 1000);
    }
    
    // Además, manejar el evento transitionend para asegurar que el scroll sea correcto
    welcomeScreen.addEventListener('transitionend', () => {
        if (welcomeScreen.classList.contains('slide-out')) {
            window.scrollTo(0, 0);
        }
    });
    
    // Inicializar
    setupWelcomeSwipe();
});
