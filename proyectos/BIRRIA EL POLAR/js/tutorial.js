class TutorialGuide {
    constructor() {
        this.tutorialSteps = [
            {
                element: '.mode-toggle-fab',
                title: 'Haz tu pedido fácilmente',
                text: 'Toca aquí para activar el modo compra',
                position: 'right'
            },
            {
                element: '.add-to-cart',
                title: 'Agrega productos',
                text: 'Toca el "+" para agregar productos a tu pedido',
                position: 'left'
            },
            {
                element: '.floating-cart',
                title: 'Envía tu pedido',
                text: 'Cuando estés listo, toca aquí para enviar tu pedido por WhatsApp',
                position: 'top'
            }
        ];
        this.currentStep = 0;
        this.tutorialOverlay = null;
        this.hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        
        // Mostrar tutorial solo en la primera visita
        if (!this.hasSeenTutorial) {
            this.createOverlay();
            // Esperar a que se cierre la pantalla de bienvenida
            setTimeout(() => this.startTutorial(), 3000);
        }
    }
    
    createOverlay() {
        this.tutorialOverlay = document.createElement('div');
        this.tutorialOverlay.className = 'tutorial-overlay';
        this.tutorialOverlay.innerHTML = `
            <div class="tutorial-content">
                <h3 class="tutorial-title"></h3>
                <p class="tutorial-text"></p>
                <div class="tutorial-buttons">
                    <button class="tutorial-skip-btn">Omitir</button>
                    <button class="tutorial-next-btn">Siguiente</button>
                </div>
            </div>
            <div class="tutorial-highlight"></div>
        `;
        
        document.body.appendChild(this.tutorialOverlay);
        
        // Eventos
        this.tutorialOverlay.querySelector('.tutorial-skip-btn').addEventListener('click', () => this.endTutorial());
        this.tutorialOverlay.querySelector('.tutorial-next-btn').addEventListener('click', () => this.nextStep());
    }
    
    startTutorial() {
        this.currentStep = 0;
        this.showStep();
        document.body.classList.add('tutorial-active');
    }
    
    showStep() {
        if (this.currentStep >= this.tutorialSteps.length) {
            this.endTutorial();
            return;
        }
        
        const step = this.tutorialSteps[this.currentStep];
        const targetElement = document.querySelector(step.element);
        
        if (!targetElement) {
            this.nextStep();
            return;
        }
        
        // Activar modo compra si es necesario para mostrar elementos
        if (this.currentStep === 1 && !document.body.classList.contains('shop-mode')) {
            document.body.classList.add('shop-mode');
        }
        
        const highlight = this.tutorialOverlay.querySelector('.tutorial-highlight');
        const content = this.tutorialOverlay.querySelector('.tutorial-content');
        
        // Obtener posición del elemento
        const rect = targetElement.getBoundingClientRect();
        
        // Posicionar highlight
        highlight.style.top = `${rect.top - 10}px`;
        highlight.style.left = `${rect.left - 10}px`;
        highlight.style.width = `${rect.width + 20}px`;
        highlight.style.height = `${rect.height + 20}px`;
        
        // Posicionar contenido según la posición especificada
        switch(step.position) {
            case 'right':
                content.style.left = `${rect.right + 20}px`;
                content.style.top = `${rect.top}px`;
                break;
            case 'left':
                content.style.right = `${window.innerWidth - rect.left + 20}px`;
                content.style.left = 'auto';
                content.style.top = `${rect.top}px`;
                break;
            case 'top':
                content.style.left = `${rect.left}px`;
                content.style.top = `${rect.top - content.offsetHeight - 20}px`;
                break;
            default:
                content.style.left = `${rect.left}px`;
                content.style.top = `${rect.bottom + 20}px`;
        }
        
        // Actualizar texto
        this.tutorialOverlay.querySelector('.tutorial-title').textContent = step.title;
        this.tutorialOverlay.querySelector('.tutorial-text').textContent = step.text;
        
        // Actualizar botón
        const nextBtn = this.tutorialOverlay.querySelector('.tutorial-next-btn');
        nextBtn.textContent = this.currentStep === this.tutorialSteps.length - 1 ? 'Finalizar' : 'Siguiente';
    }
    
    nextStep() {
        this.currentStep++;
        this.showStep();
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
