// Sistema de gestión de áreas - SOLO SUPABASE
class AreaManager {
    constructor() {
        this.areas = [];
        this.init();
    }

    async init() {
        try {
            await this.loadAreas();
            this.renderAreas();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error inicializando AreaManager:', error);
            this.showMessage('error', '❌ Error cargando datos de Supabase');
        }
    }

    async loadAreas() {
        try {
            this.areas = await DataManager.getAreas();
            console.log('✅ Áreas cargadas desde Supabase:', this.areas.length);
        } catch (error) {
            console.error('Error cargando áreas:', error);
            this.areas = [];
            throw error;
        }
    }

    async addArea(areaData) {
        try {
            const area = await DataManager.createUniqueArea(areaData.name, areaData.manager);
            await this.loadAreas(); // Recargar desde Supabase
            this.renderAreas();
            this.showMessage('success', `✅ Área "${area.name}" creada correctamente con ID: ${area.id}`);
            return area.id;
        } catch (error) {
            this.showMessage('error', `❌ Error: ${error.message}`);
            return false;
        }
    }

    async deleteArea(id) {
        if (confirm('¿Estás seguro de eliminar esta área? Se eliminarán todos sus centros de trabajo y evaluaciones.')) {
            try {
                await DataManager.deleteArea(id);
                await this.loadAreas(); // Recargar desde Supabase
                this.renderAreas();
                this.showMessage('success', '✅ Área y todos sus datos eliminados correctamente');
            } catch (error) {
                this.showMessage('error', `❌ Error: ${error.message}`);
            }
        }
    }

