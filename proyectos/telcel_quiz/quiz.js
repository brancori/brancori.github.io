import { questions } from './questions.js'; // Importar las preguntas desde el archivo externo
import { studySession } from './studySession.js';
import { ProgressUI } from './progressUI.js';

const totalQuestions = questions.length; // Contador del total de preguntas del dataset

function getRandomQuestions(questions, num) {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

let selectedQuestions = [];

let currentQuestionIndex = 0;
let correctAnswers = [];
let incorrectAnswers = [];
let score = 0;

// Agregar nueva variable para el timer de pregunta
let questionTimer;
const QUESTION_TIME_LIMIT = 25; // 15 segundos por pregunta

const questionContainer = document.getElementById('question');
const questionCounter = document.getElementById('question-counter');
const datasetCounter = document.getElementById('dataset-counter'); // Nuevo contador del dataset
const answerButtons = document.querySelectorAll('.answer-button');
const nextButton = document.getElementById('next-button');
const resultContainer = document.getElementById('result-container');
const scoreDisplay = document.getElementById('score');
const correctQuestionsDisplay = document.getElementById('correct-questions');
const incorrectQuestionsDisplay = document.getElementById('incorrect-questions');
const quizContainer = document.getElementById('quiz-container'); // Contenedor del quiz
const optionsContainer = document.getElementById('options-container');
const questionsContainer = document.getElementById('questions-container');
const questionsList = document.getElementById('questions-list');
const searchBar = document.getElementById('search-bar');

const toggleCorrectQuestionsButton = document.getElementById('toggle-correct-questions');
const correctQuestionsContainer = document.getElementById('correct-questions');

const errorRankingContainer = document.getElementById('error-ranking-container');

toggleCorrectQuestionsButton.addEventListener('click', () => {
    if (correctQuestionsContainer.style.display === 'none') {
        correctQuestionsContainer.style.display = 'block';
    } else {
        correctQuestionsContainer.style.display = 'none';
    }
});

document.getElementById('start-quiz').addEventListener('click', () => {
    // Restaurar la visibilidad de los botones de respuesta
    answerButtons.forEach(button => button.style.display = 'block');
    optionsContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    resultContainer.style.display = 'none'; // Asegurar que los resultados estén ocultos
    questionContainer.style.display = 'block'; // Mostrar el contenedor de preguntas
    questionCounter.style.display = 'block'; // Mostrar el contador
    startQuiz();
});

document.getElementById('view-questions').addEventListener('click', () => {
    optionsContainer.style.display = 'none';
    questionsContainer.style.display = 'block';
    displayQuestions();
});

document.getElementById('back-to-options').addEventListener('click', () => {
    questionsContainer.style.display = 'none';
    optionsContainer.style.display = 'block';
});

searchBar.addEventListener('input', () => {
    const searchTerm = searchBar.value.toLowerCase();
    filterQuestions(searchTerm);
});

function displayQuestions() {
    questionsList.innerHTML = '';
    questions.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        questionItem.innerHTML = `
            <div class="question-header" style="cursor: pointer;">
                <strong>${index + 1}. ${question.question}</strong>
            </div>
            <div class="answer-section" style="display: none;">
                <p>Respuesta:<br>${question.answers[question.correct]}</p>
            </div>`;
        
        questionItem.querySelector('.question-header').addEventListener('click', () => {
            const answerSection = questionItem.querySelector('.answer-section');
            if (answerSection.style.display === 'none') {
                answerSection.style.display = 'block';
            } else {
                answerSection.style.display = 'none';
            }
        });
        
        questionsList.appendChild(questionItem);
    });
}

