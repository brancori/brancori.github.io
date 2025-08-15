
// Configuración para usar Supabase o localStorage
const USE_SUPABASE = window.ERGOConfig.USE_SUPABASE;

// Funciones híbridas que usan Supabase o localStorage
async function loadAreas() {
    if (USE_SUPABASE) {
        try {
            areas = await dataClient.getAreas();
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
    if (!ERGOAuth.checkPermissionAndShowError('create')) return;
    if (USE_SUPABASE) {
        try {
            await dataClient.createArea(area);
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
            const data = await dataClient.getWorkCenters(area_id);
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
// ===== SISTEMA DE VISTAS Y FILTROS =====
let currentAreasView = 'grid'; // 'grid' o 'list'
let currentCentersView = 'grid'; // 'grid' o 'list'
let areasFiltersVisible = false;
let centersFiltersVisible = false;

// Funciones de vista para áreas
function toggleAreasView() {
    currentAreasView = currentAreasView === 'grid' ? 'list' : 'grid';
    const icon = document.getElementById('view-toggle-icon');
    const text = document.getElementById('view-toggle-text');
    
    if (currentAreasView === 'list') {
        icon.textContent = '⊞';
        text.textContent = 'Tarjetas';
    } else {
        icon.textContent = '📋';
        text.textContent = 'Lista';
    }
    
    renderAreas();
}

function toggleCentersView() {
    currentCentersView = currentCentersView === 'grid' ? 'list' : 'grid';
    const icon = document.getElementById('centers-view-toggle-icon');
    const text = document.getElementById('centers-view-toggle-text');
    
    if (currentCentersView === 'list') {
        icon.textContent = '⊞';
        text.textContent = 'Tarjetas';
    } else {
        icon.textContent = '📋';
        text.textContent = 'Lista';
    }
    
    renderWorkCenters();
}

// Funciones de filtros para áreas
function toggleAreasFilters() {
    areasFiltersVisible = !areasFiltersVisible;
    const filtersContainer = document.getElementById('areas-filters');
    if (filtersContainer) {
        filtersContainer.style.display = areasFiltersVisible ? 'flex' : 'none';
    }
}

function toggleCentersFilters() {
    centersFiltersVisible = !centersFiltersVisible;
    const filtersContainer = document.getElementById('centers-filters');
    if (filtersContainer) {
        filtersContainer.style.display = centersFiltersVisible ? 'flex' : 'none';
    }
}

function clearAreasFilters() {
    const nameFilter = document.getElementById('filter-area-name');
    const scoreFilter = document.getElementById('filter-area-score');
    const statusFilter = document.getElementById('filter-area-status');
    
    if (nameFilter) nameFilter.value = '';
    if (scoreFilter) scoreFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    
    renderAreas();
}

function clearCentersFilters() {
    const nameFilter = document.getElementById('filter-center-name');
    const scoreFilter = document.getElementById('filter-center-score');
    const responsibleFilter = document.getElementById('filter-center-responsible');
    
    if (nameFilter) nameFilter.value = '';
    if (scoreFilter) scoreFilter.value = '';
    if (responsibleFilter) responsibleFilter.value = '';
    
    renderWorkCenters();
}

// Función para filtrar áreas
function filterAreas(areasToFilter, summaries) {
    const nameFilter = document.getElementById('filter-area-name')?.value.toLowerCase() || '';
    const scoreFilter = document.getElementById('filter-area-score')?.value || '';
    const statusFilter = document.getElementById('filter-area-status')?.value || '';
    
    return areasToFilter.filter((area, index) => {
        const summary = summaries[index];
        
        // Filtro por nombre
        if (nameFilter && !area.name.toLowerCase().includes(nameFilter)) {
            return false;
        }
        
        // Filtro por score
        if (scoreFilter) {
            const score = parseFloat(summary.promedio_score || 0);
            switch (scoreFilter) {
                case 'low':
                    if (score > 25) return false;
                    break;
                case 'moderate':
                    if (score <= 25 || score > 60) return false;
                    break;
                case 'high':
                    if (score <= 60 || score > 75) return false;
                    break;
                case 'critical':
                    if (score <= 75) return false;
                    break;
            }
        }
        
        // Filtro por estado
        if (statusFilter) {
            const hasEvaluations = summary.centros_evaluados > 0;
            if (statusFilter === 'evaluated' && !hasEvaluations) return false;
            if (statusFilter === 'pending' && hasEvaluations) return false;
        }
        
        return true;
    });
}

// Función para filtrar centros
function filterWorkCenters(centersToFilter, scoreInfos) {
    const nameFilter = document.getElementById('filter-center-name')?.value.toLowerCase() || '';
    const scoreFilter = document.getElementById('filter-center-score')?.value || '';
    const responsibleFilter = document.getElementById('filter-center-responsible')?.value.toLowerCase() || '';
    
    return centersToFilter.filter((center, index) => {
        const scoreInfo = scoreInfos[index];
        
        // Filtro por nombre
        if (nameFilter && !center.name.toLowerCase().includes(nameFilter)) {
            return false;
        }
        
        // Filtro por responsable
        if (responsibleFilter && !center.responsible.toLowerCase().includes(responsibleFilter)) {
            return false;
        }
        
        // Filtro por score
        if (scoreFilter) {
            const score = parseFloat(scoreInfo.score_actual || 0);
            switch (scoreFilter) {
                case 'low':
                    if (score > 25) return false;
                    break;
                case 'moderate':
                    if (score <= 25 || score > 60) return false;
                    break;
                case 'high':
                    if (score <= 60 || score > 75) return false;
                    break;
                case 'critical':
                    if (score <= 75) return false;
                    break;
            }
        }
        
        return true;
    });
}

// Obtener parámetros de URL para identificar el centro
const urlParams = new URLSearchParams(window.location.search);
const workCenterId = urlParams.get('workCenter');
const area_id = urlParams.get('area');
const areaName = urlParams.get('areaName');
const centerName = urlParams.get('centerName');
const responsibleName = urlParams.get('responsible');

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
        ERGOUtils.showToast('Por favor, completa todos los campos', 'error');
        return;
    }
    
    // Verificar si es edición (si el modal tiene un ID oculto)
    const editingId = document.getElementById('area-id-hidden')?.value;
    
    if (editingId) {
        // ES EDICIÓN - UPDATE
        if (areas.some(area => area.id !== editingId && area.name.toLowerCase() === name.toLowerCase())) {
            ERGOUtils.showToast('Ya existe un área con ese nombre', 'error');
            return;
        }

        try {
            const updatedArea = {
                name: name,
                responsible: responsible,
                updated_at: new Date().toISOString()
            };

            if (USE_SUPABASE) {
                await dataClient.updateArea(editingId, updatedArea);
            }
            
            // Actualizar array local
            const areaIndex = areas.findIndex(a => a.id === editingId);
            if (areaIndex !== -1) {
                areas[areaIndex] = { ...areas[areaIndex], ...updatedArea };
            }
            
            localStorage.setItem('areas', JSON.stringify(areas));
            
            closeAreaModal();
            await renderAreas();
            ERGOUtils.showToast(`Área "${name}" actualizada exitosamente`);
        } catch (error) {
            console.error('Error updating area:', error);
            ERGOUtils.showToast('Error al actualizar el área', 'error');
        }
    } else {
        // ES CREACIÓN - CREATE (código existente)
        if (areas.some(area => area.name.toLowerCase() === name.toLowerCase())) {
            ERGOUtils.showToast('Ya existe un área con ese nombre', 'error');
            return;
        }

        const newArea = {
            id: ERGOUtils.generateShortId(),
            name: name,
            responsible: responsible,
            created_at: new Date().toISOString()
        };

        try {
            if (USE_SUPABASE) {
                await dataClient.createArea(newArea);
                areas.push(newArea);
            } else {
                areas.push(newArea);
                localStorage.setItem('areas', JSON.stringify(areas));
            }
            
            closeAreaModal();
            await renderAreas();
            ERGOUtils.showToast(`Área "${name}" creada exitosamente`);
        } catch (error) {
            console.error('Error saving area:', error);
            ERGOUtils.showToast('Error al crear el área', 'error');
        }
    }
}

async function deleteArea(area_id, event) {
    event.stopPropagation();
    if (!ERGOAuth.checkPermissionAndShowError('delete')) return;
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
                    await dataClient.deleteWorkCenter(center.id);
                }
                // Luego eliminar el área
                await dataClient.deleteArea(area_id);
            }
            
            // Actualizar arrays locales
            areas = areas.filter(a => a.id !== area_id);
            workCenters = workCenters.filter(wc => wc.area_id !== area_id);
            
            // Actualizar localStorage como fallback
            localStorage.setItem('areas', JSON.stringify(areas));
            localStorage.setItem('workCenters', JSON.stringify(workCenters));
            
            await renderAreas();
            ERGOUtils.showToast(`Área "${area.name}" eliminada`);
        } catch (error) {
            console.error('Error deleting area:', error);
            ERGOUtils.showToast('Error al eliminar el área', 'error');
        }
    }
}

