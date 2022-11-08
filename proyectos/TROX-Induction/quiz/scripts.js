// Start Section
let start = document.querySelector("#main_container");
let resultado = document.getElementById("resultado");
// Guide
let guide = document.querySelector("#guide");
let exit = document.querySelector("#exit");
let continueBnt = document.querySelector("#continue");

// Quiz Section
let quiz = document.querySelector("#quiz");
let time = document.querySelector("#time");

// Question Section
let questionNo = document.querySelector("#questionNo");
let questionText = document.querySelector("#questionText");

// Multiple Choices of Question
let option1 = document.querySelector("#option1");
let option2 = document.querySelector("#option2");
let option3 = document.querySelector("#option3");
let option4 = document.querySelector("#option4");

// Correct and next Button
let total_correct = document.querySelector("#total_correct");
let next_question = document.querySelector("#next_question");

// Result Section
let result = document.querySelector("#result");
let points = document.querySelector("#points");
let quit = document.querySelector("#quit");
let hacerCredencial = document.querySelector("#haceCredencial");

// Get All 'h4' form quiz Section (MCQS)
let choice_que = document.querySelectorAll(".choice_que");

let index = 0;
let timer = 0;
let interval = 0;

//Get All Checkboxs
let TA_ = document.getElementById("TA_");
let TA = document.getElementById("TA");

let EC_ = document.getElementById("EC_");
let EC = document.getElementById("EC");

let TE_ = document.getElementById("TE_");
let TE = document.getElementById("TE");

let OM_ = document.getElementById("OM_");
let OM = document.getElementById("OM");

let CI_ = document.getElementById("CI_");
let CI = document.getElementById("CI");

let MSP_ = document.getElementById("MSP_");
let MSP = document.getElementById("MSP");


function ShowSkills(){  
    if(TA.checked){
        TA_.style.background ='#00375F';
    }else{
        TA_.style.background ='none';
    };

    if(EC.checked){
        EC_.style.background ='#00375F';
    }else{
        EC_.style.background ='none';
    };

    if(TE.checked){
        TE_.style.background ='#00375F';
    }else{
        TE_.style.background ='none';
    };

    if(OM.checked){
        OM_.style.background ='#00375F';
    }else{
        OM_.style.background ='none';
    };
    if(CI.checked){
        CI_.style.background ='#00375F';
    }else{
        CI_.style.background ='none';
    };
    if(MSP.checked){
        MSP_.style.background ='#00375F';
    }else{
        MSP_.style.background ='none';
    };
}

var validado = "No valido";
var valido = "No valido";

var validado_ = 0;
var valido_ = 0;


const formulario = document.getElementById('nombre');
const inputs = document.querySelectorAll('#registro_ input');
const ir_Examen = document.getElementById("ir_Examen");
const expresiones = {
    nombre: /^[a-zA-ZÀ-ÿ\s]{6,40}$/, // Letras y espacios, pueden llevar acentos.
}


const validarFormulario = (e) =>{
     switch(e.target.name){
         case "nombre":
         if(expresiones.nombre.test(e.target.value)){
            document.getElementById('nombre').classList.remove('item2-incorrecto');
            document.getElementById('nombre').classList.add('item2-correcto');
            validado = "Válido";
            resultado.classList.add("ok");
            ir_Examen.style.display = "block";

         }else{
            validado = "No valido";
            document.getElementById('nombre').classList.add('item2-incorrecto');
            document.getElementById('nombre').classList.remove('item2-correcto');
            resultado.classList.remove("ok");
            ir_Examen.style.display = "none";
         }
         break;  
        }
        resultado.innerText = "Nombre: " + e.target.value + "\nFormato: " + validado;
        localStorage.setItem("Usuario.value", e.target.value);
        
    };
   
inputs.forEach((input) => {
    input.addEventListener('keyup', validarFormulario);
    input.addEventListener('blur', validarFormulario);
});



// Total points
let correct = 0;


// Store Answer Value
let UserAns = undefined;


//Obtein localStorag
function obtener_localstorage(){
    var loco = localStorage.getItem("Usuario.value");
    var usuario_ = document.getElementById("username");
    usuario_.innerText = "USUARIO: " + loco;
};

obtener_localstorage();

// What happen when 'Start' Button will Click
start.addEventListener("click",()=>{
    start.style.display ="none";
    guide.style.display ="block";
});


// What happen when 'Exit' Button will Click
exit.addEventListener("click",()=>{
    start.style.display ="block";
    guide.style.display ="none";
});

