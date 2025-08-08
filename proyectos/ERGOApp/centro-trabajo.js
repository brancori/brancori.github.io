        
        let tipoEvaluacionACrear = null;
        let notaEnEdicion = null; 
         let isCenterClosed = false;
        // Variables globales
        let currentCenterData = null;
        let fotosActuales = [];
        let notasActuales = [];
        let evaluacionesEspecificas = [];
        let isComentarioEnEdicion = false;

        // Obtener parámetros de URL
        const urlParams = new URLSearchParams(window.location.search);
        const workCenterId = urlParams.get('workCenter');
        const areaId = urlParams.get('area');
        const areaName = urlParams.get('areaName');
        const centerName = urlParams.get('centerName');
        const responsibleName = urlParams.get('responsible');

        // Configuración Supabase
        const USE_SUPABASE = window.ERGOConfig.USE_SUPABASE;

        // Inicialización
       document.addEventListener('DOMContentLoaded', async function() {
            console.log('🚀 Iniciando aplicación...');

            if (!ERGOAuth.initializeAuthContext()) {
                ERGOAuth.redirectToLogin();
                return; 
            }
            
            if (!workCenterId || !areaId) {
                alert('Error: Parámetros de URL faltantes');
                window.location.href = 'areas.html';
                return;
            }

            if (typeof supabase === 'undefined') {
                console.warn('⚠️ Supabase no disponible.');
            }

            currentCenterData = {
                id: workCenterId,
                name: decodeURIComponent(centerName || 'Centro de Trabajo'),
                responsible: decodeURIComponent(responsibleName || 'No especificado'),
                areaId: areaId
            };

            document.getElementById('centro-name').textContent = currentCenterData.name;
            document.getElementById('centro-responsable').textContent = `Responsable: ${currentCenterData.responsible}`;
            document.getElementById('breadcrumb-area').textContent = decodeURIComponent(areaName || 'Área');
            document.getElementById('breadcrumb-centro').textContent = currentCenterData.name;
            document.getElementById('breadcrumb-area').href = `areas.html#area-${areaId}`;

            try {
                // Se añade la carga del estado del centro (getScoreWorkCenter)
                const [_, fotos, notas, actividades, scoreSummary, workCenterData] = await Promise.all([
                loadEvaluacionInicial(),
                dataClient.getFotos(workCenterId),
                dataClient.getNotas(workCenterId),
                dataClient.getActividades(workCenterId),
                dataClient.getScoreWorkCenter(workCenterId)
                ]);
                
                fotosActuales = fotos || [];
                notasActuales = notas || [];
                evaluacionesEspecificas = actividades || [];

                currentCenterData.scoreSummary = scoreSummary;
                // Guardamos y aplicamos el estado de cierre
                isCenterClosed = scoreSummary ? scoreSummary.is_closed : false;

                // Aplicar estado de bloqueo inmediatamente
                const mainContainer = document.querySelector('.container');
                const centroHeader = document.querySelector('.centro-header');
                const toggleButton = document.getElementById('btn-toggle-status');
                const banner = document.getElementById('closed-state-banner');

            if (isCenterClosed) {
                // ESTADO: CERRADO
                mainContainer.classList.add('is-locked');
                centroHeader.classList.add('status-closed');
                centroHeader.classList.remove('status-open');
                banner.style.display = 'block';
                toggleButton.innerHTML = 'Abrir Centro';

            } else {
                // ESTADO: ABIERTO (POR DEFECTO)
                mainContainer.classList.remove('is-locked');
                centroHeader.classList.add('status-open');
                centroHeader.classList.remove('status-closed');
                banner.style.display = 'none';
                toggleButton.innerHTML = 'Cerrar Centro';
            }

                if (scoreSummary) {
                    renderCondicionesAmbientales(scoreSummary.condiciones_ambientales);
                } else {
                    renderCondicionesAmbientales(null);
                }

                if (workCenterData && workCenterData.comentarios_generales) {
                    document.getElementById('comentarios-generales').readOnly = true;
                    document.getElementById('comentarios-generales').classList.add('is-readonly');
                }

                renderFotosGrid();
                renderNotas();
                renderActividades();

            } catch (error) {
                console.error('Error cargando datos iniciales:', error);
                ERGOUtils.showToast('Error crítico al cargar datos del centro.', 'error');
            }
            try {
                const workCenterData = await dataClient.getWorkCenter(workCenterId);
                const textarea = document.getElementById('comentarios-generales');
                const btn = document.getElementById('btn-comentarios');

                // 1. Cargar el comentario si existe
                if (workCenterData && workCenterData.comentarios_generales) {
                    textarea.value = workCenterData.comentarios_generales;
                }

                // 2. Establecer el estado inicial a "solo lectura"
                isComentarioEnEdicion = false;
                textarea.readOnly = true;
                textarea.classList.add('is-readonly');
                btn.textContent = 'Editar Comentario';

            } catch(error) {
                console.error("Error al cargar comentarios generales:", error);
            }
            setupEventListeners();
            ERGOAuth.applyPermissionControls();

            console.log('✅ Aplicación inicializada correctamente');
        });

        async function gestionarComentario() {
            const btn = document.getElementById('btn-comentarios');
            const textarea = document.getElementById('comentarios-generales');

            isComentarioEnEdicion = !isComentarioEnEdicion;

            if (isComentarioEnEdicion) {
                // --- MODO EDICIÓN ---
                textarea.readOnly = false;
                textarea.classList.remove('is-readonly'); // Quita el estilo de "solo lectura"
                btn.textContent = 'Guardar Cambios';
                textarea.focus();
            } else {
                // --- MODO VISTA (y guardado) ---
                textarea.readOnly = true;
                textarea.classList.add('is-readonly'); // Añade el estilo de "solo lectura"
                btn.textContent = 'Editar Comentario';
                
                try {
                    ERGOUtils.showToast('Guardando cambios...', 'info');
                    await dataClient.updateWorkCenterComments(workCenterId, textarea.value);
                    ERGOUtils.showToast('Comentario actualizado.', 'success');
                } catch (error) {
                    console.error('Error al actualizar el comentario:', error);
                    ERGOUtils.showToast('No se pudo guardar el comentario.', 'error');
                }
            }
        }

