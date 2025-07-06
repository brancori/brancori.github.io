/** AI: RUTA: evaluacion_ini/ergo-evaluaciones-especificas.js */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const evalId = urlParams.get('evalId');
    let tipoEval = urlParams.get('tipo');

    if (!evalId || !tipoEval) {
        console.error("Faltan 'evalId' o 'tipo' en la URL. No se puede cargar la evaluación.");
        return;
    }
    tipoEval = tipoEval.charAt(0).toUpperCase() + tipoEval.slice(1).toLowerCase();
    await loadAndPopulateForm(evalId, tipoEval);
});

async function loadAndPopulateForm(evalId, tipo) {
    const metodoGet = `getEvaluaciones${tipo}`;
    const workCenterId = new URLSearchParams(window.location.search).get('workCenter');

    try {
        const evaluaciones = await dataClient[metodoGet](workCenterId);
        const evaluacion = evaluaciones.find(e => e.id === evalId);

        if (!evaluacion || !evaluacion.datos_formulario) {
            ERGOUtils.showToast('Iniciando nueva evaluación.', 'info');
            document.getElementById('evaluador').value = ERGOAuth.getCurrentUser()?.nombre || '';
            document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
            return;
        }

        // Rellena el formulario con los datos guardados
        for (const key in evaluacion.datos_formulario) {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'radio') {
                    const value = evaluacion.datos_formulario[key];
                    const targetElement = document.querySelector(`[name="${element.name}"][value="${value}"]`);
                    if(targetElement) targetElement.checked = true;
                } else if (element.type === 'checkbox') {
                    element.checked = evaluacion.datos_formulario[key];
                }
                else {
                    element.value = evaluacion.datos_formulario[key];
                }
            }
        }
        
        const calculateButton = document.querySelector('.calculate-btn');
        if (calculateButton) calculateButton.click();

    } catch (error) {
        console.error(`Error cargando la evaluación ${tipo}:`, error);
    }
}

function collectFormData() {
    const form = document.querySelector('.container');
    const inputs = form.querySelectorAll('input[id], select[id], textarea[id]');
    const data = {};

    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) data[input.name] = input.value;
        } else if (input.type === 'checkbox') {
            data[input.id] = input.checked;
        } else {
            data[input.id] = input.value;
        }
    });
    return data;
}

async function saveEvaluation() {
    const urlParams = new URLSearchParams(window.location.search);
    const evalId = urlParams.get('evalId');
    const tipo = urlParams.get('tipo');
    const workCenterId = urlParams.get('workCenter');
    const areaId = urlParams.get('area');

    if (!evalId || !tipo) return ERGOUtils.showToast('Error: Faltan datos para guardar.', 'error');

    let resultados = {};
    if (tipo === 'OCRA') {
        resultados = { indice_ocra: parseFloat(document.getElementById('ocra_final')?.textContent || 0) };
    } else if (tipo === 'REBA' || tipo === 'RULA') {
        resultados = { score_final: parseInt(document.getElementById('scoreFinal')?.textContent || 0) };
    } else if (tipo === 'NIOSH') {
        resultados = { indice_levantamiento: parseFloat(document.querySelector('#final-results strong.risk-low, #final-results strong.risk-medium, #final-results strong.risk-high')?.textContent || 0) };
    }

    const dataToSave = { ...resultados, datos_formulario: collectFormData(), updated_at: new Date().toISOString() };
    
    ERGOUtils.showToast('Guardando...', 'info');

    try {
        const metodoUpdate = `updateEvaluacion${tipo}`;
        await dataClient[metodoUpdate](evalId, dataToSave);
        ERGOUtils.showToast('✅ Evaluación guardada exitosamente.', 'success');
        
        setTimeout(() => {
            const url = `../centro-trabajo.html?workCenter=${workCenterId}&area=${areaId}&areaName=${urlParams.get('areaName')}&centerName=${urlParams.get('centerName')}&responsible=${urlParams.get('responsible')}`;
            window.location.href = url;
        }, 1000);

    } catch (error) {
        console.error('Error al guardar la evaluación:', error);
        ERGOUtils.showToast('Error al guardar. Revisa la consola.', 'error');
    }
}