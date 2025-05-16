document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const puestoId = params.get('puestoId');
    Object.keys(localStorage).forEach(k => {
    if (k.startsWith('evidencia_') && !k.includes(puestoId)) {
      localStorage.removeItem(k);
    }
  });

  const areaId = params.get('areaId');

  document.getElementById('btnVolver').href = `puestos.html?areaId=${areaId}`;

  async function cargarArea() {
    const res = await fetch('/api/areas');
    const areas = await res.json();
    const area = areas.find(a => a.id === areaId);
    if (area) {
      document.getElementById('areaNombre').textContent = area.nombre;
      document.getElementById('responsableArea').textContent = area.responsable;
    }
  }

  async function cargarRespuestas() {
    const res = await fetch(`/api/puestos/${areaId}`);
    const puestos = await res.json();
    const puesto = puestos.find(p => p.id === puestoId);
    if (!puesto || !puesto.evaluacion) return;

    const respuestas = puesto.evaluacion.respuestas || {};
    Object.entries(respuestas).forEach(([name, value]) => {
      const input = document.querySelector(`[name="${name}"][value="${value}"]`);
      if (input) input.checked = true;
    });

    const evidencias = puesto.evaluacion.evidencias || {};
    Object.entries(evidencias).forEach(([key, imgData]) => {
      const id = key.replace(`evidencia_${puestoId}_`, '');
      const contenedor = document.querySelector(`[name="${id}"]`)?.closest('.pregunta');
      if (contenedor) {
        const mini = document.createElement('img');
        mini.src = imgData;
        mini.className = 'miniatura';
        mini.onclick = () => verImagenGrande(imgData);
        contenedor.appendChild(mini);
      }

      // guardar en localStorage para mantener consistencia si editan
      localStorage.setItem(key, imgData);
    });
  }

  await cargarArea();

  // Cargar preguntas del archivo
  const res = await fetch('assets/preguntas.json');
  const data = await res.json();

  const form = document.getElementById('formEvaluacion');

  // Render preguntas generales
  const generales = document.createElement('section');
  generales.innerHTML = `<h3>Preguntas Generales</h3>`;
  data.generales.forEach((pregunta, index) => {
    generales.appendChild(crearPregunta(pregunta, `general_${index}`));
  });
  form.insertBefore(generales, document.getElementById('evidencias'));

  // Render condicionales con checkboxes
  const condicionalesContainer = document.createElement('section');
  condicionalesContainer.innerHTML = `<h3>Secciones Condicionales</h3>`;
  Object.entries(data.condicionales).forEach(([clave, preguntas]) => {
    const contenedor = document.createElement('div');
    contenedor.className = 'bloque-condicional';

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.id = `check_${clave}`;
    toggle.dataset.target = `seccion_${clave}`;

    const labelToggle = document.createElement('label');
    labelToggle.htmlFor = toggle.id;
    labelToggle.textContent = `¿${clave.replace(/([A-Z])/g, ' $1').toUpperCase()}?`;
    labelToggle.style.fontWeight = 'bold';

    const seccion = document.createElement('div');
    seccion.id = `seccion_${clave}`;
    seccion.style.display = 'none';

    preguntas.forEach((preg, i) => {
      seccion.appendChild(crearPregunta(preg, `${clave}_${i}`));
    });

    toggle.addEventListener('change', () => {
      seccion.style.display = toggle.checked ? 'block' : 'none';
    });

    contenedor.appendChild(toggle);
    contenedor.appendChild(labelToggle);
    contenedor.appendChild(seccion);
    condicionalesContainer.appendChild(contenedor);
  });

  form.insertBefore(condicionalesContainer, document.getElementById('evidencias'));

  // Función para crear una pregunta con sí/no y botón de evidencia
  function crearPregunta(texto, name) {
    const div = document.createElement('div');
    div.className = 'pregunta';

    const label = document.createElement('label');
    label.textContent = texto;

    const grupo = document.createElement('div');
    grupo.className = 'respuestas';

    const si = document.createElement('input');
    si.type = 'radio';
    si.name = name;
    si.value = 'Sí';
    si.id = `${name}_si`;

    const no = document.createElement('input');
    no.type = 'radio';
    no.name = name;
    no.value = 'No';
    no.id = `${name}_no`;

    const labelSi = document.createElement('label');
    labelSi.htmlFor = si.id;
    labelSi.textContent = 'Sí';

    const labelNo = document.createElement('label');
    labelNo.htmlFor = no.id;
    labelNo.textContent = 'No';

    const camBtn = document.createElement('button');
    camBtn.type = 'button';
    camBtn.textContent = '📸 Evidencia';
    camBtn.addEventListener('click', () => capturarEvidencia(name, div));

    grupo.appendChild(si);
    grupo.appendChild(labelSi);
    grupo.appendChild(no);
    grupo.appendChild(labelNo);
    grupo.appendChild(camBtn);

    div.appendChild(label);
    div.appendChild(grupo);
    return div;
  }
  await cargarRespuestas();
  // Función para capturar foto
