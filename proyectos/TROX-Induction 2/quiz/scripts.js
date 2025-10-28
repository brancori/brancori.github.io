// Start Section
let start = document.querySelector("#main_container");
if (start) {
    start.addEventListener("click", () => {
        start.style.display = "none";
        guide.style.display = "block";
    });
}

// Guide
let guide = document.querySelector("#guide");
let exit = document.querySelector("#exit");
if (exit) {
    exit.addEventListener("click", () => {
        start.style.display = "block";
        guide.style.display = "none";
    });
}
let continueBnt = document.querySelector("#continue");
if (continueBnt) {
    continueBnt.addEventListener("click", () => {
        quiz.style.display = "block";
        guide.style.display = "none";
        loadData(); // Carga los datos primero
        clearInterval(interval); // Limpia cualquier intervalo anterior
        interval = setInterval(countDown, 1000); // Inicia el nuevo intervalo
        
        choice_que.forEach(removeActive => {
            removeActive.classList.remove("active");
        });
        // Corregido: La puntuación debe empezar en 0
        correct = 0;
        total_correct.innerHTML = `${index + 1} de ${MCQS.length} Preguntas`;
    });
}

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
if (next_question) {
    next_question.addEventListener("click", () => {
        if (index < MCQS.length - 1) {
            index++;
            choice_que.forEach(removeActive => {
                removeActive.classList.remove("active");
            });
            loadData();
            // Reiniciar el contador para la nueva pregunta
            clearInterval(interval);
            interval = setInterval(countDown, 1000);
        } else {
            // Fin del quiz
            index = 0;
            clearInterval(interval);
            quiz.style.display = "none";
            // Corregido: Mostrar el resultado final sin restar 1
            points.innerHTML = `Tu Resultado es ${correct} de ${MCQS.length}`;
            result.style.display = "block";
            mostrarBoton();
        }
        for (i = 0; i <= 3; i++) {
            choice_que[i].classList.remove("disabled");
        }
    });
}

// Result Section
let result = document.querySelector("#result");
let points = document.querySelector("#points");
let quit = document.querySelector("#quit");
if (quit) {
    quit.addEventListener("click", () => {
        start.style.display = "block";
        result.style.display = "none";
    });
}
let hacerCredencial = document.querySelector("#haceCredencial");

// Get All 'h4' form quiz Section (MCQS)
let choice_que = document.querySelectorAll(".choice_que");
choice_que.forEach((Choices, choiceNo) => {
    Choices.addEventListener("click", () => {
        if (!Choices.classList.contains('disabled')) {
            Choices.classList.add("active");
            if (choiceNo === MCQS[index].answer) {
                correct++;
            }
            clearInterval(interval);
            choice_que.forEach(choice => {
                choice.classList.add("disabled");
            });
        }
    });
});

let index = 0;
// --- MODIFICACIONES AL TEMPORIZADOR ---
const TIEMPO_LIMITE = 20;
let timer = TIEMPO_LIMITE; 
let interval = 0;

// Tu código original de checkboxes no se ha tocado
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
    // ... (esta función no se modifica)
}

// Corregido: La puntuación se inicializa a 0
let correct = 0;

let UserAns = undefined;

function obtener_localstorage() {
    // ... (esta función no se modifica)
    var loco = localStorage.getItem('nombre');
    if (loco) {
        loco = loco.toUpperCase();
        var usuario_ = document.getElementById("username");
        if (usuario_) {
            usuario_.innerText = "USUARIO: " + loco;
        } else {
            console.error('Element with id "username" not found');
        }
    } else {
        console.error('LocalStorage item "nombre" not found');
    }
}

obtener_localstorage();

function mostrarBoton() {
    var hacerCredencial = document.getElementById("haceCredencial");
    var quit = document.getElementById("quit");
    // Corregido: La condición ahora es más clara
    if (correct >= 8) { 
        hacerCredencial.style.display = "block";
        quit.style.display = "none";
    } else {
        hacerCredencial.style.display = "none";
        quit.style.display = "block";
    }
}

// --- FUNCIÓN DE CUENTA REGRESIVA MODIFICADA ---
let countDown = ()=>{
    if(timer === 0){
        clearInterval(interval); 
        next_question.click();
    }
    else{
        timer--;
        time.innerText = timer < 10 ? '0' + timer : timer;
    }
}

// --- FUNCIÓN DE CARGA DE DATOS MODIFICADA ---
let loadData = () => {
    if (questionNo) {
        questionNo.innerText = index + 1 + ". ";
    }
    if (questionText) {
        questionText.innerText = MCQS[index].question;
    }
    if (option1) {
        option1.innerText = MCQS[index].choice1;
    }
    if (option2) {
        option2.innerText = MCQS[index].choice2;
    }
    if (option3) {
        option3.innerText = MCQS[index].choice3;
    }
    if (option4) {
        option4.innerText = MCQS[index].choice4;
    }

    // Reinicia el timer al valor inicial
    timer = TIEMPO_LIMITE;
    time.innerText = timer; // Muestra el tiempo inmediatamente
    if(total_correct) {
        total_correct.innerHTML = `${index + 1} de ${MCQS.length} Preguntas`;
    }
}

// Se elimina la llamada a loadData() del final para evitar ejecución prematura
// loadData(); 

// Tu código original de cambio() no se ha tocado
function cambio(){
    // ... (esta función no se modifica)
}