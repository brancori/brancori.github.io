// ===== GESTIÓN DE EVALUACIONES MODULAR =====

import { STORAGE_KEYS, MESSAGES } from '../core/constants.js';
import { messageManager } from './ui-helpers.js';

export class EvaluationManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentEvaluationId = null;
        this.currentResponses = {};
    }

    // ==========================================
    // MÉTODOS PRINCIPALES
    // ==========================================

    async save(additionalData = {}) {
        try {
            const responses = this.captureCurrentResponses();
            console.log('🔍 Debug - Respuestas capturadas:', responses);
            
            const evaluation = {
                id: this.currentEvaluationId || this.generateEvaluationId(),
                fecha: new Date().toISOString(),
                fechaEvaluacion: this.getFieldValue('fechaEvaluacion'),
                nombreArea: this.getFieldValue('nombreArea'),
                ubicacionArea: this.getFieldValue('ubicacionArea'),
                responsableArea: this.getFieldValue('responsableArea'),
                score: this.calculateScore(),
                categoria: this.getRiskCategory(),
                checkboxes: this.captureCheckboxes(),
                respuestas: responses,
                ...additionalData
            };
            
            console.log('💾 Guardando evaluación:', evaluation);
            
            // Guardar usando DataManager
            const result = await this.dataManager.createEvaluation({
                ...evaluation,
                work_center_id: localStorage.getItem(STORAGE_KEYS.SELECTED_WORK_CENTER_ID),
                area_id: localStorage.getItem(STORAGE_KEYS.SELECTED_AREA_ID)
            });
            
            if (result) {
                this.currentEvaluationId = evaluation.id;
                messageManager.success(MESSAGES.SUCCESS.EVALUATION_SAVED);
                return evaluation.id;
            }
            
        } catch (error) {
            console.error('❌ Error al guardar evaluación:', error);
            messageManager.error(`${MESSAGES.ERROR.SAVE_FAILED}: ${error.message}`);
            throw error;
        }
    }

    async load(id) {
        try {
            const evaluation = await this.dataManager.getCurrentEvaluation(id);
            
            if (!evaluation) {
                messageManager.error(MESSAGES.ERROR.EVALUATION_NOT_FOUND);
                return false;
            }
            
            this.currentEvaluationId = id;
            this.loadEvaluationData(evaluation);
            
            messageManager.success('✅ Evaluación cargada correctamente');
            return true;
            
        } catch (error) {
            console.error('Error cargando evaluación:', error);
            messageManager.error(`${MESSAGES.ERROR.LOAD_FAILED}: ${error.message}`);
            return false;
        }
    }

    async delete(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) {
            try {
                await this.dataManager.deleteEvaluation(id);
                messageManager.success('✅ Evaluación eliminada correctamente');
                return true;
            } catch (error) {
                console.error('Error eliminando evaluación:', error);
                messageManager.error(`${MESSAGES.ERROR.SAVE_FAILED}: ${error.message}`);
                return false;
            }
        }
        return false;
    }

    // ==========================================
    // MÉTODOS DE RESPUESTAS
    // ==========================================

    captureCurrentResponses() {
        const responses = {};
        
        // Capturar preguntas generales
        const generalQuestions = document.querySelectorAll('#preguntas-generales .question');
        if (generalQuestions.length > 0) {
            responses['preguntas-generales'] = {};
            generalQuestions.forEach((question, index) => {
                const selectedRadio = question.querySelector('input[type="radio"]:checked');
                const questionText = question.querySelector('div').textContent;
                
                responses['preguntas-generales'][index] = {
                    pregunta: questionText,
                    respuesta: selectedRadio ? selectedRadio.value : null,
                    peso: question.getAttribute('data-peso'),
                    metodo: question.getAttribute('data-metodo'),
                    critica: question.getAttribute('data-critica')
                };
            });
        }
        
        // Capturar secciones condicionales
        const sections = ['manipulaCargas', 'usaPantallas', 'usaHerramientas', 'mantienePosturas'];
        sections.forEach(section => {
            const sectionElement = document.getElementById(`preguntas-${section}`);
            if (sectionElement) {
                const sectionQuestions = sectionElement.querySelectorAll('.question');
                if (sectionQuestions.length > 0) {
                    responses[`preguntas-${section}`] = {};
                    sectionQuestions.forEach((question, index) => {
                        const selectedRadio = question.querySelector('input[type="radio"]:checked');
                        const questionText = question.querySelector('div').textContent;
                        
                        responses[`preguntas-${section}`][index] = {
                            pregunta: questionText,
                            respuesta: selectedRadio ? selectedRadio.value : null,
                            peso: question.getAttribute('data-peso'),
                            metodo: question.getAttribute('data-metodo'),
                            critica: question.getAttribute('data-critica')
                        };
                    });
                }
            }
        });
        
        this.currentResponses = responses;
        return responses;
    }

    loadResponses(responses) {
        if (!responses) return;
        
        Object.keys(responses).forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) {
                console.warn(`Sección ${sectionId} no encontrada`);
                return;
            }
            
            const questions = section.querySelectorAll('.question');
            Object.keys(responses[sectionId]).forEach(index => {
                const question = questions[parseInt(index)];
                const responseData = responses[sectionId][index];
                
                if (question && responseData && responseData.respuesta) {
                    const radios = question.querySelectorAll('input[type="radio"]');
                    radios.forEach(radio => {
                        if (radio.value === responseData.respuesta) {
                            radio.checked = true;
                            radio.dispatchEvent(new Event('change'));
                        }
                    });
                }
            });
        });
        
        console.log('✅ Respuestas cargadas correctamente');
    }

    // ==========================================
    // MÉTODOS DE CÁLCULO
    // ==========================================

    calculateScore() {
        let totalWeighted = 0;
        let totalWeights = 0;

        const questions = document.querySelectorAll('.question');

        questions.forEach(question => {
            const weight = parseInt(question.getAttribute('data-peso')) || 1;
            const selectedRadio = question.querySelector('input[type="radio"]:checked');
            const response = selectedRadio ? selectedRadio.value : null;

            if (response && response !== 'na') {
                // Lógica invertida: No (1 punto de riesgo), Sí (0 puntos de riesgo)
                const value = (response === 'no') ? 1 : 0;
                totalWeighted += value * weight;
                totalWeights += weight;
            }
        });

        const finalScore = (totalWeights > 0) ? (totalWeighted / totalWeights) * 100 : 0;
        return finalScore.toFixed(2);
    }

    getRiskCategory() {
        const score = parseFloat(this.calculateScore());
        
        if (score <= 25) {
            return { texto: "Riesgo Bajo - Condiciones ergonómicas aceptables", color: "#28a745" };
        } else if (score <= 50) {
            return { texto: "Riesgo Moderado - Se requieren mejoras", color: "#ffc107" };
        } else if (score <= 75) {
            return { texto: "Riesgo Alto - Intervención necesaria", color: "#fd7e14" };
        } else {
            return { texto: "Riesgo Crítico - Intervención urgente", color: "#dc3545" };
        }
    }

    // ==========================================
    // MÉTODOS DE DATOS DE FORMULARIO
    // ==========================================

    captureCheckboxes() {
        return {
            manipulaCargas: this.getCheckboxValue('manipulaCargas'),
            usaPantallas: this.getCheckboxValue('usaPantallas'),
            usaHerramientas: this.getCheckboxValue('usaHerramientas'),
            mantienePosturas: this.getCheckboxValue('mantienePosturas')
        };
    }

    loadEvaluationData(evaluationData) {
        try {
            // Cargar datos básicos
            this.setFieldValue('nombreArea', evaluationData.nombreArea);
            this.setFieldValue('ubicacionArea', evaluationData.ubicacionArea);
            this.setFieldValue('responsableArea', evaluationData.responsableArea || evaluationData.evaluator_name);
            this.setFieldValue('fechaEvaluacion', evaluationData.fechaEvaluacion || evaluationData.evaluation_date);
            
            // Cargar checkboxes
            if (evaluationData.checkboxes || evaluationData.sections_completed) {
                const checkboxes = evaluationData.checkboxes || evaluationData.sections_completed;
                this.setCheckboxValue('manipulaCargas', checkboxes.manipulaCargas);
                this.setCheckboxValue('usaPantallas', checkboxes.usaPantallas);
                this.setCheckboxValue('usaHerramientas', checkboxes.usaHerramientas);
                this.setCheckboxValue('mantienePosturas', checkboxes.mantienePosturas);
            }
            
            // Trigger update si existe la función
            if (typeof window.actualizarPreguntas === 'function') {
                window.actualizarPreguntas();
            }
            
            // Cargar respuestas después de un delay
            setTimeout(() => {
                if (evaluationData.respuestas || evaluationData.responses) {
                    this.loadResponses(evaluationData.respuestas || evaluationData.responses);
                }
                
                // Trigger cálculo automático si existe la función
                if (typeof window.calcularScoreAutomatico === 'function') {
                    window.calcularScoreAutomatico();
                }
            }, 200);
            
        } catch (error) {
            console.error('Error cargando datos de evaluación:', error);
            messageManager.error('Error cargando datos de evaluación');
        }
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    generateEvaluationId() {
        return 'eval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getFieldValue(fieldId) {
        const field = document.getElementById(fieldId);
        return field ? field.value : '';
    }

    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value) {
            field.value = value;
        }
    }

    getCheckboxValue(checkboxId) {
        const checkbox = document.getElementById(checkboxId);
        return checkbox ? checkbox.checked : false;
    }

    setCheckboxValue(checkboxId, value) {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.checked = Boolean(value);
        }
    }

    clearForm() {
        // Limpiar campos básicos
        this.setFieldValue('fechaEvaluacion', new Date().toISOString().split('T')[0]);
        this.setFieldValue('nombreArea', '');
        this.setFieldValue('ubicacionArea', '');
        this.setFieldValue('responsableArea', '');
        
        // Limpiar checkboxes
        this.setCheckboxValue('manipulaCargas', false);
        this.setCheckboxValue('usaPantallas', false);
        this.setCheckboxValue('usaHerramientas', false);
        this.setCheckboxValue('mantienePosturas', false);
        
        // Trigger update si existe la función
        if (typeof window.actualizarPreguntas === 'function') {
            window.actualizarPreguntas();
        }
        
        // Trigger cálculo automático si existe la función
        if (typeof window.calcularScoreAutomatico === 'function') {
            window.calcularScoreAutomatico();
        }
    }

    newEvaluation() {
        if (confirm('¿Quieres crear una nueva evaluación? Se perderán los datos actuales no guardados.')) {
            this.currentEvaluationId = null;
            this.currentResponses = {};
            this.clearForm();
            window.scrollTo(0, 0);
        }
    }

    // ==========================================
    // MÉTODOS DE VALIDACIÓN
    // ==========================================

    validateRequiredFields() {
        const requiredFields = [
            { id: 'nombreArea', name: 'Nombre del área' }
        ];
        
        const errors = [];
        
        requiredFields.forEach(field => {
            const value = this.getFieldValue(field.id);
            if (!value.trim()) {
                errors.push(`${field.name} es obligatorio`);
            }
        });
        
        return errors;
    }

    isValid() {
        const errors = this.validateRequiredFields();
        
        if (errors.length > 0) {
            messageManager.error(errors.join(', '));
            return false;
        }
        
        return true;
    }

    // ==========================================
    // MÉTODOS DE INTEGRACIÓN
    // ==========================================

    async loadExistingEvaluation() {
        const workCenterId = localStorage.getItem(STORAGE_KEYS.SELECTED_WORK_CENTER_ID);
        const areaId = localStorage.getItem(STORAGE_KEYS.SELECTED_AREA_ID);
        
        if (!workCenterId || !areaId) return;
        
        try {
            // Intentar cargar evaluación existente
            const currentEvaluation = await this.dataManager.getCurrentEvaluation(workCenterId);
            
            if (currentEvaluation) {
                console.log('Cargando evaluación existente:', currentEvaluation.id);
                this.currentEvaluationId = currentEvaluation.id;
                this.loadEvaluationData(currentEvaluation);
            } else {
                // Pre-llenar con datos del área y centro
                await this.prefillFromAreaAndWorkCenter(areaId, workCenterId);
            }
        } catch (error) {
            console.error('Error cargando evaluación existente:', error);
        }
    }

    async prefillFromAreaAndWorkCenter(areaId, workCenterId) {
        try {
            const area = await this.dataManager.getAreaById(areaId);
            const workCenter = await this.dataManager.getWorkCenterById(workCenterId);
            
            if (area) {
                this.setFieldValue('nombreArea', area.name);
                this.setFieldValue('responsableArea', area.manager);
            }
            
            if (workCenter) {
                this.setFieldValue('ubicacionArea', `Centro: ${workCenter.name} (${workCenter.id})`);
            }
        } catch (error) {
            console.error('Error pre-llenando datos:', error);
        }
    }

    // ==========================================
    // MÉTODOS DE COMUNICACIÓN CON VENTANA PADRE
    // ==========================================

    sendToParentWindow() {
        const evaluationData = {
            id: this.currentEvaluationId || this.generateEvaluationId(),
            fecha: new Date().toISOString(),
            fechaEvaluacion: this.getFieldValue('fechaEvaluacion'),
            nombreArea: this.getFieldValue('nombreArea'),
            ubicacionArea: this.getFieldValue('ubicacionArea'),
            responsableArea: this.getFieldValue('responsableArea'),
            score: this.calculateScore(),
            categoria: this.getRiskCategory(),
            checkboxes: this.captureCheckboxes(),
            respuestas: this.captureCurrentResponses()
        };
        
        // Enviar a la ventana padre si existe
        if (window.opener && window.opener.receiveEvaluationData) {
            window.opener.receiveEvaluationData(evaluationData);
            window.close();
        } else {
            // Guardar localmente si no hay ventana padre
            const workCenterId = localStorage.getItem(STORAGE_KEYS.SELECTED_WORK_CENTER_ID);
            if (workCenterId) {
                localStorage.setItem(`evaluation_${workCenterId}`, JSON.stringify(evaluationData));
            }
            messageManager.success(MESSAGES.SUCCESS.EVALUATION_SAVED);
        }
    }
}

// Crear instancia por defecto para compatibilidad
export const evaluationManager = new EvaluationManager(window.DataManager);

// Funciones globales para compatibilidad con código existente
export function createGlobalEvaluationFunctions(manager) {
    window.guardarEvaluacion = async () => {
        if (manager.isValid()) {
            try {
                const id = await manager.save();
                if (id) {
                    manager.currentEvaluationId = id;
                }
            } catch (error) {
                console.error('Error guardando evaluación:', error);
            }
        }
    };
    
    window.nuevaEvaluacion = () => {
        manager.newEvaluation();
    };
    
    window.saveEvaluationDirectly = async () => {
        if (manager.isValid()) {
            try {
                const id = await manager.save();
                if (id && window.opener && window.opener.receiveEvaluationData) {
                    const evaluationData = {
                        id: id,
                        score: manager.calculateScore()
                    };
                    window.opener.receiveEvaluationData(evaluationData);
                }
            } catch (error) {
                console.error('Error guardando evaluación:', error);
            }
        }
    };
}

export default EvaluationManager;