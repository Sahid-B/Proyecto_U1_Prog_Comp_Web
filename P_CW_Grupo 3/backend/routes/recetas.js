/**
 * =========================================================================
 * ARCHIVO: routes/recetas.js
 * FUNCIÓN: Funciona como un CRUD (Crear, Leer, Actualizar, Borrar) para
 * las recetas manuales o editadas por el usuario, guardándolas junto 
 * con sus ingredientes en la base de datos.
 * =========================================================================
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

// Obtener todas las recetas del usuario logueado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM recetas WHERE usuario_id = ? ORDER BY id DESC', [req.user.id]);
        
        // Obtener ingredientes para cada receta
        for (let receta of rows) {
            const [ingRows] = await db.query('SELECT * FROM receta_ingrediente WHERE receta_id = ?', [receta.id]);
            receta.ingredientes = ingRows;
        }

        res.json({ ok: true, recetas: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear una nueva receta con sus ingredientes
router.post('/', authMiddleware, async (req, res) => {
    const { nombre, descripcion, porciones, tiempo_min, categoria, ingredientes } = req.body;
    
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

    try {
        // Iniciar transacción manualmente no es estrictamente necesario aquí si hacemos 2 queries seguidos, 
        // pero vamos a insertar la receta primero
        const [result] = await db.query(
            'INSERT INTO recetas (usuario_id, nombre, descripcion, porciones, tiempo_min, categoria) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, nombre, descripcion || '', porciones || 2, tiempo_min || 30, categoria || 'General']
        );
        
        const recetaId = result.insertId;

        // Insertar ingredientes si existen
        if (ingredientes && Array.isArray(ingredientes) && ingredientes.length > 0) {
            const values = ingredientes.map(ing => [
                recetaId,
                ing.nombre_ingrediente,
                ing.cantidad || 1,
                ing.unidad || 'unidad'
            ]);
            await db.query(
                'INSERT INTO receta_ingrediente (receta_id, nombre_ingrediente, cantidad, unidad) VALUES ?',
                [values]
            );
        }

        res.json({ ok: true, id: recetaId, message: 'Receta guardada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar receta
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar propiedad
        const [rows] = await db.query('SELECT usuario_id FROM recetas WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Receta no encontrada' });
        if (rows[0].usuario_id !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta receta' });
        }

        // Eliminar ingredientes primero por la llave foránea
        await db.query('DELETE FROM receta_ingrediente WHERE receta_id = ?', [id]);
        
        // Eliminar receta
        await db.query('DELETE FROM recetas WHERE id = ?', [id]);
        
        res.json({ ok: true, message: 'Receta eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar receta
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, porciones, tiempo_min, categoria, ingredientes } = req.body;

    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar propiedad
        const [rows] = await connection.query('SELECT usuario_id FROM recetas WHERE id = ?', [id]);
        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Receta no encontrada' });
        }
        if (rows[0].usuario_id !== req.user.id && req.user.rol !== 'admin') {
            await connection.rollback();
            return res.status(403).json({ error: 'No tienes permiso para editar esta receta' });
        }

        // Actualizar datos básicos
        await connection.query(
            'UPDATE recetas SET nombre = ?, descripcion = ?, porciones = ?, tiempo_min = ?, categoria = ? WHERE id = ?',
            [nombre, descripcion || '', porciones || 2, tiempo_min || 30, categoria || 'General', id]
        );

        // Actualizar ingredientes: eliminamos los anteriores e insertamos los nuevos
        await connection.query('DELETE FROM receta_ingrediente WHERE receta_id = ?', [id]);

        if (ingredientes && Array.isArray(ingredientes) && ingredientes.length > 0) {
            const values = ingredientes.map(ing => [
                id,
                ing.nombre_ingrediente,
                ing.cantidad || 1,
                ing.unidad || 'unidad'
            ]);
            await connection.query(
                'INSERT INTO receta_ingrediente (receta_id, nombre_ingrediente, cantidad, unidad) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        res.json({ ok: true, message: 'Receta actualizada exitosamente' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;