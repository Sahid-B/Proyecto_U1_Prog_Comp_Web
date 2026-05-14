/**
 * =========================================================================
 * ARCHIVO: routes/compras.js
 * FUNCIÓN: Maneja el historial o la lista de compras guardadas en base
 * de datos, asociando los ingredientes necesarios con un plan semanal.
 * =========================================================================
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM lista_compras');
        res.json({ ok: true, compras: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    let { plan_id, nombre_ingrediente, cantidad_total, unidad } = req.body;
    try {
        if (!plan_id) {
            // Obtenemos el último plan de cualquier usuario (o del usuario logueado idealmente)
            const [planes] = await db.query('SELECT id FROM planes_semana ORDER BY id DESC LIMIT 1');
            if (planes.length > 0) {
                plan_id = planes[0].id;
            } else {
                // Si no hay planes creados, creamos uno temporal para poder guardar
                const [newPlan] = await db.query("INSERT INTO planes_semana (usuario_id, semana_inicio) VALUES (1, CURDATE())");
                plan_id = newPlan.insertId;
            }
        }

        const [result] = await db.query(
            'INSERT INTO lista_compras (plan_id, nombre_ingrediente, cantidad_total, unidad) VALUES (?, ?, ?, ?)',
            [plan_id, nombre_ingrediente, cantidad_total, unidad]
        );
        res.json({ ok: true, insertId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;