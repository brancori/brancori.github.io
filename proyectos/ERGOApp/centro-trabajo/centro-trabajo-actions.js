

        function triggerFotoUpload() {
            if (isCenterClosed) return;
            if (fotosActuales.length >= 5) {
                ERGOUtils.showToast('Ya tienes el máximo de 5 fotos', 'warning');
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
            if (window.ERGOConfig.USE_SUPABASE) {
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
        ERGOUtils.showToast("Ocurrieron algunos problemas:\n- " + errors.join("\n- "), 'error');
    }

    if (uploadedCount > 0) {
        ERGOUtils.showToast(`${uploadedCount} foto(s) cargada(s) con éxito.`, 'success');
        if (window.ERGOConfig.USE_SUPABASE) {
            await loadFotos(); 
        } else {
            fotosActuales = [...fotosActuales, ...newLocalFotos];
            ERGOStorage.setLocal(`fotos_${workCenterId}`, fotosActuales);
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
                    if (window.ERGOConfig.USE_SUPABASE) {
                        await dataClient.deleteFoto(fotoId);
                    }
                    
                    fotosActuales = fotosActuales.filter(f => f.id !== fotoId);
                    
                    if (!USE_SUPABASE) {
                        ERGOStorage.setLocal(`fotos_${workCenterId}`, fotosActuales);
                    }
                    
                    renderFotosGrid();
                } catch (error) {
                    console.error('Error deleting foto:', error);
                    ERGOUtils.showToast('Error al eliminar foto', 'error');
                }
            }
        }

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
  if (!files || files.length === 0 || !actividadEnEdicion) return;

  ERGOUtils.showToast(`Procesando ${files.length} foto(s)...`, 'info');

  // 1) Obtener el user_id del usuario autenticado
  const { data: userData, error: userErr } = await window.dataClient.supabase.auth.getUser();
  if (userErr || !userData?.user?.id) {
    ERGOUtils.showToast('No hay sesión activa. Inicia sesión e inténtalo de nuevo.', 'error');
    return;
  }
  const userId = userData.user.id;

  // 2) Subir cada archivo y registrar la metadata en fotos_actividades
  const uploadPromises = Array.from(files).map(async (file) => {
    try {
      // (a) Comprimir
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        useWebWorker: true
      });

      // (b) Subir al bucket "fotos"
      const storagePath = `${actividadEnEdicion.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: upErr } = await window.dataClient.supabase
        .storage
        .from('fotos')
        .upload(storagePath, compressed, { upsert: false });
      if (upErr) throw upErr;

      // (c) Insertar en la tabla (según tu esquema real)
      const { error: insErr } = await window.dataClient.supabase
        .from('fotos_actividades')
        .insert({
          actividad_id: actividadEnEdicion.id,
          user_id: userId,
          storage_path: storagePath,
          file_name: file.name
        });
      if (insErr) throw insErr;

    } catch (err) {
      console.error(`Error al procesar ${file.name}:`, err);
      throw err; // Para que allSettled cuente este archivo como "rejected"
    }
  });

  // 3) Reporte realista de resultados
  const results = await Promise.allSettled(uploadPromises);
  const failed = results.filter(r => r.status === 'rejected').length;
  const total = results.length;
  const succeeded = total - failed;

  if (failed === 0) {
    ERGOUtils.showToast('Carga de fotos completada.', 'success');
  } else if (failed === total) {
    ERGOUtils.showToast('No se pudo cargar ninguna foto.', 'error');
  } else {
    ERGOUtils.showToast(`Algunas fotos fallaron (${failed}/${total}).`, 'warning');
  }

  // 4) Limpiar input y recargar solo si hubo al menos una subida exitosa
  event.target.value = '';
  if (succeeded > 0) {
    try {
      await loadFotosActividad(actividadEnEdicion.id);
    } catch (e) {
      console.error('Error recargando fotos de la actividad:', e);
      ERGOUtils.showToast('No se pudieron recargar las fotos.', 'warning');
    }
  }
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
            quillNotaTexto.setText('');
        }

async function guardarNota() {
    const notaText = quillNotaTexto.root.innerHTML;
    
    console.log('📝 Contenido de nota:', notaText);

    if (!notaText || notaText.trim() === '<p></p>' || notaText.trim() === '') {
        ERGOUtils.showToast('La nota no puede estar vacía.', 'error');
        return;
    }

    try {
        if (notaEnEdicion) {
            await dataClient.updateNota(notaEnEdicion.id, { texto: notaText });
            ERGOUtils.showToast('Nota actualizada.', 'success');
        } else {
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
            quillNotaTexto.root.innerHTML = nota.texto;
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
            const url = `../evaluacion_ini/eval_int.html?workCenter=${workCenterId}&area=${areaId}&areaName=${encodeURIComponent(areaName || '')}&centerName=${encodeURIComponent(centerName || '')}&responsible=${encodeURIComponent(responsibleName || '')}`;
            window.location.href = url;
        }

        function volverACentros() {
            window.location.href = `areas.html#area-${areaId}`;
        }

async function exportarPDFDesdeServidor() {
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

        async function exportarPDFCompleto() {
    try {
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            ERGOUtils.showToast('Las librerías PDF no están listas, intenta de nuevo.', 'info');
            return;
        }

        ERGOUtils.showToast('Generando reporte...', 'info');

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let posY = 20;

        const centroNombre = document.getElementById('centro-name').textContent;
        const centroResponsable = document.getElementById('centro-responsable').textContent;
        const areaNombre = document.getElementById('breadcrumb-area').textContent;
        const scoreValue = document.getElementById('score-value').textContent;
        const scoreCategory = document.getElementById('score-category').textContent;
        const scoreColor = ERGOUtils.getScoreColor(parseFloat(scoreValue));
        const evalFecha = document.getElementById('eval-fecha').textContent;
        const evalSugeridas = document.getElementById('eval-sugeridas').textContent;
        const timestamp = new Date().toLocaleDateString();
        const nombreArchivo = `Reporte_${centroNombre.replace(/\s/g, '_')}.pdf`;
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Centro de Trabajo', 105, posY, { align: 'center' });
        posY += 10;

        doc.setFontSize(12);
        doc.text(centroNombre, 14, posY);
        doc.setFontSize(10);
        doc.text(centroResponsable, 14, posY + 5);
        doc.text(`Área: ${areaNombre} | Reporte del: ${timestamp}`, 14, posY + 10);

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(scoreColor);
        doc.roundedRect(150, posY - 5, 45, 20, 3, 3, 'F');
        doc.text(scoreValue, 172, posY + 4, { align: 'center' });
        doc.setFontSize(8);
        doc.text(scoreCategory, 172, posY + 12, { align: 'center' });
        
        posY += 25;
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen de Evaluación Inicial', 14, posY);
        posY += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha de Evaluación: ${evalFecha}`, 14, posY);
        doc.text(`Sugerencias: ${evalSugeridas}`, 14, posY + 6);
        posY += 20;

        if (evaluacionesEspecificas && evaluacionesEspecificas.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Actividades Registradas', 14, posY);
            posY += 8;
            const actividadesBody = evaluacionesEspecificas.map(act => [
                act.nombre,
                act.metodo || 'No definido',
                act.score_final ? `${act.score_final} Pts` : 'Pendiente',
                new Date(act.created_at).toLocaleDateString()
            ]);
            doc.autoTable({
                startY: posY,
                head: [['Nombre', 'Método', 'Score', 'Fecha']],
                body: actividadesBody,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }
            });
            posY = doc.lastAutoTable.finalY + 15;
        }

        if (fotosActuales && fotosActuales.length > 0) {
             if (posY > 240) { doc.addPage(); posY = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Evidencia Fotográfica', 14, posY);
            posY += 10;

            const fotosUrls = fotosActuales.map(foto => {
                return window.ERGOConfig.USE_SUPABASE ?
                    `${window.ERGOConfig.SUPABASE_URL}/storage/v1/object/public/fotos-centros/${foto.foto_url}` :
                    foto.url;
            });
            
            const imagePromises = fotosUrls.map(url => cargarImagenOptimizada(url));
            const loadedImages = (await Promise.all(imagePromises)).filter(Boolean);

            if (loadedImages.length > 0) {
                const margin = 14;
                const gap = 8;
                const boxWidth = (doc.internal.pageSize.getWidth() - (margin * 2) - gap) / 2;
                const boxHeight = 70;
                let x_coord = margin;

                for (let i = 0; i < loadedImages.length; i++) {
                    if (posY + boxHeight > doc.internal.pageSize.getHeight() - 20) {
                        doc.addPage();
                        posY = 20;
                        x_coord = margin;
                    }
                    agregarImagenConAspecto(doc, loadedImages[i], x_coord, posY, boxWidth, boxHeight);
                    if ((i + 1) % 2 === 0) {
                        posY += boxHeight + gap;
                        x_coord = margin;
                    } else {
                        x_coord += boxWidth + gap;
                    }
                }
                 posY += boxHeight + gap;
            }
        }
        
        if (notasActuales && notasActuales.length > 0) {
             if (posY > 250) { doc.addPage(); posY = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Notas y Observaciones', 14, posY);
            posY += 10;
            doc.setFont('helvetica', 'normal');
            notasActuales.forEach(nota => {
                const fechaNota = ERGOUtils.formatDate(nota.created_at || nota.fecha);
                const textoNota = doc.splitTextToSize(`(${fechaNota}): ${nota.texto}`, 180);
                 if (posY + (textoNota.length * 5) > 280) { doc.addPage(); posY = 20; }
                doc.setFontSize(9);
                doc.text(textoNota, 14, posY);
                posY += textoNota.length * 5 + 3;
            });
        }

        doc.save(nombreArchivo);
        ERGOUtils.showToast('Reporte generado con éxito', 'success');

    } catch (error) {
        console.error('Error generando PDF:', error);
        ERGOUtils.showToast(`Error al generar el PDF: ${error.message || error}`, 'error');
    }
}

async function cargarImagenOptimizada(url) {
    return new Promise((resolve) => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                if (!this.naturalWidth || !this.naturalHeight) {
                    resolve(null);
                    return;
                }
                const canvas = document.createElement('canvas');
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(this, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg', 0.85);
                resolve(dataURL);
            };
            img.onerror = () => resolve(null);
            img.src = url;
        } catch (e) {
            resolve(null);
        }
    });
}

function agregarImagenConAspecto(doc, imageData, x, y, maxWidth, maxHeight) {
    if (!imageData) return;
    try {
        const props = doc.getImageProperties(imageData);
        const aspectRatio = props.width / props.height;
        let finalWidth = maxWidth;
        let finalHeight = finalWidth / aspectRatio;

        if (finalHeight > maxHeight) {
            finalHeight = maxHeight;
            finalWidth = finalHeight * aspectRatio;
        }
        
        const centeredX = x + (maxWidth - finalWidth) / 2;
        const centeredY = y + (maxHeight - finalHeight) / 2;

        doc.addImage(imageData, 'JPEG', centeredX, centeredY, finalWidth, finalHeight);
    } catch (error) {
        console.error("No se pudo agregar una imagen al PDF:", error);
    }
}

/**
 * Puebla un elemento <datalist> con opciones
 * (Función auxiliar tomada de matriz.html)
 * @param {HTMLDataListElement} datalistEl - El elemento datalist a poblar
 * @param {string[]} optionsList - El array de strings para las opciones
 */
function populateDatalist(datalistEl, optionsList) {
    if (!datalistEl) return;
    datalistEl.innerHTML = '';
    const uniqueOptions = [...new Set(optionsList)].sort();
    uniqueOptions.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        datalistEl.appendChild(option);
    });
}

/**
 * Abre el modal para agregar un nuevo hallazgo.
 * Carga los datos necesarios para los selectores.
 */
async function abrirModalHallazgo() {
    if (isCenterClosed) {
        ERGOUtils.showToast('El centro está cerrado y no se puede editar.', 'warning');
        return;
    }
    if (!ERGOAuth.checkPermissionAndShowError('create')) return;

    try {
        // --- Poblar datos del modal ---
        
        // 1. Centro de Trabajo (Selector)
        const modalCentroSelect = document.getElementById('modalCentro');
        if (modalCentroSelect) {
            // Asumimos que el único centro relevante aquí es el actual.
            modalCentroSelect.innerHTML = `<option value="${workCenterId}" selected>${currentCenterData.name}</option>`;
        }

        // 2. Área (Input)
        const modalAreaInput = document.getElementById('modalAreaTopLevelInput');
        if (modalAreaInput) {
            modalAreaInput.value = decodeURIComponent(areaName || ''); // Pre-llenar con el área actual
        }

        // 3. Tareas (Datalist)
        // Usamos las actividades (evaluacionesEspecificas) ya cargadas en la página
        const tareaDatalist = document.getElementById('tareaDatalist');
        if (tareaDatalist && evaluacionesEspecificas && evaluacionesEspecificas.length > 0) {
            const tareas = [...new Set(evaluacionesEspecificas.map(e => e.nombre))];
            populateDatalist(tareaDatalist, tareas);
        }
        
        // Abrir el modal usando el sistema global
        ERGOModal.open('addEntryModal');

    } catch (error) {
        console.error("Error al preparar modal de hallazgo:", error);
        ERGOUtils.showToast('Error al abrir el modal.', 'error');
    }
}

/**
 * Cierra el modal de hallazgo y resetea el formulario.
 */
function cerrarModalHallazgo() {
    const form = document.getElementById('addEntryForm');
    if (form) form.reset();
    ERGOModal.close('addEntryModal');
    
    // Repoblar los campos pre-llenados que se borraron con reset()
    try {
        const modalCentroSelect = document.getElementById('modalCentro');
        if (modalCentroSelect) {
            modalCentroSelect.innerHTML = `<option value="${workCenterId}" selected>${currentCenterData.name}</option>`;
        }
        const modalAreaInput = document.getElementById('modalAreaTopLevelInput');
        if (modalAreaInput) {
            modalAreaInput.value = decodeURIComponent(areaName || '');
        }
    } catch(e) { /* Ignorar error si los elementos no existen */ }
}

/**
 * Guarda el nuevo hallazgo en la base de datos.
 */
async function guardarHallazgo() {
    if (!ERGOAuth.checkPermissionAndShowError('create')) return;

    // Extraer datos del formulario
    const hallazgoData = {
        centro_id: document.getElementById('modalCentro')?.value,
        area_top_level: document.getElementById('modalAreaTopLevelInput')?.value.trim(),
        tarea: document.getElementById('modalTareaInput')?.value.trim(),
        descripcion: document.getElementById('modalDescripcion')?.value.trim(),
        riesgo: document.getElementById('modalRiesgo')?.value.trim(),
        grupo_riesgo: document.getElementById('modalGrupoRiesgo')?.value.trim(),
        puesto: document.getElementById('modalPuesto')?.value.trim(),
        nivel_riesgo: document.getElementById('modalNivelRiesgo')?.value.trim(),
        evaluacion: document.getElementById('modalEvaluacion')?.value.trim(),
        cumplimiento: document.getElementById('modalCumplimiento')?.value.trim(),
        medida_control: document.getElementById('modalMedidaControl')?.value.trim(),
        nuevo_nivel_riesgo: document.getElementById('modalNuevoNivelRiesgo')?.value.trim(),
        tipo_control: document.getElementById('modalTipoControl')?.value.trim(),
        responsable: document.getElementById('modalResponsable')?.value.trim(),
        comentarios: document.getElementById('modalComentarios')?.value.trim(),
        art: document.getElementById('modalART')?.value.trim(),
        accion: document.getElementById('modalAccion')?.value.trim(),
        user_id: ERGOAuth.getCurrentUser()?.id
    };

    // Validación
    if (!hallazgoData.centro_id || !hallazgoData.area_top_level || !hallazgoData.tarea) {
        ERGOUtils.showToast('Centro, Área y Tarea son campos obligatorios.', 'error');
        return;
    }

    try {
        ERGOUtils.showToast('Guardando hallazgo...', 'info');
        
        // Asumo que tienes (o crearás) un método 'createHallazgo' en tu dataClient
        // que inserta en una tabla como 'matriz_hallazgos'.
        await dataClient.createHallazgo(hallazgoData);

        ERGOUtils.showToast('Hallazgo guardado correctamente.', 'success');
        cerrarModalHallazgo();
        
    } catch (error) {
        console.error('Error al guardar el hallazgo:', error);
        ERGOUtils.showToast(`No se pudo guardar el hallazgo. ${error.message}`, 'error');
    }
}