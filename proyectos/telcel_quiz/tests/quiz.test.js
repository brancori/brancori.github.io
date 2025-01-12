import { studySession } from '../studySession';
import { questions } from '../questions';

describe('StudySession', () => {
    beforeEach(() => {
        localStorage.clear();
        studySession.startQuiz();
    });

    test('should initialize quizStartTime', () => {
        expect(studySession.metrics.quizStartTime).not.toBeNull();
    });

    test('should update metrics correctly', () => {
        studySession.updateMetrics({ isCorrect: true, responseTime: 10 });
        expect(studySession.metrics.questionsAnswered).toBe(1);
        expect(studySession.metrics.correctAnswers).toBe(1);
        expect(studySession.metrics.averageResponseTime).toBe(10);
    });

    test('should save response times in localStorage', () => {
        studySession.updateMetrics({ isCorrect: true, responseTime: 10 });
        const responseTimes = JSON.parse(localStorage.getItem('responseTimes'));
        expect(responseTimes).toBeDefined();
    });

    test('should calculate focus score correctly', () => {
        studySession.updateMetrics({ isCorrect: true, responseTime: 10 });
        studySession.calculateFocusScore();
        expect(studySession.metrics.focusScore).toBe(100);
    });

    test('should end session and save metrics', () => {
        studySession.endSession();
        const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory'));
        expect(sessionHistory.length).toBe(1);
    });
});

describe('Quiz Functionality', () => {
    test('should load questions correctly', () => {
        expect(questions.length).toBeGreaterThan(0);
    });

    test('should select random questions', () => {
        const selectedQuestions = getRandomQuestions(questions, 5);
        expect(selectedQuestions.length).toBe(5);
    });

    test('should handle correct answers', () => {
        const question = questions[0];
        handleCorrectAnswer(question, 0);
        const correctIndices = JSON.parse(localStorage.getItem('correctIndices'));
        expect(correctIndices.includes(0)).toBe(true);
    });

    test('should handle incorrect answers', () => {
        const question = questions[0];
        handleIncorrectAnswer(question, 0);
        const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices'));
        expect(incorrectIndices.includes(0)).toBe(true);
    });
});
