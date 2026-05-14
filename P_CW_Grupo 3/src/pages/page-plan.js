import { LitElement, html, css } from 'lit';
import '../components/plan-weekly.js';

class PagePlan extends LitElement {
  static properties = {
    isEditMode: { type: Boolean }
  };

  constructor() {
    super();
    this.isEditMode = false;
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    // Si acaba de guardar (pasar de true a false), disparamos evento para que plan-weekly guarde
    if (!this.isEditMode) {
      const planWeekly = this.shadowRoot.querySelector('plan-weekly');
      if (planWeekly) planWeekly.savePlan();
    }
  }

  render() {
    return html`
      <div class="page-container slide-in">
        <div class="page-header">
          <h1><i class="ph ph-calendar"></i> Mi Plan Semanal</h1>
          <p class="subtitle">Organiza tus comidas de la semana y mantén una alimentación saludable.</p>
        </div>
        
        <div class="actions-bar">
          <button class="btn-outline ${this.isEditMode ? 'active-edit' : ''}" @click=${this.toggleEdit}>
            ${this.isEditMode ? html`<i class="ph ph-floppy-disk"></i> Guardar Cambios` : html`<i class="ph ph-pencil"></i> Editar Nombres`}
          </button>
          <a href="/ia" class="btn-glow"><i class="ph ph-sparkle"></i> Generar nuevo con IA</a>
        </div>

        <!-- ========================================================================= -->
        <!-- AQUI SE USA EL COMPONENTE WEB: plan-weekly -->
        <!-- ========================================================================= -->
        <plan-weekly .isEditMode=${this.isEditMode}></plan-weekly>
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
      margin-bottom: 2rem;
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
    
    .actions-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    button, a.btn-glow {
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-family: inherit;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s;
      display: inline-block;
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #e2e8f0;
    }
    
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.4);
    }
    
    .btn-outline.active-edit {
      background: rgba(16, 185, 129, 0.1);
      border-color: #10b981;
      color: #10b981;
    }
    
    .btn-glow {
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
    }
    
    .btn-glow:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(168, 85, 247, 0.5);
    }
  `;
}

customElements.define('page-plan', PagePlan);