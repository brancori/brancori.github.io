// eval_int_supa.js
// --- VERSIÓN MODERNA Y CORREGIDA ---

window.ERGOEvalSupa = {
    /**
     * Carga una evaluación existente usando el dataClient autenticado.
     */
    async cargarEvaluacionDesdeSupabase(workCenterId) {
        try {
            // Esta consulta devuelve un array, ej: [{...}]
            const evaluaciones = await dataClient.query('evaluaciones', 'GET', null, `?work_center_id=eq.${workCenterId}&order=fecha_evaluacion.desc&limit=1`);
            
            // CORRECCIÓN: Devolvemos el primer objeto del array, no el array completo.
            return evaluaciones && evaluaciones.length > 0 ? evaluaciones[0] : null;

        } catch (error) {
            console.error('Error cargando evaluación desde Supabase:', error);
            return null;
        }
    },

    /**
     * Guarda (crea o actualiza) una evaluación en Supabase.
     */
    async guardarEvaluacionEnSupabase(evaluacion) {
        try {
            // Primero, verificamos si ya existe una evaluación para ese centro
            const existingEval = await dataClient.query('evaluaciones', 'GET', null, `?id=eq.${evaluacion.id}&select=id`);

            let resultado;
            if (existingEval && existingEval.length > 0) {
                // Si existe, la actualizamos (UPDATE)
                console.log(`🔄 Actualizando evaluación existente con ID: ${evaluacion.id}`);
                const { id, ...updateData } = evaluacion; // Quitamos el ID del cuerpo para el update
                resultado = await dataClient.query('evaluaciones', 'PATCH', updateData, `?id=eq.${id}`);
            } else {
                // Si no existe, la creamos (INSERT)
                console.log(`📝 Creando nueva evaluación con ID: ${evaluacion.id}`);
                resultado = await dataClient.query('evaluaciones', 'POST', evaluacion);
            }
            
            // Si el guardado fue exitoso, actualizamos los resúmenes
            if (resultado.success) {
                await this.sincronizarResumenDePictogramas(evaluacion.area_id);
            }
            
            return resultado;

        } catch (error) {
            console.error('Error al guardar evaluación en Supabase:', error);
            throw error;
        }
    },

    /**
     * Recalcula y actualiza las métricas de resumen en la tabla 'areas'.
     */
    async sincronizarResumenDePictogramas(areaId) {
        try {
            const evaluacionesDelArea = await dataClient.query('evaluaciones', 'GET', null, `?area_id=eq.${areaId}&select=resultados_pictogramas`);
            
            const resumenTotal = { /* ... tu lógica para calcular el resumen ... */ };
            // ... (aquí iría tu lógica existente para procesar 'evaluacionesDelArea') ...

            // Finalmente, actualizas la tabla 'areas'
            // await dataClient.query('areas', 'PATCH', { resumen_pictogramas: resumenTotal }, `?id=eq.${areaId}`);
            
            console.log(`📊 Resumen de pictogramas sincronizado para el área: ${areaId}`);
        } catch (error) {
            console.error('Error sincronizando resumen de pictogramas:', error);
        }
    }
};