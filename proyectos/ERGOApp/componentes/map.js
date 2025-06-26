// map.js - Mapa Interactivo para ERGOApp
class ERGOMap {
    constructor(containerId, dashboardData = null) {
        this.containerId = containerId;
        this.container = d3.select(`#${containerId}`);
        this.containerElement = document.getElementById(containerId);
        this.mapDataSource = this.containerElement.dataset.mapSource;
        this.svg = null;
        this.mapGroup = null;
        this.zoom = null;
        this.tooltip = d3.select("#map-tooltip");
        this.legend = null;
        this.data = []; // Para mantener compatibilidad con tu código original
        this.filters = {
            selectedArea: null,
            riskLevel: 'all'
        };
        
        // Datos del dashboard
        this.dashboardData = dashboardData;
        this.areas = [];
        this.workCenters = [];
        
        // Configuración del mapa
        this.config = {
            width: 1000,
            height: 600,
            margin: { top: 20, right: 20, bottom: 20, left: 20 },
            colors: {
                default: '#f8f9fa',
                hover: '#e9ecef',
                selected: '#007bff'
            },
            riskColors: {
                low: '#28a745',      // Verde
                medium: '#ffc107',   // Amarillo
                high: '#fd7e14',     // Naranja
                critical: '#dc3545' // Rojo
            }
        };

        // Verificar contenedor y fuente de datos
        if (!this.containerElement || !this.mapDataSource) {
            console.error("Contenedor de mapa o fuente de datos no encontrada.");
            return;
        }

        // Inicializar mapeo de áreas (ahora asíncrono)
        this.createAreaMapping();
        this.init();
    }


// Mapeo entre elementos del SVG y datos reales dinámicos
createAreaMapping() {
    this.areaMapping = {
        'LINEA 14 ( CREMER )': {
            workCenterId: '3HZ6Z8'  // Solo necesitamos el ID del área
        },
                'LINEA 11 ( IMA )': {
            workCenterId: 'TMHECY'  // Solo necesitamos el ID del área
        },
                'LINEA 10 ( CONTINUACION DE ODEN )': {
            workCenterId: 'BZMICZ'  // Solo necesitamos el ID del área
        },
                'LINEA 9 ( CAMPMM )': {
            workCenterId: 'YFSL83'  // Solo necesitamos el ID del área
        },
                'IMPRESION 1': {
            workCenterId: 'UZTACY'  // Solo necesitamos el ID del área
        },
                'LINEA 5A': {
            workCenterId: 'UI5VM1'  // Solo necesitamos el ID del área
        },
                'LINEA 1 ( MEDISEAL )': {
            workCenterId: 'GOZKZA'  // Solo necesitamos el ID del área
        },
                'LINEA 2 ( MANUAL )': {
            workCenterId: '1U52PK'  // Solo necesitamos el ID del área
        },
                'AREA DE RESIDUOS ': {
            workCenterId: 'PAIYHX'  // Solo necesitamos el ID del área
        },
                'SUPERVISIÓN DE PRODUCTO': {
            workCenterId: 'Y9HXR3'  // Solo necesitamos el ID del área
        }
        
    };
    
    console.log('✅ Mapeo simple creado:', this.areaMapping);
}


    // Inicializar el mapa
init() {
    console.log('🗺️ Inicializando ERGOMap...');
    this.container.selectAll('*').remove();
    this.createMapStructure();
    // this.createTooltip(); // ELIMINAR ESTA LÍNEA
    this.createLegend();
    this.setupZoomPan();

    if (this.mapDataSource) {
        this.loadSVG(this.mapDataSource).then(() => {
            if (this.dashboardData) {
                this.updateRiskData(this.dashboardData.areas || []);
            }
        });
    } else {
        console.error('❌ No se especificó la ruta del mapa en el atributo data-map-source');
        this.showPlaceholder();
    }
    
    console.log('✅ ERGOMap inicializado');
}

