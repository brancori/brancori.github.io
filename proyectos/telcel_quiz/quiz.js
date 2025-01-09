const questions = [
    {
        "question": "Requisito para ser cliente corporativo:",
        "answers": ["Mínimo de 10 líneas en una sola región", "Máximo de 5 líneas en una región", "Al menos 20 líneas en dos regiones", "Sin límite de líneas"],
        "correct": 0
    },
    {
        "question": "¿Qué requisitos se necesitan para incluir a un cliente corporativo sin tener 10 líneas activas?",
        "answers": ["Consumo promedio de $10,000 o más en un periodo de 6 meses", "Consumo promedio de $5,000 o más en un periodo de 3 meses", "Tener al menos 5 líneas activas", "Cumplir con un mínimo de 15 líneas en total"],
        "correct": 0
    },
    {
        "question": "Un cliente corporativo puede tener:",
        "answers": ["Tarifas corporativas y adendum a 12, 18 y 24 meses", "Tarifas residenciales y adendum a 6, 12 y 18 meses", "Tarifas mixtas y adendum a 3, 6 y 9 meses", "Tarifas únicas y adendum a 12 y 24 meses"],
        "correct": 0
    },
    {
        "question": "¿Quiénes son Clientes corporativos regionales?",
        "answers": ["Clientes de 10 líneas en adelante son atendidos por asesores internos o especialistas de atención empresarial. Se identifican en el sistema de facturación como tipo de cuenta CM o MG y su ciclo de facturación puede ser 31 ó 32", "Clientes de 5 líneas en adelante son atendidos por asesores externos. Se identifican en el sistema de facturación como tipo de cuenta CR y su ciclo de facturación puede ser 30 ó 33", "Clientes con más de 20 líneas son atendidos por especialistas regionales. Se identifican en el sistema como tipo de cuenta RG y su ciclo de facturación es 31", "Clientes con menos de 10 líneas son atendidos por asesores internos y se identifican en el sistema de facturación como tipo de cuenta IR"],
        "correct": 0
    },
    {
        "question": "Ciclos de Facturación para clientes corporativos regionales R1 a 8:",
        "answers": ["31 y 32", "28 y 29", "30 y 33", "20 y 21"],
        "correct": 0
    },
    {
        "question": "¿Qué clientes se consideran segmento corporativo CM?",
        "answers": ["Clientes de 10 a 49 líneas o consumos de 10 a 30 mil pesos", "Clientes de 5 a 9 líneas o consumos de 5 a 10 mil pesos", "Clientes de 50 a 99 líneas o consumos de 30 a 50 mil pesos", "Clientes de 1 a 9 líneas o consumos de menos de 10 mil pesos"],
        "correct": 0
    },
    {
        "question": "¿Qué clientes se consideran segmento corporativo MG?",
        "answers": ["Clientes de 50 líneas en adelante y/o consumos de más de $30,000", "Clientes de 20 a 49 líneas y/o consumos de $20,000 a $30,000", "Clientes de 10 a 19 líneas y/o consumos de $10,000 a $20,000", "Clientes de 1 a 9 líneas y/o consumos de menos de $10,000"],
        "correct": 0
    },
    {
        "question": "¿Cómo se identifica a un cliente precorporativo?",
        "answers": ["PC", "PR", "CR", "RC"],
        "correct": 0
    },
    {
        "question": "Son los clientes con consumos de $200,000 o más y que tienen responsabilidad de pago y negociación en R9, ciclo de facturación 20 y puede ser CO o MG:",
        "answers": ["Cliente corporativo R9", "Cliente regional R8", "Cliente local R7", "Cliente empresarial R6"],
        "correct": 0
    },
    {
        "question": "¿Cuáles son las características de un cliente empresarial R9?",
        "answers": ["Ciclo 60 o 61, responsabilidad de pago R9", "Ciclo 50 o 51, responsabilidad de pago R8", "Ciclo 40 o 41, responsabilidad de pago R7", "Ciclo 30 o 31, responsabilidad de pago R6"],
        "correct": 0
    }
    ,
    {
        "question": "¿Qué es Región con responsabilidad de negociación?",
        "answers": ["Región donde se realizan las negociaciones y el cierre de la venta, la cual tiene la relación con el contacto del cliente. Como regla general es la región donde se encuentren las oficinas corporativas del cliente. Es la región responsable de mantener y darle seguimiento a las líneas que se encuentren a nivel nacional.", "Región donde se gestionan las cuentas internacionales.", "Región que maneja exclusivamente los clientes premium.", "Región que se dedica a la gestión de pagos."],
        "correct": 0
    },
    {
        "question": "¿Qué son líneas regionales?",
        "answers": ["Líneas CM y MG con número de la región que les reporta la responsabilidad de pago y negociación están en la misma región.", "Líneas con tarifas reducidas para clientes locales.", "Líneas utilizadas para comunicación interregional.", "Líneas especializadas en servicios internacionales."],
        "correct": 0
    },
    {
        "question": "¿Qué son líneas interregionales?",
        "answers": ["Líneas CM y MG con número de región diferente a la que les reporta, pero responsabilidad de pago y negociación están en la región que les atiende.", "Líneas utilizadas exclusivamente para clientes internacionales.", "Líneas que no tienen asignación regional.", "Líneas utilizadas para la gestión interna de la empresa."],
        "correct": 0
    },
    {
        "question": "Son líneas MG, CM, 31 o 32 activadas con números de la región que las reporta pero que son atendidas y tienen responsabilidad de pago y negociación en una región distinta.",
        "answers": ["Líneas foráneas", "Líneas locales", "Líneas residenciales", "Líneas corporativas internas"],
        "correct": 0
    },
    {
        "question": "Verificar que el cliente no tenga líneas canceladas en abogado, afianzadoras o deducción fiscal (ciclos 97, 98 o 99) ni con saldos a más de 60 días son:",
        "answers": ["Acciones que debe tomar el asesor de servicio a clientes al recibir líneas nuevas", "Acciones que debe tomar el cliente para activar nuevas líneas", "Requisitos para la contratación de servicios adicionales", "Pasos para la reactivación de líneas suspendidas"],
        "correct": 0
    },
    {
        "question": "¿Qué clase de crédito deben tener los clientes corporativos, salvo autorización de la DEUR?",
        "answers": ["RP en cuentas padre, BU si la RP es en las hijas. En ctas. no consolidadas BU.", "Crédito estándar en todas las cuentas.", "Crédito limitado en cuentas hijas.", "Crédito especial en cuentas consolidadas."],
        "correct": 0
    },
    {
        "question": "Clave que indica el ciclo de facturación de una línea pospago",
        "answers": ["BILLING CYCLE", "PAYMENT CYCLE", "INVOICE CYCLE", "ACCOUNT CYCLE"],
        "correct": 0
    },
    {
        "question": "En esta pantalla se indica el nivel de facturación (padre o hija) y se agregan cuentas hijas:",
        "answers": ["CONSL", "BILLING", "INVOICE", "ACCOUNT"],
        "correct": 0
    },
    {
        "question": "Número de líneas y tarifas corporativas.",
        "answers": ["AA (1-5), BB (6-20), CC (21-100) y DD (más de 100)", "A (1-10), B (11-30), C (31-50) y D (más de 50)", "X (1-15), Y (16-40), Z (41-75) y W (más de 75)", "P (1-20), Q (21-40), R (41-60) y S (más de 60)"],
        "correct": 0
    },
    {
        "question": "Los clientes precorporativos en que ciclo de facturación se encuentran:",
        "answers": ["MASIVO", "CORPORATIVO", "REGIONAL", "INDUSTRIAL"],
        "correct": 0
    },
    {
        "question": "Beneficio que consiste en poder contratar por cada línea corporativa 2 líneas en tarifas AA:",
        "answers": ["Beneficio corporativo", "Descuento especial", "Plan de fidelidad", "Promoción temporal"],
        "correct": 0
    },
    {
        "question": "Tipo de cuenta con el que identificas una línea de plan empleado corporativo Masivo:",
        "answers": ["VE", "VC", "EM", "ME"],
        "correct": 0
    },
    {
        "question": "En qué ciclo se activan las líneas empleado corporativo:",
        "answers": ["Ciclo Masivo", "Ciclo Corporativo", "Ciclo Regional", "Ciclo Empresarial"],
        "correct": 0
    },
    {
        "question": "¿Qué sucede con las líneas empleado corporativo si la empresa relacionada con este servicio cancela las líneas con Telcel?",
        "answers": ["Los empleados parientes o familiares relacionados pierden la tarifa empresarial, por lo que sus planes se cambiarán al plan homólogo de mercado masivo con tarifas de mercado masivo", "Las líneas se mantienen activas pero con una tarifa diferente", "Los empleados pueden optar por mantener la tarifa empresarial", "Las líneas se cancelan automáticamente"],
        "correct": 0
    },
    {
        "question": "¿En qué pantalla se cambia la responsabilidad de pago y de negociación?",
        "answers": ["RETC2", "PAGO1", "NEGOC3", "CAMBIO4"],
        "correct": 0
    },
    {
        "question": "Si una persona física acude a CAC a solicitar cesión de derechos para persona moral ¿Quién debe hacer el trámite?",
        "answers": ["Las cesiones de derecho de un cliente masivo a un cliente corporativo y viceversa debe hacerlas el asesor corporativo de la región que atienda la cuenta al momento del trámite, ya que requieren cambio de ciclo y cuenta para el cual está facultado.", "El asesor de servicio al cliente", "El gerente regional", "El departamento de ventas"],
        "correct": 0
    },
    {
        "question": "¿Cuantas líneas con adeudo puede tener una empresa a la que se le requiere ceder una línea?",
        "answers": ["No se tramita cesión de derechos si la persona física o moral que recibe la cuenta tiene alguna cuenta suspendida o cancelada por morosidad.", "Puede tener hasta 5 líneas con adeudo", "No puede tener más de 2 líneas con adeudo", "Puede tener cualquier cantidad de líneas con adeudo"],
        "correct": 0
    },
    {
        "question": "Sistema para agendar citas en Centro de atención:",
        "answers": ["SIMAEC WEB", "CITAS TELCEL", "AGENDA ONLINE", "CENTRO VIRTUAL"],
        "correct": 0
    },
    {
        "question": "En esta sección de la factura de servicio encuentras información de planes y paquetes contratados /consumo de voz, mensajería y servicios corporativos:",
        "answers": ["Servicios de Telecomunicaciones Telcel", "Detalle de Consumo", "Resumen de Facturación", "Información de la Cuenta"],
        "correct": 0
    },
    {
        "question": "Documentos que enuncia los siguientes puntos: libertad de elegir, derecho a la portabilidad y desbloqueo, derecho a condiciones de contratación claras, justas y equitativas, derecho a la no discriminación:",
        "answers": ["Carta de derechos de los usuarios", "Términos y Condiciones", "Contrato de Servicio", "Guía del Usuario"],
        "correct": 0
    },
    
    
    // ... (Asegúrate de tener 600 preguntas en este array)
];

