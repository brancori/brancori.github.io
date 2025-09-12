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

        ERGOUtils.getScoreCategory = function(score) {
    // Asegura que el score sea un número para comparar
    const numericScore = parseFloat(score);

    // Si el score no es un número válido, devuelve un color neutral
    if (isNaN(numericScore)) {
        return { texto: 'Inválido', color: '#808080' }; // Gris
    }

    // Lógica de Riesgo Alto (Rojo)
    if (numericScore >= 60) {
        return { texto: 'Riesgo Alto', color: '#e74c3c' }; // Rojo
    } 
    // Lógica de Riesgo Medio (Naranja)
    else if (numericScore >= 25 && numericScore < 60) {
        return { texto: 'Riesgo Medio', color: '#f39c12' }; // Naranja
    } 
    // Lógica de Riesgo Bajo (Verde)
    else {
        return { texto: 'Riesgo Bajo', color: '#2ecc71' }; // Verde
    }
};

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
    
    // --- INICIO DE LA CORRECCIÓN ---
    // 1. Usamos la función correcta que ya existe para obtener el score.
    const scoreFinal = calcularScoreFinal(); 
    // --- FIN DE LA CORRECCIÓN ---

    const categoria = ERGOUtils.getScoreCategory(parseFloat(scoreFinal));
    const resultadosPictogramas = ERGOAnalytics.analizarRiesgosPorPictograma(respuestas, data);

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
        score_final: parseFloat(scoreFinal), // Ahora sí usará el valor correcto.
        categoria_riesgo: categoria.texto,
        nivel_riesgo_ergonomico: `${scoreFinal}%`,
        color_riesgo: categoria.color,
        riesgos_por_categoria: resultadosPictogramas,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    console.log("🔵 Objeto a guardar:", JSON.stringify(evaluacion, null, 2));

    // Lógica de guardado dual (sin cambios aquí, ya es correcta)
    guardarLocalmente(evaluacion, evaluacionId);

    if (window.ERGOConfig.USE_SUPABASE && window.ERGOEvalSupa) {
        const result = await window.ERGOEvalSupa.guardarEvaluacionEnSupabase(evaluacion);
        if (result.success) {
            ERGOUtils.showToast('Evaluación sincronizada con la nube.', 'success');
        } else {
            ERGOUtils.showToast('Datos guardados localmente. Revise su conexión.', 'error');
        }
    }
}

