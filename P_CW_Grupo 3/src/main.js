/**
 * =========================================================================
 * ARCHIVO: main.js
 * FUNCIÓN: Es el "Punto de Entrada" (entry point) de la aplicación de Front-End.
 * Aquí importamos todas nuestras páginas web y configuramos el "Router" o 
 * enrutador utilizando la librería @vaadin/router.
 * Su trabajo es leer la URL (por ejemplo: localhost/compras) y cargar el 
 * componente correcto adentro de la etiqueta <main id="outlet"> del index.html,
 * permitiendo navegar por la app sin que la página parpadee o se recargue.
 * =========================================================================
 */
import { Router } from '@vaadin/router';
import './pages/page-home.js';
import './pages/page-plan.js';
import './pages/page-recetas.js';
import './pages/page-compras.js';
import './pages/page-ia.js';
import './pages/page-cuenta.js';

import './pages/page-historial.js';

const outlet = document.getElementById('outlet');
const router = new Router(outlet);

router.setRoutes([
  { path: '/',         component: 'page-home'     },
  { path: '/plan',     component: 'page-plan'     },
  { path: '/recetas',  component: 'page-recetas'  },
  { path: '/compras',  component: 'page-compras'  },
  { path: '/ia',       component: 'page-ia'       },
  { path: '/historial',component: 'page-historial'},
  { path: '/cuenta',   component: 'page-cuenta'   },
]);