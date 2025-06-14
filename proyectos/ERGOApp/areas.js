// Configuración para usar Supabase o localStorage
const USE_SUPABASE = true; // Cambiar a false para usar localStorage
// Sistema de permisos
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
    }
}

function hasPermission(action) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const rango = currentUser.rango;
    
    switch (action) {
        case 'read':
            return [1, 2, 3].includes(rango); // Todos pueden leer
        case 'create':
            return [1, 2].includes(rango); // Admin y Editor
        case 'update':
            return [1].includes(rango); // Solo Admin
        case 'delete':
            return [1].includes(rango); // Solo Admin
        default:
            return false;
    }
}

function checkPermissionAndShowError(action) {
    if (!hasPermission(action)) {
        showToast('No tienes permisos para realizar esta acción', 'error');
        return false;
    }
    return true;
}

// Funciones híbridas que usan Supabase o localStorage
async function loadAreas() {
    if (USE_SUPABASE) {
        try {
            areas = await supabase.getAreas();
        } catch (error) {
            console.error('Error loading areas from Supabase:', error);
            areas = JSON.parse(localStorage.getItem('areas')) || [];
        }
    } else {
        areas = JSON.parse(localStorage.getItem('areas')) || [];
    }
    return areas;
}

async function saveAreaToStorage(area) {
    if (!checkPermissionAndShowError('create')) return;
    if (USE_SUPABASE) {
        try {
            await supabase.createArea(area);
        } catch (error) {
            console.error('Error saving area to Supabase:', error);
        }
    } else {
        localStorage.setItem('areas', JSON.stringify(areas));
    }
}

async function loadWorkCenters(area_id = null) {
    if (USE_SUPABASE) {
        try {
            const data = await supabase.getWorkCenters(area_id);
            workCenters = data || [];
        } catch (error) {
            console.error('Error loading work centers from Supabase:', error);
            workCenters = JSON.parse(localStorage.getItem('workCenters')) || [];
        }
    } else {
        workCenters = JSON.parse(localStorage.getItem('workCenters')) || [];
    }
    return workCenters;
}

// Variables globales
let areas = JSON.parse(localStorage.getItem('areas')) || [];
let workCenters = JSON.parse(localStorage.getItem('workCenters')) || [];
let current_area_id = null;

// Obtener parámetros de URL para identificar el centro
const urlParams = new URLSearchParams(window.location.search);
const workCenterId = urlParams.get('workCenter');
const area_id = urlParams.get('area');
const areaName = urlParams.get('areaName');
const centerName = urlParams.get('centerName');
const responsibleName = urlParams.get('responsible');

// Utilidades
function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Verificar que el ID no exista
    const existingIds = [...areas.map(a => a.id), ...workCenters.map(wc => wc.id)];
    if (existingIds.includes(result)) {
        return generateShortId(); // Recursión si existe
    }
    return result;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function updateAreasCount() {
    const count = areas.length;
    const countElement = document.getElementById('areas-count');
    if (countElement) {
        countElement.textContent = `${count} ${count === 1 ? 'área' : 'áreas'}`;
    }
}

function updateCentersCount() {
    if (!current_area_id) return;
    
    const areaCenters = workCenters.filter(wc => wc.area_id === current_area_id);
    const count = areaCenters.length;
    const countElement = document.getElementById('centers-count');
    if (countElement) {
        countElement.textContent = `${count} ${count === 1 ? 'centro' : 'centros'}`;
    }
}

// Gestión de áreas
function openAreaModal() {
    const modal = document.getElementById('area-modal');
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Focus en el primer input
    setTimeout(() => {
        document.getElementById('area-name').focus();
    }, 100);
}

function closeAreaModal() {
    const modal = document.getElementById('area-modal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('area-form').reset();
    }, 200);
}

