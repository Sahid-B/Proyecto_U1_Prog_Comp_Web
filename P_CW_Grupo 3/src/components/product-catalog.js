import { LitElement, html, css } from 'lit';

class ProductCatalog extends LitElement {
  static properties = {
    productos: { type: Array },
    loading: { type: Boolean },
    error: { type: String },
    filtroCat: { type: String },
    busqueda: { type: String }
  };

  constructor() {
    super();
    this.productos = [];
    this.loading = true;
    this.error = '';
    this.filtroCat = 'Todas';
    this.busqueda = '';
    this.fetchCatalog();
  }

  async fetchCatalog() {
    this.loading = true;
    this.error = '';
    try {
      const url = new URL('http://localhost:3001/api/precios/catalogo');
      if (this.filtroCat !== 'Todas') url.searchParams.append('categoria', this.filtroCat);
      if (this.busqueda) url.searchParams.append('buscar', this.busqueda);
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        this.productos = data.productos;
      } else {
        this.error = 'Error cargando catálogo';
      }
    } catch(err) {
      this.error = 'Error de red';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  handleSearch(e) {
    this.busqueda = e.target.value;
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.fetchCatalog();
    }
  }

  handleFilter(cat) {
    this.filtroCat = cat;
    this.fetchCatalog();
  }

  addToCart(p) {
    const event = new CustomEvent('add-to-cart', {
      detail: p,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
    
    const btn = this.shadowRoot.getElementById(`btn-${p.nombre.replace(/[^a-zA-Z]/g, '')}`);
    if (btn) {
      btn.innerHTML = '<i class="ph ph-check"></i>';
      btn.style.background = '#3b82f6';
      setTimeout(() => {
        btn.innerHTML = '<i class="ph ph-plus"></i>';
        btn.style.background = '#10b981';
      }, 1000);
    }
  }

  render() {
    const categories = ['Todas', 'Carnes y Aves', 'Frutas', 'Verduras', 'Lacteos y Huevos', 'Abarrotes', 'Bebidas', 'Panaderia'];
    
    return html`
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
      <div class="catalog-container">
        <div class="catalog-header">
          <div class="header-left">
            <h2><i class="ph ph-storefront"></i> Catálogo de Comida</h2>
            <div class="search-bar">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" placeholder="Buscar comida..." .value=${this.busqueda} @input=${this.handleSearch} @keypress=${this.handleKeyPress}>
            </div>
          </div>
          <div class="header-right">
            <span class="badge">Sugerencias destacadas</span>
          </div>
        </div>

        <div class="filter-row">
          ${categories.map(cat => html`
            <button class="filter-chip ${this.filtroCat === cat ? 'active' : ''}" @click=${() => this.handleFilter(cat)}>
              ${cat}
            </button>
          `)}
        </div>
        
        ${this.loading ? html`<div class="loading"><i class="ph ph-spinner ph-spin"></i> Buscando productos...</div>` : ''}
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
        ${!this.loading && this.productos.length === 0 ? html`<div class="loading">No se encontraron productos de comida.</div>` : ''}

        <div class="product-scroll">
          ${this.productos.map(p => html`
            <div class="product-card">
              <div class="tienda-badge ${p.tienda_id === 1 ? 'aki' : 'smx'}">
                ${p.tienda_id === 1 ? '🟡 Akí' : '🔴 Supermaxi'}
              </div>
              <div class="product-img">
                ${p.imagen_url 
                  ? html`<img src="${p.imagen_url}" alt="${p.nombre}" onerror="this.src='https://placehold.co/200x150?text=Sin+Imagen'">`
                  : html`<div class="img-placeholder"><i class="ph ph-package"></i></div>`
                }
              </div>
              <div class="product-info">
                <h3 title="${p.nombre}">${p.nombre}</h3>
                <div class="price-row">
                  <span class="price">$${p.precio}</span>
                  <span class="unit">${p.unidad}</span>
                </div>
                <button id="btn-${p.nombre.replace(/[^a-zA-Z]/g, '')}" class="btn-add" @click=${() => this.addToCart(p)}>
                  <i class="ph ph-plus"></i>
                </button>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host { display: block; font-family: 'Outfit', sans-serif; margin-bottom: 2rem; }

    .catalog-container {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }

    .catalog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 1.5rem;
      gap: 20px;
    }

    .header-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .search-bar {
      position: relative;
      width: 100%;
      max-width: 400px;
    }

    .search-bar i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-bar input {
      width: 100%;
      padding: 10px 10px 10px 35px;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: white;
      font-family: inherit;
      outline: none;
      transition: border-color 0.3s;
    }

    .search-bar input:focus {
      border-color: #10b981;
    }

    .filter-row {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      scrollbar-width: none;
    }
    .filter-row::-webkit-scrollbar { display: none; }

    .filter-chip {
      padding: 6px 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      color: #94a3b8;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.3s;
      font-size: 0.9rem;
    }

    .filter-chip:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .filter-chip.active {
      background: #10b981;
      border-color: #10b981;
      color: #0f172a;
      font-weight: 600;
    }

    .catalog-header h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .badge {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .product-scroll {
      display: flex;
      overflow-x: auto;
      gap: 1rem;
      padding-bottom: 1rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(16, 185, 129, 0.5) rgba(255, 255, 255, 0.05);
    }
    
    .product-scroll::-webkit-scrollbar { height: 8px; }
    .product-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
    .product-scroll::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.5); border-radius: 10px; }

    .product-card {
      min-width: 200px;
      max-width: 200px;
      background: rgba(0,0,0,0.3);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.05);
      position: relative;
      transition: transform 0.3s, border-color 0.3s;
    }

    .product-card:hover {
      transform: translateY(-5px);
      border-color: rgba(16, 185, 129, 0.4);
    }

    .tienda-badge {
      position: absolute;
      top: 10px; left: 10px;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      z-index: 2;
    }
    .tienda-badge.aki { background: rgba(250, 204, 21, 0.9); color: #000; }
    .tienda-badge.smx { background: rgba(239, 68, 68, 0.9); color: #fff; }

    .product-img {
      height: 120px;
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .product-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .img-placeholder {
      font-size: 3rem;
      color: #334155;
    }

    .product-info {
      padding: 1rem;
      position: relative;
    }
    .product-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .price-row {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #10b981;
    }
    
    .unit {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .btn-add {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: #10b981;
      color: white;
      border: none;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }
    .btn-add:hover {
      background: #34d399;
      transform: scale(1.1);
    }
    
    .loading, .error {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
    }
    .error { color: #fca5a5; }
  `;
}
customElements.define('product-catalog', ProductCatalog);
