/**
 * =========================================================================
 * ARCHIVO: routes/admin.js
 * FUNCIÓN: Controla todas las rutas exclusivas del panel de administrador.
 * Permite obtener estadísticas globales, moderar recetas, listar usuarios
 * y cambiar sus roles o eliminarlos.
 * =========================================================================
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Obtener todos los usuarios
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre, email, rol, plan_activo, created_at FROM usuarios ORDER BY created_at DESC');
        res.json({ ok: true, users: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de tiendas
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Total de usuarios
        const [usersRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
        
        // Total de planes generados
        const [planesRows] = await db.query('SELECT COUNT(*) as total FROM planes_semana');
        
        // Productos por tienda
        const [productosRows] = await db.query(`
            SELECT t.nombre as tienda, COUNT(p.id) as total_productos 
            FROM tiendas t 
            LEFT JOIN productos_tienda p ON t.id = p.tienda_id 
            GROUP BY t.id
        `);

        // Top productos caros y baratos
        const [topExpensive] = await db.query('SELECT nombre, precio FROM productos_tienda ORDER BY precio DESC LIMIT 5');
        const [topCheap] = await db.query('SELECT nombre, precio FROM productos_tienda ORDER BY precio ASC LIMIT 5');

        res.json({ 
            ok: true, 
            stats: {
                totalUsuarios: usersRows[0].total,
                totalPlanes: planesRows[0].total,
                productosPorTienda: productosRows,
                topExpensive,
                topCheap
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar un usuario
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cambiar rol de usuario
router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;
        await db.query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener todas las recetas (para moderación)
router.get('/recetas', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, u.nombre as autor 
            FROM recetas r 
            JOIN usuarios u ON r.usuario_id = u.id 
            ORDER BY r.created_at DESC
        `);
        res.json({ ok: true, recetas: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
