class StudySession {
    constructor() {
        this.startTime = new Date();
        this.metrics = {
            questionsAnswered: 0,
            correctAnswers: 0,
            averageResponseTime: 0,
            totalStudyTime: 0,
            focusScore: 0,
            breaksTaken: 0,
            quizStartTime: new Date(),
            quizDuration: 0
        };
        this.sessionHistory = JSON.parse(localStorage.getItem('sessionHistory')) || [];
    }

    updateMetrics(questionData) {
        this.metrics.questionsAnswered++;
        if (questionData.isCorrect) this.metrics.correctAnswers++;
        this.metrics.averageResponseTime = 
            (this.metrics.averageResponseTime * (this.metrics.questionsAnswered - 1) + 
             questionData.responseTime) / this.metrics.questionsAnswered;
    }

    calculateFocusScore() {
        const consistencyFactor = this.metrics.averageResponseTime < 30 ? 1 : 0.8;
        const accuracyFactor = this.metrics.correctAnswers / this.metrics.questionsAnswered;
        this.metrics.focusScore = Math.round((consistencyFactor * accuracyFactor * 100));
    }

    endSession() {
        this.metrics.totalStudyTime = (new Date() - this.startTime) / 1000 / 60; // en minutos
        this.metrics.quizDuration = (new Date() - this.metrics.quizStartTime) / 1000;
        this.calculateFocusScore();
        
        // Guardar tiempo promedio histórico
        const quizTimes = JSON.parse(localStorage.getItem('quizTimes')) || [];
        quizTimes.push(this.metrics.quizDuration);
        localStorage.setItem('quizTimes', JSON.stringify(quizTimes));
        
        this.sessionHistory.push({
            date: new Date().toISOString(),
            ...this.metrics
        });
        localStorage.setItem('sessionHistory', JSON.stringify(this.sessionHistory));
    }

    getProgressReport() {
        return {
            daily: this.calculateDailyProgress(),
            weekly: this.calculateWeeklyProgress(),
            monthlyTrend: this.calculateMonthlyTrend()
        };
    }

    calculateDailyProgress() {
        const today = new Date().toLocaleDateString();
        return this.sessionHistory
            .filter(session => new Date(session.date).toLocaleDateString() === today)
            .reduce((acc, session) => ({
                questionsAnswered: acc.questionsAnswered + session.questionsAnswered,
                correctAnswers: acc.correctAnswers + session.correctAnswers,
                averageTime: (acc.averageTime * acc.count + session.averageResponseTime) / (acc.count + 1),
                count: acc.count + 1
            }), { questionsAnswered: 0, correctAnswers: 0, averageTime: 0, count: 0 });
    }

    calculateWeeklyProgress() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return this.sessionHistory
            .filter(session => new Date(session.date) > oneWeekAgo)
            .reduce((acc, session) => ({
                questionsAnswered: acc.questionsAnswered + session.questionsAnswered,
                correctAnswers: acc.correctAnswers + session.correctAnswers,
                focusScore: acc.focusScore + session.focusScore,
                count: acc.count + 1
            }), { questionsAnswered: 0, correctAnswers: 0, focusScore: 0, count: 0 });
    }

    calculateMonthlyTrend() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sessions = this.sessionHistory
            .filter(session => new Date(session.date) > thirtyDaysAgo)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return sessions.reduce((acc, session, index) => {
            const day = Math.floor(index / sessions.length * 30);
            if (!acc[day]) acc[day] = [];
            acc[day].push(session.focusScore);
            return acc;
        }, {});
    }

    getAverageQuizTime() {
        const quizTimes = JSON.parse(localStorage.getItem('quizTimes')) || [];
        if (quizTimes.length === 0) return 0;
        return quizTimes.reduce((a, b) => a + b, 0) / quizTimes.length;
    }
}

export const studySession = new StudySession();
