// DOM Elements
const menu = document.querySelector('.menu_carrusel');
const imgContainers = document.querySelectorAll('.img_container');
const verticalIndicator = document.querySelector('.vertical-scroll-indicator');
const scrollIndicator = document.querySelector('.scroll-indicator');
const welcomeScreen = document.querySelector('.welcome-screen');
const filters = document.querySelector('.filters');
const menuIcon = document.querySelector('.menu-icon');

// Al inicio del documento, añadir esto para asegurar que la página siempre se cargue en la parte superior
document.addEventListener('DOMContentLoaded', () => {
    // Forzar el scroll a la parte superior al cargar
    window.scrollTo(0, 0);
    history.scrollRestoration = "manual"; // Evitar que el navegador restaure la posición del scroll
    
    // Image Container Interactions
    imgContainers.forEach(container => {
        container.addEventListener('click', () => {
            imgContainers.forEach(c => c.classList.remove('active'));
            container.classList.toggle('active');
        });
    });

    // Scroll Handlers
    let lastScrollY = window.scrollY;
    const SCROLL_THRESHOLD = 100;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const menuRect = menu.getBoundingClientRect();
        const isInMenuSection = menuRect.top <= 0 && menuRect.bottom >= 0;
        
        verticalIndicator.style.opacity = currentScrollY > SCROLL_THRESHOLD ? '0' : '1';
        scrollIndicator.style.opacity = isInMenuSection ? '1' : '0';
        
        lastScrollY = currentScrollY;
    });

    menu.addEventListener('scroll', () => {
        imgContainers.forEach(container => container.classList.remove('active'));
    });

    // Welcome Screen Gesture Detection
    let touchstartX = 0;
    let touchendX = 0;
    const SWIPE_THRESHOLD = 50;

    const handleSwipe = () => {
        if (touchstartX - touchendX > SWIPE_THRESHOLD) {
            welcomeScreen.classList.add('slide-out');
            setTimeout(() => welcomeScreen.style.display = 'none', 1000);
        }
    };

    document.addEventListener('touchstart', e => touchstartX = e.changedTouches[0].screenX);
    document.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    document.addEventListener('mousedown', e => touchstartX = e.screenX);
    document.addEventListener('mouseup', e => {
        touchendX = e.screenX;
        handleSwipe();
    });

    // Progress Bar
    const progressBar = document.querySelector('.progress-bar');

    function updateProgressBar() {
        const windowHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = (window.scrollY / fullHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    }

    window.addEventListener('scroll', updateProgressBar);

    // Filtros
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.orden_menu');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botones
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filtrar items
            const category = btn.dataset.category;
            menuItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'flex';
                    item.style.animation = 'slideUp var(--transition-slow) forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Mejorar accesibilidad
    filterBtns.forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Menu toggle functionality
    menuIcon.addEventListener('click', () => {
        filters.classList.toggle('show');
        menuIcon.innerHTML = filters.classList.contains('show') ? '×' : '☰';
        // Ajustar el scroll cuando el menú está abierto
        if (filters.classList.contains('show')) {
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    });

    // Cerrar el menú al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filters') && !e.target.closest('.menu-icon')) {
            filters.classList.remove('show');
            menuIcon.innerHTML = '☰';
        }
    });

    // Cerrar el menú al hacer click en un filtro
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.classList.remove('show');
            menuIcon.innerHTML = '☰';
        });
    });

    // Mode toggle functionality - Optimizado para móviles
    const modeToggle = document.getElementById('mode-toggle');
    const body = document.body;
    const tooltip = document.querySelector('.tooltip');
    const modeLabel = document.querySelector('.mode-label');

    // No usaremos localStorage para mantener el modo
    localStorage.removeItem('shopMode');
    localStorage.removeItem('hasVisitedBefore');

    // Primera visita siempre activa
    document.body.classList.add('first-visit');
    setTimeout(() => {
        document.body.classList.remove('first-visit');
    }, 3000); // Reducido a 3s para móviles

    modeToggle.addEventListener('click', () => {
        // Vibración táctil para feedback en móviles
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Agregar clase de animación temporal
        document.body.classList.add('mode-change-animation');
        
        // Toggle shop mode
        body.classList.toggle('shop-mode');
        const isShopMode = body.classList.contains('shop-mode');
        
        // Gestionar las etiquetas "Agregar producto"
        if (isShopMode) {
            // Mostrar las etiquetas en todos los productos
            document.querySelectorAll('.add-product-label').forEach(label => {
                // Solo mostrar si no se ha hecho clic anteriormente
                if (!label.classList.contains('clicked')) {
                    label.style.display = 'block';
                    label.style.opacity = '1';
                    label.style.transform = 'translateX(0)';
                    label.style.zIndex = '50';
                    
                    // Aplicar animación de parpadeo
                    label.style.animation = window.innerWidth <= 768 ? 
                        'blink-effect-mobile 1.2s infinite' : 
                        'blink-effect 1.5s infinite';
                }
            });
        } else {
            // Ocultar todas las etiquetas al desactivar el modo compra
            document.querySelectorAll('.add-product-label').forEach(label => {
                label.style.display = 'none';
                label.style.opacity = '0';
            });
        }
        
        // Actualizar textos con versiones más cortas
        tooltip.textContent = isShopMode ? "Modo menú" : "Modo compra";
        modeLabel.textContent = isShopMode ? "Hacer pedido" : "Activar compras";
        
        // Mostrar etiqueta temporalmente
        modeLabel.style.display = 'block';
        modeLabel.style.opacity = 1;
        modeLabel.classList.remove('animate-fade'); // Eliminar animación cuando se hace clic en el botón
        
        // Ocultar tras unos segundos en móvil
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                modeLabel.style.opacity = 0;
                setTimeout(() => {
                    modeLabel.style.display = 'none';
                }, 300);
            }, 3000);
        }
        
        // Eliminar clase de animación después de la transición
        setTimeout(() => {
            document.body.classList.remove('mode-change-animation');
        }, 1000);
    });

    // Carrusel de menú - navegación elemento por elemento
    initCarouselNavigation();

    // Reemplazar la función de interacción con los contenedores de imagen
    function setupImageContainers() {
        console.log('Configurando contenedores de imagen para mostrar descripción');
        const imgContainers = document.querySelectorAll('.img_container');
        
        imgContainers.forEach(container => {
            // Eliminar listeners previos si existen
            const newContainer = container.cloneNode(true);
            container.parentNode.replaceChild(newContainer, container);
            
            newContainer.addEventListener('click', (e) => {
                // No activar si se hizo clic en el botón de agregar al carrito
                if (e.target.classList.contains('add-to-cart')) {
                    return;
                }
                
                // Cerrar otros contenedores activos
                document.querySelectorAll('.img_container.active').forEach(c => {
                    if (c !== newContainer) {
                        c.classList.remove('active');
                    }
                });
                
                // Toggle estado active para este contenedor
                newContainer.classList.toggle('active');
                
                // Debugging
                console.log('Container clicked, active:', newContainer.classList.contains('active'));
            });
            
            // Agregar mensaje al tap-hint
            const tapHint = newContainer.querySelector('.tap-hint');
            if (tapHint && !tapHint.textContent) {
                tapHint.textContent = 'Toca para ver detalles';
            }
        });
    }
    
    // Llamar a la función durante la carga inicial
    setupImageContainers();
});

