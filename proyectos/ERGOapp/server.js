const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data.json');

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
