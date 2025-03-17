/**
 * Inicializador del menú
 * Este archivo se encarga de inicializar el generador de menú
 */

import MenuGenerator from './menu-generator.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el generador de menú
    const menuGenerator = new MenuGenerator('.menu_carrusel');
    menuGenerator.init();
    
    // Re-inicializar el carrusel después de generar el menú
    if (typeof initCarouselNavigation === 'function') {
        initCarouselNavigation();
    }
});
