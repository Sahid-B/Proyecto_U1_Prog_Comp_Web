import { LitElement, html, css } from 'lit';

class RecipeCard extends LitElement {
  static properties = {
    receta: { type: Object },
    index: { type: Number }
  };

  render() {
    if (!this.receta) return html``;
    const r = this.receta;
    const bgClass = 'bg-' + ((this.index % 4) + 1);
    
    return html`
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
      <div class="receta-card ${bgClass}" @click=${() => this.dispatchEvent(new CustomEvent('open-view', { bubbles: true, composed: true }))}>
        <button class="btn-delete" @click=${(e) => { 
          e.stopPropagation(); 
          this.dispatchEvent(new CustomEvent('delete-receta', { detail: { id: r.id }, bubbles: true, composed: true })); 
        }}>
          <i class="ph ph-trash"></i>
        </button>
        <div class="receta-icon">
          ${r.categoria && r.categoria.startsWith('ph-') ? html`<i class="ph ${r.categoria}"></i>` : html`<i class="ph ph-cooking-pot"></i>`}
        </div>
        <div class="receta-info">
          <h3>${r.nombre}</h3>
          <div class="meta">
            <span><i class="ph ph-clock"></i> ${r.tiempo_min} min</span>
            <span><i class="ph ph-users"></i> ${r.porciones} porciones</span>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    .receta-card {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      gap: 1.2rem;
      cursor: pointer;
      transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
      position: relative;
      overflow: hidden;
      color: #f8fafc;
      font-family: 'Outfit', sans-serif;
    }
    
    .receta-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0.1;
      z-index: -1;
      transition: opacity 0.3s;
    }
    
    .bg-1::before { background: linear-gradient(135deg, #10b981, #0ea5e9); }
    .bg-2::before { background: linear-gradient(135deg, #f59e0b, #ef4444); }
    .bg-3::before { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
    .bg-4::before { background: linear-gradient(135deg, #14b8a6, #3b82f6); }

    .receta-card:hover {
      transform: translateY(-5px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    
    .receta-card:hover::before {
      opacity: 0.2;
    }
    
    .btn-delete {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: none;
      border-radius: 50%;
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s, background 0.2s;
    }
    .receta-card:hover .btn-delete { opacity: 1; }
    .btn-delete:hover { background: rgba(239, 68, 68, 0.4); }
    
    .receta-icon {
      font-size: 2.5rem;
      background: rgba(0,0,0,0.2);
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
    }
    
    .receta-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      color: #e2e8f0;
    }
    
    .meta {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      font-size: 0.9rem;
      color: #94a3b8;
    }
  `;
}
customElements.define('recipe-card', RecipeCard);