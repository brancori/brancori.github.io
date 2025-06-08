const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data.json');

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar archivo si no existe
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ areas: [], puestos: {} }, null, 2));
}

// GET todas las áreas
app.get('/api/areas', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  res.json(data.areas);
});

// POST nueva área
app.post('/api/areas', (req, res) => {
  const { nombre, responsable } = req.body;
  const id = 'area_' + Date.now();

  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  const nuevaArea = { id, nombre, responsable };
  data.areas.push(nuevaArea);
  data.puestos[id] = [];

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.json(nuevaArea);
});

// GET puestos por área
app.get('/api/puestos/:areaId', (req, res) => {
  const { areaId } = req.params;
  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  res.json(data.puestos[areaId] || []);
});

// POST nuevo puesto en un área
app.post('/api/puestos/:areaId', (req, res) => {
  const { areaId } = req.params;
  const nuevoPuesto = req.body;

  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  if (!data.puestos[areaId]) {
    return res.status(404).json({ error: 'Área no encontrada' });
  }

  nuevoPuesto.id = 'puesto_' + Date.now();
  data.puestos[areaId].push(nuevoPuesto);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

  res.json(nuevoPuesto);
});
// DELETE área
app.delete('/api/areas', (req, res) => {
  const { id } = req.body;
  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  data.areas = data.areas.filter(a => a.id !== id);
  delete data.puestos[id];
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.json({ success: true });
});
app.post('/api/evaluacion/:puestoId', (req, res) => {
  const { puestoId } = req.params;
  const evaluacion = req.body;

  const data = JSON.parse(fs.readFileSync(DATA_PATH));

  // Guardamos dentro del puesto
  for (const areaId in data.puestos) {
    const index = data.puestos[areaId].findIndex(p => p.id === puestoId);
    if (index !== -1) {
      data.puestos[areaId][index].evaluacion = evaluacion;
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
      return res.json({ success: true });
    }
  }

  res.status(404).json({ error: 'Puesto no encontrado' });
});

// Endpoint para obtener la versión desde version.txt
app.get('/version', (req, res) => {
  fs.readFile('version.txt', 'utf8', (err, data) => {
    if (err) return res.status(500).send('0.0.0');
    res.send(data);
  });
});

// Endpoint oculto de administración
app.get('/admin-info', (req, res) => {
  const version = fs.existsSync('version.txt') ? fs.readFileSync('version.txt', 'utf8').trim() : '0.0.0';
  const changelog = fs.existsSync('CHANGELOG.txt') ? fs.readFileSync('CHANGELOG.txt', 'utf8') : 'Sin historial disponible';
  const updateStats = fs.existsSync('update.json') ? fs.statSync('update.json') : null;
  const updated = updateStats ? new Date(updateStats.mtime).toLocaleString() : 'Fecha no disponible';

  res.json({ version, updated, changelog });
});
app.get('/api/dashboard', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  const resumen = [];

  for (const area of data.areas) {
    const puestos = data.puestos[area.id] || [];
    let puestosConRiesgo = 0;

    puestos.forEach(p => {
      if (!p.evaluacion) return;

      const secciones = ["manipulaCargas", "mantienePosturas", "usaPantallas", "usaHerramientas"];
      for (const clave of secciones) {
        const respuestas = p.evaluacion[clave]?.respuestas || [];
        if (respuestas.length === 0) continue;
        const positivas = respuestas.filter(r => r === true).length;
        const porcentaje = (positivas / respuestas.length) * 100;

        const umbral = {
          manipulaCargas: 60,
          mantienePosturas: 70,
          usaPantallas: 60,
          usaHerramientas: 60
        };

        if (porcentaje < umbral[clave]) {
          puestosConRiesgo++;
          break; // si ya tiene una bandera roja, no seguimos
        }
      }
    });

    resumen.push({
      nombre: area.nombre,
      total: puestos.length,
      riesgo: puestosConRiesgo
    });
  }

  res.json(resumen);
});
app.get('/api/ultima-evaluacion', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  let fechas = [];

  for (const puestos of Object.values(data.puestos)) {
    puestos.forEach(p => {
      if (p.evaluacion?.fecha) {
        fechas.push(new Date(p.evaluacion.fecha));
      }
    });
  }

  if (fechas.length === 0) return res.json({ fecha: '-' });

  const masReciente = new Date(Math.max(...fechas));
  const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  res.json({ fecha: masReciente.toLocaleString('es-MX', opciones) });
});
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});


