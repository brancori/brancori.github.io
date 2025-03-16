// DOM Elements
const menu = document.querySelector('.menu_carrusel');
const imgContainers = document.querySelectorAll('.img_container');
const verticalIndicator = document.querySelector('.vertical-scroll-indicator');
const scrollIndicator = document.querySelector('.scroll-indicator');
const welcomeScreen = document.querySelector('.welcome-screen');
const filters = document.querySelector('.filters');
const menuIcon = document.querySelector('.menu-icon');

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
