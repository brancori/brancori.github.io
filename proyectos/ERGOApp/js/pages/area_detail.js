class AreaDetailManager {
    constructor() {
        this.areaId = localStorage.getItem('selectedAreaId');
        this.area = null;
        this.workCenters = [];
        this.init();
    }

    async init() {
        if (!this.areaId) {
            document.body.innerHTML = '<div style="text-align: center; padding: 50px;">❌ No se seleccionó un área válida</div>';
            return;
        }
        
        try {
            await this.loadArea();
            await this.loadWorkCenters();
            this.renderAreaDetail();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error inicializando:', error);
            document.body.innerHTML = '<div style="text-align: center; padding: 50px;">❌ Error cargando datos</div>';
        }
    }

    async loadArea() {
        try {
            this.area = await DataManager.getAreaById(this.areaId);
            if (!this.area) {
                throw new Error('Área no encontrada');
            }
        } catch (error) {
            console.error('Error cargando área:', error);
            throw error;
        }
    }

    async loadWorkCenters() {
        try {
            this.workCenters = await DataManager.getWorkCenters(this.areaId);
            console.log('✅ Centros cargados desde Supabase:', this.workCenters.length);
        } catch (error) {
            console.error('Error cargando centros:', error);
            this.workCenters = [];
        }
    }

    calculateAverageRisk() {
        if (this.workCenters.length === 0) return 0;
        const evaluatedCenters = this.workCenters.filter(wc => wc.current_risk_percentage !== null);
        if (evaluatedCenters.length === 0) return 0;
        
        const sum = evaluatedCenters.reduce((acc, wc) => acc + wc.current_risk_percentage, 0);
        return (sum / evaluatedCenters.length).toFixed(1);
    }

    getTotalEvaluations() {
        return this.workCenters.reduce((acc, wc) => acc + (wc.evaluation_count || 0), 0);
    }

    async addWorkCenter(name) {
        try {
            const workCenter = await DataManager.createUniqueWorkCenter(this.areaId, name);
            await this.loadWorkCenters(); // Recargar desde Supabase
            this.renderWorkCenters();
            this.updateAreaHeader();
            return workCenter.id;
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
            return false;
        }
    }

    async deleteWorkCenter(id) {
        if (confirm('¿Estás seguro de eliminar este centro de trabajo y su evaluación?')) {
            try {
                await DataManager.deleteWorkCenter(this.areaId, id);
                await this.loadWorkCenters(); // Recargar desde Supabase
                this.renderWorkCenters();
                this.updateAreaHeader();
                alert('✅ Centro eliminado correctamente');
            } catch (error) {
                alert(`❌ Error: ${error.message}`);
            }
        }
    }

    startEvaluation(workCenterId) {
        localStorage.setItem('selectedWorkCenterId', workCenterId);
        localStorage.setItem('selectedAreaId', this.areaId);
        
        // Cargar datos existentes si es edición
        this.loadExistingEvaluation(workCenterId);
        
        // Navegar al formulario
        window.location.href = 'formulario_.html';
    }

    async loadExistingEvaluation(workCenterId) {
        try {
            const currentEvaluation = await DataManager.getCurrentEvaluation(workCenterId);
            
            if (currentEvaluation) {
                localStorage.setItem('editingEvaluation', JSON.stringify(currentEvaluation));
                console.log('✅ Evaluación existente cargada para edición');
            } else {
                localStorage.removeItem('editingEvaluation');
                console.log('📝 No hay evaluación existente - creando nueva');
            }
        } catch (error) {
            console.error('Error cargando evaluación:', error);
            localStorage.removeItem('editingEvaluation');
        }
    }

    updateAreaHeader() {
        const avgRisk = this.calculateAverageRisk();
        const totalEvals = this.getTotalEvaluations();
        
        const riskElement = document.getElementById('areaRisk');
        const evalsElement = document.getElementById('areaEvaluations');
        
        if (riskElement) {
            riskElement.textContent = avgRisk > 0 ? `${avgRisk}%` : 'Sin evaluar';
            riskElement.className = 'value area-risk ' + this.getRiskClass(parseFloat(avgRisk));
        }
        
        if (evalsElement) {
            evalsElement.textContent = totalEvals;
        }
    }

    getRiskClass(riskPercentage) {
        if (!riskPercentage || riskPercentage === 0) return 'risk-none';
        if (riskPercentage <= 25) return 'risk-low';
        if (riskPercentage <= 50) return 'risk-medium';
        if (riskPercentage <= 75) return 'risk-high';
        return 'risk-critical';
    }

    renderAreaDetail() {
        const avgRisk = this.calculateAverageRisk();
        const totalEvals = this.getTotalEvaluations();
        
        document.getElementById('app').innerHTML = `
            <div class="area-detail-container">
                <div class="area-header">
                    <h1 class="area-title">${this.area.name}</h1>
                    <div class="area-info">
                        <div class="info-item">
                            <span class="label">👤 Responsable:</span>
                            <span class="value">${this.area.manager}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">📊 Evaluaciones:</span>
                            <span class="value" id="areaEvaluations">${totalEvals}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">🚨 Riesgo Promedio:</span>
                            <span class="value area-risk ${this.getRiskClass(parseFloat(avgRisk))}" id="areaRisk">
                                ${avgRisk > 0 ? `${avgRisk}%` : 'Sin evaluar'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="work-centers-section">
                    <div class="section-header">
                        <h2>🏭 Centros de Trabajo</h2>
                        <button class="btn btn-primary" id="addWorkCenterBtn">
                            ➕ Crear Centro de Trabajo
                        </button>
                    </div>
                    
                    <div id="workCentersList"></div>
                    
                    <div id="emptyWorkCenters" class="empty-state ${this.workCenters.length > 0 ? 'hidden' : ''}">
                        <div class="empty-icon">🏭</div>
                        <div class="empty-text">No hay centros de trabajo</div>
                        <div class="empty-subtext">Comienza creando tu primer centro de trabajo</div>
                    </div>
                </div>

                <div id="workCenterModal" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Crear Centro de Trabajo</h3>
                            <button class="modal-close" onclick="closeWorkCenterModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="workCenterName">Nombre del Centro de Trabajo *</label>
                                <input type="text" id="workCenterName" class="form-control" 
                                       placeholder="Ej: Estación de Ensamblaje 1" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-success" onclick="saveWorkCenter()">💾 Crear</button>
                            <button class="btn btn-secondary" onclick="closeWorkCenterModal()">❌ Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.renderWorkCenters();
    }

    renderWorkCenters() {
        const container = document.getElementById('workCentersList');
        const emptyState = document.getElementById('emptyWorkCenters');
        
        if (!container) return;
        
        if (this.workCenters.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        if (emptyState) emptyState.classList.add('hidden');
        
        container.innerHTML = this.workCenters.map(wc => {
            const createdDate = new Date(wc.created_at).toLocaleDateString('es-ES');
            const riskDisplay = wc.current_risk_percentage ? `${wc.current_risk_percentage}%` : 'Sin evaluar';
            
            // ✅ CORREGIDO: Verificar si tiene evaluación basado en current_risk_percentage
            const hasEvaluation = wc.current_risk_percentage !== null;
            
            // Botones según estado de evaluación
            const actionButtons = hasEvaluation ? `
                <button class="btn btn-primary" onclick="detailManager.viewEvaluation('${wc.id}')">
                    👁️ Ver
                </button>
                <button class="btn btn-success" onclick="detailManager.editEvaluation('${wc.id}')">
                    ✏️ Editar
                </button>
            ` : `
                <button class="btn btn-primary" onclick="detailManager.startEvaluation('${wc.id}')">
                    📝 Evaluar
                </button>
            `;
            
            return `
                <div class="work-center-card">
                    <div class="wc-info">
                        <h3>${wc.name} <small style="color: #95a5a6;">(${wc.id})</small></h3>
                        <div class="wc-details">
                            📅 Creado: ${createdDate} | 🚨 ${riskDisplay} | 📊 ${wc.evaluation_count || 0} evaluaciones
                        </div>
                    </div>
                    <div class="wc-actions">
                        ${actionButtons}
                        <button class="btn btn-danger" onclick="detailManager.deleteWorkCenter('${wc.id}')">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        const addBtn = document.getElementById('addWorkCenterBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                document.getElementById('workCenterModal').classList.remove('hidden');
                document.getElementById('workCenterName').focus();
            });
        }
    }

    async refreshWorkCenters() {
        await this.loadWorkCenters();
        this.renderWorkCenters();
        this.updateAreaHeader();
        console.log('✅ Centros de trabajo actualizados desde Supabase');
    }

    // ✅ CORREGIDO: Función viewEvaluation completamente reescrita
    async viewEvaluation(workCenterId) {
        try {
            // Obtener evaluación actual desde Supabase
            const currentEvaluation = await DataManager.getCurrentEvaluation(workCenterId);
            
            if (!currentEvaluation) {
                alert('❌ No se encontró evaluación para este centro de trabajo');
                return;
            }
            
            // Obtener datos del centro de trabajo
            const workCenter = this.workCenters.find(wc => wc.id === workCenterId);
            
            if (workCenter) {
                this.showEvaluationModal(workCenter, currentEvaluation);
            }
        } catch (error) {
            console.error('Error obteniendo evaluación:', error);
            alert('❌ Error cargando evaluación: ' + error.message);
        }
    }

    editEvaluation(workCenterId) {
        this.startEvaluation(workCenterId);
    }

    async updateWorkCenterEvaluation(workCenterId, evaluationData) {
        try {
            // Usar el nuevo método createEvaluation del DataManager actualizado
            await DataManager.createEvaluation({
                ...evaluationData,
                work_center_id: workCenterId,
                area_id: this.areaId
            });
            
            await this.refreshWorkCenters(); // Recargar desde Supabase
            alert('✅ Evaluación guardada en Supabase correctamente');
        } catch (error) {
            console.error('Error actualizando evaluación:', error);
            alert(`❌ Error: ${error.message}`);
        }
    }

    // ✅ CORREGIDO: Función showEvaluationModal con parámetros correctos
    showEvaluationModal(workCenter, evaluationData) {
        const data = evaluationData; // Usar datos pasados como parámetro
        const riskLevel = this.getRiskLevel(data.score);
        
        const modalHTML = `
            <div id="evaluationViewModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📊 Evaluación: ${workCenter.name}</h3>
                        <button class="modal-close" onclick="closeEvaluationModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 20px;">
                            <strong>Centro ID:</strong> ${workCenter.id}<br>
                            <strong>Evaluación ID:</strong> ${data.id}<br>
                            <strong>Fecha:</strong> ${new Date(data.evaluation_date).toLocaleDateString('es-ES')}<br>
                            <strong>Evaluador:</strong> ${data.evaluator_name || 'No especificado'}<br>
                            <strong>Score:</strong> <span style="color: ${this.getRiskColor(data.score)}">${data.score}%</span><br>
                            <strong>Categoría:</strong> ${data.risk_category}<br>
                            ${data.general_notes ? `<strong>Notas:</strong> ${data.general_notes}<br>` : ''}
                        </div>
                        
                        <h4>Secciones Evaluadas:</h4>
                        <ul>
                            ${data.sections_completed?.manipulaCargas ? '<li>✅ Manipulación de cargas</li>' : '<li>❌ Manipulación de cargas</li>'}
                            ${data.sections_completed?.usaPantallas ? '<li>✅ Uso de pantallas</li>' : '<li>❌ Uso de pantallas</li>'}
                            ${data.sections_completed?.usaHerramientas ? '<li>✅ Uso de herramientas</li>' : '<li>❌ Uso de herramientas</li>'}
                            ${data.sections_completed?.mantienePosturas ? '<li>✅ Mantenimiento de posturas</li>' : '<li>❌ Mantenimiento de posturas</li>'}
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="detailManager.editEvaluation('${workCenter.id}')">✏️ Editar</button>
                        <button class="btn btn-secondary" onclick="closeEvaluationModal()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    getRiskLevel(score) {
        const scoreNum = parseFloat(score);
        if (scoreNum <= 25) return 'Riesgo Bajo';
        if (scoreNum <= 50) return 'Riesgo Moderado';
        if (scoreNum <= 75) return 'Riesgo Alto';
        return 'Riesgo Crítico';
    }

    getRiskColor(score) {
        const scoreNum = parseFloat(score);
        if (scoreNum <= 25) return '#27ae60';
        if (scoreNum <= 50) return '#f39c12';
        if (scoreNum <= 75) return '#e67e22';
        return '#e74c3c';
    }
}

// Funciones globales
function closeWorkCenterModal() {
    document.getElementById('workCenterModal').classList.add('hidden');
    document.getElementById('workCenterName').value = '';
}

function saveWorkCenter() {
    const name = document.getElementById('workCenterName').value.trim();
    if (!name) {
        alert('Por favor ingresa un nombre para el centro de trabajo');
        return;
    }
    
    detailManager.addWorkCenter(name);
    closeWorkCenterModal();
}

// Inicializar
let detailManager;
document.addEventListener('DOMContentLoaded', function() {
    detailManager = new AreaDetailManager();
    window.detailManager = detailManager;
});

function closeEvaluationModal() {
    const modal = document.getElementById('evaluationViewModal');
    if (modal) {
        modal.remove();
    }
}

// Función para recibir datos de evaluación desde formulario_.html
window.receiveEvaluationData = function(evaluationData) {
    const workCenterId = localStorage.getItem('selectedWorkCenterId');
    if (workCenterId && window.detailManager) {
        // Actualizar el centro de trabajo
        window.detailManager.updateWorkCenterEvaluation(workCenterId, evaluationData);
        
        // Mostrar confirmación
        alert('✅ Evaluación recibida y guardada en el centro de trabajo');
        
        // Actualizar la vista
        window.detailManager.refreshWorkCenters();
    }
};

// Funciones de debug y mantenimiento
function debugDataStructure() {
    console.log('=== ESTRUCTURA DE DATOS ACTUAL ===');
    console.log('Áreas:', DataManager.getAreas());
    
    DataManager.getAreas().forEach(area => {
        console.log(`Centros en ${area.name}:`, DataManager.getWorkCenters(area.id));
    });
    
    console.log('Datos exportados:', DataManager.exportAllData());
}

function cleanupAllData() {
    if (confirm('¿Limpiar datos inconsistentes? Esto eliminará centros y evaluaciones huérfanas.')) {
        if (window.DataManager && typeof DataManager.cleanupInconsistentData === 'function') {
            DataManager.cleanupInconsistentData();
        }
        if (window.areaManager) {
            window.areaManager.areas = DataManager.getAreas();
            window.areaManager.renderAreas();
        }
        alert('✅ Limpieza completada');
    }
}

function resetAllData() {
    if (confirm('⚠️ ¿ELIMINAR TODOS LOS DATOS? Esta acción no se puede deshacer.')) {
        if (confirm('🚨 CONFIRMACIÓN FINAL: Se eliminarán TODAS las áreas, centros y evaluaciones.')) {
            localStorage.clear();
            location.reload();
        }
    }
}