require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const securityConfig = require('./config/security');
const { User } = require('./config/database');
const fs = require('fs');

const app = express();

// Configuración básica
app.use(express.json());
app.use(cors());

// Aplicar configuraciones de seguridad
securityConfig(app);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

const httpsOptions = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
};

// Rutas básicas
app.get('/', (req, res) => {
    res.json({ message: 'Safety Systems API' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
