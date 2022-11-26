// Start Section
let start = document.querySelector("#main_container");

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


// Total points
let correct = 0;


// Store Answer Value
let UserAns = undefined;


//Obtein localStorag
function obtener_localstorage(){
    var loco = localStorage.getItem('nombre').toUpperCase();
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













