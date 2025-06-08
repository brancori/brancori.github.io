// ===== GESTOR DE DATOS MODULAR =====

import { MESSAGES } from './constants.js';

export class DataManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.isConnected = false;
    }

    // ==========================================
    // INICIALIZACIÓN Y CONEXIÓN
    // ==========================================

    async init() {
        if (!this.supabase) {
            console.error('❌ Supabase client no está disponible');
            throw new Error('Supabase no está configurado');
        }
        
        try {
            // Test de conexión
            const { data, error } = await this.supabase
                .from('areas')
                .select('count')
                .limit(1);
            
            this.isConnected = true;
            console.log('✅ DataManager conectado correctamente a Supabase');
            return true;
        } catch (error) {
            console.error('❌ Error conectando DataManager:', error);
            throw error;
        }
    }

    // ==========================================
    // GESTIÓN DE ÁREAS
    // ==========================================

    async getAreas() {
        try {
            const { data, error } = await this.supabase
                .from('areas')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo áreas:', error);
            throw new Error(`${MESSAGES.ERROR.LOAD_FAILED}: ${error.message}`);
        }
    }

    async getAreaById(areaId) {
        try {
            const { data, error } = await this.supabase
                .from('areas')
                .select('*')
                .eq('id', areaId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo área por ID:', error);
            throw new Error(`${MESSAGES.ERROR.AREA_NOT_FOUND}: ${error.message}`);
        }
    }

    async createUniqueArea(name, manager, location = null) {
        try {
            const areaData = {
                id: this.generateAreaId(),
                name: name.trim(),
                manager: manager.trim(),
                location: location ? location.trim() : null,
                risk_percentage: null,
                evaluation_count: 0
            };

            const { data, error } = await this.supabase
                .from('areas')
                .insert([areaData])
                .select()
                .single();
            
            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error(`Ya existe un área con el nombre "${name}"`);
                }
                throw error;
            }
            
            console.log(`✅ Área creada: ${name} (${data.id})`);
            return data;
        } catch (error) {
            console.error('Error creando área:', error);
            throw error;
        }
    }

    async updateArea(areaId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('areas')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', areaId)
                .select()
                .single();
            
            if (error) throw error;
            
            console.log(`✅ Área actualizada: ${areaId}`);
            return data;
        } catch (error) {
            console.error('Error actualizando área:', error);
            throw error;
        }
    }

    async deleteArea(areaId) {
        try {
            const { error } = await this.supabase
                .from('areas')
                .delete()
                .eq('id', areaId);
            
            if (error) throw error;
            
            console.log(`✅ Área eliminada: ${areaId}`);
            return true;
        } catch (error) {
            console.error('Error eliminando área:', error);
            throw error;
        }
    }

    // ==========================================
    // GESTIÓN DE CENTROS DE TRABAJO
    // ==========================================

    async getWorkCenters(areaId) {
        try {
            const { data, error } = await this.supabase
                .from('work_centers')
                .select('*')
                .eq('area_id', areaId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo centros de trabajo:', error);
            throw error;
        }
    }

    async getWorkCenterById(workCenterId) {
        try {
            const { data, error } = await this.supabase
                .from('work_centers')
                .select('*')
                .eq('id', workCenterId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo centro de trabajo:', error);
            throw error;
        }
    }

    async createUniqueWorkCenter(areaId, name, description = null) {
        try {
            // Verificar que el área existe
            const area = await this.getAreaById(areaId);
            if (!area) {
                throw new Error(`Área ${areaId} no encontrada`);
            }
            
            const workCenterData = {
                id: this.generateWorkCenterId(name),
                name: name.trim(),
                area_id: areaId,
                description: description ? description.trim() : null,
                current_risk_percentage: null,
                evaluation_count: 0
            };

            const { data, error } = await this.supabase
                .from('work_centers')
                .insert([workCenterData])
                .select()
                .single();
            
            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error(`Ya existe un centro "${name}" en esta área`);
                }
                throw error;
            }
            
            console.log(`✅ Centro de trabajo creado: ${name} (${data.id})`);
            return data;
        } catch (error) {
            console.error('Error creando centro de trabajo:', error);
            throw error;
        }
    }

    async updateWorkCenter(workCenterId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('work_centers')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', workCenterId)
                .select()
                .single();
            
            if (error) throw error;
            
            console.log(`✅ Centro de trabajo actualizado: ${workCenterId}`);
            return data;
        } catch (error) {
            console.error('Error actualizando centro de trabajo:', error);
            throw error;
        }
    }

    async deleteWorkCenter(areaId, workCenterId) {
        try {
            const { error } = await this.supabase
                .from('work_centers')
                .delete()
                .eq('id', workCenterId)
                .eq('area_id', areaId);
            
            if (error) throw error;
            
            console.log(`✅ Centro de trabajo eliminado: ${workCenterId}`);
            return true;
        } catch (error) {
            console.error('Error eliminando centro de trabajo:', error);
            throw error;
        }
    }

    // ==========================================
    // GESTIÓN DE EVALUACIONES
    // ==========================================

    async createEvaluation(evaluationData) {
        try {
            const evaluation = {
                id: evaluationData.id || this.generateEvaluationId(),
                work_center_id: evaluationData.work_center_id,
                area_id: evaluationData.area_id,
                evaluator_name: evaluationData.responsableArea || evaluationData.evaluator_name,
                evaluation_date: evaluationData.fechaEvaluacion || new Date().toISOString().split('T')[0],
                score: parseFloat(evaluationData.score),
                risk_category: evaluationData.categoria?.texto || this.getRiskCategory(parseFloat(evaluationData.score)),
                general_notes: evaluationData.general_notes || null,
                sections_completed: evaluationData.checkboxes || {},
                responses: evaluationData.respuestas || {},
                recommended_methods: evaluationData.recommended_methods || null,
                is_current: true
            };
            
            const { data, error } = await this.supabase
                .from('evaluations')
                .insert([evaluation])
                .select()
                .single();
            
            if (error) throw error;
            
            // Actualizar estadísticas
            await this.updateWorkCenterStats(evaluation.work_center_id);
            await this.updateAreaStats(evaluation.area_id);
            
            console.log(`✅ Evaluación creada: ${evaluation.id}`);
            return data;
        } catch (error) {
            console.error('Error creando evaluación:', error);
            throw error;
        }
    }

    async getCurrentEvaluation(workCenterId) {
        try {
            const { data, error } = await this.supabase
                .from('evaluations')
                .select('*')
                .eq('work_center_id', workCenterId)
                .eq('is_current', true)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
            return data;
        } catch (error) {
            console.error('Error obteniendo evaluación actual:', error);
            return null;
        }
    }

    async getEvaluationHistory(workCenterId) {
        try {
            const { data, error } = await this.supabase
                .from('evaluations')
                .select('*')
                .eq('work_center_id', workCenterId)
                .order('evaluation_date', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo historial de evaluaciones:', error);
            throw error;
        }
    }

    async deleteEvaluation(evaluationId) {
        try {
            const { error } = await this.supabase
                .from('evaluations')
                .delete()
                .eq('id', evaluationId);
            
            if (error) throw error;
            
            console.log(`✅ Evaluación eliminada: ${evaluationId}`);
            return true;
        } catch (error) {
            console.error('Error eliminando evaluación:', error);
            throw error;
        }
    }

    // ==========================================
    // GESTIÓN DE MÉTODOS RECOMENDADOS
    // ==========================================

    async saveRecommendedMethods(evaluationId, methods) {
        try {
            // Eliminar métodos anteriores
            await this.supabase
                .from('recommended_methods')
                .delete()
                .eq('evaluation_id', evaluationId);
            
            if (methods && methods.length > 0) {
                const methodsData = methods.map(method => ({
                    evaluation_id: evaluationId,
                    method_name: method.name,
                    priority: method.priority,
                    critical_findings_count: method.critical_count || 0,
                    justification: method.justification,
                    questions: method.questions || []
                }));

                const { data, error } = await this.supabase
                    .from('recommended_methods')
                    .insert(methodsData)
                    .select();
                
                if (error) throw error;
                console.log(`✅ ${methods.length} métodos recomendados guardados`);
                return data;
            }
            
            return [];
        } catch (error) {
            console.error('Error guardando métodos recomendados:', error);
            throw error;
        }
    }

    async getRecommendedMethods(evaluationId) {
        try {
            const { data, error } = await this.supabase
                .from('recommended_methods')
                .select('*')
                .eq('evaluation_id', evaluationId)
                .order('priority', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo métodos recomendados:', error);
            throw error;
        }
    }

    // ==========================================
    // ACTUALIZACIÓN DE ESTADÍSTICAS
    // ==========================================

    async updateWorkCenterStats(workCenterId) {
        try {
            const currentEval = await this.getCurrentEvaluation(workCenterId);
            
            if (currentEval) {
                const { count } = await this.supabase
                    .from('evaluations')
                    .select('*', { count: 'exact', head: true })
                    .eq('work_center_id', workCenterId);
                
                await this.updateWorkCenter(workCenterId, {
                    current_risk_percentage: currentEval.score,
                    evaluation_count: count || 0
                });
                
                console.log(`✅ Estadísticas del centro actualizadas: ${workCenterId}`);
            }
        } catch (error) {
            console.error('Error actualizando estadísticas del centro:', error);
        }
    }

    async updateAreaStats(areaId) {
        try {
            const { data: workCenters, error } = await this.supabase
                .from('work_centers')
                .select('current_risk_percentage, evaluation_count')
                .eq('area_id', areaId)
                .not('current_risk_percentage', 'is', null);
            
            if (error) throw error;
            
            if (workCenters.length === 0) return;
            
            const avgRisk = workCenters.reduce((sum, wc) => sum + wc.current_risk_percentage, 0) / workCenters.length;
            const totalEvaluations = workCenters.reduce((sum, wc) => sum + wc.evaluation_count, 0);
            
            await this.updateArea(areaId, {
                risk_percentage: parseFloat(avgRisk.toFixed(1)),
                evaluation_count: totalEvaluations,
                last_evaluation: new Date().toISOString()
            });
            
            console.log(`✅ Estadísticas del área actualizadas: ${areaId}`);
        } catch (error) {
            console.error('Error actualizando estadísticas del área:', error);
        }
    }

    // ==========================================
    // EXPORTACIÓN DE DATOS
    // ==========================================

    async exportAllData() {
        try {
            const areas = await this.getAreas();
            const allData = {
                areas: areas,
                workCenters: {},
                evaluations: {},
                recommendedMethods: {},
                exportDate: new Date().toISOString(),
                version: '2.0'
            };
            
            for (const area of areas) {
                allData.workCenters[area.id] = await this.getWorkCenters(area.id);
                
                for (const workCenter of allData.workCenters[area.id]) {
                    allData.evaluations[workCenter.id] = await this.getEvaluationHistory(workCenter.id);
                    
                    for (const evaluation of allData.evaluations[workCenter.id]) {
                        allData.recommendedMethods[evaluation.id] = await this.getRecommendedMethods(evaluation.id);
                    }
                }
            }
            
            return allData;
        } catch (error) {
            console.error('Error exportando datos:', error);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================

    generateAreaId() {
        return 'area_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateWorkCenterId(name) {
        const prefix = name.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X');
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        
        return `${prefix}${timestamp}${random}`;
    }

    generateEvaluationId() {
        return 'eval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getRiskCategory(score) {
        if (score <= 25) return "Riesgo Bajo - Condiciones ergonómicas aceptables";
        if (score <= 50) return "Riesgo Moderado - Se requieren mejoras";
        if (score <= 75) return "Riesgo Alto - Intervención necesaria";
        return "Riesgo Crítico - Intervención urgente";
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    isOnline() {
        return this.isConnected && navigator.onLine;
    }

    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('areas')
                .select('count')
                .limit(1);
            
            this.isConnected = !error;
            return !error;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }
}

// Crear y exportar instancia global
let dataManagerInstance = null;

export async function initializeDataManager(supabaseClient) {
    if (!dataManagerInstance) {
        dataManagerInstance = new DataManager(supabaseClient);
        await dataManagerInstance.init();
        
        // Hacer disponible globalmente para compatibilidad
        window.DataManager = dataManagerInstance;
    }
    
    return dataManagerInstance;
}

export function getDataManager() {
    return dataManagerInstance;
}

export default DataManager;