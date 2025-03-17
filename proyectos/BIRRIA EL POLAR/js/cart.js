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
        
        // Listen for cart button click
        this.floatingButton.addEventListener('click', () => {
            this.sendOrder();
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
    
    sendOrder() {
        // Prepare WhatsApp message
        const itemsList = this.items.map(item => 
            `*${item.name}* ${item.quantity > 1 ? `(x${item.quantity})` : ''} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        const message = `¡Hola! Me gustaría hacer un pedido:\n\n${itemsList}\n\n*Total: $${this.total.toFixed(2)}*`;
        
        // Open WhatsApp
        window.open(`https://wa.me/522214442686?text=${encodeURIComponent(message)}`);
    }
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Cart();
});