async function saveArea() {
    const name = document.getElementById('area-name').value.trim();
    const responsible = document.getElementById('area-responsible').value.trim();
    
    if (!name || !responsible) {
        showToast('Por favor, completa todos los campos', 'error');
        return;
    }
    
    // Verificar si es edición (si el modal tiene un ID oculto)
    const editingId = document.getElementById('area-id-hidden')?.value;
    
    if (editingId) {
        // ES EDICIÓN - UPDATE
        if (areas.some(area => area.id !== editingId && area.name.toLowerCase() === name.toLowerCase())) {
            showToast('Ya existe un área con ese nombre', 'error');
            return;
        }

        try {
            const updatedArea = {
                name: name,
                responsible: responsible,
                updated_at: new Date().toISOString()
            };

            if (USE_SUPABASE) {
                await supabase.updateArea(editingId, updatedArea);
            }
            
            // Actualizar array local
            const areaIndex = areas.findIndex(a => a.id === editingId);
            if (areaIndex !== -1) {
                areas[areaIndex] = { ...areas[areaIndex], ...updatedArea };
            }
            
            localStorage.setItem('areas', JSON.stringify(areas));
            
            closeAreaModal();
            await renderAreas();
            showToast(`Área "${name}" actualizada exitosamente`);
        } catch (error) {
            console.error('Error updating area:', error);
            showToast('Error al actualizar el área', 'error');
        }
    } else {
        // ES CREACIÓN - CREATE (código existente)
        if (areas.some(area => area.name.toLowerCase() === name.toLowerCase())) {
            showToast('Ya existe un área con ese nombre', 'error');
            return;
        }

        const newArea = {
            id: generateShortId(),
            name: name,
            responsible: responsible,
            created_at: new Date().toISOString()
        };

        try {
            if (USE_SUPABASE) {
                await supabase.createArea(newArea);
                areas.push(newArea);
            } else {
                areas.push(newArea);
                localStorage.setItem('areas', JSON.stringify(areas));
            }
            
            closeAreaModal();
            await renderAreas();
            showToast(`Área "${name}" creada exitosamente`);
        } catch (error) {
            console.error('Error saving area:', error);
            showToast('Error al crear el área', 'error');
        }
    }
}

async function deleteArea(area_id, event) {
    event.stopPropagation();
    if (!checkPermissionAndShowError('delete')) return;
    const area = areas.find(a => a.id === area_id);
    if (!area) return;
    
    const areaCenters = workCenters.filter(wc => wc.area_id === area_id);
    const centerCount = areaCenters.length;
    
    let confirmMessage = `¿Estás seguro de eliminar el área "${area.name}"?`;
    if (centerCount > 0) {
        confirmMessage += `\n\nEsto también eliminará ${centerCount} ${centerCount === 1 ? 'centro de trabajo asociado' : 'centros de trabajo asociados'}.`;
    }
    
    if (confirm(confirmMessage)) {
        try {
            if (USE_SUPABASE) {
                // Eliminar centros asociados primero
                for (const center of areaCenters) {
                    await supabase.deleteWorkCenter(center.id);
                }
                // Luego eliminar el área
                await supabase.deleteArea(area_id);
            }
            
            // Actualizar arrays locales
            areas = areas.filter(a => a.id !== area_id);
            workCenters = workCenters.filter(wc => wc.area_id !== area_id);
            
            // Actualizar localStorage como fallback
            localStorage.setItem('areas', JSON.stringify(areas));
            localStorage.setItem('workCenters', JSON.stringify(workCenters));
            
            await renderAreas();
            showToast(`Área "${area.name}" eliminada`);
        } catch (error) {
            console.error('Error deleting area:', error);
            showToast('Error al eliminar el área', 'error');
        }
    }
}