    // Crear estructura HTML/SVG del mapa
    createMapStructure() {
        const containerDiv = this.container.node();
        
        // Crear controles del mapa
        const controlsDiv = d3.select(containerDiv)
            .insert('div', ':first-child')
            .attr('class', 'map-controls')
            .style('margin-bottom', '1rem')
            .style('display', 'flex')
            .style('gap', '1rem')
            .style('align-items', 'center')
            .style('flex-wrap', 'wrap');

        // Filtro por área
        controlsDiv.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '0.5rem')
            .html(`
                <label style="font-weight: 600; color: var(--gray-700);">Área:</label>
                <select id="areaFilter" class="form-control" style="min-width: 150px;">
                    <option value="all">Todas las áreas</option>
                </select>
            `);

        // Filtro por nivel de riesgo
        controlsDiv.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '0.5rem')
            .html(`
                <label style="font-weight: 600; color: var(--gray-700);">Riesgo:</label>
                <select id="riskFilter" class="form-control" style="min-width: 120px;">
                    <option value="all">Todos</option>
                    <option value="critical">Crítico</option>
                    <option value="high">Alto</option>
                    <option value="medium">Medio</option>
                    <option value="low">Bajo</option>
                </select>
            `);

        // Botones de acción
        const actionsDiv = controlsDiv.append('div')
            .style('display', 'flex')
            .style('gap', '0.5rem')
            .style('margin-left', 'auto');

        actionsDiv.append('button')
            .attr('class', 'btn btn-secondary btn-sm')
            .style('font-size', '0.75rem')
            .html('🔍 Ajustar Vista')
            .on('click', () => this.resetZoom());

        actionsDiv.append('button')
            .attr('class', 'btn btn-secondary btn-sm')
            .style('font-size', '0.75rem')
            .html('📷 Exportar')
            .on('click', () => this.showExportOptions());

        // Crear SVG principal
        this.svg = this.container
            .append('svg')
            .attr('width', '100%')
            .attr('height', this.config.height)
            .attr('viewBox', `0 0 ${this.config.width} ${this.config.height}`)
            .style('border', '1px solid var(--gray-300)')
            .style('border-radius', 'var(--border-radius-md)')
            .style('background', '#ffffff');

        // Grupo principal para zoom/pan
        this.mapGroup = this.svg.append('g')
            .attr('class', 'map-group');

        // Configurar event listeners para filtros
        this.setupFilterListeners();
    }

    // Configurar listeners de filtros
    setupFilterListeners() {
        // Filtro de área
        d3.select('#areaFilter').on('change', (event) => {
            this.filters.selectedArea = event.target.value === 'all' ? null : event.target.value;
            this.applyFilters();
        });

        // Filtro de riesgo
        d3.select('#riskFilter').on('change', (event) => {
            this.filters.riskLevel = event.target.value;
            this.applyFilters();
        });
    }

    // Crear tooltip
    createTooltip() {
        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'map-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', 'white')
            .style('padding', '12px')
            .style('border-radius', '8px')
            .style('font-size', '12px')
            .style('line-height', '1.4')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 1000)
            .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
            .style('max-width', '250px');
    }

    // Crear leyenda
    createLegend() {
        const legendDiv = this.container
            .append('div')
            .attr('class', 'map-legend')
            .style('margin-top', '1rem')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '2rem')
            .style('padding', '1rem')
            .style('background', 'var(--gray-50)')
            .style('border-radius', 'var(--border-radius-md)')
            .style('border', '1px solid var(--gray-200)');

        // Título de la leyenda
        legendDiv.append('span')
            .style('font-weight', '600')
            .style('color', 'var(--gray-700)')
            .text('Niveles de Riesgo:');

        // Elementos de la leyenda
        const legendItems = [
            { level: 'low', label: 'Bajo (0-25%)', color: this.config.riskColors.low },
            { level: 'medium', label: 'Medio (26-50%)', color: this.config.riskColors.medium },
            { level: 'high', label: 'Alto (51-75%)', color: this.config.riskColors.high },
            { level: 'critical', label: 'Crítico (76-100%)', color: this.config.riskColors.critical }
        ];

        legendItems.forEach(item => {
            const legendItem = legendDiv.append('div')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('gap', '0.5rem')
                .style('cursor', 'pointer')
                .on('click', () => {
                    const riskFilter = d3.select('#riskFilter');
                    riskFilter.property('value', item.level);
                    this.filters.riskLevel = item.level;
                    this.applyFilters();
                });

            legendItem.append('div')
                .style('width', '16px')
                .style('height', '16px')
                .style('background', item.color)
                .style('border-radius', '3px')
                .style('border', '1px solid rgba(0,0,0,0.2)');

            legendItem.append('span')
                .style('font-size', '0.875rem')
                .style('color', 'var(--gray-600)')
                .text(item.label);
        });
    }

    // Configurar zoom y pan
    setupZoomPan() {
        this.zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on('zoom', (event) => {
                this.mapGroup.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);
    }

// Cargar SVG del plano
async loadSVG(svgPath) {
    try {
        console.log('📄 Cargando SVG del plano...');
        
        const svgData = await d3.xml(svgPath);
        const importedSVG = svgData.documentElement;
        
        this.mapGroup.selectAll('*').remove();
        this.mapGroup.node().appendChild(importedSVG.cloneNode(true));
        
        // REMOVER esta línea que causa error:
        // this.setupAreaInteractions();
        
        this.resetZoom();
        
        console.log('✅ SVG cargado exitosamente');
        
        // AHORA que el SVG está cargado, aplicar los datos si los hay
        if (this.areas && this.areas.length > 0) {
            console.log('🎨 Aplicando datos guardados al SVG cargado...');
            this.updateAreaFilter();
            this.colorizeAreas();
            this.applyFilters();
        }
        
        // Configurar hover effects DESPUÉS de cargar el SVG
        this.setupHoverEffects();
        
    } catch (error) {
        console.error('❌ Error cargando SVG:', error);
        this.showPlaceholder();
    }
}

    // Configurar interactividad en las áreas
setupAreaInteractions() {
    // Buscar todos los elementos que podrían ser áreas (text, rect, path, etc.)
    const areaElements = this.mapGroup.selectAll('text, rect, path, circle, polygon');
    
    areaElements
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => this.handleAreaHover(event, d))
        .on('mouseleave', () => this.handleAreaLeave())
        .on('mousemove', (event) => this.updateTooltipPosition(event))
        .on('click', (event, d) => this.handleAreaClick(event, d));
}

