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

  async function cargarEvaluacion(actividadId) {
  if (!actividadId) return;

  const { data, error } = await dataClient.supabase
    .from('actividades')
    .select('datos_analisis')
    .eq('id', actividadId)
    .single();

  if (error || !data?.datos_analisis) return;

  const evalData = data.datos_analisis;

  // --- Rellenar info general ---
  if (evalData.infoGeneral) {
    document.getElementById('job').value = evalData.infoGeneral.job || '';
    document.getElementById('company').value = evalData.infoGeneral.company || '';
    document.getElementById('location').value = evalData.infoGeneral.location || '';
    document.getElementById('Employees').value = evalData.infoGeneral.employees || 0;
    document.getElementById('nAnalyst').value = evalData.infoGeneral.analyst || '';
  }

  // --- Rellenar detalles ---
  const detalles = evalData.detalles || [];
  detalles.forEach(det => {
    const card = [...document.querySelectorAll('.container-evaluation')]
      .find(c => (c.querySelector('.evaluation-title')?.textContent || '') === det.factor);

    if (card) {
      const scoreEl = card.querySelector('.selected-score');
      if (scoreEl) scoreEl.textContent = det.puntaje;
      
      // Marcar el checkbox correspondiente
      const checkboxes = card.querySelectorAll('.score-indicators input[type="checkbox"]');
      checkboxes.forEach(chk => {
        const label = chk.parentElement.querySelector('label');
        if (label && label.textContent === det.puntaje) {
          chk.checked = true;
          chk.dispatchEvent(new Event('change'));
        }
      });
    }
  });
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
    const actividadId = params.get('actividadId') || params.get('actividad') || '';

    const saveBtn = document.getElementById('save-button');
    if (!saveBtn) {
      console.warn('johnson-eval.js: No existe #save-button');
      return;
    }


    saveBtn.addEventListener('click', async () => {
  try {

    if (!workCenterId || !areaId || !actividadId) {
      window.ERGOUtils?.showToast?.('Faltan parámetros: area/workCenter/actividadId en la URL', 'error');
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
      items,
      tot: { raw, norm },
      meta: { job, company, location, employees, analyst },
      method: 'JOHNSON'
    };

    // 5) Score/categoría/color
    const categoria_riesgo = classifyRisk(norm);
    const color_riesgo = window.ERGOUtils?.getScoreColor ? ERGOUtils.getScoreColor(norm) : '#fd7e14';

    // 6) Guardar en ACTIVIDADES (NO en evaluaciones / scores_resumen)
    const evaluacionData = {
      infoGeneral: { job, company, location, employees, analyst },
      resumen: {
        puntajeRiesgo: document.getElementById('job-risk-score')?.textContent || String(raw),
        nivelRiesgo: document.getElementById('risk-level-text')?.textContent || `(Riesgo ${categoria_riesgo})`,
        puntajeTotal: document.getElementById('total-job-score')?.textContent || String((raw || 0) * (employees || 0))
      },
      detalles: Array.from(document.querySelectorAll('.container-evaluation')).map(t => ({
        factor: t.querySelector('.evaluation-title')?.textContent || '',
        puntaje: t.querySelector('.selected-score')?.textContent || '-'
      }))
    };

    await dataClient.updateActividad(actividadId, { datos_analisis: evaluacionData });

    window.ERGOUtils?.showToast?.('Evaluación Johnson guardada');

window.ERGOUtils?.showToast?.('Evaluación guardada con éxito', 'success');

  } catch (err) {
    console.error('johnson-eval.js: error guardando evaluación', err);
    window.ERGOUtils?.showToast?.('Error al guardar la evaluación', 'error');
  }
}, { once: true });
if (actividadId) {
  cargarEvaluacion(actividadId);
}  
});
})();
