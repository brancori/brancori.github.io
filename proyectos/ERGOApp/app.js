// ===== SISTEMA DE GESTIÓN DE DATOS - SOLO SUPABASE =====
// DataManager actualizado para la nueva estructura de BD
const DataManager = {
    
    // Inicializar Supabase
    async init() {
        if (!window.supabase) {
            console.error('❌ Supabase no está disponible');
            throw new Error('Supabase no está configurado');
        }
        
        try {
            // Test de conexión con la nueva estructura
            const { data, error } = await window.supabase.from('areas').select('count').limit(1);
            console.log('✅ Supabase conectado correctamente con nueva estructura');
            return true;
        } catch (error) {
            console.error('❌ Error conectando a Supabase:', error);
            throw error;
        }
    },
    
    // ==========================================
    // MÉTODOS PARA AREAS
    // ==========================================
    
    async getAreas() {
        try {
            const { data, error } = await window.supabase
                .from('areas')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo áreas:', error);
            throw error;
        }
    },
    
    async createUniqueArea(name, manager, location = null) {
        try {
            const { data, error } = await window.supabase
                .from('areas')
                .insert([{
                    id: 'area_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: name.trim(),
                    manager: manager.trim(),
                    location: location ? location.trim() : null,
                    risk_percentage: null,
                    evaluation_count: 0
                }])
                .select()
                .single();
            
            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error(`Ya existe un área con el nombre "${name}"`);
                }
                throw error;
            }
            
            console.log(`✅ Área creada: ${name}`);
            return data;
        } catch (error) {
            console.error('Error creando área:', error);
            throw error;
        }
    },
    
    async getAreaById(areaId) {
        try {
            const { data, error } = await window.supabase
                .from('areas')
                .select('*')
                .eq('id', areaId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo área:', error);
            throw error;
        }
    },
    
    async deleteArea(areaId) {
        try {
            const { error } = await window.supabase
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
    },
    
    // ==========================================
    // MÉTODOS PARA CENTROS DE TRABAJO
    // ==========================================
    
    async getWorkCenters(areaId) {
        try {
            const { data, error } = await window.supabase
                .from('work_centers')
                .select('*')
                .eq('area_id', areaId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo centros:', error);
            throw error;
        }
    },
    
    async createUniqueWorkCenter(areaId, name, description = null) {
        try {
            // Verificar que el área existe
            const { data: area } = await window.supabase
                .from('areas')
                .select('name')
                .eq('id', areaId)
                .single();
            
            if (!area) {
                throw new Error(`Área ${areaId} no encontrada`);
            }
            
            // Generar ID único
            const workCenterId = this.generateUniqueWorkCenterId(name);
            
            const { data, error } = await window.supabase
                .from('work_centers')
                .insert([{
                    id: workCenterId,
                    name: name.trim(),
                    area_id: areaId,
                    description: description ? description.trim() : null,
                    current_risk_percentage: null,
                    evaluation_count: 0
                }])
                .select()
                .single();
            
            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error(`Ya existe un centro "${name}" en esta área`);
                }
                throw error;
            }
            
            console.log(`✅ Centro creado: ${name}`);
            return data;
        } catch (error) {
            console.error('Error creando centro:', error);
            throw error;
        }
    },
    
    async getWorkCenterById(workCenterId) {
        try {
            const { data, error } = await window.supabase
                .from('work_centers')
                .select('*')
                .eq('id', workCenterId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo centro:', error);
            throw error;
        }
    },
    
    async deleteWorkCenter(areaId, workCenterId) {
        try {
            const { error } = await window.supabase
                .from('work_centers')
                .delete()
                .eq('id', workCenterId)
                .eq('area_id', areaId);
            
            if (error) throw error;
            
            console.log(`✅ Centro eliminado: ${workCenterId}`);
            return true;
        } catch (error) {
            console.error('Error eliminando centro:', error);
            throw error;
        }
    },
    
    // ==========================================
    // MÉTODOS PARA EVALUACIONES
    // ==========================================
    
    async createEvaluation(evaluationData) {
        try {
            // Preparar datos de evaluación con nueva estructura
            const evaluation = {
                id: evaluationData.id || 'eval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
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
                is_current: true // Nueva evaluación es actual por defecto
            };
            
            // Insertar evaluación
            const { data, error } = await window.supabase
                .from('evaluations')
                .insert([evaluation])
                .select()
                .single();
            
            if (error) throw error;
            
            // Actualizar centro de trabajo
            await this.updateWorkCenterStats(evaluation.work_center_id);
            
            // Actualizar estadísticas del área
            await this.updateAreaStats(evaluation.area_id);
            
            console.log(`✅ Evaluación creada: ${evaluation.id}`);
            return data;
        } catch (error) {
            console.error('Error creando evaluación:', error);
            throw error;
        }
    },
    
    async getCurrentEvaluation(workCenterId) {
        try {
            const { data, error } = await window.supabase
                .from('evaluations')
                .select('*')
                .eq('work_center_id', workCenterId)
                .eq('is_current', true)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
            return data;
        } catch (error) {
            console.error('Error obteniendo evaluación actual:', error);
            return null;
        }
    },
    
    async getEvaluationHistory(workCenterId) {
        try {
            const { data, error } = await window.supabase
                .from('evaluations')
                .select('*')
                .eq('work_center_id', workCenterId)
                .order('evaluation_date', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            throw error;
        }
    },
    
    // ==========================================
    // MÉTODOS PARA MÉTODOS RECOMENDADOS
    // ==========================================
    
    async saveRecommendedMethods(evaluationId, methods) {
        try {
            // Eliminar métodos anteriores si existen
            await window.supabase
                .from('recommended_methods')
                .delete()
                .eq('evaluation_id', evaluationId);
            
            // Insertar nuevos métodos
            if (methods && methods.length > 0) {
                const { data, error } = await window.supabase
                    .from('recommended_methods')
                    .insert(methods.map(method => ({
                        evaluation_id: evaluationId,
                        method_name: method.name,
                        priority: method.priority,
                        critical_findings_count: method.critical_count || 0,
                        justification: method.justification,
                        questions: method.questions || []
                    })))
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
    },
    
    async getRecommendedMethods(evaluationId) {
        try {
            const { data, error } = await window.supabase
                .from('recommended_methods')
                .select('*')
                .eq('evaluation_id', evaluationId)
                .order('priority', { ascending: true }); // OBLIGATORIO primero
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo métodos recomendados:', error);
            throw error;
        }
    },
    
    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================
    
    generateUniqueWorkCenterId(name) {
        const prefix = name.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X');
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        
        return `${prefix}${timestamp}${random}`;
    },
    
    getRiskCategory(score) {
        if (score <= 25) return "Riesgo Bajo - Condiciones ergonómicas aceptables";
        if (score <= 50) return "Riesgo Moderado - Se requieren mejoras";
        if (score <= 75) return "Riesgo Alto - Intervención necesaria";
        return "Riesgo Crítico - Intervención urgente";
    },
    
    async updateWorkCenterStats(workCenterId) {
        try {
            // Obtener evaluación actual
            const currentEval = await this.getCurrentEvaluation(workCenterId);
            
            if (currentEval) {
                // Contar total de evaluaciones
                const { count } = await window.supabase
                    .from('evaluations')
                    .select('*', { count: 'exact', head: true })
                    .eq('work_center_id', workCenterId);
                
                // Actualizar centro de trabajo
                const { error } = await window.supabase
                    .from('work_centers')
                    .update({
                        current_risk_percentage: currentEval.score,
                        evaluation_count: count || 0
                    })
                    .eq('id', workCenterId);
                
                if (error) throw error;
                console.log(`✅ Estadísticas del centro actualizadas: ${workCenterId}`);
            }
        } catch (error) {
            console.error('Error actualizando estadísticas del centro:', error);
        }
    },
    
    async updateAreaStats(areaId) {
        try {
            // Obtener todos los centros del área con evaluaciones actuales
            const { data: workCenters, error } = await window.supabase
                .from('work_centers')
                .select('current_risk_percentage, evaluation_count')
                .eq('area_id', areaId)
                .not('current_risk_percentage', 'is', null);
            
            if (error) throw error;
            
            if (workCenters.length === 0) return;
            
            // Calcular promedio de riesgo
            const avgRisk = workCenters.reduce((sum, wc) => sum + wc.current_risk_percentage, 0) / workCenters.length;
            
            // Calcular total de evaluaciones
            const totalEvaluations = workCenters.reduce((sum, wc) => sum + wc.evaluation_count, 0);
            
            // Actualizar área
            const { error: updateError } = await window.supabase
                .from('areas')
                .update({
                    risk_percentage: parseFloat(avgRisk.toFixed(1)),
                    evaluation_count: totalEvaluations,
                    last_evaluation: new Date().toISOString()
                })
                .eq('id', areaId);
            
            if (updateError) throw updateError;
            
            console.log(`✅ Estadísticas del área actualizadas: ${areaId}`);
        } catch (error) {
            console.error('Error actualizando estadísticas del área:', error);
        }
    },
    
    // Exportar todos los datos
    async exportAllData() {
        try {
            const areas = await this.getAreas();
            const allData = {
                areas: areas,
                workCenters: {},
                evaluations: {},
                recommendedMethods: {},
                exportDate: new Date().toISOString(),
                version: '2.0' // Nueva versión con estructura mejorada
            };
            
            // Obtener datos para cada área
            for (const area of areas) {
                allData.workCenters[area.id] = await this.getWorkCenters(area.id);
                
                // Obtener evaluaciones para cada centro de trabajo
                for (const workCenter of allData.workCenters[area.id]) {
                    allData.evaluations[workCenter.id] = await this.getEvaluationHistory(workCenter.id);
                    
                    // Obtener métodos recomendados para cada evaluación
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
};

        // Función para solicitar permisos de almacenamiento en Android
        function solicitarPermisosAlmacenamiento() {
            if (window.cordova && cordova.plugins && cordova.plugins.permissions) {
                const permissions = cordova.plugins.permissions;
                const permisosRequeridos = [
                    permissions.WRITE_EXTERNAL_STORAGE,
                    permissions.READ_EXTERNAL_STORAGE
                ];
                
                permissions.checkPermission(permisosRequeridos[0], function(status) {
                    if (!status.hasPermission) {
                        permissions.requestPermissions(permisosRequeridos, 
                            function(status) {
                                if (!status.hasPermission) {
                                    console.warn('Permisos de almacenamiento denegados');
                                }
                            }, 
                            function() {
                                console.error('Error al solicitar permisos');
                            }
                        );
                    }
                });
            }
        }

        // Escuchar evento deviceready para inicializar en entorno Cordova/Capacitor
        document.addEventListener('deviceready', function() {
            console.log('Dispositivo listo');
            solicitarPermisosAlmacenamiento();
        }, false);

        // Datos con preguntas, ponderaciones y mapeo de métodos
        const data = {
            generales: [
                {pregunta: "¿La altura del área de trabajo es ajustable o adecuada a la estatura del operador (nivel de codo o ligeramente por debajo)?", peso: 3, metodo: 'REBA'},
                {pregunta: "¿Herramientas, materiales y controles de uso frecuente están ubicados dentro de la zona de alcance cómodo?", peso: 3, metodo: 'RULA'},
                {pregunta: "¿Las superficies de trabajo son estables, limpias y permiten distintos tipos de tareas?", peso: 1},
                {pregunta: "¿Se permite trabajar sentado para tareas de precisión o inspección visual detallada?", peso: 1},
                {pregunta: "¿Se aprovecha al máximo la iluminación natural en áreas de trabajo?", peso: 2},
                {pregunta: "¿Se emplean colores claros en paredes y techos para mejorar la iluminación indirecta y reducir la fatiga visual?", peso: 1},
                {pregunta: "¿La zona de trabajo está iluminada uniformemente, evitando contrastes extremos?", peso: 2},
                {pregunta: "¿Cada trabajador dispone de iluminación suficiente para operar de forma segura y eficiente?", peso: 3},
                {pregunta: "¿Se usa iluminación localizada en tareas de inspección o precisión?", peso: 2, metodo: 'RULA'},
                {pregunta: "¿Las fuentes de luz están apantalladas o reubicadas para evitar deslumbramientos?", peso: 2},
                {pregunta: "¿Se han eliminado reflejos molestos o superficies brillantes que obliguen al trabajador a modificar su postura visual?", peso: 2, metodo: 'RULA'},
                {pregunta: "¿El fondo de la tarea visual favorece la visibilidad en tareas continuas?", peso: 1},
                {pregunta: "¿Se cuenta con extracción localizada eficaz en zonas críticas?", peso: 3},
                {pregunta: "¿Se usa ventilación natural cuando es posible para mantener el confort térmico?", peso: 1},
                {pregunta: "¿Se mantiene en buen estado el sistema de ventilación general y local?", peso: 2},
                {pregunta: "¿El ruido no interfiere con la comunicación, seguridad ni eficiencia del trabajo?", peso: 3},
                {pregunta: "¿Se han implementado soluciones que reduzcan el ruido ambiental en estaciones de trabajo donde se requiere concentración?", peso: 2},
                {pregunta: "¿El nivel de ruido en el área permite una comunicación efectiva y no genera fatiga auditiva durante tareas prolongadas?", peso: 3},
                {pregunta: "¿Se dispone de vestuarios y servicios higiénicos limpios y en buen estado?", peso: 1},
                {pregunta: "¿Hay áreas designadas para comidas, descanso y bebidas disponibles?", peso: 1},
                {pregunta: "¿Se han identificado previamente quejas musculoesqueléticas o lesiones por parte del personal en esta área?", peso: 3},
                {pregunta: "¿Se ubican stocks intermedios entre procesos para evitar presión de tiempo?", peso: 1},
                {pregunta: "¿Se consideran habilidades y preferencias de los trabajadores en su asignación?", peso: 2},
                {pregunta: "¿Se adaptan estaciones y equipos para personas con discapacidad?", peso: 2}
            ],
            condicionales: {
                manipulaCargas: [
                    {pregunta: "¿Las rutas internas de transporte están claramente señalizadas, libres de obstáculos y cumplen con protocolos de limpieza?", peso: 2},
                    {pregunta: "¿Los pasillos tienen ancho suficiente para permitir el tránsito simultáneo de carritos o racks bidireccionales?", peso: 2},
                    {pregunta: "¿Las superficies de rodamiento son planas, antideslizantes, sin pendientes bruscas ni desniveles?", peso: 3},
                    {pregunta: "¿Se cuenta con rampas de inclinación máxima del 8% en lugar de escalones o desniveles en zonas de tránsito de materiales?", peso: 3},
                    {pregunta: "¿La disposición de los materiales minimiza el transporte manual dentro de cada área de trabajo?", peso: 3},
                    {pregunta: "¿Se utilizan carritos de acero inoxidable u otro material autorizado con ruedas de baja fricción para mover materiales?", peso: 3},
                    {pregunta: "¿Se emplean dispositivos móviles auxiliares (como carros intermedios) para evitar cargas innecesarias?", peso: 3},
                    {pregunta: "¿Hay estanterías ajustables en altura y cercanas a las estaciones de trabajo para reducir desplazamientos manuales?", peso: 3},
                    {pregunta: "¿Se utilizan ayudas mecánicas (grúas, elevadores de columna, poleas) para el movimiento de materiales pesados?              ", peso: 3, metodo: 'NIOSH', critica: true},
                    {pregunta: "¿Se han sustituido tareas de manipulación manual con sistemas automáticos como bandas transportadoras o transferencias neumáticas?", peso: 3},
                    {pregunta: "¿Los materiales se dividen en cargas menores (<25 kg según ISO 11228-1) para facilitar su manipulación segura?         ", peso: 3, metodo: 'NIOSH', critica: true},
                    {pregunta: "¿Los contenedores tienen asas ergonómicas, puntos de agarre visibles y permiten un agarre firme sin rotación de muñeca?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Se han nivelado zonas de transferencia para evitar diferencias de altura en carga y descarga manual?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Las tareas de alimentación y retiro de materiales se hacen horizontalmente mediante empuje o tracción, no mediante levantamiento?", peso: 3, metodo: 'NIOSH', critica: true},
                    {pregunta: "¿Las tareas de manipulación evitan posiciones forzadas como inclinaciones o torsiones de tronco?          ", peso: 3, metodo: 'REBA', critica: true},
                    {pregunta: "¿Los trabajadores mantienen las cargas pegadas al cuerpo y por debajo del nivel de los hombros durante el transporte manual?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Las tareas manuales repetitivas se realizan durante más de 2 horas continuas sin variación?             ", peso: 3, metodo: 'OCRA', critica: true},
                    {pregunta: "¿El levantamiento y depósito de materiales se realiza con movimientos controlados, en el plano frontal del cuerpo y sin rotación?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Para trayectos largos se utilizan mochilas, bolsas simétricas o medios que distribuyan la carga en ambos lados del cuerpo?", peso: 2},
                    {pregunta: "¿Las tareas de manipulación pesada se alternan con tareas más ligeras para evitar fatiga acumulativa?          ", peso: 2, metodo: 'OCRA'}
                ],
                usaPantallas: [
                    {pregunta: "¿Los puestos con pantallas permiten ajustes por parte del operador?", peso: 3, metodo: 'RULA'},
                    {pregunta: "¿Se combinan tareas ante pantalla con tareas físicas para evitar fatiga ocular?", peso: 1},
                    {pregunta: "¿Se permiten pausas cortas frecuentes en trabajos prolongados frente a pantalla?", peso: 1, metodo: 'OCRA'}
                ],
                usaHerramientas: [
                    {pregunta: "¿En tareas repetitivas se utilizan herramientas diseñadas específicamente para cada tarea (p. ej., pinzas, llaves, destornilladores calibrados)?", peso: 3, metodo: 'RULA', critica: true},
                    {pregunta: "¿Se emplean herramientas suspendidas en líneas de producción donde se realizan operaciones repetidas?", peso: 2, metodo: 'OCRA'},
                    {pregunta: "¿Se usan fijadores (como mordazas o tornillos de banco) para estabilizar piezas durante operaciones manuales?", peso: 2},
                    {pregunta: "¿Las herramientas de precisión ofrecen soporte ergonómico para la muñeca o el dorso de la mano?              ", peso: 3, metodo: 'RULA', critica: true},
                    {pregunta: "¿El peso de las herramientas está reducido al mínimo sin comprometer su funcionalidad?", peso: 2},
                    {pregunta: "¿Las herramientas requieren una fuerza mínima para ser operadas, considerando la variabilidad de los operadores?", peso: 3, metodo: 'RULA'},
                    {pregunta: "¿Los mangos de las herramientas tienen forma, diámetro y longitud adecuados al tamaño de la mano promedio del operador?", peso: 3, metodo: 'RULA'},
                    {pregunta: "¿Se cuenta con superficies antideslizantes o retenedores para evitar deslizamiento o pellizcos en el uso de herramientas?", peso: 2},
                    {pregunta: "¿Se han validado herramientas con bajo nivel de vibración y ruido conforme al perfil de riesgo del puesto?", peso: 3},
                    {pregunta: "¿Cada herramienta tiene su ubicación asignada en estaciones 5S o shadow boards?", peso: 2},
                    {pregunta: "¿Las estaciones de trabajo permiten una postura estable y ergonómica para usar herramientas con seguridad?          ", peso: 3, metodo: 'RULA', critica: true},
                    {pregunta: "¿Se han tomado medidas para reducir la vibración en equipos y herramientas?", peso: 3},
                    {pregunta: "¿Las herramientas y máquinas se mantienen en condiciones que reduzcan el esfuerzo auditivo del operador?", peso: 2}
                ],
                mantienePosturas: [
                    {pregunta: "¿Los operadores de menor estatura alcanzan controles y materiales sin forzar su postura?            ", peso: 2, metodo: 'REBA', critica: true},
                    {pregunta: "¿Los operadores altos tienen espacio suficiente para movimientos sin restricciones?", peso: 2},
                    {pregunta: "¿Se permite alternar entre estar de pie y sentado, dependiendo del tipo de tarea?      ", peso: 2, metodo: 'REBA', critica: true},
                    {pregunta: "¿Se dispone de sillas o banquetas para pausas cortas en tareas prolongadas de pie?", peso: 2},
                    {pregunta: "¿Las sillas para trabajos sentados son ajustables y tienen respaldo ergonómico?", peso: 3},
                    {pregunta: "¿Las superficies de trabajo permiten alternar tareas con objetos grandes y pequeños?", peso: 2},
                    {pregunta: "¿Se realiza rotación de tareas entre actividades con diferente exigencia física dentro del turno?          ", peso: 3, metodo: 'OCRA', critica: true},
                    {pregunta: "¿Existen pausas activas o pausas programadas que ayuden a mitigar la fatiga postural?", peso: 2, metodo: 'OCRA'},
                    {pregunta: "¿Se combinan tareas para diversificar el trabajo y reducir la fatiga?", peso: 2}
                ]
            }
        };

        // Mapeo de métodos y criterios de decisión
        const criteriosMetodos = {
            NIOSH: {
                nombre: "NIOSH",
                descripcion: "Evaluación de manipulación manual de materiales",
                color: "#e74c3c",
                preguntasClave: [
                    "¿Los materiales se dividen en cargas menores (<25 kg)?",
                    "¿Las tareas se hacen horizontalmente, no mediante levantamiento?",
                    "¿Se utilizan ayudas mecánicas para materiales pesados?"
                ]
            },
            REBA: {
                nombre: "REBA",
                descripcion: "Evaluación de posturas de cuerpo completo",
                color: "#3498db",
                preguntasClave: [
                    "¿Las tareas evitan posiciones forzadas del tronco?",
                    "¿La altura del trabajo es adecuada?",
                    "¿Se permite alternar entre estar de pie y sentado?"
                ]
            },
            RULA: {
                nombre: "RULA",
                descripcion: "Evaluación de miembros superiores",
                color: "#9b59b6",
                preguntasClave: [
                    "¿Se utilizan herramientas específicas para cada tarea?",
                    "¿Las herramientas ofrecen soporte ergonómico?",
                    "¿Las estaciones permiten posturas estables?"
                ]
            },
            OCRA: {
                nombre: "OCRA",
                descripcion: "Evaluación de movimientos repetitivos",
                color: "#f39c12",
                preguntasClave: [
                    "¿Las tareas repetitivas duran más de 2 horas continuas?",
                    "¿Se realiza rotación de tareas?",
                    "¿Existen pausas programadas?"
                ]
            }
        };

        // Cerrar modal al hacer clic fuera
        window.onclick = function(event) {
            const modal = document.getElementById('modalVerEvaluacion');
            if (event.target === modal) {
                cerrarModal();
            }
        }

        // Función para cargar preguntas generales
        function cargarPreguntasGenerales() {
            const container = document.getElementById('preguntas-container');
            
            // Crear contenedor para preguntas generales
            const generalDiv = document.createElement('div');
            generalDiv.className = 'question-group';
            generalDiv.id = 'preguntas-generales';
            
            // Añadir título
            const titulo = document.createElement('h2');
            titulo.textContent = 'Criterios Generales';
            generalDiv.appendChild(titulo);
            
            // Añadir cada pregunta
            data.generales.forEach((item, index) => {
                const questionDiv = crearElementoPregunta(item.pregunta, 'general', index, item.peso, item.metodo, item.critica);
                generalDiv.appendChild(questionDiv);
            });
            
            // Añadir al contenedor principal
            container.appendChild(generalDiv);
        }

        // Función para actualizar preguntas condicionales
        function actualizarPreguntas() {
            // Eliminar secciones condicionales existentes
            const seccionesCondicionales = document.querySelectorAll('.conditional-question-group');
            seccionesCondicionales.forEach(seccion => seccion.remove());
            
            // Verificar cada checkbox y añadir secciones correspondientes
            const container = document.getElementById('preguntas-container');
            
            if (document.getElementById('manipulaCargas').checked) {
                container.appendChild(crearSeccionCondicional('manipulaCargas', 'Manipulación de Cargas'));
            }
            
            if (document.getElementById('usaPantallas').checked) {
                container.appendChild(crearSeccionCondicional('usaPantallas', 'Uso de Pantallas'));
            }
            
            if (document.getElementById('usaHerramientas').checked) {
                container.appendChild(crearSeccionCondicional('usaHerramientas', 'Uso de Herramientas'));
            }
            
            if (document.getElementById('mantienePosturas').checked) {
                container.appendChild(crearSeccionCondicional('mantienePosturas', 'Mantenimiento de Posturas'));
            }
            
            // Recalcular score automáticamente
            const score = calcularScoreFinal();
            document.getElementById('scoreFinal').textContent = score + '%';
            
            // Actualizar categoría
            const categoria = obtenerCategoriaRiesgo(parseFloat(score));
            const elementoCategoria = document.getElementById('textoCategoria');
            const elementoScore = document.getElementById('scoreFinal');
            
            elementoCategoria.textContent = categoria.texto;
            elementoScore.style.color = categoria.color;
        }

        // Función para crear una sección condicional
        function crearSeccionCondicional(id, titulo) {
            const seccionDiv = document.createElement('div');
            seccionDiv.className = 'question-group conditional-question-group';
            seccionDiv.id = `preguntas-${id}`;
            
            // Añadir título
            const tituloElement = document.createElement('h2');
            tituloElement.textContent = titulo;
            seccionDiv.appendChild(tituloElement);
            
            // Añadir preguntas
            data.condicionales[id].forEach((item, index) => {
                const questionDiv = crearElementoPregunta(item.pregunta, id, index, item.peso, item.metodo, item.critica);
                seccionDiv.appendChild(questionDiv);
            });
            
            return seccionDiv;
        }

        // Función para crear el elemento de una pregunta
        function crearElementoPregunta(pregunta, categoria, index, peso, metodo, critica) {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            questionDiv.setAttribute('data-peso', peso);
            questionDiv.setAttribute('data-metodo', metodo || '');
            questionDiv.setAttribute('data-critica', critica || false);
            
            // Crear texto de pregunta de forma segura
            const preguntaDiv = document.createElement('div');
            preguntaDiv.textContent = pregunta;
            
            // Añadir indicador de método si existe
            if (metodo) {
                const metodoSpan = document.createElement('span');
                metodoSpan.style.cssText = `
                    background-color: ${criteriosMetodos[metodo].color};
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 11px;
                    margin-left: 10px;
                    font-weight: bold;
                `;
                metodoSpan.textContent = metodo;
                if (critica) {
                    metodoSpan.textContent += ' ⚠️';
                }
                preguntaDiv.appendChild(metodoSpan);
            }
            
            // Crear opciones
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            optionsDiv.innerHTML = `
                <label class="radio-label">
                    <input type="radio" name="${categoria}-${index}" class="radio-input" value="si" onchange="calcularScoreAutomatico()"> Sí
                </label>
                <label class="radio-label">
                    <input type="radio" name="${categoria}-${index}" class="radio-input" value="no" onchange="calcularScoreAutomatico()"> No
                </label>
                <label class="radio-label">
                    <input type="radio" name="${categoria}-${index}" class="radio-input" value="na" onchange="calcularScoreAutomatico()"> N/A
                </label>
            `;
            
            questionDiv.appendChild(preguntaDiv);
            questionDiv.appendChild(optionsDiv);
            
            return questionDiv;
        }

        // Función para calcular score automáticamente
        function calcularScoreAutomatico() {
            const score = calcularScoreFinal();
            document.getElementById('scoreFinal').textContent = score + '%';
            
            // Actualizar categoría de riesgo y color
            const categoria = obtenerCategoriaRiesgo(parseFloat(score));
            const elementoCategoria = document.getElementById('textoCategoria');
            const elementoScore = document.getElementById('scoreFinal');
            
            elementoCategoria.textContent = categoria.texto;
            elementoScore.style.color = categoria.color;
        }

        // Función para determinar categoría de riesgo
        function obtenerCategoriaRiesgo(score) {
            if (score <= 25) {
                return {texto: "Riesgo Bajo - Condiciones ergonómicas aceptables", color: "#28a745"};
            } else if (score <= 50) {
                return {texto: "Riesgo Moderado - Se requieren mejoras", color: "#ffc107"};
            } else if (score <= 75) {
                return {texto: "Riesgo Alto - Intervención necesaria", color: "#fd7e14"};
            } else {
                return {texto: "Riesgo Crítico - Intervención urgente", color: "#dc3545"};
            }
        }

        // Nueva función para analizar métodos requeridos
        function analizarMetodosRequeridos() {
            const metodosContainer = document.getElementById('metodosRecomendados');
            const listMetodos = document.getElementById('listMetodos');
            const listPreguntasClave = document.getElementById('listPreguntasClave');
            const resumenDecision = document.getElementById('textoResumen');
            
            // Limpiar contenido anterior
            listMetodos.innerHTML = '';
            listPreguntasClave.innerHTML = '';
            
            // Analizar todas las preguntas
            const preguntas = document.querySelectorAll('.question');
            const metodosDetectados = {};
            const preguntasCriticas = [];
            
            preguntas.forEach(pregunta => {
                const metodo = pregunta.getAttribute('data-metodo');
                const critica = pregunta.getAttribute('data-critica') === 'true';
                const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
                const respuesta = radioSeleccionado ? radioSeleccionado.value : null;
                const textoPregunta = pregunta.querySelector('div').textContent;
                
                if (metodo && respuesta === 'no') {
                    if (!metodosDetectados[metodo]) {
                        metodosDetectados[metodo] = {
                            count: 0,
                            preguntas: [],
                            criticas: 0
                        };
                    }
                    metodosDetectados[metodo].count++;
                    metodosDetectados[metodo].preguntas.push(textoPregunta);
                    if (critica) {
                        metodosDetectados[metodo].criticas++;
                        preguntasCriticas.push({
                            metodo: metodo,
                            pregunta: textoPregunta
                        });
                    }
                }
            });

            // Generar resumen de decisión
            const totalMetodos = Object.keys(metodosDetectados).length;
            const totalCriticas = preguntasCriticas.length;
            
            let textoResumenContent = `
                <p><strong>📈 Análisis Completado:</strong></p>
                <ul>
                    <li><strong>${totalMetodos}</strong> métodos de evaluación recomendados</li>
                    <li><strong>${totalCriticas}</strong> indicadores críticos identificados</li>
                    <li><strong>Prioridad:</strong> ${totalCriticas > 0 ? 'ALTA' : totalMetodos > 2 ? 'MEDIA' : 'BAJA'}</li>
                </ul>
            `;
            resumenDecision.innerHTML = textoResumenContent;

            // Generar tarjetas de métodos
            if (totalMetodos === 0) {
                listMetodos.innerHTML = `
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
                // Ordenar métodos por prioridad (críticas primero)
                const metodosOrdenados = Object.entries(metodosDetectados)
                    .sort(([,a], [,b]) => b.criticas - a.criticas || b.count - a.count);

                metodosOrdenados.forEach(([metodo, data]) => {
                    const metodInfo = criteriosMetodos[metodo];
                    const prioridad = data.criticas > 0 ? 'OBLIGATORIO' : 
                                    data.count > 2 ? 'RECOMENDADO' : 'OPCIONAL';
                    const priorityClass = prioridad === 'OBLIGATORIO' ? 'priority-obligatorio' :
                                        prioridad === 'RECOMENDADO' ? 'priority-recomendado' : 'priority-opcional';

                    const metodCard = document.createElement('div');
                    metodCard.className = 'metodo-card';
                    metodCard.style.borderLeftColor = metodInfo.color;
                    
                    metodCard.innerHTML = `
                        <div class="metodo-title">🎯 ${metodInfo.nombre} - ${metodInfo.descripcion}</div>
                        <div class="metodo-justification">
                            <strong>Razón:</strong> ${data.count} indicador(es) detectado(s)
                            ${data.criticas > 0 ? ` (${data.criticas} crítico${data.criticas > 1 ? 's' : ''})` : ''}
                            <br><strong>Factores identificados:</strong> 
                            ${data.preguntas.slice(0,2).map(p => '• ' + p.substring(0,60) + '...').join('<br>')}
                            ${data.preguntas.length > 2 ? `<br>• Y ${data.preguntas.length - 2} más...` : ''}
                        </div>
                        <span class="metodo-priority ${priorityClass}">${prioridad}</span>
                    `;
                    
                    listMetodos.appendChild(metodCard);
                });
            }

            // Generar lista de preguntas clave
            if (preguntasCriticas.length > 0) {
                preguntasCriticas.forEach(item => {
                    const preguntaDiv = document.createElement('div');
                    preguntaDiv.className = 'pregunta-indicadora';
                    preguntaDiv.innerHTML = `
                        <span style="color: ${criteriosMetodos[item.metodo].color}; font-weight: bold;">
                            ${item.metodo}:
                        </span> 
                        ${item.pregunta.substring(0, 100)}...
                    `;
                    listPreguntasClave.appendChild(preguntaDiv);
                });
            } else {
                listPreguntasClave.innerHTML = `
                    <div class="pregunta-indicadora" style="color: #28a745;">
                        ✅ No se identificaron indicadores críticos que requieran evaluación específica inmediata.
                    </div>
                `;
            }

            // Mostrar la sección
            metodosContainer.classList.remove('hidden');
            
            // Scroll a la sección
            metodosContainer.scrollIntoView({ behavior: 'smooth' });
        }

        // Función auxiliar para obtener datos de la tabla
        function obtenerDatosTabla(seccionId) {
            const seccion = document.getElementById(seccionId);
            if (!seccion) return [];
            
            const preguntas = seccion.querySelectorAll('.question');
            const datos = [];
            
            preguntas.forEach(pregunta => {
                const textoPregunta = pregunta.querySelector('div').textContent;
                
                // Obtener respuesta seleccionada
                const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
                const respuesta = radioSeleccionado ? 
                    (radioSeleccionado.value === 'si' ? 'Sí' : 
                    (radioSeleccionado.value === 'no' ? 'No' : 'N/A')) : 
                    'Sin respuesta';
                
                datos.push([textoPregunta, respuesta]);
            });
            
            return datos;
        }

        function calcularScoreFinal() {
            let totalPonderado = 0;
            let sumaPesos = 0;

            // Selecciona todos los contenedores de preguntas
            const preguntas = document.querySelectorAll('.question');

            preguntas.forEach(pregunta => {
                // Obtiene el peso desde el atributo data-peso
                const peso = parseInt(pregunta.getAttribute('data-peso')) || 1;

                // Obtiene la respuesta seleccionada
                const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
                const respuesta = radioSeleccionado ? radioSeleccionado.value : null;

                if (respuesta && respuesta !== 'na') {
                    // LÓGICA INVERTIDA: No (1 punto de riesgo), Sí (0 puntos de riesgo)
                    const valor = (respuesta === 'no') ? 1 : 0;

                    totalPonderado += valor * peso;
                    sumaPesos += peso;
                } else if (respuesta === 'na') {
                    // No aplica, no suma ni penaliza, pero tampoco suma el peso
                    // No se hace nada
                } else {
                    // Sin respuesta, podemos decidir ignorarlo o considerarlo como 0
                    // Por ahora lo ignoramos
                }
            });

            // Calcula el score final como porcentaje de RIESGO
            const scoreFinal = (sumaPesos > 0) ? (totalPonderado / sumaPesos) * 100 : 0;
            return scoreFinal.toFixed(2);
        }

        // Función mejorada para exportar PDF con recomendaciones de métodos
        // BUSCA en tu código la función exportarPDFCompleto()
// REEMPLAZA toda la función con esta versión optimizada:

function exportarPDFCompleto() {
    // Mostrar spinner
    document.getElementById('spinner').classList.remove('hidden');
    
    // Usar setTimeout para evitar stack overflow
    setTimeout(() => {
        try {
            generarPDFAsync();
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el PDF. Intenta con menos datos o reinicia la app.');
            document.getElementById('spinner').classList.add('hidden');
        }
    }, 100);
}

// Nueva función asíncrona para generar PDF sin bloquear
async function generarPDFAsync() {
    try {
        // Obtener datos del área
        const nombreArea = document.getElementById('nombreArea').value || 'No especificado';
        const ubicacionArea = document.getElementById('ubicacionArea').value || 'No especificada';
        const responsableArea = document.getElementById('responsableArea').value || 'No especificado';
        const fechaEvaluacion = document.getElementById('fechaEvaluacion').value || new Date().toLocaleDateString();
        
        // Crear nombre de archivo
        const fechaHora = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 16);
        const nombreArchivo = `${fechaHora}_Evaluacion_${nombreArea.replace(/\s+/g, '_')}.pdf`;
        
        // Inicializar jsPDF con configuración optimizada
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true // Importante para EMUI
        });
        
        // Crear PDF en chunks para evitar stack overflow
        await crearHeaderPDF(doc, nombreArea, ubicacionArea, responsableArea, fechaEvaluacion);
        
        // Pausa para evitar bloqueo
        await new Promise(resolve => setTimeout(resolve, 50));
        
        await crearSeccionMetodos(doc);
        
        // Pausa para evitar bloqueo
        await new Promise(resolve => setTimeout(resolve, 50));
        
        await crearTablasDatos(doc);
        
        // Guardar PDF de forma segura
        await guardarPDFSeguro(doc, nombreArchivo);
        
    } catch (error) {
        console.error('Error en generarPDFAsync:', error);
        alert('Error: ' + error.message);
        document.getElementById('spinner').classList.add('hidden');
    }
}

// Función para crear header de forma optimizada
async function crearHeaderPDF(doc, nombreArea, ubicacionArea, responsableArea, fechaEvaluacion) {
    // Header compacto
    doc.setFontSize(16);
    doc.text('Reporte de Evaluación Ergonómica Integrada', 105, 15, {align: 'center'});
    
    // Información básica en líneas compactas
    doc.setFontSize(9);
    doc.text(`Área: ${nombreArea} | Ubicación: ${ubicacionArea} | Responsable: ${responsableArea}`, 14, 25);
    doc.text(`Fecha evaluación: ${fechaEvaluacion} | Generado: ${new Date().toLocaleDateString()}`, 14, 31);
    
    // Score
    const score = calcularScoreFinal();
    doc.setFontSize(12);
    doc.text(`Riesgo Ergonómico: ${score}%`, 14, 42);
    
    return 50; // Retornar posición Y para continuar
}

// Función para crear sección de métodos de forma optimizada
async function crearSeccionMetodos(doc) {
    let posY = 50;
    
    // Analizar métodos de forma eficiente
    const metodosDetectados = analizarMetodosLiviano();
    
    if (Object.keys(metodosDetectados).length > 0) {
        let metodosTexto = 'Métodos recomendados: ';
        Object.entries(metodosDetectados).forEach(([metodo, data], index) => {
            const inicial = metodo.charAt(0);
            const prioridad = data.criticas > 0 ? '!' : data.count > 2 ? '*' : '';
            metodosTexto += `${inicial}${prioridad}`;
            if (index < Object.keys(metodosDetectados).length - 1) metodosTexto += ', ';
        });
        
        doc.setFontSize(9);
        doc.text(metodosTexto, 14, posY);
        doc.text('(!:Obligatorio, *:Recomendado)', 14, posY + 6);
        posY += 15;
    } else {
        doc.setFontSize(9);
        doc.text('Métodos: Seguimiento rutinario', 14, posY);
        posY += 10;
    }
    
    // Crear tabla de métodos si existe la sección visible
    const metodosContainer = document.getElementById('metodosRecomendados');
    if (!metodosContainer.classList.contains('hidden')) {
        await crearTablaMetodos(doc, posY);
    }
    
    return posY;
}

// Función liviana para analizar métodos (evitar stack overflow)
function analizarMetodosLiviano() {
    const metodosDetectados = {};
    const preguntas = document.querySelectorAll('.question[data-metodo]');
    
    // Procesar en chunks pequeños
    for (let i = 0; i < preguntas.length; i++) {
        const pregunta = preguntas[i];
        const metodo = pregunta.getAttribute('data-metodo');
        const critica = pregunta.getAttribute('data-critica') === 'true';
        const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
        
        if (metodo && radioSeleccionado && radioSeleccionado.value === 'no') {
            if (!metodosDetectados[metodo]) {
                metodosDetectados[metodo] = { count: 0, criticas: 0 };
            }
            metodosDetectados[metodo].count++;
            if (critica) metodosDetectados[metodo].criticas++;
        }
    }
    
    return metodosDetectados;
}

// Función para crear tabla de métodos de forma segura
async function crearTablaMetodos(doc, startY) {
    try {
        const metodoCards = document.querySelectorAll('.metodo-card');
        if (metodoCards.length === 0) return startY;
        
        const metodosData = [];
        
        // Procesar tarjetas de métodos
        metodoCards.forEach(card => {
            try {
                const titulo = card.querySelector('.metodo-title')?.textContent?.replace('🎯 ', '') || 'N/A';
                const justificacionCompleta = card.querySelector('.metodo-justification')?.textContent || '';
                const prioridad = card.querySelector('.metodo-priority')?.textContent || 'N/A';
                
                // Extraer información esencial
                const razonMatch = justificacionCompleta.match(/Razón: (.+?)(?=Factores|$)/);
                const razon = razonMatch ? razonMatch[1].trim() : 'Múltiples indicadores';
                
                metodosData.push([titulo, razon, prioridad]);
            } catch (e) {
                console.warn('Error procesando tarjeta de método:', e);
            }
        });
        
        if (metodosData.length > 0) {
            // Crear tabla con configuración optimizada
            doc.autoTable({
                startY: startY,
                head: [['Método Recomendado', 'Justificación', 'Prioridad']],
                body: metodosData,
                theme: 'striped',
                headStyles: {
                    fillColor: [52, 152, 219],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: 8,
                    cellPadding: 3
                },
                columnStyles: {
                    0: {cellWidth: 55},
                    1: {cellWidth: 85},
                    2: {cellWidth: 25, halign: 'center'}
                },
                margin: {left: 14, right: 14},
                // Configuración anti-stack-overflow
                pageBreak: 'auto',
                showHead: 'everyPage'
            });
            
            return doc.lastAutoTable.finalY + 10;
        }
        
    } catch (error) {
        console.warn('Error en tabla de métodos:', error);
    }
    
    return startY;
}

// Función para crear tablas de datos de forma segura
async function crearTablasDatos(doc) {
    try {
        let posY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 85;
        
        // Obtener datos de forma eficiente
        const tablasDatos = obtenerDatosTablasOptimizado();
        
        // Procesar cada tabla con pausas
        for (let i = 0; i < tablasDatos.length; i++) {
            const seccion = tablasDatos[i];
            
            // Pausa cada 2 tablas para evitar bloqueo
            if (i > 0 && i % 2 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            posY = await crearTablaSecccion(doc, seccion, posY);
        }
        
    } catch (error) {
        console.error('Error en tablas de datos:', error);
    }
}

// Función optimizada para obtener datos de tablas
function obtenerDatosTablasOptimizado() {
    const tablasDatos = [];
    
    // Criterios generales
    const datosGenerales = obtenerDatosTablaSeguro('preguntas-generales');
    if (datosGenerales.length > 0) {
        tablasDatos.push({titulo: 'Criterios Generales', datos: datosGenerales});
    }
    
    // Secciones condicionales
    if (document.getElementById('manipulaCargas')?.checked) {
        const datos = obtenerDatosTablaSeguro('preguntas-manipulaCargas');
        if (datos.length > 0) {
            tablasDatos.push({titulo: 'Manipulación de Cargas', datos: datos});
        }
    }
    
    if (document.getElementById('usaPantallas')?.checked) {
        const datos = obtenerDatosTablaSeguro('preguntas-usaPantallas');
        if (datos.length > 0) {
            tablasDatos.push({titulo: 'Uso de Pantallas', datos: datos});
        }
    }
    
    if (document.getElementById('usaHerramientas')?.checked) {
        const datos = obtenerDatosTablaSeguro('preguntas-usaHerramientas');
        if (datos.length > 0) {
            tablasDatos.push({titulo: 'Uso de Herramientas', datos: datos});
        }
    }
    
    if (document.getElementById('mantienePosturas')?.checked) {
        const datos = obtenerDatosTablaSeguro('preguntas-mantienePosturas');
        if (datos.length > 0) {
            tablasDatos.push({titulo: 'Mantenimiento de Posturas', datos: datos});
        }
    }
    
    return tablasDatos;
}

// Función segura para obtener datos de tabla individual
function obtenerDatosTablaSeguro(seccionId) {
    try {
        const seccion = document.getElementById(seccionId);
        if (!seccion) return [];
        
        const preguntas = seccion.querySelectorAll('.question');
        const datos = [];
        
        preguntas.forEach(pregunta => {
            try {
                let textoPregunta = pregunta.querySelector('div')?.textContent || 'N/A';
                
                // LIMPIAR y LIMITAR texto para 2 líneas
                textoPregunta = prepararTextoPara2Lineas(textoPregunta);
                
                const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
                const respuesta = radioSeleccionado ? 
                    (radioSeleccionado.value === 'si' ? 'Sí' : 
                    (radioSeleccionado.value === 'no' ? 'No' : 'N/A')) : 
                    'Sin respuesta';
                
                datos.push([textoPregunta, respuesta]);
            } catch (e) {
                console.warn('Error procesando pregunta:', e);
            }
        });
        
        return datos;
    } catch (error) {
        console.error('Error en obtenerDatosTablaSeguro:', error);
        return [];
    }
}

// 2. NUEVA función para preparar texto para exactamente 2 líneas:

function prepararTextoPara2Lineas(texto) {
    // Limpiar texto
    let textoLimpio = texto.trim();
    textoLimpio = textoLimpio.replace(/\s+(NIOSH|REBA|RULA|OCRA)(\s+⚠️)?$/, '');
    
    // Configuración para 2 líneas con 100 caracteres por línea
    const CARACTERES_POR_LINEA = 140; // AUMENTADO a 100 caracteres
    const MAX_CARACTERES_TOTAL = CARACTERES_POR_LINEA * 1; // 200 caracteres máximo
    
    // Si el texto es muy corto, devolverlo tal como está
    if (textoLimpio.length <= CARACTERES_POR_LINEA) {
        return textoLimpio;
    }
    
    // Si es muy largo, truncar primero
    if (textoLimpio.length > MAX_CARACTERES_TOTAL) {
        textoLimpio = textoLimpio.substring(0, MAX_CARACTERES_TOTAL - 3);
        
        // Buscar último espacio para no cortar palabras
        const ultimoEspacio = textoLimpio.lastIndexOf(' ');
        if (ultimoEspacio > MAX_CARACTERES_TOTAL * 1) {
            textoLimpio = textoLimpio.substring(0, ultimoEspacio);
        }
        textoLimpio += '...';
    }
    
    // Dividir en 2 líneas inteligentemente
    const palabras = textoLimpio.split(' ');
    let linea1 = '';
    let linea2 = '';
    let construyendoLinea1 = true;
    
    for (let palabra of palabras) {
        if (construyendoLinea1) {
            const testLinea1 = linea1 + (linea1 ? ' ' : '') + palabra;
            if (testLinea1.length <= CARACTERES_POR_LINEA) {
                linea1 = testLinea1;
            } else {
                // Cambiar a línea 2
                construyendoLinea1 = false;
                linea2 = palabra;
            }
        } else {
            const testLinea2 = linea2 + (linea2 ? ' ' : '') + palabra;
            if (testLinea2.length <= CARACTERES_POR_LINEA) {
                linea2 = testLinea2;
            } else {
                // Ya no cabe más, terminar
                break;
            }
        }
    }
    
    // Combinar líneas con salto
    if (linea2) {
        return linea1 + '\n' + linea2;
    } else {
        return linea1;
    }
}

// REEMPLAZA la función crearTablaSecccion() con alineación izquierda:

async function crearTablaSecccion(doc, seccion, posY) {
    try {
        // Si está muy abajo, nueva página
        if (posY > 250) {
            doc.addPage();
            posY = 20;
        }
        
        // Título de sección
        doc.setFontSize(10);
        doc.text(seccion.titulo, 14, posY);
        posY += 8;
        
        // Crear tabla con ALTURA FIJA UNIFORME para todas las filas
        doc.autoTable({
            startY: posY,
            head: [['Pregunta', 'Respuesta']],
            body: seccion.datos,
            theme: 'grid',
            headStyles: {
                fillColor: [52, 152, 219], 
                fontSize: 9,
                halign: 'center',
                valign: 'middle',
                fontStyle: 'bold'
            },
            columnStyles: {
                0: {
                    cellWidth: 140,
                    fontSize: 8,
                    halign: 'left',
                    valign: 'middle', // CAMBIO: middle para centrar verticalmente
                    overflow: 'linebreak',
                    cellPadding: 2,
                    lineColor: [180, 180, 180],
                    lineWidth: 0.5
                },
                1: {
                    cellWidth: 25,
                    halign: 'center',
                    valign: 'middle',
                    fontSize: 9,
                    fontStyle: 'bold',
                    lineColor: [180, 180, 180],
                    lineWidth: 0.5
                }
            },
            margin: {left: 14, right: 14},
            styles: {
                fontSize: 8, 
                cellPadding: 2,
                overflow: 'linebreak',
                lineColor: [180, 180, 180],
                lineWidth: 0.5,
                valign: 'middle',
                lineHeight: 1.1,
                // CLAVE: ALTURA FIJA para todas las celdas
                minCellHeight: 14,
                maxCellHeight: 14 // MISMO VALOR = altura fija
            },
            pageBreak: 'auto',
            showHead: 'everyPage',
            tableWidth: 'auto',
            rowPageBreak: 'avoid',
            
            // FORZAR altura fija en TODAS las celdas
            didParseCell: function(data) {
                // ALTURA UNIFORME FORZADA
                data.cell.styles.minCellHeight = 14;
                data.cell.styles.maxCellHeight = 14;
                data.cell.height = 14; // FORZAR directamente
                
                // Configuración de columnas
                if (data.column.index === 0) {
                    data.cell.styles.halign = 'left';
                    data.cell.styles.valign = 'middle';
                    data.cell.styles.cellWidth = 140;
                } else {
                    data.cell.styles.halign = 'center';
                    data.cell.styles.valign = 'middle';
                    data.cell.styles.cellWidth = 25;
                }
            },
            
            // ASEGURAR altura fija en el renderizado
            didDrawCell: function(data) {
                // FORZAR altura final
                data.cell.height = 14;
            }
        });
        
        return doc.lastAutoTable.finalY + 10;
        
    } catch (error) {
        console.error('Error creando tabla sección:', error);
        return posY + 20;
    }
}

// OPCIONAL: Si quieres más control, también puedes actualizar la función prepararTextoPara2Lineas():

function prepararTextoPara2LineasMejorado(texto) {
    // Limpiar texto
    let textoLimpio = texto.trim();
    textoLimpio = textoLimpio.replace(/\s+(NIOSH|REBA|RULA|OCRA)(\s+⚠️)?$/, '');
    
    // Para preguntas muy cortas, no modificar
    if (textoLimpio.length <= 80) {
        return textoLimpio;
    }
    
    // Para preguntas medianas (80-160 caracteres), permitir tal como está
    if (textoLimpio.length <= 160) {
        return textoLimpio;
    }
    
    // Solo para preguntas muy largas (>160), aplicar división inteligente
    const CARACTERES_POR_LINEA = 80;
    const MAX_CARACTERES_TOTAL = CARACTERES_POR_LINEA * 2;
    
    if (textoLimpio.length > MAX_CARACTERES_TOTAL) {
        textoLimpio = textoLimpio.substring(0, MAX_CARACTERES_TOTAL - 3);
        
        const ultimoEspacio = textoLimpio.lastIndexOf(' ');
        if (ultimoEspacio > MAX_CARACTERES_TOTAL * 0.8) {
            textoLimpio = textoLimpio.substring(0, ultimoEspacio);
        }
        textoLimpio += '...';
    }
    
    return textoLimpio;
}

// OPCIONAL: Si quieres más control, también puedes actualizar la función prepararTextoPara2Lineas():

function prepararTextoPara2LineasMejorado(texto) {
    // Limpiar texto
    let textoLimpio = texto.trim();
    textoLimpio = textoLimpio.replace(/\s+(NIOSH|REBA|RULA|OCRA)(\s+⚠️)?$/, '');
    
    // Para preguntas muy cortas, no modificar
    if (textoLimpio.length <= 80) {
        return textoLimpio;
    }
    
    // Para preguntas medianas (80-160 caracteres), permitir tal como está
    if (textoLimpio.length <= 160) {
        return textoLimpio;
    }
    
    // Solo para preguntas muy largas (>160), aplicar división inteligente
    const CARACTERES_POR_LINEA = 80;
    const MAX_CARACTERES_TOTAL = CARACTERES_POR_LINEA * 2;
    
    if (textoLimpio.length > MAX_CARACTERES_TOTAL) {
        textoLimpio = textoLimpio.substring(0, MAX_CARACTERES_TOTAL - 3);
        
        const ultimoEspacio = textoLimpio.lastIndexOf(' ');
        if (ultimoEspacio > MAX_CARACTERES_TOTAL * 0.8) {
            textoLimpio = textoLimpio.substring(0, ultimoEspacio);
        }
        textoLimpio += '...';
    }
    
    return textoLimpio;
}

// FUNCIÓN DE PRUEBA actualizada para 100 caracteres:

function testearLongitudTexto100() {
    const ejemplos = [
        "Texto corto",
        "¿Se utilizan ayudas mecánicas para el movimiento de materiales pesados en todas las áreas?",
        "¿Se utilizan ayudas mecánicas (grúas, elevadores de columna, poleas) para el movimiento de materiales pesados en la planta de fabricación de productos farmacéuticos?",
        "¿En tareas repetitivas se utilizan herramientas diseñadas específicamente para cada tarea (p. ej., pinzas, llaves, destornilladores calibrados) que cumplan con las especificaciones ergonómicas recomendadas por la normativa internacional?"
    ];
    
    console.log("=== TEST DE LONGITUD DE TEXTO - 100 CARACTERES ===");
    ejemplos.forEach((texto, index) => {
        const resultado = prepararTextoPara2Lineas(texto);
        const lineas = resultado.split('\n');
        console.log(`\nEjemplo ${index + 1}:`);
        console.log(`Original (${texto.length} chars): ${texto}`);
        console.log(`Línea 1 (${lineas[0].length} chars): ${lineas[0]}`);
        if (lineas[1]) {
            console.log(`Línea 2 (${lineas[1].length} chars): ${lineas[1]}`);
        }
        console.log(`Total líneas: ${lineas.length}`);
    });
}


// 3. REEMPLAZA completamente la función crearTablaSecccion() con altura fija:

async function crearTablaSecccion(doc, seccion, posY) {
    try {
        // Si está muy abajo, nueva página
        if (posY > 250) {
            doc.addPage();
            posY = 20;
        }
        
        // Título de sección
        doc.setFontSize(10);
        doc.text(seccion.titulo, 14, posY);
        posY += 8;
        
        // Crear tabla con altura FIJA y texto centrado
        doc.autoTable({
            startY: posY,
            head: [['Pregunta', 'Respuesta']],
            body: seccion.datos,
            theme: 'grid',
            headStyles: {
                fillColor: [52, 152, 219], 
                fontSize: 9,
                halign: 'center',
                valign: 'middle',
                fontStyle: 'bold',
                minCellHeight: 12 // Altura fija para header
            },
            columnStyles: {
                0: {
                    cellWidth: 140, // Ancho fijo para preguntas
                    fontSize: 8,
                    halign: 'left', // Alineación horizontal izquierda
                    valign: 'middle', // CENTRADO VERTICAL
                    overflow: 'linebreak',
                    cellPadding: 3,
                    lineColor: [180, 180, 180],
                    lineWidth: 0.5,
                    minCellHeight: 16 // ALTURA FIJA para 2 líneas
                },
                1: {
                    cellWidth: 25, // Ancho fijo para respuestas
                    halign: 'center', // CENTRADO HORIZONTAL
                    valign: 'middle', // CENTRADO VERTICAL
                    fontSize: 9,
                    fontStyle: 'bold',
                    lineColor: [180, 180, 180],
                    lineWidth: 0.5,
                    minCellHeight: 16 // ALTURA FIJA igual que preguntas
                }
            },
            margin: {left: 14, right: 14},
            styles: {
                fontSize: 8, 
                cellPadding: 3,
                overflow: 'linebreak',
                lineColor: [180, 180, 180],
                lineWidth: 0.5,
                valign: 'middle', // CENTRADO VERTICAL por defecto
                minCellHeight: 16, // ALTURA FIJA GLOBAL para todas las celdas
                maxCellHeight: 16  // ALTURA MÁXIMA para evitar expansión
            },
            // Configuraciones para mantener altura fija
            pageBreak: 'auto',
            showHead: 'everyPage',
            tableWidth: 'auto',
            rowPageBreak: 'avoid',
            
            // CONFIGURACIÓN CLAVE: Forzar altura fija
            didParseCell: function(data) {
                // Forzar altura fija para TODAS las celdas
                data.cell.styles.minCellHeight = 16;
                data.cell.styles.maxCellHeight = 16;
                data.cell.styles.valign = 'middle';
                data.cell.styles.overflow = 'linebreak';
                
                // Configuración específica por columna
                if (data.column.index === 0) {
                    // Columna de preguntas
                    data.cell.styles.halign = 'left';
                    data.cell.styles.cellWidth = 140;
                } else {
                    // Columna de respuestas
                    data.cell.styles.halign = 'center';
                    data.cell.styles.cellWidth = 25;
                }
            },
            
            // Asegurar que las alturas se mantengan fijas
            didDrawCell: function(data) {
                // Verificar que la altura se mantenga fija
                if (data.cell.height !== 16) {
                    data.cell.height = 16;
                }
            }
        });
        
        return doc.lastAutoTable.finalY + 10;
        
    } catch (error) {
        console.error('Error creando tabla sección:', error);
        return posY + 20;
    }
}

// 4. FUNCIÓN AUXILIAR para testing - puedes usarla para probar diferentes longitudes:

function testearLongitudTexto() {
    const ejemplos = [
        "Texto corto",
        "¿Se utilizan ayudas mecánicas para el movimiento de materiales?",
        "¿Se utilizan ayudas mecánicas (grúas, elevadores de columna, poleas) para el movimiento de materiales pesados en la planta de fabricación?",
        "¿En tareas repetitivas se utilizan herramientas diseñadas específicamente para cada tarea (p. ej., pinzas, llaves, destornilladores calibrados)?"
    ];
    
    console.log("=== TEST DE LONGITUD DE TEXTO ===");
    ejemplos.forEach((texto, index) => {
        const resultado = prepararTextoPara2Lineas(texto);
        console.log(`\nEjemplo ${index + 1}:`);
        console.log(`Original (${texto.length} chars): ${texto}`);
        console.log(`Resultado: ${resultado}`);
        console.log(`Líneas: ${resultado.split('\n').length}`);
    });
}

// 2. REEMPLAZA la función truncarTextoPregunta() con esta función de limpieza:

function limpiarTextoPregunta(texto) {
    // Solo limpiar el texto, NO truncar
    let textoLimpio = texto.trim();
    
    // Remover indicadores de método del final si existen
    textoLimpio = textoLimpio.replace(/\s+(NIOSH|REBA|RULA|OCRA)(\s+⚠️)?$/, '');
    
    // Devolver texto completo limpio
    return textoLimpio;
}

// 3. REEMPLAZA completamente la función crearTablaSecccion() con esta versión expandible:

async function crearTablaSecccion(doc, seccion, posY) {
    try {
        // Si está muy abajo, nueva página
        if (posY > 250) {
            doc.addPage();
            posY = 20;
        }
        
        // Título de sección
        doc.setFontSize(10);
        doc.text(seccion.titulo, 14, posY);
        posY += 8;
        
        // Crear tabla con altura automática y salto de línea
        doc.autoTable({
            startY: posY,
            head: [['Pregunta', 'Respuesta']],
            body: seccion.datos,
            theme: 'grid',
            headStyles: {
                fillColor: [52, 152, 219], 
                fontSize: 9,
                halign: 'center',
                valign: 'middle',
                fontStyle: 'bold'
            },
            columnStyles: {
                0: {
                    cellWidth: 140, // Ancho fijo para preguntas
                    fontSize: 8,
                    valign: 'top',
                    overflow: 'linebreak', // CLAVE: Permite salto de línea
                    cellPadding: 3,
                    lineColor: [180, 180, 180],
                    lineWidth: 0.5
                },
                1: {
                    cellWidth: 25, // Ancho fijo para respuestas
                    halign: 'center',
                    valign: 'middle',
                    fontSize: 9,
                    fontStyle: 'bold',
                    lineColor: [180, 180, 180],
                    lineWidth: 0.5
                }
            },
            margin: {left: 14, right: 14},
            styles: {
                fontSize: 8, 
                cellPadding: 3,
                overflow: 'linebreak', // IMPORTANTE: Permite texto multilínea
                lineColor: [180, 180, 180],
                lineWidth: 0.5,
                halign: 'left',
                valign: 'top',
                // CLAVE: Configuración para altura automática
                minCellHeight: 8, // Altura mínima
                cellWidth: 'auto' // Ancho automático dentro de límites
            },
            // Configuraciones específicas para altura dinámica
            pageBreak: 'auto',
            showHead: 'everyPage',
            tableWidth: 'auto',
            rowPageBreak: 'avoid', // Evita cortar filas entre páginas
            
            // CONFIGURACIÓN CLAVE: Callback para ajustar altura de celda
            didParseCell: function(data) {
                // Para todas las celdas, permitir altura automática
                data.cell.styles.overflow = 'linebreak';
                data.cell.styles.cellWidth = data.column.index === 0 ? 140 : 25;
                
                // Para la columna de preguntas (índice 0)
                if (data.column.index === 0) {
                    // Calcular altura necesaria basada en el contenido
                    const text = data.cell.text;
                    const lineCount = Array.isArray(text) ? text.length : 1;
                    
                    // Establecer altura mínima basada en número de líneas
                    const minHeight = Math.max(8, lineCount * 4);
                    data.cell.styles.minCellHeight = minHeight;
                }
            },
            
            // Configuración adicional para mejor renderizado
            didDrawCell: function(data) {
                // Asegurar que las celdas con mucho texto se rendericen correctamente
                if (data.column.index === 0 && data.cell.height < data.cell.styles.minCellHeight) {
                    data.cell.height = data.cell.styles.minCellHeight;
                }
            }
        });
        
        return doc.lastAutoTable.finalY + 10;
        
    } catch (error) {
        console.error('Error creando tabla sección:', error);
        return posY + 20;
    }
}

// 4. OPCIONAL: Si quieres más control sobre el salto de línea, añade esta función:

function preprocesarTextoParaPDF(texto, anchoMaximo = 140) {
    // Dividir texto largo en líneas para mejor control
    const words = texto.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        
        // Aproximación de caracteres por línea basada en ancho
        const maxCharsPerLine = Math.floor(anchoMaximo / 2.5); // Aproximación
        
        if (testLine.length > maxCharsPerLine && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

// 5. Si quieres usar el preprocesamiento, modifica limpiarTextoPregunta():

function limpiarTextoPreguntaAvanzado(texto) {
    // Limpiar texto
    let textoLimpio = texto.trim();
    textoLimpio = textoLimpio.replace(/\s+(NIOSH|REBA|RULA|OCRA)(\s+⚠️)?$/, '');
    
    // Opcional: preprocesar para mejor salto de línea
    // return preprocesarTextoParaPDF(textoLimpio);
    
    // O simplemente devolver texto limpio para que autoTable maneje el salto
    return textoLimpio;
}

// 2. AÑADE esta nueva función ANTES de obtenerDatosTablaSeguro():

function truncarTextoPregunta(texto) {
    // Limpiar el texto primero
    let textoLimpio = texto.trim();
    
    // Remover indicadores de método del final si existen
    textoLimpio = textoLimpio.replace(/\s+(NIOSH|REBA|RULA|OCRA)(\s+⚠️)?$/, '');
    
    // Límite de caracteres para PDF
    const LIMITE_CARACTERES = 75;
    
    if (textoLimpio.length <= LIMITE_CARACTERES) {
        return textoLimpio;
    }
    
    // Truncar en palabra completa más cercana al límite
    let textoTruncado = textoLimpio.substring(0, LIMITE_CARACTERES);
    
    // Buscar el último espacio para no cortar palabras
    const ultimoEspacio = textoTruncado.lastIndexOf(' ');
    
    if (ultimoEspacio > LIMITE_CARACTERES * 0.7) {
        textoTruncado = textoTruncado.substring(0, ultimoEspacio);
    }
    
    return textoTruncado + '...';
}

// 3. BUSCA la función crearTablaSecccion() en tu código (línea ~920)
// REEMPLAZA toda la función con esta versión mejorada:

async function crearTablaSecccion(doc, seccion, posY) {
    try {
        // Si está muy abajo, nueva página
        if (posY > 250) {
            doc.addPage();
            posY = 20;
        }
        
        // Título de sección
        doc.setFontSize(10);
        doc.text(seccion.titulo, 14, posY);
        posY += 8;
        
        // Crear tabla con configuración mejorada para texto largo
        doc.autoTable({
            startY: posY,
            head: [['Pregunta', 'Respuesta']],
            body: seccion.datos,
            theme: 'grid',
            headStyles: {
                fillColor: [52, 152, 219], 
                fontSize: 8,
                halign: 'center'
            },
            columnStyles: {
                0: {
                    cellWidth: 135, // Ancho ajustado para preguntas truncadas
                    fontSize: 7,
                    valign: 'top',
                    overflow: 'linebreak',
                    cellPadding: 2
                },
                1: {
                    cellWidth: 25, // Ancho para respuestas
                    halign: 'center',
                    valign: 'middle',
                    fontSize: 8,
                    fontStyle: 'bold'
                }
            },
            margin: {left: 14, right: 14},
            styles: {
                fontSize: 7, 
                cellPadding: 2,
                overflow: 'linebreak',
                lineColor: [200, 200, 200],
                lineWidth: 0.5
            },
            pageBreak: 'auto',
            showHead: 'everyPage',
            tableWidth: 'auto',
            rowPageBreak: 'avoid'
        });
        
        return doc.lastAutoTable.finalY + 8;
        
    } catch (error) {
        console.error('Error creando tabla sección:', error);
        return posY + 20;
    }
}

// Función para crear tabla de sección individual
async function crearTablaSecccion(doc, seccion, posY) {
    try {
        // Si está muy abajo, nueva página
        if (posY > 250) {
            doc.addPage();
            posY = 20;
        }
        
        // Título de sección
        doc.setFontSize(10);
        doc.text(seccion.titulo, 14, posY);
        posY += 8;
        
        // Crear tabla con configuración anti-stack-overflow
        doc.autoTable({
            startY: posY,
            head: [['Pregunta', 'Respuesta']],
            body: seccion.datos,
            theme: 'grid',
            headStyles: {
                fillColor: [52, 152, 219], 
                fontSize: 8
            },
            columnStyles: {
                0: {cellWidth: 145, fontSize: 7},
                1: {cellWidth: 20, halign: 'center', fontSize: 7}
            },
            margin: {left: 14, right: 14},
            styles: {
                fontSize: 7, 
                cellPadding: 1.5,
                overflow: 'linebreak'
            },
            // Configuraciones importantes para evitar stack overflow
            pageBreak: 'auto',
            showHead: 'everyPage',
            tableWidth: 'auto'
        });
        
        return doc.lastAutoTable.finalY + 8;
        
    } catch (error) {
        console.error('Error creando tabla sección:', error);
        return posY + 20;
    }
}

// Función segura para guardar PDF
async function guardarPDFSeguro(doc, nombreArchivo) {
    try {
        // Detectar entorno
        const esAndroid = /Android/i.test(navigator.userAgent);
        const esEMUI = /EMUI|HarmonyOS|Huawei/i.test(navigator.userAgent);
        
        if (esAndroid || esEMUI) {
            // Método optimizado para Android/EMUI
            const pdfData = doc.output('arraybuffer');
            const blob = new Blob([pdfData], { type: 'application/pdf' });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup después de un delay
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.getElementById('spinner').classList.add('hidden');
                alert('PDF generado correctamente en Downloads');
            }, 500);
            
        } else {
            // Método estándar para otros navegadores
            doc.save(nombreArchivo);
            document.getElementById('spinner').classList.add('hidden');
            alert('PDF generado correctamente');
        }
        
    } catch (error) {
        console.error('Error guardando PDF:', error);
        document.getElementById('spinner').classList.add('hidden');
        alert('Error al guardar PDF: ' + error.message);
    }
}
// Sistema de Gestión de Evaluaciones
// Sistema de Gestión de Evaluaciones - SOLO SUPABASE
const GestionEvaluaciones = {
    
    evaluacionActualId: null,
    obtenerPorId: async function(id) {
    try {
        const { data, error } = await window.supabase
            .from('evaluations')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data ? data.evaluation_data : null;
    } catch (error) {
        console.error('Error obteniendo evaluación por ID:', error);
        return null;
    }
},

    // Guardar evaluación directamente en Supabase
    async guardar(datos) {
        try {
            const respuestasActuales = this.obtenerRespuestas();
            console.log('🔍 Debug - Respuestas capturadas:', respuestasActuales);
            
            const evaluacion = {
                id: this.evaluacionActualId || 'eval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                fecha: new Date().toISOString(),
                fechaEvaluacion: document.getElementById('fechaEvaluacion').value,
                nombreArea: document.getElementById('nombreArea').value,
                ubicacionArea: document.getElementById('ubicacionArea').value,
                responsableArea: document.getElementById('responsableArea').value,
                score: calcularScoreFinal(),
                categoria: obtenerCategoriaRiesgo(parseFloat(calcularScoreFinal())),
                checkboxes: {
                    manipulaCargas: document.getElementById('manipulaCargas').checked,
                    usaPantallas: document.getElementById('usaPantallas').checked,
                    usaHerramientas: document.getElementById('usaHerramientas').checked,
                    mantienePosturas: document.getElementById('mantienePosturas').checked
                },
                respuestas: respuestasActuales,
                ...datos
            };
            
            console.log('💾 Guardando evaluación en Supabase:', evaluacion);
            
            // Guardar en tabla de evaluaciones
            const { data, error } = await window.supabase
                .from('evaluations')
                .upsert([{
                    id: evaluacion.id,
                    work_center_id: localStorage.getItem('selectedWorkCenterId'),
                    area_id: localStorage.getItem('selectedAreaId'),
                    score: parseFloat(evaluacion.score),
                    evaluation_data: evaluacion
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            // Actualizar centro de trabajo si existe
            const workCenterId = localStorage.getItem('selectedWorkCenterId');
            if (workCenterId) {
                await DataManager.updateWorkCenterEvaluation(workCenterId, evaluacion);
            }
            
            console.log('✅ Evaluación guardada en Supabase');
            return evaluacion.id;
            
        } catch (error) {
            console.error('❌ Error al guardar evaluación:', error);
            throw error;
        }
    },
    
    // Obtener todas las evaluaciones desde Supabase
    async obtenerTodas() {
        try {
            const { data, error } = await window.supabase
                .from('evaluations')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return data.map(item => item.evaluation_data) || [];
        } catch (error) {
            console.error('Error obteniendo evaluaciones:', error);
            return [];
        }
    },
    
    // Cargar evaluación desde Supabase
    async cargar(id) {
        try {
            const { data, error } = await window.supabase
                .from('evaluations')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            const evaluacion = data.evaluation_data;
            if (!evaluacion) {
                alert('❌ Evaluación no encontrada');
                return false;
            }
            
            this.evaluacionActualId = id;
            
            // Cargar datos básicos
            document.getElementById('fechaEvaluacion').value = evaluacion.fechaEvaluacion || '';
            document.getElementById('nombreArea').value = evaluacion.nombreArea || '';
            document.getElementById('ubicacionArea').value = evaluacion.ubicacionArea || '';
            document.getElementById('responsableArea').value = evaluacion.responsableArea || '';
            
            // Cargar checkboxes
            document.getElementById('manipulaCargas').checked = evaluacion.checkboxes?.manipulaCargas || false;
            document.getElementById('usaPantallas').checked = evaluacion.checkboxes?.usaPantallas || false;
            document.getElementById('usaHerramientas').checked = evaluacion.checkboxes?.usaHerramientas || false;
            document.getElementById('mantienePosturas').checked = evaluacion.checkboxes?.mantienePosturas || false;
            
            // Recargar preguntas
            actualizarPreguntas();
            
            // Cargar respuestas con delay
            setTimeout(() => {
                this.cargarRespuestas(evaluacion.respuestas);
                calcularScoreAutomatico();
            }, 100);
            
            window.scrollTo(0, 0);
            alert('✅ Evaluación cargada desde Supabase');
            return true;
            
        } catch (error) {
            console.error('Error cargando evaluación:', error);
            alert(`❌ Error: ${error.message}`);
            return false;
        }
    },
    
    // Eliminar evaluación de Supabase
    async eliminar(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) {
            try {
                const { error } = await window.supabase
                    .from('evaluations')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                alert('✅ Evaluación eliminada de Supabase');
                return true;
                
            } catch (error) {
                console.error('Error eliminando evaluación:', error);
                alert(`❌ Error: ${error.message}`);
                return false;
            }
        }
        return false;
    },
    
    // Obtener respuestas del formulario (sin cambios)
    obtenerRespuestas: function() {
        const respuestas = {};
        
        // Obtener todas las preguntas del formulario
        const preguntasGenerales = document.querySelectorAll('#preguntas-generales .question');
        if (preguntasGenerales.length > 0) {
            respuestas['preguntas-generales'] = {};
            preguntasGenerales.forEach((pregunta, index) => {
                const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
                const textoPregunta = pregunta.querySelector('div').textContent;
                
                respuestas['preguntas-generales'][index] = {
                    pregunta: textoPregunta,
                    respuesta: radioSeleccionado ? radioSeleccionado.value : null,
                    peso: pregunta.getAttribute('data-peso'),
                    metodo: pregunta.getAttribute('data-metodo'),
                    critica: pregunta.getAttribute('data-critica')
                };
            });
        }
        
        // Secciones condicionales
        const secciones = ['manipulaCargas', 'usaPantallas', 'usaHerramientas', 'mantienePosturas'];
        secciones.forEach(seccion => {
            const seccionElement = document.getElementById(`preguntas-${seccion}`);
            if (seccionElement) {
                const preguntasSeccion = seccionElement.querySelectorAll('.question');
                if (preguntasSeccion.length > 0) {
                    respuestas[`preguntas-${seccion}`] = {};
                    preguntasSeccion.forEach((pregunta, index) => {
                        const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
                        const textoPregunta = pregunta.querySelector('div').textContent;
                        
                        respuestas[`preguntas-${seccion}`][index] = {
                            pregunta: textoPregunta,
                            respuesta: radioSeleccionado ? radioSeleccionado.value : null,
                            peso: pregunta.getAttribute('data-peso'),
                            metodo: pregunta.getAttribute('data-metodo'),
                            critica: pregunta.getAttribute('data-critica')
                        };
                    });
                }
            }
        });
        
        return respuestas;
    },
    
    // Cargar respuestas en el formulario (sin cambios)
    cargarRespuestas: function(respuestas) {
        if (!respuestas) return;
        
        Object.keys(respuestas).forEach(seccionId => {
            const seccion = document.getElementById(seccionId);
            if (!seccion) {
                console.warn(`Sección ${seccionId} no encontrada`);
                return;
            }
            
            const preguntas = seccion.querySelectorAll('.question');
            Object.keys(respuestas[seccionId]).forEach(index => {
                const pregunta = preguntas[parseInt(index)];
                const respuestaData = respuestas[seccionId][index];
                
                if (pregunta && respuestaData && respuestaData.respuesta) {
                    const radios = pregunta.querySelectorAll('input[type="radio"]');
                    radios.forEach(radio => {
                        if (radio.value === respuestaData.respuesta) {
                            radio.checked = true;
                            radio.dispatchEvent(new Event('change'));
                        }
                    });
                }
            });
        });
        
        console.log('✅ Respuestas cargadas correctamente');
    },
    
    // Limpiar formulario
    limpiarFormulario: function() {
        document.getElementById('fechaEvaluacion').value = new Date().toISOString().split('T')[0];
        document.getElementById('nombreArea').value = '';
        document.getElementById('ubicacionArea').value = '';
        document.getElementById('responsableArea').value = '';
        
        document.getElementById('manipulaCargas').checked = false;
        document.getElementById('usaPantallas').checked = false;
        document.getElementById('usaHerramientas').checked = false;
        document.getElementById('mantienePosturas').checked = false;
        
        actualizarPreguntas();
        calcularScoreAutomatico();
    },
    
    // Nueva evaluación
    nueva: function() {
        if (confirm('¿Quieres crear una nueva evaluación? Se perderán los datos actuales no guardados.')) {
            this.evaluacionActualId = null;
            this.limpiarFormulario();
            window.scrollTo(0, 0);
        }
    }
};

// Función para guardar directamente en Supabase
async function saveEvaluationDirectly() {
    const nombreArea = document.getElementById('nombreArea').value;
    if (!nombreArea.trim()) {
        alert('❌ El nombre del área es obligatorio');
        document.getElementById('nombreArea').focus();
        return;
    }
    
    try {
        const id = await GestionEvaluaciones.guardar();
        if (id) {
            alert('✅ Evaluación guardada en Supabase correctamente');
            GestionEvaluaciones.evaluacionActualId = id;
            
            // Enviar datos a ventana padre si existe
            const workCenterId = localStorage.getItem('selectedWorkCenterId');
            if (workCenterId && window.opener && window.opener.receiveEvaluationData) {
                const evaluationData = {
                    id: id,
                    score: calcularScoreFinal(),
                    // ... otros datos necesarios
                };
                window.opener.receiveEvaluationData(evaluationData);
            }
        }
    } catch (error) {
        alert(`❌ Error guardando en Supabase: ${error.message}`);
    }
}


// Funciones globales para usar en HTML
function toggleEvaluaciones() {
    const lista = document.getElementById('listaEvaluaciones');
    const texto = document.getElementById('toggleText');
    
    if (lista.classList.contains('hidden')) {
        lista.classList.remove('hidden');
        texto.textContent = 'Ocultar Evaluaciones';
        GestionEvaluaciones.cargarListaEvaluaciones();
    } else {
        lista.classList.add('hidden');
        texto.textContent = 'Mostrar Evaluaciones';
    }
}

function filtrarEvaluaciones() {
    const busqueda = document.getElementById('buscarEvaluacion').value.toLowerCase();
    const cards = document.querySelectorAll('.evaluacion-card');
    
    cards.forEach(card => {
        const titulo = card.querySelector('.evaluacion-titulo').textContent.toLowerCase();
        const info = card.querySelector('.evaluacion-info').textContent.toLowerCase();
        
        if (titulo.includes(busqueda) || info.includes(busqueda)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function verEvaluacion(id) {
    const evaluacion = GestionEvaluaciones.obtenerPorId(id);
    if (!evaluacion) return;
    
    const fecha = new Date(evaluacion.fecha).toLocaleDateString('es-ES');
    
    const contenido = `
        <h4>${evaluacion.nombreArea || 'Sin nombre'}</h4>
        <p><strong>Ubicación:</strong> ${evaluacion.ubicacionArea || 'No especificada'}</p>
        <p><strong>Responsable:</strong> ${evaluacion.responsableArea || 'No especificado'}</p>
        <p><strong>Fecha evaluación:</strong> ${evaluacion.fechaEvaluacion || 'No especificada'}</p>
        <p><strong>Guardado:</strong> ${fecha}</p>
        <p><strong>Score:</strong> <span class="evaluacion-score ${GestionEvaluaciones.obtenerClaseScore(parseFloat(evaluacion.score))}">${evaluacion.score}%</span></p>
        <p><strong>Categoría:</strong> ${evaluacion.categoria.texto}</p>
        
        <h5>Secciones Evaluadas:</h5>
        <ul>
            ${evaluacion.checkboxes.manipulaCargas ? '<li>✅ Manipulación de cargas</li>' : '<li>❌ Manipulación de cargas</li>'}
            ${evaluacion.checkboxes.usaPantallas ? '<li>✅ Uso de pantallas</li>' : '<li>❌ Uso de pantallas</li>'}
            ${evaluacion.checkboxes.usaHerramientas ? '<li>✅ Uso de herramientas</li>' : '<li>❌ Uso de herramientas</li>'}
            ${evaluacion.checkboxes.mantienePosturas ? '<li>✅ Mantenimiento de posturas</li>' : '<li>❌ Mantenimiento de posturas</li>'}
        </ul>
    `;
    
    document.getElementById('contenidoModalVer').innerHTML = contenido;
    document.getElementById('modalVerEvaluacion').classList.remove('hidden');
}

function editarEvaluacion(id) {
    GestionEvaluaciones.cargar(id);
}

function eliminarEvaluacion(id) {
    GestionEvaluaciones.eliminar(id);
}

function exportarEvaluacionPDF(id) {
    // Cargar evaluación temporalmente
    const evaluacionOriginal = GestionEvaluaciones.evaluacionActualId;
    GestionEvaluaciones.cargar(id);
    
    // Esperar a que se cargue y exportar
    setTimeout(() => {
        exportarPDFCompleto();
        // Restaurar evaluación original si existía
        if (evaluacionOriginal) {
            GestionEvaluaciones.cargar(evaluacionOriginal);
        }
    }, 200);
}

function limpiarTodasEvaluaciones() {
    GestionEvaluaciones.limpiarTodas();
}

function cerrarModal() {
    document.getElementById('modalVerEvaluacion').classList.add('hidden');
}

function nuevaEvaluacion() {
    GestionEvaluaciones.nueva();
}

function guardarEvaluacion() {
    // Validar campos obligatorios
    const nombreArea = document.getElementById('nombreArea').value;
    if (!nombreArea.trim()) {
        alert('❌ El nombre del área es obligatorio');
        document.getElementById('nombreArea').focus();
        return;
    }
    
    const id = GestionEvaluaciones.guardar();
    if (id) {
        alert('✅ Evaluación guardada correctamente');
        GestionEvaluaciones.evaluacionActualId = id;
    } else {
        alert('❌ Error al guardar la evaluación');
    }
}

// Inicializar cuando carga la página
// Método de emergencia para cerrar modal
function forzarCerrarModal() {
    const modal = document.getElementById('modalVerEvaluacion');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
    }
}

// Test del modal
function testModal() {
    console.log('=== TEST DEL MODAL ===');
    // Crear evaluación falsa para test
    const testData = {
        id: 'test',
        nombreArea: 'Test Area',
        ubicacionArea: 'Test Location',
        responsableArea: 'Test Manager',
        fechaEvaluacion: '2025-01-01',
        fecha: new Date().toISOString(),
        score: '25.00',
        categoria: {texto: 'Test Category'},
        checkboxes: {
            manipulaCargas: true,
            usaPantallas: false,
            usaHerramientas: true,
            mantienePosturas: false
        }
    };
    
    // Simular evaluación guardada
    localStorage.setItem('test_eval', JSON.stringify(testData));
    verEvaluacion('test');
    
    setTimeout(() => {
        cerrarModal();
    }, 2000);
}

// Cerrar modal al hacer clic fuera
function cerrarModal() {
    console.log('Cerrando modal...');
    const modal = document.getElementById('modalVerEvaluacion');
    if (modal) {
        modal.classList.add('hidden');
        console.log('Modal cerrado');
    }
}

// 2. CONFIGURAR EVENTOS DEL MODAL CORRECTAMENTE
function configurarModal() {
    console.log('Configurando modal...');
    
    // Botón X del header
    const btnCerrarX = document.querySelector('.modal-close');
    if (btnCerrarX) {
        btnCerrarX.onclick = cerrarModal;
        console.log('Botón X configurado');
    }
    
    // Botón del footer
    const btnCerrarFooter = document.querySelector('.modal-footer .btn-secondary');
    if (btnCerrarFooter) {
        btnCerrarFooter.onclick = cerrarModal;
        console.log('Botón footer configurado');
    }
    
    // Click fuera del modal
    window.onclick = function(event) {
        const modal = document.getElementById('modalVerEvaluacion');
        if (event.target === modal) {
            cerrarModal();
        }
    }
    
    // Tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modalVerEvaluacion');
            if (modal && !modal.classList.contains('hidden')) {
                cerrarModal();
            }
        }
    });
    
    console.log('Modal configurado completamente');
}

// 3. EVITAR BOTONES DUPLICADOS
let botonesAgregados = false;

function agregarBotonesSiNoExisten() {
    if (botonesAgregados) {
        console.log('Botones ya fueron agregados');
        return;
    }
    
    console.log('Agregando botones...');
    
    const btnContainer = document.querySelector('.btn-container');
    if (!btnContainer) {
        console.error('Contenedor de botones no encontrado');
        return;
    }
    
    // Verificar si ya existen
    if (document.getElementById('guardarBtn')) {
        console.log('Botones ya existen');
        botonesAgregados = true;
        return;
    }
    
    // Crear botón guardar
    const btnGuardar = document.createElement('button');
    btnGuardar.className = 'btn';
    btnGuardar.id = 'guardarBtn';
    btnGuardar.innerHTML = '💾 Guardar Evaluación';
    btnGuardar.onclick = guardarEvaluacion;
    
    // Crear botón nueva
    const btnNueva = document.createElement('button');
    btnNueva.className = 'btn btn-secondary';
    btnNueva.innerHTML = '📋 Nueva Evaluación';
    btnNueva.onclick = nuevaEvaluacion;
    
    // Agregar al contenedor
    btnContainer.appendChild(btnGuardar);
    btnContainer.appendChild(btnNueva);
    
    botonesAgregados = true;
    console.log('Botones agregados correctamente');
}

// ✅ AGREGAR al final de app.js:
async function loadExistingEvaluationOnStart() {
    const workCenterId = localStorage.getItem('selectedWorkCenterId');
    const areaId = localStorage.getItem('selectedAreaId');
    
    if (!workCenterId || !areaId) return;
    
    try {
        // Cargar desde Supabase
        const workCenter = await DataManager.getWorkCenterById(workCenterId);
        
        if (workCenter && workCenter.evaluation_data) {
            console.log('Cargando evaluación existente desde Supabase:', workCenter.name);
            
            GestionEvaluaciones.evaluacionActualId = workCenter.evaluation_data.id;
            loadEvaluationData(workCenter.evaluation_data);
        } else {
            // Pre-llenar con datos del área y centro
            const area = await DataManager.getAreaById(areaId);
            
            if (area) {
                document.getElementById('nombreArea').value = area.name;
                document.getElementById('responsableArea').value = area.manager;
            }
            
            if (workCenter) {
                document.getElementById('ubicacionArea').value = `Centro: ${workCenter.name} (${workCenter.id})`;
            }
        }
    } catch (error) {
        console.error('Error cargando datos existentes:', error);
    }
}

// ✅ MANTENER SOLO ESTA (línea ~1080):
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - inicializando...');
    
    // Establecer fecha actual
    const fechaHoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaEvaluacion').value = fechaHoy;
    
    // Cargar preguntas generales
    cargarPreguntasGenerales();
    
    // Configurar eventos
    document.getElementById('manipulaCargas').addEventListener('change', actualizarPreguntas);
    document.getElementById('usaPantallas').addEventListener('change', actualizarPreguntas);
    document.getElementById('usaHerramientas').addEventListener('change', actualizarPreguntas);
    document.getElementById('mantienePosturas').addEventListener('change', actualizarPreguntas);
    
    // Configurar botones
    document.getElementById('calcularBtn').addEventListener('click', function() {
        const score = calcularScoreFinal();
        document.getElementById('scoreFinal').textContent = score + '%';
        
        const categoria = obtenerCategoriaRiesgo(parseFloat(score));
        const elementoCategoria = document.getElementById('textoCategoria');
        const elementoScore = document.getElementById('scoreFinal');
        
        elementoCategoria.textContent = categoria.texto;
        elementoScore.style.color = categoria.color;
        
        alert(`Nivel de Riesgo Ergonómico: ${score}%\n${categoria.texto}`);
    });

    document.getElementById('analizarMetodosBtn').addEventListener('click', analizarMetodosRequeridos);
    document.getElementById('exportBtn').addEventListener('click', exportarPDFCompleto);
    
    // Configurar modal y cargar datos existentes
    setTimeout(async function() {
        configurarModal();
        await loadExistingEvaluationOnStart();
    }, 500);
});

// 5. FUNCIONES DE DIAGNÓSTICO
function diagnosticarModal() {
    console.log('=== DIAGNÓSTICO MODAL ===');
    
    const modal = document.getElementById('modalVerEvaluacion');
    const btnX = document.querySelector('.modal-close');
    const btnFooter = document.querySelector('.modal-footer .btn-secondary');
    
    console.log('Modal encontrado:', !!modal);
    console.log('Botón X encontrado:', !!btnX);
    console.log('Botón footer encontrado:', !!btnFooter);
    console.log('Función cerrarModal existe:', typeof cerrarModal === 'function');
    
    if (btnX) console.log('onclick del X:', btnX.onclick);
    if (btnFooter) console.log('onclick del footer:', btnFooter.onclick);
}

function testearModal() {
    console.log('=== TEST MODAL ===');
    
    // Crear evaluación de prueba
    const evalTest = {
        id: 'test-123',
        nombreArea: 'Área de Prueba',
        ubicacionArea: 'Planta Test',
        responsableArea: 'Test Manager',
        fechaEvaluacion: '2025-01-01',
        fecha: new Date().toISOString(),
        score: '25.50',
        categoria: { texto: 'Riesgo Bajo - Test' },
        checkboxes: {
            manipulaCargas: true,
            usaPantallas: false,
            usaHerramientas: true,
            mantienePosturas: false
        }
    };
    
    // Simular evaluación guardada
    const evaluaciones = GestionEvaluaciones.obtenerTodas();
    evaluaciones.push(evalTest);
    localStorage.setItem('evaluaciones_ergonomicas', JSON.stringify(evaluaciones));
    
    // Abrir modal
    verEvaluacion('test-123');
    
    console.log('Modal abierto - prueba cerrarlo manualmente');
}

// Función para enviar datos de evaluación de vuelta al área
function sendEvaluationToArea() {
    const evaluationData = {
        id: 'eval_' + Date.now(),
        fecha: new Date().toISOString(),
        fechaEvaluacion: document.getElementById('fechaEvaluacion').value,
        nombreArea: document.getElementById('nombreArea').value,
        ubicacionArea: document.getElementById('ubicacionArea').value,
        responsableArea: document.getElementById('responsableArea').value,
        score: calcularScoreFinal(),
        categoria: obtenerCategoriaRiesgo(parseFloat(calcularScoreFinal())),
        checkboxes: {
            manipulaCargas: document.getElementById('manipulaCargas').checked,
            usaPantallas: document.getElementById('usaPantallas').checked,
            usaHerramientas: document.getElementById('usaHerramientas').checked,
            mantienePosturas: document.getElementById('mantienePosturas').checked
        },
        respuestas: GestionEvaluaciones.obtenerRespuestas()
    };
    
    // Enviar a la ventana padre si existe
    if (window.opener && window.opener.receiveEvaluationData) {
        window.opener.receiveEvaluationData(evaluationData);
        window.close();
    } else {
        // Guardar localmente si no hay ventana padre
        const workCenterId = localStorage.getItem('selectedWorkCenterId');
        if (workCenterId) {
            localStorage.setItem(`evaluation_${workCenterId}`, JSON.stringify(evaluationData));
        }
        alert('✅ Evaluación guardada correctamente');
    }
}

// Modificar el botón de guardar para usar esta función
// (Buscar donde tienes el botón de guardar y cambiar su onclick)

// AGREGAR AL FINAL DE app.js (después de todo el código existente)

// Función para cargar datos de evaluación existente al abrir formulario
function loadExistingEvaluation() {
    const workCenterId = localStorage.getItem('selectedWorkCenterId');
    const areaId = localStorage.getItem('selectedAreaId');
    
    if (!workCenterId || !areaId) return;
    
    // Cargar datos del centro de trabajo
    const workCenters = JSON.parse(localStorage.getItem(`work_centers_${areaId}`) || '[]');
    const workCenter = workCenters.find(wc => wc.id === workCenterId);
    
    if (workCenter && workCenter.evaluationData) {
        console.log('Cargando evaluación existente para:', workCenter.name);
        loadEvaluationData(workCenter.evaluationData);
    } else {
        // Pre-llenar con datos del área y centro
        const areas = JSON.parse(localStorage.getItem('ergonomic_areas') || '[]');
        const area = areas.find(a => a.id === areaId);
        
        if (area) {
            document.getElementById('nombreArea').value = area.name;
            document.getElementById('responsableArea').value = area.manager;
        }
        
        if (workCenter) {
            document.getElementById('ubicacionArea').value = `Centro: ${workCenter.name} (${workCenter.id})`;
        }
    }
}

// Función para cargar datos de evaluación en el formulario
// Función para cargar datos de evaluación en el formulario
function loadEvaluationData(evaluationData) {
    try {
        // Cargar datos básicos
        if (evaluationData.nombreArea) {
            document.getElementById('nombreArea').value = evaluationData.nombreArea;
        }
        if (evaluationData.ubicacionArea) {
            document.getElementById('ubicacionArea').value = evaluationData.ubicacionArea;
        }
        if (evaluationData.responsableArea) {
            document.getElementById('responsableArea').value = evaluationData.responsableArea;
        }
        if (evaluationData.fechaEvaluacion) {
            document.getElementById('fechaEvaluacion').value = evaluationData.fechaEvaluacion;
        }
        
        // Cargar checkboxes
        if (evaluationData.checkboxes) {
            document.getElementById('manipulaCargas').checked = evaluationData.checkboxes.manipulaCargas || false;
            document.getElementById('usaPantallas').checked = evaluationData.checkboxes.usaPantallas || false;
            document.getElementById('usaHerramientas').checked = evaluationData.checkboxes.usaHerramientas || false;
            document.getElementById('mantienePosturas').checked = evaluationData.checkboxes.mantienePosturas || false;
        }
        
        // Recargar preguntas según checkboxes
        actualizarPreguntas();
        
        // Cargar respuestas después de un delay para asegurar que las preguntas estén cargadas
        setTimeout(() => {
            if (evaluationData.respuestas) {
                GestionEvaluaciones.cargarRespuestas(evaluationData.respuestas);
            }
            calcularScoreAutomatico();
        }, 200);
        
        console.log('✅ Datos de evaluación cargados correctamente');
        
    } catch (error) {
        console.error('Error cargando datos de evaluación:', error);
    }
}

// Función para guardar directamente y comunicar con ventana padre
function saveEvaluationDirectly() {
    // Validar campos obligatorios
    const nombreArea = document.getElementById('nombreArea').value;
    if (!nombreArea.trim()) {
        alert('❌ El nombre del área es obligatorio');
        document.getElementById('nombreArea').focus();
        return;
    }
    
    // Obtener datos de evaluación
    const evaluationData = {
        id: GestionEvaluaciones.evaluacionActualId || 'eval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        fecha: new Date().toISOString(),
        fechaEvaluacion: document.getElementById('fechaEvaluacion').value,
        nombreArea: document.getElementById('nombreArea').value,
        ubicacionArea: document.getElementById('ubicacionArea').value,
        responsableArea: document.getElementById('responsableArea').value,
        score: calcularScoreFinal(),
        categoria: obtenerCategoriaRiesgo(parseFloat(calcularScoreFinal())),
        checkboxes: {
            manipulaCargas: document.getElementById('manipulaCargas').checked,
            usaPantallas: document.getElementById('usaPantallas').checked,
            usaHerramientas: document.getElementById('usaHerramientas').checked,
            mantienePosturas: document.getElementById('mantienePosturas').checked
        },
        respuestas: GestionEvaluaciones.obtenerRespuestas()
    };
    
    // Guardar localmente
    const id = GestionEvaluaciones.guardar(evaluationData);
    
    // Comunicar con ventana padre si existe
    const workCenterId = localStorage.getItem('selectedWorkCenterId');
    if (workCenterId && window.opener && window.opener.receiveEvaluationData) {
        window.opener.receiveEvaluationData(evaluationData);
        alert('✅ Evaluación guardada y enviada al centro de trabajo');
    } else {
        alert('✅ Evaluación guardada localmente');
    }
    
    if (id) {
        GestionEvaluaciones.evaluacionActualId = id;
    }
}
// Función de test para verificar que todo funciona
function testGuardadoCompleto() {
    console.log('=== TEST COMPLETO DEL SISTEMA ===');
    
    // Test 1: DataManager disponible
    console.log('DataManager disponible:', typeof window.DataManager !== 'undefined');
    
    // Test 2: Crear área de prueba
    try {
        if (window.DataManager) {
            const area = DataManager.createUniqueArea('Test Area ' + Date.now(), 'Test Manager');
            console.log('✅ Área creada:', area);
            
            // Test 3: Crear centro de trabajo
            const centro = DataManager.createUniqueWorkCenter(area.id, 'Test Center ' + Date.now());
            console.log('✅ Centro creado:', centro);
            
            // Test 4: Verificar guardado de respuestas
            const respuestas = GestionEvaluaciones.obtenerRespuestas();
            console.log('Respuestas capturadas:', respuestas);
            
            // Test 5: Limpiar test
            DataManager.deleteArea(area.id);
            console.log('✅ Test completado y limpiado');
        }
    } catch (error) {
        console.error('❌ Error en test:', error);
    }
}

window.DataManager = DataManager;

// Inicializar DataManager cuando se carga la página