async function renderAreas() {
    const container = document.getElementById('areas-container');
    updateAreasCount();
    
    await loadWorkCenters();
    
    if (areas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No hay áreas registradas</h3>
                <p>Comienza creando tu primera área de trabajo</p>
            </div>
        `;
        return;
    }

    // Crear array de promesas para obtener los summaries
    const summariesPromises = areas.map(area => calcularPromedioAreaFromSupabase(area.id));
    const summaries = await Promise.all(summariesPromises);

    container.innerHTML = areas.map((area, index) => {
    const summary = summaries[index];
    
    const centerCount = summary.total_centros;
    const promedioScore = summary.promedio_score;
    const colorPromedio = summary.color_promedio;
    const centrosEvaluados = summary.centros_evaluados;
    
    // Verificar permisos para mostrar botón eliminar
    const showDeleteButton = hasPermission('delete');
    
    return `
        <div class="card" onclick="showAreaDetail('${area.id}')">
            <div class="card-header">
                <div class="card-id">${area.id}</div>
            </div>
            <h3>${area.name}</h3>
            <div class="card-responsible">Responsable: ${area.responsible}</div>
            
            <div style="
                font-size: 11px;
                color: #666;
                margin: 8px 0;
                padding: 6px 10px;
                background-color: #f8f9fa;
                border-radius: 4px;
                border-left: 3px solid ${colorPromedio};
                font-weight: 500;
            ">
                📊 Promedio: ${promedioScore}%
                <br>
                <small style="font-size: 10px; color: #888;">
                    ${centrosEvaluados}/${centerCount} evaluados
                </small>
            </div>
            
            <div class="card-footer">
                <div class="card-stats">
                    ${centerCount} ${centerCount === 1 ? 'centro' : 'centros'} de trabajo
                </div>
                ${showDeleteButton ? `
                    <button class="btn btn-danger" onclick="deleteArea('${area.id}', event)">
                        Eliminar
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}).join('');
}

// Navegación
function showAreasPage() {
    document.getElementById('areas-page').classList.add('active');
    document.getElementById('area-detail-page').classList.remove('active');
    current_area_id = null;
    renderAreas();
}

async function showAreaDetail(area_id) {
    const area = areas.find(a => a.id === area_id);
    if (!area) {
        showToast('Área no encontrada', 'error');
        return;
    }

    current_area_id = area_id;
    
    // Actualizar contenido de la página
    document.getElementById('area-detail-title').textContent = area.name;
    document.getElementById('area-detail-subtitle').textContent = `Responsable: ${area.responsible}`;
    document.getElementById('breadcrumb-area').textContent = area.name;
    
    // Cambiar páginas
    document.getElementById('areas-page').classList.remove('active');
    document.getElementById('area-detail-page').classList.add('active');
    
    await loadWorkCenters(area_id);
    await renderWorkCenters();
}

// Gestión de centros de trabajo
function openWorkCenterModal() {
    if (!current_area_id) {
        showToast('Error: No hay área seleccionada', 'error');
        return;
    }
    
    const modal = document.getElementById('work-center-modal');
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Focus en el primer input
    setTimeout(() => {
        document.getElementById('work-center-name').focus();
    }, 100);
}

function closeWorkCenterModal() {
    const modal = document.getElementById('work-center-modal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('work-center-form').reset();
    }, 200);
}

async function saveWorkCenter() {
    if (!checkPermissionAndShowError('create')) return;
    const name = document.getElementById('work-center-name').value.trim();
    const responsible = document.getElementById('work-center-responsible').value.trim();
    
    if (!name || !responsible) {
        showToast('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (!current_area_id) {
        showToast('Error: No hay área seleccionada', 'error');
        return;
    }
    
    // Verificar si es edición
    const editingId = document.getElementById('work-center-id-hidden')?.value;
    
    if (editingId) {
        // ES EDICIÓN - UPDATE
        const areaCenters = workCenters.filter(wc => wc.area_id === current_area_id);
        if (areaCenters.some(center => center.id !== editingId && center.name.toLowerCase() === name.toLowerCase())) {
            showToast('Ya existe un centro con ese nombre en esta área', 'error');
            return;
        }

        try {
            const updatedCenter = {
                name: name,
                responsible: responsible,
                updated_at: new Date().toISOString()
            };

            if (USE_SUPABASE) {
                await supabase.updateWorkCenter(editingId, updatedCenter);
            }
            
            // Actualizar array local
            const centerIndex = workCenters.findIndex(wc => wc.id === editingId);
            if (centerIndex !== -1) {
                workCenters[centerIndex] = { ...workCenters[centerIndex], ...updatedCenter };
            }
            
            localStorage.setItem('workCenters', JSON.stringify(workCenters));
            
            closeWorkCenterModal();
            await renderWorkCenters();
            await renderAreas();
            showToast(`Centro "${name}" actualizado exitosamente`);
        } catch (error) {
            console.error('Error updating work center:', error);
            showToast('Error al actualizar el centro de trabajo', 'error');
        }
    } else {
        // ES CREACIÓN - CREATE (código existente)
        const areaCenters = workCenters.filter(wc => wc.area_id === current_area_id);
        if (areaCenters.some(center => center.name.toLowerCase() === name.toLowerCase())) {
            showToast('Ya existe un centro con ese nombre en esta área', 'error');
            return;
        }

        const newWorkCenter = {
            id: generateShortId(),
            name: name,
            responsible: responsible,
            area_id: current_area_id,
            created_at: new Date().toISOString()
        };

        try {
            if (USE_SUPABASE) {
                await supabase.createWorkCenter(newWorkCenter);
                workCenters.push(newWorkCenter);
            } else {
                workCenters.push(newWorkCenter);
                localStorage.setItem('workCenters', JSON.stringify(workCenters));
            }
            
            closeWorkCenterModal();
            await renderWorkCenters();
            await renderAreas();
            showToast(`Centro de trabajo "${name}" creado exitosamente`);
        } catch (error) {
            console.error('Error saving work center:', error);
            showToast('Error al crear el centro de trabajo', 'error');
        }
    }
}

async function deleteWorkCenter(centerId, event) {
    event.stopPropagation();
    if (!checkPermissionAndShowError('delete')) return;
    
    const center = workCenters.find(wc => wc.id === centerId);
    if (!center) return;
    
    if (confirm(`¿Estás seguro de eliminar el centro "${center.name}"?`)) {
        try {
            if (USE_SUPABASE) {
                await supabase.deleteWorkCenter(centerId);
            }
            
            // Actualizar array local
            workCenters = workCenters.filter(wc => wc.id !== centerId);
            
            // Actualizar localStorage como fallback
            localStorage.setItem('workCenters', JSON.stringify(workCenters));
            
            await renderWorkCenters();
            await renderAreas(); // Actualizar contador en vista principal
            showToast(`Centro "${center.name}" eliminado`);
        } catch (error) {
            console.error('Error deleting work center:', error);
            showToast('Error al eliminar el centro de trabajo', 'error');
        }
    }
}

async function renderWorkCenters() {
    const container = document.getElementById('work-centers-container');
    updateCentersCount();
    
    if (!current_area_id) {
        container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>No se ha seleccionado ningún área</p></div>`;
        return;
    }
    
    const areaCenters = workCenters.filter(wc => wc.area_id === current_area_id);
    
    if (areaCenters.length === 0) {
        container.innerHTML = `<div class="empty-state"><h3>No hay centros de trabajo</h3><p>Agrega el primer centro de trabajo para esta área</p></div>`;
        return;
    }

    // Obtener scores de todos los centros de forma paralela
    const scoreInfoPromises = areaCenters.map(center => obtenerScoreFromSupabase(center.id));
    const scoreInfos = await Promise.all(scoreInfoPromises);

    container.innerHTML = areaCenters.map((center, index) => {
        const scoreInfo = scoreInfos[index];
        
        return `
            <div class="card" data-work-center-id="${center.id}" onclick="window.location.href='centro-trabajo.html?workCenter=${center.id}&area=${current_area_id}&areaName=${encodeURIComponent(areas.find(a => a.id === current_area_id)?.name || '')}&centerName=${encodeURIComponent(center.name)}&responsible=${encodeURIComponent(center.responsible)}'">        
                <div class="card-header">
                    <div class="card-id">${center.id}</div>
                </div>
                <h3>${center.name}</h3>
                <div class="card-responsible">Responsable: ${center.responsible}</div>
                
                <!-- Score ergonómico -->
                <div class="score-ergonomico" style="
                    font-size: 12px;
                    color: #666;
                    margin-top: 4px;
                    padding: 4px 8px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    border-left: 3px solid ${scoreInfo.color_riesgo};
                    font-weight: 500;
                ">
                    📊 Riesgo: ${scoreInfo.score_actual}% - ${scoreInfo.categoria_riesgo}
                </div>
                
                <div class="card-footer">
                    <div class="card-stats">
                        Creado ${formatDate(center.created_at)}
                    </div>
                    <button class="btn btn-danger" onclick="deleteWorkCenter('${center.id}', event)">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Utilidades adicionales
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'hace 1 día';
    } else if (diffDays < 7) {
        return `hace ${diffDays} días`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else {
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar datos desde Supabase
    try {
        await loadAreas();
        await loadWorkCenters();
    } catch (error) {
        console.error('Error loading data:', error);
    }
    
    // Verificar parámetros de URL ANTES de renderizar
    const urlParams = new URLSearchParams(window.location.search);
    const areaIdFromUrl = urlParams.get('area');
    const areaNameFromUrl = urlParams.get('areaName');

    if (areaIdFromUrl && areaNameFromUrl) {
        // Ir directamente a la vista de área específica SIN mostrar la lista de áreas
        await showAreaDetail(areaIdFromUrl);
    } else {
        // Solo renderizar áreas si NO hay parámetros específicos
        await renderAreas();
    }

    // Cargar scores existentes
    setTimeout(() => {
        cargarScoresExistentes();
    }, 100);
    
applyPermissionControls();
});
function applyPermissionControls() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Ocultar botones según permisos
    const newAreaBtn = document.querySelector('button[onclick="openAreaModal()"]');
    const newCenterBtn = document.querySelector('button[onclick="openWorkCenterModal()"]');
    
    if (!hasPermission('create')) {
        if (newAreaBtn) {
            newAreaBtn.style.display = 'none';
        }
        if (newCenterBtn) {
            newCenterBtn.style.display = 'none';
        }
    }
    
    // Mostrar indicador de permisos en consola
    const rangoTexto = {
        1: 'Administrador (CRUD completo)',
        2: 'Editor (Crear y leer)',
        3: 'Visualizador (Solo lectura)'
    };
    
    console.log(`👤 Usuario: ${currentUser.nombre} - ${rangoTexto[currentUser.rango] || 'Rango desconocido'}`);
}

// Funciones de exportación e importación (para futuro uso)
function exportData() {
    const data = {
        areas: areas,
        workCenters: workCenters,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `areas-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.areas && data.workCenters) {
                areas = data.areas;
                workCenters = data.workCenters;
                
                localStorage.setItem('areas', JSON.stringify(areas));
                localStorage.setItem('workCenters', JSON.stringify(workCenters));
                
                renderAreas();
                showToast('Datos importados exitosamente');
            } else {
                throw new Error('Formato de archivo inválido');
            }
        } catch (error) {
            showToast('Error al importar el archivo', 'error');
            console.error('Error importing data:', error);
        }
    };
    reader.readAsText(file);
}

