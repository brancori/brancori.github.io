


let resultado = document.getElementById("resultado");
let evaluacion = document.querySelector('.evaluacion')


const formulario = document.getElementById('nombre');
const inputs = document.querySelectorAll('#registro_ input');
const ir_Examen = document.getElementById("ir_Examen");
const expresiones = {
    nombre: /^[a-zA-ZÀ-ÿ\s]{6,40}$/, // Letras y espacios, pueden llevar acentos.
    re: /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,

}

const campos = {
    nombre: false,
    re: false
};

var valido = "No valido";

//Función para validar una CURP
function curpValida(curp) {
       var validado = curp.match(expresiones.re);
    if (!validado)  //Coincide con el formato general?
    	return false;
    
    //Validar que coincida el dígito verificador
    function digitoVerificador(curp17) {
        //Fuente https://consultas.curp.gob.mx/CurpSP/
        var diccionario  = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
            lngSuma      = 0.0,
            lngDigito    = 0.0;
        for(var i=0; i<17; i++)
            lngSuma = lngSuma + diccionario.indexOf(curp17.charAt(i)) * (18 - i);
        lngDigito = 10 - lngSuma % 10;
        if (lngDigito == 10) return 0;
        return lngDigito;
    }
  
    if (validado[2] != digitoVerificador(validado[1])) 
    	return false;
        
    return true; //Validado
};



const validarFormulario = (e) =>{
    switch(e.target.name){
        case "curp":
        if(expresiones.re.test(e.target.value.toUpperCase()) ){
           document.getElementById('curp').classList.remove('item2-incorrecto');
           document.getElementById('curp').classList.add('item2-correcto');
           resultado.classList.add("ok");
           valido = "Válido";
           
        }else{
           document.getElementById('curp').classList.add('item2-incorrecto');
           document.getElementById('curp').classList.remove('item2-correcto');
           resultado.classList.remove("ok");
           valido = "No valido";
        }
        break; 
        case "nombre":
        if(expresiones.nombre.test(e.target.value) ){
           document.getElementById('nombre').classList.remove('item2-incorrecto');
           document.getElementById('nombre').classList.add('item2-correcto');
           resultado.classList.add("ok");
           valido = "Válido";
           
           
        }else{
           document.getElementById('nombre').classList.add('item2-incorrecto');
           document.getElementById('nombre').classList.remove('item2-correcto');
           resultado.classList.remove("ok");
           valido = "No valido";
        }
        break; 
       }

       resultado.innerText = "Nombre: " + e.target.value.toUpperCase() + "\nFormato: " + valido;
       localStorage.setItem("Usuario.value", e.target.value);
       
   };

inputs.forEach((input) => {
   input.addEventListener('keyup', validarFormulario);
   input.addEventListener('blur', validarFormulario);
});






evaluacion.addEventListener('submit', (e) =>{
    e.preventDefault();
});