function filterQuestions(searchTerm) {
    const questionItems = document.querySelectorAll('.question-item');
    questionItems.forEach(item => {
        const questionText = item.textContent.toLowerCase();
        if (questionText.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function startQuiz() {
    const studyDashboard = document.getElementById('study-dashboard');
    if (studyDashboard) {
        studyDashboard.innerHTML = ProgressUI.createProgressDashboard();
    }
    studySession.startTime = new Date();
    // Incrementar contador de intentos
    let quizAttempts = parseInt(localStorage.getItem('quizAttempts') || '0');
    quizAttempts++;
    localStorage.setItem('quizAttempts', quizAttempts);

    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = [];
    incorrectAnswers = [];
    
    const QUESTIONS_PER_QUIZ = 30; // Número fijo de preguntas por quiz
    const correctIndices = JSON.parse(localStorage.getItem('correctIndices')) || [];
    const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
    const errorCounts = JSON.parse(localStorage.getItem('errorCounts')) || {};

    // Calcular preguntas disponibles (no están en correctIndices)
    const availableQuestions = questions.filter((_, index) => !correctIndices.includes(index));

    // Verificar si todas las preguntas están completadas
    if (availableQuestions.length === 0) {
        showCompletionMessage();
        return;
    }

    if (availableQuestions.length === 0) {
        showPopup('¡Has completado todas las preguntas correctamente! Por favor, borra la memoria para reiniciar.');
        quizContainer.style.display = 'none';
        optionsContainer.style.display = 'block';
        return;
    }

    // Si es el intento número 12, incluir todas las preguntas del ranking de errores
    if (quizAttempts % 12 === 0) {
        const errorQuestions = Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([index]) => parseInt(index))
            .filter(index => !correctIndices.includes(index)); // Solo incluir las que no están correctas

        // Seleccionar preguntas del ranking de errores disponibles
        const errorRankingQuestions = questions.filter((_, index) => 
            errorQuestions.includes(index)
        );

        // Completar con preguntas aleatorias disponibles si es necesario
        const remainingCount = QUESTIONS_PER_QUIZ - errorRankingQuestions.length;
        const remainingQuestions = availableQuestions.filter(q => 
            !errorRankingQuestions.includes(q)
        );
        
        const randomQuestions = getRandomQuestions(remainingQuestions, remainingCount);
        selectedQuestions = [...errorRankingQuestions, ...randomQuestions];

        showPopup('Ahora si te vas a probar con los errores mas frecuentes, ¡suerte!');
    } else {
        // Quiz normal
        const topErrorQuestions = Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([index]) => parseInt(index))
            .filter(index => !correctIndices.includes(index)); // Solo incluir las que no están correctas

        // Seleccionar preguntas prioritarias de errores
        const priorityQuestions = questions.filter((_, index) => 
            topErrorQuestions.includes(index)
        );

        // Calcular cuántas preguntas adicionales necesitamos
        const remainingCount = QUESTIONS_PER_QUIZ - priorityQuestions.length;
        
        // Obtener preguntas aleatorias de las disponibles
        const remainingQuestions = availableQuestions.filter(q => 
            !priorityQuestions.includes(q)
        );
        
        const randomQuestions = getRandomQuestions(remainingQuestions, remainingCount);
        selectedQuestions = [...priorityQuestions, ...randomQuestions];
    }

    // Asegurar que tenemos exactamente QUESTIONS_PER_QUIZ preguntas
    selectedQuestions = selectedQuestions.slice(0, QUESTIONS_PER_QUIZ);

    // Si no tenemos suficientes preguntas, mostrar advertencia
    if (selectedQuestions.length < QUESTIONS_PER_QUIZ) {
        showPopup(`Atención: Solo hay ${selectedQuestions.length} preguntas disponibles`);
    }

    datasetCounter.innerText = `Total de preguntas: ${totalQuestions}`;
    showQuestion();
}

// Nueva función para manejar la finalización del quiz
function showCompletionMessage() {
    // Ocultar elementos innecesarios
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    questionContainer.style.display = 'none';
    questionCounter.style.display = 'none';

    // Mostrar mensaje de felicitación en el contenedor de opciones
    optionsContainer.style.display = 'block';
    
    // Crear mensaje de felicitación
    const completionMessage = document.createElement('div');
    completionMessage.className = 'completion-message';
    completionMessage.innerHTML = `
        <h2>¡Felicidades!</h2>
        <p>Bien hecho, repitelo de nuevo, que solo los que se esfuerzan pasan sus examenes.</p>
        <p>Para continuar practicando, puedes:</p>
        <ul>
            <li>Ver todas las preguntas</li>
            <li>Reiniciar tu progreso</li>
            <li>Ver el ranking de errores histórico</li>
        </ul>
    `;
    
    // Limpiar y agregar el mensaje al contenedor de opciones
    while (optionsContainer.firstChild) {
        optionsContainer.firstChild.remove();
    }
    
    optionsContainer.appendChild(completionMessage);
    
    // Agregar botones de acción
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    actionButtons.innerHTML = `
        <button id="view-all-completed" class="btn light-gray">Ver todas las preguntas</button>
        <button id="reset-progress-completed" class="btn light-gray">Reiniciar progreso</button>
        <button id="view-ranking-completed" class="btn light-gray">Ver ranking de errores</button>
    `;
    
    optionsContainer.appendChild(actionButtons);

    // Agregar event listeners para los nuevos botones
    document.getElementById('view-all-completed').addEventListener('click', () => {
        optionsContainer.style.display = 'none';
        questionsContainer.style.display = 'block';
        displayQuestions();
    });

    document.getElementById('reset-progress-completed').addEventListener('click', () => {
        const confirmReset = window.confirm('¿Estás seguro de que quieres reiniciar todo tu progreso?');
        if (confirmReset) {
            localStorage.clear();
            location.reload();
        }
    });

    document.getElementById('view-ranking-completed').addEventListener('click', () => {
        optionsContainer.style.display = 'none';
        errorRankingContainer.style.display = 'block';
        displayErrorRanking();
    });
}

// Agregar estilos necesarios dinámicamente
const style = document.createElement('style');
style.textContent = `
    .completion-message {
        text-align: center;
        padding: 20px;
        margin: 20px 0;
    }
    .completion-message h2 {
        color: var(--color-primary);
        margin-bottom: 15px;
    }
    .completion-message ul {
        text-align: left;
        margin: 15px 0;
        padding-left: 20px;
    }
    .completion-message ul li {
        margin: 5px 0;
    }
    .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
    }
`;
document.head.appendChild(style);

let questionStartTime; // Agregar esta variable al inicio del archivo

function showQuestion() {
    questionStartTime = new Date(); // Agregar esta línea
    resetState();
    updateProgress();
    clearTimeout(questionTimer); // Limpiar el timer anterior

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    questionCounter.innerText = `Pregunta ${currentQuestionIndex + 1} de ${selectedQuestions.length}`;
    questionContainer.innerText = currentQuestion.question;
    
    // Iniciar el timer para esta pregunta
    let timeLeft = QUESTION_TIME_LIMIT;
    updateQuestionTimer(timeLeft);
    
    questionTimer = setInterval(() => {
        timeLeft--;
        updateQuestionTimer(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            selectAnswer(-1); // Marcar como incorrecta si se acaba el tiempo
        }
    }, 1000);

    // Crear array de todas las respuestas
    const allAnswers = [...currentQuestion.answers];
    const correctAnswer = allAnswers[currentQuestion.correct];
    
    // Remover la respuesta correcta del array
    allAnswers.splice(currentQuestion.correct, 1);
    
    // Mezclar las respuestas incorrectas
    const shuffledWrongAnswers = allAnswers.sort(() => Math.random() - 0.5);
    
    // Insertar la respuesta correcta en una posición aleatoria
    const randomPosition = Math.floor(Math.random() * 4);
    const finalAnswers = [...shuffledWrongAnswers];
    finalAnswers.splice(randomPosition, 0, correctAnswer);
    
    // Asignar respuestas a los botones
    finalAnswers.forEach((answer, index) => {
        const button = answerButtons[index];
        button.innerText = answer;
        button.disabled = false;
        button.classList.remove('selected');
        button.onclick = () => selectAnswer(currentQuestion.answers.indexOf(answer));
    });
}

// Agregar función para actualizar el timer visual
function updateQuestionTimer(seconds) {
    const timerElement = document.getElementById('question-timer');
    if (!timerElement) {
        const quizHeaderInfo = document.createElement('div');
        quizHeaderInfo.className = 'quiz-header-info';
        
        // Mover el datasetCounter al contenedor quiz-header-info
        const datasetCounterElement = document.getElementById('dataset-counter');
        if (datasetCounterElement) {
            quizHeaderInfo.appendChild(datasetCounterElement);
        }
        
        const timer = document.createElement('div');
        timer.id = 'question-timer';
        quizHeaderInfo.appendChild(timer);
        
        // Insertar el contenedor antes del questionContainer
        questionContainer.parentNode.insertBefore(quizHeaderInfo, questionContainer);
    }

    const timer = document.getElementById('question-timer');
    timer.textContent = `${seconds}s`;
    
    // Actualizar clases según el tiempo restante
    timer.className = 'question-timer';
    if (seconds <= 5) {
        timer.classList.add('danger');
    } else if (seconds <= 10) {
        timer.classList.add('warning');
    }
}

function resetState() {
    answerButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('selected');
    });
}

