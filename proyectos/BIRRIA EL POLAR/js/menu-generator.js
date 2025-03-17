/**
 * Generador de elementos de menú
 * Este módulo se encarga de renderizar los productos del menú en el HTML
 */

import menuItems from './menu-data.js';

class MenuGenerator {
    constructor(containerSelector = '.menu_carrusel') {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.error('No se encontró el contenedor del menú');
            return;
        }
    }

    /**
     * Genera el HTML para un ítem del menú
     */
    generateMenuItem(item) {
        // Dividir el precio en entero y decimal
        const priceStr = item.price.toString();
        const integerPart = priceStr;
        const decimalPart = ".00"; // Por defecto sin decimales, se puede ajustar si es necesario
        
        return `
        <div class="orden_menu" data-category="${item.category}" data-id="${item.id}">
            <h3 class="type_order">${item.name}</h3>
            <div class="img_container">
                <div class="add-product-label">Agregar</div>
                <div class="add-to-cart shop-only">+</div>
                <span class="tap-hint">Toca para ver detalles</span>
                <div class="price">
                    <span class="currency">$</span>
                    <span class="amount">${integerPart}</span>
                    <span class="decimals">${decimalPart}</span>
                </div>
                <div class="category-tag">${this.getCategoryLabel(item.category)}</div>
                <img class="img_menu" src="${item.image}" alt="${item.name}">
                <div class="description_overlay">
                    <p class="description">${item.description}</p>
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Convierte el código de categoría a una etiqueta amigable
     */
    getCategoryLabel(category) {
        const labels = {
            'popular': 'Popular',
            'new': 'Nuevo',
            'especial': 'Especial'
        };
        return labels[category] || 'Menú';
    }

    /**
     * Renderiza todos los ítems del menú en el contenedor
     */
    renderMenu() {
        // Preparamos el contenedor para añadir los elementos del carrusel
        const carouselElements = `
            <div class="slide-hint">
                <span>Desliza</span>
                <div class="slide-arrows">
                    <span>←</span>
                    <span>→</span>
                </div>
            </div>
            <div class="scroll-indicator">
                <div class="arrow"></div>
                <div class="arrow"></div>
            </div>
        `;
        
        // Añadimos los elementos del carrusel primero
        this.container.innerHTML = carouselElements;
        
        // Luego añadimos cada ítem del menú
        menuItems.forEach(item => {
            const menuItemHTML = this.generateMenuItem(item);
            this.container.insertAdjacentHTML('beforeend', menuItemHTML);
        });
    }

    /**
     * Filtra los ítems del menú por categoría
     */
    filterMenuItems(category) {
        const items = document.querySelectorAll('.orden_menu');
        
        items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'flex';
                item.style.animation = 'slideUp var(--transition-slow) forwards';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Inicializa la generación del menú y sus interacciones
     */
    init() {
        this.renderMenu();
        
        // Conectar a los filtros existentes
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.filterMenuItems(category);
            });
        });
        
        // Configurar contenedores de imagen después de renderizar
        setTimeout(() => {
            if (typeof window.setupImageContainers === 'function') {
                window.setupImageContainers();
            } else {
                console.error('setupImageContainers function not available');
            }
        }, 100);
    }
}

// Exportar la clase para su uso en otros archivos
export default MenuGenerator;
