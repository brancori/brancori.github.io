        // --- bootstrap de sesión para la página "centro-trabajo" ---

        let tipoEvaluacionACrear = null;
        let notaEnEdicion = null; 
         let isCenterClosed = false;
        // Variables globales
        let currentCenterData = null;
        let fotosActuales = [];
        let notasActuales = [];
        let evaluacionesEspecificas = [];
        let isComentarioEnEdicion = false;
        let quillComentariosGenerales, quillActividadComentarios, quillActividadRecomendaciones, quillNotaTexto;

        // Obtener parámetros de URL
        const urlParams = new URLSearchParams(window.location.search);
        const workCenterId = urlParams.get('workCenter');
        const areaId = urlParams.get('area');
        const areaName = urlParams.get('areaName');
        const centerName = urlParams.get('centerName');
        const responsibleName = urlParams.get('responsible');

        // Configuración Supabase


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
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}
        // Funciones de interacción

        /**
 * Dibuja la estructura HTML inicial para la vista de detalles de una actividad.
 * @param {object} actividad - El objeto de la actividad con los datos.
 * @param {HTMLElement} detailsContainer - El div donde se renderizará el contenido.
 * @param {string} dirtyHtmlString La cadena de HTML no confiable.
 * @param {string} normName - El 'name' de la norma (el valor del radio).
 */
