class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.init();
        this.loadFromLocalStorage();
        this.floatingCart = document.querySelector('.floating-cart');
        this.floatingTotal = document.querySelector('.floating-cart-total');
        this.floatingButton = document.querySelector('.floating-cart-button');
        
        this.floatingButton.addEventListener('click', () => this.sendOrder());
    }

    init() {
        this.cartModal = document.querySelector('.cart-modal');
        this.cartItems = document.querySelector('.cart-items');
        this.totalAmount = document.querySelector('.total-amount');
        this.orderButton = document.querySelector('.order-button');
        this.cartButton = document.querySelector('.cart-button');
        this.cartCount = document.querySelector('.cart-count');
        this.closeButton = document.querySelector('.close-cart');

        this.cartButton.addEventListener('click', () => {
            this.cartModal.classList.add('active');
        });

        this.closeButton.addEventListener('click', () => {
            this.cartModal.classList.remove('active');
        });

        // Cerrar al hacer clic fuera del modal
        this.cartModal.addEventListener('click', (e) => {
            if (e.target === this.cartModal) {
                this.cartModal.classList.remove('active');
            }
        });

        // Agregar evento a todos los botones de agregar al carrito
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que se cierre la descripción inmediatamente
                const price = parseFloat(btn.dataset.price);
                const name = btn.dataset.name;
                this.addItem({ name, price });
                
                // Mostrar feedback visual
                btn.innerHTML = '<span class="icon">✓</span>Agregado';
                setTimeout(() => {
                    btn.innerHTML = '<span class="icon">+</span>Agregar al pedido';
                    const container = btn.closest('.img_container');
                    if (container) {
                        container.classList.remove('active');
                    }
                }, 1500);
            });
        });

        this.orderButton.addEventListener('click', () => this.sendOrder());
    }

    loadFromLocalStorage() {
        const savedItems = localStorage.getItem('cartItems');
        if (savedItems) {
            this.items = JSON.parse(savedItems);
            this.updateCart();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    addItem(item) {
        this.items.push(item);
        this.updateCart();
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.updateCart();
    }

    updateCart() {
        this.cartItems.innerHTML = '';
        this.total = 0;

        this.items.forEach((item, index) => {
            this.total += item.price;
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <span>${item.name}</span>
                <span>$${item.price}</span>
                <span class="remove">×</span>
            `;
            
            itemElement.querySelector('.remove').addEventListener('click', 
                () => this.removeItem(index));
            
            this.cartItems.appendChild(itemElement);
        });

        this.totalAmount.textContent = `$${this.total.toFixed(2)}`;
        this.orderButton.disabled = this.items.length === 0;
        this.cartModal.classList.toggle('active', this.items.length > 0);
        this.cartCount.textContent = this.items.length;
        this.saveToLocalStorage();
        this.floatingTotal.textContent = `Total: $${this.total.toFixed(2)}`;
        this.floatingCart.classList.toggle('show', this.items.length > 0);
    }

    sendOrder() {
        const message = this.items.map(item => 
            `*${item.name}* - $${item.price}`
        ).join('\n');
        
        const whatsappMessage = encodeURIComponent(
            `¡Hola! Me gustaría hacer un pedido:\n\n${message}\n\n*Total: $${this.total.toFixed(2)}*\n\n¿Podrían confirmármelo?`
        );
        
        window.open(`https://wa.me/522214442686?text=${whatsappMessage}`);
    }
}

// Inicializar carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Cart();
});