async function renderAreas() {
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

    // Crear array de promesas para obtener los summaries
    const summariesData = await dataClient.getAllAreasSummary();
    const summariesMap = new Map(summariesData.map(s => [s.area_id, s]));
    const summaries = areas.map(area => summariesMap.get(area.id) || {
        promedio_score: 0,
        color_promedio: '#d1d5db',
        centros_evaluados: 0,
        total_centros: 0
    });
    // Aplicar filtros
    const filteredAreas = filterAreas(areas, summaries);
    const filteredSummaries = summaries.filter((_, index) => filteredAreas.includes(areas[index]));

    // Configurar contenedor según vista
    container.className = currentAreasView === 'list' ? 'content-list' : 'content-grid';

    if (filteredAreas.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No se encontraron áreas</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }

    if (currentAreasView === 'list') {
        // Vista de lista
        container.innerHTML = filteredAreas.map((area, index) => {
            const summary = filteredSummaries[index];
            const centerCount = summary.total_centros;
            const promedioScore = parseFloat(summary.promedio_score || 0).toFixed(2);
            const colorPromedio = summary.color_promedio;
            const centrosEvaluados = summary.centros_evaluados;
            const showDeleteButton = ERGOAuth.hasPermission('delete');
            
            return `
                <div class="card-list" onclick="showAreaDetail('${area.id}')">
                    <div class="card-list-content">
                        <div class="card-list-id">${area.id}</div>
                        <div class="card-list-name">${area.name}</div>
                        <div class="card-list-responsible">${area.responsible}</div>
                        <div class="card-list-score">
                            <span class="score-indicator" style="background-color: ${colorPromedio}"></span>
                            ${promedioScore}% (${centrosEvaluados}/${centerCount})
                        </div>
                        <div class="card-list-stats">${centerCount} ${centerCount === 1 ? 'centro' : 'centros'}</div>
                        <div class="card-list-actions">
                            ${showDeleteButton ? `
                                <button class="btn btn-danger btn-sm" onclick="deleteArea('${area.id}', event)">
                                    Eliminar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // Vista de tarjetas (código original)
        container.innerHTML = filteredAreas.map((area, index) => {
            const summary = filteredSummaries[index];
            const centerCount = summary.total_centros;
            const promedioScore = parseFloat(summary.promedio_score || 0).toFixed(2);
            const colorPromedio = summary.color_promedio;
            const centrosEvaluados = summary.centros_evaluados;
            const showDeleteButton = ERGOAuth.hasPermission('delete');
            
            return `
                <div class="card" onclick="showAreaDetail('${area.id}')">
                    <div class="card-header">
                        <div class="card-id">${area.id}</div>
                    </div>
                    <h3>${area.name}</h3>
                    <div class="card-responsible">Responsable: ${area.responsible}</div>
                    
                    <div class="summary-badge" style="border-left-color: ${colorPromedio};">
                        📊 Promedio: ${promedioScore}%
                        <div style="font-size: 0.65rem; opacity: 0.8; margin-top: 2px;">
                            ${centrosEvaluados}/${centerCount} evaluados
                        </div>
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
        ERGOUtils.showToast('Área no encontrada', 'error');
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
        ERGOUtils.showToast('Error: No hay área seleccionada', 'error');
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
    if (!ERGOAuth.checkPermissionAndShowError('create')) return;
    const name = document.getElementById('work-center-name').value.trim();
    const responsible = document.getElementById('work-center-responsible').value.trim();
    
    if (!name || !responsible) {
        ERGOUtils.showToast('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (!current_area_id) {
        ERGOUtils.showToast('Error: No hay área seleccionada', 'error');
        return;
    }
    
    // Verificar si es edición
    const editingId = document.getElementById('work-center-id-hidden')?.value;
    
    if (editingId) {
        // ES EDICIÓN - UPDATE
        const areaCenters = workCenters.filter(wc => wc.area_id === current_area_id);
        if (areaCenters.some(center => center.id !== editingId && center.name.toLowerCase() === name.toLowerCase())) {
            ERGOUtils.showToast('Ya existe un centro con ese nombre en esta área', 'error');
            return;
        }

        try {
            const updatedCenter = {
                name: name,
                responsible: responsible,
                updated_at: new Date().toISOString()
            };

            if (USE_SUPABASE) {
                await dataClient.updateWorkCenter(editingId, updatedCenter);
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
            ERGOUtils.showToast(`Centro "${name}" actualizado exitosamente`);
        } catch (error) {
            console.error('Error updating work center:', error);
            ERGOUtils.showToast('Error al actualizar el centro de trabajo', 'error');
        }
    } else {
        // ES CREACIÓN - CREATE (código existente)
        const areaCenters = workCenters.filter(wc => wc.area_id === current_area_id);
        if (areaCenters.some(center => center.name.toLowerCase() === name.toLowerCase())) {
            ERGOUtils.showToast('Ya existe un centro con ese nombre en esta área', 'error');
            return;
        }

        const newWorkCenter = {
            id: ERGOUtils.generateShortId(),
            name: name,
            responsible: responsible,
            area_id: current_area_id,
            created_at: new Date().toISOString()
        };

        try {
            if (USE_SUPABASE) {
                await dataClient.createWorkCenter(newWorkCenter);
                workCenters.push(newWorkCenter);
            } else {
                workCenters.push(newWorkCenter);
                localStorage.setItem('workCenters', JSON.stringify(workCenters));
            }
            
            closeWorkCenterModal();
            await renderWorkCenters();
            await renderAreas();
            ERGOUtils.showToast(`Centro de trabajo "${name}" creado exitosamente`);
        } catch (error) {
            console.error('Error saving work center:', error);
            ERGOUtils.showToast('Error al crear el centro de trabajo', 'error');
        }
    }
}

async function deleteWorkCenter(centerId, event) {
    event.stopPropagation();
    if (!ERGOAuth.checkPermissionAndShowError('delete')) return;
    
    const center = workCenters.find(wc => wc.id === centerId);
    if (!center) return;
    
    if (confirm(`¿Estás seguro de eliminar el centro "${center.name}"?`)) {
        try {
            if (USE_SUPABASE) {
                await dataClient.deleteWorkCenter(centerId);
            }
            
            // Actualizar array local
            workCenters = workCenters.filter(wc => wc.id !== centerId);
            
            // Actualizar localStorage como fallback
            localStorage.setItem('workCenters', JSON.stringify(workCenters));
            
            await renderWorkCenters();
            await renderAreas(); // Actualizar contador en vista principal
            ERGOUtils.showToast(`Centro "${center.name}" eliminado`);
        } catch (error) {
            console.error('Error deleting work center:', error);
            ERGOUtils.showToast('Error al eliminar el centro de trabajo', 'error');
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

    // Aplicar filtros
    const filteredCenters = filterWorkCenters(areaCenters, scoreInfos);
    const filteredScoreInfos = scoreInfos.filter((_, index) => filteredCenters.includes(areaCenters[index]));

    // Configurar contenedor según vista
    container.className = currentCentersView === 'list' ? 'content-list' : 'content-grid';

    if (filteredCenters.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No se encontraron centros</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }

    if (currentCentersView === 'list') {
        // Vista de lista
        container.innerHTML = filteredCenters.map((center, index) => {
            const scoreInfo = filteredScoreInfos[index];
            
            return `
                <div class="card-list" onclick="window.location.href='./centro-trabajo/centro-trabajo.html?workCenter=${center.id}&area=${current_area_id}&areaName=${encodeURIComponent(areas.find(a => a.id === current_area_id)?.name || '')}&centerName=${encodeURIComponent(center.name)}&responsible=${encodeURIComponent(center.responsible)}'">
                    <div class="card-list-content">
                        <div class="card-list-id">${center.id}</div>
                        <div class="card-list-name">${center.name}</div>
                        <div class="card-list-responsible">${center.responsible}</div>
                        <div class="card-list-score">
                            <span class="score-indicator" style="background-color: ${scoreInfo.color_riesgo}"></span>
                            ${scoreInfo.score_actual}% - ${scoreInfo.categoria_riesgo}
                        </div>
                        <div class="card-list-stats">${ERGOUtils.formatDate(center.created_at)}</div>
                        <div class="card-list-actions">
                            <button class="btn btn-danger btn-sm" onclick="deleteWorkCenter('${center.id}', event)">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // Vista de tarjetas (código original)
        container.innerHTML = filteredCenters.map((center, index) => {
            const scoreInfo = filteredScoreInfos[index];
            
            return `
                <div class="card" data-work-center-id="${center.id}" onclick="window.location.href='./centro-trabajo/centro-trabajo.html?workCenter=${center.id}&area=${current_area_id}&areaName=${encodeURIComponent(areas.find(a => a.id === current_area_id)?.name || '')}&centerName=${encodeURIComponent(center.name)}&responsible=${encodeURIComponent(center.responsible)}'">        
                    <div class="card-header">
                        <div class="card-id">${center.id}</div>
                    </div>
                    <h3>${center.name}</h3>
                    <div class="card-responsible">Responsable: ${center.responsible}</div>
                    
                    <div class="summary-badge" style="border-left-color: ${scoreInfo.color_riesgo};">
                        📊 Riesgo: ${scoreInfo.score_actual}% - ${scoreInfo.categoria_riesgo}
                    </div>
                    
                    <div class="card-footer">
                        <div class="card-stats">
                            Creado ${ERGOUtils.formatDate(center.created_at)}
                        </div>
                        <button class="btn btn-danger" onclick="deleteWorkCenter('${center.id}', event)">
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
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
                ERGOUtils.showToast('Datos importados exitosamente');
            } else {
                throw new Error('Formato de archivo inválido');
            }
        } catch (error) {
            ERGOUtils.showToast('Error al importar el archivo', 'error');
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
        ERGOUtils.showToast('Todos los datos han sido eliminados');
    }
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
            border-left: 3px solid ${ERGOUtils.getScoreColor(parseFloat(score))};
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
            const score = await dataClient.getScoreWorkCenter(workCenterId);
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
            const scores = await dataClient.getScoresArea(area_id);
            const workCentersData = await dataClient.getWorkCenters(area_id);
            
        if (scores && scores.length > 0) {
            const sumaScores = scores.reduce((sum, s) => sum + s.score_actual, 0);
            const promedioCompleto = sumaScores / scores.length;  // ← AGREGAR ESTA LÍNEA
            const promedio = promedioCompleto.toFixed(2);
            
            // Calcular color basado en el promedio
            let colorPromedio = '#d1d5db';
            if (promedioCompleto <= 25) colorPromedio = '#28a745';  // ← Usar promedioCompleto aquí también
            else if (promedioCompleto <= 60) colorPromedio = '#fd7e14';
            else colorPromedio = '#dc3545';
            
            return {
                promedio_score: promedio,                    // Para mostrar (2 decimales)
                promedio_calculo: promedioCompleto,          // ← AHORA SÍ ESTÁ DEFINIDO
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
        
        const promedioCompleto = centrosConEvaluacion > 0 ? (sumaScores / centrosConEvaluacion) : 0;
        const result = {
            promedio_score: promedioCompleto.toFixed(2),  // Para mostrar
            promedio_calculo: promedioCompleto,           // Para cálculos
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

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    if (!ERGOAuth.initializeAuthContext()) {
        ERGOAuth.redirectToLogin();
        return;
    }
    
    // Carga los datos iniciales
    try {
        await loadAreas();
        await loadWorkCenters();
    } catch (error) {
        console.error('Error loading data:', error);
    }
    
    // Define la función que configura los listeners de los filtros
    const setupFilters = () => {
        // Listeners para los filtros de ÁREAS
        const areaNameFilter = document.getElementById('filter-area-name');
        const areaScoreFilter = document.getElementById('filter-area-score');
        const areaStatusFilter = document.getElementById('filter-area-status');
        
        // El listener 'input' se activa cada vez que escribes algo.
        // ERGOUtils.debounce evita que se ejecute en cada letra, esperando 300ms,
        // lo que es perfecto para un buscador en tiempo real.
        if (areaNameFilter) areaNameFilter.addEventListener('input', ERGOUtils.debounce(renderAreas, 300));
        if (areaScoreFilter) areaScoreFilter.addEventListener('change', renderAreas);
        if (areaStatusFilter) areaStatusFilter.addEventListener('change', renderAreas);
        
        // Listeners para los filtros de CENTROS DE TRABAJO
        const centerNameFilter = document.getElementById('filter-center-name');
        const centerScoreFilter = document.getElementById('filter-center-score');
        const centerResponsibleFilter = document.getElementById('filter-center-responsible');
        
        if (centerNameFilter) centerNameFilter.addEventListener('input', ERGOUtils.debounce(renderWorkCenters, 300));
        if (centerScoreFilter) centerScoreFilter.addEventListener('change', renderWorkCenters);
        if (centerResponsibleFilter) centerResponsibleFilter.addEventListener('input', ERGOUtils.debounce(renderWorkCenters, 300));
    };

    // Llama a la función para activar los filtros inmediatamente
    setupFilters();

    // El resto de tu lógica para mostrar la página correcta
    const urlParams = new URLSearchParams(window.location.search);
    const areaIdFromUrl = urlParams.get('area');

    if (areaIdFromUrl) {
        await showAreaDetail(areaIdFromUrl);
    } else {
        await renderAreas();
    }

    ERGOAuth.applyPermissionControls();
});