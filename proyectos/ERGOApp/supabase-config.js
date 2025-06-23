// supabase-config.js
const CorsHeaders ={
    'Access-Control-Allow-Origin': 'https://brancori.github.io',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};
const SUPABASE_URL = window.ERGOConfig.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.ERGOConfig.SUPABASE_ANON_KEY;

// Cliente básico de Supabase
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`
        };
    }

async query(table, method = 'GET', data = null, filters = '') {
    const url = `${this.url}/rest/v1/${table}${filters}`;
    
    const options = {
        method: method,
        headers: this.headers
    };
    
    if (data && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
        console.log('🔍 Datos enviados a Supabase:', JSON.stringify(data, null, 2));
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('❌ Error response body:', errorBody);
            throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
        }
        
        // Para métodos que no devuelven datos
        if (method === 'POST' || method === 'PATCH' || method === 'DELETE') {
            return { success: true };
        }
        
        // Solo para GET, intentar parsear JSON
        const text = await response.text();
        if (!text) {
            return null;
        }
        
        return JSON.parse(text);
    } catch (error) {
        console.error('Supabase query error:', error);
        throw error;
    }
}

    // Métodos específicos para cada tabla
    async getAreas() {
        return await this.query('areas');
    }
    async getAllEvaluations() {
        // Usa el método genérico query para mayor consistencia
        // CORRECCIÓN: Pedimos todos los campos necesarios para el script
        return await this.query('evaluaciones', 'GET', null, '?select=id,area_id,respuestas,riesgos_por_categoria');
    }

    /**
     * Obtiene TODAS las áreas (solo los campos necesarios para el script).
     * @returns {Promise<Array|null>}
     */
    async getAllAreas() {
        return await this.query('areas', 'GET', null, '?select=id,name');
    }

    /**
     * Obtiene TODAS las evaluaciones para un área específica.
     * @param {string} areaId - El ID del área.
     * @returns {Promise<Array|null>} Un array con todas las evaluaciones del área.
     */
    async getEvaluacionesPorArea(areaId) {
        return await this.query('evaluaciones', 'GET', null, `?select=riesgos_por_categoria&area_id=eq.${areaId}`);
    }
    
    // AGREGAR estas 2 funciones después de getAreas():

    async getArea(areaId) {
        try {
            if (!areaId) {
                console.log('❌ areaId requerido para getArea');
                return null;
            }
            
            const result = await this.query('areas', 'GET', null, `?id=eq.${areaId}`);
            console.log('📊 Área específica consultada:', areaId, 'Resultado:', result);
            return result && result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('❌ Error obteniendo área específica:', error);
            return null;
        }
    }

    async getWorkCenter(workCenterId) {
        try {
            if (!workCenterId) {
                console.log('❌ workCenterId requerido para getWorkCenter');
                return null;
            }
            
            const result = await this.query('work_centers', 'GET', null, `?id=eq.${workCenterId}`);
            console.log('📊 Work center específico consultado:', workCenterId, 'Resultado:', result);
            return result && result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('❌ Error obteniendo work center específico:', error);
            return null;
        }
    }

    async createArea(area) {
        // Añadimos las fechas de creación y actualización automáticamente
        const dataToInsert = {
            ...area,
            created_at: new Date().toISOString(),
            ultima_actualizacion: new Date().toISOString()
        };
        return await this.query('areas', 'POST', dataToInsert);
    }

    async deleteArea(id) {
        return await this.query('areas', 'DELETE', null, `?id=eq.${id}`);
    }
    async updateArea(id, data) {
        return await this.query('areas', 'PATCH', data, `?id=eq.${id}`);
    }

    async updateWorkCenter(id, data) {
        return await this.query('work_centers', 'PATCH', data, `?id=eq.${id}`);
    }

    async deleteEvaluacion(id) {
        return await this.query('evaluaciones', 'DELETE', null, `?id=eq.${id}`);
}
    async getWorkCenters(areaId = null) {
        const filter = areaId ? `?area_id=eq.${areaId}` : '';
        return await this.query('work_centers', 'GET', null, filter);
    }

    async createWorkCenter(workCenter) {
        return await this.query('work_centers', 'POST', workCenter);
    }

async deleteWorkCenter(id) {
    try {
        console.log(`🗑️ Eliminando centro: ${id}`);
        
        // SOLO eliminar las tablas donde SÍ tienes permisos confirmados
        try {
            await this.query('scores_resumen', 'DELETE', null, `?work_center_id=eq.${id}`);
            console.log(`✅ Scores eliminados`);
        } catch (error) {
            console.log(`ℹ️ Sin scores para eliminar`);
        }
        
        try {
            await this.query('evaluaciones', 'DELETE', null, `?work_center_id=eq.${id}`);
            console.log(`✅ Evaluaciones eliminadas`);
        } catch (error) {
            console.log(`ℹ️ Sin evaluaciones para eliminar`);
        }
        
        try {
            await this.query('fotos_centros', 'DELETE', null, `?work_center_id=eq.${id}`);
            console.log(`✅ Fotos eliminadas`);
        } catch (error) {
            console.log(`ℹ️ Sin fotos para eliminar`);
        }
        
        // NO intentar eliminar las tablas problemáticas
        
        // Eliminar el centro de trabajo
        const result = await this.query('work_centers', 'DELETE', null, `?id=eq.${id}`);
        console.log(`✅ Centro eliminado: ${id}`);
        
        return result;
    } catch (error) {
        console.error(`❌ Error eliminando centro ${id}:`, error);
        throw error;
    }
}

    async getEvaluaciones(workCenterId = null) {
        if (workCenterId) {
            // Buscar por work_center_id específico
            const filter = `?work_center_id=eq.${workCenterId}`;
            console.log('📡 Consultando Supabase con filtro:', filter);
            const result = await this.query('evaluaciones', 'GET', null, filter);
            console.log('📡 Respuesta Supabase:', result);
            return result;
        } else {
            // Sin filtro, devolver todas
            return await this.query('evaluaciones', 'GET', null, '');
        }
    }

    async createEvaluacion(evaluacion) {
        return await this.query('evaluaciones', 'POST', evaluacion);
    }

    async updateEvaluacion(id, evaluacion) {
        return await this.query('evaluaciones', 'PATCH', evaluacion, `?id=eq.${id}`);
    }
    // Agregar al final de la clase SupabaseClient, antes del cierre de la clase

async uploadFoto(file, areaId, workCenterId) {
    try {
        // Crear nombre único para el archivo
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${areaId}/${workCenterId}/${timestamp}.${fileExtension}`;
        
        // Subir archivo al storage (necesitas verificar si tienes un bucket creado)
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadUrl = `${this.url}/storage/v1/object/fotos-centros/${fileName}`;
        
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.key}`
            },
            body: formData
        });
        
        if (!uploadResponse.ok) {
            throw new Error(`Error uploading file: ${uploadResponse.status}`);
        }
        
        // Guardar referencia en la tabla fotos_centros
        const fotoData = {
            area_id: areaId,
            work_center_id: workCenterId,
            foto_url: fileName,
            foto_name: file.name,
            created_at: new Date().toISOString()
        };
        
        await this.query('fotos_centros', 'POST', fotoData);
        
        return { success: true, fileName: fileName };
    } catch (error) {
        console.error('Error uploading foto:', error);
        throw error;
    }
}

async getFotos(workCenterId) {
    return await this.query('fotos_centros', 'GET', null, `?work_center_id=eq.${workCenterId}`);
}

async deleteFoto(fotoId) {
    // Primero obtener la info de la foto para eliminar el archivo
    const foto = await this.query('fotos_centros', 'GET', null, `?id=eq.${fotoId}`);
    
    if (foto && foto.length > 0) {
        // Eliminar archivo del storage
        const deleteUrl = `${this.url}/storage/v1/object/fotos-centros/${foto[0].foto_url}`;
        
        await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.key}`
            }
        });
        
        // Eliminar registro de la tabla
        return await this.query('fotos_centros', 'DELETE', null, `?id=eq.${fotoId}`);
    }
}
// === NOTAS ===
async getNotas(workCenterId) {
    return await this.query('notas_centros', 'GET', null, `?work_center_id=eq.${workCenterId}&order=created_at.desc`);
}

