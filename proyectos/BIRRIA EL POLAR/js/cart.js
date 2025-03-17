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
        
        // Create preview content
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
                                    <span class="preview-quantity">${item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                                    <button class="preview-item-remove" data-index="${index}">−</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="preview-divider"></div>
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
        
        // Show the preview
        previewElement.classList.add('show');
        
        // Add event listeners
        const closeBtn = previewElement.querySelector('.preview-close');
        const sendBtn = previewElement.querySelector('.preview-send-button');
        const removeButtons = previewElement.querySelectorAll('.preview-item-remove');
        
        closeBtn.addEventListener('click', () => {
            previewElement.classList.remove('show');
        });
        
        sendBtn.addEventListener('click', () => {
            this.sendOrder();
            previewElement.classList.remove('show');
        });
        
        removeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                this.decreaseItemQuantity(index);
                // Update preview
                this.showOrderPreview();
            });
        });
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

