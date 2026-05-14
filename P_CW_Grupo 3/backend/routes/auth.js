/**
 * =========================================================================
 * ARCHIVO: routes/auth.js
 * FUNCIÓN: Maneja la autenticación de usuarios.
 * Recibe las peticiones para registrar nuevos usuarios, cifrar contraseñas
 * (usando bcrypt), e iniciar sesión devolviendo un Token de seguridad (JWT).
 * =========================================================================
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretplancomer';

router.post('/register', async (req, res) => {
  const { nombre, apellido, email, telefono, direccion, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, apellido, email, telefono, direccion, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, telefono, direccion, hash]
    );
    res.json({ ok: true, message: 'Usuario registrado con éxito', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = rows[0];
    
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ ok: true, token, user: { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre } });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Ruta para obtener mis datos (requiere token, la haremos con un middleware rápido)
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, user: decoded });
  } catch(e) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;