async createNota(nota) {
    return await this.query('notas_centros', 'POST', nota);
}

async deleteNota(notaId) {
    return await this.query('notas_centros', 'DELETE', null, `?id=eq.${notaId}`);
}

// === EVALUACIONES REBA ===
async getEvaluacionesReba(workCenterId) {
    return await this.query('evaluaciones_reba', 'GET', null, `?work_center_id=eq.${workCenterId}&order=created_at.desc`);
}

async createEvaluacionReba(evaluacion) {
    return await this.query('evaluaciones_reba', 'POST', evaluacion);
}

async updateEvaluacionReba(id, evaluacion) {
    evaluacion.updated_at = new Date().toISOString();
    return await this.query('evaluaciones_reba', 'PATCH', evaluacion, `?id=eq.${id}`);
}

async deleteEvaluacionReba(evalId) {
    return await this.query('evaluaciones_reba', 'DELETE', null, `?id=eq.${evalId}`);
}

// === EVALUACIONES RULA ===
async getEvaluacionesRula(workCenterId) {
    return await this.query('evaluaciones_rula', 'GET', null, `?work_center_id=eq.${workCenterId}&order=created_at.desc`);
}

async createEvaluacionRula(evaluacion) {
    return await this.query('evaluaciones_rula', 'POST', evaluacion);
}

