/** AI: RUTA: evaluacion_ini/ergo-evaluaciones-especificas.js */

document.addEventListener('DOMContentLoaded', async () => {
    // Esperar a que todos los componentes estén listos
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // PASO 1: Verificar que todo esté cargado
    if (typeof ERGOAuth === 'undefined' || typeof dataClient === 'undefined') {
        console.error("Los componentes no están cargados. Esperando...");
        setTimeout(() => window.location.reload(), 1000);
        return;
    }
    
    // PASO 2: Inicializar el contexto de autenticación
    if (!ERGOAuth.initializeAuthContext()) {
        console.error("Fallo de autenticación en la página de evaluación. Redirigiendo a login.");
        ERGOAuth.redirectToLogin();
        return;
    }

    // PASO 3: Ahora que la sesión está verificada, procedemos con la lógica de la página.
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

// Mapeo de tipos de evaluación a nombres de tabla
const EVALUATION_TABLES = {
    'Rula': 'evaluaciones_rula',
    'Reba': 'evaluaciones_reba', 
    'Ocra': 'evaluaciones_ocra',
    'Niosh': 'evaluaciones_niosh'
};

async function loadAndPopulateForm(evalId, tipo) {
    const workCenterId = new URLSearchParams(window.location.search).get('workCenter');
    const tableName = EVALUATION_TABLES[tipo];

    if (!tableName) {
        console.error(`Tipo de evaluación no reconocido: ${tipo}`);
        return;
    }

    try {
        // Buscar evaluación existente por evalId (que viene de la URL)
        const { data: evaluaciones, error } = await dataClient.supabase
            .from(tableName)
            .select('*')
            .eq('work_center_id', workCenterId);

        if (error) throw error;

        // Por ahora, tomar la primera evaluación encontrada
        // En el futuro, podrías implementar lógica para buscar por título o fecha
        const evaluacion = evaluaciones?.[0];

        if (!evaluacion) {
            ERGOUtils.showToast('Iniciando nueva evaluación.', 'info');
            document.getElementById('evaluador').value = ERGOAuth.getCurrentUser()?.nombre || '';
            document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
            return;
        }

        // Rellenar campos comunes
        fillCommonFields(evaluacion);

        // Rellenar campos específicos según el tipo
        switch (tipo) {
            case 'Rula':
                fillRulaFields(evaluacion);
                break;
            case 'Reba':
                fillRebaFields(evaluacion);
                break;
            case 'Ocra':
                fillOcraFields(evaluacion);
                break;
            case 'Niosh':
                fillNioshFields(evaluacion);
                break;
        }
        
        // Recalcular si hay datos completos
        const calculateButton = document.querySelector('.calculate-btn');
        if (calculateButton && evaluacion.score_final) {
            setTimeout(() => calculateButton.click(), 500);
        }

    } catch (error) {
        console.error(`Error cargando la evaluación ${tipo}:`, error);
    }
}

function fillCommonFields(evaluacion) {
    // Campos comunes a todas las evaluaciones
    const commonFields = ['area', 'puesto', 'tarea', 'evaluador', 'trabajadores'];
    
    commonFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && evaluacion[field]) {
            element.value = evaluacion[field];
        }
    });

    // Fecha especial
    if (document.getElementById('fecha') && evaluacion.fecha_evaluacion) {
        document.getElementById('fecha').value = evaluacion.fecha_evaluacion;
    }
}

function fillRulaFields(evaluacion) {
    // Lado
    setRadioValue('lado', evaluacion.lado);
    
    // Group A
    setRadioValue('brazo', evaluacion.brazo);
    setCheckboxValue('brazo_elevado', evaluacion.brazo_elevado);
    setCheckboxValue('brazo_abducido', evaluacion.brazo_abducido);
    setCheckboxValue('brazo_apoyo', evaluacion.brazo_apoyo);
    
    setRadioValue('antebrazo', evaluacion.antebrazo);
    setCheckboxValue('antebrazo_cruzado', evaluacion.antebrazo_cruzado);
    
    setRadioValue('muneca', evaluacion.muneca);
    setCheckboxValue('muneca_desviada', evaluacion.muneca_desviada);
    
    setRadioValue('giro', evaluacion.giro);
    
    // Group B
    setRadioValue('cuello', evaluacion.cuello);
    setCheckboxValue('cuello_twist', evaluacion.cuello_twist);
    
    setRadioValue('tronco', evaluacion.tronco);
    setCheckboxValue('tronco_twist', evaluacion.tronco_twist);
    
    setRadioValue('piernas', evaluacion.piernas);
    
    // Factores adicionales
    setRadioValue('fuerza', evaluacion.fuerza);
    setRadioValue('actividad', evaluacion.actividad);
}

