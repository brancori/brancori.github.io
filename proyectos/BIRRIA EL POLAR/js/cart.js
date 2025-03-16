class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.floatingCart = document.querySelector('.floating-cart');
        this.floatingTotal = document.querySelector('.floating-cart-total');
        this.floatingButton = document.querySelector('.floating-cart-button');
        
        this.init();
        this.loadFromLocalStorage();
    }

    init() {
        // Agregar evento para el botón de enviar pedido
        this.floatingButton.addEventListener('click', () => this.sendOrder());

        // Agregar evento a todos los botones de agregar
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const container = btn.closest('.img_container');
                const price = parseFloat(container.querySelector('.amount').textContent);
                const name = container.closest('.orden_menu').querySelector('.type_order').textContent;
                this.addItem({ name, price });
                
                // Feedback visual
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
        this.total = this.items.reduce((sum, item) => sum + item.price, 0);
        this.floatingTotal.textContent = `Total: $${this.total.toFixed(2)}`;
        this.floatingCart.classList.toggle('show', this.items.length > 0);
        this.saveToLocalStorage();
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