// Manejar hover en área
handleAreaHover(event, d) {
    const element = event.target;
    const areaName = this.extractAreaName(element);
    const areaData = this.findAreaData(areaName);
    
    // Resaltar elemento
    d3.select(element)
        .style('opacity', 0.8)
        .style('stroke-width', '3px')
        .style('stroke', '#007bff');
    
    // Mostrar tooltip
    this.showTooltip(event, areaName, areaData);
}

// Manejar salida del hover
handleAreaLeave() {
    // Remover resaltado
    this.mapGroup.selectAll('text, rect, path, circle, polygon')
        .style('opacity', null)
        .style('stroke-width', null)
        .style('stroke', null);
    
    // Ocultar tooltip
    this.hideTooltip();
}

// Manejar click en área
handleAreaClick(event, d) {
    const element = event.target;
    const areaName = this.extractAreaName(element);
    const areaData = this.findAreaData(areaName);
    
    if (areaData) {
        // Navegar al área
        this.navigateToArea(areaData);
    } else {
        ERGOUtils.showToast(`Área "${areaName}" no encontrada en los datos`, 'warning');
    }
}

// Mostrar tooltip
showTooltip(event, areaName, areaData) {
    let content = `<strong>${areaData?.displayName || areaName}</strong><br>`;
    
    if (areaData) {
        if (areaData.mapped) {
            // Datos personalizados del mapeo
            content += `
                <div style="margin-top: 8px;">
                    <div>Responsable: ${areaData.responsable || 'N/A'}</div>
                    <div>Score: ${parseFloat(areaData.score).toFixed(2)}%</div>
                    <div>Estado: ${areaData.categoria_riesgo}</div>
                </div>
            `;
        } else {
            // Datos normales de la base de datos
            const score = parseFloat(areaData.promedio_score || 0);
            const riskLevel = this.getRiskLevel(score);
            const color = this.getRiskColor(score);
            
            content += `
                <div style="margin-top: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                        <span>Riesgo: ${riskLevel}</span>
                    </div>
                    <div style="margin-top: 4px;">Score: ${score.toFixed(2)}%</div>
                    <div style="margin-top: 4px;">Centros: ${areaData.total_centros || 0}</div>
                </div>
            `;
        }
        
        content += `
            <div style="margin-top: 8px; font-size: 11px; color: #ccc;">
                Click para ver detalles
            </div>
        `;
    } else {
        content += '<div style="margin-top: 8px; color: #ccc;">Sin datos disponibles</div>';
    }
    
    this.tooltip.html(content).style('opacity', 1);
    this.updateTooltipPosition(event);
}

