/**
 * =========================================================================
 * ARCHIVO: authMiddleware.js
 * FUNCIÓN: "Guardián" o filtro de seguridad.
 * Intercepta las peticiones que llegan al backend para verificar si el 
 * usuario tiene un Token JWT válido (ha iniciado sesión) y si tiene los
 * permisos necesarios (como rol de 'admin') antes de dejarlo pasar a la ruta.
 * =========================================================================
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretplancomer';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado. Se requiere token.' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, rol, nombre }
    next();
  } catch(e) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
}

module.exports = { authMiddleware, adminMiddleware };
