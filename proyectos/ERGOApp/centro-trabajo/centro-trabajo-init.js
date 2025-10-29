    /**
 * Módulo de inicialización de la vista de Centro de Trabajo.
 * Contiene la carga inicial, render de datos principales y configuración de eventos.
 */

    let complianceDataStore = {};
    
    document.addEventListener('DOMContentLoaded', async function () {
        console.log('🚀 Iniciando aplicación...');

                try {
            const raw = sessionStorage.getItem('sessionToken');
            if (raw) {
                const token = raw.startsWith('"') ? JSON.parse(raw) : raw;
                if (window.dataClient?.setAuth) {
                    window.dataClient.setAuth(token);
                }
                if (window.dataClient?.supabase?.auth?.setSession) {
                   await window.dataClient.supabase.auth.setSession({ access_token: token, refresh_token: '' });
                }
            }
        } catch (e) {
            console.warn('bootstrapAuth: no se pudo hidratar la sesión', e);
        }
        // --- FIN: LÓGICA DE ARRANQUE DE SESIÓN ---

        console.log('🚀 Iniciando aplicación...');

        if (!ERGOAuth.initializeAuthContext()) {
            ERGOAuth.redirectToLogin();
            return;
        }

        if (!workCenterId || !areaId) {
            ERGOUtils.showToast('Error: Parámetros de URL faltantes', 'error');
            window.location.href = '../areas.html';
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

        loadAndRenderAssignedPuestos(workCenterId);
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

              await loadActividades(); // 🔥 Esto pinta y habilita el botón PDF Consolidado


            try {
                await loadActividades();
                console.log("✅ Actividades cargadas y botón PDF Consolidado habilitado correctamente.");
            } catch (error) {
                console.error("❌ Error al ejecutar loadActividades:", error);
            }

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
            loadAndRenderAssignedPuestos(workCenterId);

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
            }

            // 2. Establecer el estado inicial a "solo lectura"
            isComentarioEnEdicion = false;
            textarea.classList.add('is-readonly');
            btn.textContent = 'Editar Comentario';

        } catch (error) {
            console.error("Error al cargar comentarios generales:", error);
        }

        const quillOptions = {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        };

        const workCenterData = await dataClient.getWorkCenter(workCenterId);
        
        // Inicializar quillComentariosGenerales
        quillComentariosGenerales = new Quill('#comentarios-generales', {
            readOnly: true,
            theme: 'bubble'
        });

        if (workCenterData && workCenterData.comentarios_generales) {
            quillComentariosGenerales.root.innerHTML = workCenterData.comentarios_generales;
        }

        // Inicializar todos los editores Quill
        quillActividadComentarios = new Quill('#actividad-comentarios', quillOptions);
        quillActividadRecomendaciones = new Quill('#actividad-recomendaciones', quillOptions);
        quillNotaTexto = new Quill('#nota-texto', quillOptions);

        setupEventListeners();
        loadComplianceOptions();
        ERGOAuth.applyPermissionControls();
        setupModalAccessibility('modal-condiciones');

        console.log('✅ Aplicación inicializada correctamente');
    });

