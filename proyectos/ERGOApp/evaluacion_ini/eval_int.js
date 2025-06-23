       import data from '../componentes/cuestionario-data.js';

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

// Configuración para usar Supabase
const USE_SUPABASE_EVAL = window.ERGOConfig.USE_SUPABASE;

async function guardarEvaluacion() {
    if (!workCenterId || !areaId) {
        console.warn('No se pueden guardar los datos: faltan parámetros de URL');
        ERGOUtils.showToast('Error: Faltan identificadores del centro de trabajo.', 'error');
        return;
    }
    
    const evaluacionId = `EVAL_${workCenterId}_${areaId}`;
    console.log('💾 Guardando evaluación con ID:', evaluacionId);
    
    const respuestas = {};
    document.querySelectorAll('.question input[type="radio"]:checked').forEach(radio => {
        respuestas[radio.name] = radio.value;
    });
    
    const criterios = {
        manipulaCargas: document.getElementById('manipulaCargas').checked,
        usaPantallas: document.getElementById('usaPantallas').checked,
        usaHerramientas: document.getElementById('usaHerramientas').checked,
        mantienePosturas: document.getElementById('mantienePosturas').checked
    };
    
    const resultadosPictogramas = ERGOAnalytics.analizarRiesgosPorPictograma(respuestas, data);

    // 2. Calcular el score global a partir de los scores de los pictogramas
    const scoresIndividuales = Object.values(resultadosPictogramas)
                                    .filter(p => p.score) // Filtra los que no son scores (como 'resumen')
                                    .map(p => p.score);

    const scoreFinal = scoresIndividuales.length > 0
        ? (scoresIndividuales.reduce((a, b) => a + b, 0) / scoresIndividuales.length).toFixed(2)
        : 0;

    const categoria = ERGOUtils.getScoreCategory(parseFloat(scoreFinal));
    const analisisRiesgo = window.ERGOAnalytics.analizarRiesgosPorPictograma(respuestas, data);

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
            score_final: parseFloat(scoreFinal), // Usa el nuevo scoreFinal calculado
            categoria_riesgo: categoria.texto, // Usa la nueva categoría calculada
            nivel_riesgo_ergonomico: `${scoreFinal}%`,
            color_riesgo: categoria.color,
            riesgos_por_categoria: resultadosPictogramas, // <-- CAMPO NUEVO Y CRÍTICO
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    
    // --- Lógica de guardado dual (Supabase y LocalStorage) ---
    // Primero, siempre guardar localmente para consistencia inmediata.
    guardarLocalmente(evaluacion, evaluacionId);

    // Luego, intentar guardar en Supabase.
    if (window.ERGOConfig.USE_SUPABASE && window.supabase) {
        try {
            console.log('💾 Intentando guardar en Supabase...');
            const existente = await supabase.getEvaluacionPorId(evaluacionId); // Usando el método preciso
            
            if (existente) {
                console.log('🔄 Actualizando evaluación existente en Supabase...');
                await supabase.updateEvaluacion(evaluacionId, evaluacion);
            } else {
                console.log('🆕 Creando nueva evaluación en Supabase...');
                // La fecha de creación solo se añade si es un registro nuevo en la BD
                evaluacion.created_at = new Date().toISOString();
                await supabase.createEvaluacion(evaluacion);
            }
            console.log('✅ Evaluación sincronizada con Supabase.');
            ERGOUtils.showToast('Evaluación guardada en la nube.', 'success');
        } catch (error) {
            console.error('❌ Error guardando en Supabase:', error);
            ERGOUtils.showToast(`Error de red, los datos se guardaron localmente.`, 'error');
        }
    }

    if (USE_SUPABASE_EVAL) {
    try {
        // ... (código existente para crear o actualizar la evaluación) ...
        console.log('✅ Creación/Actualización resultado:', result);

        // AÑADE ESTA LLAMADA JUSTO AQUÍ
        await actualizarResumenDePictogramasPorArea(evaluacion.area_id);

    } catch (error) {
        // ...
    }
}
}

