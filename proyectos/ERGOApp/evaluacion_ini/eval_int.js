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

        // 1. Primero van las variables y parámetros de URL (al inicio del script)
        const urlParams = new URLSearchParams(window.location.search);
        const workCenterId = urlParams.get('workCenter');
        const areaId = urlParams.get('area');
        const areaName = urlParams.get('areaName');
        const centerName = urlParams.get('centerName');
        const responsibleName = urlParams.get('responsible');
        let isEditMode = false;
        let originalData = null;

        // Sistema de permisos
        function getCurrentUser() {
            try {
                const userData = sessionStorage.getItem('currentUser');
                return userData ? JSON.parse(userData) : null;
            } catch (error) {
                console.error('Error obteniendo usuario:', error);
                return null;
            }
        }

        function hasPermission(action) {
            const currentUser = getCurrentUser();
            if (!currentUser) return false;

            const rango = currentUser.rango;
            
            switch (action) {
                case 'read':
                    return [1, 2, 3].includes(rango);
                case 'create':
                    return [1, 2].includes(rango);
                case 'update':
                    return [1].includes(rango);
                case 'delete':
                    return [1].includes(rango);
                default:
                    return false;
            }
        }

// Configuración para usar Supabase
const USE_SUPABASE_EVAL = true;

// Función para guardar en Supabase
async function guardarEvaluacion() {
    if (!workCenterId || !areaId) {
        console.warn('No se pueden guardar los datos: faltan parámetros de URL');
        return;
    }
    
    // Generar ID ÚNICO E INMUTABLE para esta evaluación
    const evaluacionId = `EVAL_${workCenterId}_${areaId}`;
    console.log('💾 Guardando evaluación con ID:', evaluacionId);
    
    // Recopilar todas las respuestas
    const respuestas = {};
    const preguntas = document.querySelectorAll('.question');
    
    preguntas.forEach(pregunta => {
        const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
        if (radioSeleccionado) {
            respuestas[radioSeleccionado.name] = radioSeleccionado.value;
        }
    });
    
    // Recopilar criterios seleccionados
    const criterios = {
        manipulaCargas: document.getElementById('manipulaCargas').checked,
        usaPantallas: document.getElementById('usaPantallas').checked,
        usaHerramientas: document.getElementById('usaHerramientas').checked,
        mantienePosturas: document.getElementById('mantienePosturas').checked
    };
    
    // Calcular score
    const scoreFinal = calcularScoreFinal();
    const categoria = obtenerCategoriaRiesgo(parseFloat(scoreFinal));
    
// Crear evaluación con nombres de campos que coinciden con Supabase
    const evaluacion = {
        id: evaluacionId,
        work_center_id: workCenterId,
        area_id: areaId,
        fecha_evaluacion: document.getElementById('fechaEvaluacion').value,
        nombre_area: document.getElementById('nombreArea').value,
        ubicacion_area: document.getElementById('ubicacionArea').value,
        responsable_area: document.getElementById('responsableArea').value,
        criterios: JSON.stringify(criterios),
        respuestas: JSON.stringify(respuestas),
        score_final: parseFloat(scoreFinal),
        categoria_riesgo: categoria.texto,
        nivel_riesgo_ergonomico: `${scoreFinal}%`,
        color_riesgo: categoria.color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // Guardar en localStorage con lógica mejorada
    let evaluaciones = JSON.parse(localStorage.getItem('evaluaciones')) || [];
    console.log('📊 Evaluaciones existentes:', evaluaciones.length);
    
    // Buscar por ID exacto (no por workCenterId)
    const existingIndex = evaluaciones.findIndex(e => e.id === evaluacionId);
    
        if (existingIndex !== -1) {
            // Actualizar existente
            evaluacion.created_at = evaluaciones[existingIndex].createdAt || evaluaciones[existingIndex].created_at; // Mantener fecha original
            evaluaciones[existingIndex] = evaluacion;
            console.log('🔄 Evaluación actualizada:', evaluacionId);
        } else {
        // Crear nueva
        evaluaciones.push(evaluacion);
        console.log('🆕 Nueva evaluación creada:', evaluacionId);
    }
    
    localStorage.setItem('evaluaciones', JSON.stringify(evaluaciones));
    console.log('✅ Evaluación guardada exitosamente');
    

    // DEBUG: Verificar datos antes de enviar a Supabase
    console.log('🔍 DEBUG: Datos a guardar en Supabase:', evaluacion);
    console.log('🔍 DEBUG: USE_SUPABASE_EVAL:', USE_SUPABASE_EVAL);
    console.log('🔍 DEBUG: workCenterId:', workCenterId);
    // Guardar en Supabase
    if (USE_SUPABASE_EVAL) {
        try {
            console.log('💾 Intentando guardar en Supabase...');
            const existingEval = await supabase.getEvaluaciones(workCenterId);
            console.log('🔍 Evaluación existente encontrada:', existingEval);
            
            if (existingEval && existingEval.length > 0) {
                console.log('🔄 Actualizando evaluación existente...');
                const result = await supabase.updateEvaluacion(existingEval[0].id, evaluacion);
                console.log('✅ Actualización resultado:', result);
            } else {
                console.log('🆕 Creando nueva evaluación...');
                const result = await supabase.createEvaluacion(evaluacion);
                console.log('✅ Creación resultado:', result);
            }
        } catch (error) {
            console.error('❌ Error guardando en Supabase:', error);
            alert('Error al guardar en base de datos: ' + error.message);
        }
    }
    
    // Notificar actualización
    if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({
            type: 'evaluacionActualizada',
            workCenterId: workCenterId,
            score: scoreFinal,
            categoria: categoria.texto
        }, '*');
    }
}
// Función para cargar desde Supabase
        async function cargarEvaluacionSupabase(workCenterId) {
            if (USE_SUPABASE_EVAL) {
                try {
                    // Buscar evaluación específica por work_center_id
                    const evaluaciones = await supabase.getEvaluaciones(workCenterId);
                    console.log('🔍 Búsqueda Supabase para workCenter:', workCenterId, 'Resultado:', evaluaciones);
                    
                    if (evaluaciones && evaluaciones.length > 0) {
                        console.log('✅ Evaluación encontrada en Supabase');
                        return evaluaciones[0];
                    } else {
                        console.log('🆕 No hay evaluación previa en Supabase');
                        return null;
                    }
                } catch (error) {
                    console.error('❌ Error cargando desde Supabase:', error);
                    return null;
                }
            }
            console.log('🚫 Supabase deshabilitado');
            return null;
        }

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
                    {pregunta: "¿Se utilizan ayudas mecánicas (grúas, elevadores de columna, poleas) para el movimiento de materiales pesados?", peso: 3, metodo: 'NIOSH', critica: true},
                    {pregunta: "¿Se han sustituido tareas de manipulación manual con sistemas automáticos como bandas transportadoras o transferencias neumáticas?", peso: 3},
                    {pregunta: "¿Los materiales se dividen en cargas menores (<25 kg según ISO 11228-1) para facilitar su manipulación segura?", peso: 3, metodo: 'NIOSH', critica: true},
                    {pregunta: "¿Los contenedores tienen asas ergonómicas, puntos de agarre visibles y permiten un agarre firme sin rotación de muñeca?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Se han nivelado zonas de transferencia para evitar diferencias de altura en carga y descarga manual?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Las tareas de alimentación y retiro de materiales se hacen horizontalmente mediante empuje o tracción, no mediante levantamiento?", peso: 3, metodo: 'NIOSH', critica: true},
                    {pregunta: "¿Las tareas de manipulación evitan posiciones forzadas como inclinaciones o torsiones de tronco?", peso: 3, metodo: 'REBA', critica: true},
                    {pregunta: "¿Los trabajadores mantienen las cargas pegadas al cuerpo y por debajo del nivel de los hombros durante el transporte manual?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Las tareas manuales repetitivas se realizan durante más de 2 horas continuas sin variación?", peso: 3, metodo: 'OCRA', critica: true},
                    {pregunta: "¿El levantamiento y depósito de materiales se realiza con movimientos controlados, en el plano frontal del cuerpo y sin rotación?", peso: 3, metodo: 'NIOSH'},
                    {pregunta: "¿Para trayectos largos se utilizan mochilas, bolsas simétricas o medios que distribuyan la carga en ambos lados del cuerpo?", peso: 2},
                    {pregunta: "¿Las tareas de manipulación pesada se alternan con tareas más ligeras para evitar fatiga acumulativa?", peso: 2, metodo: 'OCRA'}
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
                    {pregunta: "¿Las herramientas de precisión ofrecen soporte ergonómico para la muñeca o el dorso de la mano?", peso: 3, metodo: 'RULA', critica: true},
                    {pregunta: "¿El peso de las herramientas está reducido al mínimo sin comprometer su funcionalidad?", peso: 2},
                    {pregunta: "¿Las herramientas requieren una fuerza mínima para ser operadas, considerando la variabilidad de los operadores?", peso: 3, metodo: 'RULA'},
                    {pregunta: "¿Los mangos de las herramientas tienen forma, diámetro y longitud adecuados al tamaño de la mano promedio del operador?", peso: 3, metodo: 'RULA'},
                    {pregunta: "¿Se cuenta con superficies antideslizantes o retenedores para evitar deslizamiento o pellizcos en el uso de herramientas?", peso: 2},
                    {pregunta: "¿Se han validado herramientas con bajo nivel de vibración y ruido conforme al perfil de riesgo del puesto?", peso: 3},
                    {pregunta: "¿Cada herramienta tiene su ubicación asignada en estaciones 5S o shadow boards?", peso: 2},
                    {pregunta: "¿Las estaciones de trabajo permiten una postura estable y ergonómica para usar herramientas con seguridad?", peso: 3, metodo: 'RULA', critica: true},
                    {pregunta: "¿Se han tomado medidas para reducir la vibración en equipos y herramientas?", peso: 3},
                    {pregunta: "¿Las herramientas y máquinas se mantienen en condiciones que reduzcan el esfuerzo auditivo del operador?", peso: 2}
                ],
                mantienePosturas: [
                    {pregunta: "¿Los operadores de menor estatura alcanzan controles y materiales sin forzar su postura?", peso: 2, metodo: 'REBA', critica: true},
                    {pregunta: "¿Los operadores altos tienen espacio suficiente para movimientos sin restricciones?", peso: 2},
                    {pregunta: "¿Se permite alternar entre estar de pie y sentado, dependiendo del tipo de tarea?", peso: 2, metodo: 'REBA', critica: true},
                    {pregunta: "¿Se dispone de sillas o banquetas para pausas cortas en tareas prolongadas de pie?", peso: 2},
                    {pregunta: "¿Las sillas para trabajos sentados son ajustables y tienen respaldo ergonómico?", peso: 3},
                    {pregunta: "¿Las superficies de trabajo permiten alternar tareas con objetos grandes y pequeños?", peso: 2},
                    {pregunta: "¿Se realiza rotación de tareas entre actividades con diferente exigencia física dentro del turno?", peso: 3, metodo: 'OCRA', critica: true},
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

        // Función que se ejecuta cuando carga la página
        document.addEventListener('DOMContentLoaded', function() {
            // Establecer fecha actual en el campo de fecha
            const fechaHoy = new Date().toISOString().split('T')[0];
            document.getElementById('fechaEvaluacion').value = fechaHoy;

            setTimeout(async () => {
                if (workCenterId && areaId) {
                    await cargarDatosExistentes();
                }
            }, 100);
            
            // Cargar preguntas generales
            cargarPreguntasGenerales();
            
            // Configurar eventos para checkboxes de secciones condicionales
            document.getElementById('manipulaCargas').addEventListener('change', actualizarPreguntas);
            document.getElementById('usaPantallas').addEventListener('change', actualizarPreguntas);
            document.getElementById('usaHerramientas').addEventListener('change', actualizarPreguntas);
            document.getElementById('mantienePosturas').addEventListener('change', actualizarPreguntas);
            
            // Configurar eventos para botones
            document.getElementById('calcularBtn').addEventListener('click', function() {
                const score = calcularScoreFinal();
                document.getElementById('scoreFinal').textContent = score + '%';
                
                // Actualizar categoría y mostrar alerta
                const categoria = obtenerCategoriaRiesgo(parseFloat(score));
                const elementoCategoria = document.getElementById('textoCategoria');
                const elementoScore = document.getElementById('scoreFinal');
                
                elementoCategoria.textContent = categoria.texto;
                elementoScore.style.color = categoria.color;
                // Mostrar información del centro de trabajo
                const displayWorkCenter = document.getElementById('displayWorkCenter');
                const displayAreaName = document.getElementById('displayAreaName');
                if (displayWorkCenter && workCenterId) displayWorkCenter.textContent = workCenterId;
                if (displayAreaName) displayAreaName.textContent = document.getElementById('nombreArea').value || 'No especificada';

                // Cambiar color de fondo del contenedor según el riesgo
                const resultadoContainer = document.getElementById('resultadoScore');
                if (resultadoContainer) {
                    resultadoContainer.style.backgroundColor = categoria.color + '20'; // Color con transparencia
                    resultadoContainer.style.borderLeft = `5px solid ${categoria.color}`;
                }
                
                alert(`Nivel de Riesgo Ergonómico: ${score}%\n${categoria.texto}`);
            });

            // Nuevo evento para analizar métodos requeridos
            document.getElementById('analizarMetodosBtn').addEventListener('click', analizarMetodosRequeridos);
            
            document.getElementById('exportBtn').addEventListener('click', exportarPDFCompleto);
            // Event listeners para botones de modo
            document.getElementById('editBtn').addEventListener('click', enterEditMode);
            document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
            document.getElementById('saveBtn').addEventListener('click', saveEvaluation);
        });

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
                    background-color: #f8f9fa;
                    color: #6c757d;
                    border: 1px solid #dee2e6;
                    padding: 1px 4px;
                    border-radius: 2px;
                    font-size: 9px;
                    margin-left: 8px;
                    font-weight: normal;
                `;
                metodoSpan.textContent = metodo.charAt(0); // Solo la inicial
                if (critica) {
                    metodoSpan.style.color = '#dc3545';
                    metodoSpan.style.borderColor = '#dc3545';
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

            // Generar tarjetas de métodos
            if (Object.keys(metodosDetectados).length === 0) {
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
        
        // Funciones para manejar modos
function enterViewMode() {
    isEditMode = false;
    document.body.classList.add('view-mode');
    document.getElementById('view-mode-banner').classList.remove('hidden');
    document.getElementById('edit-mode-banner').classList.add('hidden');
    document.getElementById('view-mode-buttons').classList.remove('hidden');
    document.getElementById('edit-mode-buttons').classList.add('hidden');
    
    const inputs = document.querySelectorAll('.input-field, .checkbox-input, .radio-input');
    inputs.forEach(input => input.disabled = true);
}

function enterEditMode() {
    isEditMode = true;
    
    // Guardar estado actual
    originalData = {
        nombreArea: document.getElementById('nombreArea').value,
        ubicacionArea: document.getElementById('ubicacionArea').value,
        responsableArea: document.getElementById('responsableArea').value,
        fechaEvaluacion: document.getElementById('fechaEvaluacion').value,
        manipulaCargas: document.getElementById('manipulaCargas').checked,
        usaPantallas: document.getElementById('usaPantallas').checked,
        usaHerramientas: document.getElementById('usaHerramientas').checked,
        mantienePosturas: document.getElementById('mantienePosturas').checked,
        respuestas: {}
    };
    
    const preguntas = document.querySelectorAll('.question');
    preguntas.forEach(pregunta => {
        const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
        if (radioSeleccionado) {
            originalData.respuestas[radioSeleccionado.name] = radioSeleccionado.value;
        }
    });
    
    document.body.classList.remove('view-mode');
    document.getElementById('view-mode-banner').classList.add('hidden');
    document.getElementById('edit-mode-banner').classList.remove('hidden');
    document.getElementById('view-mode-buttons').classList.add('hidden');
    document.getElementById('edit-mode-buttons').classList.remove('hidden');
    
    const inputs = document.querySelectorAll('.input-field, .checkbox-input, .radio-input');
    inputs.forEach(input => input.disabled = false);
}

        function cancelEdit() {
            if (!originalData) {
                enterViewMode();
                return;
            }
            
            document.getElementById('nombreArea').value = originalData.nombreArea;
            document.getElementById('ubicacionArea').value = originalData.ubicacionArea;
            document.getElementById('responsableArea').value = originalData.responsableArea;
            document.getElementById('fechaEvaluacion').value = originalData.fechaEvaluacion;
            document.getElementById('manipulaCargas').checked = originalData.manipulaCargas;
            document.getElementById('usaPantallas').checked = originalData.usaPantallas;
            document.getElementById('usaHerramientas').checked = originalData.usaHerramientas;
            document.getElementById('mantienePosturas').checked = originalData.mantienePosturas;
            
            actualizarPreguntas();
            
            setTimeout(() => {
                if (evaluacion.respuestas) {
                    Object.keys(evaluacion.respuestas).forEach(key => {
                        const radio = document.querySelector(`input[name="${key}"][value="${evaluacion.respuestas[key]}"]`);
                        if (radio) radio.checked = true;
                    });
                }
                calcularScoreAutomatico();
                
                // Solo permitir edición si tiene permisos
                if (hasPermission('update')) {
                    enterViewMode();
                } else {
                    // Modo solo lectura permanente para usuarios sin permisos
                    isEditMode = false;
                    document.body.classList.add('view-mode');
                    document.getElementById('view-mode-buttons').classList.add('hidden');
                    document.getElementById('edit-mode-buttons').classList.add('hidden');
                    
                    // Mostrar solo botón de exportar
                    const readOnlyButtons = document.createElement('div');
                    readOnlyButtons.innerHTML = `
                        <button class="btn" onclick="exportarPDFCompleto()">📄 Exportar PDF</button>
                    `;
                    document.querySelector('.btn-container').appendChild(readOnlyButtons);
                    
                    const inputs = document.querySelectorAll('.input-field, .checkbox-input, .radio-input');
                    inputs.forEach(input => input.disabled = true);
                }
            }, 100);
        }

        function saveEvaluation() {
            guardarEvaluacion();
            alert('✅ Evaluación guardada exitosamente');
            enterViewMode();
        }
        
        // Función para guardar evaluación en localStorage

function inicializarEvaluacionBlanco() {
    // Limpiar completamente todos los campos - SIN datos de URL
    document.getElementById('nombreArea').value = '';
    document.getElementById('ubicacionArea').value = '';
    document.getElementById('responsableArea').value = '';
    
    // NO cargar NADA de URL - debe estar completamente en blanco
    
    // Limpiar todos los checkboxes
    document.getElementById('manipulaCargas').checked = false;
    document.getElementById('usaPantallas').checked = false;
    document.getElementById('usaHerramientas').checked = false;
    document.getElementById('mantienePosturas').checked = false;
    
    // Limpiar todas las preguntas
    const preguntas = document.querySelectorAll('.question input[type="radio"]');
    preguntas.forEach(radio => radio.checked = false);
    
    // Actualizar preguntas (esto limpiará las secciones condicionales)
    actualizarPreguntas();
    
    // Resetear score
    document.getElementById('scoreFinal').textContent = '0%';
    document.getElementById('textoCategoria').textContent = 'Sin evaluar';
    
    // Iniciar en modo edición si tiene permisos
    if (hasPermission('create') || hasPermission('update')) {
        isEditMode = true;
        document.body.classList.remove('view-mode');
        document.getElementById('view-mode-banner').classList.add('hidden');
        document.getElementById('edit-mode-banner').classList.remove('hidden');
        document.getElementById('view-mode-buttons').classList.add('hidden');
        document.getElementById('edit-mode-buttons').classList.remove('hidden');
        
        const inputs = document.querySelectorAll('.input-field, .checkbox-input, .radio-input');
        inputs.forEach(input => input.disabled = false);
    } else {
        enterViewMode();
        const inputs = document.querySelectorAll('.input-field, .checkbox-input, .radio-input');
        inputs.forEach(input => input.disabled = true);
    }
}


function cargarEvaluacionExistente(evaluacion) {
    // Cargar datos guardados
    document.getElementById('nombreArea').value = evaluacion.nombreArea || evaluacion.nombre_area || '';
    document.getElementById('ubicacionArea').value = evaluacion.ubicacionArea || evaluacion.ubicacion_area || '';
    document.getElementById('responsableArea').value = evaluacion.responsableArea || evaluacion.responsable_area || '';
    document.getElementById('fechaEvaluacion').value = evaluacion.fechaEvaluacion || evaluacion.fecha_evaluacion || '';
    
    // Cargar criterios
    if (evaluacion.criterios) {
        document.getElementById('manipulaCargas').checked = evaluacion.criterios.manipulaCargas || false;
        document.getElementById('usaPantallas').checked = evaluacion.criterios.usaPantallas || false;
        document.getElementById('usaHerramientas').checked = evaluacion.criterios.usaHerramientas || false;
        document.getElementById('mantienePosturas').checked = evaluacion.criterios.mantienePosturas || false;
    }
    
    // Actualizar preguntas y cargar respuestas
    actualizarPreguntas();
    
    setTimeout(() => {
        if (evaluacion.respuestas) {
            Object.keys(evaluacion.respuestas).forEach(key => {
                const radio = document.querySelector(`input[name="${key}"][value="${evaluacion.respuestas[key]}"]`);
                if (radio) radio.checked = true;
            });
        }
        calcularScoreAutomatico();
        
        // Solo permitir edición si tiene permisos
        if (hasPermission('update')) {
            enterViewMode();
        } else {
            // Modo solo lectura permanente
            isEditMode = false;
            document.body.classList.add('view-mode');
            document.getElementById('view-mode-buttons').classList.add('hidden');
            document.getElementById('edit-mode-buttons').classList.add('hidden');
            
            const readOnlyButtons = document.createElement('div');
            readOnlyButtons.innerHTML = `<button class="btn" onclick="exportarPDFCompleto()">📄 Exportar PDF</button>`;
            document.querySelector('.btn-container').appendChild(readOnlyButtons);
            
            const inputs = document.querySelectorAll('.input-field, .checkbox-input, .radio-input');
            inputs.forEach(input => input.disabled = true);
        }
    }, 100);
}

// REEMPLAZAR toda la función cargarDatosExistentes()
async function cargarDatosExistentes() {
    // Intentar cargar desde Supabase primero
    let evaluacion = await cargarEvaluacionSupabase(workCenterId);
    
    // Fallback a localStorage
    if (!evaluacion) {
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones')) || [];
        evaluacion = evaluaciones.find(e => e.workCenterId === workCenterId);
    }
    
    if (evaluacion) {
        // Manejar ambos formatos de nombres de campos
        document.getElementById('nombreArea').value = evaluacion.nombreArea || evaluacion.nombre_area || '';
        document.getElementById('ubicacionArea').value = evaluacion.ubicacionArea || evaluacion.ubicacion_area || '';
        document.getElementById('responsableArea').value = evaluacion.responsableArea || evaluacion.responsable_area || '';
        document.getElementById('fechaEvaluacion').value = evaluacion.fechaEvaluacion || evaluacion.fecha_evaluacion || '';
        
        // Cargar criterios
        if (evaluacion.criterios) {
        // Cargar criterios con parsing seguro
        let criterios = {};
        if (evaluacion.criterios) {
            try {
                criterios = typeof evaluacion.criterios === 'string' ? 
                        JSON.parse(evaluacion.criterios) : evaluacion.criterios;
            } catch (e) {
                console.warn('Error parsing criterios:', e);
                criterios = {};
            }
            
            document.getElementById('manipulaCargas').checked = criterios.manipulaCargas || false;
            document.getElementById('usaPantallas').checked = criterios.usaPantallas || false;
            document.getElementById('usaHerramientas').checked = criterios.usaHerramientas || false;
            document.getElementById('mantienePosturas').checked = criterios.mantienePosturas || false;
        }
        }
        
        // Actualizar preguntas y cargar respuestas
        actualizarPreguntas();
        
        setTimeout(() => {
        // Cargar respuestas con parsing seguro
        let respuestas = {};
        if (evaluacion.respuestas) {
            try {
                respuestas = typeof evaluacion.respuestas === 'string' ? 
                            JSON.parse(evaluacion.respuestas) : evaluacion.respuestas;
            } catch (e) {
                console.warn('Error parsing respuestas:', e);
                respuestas = {};
            }
            
            Object.keys(respuestas).forEach(key => {
                const radio = document.querySelector(`input[name="${key}"][value="${respuestas[key]}"]`);
                if (radio) radio.checked = true;
            });
        }
            calcularScoreAutomatico();
            enterViewMode();
        }, 100);
        
        console.log('✅ Evaluación existente cargada');
    } else {
        // NO EXISTE EVALUACIÓN - Cargar datos básicos desde URL si están disponibles
        if (centerName) document.getElementById('nombreArea').value = decodeURIComponent(centerName);
        if (areaName) document.getElementById('ubicacionArea').value = decodeURIComponent(areaName);
        if (responsibleName) document.getElementById('responsableArea').value = decodeURIComponent(responsibleName);
        
        console.log('ℹ️ Nueva evaluación - datos básicos cargados desde URL');
    }
}

function cargarEvaluacionExistente(evaluacion) {
    // Cargar datos guardados
    document.getElementById('nombreArea').value = evaluacion.nombreArea || evaluacion.nombre_area || '';
    document.getElementById('ubicacionArea').value = evaluacion.ubicacionArea || evaluacion.ubicacion_area || '';
    document.getElementById('responsableArea').value = evaluacion.responsableArea || evaluacion.responsable_area || '';
    document.getElementById('fechaEvaluacion').value = evaluacion.fechaEvaluacion || evaluacion.fecha_evaluacion || '';
    
    // Cargar criterios
    if (evaluacion.criterios) {
        document.getElementById('manipulaCargas').checked = evaluacion.criterios.manipulaCargas || false;
        document.getElementById('usaPantallas').checked = evaluacion.criterios.usaPantallas || false;
        document.getElementById('usaHerramientas').checked = evaluacion.criterios.usaHerramientas || false;
        document.getElementById('mantienePosturas').checked = evaluacion.criterios.mantienePosturas || false;
    }
    
    // Actualizar preguntas y cargar respuestas
    actualizarPreguntas();
    
    setTimeout(() => {
        if (evaluacion.respuestas) {
            Object.keys(evaluacion.respuestas).forEach(key => {
                const radio = document.querySelector(`input[name="${key}"][value="${evaluacion.respuestas[key]}"]`);
                if (radio) radio.checked = true;
            });
        }
        calcularScoreAutomatico();
        
        // Solo permitir edición si tiene permisos
        if (hasPermission('update')) {
            enterViewMode();
        } else {
            // Modo solo lectura permanente
            isEditMode = false;
            document.body.classList.add('view-mode');
            document.getElementById('view-mode-buttons').classList.add('hidden');
            document.getElementById('edit-mode-buttons').classList.add('hidden');
            
            const readOnlyButtons = document.createElement('div');
            readOnlyButtons.innerHTML = `<button class="btn" onclick="exportarPDFCompleto()">📄 Exportar PDF</button>`;
            document.querySelector('.btn-container').appendChild(readOnlyButtons);
            
            const inputs = document.querySelectorAll('.input-field, .checkbox-input, .radio-input');
            inputs.forEach(input => input.disabled = true);
        }
    }, 100);
}

        // Función mejorada para exportar PDF con recomendaciones de métodos
        function exportarPDFCompleto() {
            guardarEvaluacion();
            // Mostrar spinner
            document.getElementById('spinner').classList.remove('hidden');
            
            try {
                // Obtener datos del área
                const nombreArea = document.getElementById('nombreArea').value || 'No especificado';
                const ubicacionArea = document.getElementById('ubicacionArea').value || 'No especificada';
                const responsableArea = document.getElementById('responsableArea').value || 'No especificado';
                const fechaEvaluacion = document.getElementById('fechaEvaluacion').value || new Date().toLocaleDateString();
                
                // Crear nombre de archivo con fecha y hora para que sea único
                const fechaHora = new Date().toISOString().replace(/[:.]/g, '-');
                const nombreArchivo = `${fechaHora}_Evaluacion_Integrada_${nombreArea.replace(/\s+/g, '_')}.pdf`;
                
                // Inicializar jsPDF
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Añadir título
                doc.setFontSize(16);
                doc.text('Reporte de Evaluación Ergonómica Integrada', 105, 15, {align: 'center'});
                
                // Sección compacta de información
                doc.setFontSize(10);
                doc.text(`Área: ${nombreArea} | Ubicación: ${ubicacionArea} | Responsable: ${responsableArea}`, 14, 25);
                doc.text(`Fecha evaluación: ${fechaEvaluacion} | Generado: ${new Date().toLocaleDateString()}`, 14, 31);
                
                // Score y métodos en una línea compacta
                const score = calcularScoreFinal();
                doc.setFontSize(12);
                doc.text(`Riesgo Ergonómico: ${score}%`, 14, 42);

                // Analizar y mostrar métodos de forma compacta
                const preguntas = document.querySelectorAll('.question');
                const metodosDetectados = {};
                
                preguntas.forEach(pregunta => {
                    const metodo = pregunta.getAttribute('data-metodo');
                    const critica = pregunta.getAttribute('data-critica') === 'true';
                    const radioSeleccionado = pregunta.querySelector('input[type="radio"]:checked');
                    const respuesta = radioSeleccionado ? radioSeleccionado.value : null;
                    
                    if (metodo && respuesta === 'no') {
                        if (!metodosDetectados[metodo]) {
                            metodosDetectados[metodo] = { count: 0, criticas: 0 };
                        }
                        metodosDetectados[metodo].count++;
                        if (critica) metodosDetectados[metodo].criticas++;
                    }
                });

                // Métodos recomendados de forma muy compacta
                if (Object.keys(metodosDetectados).length > 0) {
                    let metodosTexto = 'Métodos recomendados: ';
                    Object.entries(metodosDetectados).forEach(([metodo, data], index) => {
                        const inicial = metodo.charAt(0);
                        const prioridad = data.criticas > 0 ? '!' : data.count > 2 ? '*' : '';
                        metodosTexto += `${inicial}${prioridad}`;
                        if (index < Object.keys(metodosDetectados).length - 1) metodosTexto += ', ';
                    });
                    doc.setFontSize(9);
                    doc.text(metodosTexto, 14, 50);
                } else {
                    doc.setFontSize(9);
                    doc.text('Métodos: Seguimiento rutinario', 14, 50);
                }

                // Añadir la sección de métodos recomendados al PDF
                // BUSCA esta sección en tu código (línea aproximada 650-700):
// "// Añadir la sección de métodos recomendados al PDF"

// REEMPLAZA desde "const metodosContainer = document.getElementById('metodosRecomendados');" 
// hasta "posY += 5;" con este código mejorado:

                const metodosContainer = document.getElementById('metodosRecomendados');
                let posY = 65;
                
                if (!metodosContainer.classList.contains('hidden')) {
                    // Crear tabla para métodos recomendados
                    const metodoCards = document.querySelectorAll('.metodo-card');
                    if (metodoCards.length > 0) {
                        const metodosData = [];
                        
                        metodoCards.forEach(card => {
                            const titulo = card.querySelector('.metodo-title').textContent.replace('🎯 ', '');
                            const justificacionCompleta = card.querySelector('.metodo-justification').textContent;
                            const prioridad = card.querySelector('.metodo-priority').textContent;
                            
                            // Extraer solo la información esencial
                            const razonMatch = justificacionCompleta.match(/Razón: (.+?)(?=Factores|$)/);
                            const razon = razonMatch ? razonMatch[1].trim() : 'Múltiples indicadores';
                            
                            // Crear fila para la tabla
                            metodosData.push([
                                titulo,
                                razon,
                                prioridad
                            ]);
                        });
                        
                        // Crear tabla compacta y profesional
                        doc.autoTable({
                            startY: posY,
                            head: [['Método Recomendado', 'Justificación', 'Prioridad']],
                            body: metodosData,
                            theme: 'striped',
                            headStyles: {
                                fillColor: [52, 152, 219],
                                textColor: 255,
                                fontSize: 10,
                                fontStyle: 'bold',
                                halign: 'center'
                            },
                            bodyStyles: {
                                fontSize: 9,
                                cellPadding: 4
                            },
                            columnStyles: {
                                0: {cellWidth: 60, fontStyle: 'bold', valign: 'middle'},
                                1: {cellWidth: 90, valign: 'top'},
                                2: {
                                    cellWidth: 30, 
                                    halign: 'center', 
                                    valign: 'middle',
                                    fontStyle: 'bold'
                                }
                            },
                            alternateRowStyles: {
                                fillColor: [249, 249, 249]
                            },
                            margin: {left: 14, right: 14},
                            didDrawCell: function(data) {
                                // Colorear las celdas de prioridad según el tipo
                                if (data.column.index === 2) {
                                    const prioridad = data.cell.text[0];
                                    if (prioridad === 'OBLIGATORIO') {
                                        data.cell.styles.fillColor = [231, 76, 60];
                                        data.cell.styles.textColor = 255;
                                    } else if (prioridad === 'RECOMENDADO') {
                                        data.cell.styles.fillColor = [243, 156, 18];
                                        data.cell.styles.textColor = 255;
                                    } else if (prioridad === 'OPCIONAL') {
                                        data.cell.styles.fillColor = [39, 174, 96];
                                        data.cell.styles.textColor = 255;
                                    }
                                }
                            }
                        });
                        
                        posY = doc.lastAutoTable.finalY + 15;
                        
                        // Añadir nota explicativa
                        doc.setFontSize(8);
                        doc.setTextColor(100, 100, 100);
                        doc.text('Nota: Aplicar métodos según prioridad. OBLIGATORIO requiere implementación inmediata.', 14, posY);
                        posY += 10;
                    }
                } else {
                    // Si no hay métodos específicos, añadir nota
                    doc.setFontSize(10);
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    posY += 20;
                }

                // Recopilar datos para las tablas
                let tablasDatos = [];
                
                // Añadir preguntas generales
                tablasDatos.push({
                    titulo: 'Criterios Generales',
                    datos: obtenerDatosTabla('preguntas-generales')
                });
                
                // Añadir secciones condicionales
                if (document.getElementById('manipulaCargas').checked) {
                    tablasDatos.push({
                        titulo: 'Manipulación de Cargas',
                        datos: obtenerDatosTabla('preguntas-manipulaCargas')
                    });
                }
                
                if (document.getElementById('usaPantallas').checked) {
                    tablasDatos.push({
                        titulo: 'Uso de Pantallas',
                        datos: obtenerDatosTabla('preguntas-usaPantallas')
                    });
                }
                
                if (document.getElementById('usaHerramientas').checked) {
                    tablasDatos.push({
                        titulo: 'Uso de Herramientas',
                        datos: obtenerDatosTabla('preguntas-usaHerramientas')
                    });
                }
                
                if (document.getElementById('mantienePosturas').checked) {
                    tablasDatos.push({
                        titulo: 'Mantenimiento de Posturas',
                        datos: obtenerDatosTabla('preguntas-mantienePosturas')
                    });
                }
                
                // Crear tablas para cada sección
                tablasDatos.forEach(seccion => {
                    // Si la posición es muy baja, añadir nueva página
                    if (posY > 250) {
                        doc.addPage();
                        posY = 20;
                    }
                    
                    // Añadir título de sección
                    doc.setFontSize(11);
                    doc.text(seccion.titulo, 14, posY);
                    posY += 8;
                    
                    // Crear tabla usando autotable
                    doc.autoTable({
                        startY: posY,
                        head: [['Pregunta', 'Respuesta']],
                        body: seccion.datos,
                        theme: 'grid',
                        headStyles: {fillColor: [52, 152, 219], fontSize: 9},
                        columnStyles: {
                            0: {cellWidth: 150, fontSize: 8},
                            1: {cellWidth: 25, halign: 'center', fontSize: 8}
                        },
                        margin: {left: 14, right: 14},
                        styles: {fontSize: 8, cellPadding: 2}
                    });
                    
                    // Actualizar posición Y para la siguiente tabla
                    posY = doc.lastAutoTable.finalY + 10;
                });
                
                // Guardar el PDF
                if (window.cordova) {
                    // Para entorno Cordova/Android
                    const pdfOutput = doc.output('arraybuffer');
                    const dirDestino = cordova.file.externalDataDirectory;
                    
                    window.resolveLocalFileSystemURL(dirDestino, function(dir) {
                        dir.getFile(nombreArchivo, {create: true}, function(file) {
                            file.createWriter(function(writer) {
                                writer.onwriteend = function() {
                                    // Ocultar spinner
                                    document.getElementById('spinner').classList.add('hidden');
                                    
                                    // Mostrar ruta y abrir el archivo
                                    alert(`PDF guardado en: ${dirDestino}${nombreArchivo}`);
                                    
                                    // Abrir el PDF con una aplicación externa
                                    if (cordova.plugins && cordova.plugins.fileOpener2) {
                                        cordova.plugins.fileOpener2.open(
                                            file.toURL(),
                                            'application/pdf',
                                            {
                                                error: function() {
                                                    alert('El archivo se ha guardado, pero no se pudo abrir automáticamente.');
                                                },
                                                success: function() {
                                                    console.log('PDF abierto correctamente');
                                                }
                                            }
                                        );
                                    }
                                };
                                
                                writer.onerror = function(e) {
                                    document.getElementById('spinner').classList.add('hidden');
                                    alert('Error al escribir el archivo: ' + JSON.stringify(e));
                                };
                                
                                // Escribir el contenido del PDF
                                const blob = new Blob([pdfOutput], {type: 'application/pdf'});
                                writer.write(blob);
                            });
                        });
                    });
                } else {
                    // Para navegador web
                    doc.save(nombreArchivo);
                    document.getElementById('spinner').classList.add('hidden');
                    alert('PDF generado correctamente');
                    // Notificar actualización del score después de exportar
                    if (window.parent && window.parent.postMessage) {
                        const score = calcularScoreFinal();
                        const categoria = obtenerCategoriaRiesgo(parseFloat(score));
                        window.parent.postMessage({
                            type: 'evaluacionActualizada',
                            workCenterId: workCenterId,
                            score: score,
                            categoria: categoria.texto
                        }, '*');
                    }
                }
            } catch (error) {
                console.error('Error al generar PDF:', error);
                alert('Error al generar el PDF: ' + error.message);
                document.getElementById('spinner').classList.add('hidden');
            }
        }