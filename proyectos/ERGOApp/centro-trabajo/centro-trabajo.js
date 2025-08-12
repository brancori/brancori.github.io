        // --- bootstrap de sesión para la página "centro-trabajo" ---
(async function bootstrapCentroTrabajoAuth() {
  try {
    const raw = sessionStorage.getItem('sessionToken');
    if (!raw) return; // si no hay sesión, que el flujo normal te mande a login

    let access_token = null, refresh_token = '';
    try {
      const maybe = JSON.parse(raw);
      if (maybe && typeof maybe === 'object' && maybe.access_token) {
        access_token = maybe.access_token;
        refresh_token = maybe.refresh_token || '';
      } else {
        access_token = raw; // era string plano
      }
    } catch {
      access_token = raw; // no era JSON, era string plano
    }

    // para tu wrapper REST (usa bearer string)
    if (window.dataClient?.setAuth) {
      window.dataClient.setAuth(access_token);
    }

    // para el cliente supabase que usa los INSERT/Storage en esta página
    if (window.dataClient?.supabase?.auth?.setSession) {
      await window.dataClient.supabase.auth.setSession({ access_token, refresh_token });
    }

    // (opcional) si aquí mismo haces lecturas con authClient, lo puedes hidratar también:
    // if (window.authClient?.supabase?.auth?.setSession) {
    //   await window.authClient.supabase.auth.setSession({ access_token, refresh_token });
    // }
  } catch (e) {
    console.warn('bootstrapCentroTrabajoAuth: no se pudo hidratar la sesión', e);
  }
})();

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

        // Funciones de interacción

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