function getRandomQuestions(questions, num) {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

let selectedQuestions = getRandomQuestions(questions, 25);

let currentQuestionIndex = 0;
let correctAnswers = [];
let incorrectAnswers = [];
let score = 0;

const questionContainer = document.getElementById('question');
const questionCounter = document.getElementById('question-counter');
const answerButtons = document.querySelectorAll('.answer-button');
const nextButton = document.getElementById('next-button');
const resultContainer = document.getElementById('result-container');
const scoreDisplay = document.getElementById('score');
const correctQuestionsDisplay = document.getElementById('correct-questions');
const incorrectQuestionsDisplay = document.getElementById('incorrect-questions');

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = [];
    incorrectAnswers = [];
    selectedQuestions = getRandomQuestions(questions, 25);
    showQuestion();
}

function showQuestion() {
    resetState();
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    questionCounter.innerText = `Pregunta ${currentQuestionIndex + 1} de ${selectedQuestions.length}`;
    questionContainer.innerText = currentQuestion.question;
    
    const shuffledAnswers = [...currentQuestion.answers].sort(() => Math.random() - 0.5);
    shuffledAnswers.forEach((answer, index) => {
        const button = answerButtons[index];
        button.innerText = answer;
        button.disabled = false;
        button.classList.remove('selected');
        button.onclick = () => selectAnswer(currentQuestion.answers.indexOf(answer));
    });
}