function selectAnswer(selectedIndex) {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const responseTime = (new Date() - questionStartTime) / 1000;
    
    // Detener el timer y actualizar métricas
    clearInterval(questionTimer);
    studySession.updateMetrics({
        isCorrect: selectedIndex === currentQuestion.correct,
        responseTime: responseTime
    });
    ProgressUI.updateDashboard(studySession.metrics);

    // Procesar la respuesta
    const questionIndex = questions.indexOf(currentQuestion);
    answerButtons.forEach(button => button.disabled = true);

    // Manejar respuesta correcta/incorrecta
    if (selectedIndex === currentQuestion.correct) {
        handleCorrectAnswer(currentQuestion, questionIndex);
    } else {
        handleIncorrectAnswer(currentQuestion, questionIndex);
    }

    // Avanzar a la siguiente pregunta o mostrar resultados
    currentQuestionIndex++;
    
    // Verificar si hemos terminado el quiz
    if (currentQuestionIndex >= selectedQuestions.length) {
        setTimeout(() => showResults(), 500); // Pequeña pausa antes de mostrar resultados
    } else {
        setTimeout(() => showQuestion(), 500); // Pequeña pausa antes de la siguiente pregunta
    }
}

function handleCorrectAnswer(question, questionIndex) {
    score++;
    if (!correctAnswers.includes(question.question)) {
        correctAnswers.push(question.question);
        const correctIndices = JSON.parse(localStorage.getItem('correctIndices')) || [];
        correctIndices.push(questionIndex);
        localStorage.setItem('correctIndices', JSON.stringify(correctIndices));
        
        // Remover de incorrectIndices si estaba previamente incorrecta
        const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
        const indexToRemove = incorrectIndices.indexOf(questionIndex);
        if (indexToRemove > -1) {
            incorrectIndices.splice(indexToRemove, 1);
            localStorage.setItem('incorrectIndices', JSON.stringify(incorrectIndices));
        }
    }
}