function fillRebaFields(evaluacion) {
    // Group A (Tronco, Cuello, Piernas)
    setRadioValue('tronco', evaluacion.tronco);
    setCheckboxValue('tronco_twist', evaluacion.tronco_twist);
    
    setRadioValue('cuello', evaluacion.cuello);
    setCheckboxValue('cuello_twist', evaluacion.cuello_twist);
    
    setRadioValue('piernas', evaluacion.piernas);
    setCheckboxValue('piernas_flex1', evaluacion.piernas_flex1);
    setCheckboxValue('piernas_flex2', evaluacion.piernas_flex2);
    
    // Group B (Brazo, Antebrazo, Muñeca)
    setRadioValue('brazo', evaluacion.brazo);
    setCheckboxValue('brazo_elevado', evaluacion.brazo_elevado);
    setCheckboxValue('brazo_abducido', evaluacion.brazo_abducido);
    setCheckboxValue('brazo_apoyo', evaluacion.brazo_apoyo);
    
    setRadioValue('antebrazo', evaluacion.antebrazo);
    setCheckboxValue('antebrazo_cruzado', evaluacion.antebrazo_cruzado);
    
    setRadioValue('muneca', evaluacion.muneca);
    setCheckboxValue('muneca_desviada', evaluacion.muneca_desviada);
    
    // Factores adicionales
    setRadioValue('carga', evaluacion.carga);
    setCheckboxValue('actividad1', evaluacion.actividad1);
    setCheckboxValue('actividad2', evaluacion.actividad2);
    setCheckboxValue('actividad3', evaluacion.actividad3);
}

function fillOcraFields(evaluacion) {
    setRadioValue('lado', evaluacion.lado);
    
    // Campos numéricos específicos
    const numericFields = [
        'duracion_turno', 'tiempo_trabajo', 'pausas_oficiales', 'pausas_no_repetitivas',
        'acciones_minuto', 'tiempo_borg_0_2', 'tiempo_borg_3_4', 'tiempo_borg_5_plus'
    ];
    
    numericFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && evaluacion[field] !== null) {
            element.value = evaluacion[field];
        }
    });
    
    // Campos de selección
    setSelectValue('tipo_accion', evaluacion.tipo_accion);
    
    // Posturas
    setRadioValue('hombro', evaluacion.hombro);
    setRadioValue('codo', evaluacion.codo);
    setRadioValue('muneca', evaluacion.muneca);
    setRadioValue('agarre', evaluacion.agarre);
    
    // Factores adicionales
    setCheckboxValue('fa_vibracion', evaluacion.fa_vibracion);
    setCheckboxValue('fa_compresion', evaluacion.fa_compresion);
    setCheckboxValue('fa_frio', evaluacion.fa_frio);
    setCheckboxValue('fa_guantes', evaluacion.fa_guantes);
    setCheckboxValue('fa_ritmo', evaluacion.fa_ritmo);
    setCheckboxValue('fa_precision', evaluacion.fa_precision);
}

function fillNioshFields(evaluacion) {
    // Campos numéricos específicos de NIOSH
    const numericFields = [
        'peso_objeto', 'distancia_h_origen', 'altura_v_origen', 'angulo_asimetria_origen',
        'distancia_h_destino', 'altura_v_destino', 'angulo_asimetria_destino',
        'frecuencia', 'duracion'
    ];
    
    numericFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && evaluacion[field] !== null) {
            element.value = evaluacion[field];
        }
    });
    
    // Campo de selección
    setSelectValue('calidad_agarre', evaluacion.calidad_agarre);
}

// Funciones auxiliares para llenar campos
function setRadioValue(name, value) {
    if (value !== null && value !== undefined) {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) radio.checked = true;
    }
}

function setCheckboxValue(id, value) {
    const checkbox = document.getElementById(id);
    if (checkbox) checkbox.checked = value || false;
}