async updateEvaluacionRula(id, evaluacion) {
    evaluacion.updated_at = new Date().toISOString();
    return await this.query('evaluaciones_rula', 'PATCH', evaluacion, `?id=eq.${id}`);
}

async deleteEvaluacionRula(evalId) {
    return await this.query('evaluaciones_rula', 'DELETE', null, `?id=eq.${evalId}`);
}

// === EVALUACIONES OCRA ===
async getEvaluacionesOcra(workCenterId) {
    return await this.query('evaluaciones_ocra', 'GET', null, `?work_center_id=eq.${workCenterId}&order=created_at.desc`);
}

async createEvaluacionOcra(evaluacion) {
    return await this.query('evaluaciones_ocra', 'POST', evaluacion);
}

async updateEvaluacionOcra(id, evaluacion) {
    evaluacion.updated_at = new Date().toISOString();
    return await this.query('evaluaciones_ocra', 'PATCH', evaluacion, `?id=eq.${id}`);
}

async deleteEvaluacionOcra(evalId) {
    return await this.query('evaluaciones_ocra', 'DELETE', null, `?id=eq.${evalId}`);
}

// === EVALUACIONES NIOSH ===
async getEvaluacionesNiosh(workCenterId) {
    return await this.query('evaluaciones_niosh', 'GET', null, `?work_center_id=eq.${workCenterId}&order=created_at.desc`);
}

async createEvaluacionNiosh(evaluacion) {
    return await this.query('evaluaciones_niosh', 'POST', evaluacion);
}

async updateEvaluacionNiosh(id, evaluacion) {
    evaluacion.updated_at = new Date().toISOString();
    return await this.query('evaluaciones_niosh', 'PATCH', evaluacion, `?id=eq.${id}`);
}

async deleteEvaluacionNiosh(evalId) {
    return await this.query('evaluaciones_niosh', 'DELETE', null, `?id=eq.${evalId}`);
}

// === FUNCIÓN COMBINADA PARA TODAS LAS EVALUACIONES ESPECÍFICAS ===
async getAllEvaluacionesEspecificas(workCenterId) {
    try {
        const [reba, rula, ocra, niosh] = await Promise.all([
            this.getEvaluacionesReba(workCenterId),
            this.getEvaluacionesRula(workCenterId),
            this.getEvaluacionesOcra(workCenterId),
            this.getEvaluacionesNiosh(workCenterId)
        ]);

        // Combinar y etiquetar por tipo
        const evaluaciones = [];
        
        if (reba) reba.forEach(e => evaluaciones.push({...e, tipo: 'REBA'}));
        if (rula) rula.forEach(e => evaluaciones.push({...e, tipo: 'RULA'}));
        if (ocra) ocra.forEach(e => evaluaciones.push({...e, tipo: 'OCRA'}));
        if (niosh) niosh.forEach(e => evaluaciones.push({...e, tipo: 'NIOSH'}));

        // Ordenar por fecha de creación
        return evaluaciones.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
        console.error('Error getting all evaluaciones específicas:', error);
        return [];
    }
}
// === SCORES OPTIMIZADOS ===