// Asegúrate de que esta función auxiliar también esté en eval_int.js
function guardarLocalmente(evaluacion, evaluacionId) {
    let evaluaciones = ERGOStorage.getItem('evaluaciones', []);
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
    
    ERGOStorage.setItem('evaluaciones', evaluaciones);
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
            if (!window.ERGOAuth || !window.ERGOAuth.initializeAuthContext()) {
                console.error("Fallo de autenticación o ERGOAuth no está listo. Redirigiendo...");
                if (window.ERGOAuth && window.ERGOAuth.redirectToLogin) {
                    window.ERGOAuth.redirectToLogin();
                } else {
                    // Fallback manual con la ruta correcta (dos niveles arriba)
                    window.location.href = '../index.html'; 
                }
                return;
            }
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
            document.getElementById('exportBtnView').addEventListener('click', exportarPDFCompleto);
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
                    <input type="radio" name="${categoria}-${index}" class="radio-input" value="si"> Sí
                </label>
                <label class="radio-label">
                    <input type="radio" name="${categoria}-${index}" class="radio-input" value="no"> No
                </label>
                <label class="radio-label">
                    <input type="radio" name="${categoria}-${index}" class="radio-input" value="na"> N/A
                </label>
            `;
            
            questionDiv.appendChild(preguntaDiv);
            questionDiv.appendChild(optionsDiv);
                const radios = questionDiv.querySelectorAll('.radio-input');
                radios.forEach(radio => {
                    radio.addEventListener('change', calcularScoreAutomatico);
                });
            
            return questionDiv;
        }

        // Función para calcular score automáticamente
        function calcularScoreAutomatico() {
            try {
                // 1. Llama a la NUEVA función que hace todo el cálculo.
                const resultados = analizarResultados();

                // 2. Actualiza los elementos de la UI con los nuevos valores calculados.
                const scoreFinalEl = document.getElementById('scoreFinal');
                const textoCategoriaEl = document.getElementById('textoCategoria');

                if (scoreFinalEl) {
                    scoreFinalEl.textContent = `${resultados.scoreFinal}%`;
                    scoreFinalEl.style.color = resultados.colorRiesgo;
                }
                if (textoCategoriaEl) {
                    textoCategoriaEl.textContent = resultados.categoriaRiesgo;
                }

                const resultadoContainer = document.getElementById('resultadoScore');
                if (resultadoContainer) {
                    resultadoContainer.style.backgroundColor = resultados.colorRiesgo + '20'; // Color con transparencia
                    resultadoContainer.style.borderLeft = `5px solid ${resultados.colorRiesgo}`;
                }

                // Llamamos a la función para mostrar los pictogramas
                mostrarPictogramasActivos();

                console.log(`🔄 Score recalculado automáticamente: ${resultados.scoreFinal}%`);

            } catch (error) {
                console.error('Error en el cálculo automático del score:', error);
            }
        }

        function analizarResultados() {
        // 1. Calcular el score numérico final
        const score = calcularScoreFinal();
        
        // 2. Obtener la categoría de riesgo (texto y color) a partir del score
        const categoria = ERGOUtils.getScoreCategory(parseFloat(score));

        // 3. Recolectar las respuestas actuales del formulario
        const respuestas = {};
        document.querySelectorAll('.question input[type="radio"]:checked').forEach(radio => {
            respuestas[radio.name] = radio.value;
        });

        // 4. Analizar los pictogramas de riesgo
        const resultadosPictogramas = ERGOAnalytics.analizarRiesgosPorPictograma(respuestas, data);

        // 5. Devolver un objeto completo con todos los resultados
        return {
            scoreFinal: score,
            categoriaRiesgo: categoria.texto,
            colorRiesgo: categoria.color,
            resultadosPictogramas: resultadosPictogramas,
            nivelRiesgoErgonomico: `${score}%` 
        };
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
window.ERGOImageCache = {};

async function precargarFotos(fotosUrls) {
    const promises = fotosUrls.map(async url => {
        if (!window.ERGOImageCache[url]) {
            const imgData = await cargarImagenOptimizada(url);
            if (imgData) {
                window.ERGOImageCache[url] = imgData; // guarda base64 en cache
            }
        }
        return window.ERGOImageCache[url] || null;
    });
    return Promise.all(promises);
}

async function cargarDatosExistentes() {
    if (!workCenterId) {
        console.log("ℹ️ No hay workCenterId, iniciando evaluación en blanco.");
        enterEditMode();
        return;
    }

    console.log(`🔍 Buscando evaluación para Work Center: ${workCenterId}`);
    let evaluacion = null;
    let origenDatos = '';

    // 1. Prioridad 1: Supabase
    if (USE_SUPABASE_EVAL) {
        evaluacion = await window.ERGOEvalSupa.cargarEvaluacionDesdeSupabase(workCenterId);
        if (evaluacion) origenDatos = 'Supabase';
    }

    // 2. LocalStorage
    if (!evaluacion) {
        const evaluacionesLocales = ERGOStorage.getItem('evaluaciones', []);
        evaluacion = evaluacionesLocales.find(
            e => e.id === `EVAL_${workCenterId}_${areaId}` || e.work_center_id === workCenterId
        );
        if (evaluacion) origenDatos = 'LocalStorage';
    }

    // 3. Procesar datos
    if (evaluacion) {
        console.log(`✅ Datos encontrados. Origen: ${origenDatos}`);
        poblarFormularioConDatos(evaluacion);

        // 🔥 PRE-CARGA DE FOTOS DESDE AQUÍ
        const fotosUrls = evaluacion.fotos || [];
        if (Array.isArray(fotosUrls) && fotosUrls.length > 0) {
            await precargarFotos(fotosUrls);
            console.log("✅ Fotos precargadas en cache");
        }

    } else {
        console.log("🆕 No se encontró evaluación existente. Cargando datos básicos desde URL para una nueva evaluación.");
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
        
        enterViewMode();
    }, 200); // Aumentado ligeramente para mayor seguridad
}

/**
 * Función auxiliar para cargar imágenes de forma asíncrona.
 * Es crucial para no bloquear la generación del PDF mientras se cargan los logos.
 * @param {string} url - La ruta de la imagen.
 * @returns {Promise<HTMLImageElement|null>}
 */

async function loadLogoCandidate(src) {
    if (!src) return null;

    // Si viene de ERGOUtils.getLogoImage() puede ser: HTMLImageElement, dataURL o URL string
    if (typeof src === 'string') {
        // dataURL -> devolver tal cual
        if (src.startsWith('data:')) return src;
        // URL -> intentar optimizar (devuelve dataURL) y si falla intentar cargar como Image
        const optimized = await cargarImagenOptimizada(src).catch(() => null);
        if (optimized) return optimized;
        // fallback a Image element
        return await new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    // Si es un elemento HTMLImageElement ya listo
    if (src instanceof HTMLImageElement) return src;

    return null;
}

function cargarImagen(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
            console.error(`No se pudo cargar la imagen: ${url}`);
            resolve(null);
        };
        img.src = url;
    });
}
        // Función mejorada para exportar PDF con recomendaciones de métodos
 // Función corregida para exportar PDF con manejo de errores de Supabase Storage
async function exportarPDFCompleto() {
    document.getElementById('spinner').classList.remove('hidden');

    try {
        // Recolección de datos
        const nombreArea = document.getElementById('nombreArea').value || 'No especificado';
        const ubicacionArea = document.getElementById('ubicacionArea').value || 'No especificada';
        const responsableArea = document.getElementById('responsableArea').value || 'No especificado';
        const fechaEvaluacion = document.getElementById('fechaEvaluacion').value || new Date().toLocaleDateString();

        // Evaluación desde storage
        const evaluacionId = `EVAL_${workCenterId}_${areaId}`;
        const evaluaciones = ERGOStorage.getItem('evaluaciones', []);
        const evaluacionActual = evaluaciones.find(e => e.id === evaluacionId);

        const scoreFinal = evaluacionActual ? evaluacionActual.score_final : calcularScoreFinal();
        const categoriaRiesgo = evaluacionActual ? evaluacionActual.categoria_riesgo : ERGOUtils.getScoreCategory(parseFloat(scoreFinal)).texto;
        const colorRiesgo = evaluacionActual ? evaluacionActual.color_riesgo : ERGOUtils.getScoreCategory(parseFloat(scoreFinal)).color;
        const AREA = 'Área';
        const nombreArchivo = `${nombreArea.replace(/\s+/g, '_')}_${ubicacionArea.replace(/\s+/g, '_')}.pdf`;


        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let posY = 20;

        // --- CABECERA: intentar primero ERGOUtils.getLogoImage() y si no está, probar rutas relativas ---
        let logoErgoApp = null;
        let logoSiresi = null;

        try {
            let candidateLogo = null;
            if (window.ERGOUtils && typeof window.ERGOUtils.getLogoImage === 'function') {
                candidateLogo = window.ERGOUtils.getLogoImage();
            }
            // cargar candidato y fallback a rutas
            logoErgoApp = await loadLogoCandidate(candidateLogo);



            // Siresi (intenta rutas comunes)
            logoSiresi = await loadLogoCandidate('./assets/siresi_logo.jpg')
                       || await loadLogoCandidate('../assets/siresi_logo.jpg')
                       || await loadLogoCandidate('/assets/siresi_logo.jpg');

        } catch (err) {
            console.warn('No se pudo obtener logos con loadLogoCandidate:', err);
        }

        // Fondo y logos
        doc.setFillColor(255, 255, 255);

        if (logoSiresi) {
            if (typeof logoSiresi === 'string') {
                const fmt = logoSiresi.startsWith('data:image/png') ? 'PNG' : 'JPEG';
                doc.addImage(logoSiresi, fmt, 170, 8, 25, 8);
            } else {
                doc.addImage(logoSiresi, 'JPEG', 170, 8, 25, 8);
            }
        }
        
        

        // Título y línea
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text('EVALUACIÓN INICIAL DE', 105, 12, { align: 'center' });
        doc.text('ERGONOMÍA', 105, 18, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(52, 152, 219);
        doc.line(14, 25, 196, 25);

        // Información principal
        posY = 35;
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(33, 37, 41);
        const nombreCentro = centerName ? decodeURIComponent(centerName) : nombreArea;
        doc.text(nombreCentro.toUpperCase(), 105, posY, { align: 'center' });
        posY += 10;

        // Sección en dos columnas: izquierda info, derecha score
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        
// --- Información detallada con negritas ---
        const startX = 14;
        const lineHeight = 6; // Espacio entre líneas
        doc.setFontSize(10);

        // Función auxiliar para medir texto
        const getTextWidth = (text) => doc.getTextWidth(text);

        // Línea 1: Área
        doc.setFont('helvetica', 'bold');
        doc.text('Área:', startX, posY);
        doc.setFont('helvetica', 'normal');
        doc.text(nombreArea, startX + getTextWidth('Área: '), posY);
        posY += lineHeight;

        // Línea 2: Ubicación
        doc.setFont('helvetica', 'bold');
        doc.text('Ubicación:', startX, posY);
        doc.setFont('helvetica', 'normal');
        doc.text(ubicacionArea, startX + getTextWidth('Ubicación: '), posY);
        posY += lineHeight;

        // Línea 3: Responsable y Fecha
        let currentX = startX;
        doc.setFont('helvetica', 'bold');
        doc.text('Responsable:', currentX, posY);
        currentX += getTextWidth('Responsable: ');
        doc.setFont('helvetica', 'normal');
        doc.text(responsableArea, currentX, posY);
        currentX += getTextWidth(responsableArea) + getTextWidth(' | ');
        doc.setFont('helvetica', 'bold');
        doc.text('Fecha:', currentX, posY);
        currentX += getTextWidth('Fecha: ');
        doc.setFont('helvetica', 'normal');
        doc.text(fechaEvaluacion, currentX, posY);
        posY += lineHeight;

        // Línea 4: Evaluador y Planta
        currentX = startX;
        doc.setFont('helvetica', 'bold');
        doc.text('Evaluador:', currentX, posY);
        currentX += getTextWidth('Evaluador: ');
        doc.setFont('helvetica', 'normal');
        doc.text('Brandon Cortes', currentX, posY);
        currentX += getTextWidth('Brandon Cortes') + getTextWidth(' | ');
        doc.setFont('helvetica', 'bold');
        doc.text('Planta:', currentX, posY);
        currentX += getTextWidth('Planta: ');
        doc.setFont('helvetica', 'normal');
        doc.text('Huejotzingo Puebla.', currentX, posY);

        // Score Final en la derecha
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255); // Texto blanco
        doc.setFillColor(colorRiesgo);   // Fondo según riesgo
        doc.roundedRect(150, posY - 5, 45, 15, 3, 3, 'F');
        doc.text(`${scoreFinal}%`, 172, posY + 2, { align: 'center' });
        doc.setFontSize(6);
        doc.text(`${categoriaRiesgo}`, 172, posY + 9, { align: 'center' });

        posY += 25;

        // --- TABLAS DE PREGUNTAS (igual que antes) ---
        const tablasDatos = [];
        tablasDatos.push({ titulo: 'Criterios Generales', datos: obtenerDatosTabla('preguntas-generales') });
        if (document.getElementById('manipulaCargas').checked) tablasDatos.push({ titulo: 'Manipulación de Cargas', datos: obtenerDatosTabla('preguntas-manipulaCargas')});
        if (document.getElementById('usaPantallas').checked) tablasDatos.push({ titulo: 'Uso de Pantallas', datos: obtenerDatosTabla('preguntas-usaPantallas')});
        if (document.getElementById('usaHerramientas').checked) tablasDatos.push({ titulo: 'Uso de Herramientas', datos: obtenerDatosTabla('preguntas-usaHerramientas')});
        if (document.getElementById('mantienePosturas').checked) tablasDatos.push({ titulo: 'Mantenimiento de Posturas', datos: obtenerDatosTabla('preguntas-mantienePosturas')});

        tablasDatos.forEach(seccion => {
            if (seccion.datos && seccion.datos.length > 0) {
                if (posY > 250) { doc.addPage(); posY = 20; }
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(33, 37, 41);
                doc.text(seccion.titulo, 14, posY);
                posY += 8;

                doc.autoTable({
                    startY: posY,
                    head: [['Pregunta', 'Respuesta']],
                    body: seccion.datos,
                    theme: 'grid',
                    headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
                     styles: {fontSize: 8, cellPadding: 2, fillColor: [255, 255, 255]},
                     columnStyles: { 1: {cellWidth: 25, halign: 'center'} },
                    margin: { left: 14, right: 14 }
                });
                posY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : posY + 10;
            }
        });

        // --- FOTOS: primero intentamos supabase (si existe dataClient), si no, fallback a evaluacionActual.fotos / localStorage ---
        let fotosUrls = [];

        try {
            if (window.dataClient && typeof window.dataClient.query === 'function' && workCenterId) {
                // Consulta Supabase como en eval_int_fotos.js
                const fotos = await window.dataClient.query('fotos_centros', 'GET', null, `?work_center_id=eq.${workCenterId}&area_id=eq.${areaId}&select=foto_url`);
                if (Array.isArray(fotos) && fotos.length) {
                    fotosUrls = fotos.map(f => `${window.ERGOConfig.SUPABASE_URL}/storage/v1/object/public/fotos-centros/${f.foto_url}`);
                }
            }
        } catch (e) {
            console.warn('No se pudo consultar fotos desde dataClient:', e);
        }

        // Fallback: fotos en evaluacionActual (pueden ser URLs o nombres de archivo)
        if (!fotosUrls.length) {
            const fotosFromEval = evaluacionActual?.fotos || (JSON.parse(localStorage.getItem('currentEvaluation') || '{}')).fotos || [];
            if (Array.isArray(fotosFromEval) && fotosFromEval.length) {
                fotosUrls = fotosFromEval.map(f => {
                    if (typeof f !== 'string') return null;
                    if (f.startsWith('http') || f.startsWith('data:')) return f;
                    // si es solo nombre de archivo, construir URL pública de Supabase si existe
                    if (window.ERGOConfig && window.ERGOConfig.SUPABASE_URL) {
                        return `${window.ERGOConfig.SUPABASE_URL}/storage/v1/object/public/fotos-centros/${f}`;
                    }
                    return f;
                }).filter(Boolean);
            }
        }

        // Cargar y optimizar todas las fotos (cargarImagenOptimizada devuelve dataURL JPEG)
        if (fotosUrls.length > 0) {
            const imagePromises = fotosUrls.map(url => cargarImagenOptimizada(url));
            const loadedImages = (await Promise.all(imagePromises)).filter(Boolean);

            if (loadedImages.length > 0) {
    if (posY > 240) { doc.addPage(); posY = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41);
    doc.text('EVIDENCIA FOTOGRÁFICA', 14, posY);
    posY += 10;

    const margin = 14;
    const gap = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - (margin * 2);
    const boxWidth = (availableWidth - gap) / 2;
    const maxBoxHeight = 80;

    let x_coord = margin;

    for (let i = 0; i < loadedImages.length; i++) {
        const imgData = loadedImages[i];
        if (posY + maxBoxHeight > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            posY = 20;
            x_coord = margin;
        }

        agregarImagenConAspecto(doc, imgData, x_coord, posY, boxWidth, maxBoxHeight);

        if ((i + 1) % 2 === 0) {
            posY += maxBoxHeight + gap;
            x_coord = margin;
        } else {
            x_coord += boxWidth + gap;
        }
    }
}
        }

        // Guardar PDF
        doc.save(nombreArchivo);
        ERGOUtils.showToast('✅ Reporte generado con éxito', 'success');

    } catch (error) {
        console.error('Error al generar PDF:', error);
        ERGOUtils.showToast(`Error al generar el PDF: ${error?.message || error}`, 'error');
    } finally {
        document.getElementById('spinner').classList.add('hidden');
    }
}

    
// aquí inicia
/**
 * Agrega una imagen al documento PDF manteniendo su relación de aspecto.
 * @param {jsPDF} doc - La instancia del documento jsPDF.
 * @param {string} imageData - Los datos de la imagen (ej. en base64).
 * @param {number} x - Coordenada X donde iniciar a dibujar.
 * @param {number} y - Coordenada Y donde iniciar a dibujar.
 * @param {number} maxWidth - El ancho máximo que la imagen debe ocupar.
 */


function agregarImagenConAspecto(doc, imageData, x, y, maxWidth, maxHeight = null) {
    try {
        // Validar que imageData no es null o vacío
        if (!imageData) {
            console.warn('⚠️ imageData es null o vacío, omitiendo imagen');
            return y;
        }

        // Obtener propiedades de la imagen usando jsPDF
        let props;
        try {
            props = doc.getImageProperties(imageData);
        } catch (error) {
            console.error('❌ Error obteniendo propiedades de imagen:', error);
            return y;
        }

        // Validar dimensiones
        if (!props || !props.width || !props.height || props.width === 0 || props.height === 0) {
            console.warn('⚠️ Propiedades de imagen inválidas:', props);
            return y;
        }

        console.log(`📏 Dimensiones originales: ${props.width}x${props.height}`);

        // Calcular aspect ratio
        const aspectRatio = props.height / props.width;
        
        // Calcular dimensiones finales respetando límites
        let finalWidth = maxWidth;
        let finalHeight = finalWidth * aspectRatio;
        
        // Si se especifica maxHeight y la altura calculada la excede, ajustar
        if (maxHeight && finalHeight > maxHeight) {
            finalHeight = maxHeight;
            finalWidth = finalHeight / aspectRatio;
        }
        
        console.log(`📐 Dimensiones finales: ${finalWidth}x${finalHeight}`);
        
        // Verificar si cabe en la página actual
        const pageHeight = doc.internal.pageSize.getHeight();
        if (y + finalHeight > pageHeight - 20) {
            doc.addPage();
            y = 20;
            console.log('📄 Nueva página creada');
        }

        // Centrar horizontalmente en el espacio disponible
        const centeredX = x + (maxWidth - finalWidth) / 2;

        // Agregar imagen al PDF
        doc.addImage(imageData, 'JPEG', centeredX, y, finalWidth, finalHeight);
        console.log(`✅ Imagen agregada al PDF en posición: (${centeredX}, ${y})`);
        
        return y + finalHeight + 5; // Agregar un pequeño margen
        
    } catch (error) {
        console.error("❌ Error al agregar imagen al PDF:", error);
        return y;
    }
}
async function cargarImagenOptimizada(url) {
    return new Promise((resolve) => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = function () {
                // validación de dimensiones
                if (!this.naturalWidth || !this.naturalHeight) {
                    console.warn('❌ Imagen con dimensiones inválidas:', url);
                    resolve(null);
                    return;
                }

                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = this.naturalWidth;
                    canvas.height = this.naturalHeight;
                    ctx.drawImage(this, 0, 0);

                    // Convertir a JPEG optimizado
                    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataURL);
                } catch (err) {
                    console.error('❌ Error procesando imagen en canvas:', err);
                    resolve(null);
                }
            };

            img.onerror = function (err) {
                console.warn('❌ Error cargando imagen:', url, err);
                resolve(null);
            };

            // Evitar cache y mejorar compatibilidad
            const separator = url.includes('?') ? '&' : '?';
            img.src = url + separator + 't=' + Date.now() + '&cors=anonymous';

            // Timeout para evitar bloqueo indefinido
            setTimeout(() => {
                if (!img.complete) {
                    console.warn('⏰ Timeout cargando imagen:', url);
                    resolve(null);
                }
            }, 10000);
        } catch (e) {
            console.error('❌ Excepción en cargarImagenOptimizada:', e);
            resolve(null);
        }
    });
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