function setSelectValue(id, value) {
    const select = document.getElementById(id);
    if (select && value) select.value = value;
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

    // FIJO: Convertir tipo a formato correcto
    const tipoFormatted = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
    const tableName = EVALUATION_TABLES[tipoFormatted];

    console.log(`Tipo original: ${tipo}, Tipo formateado: ${tipoFormatted}, Tabla: ${tableName}`);

    if (!tableName) {
        console.error(`Tipo no reconocido: ${tipo}`);
        return ERGOUtils.showToast(`Error: Tipo de evaluación no válido: ${tipo}`, 'error');
    }

    // IMPORTANTE: Solo recopilar datos para el tipo específico
    const dataToSave = collectEvaluationData(tipoFormatted, workCenterId, areaId);
    
    console.log('Datos a guardar:', dataToSave);
    ERGOUtils.showToast('Guardando...', 'info');

    try {
        // FIJO: Buscar solo en la tabla específica
        const { data: existingData } = await dataClient.supabase
            .from(tableName)
            .select('id')
            .eq('work_center_id', workCenterId)
            .limit(1);

        if (existingData && existingData.length > 0) {
            // Actualizar solo en la tabla específica
            const { error: updateError } = await dataClient.supabase
                .from(tableName)
                .update(dataToSave)
                .eq('id', existingData[0].id);
            
            if (updateError) throw updateError;
            console.log(`Actualizado en ${tableName}`);
        } else {
            // Crear solo en la tabla específica
            const { error: insertError } = await dataClient.supabase
                .from(tableName)
                .insert(dataToSave);
            
            if (insertError) throw insertError;
            console.log(`Insertado en ${tableName}`);
        }

        ERGOUtils.showToast('✅ Evaluación guardada exitosamente.', 'success');
        
        // Resto del código sin cambios...
    } catch (error) {
        console.error('Error al guardar la evaluación:', error);
        ERGOUtils.showToast('Error al guardar. Revisa la consola.', 'error');
    }
}

function collectEvaluationData(tipo, workCenterId, areaId) {
    const baseData = {
        work_center_id: workCenterId,
        area_id: areaId,
        area: document.getElementById('area')?.value || '',
        puesto: document.getElementById('puesto')?.value || '',
        tarea: document.getElementById('tarea')?.value || '',
        evaluador: document.getElementById('evaluador')?.value || '',
        fecha_evaluacion: document.getElementById('fecha')?.value || null,
        trabajadores: parseInt(document.getElementById('trabajadores')?.value) || null,
        updated_at: new Date().toISOString()
    };

    switch (tipo) {
        case 'Rula':
            return {
                ...baseData,
                lado: getRadioValue('lado'),
                brazo: getRadioIntValue('brazo'),
                brazo_elevado: getCheckboxValue('brazo_elevado'),
                brazo_abducido: getCheckboxValue('brazo_abducido'),
                brazo_apoyo: getCheckboxValue('brazo_apoyo'),
                antebrazo: getRadioIntValue('antebrazo'),
                antebrazo_cruzado: getCheckboxValue('antebrazo_cruzado'),
                muneca: getRadioIntValue('muneca'),
                muneca_desviada: getCheckboxValue('muneca_desviada'),
                giro: getRadioIntValue('giro'),
                cuello: getRadioIntValue('cuello'),
                cuello_twist: getCheckboxValue('cuello_twist'),
                tronco: getRadioIntValue('tronco'),
                tronco_twist: getCheckboxValue('tronco_twist'),
                piernas: getRadioIntValue('piernas'),
                fuerza: getRadioIntValue('fuerza'),
                actividad: getRadioIntValue('actividad'),
                score_a: getTextIntValue('scoreA'),
                score_b: getTextIntValue('scoreB'),
                score_final: getTextIntValue('scoreFinal'),
                nivel_accion: getTextValue('actionLevel')
            };

        case 'Reba':
            return {
                ...baseData,
                tronco: getRadioIntValue('tronco'),
                tronco_twist: getCheckboxValue('tronco_twist'),
                cuello: getRadioIntValue('cuello'),
                cuello_twist: getCheckboxValue('cuello_twist'),
                piernas: getRadioIntValue('piernas'),
                piernas_flex1: getCheckboxValue('piernas_flex1'),
                piernas_flex2: getCheckboxValue('piernas_flex2'),
                brazo: getRadioIntValue('brazo'),
                brazo_elevado: getCheckboxValue('brazo_elevado'),
                brazo_abducido: getCheckboxValue('brazo_abducido'),
                brazo_apoyo: getCheckboxValue('brazo_apoyo'),
                antebrazo: getRadioIntValue('antebrazo'),
                antebrazo_cruzado: getCheckboxValue('antebrazo_cruzado'),
                muneca: getRadioIntValue('muneca'),
                muneca_desviada: getCheckboxValue('muneca_desviada'),
                carga: getRadioIntValue('carga'),
                actividad1: getCheckboxValue('actividad1'),
                actividad2: getCheckboxValue('actividad2'),
                actividad3: getCheckboxValue('actividad3'),
                score_a: getTextIntValue('scoreA'),
                score_b: getTextIntValue('scoreB'),
                score_final: getTextIntValue('scoreFinal'),
                nivel_riesgo: getTextValue('riskLevel')
            };

        case 'Ocra':
            return {
                ...baseData,
                lado: getRadioValue('lado'),
                duracion_turno: getNumericValue('duracion_turno'),
                tiempo_trabajo: getIntValue('tiempo_trabajo'),
                pausas_oficiales: getIntValue('pausas_oficiales'),
                pausas_no_repetitivas: getIntValue('pausas_no_repetitivas'),
                factor_recuperacion: getNumericValue('factor_recuperacion'),
                acciones_minuto: getNumericValue('acciones_minuto'),
                tipo_accion: getSelectValue('tipo_accion'),
                factor_frecuencia: getNumericValue('factor_frecuencia'),
                tiempo_borg_0_2: getIntValue('tiempo_borg_0_2'),
                tiempo_borg_3_4: getIntValue('tiempo_borg_3_4'),
                tiempo_borg_5_plus: getIntValue('tiempo_borg_5_plus'),
                factor_fuerza: getNumericValue('factor_fuerza'),
                hombro: getRadioIntValue('hombro'),
                codo: getRadioIntValue('codo'),
                muneca: getRadioIntValue('muneca'),
                agarre: getRadioIntValue('agarre'),
                factor_postura: getIntValue('factor_postura'),
                fa_vibracion: getCheckboxValue('fa_vibracion'),
                fa_compresion: getCheckboxValue('fa_compresion'),
                fa_frio: getCheckboxValue('fa_frio'),
                fa_guantes: getCheckboxValue('fa_guantes'),
                fa_ritmo: getCheckboxValue('fa_ritmo'),
                fa_precision: getCheckboxValue('fa_precision'),
                factores_adicionales: getIntValue('factores_adicionales'),
                indice_ocra: getNumericValue('ocra_final'),
                nivel_riesgo: getTextValue('riskLevel')
            };

            case 'Niosh':
                return {
                    ...baseData,
                    // Mapear IDs del HTML a columnas de la DB
                    peso_objeto: getNumericValue('weight'),
                    distancia_h_origen: getNumericValue('h1'),
                    altura_v_origen: getNumericValue('v1'),
                    angulo_asimetria_origen: getIntValue('a1'),
                    distancia_h_destino: getNumericValue('h2'),
                    altura_v_destino: getNumericValue('v2'),
                    angulo_asimetria_destino: getIntValue('a2'),
                    frecuencia: getNumericValue('frequency'),
                    duracion: getIntValue('duration'),
                    calidad_agarre: getSelectValue('grip'),
                    
                    // Resultados calculados (extraer del DOM después del cálculo)
                    multiplicador_horizontal: getCalculatedValue('HM'),
                    multiplicador_vertical: getCalculatedValue('VM'),
                    multiplicador_distancia: getCalculatedValue('DM'),
                    multiplicador_asimetria: getCalculatedValue('AM'),
                    multiplicador_frecuencia: getCalculatedValue('FM'),
                    multiplicador_agarre: getCalculatedValue('CM'),
                    rwl: getCalculatedValue('RWL'),
                    indice_levantamiento: getCalculatedValue('LI'),
                    nivel_riesgo: getCalculatedRiskLevel()
                };

        default:
            return baseData;
    }
}

