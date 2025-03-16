class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.floatingCart = document.querySelector('.floating-cart');
        this.floatingTotal = document.querySelector('.floating-cart-total');
        this.floatingButton = document.querySelector('.floating-cart-button');
        
        // Borrar el localStorage al iniciar
        localStorage.removeItem('cartItems');
        localStorage.removeItem('shopMode');
        
        this.init();
    }

    init() {
        // Agregar evento para el botón de enviar pedido
        this.floatingButton.addEventListener('click', () => this.sendOrder());

        // Agregar evento a todos los botones de agregar (con tamaño mayor para mobile)
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault(); // Prevenir comportamiento en móviles
                
                // Corregir la captura del nombre y precio del producto
                const container = btn.closest('.img_container');
                const price = parseFloat(container.querySelector('.amount').textContent);
                const nameElement = container.closest('.orden_menu').querySelector('.type_order');
                const name = nameElement ? nameElement.textContent.trim() : "Producto";
                
                this.addItem({ name, price });
                
                // Feedback visual y vibración para móviles
                if (navigator.vibrate) {
                    navigator.vibrate(50); // Pequeña vibración táctil
                }
                
                const originalContent = btn.innerHTML;
                btn.innerHTML = '✓';
                btn.style.backgroundColor = '#25D366';
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.style.backgroundColor = '';
                }, 1500);
            });
        });
    }

    addItem(item) {
        // Comprobar si ya existe un ítem con el mismo nombre
        const existingItemIndex = this.items.findIndex(i => i.name === item.name);
        
        if (existingItemIndex !== -1) {
            // Si existe, incrementar la cantidad
            this.items[existingItemIndex].quantity = (this.items[existingItemIndex].quantity || 1) + 1;
            // Mostrar feedback
            this.showFeedback(`Se agregó otro ${item.name}`, 'success');
        } else {
            // Si no existe, añadir como nuevo con cantidad 1
            this.items.push({...item, quantity: 1});
            // Mostrar feedback
            this.showFeedback(`${item.name} agregado al pedido`, 'success');
        }
        
        // Vibrar para dar feedback táctil
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        this.updateCart();
    }

    removeItem(index) {
        const removedItem = this.items[index];
        this.items.splice(index, 1);
        this.updateCart();
        this.showFeedback(`${removedItem.name} eliminado del pedido`, 'alert');
    }

    updateCart() {
        // Calcular total considerando cantidades
        this.total = this.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        
        // Actualizar total visible
        this.floatingTotal.textContent = `Total: $${this.total.toFixed(2)}`;
        
        // Actualizar contador de items
        const totalItems = this.items.reduce((count, item) => count + (item.quantity || 1), 0);
        
        // Mostrar/ocultar carrito según contenido
        this.floatingCart.classList.toggle('show', this.items.length > 0);
        
        // Animar el botón cuando se actualiza el carrito
        if (this.items.length > 0) {
            this.floatingButton.classList.add('pulse-once');
            setTimeout(() => this.floatingButton.classList.remove('pulse-once'), 1000);
        }
    }

    sendOrder() {
        // Preparar vista previa del mensaje
        const itemsList = this.items.map(item => 
            `*${item.name}* ${item.quantity > 1 ? `(x${item.quantity})` : ''} - $${(item.price * (item.quantity || 1)).toFixed(2)}`
        ).join('\n');
        
        const whatsappMessage = `¡Hola! Me gustaría hacer un pedido:\n\n${itemsList}\n\n*Total: $${this.total.toFixed(2)}*\n\n¿Podrían confirmármelo?`;
        
        // Mostrar previsualización
        this.showOrderPreview(whatsappMessage);
    }
    
    showOrderPreview(message) {
        // Crear o actualizar la previsualización
        let preview = document.querySelector('.order-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'order-preview';
            preview.innerHTML = `
                <div class="order-preview-header">
                    <div class="order-preview-title">Tu pedido para WhatsApp</div>
                    <button class="order-preview-close">&times;</button>
                </div>
                <div class="order-message-preview"></div>
                <button class="order-send-button">
                    <img src="./assets/icons/whatsapp.svg" alt="WhatsApp" class="whatsapp-logo">
                    Enviar pedido por WhatsApp
                </button>
            `;
            document.body.appendChild(preview);
            
            // Eventos de botones
            preview.querySelector('.order-preview-close').addEventListener('click', () => {
                preview.classList.remove('show');
            });
            
            preview.querySelector('.order-send-button').addEventListener('click', () => {
                // Enviar a WhatsApp
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/522214442686?text=${encodedMessage}`);
                preview.classList.remove('show');
            });
        }
        
        // Actualizar contenido
        preview.querySelector('.order-message-preview').textContent = message;
        
        // Mostrar previsualización con animación
        setTimeout(() => preview.classList.add('show'), 100);
    }
    
    // Método para mostrar feedback al usuario
    showFeedback(message, type = 'info') {
        // Crear elemento de feedback
        let feedback = document.querySelector('.feedback-toast');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'feedback-toast';
            document.body.appendChild(feedback);
        }
        
        // Configurar tipo y mensaje
        feedback.className = `feedback-toast ${type}`;
        feedback.textContent = message;
        
        // Mostrar y ocultar con animación
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }
}

// Inicializar carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Cart();
});
