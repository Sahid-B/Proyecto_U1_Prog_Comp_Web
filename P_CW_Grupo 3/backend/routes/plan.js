/**
 * =========================================================================
 * ARCHIVO: routes/plan.js
 * FUNCIÓN: Maneja el guardado y la recuperación de los planes semanales.
 * Calcula y almacena los costos comparativos (Aki vs Supermaxi) y guarda
 * el JSON completo generado por la IA en la base de datos.
 * =========================================================================
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

// Obtener el último plan del usuario actual
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM planes_semana WHERE usuario_id = ? ORDER BY created_at DESC LIMIT 1',
            [req.user.id]
        );
        res.json({ ok: true, planes: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guardar un nuevo plan para el usuario actual
router.post('/', authMiddleware, async (req, res) => {
    const { plan_json } = req.body;
    try {
        // Obtenemos la fecha de hoy para semana_inicio
        const hoy = new Date().toISOString().split('T')[0];
        
        // Calcular costos totales sumando los precios de los productos en la lista
        let costo_aki = 0;
        let costo_supermaxi = 0;
        
        // El JSON puede venir estructurado de dos formas dependiendo si se generó recién o viene del historial:
        // 1. { ok: true, plan: { lista_compras: ... } }
        // 2. { plan: [...], lista_compras: ... }
        let lista = null;
        if (plan_json && plan_json.lista_compras) {
            lista = plan_json.lista_compras;
        } else if (plan_json && plan_json.plan && plan_json.plan.lista_compras) {
            lista = plan_json.plan.lista_compras;
        }
        
        if (lista) {
            if (Array.isArray(lista.aki)) {
                costo_aki = lista.aki.reduce((sum, item) => sum + (Number(item.precio) || 0), 0);
            }
            if (Array.isArray(lista.supermaxi)) {
                costo_supermaxi = lista.supermaxi.reduce((sum, item) => sum + (Number(item.precio) || 0), 0);
            }
        }
        
        const [result] = await db.query(
            'INSERT INTO planes_semana (usuario_id, semana_inicio, costo_aki, costo_supermaxi, plan_json) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, hoy, costo_aki, costo_supermaxi, JSON.stringify(plan_json)]
        );
        res.json({ ok: true, insertId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;