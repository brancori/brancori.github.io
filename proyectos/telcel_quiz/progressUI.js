import { studySession } from './studySession.js';

export class ProgressUI {
    static createProgressDashboard() {
        return `
        <div class="progress-dashboard">
            <div class="study-metrics">
                <div class="metric-card">
                    <h3>Sesión Actual</h3>
                    <div class="focus-meter"></div>
                    <p>Preguntas Correctas: <span id="correct-count">0</span>/<span id="total-questions">0</span></p>
                    <p>Porcentaje: <span id="accuracy-rate">0</span>%</p>
                    <p>Tiempo Quiz: <span id="current-time">0:00</span></p>
                </div>
                <div class="metric-card">
                    <h3>Progreso General</h3>
                    <div class="progress-chart"></div>
                    <p>Total Respondidas: <span id="total-answered">0</span></p>
                    <p>Total Correctas: <span id="total-correct">0</span></p>
                    <p>Promedio General: <span id="overall-accuracy">0</span>%</p>
                    <p>Tiempo Promedio: <span id="avg-quiz-time">0:00</span></p>
                </div>
            </div>
        </div>`;
    }
    

    static updateDashboard(metrics) {
        try {
            if (!metrics) {
                console.error('Error: No se proporcionaron métricas válidas');
                return;
            }
            
            this.updateCurrentSession(metrics);
            this.updateOverallProgress();
            this.updateTimers(metrics);
        } catch (error) {
            console.error('Error al actualizar el dashboard:', error);
        }
    }

    static updateCurrentSession(metrics) {
        const correctCount = document.getElementById('correct-count');
        const totalQuestions = document.getElementById('total-questions');
        const accuracyRate = document.getElementById('accuracy-rate');

        if (correctCount) correctCount.textContent = metrics.correctAnswers;
        if (totalQuestions) totalQuestions.textContent = metrics.questionsAnswered;
        if (accuracyRate) {
            const rate = metrics.questionsAnswered > 0 
                ? Math.round((metrics.correctAnswers / metrics.questionsAnswered) * 100) 
                : 0;
            accuracyRate.textContent = rate;

            // Actualizar medidor visual de la sesión actual
            const focusMeter = document.querySelector('.focus-meter');
            if (focusMeter) {
                focusMeter.style.setProperty('--progress', `${rate}%`);
            }
        }
    }


    static updateOverallProgress() {
        // Obtener historial completo
        const correctIndices = JSON.parse(localStorage.getItem('correctIndices')) || [];
        const incorrectIndices = JSON.parse(localStorage.getItem('incorrectIndices')) || [];
        const totalAnswered = document.getElementById('total-answered');
        const totalCorrect = document.getElementById('total-correct');
        const overallAccuracy = document.getElementById('overall-accuracy');

        if (totalAnswered) {
            const total = correctIndices.length + incorrectIndices.length;
            totalAnswered.textContent = total;
        }

        if (totalCorrect) {
            totalCorrect.textContent = correctIndices.length;
        }

        if (overallAccuracy) {
            const total = correctIndices.length + incorrectIndices.length;
            const accuracy = total > 0 
                ? Math.round((correctIndices.length / total) * 100) 
                : 0;
            overallAccuracy.textContent = accuracy;

            // Actualizar gráfico de progreso general
            const progressChart = document.querySelector('.progress-chart');
            if (progressChart) {
                progressChart.style.setProperty('--progress', `${accuracy}%`);
            }
        }
    }

    static updateTimers(metrics) {
        try {
            // Actualizar tiempo actual
            const currentTimeElement = document.getElementById('current-time');
            if (currentTimeElement && metrics.quizStartTime) {
                const currentSeconds = Math.round((new Date() - metrics.quizStartTime) / 1000);
                currentTimeElement.textContent = this.formatTime(currentSeconds);
            }

            // Actualizar tiempo promedio histórico
            const avgTimeElement = document.getElementById('avg-quiz-time');
            if (avgTimeElement) {
                const quizTimes = JSON.parse(localStorage.getItem('quizTimes')) || [];
                const avgSeconds = quizTimes.length > 0 
                    ? Math.round(quizTimes.reduce((a, b) => a + b, 0) / quizTimes.length)
                    : 0;
                avgTimeElement.textContent = this.formatTime(avgSeconds);
            }
        } catch (error) {
            console.error('Error al actualizar los tiempos:', error);
        }
    }

    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}
