document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const puestoId = params.get('puestoId');
  const areaId = params.get('areaId');

  document.getElementById('puestoId').textContent = puestoId;
  document.getElementById('btnVolver').href = `puestos.html?areaId=${areaId}`;
  document.getElementById('btnEditar').onclick = () => {
    window.location.href = `formulario.html?puestoId=${puestoId}&areaId=${areaId}`;
  };

  const contenedor = document.getElementById('contenedorPreguntas');

  const [areaData, puestosRes, preguntasRes] = await Promise.all([
    fetch('/api/areas').then(r => r.json()),
    fetch(`/api/puestos/${areaId}`).then(r => r.json()),
    fetch('assets/preguntas.json').then(r => r.json())
  ]);

  const area = areaData.find(a => a.id === areaId);
  const puesto = puestosRes.find(p => p.id === puestoId);

  if (area) {
    document.getElementById('areaNombre').textContent = area.nombre;
    document.getElementById('responsableArea').textContent = area.responsable;
  }

  if (!puesto || !puesto.evaluacion) {
    contenedor.innerHTML = "<p>No hay evaluación guardada para este puesto.</p>";
    return;
  }

  const respuestas = puesto.evaluacion.respuestas || {};
  const evidencias = puesto.evaluacion.evidencias || {};
  const preguntas = [
    ...preguntasRes.generales.map((text, i) => ({ text, id: `general_${i}` })),
    ...Object.entries(preguntasRes.condicionales).flatMap(([clave, lista]) =>
      lista.map((text, i) => ({ text, id: `${clave}_${i}` }))
    )
  ];

  preguntas.forEach(p => {
    const div = document.createElement('div');
    div.className = 'pregunta-preview';

    const titulo = document.createElement('p');
    titulo.innerHTML = `<strong>${p.text}</strong><br><small>Respuesta: ${respuestas[p.id] || '—'}</small>`;

    div.appendChild(titulo);

    if (evidencias[`evidencia_${p.id}`]) {
      const img = document.createElement('img');
      img.src = evidencias[`evidencia_${p.id}`];
      img.className = 'miniatura';
      img.onclick = () => verImagenGrande(img.src);
      div.appendChild(img);
    }

    contenedor.appendChild(div);
  });

  document.getElementById('btnExportar').onclick = () => exportarPDF(area, puesto, preguntas, respuestas, evidencias);
});

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

async function exportarPDF(area, puesto, preguntas, respuestas, evidencias) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ format: "letter", unit: "mm" }); // tamaño carta

  let y = 10;

  // Encabezado
  doc.setFontSize(16);
  doc.text(`Evaluación Ergonómica`, 10, y);
  y += 8;

  doc.setFontSize(10);
  const encabezado = [
    `Área: ${area.nombre}`,
    `Responsable: ${area.responsable}`,
    `Puesto ID: ${puesto.id}`,
    `Evaluador: ${puesto.evaluador || '—'}`,
    `Puesto Observado: ${puesto.puesto || '—'}`,
    `Ubicación: ${puesto.ubicacion || '—'}`,
    `Turno: ${puesto.turno || '—'}`,
    `¿Rotación?: ${puesto.rotacion || '—'}`,
    `¿Documentado?: ${puesto.documentado || '—'}`,
    `No. trabajadores: ${puesto.trabajadores || '—'}`,
    `Tareas: ${puesto.tareas || '—'}`,
    `Trabajador presente: ${puesto.presente || '—'}`,
    `Fecha de evaluación: ${(puesto.evaluacion?.fecha || '').split('T')[0]}`
  ];

  encabezado.forEach(line => {
    doc.text(line, 10, y);
    y += 6;
  });

  y += 4;

  // Preguntas con respuestas e imágenes
  for (let i = 0; i < preguntas.length; i++) {
    const p = preguntas[i];
    const respuesta = respuestas[p.id] || '—';

    const preguntaTxt = `${i + 1}. ${p.text}`;
    const respTxt = `Respuesta: ${respuesta}`;

    const preguntaLines = doc.splitTextToSize(preguntaTxt, 190);
    if (y + preguntaLines.length * 6 >= 260) {
      doc.addPage();
      y = 10;
    }

    doc.setFontSize(11);
    preguntaLines.forEach(line => {
      doc.text(line, 10, y);
      y += 6;
    });

    doc.setFontSize(10);
    doc.text(respTxt, 10, y);
    y += 8;

    const imagen = evidencias[`evidencia_${p.id}`];
    if (imagen) {
      const imgProps = doc.getImageProperties(imagen);
      const pageWidth = 190;
      const ratio = pageWidth / imgProps.width;
      const imgHeight = imgProps.height * ratio;

      if (y + imgHeight >= 270) {
        doc.addPage();
        y = 10;
      }

      doc.addImage(imagen, 'PNG', 10, y, pageWidth, imgHeight);
      y += imgHeight + 10;
    }
  }

  doc.save(`evaluacion_${puesto.id}.pdf`);
}

