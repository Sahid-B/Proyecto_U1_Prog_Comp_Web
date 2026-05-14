import { LitElement, html, css } from 'lit';

class IaMealPlanner extends LitElement {
  static properties = {
    loading:      { type: Boolean },
    plan:         { type: Object  },
    categorias:   { type: Array   },
    opciones:     { type: Array   },
    preferencias: { type: String  },
    error:        { type: String  },
  };

  constructor() {
    super();
    this.loading      = false;
    this.plan         = null;
    this.categorias   = [];
    this.opciones     = [];
    this.preferencias = '';
    this.error        = '';
  }

  firstUpdated() {
    this.cargarCategorias();
  }

  async cargarCategorias() {
    try {
      const res = await fetch('http://localhost:3001/api/categorias');
      if (res.ok) {
        this.opciones = await res.json();
      } else {
        // Fallback en caso de que no funcione
        this.opciones = ['Abarrotes', 'Carnes y Aves', 'Frutas', 'Verduras', 'Lácteos y Huevos'];
      }
    } catch(e) {
      this.opciones = ['Abarrotes', 'Carnes y Aves', 'Frutas', 'Verduras', 'Lácteos y Huevos'];
    }
  }

  toggle(cat) {
    this.categorias = this.categorias.includes(cat)
      ? this.categorias.filter(c => c !== cat)
      : [...this.categorias, cat];
  }

  async generar() {
    if (!this.categorias.length) {
      this.error = 'Selecciona al menos una categoría para comenzar.';
      return;
    }
    this.loading = true;
    this.error   = '';
    this.plan    = null;
    try {
      const res  = await fetch('http://localhost:3001/api/generar-plan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ categorias: this.categorias, preferencias: this.preferencias }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      this.plan = data.plan;
      
      // Guardar en localStorage para que otras páginas lo usen
      localStorage.setItem('planComer_currentPlan', JSON.stringify(this.plan));
      
      // Añadir al historial
      const historialStr = localStorage.getItem('planComer_historial');
      let historial = [];
      if (historialStr) {
        try { historial = JSON.parse(historialStr); } catch(e) {}
      }
      // Añadir fecha de generación para identificarlo
      const planConFecha = { ...this.plan, fechaGeneracion: new Date().toISOString() };
      historial.unshift(planConFecha); // Guardar al principio para ver el más reciente primero
      localStorage.setItem('planComer_historial', JSON.stringify(historial));
      
      // Intentar guardar en la Base de Datos si hay sesión iniciada
      const token = localStorage.getItem('planComer_token');
      if (token) {
        try {
          await fetch('http://localhost:3001/api/plan', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ plan_json: data })
          });
        } catch(e) {
          console.error('No se pudo guardar en BD:', e);
        }
      }
      
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="wrap">
        <div class="header-section">
          <h1><i class="ph ph-sparkle"></i> Planificador IA</h1>
          <p class="sub">Selecciona las categorías que te interesan y la IA creará tu menú ideal, optimizando tus compras entre <span style="color:#facc15">🟡 Akí</span> y <span style="color:#ef4444">🔴 Supermaxi</span>.</p>
        </div>

        <div class="glass-card">
          <h3>1. Selecciona categorías de productos</h3>
          <div class="chips">
            ${this.opciones.length === 0 ? html`<p class="loading-cats">Cargando categorías...</p>` : ''}
            ${this.opciones.map(i => html`
              <button class="chip ${this.categorias.includes(i) ? 'on' : ''}" @click=${() => this.toggle(i)}>
                ${this.categorias.includes(i) ? html`<i class="ph ph-check"></i> ` : html`<i class="ph ph-plus"></i> `}${i}
              </button>
            `)}
          </div>

          <h3>2. ¿Tienes alguna preferencia?</h3>
          <input placeholder="Ej: sin picante, bajo en calorías, rápido de hacer..."
            .value=${this.preferencias}
            @input=${e => this.preferencias = e.target.value}/>

          <button class="btn-ai" @click=${this.generar} ?disabled=${this.loading}>
            ${this.loading ? html`<span class="spinner"></span> Procesando la mejor opción...` : html`<i class="ph ph-magic-wand"></i> Generar mi Plan Mágico`}
          </button>

          ${this.error ? html`<div class="err-box"><i class="ph ph-warning-circle"></i> ${this.error}</div>` : ''}
        </div>

