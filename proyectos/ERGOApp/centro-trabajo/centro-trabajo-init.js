    /**
 * Módulo de inicialización de la vista de Centro de Trabajo.
 * Contiene la carga inicial, render de datos principales y configuración de eventos.
 */
    
    document.addEventListener('DOMContentLoaded', async function () {
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

        } catch (error) {
            console.error("Error al cargar comentarios generales:", error);
        }

        setupEventListeners();
        ERGOAuth.applyPermissionControls();

        console.log('✅ Aplicación inicializada correctamente');
    });

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

                const url = ERGONavigation.buildUrl('../componentes/pages/Johnson_Evaluation.html', params);
                window.location.href = url;
            } else {
                // Aquí podrías añadir la lógica para "WS" u otros tipos en el futuro
                ERGOUtils.showToast('Esta evaluación solo está disponible para el tipo de análisis EJA.', 'info');
            }
        });
    }

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

    function volverACentros() {
        window.location.href = `../areas.html#area-${areaId}`;
    }