// Actualizar posición del tooltip
updateTooltipPosition(event) {
    const tooltipWidth = 250;
    const tooltipHeight = 120;
    
    let left = event.pageX + 15;
    let top = event.pageY - 10;
    
    // Ajustar si se sale de la pantalla
    if (left + tooltipWidth > window.innerWidth) {
        left = event.pageX - tooltipWidth - 15;
    }
    
    if (top + tooltipHeight > window.innerHeight) {
        top = event.pageY - tooltipHeight - 10;
    }
    
    this.tooltip
        .style('left', left + 'px')
        .style('top', top + 'px');
}

// Ocultar tooltip
hideTooltip() {
    this.tooltip.style('opacity', 0);
}

// Navegar al área seleccionada
navigateToArea(areaData) {
    if (window.indexApp && typeof window.indexApp.navigateToAreaWorkCenters === 'function') {
        window.indexApp.navigateToAreaWorkCenters(areaData.id, areaData.name);
    } else {
        // Fallback directo
        ERGONavigation.navigateToAreas(areaData.id);
    }
}

    // Método para actualizar datos (mantener compatibilidad)
// Método para actualizar datos (mantener compatibilidad)
updateRiskData(areasData) {
    this.data = areasData || [];
    this.areas = areasData || [];
    console.log('🎨 Actualizando datos del mapa...', this.data.length, 'áreas');
    
    // Solo ejecutar si el mapa ya está inicializado
    if (this.mapGroup) {
        this.updateAreaFilter();
        this.colorizeAreas();
        this.applyFilters();
    } else {
        console.log('⚠️ Mapa aún no inicializado, datos guardados para después');
    }
    
    this.setupHoverEffects(); // Vuelve a aplicar los hovers con los nuevos datos
}

