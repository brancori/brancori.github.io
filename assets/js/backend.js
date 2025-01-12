// ...existing code...

function loadQuestions() {
    const correctIndices = JSON.parse(localStorage.getItem('correctIndices')) || [];
    const errorCounts = JSON.parse(localStorage.getItem('errorCounts')) || {};

    // Check if all questions have been answered correctly
    if (correctIndices.length === questions.length) {
        // Convert errorCounts object to array of [index, count] pairs
        const errorEntries = Object.entries(errorCounts);
        
        // Sort by error count in descending order
        errorEntries.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        
        // Filter questions that have errors
        const errorQuestions = errorEntries
            .filter(([_, count]) => count > 0)
            .map(([index, _]) => questions[parseInt(index)]);

        if (errorQuestions.length > 0) {
            questions = errorQuestions;
            currentQuestionIndex = 0;
        }
    }

    displayQuestion(questions[currentQuestionIndex]);
}

// ...existing code...

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        // If we've gone through all questions, show only the ones with errors
        const questionsWithErrors = questions.filter((_, index) => errorCounts[index] > 0);
        if (questionsWithErrors.length > 0) {
            // Reset the questions array to only show questions with errors
            questions = questionsWithErrors;
            currentQuestionIndex = 0;
            displayQuestion(questions[currentQuestionIndex]);
        } else {
            // If no errors, show completion message or handle accordingly
            endQuiz();
        }
        return;
    }
    // ...existing code for normal question display...
}

// ...existing code...
