import { LitElement, html, css } from 'lit';

class PriceCompare extends LitElement {
  static properties = {
    ingrediente: { type: String },
    resultados:  { type: Object },
    loading:     { type: Boolean },
    error:       { type: String }
  };

  constructor() {
    super();
    this.ingrediente = '';
    this.resultados = null;
    this.loading = false;
    this.error = '';
  }

  async buscar() {
    if (!this.ingrediente) return;
    this.loading = true;
    this.error = '';
    this.resultados = null;
    try {
      const res = await fetch(`http://localhost:3001/api/precios/${this.ingrediente}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      this.resultados = data;
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
      <div class="wrap">
        <h2><i class="ph ph-magnifying-glass"></i> Comparador en Vivo Akí vs Supermaxi</h2>
        <div class="search-box">
          <input .value=${this.ingrediente} @input=${e => this.ingrediente = e.target.value} placeholder="Ej: arroz, pollo, leche..."/>
          <button class="btn-search" @click=${this.buscar} ?disabled=${this.loading}>
            ${this.loading ? html`<span class="spinner"></span>` : 'Buscar Mejor Precio'}
          </button>
        </div>

        ${this.error ? html`<div class="err-box"><i class="ph ph-warning"></i> ${this.error}</div>` : ''}

        ${this.resultados ? html`
          <div class="result-banner">
            <i class="ph ph-lightbulb"></i> Recomendación: Sale más barato comprar en <strong>${this.resultados.mas_barato}</strong>
          </div>
          
          <div class="tiendas-grid">
             <div class="tienda-card aki">
                <h3><i class="ph ph-storefront" style="color: #facc15"></i> Akí</h3>
                <div class="productos">
                  ${this.resultados.aki.map(p => html`
                    <div class="prod-row">
                      <span class="prod-name">${p.nombre}</span>
                      <span class="prod-price">$${p.precio} <small>(${p.unidad})</small></span>
                    </div>
                  `)}
                  ${this.resultados.aki.length === 0 ? html`<p class="empty">No encontrado</p>` : ''}
                </div>
             </div>
             
             <div class="tienda-card supermaxi">
                <h3><i class="ph ph-shopping-cart" style="color: #ef4444"></i> Supermaxi</h3>
                <div class="productos">
                  ${this.resultados.supermaxi.map(p => html`
                    <div class="prod-row">
                      <span class="prod-name">${p.nombre}</span>
                      <span class="prod-price">$${p.precio} <small>(${p.unidad})</small></span>
                    </div>
                  `)}
                  ${this.resultados.supermaxi.length === 0 ? html`<p class="empty">No encontrado</p>` : ''}
                </div>
             </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    :host { display: block; font-family: 'Outfit', sans-serif; }
    
    .wrap { 
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      padding: 2rem; 
      border-radius: 20px; 
      margin-top: 1.5rem; 
    }
    
    h2 {
      margin-top: 0;
      color: #f8fafc;
      margin-bottom: 1.5rem;
    }
    
    .search-box { 
      display: flex; 
      gap: 12px; 
      margin-bottom: 2rem; 
    }
    
    .search-box input { 
      flex: 1; 
      padding: 14px 20px; 
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.2);
      color: white;
      font-size: 16px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.3s;
    }
    
    .search-box input:focus {
      border-color: #10b981;
    }
    
    .btn-search { 
      padding: 14px 24px; 
      cursor: pointer; 
      background: #10b981;
      color: #0f1115;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 180px;
    }
    
    .btn-search:hover:not(:disabled) {
      background: #34d399;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    
    .btn-search:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0,0,0,0.2);
      border-top-color: #0f1115;
      border-radius: 50%;
      animation: spin 1s infinite linear;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .err-box { 
      padding: 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    
    .result-banner {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #a7f3d0;
      padding: 1.2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
    
    .result-banner strong {
      color: #10b981;
      font-size: 1.2rem;
      text-transform: capitalize;
    }
    
    .tiendas-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem; 
    }
    
    .tienda-card { 
      padding: 1.5rem; 
      border-radius: 16px; 
      background: rgba(0,0,0,0.2);
    }
    
    .aki { border: 1px solid rgba(250, 204, 21, 0.3); }
    .supermaxi { border: 1px solid rgba(239, 68, 68, 0.3); }
    
    .tienda-card h3 {
      margin-top: 0;
      margin-bottom: 1.2rem;
      padding-bottom: 0.8rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #f8fafc;
    }
    
    .productos {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .prod-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
    }
    
    .prod-name {
      color: #e2e8f0;
      font-weight: 500;
    }
    
    .prod-price {
      color: #10b981;
      font-weight: 700;
    }
    
    .prod-price small {
      color: #94a3b8;
      font-weight: 400;
      font-size: 0.8rem;
    }
    
    .empty {
      color: #64748b;
      font-style: italic;
      text-align: center;
      padding: 1rem 0;
    }
    
    @media (max-width: 768px) {
      .tiendas-grid { grid-template-columns: 1fr; }
      .search-box { flex-direction: column; }
    }
  `;
}
customElements.define('price-compare', PriceCompare);