setupHoverEffects() {
    if (!this.mapGroup) {
        console.log('⚠️ mapGroup no disponible para hover effects');
        return;
    }
    
    console.log('🖱️ Configurando efectos hover...');
    
    // CORRECCIÓN: Usar this.mapGroup en lugar de d3.select(this.svg)
    this.mapGroup.selectAll('text, path, rect, circle, polygon')
        .style('cursor', 'pointer')
        .on("mouseover", async (event, d) => {
            const element = event.target;
            const elementText = element.textContent || element.id;
            
            console.log('🖱️ Hover sobre:', elementText);
            
            // Buscar en el mapeo
            const mappedConfig = this.areaMapping[elementText];
            let tooltipContent = '';
            
if (mappedConfig && mappedConfig.workCenterId) {
    try {
        // Obtener datos del centro de trabajo específico
        const [workCenterData, scoreData] = await Promise.all([
            dataClient.getWorkCenter(mappedConfig.workCenterId),
            dataClient.getScoreWorkCenter(mappedConfig.workCenterId)
        ]);
        
        // Obtener datos del área si está disponible
        const areaData = workCenterData?.area_id ? await dataClient.getArea(workCenterData.area_id) : null;
                    
                    
                    // Crear tooltip con datos reales
                tooltipContent = `
                    <h4>${workCenterData?.name || 'Sin nombre'}</h4>
                    <p><strong>ID Centro:</strong> ${mappedConfig.workCenterId}</p>
                    <p><strong>Responsable:</strong> ${workCenterData?.responsible || 'Sin responsable'}</p>
                    <p><strong>Riesgo:</strong> ${parseFloat(scoreData?.score_actual || 0).toFixed(2)}% - ${scoreData?.categoria_riesgo || 'Sin evaluar'}</p>
                    <p><strong>Área:</strong> ${areaData?.name || 'Sin área'}</p>
                    <p><small>Click para ver detalles</small></p>
                `;
                    
                } catch (error) {
                    console.error('Error obteniendo datos del área:', error);
                    tooltipContent = `
                        <h4>${elementText}</h4>
                        <p>Error cargando datos</p>
                        <p><small>Verifica tu conexión</small></p>
                    `;
                }
            } else {
                // Buscar en datos del dashboard como fallback
                const areaData = this.data.find(area => 
                    area.name && area.name.toLowerCase().includes(elementText.toLowerCase())
                );
                
                if (areaData) {
                    const score = parseFloat(areaData.promedio_score || 0).toFixed(2);
                    tooltipContent = `
                        <h4>${areaData.name}</h4>
                        <p>Responsable: ${areaData.responsable || 'No asignado'}</p>
                        <p><strong>Riesgo: ${score}%</strong> - ${this.getRiskLevelText(score)}</p>
                        <p>Centros: ${areaData.total_centros || 0}</p>
                        <p><small>Click para ver detalles</small></p>
                    `;
                } else {
                    tooltipContent = `
                        <h4>${elementText || 'Área'}</h4>
                        <p>Sin datos disponibles</p>
                    `;
                }
            }
            
            // Mostrar tooltip
            this.tooltip.style("display", "block").html(tooltipContent);
            
            // Resaltar elemento
            d3.select(element)
                .style('opacity', 0.8)
                .style('stroke-width', '3px')
                .style('stroke', '#007bff');
        })
        .on("mousemove", (event) => {
            this.tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", (event) => {
            this.tooltip.style("display", "none");
            
            // Remover resaltado
            d3.select(event.target)
                .style('opacity', null)
                .style('stroke-width', null)
                .style('stroke', null);
        })
        .on("click", async (event, d) => {
    const element = event.target;
    const elementText = element.textContent || element.id;
    
    // Buscar en mapeo
    const mappedConfig = this.areaMapping[elementText];
    
    if (mappedConfig && mappedConfig.workCenterId) {
        try {
            // Obtener datos para la navegación
            const workCenterData = await dataClient.getWorkCenter(mappedConfig.workCenterId);
            const areaData = workCenterData?.area_id ? await dataClient.getArea(workCenterData.area_id) : null;
            
            // Navegar al centro de trabajo específico
            ERGONavigation.navigateToWorkCenter(
                mappedConfig.workCenterId,
                workCenterData?.area_id || '',
                encodeURIComponent(areaData?.name || 'Área'),
                encodeURIComponent(workCenterData?.name || 'Centro'),
                ''
            );
        } catch (error) {
            console.error('Error navegando:', error);
            ERGOUtils.showToast('Error al navegar al centro de trabajo', 'error');
        }
    } else {
        // Fallback a búsqueda en datos del dashboard
        const areaData = this.data.find(area => 
            area.name && area.name.toLowerCase().includes(elementText.toLowerCase())
        );
        
        if (areaData) {
            ERGONavigation.navigateToAreas(areaData.id, areaData.name);
        } else {
            ERGOUtils.showToast(`Área "${elementText}" no encontrada`, 'warning');
        }
    }
});
}

    // Actualizar filtro de áreas
// Actualizar filtro de áreas
updateAreaFilter() {
    const select = d3.select('#areaFilter');
    
    // Verificar que el select existe
    if (select.empty()) {
        console.log('⚠️ Select de área no encontrado');
        return;
    }
    
    // Limpiar opciones existentes excepto "Todas"
    select.selectAll('option:not([value="all"])').remove();
    
    // Verificar que hay áreas para agregar
    if (!this.areas || this.areas.length === 0) {
        console.log('⚠️ No hay áreas para agregar al filtro');
        return;
    }
    
    // Agregar opciones de áreas
    this.areas.forEach(area => {
        select.append('option')
            .attr('value', area.id)
            .text(area.name || `Área ${area.id}`);
    });
}

    // Colorear áreas según nivel de riesgo
