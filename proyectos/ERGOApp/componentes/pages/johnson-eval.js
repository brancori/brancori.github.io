// componentes/pages/johnson-eval.js
(function () {
  // --- Helpers ---
  function uuidv4() {
    if (window.crypto?.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Robustecer lectura de token desde sessionStorage
  function getStoredToken() {
    const raw = sessionStorage.getItem('sessionToken');
    if (!raw) return null;
    try {
      // si lo guardaste como string JSON ("eyJhbGci..."), parsea;
      // si ya es plano (eyJhbGci...), devuélvelo tal cual
      return raw[0] === '"' ? JSON.parse(raw) : raw;
    } catch {
      return raw;
    }
  }

  function ensureAuthContextForThisPage() {
    // 1) Usa tu inicializador si está disponible (inyecta token a dataClient/supabase)
    if (window.ERGOAuth?.initializeAuthContext) {
      const ok = window.ERGOAuth.initializeAuthContext();
      if (ok) return true;
    }
    // 2) Fallback súper conservador: setAuth directo usando el token guardado
    const token = getStoredToken();
    if (token && window.dataClient?.setAuth) {
      try {
        window.dataClient.setAuth(token);
        // también inyecta sesión al cliente de supabase (rpc/edge)
        window.dataClient?.supabase?.auth?.setSession?.({
          access_token: token,
          refresh_token: ''
        });
        return true;
      } catch (e) {
        console.warn('No pude inyectar sesión de forma manual:', e);
      }
    }
    return false;
  }

  // Suma el puntaje seleccionado en cada tarjeta y calcula normalización 0..100
  function calcMaxForCard(card) {
    const labels = card.querySelectorAll('.score-indicators > div label');
    let max = 0;
    labels.forEach(l => {
      const v = parseFloat((l.textContent || '').trim());
      if (!isNaN(v)) max = Math.max(max, v);
    });
    return max;
  }

  function collectItemsAndTotals() {
    const cards = document.querySelectorAll('.container-evaluation');
    const items = [];
    let raw = 0;
    let maxSum = 0;

    cards.forEach((card, idx) => {
      const title = card.querySelector('.evaluation-title')?.textContent || '';
      const match = title.match(/^(\d+)\./);
      const qNum = match ? match[1] : (idx + 1);
      const sTxt = (card.querySelector('.selected-score')?.textContent || '').trim();
      const sVal = parseFloat(sTxt);
      const val = isNaN(sVal) ? 0 : sVal;

      items.push([`Q${qNum}`, val]);
      raw += val;
      maxSum += calcMaxForCard(card);
    });

    const norm = maxSum > 0 ? Math.min(100, (raw / maxSum) * 100) : 0;
    return { items, raw, norm };
  }

  function classifyRisk(score) {
    if (score <= 25) return 'Bajo';
    if (score <= 60) return 'Moderado';
    if (score <= 75) return 'Alto';
    return 'Crítico';
  }

  document.addEventListener('DOMContentLoaded', () => {
    // 0) Validar sesión y, sobre todo, INYECTAR TOKEN AL CLIENTE
    const hasAuth = ensureAuthContextForThisPage();
    if (!hasAuth) {
      // si no hay token o no se pudo inyectar, redirige como en tu flujo
      window.ERGOAuth?.redirectToLogin?.();
      return;
    }

    // 1) Parámetros mandados desde centro-trabajo
    const params = new URLSearchParams(location.search);
    const workCenterId = params.get('workCenter') || params.get('work_center_id') || '';
    const areaId = params.get('area') || params.get('area_id') || '';

    const saveBtn = document.getElementById('save-button');
    if (!saveBtn) {
      console.warn('johnson-eval.js: No existe #save-button');
      return;
    }

    saveBtn.addEventListener('click', async () => {
      try {
        window.ERGOAuth?.updateActivity?.();

        if (!workCenterId || !areaId) {
          window.ERGOUtils?.showToast?.('Faltan parámetros: area/workCenter en la URL', 'error');
          return;
        }

        // 2) Leer UI → items/raw/norm
        const { items, raw, norm } = collectItemsAndTotals();

        // 3) Metadatos del header
        const job       = (document.getElementById('job')?.value || '').trim();
        const company   = (document.getElementById('company')?.value || '').trim();
        const location  = (document.getElementById('location')?.value || '').trim();
        const employees = parseInt(document.getElementById('Employees')?.value, 10) || 0;
        const analyst   = (document.getElementById('nAnalyst')?.value || '').trim();

        // 4) JSON compacto en "respuestas"
        const respuestas = {
          v: 1,
          items,                       // [["Q1",2], ["Q2",1], ...]
          tot: { raw, norm },          // totales
          meta: { job, company, location, employees, analyst },
          method: 'JOHNSON'
        };

        // 5) Score/categoría/color
        const categoria_riesgo = classifyRisk(norm);
        const color_riesgo = window.ERGOUtils?.getScoreColor ? ERGOUtils.getScoreColor(norm) : '#fd7e14';

        // 6) Payload para public.evaluaciones (¡con id!)
        const payload = {
          id: uuidv4(),                       // <- evita el NOT NULL de tu tabla
          work_center_id: workCenterId,
          area_id: areaId,
          score_final: norm,
          categoria_riesgo,
          color_riesgo,
          respuestas,
          riesgos_por_categoria: { johnson_total: raw },
          created_at: new Date().toISOString()
        };

        // 7) Guardar (una sola llamada)
        await dataClient.createEvaluacion(payload);

        // Actualizar resumen del centro (si RLS lo permite)
try {
  await dataClient.updateScoreWorkCenter(workCenterId, areaId, {
    score: norm,
    categoria: categoria_riesgo,
    color: color_riesgo
  });
} catch (e) {
  console.warn('No se pudo actualizar scores_resumen (RLS o permisos). La evaluación sí fue guardada.', e);
}


        // 8) Actualizar resumen del centro (ahora con token ya inyectado)
        await dataClient.updateScoreWorkCenter(workCenterId, areaId, {
          score: norm,
          categoria: categoria_riesgo,
          color: color_riesgo
        });

        window.ERGOUtils?.showToast?.('Evaluación Johnson guardada');

        // 9) Volver al centro de trabajo
        const back = ERGONavigation.buildUrl('../../centro-trabajo/centro-trabajo.html', {
          workCenter: workCenterId,
          area: areaId
        });
        window.location.href = back;

      } catch (err) {
        console.error('johnson-eval.js: error guardando evaluación', err);
        window.ERGOUtils?.showToast?.('Error al guardar la evaluación', 'error');
      }
    }, { once: true });
  });
})();
