document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartDisplay();

    // Agregar evento a todos los botones "Agregar al Carrito"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productCard = button.closest('.product-card');
            const product = {
                id: Date.now(), // ID único para el producto
                name: productCard.querySelector('h3').textContent,
                price: parseFloat(productCard.querySelector('.price').textContent.replace('$', '')),
                image: productCard.querySelector('img').src,
                quantity: 1
            };
            
            addToCart(product);
        });
    });

    function addToCart(product) {
        // Verificar si el producto ya está en el carrito
        const existingProduct = cart.find(item => item.name === product.name);
        
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push(product);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification(`${product.name} agregado al carrito`);
    }

    function updateCartDisplay() {
        cartItems.innerHTML = '';
        cartCount.textContent = cart.length;
        
        let total = 0;
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">$${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                        <button class="remove-item">×</button>
                    </div>
                </div>
            `;
            
            cartItems.appendChild(itemElement);
            total += item.price * item.quantity;

            // Agregar eventos para los botones de cantidad
            const plusBtn = itemElement.querySelector('.plus');
            const minusBtn = itemElement.querySelector('.minus');
            const removeBtn = itemElement.querySelector('.remove-item');

            plusBtn.addEventListener('click', () => updateQuantity(item, 1));
            minusBtn.addEventListener('click', () => updateQuantity(item, -1));
            removeBtn.addEventListener('click', () => removeItem(item));
        });

        updateTotal(total);
    }

    function updateQuantity(item, change) {
        const index = cart.findIndex(i => i.id === item.id);
        if (index > -1) {
            cart[index].quantity += change;
            if (cart[index].quantity < 1) {
                cart.splice(index, 1);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }

    function removeItem(item) {
        cart = cart.filter(i => i.id !== item.id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification(`${item.name} eliminado del carrito`);
    }

    function updateTotal(total) {
        const shipping = cart.length > 0 ? 50 : 0;
        document.querySelector('.subtotal').textContent = `Subtotal: $${total.toFixed(2)}`;
        document.querySelector('.shipping').textContent = `Envío: $${shipping.toFixed(2)}`;
        document.querySelector('.total').textContent = `Total: $${(total + shipping).toFixed(2)}`;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Funcionalidad para móvil
    if (window.innerWidth <= 768) {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const toggleCartBtn = document.querySelector('.toggle-cart-btn');
        const cartHandle = document.querySelector('.cart-handle');
        let startY = 0;
        let currentY = 0;

        // Toggle carrito con botón
        toggleCartBtn.addEventListener('click', () => {
            cartSidebar.classList.toggle('hidden');
            document.body.classList.toggle('cart-open');
        });

        // Funcionalidad de deslizar para cerrar
        cartHandle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        cartHandle.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 0) { // Solo permitir deslizar hacia abajo
                cartSidebar.style.transform = `translateY(${diff}px)`;
            }
        });

        cartHandle.addEventListener('touchend', () => {
            const diff = currentY - startY;
            if (diff > 100) { // Si se deslizó más de 100px, cerrar
                cartSidebar.classList.add('hidden');
                document.body.classList.remove('cart-open');
            }
            cartSidebar.style.transform = '';
            startY = 0;
            currentY = 0;
        });

        // Cerrar carrito al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!cartSidebar.contains(e.target) && !toggleCartBtn.contains(e.target)) {
                cartSidebar.classList.add('hidden');
                document.body.classList.remove('cart-open');
            }
        });
    }
});