// Obtener scores de todos los centros de un área (1 sola consulta)
async getScoresArea(areaId) {
    return await this.query('scores_resumen', 'GET', null, `?area_id=eq.${areaId}&order=updated_at.desc`);
}

// Obtener score específico de un centro
async getScoreWorkCenter(workCenterId) {
    const result = await this.query('scores_resumen', 'GET', null, `?work_center_id=eq.${workCenterId}`);
    return result && result.length > 0 ? result[0] : null;
}

// Obtener resumen de todas las áreas (1 sola consulta)
async getAllAreasSummary() {
    return await this.query('area_scores_summary', 'GET', null, '');
}

// Actualizar o crear score de un centro
async updateScoreWorkCenter(workCenterId, areaId, scoreData) {
    const existingScore = await this.getScoreWorkCenter(workCenterId);
    
    const scoreResumen = {
        work_center_id: workCenterId,
        area_id: areaId,
        score_actual: scoreData.score,
        categoria_riesgo: scoreData.categoria,
        color_riesgo: scoreData.color,
        fecha_ultima_evaluacion: new Date().toISOString(),
        total_evaluaciones: (existingScore?.total_evaluaciones || 0) + 1,
        updated_at: new Date().toISOString()
    };

    if (existingScore) {
        // Actualizar existente
        await this.query('scores_resumen', 'PATCH', scoreResumen, `?work_center_id=eq.${workCenterId}`);
    } else {
        // Crear nuevo
        await this.query('scores_resumen', 'POST', scoreResumen);
    }
    
    return scoreResumen;
}

// Función híbrida para obtener todo lo necesario en una sola llamada
async getAreaCompleteData(areaId) {
    try {
        const [workCenters, scores] = await Promise.all([
            this.getWorkCenters(areaId),
            this.getScoresArea(areaId)
        ]);

        // Combinar datos
        const centrosConScores = workCenters.map(center => {
            const score = scores.find(s => s.work_center_id === center.id);
            return {
                ...center,
                score_info: score || {
                    score_actual: 0,
                    categoria_riesgo: 'Sin evaluación',
                    color_riesgo: '#d1d5db'
                }
            };
        });

        return centrosConScores;
    } catch (error) {
        console.error('Error getting area complete data:', error);
        return [];
    }
}
// Función para migrar datos existentes a scores_resumen
async migrarDatosAScoresResumen() {
    try {
        console.log('🔄 Iniciando migración de scores...');
        
        // Obtener todas las evaluaciones del localStorage
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones') || '[]');
        console.log('📊 Evaluaciones encontradas:', evaluaciones.length);
        
        for (const evaluacion of evaluaciones) {
            if (evaluacion.workCenterId && evaluacion.scoreFinal) {
                // Buscar el área del centro de trabajo
                const workCenters = JSON.parse(localStorage.getItem('workCenters') || '[]');
                const workCenter = workCenters.find(wc => wc.id === evaluacion.workCenterId);
                
                if (workCenter) {
                    const scoreData = {
                        work_center_id: evaluacion.workCenterId,
                        area_id: evaluacion.areaId || workCenter.areaId || workCenter.area_id,
                        score_actual: parseFloat(evaluacion.scoreFinal),
                        categoria_riesgo: evaluacion.categoriaRiesgo || 'Evaluado',
                        color_riesgo: this.calcularColorRiesgo(parseFloat(evaluacion.scoreFinal)),
                        fecha_ultima_evaluacion: evaluacion.fechaEvaluacion || evaluacion.created_at || new Date().toISOString(),
                        total_evaluaciones: 1
                    };
                    
                    console.log('💾 Guardando score:', scoreData);
                    
                    // Usar upsert (insertar o actualizar)
                    await this.query('scores_resumen', 'POST', scoreData);
                }
            }
        }
        
        console.log('✅ Migración completada');
        return true;
    } catch (error) {
        console.error('❌ Error en migración:', error);
        return false;
    }
}