function handleIncorrectAnswer(question, questionIndex) {
    if (!incorrectAnswers.includes(question.question)) {
        incorrectAnswers.push(question.question);
        const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
        incorrectIndices.push(questionIndex);
        localStorage.setItem('incorrectIndices', JSON.stringify(incorrectIndices));
        updateErrorCount(questionIndex);
    }
}

let timerInterval;

document.getElementById('start-timer').addEventListener('click', () => {
    document.getElementById('timer-display').style.display = 'block';
    startTimer(15 * 60, document.getElementById('timer'));
});

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(timerInterval);
            markRemainingQuestionsIncorrect();
            showResults();
        }
    }, 1000);
}

function markRemainingQuestionsIncorrect() {
    for (let i = currentQuestionIndex; i < selectedQuestions.length; i++) {
        const currentQuestion = selectedQuestions[i];
        if (!incorrectAnswers.includes(currentQuestion.question)) {
            incorrectAnswers.push(currentQuestion.question);
        }
    }
}

// Modificar la función showResults
function showResults() {
    studySession.endSession();
    clearInterval(timerInterval);

    // Ocultar elementos del quiz
    quizContainer.style.display = 'none';
    questionContainer.style.display = 'none';
    questionCounter.style.display = 'none';

    // Mostrar resultados
    resultContainer.style.display = 'block';
    scoreDisplay.innerText = `TU PUNTUACIÓN: ${score}/${selectedQuestions.length}`;
    
    // Actualizar listas de preguntas
    correctQuestionsDisplay.innerHTML = `
        <h3>Preguntas Correctas</h3>
        <ul>${correctAnswers.map(q => `<li>${q}</li>`).join('')}</ul>`;
    
    incorrectQuestionsDisplay.innerHTML = `
        <h3>Preguntas Incorrectas</h3>
        <ul>${incorrectAnswers.map(q => `<li class="incorrect">${q}</li>`).join('')}</ul>`;

    // Mostrar reporte de progreso
    const progressReport = studySession.getProgressReport();
    ProgressUI.updateDashboard(studySession.metrics);
}

