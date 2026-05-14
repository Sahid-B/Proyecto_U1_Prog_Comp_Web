/**
 * =========================================================================
 * ARCHIVO: routes/ia.js
 * FUNCIÓN: Es el corazón inteligente del proyecto.
 * Se conecta con la API de Groq (Llama-3) para generar planes de comida
 * dinámicos analizando productos reales de la BD, extraer recetas de URLs
 * y analizar los valores nutricionales de los ingredientes.
 * =========================================================================
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Obtener todas las categorías
router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT categoria 
      FROM productos_tienda 
      WHERE categoria IS NOT NULL 
        AND categoria NOT LIKE '%Limpieza%'
        AND categoria NOT LIKE '%Hogar%'
        AND categoria NOT LIKE '%Mascota%'
        AND categoria NOT LIKE '%Personal%'
        AND categoria NOT LIKE '%99%'
        AND categoria NOT LIKE '%Licores%'
      ORDER BY categoria
    `);
    const categorias = rows.map(r => r.categoria);
    res.json(categorias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/generar-plan', async (req, res) => {
  // Ahora esperamos recibir 'categorias'
  const { categorias, preferencias } = req.body;

  if (!categorias || categorias.length === 0)
    return res.status(400).json({ error: 'Selecciona al menos una categoría' });

  try {
    // 1. Buscar productos disponibles basados en las categorías seleccionadas
    // Usamos ORDER BY RAND() LIMIT 50 para evitar sobrepasar el límite de tokens de Groq (Context Window)
    const placeholders = categorias.map(() => '?').join(',');
    const [productos] = await db.query(`
      SELECT p.nombre, p.precio, p.unidad, t.nombre AS tienda
      FROM productos_tienda p
      JOIN tiendas t ON p.tienda_id = t.id
      WHERE p.categoria IN (${placeholders}) AND p.disponible = TRUE
      ORDER BY RAND() 
      LIMIT 30
    `, categorias);

    if (productos.length === 0) {
      return res.status(400).json({ error: 'No se encontraron productos en las categorías seleccionadas.' });
    }

    // 2. Construir contexto para Groq con precios reales
    const productosTexto = productos.map(p =>
      `- ${p.nombre} | $${p.precio} por ${p.unidad} | Disponible en: ${p.tienda}`
    ).join('\n');

    // 3. Prompt para Groq
    const prompt = `
Eres un chef experto y asistente de cocina para familias ecuatorianas.
Tienes disponibles estos productos con precios reales de supermercados en Ecuador:

${productosTexto}

Preferencias del usuario: "${preferencias || 'comida casera, rápida y rica'}"

Genera un plan de comidas detallado para 5 días (lunes a viernes) usando SOLO algunos de los ingredientes disponibles arriba.
ES MUY IMPORTANTE que cada comida contenga una lista amplia de "ingredientes" (incluyendo cantidades específicas) y que la "preparacion" sea muy detallada, paso a paso (ej. 1. Hacer esto...\\n 2. Luego hacer esto...), usando saltos de línea '\\n' para separar cada paso.

Calcula el ahorro estimado real (en dólares) que se obtiene al comprar cada producto en la tienda donde es más barato (según los precios proporcionados), en lugar de comprar todo en la tienda más cara.
Muestra los productos de "lista_compras" como objetos con "nombre" y "precio" numérico real.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin \`\`\`json, sin comillas extra al principio o final):

{
  "plan": [
    {
      "dia": "lunes",
      "desayuno": { "nombre": "", "ingredientes": ["1 taza de...", "2 unidades de..."], "preparacion": "1. Paso 1...\\n2. Paso 2..." },
      "almuerzo": { "nombre": "", "ingredientes": ["150g de...", "1/2 taza de..."], "preparacion": "1. Paso 1...\\n2. Paso 2..." },
      "cena":     { "nombre": "", "ingredientes": ["..."], "preparacion": "1. Paso 1...\\n2. Paso 2..." }
    }
  ],
  "lista_compras": {
    "aki":       [{"nombre": "item 1", "precio": 1.50}],
    "supermaxi": [{"nombre": "item 3", "precio": 2.00}]
  },
  "ahorro_estimado": 3.50,
  "consejo": ""
}`;

    // 4. Llamar a Groq con sistema de respaldo (fallback) de API Keys
    const apiKeys = [
      process.env.GROQ_API_KEY,
      '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'
    ];

    const fetchFunc = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
    let groqData = null;
    let lastError = null;

    for (const key of apiKeys) {
      if (!key) continue;
      
      try {
        const groqRes = await fetchFunc('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            model:       'llama-3.3-70b-versatile', // Usamos un modelo más potente para mejor formato
            temperature: 0.6,
            max_tokens:  3500, // Aumentamos para evitar truncado
            messages: [
              { role: 'system', content: 'Eres un asistente experto en JSON. Responde ÚNICAMENTE con el objeto JSON solicitado, sin explicaciones ni markdown.' },
              { role: 'user',   content: prompt },
            ],
          }),
        });

        const data = await groqRes.json();
        if (data.error) {
          throw new Error(data.error.message || 'Error de la API de Groq');
        }
        
        // Si llegamos aquí, la llamada fue exitosa
        groqData = data;
        console.log("Llamada a Groq exitosa con una de las keys.");
        break; 
        
      } catch (err) {
        lastError = err;
        console.warn(`Falló la llamada con una API Key, intentando con la siguiente... Error: ${err.message}`);
      }
    }

    if (!groqData) {
      throw new Error(lastError ? lastError.message : 'Todas las API keys de Groq fallaron o están al límite.');
    }

    const texto = groqData.choices?.[0]?.message?.content || '{}';
    
    // Limpieza agresiva de JSON (extraer lo que esté entre las llaves externas)
    let limpio = texto.trim();
    const match = limpio.match(/\{[\s\S]*\}/);
    if (match) limpio = match[0];

    let plan;
    try {
      plan = JSON.parse(limpio);
    } catch(e) {
      console.error("Error parsing JSON. Raw output:", texto);
      throw new Error("La IA no pudo completar el formato JSON correctamente. Intenta de nuevo.");
    }

    res.json({ ok: true, plan, total_productos_usados: productos.length });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/extraer-receta', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL es requerida' });

  try {
    const fetchFunc = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
    // Usar un User-Agent de navegador para evitar que nos bloqueen (Error 403)
    const htmlRes = await fetchFunc(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    
    if (!htmlRes.ok) {
      throw new Error(`La página web rechazó la conexión (Error ${htmlRes.status}). Intenta con otra página.`);
    }
    
    const htmlText = await htmlRes.text();

    let textContent = '';

    // Si es YouTube, extraemos la descripción interna (donde suelen estar las recetas)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const titleMatch = htmlText.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Video de YouTube';
      
      // Buscar la descripción completa en los datos de YouTube
      const descMatch = htmlText.match(/"shortDescription":"(.*?)"/);
      let desc = descMatch ? descMatch[1] : '';
      desc = desc.replace(/\\n/g, '\n').replace(/\\"/g, '"'); // Limpiar caracteres de escape
      
      textContent = `Receta: ${title}\n\nDescripción e ingredientes:\n${desc}`;
    } else {
      // Limpiar HTML para blogs o páginas normales
      textContent = htmlText
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Limitar tamaño para evitar exceder tokens (8000 caracteres)
    textContent = textContent.substring(0, 8000);

    const prompt = `
Extrae la receta de cocina del siguiente texto sacado de una página web.
Si hay varias recetas, extrae solo la primera y más importante.
Si NO hay ninguna receta en el texto, inventa un JSON vacío pero NO respondas texto normal.

TEXTO:
${textContent}

Responde ÚNICAMENTE con un JSON válido usando esta estructura exacta:
{
  "nombre": "Nombre de la receta",
  "tiempo_min": 30, 
  "porciones": 2, 
  "categoria": "ph-cooking-pot", // opciones: ph-fork-knife, ph-cooking-pot, ph-bowl-food, ph-pizza, ph-hamburger, ph-carrot, ph-fish-simple
  "descripcion": "Ingredientes:\\n- item 1\\n- item 2\\n\\nPreparación:\\n1. Paso 1...\\n2. Paso 2..." 
}
`;

    const apiKeys = [
      process.env.GROQ_API_KEY,
      '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'
    ];

    let groqData = null;
    let lastError = null;

    for (const key of apiKeys) {
      if (!key) continue;
      try {
        const groqRes = await fetchFunc('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            model:       'llama-3.1-8b-instant',
            temperature: 0.2,
            max_tokens:  1000,
            messages: [
              { role: 'system', content: 'Responde SIEMPRE en un único JSON válido sin markdown ni texto extra.' },
              { role: 'user',   content: prompt },
            ],
          }),
        });

        const data = await groqRes.json();
        if (data.error) throw new Error(data.error.message);
        
        groqData = data;
        break; 
      } catch (err) {
        lastError = err;
      }
    }

    if (!groqData) {
      throw new Error(lastError ? lastError.message : 'Todas las API keys de Groq fallaron.');
    }

    const texto  = groqData.choices?.[0]?.message?.content || '{}';
    const limpio = texto.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let receta;
    try {
      receta = JSON.parse(limpio);
      if (!receta.nombre) throw new Error("Receta vacía");
    } catch(e) {
      throw new Error("La Inteligencia Artificial no pudo encontrar una receta clara en este enlace. Asegúrate de que no sea una página de inicio.");
    }

    res.json({ ok: true, receta });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'No se pudo extraer la receta.' });
  }
});

router.post('/analizar-nutricion', async (req, res) => {
  const { nombre, ingredientes } = req.body;
  if (!nombre || !ingredientes) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const prompt = `
Actúa como un experto nutricionista. Analiza la siguiente receta y calcula sus valores nutricionales aproximados para 1 porción.
Receta: ${nombre}
Ingredientes: ${ingredientes.join(', ')}

Responde ÚNICAMENTE con un JSON válido usando esta estructura exacta (sin markdown ni texto extra):
{
  "calorias": "350 kcal",
  "proteinas": "25g",
  "carbohidratos": "30g",
  "grasas": "15g",
  "semaforo": "🟢 Saludable", // opciones: 🟢 Saludable, 🟡 Moderado, 🔴 Chatarra
  "etiquetas": ["Alta en proteína", "Baja en carbohidratos"] // max 2 etiquetas cortas
}
`;

    const apiKeys = [
      process.env.GROQ_API_KEY,
      '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'
    ];

    const fetchFunc = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
    let groqData = null;
    let lastError = null;

    for (const key of apiKeys) {
      if (!key) continue;
      try {
        const groqRes = await fetchFunc('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            model:       'llama-3.1-8b-instant',
            temperature: 0.2,
            max_tokens:  300,
            messages: [
              { role: 'system', content: 'Eres un nutricionista. Responde siempre en JSON puro sin markdown.' },
              { role: 'user',   content: prompt },
            ],
          }),
        });

        const data = await groqRes.json();
        if (data.error) throw new Error(data.error.message);
        
        groqData = data;
        break; 
      } catch (err) {
        lastError = err;
      }
    }

    if (!groqData) {
      throw new Error(lastError ? lastError.message : 'Todas las API keys fallaron.');
    }

    const texto  = groqData.choices?.[0]?.message?.content || '{}';
    const limpio = texto.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let nutricion;
    try {
      nutricion = JSON.parse(limpio);
    } catch(e) {
      throw new Error("Groq devolvió un formato inválido.");
    }

    res.json({ ok: true, nutricion });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al analizar nutrición' });
  }
});

module.exports = router;
