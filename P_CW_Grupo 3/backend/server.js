/**
 * =========================================================================
 * ARCHIVO: server.js
 * FUNCIÓN: Archivo principal del Backend. Inicia el servidor Express, 
 * configura los middlewares (como CORS y JSON) y define todas las rutas 
 * de la API (ej: /api/auth, /api/recetas) conectándolas con los archivos
 * de la carpeta 'routes'.
 * =========================================================================
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/recetas', require('./routes/recetas'));
app.use('/api/plan',    require('./routes/plan'));
app.use('/api/compras', require('./routes/compras'));
app.use('/api/precios', require('./routes/precios'));
app.use('/api/admin',   require('./routes/admin'));
app.use('/api',         require('./routes/ia'));

app.listen(process.env.PORT || 3001, () => {
  console.log('Backend PlanComer corriendo en http://localhost:3001');
});
