// Contenido de 'areas-logic.js' movido aquí para evitar el error de 'import'

/**
 * Valida los datos de un área
 */
function validateAreaData(name, responsible) {
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('El nombre del área es requerido');
  }

  if (!responsible || responsible.trim() === '') {
    errors.push('El responsable es requerido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Verifica si un área ya existe (sin importar mayúsculas)
 */
function areaExists(areas, newName, excludeId = null) {
  return areas.some(area => 
    area.name.toLowerCase() === newName.toLowerCase() && 
    area.id !== excludeId
  );
}

/**
 * Crea un objeto de área nuevo
 */
function createAreaObject(id, name, responsible) {
  return {
    id,
    name: name.trim(),
    responsible: responsible.trim(),
    created_at: new Date().toISOString()
  };
}

/**
 * Crea un objeto de actualización de área
 */
function createAreaUpdateObject(name, responsible) {
  return {
    name: name.trim(),
    responsible: responsible.trim(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Cuenta los centros de trabajo asociados a un área
 */
function countWorkCentersByArea(workCenters, areaId) {
  return workCenters.filter(wc => wc.area_id === areaId).length;
}

/**
 * Genera el mensaje de confirmación para eliminar un área
 */
function generateDeleteConfirmation(areaName, centerCount) {
  let message = `¿Estás seguro de eliminar el área "${areaName}"?`;

  if (centerCount > 0) {
    const centerWord = centerCount === 1 
      ? 'centro de trabajo asociado' 
      : 'centros de trabajo asociados';
    message += `\n\nEsto también eliminará ${centerCount} ${centerWord}.`;
  }

  return message;
}

/**
 * Filtra las áreas eliminando una específica
 */
function removeAreaFromList(areas, areaId) {
  return areas.filter(a => a.id !== areaId);
}

/**
 * Filtra los centros de trabajo eliminando los de un área
 */
function removeWorkCentersByArea(workCenters, areaId) {
  return workCenters.filter(wc => wc.area_id !== areaId);
}

/**
 * Actualiza un área en la lista
 */
function updateAreaInList(areas, areaId, updatedData) {
  const index = areas.findIndex(a => a.id === areaId);
  if (index === -1) return areas;

  const newAreas = [...areas];
  newAreas[index] = { ...newAreas[index], ...updatedData };
  return newAreas;
}

// --- Fin del código de areas-logic.js ---

// Configuración para usar Supabase o localStorage
const USE_SUPABASE = window.ERGOConfig.USE_SUPABASE;

/**
 * Renderiza una gráfica de barras de riesgo con animación de crecimiento.
 * @param {string} containerId - El ID del elemento contenedor para la gráfica.
 * @param {object} summary - El objeto con los datos de resumen.
 */


function renderRiskChart(containerId, summary) {
    console.log('🎯 [renderRiskChart] Iniciando con:', { containerId, summary });
    
    const chartContainer = document.getElementById(containerId);
    if (!chartContainer) {
        console.error(`❌ Container ${containerId} not found`);
        return;
    }

    if (!summary || Object.keys(summary).length === 0) {
        console.log('⚠️ No hay datos de summary');
        chartContainer.innerHTML = '<p class="no-data-chart">No hay datos para la gráfica.</p>';
        return;
    }

    if (typeof ERGOAnalytics === 'undefined' || !ERGOAnalytics.pictogramasConfig) {
        console.error("❌ ERGOAnalytics.pictogramasConfig no está definido.");
        chartContainer.innerHTML = '<p class="no-data-chart">Error de configuración.</p>';
        return;
    }

    // Procesar datos con logs
    const riskData = Object.entries(summary)
        .map(([id, data]) => {
            const item = {
                id,
                count: data.Critico || 0,
                nombre: ERGOAnalytics.pictogramasConfig[id]?.nombre || id
            };
            console.log(`📊 Procesando ${id}:`, item);
            return item;
        })
        .filter(item => {
            const include = item.count > 0;
            if (!include) console.log(`🚫 Filtrando ${item.id} (count: ${item.count})`);
            return include;
        })
        .sort((a, b) => b.count - a.count);

    console.log('📈 Datos finales para el gráfico:', riskData);

    if (riskData.length === 0) {
        console.log('✅ Sin datos de riesgo crítico');
        chartContainer.innerHTML = '<p class="no-data-chart_areas">✅<br>Sin riesgos de alta prioridad detectados.</p>';
        return;
    }
    
    const maxValue = Math.max(...riskData.map(d => d.count), 1);
    console.log(`📏 Valor máximo encontrado: ${maxValue}`);

    // Calcular alturas con logs
    const chartHTML = riskData.map((data, index) => {
        const percentage = (data.count / maxValue) * 100;
        const barHeight = Math.max(percentage, 5); // Mínimo 5% para visibilidad
        const animationDelay = index * 0.15; // 150ms entre barras
        
        console.log(`🏗️ Barra ${data.id}: count=${data.count}, percentage=${percentage.toFixed(2)}%, height=${barHeight.toFixed(2)}%, delay=${animationDelay}s`);
        
        return `
            <div class="bar-chart-item_areas" title="${data.nombre}: ${data.count} hallazgos de riesgo crítico">
                <div class="bar-value_areas">${data.count}</div>
                <div class="bar-wrapper_areas">
                    <div class="bar_areas" 
                         data-target-height="${barHeight}" 
                         data-count="${data.count}"
                         data-delay="${animationDelay}"
                         style="height: 0px; background: linear-gradient(to top, #dc3545, #e74c3c);">
                    </div>
                </div>
                <div class="bar-label_areas">${data.id}</div>
            </div>
        `;
    }).join('');

    // Crear contenedor con estructura correcta
    chartContainer.innerHTML = `<div class="risk-chart-container_areas">${chartHTML}</div>`;
    console.log('🎨 HTML generado e insertado');

    // Aplicar animaciones con logs detallados
    setTimeout(() => {
        console.log('🚀 Iniciando animaciones...');
        // AQUÍ ESTÁ EL CAMBIO: de '.bar' a '.bar_areas'
        const bars = chartContainer.querySelectorAll('.bar_areas'); 
        console.log(`🎯 Encontradas ${bars.length} barras`);
        
        bars.forEach((bar, index) => {
            const targetHeight = parseFloat(bar.dataset.targetHeight);
            const count = parseInt(bar.dataset.count);
            const delay = parseFloat(bar.dataset.delay) * 1000;
            
            console.log(`⏱️ Programando barra ${index}: height=${targetHeight}%, count=${count}, delay=${delay}ms`);
            
            setTimeout(() => {
                console.log(`🎬 Animando barra ${index} a ${targetHeight}%`);
                
                // Aplicar altura con transición
                bar.style.transition = 'height 0.8s ease-out';
                bar.style.height = `${targetHeight}%`;
                
                // Verificar después de un momento
                setTimeout(() => {
                    const computedStyle = window.getComputedStyle(bar);
                    const actualHeight = computedStyle.height;
                    console.log(`✅ Barra ${index} altura final: ${actualHeight} (esperada: ${targetHeight}%)`);
                }, 900);
                
            }, delay);
        });
    }, 100);
}

// Función auxiliar para verificar el estado del DOM
function debugChartState(containerId) {
    console.log('🔍 [debugChartState] Verificando estado del gráfico');
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Container ${containerId} no encontrado`);
        return;
    }
    
    const bars = container.querySelectorAll('.bar');
    console.log(`🎯 Encontradas ${bars.length} barras en ${containerId}`);
    
    bars.forEach((bar, index) => {
        const computedStyle = window.getComputedStyle(bar);
        const height = computedStyle.height;
        const targetHeight = bar.dataset.targetHeight;
        const count = bar.dataset.count;
        
        console.log(`📏 Barra ${index}: target=${targetHeight}%, actual=${height}, count=${count}`);
    });
}

// Función para inyectar CSS si no existe
function ensureChartCSS() {
    if (!document.getElementById('chart-debug-css')) {
        const style = document.createElement('style');
        style.id = 'chart-debug-css';
        style.textContent = requiredCSS;
        document.head.appendChild(style);
        console.log('🎨 CSS del gráfico inyectado');
    }
}


async function getAreaPictogramSummaryCorrected(areaId) {
    if (!areaId) return null;

    try {
        const supabaseClient = window.dataClient.supabase; 
        
        const { data, error } = await supabaseClient
            .from('evaluaciones')
            .select('riesgos_por_categoria')
            .eq('area_id', areaId)
            .not('riesgos_por_categoria', 'is', null);

        if (error) {
            console.error(`Error en la consulta final para el área ${areaId}:`, error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.log(`No se encontraron evaluaciones con 'riesgos_por_categoria' para el área ${areaId}.`);
            return {};
        }
        
        // Objeto para acumular los conteos de niveles de riesgo
        const summary = data.reduce((acc, evaluacion) => {
            const riesgos = evaluacion.riesgos_por_categoria;
            if (!riesgos || typeof riesgos !== 'object') return acc;

            for (const pictoId in riesgos) {
                const riesgoInfo = riesgos[pictoId];
                if (!riesgoInfo || !riesgoInfo.nivel) continue;

                // Inicializamos el pictograma en el acumulador si no existe
                if (!acc[pictoId]) {
                    acc[pictoId] = { "Critico": 0, "Alto": 0, "Medio": 0, "Bajo": 0 };
                }

                // Normalizamos el nombre del nivel de riesgo para que coincida con las claves
                // Ej: "Crítico" -> "Critico", "Bajo/Nulo" -> "Bajo"
                let nivelNormalizado = riesgoInfo.nivel.replace('í', 'i').split('/')[0];

                // Incrementamos el contador para el nivel correspondiente
                if (acc[pictoId].hasOwnProperty(nivelNormalizado)) {
                    acc[pictoId][nivelNormalizado]++;
                }
            }
            return acc;
        }, {});

        console.log(`✅ Resumen de riesgos construido exitosamente para el área ${areaId}:`, summary);
        return summary;

    } catch (e) {
        console.error("Fallo crítico en getAreaPictogramSummaryCorrected:", e);
        throw e;
    }
}
async function loadPictogramSummary(area_id = null) {
    const CACHE_KEY = area_id ? `pictogramSummary_${area_id}` : 'pictogramSummary_global';
    
    // 1. Intentar cargar desde caché
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            if (parsed && parsed.data && Object.keys(parsed.data).length > 0) {
                 console.log(`✅ Resumen de pictogramas cargado desde caché: ${CACHE_KEY}`);
                 return parsed.data;
            }
        } catch (error) {
            localStorage.removeItem(CACHE_KEY);
        }
    }

    let summaryData = {};
    // 2. Intentar Supabase si está habilitado
    if (USE_SUPABASE) {
        console.log(`⏳ Intentando cargar desde Supabase: ${CACHE_KEY}`);
        try {
            if (area_id) {
                // --- ¡Usa nuestra función corregida final! ---
                summaryData = await getAreaPictogramSummaryCorrected(area_id);
            } else {
                summaryData = await dataClient.getGlobalPictogramSummary();
            }
        } catch (error) {
            console.error(`⚠️ Error al cargar desde Supabase: ${error.message}. Se usará fallback.`);
        }
    }

    // 3. Fallback (si Supabase falla o está deshabilitado)
    if (!summaryData || Object.keys(summaryData).length === 0) {
        console.log(`📊 Construyendo resumen desde fallback local: ${CACHE_KEY}`);
        summaryData = buildPictogramSummaryFromLocal(area_id);
    }
    
    // Guardar en caché el resultado
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: new Date().getTime(),
        data: summaryData
    }));
    
    return summaryData;
}

function buildPictogramSummaryFromLocal(area_id = null) {

    try {
        const evaluaciones = JSON.parse(localStorage.getItem('evaluaciones')) || [];
        let filteredEvaluaciones = evaluaciones;

        if (area_id) {
            // Filtrar evaluaciones por área específica
            const areaCenters = workCenters.filter(wc => wc.area_id === area_id);
            const centerIds = areaCenters.map(center => center.id);
            filteredEvaluaciones = evaluaciones.filter(evaluacion => 
                centerIds.includes(evaluacion.workCenterId || evaluacion.work_center_id)
            );
                console.log('🔍 Evaluaciones encontradas:', evaluaciones.length);
console.log('🔍 Centros del área:', areaCenters.length);
console.log('🔍 Evaluaciones filtradas:', filteredEvaluaciones.length);
        }

        console.log(`📈 Procesando ${filteredEvaluaciones.length} evaluaciones para ${area_id || 'global'}`);

        // Construir resumen de pictogramas
        const summary = {};
        
        filteredEvaluaciones.forEach(evaluacion => {
            // Verificar diferentes estructuras de pictogramas evaluados
            const pictogramas = evaluacion.pictogramasEvaluados || 
                               evaluacion.pictograms_evaluated || 
                               evaluacion.pictogramas || 
                               [];
            
            if (Array.isArray(pictogramas)) {
                pictogramas.forEach(pictograma => {
                    const id = pictograma.id || pictograma.pictogram_id;
                    if (!id) return;

                    if (!summary[id]) {
                        summary[id] = { severidad: 0 };
                    }
                    
                    // Determinar severidad basada en diferentes campos
                    let severidad = 0;
                    
                    // Opción 1: Campo directo de severidad
                    if (pictograma.severidad) {
                        severidad = pictograma.severidad;
                    }
                    // Opción 2: Nivel de riesgo textual
                    else if (pictograma.nivelRiesgo || pictograma.nivel_riesgo || pictograma.risk_level) {
                        const riesgo = (pictograma.nivelRiesgo || pictograma.nivel_riesgo || pictograma.risk_level).toLowerCase();
                        if (riesgo.includes('crítico') || riesgo.includes('critico') || riesgo.includes('alto')) {
                            severidad = 3;
                        } else if (riesgo.includes('moderado') || riesgo.includes('medio')) {
                            severidad = 2;
                        } else if (riesgo.includes('bajo')) {
                            severidad = 1;
                        }
                    }
                    // Opción 3: Score numérico
                    else if (pictograma.score || pictograma.puntuacion) {
                        const score = pictograma.score || pictograma.puntuacion;
                        if (score >= 75) severidad = 3;
                        else if (score >= 50) severidad = 2;
                        else if (score > 0) severidad = 1;
                    }
                    
                    // Mantener la severidad máxima
                    summary[id].severidad = Math.max(summary[id].severidad, severidad);
                });
            }
        });

        console.log(`✅ Resumen construido con ${Object.keys(summary).length} pictogramas`);
        return summary;
        
    } catch (error) {
        console.error('Error building pictogram summary from local data:', error);
        return {};
    }

    
}

function invalidatePictogramCache(area_id = null) {
    if (area_id) {
        localStorage.removeItem(`pictogramSummary_${area_id}`);
        console.log(`🗑️ Cache invalidado para área: ${area_id}`);
    } else {
        // Invalidar todos los cachés de pictogramas
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('pictogramSummary_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('🗑️ Todos los cachés de pictogramas invalidados');
    }
}

// Funciones híbridas que usan Supabase o localStorage
async function loadAreas() {
    const CACHE_KEY = 'areasCache';
    const CACHE_EXPIRY_HOURS = 6;
    const now = new Date().getTime();

    // 1. Intentar cargar desde el caché
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (now - timestamp < CACHE_EXPIRY_HOURS * 60 * 60 * 1000) {
            console.log('✅ Áreas cargadas desde el caché.');
            areas = data;
            return areas;
        }
    }

    // 2. Si no hay caché o ha expirado, cargar de Supabase
    console.log('⏳ Cargando áreas desde Supabase...');
    if (USE_SUPABASE) {
        try {
            areas = await dataClient.getAreas();
            // Guardar en el caché
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: now,
                data: areas
            }));
            console.log('✅ Áreas guardadas en caché.');
        } catch (error) {
            console.error('Error loading areas from Supabase:', error);
            // Fallback a localStorage si la llamada falla
            areas = JSON.parse(localStorage.getItem('areas')) || [];
        }
    } else {
        areas = JSON.parse(localStorage.getItem('areas')) || [];
    }
    return areas;
}

async function saveArea() {
    const name = document.getElementById('area-name').value.trim();
    const responsible = document.getElementById('area-responsible').value.trim();

    
    
    if (!name || !responsible) {
        ERGOUtils.showToast('Por favor, completa todos los campos', 'error');
        return;
    }
    
    const editingId = document.getElementById('area-id-hidden')?.value;
    
    if (editingId) {
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
                // Invalida la caché de áreas y de todos los centros
                localStorage.removeItem('areasCache');
                localStorage.removeItem('areasTimestamp');
                localStorage.removeItem('workCentersCache_all');
                localStorage.removeItem('workCentersTimestamp_all');
            }
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
                // Invalida la caché de áreas y de todos los centros
                localStorage.removeItem('areasCache');
                localStorage.removeItem('areasTimestamp');
                localStorage.removeItem('workCentersCache_all');
                localStorage.removeItem('workCentersTimestamp_all');
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

async function loadWorkCenters(area_id = null) {
    const CACHE_KEY_PREFIX = 'workCentersCache_';
    const CACHE_TIMESTAMP_PREFIX = 'workCentersTimestamp_';
    const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 horas

    const cacheKey = area_id ? CACHE_KEY_PREFIX + area_id : CACHE_KEY_PREFIX + 'all';
    const cacheTimestampKey = area_id ? CACHE_TIMESTAMP_PREFIX + area_id : CACHE_TIMESTAMP_PREFIX + 'all';
    
    const now = new Date().getTime();
    const cachedTimestamp = localStorage.getItem(cacheTimestampKey);
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData && cachedTimestamp && (now - cachedTimestamp < CACHE_EXPIRY_MS)) {
        console.log('✅ Cargando centros de trabajo desde localStorage (caché)');
        workCenters = JSON.parse(cachedData);
        return workCenters;
    }
    
    if (USE_SUPABASE) {
        try {
            console.log('⏳ Llamando a Supabase para obtener centros de trabajo...');
            const data = await dataClient.getWorkCenters(area_id);
            workCenters = data || [];
            localStorage.setItem(cacheKey, JSON.stringify(workCenters));
            localStorage.setItem(cacheTimestampKey, now);
        } catch (error) {
            console.error('Error loading work centers from Supabase:', error);
            workCenters = JSON.parse(localStorage.getItem(cacheKey)) || [];
        }
    } else {
        workCenters = JSON.parse(localStorage.getItem(cacheKey)) || [];
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
                for (const center of areaCenters) {
                    await dataClient.deleteWorkCenter(center.id);
                }
                await dataClient.deleteArea(area_id);
                // Invalida la caché de áreas, de todos los centros y del área específica
                localStorage.removeItem('areasCache');
                localStorage.removeItem('areasTimestamp');
                localStorage.removeItem('workCentersCache_all');
                localStorage.removeItem('workCentersTimestamp_all');
                localStorage.removeItem(`workCentersCache_${area_id}`);
                localStorage.removeItem(`workCentersTimestamp_${area_id}`);
            }
            areas = areas.filter(a => a.id !== area_id);
            workCenters = workCenters.filter(wc => wc.area_id !== area_id);
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

    // Cargar y renderizar la gráfica de riesgo global
    try {
        const globalSummary = await loadPictogramSummary();
        renderRiskChart('global-risk-chart', globalSummary);
    } catch (error) {
        console.error("Error al cargar el resumen global de riesgos:", error);
        document.getElementById('global-risk-chart').innerHTML = '<p class="no-data-chart">No se pudo cargar la gráfica.</p>';
    }
        
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
    console.log(`🕵️‍♂️ [showAreaDetail] Iniciando vista de detalle para area_id: ${area_id}`);

    // ... (el resto del código de la función para ocultar/mostrar páginas y actualizar UI)
    document.getElementById('areas-page').classList.remove('active');
    document.getElementById('area-detail-page').classList.add('active');
    const area = areas.find(a => a.id === area_id);
    if (!area) {
        ERGOUtils.showToast('Área no encontrada', 'error');
        return;
    }
    current_area_id = area_id;

    // Cargar y renderizar la gráfica de riesgo del área con caché mejorado
try {
    // Se utiliza la función especializada que sí obtiene el resumen de pictogramas para un área específica.
    // Esta función ya contiene la lógica de caché, llamada a Supabase y fallback.
    const areaSummary = await loadPictogramSummary(area_id);
    
    console.log(`📊 Datos del resumen para el área ${area_id} cargados:`, areaSummary);
    renderRiskChart('area-risk-chart', areaSummary);
} catch (error) {
    console.error(`Error al cargar resumen de riesgos para el área ${area_id}:`, error);
    const chartContainer = document.getElementById('area-risk-chart');
    if (chartContainer) {
        chartContainer.innerHTML = '<p class="no-data-chart">No se pudo cargar la gráfica del área.</p>';
    }
}
    
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
    const editingId = document.getElementById('work-center-id-hidden')?.value;
    
    if (editingId) {
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
            const centerIndex = workCenters.findIndex(wc => wc.id === editingId);
            if (centerIndex !== -1) {
                workCenters[centerIndex] = { ...workCenters[centerIndex], ...updatedCenter };
            }
            localStorage.setItem('workCenters', JSON.stringify(workCenters));
            closeWorkCenterModal();
            await renderWorkCenters();
            await renderAreas();
            // Invalida la caché de todos los centros y del área específica
            localStorage.removeItem('workCentersCache_all');
            localStorage.removeItem('workCentersTimestamp_all');
            localStorage.removeItem(`workCentersCache_${current_area_id}`);
            localStorage.removeItem(`workCentersTimestamp_${current_area_id}`);
            // Invalida la caché de la vista concentrada también
            localStorage.removeItem('allWorkCentersCache');
            localStorage.removeItem('allWorkCentersTimestamp');
            ERGOUtils.showToast(`Centro "${name}" actualizado exitosamente`);
        } catch (error) {
            console.error('Error updating work center:', error);
            ERGOUtils.showToast('Error al actualizar el centro de trabajo', 'error');
        }
    } else {
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
            // Invalida la caché de todos los centros y del área específica
            localStorage.removeItem('workCentersCache_all');
            localStorage.removeItem('workCentersTimestamp_all');
            localStorage.removeItem(`workCentersCache_${current_area_id}`);
            localStorage.removeItem(`workCentersTimestamp_${current_area_id}`);
            // Invalida la caché de la vista concentrada también
            localStorage.removeItem('allWorkCentersCache');
            localStorage.removeItem('allWorkCentersTimestamp');
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
                // Invalida la caché de todos los centros y del área específica
                localStorage.removeItem('workCentersCache_all');
                localStorage.removeItem('workCentersTimestamp_all');
                localStorage.removeItem(`workCentersCache_${current_area_id}`);
                localStorage.removeItem(`workCentersTimestamp_${current_area_id}`);
                // Invalida la caché de la vista concentrada también
                localStorage.removeItem('allWorkCentersCache');
                localStorage.removeItem('allWorkCentersTimestamp');
            }
            workCenters = workCenters.filter(wc => wc.id !== centerId);
            localStorage.setItem('workCenters', JSON.stringify(workCenters));
            await renderWorkCenters();
            await renderAreas();
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
    const scoreInfoPromises = workCenters.map(center => obtenerScoreFromSupabase(center.id));
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
    console.log('Debug evaluaciones:', evaluaciones.length, evaluaciones[0])
    
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
        const evaluacion = evaluaciones.find(e => 
            e.workCenterId === workCenterId || 
            e.work_center_id === workCenterId
        );
        
        if (evaluacion && (evaluacion.scoreFinal || evaluacion.score_final)) {
            const score = parseFloat(evaluacion.scoreFinal || evaluacion.score_final);
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

function onEvaluationSaved(workCenterId, areaId) {
    // Invalidar cachés relacionados
    invalidatePictogramCache(areaId); // Cache del área específica
    invalidatePictogramCache(null);   // Cache global
    
    // También invalidar otros cachés relacionados
    localStorage.removeItem('areasCache');
    localStorage.removeItem(`workCentersCache_${areaId}`);
    localStorage.removeItem('workCentersCache_all');
}