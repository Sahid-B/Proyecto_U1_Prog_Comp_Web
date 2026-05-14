import { LitElement, html, css } from 'lit';

class ShoppingList extends LitElement {
  static properties = {
    items: { type: Object }
  };

  constructor() {
    super();
    // Fallback data
    this.items = {
      aki: [],
      supermaxi: []
    };

    // Intentar leer de localStorage propio del carrito
    try {
      const savedCart = localStorage.getItem('planComer_cart');
      if (savedCart) {
        this.items = JSON.parse(savedCart);
      } else {
        // Fallback al plan generado (código legacy)
        const savedPlanData = localStorage.getItem('planComer_currentPlan');
        if (savedPlanData) {
          const parsedData = JSON.parse(savedPlanData);
          if (parsedData && parsedData.lista_compras) {
            const mapToItem = (nombre) => ({ nombre, cantidad: 1, unidad: 'unidades', precio: 2.50 });
            this.items.aki = (parsedData.lista_compras.aki || []).map(mapToItem);
            this.items.supermaxi = (parsedData.lista_compras.supermaxi || []).map(mapToItem);
            this.saveCart();
          }
        }
      }
    } catch (e) {
      console.error('Error al leer el carrito', e);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleAddToCart = this.handleAddToCart.bind(this);
    window.addEventListener('add-to-cart', this._handleAddToCart);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('add-to-cart', this._handleAddToCart);
  }

  handleAddToCart(e) {
    const p = e.detail;
    const item = {
      nombre: p.nombre,
      cantidad: 1,
      unidad: p.unidad,
      precio: parseFloat(p.precio),
      comprado: false
    };

    if (p.tienda_id === 1) {
      this.items.aki = [...this.items.aki, item];
    } else {
      this.items.supermaxi = [...this.items.supermaxi, item];
    }

    this.saveCart();
    this.requestUpdate();
  }

  toggleItem(tienda, index) {
    this.items[tienda][index].comprado = !this.items[tienda][index].comprado;
    this.saveCart();
    this.requestUpdate();
  }

  saveCart() {
    localStorage.setItem('planComer_cart', JSON.stringify(this.items));
  }

  clearCart() {
    if (confirm('¿Estás seguro de vaciar toda la lista?')) {
      this.items = { aki: [], supermaxi: [] };
      this.saveCart();
      this.requestUpdate();
    }
  }

  async saveToDatabase() {
    // Tomar todos los productos del carrito
    const allItems = [...this.items.aki, ...this.items.supermaxi];
    if (allItems.length === 0) {
      alert('La lista está vacía, añade productos primero.');
      return;
    }

    let savedCount = 0;
    try {
      for (const item of allItems) {
        const res = await fetch('http://localhost:3001/api/compras', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_id: null,
            nombre_ingrediente: item.nombre,
            cantidad_total: item.cantidad,
            unidad: item.unidad
          })
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);
        savedCount++;
      }
      alert('¡Se guardaron ' + savedCount + ' items en la base de datos!');
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al guardar en la DB: ' + err.message);
    }
  }

  shareWhatsApp() {
    const pendingAki = this.items.aki.filter(i => !i.comprado);
    const pendingSmx = this.items.supermaxi.filter(i => !i.comprado);

    if (pendingAki.length === 0 && pendingSmx.length === 0) {
      alert('No hay productos pendientes por comprar.');
      return;
    }

    let text = '🛒 *Lista de Compras PlanComer*\n\n';

    if (pendingAki.length > 0) {
      text += '✅ *Esta es la lista que se debe comprar en Gran Akí:*\n';
      pendingAki.forEach(item => {
        text += `- ${item.nombre} ($${item.precio.toFixed(2)})\n`;
      });
      text += '\n';
    }

    if (pendingSmx.length > 0) {
      text += '✅ *Esta es la lista que se debe comprar en Supermaxi:*\n';
      pendingSmx.forEach(item => {
        text += `- ${item.nombre} ($${item.precio.toFixed(2)})\n`;
      });
      text += '\n';
    }

    const total = [...pendingAki, ...pendingSmx].reduce((acc, curr) => acc + curr.precio, 0);
    text += `💰 *Total a pagar: $${total.toFixed(2)}*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  render() {
    const totalAki = this.items.aki.reduce((acc, curr) => acc + curr.precio, 0);
    const totalSmx = this.items.supermaxi.reduce((acc, curr) => acc + curr.precio, 0);

    return html`
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
      <div style="display:flex; justify-content:flex-end; gap: 10px; margin-bottom: 1rem;">
        <button @click=${this.saveToDatabase} style="background: rgba(16,185,129,0.2); color:#10b981; border:1px solid rgba(16,185,129,0.4); padding: 8px 16px; border-radius: 8px; cursor:pointer; display: flex; align-items: center; gap: 6px; font-weight: 600;">
          <i class="ph ph-database" style="font-size: 1.2rem;"></i> Sincronizar en la Nube
        </button>
        <button @click=${this.shareWhatsApp} style="background: rgba(37,211,102,0.2); color:#25D366; border:1px solid rgba(37,211,102,0.4); padding: 8px 16px; border-radius: 8px; cursor:pointer; display: flex; align-items: center; gap: 6px; font-weight: 600;">
          <i class="ph ph-whatsapp-logo" style="font-size: 1.2rem;"></i> Compartir Pendientes
        </button>
        <button @click=${this.clearCart} style="background: rgba(239,68,68,0.2); color:#ef4444; border:1px solid rgba(239,68,68,0.4); padding: 8px 16px; border-radius: 8px; cursor:pointer; display: flex; align-items: center; gap: 6px; font-weight: 600;">
          <i class="ph ph-trash" style="font-size: 1.2rem;"></i> Vaciar Lista
        </button>
      </div>
      <div class="list-container">
        
        <div class="store-column aki-col">
          <div class="store-header">
            <h3><i class="ph ph-storefront" style="color: #facc15"></i> Gran Akí</h3>
            <span class="store-total">$${totalAki.toFixed(2)}</span>
          </div>
          <div class="items-list">
            ${this.items.aki.map((item, index) => html`
              <label class="item-row ${item.comprado ? 'checked' : ''}">
                <input type="checkbox" .checked=${item.comprado} @change=${() => this.toggleItem('aki', index)}>
                <div class="item-info">
                  <span class="item-name">${item.nombre}</span>
                  <span class="item-qty">${item.cantidad} ${item.unidad}</span>
                </div>
                <span class="item-price">$${item.precio.toFixed(2)}</span>
              </label>
            `)}
          </div>
        </div>

        <div class="store-column smx-col">
          <div class="store-header">
            <h3><i class="ph ph-shopping-cart" style="color: #ef4444"></i> Supermaxi</h3>
            <span class="store-total">$${totalSmx.toFixed(2)}</span>
          </div>
          <div class="items-list">
            ${this.items.supermaxi.map((item, index) => html`
              <label class="item-row ${item.comprado ? 'checked' : ''}">
                <input type="checkbox" .checked=${item.comprado} @change=${() => this.toggleItem('supermaxi', index)}>
                <div class="item-info">
                  <span class="item-name">${item.nombre}</span>
                  <span class="item-qty">${item.cantidad} ${item.unidad}</span>
                </div>
                <span class="item-price">$${item.precio.toFixed(2)}</span>
              </label>
            `)}
          </div>
        </div>
        
      </div>
    `;
  }

  static styles = css`
    :host { display: block; font-family: 'Outfit', sans-serif; }
    
    .list-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .store-column {
      background: rgba(30, 41, 59, 0.4);
      border-radius: 20px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }
    
    .aki-col { border: 1px solid rgba(250, 204, 21, 0.2); }
    .smx-col { border: 1px solid rgba(239, 68, 68, 0.2); }
    
    .store-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .store-header h3 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.3rem;
    }
    
    .store-total {
      font-size: 1.4rem;
      font-weight: 700;
      color: #10b981;
    }
    
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    
    .item-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.8rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .item-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: #10b981;
      cursor: pointer;
    }
    
    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .item-name {
      color: #e2e8f0;
      font-weight: 500;
    }
    
    .item-qty {
      color: #94a3b8;
      font-size: 0.85rem;
    }
    
    .item-price {
      color: #cbd5e1;
      font-weight: 600;
    }
    
    /* Strike-through effect when checked */
    input[type="checkbox"]:checked ~ .item-info .item-name,
    input[type="checkbox"]:checked ~ .item-price {
      text-decoration: line-through;
      color: #64748b;
    }
  `;
}
customElements.define('shopping-list', ShoppingList);