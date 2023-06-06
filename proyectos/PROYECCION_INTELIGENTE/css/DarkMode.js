const style = document.documentElement.style;
const DarkMode = document.querySelector('#DarkMode');
let mode = document.querySelector('.mode');
let logoPoryeccion = document.querySelector('#logo_proyeccion')

let  var1 =  style.setProperty('--bg-color', '#f7f7f7');
let  var2 = style.setProperty('--primary-color', '#e26122');
let  var3 =  style.setProperty('--font-text', '#181818');


DarkMode.addEventListener('click', function(){
    const val1 = style.getPropertyValue('--bg-color');

    if(val1 === '#f7f7f7'){
       var1 = style.setProperty('--bg-color', '#181818');
       var2 = style.setProperty('--primary-color', '#f7f7f7');
       var3 = style.setProperty('--font-text', '#f7f7f7');
       mode.setAttribute("src", "./assets/img/day_mode.png");
       logoPoryeccion.setAttribute('src', 'assets/img/logo_proyección_white.png')
        console.log('no');
    }else{
        var1 = style.setProperty('--bg-color', '#f7f7f7');
        var2 = style.setProperty('--primary-color', '#e26122');
        var3 = style.setProperty('--font-text', '#181818');
        mode.setAttribute("src", "./assets/img/dar_mode.png");
        logoPoryeccion.setAttribute('src', 'assets/img/proyecc_int.png')


        console.log('si');
    }
    console.log('nose');
})

const typed = new Typed('.typed', {
    strings: [
        '<i class="Servicios_cahnge">Aprobaciones Municipales</i>',
        '<i class="Servicios_cahnge">Aprobaciones Estatales</i>',
        '<i class="Servicios_cahnge">Requerimientos para la contrucción</i>',
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
let maxScrollLeft = teamConteiner.scrollWidth - teamConteiner.clientWidth;
let maxScrollLeftBrands = brands.scrollWidth - brands.clientWidth;

console.log(maxScrollLeft/8);

const size = teamConteiner.getBoundingClientRect()
var height = size.height;
var width = size.width;


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









