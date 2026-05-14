import { LitElement, html, css } from 'lit';
import '../components/product-catalog.js';
import '../components/shopping-list.js';
import '../components/price-compare.js';

class PageCompras extends LitElement {
  render() {
    return html`
      <div class="page-container slide-in">
        <div class="page-header">
          <h1><i class="ph ph-shopping-bag"></i> Compras Inteligentes</h1>
          <p class="subtitle">Gestiona tu lista y asegúrate de comprar siempre al mejor precio.</p>
        </div>
        
        <!-- ========================================================================= -->
        <!-- AQUI SE USA EL COMPONENTE WEB: product-catalog -->
        <!-- ========================================================================= -->
        <product-catalog></product-catalog>
        
        <!-- ========================================================================= -->
        <!-- AQUI SE USA EL COMPONENTE WEB: shopping-list -->
        <!-- ========================================================================= -->
        <shopping-list></shopping-list>
        
        <div class="divider"></div>
        
        <!-- ========================================================================= -->
        <!-- AQUI SE USA EL COMPONENTE WEB: price-compare -->
        <!-- ========================================================================= -->
        <price-compare></price-compare>
      </div>
    `;
  }

  static styles = css`
    :host { display: block; color: var(--text-main, #f8fafc); font-family: 'Outfit', sans-serif; }
    
    .page-container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 3rem 2rem; 
    }
    
    .slide-in {
      animation: slideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .page-header {
      margin-bottom: 3rem;
      text-align: center;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #f8fafc;
    }
    
    .subtitle {
      color: #94a3b8;
      font-size: 1.1rem;
    }
    
    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 3rem 0;
    }
  `;
}
customElements.define('page-compras', PageCompras);