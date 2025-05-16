document.addEventListener('DOMContentLoaded', () => {
  const areasGrid = document.getElementById('areasGrid');
  const areaCount = document.getElementById('areaCount');
  const puestosCount = document.getElementById('puestosCount');
  const alertasCount = document.getElementById('alertasCount');
  const modal = document.getElementById('areaModal');
  const nombreInput = document.getElementById('nombreArea');
  const responsableInput = document.getElementById('responsableArea');

  document.querySelector('.add-button').addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  document.getElementById('guardarBtn').addEventListener('click', () => {
    const nombre = nombreInput.value.trim();
    const responsable = responsableInput.value.trim();

    if (!nombre || !responsable) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    fetch('/api/areas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, responsable })
    })
      .then(res => res.json())
      .then(() => {
        modal.style.display = 'none';
        nombreInput.value = '';
        responsableInput.value = '';
        cargarAreas();
        cargarAlertas();
        cargarUltimaEvaluacion();
      });
  });

  function cargarAreas() {
    fetch('/api/areas')
      .then(res => res.json())
      .then(async areas => {
        areasGrid.innerHTML = '';
        areaCount.textContent = areas.length;

        let totalEvaluados = 0;
        puestosCount.textContent = '0';

        // Usar Promise.all para esperar todas las peticiones
        await Promise.all(areas.map(async area => {
          const res = await fetch(`/api/puestos/${area.id}`);
          const puestos = await res.json();
          const evaluados = puestos.filter(p => p.evaluacion).length;
          totalEvaluados += evaluados;

          const tile = document.createElement('div');
          tile.className = 'area-tile';
          tile.innerHTML = `
            <div style="font-size: 0.75em; color: #999;">ID: ${area.id}</div>
            <strong>${area.nombre}</strong><br>
            <small>Responsable: ${area.responsable}</small><br><br>
            <div style="display: flex; justify-content: center; gap: 10px;">
              <button class="enter-btn" onclick="window.location.href='/componentes/puestos.html?areaId=${area.id}'">📂 Entrar</button>
              <button class="delete-btn" onclick="borrarArea('${area.id}')">🗑 Borrar</button>
            </div>
          `;
          areasGrid.appendChild(tile);
        }));

        puestosCount.textContent = totalEvaluados;
      })
      .catch(err => {
        alert('Error al cargar las áreas');
        console.error(err);
      });
  }

  function cargarAlertas() {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        const totalRiesgos = data.reduce((acc, area) => acc + area.riesgo, 0);
        alertasCount.textContent = totalRiesgos;
      });
  }

  window.borrarArea = (id) => {
    const pass = prompt("Introduce la contraseña de administrador para borrar el área:");
    if (pass !== "7563918" && pass !== "1234") {
      alert("Contraseña incorrecta.");
      return;
    }

    fetch('/api/areas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    .then(() => {
      cargarAreas();
      cargarAlertas();
    });
  };

  cargarAreas();
  cargarAlertas();
  function cargarUltimaEvaluacion() {
  fetch('/api/ultima-evaluacion')
    .then(res => res.json())
    .then(data => {
      document.querySelector('.card:nth-child(4) p').textContent = data.fecha;
    });
}
});