// Función auxiliar para calcular color
calcularColorRiesgo(score) {
    if (score <= 25) return '#28a745';
    else if (score <= 60) return '#fd7e14';
    else return '#dc3545';
}
// Función para actualizar score en scores_resumen
async actualizarScoreResumen(workCenterId, areaId, scoreData) {
    try {
        const scoreResumen = {
            work_center_id: workCenterId,
            area_id: areaId,
            score_actual: parseFloat(scoreData.score),
            categoria_riesgo: scoreData.categoria,
            color_riesgo: scoreData.color,
            fecha_ultima_evaluacion: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Verificar si ya existe
        const existing = await this.query('scores_resumen', 'GET', null, `?work_center_id=eq.${workCenterId}`);
        
        if (existing && existing.length > 0) {
            // Actualizar existente
            scoreResumen.total_evaluaciones = (existing[0].total_evaluaciones || 0) + 1;
            await this.query('scores_resumen', 'PATCH', scoreResumen, `?work_center_id=eq.${workCenterId}`);
        } else {
            // Crear nuevo
            scoreResumen.total_evaluaciones = 1;
            await this.query('scores_resumen', 'POST', scoreResumen);
        }
        
        return true;
    } catch (error) {
        console.error('Error actualizando score resumen:', error);
        throw error;
    }
}
// === AUTENTICACIÓN DE USUARIOS ===
async loginUser(usuario, password) {
    try {
        // Método con encoding para caracteres especiales
        const result = await this.query('usuarios', 'GET', null, `?usuario=eq.${encodeURIComponent(usuario)}&password=eq.${encodeURIComponent(password)}`);
        return result && result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('Error en login:', error);
        return null;
    }
}

async getUsuario(id) {
    try {
        const result = await this.query('usuarios', 'GET', null, `?id=eq.${id}`);
        return result && result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
    }
}

async getDashboardData() {
    try {
        // Obtenemos todos los datos necesarios en paralelo
        const [scoresData, areasData, workCentersData, evaluacionesData] = await Promise.all([
            this.query('scores_resumen', 'GET', null, '?order=score_actual.desc'),
            this.query('areas', 'GET', null, '?select=*,resumen_pictogramas'),
            this.query('work_centers', 'GET', null, ''),
            this.query('evaluaciones', 'GET', null, '')
        ]);

        if (!areasData) return { areas: [], topRisk: [], totalWorkCenters: 0, totalEvaluaciones: 0 };

        // Crear mapas para acceso rápido
        const areasMap = {};
        areasData.forEach(area => {
            areasMap[area.id] = area.name;
        });

        const workCentersMap = {};
        if (workCentersData) {
            workCentersData.forEach(center => {
                workCentersMap[center.id] = center.name;
            });
        }

        // --- INICIO DE LA LÓGICA DE CÁLCULO MEJORADA ---
        const areasCombinadas = areasData.map(area => {
            // Filtrar los scores y centros que pertenecen a esta área
            const scoresDeArea = scoresData ? scoresData.filter(s => s.area_id === area.id) : [];
            const centrosDeArea = workCentersData ? workCentersData.filter(wc => wc.area_id === area.id) : [];

            // Calcular el promedio del score para esta área
            const totalScore = scoresDeArea.reduce((sum, s) => sum + parseFloat(s.score_actual), 0);
            const promedio = scoresDeArea.length > 0 ? (totalScore / scoresDeArea.length) : 0;

            // Devolver un objeto de área con los totales CORRECTOS calculados ahora mismo
            return {
                ...area, // Mantiene datos originales como el resumen de pictogramas
                promedio_score: promedio.toFixed(2),
                promedio_calculo: promedio,
                total_centros: centrosDeArea.length,
                centros_evaluados: scoresDeArea.length
            };
        }).sort((a, b) => b.promedio_calculo - a.promedio_calculo);
        // --- FIN DE LA LÓGICA DE CÁLCULO MEJORADA ---

        // Top 10 centros con más riesgo (esto ya estaba bien)
        const topRisk = scoresData ? scoresData.slice(0, 10).map(score => ({
            area_name: areasMap[score.area_id] || 'Sin área',
            center_name: workCentersMap[score.work_center_id] || `Centro ${score.work_center_id}`,
            score: parseFloat(score.score_actual).toFixed(2),
            categoria: score.categoria_riesgo
        })) : [];

        return {
            areas: areasCombinadas,
            topRisk,
            totalWorkCenters: workCentersData ? workCentersData.length : 0,
            totalEvaluaciones: evaluacionesData ? evaluacionesData.length : 0
        };
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        return { areas: [], topRisk: [], totalWorkCenters: 0, totalEvaluaciones: 0 };
    }
}

    async getAllAreasConResumen() {
        return await this.query('areas', 'GET', null, '?select=name,resumen_pictogramas');
    }

}

