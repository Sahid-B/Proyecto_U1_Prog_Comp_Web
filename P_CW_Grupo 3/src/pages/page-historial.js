import { LitElement, html, css } from 'lit';
import '../components/historial-planes.js';

class PageHistorial extends LitElement {
  render() {
    return html`
      <div class="page-container slide-in">
        <!-- ========================================================================= -->
        <!-- AQUI SE USA EL COMPONENTE WEB: historial-planes -->
        <!-- ========================================================================= -->
        <historial-planes></historial-planes>
      </div>
    `;
  }

  static styles = css`
    :host { display: block; }
    .page-container { min-height: 80vh; }
    .slide-in {
      animation: slideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
}

customElements.define('page-historial', PageHistorial);