    renderAreas() {
        const container = document.getElementById('areasList');
        const emptyState = document.getElementById('emptyAreasState');

        if (this.areas.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        
        container.innerHTML = this.areas.map(area => {
            const createdDate = new Date(area.created_at).toLocaleDateString('es-ES');
            const riskDisplay = area.risk_percentage ? 
                `${area.risk_percentage}%` : 'Sin evaluar';
            const riskClass = this.getRiskClass(area.risk_percentage);

            return `
                <div class="area-card">
                    <div class="area-info">
                        <div class="area-name">${area.name}</div>
                        <div class="area-details">
                            👤 ${area.manager}<br>
                            📅 Creado: ${createdDate}
                        </div>
                    </div>
                    <div class="area-stats">
                        <div class="stat-item ${riskClass}">🚨 ${riskDisplay}</div>
                        <div class="stat-item">📊 ${area.evaluation_count || 0} evaluaciones</div>
                    </div>
                    <div class="area-actions">
                        <button class="btn btn-primary" onclick="areaManager.enterArea('${area.id}')">
                            🚪 Entrar
                        </button>
                        <button class="btn btn-danger" onclick="areaManager.deleteArea('${area.id}')">
                            🗑️ Borrar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getRiskClass(riskPercentage) {
        if (!riskPercentage) return '';
        if (riskPercentage <= 25) return 'text-success';
        if (riskPercentage <= 50) return 'text-warning';
        if (riskPercentage <= 75) return 'text-danger';
        return 'text-critical';
    }

    enterArea(areaId) {
        // Almacenar el área seleccionada
        localStorage.setItem('selectedAreaId', areaId);
        
        // Abrir detalle del área
        window.location.href = 'area_detail.html';
        this.showMessage('info', '📝 Abriendo área...');
    }

    setupEventListeners() {
        const form = document.getElementById('areaForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                // Mostrar loading
                submitBtn.textContent = 'Guardando...';
                submitBtn.disabled = true;
                
                const areaData = {
                    name: document.getElementById('areaName').value.trim(),
                    manager: document.getElementById('areaManager').value.trim()
                };

                // Validación
                if (!areaData.name || !areaData.manager) {
                    this.showMessage('error', '❌ Por favor completa todos los campos requeridos');
                    return;
                }

                await this.addArea(areaData);
                this.cancelNewArea();
                
            } catch (error) {
                this.showMessage('error', `❌ Error: ${error.message}`);
            } finally {
                // Restaurar botón
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    cancelNewArea() {
        document.getElementById('newAreaForm').classList.add('hidden');
        document.getElementById('areaForm').reset();
    }

    showMessage(type, message) {
        const container = document.getElementById('statusMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message status-${type}`;
        messageDiv.textContent = message;
        
        container.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Método para refrescar datos
    async refresh() {
        try {
            await this.loadAreas();
            this.renderAreas();
            this.showMessage('success', '✅ Datos actualizados desde Supabase');
        } catch (error) {
            this.showMessage('error', '❌ Error actualizando datos');
        }
    }
}

// Funciones globales para el formulario
function toggleNewAreaForm() {
    const form = document.getElementById('newAreaForm');
    if (form.classList.contains('hidden')) {
        form.classList.remove('hidden');
        document.getElementById('areaName').focus();
        
        // Scroll al formulario en móviles
        setTimeout(() => {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        form.classList.add('hidden');
    }
}

function cancelNewArea() {
    if (window.areaManager) {
        window.areaManager.cancelNewArea();
    }
}

// Funciones para manejo de archivos
function dragOverHandler(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function dragLeaveHandler(e) {
    e.currentTarget.classList.remove('dragover');
}

function dropHandler(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
    
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
}

function processFiles(files) {
    const jsonFiles = files.filter(file => 
        file.name.toLowerCase().endsWith('.json') && file.type === 'application/json'
    );
    
    if (jsonFiles.length === 0) {
        if (window.areaManager) {
            window.areaManager.showMessage('error', '❌ Solo se permiten archivos JSON válidos');
        }
        return;
    }

    if (window.areaManager) {
        window.areaManager.showMessage('info', `📂 Procesando ${jsonFiles.length} archivo(s)...`);
    }
    
    let processedCount = 0;
    let successCount = 0;
    
    jsonFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                importEvaluation(data, file.name);
                successCount++;
            } catch (error) {
                console.error('Error parsing JSON:', error);
                if (window.areaManager) {
                    window.areaManager.showMessage('error', `❌ Error en ${file.name}: formato JSON inválido`);
                }
            } finally {
                processedCount++;
                if (processedCount === jsonFiles.length && successCount > 0) {
                    if (window.areaManager) {
                        window.areaManager.showMessage('success', 
                            `✅ ${successCount} archivo(s) procesado(s) correctamente`);
                    }
                }
            }
        };
        reader.onerror = () => {
            processedCount++;
            if (window.areaManager) {
                window.areaManager.showMessage('error', `❌ Error leyendo ${file.name}`);
            }
        };
        reader.readAsText(file);
    });
}

function importEvaluation(data, filename) {
    try {
        // Validar estructura básica del JSON
        if (!data || typeof data !== 'object') {
            throw new Error('Estructura de datos inválida');
        }

        // Verificar si es una evaluación válida
        const requiredFields = ['nombreArea', 'score'];
        const hasRequiredFields = requiredFields.some(field => data.hasOwnProperty(field));
        
        if (!hasRequiredFields) {
            throw new Error('No se encontraron campos de evaluación requeridos');
        }

        console.log('Evaluación importada:', {
            archivo: filename,
            datos: data
        });

        // Guardar en localStorage para desarrollo
        const evaluations = JSON.parse(localStorage.getItem('imported_evaluations') || '[]');
        evaluations.push({
            ...data,
            importedAt: new Date().toISOString(),
            filename: filename
        });
        localStorage.setItem('imported_evaluations', JSON.stringify(evaluations));

    } catch (error) {
        console.error('Error importing evaluation:', error);
        if (window.areaManager) {
            window.areaManager.showMessage('error', `❌ Error en ${filename}: ${error.message}`);
        }
    }
}

// Inicializar la aplicación
let areaManager;

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Esperar a que DataManager esté disponible
        const initManager = () => {
            if (window.DataManager) {
                console.log('✅ DataManager disponible');
                DataManager.cleanupInconsistentData();
            } else {
                console.log('⚠️ DataManager no disponible, usando métodos locales');
            }
            
            areaManager = new AreaManager();
            window.areaManager = areaManager;
            
            console.log('Sistema iniciado correctamente');
        };
        
        // Si DataManager ya está disponible, inicializar inmediatamente
        if (window.DataManager) {
            initManager();
        } else {
            // Si no, esperar un poco y reintentar
            setTimeout(initManager, 100);
        }
        
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        
        // Mostrar error al usuario
        const container = document.getElementById('statusMessages');
        if (container) {
            container.innerHTML = `
                <div class="status-message status-error">
                    ❌ Error inicializando. Recarga la página.
                </div>
            `;
        }
    }
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Prevenir zoom accidental en móviles al hacer doble tap
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

async function cleanupInconsistentData() {
    if (window.DataManager) {
        // Supabase maneja la consistencia automáticamente
        console.log('✅ Supabase maneja la consistencia automáticamente');
        return false;
    }
    return false;
}