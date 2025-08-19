

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

        async function exportarPDFCompleto() {
            try {
                // Verificar que jsPDF esté disponible
                if (typeof window.jspdf === 'undefined') {
                    ERGOUtils.showToast('Cargando librerías PDF...', 'info');
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
                ERGOUtils.showToast('PDF generado correctamente', 'success');

            } catch (error) {
                console.error('Error generando PDF:', error);
                ERGOUtils.showToast('Error al generar PDF: ' + error.message, 'error');
            }
        }