/**
 * Módulo de manejo y renderizado de datos del Centro de Trabajo.
 * Incluye carga desde backend/localStorage, actualización de estados y renderizado de secciones.
 */


// Carga inicial
    async function loadEvaluacionInicial() {
        try {
            
            let evaluaciones = [];
            
              if (window.ERGOConfig.USE_SUPABASE) {
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
            const color = ERGOUtils.getScoreColor(scoreNum);
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

async function loadActividades() {
    const evaluacionesContainer = document.getElementById('evaluaciones-container');
    evaluacionesContainer.innerHTML = '<div class="empty-evaluations"><p>Cargando actividades...</p></div>';

    try {
        // aquí inicia
        evaluacionesEspecificas = await dataClient.getWorkCenterSummary(workCenterId);
        // aquí termina

        if (evaluacionesEspecificas && evaluacionesEspecificas.length > 0) {
            evaluacionesContainer.innerHTML = '';
            evaluacionesEspecificas.forEach(actividad => {
                const item = document.createElement('div');
                item.className = `actividad-item`;
                item.setAttribute('data-id', actividad.id);
                item.onclick = (e) => toggleActividadDetails(actividad, item);

                // Determina la clase del score
                let scoreClass = '';
                if (actividad.score_final > 60) {
                    scoreClass = 'score-high';
                } else if (actividad.score_final > 25) {
                    scoreClass = 'score-medium';
                }

                item.innerHTML = `
                    <div class="actividad-header">
                        <div class="actividad-info">
                            <span class="nombre">${actividad.nombre}</span>
                            <span class="meta">${actividad.tipo} - ${new Date(actividad.created_at).toLocaleDateString()}</span>
                        </div>
                        <div class="actividad-status">
                            ${actividad.metodo ? 'Evaluada' : 'Pendiente'}
                        </div>
                        <div class="actividad-actions">
                            <button class="btn btn-ghost btn-sm" onclick="eliminarEvaluacionEspecifica(event, '${actividad.id}', '${actividad.tipo}')">Eliminar</button>
                            <button class="btn btn-ghost btn-sm" onclick="abrirModalActividad('${actividad.id}')">Editar</button>
                        </div>
                        <span class="chevron">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </span>
                    </div>
                `;
                evaluacionesContainer.appendChild(item);
            });
        } else {
            evaluacionesContainer.innerHTML = `
                <div class="empty-evaluations">
                    <p>No hay evaluaciones específicas realizadas</p>
                    <small>Agrega evaluaciones REBA, RULA, OCRA, NIOSH según corresponda</small>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar actividades:', error);
        evaluacionesContainer.innerHTML = '<p class="error-message">Error al cargar datos.</p>';
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
    // Construir el HTML para cada actividad. Cada ítem tiene un contenedor de detalles vacío que se llenará al expandir.
    container.innerHTML = evaluacionesEspecificas.map(actividad => {
        const fechaCreacion = ERGOUtils.timeAgo(actividad.created_at);
        return `
            <div class="actividad-item" id="actividad-${actividad.id}">
                <div class="actividad-header" onclick="toggleActividadDetails(this.parentElement, '${actividad.id}')">
                    <div class="chevron">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                    </div>
                    <div class="actividad-info">
                        <div class="nombre">${actividad.nombre}</div>
                        <div class="meta">Método: ${actividad.metodo || 'No definido'} • Creada: ${fechaCreacion}</div>
                    </div>
                    <div class="actividad-status">${actividad.score_final ? `${actividad.score_final} Pts` : 'Pendiente'}</div>
                    ${!isCenterClosed ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); abrirModalActividad('${actividad.id}')">Editar</button>` : ''}
                </div>
                <!-- Contenedor de detalles vacío; se llenará dinámicamente al expandir -->
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
        const escapeHTML = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const comentarios = actividad.comentarios ? escapeHTML(actividad.comentarios) : '<i>Sin comentarios.</i>';
        const recomendaciones = actividad.recomendaciones ? escapeHTML(actividad.recomendaciones) : '<i>Sin recomendaciones.</i>';
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
                const publicUrl = `${window.ERGOConfig.SUPABASE_URL}/storage/v1/object/public/fotos/${foto.storage_path}`;
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



        function getMetodosRecomendados(score) {
            if (score <= 25) return "Seguimiento rutinario";
            else if (score <= 50) return "RULA, observación postural";
            else if (score <= 75) return "REBA, RULA, evaluación de cargas";
            else return "REBA, NIOSH, OCRA - Evaluación completa";
        }