function resetState() {
    nextButton.style.display = 'none';
    answerButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('selected');
    });
}

function selectAnswer(selectedIndex) {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    answerButtons.forEach(button => button.disabled = true);
    if (selectedIndex === currentQuestion.correct) {
        score++;
        if (!correctAnswers.includes(currentQuestion.question)) {
            correctAnswers.push(currentQuestion.question);
        }
    } else {
        if (!incorrectAnswers.includes(currentQuestion.question)) {
            incorrectAnswers.push(currentQuestion.question);
        }
    }
    nextButton.style.display = 'block';
}

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    questionContainer.style.display = 'none';
    questionCounter.style.display = 'none';
    answerButtons.forEach(button => button.style.display = 'none');
    nextButton.style.display = 'none';
    resultContainer.style.display = 'block';
    scoreDisplay.innerText = `Tu puntuación: ${score}/${selectedQuestions.length}`;
    
    correctQuestionsDisplay.innerHTML = `<h3>Preguntas Correctas</h3><ul>${correctAnswers.map(question => `<li>${question}</li>`).join('')}</ul>`;
    incorrectQuestionsDisplay.innerHTML = `<h3>Preguntas Incorrectas</h3><ul>${incorrectAnswers.map(question => `<li class="incorrect">${question}</li>`).join('')}</ul>`;
}

// Inicializa el quiz
startQuiz();