// Instancia global
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

//================================================================
// MÓDULO DE ANALÍTICAS Y DECISIONES DE RIESGO (VERSIÓN FINAL)
//================================================================
window.ERGOAnalytics = {
    // Catálogo de pictogramas con sus preguntas asociadas para un análisis robusto
    pictogramasConfig: {
        R01: { 
            nombre: 'Carga Manual', 
            preguntas_asociadas: [
                "¿Se utilizan ayudas mecánicas (grúas, elevadores de columna, poleas) para el movimiento de materiales pesados?",
                "¿Los materiales se dividen en cargas menores (<25 kg según ISO 11228-1) para facilitar su manipulación segura?",
                "¿Los contenedores tienen asas ergonómicas, puntos de agarre visibles y permiten un agarre firme sin rotación de muñeca?",
                "¿Los trabajadores mantienen las cargas pegadas al cuerpo y por debajo del nivel de los hombros durante el transporte manual?",
                "¿El levantamiento y depósito de materiales se realiza con movimientos controlados, en el plano frontal del cuerpo y sin rotación?"
            ]
        },
        R02: { 
            nombre: 'Posturas Forzadas', 
            preguntas_asociadas: [
                "¿Las tareas de manipulación evitan posiciones forzadas como inclinaciones o torsiones de tronco?",
                "¿La altura del área de trabajo es ajustable o adecuada a la estatura del operador (nivel de codo o ligeramente por debajo)?",
                "¿Se permite alternar entre estar de pie y sentado, dependiendo del tipo de tarea?",
                "¿Las estaciones de trabajo permiten una postura estable y ergonómica para usar herramientas con seguridad?",
                "¿Las sillas para trabajos sentados son ajustables y tienen respaldo ergonómico?"
            ] 
        },
        R03: { 
            nombre: 'Movimientos Repetitivos', 
            preguntas_asociadas: [
                "¿Las tareas manuales repetitivas se realizan durante más de 2 horas continuas sin variación?",
                "¿Se realiza rotación de tareas entre actividades con diferente exigencia física dentro del turno?",
                "¿Se emplean herramientas suspendidas en líneas de producción donde se realizan operaciones repetidas?",
                "¿Las tareas de manipulación pesada se alternan con tareas más ligeras para evitar fatiga acumulativa?"
            ]
        },
        R04: { 
            nombre: 'Empuje o Tracción', 
            preguntas_asociadas: [
                "¿Las tareas de alimentación y retiro de materiales se hacen horizontalmente mediante empuje o tracción, no mediante levantamiento?",
                "¿Se utilizan carritos de acero inoxidable u otro material autorizado con ruedas de baja fricción para mover materiales?",
                "¿Las superficies de rodamiento son planas, antideslizantes, sin pendientes bruscas ni desniveles?"
            ] 
        },
        R05: { 
            nombre: 'Circulación y Rampas', 
            preguntas_asociadas: [
                "¿Se cuenta con rampas de inclinación máxima del 8% en lugar de escalones o desniveles en zonas de tránsito de materiales?",
                "¿Los pasillos tienen ancho suficiente para permitir el tránsito simultáneo de carritos o racks bidireccionales?",
                "¿Las rutas internas de transporte están claramente señalizadas, libres de obstáculos y cumplen con protocolos de limpieza?"
            ] 
        },
        R06: { 
            nombre: 'Alcance y Herramientas', 
            preguntas_asociadas: [
                "¿Herramientas, materiales y controles de uso frecuente están ubicados dentro de la zona de alcance cómodo?",
                "¿Los mangos de las herramientas tienen forma, diámetro y longitud adecuados al tamaño de la mano promedio del operador?",
                "¿Las herramientas de precisión ofrecen soporte ergonómico para la muñeca o el dorso de la mano?",
                "¿Hay estanterías ajustables en altura y cercanas a las estaciones de trabajo para reducir desplazamientos manuales?"
            ] 
        },
        R07: {
            nombre: 'Entorno Visual y Pantallas',
            preguntas_asociadas: [
                "¿Los puestos con pantallas permiten ajustes por parte del operador?",
                "¿Se han eliminado reflejos molestos o superficies brillantes que obliguen al trabajador a modificar su postura visual?",
                "¿Las fuentes de luz están apantalladas o reubicadas para evitar deslumbramientos?",
                "¿Cada trabajador dispone de iluminación suficiente para operar de forma segura y eficiente?",
                "¿Se permiten pausas cortas frecuentes en trabajos prolongados frente a pantalla?"
            ]
        }
    },

    analizarRiesgosPorPictograma: function(respuestas, dataPreguntas) {
        const resultados = {};
        const mapaPreguntas = this.mapearPreguntas(dataPreguntas);

        for (const [id, config] of Object.entries(this.pictogramasConfig)) {
            let pesoTotal = 0;
            let pesoRiesgo = 0;

            config.preguntas_asociadas.forEach(textoPregunta => {
                const preguntaInfo = mapaPreguntas[textoPregunta];
                if (preguntaInfo) {
                    const respuesta = respuestas[preguntaInfo.nombreRespuesta];
                    if (respuesta === 'si' || respuesta === 'no') {
                        pesoTotal += preguntaInfo.peso;
                        if (respuesta === 'no') {
                            pesoRiesgo += preguntaInfo.peso;
                        }
                    }
                }
            });
            
            const score = (pesoTotal > 0) ? (pesoRiesgo / pesoTotal) * 100 : 0;
            
            resultados[id] = {
                score: parseFloat(score.toFixed(2)),
                color: this.getNivelRiesgoPictograma(score),
                activo: score > 0
            };
        }

        resultados.resumen = this.calcularSemaforoGlobal(resultados);
        return resultados;
    },
    
    getNivelRiesgoPictograma: function(score) {
        if (score >= 67) return 'rojo';
        if (score >= 34) return 'naranja';
        return 'verde';
    },

    calcularSemaforoGlobal: function(resultadosPictogramas) {
        let conteo = { rojo: 0, naranja: 0, verde: 0 };

        for (const id in this.pictogramasConfig) {
            const resultado = resultadosPictogramas[id];
            if (resultado.color === 'rojo') conteo.rojo++;
            else if (resultado.color === 'naranja') conteo.naranja++;
            else conteo.verde++;
        }

        if (conteo.rojo > 1) {
            conteo.naranja += conteo.rojo - 1;
            conteo.rojo = 1;
        }
        if (conteo.naranja > 1) {
            conteo.rojo += conteo.naranja - 1;
            conteo.naranja = 1;
        }
        if (conteo.rojo > 1) {
             conteo.naranja += conteo.rojo - 1;
             conteo.rojo = 1;
        }

        const totalPictogramas = Object.keys(this.pictogramasConfig).length;
        conteo.verde = totalPictogramas - conteo.rojo - conteo.naranja;

        return conteo;
    },

    mapearPreguntas: function(dataPreguntas) {
        if (this._mapaPreguntas) return this._mapaPreguntas;

        const mapa = {};
        const procesarCategoria = (preguntas, categoria) => {
            preguntas.forEach((p, index) => {
                mapa[p.pregunta] = { ...p, nombreRespuesta: `${categoria}-${index}` };
            });
        };

        procesarCategoria(dataPreguntas.generales, 'general');
        for (const categoria in dataPreguntas.condicionales) {
            procesarCategoria(dataPreguntas.condicionales[categoria], categoria);
        }

        this._mapaPreguntas = mapa;
        return mapa;
    }
};