// Remove the nextButton event listener and element
nextButton.remove();

document.getElementById('retry-quiz').addEventListener('click', () => {
    resultContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    questionContainer.style.display = 'block';
    questionCounter.style.display = 'block';
    answerButtons.forEach(button => button.style.display = 'block');
    startQuiz();
});

document.getElementById('clear-memory').addEventListener('click', () => {
    const confirmPopup = document.createElement('div');
    confirmPopup.className = 'popup confirmation';
    confirmPopup.innerHTML = `
        <p>¿Estás seguro que deseas borrar el registro de respuestas?</p>
        <p class="popup-warning">Esta acción no se puede deshacer y perderás el registro de preguntas correctas e incorrectas.</p>
        <div class="popup-buttons">
            <button class="btn confirm">Confirmar</button>
            <button class="btn cancel">Cancelar</button>
        </div>
    `;
    document.body.appendChild(confirmPopup);

    confirmPopup.querySelector('.confirm').onclick = () => {
        // Solo eliminar los índices de respuestas
        localStorage.removeItem('correctIndices');
        localStorage.removeItem('incorrectIndices');
        confirmPopup.remove();
        showPopup('Registro de respuestas borrado correctamente');
    };

    confirmPopup.querySelector('.cancel').onclick = () => {
        confirmPopup.remove();
    };
});

document.getElementById('back-to-main').addEventListener('click', () => {
    resultContainer.style.display = 'none';
    optionsContainer.style.display = 'block';
});

// Add this after the other event listeners
document.getElementById('main-clear-memory').addEventListener('click', () => {
    const confirmPopup = document.createElement('div');
    confirmPopup.className = 'popup confirmation';
    confirmPopup.innerHTML = `
        <p>¿Estás seguro que deseas borrar el registro de respuestas?</p>
        <p class="popup-warning">Esta acción no se puede deshacer y perderás el registro de preguntas correctas e incorrectas.</p>
        <div class="popup-buttons">
            <button class="btn confirm">Confirmar</button>
            <button class="btn cancel">Cancelar</button>
        </div>
    `;
    document.body.appendChild(confirmPopup);

    confirmPopup.querySelector('.confirm').onclick = () => {
        // Solo eliminar los índices de respuestas
        localStorage.removeItem('correctIndices');
        localStorage.removeItem('incorrectIndices');
        confirmPopup.remove();
        showPopup('Registro de respuestas borrado correctamente');
    };

    confirmPopup.querySelector('.cancel').onclick = () => {
        confirmPopup.remove();
    };
});

// Function to handle login redirection
function handleLogin() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if ((username === 'picazo' && password === '1234') || (username === 'Consulta' && password === '123')) {
            document.getElementById('login-container').style.display = 'none';
            optionsContainer.style.display = 'block';
        } else {
            showPopup('Usuario o contraseña incorrectos');
        }
    });
}

function showPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerText = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

// Initialize login handling
handleLogin();

// Inicializa el quiz
startQuiz();

document.getElementById('view-incorrect').addEventListener('click', () => {
    optionsContainer.style.display = 'none';
    document.getElementById('incorrect-questions-container').style.display = 'block';
    displayIncorrectQuestions();
});

document.getElementById('back-to-options-incorrect').addEventListener('click', () => {
    document.getElementById('incorrect-questions-container').style.display = 'none';
    optionsContainer.style.display = 'block';
});

document.getElementById('search-incorrect').addEventListener('input', () => {
    const searchTerm = document.getElementById('search-incorrect').value.toLowerCase();
    filterIncorrectQuestions(searchTerm);
});

