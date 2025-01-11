import { questions } from './questions.js'; // Importar las preguntas desde el archivo externo

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
    optionsContainer.style.display = 'none';
    quizContainer.style.display = 'block';
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
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = [];
    incorrectAnswers = [];
    const correctIndices = JSON.parse(localStorage.getItem('correctIndices')) || [];
    const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
    const errorCounts = JSON.parse(localStorage.getItem('errorCounts')) || {};
    
    // Obtener las 5 preguntas más frecuentes de errorCounts
    const topErrorQuestions = Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([index]) => parseInt(index));
    
    // Filtrar preguntas incorrectas priorizando las del top de errores
    const priorityIncorrectQuestions = questions.filter((_, index) => 
        topErrorQuestions.includes(index) && incorrectIndices.includes(index)
    );
    
    // Si no hay suficientes preguntas del top, agregar otras incorrectas hasta llegar a 5
    const remainingIncorrectQuestions = questions.filter((_, index) => 
        !topErrorQuestions.includes(index) && incorrectIndices.includes(index)
    );
    
    // Combinar preguntas prioritarias y completar hasta 5 con otras incorrectas
    const selectedIncorrectQuestions = [
        ...priorityIncorrectQuestions,
        ...getRandomQuestions(remainingIncorrectQuestions, Math.max(0, 5 - priorityIncorrectQuestions.length))
    ];
    
    // Obtener preguntas que no están ni en correctas ni en incorrectas
    const availableQuestions = questions.filter((_, index) => 
        !correctIndices.includes(index) && !incorrectIndices.includes(index)
    );
    
    const numRemaining = Math.max(25 - selectedIncorrectQuestions.length, 0);
    const newQuestions = getRandomQuestions(availableQuestions, numRemaining);
    
    selectedQuestions = [...selectedIncorrectQuestions, ...newQuestions];
    
    if (selectedQuestions.length === 0) {
        showPopup('Es necesario borrar la memoria para volver a mostrar las preguntas');
        quizContainer.style.display = 'none';
        optionsContainer.style.display = 'block';
        return;
    }

    datasetCounter.innerText = `Total de preguntas: ${totalQuestions}`;
    showQuestion();
}

function showQuestion() {
    resetState();
    updateProgress();
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
            const correctIndices = JSON.parse(localStorage.getItem('correctIndices')) || [];
            correctIndices.push(questions.indexOf(currentQuestion));
            localStorage.setItem('correctIndices', JSON.stringify(correctIndices));
            
            // Remove from incorrectIndices if it was previously incorrect
            const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
            const indexToRemove = incorrectIndices.indexOf(questions.indexOf(currentQuestion));
            if (indexToRemove > -1) {
                incorrectIndices.splice(indexToRemove, 1);
                localStorage.setItem('incorrectIndices', JSON.stringify(incorrectIndices));
            }
        }
    } else {
        if (!incorrectAnswers.includes(currentQuestion.question)) {
            incorrectAnswers.push(currentQuestion.question);
            // Store incorrect answer index in localStorage
            const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
            const questionIndex = questions.indexOf(currentQuestion);
            incorrectIndices.push(questionIndex);
            localStorage.setItem('incorrectIndices', JSON.stringify(incorrectIndices));
            updateErrorCount(questionIndex); // Agregar esta línea
        }
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// Remove the nextButton event listener and element
nextButton.remove();

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

function showResults() {
    clearInterval(timerInterval); // Clear the timer when showing results
    quizContainer.style.display = 'none'; // Ocultar el contenedor del quiz
    questionContainer.style.display = 'none';
    questionCounter.style.display = 'none';
    answerButtons.forEach(button => button.style.display = 'none');
    resultContainer.style.display = 'block';
    scoreDisplay.innerText = `TU PUNTUACIÓN: ${score}/${selectedQuestions.length}`;
    
    correctQuestionsDisplay.innerHTML = `<h3>Preguntas Correctas</h3><ul>${correctAnswers.map(question => `<li>${question}</li>`).join('')}</ul>`;
    incorrectQuestionsDisplay.innerHTML = `<h3>Preguntas Incorrectas</h3><ul>${incorrectAnswers.map(question => `<li class="incorrect">${question}</li>`).join('')}</ul>`;
    
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
}

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