// Además, asegurar que la bienvenida no afecte la posición del scroll
welcomeScreen.addEventListener('transitionend', () => {
    if (welcomeScreen.classList.contains('slide-out')) {
        window.scrollTo(0, 0);
        
        // Activar la animación fadeOutLabel para mode-label después de que la pantalla de bienvenida desaparezca
        const modeLabel = document.querySelector('.mode-label');
        if (modeLabel && window.innerWidth <= 768) {
            setTimeout(() => {
                modeLabel.classList.add('animate-fade');
            }, 1000); // Pequeño delay para asegurar que se active después de que la bienvenida se ha ido completamente
        }
    }
});

// Exportamos la función de inicialización del carrusel para poder llamarla desde otros módulos
export function initCarouselNavigation() {
    const carousel = document.querySelector('.menu_carrusel');
    const items = document.querySelectorAll('.orden_menu');
    
    // No continuar si no hay elementos suficientes
    if (!carousel || items.length <= 1) return;
    
    // Añadir los botones de navegación
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    nav.innerHTML = `
        <button class="carousel-button prev" aria-label="Anterior">‹</button>
        <button class="carousel-button next" aria-label="Siguiente">›</button>
    `;
    carousel.appendChild(nav);
    
    // Añadir puntos indicadores
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';
    
    items.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.dataset.index = index;
        indicators.appendChild(dot);
    });
    
    carousel.appendChild(indicators);
    
    // Variables para el seguimiento del carrusel
    let currentIndex = 0;
    const dots = document.querySelectorAll('.carousel-dot');
    
    // Función para actualizar los indicadores
    const updateIndicators = (index) => {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index]?.classList.add('active');
    };
    
    // Función para ir al elemento específico del carrusel
    const goToSlide = (index) => {
        if (index < 0) index = items.length - 1;
        if (index >= items.length) index = 0;
        
        items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        currentIndex = index;
        updateIndicators(index);
    };
    
    // Evento para botón anterior
    document.querySelector('.carousel-button.prev').addEventListener('click', () => {
        goToSlide(currentIndex - 1);
    });
    
    // Evento para botón siguiente
    document.querySelector('.carousel-button.next').addEventListener('click', () => {
        goToSlide(currentIndex + 1);
    });
    
    // Eventos para los puntos indicadores
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            goToSlide(index);
        });
    });
    
    // Detectar cambios en el scroll del carrusel
    carousel.addEventListener('scroll', () => {
        // Determinar qué elemento es más visible
        let closestItem = null;
        let closestDistance = Infinity;
        
        items.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const center = window.innerWidth / 2;
            const itemCenter = rect.left + rect.width / 2;
            const distance = Math.abs(center - itemCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = index;
            }
        });
        
        if (closestItem !== null && closestItem !== currentIndex) {
            currentIndex = closestItem;
            updateIndicators(currentIndex);
        }
    });
    
    // Detectar gestos de deslizamiento en dispositivos táctiles
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleGesture();
    }, { passive: true });
    
    function handleGesture() {
        // Detectar si el gesto es significativo (más de 50px)
        if (touchEndX < touchStartX - 50) {
            // Deslizamiento hacia la izquierda - ir al siguiente
            goToSlide(currentIndex + 1);
        } else if (touchEndX > touchStartX + 50) {
            // Deslizamiento hacia la derecha - ir al anterior
            goToSlide(currentIndex - 1);
        }
    }
}