// Colorear áreas según nivel de riesgo
colorizeAreas() {
    // Verificar que mapGroup existe
    if (!this.mapGroup) {
        console.log('⚠️ mapGroup no disponible para colorear áreas');
        return;
    }
    
    if (!this.areas || this.areas.length === 0) {
        console.log('⚠️ No hay datos de áreas para colorear');
        return;
    }
    
    const areaElements = this.mapGroup.selectAll('text, rect, path, circle, polygon');
    
    // Verificar que hay elementos en el SVG
    if (areaElements.empty()) {
        console.log('⚠️ No hay elementos SVG para colorear');
        return;
    }
    
    areaElements.each((d, i, nodes) => {
        const element = nodes[i];
        const areaName = this.extractAreaName(element);
        const areaData = this.findAreaData(areaName);
        
        if (areaData && element.tagName !== 'text') {
            const score = parseFloat(areaData.promedio_score || 0);
            const color = this.getRiskColor(score);
            
            // Aplicar color con transparencia
            d3.select(element)
                .style('fill', color)
                .style('fill-opacity', 0.7)
                .style('stroke', color)
                .style('stroke-width', '1px')
                .attr('data-area-id', areaData.id)
                .attr('data-risk-level', this.getRiskLevel(score))
                .attr('data-score', score);
        }
    });
}

    // Resto de métodos auxiliares...
    extractAreaName(element) {
        const text = element.textContent || element.innerHTML || '';
        const id = element.id || '';
        const className = element.className || '';
        
        if (element.tagName === 'text' && text.trim()) {
            return text.trim();
        }
        
        if (id) {
            const match = id.match(/area[_-](.+)/i);
            if (match) return match[1].replace(/[_-]/g, ' ');
        }
        
        const parent = element.parentElement;
        if (parent) {
            const textElements = parent.querySelectorAll('text');
            for (let textEl of textElements) {
                if (textEl.textContent.trim()) {
                    return textEl.textContent.trim();
                }
            }
        }
        
        return text || id || 'Área desconocida';
    }

    findAreaData(areaName) {
        if (!this.areas || this.areas.length === 0) return null;
        
        return this.areas.find(area => {
            const searchName = areaName.toLowerCase().trim();
            const areaNameLower = (area.name || '').toLowerCase().trim();
            
            if (areaNameLower === searchName) return true;
            if (areaNameLower.includes(searchName) || searchName.includes(areaNameLower)) {
                return true;
            }
            return false;
        });
    }

    getRiskColor(score) {
        if (score <= 25) return this.config.riskColors.low;
        if (score <= 50) return this.config.riskColors.medium;
        if (score <= 75) return this.config.riskColors.high;
        return this.config.riskColors.critical;
    }

    getRiskLevel(score) {
        if (score <= 25) return 'Bajo';
        if (score <= 50) return 'Medio';
        if (score <= 75) return 'Alto';
        return 'Crítico';
    }

    getRiskLevelCode(score) {
        if (score <= 25) return 'low';
        if (score <= 50) return 'medium';
        if (score <= 75) return 'high';
        return 'critical';
    }

    getRiskLevelText(score) {
        const numScore = parseFloat(score);
        if (numScore <= 25) return 'Riesgo Bajo';
        if (numScore <= 50) return 'Riesgo Medio';
        if (numScore <= 75) return 'Riesgo Alto';
        return 'Riesgo Crítico';
    }

    // Aplicar filtros
