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