        ${this.plan?.plan ? html`
          <div class="plan-results slide-up">
            <h2><i class="ph ph-calendar-check"></i> Tu Semana Planeada</h2>
            <div class="grid">
              ${this.plan.plan.map(d => html`
                <div class="dia-card">
                  <div class="dia-title">${d.dia}</div>
                  <div class="comida"><span class="icon"><i class="ph ph-sun-horizon"></i></span> <div class="comida-texto">${d.desayuno?.nombre}</div></div>
                  <div class="comida"><span class="icon"><i class="ph ph-sun"></i></span> <div class="comida-texto">${d.almuerzo?.nombre}</div></div>
                  <div class="comida"><span class="icon"><i class="ph ph-moon"></i></span> <div class="comida-texto">${d.cena?.nombre}</div></div>
                </div>
              `)}
            </div>

            <h2><i class="ph ph-shopping-bag"></i> Dónde comprar (Lista Inteligente)</h2>
            <div class="tiendas">
              <div class="tienda-card aki-card">
                <h3><span class="dot aki-dot"></span> Comprar en Gran Akí</h3>
                <ul class="lista-items">
                  ${(this.plan.lista_compras?.aki || []).map(i => html`
                    <li class="item-compra">
                      <span class="item-nombre">${typeof i === 'string' ? i : i.nombre}</span>
                      ${i.precio ? html`<span class="item-precio">$${typeof i.precio === 'number' ? i.precio.toFixed(2) : i.precio}</span>` : ''}
                    </li>
                  `)}
                  ${!(this.plan.lista_compras?.aki?.length) ? html`<li class="empty">Nada por aquí</li>` : ''}
                </ul>
              </div>
              <div class="tienda-card supermaxi-card">
                <h3><span class="dot smx-dot"></span> Comprar en Supermaxi</h3>
                <ul class="lista-items">
                  ${(this.plan.lista_compras?.supermaxi || []).map(i => html`
                    <li class="item-compra">
                      <span class="item-nombre">${typeof i === 'string' ? i : i.nombre}</span>
                      ${i.precio ? html`<span class="item-precio">$${typeof i.precio === 'number' ? i.precio.toFixed(2) : i.precio}</span>` : ''}
                    </li>
                  `)}
                  ${!(this.plan.lista_compras?.supermaxi?.length) ? html`<li class="empty">Nada por aquí</li>` : ''}
                </ul>
              </div>
            </div>

            ${this.plan.ahorro_estimado ? html`
              <div class="ahorro-box">
                <span class="ahorro-icon"><i class="ph ph-coins" style="color: #10b981"></i></span>
                <div>
                  <span class="ahorro-label">Ahorro estimado en esta compra:</span>
                  <span class="ahorro-valor">$${this.plan.ahorro_estimado}</span>
                </div>
              </div>
            ` : ''}
            ${this.plan.consejo ? html`
              <div class="consejo-box">
                <span class="consejo-icon"><i class="ph ph-lightbulb" style="color: #f59e0b"></i></span>
                <p>${this.plan.consejo}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    :host { 
      display: block; 
      font-family: 'Outfit', system-ui, sans-serif;
      color: var(--text-main, #f8fafc);
    }
    .wrap { 
      max-width: 1000px; 
      margin: 0 auto; 
      padding: 3rem 2rem; 
    }
    
    .header-section {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    h1 { 
      font-size: 2.8rem; 
      margin-bottom: 0.5rem; 
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .sub { 
      color: var(--text-muted, #94a3b8); 
      font-size: 1.2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      padding: 2.5rem;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      margin-bottom: 3rem;
    }

    h3 {
      font-size: 1.2rem;
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #e2e8f0;
      font-weight: 500;
    }

    .chips { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 12px; 
      margin-bottom: 2.5rem; 
    }
    
    .loading-cats { color: #94a3b8; font-style: italic; }

    .chip { 
      padding: 10px 20px; 
      border-radius: 50px; 
      border: 1px solid rgba(255, 255, 255, 0.1); 
      background: rgba(255, 255, 255, 0.03); 
      color: #cbd5e1;
      cursor: pointer; 
      font-size: 14px; 
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .chip:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
    
    .chip.on { 
      background: rgba(168, 85, 247, 0.15); 
      color: #d8b4fe; 
      border-color: rgba(168, 85, 247, 0.5); 
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
    }
    
    input { 
      width: 100%; 
      padding: 16px 20px; 
      border: 1px solid rgba(255, 255, 255, 0.1); 
      background: rgba(0, 0, 0, 0.2);
      color: white;
      border-radius: 12px; 
      margin-bottom: 2rem; 
      font-size: 16px; 
      font-family: inherit;
      box-sizing: border-box; 
      transition: border-color 0.3s;
    }
    
    input:focus {
      outline: none;
      border-color: #a855f7;
    }
    
    .btn-ai { 
      width: 100%; 
      padding: 16px; 
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: white; 
      border: none; 
      border-radius: 12px; 
      font-size: 1.1rem; 
      font-weight: 600;
      cursor: pointer; 
      transition: all 0.3s;
      font-family: inherit;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    
    .btn-ai:hover:not(:disabled) { 
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4);
    }
    
    .btn-ai:disabled { 
      opacity: 0.7; 
      cursor: not-allowed; 
      background: #475569;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .err-box { 
      margin-top: 1.5rem;
      padding: 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      border-radius: 8px;
    }

    /* Results */
    .slide-up {
      animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    h2 {
      font-size: 1.8rem;
      margin: 2.5rem 0 1.5rem;
      color: #f8fafc;
    }

    .grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
      gap: 20px; 
    }
    
    .dia-card { 
      background: rgba(30, 41, 59, 0.6); 
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px; 
      padding: 1.5rem; 
      transition: transform 0.3s;
    }
    
    .dia-card:hover {
      transform: translateY(-5px);
      border-color: rgba(16, 185, 129, 0.3);
    }
    
    .dia-title { 
      font-size: 1.2rem;
      font-weight: 600;
      color: #10b981;
      text-transform: capitalize; 
      margin-bottom: 1.2rem; 
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 0.5rem;
    }
    
    .comida { 
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 1rem; 
      font-size: 0.95rem;
      color: #e2e8f0;
    }
    
    .icon {
      font-size: 1.2rem;
      line-height: 1;
    }
    
    .comida-texto {
      line-height: 1.4;
    }

    .tiendas { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 20px; 
      margin-bottom: 2.5rem; 
    }
    
    .tienda-card {
      border-radius: 16px; 
      padding: 1.5rem;
      background: rgba(30, 41, 59, 0.4);
      backdrop-filter: blur(10px);
    }
    
    .aki-card {
      border: 1px solid rgba(250, 204, 21, 0.2);
    }
    
    .supermaxi-card {
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    
    .dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
    }
    
    .aki-dot { background: #facc15; box-shadow: 0 0 10px rgba(250, 204, 21, 0.5); }
    .smx-dot { background: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
    
    .tienda-card h3 { 
      display: flex;
      align-items: center;
      margin-top: 0;
      margin-bottom: 1.2rem; 
    }
    
    .lista-items {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .lista-items li {
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #cbd5e1;
    }
    
    .item-compra {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .item-nombre {
      flex: 1;
    }
    
    .item-precio {
      font-weight: 600;
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.9em;
      margin-left: 10px;
    }
    
    .lista-items li:last-child {
      border-bottom: none;
    }
    
    .empty {
      color: #64748b !important;
      font-style: italic;
    }

    .ahorro-box { 
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02)); 
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 1.5rem; 
      border-radius: 16px; 
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 1.5rem;
    }
    
    .ahorro-icon {
      font-size: 2.5rem;
    }
    
    .ahorro-label {
      display: block;
      color: #a7f3d0;
      font-size: 0.9rem;
      margin-bottom: 0.2rem;
    }
    
    .ahorro-valor {
      display: block;
      color: #10b981;
      font-size: 1.8rem;
      font-weight: 700;
    }
    
    .consejo-box { 
      background: rgba(255, 255, 255, 0.03);
      border-left: 4px solid #f59e0b;
      padding: 1.5rem;
      border-radius: 0 12px 12px 0;
      display: flex;
      gap: 15px;
      align-items: flex-start;
    }
    
    .consejo-icon {
      font-size: 1.5rem;
    }
    
    .consejo-box p {
      margin: 0;
      color: #e2e8f0;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .wrap { padding: 2rem 1rem; }
      .tiendas { grid-template-columns: 1fr; }
    }
  `;
}

customElements.define('ia-meal-planner', IaMealPlanner);