// Función para limpiar datos (desarrollo)
function clearAllData() {
    if (confirm('¿Estás seguro de eliminar todos los datos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('areas');
        localStorage.removeItem('workCenters');
        areas = [];
        workCenters = [];
        current_area_id = null;
        showAreasPage();
        showToast('Todos los datos han sido eliminados');
    }
}

// Función para obtener color según el score de riesgo
function obtenerColorRiesgo(score) {
    if (score <= 25) return "#28a745";
    else if (score <= 50) return "#ffc107";
    else if (score <= 75) return "#fd7e14";
    else return "#dc3545";
}

// Función para actualizar el score visualmente en el centro
function actualizarScoreEnCentro(workCenterId, score, categoria) {
    // Buscar el elemento del centro de trabajo
    const centroElement = document.querySelector(`[data-work-center-id="${workCenterId}"]`);
    if (centroElement) {
        // Remover score anterior si existe
        const scoreAnterior = centroElement.querySelector('.score-ergonomico');
        if (scoreAnterior) scoreAnterior.remove();
        
        // Crear nuevo elemento de score
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-ergonomico';
        scoreElement.style.cssText = `
            font-size: 12px;
            color: #666;
            margin-top: 4px;
            padding: 4px 8px;
            background-color: #f8f9fa;
            border-radius: 4px;
            border-left: 3px solid ${obtenerColorRiesgo(parseFloat(score))};
            font-weight: 500;
        `;
        scoreElement.innerHTML = `📊 Riesgo Ergonómico: ${score}%`;
        
        // Insertar después del nombre del centro (h3)
        const nombreCentro = centroElement.querySelector('h3');
        if (nombreCentro) {
            nombreCentro.insertAdjacentElement('afterend', scoreElement);
        }
    }
}

// Función para cargar scores existentes al cargar la página
function cargarScoresExistentes() {
    const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones')) || [];
    
    evaluaciones.forEach(evaluacion => {
        if (evaluacion.workCenterId && evaluacion.scoreFinal) {
            actualizarScoreEnCentro(
                evaluacion.workCenterId, 
                evaluacion.scoreFinal, 
                evaluacion.categoriaRiesgo
            );
        }
    });
}

// Listener para recibir actualizaciones de evaluaciones
window.addEventListener('message', function(event) {
    if (event.data.type === 'evaluacionActualizada') {
        const { workCenterId, score, categoria } = event.data;
        actualizarScoreEnCentro(workCenterId, score, categoria);
    }
});

// Función para obtener score desde Supabase con fallback a localStorage
async function obtenerScoreFromSupabase(workCenterId) {
    if (USE_SUPABASE) {
        try {
            const score = await supabase.getScoreWorkCenter(workCenterId);
            if (score) {
                return {
                    score_actual: score.score_actual,
                    categoria_riesgo: score.categoria_riesgo,
                    color_riesgo: score.color_riesgo
                };
            }
        } catch (error) {
            console.error('Error obteniendo score de Supabase:', error);
        }
    }
    
    // Fallback a localStorage si Supabase falla
    try {
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones')) || [];
        const evaluacion = evaluaciones.find(e => e.workCenterId === workCenterId);
        
        if (evaluacion && evaluacion.scoreFinal) {
            const score = parseFloat(evaluacion.scoreFinal);
            let color = '#d1d5db';
            let categoria = evaluacion.categoriaRiesgo || 'Evaluado';
            
            if (score <= 25) color = '#28a745';
            else if (score <= 60) color = '#fd7e14';
            else color = '#dc3545';
            
            return {
                score_actual: score,
                categoria_riesgo: categoria,
                color_riesgo: color
            };
        }
        
        return {
            score_actual: 0,
            categoria_riesgo: 'Sin evaluación',
            color_riesgo: '#d1d5db'
        };
    } catch (error) {
        console.error('Error obteniendo score:', error);
        return {
            score_actual: 0,
            categoria_riesgo: 'Sin evaluación',
            color_riesgo: '#d1d5db'
        };
    }
}

// Función para calcular promedio de área desde Supabase con fallback a localStorage
async function calcularPromedioAreaFromSupabase(area_id) {
    if (USE_SUPABASE) {
        try {
            const scores = await supabase.getScoresArea(area_id);
            const workCentersData = await supabase.getWorkCenters(area_id);
            
            if (scores && scores.length > 0) {
                const sumaScores = scores.reduce((sum, s) => sum + s.score_actual, 0);
                const promedio = (sumaScores / scores.length).toFixed(1);
                
                // Calcular color basado en el promedio
                let colorPromedio = '#d1d5db';
                if (promedio <= 25) colorPromedio = '#28a745';
                else if (promedio <= 60) colorPromedio = '#fd7e14';
                else colorPromedio = '#dc3545';
                
                return {
                    promedio_score: promedio,
                    color_promedio: colorPromedio,
                    centros_evaluados: scores.length,
                    total_centros: workCentersData ? workCentersData.length : 0
                };
            }
        } catch (error) {
            console.error('Error calculando promedio desde Supabase:', error);
        }
    }
    
    // Fallback a localStorage
    return calcularPromedioFromLocalStorage(area_id);
}

// Función fallback para calcular promedio desde localStorage
function calcularPromedioFromLocalStorage(area_id) {
    try {
        const areaCenters = workCenters.filter(wc => wc.area_id === area_id);
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones')) || [];
        
        let sumaScores = 0;
        let centrosConEvaluacion = 0;
        
        areaCenters.forEach(center => {
            const evaluacion = evaluaciones.find(e => 
                e.workCenterId === center.id || 
                e.work_center_id === center.id
            );
            
            if (evaluacion && (evaluacion.scoreFinal || evaluacion.score_final)) {
                const score = parseFloat(evaluacion.scoreFinal || evaluacion.score_final);
                sumaScores += score;
                centrosConEvaluacion++;
            }
        });
        
        const result = {
            promedio_score: centrosConEvaluacion > 0 ? (sumaScores / centrosConEvaluacion).toFixed(1) : 0,
            color_promedio: '#d1d5db',
            centros_evaluados: centrosConEvaluacion,
            total_centros: areaCenters.length
        };
        
        if (result.promedio_score > 0) {
            if (result.promedio_score <= 25) result.color_promedio = '#28a745';
            else if (result.promedio_score <= 60) result.color_promedio = '#fd7e14';
            else result.color_promedio = '#dc3545';
        }
        
        return result;
        
    } catch (error) {
        console.error(`Error calculando promedio área ${area_id}:`, error);
        return {
            promedio_score: 0,
            color_promedio: '#d1d5db',
            centros_evaluados: 0,
            total_centros: 0
        };
    }
}