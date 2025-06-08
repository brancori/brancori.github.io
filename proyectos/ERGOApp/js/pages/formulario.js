// ===== PÁGINA DE FORMULARIO MODULAR =====

import { EVALUATION_DATA, ERGONOMIC_METHODS } from '../core/constants.js';
import EvaluationManager, { createGlobalEvaluationFunctions } from '../modules/evaluation-manager.js';
import { createGlobalPDFFunction } from '../modules/pdf-generator.js';
import { messageManager, modalManager, DateUtils } from '../modules/ui-helpers.js';

class FormularioPage {
    constructor() {
        this.evaluationManager = null;
        this.init();
    }

    async init() {
        // Esperar a que DataManager esté disponible
        await this.waitForDataManager();
        
        // Inicializar gestores
        this.evaluationManager = new EvaluationManager(window.DataManager);
        
        // Configurar página
        this.setupPage();
        this.loadQuestions();
        this.setupEventListeners();
        this.createGlobalFunctions();
        
        // Cargar datos existentes si hay
        await this.evaluationManager.loadExistingEvaluation();
        
        console.log('✅ Formulario inicializado correctamente');
    }

    async waitForDataManager() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.DataManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.DataManager) {
            throw new Error('DataManager no disponible después de esperar');
        }
    }

    setupPage() {
        // Establecer fecha actual
        const todayString = DateUtils.getCurrentDateString();
        document.getElementById('fechaEvaluacion').value = todayString;
    }

    // ==========================================
    // CARGA DE PREGUNTAS
    // ==========================================

    loadQuestions() {
        this.loadGeneralQuestions();
        this.updateConditionalQuestions();
    }

    loadGeneralQuestions() {
        const container = document.getElementById('preguntas-container');
        
        const generalDiv = document.createElement('div');
        generalDiv.className = 'question-group';
        generalDiv.id = 'preguntas-generales';
        
        const title = document.createElement('h2');
        title.textContent = 'Criterios Generales';
        generalDiv.appendChild(title);
        
        EVALUATION_DATA.generales.forEach((item, index) => {
            const questionDiv = this.createQuestionElement(
                item.pregunta, 
                'general', 
                index, 
                item.peso, 
                item.metodo, 
                item.critica
            );
            generalDiv.appendChild(questionDiv);
        });
        
        container.appendChild(generalDiv);
    }

    updateConditionalQuestions() {
        // Eliminar secciones condicionales existentes
        const conditionalSections = document.querySelectorAll('.conditional-question-group');
        conditionalSections.forEach(section => section.remove());
        
        const container = document.getElementById('preguntas-container');
        
        // Agregar secciones según checkboxes
        if (document.getElementById('manipulaCargas').checked) {
            container.appendChild(this.createConditionalSection('manipulaCargas', 'Manipulación de Cargas'));
        }
        
        if (document.getElementById('usaPantallas').checked) {
            container.appendChild(this.createConditionalSection('usaPantallas', 'Uso de Pantallas'));
        }
        
        if (document.getElementById('usaHerramientas').checked) {
            container.appendChild(this.createConditionalSection('usaHerramientas', 'Uso de Herramientas'));
        }
        
        if (document.getElementById('mantienePosturas').checked) {
            container.appendChild(this.createConditionalSection('mantienePosturas', 'Mantenimiento de Posturas'));
        }
        
        // Recalcular score
        this.calculateScoreAutomatically();
    }

    createConditionalSection(id, title) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'question-group conditional-question-group';
        sectionDiv.id = `preguntas-${id}`;
        
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        sectionDiv.appendChild(titleElement);
        
        EVALUATION_DATA.condicionales[id].forEach((item, index) => {
            const questionDiv = this.createQuestionElement(
                item.pregunta, 
                id, 
                index, 
                item.peso, 
                item.metodo, 
                item.critica
            );
            sectionDiv.appendChild(questionDiv);
        });
        
        return sectionDiv;
    }

    createQuestionElement(question, category, index, weight, method, critical) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.setAttribute('data-peso', weight);
        questionDiv.setAttribute('data-metodo', method || '');
        questionDiv.setAttribute('data-critica', critical || false);
        
        const questionTextDiv = document.createElement('div');
        questionTextDiv.textContent = question;
        
        // Añadir indicador de método si existe
        if (method) {
            const methodSpan = document.createElement('span');
            methodSpan.style.cssText = `
                background-color: ${ERGONOMIC_METHODS[method].color};
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                margin-left: 10px;
                font-weight: bold;
            `;
            methodSpan.textContent = method;
            if (critical) {
                methodSpan.textContent += ' ⚠️';
            }
            questionTextDiv.appendChild(methodSpan);
        }
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        optionsDiv.innerHTML = `
            <label class="radio-label">
                <input type="radio" name="${category}-${index}" class="radio-input" value="si" onchange="window.calcularScoreAutomatico()"> Sí
            </label>
            <label class="radio-label">
                <input type="radio" name="${category}-${index}" class="radio-input" value="no" onchange="window.calcularScoreAutomatico()"> No
            </label>
            <label class="radio-label">
                <input type="radio" name="${category}-${index}" class="radio-input" value="na" onchange="window.calcularScoreAutomatico()"> N/A
            </label>
        `;
        
        questionDiv.appendChild(questionTextDiv);
        questionDiv.appendChild(optionsDiv);
        
        return questionDiv;
    }

    // ==========================================
    // CÁLCULO DE SCORE
    // ==========================================

    calculateScoreAutomatically() {
        const score = this.evaluationManager.calculateScore();
        document.getElementById('scoreFinal').textContent = score + '%';
        
        const category = this.evaluationManager.getRiskCategory();
        const categoryElement = document.getElementById('textoCategoria');
        const scoreElement = document.getElementById('scoreFinal');
        
        categoryElement.textContent = category.texto;
        scoreElement.style.color = category.color;
    }

    // ==========================================
    // ANÁLISIS DE MÉTODOS
    // ==========================================

    analyzeRequiredMethods() {
        const methodsContainer = document.getElementById('metodosRecomendados');
        const listMethods = document.getElementById('listMetodos');
        const listKeyQuestions = document.getElementById('listPreguntasClave');
        const summaryDecision = document.getElementById('textoResumen');
        
        listMethods.innerHTML = '';
        listKeyQuestions.innerHTML = '';
        
        const questions = document.querySelectorAll('.question');
        const detectedMethods = {};
        const criticalQuestions = [];
        
        questions.forEach(question => {
            const method = question.getAttribute('data-metodo');
            const critical = question.getAttribute('data-critica') === 'true';
            const selectedRadio = question.querySelector('input[type="radio"]:checked');
            const response = selectedRadio ? selectedRadio.value : null;
            const questionText = question.querySelector('div').textContent;
            
            if (method && response === 'no') {
                if (!detectedMethods[method]) {
                    detectedMethods[method] = {
                        count: 0,
                        questions: [],
                        critical: 0
                    };
                }
                detectedMethods[method].count++;
                detectedMethods[method].questions.push(questionText);
                if (critical) {
                    detectedMethods[method].critical++;
                    criticalQuestions.push({
                        method: method,
                        question: questionText
                    });
                }
            }
        });

        this.renderMethodsAnalysis(detectedMethods, criticalQuestions, summaryDecision, listMethods, listKeyQuestions);
        
        methodsContainer.classList.remove('hidden');
        methodsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    renderMethodsAnalysis(detectedMethods, criticalQuestions, summaryDecision, listMethods, listKeyQuestions) {
        const totalMethods = Object.keys(detectedMethods).length;
        const totalCritical = criticalQuestions.length;
        
        let summaryContent = `
            <p><strong>📈 Análisis Completado:</strong></p>
            <ul>
                <li><strong>${totalMethods}</strong> métodos de evaluación recomendados</li>
                <li><strong>${totalCritical}</strong> indicadores críticos identificados</li>
                <li><strong>Prioridad:</strong> ${totalCritical > 0 ? 'ALTA' : totalMethods > 2 ? 'MEDIA' : 'BAJA'}</li>
            </ul>
        `;
        summaryDecision.innerHTML = summaryContent;

        if (totalMethods === 0) {
            listMethods.innerHTML = `
                <div class="metodo-card">
                    <div class="metodo-title">✅ No se requieren métodos específicos</div>
                    <div class="metodo-justification">
                        Las respuestas indican condiciones ergonómicas generalmente aceptables. 
                        Continúe con el seguimiento rutinario basado en el cuestionario general.
                    </div>
                    <span class="metodo-priority priority-opcional">SEGUIMIENTO RUTINARIO</span>
                </div>
            `;
        } else {
            this.renderMethodCards(detectedMethods, listMethods);
        }

        this.renderCriticalQuestions(criticalQuestions, listKeyQuestions);
    }

    renderMethodCards(detectedMethods, container) {
        const sortedMethods = Object.entries(detectedMethods)
            .sort(([,a], [,b]) => b.critical - a.critical || b.count - a.count);

        sortedMethods.forEach(([method, data]) => {
            const methodInfo = ERGONOMIC_METHODS[method];
            const priority = data.critical > 0 ? 'OBLIGATORIO' : 
                           data.count > 2 ? 'RECOMENDADO' : 'OPCIONAL';
            const priorityClass = priority === 'OBLIGATORIO' ? 'priority-obligatorio' :
                               priority === 'RECOMENDADO' ? 'priority-recomendado' : 'priority-opcional';

            const methodCard = document.createElement('div');
            methodCard.className = 'metodo-card';
            methodCard.style.borderLeftColor = methodInfo.color;
            
            methodCard.innerHTML = `
                <div class="metodo-title">🎯 ${methodInfo.nombre} - ${methodInfo.descripcion}</div>
                <div class="metodo-justification">
                    <strong>Razón:</strong> ${data.count} indicador(es) detectado(s)
                    ${data.critical > 0 ? ` (${data.critical} crítico${data.critical > 1 ? 's' : ''})` : ''}
                    <br><strong>Factores identificados:</strong> 
                    ${data.questions.slice(0,2).map(q => '• ' + q.substring(0,60) + '...').join('<br>')}
                    ${data.questions.length > 2 ? `<br>• Y ${data.questions.length - 2} más...` : ''}
                </div>
                <span class="metodo-priority ${priorityClass}">${priority}</span>
            `;
            
            container.appendChild(methodCard);
        });
    }

    renderCriticalQuestions(criticalQuestions, container) {
        if (criticalQuestions.length > 0) {
            criticalQuestions.forEach(item => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'pregunta-indicadora';
                questionDiv.innerHTML = `
                    <span style="color: ${ERGONOMIC_METHODS[item.method].color}; font-weight: bold;">
                        ${item.method}:
                    </span> 
                    ${item.question.substring(0, 100)}...
                `;
                container.appendChild(questionDiv);
            });
        } else {
            container.innerHTML = `
                <div class="pregunta-indicadora" style="color: #28a745;">
                    ✅ No se identificaron indicadores críticos que requieran evaluación específica inmediata.
                </div>
            `;
        }
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    setupEventListeners() {
        // Checkboxes de secciones condicionales
        const checkboxes = ['manipulaCargas', 'usaPantallas', 'usaHerramientas', 'mantienePosturas'];
        checkboxes.forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateConditionalQuestions();
            });
        });

        // Botones principales
        document.getElementById('calcularBtn').addEventListener('click', () => {
            const score = this.evaluationManager.calculateScore();
            const category = this.evaluationManager.getRiskCategory();
            
            this.calculateScoreAutomatically();
            alert(`Nivel de Riesgo Ergonómico: ${score}%\n${category.texto}`);
        });

        document.getElementById('analizarMetodosBtn').addEventListener('click', () => {
            this.analyzeRequiredMethods();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            window.exportarPDFCompleto();
        });

        // Configurar modal si existe
        setTimeout(() => {
            this.setupModal();
        }, 500);
    }

    setupModal() {
        // Configuración básica del modal
        window.onclick = function(event) {
            const modal = document.getElementById('modalVerEvaluacion');
            if (event.target === modal) {
                modalManager.close('modalVerEvaluacion');
            }
        };
    }

    // ==========================================
    // FUNCIONES GLOBALES
    // ==========================================

    createGlobalFunctions() {
        // Crear funciones globales para compatibilidad con HTML
        createGlobalEvaluationFunctions(this.evaluationManager);
        createGlobalPDFFunction();
        
        // Funciones específicas del formulario
        window.actualizarPreguntas = () => {
            this.updateConditionalQuestions();
        };
        
        window.calcularScoreAutomatico = () => {
            this.calculateScoreAutomatically();
        };
        
        window.analizarMetodosRequeridos = () => {
            this.analyzeRequiredMethods();
        };
        
        window.calcularScoreFinal = () => {
            return this.evaluationManager.calculateScore();
        };
        
        window.obtenerCategoriaRiesgo = (score) => {
            return this.evaluationManager.getRiskCategory();
        };
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - inicializando formulario modular...');
    
    try {
        const formularioPage = new FormularioPage();
        window.formularioPage = formularioPage; // Para debugging
    } catch (error) {
        console.error('Error inicializando formulario:', error);
        messageManager.error('Error inicializando la aplicación. Recarga la página.');
    }
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error global en formulario:', e.error);
});

// Prevenir zoom accidental en móviles
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

export default FormularioPage;