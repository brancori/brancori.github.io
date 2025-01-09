class QuizStorage {
    static saveIncorrectQuestions(questionIndices) {
        localStorage.setItem('incorrectQuestions', JSON.stringify(questionIndices));
    }

    static getIncorrectQuestions() {
        const stored = localStorage.getItem('incorrectQuestions');
        return stored ? JSON.parse(stored) : [];
    }

    static clearIncorrectQuestions() {
        localStorage.removeItem('incorrectQuestions');
    }

    static addIncorrectQuestion(index) {
        const incorrect = this.getIncorrectQuestions();
        if (!incorrect.includes(index)) {
            incorrect.push(index);
            this.saveIncorrectQuestions(incorrect);
        }
    }
}

export default QuizStorage;