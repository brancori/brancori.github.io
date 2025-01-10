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
        questionItem.innerHTML = `<strong>${index + 1}. ${question.question}</strong><br>Respuesta: ${question.answers[question.correct]}`;
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
    const remainingQuestions = questions.filter((_, index) => !correctIndices.includes(index));
    selectedQuestions = getRandomQuestions(remainingQuestions, 35);
    datasetCounter.innerText = `Total de preguntas: ${totalQuestions}`; // Actualiza el contador del dataset
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
        }
    } else {
        if (!incorrectAnswers.includes(currentQuestion.question)) {
            incorrectAnswers.push(currentQuestion.question);
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
    startTimer(.5 * 60, document.getElementById('timer'));
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
        localStorage.clear();
        showPopup('Memoria borrada');
    });
}

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