// Asegúrate de que esta función auxiliar también esté en eval_int.js
function guardarLocalmente(evaluacion, evaluacionId) {
    let evaluaciones = ERGOStorage.getLocal('evaluaciones', []);
    const existingIndex = evaluaciones.findIndex(e => e.id === evaluacionId);
    
    if (existingIndex !== -1) {
        evaluacion.created_at = evaluaciones[existingIndex].created_at; // Mantener fecha original
        evaluaciones[existingIndex] = evaluacion;
        console.log('🔄 Evaluación actualizada localmente:', evaluacionId);
    } else {
        evaluacion.created_at = new Date().toISOString();
        evaluaciones.push(evaluacion);
        console.log('🆕 Nueva evaluación creada localmente:', evaluacionId);
    }
    
    ERGOStorage.setLocal('evaluaciones', evaluaciones);
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
                const categoria = ERGOUtils.getScoreCategory(parseFloat(score));
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
            const categoria = ERGOUtils.getScoreCategory(parseFloat(score));
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

            const categoria = ERGOUtils.getScoreCategory(parseFloat(score));
            const elementoCategoria = document.getElementById('textoCategoria');
            const elementoScore = document.getElementById('scoreFinal');

            elementoCategoria.textContent = categoria.texto;
            elementoScore.style.color = categoria.color;

            mostrarPictogramasActivos();
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


async function cargarDatosExistentes() {
    if (!workCenterId) {
        console.log("ℹ️ No hay workCenterId, iniciando evaluación en blanco.");
        // Aquí podrías llamar a una función que prepare un formulario vacío si es necesario.
        enterEditMode(); // O la función que corresponda para una nueva evaluación.
        return;
    }

    console.log(`🔍 Buscando evaluación para Work Center: ${workCenterId}`);
    let evaluacion = null;
    let origenDatos = '';

    // 1. Prioridad 1: Intentar cargar desde Supabase
    if (USE_SUPABASE_EVAL) {
        evaluacion = await cargarEvaluacionSupabase(workCenterId);
        if (evaluacion) {
            origenDatos = 'Supabase';
        }
    }

    // 2. Prioridad 2: Fallback a localStorage si Supabase falla o está deshabilitado
    if (!evaluacion) {
        const evaluacionesStorage = ERGOStorage.getLocal('evaluaciones', []);
        // Búsqueda más flexible, compatible con claves antiguas
        evaluacion = evaluacionesStorage.find(e => e.work_center_id === workCenterId || e.workCenterId === workCenterId);
        if (evaluacion) {
            origenDatos = 'LocalStorage';
        }
    }

    // 3. Procesar los datos si se encontraron
    if (evaluacion) {
        console.log(`✅ Datos encontrados. Origen: ${origenDatos}`);
        poblarFormularioConDatos(evaluacion);
    } else {
        console.log("🆕 No se encontró evaluación existente. Cargando datos básicos desde URL para una nueva evaluación.");
        // Cargar datos básicos de la URL para una nueva evaluación
        if (centerName) document.getElementById('nombreArea').value = decodeURIComponent(centerName);
        if (areaName) document.getElementById('ubicacionArea').value = decodeURIComponent(areaName);
        if (responsibleName) document.getElementById('responsableArea').value = decodeURIComponent(responsibleName);
        enterEditMode();
    }
}

// NUEVA FUNCIÓN AUXILIAR para poblar el formulario y mantener el código limpio
function poblarFormularioConDatos(evaluacionData) {
    // Manejar ambos formatos de nombres de campos (snake_case de Supabase, camelCase de JS)
    document.getElementById('nombreArea').value = evaluacionData.nombre_area || evaluacionData.nombreArea || '';
    document.getElementById('ubicacionArea').value = evaluacionData.ubicacion_area || evaluacionData.ubicacionArea || '';
    document.getElementById('responsableArea').value = evaluacionData.responsable_area || evaluacionData.responsableArea || '';
    document.getElementById('fechaEvaluacion').value = evaluacionData.fecha_evaluacion || evaluacionData.fechaEvaluacion || new Date().toISOString().split('T')[0];

    // Parseo seguro de JSON para Criterios
    let criterios = {};
    if (evaluacionData.criterios) {
        try {
            criterios = typeof evaluacionData.criterios === 'string' ? JSON.parse(evaluacionData.criterios) : evaluacionData.criterios;
        } catch (e) {
            console.warn('Error al parsear criterios:', e);
        }
    }
    document.getElementById('manipulaCargas').checked = criterios.manipulaCargas || false;
    document.getElementById('usaPantallas').checked = criterios.usaPantallas || false;
    document.getElementById('usaHerramientas').checked = criterios.usaHerramientas || false;
    document.getElementById('mantienePosturas').checked = criterios.mantienePosturas || false;

    // Actualizar las preguntas que se muestran en la UI
    actualizarPreguntas();

    // Usar setTimeout para asegurar que los elementos del DOM condicionales se hayan creado
    setTimeout(() => {
        // Parseo seguro de JSON para Respuestas
        let respuestas = {};
        if (evaluacionData.respuestas) {
            try {
                respuestas = typeof evaluacionData.respuestas === 'string' ? JSON.parse(evaluacionData.respuestas) : evaluacionData.respuestas;
            } catch (e) {
                console.warn('Error al parsear respuestas:', e);
            }
        }
        Object.keys(respuestas).forEach(key => {
            const radio = document.querySelector(`input[name="${key}"][value="${respuestas[key]}"]`);
            if (radio) radio.checked = true;
        });

        // Calcular score y mostrar pictogramas guardados
        calcularScoreAutomatico();
        if (evaluacionData.riesgos_por_categoria) {
            actualizarVistaPictogramas(evaluacionData.riesgos_por_categoria);
        }
        
        enterViewMode();
    }, 200); // Aumentado ligeramente para mayor seguridad
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
                        const categoria = ERGOUtils.getScoreCategory(parseFloat(score));
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
        
// En eval_int.js, reemplaza la función completa
function mostrarPictogramasActivos() {
    const respuestas = {};
    document.querySelectorAll('.question input[type="radio"]:checked').forEach(radio => {
        respuestas[radio.name] = radio.value;
    });

    // Llama a nuestro motor de análisis para obtener el estado de cada pictograma
    const analisis = window.ERGOAnalytics.analizarRiesgosPorPictograma(respuestas, data);
    
    const container = document.getElementById('pictogramas-activos-list');
    const mainContainer = document.getElementById('pictogramas-resultado-container');
    container.innerHTML = ''; // Limpiar resultados anteriores

    let pictogramasActivos = 0;
    for (const [id, resultado] of Object.entries(analisis)) {
        if (id === 'resumen') continue; // Ignorar el objeto de resumen

        // Solo mostrar pictogramas que tengan un riesgo (score > 0)
        if (resultado.activo) {
            pictogramasActivos++;
            const pictogramaInfo = window.ERGOAnalytics.pictogramasConfig[id];
            const item = document.createElement('div');
            item.className = `pictograma-item ${resultado.color}`;
            
            // --- LÍNEA CORREGIDA ---
            // Esta es la sintaxis correcta para crear el HTML dinámicamente.
            // Usa `${...}` para insertar variables dentro del texto.
            item.innerHTML = `<div class="pictograma-icon">${id}</div><div>${pictogramaInfo.nombre}</div>`;
            
            container.appendChild(item);
        }
    }

    // Oculta o muestra el contenedor principal si hay o no pictogramas activos
    mainContainer.classList.toggle('hidden', pictogramasActivos === 0);
}

async function actualizarResumenDePictogramasPorArea(areaId) {
    if (!areaId) return;

    console.log(`🔄 Recalculando resumen de pictogramas para el área: ${areaId}`);
    try {
        // 1. Obtener TODAS las evaluaciones para esta área
        const todasLasEvaluacionesDelArea = await supabase.getEvaluacionesPorArea(areaId);

        if (!todasLasEvaluacionesDelArea) {
            console.warn("No se pudieron obtener evaluaciones para el área.");
            return;
        }

        // 2. Contar todos los pictogramas
        const resumen = {};
        todasLasEvaluacionesDelArea.forEach(ev => {
            if (ev.riesgos_por_categoria) {
                for (const key in ev.riesgos_por_categoria) {
                    if (!resumen[key]) {
                        resumen[key] = {
                            count: 0,
                            nombre: ev.riesgos_por_categoria[key].nombre,
                            pictograma: ev.riesgos_por_categoria[key].pictograma
                        };
                    }
                    resumen[key].count++;
                }
            }
        });
        
        console.log("📊 Resumen de pictogramas calculado:", resumen);

        // 3. Guardar el nuevo resumen en la tabla 'areas'
        await supabase.updateArea(areaId, { resumen_pictogramas: resumen });
        console.log(`✅ Resumen para el área ${areaId} actualizado en Supabase.`);

    } catch (error) {
        console.error("Error al actualizar el resumen de pictogramas:", error);
    }
}