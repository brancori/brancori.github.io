import { questions } from './questions.js'; // Importar las preguntas desde el archivo externo
import { studySession } from './studySession.js';
import { ProgressUI } from './progressUI.js';

// Validación inicial de dependencias
if (!questions || !Array.isArray(questions) || questions.length === 0) {
    console.error('Error: No se pudieron cargar las preguntas correctamente');
    throw new Error('Questions not loaded');
}

if (!studySession) {
    console.error('Error: StudySession no está definida');
    throw new Error('StudySession not loaded');
}

if (!ProgressUI) {
    console.error('Error: ProgressUI no está definido');
    throw new Error('ProgressUI not loaded');
}

const totalQuestions = questions.length; // Contador del total de preguntas del dataset

function getRandomQuestions(questions, num) {
    // Crear una copia del array antes de ordenarlo
    const questionsCopy = [...questions];
    return questionsCopy
        .sort(() => Math.random() - 0.5)
        .slice(0, num);
}

let selectedQuestions = [];

let currentQuestionIndex = 0;
let correctAnswers = [];
let incorrectAnswers = [];
let score = 0;

// Agregar nueva variable para el timer de pregunta
let questionTimer;
const QUESTION_TIME_LIMIT = 45; // 15 segundos por pregunta

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

const ignoreButton = document.getElementById('ignore-question');
const ignoreQuestionListButton = document.getElementById('ignore-question-list');
const clearIgnoredQuestionsButton = document.getElementById('clear-ignored-questions');

ignoreButton.addEventListener('click', () => {
    ignoreCurrentQuestion();
});

ignoreQuestionListButton.addEventListener('click', () => {
    const questionIndex = parseInt(prompt('Ingrese el índice de la pregunta a ignorar:'));
    if (!isNaN(questionIndex) && questionIndex >= 0 && questionIndex < questions.length) {
        ignoreQuestion(questionIndex);
    } else {
        showPopup('Índice de pregunta inválido');
    }
});

clearIgnoredQuestionsButton.addEventListener('click', () => {
    const confirmPopup = document.createElement('div');
    confirmPopup.className = 'popup confirmation';
    confirmPopup.innerHTML = `
        <p>¿Estás seguro que deseas borrar las preguntas ignoradas?</p>
        <p class="popup-warning">Esta acción no se puede deshacer.</p>
        <div class="popup-buttons">
            <button class="btn confirm">Confirmar</button>
            <button class="btn cancel">Cancelar</button>
        </div>
    `;
    document.body.appendChild(confirmPopup);

    confirmPopup.querySelector('.confirm').onclick = () => {
        localStorage.removeItem('ignoredIndices');
        confirmPopup.remove();
        showPopup('Preguntas ignoradas borradas correctamente');
    };

    confirmPopup.querySelector('.cancel').onclick = () => {
        confirmPopup.remove();
    };
});

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
            const ignoreButton = document.createElement('button');
            ignoreButton.className = 'btn ignore-button';
            ignoreButton.innerText = 'Ignorar';
            ignoreButton.onclick = () => ignoreQuestion(index);
            questionItem.appendChild(ignoreButton);
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
        // Crear el dashboard si no existe
        if (!studyDashboard.innerHTML.trim()) {
            studyDashboard.innerHTML = ProgressUI.createProgressDashboard();
        }
        // Actualizar métricas existentes
        ProgressUI.updateDashboard(studySession.metrics);
    }
    studySession.startQuiz(); // Inicializar quizStartTime al iniciar el quiz
    studySession.startTime = new Date();
    // Incrementar contador de intentos
    let quizAttempts = parseInt(localStorage.getItem('quizAttempts') || '0');
    quizAttempts++;
    localStorage.setItem('quizAttempts', quizAttempts);

    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = [];
    incorrectAnswers = [];
    
    const QUESTIONS_PER_QUIZ = 31; // Número fijo de preguntas por quiz
    const correctIndices = JSON.parse(localStorage.getItem('correctIndices')) || [];
    const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
    const errorCounts = JSON.parse(localStorage.getItem('errorCounts')) || {};
    const ignoredIndices = JSON.parse(localStorage.getItem('ignoredIndices')) || [];

    // Calcular preguntas disponibles (no están en correctIndices)
    const availableQuestions = questions.filter((_, index) => 
        !correctIndices.includes(index) && !ignoredIndices.includes(index)
    );

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
            .filter(index => !correctIndices.includes(index)) // Filtrar preguntas ya correctas
            .filter(index => incorrectIndices.includes(index)); // Solo incluir las que están en incorrectIndices

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

// Agregar esta función antes de showQuestion()
function resetState() {
    // Restablecer el estado de los botones de respuesta
    answerButtons.forEach(button => {
        button.style.display = 'block';
        button.disabled = false;
        button.classList.remove('selected', 'correct', 'incorrect');
    });

    // Limpiar el temporizador si existe
    if (questionTimer) {
        clearInterval(questionTimer);
    }
}

