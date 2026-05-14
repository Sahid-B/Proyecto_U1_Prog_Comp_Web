import { LitElement, html, css } from 'lit';

class HistorialPlanes extends LitElement {
  static properties = {
    historial: { type: Array },
    expandedIndex: { type: Number }
  };

  constructor() {
    super();
    this.historial = [];
    this.expandedIndex = -1;
  }

  connectedCallback() {
    super.connectedCallback();
    this.cargarHistorial();
  }

  cargarHistorial() {
    const data = localStorage.getItem('planComer_historial');
    if (data) {
      try {
        this.historial = JSON.parse(data);
      } catch (e) {
        console.error('Error al parsear historial', e);
      }
    }
  }
  
  borrarHistorial() {
    if(confirm('¿Estás seguro de que deseas borrar todo el historial de planes?')) {
      localStorage.removeItem('planComer_historial');
      this.historial = [];
    }
  }
  
  usarPlan(plan) {
    if(confirm('¿Deseas establecer este plan como tu plan semanal actual?')) {
      localStorage.setItem('planComer_currentPlan', JSON.stringify(plan));
      alert('¡Plan establecido con éxito! Ve a la pestaña "Plan Semanal" para verlo.');
    }
  }

  async syncToDatabase() {
    const token = localStorage.getItem('planComer_token');
    if (!token) {
      alert('Debes iniciar sesión para poder guardar tus planes en la base de datos.');
      return;
    }
    
    if (this.historial.length === 0) {
      alert('No hay planes en el historial para guardar.');
      return;
    }

    let saved = 0;
    try {
      // Por simplicidad, enviaremos uno por uno
      for (const plan of this.historial) {
        const res = await fetch('http://localhost:3001/api/plan', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ plan_json: plan })
        });
        const data = await res.json();
        if (data.ok) {
          saved++;
        }
      }
      alert(`¡Éxito! Se han respaldado ${saved} planes en tu base de datos (tabla planes_semana).`);
    } catch (e) {
      console.error(e);
      alert('Error de red al intentar sincronizar con la base de datos.');
    }
  }

  toggleExpand(index) {
    this.expandedIndex = this.expandedIndex === index ? -1 : index;
  }

  render() {
    if (this.historial.length === 0) {
      return html`
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
        <div class="wrap">
          <div class="empty-state">
            <span class="empty-icon"><i class="ph ph-folder-open"></i></span>
            <h2>Aún no tienes un historial</h2>
            <p>Genera nuevos planes con la Inteligencia Artificial y aparecerán aquí automáticamente.</p>
            <a href="/ia" class="btn-primary"><i class="ph ph-sparkle"></i> Generar mi primer plan</a>
          </div>
        </div>
      `;
    }

    return html`
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
      <div class="wrap">
        <div class="header-section">
          <h1><i class="ph ph-book-open"></i> Historial de Planificaciones</h1>
          <p class="sub">Revisa, reutiliza y administra los planes mágicos que has generado anteriormente.</p>
          <div style="display:flex; justify-content:center; gap: 15px;">
            <button class="btn-primary" @click=${this.syncToDatabase} style="background: linear-gradient(135deg, #10b981, #0ea5e9); cursor: pointer; border: none; padding: 8px 16px; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;"><i class="ph ph-cloud-arrow-up"></i> Sincronizar en la Nube</button>
            <button class="btn-danger" @click=${this.borrarHistorial} style="display: flex; align-items: center; gap: 8px;"><i class="ph ph-trash"></i> Borrar Historial Local</button>
          </div>
        </div>

        <div class="history-list">
          ${this.historial.map((plan, index) => {
            const fecha = plan.fechaGeneracion 
              ? new Date(plan.fechaGeneracion).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
              : 'Fecha desconocida';
            const isExpanded = this.expandedIndex === index;
            
            return html`
              <div class="history-card ${isExpanded ? 'expanded' : ''}" @click=${() => this.toggleExpand(index)}>
                <div class="card-header">
                  <div class="date-info">
                    <span class="calendar-icon"><i class="ph ph-calendar"></i></span>
                    <div>
                      <div class="date-text">${fecha}</div>
                      <div class="plan-saving">Ahorro estimado: $${plan.ahorro_estimado || '0.00'}</div>
                    </div>
                  </div>
                  <div style="display:flex; gap:10px;">
                    <button class="btn-use" @click=${(e) => { e.stopPropagation(); this.usarPlan(plan); }}>
                      <i class="ph ph-check"></i> Establecer como actual
                    </button>
                    <button class="btn-expand ${isExpanded ? 'active' : ''}">
                      <i class="ph ${isExpanded ? 'ph-caret-up' : 'ph-caret-down'}"></i>
                    </button>
                  </div>
                </div>
                
                <div class="days-preview">
                  ${(plan.plan || []).map(dia => html`
                    <div class="day-bubble">
                      <span class="day-name">${(dia.dia || 'N/A').substring(0,3).toUpperCase()}</span>
                      <div class="meal-dots">
                        <span title="${dia.desayuno?.nombre || ''}"><i class="ph ph-sun-horizon"></i></span>
                        <span title="${dia.almuerzo?.nombre || ''}"><i class="ph ph-sun"></i></span>
                        <span title="${dia.cena?.nombre || ''}"><i class="ph ph-moon"></i></span>
                      </div>
                    </div>
                  `)}
                </div>

                ${isExpanded ? html`
                  <div class="plan-details slide-down">
                    <div class="details-grid">
                      ${(plan.plan || []).map(dia => html`
                        <div class="detail-day">
                          <h4>${dia.dia}</h4>
                          <div class="meal-item"><i class="ph ph-sun-horizon"></i> <span>${dia.desayuno?.nombre}</span></div>
                          <div class="meal-item"><i class="ph ph-sun"></i> <span>${dia.almuerzo?.nombre}</span></div>
                          <div class="meal-item"><i class="ph ph-moon"></i> <span>${dia.cena?.nombre}</span></div>
                        </div>
                      `)}
                    </div>
                    
                    ${plan.lista_compras ? html`
                      <div class="summary-footer">
                        <div class="summary-item"><i class="ph ph-shopping-cart"></i> ${Object.values(plan.lista_compras).flat().length} productos en lista</div>
                        <div class="summary-item"><i class="ph ph-coins"></i> Ahorro: $${plan.ahorro_estimado}</div>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host { 
      display: block; 
      font-family: 'Outfit', system-ui, sans-serif;
      color: #f8fafc;
    }
    .wrap { 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 3rem 2rem; 
    }
    
    .header-section {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    h1 { 
      font-size: 2.5rem; 
      margin-bottom: 0.5rem; 
      background: linear-gradient(135deg, #10b981, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .sub { 
      color: #94a3b8; 
      font-size: 1.2rem;
      margin: 0 auto 1.5rem auto;
    }
    
    .btn-danger {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    
    .btn-danger:hover {
      background: #ef4444;
      color: white;
    }
    
    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: rgba(30, 41, 59, 0.4);
      border-radius: 24px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
    }
    
    .empty-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    .empty-state h2 {
      margin-top: 0;
    }
    
    .empty-state p {
      color: #94a3b8;
      margin-bottom: 2rem;
    }
    
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
    }
    
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .history-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    
    .history-card:hover {
      transform: translateY(-3px);
      border-color: rgba(59, 130, 246, 0.4);
      background: rgba(30, 41, 59, 0.8);
    }

    .history-card.expanded {
      border-color: #10b981;
      background: rgba(15, 23, 42, 0.8);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    
    .date-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .calendar-icon {
      font-size: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      padding: 12px;
      border-radius: 12px;
      color: #3b82f6;
    }
    
    .date-text {
      font-weight: 600;
      font-size: 1.1rem;
      color: #e2e8f0;
    }
    
    .plan-saving {
      color: #10b981;
      font-size: 0.9rem;
      margin-top: 4px;
    }
    
    .btn-use {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 8px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .btn-use:hover {
      background: #10b981;
      color: white;
    }

    .btn-expand {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-expand.active {
      color: #10b981;
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }
    
    .days-preview {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 5px;
    }

    .history-card.expanded .days-preview {
      opacity: 0.5;
      margin-bottom: 1.5rem;
    }
    
    .days-preview::-webkit-scrollbar {
      height: 4px;
    }
    .days-preview::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
    }
    
    .day-bubble {
      flex: 1;
      min-width: 100px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 10px;
      text-align: center;
    }
    
    .day-name {
      display: block;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    
    .meal-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
    }
    
    .meal-dots span {
      font-size: 1.1rem;
      color: #94a3b8;
    }

    /* Details Section */
    .slide-down {
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .plan-details {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .detail-day h4 {
      margin: 0 0 1rem 0;
      color: #10b981;
      font-size: 1.1rem;
      text-transform: capitalize;
    }

    .meal-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 0.8rem;
      font-size: 0.95rem;
      color: #cbd5e1;
    }

    .meal-item i {
      color: #3b82f6;
      margin-top: 3px;
    }

    .summary-footer {
      display: flex;
      gap: 20px;
      background: rgba(0,0,0,0.3);
      padding: 1rem;
      border-radius: 12px;
      font-size: 0.9rem;
      color: #94a3b8;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .summary-item i { color: #10b981; }
    
    @media (max-width: 600px) {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .btn-use {
        width: 100%;
      }
      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
}

customElements.define('historial-planes', HistorialPlanes);
