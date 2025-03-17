/**
 * Simple cart implementation with direct DOM manipulation
 */
class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.floatingCart = document.querySelector('.floating-cart');
        this.floatingTotal = document.querySelector('.floating-cart-total');
        this.floatingButton = document.querySelector('.floating-cart-button');
        
        // Initialize
        this.initListeners();
    }

    initListeners() {
        // Listen for clicks on all add-to-cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                e.stopPropagation();
                
                const container = e.target.closest('.img_container');
                if (!container) return;
                
                const price = parseFloat(container.querySelector('.amount').textContent);
                const nameElement = container.closest('.orden_menu').querySelector('.type_order');
                const name = nameElement ? nameElement.textContent.trim() : "Producto";
                
                // Add item to cart
                this.addItem({ name, price });
                
                // Visual feedback
                e.target.innerHTML = '✓';
                e.target.style.backgroundColor = '#25D366';
                setTimeout(() => {
                    e.target.innerHTML = '+';
                    e.target.style.backgroundColor = '';
                }, 1500);
                
                // Hide product label
                const label = container.querySelector('.add-product-label');
                if (label) {
                    label.classList.add('clicked');
                    label.style.opacity = '0';
                    label.style.display = 'none';
                }
            }
        });
        
        // Listen for cart button click - now shows preview instead of sending directly
        this.floatingButton.addEventListener('click', () => {
            this.showOrderPreview();
        });
    }
    
    addItem(item) {
        // Check if item already exists
        const existingItemIndex = this.items.findIndex(i => i.name === item.name);
        
        if (existingItemIndex !== -1) {
            this.items[existingItemIndex].quantity++;
        } else {
            this.items.push({...item, quantity: 1});
        }
        
        this.updateCartDisplay();
    }
    
    updateCartDisplay() {
        // Calculate total
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update total display
        this.floatingTotal.textContent = `Total: $${this.total.toFixed(2)}`;
        
        // Show cart
        this.floatingCart.classList.add('show');
    }
    
    // New method to show order preview
    showOrderPreview() {
        // Create message content
        const itemsList = this.items.map(item => 
            `*${item.name}* ${item.quantity > 1 ? `(x${item.quantity})` : ''} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        const message = `¡Hola! Me gustaría hacer un pedido:\n\n${itemsList}\n\n*Total: $${this.total.toFixed(2)}*\n\n¿Podrían confirmármelo?`;
        
        // Check if preview element exists, create if not
        let previewElement = document.querySelector('.order-preview');
        if (!previewElement) {
            previewElement = document.createElement('div');
            previewElement.className = 'order-preview';
            document.body.appendChild(previewElement);
        }
        
        // Create preview content with debugging info
        previewElement.innerHTML = `
            <div class="preview-container">
                <div class="preview-header">
                    <h2>Tu pedido</h2>
                    <button class="preview-close">&times;</button>
                </div>
                <div class="preview-content">
                    <div class="preview-items">
                        ${this.items.map((item, index) => `
                            <div class="preview-item">
                                <div class="preview-item-info">
                                    <span class="preview-item-name">${item.name}</span>
                                    <span class="preview-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                <div class="preview-item-quantity">
                                    <button class="preview-quantity-btn decrease" data-index="${index}">−</button>
                                    <span class="preview-quantity">${item.quantity}</span>
                                    <button class="preview-quantity-btn increase" data-index="${index}">+</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="preview-divider"></div>
                    
                    <!-- Botón para mostrar/ocultar el mensaje -->
                    <div class="message-preview-toggle">
                        <i class="material-icons">visibility</i>
                        <span>Ver mensaje para WhatsApp</span>
                    </div>
                    
                    <div class="preview-message">
                        <div class="preview-message-label">Mensaje a enviar:</div>
                        <div class="preview-message-content">${message.replace(/\n/g, '<br>')}</div>
                    </div>
                    
                    <div class="preview-total">
                        <span>Total:</span>
                        <span>$${this.total.toFixed(2)}</span>
                    </div>
                </div>
                <button class="preview-send-button">
                    <img src="./assets/logo/cdnlogo.com_whatsapp-icon.svg" alt="WhatsApp" width="24">
                    Enviar pedido por WhatsApp
                </button>
            </div>
        `;
        
        // Force repaint to ensure proper rendering
        void previewElement.offsetWidth;
        
        // Show the preview with a slight delay to ensure CSS transitions work
        setTimeout(() => {
            previewElement.classList.add('show');
        }, 10);
        
        // Add event listeners
        const closeBtn = previewElement.querySelector('.preview-close');
        const sendBtn = previewElement.querySelector('.preview-send-button');
        const decreaseButtons = previewElement.querySelectorAll('.preview-quantity-btn.decrease');
        const increaseButtons = previewElement.querySelectorAll('.preview-quantity-btn.increase');
        const messageToggle = previewElement.querySelector('.message-preview-toggle');
        const messagePreview = previewElement.querySelector('.preview-message');
        
        // Listener para el botón de toggle del mensaje
        messageToggle.addEventListener('click', () => {
            messagePreview.classList.toggle('show');
            messageToggle.classList.toggle('active');
            
            // Cambiar el texto según el estado
            const toggleText = messageToggle.querySelector('span');
            const toggleIcon = messageToggle.querySelector('i');
            
            if (messagePreview.classList.contains('show')) {
                toggleText.textContent = 'Ocultar mensaje';
                toggleIcon.textContent = 'visibility_off';
            } else {
                toggleText.textContent = 'Ver mensaje para WhatsApp';
                toggleIcon.textContent = 'visibility';
            }
        });
        
        closeBtn.addEventListener('click', () => {
            previewElement.classList.remove('show');
        });
        
        sendBtn.addEventListener('click', () => {
            this.sendOrder();
            previewElement.classList.remove('show');
        });
        
        // Manejar botones de disminuir cantidad
        decreaseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                this.decreaseItemQuantity(index);
                // Update preview
                this.showOrderPreview();
            });
        });
        
        // Manejar botones de aumentar cantidad
        increaseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                this.increaseItemQuantity(index);
                // Update preview
                this.showOrderPreview();
            });
        });
    }
    
    // Agregar método para aumentar la cantidad
    increaseItemQuantity(index) {
        this.items[index].quantity++;
        this.updateCartDisplay();
    }
    
    decreaseItemQuantity(index) {
        if (this.items[index].quantity > 1) {
            this.items[index].quantity--;
        } else {
            this.items.splice(index, 1);
            
            // Hide cart if empty
            if (this.items.length === 0) {
                this.floatingCart.classList.remove('show');
                
                // Hide preview if open
                const preview = document.querySelector('.order-preview');
                if (preview) {
                    preview.classList.remove('show');
                }
            }
        }
        
        this.updateCartDisplay();
    }
    
    sendOrder() {
        // Prepare WhatsApp message
        const itemsList = this.items.map(item => 
            `*${item.name}* ${item.quantity > 1 ? `(x${item.quantity})` : ''} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        const message = `¡Hola! Me gustaría hacer un pedido:\n\n${itemsList}\n\n*Total: $${this.total.toFixed(2)}*\n\n¿Podrían confirmármelo?`;
        
        // Open WhatsApp
        window.open(`https://wa.me/522214442686?text=${encodeURIComponent(message)}`);
    }
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Cart();
});

