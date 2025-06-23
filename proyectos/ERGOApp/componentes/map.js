// map.js - Mapa Interactivo para ERGOApp
class ERGOMap {
    constructor(containerId, dashboardData = null) {
        this.containerId = containerId;
        this.container = d3.select(`#${containerId}`);
        this.svg = null;
        this.mapGroup = null;
        this.zoom = null;
        this.tooltip = null;
        this.legend = null;
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
        
        this.init();
    }

    // Inicializar el mapa
init() {
    console.log('🗺️ Inicializando ERGOMap...');
    this.container.selectAll('*').remove();
    this.createMapStructure();
    this.createTooltip();
    this.createLegend();
    this.setupZoomPan();

    const svgPath = this.container.attr('data-map-source');
    if (svgPath) {
        this.loadSVG(svgPath).then(() => {
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
            
            // Cargar el SVG
            const svgData = await d3.xml(svgPath);
            const importedSVG = svgData.documentElement;
            
            // Limpiar el grupo del mapa
            this.mapGroup.selectAll('*').remove();
            
            // Importar el contenido del SVG
            this.mapGroup.node().appendChild(importedSVG.cloneNode(true));
            
            // Configurar interactividad en las áreas
            this.setupAreaInteractions();
            
            // Ajustar vista inicial
            this.resetZoom();
            
            console.log('✅ SVG cargado exitosamente');
            
            // Si tenemos datos, actualizar inmediatamente
            if (this.dashboardData) {
                this.updateRiskData(this.dashboardData.areas || []);
            }
            
        } catch (error) {
            console.error('❌ Error cargando SVG:', error);
            this.showPlaceholder();
        }
    }

    // Mostrar placeholder cuando no se puede cargar el SVG
    showPlaceholder() {
        this.mapGroup.selectAll('*').remove();
        
        const placeholderGroup = this.mapGroup.append('g');
        
        // Fondo
        placeholderGroup.append('rect')
            .attr('width', this.config.width)
            .attr('height', this.config.height - 100)
            .attr('fill', '#f8f9fa')
            .attr('stroke', '#dee2e6')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '10,5');

        // Texto
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

    // Extraer nombre del área del elemento SVG
    extractAreaName(element) {
        // Intentar obtener el nombre del área de diferentes formas
        const text = element.textContent || element.innerHTML || '';
        const id = element.id || '';
        const className = element.className || '';
        
        // Si es un elemento de texto, usar su contenido
        if (element.tagName === 'text' && text.trim()) {
            return text.trim();
        }
        
        // Si tiene un ID, extraer el nombre del área
        if (id) {
            const match = id.match(/area[_-](.+)/i);
            if (match) return match[1].replace(/[_-]/g, ' ');
        }
        
        // Buscar texto en elementos hermanos o padres
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

    // Buscar datos del área
    findAreaData(areaName) {
        if (!this.areas || this.areas.length === 0) return null;
        
        return this.areas.find(area => {
            const searchName = areaName.toLowerCase().trim();
            const areaNameLower = (area.name || '').toLowerCase().trim();
            
            // Búsqueda exacta
            if (areaNameLower === searchName) return true;
            
            // Búsqueda parcial
            if (areaNameLower.includes(searchName) || searchName.includes(areaNameLower)) {
                return true;
            }
            
            return false;
        });
    }

    // Mostrar tooltip
    showTooltip(event, areaName, areaData) {
        let content = `<strong>${areaName}</strong><br>`;
        
        if (areaData) {
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
                    <div style="margin-top: 4px;">Responsable: ${areaData.responsible || 'N/A'}</div>
                </div>
                <div style="margin-top: 8px; font-size: 11px; color: #ccc;">
                    Click para ver detalles
                </div>
            `;
        } else {
            content += '<div style="margin-top: 8px; color: #ccc;">Sin datos disponibles</div>';
        }
        
        this.tooltip
            .html(content)
            .style('opacity', 1);
        
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

    // Actualizar datos de riesgo en el mapa
    updateRiskData(areas) {
        this.areas = areas || [];
        console.log('🎨 Actualizando colores de riesgo en el mapa...', this.areas.length, 'áreas');
        
        // Actualizar filtro de áreas
        this.updateAreaFilter();
        
        // Colorear áreas según riesgo
        this.colorizeAreas();
        
        // Aplicar filtros actuales
        this.applyFilters();
    }

    // Actualizar filtro de áreas
    updateAreaFilter() {
        const select = d3.select('#areaFilter');
        
        // Limpiar opciones existentes excepto "Todas"
        select.selectAll('option:not([value="all"])').remove();
        
        // Agregar opciones de áreas
        this.areas.forEach(area => {
            select.append('option')
                .attr('value', area.id)
                .text(area.name || `Área ${area.id}`);
        });
    }

    // Colorear áreas según nivel de riesgo
    colorizeAreas() {
        if (!this.areas || this.areas.length === 0) return;
        
        const areaElements = this.mapGroup.selectAll('text, rect, path, circle, polygon');
        
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

    // Obtener color según score de riesgo
    getRiskColor(score) {
        if (score <= 25) return this.config.riskColors.low;
        if (score <= 50) return this.config.riskColors.medium;
        if (score <= 75) return this.config.riskColors.high;
        return this.config.riskColors.critical;
    }

    // Obtener nivel de riesgo según score
    getRiskLevel(score) {
        if (score <= 25) return 'Bajo';
        if (score <= 50) return 'Medio';
        if (score <= 75) return 'Alto';
        return 'Crítico';
    }

    // Obtener código de nivel de riesgo
    getRiskLevelCode(score) {
        if (score <= 25) return 'low';
        if (score <= 50) return 'medium';
        if (score <= 75) return 'high';
        return 'critical';
    }

    // Aplicar filtros
    applyFilters() {
        const areaElements = this.mapGroup.selectAll('[data-area-id]');
        
        areaElements.style('opacity', (d, i, nodes) => {
            const element = nodes[i];
            const areaId = element.getAttribute('data-area-id');
            const riskLevel = element.getAttribute('data-risk-level');
            const riskCode = this.getRiskLevelCode(parseFloat(element.getAttribute('data-score')));
            
            // Filtro por área
            if (this.filters.selectedArea && this.filters.selectedArea !== areaId) {
                return 0.2;
            }
            
            // Filtro por nivel de riesgo
            if (this.filters.riskLevel !== 'all' && this.filters.riskLevel !== riskCode) {
                return 0.2;
            }
            
            return 1;
        });
        
        // Mostrar mensaje si no hay elementos visibles
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
        
        // Crear modal simple para opciones
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
        
        // Cerrar al hacer click fuera
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
        // Esta funcionalidad requiere la librería jsPDF
        ERGOUtils.showToast('Exportación PDF en desarrollo', 'info');
        
        // Implementación futura:
        // 1. Cargar jsPDF dinámicamente
        // 2. Convertir SVG a imagen
        // 3. Agregar al PDF con metadatos
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

    // Limpiar recursos
    destroy() {
        if (this.tooltip) {
            this.tooltip.remove();
        }
        
        this.container.selectAll('*').remove();
        
        console.log('🗑️ ERGOMap destruido');
    }
}

// Funciones auxiliares globales
window.ERGOMap = ERGOMap;

// Auto-inicialización si hay un contenedor disponible
document.addEventListener('DOMContentLoaded', () => {
    // El mapa se inicializará desde index.js cuando se carguen los datos
    console.log('📍 ERGOMap clase disponible');
});