function setupEventListeners() {
    // Input de fotos (este es el original, no lo borres)
    document.getElementById('foto-input').addEventListener('change', handleFotoUpload);

        const factoresIds = ['iluminacion', 'temperatura', 'ruido', 'personal'];
    
    factoresIds.forEach(id => {
        const checkbox = document.getElementById(`condiciones-${id}-na`);
        const input = document.getElementById(`condiciones-${id}-input`);
        
        checkbox.addEventListener('change', () => {
            input.disabled = checkbox.checked;
            if (checkbox.checked) {
                input.value = '';
            }
        });
    });
    
    // AÑADIR ESTA LÍNEA para el nuevo input de fotos de actividad
    document.getElementById('foto-input-actividad').addEventListener('change', handleFotoUploadActividad);

    // Click en modal overlay para cerrar
    document.getElementById('modal-nota').addEventListener('click', function(e) {
        if (e.target === this) {
            closeNotaModal();
        }
    });
    
    const metodoSelect = document.getElementById('actividad-metodo');
    // Apuntamos al nuevo botón
    const btnEvaluarMetodo = document.getElementById('btn-evaluar-metodo'); 

    metodoSelect.addEventListener('change', () => {
        // Habilitamos o deshabilitamos el botón correcto
        btnEvaluarMetodo.disabled = !metodoSelect.value;
    });

    btnEvaluarMetodo.addEventListener('click', () => {
        const metodo = metodoSelect.value;
        if (!metodo || !actividadEnEdicion) {
            ERGOUtils.showToast('Primero guarda la actividad y selecciona un método.', 'info');
            return;
        };
        
        // La lógica de navegación que ya tenías
        ERGONavigation.navigateToSpecificEvaluation(
            metodo,
            actividadEnEdicion.id,
            actividadEnEdicion.nombre
        );
    });

    // --- CÓDIGO A AGREGAR ---
    
    const btnEvaluarTipo = document.getElementById('btn-evaluar-tipo');

    btnEvaluarTipo.addEventListener('click', () => {
        // 1. Verifica que haya una actividad en edición
        if (!actividadEnEdicion) {
            ERGOUtils.showToast('Primero debes guardar la actividad para poder evaluarla.', 'info');
            return;
        }

        // 2. Busca cuál es el botón de tipo de análisis activo
        const tipoAnalisisActivo = document.querySelector('#tipo-analisis-group .btn-toggle.active');

        // 3. Si el botón activo es "EJA", navega a la página de Johnson
        if (tipoAnalisisActivo && tipoAnalisisActivo.dataset.value === 'EJA') {
            
            // Construye la URL pasando los parámetros necesarios
            const params = {
                workCenter: workCenterId,
                area: areaId,
                actividadId: actividadEnEdicion.id,
                actividadNombre: actividadEnEdicion.nombre
            };
            
            const url = ERGONavigation.buildUrl('componentes/pages/Johnson_Evaluation.html', params);
            window.location.href = url;
        } else {
            // Aquí podrías añadir la lógica para "WS" u otros tipos en el futuro
            ERGOUtils.showToast('Esta evaluación solo está disponible para el tipo de análisis EJA.', 'info');
        }
    });
}