// Agregar esta función antes de showQuestion()
function updateQuestionTimer(seconds) {
    // Buscar o crear el elemento del timer
    let timerElement = document.getElementById('question-timer');
    if (!timerElement) {
        // Crear contenedor del timer si no existe
        const timerContainer = document.createElement('div');
        timerContainer.className = 'quiz-header-info';
        
        // Crear elemento del timer
        timerElement = document.createElement('div');
        timerElement.id = 'question-timer';
        timerContainer.appendChild(timerElement);
        
        // Insertar antes del contenedor de preguntas
        questionContainer.parentNode.insertBefore(timerContainer, questionContainer);
    }

    // Actualizar el tiempo
    timerElement.textContent = `${seconds}s`;
    
    // Aplicar clases según el tiempo restante
    timerElement.className = 'question-timer';
    if (seconds <= 5) {
        timerElement.classList.add('danger');
    } else if (seconds <= 10) {
        timerElement.classList.add('warning');
    }
}

// Modificar las funciones principales para incluir validaciones
function showQuestion() {
    try {
        // Verificar si hay preguntas disponibles
        if (!selectedQuestions || !Array.isArray(selectedQuestions) || selectedQuestions.length === 0) {
            console.error('Error: No hay preguntas seleccionadas');
            showResults();
            return;
        }

        // Verificar si hemos llegado al final
        if (currentQuestionIndex >= selectedQuestions.length) {
            console.log('Quiz completado, mostrando resultados');
            showResults();
            return;
        }

        const currentQuestion = selectedQuestions[currentQuestionIndex];
        if (!validateQuestion(currentQuestion)) {
            console.error('Error: Pregunta inválida, saltando a la siguiente');
            currentQuestionIndex++;
            showQuestion();
            return;
        }

        resetState(); // Ahora esta función existe
        questionStartTime = new Date();
        updateProgress();

        // Actualizar interfaz
        questionCounter.innerText = `Pregunta ${currentQuestionIndex + 1} de ${selectedQuestions.length}`;
        questionContainer.innerText = currentQuestion.question;
        
        // Configurar temporizador
        let timeLeft = QUESTION_TIME_LIMIT;
        updateQuestionTimer(timeLeft);
        
        // Iniciar nuevo temporizador
        questionTimer = setInterval(() => {
            timeLeft--;
            updateQuestionTimer(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(questionTimer);
                selectAnswer(-1); // Marca como incorrecta si se acaba el tiempo
            }
        }, 1000);

        // Preparar y mostrar respuestas
        const allAnswers = [...currentQuestion.answers];
        const correctAnswer = allAnswers[currentQuestion.correct];
        allAnswers.splice(currentQuestion.correct, 1);
        const shuffledWrongAnswers = allAnswers.sort(() => Math.random() - 0.5);
        const finalAnswers = [...shuffledWrongAnswers];
        finalAnswers.splice(Math.floor(Math.random() * 4), 0, correctAnswer);
        
        // Actualizar botones
        answerButtons.forEach((button, index) => {
            button.innerText = finalAnswers[index];
            button.disabled = false;
            button.classList.remove('selected');
            button.onclick = () => selectAnswer(currentQuestion.answers.indexOf(finalAnswers[index]));
            button.style.display = 'block';
        });
    } catch (error) {
        console.error('Error en showQuestion:', error);
        showResults();
    }
}