function displayIncorrectQuestions() {
    const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
    const incorrectQuestionsList = document.getElementById('incorrect-questions-list');
    incorrectQuestionsList.innerHTML = '';
    
    incorrectIndices.forEach(index => {
        const question = questions[index];
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        questionItem.innerHTML = `
            <div class="question-header" style="cursor: pointer;">
                <strong>${index + 1}. ${question.question}</strong>
            </div>
            <div class="answer-section" style="display: none;">
                <p>Respuesta:<br>${question.answers[question.correct]}</p>
            </div>`;
        
        questionItem.querySelector('.question-header').addEventListener('click', () => {
            const answerSection = questionItem.querySelector('.answer-section');
            if (answerSection.style.display === 'none') {
                answerSection.style.display = 'block';
            } else {
                answerSection.style.display = 'none';
            }
        });
        
        incorrectQuestionsList.appendChild(questionItem);
    });
}

function filterIncorrectQuestions(searchTerm) {
    const questionItems = document.querySelectorAll('#incorrect-questions-list .question-item');
    questionItems.forEach(item => {
        const questionText = item.textContent.toLowerCase();
        if (questionText.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Update progress bar
function updateProgress() {
    const progress = (currentQuestionIndex / selectedQuestions.length) * 100;
    document.querySelector('.progress-bar').style.width = `${progress}%`;
}

// Prevent double-tap zoom on mobile
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });

// Add swipe gesture support
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchEndX - touchStartX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentQuestionIndex > 0) {
            // Swipe right - previous question
            currentQuestionIndex--;
            showQuestion();
        } else if (diff < 0 && currentQuestionIndex < selectedQuestions.length - 1) {
            // Swipe left - next question
            selectAnswer(-1); // Mark as incorrect if unanswered
        }
    }
}
window.addEventListener('error', (event) => {
    if (event.message.includes('message port closed')) {
        // Ignorar este error específico
        event.stopPropagation();
        return;
    }
});

async function someAsyncOperation() {
    try {
        // operación asíncrona
    } catch (error) {
        if (!error.message.includes('message port closed')) {
            console.error(error);
        }
    }
}

function updateErrorCount(questionIndex) {
    const errorCounts = JSON.parse(localStorage.getItem('errorCounts')) || {};
    errorCounts[questionIndex] = (errorCounts[questionIndex] || 0) + 1;
    localStorage.setItem('errorCounts', JSON.stringify(errorCounts));
}

document.getElementById('view-error-ranking').addEventListener('click', () => {
    optionsContainer.style.display = 'none';
    errorRankingContainer.style.display = 'block';
    displayErrorRanking();
});

document.getElementById('back-from-ranking').addEventListener('click', () => {
    errorRankingContainer.style.display = 'none';
    optionsContainer.style.display = 'block';
});

function displayErrorRanking() {
    const errorCounts = JSON.parse(localStorage.getItem('errorCounts')) || {};
    const sortedErrors = Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([index, count]) => ({
            question: questions[index],
            count: count,
            index: parseInt(index)
        }));

    const rankingList = document.getElementById('error-ranking-list');
    rankingList.innerHTML = '';

    sortedErrors.forEach((error) => {
        const errorItem = document.createElement('div');
        errorItem.classList.add('question-item');
        errorItem.innerHTML = `
            <div class="question-header" style="cursor: pointer;">
                <span class="error-count">${error.count}</span>
                <strong>${error.question.question}</strong>
            </div>
            <div class="answer-section" style="display: none;">
                <p>${error.question.answers[error.question.correct]}</p>
            </div>`;
        
        errorItem.querySelector('.question-header').addEventListener('click', () => {
            const answerSection = errorItem.querySelector('.answer-section');
            answerSection.style.display = answerSection.style.display === 'none' ? 'block' : 'none';
        });
        
        rankingList.appendChild(errorItem);
    });
}

// Agregar estilos para el timer
const timerStyle = document.createElement('style');
timerStyle.textContent = `
    #question-timer {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        transition: color 0.3s ease;
    }
`;
document.head.appendChild(timerStyle);



