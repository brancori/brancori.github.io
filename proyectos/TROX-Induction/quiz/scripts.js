$('.toggle').click(function(){
    $('.form_').animate({
        height: "toggle",
        'padding-top': 'toggle',
        'padding-bottom': 'toggle',
        opacity: 'toggle'
    }, "slow");
});

// Start Section
let start = document.querySelector("#start");
let start_logo = document.querySelector("#logo_start");

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
let StartAgain = document.querySelector("#StartAgain");

// Get All 'h4' form quiz Section (MCQS)
let choice_que = document.querySelectorAll(".choice_que");

let index = 0;
let timer = 0;
let interval = 0;

// Total points
let correct = 0;


// Store Answer Value
let UserAns = undefined;


obtener_localstorage();

//Obtein localStorag
function obtener_localstorage(){
    var loco = localStorage.getItem("usuario");
    var usuario_ = document.getElementById("username");
    usuario_.innerText = "Usuario: " + loco;
};

// What happen when 'Start' Button will Click
start.addEventListener("click",()=>{
    start.style.display ="none";
    guide.style.display ="block";
    start_logo.style.display ="none";
    
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

let loadData =()=>{
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
    }
    for(i = 0; i <= 3; i++) {
        choice_que[i].classList.remove("disabled");
    }
});


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
    var curp = input.value.toUpperCase(),
        resultado = document.getElementById("resultado"),
        ir_Examen = document.getElementById("ir_Examen"),
        valido = "No válido";
        ir_Examen.style.display = "none";
    if (curpValida(curp)) { // ⬅️ Acá se comprueba
        valido = "Válido";
        ir_Examen = document.getElementById("ir_Examen"),
        resultado.classList.add("ok");
        ir_Examen.style.display = "block";
    }

    else {
    	resultado.classList.remove("ok");
    }

    resultado.innerText = "CURP: " + curp + "\nFormato: " + valido;    
    localStorage.setItem("usuario", curp);
};