// Función para configurar las interacciones de los contenedores de imagen
export function setupImageContainers() {
    console.log('Configurando interacciones de contenedores de imagen');
    // Seleccionar de nuevo para asegurar que incluya elementos recién creados
    const imgContainers = document.querySelectorAll('.img_container');
    
    imgContainers.forEach(container => {
        // Asegurar que el contenedor sea clickeable
        container.style.cursor = 'pointer';
        
        // Eliminar listeners anteriores para prevenir duplicados
        const newContainer = container.cloneNode(true);
        if (container.parentNode) {
            container.parentNode.replaceChild(newContainer, container);
        }
        
        // Añadir nuevo listener
        newContainer.addEventListener('click', (e) => {
            // No activar si se hizo clic en el botón de agregar
            if (e.target.classList.contains('add-to-cart')) return;
            
            // Cerrar otros contenedores activos
            document.querySelectorAll('.img_container.active').forEach(c => {
                if (c !== newContainer) c.classList.remove('active');
            });
            
            // Alternar estado del contenedor actual
            newContainer.classList.toggle('active');
            
            // Manejar la pista táctil
            const tapHint = newContainer.querySelector('.tap-hint');
            if (tapHint) {
                if (newContainer.classList.contains('active')) {
                    tapHint.style.opacity = '0';
                    tapHint.style.visibility = 'hidden';
                } else {
                    setTimeout(() => {
                        tapHint.style.opacity = '1';
                        tapHint.style.visibility = 'visible';
                    }, 300);
                }
            }
        });
    });
}

// Agregar la función al contexto global para poder llamarla desde otros archivos
window.setupImageContainers = function() {
    console.log('Llamando setupImageContainers desde global');
    const imgContainers = document.querySelectorAll('.img_container');
    
    imgContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            // No activar si se hizo clic en el botón de agregar al carrito
            if (e.target.classList.contains('add-to-cart')) {
                return;
            }
            
            // Cerrar otros contenedores activos
            document.querySelectorAll('.img_container.active').forEach(c => {
                if (c !== container) {
                    c.classList.remove('active');
                }
            });
            
            // Toggle estado active para este contenedor
            container.classList.toggle('active');
            console.log('Container active state:', container.classList.contains('active'));
        });
    });
};
