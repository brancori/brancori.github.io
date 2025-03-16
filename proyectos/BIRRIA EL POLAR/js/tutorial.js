class TutorialGuide {
    constructor() {
        // Simplificado a un solo paso
        this.tutorialStep = {
            element: '.mode-toggle-fab',
            title: 'Haz tu pedido fácilmente',
            text: 'Toca aquí para activar el modo compra',
            position: 'right'
        };
        
        this.tutorialOverlay = null;
        this.hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        
        // Mostrar tutorial solo en la primera visita
        if (!this.hasSeenTutorial) {
            this.createOverlay();
            
            // Esperar a que se cierre la pantalla de bienvenida
            this.waitForWelcomeScreenToClose();
        }
    }
    
    waitForWelcomeScreenToClose() {
        const welcomeScreen = document.querySelector('.welcome-screen');
        
        if (!welcomeScreen) {
            // Si no hay pantalla de bienvenida, mostrar tutorial inmediatamente
            this.showTutorial();
            return;
        }
        
        // Comprobar si ya está oculta (puede haberse cerrado anteriormente)
        if (welcomeScreen.style.display === 'none' || 
            welcomeScreen.classList.contains('slide-out')) {
            // Ya está oculta, mostrar el tutorial
            this.showTutorial();
            return;
        }
        
        // Crear un observador para detectar cuando la pantalla de bienvenida se oculte
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if ((mutation.type === 'attributes' && 
                     (mutation.attributeName === 'class' || mutation.attributeName === 'style')) ||
                    mutation.type === 'childList') {
                    
                    // Verificar si ahora está oculta
                    if (welcomeScreen.style.display === 'none' || 
                        welcomeScreen.classList.contains('slide-out')) {
                        
                        // Mostrar el tutorial después de un pequeño retraso
                        setTimeout(() => {
                            this.showTutorial();
                        }, 800); // Pequeño retraso para dar tiempo a completar la animación
                        
                        // Desconectar el observador ya que ya no lo necesitamos
                        observer.disconnect();
                    }
                }
            });
        });
        
        // Observar cambios en los atributos class y style y en los hijos del elemento
        observer.observe(welcomeScreen, { 
            attributes: true, 
            attributeFilter: ['class', 'style'],
            childList: true 
        });
    }
    
    createOverlay() {
        this.tutorialOverlay = document.createElement('div');
        this.tutorialOverlay.className = 'tutorial-overlay';
        this.tutorialOverlay.innerHTML = `
            <div class="tutorial-content">
                <h3 class="tutorial-title"></h3>
                <p class="tutorial-text"></p>
                <div class="tutorial-buttons">
                    <button class="tutorial-understood-btn">Entendido</button>
                </div>
            </div>
            <div class="tutorial-highlight"></div>
        `;
        
        document.body.appendChild(this.tutorialOverlay);
        
        // Evento para el botón "Entendido"
        this.tutorialOverlay.querySelector('.tutorial-understood-btn').addEventListener('click', () => this.endTutorial());
    }
    
    showTutorial() {
        const targetElement = document.querySelector(this.tutorialStep.element);
        
        if (!targetElement) {
            this.endTutorial();
            return;
        }
        
        document.body.classList.add('tutorial-active');
        
        const highlight = this.tutorialOverlay.querySelector('.tutorial-highlight');
        const content = this.tutorialOverlay.querySelector('.tutorial-content');
        
        // Obtener posición del elemento
        const rect = targetElement.getBoundingClientRect();
        
        // Posicionar highlight
        highlight.style.top = `${rect.top - 10}px`;
        highlight.style.left = `${rect.left - 10}px`;
        highlight.style.width = `${rect.width + 20}px`;
        highlight.style.height = `${rect.height + 20}px`;
        
        // Posicionar contenido
        content.style.left = `${rect.right + 20}px`;
        content.style.top = `${rect.top}px`;
        
        // Actualizar texto
        this.tutorialOverlay.querySelector('.tutorial-title').textContent = this.tutorialStep.title;
        this.tutorialOverlay.querySelector('.tutorial-text').textContent = this.tutorialStep.text;
    }
    
    endTutorial() {
        document.body.classList.remove('tutorial-active');
        this.tutorialOverlay.remove();
        localStorage.setItem('hasSeenTutorial', 'true');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tutorialGuide = new TutorialGuide();
});