function capturarEvidencia(id, contenedorPregunta) {
  let currentFacingMode = 'environment'; // predeterminado: trasera

  const overlay = document.createElement('div');
  overlay.className = 'camara-overlay';

  const video = document.createElement('video');
  video.autoplay = true;

  const botonCaptura = document.createElement('button');
  botonCaptura.textContent = '📷 Tomar Foto';
  botonCaptura.className = 'captura-btn';

  const botonCamara = document.createElement('button');
  botonCamara.textContent = '🔄 Cambiar cámara';
  botonCamara.className = 'cambio-camara-btn';

  overlay.appendChild(video);
  overlay.appendChild(botonCaptura);
  overlay.appendChild(botonCamara);
  document.body.appendChild(overlay);

  let stream;

  async function iniciarCamara() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: currentFacingMode } }
      });
      video.srcObject = stream;
    } catch (err) {
      alert('No se pudo acceder a la cámara.');
      console.error(err);
      overlay.remove();
    }
  }

  botonCamara.onclick = () => {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    iniciarCamara();
  };

  botonCaptura.onclick = () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = localStorage.getItem(`evidencia_${puestoId}_${p.id}`);

    stream.getTracks().forEach(track => track.stop());
    document.body.removeChild(overlay);

    localStorage.setItem(`evidencia_${puestoId}_${id}`, imgData);

    const mini = document.createElement('img');
    mini.src = imgData;
    mini.className = 'miniatura';
    mini.onclick = () => verImagenGrande(imgData);

    contenedorPregunta.querySelectorAll('.miniatura').forEach(el => el.remove());
    contenedorPregunta.appendChild(mini);
  };

  iniciarCamara();
}

function verImagenGrande(src) {
  const visor = document.createElement('div');
  visor.className = 'visor-overlay';
  const img = document.createElement('img');
  img.src = src;
  const cerrar = document.createElement('span');
  cerrar.textContent = '✖';
  cerrar.className = 'cerrar';
  cerrar.onclick = () => visor.remove();

  visor.appendChild(img);
  visor.appendChild(cerrar);
  document.body.appendChild(visor);
}
form.onsubmit = async (e) => {
  e.preventDefault();

  const respuestas = {};
  const formData = new FormData(form);

  for (let [key, value] of formData.entries()) {
    respuestas[key] = value;
  }

  // Agrega las evidencias desde localStorage
  const evidencias = {};
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('evidencia_')) {
      evidencias[key] = localStorage.getItem(key);
    }
  });

  const evaluacion = {
    respuestas,
    evidencias,
    fecha: new Date().toISOString()
  };

  const response = await fetch(`/api/evaluacion/${puestoId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evaluacion)
  });

  if (response.ok) {
    alert('Evaluación guardada exitosamente.');
  } else {
    alert('Error al guardar evaluación.');
  }
};
});