function renderCondicionesAmbientales(condiciones) {
    const data = condiciones || {};
    
    const factores = [
        { key: 'iluminacion', displayId: 'display-condicion-iluminacion', valueId: 'condicion-iluminacion-valor' },
        { key: 'temperatura', displayId: 'display-condicion-temperatura', valueId: 'condicion-temperatura-valor' },
        { key: 'ruido', displayId: 'display-condicion-ruido', valueId: 'condicion-ruido-valor' },
        { key: 'personal_exp', displayId: 'display-condicion-personal', valueId: 'condicion-personal-valor' },
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
        { key: 'personal_exp', inputId: 'condiciones-personal-input', checkId: 'condiciones-personal-na' }
    ];

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
        }
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

        // Funciones de carga de datos
    async function loadEvaluacionInicial() {
        try {
            
            let evaluaciones = [];
            
              if (USE_SUPABASE) {
            try {
                console.log('🔍 Consultando dataClient...');
                evaluaciones = await dataClient.getEvaluaciones(workCenterId) || [];
                console.log('🔍 DEBUG: Evaluaciones desde Supabase:', evaluaciones);
                console.log('🔍 DEBUG: Primera evaluación:', evaluaciones[0]);
            } catch (error) {
                console.log('Supabase no disponible, usando localStorage');
            }
        }

            // Fallback a localStorage
            if (evaluaciones.length > 0) {
            evaluaciones = evaluaciones.filter(e => e.work_center_id === workCenterId);
            console.log('🔍 DEBUG: Evaluaciones filtradas para este centro:', evaluaciones);
        }

        // Fallback a localStorage si no hay en Supabase
        if (evaluaciones.length === 0) {
            const localEvals = JSON.parse(localStorage.getItem('evaluaciones')) || [];
            evaluaciones = localEvals.filter(e => e.workCenterId === workCenterId);
            console.log('🔍 DEBUG: Usando localStorage fallback:', evaluaciones);
        }
        
        console.log('🔍 Evaluaciones encontradas para este centro:', evaluaciones.length);

         if (evaluaciones.length > 0) {
            const eval = evaluaciones[0];
            console.log('🔍 DEBUG: Estructura de la evaluación:', eval);
            console.log('🔍 DEBUG: Campos disponibles:', Object.keys(eval));
            const score = eval.score_final || eval.scoreFinal || '0';
            const categoria = eval.categoria_riesgo || eval.categoriaRiesgo || 'Sin evaluar';
            const fecha = eval.fecha_evaluacion || eval.fechaEvaluacion || 'No especificada';

            // Actualizar score principal
            document.getElementById('score-value').textContent = `${score}%`;
            document.getElementById('score-category').textContent = categoria;
            
            // Aplicar color según score
            const scoreNum = parseFloat(score);
            const color = getScoreColor(scoreNum);
            document.getElementById('score-value').style.color = color;

            // Actualizar info de evaluación inicial
            document.getElementById('eval-fecha').textContent = fecha;
            
            // Determinar métodos sugeridos basado en score
            const metodosRecomendados = getMetodosRecomendados(scoreNum);
            document.getElementById('eval-sugeridas').textContent = metodosRecomendados;
            
            console.log('✅ Datos de evaluación cargados');
        } else {
            // NO EXISTE EVALUACIÓN - Mostrar valores por defecto limpios
            console.log('🆕 Centro nuevo - estableciendo valores por defecto');
            
            // Limpiar score principal
            document.getElementById('score-value').textContent = '--';
            document.getElementById('score-category').textContent = 'Sin evaluar';
            document.getElementById('score-value').style.color = '#6b7280'; // Color gris
            
            // Limpiar info de evaluación inicial
            document.getElementById('eval-fecha').textContent = 'Pendiente';
            document.getElementById('eval-sugeridas').textContent = 'Realizar evaluación inicial';
            
            console.log('🧹 Valores limpiados para centro nuevo');
        }
    } catch (error) {
        console.error('Error cargando evaluación inicial:', error);
        
        // En caso de error, también limpiar valores
        document.getElementById('score-value').textContent = '--';
        document.getElementById('score-category').textContent = 'Error al cargar';
        document.getElementById('score-value').style.color = '#ef4444'; // Color rojo
        document.getElementById('eval-fecha').textContent = 'Error';
        document.getElementById('eval-sugeridas').textContent = 'Error al cargar datos';
    }
}


        async function loadFotos() {
            try {
                if (USE_SUPABASE) {
                    fotosActuales = await dataClient.getFotos(workCenterId) || [];
                } else {
                    fotosActuales = JSON.parse(localStorage.getItem(`fotos_${workCenterId}`)) || [];
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
                if (USE_SUPABASE) {
                    notasActuales = await dataClient.getNotas(workCenterId) || [];
                } else {
                    notasActuales = JSON.parse(localStorage.getItem(`notas_${workCenterId}`)) || [];
                }
                renderNotas();
            } catch (error) {
                console.error('Error cargando notas:', error);
                ERGOUtils.showToast('No se pudieron cargar las notas', 'error');
                notasActuales = [];
                renderNotas();
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
                const publicUrl = USE_SUPABASE ? 
                    `${SUPABASE_URL}/storage/v1/object/public/fotos-centros/${foto.foto_url}` :
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

        async function loadActividades() {
            try {
                // Llama a la nueva función en dataClient
                evaluacionesEspecificas = await dataClient.getActividades(workCenterId) || [];
                renderActividades();
            } catch (error) {
                console.error('Error cargando actividades:', error);
                evaluacionesEspecificas = [];
                renderActividades();
            }
        }


function renderActividades() {
    const container = document.getElementById('evaluaciones-container');
    if (!evaluacionesEspecificas || evaluacionesEspecificas.length === 0) {
        container.innerHTML = `<div class="empty-evaluations"><p>No hay actividades creadas.</p></div>`;
        return;
    }

    container.innerHTML = evaluacionesEspecificas.map(actividad => {
        const fechaCreacion = ERGOUtils.timeAgo(actividad.created_at);
        return `
            <div class="actividad-item" id="actividad-${actividad.id}">
                <div class="actividad-header" onclick="toggleActividadDetails('${actividad.id}', this.parentElement)">
                    <div class="chevron">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                    </div>
                    <div class="actividad-info">
                        <div class="nombre">${actividad.nombre}</div>
                        <div class="meta">Método: ${actividad.metodo || 'No definido'} • Creada: ${fechaCreacion}</div>
                    </div>
                    <div class="actividad-status">${actividad.score_final ? `${actividad.score_final} Pts` : 'Pendiente'}</div>
                    ${!isCenterClosed ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); abrirModalActividad('${actividad.id}')">Editar</button>` : ''}
                </div>
                <div class="actividad-details">
                    </div>
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
    const detailsContainer = itemElement.querySelector('.actividad-details');
    const isExpanded = itemElement.classList.toggle('is-expanded');

    // Si se está expandiendo y aún no tiene contenido, lo cargamos.
    if (isExpanded && !detailsContainer.innerHTML.trim()) {
        detailsContainer.innerHTML = '<div class="fotos-info">Cargando vista previa...</div>';
        
        const actividad = evaluacionesEspecificas.find(e => e.id === actividadId);
        if (!actividad) return;

        const fotos = await dataClient.getFotosActividad(actividadId);
        let fotosHTML = '<div class="fotos-info">No hay fotos.</div>';

        if (fotos && fotos.length > 0) {
            fotosHTML = `<div class="fotos-grid" id="fotos-grid-summary">` +
                fotos.slice(0, 4).map(foto => { // Mostramos máximo 4
                    const publicUrl = `${window.ERGOConfig.SUPABASE_URL}/storage/v1/object/public/fotos/${foto.storage_path}`;
                    return `<div class="foto-slot occupied"><img src="${publicUrl}" alt="${foto.file_name}"></div>`;
                }).join('') +
            `</div>`;
        }

        detailsContainer.innerHTML = `
            <div class="details-section">
                <h4>Fotos</h4>
                ${fotosHTML}
            </div>
            <div class="details-section">
                <h4>Comentarios</h4>
                <div class="content">${actividad.comentarios || '<i>Sin comentarios.</i>'}</div>
            </div>
            <div class="details-section">
                <h4>Recomendaciones</h4>
                <div class="content">${actividad.recomendaciones || '<i>Sin recomendaciones.</i>'}</div>
            </div>
        `;
    }
}
            async function eliminarEvaluacionEspecifica(event, evalId, tipo) {
            event.stopPropagation(); // ¡Muy importante! Evita que se active el clic para editar.
            
            if (!ERGOAuth.checkPermissionAndShowError('delete')) return;

            if (confirm(`¿Estás seguro de eliminar la evaluación ${tipo} con ID: ${evalId}? Esta acción no se puede deshacer.`)) {
                try {
                    ERGOUtils.showToast('Eliminando evaluación...', 'info');
                    const metodoDelete = `deleteEvaluacion${tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase()}`;
                    
                    if (dataClient[metodoDelete]) {
                        await dataClient[metodoDelete](evalId);
                        ERGOUtils.showToast('Evaluación eliminada correctamente.', 'success');
                        await loadActividades(); // Recarga la lista
                    } else {
                        throw new Error(`Método de eliminación no encontrado: ${metodoDelete}`);
                    }
                } catch (error) {
                    console.error('Error al eliminar evaluación:', error);
                    ERGOUtils.showToast('No se pudo eliminar la evaluación.', 'error');
                }
            }
        }
        // Funciones de utilidad
        function getScoreColor(score) {
            if (score <= 25) return "#28a745";
            else if (score <= 50) return "#ffc107";
            else if (score <= 75) return "#fd7e14";
            else return "#dc3545";
        }

        function getMetodosRecomendados(score) {
            if (score <= 25) return "Seguimiento rutinario";
            else if (score <= 50) return "RULA, observación postural";
            else if (score <= 75) return "REBA, RULA, evaluación de cargas";
            else return "REBA, NIOSH, OCRA - Evaluación completa";
        }

        // Funciones de interacción
        function triggerFotoUpload() {
            if (isCenterClosed) return;
            if (fotosActuales.length >= 5) {
                alert('Ya tienes el máximo de 5 fotos');
                return;
            }
            document.getElementById('foto-input').click();
        }

        async function handleFotoUpload(event) {
    const files = Array.from(event.target.files);
    const maxFotos = 5;
    const errors = [];
    let uploadedCount = 0;
    let newLocalFotos = []; // For localStorage path

    ERGOUtils.showToast('Procesando fotos...', 'info');

    for (const file of files) {
        if ((fotosActuales.length + uploadedCount) >= maxFotos) {
            errors.push(`Límite de ${maxFotos} fotos alcanzado. No se subió: ${file.name}`);
            continue; 
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB
            errors.push(`${file.name} es muy grande (máx. 5MB)`);
            continue;
        }
        
        try {
                    const options = {
                        maxSizeMB: 1.5,      // Tamaño máximo después de la compresión
                        useWebWorker: true,  // Usa un worker para no bloquear la UI
                    };
                    
                    console.log(`Comprimiendo ${file.name}...`);
                    const compressedFile = await imageCompression(file, options);
                    console.log(`Compresión finalizada. Nuevo tamaño: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
            if (USE_SUPABASE) {
                await dataClient.uploadFotoCentro(file, areaId, workCenterId);
            } else {
                const fotoData = {
                    id: Date.now().toString() + uploadedCount,
                    foto_name: file.name,
                    url: URL.createObjectURL(file)
                };
                newLocalFotos.push(fotoData);
            }
            uploadedCount++;
        } catch (error) {
            console.error('Error uploading foto:', error);
            errors.push(`Error al cargar ${file.name}`);
        }
    }
    
    event.target.value = '';

    if (errors.length > 0) {
        alert("Ocurrieron algunos problemas:\n- " + errors.join("\n- "));
    }

    if (uploadedCount > 0) {
        ERGOUtils.showToast(`${uploadedCount} foto(s) cargada(s) con éxito.`, 'success');
        if (USE_SUPABASE) {
            await loadFotos(); 
        } else {
            fotosActuales = [...fotosActuales, ...newLocalFotos];
            localStorage.setItem(`fotos_${workCenterId}`, JSON.stringify(fotosActuales));
            renderFotosGrid();
        }
    } else if (errors.length === 0) {
        ERGOUtils.showToast('No se seleccionaron fotos válidas.', 'info');
    }
}

        async function deleteFoto(fotoId) {
            if (!ERGOAuth.checkPermissionAndShowError('delete')) return;
            if (confirm('¿Eliminar esta foto?')) {
                try {
                    if (USE_SUPABASE) {
                        await dataClient.deleteFoto(fotoId);
                    }
                    
                    fotosActuales = fotosActuales.filter(f => f.id !== fotoId);
                    
                    if (!USE_SUPABASE) {
                        localStorage.setItem(`fotos_${workCenterId}`, JSON.stringify(fotosActuales));
                    }
                    
                    renderFotosGrid();
                } catch (error) {
                    console.error('Error deleting foto:', error);
                    alert('Error al eliminar foto');
                }
            }
        }

        /**
 * Dibuja la estructura HTML inicial para la vista de detalles de una actividad.
 * @param {object} actividad - El objeto de la actividad con los datos.
 * @param {HTMLElement} detailsContainer - El div donde se renderizará el contenido.
 */
function renderActividadDetails(actividad, detailsContainer) {
    // Escapamos el contenido de texto para prevenir problemas de XSS si los datos vinieran de fuentes no confiables.
    const comentarios = actividad.comentarios ? actividad.comentarios.replace(/</g, "&lt;").replace(/>/g, "&gt;") : '<i>Sin comentarios.</i>';
    const recomendaciones = actividad.recomendaciones ? actividad.recomendaciones.replace(/</g, "&lt;").replace(/>/g, "&gt;") : '<i>Sin recomendaciones.</i>';

    detailsContainer.innerHTML = `
        <div class="details-section">
            <h4>Fotos</h4>
            <div class="fotos-grid" id="fotos-summary-${actividad.id}">
                <div class="fotos-info">Cargando fotos...</div>
            </div>
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

        /**
 * Expande o contrae la vista de detalles de una actividad.
 * @param {string} actividadId - El ID de la actividad a mostrar/ocultar.
 * @param {HTMLElement} element - El elemento HTML del ítem que se ha clickeado.
 */
function toggleActividadDetails(actividadId, element) {
    const detailsContainer = element.querySelector('.actividad-details');
    const isExpanded = element.classList.toggle('is-expanded');

    // Si se está expandiendo y aún no tiene contenido, cargamos las fotos.
    // Esto es para que la página cargue rápido y solo pida las fotos cuando las necesites.
    const hasContent = detailsContainer.querySelector('.fotos-grid');
    if (isExpanded && !hasContent) {
        // Mostramos un mensaje de carga
        detailsContainer.innerHTML = '<div class="fotos-info">Cargando fotos...</div>';
        
        // Buscamos el objeto de la actividad en nuestro array local
        const actividad = evaluacionesEspecificas.find(e => e.id === actividadId);
        if (actividad) {
            // Renderizamos la estructura y luego cargamos las fotos
            renderActividadDetails(actividad, detailsContainer);
            loadAndRenderPhotosForSummary(actividadId, detailsContainer);
        }
    }
}

/**
 * Carga y muestra las miniaturas de las fotos en la vista de detalles.
 * @param {string} actividadId - El ID de la actividad de la que cargar fotos.
 * @param {HTMLElement} detailsContainer - El div donde se mostrarán las fotos.
 */
async function loadAndRenderPhotosForSummary(actividadId, detailsContainer) {
    const grid = detailsContainer.querySelector('.fotos-grid');
    if (!grid) return;

    try {
        const fotos = await dataClient.getFotosActividad(actividadId) || [];
        if (fotos.length > 0) {
            grid.innerHTML = fotos.map(foto => {
                const publicUrl = `${window.ERGOConfig.SUPABASE_URL}/storage/v1/object/public/fotos/${foto.storage_path}`;
                return `
                    <div class="foto-slot occupied">
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

        function openNotaModal() {
            if (isCenterClosed) return;
            if (!ERGOAuth.checkPermissionAndShowError('create')) return;
            // Si no estamos editando, reseteamos el formulario
            if (!notaEnEdicion) {
                document.querySelector('#modal-nota h3').textContent = 'Agregar Nueva Nota';
                document.getElementById('nota-texto').value = '';
                document.querySelector('#modal-nota .btn-primary').textContent = 'Guardar Nota';
            }
            document.getElementById('modal-nota').classList.add('show');
            document.getElementById('nota-texto').focus();
        }

        function closeNotaModal() {
            if (isCenterClosed) return;
            notaEnEdicion = null; // Resetea la variable de edición
            document.getElementById('modal-nota').classList.remove('show');
            document.getElementById('nota-texto').value = '';
        }

            async function guardarNota() {
            const notaText = document.getElementById('nota-texto').value.trim();
            if (!notaText) {
                ERGOUtils.showToast('La nota no puede estar vacía.', 'error');
                return;
            }

            try {
                if (notaEnEdicion) {
                    // --- Lógica de ACTUALIZACIÓN ---
                    await dataClient.updateNota(notaEnEdicion.id, { texto: notaText });
                    ERGOUtils.showToast('Nota actualizada.', 'success');
                } else {
                    // --- Lógica de CREACIÓN (la que ya tenías) ---
                    const notaData = {
                        work_center_id: workCenterId,
                        texto: notaText,
                        user_id: ERGOAuth.getCurrentUser()?.id
                    };
                    await dataClient.createNota(notaData);
                    ERGOUtils.showToast('Nota guardada.', 'success');
                }
                closeNotaModal();
                await loadNotas();
            } catch (error) {
                console.error('Error guardando la nota:', error);
                ERGOUtils.showToast('Error al guardar la nota.', 'error');
            }
        }

    function editarNota(nota) {
        if (isCenterClosed) return;
            if (!ERGOAuth.checkPermissionAndShowError('create')) return; // Reutilizamos el permiso de 'crear' para editar
            notaEnEdicion = nota;
            document.querySelector('#modal-nota h3').textContent = 'Editar Nota';
            document.getElementById('nota-texto').value = nota.texto;
            document.querySelector('#modal-nota .btn-primary').textContent = 'Guardar Cambios';
            openNotaModal();
        }

        async function eliminarNota(notaId) {
            if (!ERGOAuth.checkPermissionAndShowError('delete')) return;
            if (confirm('¿Estás seguro de eliminar esta nota?')) {
                try {
                    ERGOUtils.showToast('Eliminando nota...', 'info');
                    await dataClient.deleteNota(notaId);
                    ERGOUtils.showToast('Nota eliminada.', 'success');
                    await loadNotas();
                } catch (error) {
                    console.error('Error al eliminar la nota:', error);
                    ERGOUtils.showToast('No se pudo eliminar la nota.', 'error');
                }
            }
        }

        function volverACentros() {
            window.location.href = `areas.html#area-${areaId}`;
        }

        // Funciones de exportación
        async function exportarPDFCompleto() {
            if (!ERGOAuth.checkPermissionAndShowError('export')) return;

            try {
                ERGOUtils.showToast('Generando PDF...', 'info');
                const pdfUrl = await dataClient.exportarPDF(workCenterId);
                
                if (pdfUrl) {
                    window.open(pdfUrl, '_blank');
                    ERGOUtils.showToast('PDF generado exitosamente.', 'success');
                } else {
                    throw new Error('No se pudo generar el PDF.');
                }
            } catch (error) {
                console.error('Error al generar PDF:', error);
                ERGOUtils.showToast(`Error al generar PDF: ${error.message}`, 'error');
            }
        }
let fotosActividadActual = [];

// Se llama cuando se abre el modal en modo edición
async function loadFotosActividad(actividadId) {
    try {
        fotosActividadActual = await dataClient.getFotosActividad(actividadId) || [];
        renderFotosActividad();
        // Muestra la sección de fotos si estamos editando
        document.getElementById('seccion-fotos-actividad').style.display = 'block';
    } catch (error) {
        console.error('Error cargando fotos de actividad:', error);
    }
}

function renderFotosActividad() {
    const grid = document.getElementById('fotos-grid-actividad');
    const maxFotos = 5; // Definimos el total de espacios a mostrar
    let html = '';

    // 1. Renderizar las fotos que ya existen
    fotosActividadActual.forEach(foto => {
        const publicUrl = `${window.ERGOConfig.SUPABASE_URL}/storage/v1/object/public/fotos/${foto.storage_path}`;
        html += `
            <div class="foto-slot occupied">
                <img src="${publicUrl}" alt="${foto.file_name}">
                <button class="foto-delete" type="button" onclick="deleteFotoActividad('${foto.id}', '${foto.storage_path}')">×</button>
            </div>
        `;
    });

    // 2. Renderizar los espacios vacíos restantes
    const espaciosVacios = maxFotos - fotosActividadActual.length;
    for (let i = 0; i < espaciosVacios; i++) {
        html += `
            <div class="foto-slot">
                <span style="font-size: 1.5rem; color: var(--gray-400);">📸</span>
                <span style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.5rem; text-align: center;">
                    Agregar foto
                </span>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

    async function handleFotoUploadActividad(event) {
        const files = event.target.files;
        if (!files.length || !actividadEnEdicion) return;

        ERGOUtils.showToast(`Procesando ${files.length} foto(s)...`, 'info');

        const uploadPromises = Array.from(files).map(async (file) => {
            try {
                // --- INICIO DEL CAMBIO EN LA COMPRESIÓN ---
                const options = {
                    maxSizeMB: 1.5,      // Límite máximo de tamaño, pero intentará mantener la calidad.
                    // Se eliminó la opción 'maxWidthOrHeight' para NO cambiar las dimensiones de la imagen.
                    useWebWorker: true,
                    // La librería elimina los metadatos EXIF por defecto al procesar la imagen,
                    // lo que ayuda a reducir el peso sin afectar la calidad visual.
                };
                // --- FIN DEL CAMBIO EN LA COMPRESIÓN ---
                
                const compressedFile = await imageCompression(file, options);
                await dataClient.uploadFotoActividad(compressedFile, actividadEnEdicion.id)

            } catch (error) {
                console.error(`Error al procesar ${file.name}:`, error);
                ERGOUtils.showToast(`Error con la foto ${file.name}`, 'error');
            }
        });

        await Promise.all(uploadPromises);

        ERGOUtils.showToast('Carga de fotos completada.', 'success');
        event.target.value = ''; // Limpiar el input
        await loadFotosActividad(actividadEnEdicion.id); // Recargar
    }

async function deleteFotoActividad(fotoId, storagePath) {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
        await dataClient.deleteFotoActividad(fotoId, storagePath);
        await loadFotosActividad(actividadEnEdicion.id); // Recargar
    } catch (error) {
        ERGOUtils.showToast('No se pudo eliminar la foto.', 'error');
    }
}

function openEvaluacionModal() {
    if (!ERGOAuth.checkPermissionAndShowError('create')) return;
    
    // Primero, cerramos cualquier modal que pudiera estar abierto
    cerrarEvaluacionModal(); 

    const metodos = [
        { nombre: 'REBA', descripcion: 'Evaluación de cuerpo completo' },
        { nombre: 'RULA', descripcion: 'Evaluación de miembros superiores' },
        { nombre: 'OCRA', descripcion: 'Movimientos repetitivos' },
        { nombre: 'NIOSH', descripcion: 'Levantamiento de cargas' }
    ];
    
    let modalHTML = `
        <div id="evaluacion-modal" onclick="cerrarEvaluacionModal()" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
            <div onclick="event.stopPropagation()" style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%;">
                <h3 style="margin-bottom: 1.5rem; text-align: center;">Seleccionar Tipo de Evaluación</h3>
                <div style="display: grid; gap: 1rem;">
    `;
    
    metodos.forEach(metodo => {
        // La llamada ahora es a 'abrirModalCrearEvaluacion'
        modalHTML += `
            <button onclick="abrirModalCrearEvaluacion('${metodo.nombre}')" 
                    style="padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; text-align: left; transition: all 0.2s;"
                    onmouseover="this.style.borderColor='#3b82f6'; this.style.backgroundColor='#f0f9ff'"
                    onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white'">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 0.25rem;">${metodo.nombre}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">${metodo.descripcion}</div>
            </button>
        `;
    });
    
    modalHTML += `
                </div>
                <button onclick="cerrarEvaluacionModal()" 
                        style="width: 100%; margin-top: 1.5rem; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function abrirModalCrearEvaluacion(tipo) {
    tipoEvaluacionACrear = tipo; // Guardamos el tipo de evaluación que se va a crear
    cerrarEvaluacionModal(); // Cerramos el modal de selección
    
    // Personalizamos y abrimos el nuevo modal para el título
    document.getElementById('modal-crear-evaluacion-titulo').textContent = `Nueva Evaluación ${tipo}`;
    document.getElementById('nueva-evaluacion-titulo').placeholder = `Ej. ${tipo} - Operador de Prensa`;
    document.getElementById('modal-crear-evaluacion').classList.add('show');
    document.getElementById('nueva-evaluacion-titulo').focus();
}

function cerrarModalCrearEvaluacion() {
    document.getElementById('modal-crear-evaluacion').classList.remove('show');
    document.getElementById('nueva-evaluacion-titulo').value = ''; // Limpiamos el input
    tipoEvaluacionACrear = null; // Reseteamos la variable
}

async function confirmarCreacionEvaluacion() {
    if (!tipoEvaluacionACrear) return;

    const titulo = document.getElementById('nueva-evaluacion-titulo').value.trim();
    if (!titulo) {
        ERGOUtils.showToast('Por favor, ingresa un título para la evaluación.', 'error');
        return;
    }

    const metodoDeCreacion = `createEvaluacion${tipoEvaluacionACrear.charAt(0).toUpperCase() + tipoEvaluacionACrear.slice(1).toLowerCase()}`;
    
    const datosIniciales = {
        work_center_id: workCenterId,
        titulo: titulo
    };

    try {
        ERGOUtils.showToast('Creando evaluación...', 'info');
        await dataClient[metodoDeCreacion](datosIniciales);
        
        cerrarModalCrearEvaluacion();
        ERGOUtils.showToast('Evaluación creada. Ahora puedes completarla.', 'success');
        
        // Recargamos la lista para mostrar la nueva evaluación "pendiente"
        await loadActividades();
    } catch (error) {
        console.error(`Error al crear evaluación ${tipoEvaluacionACrear}:`, error);
        ERGOUtils.showToast(`Error al crear la evaluación: ${error.message}`, 'error');
    }
}

        function editarEvaluacionEspecifica(evaluacion) {
    // La nueva función global se encarga de todo
    ERGONavigation.navigateToSpecificEvaluation(
        evaluacion.tipo,
        workCenterId,
        areaId,
        areaName,
        centerName,
        responsibleName,
    );
}

function cerrarEvaluacionModal() {
    const modal = document.getElementById('evaluacion-modal');
    if (modal) modal.remove();
}


        function verEvaluacionEspecifica(evalId) {
            const evaluacion = evaluacionesEspecificas.find(e => e.id === evalId);
            if (evaluacion) {
                alert(`Ver evaluación ${evaluacion.metodo}\nScore: ${evaluacion.score}\nFecha: ${ERGOUtils.formatDate(evaluacion.fecha)}`);
            }
        }

        function abrirEvaluacion() {
            const url = `./evaluacion_ini/eval_int.html?workCenter=${workCenterId}&area=${areaId}&areaName=${encodeURIComponent(areaName || '')}&centerName=${encodeURIComponent(centerName || '')}&responsible=${encodeURIComponent(responsibleName || '')}`;
            window.location.href = url;
        }

        function volverACentros() {
            window.location.href = `areas.html#area-${areaId}`;
        }

        async function exportarPDFCompleto() {
            try {
                // Verificar que jsPDF esté disponible
                if (typeof window.jspdf === 'undefined') {
                    alert('Cargando librerías PDF...');
                    return;
                }

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const nombreArchivo = `${timestamp}_Reporte_Completo_${currentCenterData.name.replace(/\s+/g, '_')}.pdf`;

                // Título principal
                doc.setFontSize(16);
                doc.text('Reporte Completo de Centro de Trabajo', 105, 15, {align: 'center'});

                // Información del centro
                doc.setFontSize(12);
                let posY = 30;
                doc.text(`Centro: ${currentCenterData.name}`, 14, posY);
                posY += 8;
                doc.text(`Responsable: ${currentCenterData.responsible}`, 14, posY);
                posY += 8;
                doc.text(`Área: ${decodeURIComponent(areaName || 'No especificada')}`, 14, posY);
                posY += 8;
                doc.text(`Fecha del reporte: ${new Date().toLocaleDateString()}`, 14, posY);
                posY += 15;

                // Score de evaluación
                const scoreValue = document.getElementById('score-value').textContent;
                const scoreCategory = document.getElementById('score-category').textContent;
                
                doc.setFontSize(14);
                doc.text('📊 Evaluación Ergonómica', 14, posY);
                posY += 10;
                doc.setFontSize(12);
                doc.text(`Score de Riesgo: ${scoreValue}`, 14, posY);
                posY += 6;
                doc.text(`Categoría: ${scoreCategory}`, 14, posY);
                posY += 15;

                // Información de evaluación inicial
                const evalFecha = document.getElementById('eval-fecha').textContent;
                const evalSugeridas = document.getElementById('eval-sugeridas').textContent;
                
                doc.text(`Fecha de evaluación: ${evalFecha}`, 14, posY);
                posY += 6;
                doc.text(`Métodos recomendados: ${evalSugeridas}`, 14, posY);
                posY += 15;

                // Sección de fotos
                if (fotosActuales && fotosActuales.length > 0) {
                    doc.setFontSize(14);
                    doc.text('📸 Fotos del Centro de Trabajo', 14, posY);
                    posY += 15;

                    for (let i = 0; i < fotosActuales.length; i++) {
                        const foto = fotosActuales[i];
                        
                        try {
                            const publicUrl = USE_SUPABASE ? 
                                `${SUPABASE_URL}/storage/v1/object/public/fotos-centros/${foto.foto_url}` :
                                foto.url;
                            
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            
                            await new Promise((resolve, reject) => {
                                img.onload = () => resolve();
                                img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
                                img.src = publicUrl;
                            });
                            
                            const col = i % 2;
                            const row = Math.floor(i / 2);
                            let imgX = 14 + (col * 95);
                            let imgY = posY + (row * 70);
                            
                            if (imgY > 200) {
                                doc.addPage();
                                posY = 20;
                                const newRow = Math.floor((i % 4) / 2);
                                imgY = posY + (newRow * 70);
                            }
                            
                            doc.addImage(img, 'JPEG', imgX, imgY, 80, 60);
                            
                            doc.setFontSize(8);
                            doc.text(foto.foto_name || `Foto ${i + 1}`, imgX, imgY + 65, {maxWidth: 80});
                            
                            if (col === 1) {
                                posY += 80;
                            }
                            
                        } catch (imgError) {
                            console.error(`Error cargando foto ${i + 1}:`, imgError);
                            doc.setFontSize(10);
                            doc.text(`❌ Error cargando: ${foto.foto_name}`, 14, posY);
                            posY += 10;
                        }
                    }
                } else {
                    doc.setFontSize(12);
                    doc.text('📸 No hay fotos disponibles para este centro', 14, posY);
                    posY += 15;
                }

                // Asegurar nueva página para notas si es necesario
                if (posY > 200) {
                    doc.addPage();
                    posY = 20;
                }

                // Sección de notas
                if (notasActuales && notasActuales.length > 0) {
                    doc.setFontSize(14);
                    doc.text('📝 Notas y Observaciones', 14, posY);
                    posY += 15;

                    notasActuales.reverse().forEach((nota, index) => {
                        if (posY > 250) {
                            doc.addPage();
                            posY = 20;
                        }

                        doc.setFontSize(10);
                        doc.text(`${ERGOUtils.formatDate(nota.fecha)}:`, 14, posY);
                        posY += 6;
                        
                        doc.setFontSize(9);
                        const textLines = doc.splitTextToSize(nota.texto, 180);
                        doc.text(textLines, 14, posY);
                        posY += textLines.length * 4 + 8;
                    });
                } else {
                    doc.setFontSize(12);
                    doc.text('📝 No hay notas registradas', 14, posY);
                }

                // Guardar PDF
                doc.save(nombreArchivo);
                alert('PDF generado correctamente');

            } catch (error) {
                console.error('Error generando PDF:', error);
                alert('Error al generar PDF: ' + error.message);
            }
        }

        // Listener para recibir actualizaciones de evaluaciones
        window.addEventListener('message', function(event) {
            if (event.data.type === 'evaluacionActualizada') {
                // Recargar datos de evaluación
                loadEvaluacionInicial();
            }
        });
        // Variables para el modal de fotos
let currentFotoIndex = 0;
let isZoomed = false;

// Función para abrir el modal de foto
function openFotoModal(fotoIndex) {
    if (fotosActuales.length === 0) return;
    
    currentFotoIndex = fotoIndex;
    const foto = fotosActuales[currentFotoIndex];
    
    const modal = document.getElementById('foto-modal');
    const modalImage = document.getElementById('foto-modal-image');
    const modalName = document.getElementById('foto-modal-name');
    const counter = document.getElementById('foto-counter');
    const prevBtn = document.getElementById('foto-prev-btn');
    const nextBtn = document.getElementById('foto-next-btn');
    
    // Configurar imagen
    const publicUrl = USE_SUPABASE ? 
        `${SUPABASE_URL}/storage/v1/object/public/fotos-centros/${foto.foto_url}` :
        foto.url;
    
    modalImage.src = publicUrl;
    modalImage.alt = foto.foto_name || `Foto ${currentFotoIndex + 1}`;
    
    // Configurar información
    modalName.textContent = foto.foto_name || `Foto ${currentFotoIndex + 1}`;
    counter.textContent = `${currentFotoIndex + 1} / ${fotosActuales.length}`;
    
    // Mostrar/ocultar controles de navegación
    prevBtn.style.display = fotosActuales.length > 1 ? 'flex' : 'none';
    nextBtn.style.display = fotosActuales.length > 1 ? 'flex' : 'none';
    counter.style.display = fotosActuales.length > 1 ? 'block' : 'none';
    
    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    
    // Reset zoom
    isZoomed = false;
    modalImage.classList.remove('zoomed');
}

// Función para cerrar el modal
function closeFotoModal() {
    const modal = document.getElementById('foto-modal');
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restaurar scroll del body
    
    // Reset zoom
    isZoomed = false;
    document.getElementById('foto-modal-image').classList.remove('zoomed');
}

// Función para foto anterior
function prevFoto() {
    if (fotosActuales.length <= 1) return;
    
    currentFotoIndex = currentFotoIndex > 0 ? currentFotoIndex - 1 : fotosActuales.length - 1;
    openFotoModal(currentFotoIndex);
}

// Función para foto siguiente
function nextFoto() {
    if (fotosActuales.length <= 1) return;
    
    currentFotoIndex = currentFotoIndex < fotosActuales.length - 1 ? currentFotoIndex + 1 : 0;
    openFotoModal(currentFotoIndex);
}

// Función para zoom
function toggleZoom() {
    const modalImage = document.getElementById('foto-modal-image');
    isZoomed = !isZoomed;
    
    if (isZoomed) {
        modalImage.classList.add('zoomed');
    } else {
        modalImage.classList.remove('zoomed');
    }
}

let actividadEnEdicion = null;

/**
 * Abre el modal de actividad.
 * Si no se pasa una actividad, abre en modo "Creación".
 * Si se pasa una actividad, abre en modo "Edición".
 * @param {object|null} actividad - El objeto de la actividad a editar.
 */
function abrirModalActividad(actividadId = null) {
    const actividad = actividadId ? evaluacionesEspecificas.find(e => e.id === actividadId) : null;
    actividadEnEdicion = actividad;

    const esEdicion = actividad !== null;

    document.getElementById('modal-actividad-titulo').textContent = esEdicion ? 'Editar Actividad' : 'Nueva Actividad';
    document.getElementById('form-actividad').reset();
    document.getElementById('fotos-grid-actividad').innerHTML = '';
    
    const tipoGroup = document.getElementById('tipo-analisis-group');
    const btns = tipoGroup.querySelectorAll('.btn-toggle');
    btns.forEach(btn => {
        btn.classList.remove('active');
        btn.onclick = () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });

    // Apuntamos al ID del botón correcto
    const btnEvaluarMetodo = document.getElementById('btn-evaluar-metodo');

    if (esEdicion) {
        document.getElementById('actividad-id').value = actividad.id;
        document.getElementById('actividad-nombre').value = actividad.nombre;
        document.getElementById('actividad-metodo').value = actividad.metodo;
        document.getElementById('actividad-comentarios').value = actividad.comentarios || '';
        document.getElementById('actividad-recomendaciones').value = actividad.recomendaciones || '';

        const tipoAnalisis = actividad.tipo_analisis || 'EJA';
        const activeBtn = tipoGroup.querySelector(`[data-value="${tipoAnalisis}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Usamos la referencia correcta al botón
        btnEvaluarMetodo.disabled = !actividad.metodo;
        loadFotosActividad(actividad.id);
    } else {
        // Usamos la referencia correcta al botón
        btnEvaluarMetodo.disabled = true;
        tipoGroup.querySelector('[data-value="EJA"]').classList.add('active');
    }
    
    ERGOModal.open('modal-actividad');
}

/**
 * Cierra y resetea el modal de actividad.
 */
function cerrarModalActividad() {
    ERGOModal.close('modal-actividad');
    document.getElementById('form-actividad').reset();
    actividadEnEdicion = null;
}

/**
 * Guarda o actualiza una actividad.
 */
async function guardarActividad() {
    if (!ERGOAuth.checkPermissionAndShowError('create')) return;

    const id = document.getElementById('actividad-id').value;
    const esModoEdicion = !!id;

    // Obtener el valor del botón activo
    const tipoAnalisisActivo = document.querySelector('#tipo-analisis-group .btn-toggle.active');
    
    const data = {
        work_center_id: workCenterId,
        area_id: areaId,
        nombre: document.getElementById('actividad-nombre').value.trim(),
        metodo: document.getElementById('actividad-metodo').value,
        comentarios: document.getElementById('actividad-comentarios').value.trim(),
        recomendaciones: document.getElementById('actividad-recomendaciones').value.trim(), // Guardar recomendaciones
        tipo_analisis: tipoAnalisisActivo ? tipoAnalisisActivo.dataset.value : 'EJA',
        user_id: ERGOAuth.getCurrentUser()?.id
    };

    if (!data.nombre) {
        ERGOUtils.showToast('El nombre de la actividad es obligatorio.', 'error');
        return;
    }

    try {
        if (esModoEdicion) {
            await dataClient.updateActividad(id, data);
            ERGOUtils.showToast('Actividad actualizada.', 'success');
        } else {
            const nuevaActividadArray = await dataClient.createActividad(data);
            if (!nuevaActividadArray || nuevaActividadArray.length === 0) {
                 throw new Error("La creación no devolvió el nuevo registro.");
            }
            actividadEnEdicion = nuevaActividadArray[0]; // Actualizamos la actividad en edición
            document.getElementById('actividad-id').value = actividadEnEdicion.id; // Ponemos el ID en el form
            ERGOUtils.showToast('Actividad creada. Puedes añadir fotos.', 'success');
        }
        
        await loadActividades(); // Recarga la lista principal en ambos casos
        
        // Si no es modo edición (es decir, es la primera vez que se guarda), no cerramos el modal.
        // Si es modo edición, sí lo cerramos.
        if (esModoEdicion) {
            cerrarModalActividad();
        }

    } catch (error) {
        console.error('Error al guardar la actividad:', error);
        ERGOUtils.showToast(`No se pudo guardar la actividad. ${error.message}`, 'error');
    }
}

// El botón para abrir/cerrar solo debe ser visible para administradores
if (!ERGOAuth.hasPermission('update')) {
    toggleButton.style.display = 'none';
}
        /**
         * Abre el modal para confirmar la acción con contraseña.
         */
        function toggleCenterStatus() {
            if (!ERGOAuth.checkPermissionAndShowError('update')) return;

            const modalTitle = document.getElementById('modal-password-title');
            const modalMessage = document.getElementById('modal-password-message');
            
            if (isCenterClosed) {
                modalTitle.textContent = 'Confirmar Apertura';
                modalMessage.textContent = 'Para habilitar la edición de este centro de trabajo, por favor confirma tu identidad.';
            } else {
                modalTitle.textContent = 'Confirmar Cierre';
                modalMessage.textContent = 'Esta acción pondrá el centro en modo "solo lectura", deshabilitando la creación, edición y eliminación de datos.';
            }
            ERGOModal.open('modal-password-confirm');
            document.getElementById('password-confirm-input').focus();
        }

        /**
         * Cierra el modal de confirmación por contraseña.
         */
        function closePasswordConfirmModal() {
            ERGOModal.close('modal-password-confirm');
            document.getElementById('password-confirm-input').value = '';
        }

        /**
         * Verifica que la contraseña ingresada es correcta para el usuario actual.
         */
        async function verifyCurrentUserPassword(password) {
            const currentUser = ERGOAuth.getCurrentUser();
            if (!currentUser || !password) return false;

            // Se usa authClient para validar credenciales sin alterar la sesión actual.
            const validationResult = await window.authClient.login(currentUser.email, password);
            return validationResult !== null;
        }

        /**
         * Se ejecuta al confirmar en el modal de contraseña.
         */
        async function confirmPasswordAction() {
            const password = document.getElementById('password-confirm-input').value;
            if (!password) {
                ERGOUtils.showToast('Por favor, ingresa tu contraseña', 'error');
                return;
            }

            ERGOUtils.showToast('Verificando y actualizando...', 'info');
            const isPasswordCorrect = await verifyCurrentUserPassword(password);

            if (!isPasswordCorrect) {
                ERGOUtils.showToast('Contraseña incorrecta', 'error');
                return;
            }

            const newState = !isCenterClosed;
            try {
                await dataClient.updateWorkCenterStatus(workCenterId, areaId, newState);
                ERGOUtils.showToast(`Centro ${newState ? 'cerrado' : 'abierto'} correctamente. Recargando...`, 'success');
                
                // Forzamos un pequeño delay para que el usuario alcance a ver el mensaje de éxito
                setTimeout(() => {
                    window.location.reload(); // <--- LÍNEA AÑADIDA PARA RECARGAR
                }, 1500); 

            } catch (error) {
                console.error('Error al actualizar el estado del centro:', error);
                ERGOUtils.showToast('No se pudo cambiar el estado del centro', 'error');
            }
        }
// Event listeners para el modal