function renderActividadDetails(actividad, detailsContainer) {
    // ✅ Decodificar el HTML escapado
    const comentarios = actividad.comentarios ? decodeHTML(actividad.comentarios) : '<i>Sin comentarios.</i>';
    const recomendaciones = actividad.recomendaciones ? decodeHTML(actividad.recomendaciones) : '<i>Sin recomendaciones.</i>';

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

function showComplianceDetails(normName) {
    console.log(`DEBUG: HOVER-IN. showComplianceDetails llamado con: "${normName}"`); // <-- LOG
    const detailsBox = document.getElementById('cumplimiento-details');
    if (!detailsBox) {
        console.error('DEBUG: ERROR - No se encontró #cumplimiento-details');
        return;
    }
    if (!complianceDataStore) {
        console.error('DEBUG: ERROR - complianceDataStore no está definido');
        return;
    }

    const content = complianceDataStore[normName];
    console.log(`DEBUG: HOVER-IN. Contenido encontrado: "${content ? content.substring(0, 30) + '...' : 'NADA'}"`); // <-- LOG

    if (content) {
        detailsBox.innerHTML = content;
        detailsBox.style.display = 'block';
    } else {
        detailsBox.style.display = 'none';
    }
}

/**
 * Limpia la vista previa o la restaura al valor seleccionado.
 * Se usa al quitar el mouse (mouseleave).
 */
function clearCompliancePreview() {
    console.log('DEBUG: HOVER-OUT. clearCompliancePreview llamado.'); // <-- LOG
    const detailsBox = document.getElementById('cumplimiento-details');
    if (!detailsBox) return;

    const selectedRadio = document.querySelector('input[name="cumplimiento_radio"]:checked');
    
    if (selectedRadio) {
        console.log(`DEBUG: HOVER-OUT. Restaurando al valor seleccionado: "${selectedRadio.value}"`); // <-- LOG
        // Volvemos a llamar a showComplianceDetails para restaurar el texto
        showComplianceDetails(selectedRadio.value);
    } else {
        // Si no hay nada seleccionado, oculta la caja
        detailsBox.style.display = 'none';
        detailsBox.innerHTML = '';
    }
}

        /**
 * Expande o contrae la vista de detalles de una actividad.
 * @param {string} actividadId - El ID de la actividad a mostrar/ocultar.
 * @param {HTMLElement} element - El elemento HTML del ítem que se ha clickeado.
 */
// Reemplaza tu toggle en centro-trabajo.js por este
function toggleActividadDetailsSimple(eOrEl) {
    const el = (eOrEl && eOrEl.currentTarget) || (eOrEl && eOrEl.target) || eOrEl;
    if (!el || !el.closest) {
        console.warn('toggleActividadDetailsSimple: parámetro inválido', eOrEl);
        return;
    }
    const card = el.closest('.actividad-item, .actividad-card, .actividad');
    if (!card) {
        console.warn('toggleActividadDetailsSimple: no encontré el contenedor .actividad-*');
        return;
    }
    const details = card.querySelector('.actividad-details');
    const chevron = card.querySelector('.chevron svg');
    const isOpen = details?.classList.toggle('open');
    card.classList.toggle('open', !!isOpen);
    if (chevron) {
        chevron.classList.toggle('rotated', !!isOpen);
    }
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
    const publicUrl = window.ERGOConfig.USE_SUPABASE ? 
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
 * @param {string|null} actividadId - El ID de la actividad a editar.
 */
function abrirModalActividad(actividadId = null) {
    const actividad = actividadId ? evaluacionesEspecificas.find(e => e.id === actividadId) : null;
    actividadEnEdicion = actividad;

    const esEdicion = actividad !== null;

    // Renombrar el modal y el botón
    document.getElementById('modal-actividad-titulo').textContent = esEdicion ? 'Editar Hallazgo' : 'Nuevo Hallazgo';
    document.getElementById('modal-actividad-btn-guardar').textContent = esEdicion ? 'Guardar Cambios' : 'Crear Hallazgo';
    
    document.getElementById('form-actividad').reset();
    document.getElementById('fotos-grid-actividad').innerHTML = '';
    
    // Lógica para los botones EJA/WS
    const tipoGroup = document.getElementById('tipo-analisis-group');
    const btns = tipoGroup.querySelectorAll('.btn-toggle');
    btns.forEach(btn => {
        btn.classList.remove('active');
        btn.onclick = () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });
    const btnEvaluarMetodo = document.getElementById('btn-evaluar-metodo');

    // --- NUEVO: Resetear el wrapper de cumplimiento ---
    const wrapper = document.getElementById('cumplimiento-wrapper');
    const selectedDisplayBtn = document.getElementById('cumplimiento-selected-display');
    const selectedDisplayText = document.getElementById('cumplimiento-selected-text');
    
    wrapper.classList.remove('is-expanded');
    selectedDisplayText.textContent = 'Selecciona una normatividad...';
    selectedDisplayBtn.onmouseenter = null;
    selectedDisplayBtn.onmouseleave = null;
    // --- FIN NUEVO ---

    if (esEdicion) {
        // --- CAMPOS REUTILIZADOS ---
document.getElementById('actividad-id').value = actividad.id;
        document.getElementById('actividad-nombre').value = actividad.nombre; // Tarea Específica
        document.getElementById('actividad-metodo').value = actividad.metodo; // Evaluación Específica
        quillActividadComentarios.root.innerHTML = actividad.comentarios || ''; // Comentarios
        quillActividadRecomendaciones.root.innerHTML = actividad.recomendaciones || ''; // Medida de Control
        // document.getElementById('nivel_riesgo').value = actividad.nivel_riesgo || ''; // Nivel de Riesgo (Eliminado)
        
        const tipoAnalisis = actividad.tipo_analisis || 'EJA';
                const activeBtn = tipoGroup.querySelector(`[data-value="${tipoAnalisis}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        // ... (código existente) ...
        btnEvaluarMetodo.disabled = !actividad.metodo;

        // --- NUEVOS CAMPOS ---
        document.getElementById('descripcion_detallada').value = actividad.descripcion_detallada || '';
        document.getElementById('descripcion_riesgo').value = actividad.descripcion_riesgo || '';
        document.getElementById('grupo_riesgo').value = actividad.grupo_riesgo || '';
        // document.getElementById('puesto_involucrado').value = actividad.puesto_involucrado || ''; // Eliminado
        
        document.getElementById('nuevo_nivel_riesgo').value = actividad.nuevo_nivel_riesgo || '';
        document.getElementById('tipo_control').value = actividad.tipo_control || '';
        // document.getElementById('art').value = actividad.art || ''; // Eliminado
        document.getElementById('accion').value = actividad.accion || '';

        // --- MANEJO DE CUMPLIMIENTO (MODIFICADO) ---
        const savedCompliance = actividad.cumplimiento || '';
        if (savedCompliance) {
            const radioToSelect = document.querySelector(`input[name="cumplimiento_radio"][value="${savedCompliance}"]`);
            if (radioToSelect) {
                radioToSelect.checked = true;
                // Actualizamos el texto del botón
                const label = radioToSelect.closest('.compliance-radio-item').querySelector('label');
                if(label) selectedDisplayText.textContent = label.textContent;
                
                // Actualizamos el hover del botón
                selectedDisplayBtn.onmouseenter = () => showComplianceDetails(savedCompliance);
                selectedDisplayBtn.onmouseleave = () => clearCompliancePreview();
            }
        }
        // Mostramos el detalle de la norma ya guardada
        showComplianceDetails(savedCompliance); 

        // Cargar fotos
        loadFotosActividad(actividad.id);

    } else {
        // Modo Creación
        btnEvaluarMetodo.disabled = true;
        tipoGroup.querySelector('[data-value="EJA"]').classList.add('active');
        
        // Limpiar campos
        quillActividadComentarios.root.innerHTML = '';
        quillActividadRecomendaciones.root.innerHTML = '';
        document.getElementById('actividad-id').value = '';
        
        // Limpiar vista previa de cumplimiento
        clearCompliancePreview(); 
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

    // --- LIMPIEZA DE CUMPLIMIENTO (MODIFICADO) ---
    const checkedRadio = document.querySelector('input[name="cumplimiento_radio"]:checked');
    if (checkedRadio) {
        checkedRadio.checked = false; // Deseleccionamos el radio
    }
    
    // Reseteamos el botón
    document.getElementById('cumplimiento-wrapper').classList.remove('is-expanded');
    document.getElementById('cumplimiento-selected-text').textContent = 'Selecciona una normatividad...';
    document.getElementById('cumplimiento-selected-display').onmouseenter = null;
    document.getElementById('cumplimiento-selected-display').onmouseleave = null;
    
    clearCompliancePreview(); // Ocultamos la caja de detalles
}

/**
 * Guarda o actualiza una actividad.
 */


async function guardarActividad() {
    if (!ERGOAuth.checkPermissionAndShowError('create')) return;

    const id = document.getElementById('actividad-id').value;
    const esModoEdicion = !!id;

    const tipoAnalisisActivo = document.querySelector('#tipo-analisis-group .btn-toggle.active');
    
    // --- OBTENER VALOR DE CUMPLIMIENTO (RADIO) ---
    const selectedCompliance = document.querySelector('input[name="cumplimiento_radio"]:checked');

    const data = {
        work_center_id: workCenterId,
        area_id: areaId,
        user_id: ERGOAuth.getCurrentUser()?.id,
        
        // --- CAMPOS REUTILIZADOS ---
        nombre: document.getElementById('actividad-nombre').value.trim(), // Tarea Específica
        metodo: document.getElementById('actividad-metodo').value, // Evaluación Específica
        comentarios: quillActividadComentarios.root.innerHTML, // Comentarios
        recomendaciones: quillActividadRecomendaciones.root.innerHTML, // Medida de Control
        tipo_analisis: tipoAnalisisActivo ? tipoAnalisisActivo.dataset.value : 'EJA',

        // --- NUEVOS CAMPOS ---
        descripcion_detallada: document.getElementById('descripcion_detallada').value.trim(),
        descripcion_riesgo: document.getElementById('descripcion_riesgo').value.trim(),
        grupo_riesgo: document.getElementById('grupo_riesgo').value, // Campo ahora es SELECT
        
        // --- DATOS AUTOMÁTICOS ---
        puesto_involucrado: document.getElementById('condicion-puestos-valor').innerHTML, // Toma el HTML de la lista de puestos
        art: document.getElementById('condicion-art-valor').textContent.trim(), // Toma el texto del ART
        
        // --- CAMPO CORREGIDO ---
        cumplimiento: selectedCompliance ? selectedCompliance.value : null, // Obtiene el valor del radio
        
        nuevo_nivel_riesgo: document.getElementById('nuevo_nivel_riesgo').value.trim(),
        tipo_control: document.getElementById('tipo_control').value, // Campo ahora es SELECT
        accion: document.getElementById('accion').value.trim()
        // 'responsable' y 'nivel_riesgo' han sido eliminados
    };

    if (!data.nombre) {
        ERGOUtils.showToast('La Tarea Específica (Hallazgo) es obligatoria.', 'error');
        return;
    }

    try {
        if (esModoEdicion) {
            await dataClient.updateActividad(id, data);
            ERGOUtils.showToast('Hallazgo actualizado.', 'success');
        } else {
            const nuevaActividadArray = await dataClient.createActividad(data);
            if (!nuevaActividadArray || nuevaActividadArray.length === 0) {
                 throw new Error("La creación no devolvió el nuevo registro.");
            }
            actividadEnEdicion = nuevaActividadArray[0]; 
            document.getElementById('actividad-id').value = actividadEnEdicion.id;
            ERGOUtils.showToast('Hallazgo creado. Ahora puedes añadir fotos o evaluar.', 'success');
            
            // Renombrar botón para reflejar modo edición
            document.getElementById('modal-actividad-btn-guardar').textContent = 'Guardar Cambios';
        }
        
        await loadActividades(); // Recarga la lista principal
        
        if (esModoEdicion) {
            cerrarModalActividad();
        }

    } catch (error) {
        console.error('Error al guardar el hallazgo:', error);
        ERGOUtils.showToast(`No se pudo guardar el hallazgo. ${error.message}`, 'error');
    }
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

            const isPasswordCorrect = await verifyCurrentUserPassword(password);

            if (!isPasswordCorrect) {
                ERGOUtils.showToast('Contraseña incorrecta', 'error');
                return;
            }

            const newState = !isCenterClosed;
            try {
                await dataClient.updateWorkCenterStatus(workCenterId, areaId, newState);
                
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
/**
 * Gestiona la accesibilidad de un modal para el teclado.
 * @param {string} modalId - El ID del elemento del modal.
 */
function setupModalAccessibility(modalId) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    const focusableElements = modalEl.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    
    const firstFocusableEl = focusableElements[0];
    const lastFocusableEl = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
        // Cerrar con la tecla Escape
        if (e.key === 'Escape') {
            // Asumimos que la función se llama como en tu código
            cerrarModalCondiciones();
        }

        // Atrapar el foco dentro del modal con la tecla Tab
        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        }
    };

    // Añade el listener al abrir y lo elimina al cerrar
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && modalEl.classList.contains('show')) {
                // Modal abierto: añadir listener y poner foco
                document.addEventListener('keydown', handleKeyDown);
                setTimeout(() => firstFocusableEl.focus(), 100);
            } else {
                // Modal cerrado: eliminar listener
                document.removeEventListener('keydown', handleKeyDown);
            }
        });
    });

    observer.observe(modalEl, { attributes: true });
}

document.addEventListener('DOMContentLoaded', () => {
    const radiosCargas = document.querySelectorAll('input[name="cargas_manuales"]');
    const containerEvaluar = document.getElementById('evaluar-cargas-container');

    radiosCargas.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === 'si' && event.target.checked) {
                containerEvaluar.style.display = 'block';
            } else {
                containerEvaluar.style.display = 'none';
            }
        });
    });
});