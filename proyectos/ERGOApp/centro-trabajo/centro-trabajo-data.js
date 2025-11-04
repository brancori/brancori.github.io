/**
 * Módulo de manejo y renderizado de datos del Centro de Trabajo.
 * Incluye carga desde backend/localStorage, actualización de estados y renderizado de secciones.
 */


// Carga inicial
async function loadEvaluacionInicial() {
    // --- Obtener referencias a los elementos del DOM ---
    const scoreValueEl = document.getElementById('score-value');
    const scoreCategoryEl = document.getElementById('score-category');
    const evalFechaEl = document.getElementById('eval-fecha');
    const evalSugeridasEl = document.getElementById('eval-sugeridas');

    // --- Verificar si los elementos existen ANTES de usarlos ---
    if (!scoreValueEl || !scoreCategoryEl || !evalFechaEl || !evalSugeridasEl) {
        console.error("❌ Error crucial: Faltan elementos del DOM para mostrar la evaluación inicial (score-value, score-category, eval-fecha, eval-sugeridas). Verifica centro-trabajo.html.");
        // Opcionalmente, mostrar un mensaje de error al usuario aquí si es necesario
        return; // Detener la función si faltan elementos
    }

    try {
        let evaluaciones = [];

        // Intentar obtener datos de Supabase si está configurado
        if (window.ERGOConfig.USE_SUPABASE) {
            try {
                console.log('🔍 Consultando dataClient...');
                // Asumiendo que getEvaluaciones filtra por workCenterId o devuelve todas
                const todasLasEvaluaciones = await dataClient.getEvaluaciones(workCenterId) || [];
                // Asegurarse de filtrar por work_center_id si getEvaluaciones devuelve todas
                evaluaciones = todasLasEvaluaciones.filter(e => e.work_center_id === workCenterId);
                console.log('🔍 DEBUG: Evaluaciones desde Supabase (filtradas):', evaluaciones);
                if (evaluaciones.length > 0) {
                    console.log('🔍 DEBUG: Primera evaluación encontrada:', evaluaciones[0]);
                }
            } catch (error) {
                console.log('Supabase no disponible o error en consulta, intentando localStorage:', error);
                // Si Supabase falla, el array evaluaciones quedará vacío y se intentará localStorage
            }
        }

        // Fallback a localStorage si Supabase no se usó, falló, o no devolvió resultados
        if (evaluaciones.length === 0) {
            console.log('🔍 Intentando fallback a localStorage...');
            const localEvals = JSON.parse(localStorage.getItem('evaluaciones')) || [];
            evaluaciones = localEvals.filter(e => e.workCenterId === workCenterId); // Ajusta la clave si es diferente en localStorage
            console.log('🔍 DEBUG: Usando localStorage fallback:', evaluaciones);
        }

        console.log('🔍 Evaluaciones encontradas para este centro:', evaluaciones.length);

        // Si se encontraron evaluaciones (de Supabase o localStorage)
        if (evaluaciones.length > 0) {
            // Ordenar por fecha para asegurar que tomamos la más reciente si hay varias
            evaluaciones.sort((a, b) => new Date(b.created_at || b.fecha_evaluacion || 0) - new Date(a.created_at || a.fecha_evaluacion || 0));
            const eval_ = evaluaciones[0]; // Tomar la más reciente

            console.log('🔍 DEBUG: Estructura de la evaluación a usar:', eval_);
            console.log('🔍 DEBUG: Campos disponibles:', Object.keys(eval_));

            // Extraer datos, usando || para fallbacks entre posibles nombres de campo
            const score = eval_.score_final || eval_.scoreFinal || '0';
            const categoria = eval_.categoria_riesgo || eval_.categoriaRiesgo || 'Sin evaluar';
            // Formatear fecha si existe, si no, 'No especificada'
            const fecha = eval_.fecha_evaluacion || eval_.fechaEvaluacion
                          ? new Date(eval_.fecha_evaluacion || eval_.fechaEvaluacion).toLocaleDateString('es-ES')
                          : 'No especificada';

            // Actualizar elementos del DOM (ahora sabemos que existen)
            scoreValueEl.textContent = `${parseFloat(score).toFixed(2)}%`; // Asegurar formato decimal
            scoreCategoryEl.textContent = categoria;

            const scoreNum = parseFloat(score);
            const color = ERGOUtils.getScoreColor(scoreNum);
            scoreValueEl.style.color = color;

            evalFechaEl.textContent = fecha;

            const metodosRecomendados = getMetodosRecomendados(scoreNum); // Asume que esta función existe
            evalSugeridasEl.textContent = metodosRecomendados;

            console.log('✅ Datos de evaluación cargados y mostrados.');

        } else {
            // Si NO se encontraron evaluaciones ni en Supabase ni en localStorage
            console.log('🆕 Centro sin evaluación inicial - estableciendo valores por defecto');

            scoreValueEl.textContent = '--';
            scoreCategoryEl.textContent = 'Sin evaluar';
            scoreValueEl.style.color = '#6b7280'; // Color gris
            evalFechaEl.textContent = 'Pendiente';
            evalSugeridasEl.textContent = 'Realizar evaluación inicial';

            console.log('🧹 Valores por defecto mostrados.');
        }
    } catch (error) {
        // Manejo de errores durante la carga o procesamiento
        console.error('Error cargando evaluación inicial:', error);

        // Mostrar estado de error en la UI (los elementos existen gracias a la verificación inicial)
        scoreValueEl.textContent = '--';
        scoreCategoryEl.textContent = 'Error al cargar';
        scoreValueEl.style.color = '#ef4444'; // Color rojo
        evalFechaEl.textContent = 'Error';
        evalSugeridasEl.textContent = 'Error al cargar datos';
    }
}

        async function loadFotos() {
            try {
                if (window.ERGOConfig.USE_SUPABASE) {
                    fotosActuales = await dataClient.getFotos(workCenterId) || [];
                } else {
                    fotosActuales = ERGOStorage.getLocal(`fotos_${workCenterId}`, []);
                }
                
                renderFotosGrid();
            } catch (error) {
                console.error('Error cargando fotos:', error);
                fotosActuales = [];
                renderFotosGrid();
            }
        }

        async function loadNotas() {
            try {
                if (window.ERGOConfig.USE_SUPABASE) {
                    notasActuales = await dataClient.getNotas(workCenterId) || [];
                } else {
                    notasActuales = ERGOStorage.getLocal(`notas_${workCenterId}`, []);
                }
                renderNotas();
            } catch (error) {
                console.error('Error cargando notas:', error);
                ERGOUtils.showToast('No se pudieron cargar las notas', 'error');
                notasActuales = [];
                renderNotas();
            }
        }

        function decodeHTML(html) {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

async function loadActividades() {
    const evaluacionesContainer = document.getElementById('evaluaciones-container');
    const btnReportePrincipal = document.getElementById('btn-ver-reporte-principal');

    // Deshabilitar botón principal y mostrar mensaje de carga
    if (btnReportePrincipal) btnReportePrincipal.disabled = true;
    evaluacionesContainer.innerHTML = '<div class="empty-evaluations"><p>Cargando actividades...</p></div>';

    try {
        // Obtener los hallazgos/actividades del centro actual
        evaluacionesEspecificas = await dataClient.getActividades(workCenterId);

        // Verificar si se encontraron hallazgos
        if (evaluacionesEspecificas && evaluacionesEspecificas.length > 0) {
            evaluacionesContainer.innerHTML = ''; // Limpiar el mensaje "Cargando..."

            // Configurar y habilitar el botón del reporte consolidado
            if (btnReportePrincipal) {
                btnReportePrincipal.onclick = () => {
                    // Navegar al reporte consolidado pasando solo los parámetros del centro/área
    window.location.href = `reporte-dictamen.html?workCenter=${workCenterId}&area=${areaId}&centerName=${encodeURIComponent(centerName || '')}&areaName=${encodeURIComponent(areaName || '')}&responsible=${encodeURIComponent(responsibleName || '')}`;                };
                btnReportePrincipal.disabled = false; // Habilitar
            }

            // Iterar sobre cada hallazgo para crear su tarjeta
            evaluacionesEspecificas.forEach(actividad => {
                const item = document.createElement('div');
                item.className = `actividad-item`;
                item.setAttribute('data-id', actividad.id);

                // --- INICIO DE CORRECCIÓN ---
                // NO creamos comentariosDiv ni recomendacionesDiv aquí.
                // Esas se crean dinámicamente al hacer clic (en toggleActividadDetails).

                // Generar el HTML de la tarjeta
                // Añadimos el div .actividad-details vacío que espera la función de clic.
                item.innerHTML = `
                    <div class="actividad-header" onclick="toggleActividadDetailsSimple(this)">
                        <div class="chevron">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div class="actividad-info">
                            <div class="nombre">${actividad.nombre}</div>
                            <div class="meta">Método: ${actividad.metodo || 'No definido'} • Creada: ${new Date(actividad.created_at).toLocaleString()}</div>
                        </div>

                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); abrirModalActividad('${actividad.id}')">Editar</button>
                        
                        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); eliminarActividad('${actividad.id}')">Eliminar</button>
                    </div>
                    <div class="actividad-details"></div>
                    `;

                // Añadir la tarjeta al contenedor principal
                evaluacionesContainer.appendChild(item);

                // ELIMINAMOS las líneas que causaban el error:
                // document.getElementById(`comentarios-${actividad.id}`).appendChild(comentariosDiv);
                // document.getElementById(`recomendaciones-${actividad.id}`).appendChild(recomendacionesDiv);
                // --- FIN DE CORRECCIÓN ---
            });

        } else {
            // Si no se encontraron hallazgos, mostrar mensaje y deshabilitar botón consolidado
            evaluacionesContainer.innerHTML = `
                <div class="empty-evaluations">
                    <p>No hay actividades (hallazgos) registradas para este centro.</p>
                    <small>Usa el botón "+ Agregar Hallazgo" para empezar.</small>
                </div>
            `;
            if (btnReportePrincipal) {
                 btnReportePrincipal.disabled = true;
            }
        }
    } catch (error) {
        // Manejo de errores durante la carga
        console.error('Error al cargar actividades:', error);
        evaluacionesContainer.innerHTML = '<p class="error-message">Error al cargar datos.</p>';
         if (btnReportePrincipal) btnReportePrincipal.disabled = true; // Deshabilitar también en caso de error
    }
}



// Render

function renderCondicionesAmbientales(condiciones) {
    const data = condiciones || {};
    
        const factores = [
            { key: 'iluminacion', displayId: 'display-condicion-iluminacion', valueId: 'condicion-iluminacion-valor' },
            { key: 'temperatura', displayId: 'display-condicion-temperatura', valueId: 'condicion-temperatura-valor' },
            { key: 'ruido', displayId: 'display-condicion-ruido', valueId: 'condicion-ruido-valor' },
            { key: 'personal_exp', displayId: 'display-condicion-personal', valueId: 'condicion-personal-valor' },
            { key: 'manejo_cargas', displayId: 'display-condicion-cargas', valueId: 'condicion-cargas-valor' },
            { key: 'puestos_involucrados', displayId: 'display-condicion-puestos', valueId: 'condicion-puestos-valor' },
            { key: 'art', displayId: 'display-condicion-art', valueId: 'condicion-art-valor' }
        ];

    factores.forEach(factor => {
        const item = data[factor.key] || { valor: '--', na: false };
        const displayElement = document.getElementById(factor.displayId);
        const valueElement = document.getElementById(factor.valueId);

        if (item.na) {
            displayElement.classList.add('hidden');
        } else {
            displayElement.classList.remove('hidden');
            valueElement.textContent = item.valor || '--';
        }
    });
}

/**
 * Abre el modal para editar las condiciones, restringido a administradores.
 */
function abrirModalCondiciones() {
    if (ERGOAuth.getCurrentUser()?.rango !== 1) {
        ERGOUtils.showToast('Solo los administradores pueden editar esta sección.', 'info');
        return;
    }
    if (isCenterClosed) {
        ERGOUtils.showToast('El centro está cerrado y no se puede editar.', 'warning');
        return;
    }
    
    const condiciones = currentCenterData.scoreSummary?.condiciones_ambientales || {};

    const factores = [
    { key: 'iluminacion', inputId: 'condiciones-iluminacion-input', checkId: 'condiciones-iluminacion-na' },
    { key: 'temperatura', inputId: 'condiciones-temperatura-input', checkId: 'condiciones-temperatura-na' },
    { key: 'ruido', inputId: 'condiciones-ruido-input', checkId: 'condiciones-ruido-na' },
    { key: 'personal_exp', inputId: 'condiciones-personal-input', checkId: 'condiciones-personal-na' },
    { key: 'puestos_involucrados', inputId: 'condiciones-puestos-input', checkId: 'condiciones-puestos-na' }
    ];

    // Manejar radio buttons de manejo de cargas
    const cargasData = condiciones.manejo_cargas || {};
    const radioSi = document.getElementById('condiciones-cargas-si');
    const radioNo = document.getElementById('condiciones-cargas-no');

    if (cargasData.valor === 'si') {
        radioSi.checked = true;
    } else if (cargasData.valor === 'no') {
        radioNo.checked = true;
    }

    // Cargar opciones dinámicas de puestos (placeholder)
    loadPuestosOptions();

    factores.forEach(factor => {
        const item = condiciones[factor.key] || {};
        const input = document.getElementById(factor.inputId);
        const checkbox = document.getElementById(factor.checkId);
        
        checkbox.checked = item.na || false;
        input.value = item.na ? '' : (item.valor || '');
        input.disabled = checkbox.checked;
    });

    const artData = condiciones.art || {};
    document.getElementById('condiciones-art-input').value = artData.valor || '';

    ERGOModal.open('modal-condiciones');
}

/**
 * Cierra el modal de condiciones.
 */
function cerrarModalCondiciones() {
    ERGOModal.close('modal-condiciones');
}

/**
 * Guarda los cambios de las condiciones ambientales en la base de datos.
 */
async function guardarCondicionesAmbientales() {
    const getValue = (id) => {
        const val = document.getElementById(id).value;
        return val === '' ? null : parseFloat(val);
    };

    const nuevasCondiciones = {
        iluminacion: {
            valor: getValue('condiciones-iluminacion-input'),
            na: document.getElementById('condiciones-iluminacion-na').checked
        },
        temperatura: {
            valor: getValue('condiciones-temperatura-input'),
            na: document.getElementById('condiciones-temperatura-na').checked
        },
        ruido: {
            valor: getValue('condiciones-ruido-input'),
            na: document.getElementById('condiciones-ruido-na').checked
        },
        personal_exp: {
            valor: getValue('condiciones-personal-input'),
            na: document.getElementById('condiciones-personal-na').checked
        },
        art: {
            valor: document.getElementById('condiciones-art-input').value.trim(),
            na: false // El campo de texto no aplica para N/A
        },
        manejo_cargas: {
            valor: document.querySelector('input[name="manejo_cargas"]:checked')?.value || null,
            na: false
        },
        puestos_involucrados: {
            valor: document.getElementById('condiciones-puestos-input').value.trim() || null,
            na: document.getElementById('condiciones-puestos-na').checked
        },
    };

    try {
        ERGOUtils.showToast('Guardando cambios...', 'info');
        await dataClient.updateWorkCenterConditions(workCenterId, nuevasCondiciones);
        
        currentCenterData.scoreSummary.condiciones_ambientales = nuevasCondiciones;
        renderCondicionesAmbientales(nuevasCondiciones);
        
        ERGOUtils.showToast('Condiciones actualizadas.', 'success');
        cerrarModalCondiciones();
    } catch (error) {
        console.error('Error al guardar condiciones:', error);
        ERGOUtils.showToast(`No se pudieron guardar los cambios: ${error.message}`, 'error');
    }
}

        // Funciones de renderizado
        function renderFotosGrid() {
            const grid = document.getElementById('fotos-grid');
            const count = document.getElementById('fotos-count');
            
            count.textContent = fotosActuales.length;
            
            let html = '';
            
            // Renderizar fotos existentes
            fotosActuales.forEach((foto, index) => {
                const publicUrl = window.ERGOConfig.USE_SUPABASE ? 
                    `${window.ERGOConfig.SUPABASE_URL}/storage/v1/object/public/fotos-centros/${foto.foto_url}` :
                    foto.url;
                
                html += `
                    <div class="foto-slot occupied" onclick="openFotoModal(${index})"> <!-- AGREGAR onclick aquí -->
                        <img src="${publicUrl}" alt="${foto.foto_name || `Foto ${index + 1}`}" 
                            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjYwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gTm8gRGlzcG9uaWJsZTwvdGV4dD4KPHN2Zz4='" />
                            ${ERGOAuth.hasPermission('delete') ? `<button class="foto-delete" onclick="event.stopPropagation(); deleteFoto('${foto.id || index}')">×</button>` : ''}                    </div>
                `;
            });
            
            // Renderizar slots vacíos
            for (let i = fotosActuales.length; i < 5; i++) {
                const isDisabled = fotosActuales.length >= 5;
                html += `
                    <div class="foto-slot ${isDisabled ? 'disabled' : ''}" 
                         onclick="${isDisabled ? '' : 'triggerFotoUpload()'}">
                        <span style="font-size: 2rem; color: var(--gray-400);">📸</span>
                        <span style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.5rem;">
                            ${isDisabled ? 'Máximo alcanzado' : 'Agregar foto'}
                        </span>
                    </div>
                `;
            }
            
            grid.innerHTML = html;
        }

function renderNotas() {
    const container = document.getElementById('notas-container');
    const count = document.getElementById('notas-count');

    count.textContent = `${notasActuales.length} ${notasActuales.length === 1 ? 'nota' : 'notas'}`;

    if (notasActuales.length === 0) {
        container.innerHTML = `
            <div class="empty-notas">
                <p>No hay notas registradas</p>
                <small>Usa el botón "AGREGAR NOTA" para documentar observaciones</small>
            </div>
        `;
        return;
    }

    container.innerHTML = notasActuales.map(nota => {
        return `
            <div class="nota-item">
                <div class="nota-header u-flex-center-between">
                    <div class="nota-fecha">${ERGOUtils.formatDate(nota.created_at || nota.fecha)}</div>
                    <div class="nota-actions">
                        <button class="btn btn-ghost btn-sm action-edit-note" onclick='editarNota(${JSON.stringify(nota)})'>Editar</button>
                        <button class="btn btn-danger btn-sm action-delete-note" onclick="eliminarNota('${nota.id}')">Eliminar</button>
                    </div>
                </div>
                <div class="nota-texto">${nota.texto}</div>
            </div>
        `;
    }).join('');
}


function renderActividades() {
    const container = document.getElementById('evaluaciones-container');
    // Si no hay evaluaciones específicas, mostrar un mensaje de vacío.
    if (!evaluacionesEspecificas || evaluacionesEspecificas.length === 0) {
        container.innerHTML = `<div class="empty-evaluations"><p>No hay actividades creadas.</p></div>`;
        return;
    }
    // Construir el HTML para cada actividad...
    container.innerHTML = evaluacionesEspecificas.map(actividad => {
        const fechaCreacion = ERGOUtils.timeAgo(actividad.created_at);
        return `
            <div class="actividad-item" id="actividad-${actividad.id}">
                <div class="actividad-header" onclick="toggleActividadDetails(this.parentElement, '${actividad.id}')">
                    // ... (contenido)...
                    <div class="actividad-status">${actividad.score_final ? `${actividad.score_final} Pts` : 'Pendiente'}</div>
                    ${!isCenterClosed ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); abrirModalActividad('${actividad.id}')">Editar</button>` : ''}
                </div>
                <div class="actividad-details"></div>
            </div>
        `;
    }).join('');
}


/**
 * Expande o contrae la vista de detalles de una actividad.
 * Carga el contenido de la vista previa solo la primera vez que se expande.
 * @param {HTMLElement} itemElement - El elemento div.actividad-item.
 * @param {string} actividadId - El ID de la actividad a mostrar.
 */
async function toggleActividadDetails(itemElement, actividadId) {
    // Obtiene el contenedor de detalles y el chevron de esta tarjeta
    const detailsContainer = itemElement.querySelector('.actividad-details');
    const chevronSvg = itemElement.querySelector('.chevron svg');
    // Alternar el estado expandido
    const isExpanded = itemElement.classList.toggle('is-expanded');
    // Rotar el ícono de flecha si existe
    if (chevronSvg) {
        chevronSvg.classList.toggle('rotated', isExpanded);
    }
    // Si se expande y aún no hay contenido cargado, obtener datos y renderizar
    if (isExpanded && !detailsContainer.innerHTML.trim()) {
        // Mensaje de carga
        detailsContainer.innerHTML = '<div class="fotos-info">Cargando vista previa…</div>';
        // Buscar la actividad correspondiente por ID
        const actividad = evaluacionesEspecificas.find(e => e.id === actividadId);
        if (!actividad) {
            detailsContainer.innerHTML = '<div class="fotos-info">No se encontró la actividad.</div>';
            return;
        }
        // Obtener fotos para esta actividad desde Supabase/local
        let fotos = [];
        try {
            fotos = await dataClient.getFotosActividad(actividadId) || [];
        } catch (error) {
            fotos = [];
        }
        // Construir el HTML de fotos en una cuadrícula de miniaturas
        let fotosHTML = '<div class="fotos-info">No hay fotos para esta actividad.</div>';
        if (fotos.length > 0) {
            fotosHTML = '<div class="miniaturas-grid">' +
                fotos.slice(0, 8).map(foto => {
                    const publicUrl = `${window.ERGOConfig.SUPABASE_URL}/storage/v1/object/public/fotos/${foto.storage_path}`;
                    return `<div class="miniatura"><img src="${publicUrl}" alt="${foto.file_name}"></div>`;
                }).join('') +
                '</div>';
        }
        // Escape de texto para comentarios y recomendaciones
const comentarios = (typeof DOMPurify !== 'undefined')
            ? DOMPurify.sanitize(actividad.comentarios || '<i>Sin comentarios.</i>')
            : (actividad.comentarios || '<i>Sin comentarios.</i>');
            
        const recomendaciones = (typeof DOMPurify !== 'undefined')
            ? DOMPurify.sanitize(actividad.recomendaciones || '<i>Sin recomendaciones.</i>')
            : (actividad.recomendaciones || '<i>Sin recomendaciones.</i>');
        // Insertar el contenido completo en el contenedor de detalles
        detailsContainer.innerHTML = `
            <div class="details-section">
                <h4>Fotos</h4>
                ${fotosHTML}
            </div>
            <div class="details-section">
                <h4>Comentarios</h4>
                <div class="content">${comentarios}</div>
            </div>
            <div class="details-section">
                <h4>Recomendaciones</h4>
                <div class="content">${recomendaciones}</div>
            </div>
        `;
    }
}


/**
 * Carga y muestra las miniaturas de las fotos en la vista de detalles.
 * @param {string} actividadId - El ID de la actividad de la que cargar fotos.
 * @param {HTMLElement} detailsContainer - El div donde se mostrarán las fotos.
 */
async function loadAndRenderPhotosForSummary(actividadId, detailsContainer) {
    const grid = detailsContainer.querySelector('.miniaturas-grid');
    if (!grid) return;
try {
    const fotos = await dataClient.getFotosActividad(actividadId) || [];
    if (fotos.length > 0) {
        grid.innerHTML = fotos.map(foto => {
            const { data } = supabase.storage.from('fotos').getPublicUrl(foto.storage_path, {
                transform: {
                    width: 150,
                    height: 150,
                    resize: 'cover' // 'cover' recorta para ajustar, 'contain' ajusta sin recortar
                }
            });
            const publicUrl = data.publicUrl;
            return `
                <div class="miniatura">
                    <img src="${publicUrl}" alt="${foto.file_name}">
                </div>
            `;
        }).join('');
        } else {
            grid.innerHTML = '<div class="fotos-info" style="grid-column: 1 / -1;">No hay fotos para esta actividad.</div>';
        }
    } catch (error) {
        grid.innerHTML = '<div class="fotos-info" style="grid-column: 1 / -1;">Error al cargar fotos.</div>';
    }
}
async function loadAndRenderActividades() {
    const localStorageKey = `actividades_${workCenterId}`;
    const container = document.getElementById('actividades-list');
    if (!container) return; // Salir si el contenedor no existe

    // 1. Mostrar datos de la caché inmediatamente si existen
    const cachedActividades = LocalStorageCache.loadCachedData(localStorageKey);
    if (cachedActividades && cachedActividades.length > 0) {
        console.log('📦 Renderizando actividades desde caché...');
        renderActividades(cachedActividades);
    } else {
        container.innerHTML = '<p class="loading-state">Cargando actividades...</p>';
    }

    // 2. Buscar datos frescos en Supabase y actualizar la caché
    try {
        const freshActividades = await dataClient.getActividades(workCenterId);
        if (freshActividades) {
            renderActividades(freshActividades);
            LocalStorageCache.cacheData(localStorageKey, freshActividades);
        }
    } catch (error) {
        console.error('Error al obtener actividades frescas:', error);
        container.innerHTML = '<p class="error-state">No se pudieron cargar las actividades.</p>';
    }
}
// aquí inicia
/**
 * Carga y renderiza los puestos asignados a un centro de trabajo específico.
 * @param {string} workCenterId El UUID del centro de trabajo.
 */
async function loadAndRenderAssignedPuestos(workCenterId) {
// aquí inicia
    console.log("--- INICIANDO DEPURACIÓN: loadAndRenderAssignedPuestos ---");
    const valueSpan = document.getElementById('condicion-puestos-valor');

    if (!valueSpan) {
        console.error("LOG: ❌ ERROR FATAL: El span con id 'condicion-puestos-valor' no se encontró en el HTML. La función se detendrá.");
        return;
    }
    
    console.log(`LOG: ✅ Paso 1: Span 'condicion-puestos-valor' encontrado. Buscando puestos para el workCenterId: ${workCenterId}`);

    try {
        const queryString = `?select=puestos(nombre),areas(name)&centro_id=eq.${workCenterId}`;
        console.log(`LOG: ⚙️ Paso 2: Ejecutando consulta a Supabase en la tabla 'centro_puestos' con el filtro: ${queryString}`);
        
        const assignedPuestos = await dataClient.query(
            'centro_puestos', 
            'GET', 
            null, 
            queryString
        );

        console.log("LOG: 📥 Paso 3: Respuesta recibida de Supabase. Datos crudos:", assignedPuestos);

        if (!assignedPuestos || assignedPuestos.length === 0) {
            console.warn("LOG: ⚠️ Advertencia: La consulta no devolvió resultados. La lista está vacía. Verifique si hay datos en la tabla 'centro_puestos' para este centro o si las políticas RLS permiten la lectura.");
            valueSpan.textContent = 'No asignados';
            return;
        }

        console.log("LOG: 🔄 Paso 4: Procesando los datos recibidos...");
        const uniquePuestosList = [...new Set(
            assignedPuestos.map(item => {
                const puesto = item.puestos?.nombre || 'Puesto Desconocido';
                const area = item.areas?.name || 'Área General';
                return `${puesto}`;
            })
        )];
        
        console.log("LOG: 📊 Paso 5: Lista de puestos procesada y sin duplicados:", uniquePuestosList);

        let html = '<ul class="puestos-asignados-list">';
        uniquePuestosList.sort().forEach(puestoTexto => {
            html += `<li>${puestoTexto}</li>`;
        });
        html += '</ul>';

        console.log("LOG: ✅ Paso 6: Renderizando el HTML final en el span.");
        valueSpan.innerHTML = html;
        console.log("--- FIN DEPURACIÓN ---");

    } catch (error) {
        console.error("LOG: ❌ ERROR CRÍTICO: Ocurrió un error durante la ejecución de la función.", error);
        valueSpan.textContent = 'Error al cargar';
        console.log("--- FIN DEPURACIÓN CON ERROR ---");
    }
}

        function getMetodosRecomendados(score) {
            if (score <= 25) return "Seguimiento rutinario";
            else if (score <= 50) return "RULA, observación postural";
            else if (score <= 75) return "REBA, RULA, evaluación de cargas";
            else return "REBA, NIOSH, OCRA - Evaluación completa";
        }

        