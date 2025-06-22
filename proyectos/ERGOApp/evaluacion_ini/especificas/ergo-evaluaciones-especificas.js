
window.ERGOEvaluacionesEspecificas = {
    // Configuración de tipos de evaluación según las tablas de Supabase
    tiposEvaluacion: {
        'REBA': {
            tabla: 'evaluaciones_reba',
            metodo: 'createEvaluacionReba',
            campos: [
                'tronco', 'tronco_twist', 'cuello', 'cuello_twist', 'piernas', 
                'piernas_flex1', 'piernas_flex2', 'brazo', 'brazo_elevado', 
                'brazo_abducido', 'brazo_apoyo', 'antebrazo', 'antebrazo_cruzado',
                'muneca', 'muneca_desviada', 'carga', 'actividad1', 'actividad2', 
                'actividad3', 'score_a', 'score_b', 'score_final', 'nivel_riesgo'
            ]
        },
        'RULA': {
            tabla: 'evaluaciones_rula',
            metodo: 'createEvaluacionRula',
            campos: [
                'lado', 'brazo', 'brazo_elevado', 'brazo_abducido', 'brazo_apoyo',
                'antebrazo', 'antebrazo_cruzado', 'muneca', 'muneca_desviada', 
                'giro', 'cuello', 'cuello_twist', 'tronco', 'tronco_twist', 
                'piernas', 'fuerza', 'actividad', 'score_a', 'score_b', 
                'score_final', 'nivel_accion'
            ]
        },
        'OCRA': {
            tabla: 'evaluaciones_ocra',
            metodo: 'createEvaluacionOcra',
            campos: [
                'lado', 'duracion_turno', 'tiempo_trabajo', 'pausas_oficiales', 
                'pausas_no_repetitivas', 'factor_recuperacion', 'acciones_minuto', 
                'tipo_accion', 'factor_frecuencia', 'tiempo_borg_0_2', 
                'tiempo_borg_3_4', 'tiempo_borg_5_plus', 'factor_fuerza', 
                'hombro', 'codo', 'muneca', 'agarre', 'factor_postura', 
                'fa_vibracion', 'fa_compresion', 'fa_frio', 'fa_guantes', 
                'fa_ritmo', 'fa_precision', 'factores_adicionales', 
                'indice_ocra', 'nivel_riesgo'
            ]
        },
        'NIOSH': {
            tabla: 'evaluaciones_niosh',
            metodo: 'createEvaluacionNiosh',
            campos: [
                'peso_objeto', 'distancia_h_origen', 'altura_v_origen', 
                'angulo_asimetria_origen', 'distancia_h_destino', 
                'altura_v_destino', 'angulo_asimetria_destino', 'frecuencia', 
                'duracion', 'calidad_agarre', 'multiplicador_horizontal', 
                'multiplicador_vertical', 'multiplicador_distancia', 
                'multiplicador_asimetria', 'multiplicador_frecuencia', 
                'multiplicador_agarre', 'rwl', 'indice_levantamiento', 'nivel_riesgo'
            ]
        }
    },

    // Obtener parámetros de la URL para contexto
    obtenerContextoEvaluacion() {
        const params = new URLSearchParams(window.location.search);
        return {
            workCenterId: params.get('workCenter'),
            areaId: params.get('area'),
            areaName: decodeURIComponent(params.get('areaName') || ''),
            centerName: decodeURIComponent(params.get('centerName') || ''),
            responsible: decodeURIComponent(params.get('responsible') || ''),
            tipo: params.get('tipo') || this.detectarTipoEvaluacion()
        };
    },

    // Detectar tipo de evaluación basado en la URL o título de la página
    detectarTipoEvaluacion() {
        const url = window.location.pathname.toLowerCase();
        const title = document.title.toLowerCase();
        
        if (url.includes('reba') || title.includes('reba')) return 'REBA';
        if (url.includes('rula') || title.includes('rula')) return 'RULA';
        if (url.includes('ocra') || title.includes('ocra')) return 'OCRA';
        if (url.includes('niosh') || title.includes('niosh')) return 'NIOSH';
        
        return 'REBA'; // Por defecto
    },

    // Crear botón de guardar evaluación
    crearBotonGuardar(containerId = 'save-evaluation-container') {
        const container = document.getElementById(containerId) || document.body;
        
        const botonHTML = `
            <div id="ergo-save-container" style="margin: 20px 0; text-align: center;">
                <button id="btn-save-evaluation" class="btn-save-evaluation" 
                        style="background: linear-gradient(135deg, #27ae60, #229954); 
                               color: white; padding: 15px 30px; border: none; 
                               border-radius: 8px; font-size: 16px; cursor: pointer;
                               margin-right: 10px; transition: transform 0.2s;"
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'">
                    💾 Guardar en Mis Evaluaciones
                </button>
                <button id="btn-view-evaluations" class="btn-view-evaluations"
                        style="background: linear-gradient(135deg, #3498db, #2980b9); 
                               color: white; padding: 15px 30px; border: none; 
                               border-radius: 8px; font-size: 16px; cursor: pointer;
                               transition: transform 0.2s;"
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'">
                    📋 Ver Mis Evaluaciones
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', botonHTML);
        
        // Configurar eventos
        document.getElementById('btn-save-evaluation').addEventListener('click', () => {
            this.guardarEvaluacion();
        });
        
        document.getElementById('btn-view-evaluations').addEventListener('click', () => {
            this.verEvaluaciones();
        });
    },

    // Función principal para guardar evaluación
    async guardarEvaluacion() {
        try {
            // Verificar autenticación
            if (!ERGOAuth.checkSession()) {
                ERGOUtils.showToast('Debes iniciar sesión para guardar evaluaciones', 'error');
                return;
            }

            // Verificar permisos
            if (!ERGOAuth.checkPermissionAndShowError('create')) {
                return;
            }

            const contexto = this.obtenerContextoEvaluacion();
            
            if (!contexto.workCenterId) {
                ERGOUtils.showToast('No se puede identificar el centro de trabajo', 'error');
                return;
            }

            const datosEvaluacion = this.extraerDatosEvaluacion(contexto.tipo);
            
            if (!datosEvaluacion) {
                ERGOUtils.showToast('Error al extraer datos de la evaluación', 'error');
                return;
            }

            // Preparar datos para Supabase
            const evaluacionCompleta = {
                ...datosEvaluacion,
                work_center_id: contexto.workCenterId,
                area: contexto.areaName,
                puesto: contexto.centerName,
                tarea: this.extraerTarea(),
                evaluador: ERGOAuth.getCurrentUser()?.nombre || 'Usuario',
                fecha_evaluacion: new Date().toISOString().split('T')[0],
                trabajadores: this.extraerNumeroTrabajadores(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('💾 Guardando evaluación:', evaluacionCompleta);

            // Guardar en Supabase usando el método específico
            const config = this.tiposEvaluacion[contexto.tipo];
            const resultado = await supabase[config.metodo](evaluacionCompleta);

            if (resultado) {
                ERGOUtils.showToast(`Evaluación ${contexto.tipo} guardada exitosamente`, 'success');
                
                // Actualizar score en tabla resumen si aplica
                if (datosEvaluacion.score_final || datosEvaluacion.indice_ocra || datosEvaluacion.indice_levantamiento) {
                    await this.actualizarScoreResumen(contexto, datosEvaluacion);
                }
            }

        } catch (error) {
            console.error('❌ Error guardando evaluación:', error);
            ERGOUtils.showToast('Error al guardar la evaluación', 'error');
        }
    },

    // Extraer datos según el tipo de evaluación
    extraerDatosEvaluacion(tipo) {
        switch (tipo) {
            case 'REBA':
                return this.extraerDatosREBA();
            case 'RULA':
                return this.extraerDatosRULA();
            case 'OCRA':
                return this.extraerDatosOCRA();
            case 'NIOSH':
                return this.extraerDatosNIOSH();
            default:
                return null;
        }
    },

    // Extraer datos específicos de REBA
    extraerDatosREBA() {
        const datos = {};
        
        try {
            // Grupo A - Tronco, Cuello, Piernas
            datos.tronco = this.obtenerValorRadio('tronco');
            datos.tronco_twist = document.getElementById('tronco_twist')?.checked || false;
            datos.cuello = this.obtenerValorRadio('cuello');
            datos.cuello_twist = document.getElementById('cuello_twist')?.checked || false;
            datos.piernas = this.obtenerValorRadio('piernas');
            datos.piernas_flex1 = document.getElementById('piernas_flex1')?.checked || false;
            datos.piernas_flex2 = document.getElementById('piernas_flex2')?.checked || false;

            // Grupo B - Brazo, Antebrazo, Muñeca
            datos.brazo = this.obtenerValorRadio('brazo');
            datos.brazo_elevado = document.getElementById('brazo_elevado')?.checked || false;
            datos.brazo_abducido = document.getElementById('brazo_abducido')?.checked || false;
            datos.brazo_apoyo = document.getElementById('brazo_apoyo')?.checked || false;
            datos.antebrazo = this.obtenerValorRadio('antebrazo');
            datos.antebrazo_cruzado = document.getElementById('antebrazo_cruzado')?.checked || false;
            datos.muneca = this.obtenerValorRadio('muneca');
            datos.muneca_desviada = document.getElementById('muneca_desviada')?.checked || false;

            // Factores adicionales
            datos.carga = this.obtenerValorRadio('carga');
            datos.actividad1 = document.getElementById('actividad1')?.checked || false;
            datos.actividad2 = document.getElementById('actividad2')?.checked || false;
            datos.actividad3 = document.getElementById('actividad3')?.checked || false;

            // Resultados (si están disponibles)
            datos.score_a = this.obtenerValorElemento('scoreA');
            datos.score_b = this.obtenerValorElemento('scoreB');
            datos.score_final = this.obtenerValorElemento('scoreFinal');
            datos.nivel_riesgo = this.obtenerTextoElemento('riskLevel');

            return datos;
        } catch (error) {
            console.error('Error extrayendo datos REBA:', error);
            return null;
        }
    },

    // Extraer datos específicos de RULA
    extraerDatosRULA() {
        const datos = {};
        
        try {
            // Información del lado
            datos.lado = this.obtenerValorRadio('lado');

            // Grupo A - Brazo, Antebrazo, Muñeca
            datos.brazo = this.obtenerValorRadio('brazo');
            datos.brazo_elevado = document.getElementById('brazo_elevado')?.checked || false;
            datos.brazo_abducido = document.getElementById('brazo_abducido')?.checked || false;
            datos.brazo_apoyo = document.getElementById('brazo_apoyo')?.checked || false;
            datos.antebrazo = this.obtenerValorRadio('antebrazo');
            datos.antebrazo_cruzado = document.getElementById('antebrazo_cruzado')?.checked || false;
            datos.muneca = this.obtenerValorRadio('muneca');
            datos.muneca_desviada = document.getElementById('muneca_desviada')?.checked || false;
            datos.giro = this.obtenerValorRadio('giro');

            // Grupo B - Cuello, Tronco, Piernas
            datos.cuello = this.obtenerValorRadio('cuello');
            datos.cuello_twist = document.getElementById('cuello_twist')?.checked || false;
            datos.tronco = this.obtenerValorRadio('tronco');
            datos.tronco_twist = document.getElementById('tronco_twist')?.checked || false;
            datos.piernas = this.obtenerValorRadio('piernas');

            // Factores adicionales
            datos.fuerza = this.obtenerValorRadio('fuerza');
            datos.actividad = this.obtenerValorRadio('actividad');

            // Resultados
            datos.score_a = this.obtenerValorElemento('scoreA');
            datos.score_b = this.obtenerValorElemento('scoreB');
            datos.score_final = this.obtenerValorElemento('scoreFinal');
            datos.nivel_accion = this.obtenerTextoElemento('actionLevel');

            return datos;
        } catch (error) {
            console.error('Error extrayendo datos RULA:', error);
            return null;
        }
    },

    // Extraer datos específicos de OCRA
extraerDatosOCRA() {
    const datos = {};
    
    try {
        // Información general
        datos.lado = this.obtenerValorElemento('lado') || 'derecho';
        datos.duracion_turno = this.obtenerValorElemento('duracion_turno') || 8;

        // Factor de recuperación
        datos.tiempo_trabajo = this.obtenerValorElemento('tiempo_trabajo');
        datos.pausas_oficiales = this.obtenerValorElemento('pausas_oficiales');
        datos.pausas_no_repetitivas = this.obtenerValorElemento('pausas_no_repetitivas');
        datos.factor_recuperacion = this.obtenerValorElemento('fr_result', true);

        // Factor de frecuencia
        datos.acciones_minuto = this.obtenerValorElemento('acciones_minuto');
        datos.tipo_accion = this.obtenerValorRadio('tipo_accion') || 'dinamica';
        datos.factor_frecuencia = this.obtenerValorElemento('ff_result', true);

        // Factor de fuerza
        datos.tiempo_borg_0_2 = this.obtenerValorElemento('tiempo_borg_0_2');
        datos.tiempo_borg_3_4 = this.obtenerValorElemento('tiempo_borg_3_4');
        datos.tiempo_borg_5_plus = this.obtenerValorElemento('tiempo_borg_5_plus');
        datos.factor_fuerza = this.obtenerValorElemento('ffu_result', true);

        // Factor de posturaextraerDatosNIOSH
        datos.hombro = this.obtenerValorRadio('hombro');
        datos.codo = this.obtenerValorRadio('codo');
        datos.muneca = this.obtenerValorRadio('muneca');
        datos.agarre = this.obtenerValorRadio('agarre');
        datos.factor_postura = this.obtenerValorElemento('fp_result');

        // Factores adicionales
        datos.fa_vibracion = document.getElementById('fa_vibracion')?.checked || false;
        datos.fa_compresion = document.getElementById('fa_compresion')?.checked || false;
        datos.fa_frio = document.getElementById('fa_frio')?.checked || false;
        datos.fa_guantes = document.getElementById('fa_guantes')?.checked || false;
        datos.fa_ritmo = document.getElementById('fa_ritmo')?.checked || false;
        datos.fa_precision = document.getElementById('fa_precision')?.checked || false;
        datos.factores_adicionales = this.obtenerValorElemento('fa_result');

        // Resultados
        datos.indice_ocra = this.obtenerValorElemento('ocra_final', true);
        datos.nivel_riesgo = this.obtenerTextoElemento('recommendations');

        return datos;
    } catch (error) {
        console.error('Error extrayendo datos OCRA:', error);
        return null;
    }
},

    // Extraer datos específicos de NIOSH
extraerDatosNIOSH() {
    const datos = {};
    
    try {
        // Datos de entrada
        datos.peso_objeto = this.obtenerValorElemento('weight');
        datos.distancia_h_origen = this.obtenerValorElemento('h1');
        datos.altura_v_origen = this.obtenerValorElemento('v1');
        datos.angulo_asimetria_origen = this.obtenerValorElemento('a1');
        datos.distancia_h_destino = this.obtenerValorElemento('h2');
        datos.altura_v_destino = this.obtenerValorElemento('v2');
        datos.angulo_asimetria_destino = this.obtenerValorElemento('a2');
        datos.frecuencia = this.obtenerValorElemento('frequency');
        datos.duracion = this.obtenerValorElemento('duration');
        datos.calidad_agarre = this.obtenerValorElemento('grip');

        // Multiplicadores (calcular si no están disponibles)
        datos.multiplicador_horizontal = this.calcularMultiplicadorHorizontal(datos.distancia_h_origen, datos.distancia_h_destino);
        datos.multiplicador_vertical = this.calcularMultiplicadorVertical(datos.altura_v_origen, datos.altura_v_destino);
        datos.multiplicador_distancia = this.calcularMultiplicadorDistancia(datos.altura_v_origen, datos.altura_v_destino);
        datos.multiplicador_asimetria = this.calcularMultiplicadorAsimetria(datos.angulo_asimetria_origen, datos.angulo_asimetria_destino);
        datos.multiplicador_frecuencia = this.calcularMultiplicadorFrecuencia(datos.frecuencia, datos.duracion);
        datos.multiplicador_agarre = this.calcularMultiplicadorAgarre(datos.calidad_agarre);

        // Calcular RWL y LI
        const LC = 23; // Constante de carga
        datos.rwl = LC * datos.multiplicador_horizontal * datos.multiplicador_vertical * 
                   datos.multiplicador_distancia * datos.multiplicador_asimetria * 
                   datos.multiplicador_frecuencia * datos.multiplicador_agarre;
        datos.indice_levantamiento = datos.peso_objeto / datos.rwl;
        
        // Determinar nivel de riesgo
        if (datos.indice_levantamiento <= 1.0) {
            datos.nivel_riesgo = 'BAJO RIESGO';
        } else if (datos.indice_levantamiento <= 3.0) {
            datos.nivel_riesgo = 'RIESGO MODERADO';
        } else {
            datos.nivel_riesgo = 'ALTO RIESGO';
        }

        return datos;
    } catch (error) {
        console.error('Error extrayendo datos NIOSH:', error);
        return null;
    }
},

    // Funciones auxiliares para extraer valores
    obtenerValorRadio(name) {
        const radio = document.querySelector(`input[name="${name}"]:checked`);
        return radio ? parseInt(radio.value) || radio.value : null;
    },

    obtenerValorElemento(id, parseFloat = false) {
        const elemento = document.getElementById(id);
        if (!elemento) return null;
        
        const valor = elemento.value || elemento.textContent;
        return parseFloat ? parseFloat(valor) || null : parseInt(valor) || valor;
    },

    obtenerTextoElemento(id) {
        const elemento = document.getElementById(id);
        return elemento ? elemento.textContent.trim() : null;
    },

    extraerTarea() {
        return document.getElementById('tarea')?.value || 
               document.querySelector('input[id*="tarea"]')?.value || 
               'Evaluación específica';
    },

    extraerNumeroTrabajadores() {
        return parseInt(document.getElementById('trabajadores')?.value) || 1;
    },

    // Actualizar score en tabla resumen
    async actualizarScoreResumen(contexto, datosEvaluacion) {
        try {
            let scoreValue = 0;
            let categoria = 'Evaluado';
            
            // Determinar score según tipo de evaluación
            if (datosEvaluacion.score_final) {
                scoreValue = parseFloat(datosEvaluacion.score_final);
                categoria = this.determinarCategoriaRiesgo(scoreValue, contexto.tipo);
            } else if (datosEvaluacion.indice_ocra) {
                scoreValue = parseFloat(datosEvaluacion.indice_ocra) * 10; // Normalizar a 100
                categoria = this.determinarCategoriaRiesgo(scoreValue, 'OCRA');
            } else if (datosEvaluacion.indice_levantamiento) {
                scoreValue = parseFloat(datosEvaluacion.indice_levantamiento) * 25; // Normalizar a 100
                categoria = this.determinarCategoriaRiesgo(scoreValue, 'NIOSH');
            }

            const scoreData = {
                score: scoreValue,
                categoria: categoria,
                color: ERGOUtils.getScoreColor(scoreValue)
            };

            await supabase.actualizarScoreResumen(
                contexto.workCenterId, 
                contexto.areaId, 
                scoreData
            );

        } catch (error) {
            console.error('Error actualizando score resumen:', error);
        }
    },

    // Determinar categoría de riesgo normalizada
    determinarCategoriaRiesgo(score, tipo) {
        switch (tipo) {
            case 'REBA':
            case 'RULA':
                if (score <= 2) return 'Riesgo Bajo';
                if (score <= 4) return 'Riesgo Medio';
                if (score <= 7) return 'Riesgo Alto';
                return 'Riesgo Muy Alto';
            
            case 'OCRA':
                if (score <= 22) return 'Aceptable';
                if (score <= 35) return 'Dudoso';
                if (score <= 90) return 'Inaceptable Leve';
                return 'Inaceptable Alto';
            
            case 'NIOSH':
                if (score <= 25) return 'Bajo Riesgo';
                if (score <= 75) return 'Riesgo Moderado';
                return 'Alto Riesgo';
            
            default:
                return 'Evaluado';
        }
    },

    // Ver evaluaciones guardadas
    verEvaluaciones() {
        const contexto = this.obtenerContextoEvaluacion();
        if (contexto.workCenterId) {
            window.location.href = `centro-trabajo.html?workCenter=${contexto.workCenterId}&area=${contexto.areaId}&areaName=${encodeURIComponent(contexto.areaName)}&centerName=${encodeURIComponent(contexto.centerName)}&responsible=${encodeURIComponent(contexto.responsible)}`;
        } else {
            window.location.href = 'areas.html';
        }
    },

                // Funciones auxiliares para cálculos NIOSH
        calcularMultiplicadorHorizontal(h1, h2) {
            const hMax = Math.max(h1, h2);
            return Math.min(25 / hMax, 1);
        },

        calcularMultiplicadorVertical(v1, v2) {
            const vm1 = 1 - (0.003 * Math.abs(v1 - 75));
            const vm2 = 1 - (0.003 * Math.abs(v2 - 75));
            return Math.min(vm1, vm2);
        },

        calcularMultiplicadorDistancia(v1, v2) {
            const D = Math.abs(v2 - v1);
            return D < 25 ? 1 : (0.82 + (4.5 / D));
        },

        calcularMultiplicadorAsimetria(a1, a2) {
            const am1 = 1 - (0.0032 * a1);
            const am2 = 1 - (0.0032 * a2);
            return Math.min(am1, am2);
        },

        calcularMultiplicadorFrecuencia(frecuencia, duracion) {
            // Tabla simplificada de factores de frecuencia
            const tabla = {
                1: { 0.2: 1.00, 0.5: 0.97, 1: 0.94, 2: 0.91, 3: 0.88, 4: 0.84, 5: 0.80, 999: 0.75 },
                2: { 0.2: 0.95, 0.5: 0.92, 1: 0.88, 2: 0.84, 3: 0.79, 4: 0.72, 5: 0.60, 999: 0.50 },
                8: { 0.2: 0.85, 0.5: 0.81, 1: 0.75, 2: 0.65, 3: 0.55, 4: 0.45, 5: 0.35, 999: 0.30 }
            };
            
            const duracionTabla = tabla[duracion] || tabla[8];
            if (frecuencia <= 0.2) return duracionTabla[0.2];
            if (frecuencia <= 0.5) return duracionTabla[0.5];
            if (frecuencia <= 1) return duracionTabla[1];
            if (frecuencia <= 2) return duracionTabla[2];
            if (frecuencia <= 3) return duracionTabla[3];
            if (frecuencia <= 4) return duracionTabla[4];
            if (frecuencia <= 5) return duracionTabla[5];
            return duracionTabla[999];
        },

    // Inicializar módulo

init(containerId = null) {
    console.log('🔧 Inicializando ERGOEvaluacionesEspecificas');
    
    // --- MODIFICACIÓN ---
    // Se ha eliminado la verificación de sesión de esta parte para asegurar
    // que los botones de guardar/ver siempre sean visibles.
    // La lógica de verificación se mantiene dentro de la función de guardado
    // para que el usuario deba iniciar sesión para USAR el botón, pero no para VERLO.

    // Crear botón si no existe en la página
    if (!document.getElementById('ergo-save-container')) {
        this.crearBotonGuardar(containerId);
    }

    console.log('✅ ERGOEvaluacionesEspecificas inicializado y botones visibles.');
}

};

// Auto-inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para asegurar que otros scripts se hayan cargado
    setTimeout(() => {
        if (window.ERGOAuth && window.supabase) {
            ERGOEvaluacionesEspecificas.init();
        }
    }, 500);
});

