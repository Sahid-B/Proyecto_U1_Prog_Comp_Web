/**
 * =========================================================================
 * ARCHIVO: routes/precios.js
 * FUNCIÓN: Se conecta con las tablas de tiendas (Aki, Supermaxi) para 
 * devolver el catálogo de productos disponibles y comparar el precio de
 * un ingrediente específico en diferentes supermercados.
 * =========================================================================
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/catalogo', async (req, res) => {
  const { categoria, buscar } = req.query;
  
  // Lista blanca estricta de categorías de comida para evitar jabones, etc.
  const categoriasComida = [
    'Abarrotes', 'Bebidas', 'Carnes y Aves', 'Confites y Snacks', 
    'Congelados', 'Embutidos y Delicatessen', 'Frutas', 'Lacteos y Huevos', 
    'Licores', 'Lonchera', 'Panaderia', 'Pescados y Mariscos', 'Verduras', 'Comida Preparada'
  ];

  let conditions = ['p.disponible = TRUE'];
  let params = [];

  // Aplicar filtro de comida siempre
  conditions.push(`p.categoria IN (${categoriasComida.map(() => '?').join(',')})`);
  params.push(...categoriasComida);

  if (categoria && categoria !== 'Todas') {
    conditions.push('p.categoria = ?');
    params.push(categoria);
  }

  if (buscar) {
    conditions.push('p.nombre LIKE ?');
    params.push(`%${buscar}%`);
  }

  const query = `
    SELECT
      p.nombre, p.precio, p.imagen_url, p.unidad, p.categoria,
      t.nombre AS tienda, t.id AS tienda_id
    FROM productos_tienda p
    JOIN tiendas t ON p.tienda_id = t.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY RAND()
    LIMIT 24
  `;

  try {
    const [rows] = await db.query(query, params);
    res.json({ ok: true, productos: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:ingrediente', async (req, res) => {
  const { ingrediente } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT
        p.nombre,
        p.precio,
        p.imagen_url,
        p.unidad,
        p.categoria,
        t.nombre  AS tienda,
        t.id      AS tienda_id
      FROM productos_tienda p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.nombre LIKE CONCAT('%', ?, '%')
        AND p.disponible = TRUE
      ORDER BY p.precio ASC
      LIMIT 10
    `, [ingrediente]);

    const aki       = rows.filter(r => r.tienda_id === 1);
    const supermaxi = rows.filter(r => r.tienda_id === 2);
    const masBarato = (aki[0]?.precio || 999) <= (supermaxi[0]?.precio || 999) ? 'aki' : 'supermaxi';

    res.json({ aki, supermaxi, mas_barato: masBarato });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
