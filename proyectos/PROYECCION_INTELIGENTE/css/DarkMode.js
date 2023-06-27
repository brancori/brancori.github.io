// const style = document.documentElement.style;
// const DarkMode = document.querySelector('#DarkMode');
// let mode = document.querySelector('.mode');
// let logoPoryeccion = document.querySelector('#logo_proyeccion')

// let  var1 =  style.setProperty('--bg-color', '#f7f7f7');
// let  var2 = style.setProperty('--primary-color', '#e26122');
// let  var4 =  style.setProperty( '--button', '#f7f7f7');


// DarkMode.addEventListener('click', function(){
//     const val1 = style.getPropertyValue('--bg-color');

//     if(val1 === '#f7f7f7'){
//        var1 = style.setProperty('--bg-color', '#181818');
//        var2 = style.setProperty('--primary-color', '#f7f7f7');
//        var3 = style.setProperty('--font-text', '#f7f7f7');
//        var4 =  style.setProperty( '--button', '#e26122');
//        mode.setAttribute("src", "./assets/img/day_mode.png");
//        logoPoryeccion.setAttribute('src', 'assets/img/logo_proyección_white.png')
//         console.log('no');
//     }else{
//         var1 = style.setProperty('--bg-color', '#f7f7f7');
//         var2 = style.setProperty('--primary-color', '#e26122');
//         var4 =  style.setProperty( '--button', '#f7f7f7');
//         mode.setAttribute("src", "./assets/img/dar_mode.png");
//         logoPoryeccion.setAttribute('src', 'assets/img/proyecc_int.png')


//     }
// })

const typed = new Typed('.typed', {
    strings: [
        '<i class="Servicios_cahnge">Aprobaciones Municipales</i>',
        '<i class="Servicios_cahnge">Aprobaciones Estatales</i>',
        '<i class="Servicios_cahnge">Requerimientos para la construcción</i>',
        '<i class="Servicios_cahnge">Régimen de condominio</i>',
    ],
    stringsElement: '#cadenas-texto', // ID del elemento que contiene cadenas de texto a mostrar.
	typeSpeed: 75, // Velocidad en mlisegundos para poner una letra,
	startDelay: 300, // Tiempo de retraso en iniciar la animacion. Aplica tambien cuando termina y vuelve a iniciar,
	backSpeed: 75, // Velocidad en milisegundos para borrrar una letra,
	smartBackspace: true, // Eliminar solamente las palabras que sean nuevas en una cadena de texto.
	shuffle: true, // Alterar el orden en el que escribe las palabras.
	backDelay: 1600, // Tiempo de espera despues de que termina de escribir una palabra.
	loop: true, // Repetir el array de strings
	loopCount: false, // Cantidad de veces a repetir el array.  false = infinite
	showCursor: true, // Mostrar cursor palpitanto
	cursorChar: '|', // Caracter para el cursor
	contentType: 'html', // 'html' o 'null' para texto sin formato
    autoInsertCss: true,
});

const teamConteiner = document.querySelector('.team_conteiner');
const brands = document.querySelector('.brands_cont');
let maxScrollLeft = teamConteiner.scrollWidth  - teamConteiner.clientWidth ;
let maxScrollLeftBrands = brands.scrollWidth - brands.clientWidth;


let intervalo = null;
let step = 1;

const start = () => {
    intervalo = setInterval(function() {
    teamConteiner.scrollLeft = teamConteiner.scrollLeft + step;
    if(teamConteiner.scrollLeft === maxScrollLeft){
        step = (step * -1);
    }else if(teamConteiner.scrollLeft ===  0){
        step = (step * -1);
    }
    },10);
}

const stop = () => {
    clearInterval(intervalo);
}


const start_ = () => {
    intervalo = setInterval(function() {
        brands.scrollLeft = brands.scrollLeft + step;
    if(brands.scrollLeft === maxScrollLeftBrands){
        step = (step * -1);
    }else if(brands.scrollLeft ===  0){
        step = (step * -1);
    }
    },10);
}

teamConteiner.addEventListener('mouseover', ()=>{
    stop()
})
teamConteiner.addEventListener('mouseout', ()=>{
    start()
})
start_();
start();


const imagenes = new Array(
    './assets/img/us_img/1_.jpg',
    './assets/img/us_img/2_.jpg',
    './assets/img/us_img/3_.jpg',
    './assets/img/us_img/4_.jpg',
    './assets/img/us_img/5_.jpg',
    './assets/img/us_img/6_.jpg',
    './assets/img/us_img/7_.jpg',
) 

function cambiar (){
    const  index=Math.floor((Math.random()*imagenes.length))
    document.querySelector(".us_sect_img").src=imagenes[index];
}

