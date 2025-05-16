document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const areaId = params.get('areaId');

  const areaNombre = document.getElementById('areaNombre');
  const areaResponsable = document.getElementById('areaResponsable');
  const puestosGrid = document.getElementById('puestosGrid');
  const modal = document.getElementById('modal');
  const form = document.getElementById('formPuesto');

  document.getElementById('nuevoPuestoBtn').onclick = () => {
    modal.style.display = 'flex';
  };

  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };

  function cargarArea() {
    fetch('/api/areas')
      .then(res => res.json())
      .then(areas => {
        const area = areas.find(a => a.id === areaId);
        if (!area) return alert("Área no encontrada.");
        areaNombre.textContent = area.nombre;
        areaResponsable.textContent = area.responsable;
      });
  }

  function cargarPuestos() {
    fetch(`/api/puestos/${areaId}`)
      .then(res => res.json())
      .then(puestos => {
        puestosGrid.innerHTML = '';
        puestos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'puesto-card';
        if (p.evaluacion) {
          div.style.backgroundColor = '#eaf4fc'; // azul tenue para evaluado
        }

        let botonAccion = `<button onclick="window.location.href='/componentes/formulario.html?puestoId=${p.id}&areaId=${areaId}'">📋 Evaluar</button>`;
        let botonVer = '';

        if (p.evaluacion) {
          botonAccion = `<button onclick="window.location.href='/componentes/formulario.html?puestoId=${p.id}&areaId=${areaId}'">✏️ Editar</button>`;
          botonVer = `<button onclick="window.location.href='ver-evaluacion.html?puestoId=${p.id}&areaId=${areaId}'">👁 Ver</button>`;
        }

        div.innerHTML = `
          <div class="puesto-id">ID: ${p.id}</div>
          <strong>${p.puesto}</strong>
          <p>Evaluador: ${p.evaluador}</p>
          <p>Ubicación: ${p.ubicacion}</p>
          <p>Turno: ${p.turno}</p>
          ${botonAccion}
          ${botonVer}
        `;
          puestosGrid.appendChild(div);
        });
      });
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form).entries());

    fetch(`/api/puestos/${areaId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
      .then(res => res.json())
      .then(() => {
        modal.style.display = 'none';
        form.reset();
        cargarPuestos();
      });
  };

  cargarArea();
  cargarPuestos();
});
function verResumen(puestoId) {
  alert(`(Próximamente) Aquí mostrarás un resumen o PDF de: ${puestoId}`);
}