// Funciones auxiliares para obtener valores
function getRadioValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || null;
}

function getRadioIntValue(name) {
    const value = getRadioValue(name);
    return value ? parseInt(value) : null;
}

function getCheckboxValue(id) {
    return document.getElementById(id)?.checked || false;
}

function getTextValue(id) {
    return document.getElementById(id)?.textContent || null;
}

function getTextIntValue(id) {
    const value = getTextValue(id);
    return value ? parseInt(value) : null;
}

function getNumericValue(id) {
    const element = document.getElementById(id);
    const value = element?.value;
    console.log(`getNumericValue(${id}): ${value}`); // Debug temporal
    return value && value !== '' ? parseFloat(value) : null;
}

function getIntValue(id) {
    const element = document.getElementById(id);
    const value = element?.value;
    console.log(`getIntValue(${id}): ${value}`); // Debug temporal
    return value && value !== '' ? parseInt(value) : null;
}

function getSelectValue(id) {
    const element = document.getElementById(id);
    const value = element?.value;
    console.log(`getSelectValue(${id}): ${value}`); // Debug temporal
    return value || null;
}

function getCalculatedValue(multiplierName) {
    // Buscar en los resultados mostrados
    const resultItems = document.querySelectorAll('.result-item');
    for (let item of resultItems) {
        const text = item.textContent;
        if (text.includes(`${multiplierName} (`)) {
            const match = text.match(/(\d+\.?\d*)/);
            return match ? parseFloat(match[1]) : null;
        }
    }
    return null;
}

function getCalculatedRiskLevel() {
    const finalResults = document.getElementById('final-results');
    if (finalResults) {
        const riskText = finalResults.textContent;
        if (riskText.includes('BAJO RIESGO')) return 'BAJO RIESGO';
        if (riskText.includes('RIESGO MODERADO')) return 'RIESGO MODERADO';
        if (riskText.includes('ALTO RIESGO')) return 'ALTO RIESGO';
    }
    return null;
}