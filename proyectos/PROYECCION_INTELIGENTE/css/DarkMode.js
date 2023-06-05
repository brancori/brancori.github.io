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