onload=function()
{
    cambiar();

    setInterval(cambiar,5000);
}

const venta = document.querySelector('#venta').addEventListener('click', () =>{
    let des1 = document.querySelector('#venta_inm').classList.value
    if ( des1 === 'noVisible'){
        des1 = document.querySelector('#venta_inm').classList.remove('noVisible')
        des1 = document.querySelector('#venta_inm').classList.add('visible')
    }else{
        des1 = document.querySelector('#venta_inm').classList.remove('visible')
        des1 = document.querySelector('#venta_inm').classList.add('noVisible')
    }

});

const busquedaEspe = document.querySelector('#busquedaEspe').addEventListener('click', () =>{
    let des1 = document.querySelector('#Busqueda_Esp').classList.value
    if ( des1 === 'noVisible'){
        des1 = document.querySelector('#Busqueda_Esp').classList.remove('noVisible')
        des1 = document.querySelector('#Busqueda_Esp').classList.add('visible')
    }else{
        des1 = document.querySelector('#Busqueda_Esp').classList.remove('visible')
        des1 = document.querySelector('#Busqueda_Esp').classList.add('noVisible')
    }
})

const estudiosMer = document.querySelector('#estudiosMer').addEventListener('click', () =>{
    let des1 = document.querySelector('#Estudios_mer').classList.value
    if ( des1 === 'noVisible'){
        des1 = document.querySelector('#Estudios_mer').classList.remove('noVisible')
        des1 = document.querySelector('#Estudios_mer').classList.add('visible')
    }else{
        des1 = document.querySelector('#Estudios_mer').classList.remove('visible')
        des1 = document.querySelector('#Estudios_mer').classList.add('noVisible')
    }
})


menudesp_ = document.querySelector('#menu_list_des').addEventListener('click', function(){
    let principal  = document.getElementById('navbar_2').classList.value

if(principal === 'navbar_2_menu'){
    document.querySelector("#navbar_2").classList.remove('navbar_2_menu')
    document.querySelector("#navbar_2").classList.add('navbar_2_menu_visible')
    document.querySelector('#inicio_').addEventListener('click', function(){
        document.querySelector("#navbar_2").classList.remove('navbar_2_menu_visible')
        document.querySelector("#navbar_2").classList.add('navbar_2_menu')
    
    })
    document.querySelector('#nosotros_').addEventListener('click', function(){
        document.querySelector("#navbar_2").classList.remove('navbar_2_menu_visible')
        document.querySelector("#navbar_2").classList.add('navbar_2_menu')
    
    })
    document.querySelector('#servicios_').addEventListener('click', function(){
        document.querySelector("#navbar_2").classList.remove('navbar_2_menu_visible')
        document.querySelector("#navbar_2").classList.add('navbar_2_menu')
    
    })
    document.querySelector('#poryectos').addEventListener('click', function(){
        document.querySelector("#navbar_2").classList.remove('navbar_2_menu_visible')
        document.querySelector("#navbar_2").classList.add('navbar_2_menu')
    
    })
    // document.querySelector('#blog').addEventListener('click', function(){
    //     document.querySelector("#navbar_2").classList.remove('navbar_2_menu_visible')
    //     document.querySelector("#navbar_2").classList.add('navbar_2_menu')
    
    // })
    document.querySelector('#contacto').addEventListener('click', function(){
        document.querySelector("#navbar_2").classList.remove('navbar_2_menu_visible')
        document.querySelector("#navbar_2").classList.add('navbar_2_menu')
    
    })
    document.querySelector('#capacitacion').addEventListener('click', function(){
        document.querySelector("#navbar_2").classList.remove('navbar_2_menu_visible')
        document.querySelector("#navbar_2").classList.add('navbar_2_menu')
    
    })

}else{
    document.querySelector("#navbar_2").classList.remove('navbar_2_menu_visible')
    document.querySelector("#navbar_2").classList.add('navbar_2_menu')
}

    });
    
const menuLinks = document.querySelectorAll('#navbar_2  a[href^="#"]');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const id = entry.target.getAttribute("id");
        const menuLink = document.querySelector(`#navbar_2 a[href="#${id}"]`);
        if(entry.isIntersecting){
            menuLink.classList.add('selected_menubar');
        }else{
            menuLink.classList.remove('selected_menubar');

        }
    })
}, { rootMargin: "-30% 0px -70% 0px" })

menuLinks.forEach((menuLink) => {
    const hash = menuLink.getAttribute("href");
    const target = document.querySelector(hash);
    if(target){
        observer.observe(target)
    }
})