function selectAnswer(selectedIndex) {
    try {
        if (typeof selectedIndex !== 'number') {
            console.error('Error: Índice de respuesta inválido');
            return;
        }

        // Prevenir múltiples selecciones o selecciones después de que el tiempo se acabó
        if (answerButtons[0].disabled || !questionTimer) {
            return;
        }

        // Detener el temporizador
        clearInterval(questionTimer);
        
        const currentQuestion = selectedQuestions[currentQuestionIndex];
        const responseTime = (new Date() - questionStartTime) / 1000;
        
        // Deshabilitar botones inmediatamente
        answerButtons.forEach(button => button.disabled = true);
        
        // Procesar respuesta
        const questionIndex = questions.indexOf(currentQuestion);
        const isCorrect = selectedIndex === currentQuestion.correct;

        // Actualizar métricas
        studySession.updateMetrics({
            isCorrect: isCorrect,
            responseTime: responseTime
        });

        // Guardar tiempo de respuesta en localStorage
        const responseTimes = JSON.parse(localStorage.getItem('responseTimes')) || {};
        if (!Array.isArray(responseTimes[questionIndex])) {
            responseTimes[questionIndex] = [];
        }
        responseTimes[questionIndex].push(responseTime);
        localStorage.setItem('responseTimes', JSON.stringify(responseTimes));
        
        // Manejar respuesta
        if (isCorrect) {
            handleCorrectAnswer(currentQuestion, questionIndex);
        } else {
            handleIncorrectAnswer(currentQuestion, questionIndex);
        }

        // Avanzar a la siguiente pregunta después de un breve retraso
        setTimeout(() => {
            currentQuestionIndex++;
            showQuestion();
        }, 1000);
    } catch (error) {
        console.error('Error en selectAnswer:', error);
        showResults();
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
    try {
        if (questionTimer) {
            clearInterval(questionTimer);
        }
        
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        if (studySession) {
            studySession.endSession();
        }

        // Ocultar elementos del quiz
        quizContainer.style.display = 'none';
        questionContainer.style.display = 'none';
        questionCounter.style.display = 'none';

        // Mostrar resultados
        resultContainer.style.display = 'block';
        scoreDisplay.innerText = `TU PUNTUACIÓN: ${score}/${selectedQuestions.length}`;
        
        // Actualizar métricas y dashboard
        if (studySession && studySession.metrics) {
            try {
                ProgressUI.updateDashboard(studySession.metrics);
            } catch (error) {
                console.error('Error al actualizar el dashboard:', error);
            }
        }

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
    } catch (error) {
        console.error('Error en showResults:', error);
        displayError('Ha ocurrido un error al mostrar los resultados');
    }
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

function handleCorrectAnswer(question, questionIndex) {
    score++;
    if (!correctAnswers.includes(question.question)) {
        correctAnswers.push(question.question);
        
        // Actualizar correctIndices
        const correctIndices = JSON.parse(localStorage.getItem('correctIndices')) || [];
        correctIndices.push(questionIndex);
        localStorage.setItem('correctIndices', JSON.stringify(correctIndices));
        
        // Remover de incorrectIndices
        const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
        const indexToRemove = incorrectIndices.indexOf(questionIndex);
        if (indexToRemove > -1) {
            incorrectIndices.splice(indexToRemove, 1);
            localStorage.setItem('incorrectIndices', JSON.stringify(incorrectIndices));
            
            // Remover del ranking de errores solo si es el quiz especial
            let quizAttempts = parseInt(localStorage.getItem('quizAttempts') || '0');
            if (quizAttempts % 12 === 0) {
                const errorCounts = JSON.parse(localStorage.getItem('errorCounts')) || {};
                delete errorCounts[questionIndex];
                localStorage.setItem('errorCounts', JSON.stringify(errorCounts));
            }
        }
    }
}

// Validación de elementos del DOM
function validateDOMElements() {
    const requiredElements = {
        'question': questionContainer,
        'question-counter': questionCounter,
        'dataset-counter': datasetCounter,
        'answer-buttons': answerButtons,
        'result-container': resultContainer,
        'score': scoreDisplay,
        'quiz-container': quizContainer,
        'options-container': optionsContainer
    };

    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.error(`Error: Elemento '${name}' no encontrado en el DOM`);
            throw new Error(`Required DOM element '${name}' not found`);
        }
    }
}

// Validación de funciones críticas
function validateQuestion(question) {
    if (!question || !question.question || !Array.isArray(question.answers) || 
        typeof question.correct !== 'number' || question.correct >= question.answers.length) {
        console.error('Error: Pregunta inválida:', question);
        return false;
    }
    return true;
}

// Función auxiliar para mostrar errores al usuario
function displayError(message) {
    showPopup(message);
    console.error(message);
}

// Inicialización con validaciones
try {
    validateDOMElements();
    handleLogin();
    // No inicializar el quiz automáticamente, esperar al login
} catch (error) {
    console.error('Error durante la inicialización:', error);
    displayError('Error al cargar la aplicación');
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

document.getElementById('view-slow-questions').addEventListener('click', () => {
    optionsContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    startSlowQuestionsQuiz();
});

function startSlowQuestionsQuiz() {
    const QUESTIONS_PER_QUIZ = 31; // Número fijo de preguntas por quiz
    const correctIndices = JSON.parse(localStorage.getItem('correctIndices')) || [];
    const responseTimes = JSON.parse(localStorage.getItem('responseTimes')) || {};

    // Obtener preguntas con los tiempos de respuesta promedio más largos
    const slowQuestions = Object.entries(responseTimes)
        .map(([index, times]) => [parseInt(index), times.reduce((a, b) => a + b, 0) / times.length])
        .sort(([,a], [,b]) => b - a)
        .map(([index]) => index)
        .filter(index => !correctIndices.includes(index)) // Filtrar preguntas ya correctas
        .slice(0, QUESTIONS_PER_QUIZ);

    // Seleccionar preguntas del ranking de tiempos de respuesta
    selectedQuestions = questions.filter((_, index) => slowQuestions.includes(index));

    // Si no tenemos suficientes preguntas, mostrar advertencia
    if (selectedQuestions.length < QUESTIONS_PER_QUIZ) {
        showPopup(`Atención: Solo hay ${selectedQuestions.length} preguntas disponibles`);
    }

    datasetCounter.innerText = `Total de preguntas: ${totalQuestions}`;
    showQuestion();
}

function ignoreCurrentQuestion() {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const questionIndex = questions.indexOf(currentQuestion);
    ignoreQuestion(questionIndex);
    currentQuestionIndex++;
    showQuestion();
}

function ignoreQuestion(questionIndex) {
    const ignoredIndices = JSON.parse(localStorage.getItem('ignoredIndices')) || [];
    if (!ignoredIndices.includes(questionIndex)) {
        ignoredIndices.push(questionIndex);
        localStorage.setItem('ignoredIndices', JSON.stringify(ignoredIndices));
        showPopup('Pregunta ignorada correctamente');
    }
}