applyFilters() {
    // Verificar que mapGroup existe
    if (!this.mapGroup) {
        console.log('⚠️ mapGroup no disponible para aplicar filtros');
        return;
    }
    
    const areaElements = this.mapGroup.selectAll('[data-area-id]');
    
    // Verificar que hay elementos
    if (areaElements.empty()) {
        console.log('⚠️ No hay elementos con data-area-id para filtrar');
        return;
    }
    
    areaElements.style('opacity', (d, i, nodes) => {
        const element = nodes[i];
        const areaId = element.getAttribute('data-area-id');
        const riskLevel = element.getAttribute('data-risk-level');
        const riskCode = this.getRiskLevelCode(parseFloat(element.getAttribute('data-score')));
        
        if (this.filters.selectedArea && this.filters.selectedArea !== areaId) {
            return 0.2;
        }
        
        if (this.filters.riskLevel !== 'all' && this.filters.riskLevel !== riskCode) {
            return 0.2;
        }
        
        return 1;
    });
    
    const visibleElements = areaElements.filter((d, i, nodes) => {
        return d3.select(nodes[i]).style('opacity') > 0.5;
    });
    
    if (visibleElements.size() === 0 && (this.filters.selectedArea || this.filters.riskLevel !== 'all')) {
        ERGOUtils.showToast('No se encontraron áreas con los filtros seleccionados', 'info');
    }
}

    // Resetear zoom a vista completa
    resetZoom() {
        const bounds = this.mapGroup.node().getBBox();
        const fullWidth = this.config.width;
        const fullHeight = this.config.height - 100;
        
        const midX = bounds.x + bounds.width / 2;
        const midY = bounds.y + bounds.height / 2;
        
        const scale = Math.min(fullWidth / bounds.width, fullHeight / bounds.height) * 0.9;
        
        const translate = [
            fullWidth / 2 - scale * midX,
            fullHeight / 2 - scale * midY
        ];
        
        this.svg
            .transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }

    // Mostrar opciones de exportación
    showExportOptions() {
        const options = [
            { label: 'Exportar como PNG', action: () => this.exportAsPNG() },
            { label: 'Exportar como SVG', action: () => this.exportAsSVG() },
            { label: 'Exportar como PDF', action: () => this.exportAsPDF() }
        ];
        
        const modal = d3.select('body')
            .append('div')
            .style('position', 'fixed')
            .style('top', '0')
            .style('left', '0')
            .style('width', '100%')
            .style('height', '100%')
            .style('background', 'rgba(0,0,0,0.5)')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .style('z-index', 9999);
        
        const content = modal.append('div')
            .style('background', 'white')
            .style('padding', '2rem')
            .style('border-radius', '8px')
            .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
        
        content.append('h3')
            .style('margin', '0 0 1rem 0')
            .text('Exportar Mapa');
        
        options.forEach(option => {
            content.append('button')
                .attr('class', 'btn btn-primary')
                .style('display', 'block')
                .style('width', '100%')
                .style('margin-bottom', '0.5rem')
                .text(option.label)
                .on('click', () => {
                    option.action();
                    modal.remove();
                });
        });
        
        content.append('button')
            .attr('class', 'btn btn-secondary')
            .style('display', 'block')
            .style('width', '100%')
            .style('margin-top', '1rem')
            .text('Cancelar')
            .on('click', () => modal.remove());
        
        modal.on('click', (event) => {
            if (event.target === modal.node()) {
                modal.remove();
            }
        });
    }

    // Exportar como PNG
    exportAsPNG() {
        const svgElement = this.svg.node();
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = this.config.width;
        canvas.height = this.config.height;
        
        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            const link = document.createElement('a');
            link.download = `mapa-riesgos-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            ERGOUtils.showToast('Mapa exportado como PNG', 'success');
        };
        
        img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    }

    // Exportar como SVG
    exportAsSVG() {
        const svgElement = this.svg.node();
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        
        link.download = `mapa-riesgos-${new Date().toISOString().split('T')[0]}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        ERGOUtils.showToast('Mapa exportado como SVG', 'success');
    }

    // Exportar como PDF (requiere jsPDF)
    exportAsPDF() {
        ERGOUtils.showToast('Exportación PDF en desarrollo', 'info');
    }

    // Mostrar placeholder cuando no se puede cargar el SVG
    showPlaceholder() {
        this.mapGroup.selectAll('*').remove();
        
        const placeholderGroup = this.mapGroup.append('g');
        
        placeholderGroup.append('rect')
            .attr('width', this.config.width)
            .attr('height', this.config.height - 100)
            .attr('fill', '#f8f9fa')
            .attr('stroke', '#dee2e6')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '10,5');

        placeholderGroup.append('text')
            .attr('x', this.config.width / 2)
            .attr('y', this.config.height / 2 - 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '24px')
            .attr('fill', '#6c757d')
            .text('🗺️');

        placeholderGroup.append('text')
            .attr('x', this.config.width / 2)
            .attr('y', this.config.height / 2 + 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('fill', '#6c757d')
            .text('Plano no disponible');

        placeholderGroup.append('text')
            .attr('x', this.config.width / 2)
            .attr('y', this.config.height / 2 + 35)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#adb5bd')
            .text('Coloca tu archivo SVG en ./assets/plano.svg');
    }

    // Limpiar recursos
    destroy() {
        if (this.tooltip) {
            this.tooltip.style("display", "none");
        }
        console.log('🗑️ ERGOMap destruido');
    }
}

// Exportar clase
window.ERGOMap = ERGOMap;

// Auto-inicialización si hay un contenedor disponible
document.addEventListener('DOMContentLoaded', () => {
    console.log('📍 ERGOMap clase disponible');
});