function setupEventListeners() {
    document.getElementById('btn-comentarios').addEventListener('click', gestionarComentario);
    document.getElementById('foto-input').addEventListener('change', handleFotoUpload);
    
    const factoresIds = ['iluminacion', 'temperatura', 'ruido', 'personal', 'puestos'];

    factoresIds.forEach(id => {
        const checkbox = document.getElementById(`condiciones-${id}-na`);
        const input = document.getElementById(`condiciones-${id}-input`);
        
        // Corrección: Mover esta lógica dentro del bucle si es específica por ID
        // o sacarla si es general. Asumiendo que es específica para 'puestos':
        if (id === 'puestos') {
            const puestosCheckbox = document.getElementById('condiciones-puestos-na');
            const puestosSelect = document.getElementById('condiciones-puestos-input');
            
            puestosCheckbox.addEventListener('change', () => {
                puestosSelect.disabled = puestosCheckbox.checked;
                if (puestosCheckbox.checked) {
                    puestosSelect.value = '';
                }
            });
        } else if (input) { // Asegurarse que el input exista antes de añadir listener
             checkbox.addEventListener('change', () => {
                input.disabled = checkbox.checked;
                if (checkbox.checked) {
                    input.value = '';
                }
            });
        }
    });

    // AÑADIR ESTA LÍNEA para el nuevo input de fotos de actividad
    document.getElementById('foto-input-actividad').addEventListener('change', handleFotoUploadActividad);

    // Click en modal overlay para cerrar
    document.getElementById('modal-nota').addEventListener('click', function (e) {
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
        }

        // La lógica de navegación que ya tenías
        ERGONavigation.navigateToSpecificEvaluation(
            metodo,
            actividadEnEdicion.id,
            actividadEnEdicion.nombre
        );
    });

    const btnEvaluarTipo = document.getElementById('btn-evaluar-tipo');

    btnEvaluarTipo.addEventListener('click', () => {
            console.log('🔘 Click en btn-evaluar-tipo');
    console.log('📋 actividadEnEdicion:', actividadEnEdicion);
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

            const url = ERGONavigation.buildUrl(
                'componentes/pages/Johnson_Evaluation.html',
                params
            );
            window.location.href = url;

        } else {
            // Aquí podrías añadir la lógica para "WS" u otros tipos en el futuro
            ERGOUtils.showToast('Esta evaluación solo está disponible para el tipo de análisis EJA.', 'info');
        }
    });

    // --- BLOQUE AÑADIDO PARA EL DROPDOWN DE CUMPLIMIENTO ---
    const complianceWrapper = document.getElementById('cumplimiento-wrapper');
    const complianceBtn = document.getElementById('cumplimiento-selected-display');
    
    if (complianceBtn && complianceWrapper) {
        // 1. Abre/cierra la lista al hacer clic en el botón
        complianceBtn.addEventListener('click', () => {
            complianceWrapper.classList.toggle('is-expanded');
        });
        
        // 2. Cierra la lista si se hace clic fuera de ella
        document.addEventListener('click', (event) => {
            if (!complianceWrapper.contains(event.target) && complianceWrapper.classList.contains('is-expanded')) {
                complianceWrapper.classList.remove('is-expanded');
            }
        });
    }
    // --- FIN DEL BLOQUE AÑADIDO ---
}

async function gestionarComentario() {
  const modal = document.getElementById('modal-comentarios');
  const btnGuardar = document.getElementById('btn-guardar-comentarios-modal');

  // Si aún no existe el editor del modal, créalo
  if (!window.quillEditorModal) {
    window.quillEditorModal = new Quill('#comentarios-editor-modal', {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean']
        ]
      }
    });
  }

  // Copiar el contenido actual al modal
  window.quillEditorModal.root.innerHTML = quillComentariosGenerales.root.innerHTML;

  // Mostrar modal
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  // Guardar cambios
  btnGuardar.onclick = async () => {
    try {
      const nuevoContenido = window.quillEditorModal.root.innerHTML;

      // Actualiza la vista principal (sin toolbar)
      quillComentariosGenerales.root.innerHTML = nuevoContenido;

      // Guarda en Supabase
      ERGOUtils.showToast('Guardando comentario...', 'info');
      await dataClient.updateWorkCenterComments(workCenterId, nuevoContenido);
      ERGOUtils.showToast('Comentario actualizado.', 'success');

      cerrarModalComentarios();
    } catch (err) {
      console.error('Error al guardar el comentario:', err);
      ERGOUtils.showToast('No se pudo guardar el comentario.', 'error');
    }
  };
}

function cerrarModalComentarios() {
    const modal = document.getElementById('modal-comentarios');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}
// Asignamos el evento al botón una vez que el DOM está listo
const commentButton = document.getElementById('btn-comentarios');
if (commentButton) {
    commentButton.addEventListener('click', gestionarComentario);
}

    function volverACentros() {
        window.location.href = `../areas.html#area-${areaId}`;
    }

async function loadPuestosOptions() {
    const select = document.getElementById('condiciones-puestos-input');
    
    // Placeholder - reemplazar con tu fuente de datos real
    const puestos = [
        'Operador de máquina',
        'Supervisor de área',
        'Técnico de mantenimiento',
        'Auxiliar de producción',
        'Jefe de turno'
    ];
    
    // Limpiar opciones existentes (mantener la primera)
    select.innerHTML = '<option value="">Seleccionar puesto...</option>';
    
    // Agregar opciones dinámicamente
    puestos.forEach(puesto => {
        const option = document.createElement('option');
        option.value = puesto;
        option.textContent = puesto;
        select.appendChild(option);
    });
    
    // TODO: Reemplazar con llamada real a tu API/base de datos
    // const puestosFromDB = await dataClient.getPuestos();
}