//Creating Timer For Quiz Timer Section
let countDown = ()=>{
    if(timer === 5){
        clearInterval(interval); 
        next_question.click();
    }
    else{
        timer++;
        time.innerText = timer;
    }
}
//setInterval(countDown,1000)

let loadData = () => {
    questionNo.innerText = index + 1 + ". ";
    questionText.innerText = MCQS[index].question;
    option1.innerText = MCQS[index].choice1;
    option2.innerText = MCQS[index].choice2;
    option3.innerText = MCQS[index].choice3;
    option4.innerText = MCQS[index].choice4;

    //timer start
    timer = 0;
}

loadData();

// What happen when 'Continue' Button will Click
continueBnt.addEventListener("click", () => {
    quiz.style.display ="block";
    guide.style.display ="none";

    interval = setInterval(countDown, 1000);
    loadData();
    // Remove All Active Classes when continue button will click
 
    choice_que.forEach(removeActive =>{
        removeActive.classList.remove("active");
        })
        total_correct.innerHTML = `${correct = 0} de ${MCQS.length} Preguntas`;
});

choice_que.forEach((Choices, choiceNo) =>{
Choices.addEventListener("click", () => {
    Choices.classList.add("active");
    //Check answer
    if(choiceNo === MCQS[index].answer)
    {
        correct++;
    }
    else
        {
            correct += 0;
        }
        //Stop Counter
        clearInterval(interval);

        //disable All Option whe User Select An Option
        for (i = 0; i <= 3; i++)
        {
            choice_que[i].classList.add("disabled");
        }
    });
});

// What happen when 'Next' Button will Click
next_question.addEventListener("click", () => {
    //if index is less then MCQS.length
    if (index !== MCQS.length - 1){
        index++;
        choice_que.forEach(removeActive =>{
            removeActive.classList.remove("active");
            })
            //question
            loadData();

            //result
            total_correct.style.display = "block";
            total_correct.innerHTML = `${correct} de ${MCQS.length} Preguntas`;
            clearInterval(interval);
            interval = setInterval(countDown , 1000);
    }
    else{
            index = 0;
            //When quiz Question Complete Display Result Section
            clearInterval(interval);correct
            quiz.style.display = "none";
            points.innerHTML = `Tu Resultado es ${correct} de ${MCQS.length}`;
            result.style.display = "block";
            mostrarBoton()
            function mostrarBoton(){
            if( correct >= 2){
                hacerCredencial.style.display = 'block';
                quit.style.display = 'none';
            }else{
                hacerCredencial.style.display = 'none';
                quit.style.display = 'block';
            }
            };
            
        }

    for(i = 0; i <= 3; i++) {
        choice_que[i].classList.remove("disabled");
    }
})



//what happen when 'Quit' Button Will Click
quit.addEventListener("click", () => {
    start.style.display = "block";
    result.style.display = "none";
});


//Inner Text tag P
function cambio(){
    var NContratista = document.getElementById("NEC").value.toUpperCase();
    document.getElementById("nContratista").innerHTML = NContratista;

    var nt = document.getElementById("Nt").value.toUpperCase();
    document.getElementById("input_nt").innerHTML = nt;

   var pt = document.getElementById("pt").value.toUpperCase();
   document.getElementById("input_pt").innerHTML = pt;

   var nss = document.getElementById("nss").value.toUpperCase();
   document.getElementById("input_nss").innerHTML = nss;

   var ce = document.getElementById("ce").value.toUpperCase();
   document.getElementById("input_ce").innerHTML = ce;

   var nc = document.getElementById("nc").value.toUpperCase();
   document.getElementById("input_nc").innerHTML = nc;

   var cT = document.getElementById("cT").value.toUpperCase();
   document.getElementById("input_ct").innerHTML = cT;
}


//Función para validar una CURP
function curpValida(curp) {
    var re = /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
        validado = curp.match(re);
	
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
}


//Handler para el evento cuando cambia el input
//Lleva la CURP a mayúsculas para validarlo
function validarInput(input) {
    var curp = input.value.toUpperCase();
        ir_Examen.style.display = "none";
    if (curpValida(curp)) { // ⬅️ Acá se comprueba
        valido = "Válido";
        document.getElementById('curp').classList.remove('item1-incorrecto');
        document.getElementById('curp').classList.add('item1-correcto');
        resultado.classList.add("ok");
        ir_Examen.style.display = "block";
    }
    else {
    	resultado.classList.remove("ok");
        document.getElementById('curp').classList.add('item1-incorrecto');
        document.getElementById('curp').classList.remove('item1-correcto');
        ir_Examen.style.display = "none";
    }
    resultado.innerText = "CURP: " + curp + "\nFormato: " + valido;
};














