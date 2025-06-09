// Configuración para usar Supabase o localStorage
const USE_SUPABASE = true; // Cambiar a false para usar localStorage

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

async function loadWorkCenters(areaId = null) {
    if (USE_SUPABASE) {
        try {
            workCenters = await supabase.getWorkCenters(areaId);
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
let currentAreaId = null;

// Obtener parámetros de URL para identificar el centro
const urlParams = new URLSearchParams(window.location.search);
const workCenterId = urlParams.get('workCenter');
const areaId = urlParams.get('area');

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
    if (!currentAreaId) return;
    
    const areaCenters = workCenters.filter(wc => wc.areaId === currentAreaId);
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
        renderAreas();
        showToast(`Área "${name}" creada exitosamente`);
    } catch (error) {
        console.error('Error saving area:', error);
        showToast('Error al crear el área', 'error');
    }
}

function deleteArea(areaId, event) {
    event.stopPropagation(); // Evitar que se abra el área
    
    const area = areas.find(a => a.id === areaId);
    if (!area) return;
    
    const areaCenters = workCenters.filter(wc => wc.areaId === areaId);
    const centerCount = areaCenters.length;
    
    let confirmMessage = `¿Estás seguro de eliminar el área "${area.name}"?`;
    if (centerCount > 0) {
        confirmMessage += `\n\nEsto también eliminará ${centerCount} ${centerCount === 1 ? 'centro de trabajo asociado' : 'centros de trabajo asociados'}.`;
    }
    
    if (confirm(confirmMessage)) {
        areas = areas.filter(a => a.id !== areaId);
        workCenters = workCenters.filter(wc => wc.areaId !== areaId);
        
        localStorage.setItem('areas', JSON.stringify(areas));
        localStorage.setItem('workCenters', JSON.stringify(workCenters));
        
        renderAreas();
        showToast(`Área "${area.name}" eliminada`);
    }
}

function renderAreas() {
    const container = document.getElementById('areas-container');
    updateAreasCount();
    
    if (areas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No hay áreas registradas</h3>
                <p>Comienza creando tu primera área de trabajo</p>
            </div>
        `;
        return;
    }

    container.innerHTML = areas.map(area => {
        const areaCenters = workCenters.filter(wc => wc.areaId === area.id);
        const centerCount = areaCenters.length;
        
        return `
            <div class="card" onclick="showAreaDetail('${area.id}')">
                <div class="card-header">
                    <div class="card-id">${area.id}</div>
                </div>
                <h3>${area.name}</h3>
                <div class="card-responsible">Responsable: ${area.responsible}</div>
                <div class="card-footer">
                    <div class="card-stats">
                        ${centerCount} ${centerCount === 1 ? 'centro' : 'centros'} de trabajo
                    </div>
                    <button class="btn btn-danger" onclick="deleteArea('${area.id}', event)">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Navegación
function showAreasPage() {
    document.getElementById('areas-page').classList.add('active');
    document.getElementById('area-detail-page').classList.remove('active');
    currentAreaId = null;
    renderAreas();
}

function showAreaDetail(areaId) {
    const area = areas.find(a => a.id === areaId);
    if (!area) {
        showToast('Área no encontrada', 'error');
        return;
    }

    currentAreaId = areaId;
    
    // Actualizar contenido de la página
    document.getElementById('area-detail-title').textContent = area.name;
    document.getElementById('area-detail-subtitle').textContent = `Responsable: ${area.responsible}`;
    document.getElementById('breadcrumb-area').textContent = area.name;
    
    // Cambiar páginas
    document.getElementById('areas-page').classList.remove('active');
    document.getElementById('area-detail-page').classList.add('active');
    
    loadWorkCenters(areaId).then(() => {
    renderWorkCenters();
});
}

// Gestión de centros de trabajo
function openWorkCenterModal() {
    if (!currentAreaId) {
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
    const name = document.getElementById('work-center-name').value.trim();
    const responsible = document.getElementById('work-center-responsible').value.trim();
    
    if (!name || !responsible) {
        showToast('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (!currentAreaId) {
        showToast('Error: No hay área seleccionada', 'error');
        return;
    }
    
    const areaCenters = workCenters.filter(wc => wc.areaId === currentAreaId);
    if (areaCenters.some(center => center.name.toLowerCase() === name.toLowerCase())) {
        showToast('Ya existe un centro con ese nombre en esta área', 'error');
        return;
    }

    const newWorkCenter = {
        id: generateShortId(),
        name: name,
        responsible: responsible,
        area_id: currentAreaId,
        created_at: new Date().toISOString()
    };

    try {
        if (USE_SUPABASE) {
            await supabase.createWorkCenter(newWorkCenter);
            workCenters.push({...newWorkCenter, areaId: currentAreaId});
        } else {
            workCenters.push({...newWorkCenter, areaId: currentAreaId});
            localStorage.setItem('workCenters', JSON.stringify(workCenters));
        }
        
        closeWorkCenterModal();
        renderWorkCenters();
        renderAreas();
        showToast(`Centro de trabajo "${name}" creado exitosamente`);
    } catch (error) {
        console.error('Error saving work center:', error);
        showToast('Error al crear el centro de trabajo', 'error');
    }
}

function deleteWorkCenter(centerId, event) {
    event.stopPropagation(); // Evitar propagación si hay eventos padre
    
    const center = workCenters.find(wc => wc.id === centerId);
    if (!center) return;
    
    if (confirm(`¿Estás seguro de eliminar el centro "${center.name}"?`)) {
        workCenters = workCenters.filter(wc => wc.id !== centerId);
        localStorage.setItem('workCenters', JSON.stringify(workCenters));
        
        renderWorkCenters();
        renderAreas(); // Actualizar contador en vista principal
        showToast(`Centro "${center.name}" eliminado`);
    }
}

function renderWorkCenters() {
    const container = document.getElementById('work-centers-container');
    updateCentersCount();
    
    if (!currentAreaId) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error</h3>
                <p>No se ha seleccionado ningún área</p>
            </div>
        `;
        return;
    }
    
    const areaCenters = workCenters.filter(wc => wc.areaId === currentAreaId);
    
    if (areaCenters.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No hay centros de trabajo</h3>
                <p>Agrega el primer centro de trabajo para esta área</p>
            </div>
        `;
        return;
    }

    container.innerHTML = areaCenters.map(center => `
    <div class="card" data-work-center-id="${center.id}" onclick="window.open('evaluacion_integrada_html (1).html?workCenter=${center.id}&area=${currentAreaId}', '_blank')">
        <div class="card-header">
            <div class="card-id">${center.id}</div>
        </div>
        <h3>${center.name}</h3>
        <div class="card-responsible">Responsable: ${center.responsible}</div>
            <div class="card-footer">
                <div class="card-stats">
                    Creado ${formatDate(center.created_at || center.createdAt)}
                </div>
                <button class="btn btn-danger" onclick="deleteWorkCenter('${center.id}', event)">
                    Eliminar
                </button>
            </div>
        </div>
        `).join('');
    
    // Cargar scores después de renderizar
    setTimeout(() => {
        cargarScoresExistentes();
    }, 50);
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

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--red-500)';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    return isValid;
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
    
    // Inicializar la aplicación
    renderAreas();

    // Cargar scores existentes
    setTimeout(() => {
        cargarScoresExistentes();
    }, 100);
    
    // ... resto del código igual
});

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
        currentAreaId = null;
        showAreasPage();
        showToast('Todos los datos han sido eliminados');
    }
}

// Estadísticas (para futuro dashboard)
function getStats() {
    const totalAreas = areas.length;
    const totalCenters = workCenters.length;
    const areasWithCenters = areas.filter(area => 
        workCenters.some(center => center.areaId === area.id)
    ).length;
    
    return {
        totalAreas,
        totalCenters,
        areasWithCenters,
        areasWithoutCenters: totalAreas - areasWithCenters,
        averageCentersPerArea: totalAreas > 0 ? (totalCenters / totalAreas).toFixed(1) : 0
    };
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