async function loadComplianceOptions() {
    console.log('DEBUG: 1. Iniciando loadComplianceOptions (Dropdown)...');
    const radioContainer = document.getElementById('cumplimiento-radio-list');
    const selectedDisplayBtn = document.getElementById('cumplimiento-selected-display');
    const selectedDisplayText = document.getElementById('cumplimiento-selected-text');

    if (!radioContainer || !selectedDisplayBtn || !selectedDisplayText) {
        console.error('DEBUG: ERROR FATAL - Faltan elementos wrapper de cumplimiento');
        return;
    }

    complianceDataStore = {}; 

    try {
        const { data: requirements, error } = await dataClient.supabase
            .from('compliance_requirements')
            .select('name, category, content')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (error) throw error;
        
        console.log(`DEBUG: 2. Datos de Supabase recibidos (${requirements.length} normas).`);

        complianceDataStore['N/A'] = 'No aplica ninguna normatividad específica para este hallazgo.';

        const grouped = requirements.reduce((acc, item) => {
            const category = item.category || 'General';
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});

        let html = '';
        // Agregar N/A
        html += `
            <div class="compliance-radio-item">
                <input type="radio" name="cumplimiento_radio" value="N/A" id="radio_na">
                <label class="compliance-radio-label" for="radio_na">N/A (No Aplica)</label>
            </div>
        `;

        // Agregar el resto
        for (const category in grouped) {
            html += `<fieldset class="compliance-fieldset"><legend class="compliance-legend">${category}</legend>`;
            grouped[category].forEach(item => {
                const radioId = `radio_${item.name.replace(/\s/g, '_')}`;
                complianceDataStore[item.name] = item.content || 'No hay detalles disponibles.';
                html += `
                    <div class="compliance-radio-item">
                        <input type="radio" name="cumplimiento_radio" value="${item.name}" id="${radioId}">
                        <label class="compliance-radio-label" for="${radioId}">${item.name}</label>
                    </div>
                `;
            });
            html += `</fieldset>`;
        }
        
        console.log('DEBUG: 3. Almacén de datos poblado:', complianceDataStore);
        radioContainer.innerHTML = html;
        console.log('DEBUG: 4. HTML de radios insertado.');

        // --- NUEVA LÓGICA DE EVENTOS ---
        const wrapper = document.getElementById('cumplimiento-wrapper');
        
        radioContainer.querySelectorAll('.compliance-radio-item').forEach(item => {
            const radio = item.querySelector('input[type="radio"]');
            const label = item.querySelector('label');
            
            // 1. Hover (igual que antes)
            label.addEventListener('mouseenter', () => showComplianceDetails(radio.value));
            label.addEventListener('mouseleave', () => clearCompliancePreview());

            // 2. Clic en la etiqueta (para seleccionar)
            label.addEventListener('click', () => {
                // Seleccionamos el radio, actualizamos el botón y cerramos
                radio.checked = true;
                selectedDisplayText.textContent = label.textContent;
                
                // Actualizamos el hover del BOTÓN PRINCIPAL
                selectedDisplayBtn.onmouseenter = () => showComplianceDetails(radio.value);
                selectedDisplayBtn.onmouseleave = () => clearCompliancePreview();
                
                // Disparamos el evento 'change' manualmente
                radio.dispatchEvent(new Event('change', { bubbles: true })); 
            });

            // 3. Evento 'change' del radio
            radio.addEventListener('change', () => {
                console.log('DEBUG: CLIC. Radio cambiado. Valor:', radio.value);
                showComplianceDetails(radio.value); // Muestra el detalle
                wrapper.classList.remove('is-expanded'); // Cierra el dropdown
            });
        });
        console.log('DEBUG: 5. Listeners de "hover" y "clic" añadidos.');

    } catch (error) {
        console.error("DEBUG: Error cargando opciones de cumplimiento:", error);
        radioContainer.innerHTML = '<p class="error-message">Error al cargar normas.</p>';
    }
}


function sincronizarContenidoDiv() {
    // 1. Obtener el elemento del div editable
    var editorDiv = document.getElementById('editor-div');

    // 2. Obtener el elemento del textarea oculto
    var hiddenTextarea = document.getElementById('hidden-textarea');

    // 3. Copiar el contenido HTML del div al valor del textarea
    // Se usa.innerHTML para preservar cualquier formato (negritas, enlaces, etc.)
    // Si solo quieres texto plano, puedes usar.innerText en su lugar.
    hiddenTextarea.value = editorDiv.innerHTML;

    // Opcional: puedes añadir una validación para no enviar contenido vacío
    if (editorDiv.innerHTML.trim() === '') {
        alert('El contenido no puede estar vacío.');
        return false; // Esto detiene el envío del formulario
    }

    // Al no devolver 'false', el formulario continuará con su envío normal.
    return true; 
}