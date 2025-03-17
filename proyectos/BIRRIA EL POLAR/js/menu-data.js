/**
 * Datos del menú de Birria El Polar 2
 * Este archivo contiene todos los productos disponibles en el menú
 */

const menuItems = [
    {
        id: 1,
        name: "Kilo de Birria",
        price: 60,
        category: "popular", // Categorías: 'popular', 'new', 'especial'
        description: "Un kilo de nuestra deliciosa birria, perfecta para compartir",
        image: "./assets/img/orden_tacos.png"
    },
    {
        id: 2,
        name: "Orden de Tacos",
        price: 60,
        category: "popular",
        description: "Tres tacos de birria, acompañados de un consome",
        image: "./assets/img/orden_tacos.png"
    },
    {
        id: 3,
        name: "Consome Grande",
        price: 45,
        category: "popular",
        description: "Consome tradicional con garbanzo y trozos de carne",
        image: "./assets/img/consome_birria.jpg"
    },
    {
        id: 4,
        name: "QuesaBirria",
        price: 75,
        category: "especial",
        description: "Tortilla crujientes con birria, queso derretido y consome para dipear",
        image: "./assets/img/quesa_birria.jpg"
    },
    // Puedes agregar más productos fácilmente siguiendo el mismo formato
    {
        id: 5,
        name: "MaruchanBirria",
        price: 85,
        category: "new",
        description: "La tradicional sopa instantánea con un toque de birria",
        image: "./assets/img/maruchan_biriria.jpg"
    }
];

export default menuItems;
