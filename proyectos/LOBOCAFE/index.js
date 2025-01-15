document.addEventListener('DOMContentLoaded', () => {
    // Carrusel mejorado
    const carousel = document.querySelector('.coffee-carousel');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    let scrollAmount = 0;
    const scrollStep = 300;
    let scrollInterval;

    function startScroll(direction) {
        stopScroll();
        scrollInterval = setInterval(() => {
            if (direction === 'right') {
                scrollAmount += 20;
                if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
                    scrollAmount = 0;
                }
            } else {
                scrollAmount -= 20;
                if (scrollAmount <= 0) {
                    scrollAmount = 0;
                }
            }
            carousel.style.transform = `translateX(-${scrollAmount}px)`;
        }, 10);
    }

    function stopScroll() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
        }
    }

    // Eventos para las flechas del carrusel
    prevArrow.addEventListener('mousedown', () => startScroll('left'));
    nextArrow.addEventListener('mousedown', () => startScroll('right'));
    document.addEventListener('mouseup', stopScroll);

    // Click simple para navegación paso a paso
    prevArrow.addEventListener('click', () => {
        scrollAmount = Math.max(scrollAmount - scrollStep, 0);
        carousel.style.transform = `translateX(-${scrollAmount}px)`;
    });

    nextArrow.addEventListener('click', () => {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        scrollAmount = Math.min(scrollAmount + scrollStep, maxScroll);
        carousel.style.transform = `translateX(-${scrollAmount}px)`;
    });

    // Sistema del carrito
    let cart = [];
    const cartCount = document.querySelector('.cart-count');
    
    // Función para actualizar el contador del carrito
    function updateCartCount() {
        cartCount.textContent = cart.length;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Función para agregar al carrito
    function addToCart(product) {
        cart.push(product);
        updateCartCount();
        showNotification(`${product.name} agregado al carrito`);
    }

    // Función para mostrar notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }

    // Agregar eventos a los botones de "Agregar al Carrito"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const product = {
                name: productCard.querySelector('h3').textContent,
                price: parseFloat(productCard.querySelector('.price').textContent.replace('$', '')),
                image: productCard.querySelector('img').src
            };
            addToCart(product);
        });
    });

    // Calcular total del carrito
    function calculateTotal() {
        return cart.reduce((total, item) => total + item.price, 0);
    }

    // Función para actualizar el resumen del carrito
    function updateCartSummary() {
        const subtotal = calculateTotal();
        const shipping = 50.00;
        const total = subtotal + shipping;

        if (document.querySelector('.cart-summary')) {
            document.querySelector('.subtotal').textContent = `Subtotal: $${subtotal.toFixed(2)}`;
            document.querySelector('.shipping').textContent = `Envío: $${shipping.toFixed(2)}`;
            document.querySelector('.total').textContent = `Total: $${total.toFixed(2)}`;
        }
    }

    // Parallax effect
    const historySection = document.querySelector('.history');
    const coffee = document.querySelector('.coffee');
    const stats = document.querySelector('.stats');
    
    window.addEventListener('scroll', () => {
        if (window.innerWidth > 768) { // Solo en desktop
            const scrolled = window.pageYOffset;
            const historyTop = historySection.offsetTop;
            const historyHeight = historySection.offsetHeight;
            
            if (scrolled >= historyTop && scrolled <= (historyTop + historyHeight)) {
                const parallaxValue = (scrolled - historyTop) * 0.4;
                coffee.style.transform = `translateY(${parallaxValue}px) scale(0.8)`;
                stats.style.transform = `translateY(${-parallaxValue * 0.2}px)`;
            }
        }
    });

    // Efecto de aparición suave al hacer scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.history-text p, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Funcionalidad del menú móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            navbar.classList.toggle('menu-open');
            body.classList.toggle('menu-open');
        });

        // Cerrar menú al hacer click en un enlace
        document.querySelectorAll('.nav-links .li-tag').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navbar.classList.remove('menu-open');
                body.classList.remove('menu-open');
            });
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                navbar.classList.remove('menu-open');
                body.classList.remove('menu-open');
            }
        });

        // Prevenir que clicks dentro del menú lo cierren
        navLinks.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Funcionalidad del botón scroll to top
    function initScrollToTop() {
        const scrollBtn = document.querySelector('.scroll-top');
        const scrollThreshold = 400; // Píxeles para mostrar el botón
    
        // Mostrar/ocultar botón según scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > scrollThreshold) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });
    
        // Scroll suave al hacer click
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Inicializar scroll to top cuando el DOM esté listo
    initScrollToTop();
});

// Funcionalidad del menú móvil mejorada
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            navbar.classList.toggle('menu-open');
            body.classList.toggle('menu-open');
            menuToggle.setAttribute('aria-expanded', 
                menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });

        // Cerrar menú al hacer click en un enlace
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navbar.classList.remove('menu-open');
                body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                navbar.classList.remove('menu-open');
                body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Prevenir que clicks dentro del menú lo cierren
        navLinks.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Inicializar menú móvil cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initMobileMenu);
