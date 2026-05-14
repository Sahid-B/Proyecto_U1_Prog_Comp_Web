import { LitElement, html, css } from 'lit';
import '../components/recipe-card.js';
import '../components/recipe-form.js';

class PageRecetas extends LitElement {
  static properties = {
    recetas: { type: Array },
    loading: { type: Boolean },
    isModalOpen: { type: Boolean },
    isImportModalOpen: { type: Boolean },
    importLoading: { type: Boolean },
    selectedRecetaView: { type: Object },
    errorMsg: { type: String },
    nutricionLoading: { type: Boolean },
    isEditing: { type: Boolean }
  };

  constructor() {
    super();
    this.recetas = [];
    this.loading = true;
    this.isModalOpen = false;
    this.isImportModalOpen = false;
    this.importLoading = false;
    this.selectedRecetaView = null;
    this.errorMsg = '';
    this.nutricionLoading = false;
    this.isEditing = false;
    this.fetchRecetas();
  }

  async fetchRecetas() {
    this.loading = true;
    const token = localStorage.getItem('planComer_token');
    if (!token) {
      this.errorMsg = 'Debes iniciar sesión para ver tus recetas.';
      this.loading = false;
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3001/api/recetas', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.ok) {
        this.recetas = data.recetas;
      } else {
        this.errorMsg = data.error || 'Error al cargar recetas';
      }
    } catch (e) {
      this.errorMsg = 'Error de conexión';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async saveReceta(e) {
    if (e.preventDefault) e.preventDefault();
    const formData = e.detail ? e.detail.formData : new FormData(e.target);
    const token = localStorage.getItem('planComer_token');
    const descripcion = formData.get('descripcion');
    const lines = descripcion ? descripcion.split('\n') : [];
    const ings = lines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.trim().replace(/^[-•]\s*/, ''));
    const ingredientesArray = ings.map(ing => ({ nombre_ingrediente: ing, cantidad: 1, unidad: 'unidad' }));

    const body = {
      nombre: formData.get('nombre'),
      tiempo_min: formData.get('tiempo_min'),
      porciones: formData.get('porciones'),
      descripcion: descripcion,
      categoria: formData.get('categoria'),
      ingredientes: ingredientesArray
    };

    try {
      const res = await fetch('http://localhost:3001/api/recetas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.ok) {
        this.isModalOpen = false;
        this.fetchRecetas();
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (err) {
      alert('Error de red');
    }
  }

  async deleteReceta(id, e) {
    e.stopPropagation();
    if (!confirm('¿Seguro que deseas eliminar esta receta?')) return;
    
    const token = localStorage.getItem('planComer_token');
    try {
      const res = await fetch(`http://localhost:3001/api/recetas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.ok) {
        this.fetchRecetas();
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de red');
    }
  }

  openModal() {
    if (!localStorage.getItem('planComer_token')) {
      alert('Debes iniciar sesión primero');
      return;
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openImportModal() {
    if (!localStorage.getItem('planComer_token')) {
      alert('Debes iniciar sesión primero');
      return;
    }
    this.isImportModalOpen = true;
  }

  closeImportModal() {
    this.isImportModalOpen = false;
  }

  openRecetaView(receta) {
    this.selectedRecetaView = receta;
  }

  closeRecetaView() {
    this.selectedRecetaView = null;
    this.isEditing = false;
  }

  async updateReceta(e) {
    if (e.preventDefault) e.preventDefault();
    const token = localStorage.getItem('planComer_token');
    if (!token) return;

    const r = this.selectedRecetaView;
    const formData = e.detail ? e.detail.formData : new FormData(e.target);
    const descripcion = formData.get('descripcion');
    const lines = descripcion ? descripcion.split('\n') : [];
    const ings = lines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.trim().replace(/^[-•]\s*/, ''));
    const ingredientesArray = ings.map(ing => ({ nombre_ingrediente: ing, cantidad: 1, unidad: 'unidad' }));

    const body = {
      nombre: formData.get('nombre'),
      tiempo_min: formData.get('tiempo_min'),
      porciones: formData.get('porciones'),
      descripcion: descripcion,
      categoria: formData.get('categoria'),
      ingredientes: ingredientesArray
    };

    try {
      const res = await fetch(`http://localhost:3001/api/recetas/${r.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.ok) {
        this.isEditing = false;
        this.fetchRecetas();
        this.selectedRecetaView = { ...this.selectedRecetaView, ...body };
        alert('Receta actualizada');
      } else {
        alert(data.error || 'Error al actualizar');
      }
    } catch (err) {
      alert('Error de red');
    }
  }

  async analizarNutricion() {
    if (!this.selectedRecetaView) return;
    this.nutricionLoading = true;
    
    try {
      const r = this.selectedRecetaView;
      // Extraer ingredientes de la descripción (líneas que empiezan con - o •)
      const lines = r.descripcion ? r.descripcion.split('\n') : [];
      const ings = lines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.trim().replace(/^[-•]\s*/, ''));
      
      const res = await fetch('http://localhost:3001/api/analizar-nutricion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: r.nombre,
          ingredientes: ings.length > 0 ? ings : [r.nombre] // Si no hay lista, mandar el nombre
        })
      });
      
      const data = await res.json();
      if (data.ok) {
        // Guardar nutrición temporalmente en la vista
        this.selectedRecetaView = { ...this.selectedRecetaView, nutricion: data.nutricion };
      } else {
        alert(data.error || 'Error al analizar nutrición');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión con el servicio de nutrición');
    } finally {
      this.nutricionLoading = false;
    }
  }

  toggleIngrediente(e) {
    e.currentTarget.classList.toggle('checked');
  }

  async importFromUrl(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    if (!url) return;

    this.importLoading = true;
    try {
      const res = await fetch('http://localhost:3001/api/extraer-receta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.ok && data.receta) {
        // Cerrar modal de importación y abrir el de nueva receta con datos prellenados
        this.isImportModalOpen = false;
        this.isModalOpen = true;
        
        // Esperar a que el modal renderice
        setTimeout(() => {
          const form = this.shadowRoot.querySelector('#form-nueva-receta');
          if (form) {
            form.querySelector('[name="nombre"]').value = data.receta.nombre || '';
            form.querySelector('[name="tiempo_min"]').value = data.receta.tiempo_min || 30;
            form.querySelector('[name="porciones"]').value = data.receta.porciones || 2;
            
            // Si la IA devolvió una categoría válida de Phosphor, usarla
            const catSelect = form.querySelector('[name="categoria"]');
            if (catSelect && data.receta.categoria && data.receta.categoria.startsWith('ph-')) {
              catSelect.value = data.receta.categoria;
            }
            
            form.querySelector('[name="descripcion"]').value = data.receta.descripcion || '';
          }
        }, 100);
      } else {
        alert(data.error || 'No se pudo extraer la receta');
      }
    } catch(err) {
      console.error(err);
      alert('Error de conexión. ¿Seguro que reiniciaste el backend? Detalle: ' + err.message);
    } finally {
      this.importLoading = false;
    }
  }

  renderModal() {
    return html`
      <div class="modal-overlay ${this.isModalOpen ? 'active' : ''}" @click=${this.closeModal}>
        <div class="modal-content ${this.isModalOpen ? 'active' : ''}" @click=${e => e.stopPropagation()}>
          <button class="modal-close" @click=${this.closeModal}>&times;</button>
          <h2>Nueva Receta</h2>
          <!-- ========================================================================= -->
          <!-- AQUI SE USA EL COMPONENTE WEB: recipe-form -->
          <!-- ========================================================================= -->
          <recipe-form @save-receta=${this.saveReceta}></recipe-form>
        </div>
      </div>
    `;
  }

  renderImportModal() {
    return html`
      <div class="modal-overlay ${this.isImportModalOpen ? 'active' : ''}" @click=${this.closeImportModal}>
        <div class="modal-content ${this.isImportModalOpen ? 'active' : ''}" @click=${e => e.stopPropagation()}>
          <button class="modal-close" @click=${this.closeImportModal}>&times;</button>
          <h2><i class="ph ph-magic-wand"></i> Importar con IA</h2>
          <p style="color: #94a3b8; margin-bottom: 1.5rem; font-size: 0.95rem;">Pega el enlace de cualquier blog de recetas y la IA extraerá los ingredientes y pasos limpios por ti.</p>
          <form @submit=${this.importFromUrl}>
            <div class="form-group">
              <label>URL de la Receta</label>
              <input type="url" name="url" required placeholder="https://ejemplo.com/receta-de-pollo...">
            </div>
            <button type="submit" class="btn-glow btn-ai w-100" ?disabled=${this.importLoading}>
              ${this.importLoading ? html`<i class="ph ph-spinner ph-spin"></i> Analizando página...` : html`<i class="ph ph-sparkle"></i> Extraer Receta`}
            </button>
          </form>
        </div>
      </div>
    `;
  }

  renderRecetaView() {
    if (!this.selectedRecetaView) return '';
    const r = this.selectedRecetaView;
    const descParts = r.descripcion ? r.descripcion.split('\n') : [];
    
    return html`
      <div class="modal-overlay active" @click=${this.closeRecetaView}>
        <div class="modal-content view-modal active" @click=${e => e.stopPropagation()}>
          <button class="modal-close" @click=${this.closeRecetaView}>&times;</button>
          
          <div class="view-header">
            <div class="view-icon">
              ${r.categoria && r.categoria.startsWith('ph-') ? html`<i class="ph ${r.categoria}"></i>` : html`<i class="ph ph-cooking-pot"></i>`}
            </div>
            <h2>${r.nombre}</h2>
            <div class="view-meta">
              <span><i class="ph ph-clock"></i> ${r.tiempo_min} min</span>
              <span><i class="ph ph-users"></i> ${r.porciones} porciones</span>
            </div>
            
            <div style="display:flex; justify-content:center; gap: 10px; margin-top: 1rem;">
              ${!this.isEditing ? html`
                <button class="btn-nutrition" @click=${this.analizarNutricion} ?disabled=${this.nutricionLoading}>
                  ${this.nutricionLoading ? html`<i class="ph ph-spinner ph-spin"></i> ...` : html`<i class="ph ph-sparkle"></i> Nutrición`}
                </button>
                <button class="btn-nutrition" style="background: linear-gradient(135deg, #10b981, #0ea5e9); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" @click=${() => this.isEditing = true}>
                  <i class="ph ph-pencil"></i> Editar
                </button>
              ` : ''}
            </div>
          </div>
          
          <div class="view-body">
            ${this.isEditing ? html`
              <!-- ========================================================================= -->
              <!-- AQUI SE USA EL COMPONENTE WEB: recipe-form -->
              <!-- ========================================================================= -->
              <recipe-form 
                .receta=${r} 
                .isEditMode=${true}
                @save-receta=${this.updateReceta}
                @cancel-edit=${() => this.isEditing = false}>
              </recipe-form>
              <!-- ========================================================================= -->
            ` : html`
              ${r.nutricion ? html`
              <div class="nutrition-card slide-in">
                <div class="macros-grid">
                  <div class="macro-item"><i class="ph ph-fire" style="color: #ef4444"></i> <strong>Calorías:</strong> ${r.nutricion.calorias}</div>
                  <div class="macro-item"><i class="ph ph-steak" style="color: #f87171"></i> <strong>Proteínas:</strong> ${r.nutricion.proteinas}</div>
                  <div class="macro-item"><i class="ph ph-bread" style="color: #fbbf24"></i> <strong>Carbs:</strong> ${r.nutricion.carbohidratos}</div>
                  <div class="macro-item"><i class="ph ph-drop" style="color: #34d399"></i> <strong>Grasas:</strong> ${r.nutricion.grasas}</div>
                </div>
                <div class="tag-row">
                  <span class="nutrition-tag tag-healthy">${r.nutricion.semaforo}</span>
                  ${(r.nutricion.etiquetas || []).map(tag => html`<span class="nutrition-tag tag-other">${tag}</span>`)}
                </div>
              </div>
            ` : ''}
            
            <h3><i class="ph ph-list-numbers"></i> Ingredientes y Preparación:</h3>
            <div class="prep-list">
              ${descParts.map(line => {
                const text = line.trim();
                if (!text) return '';
                if (text.startsWith('-') || text.startsWith('•')) {
                  return html`
                    <li class="ing-item" @click=${this.toggleIngrediente}>
                      <span class="check-circle"></span>
                      <span>${text.replace(/^[-•]\s*/, '')}</span>
                    </li>
                  `;
                }
                if (/^\d+\./.test(text)) {
                  return html`<p class="step-text"><span style="color:#10b981; font-weight:bold;">${text.match(/^\d+\./)[0]}</span> ${text.replace(/^\d+\./, '')}</p>`;
                }
                return html`<p class="${text.endsWith(':') ? 'step-title' : 'step-text'}">${text}</p>`;
              })}
            </div>
          `}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
      <div class="page-container slide-in">
        <div class="page-header">
          <h1><i class="ph ph-chef-hat"></i> Mis Recetas</h1>
          <p class="subtitle">Guarda tus recetas favoritas en tu base de datos privada.</p>
          <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
            <button class="btn-glow" @click=${this.openModal}><i class="ph ph-plus"></i> Nueva Receta</button>
            <button class="btn-glow btn-ai" @click=${this.openImportModal}><i class="ph ph-magic-wand"></i> Importar de URL</button>
          </div>
        </div>
        
        ${this.errorMsg ? html`<div class="error-msg">${this.errorMsg}</div>` : ''}
        
        ${this.loading ? html`<p style="text-align:center; color:#10b981;">Cargando recetas...</p>` : ''}
        
        ${!this.loading && this.recetas.length === 0 && !this.errorMsg ? html`
          <div class="empty-state">
            <div style="font-size: 4rem; margin-bottom: 1rem; color: #64748b;"><i class="ph ph-book-open"></i></div>
            <p>Aún no has guardado ninguna receta.</p>
            <p>¡Empieza añadiendo tu primera receta!</p>
          </div>
        ` : ''}

        <div class="recetas-grid">
          ${this.recetas.map((r, index) => html`
            <!-- ========================================================================= -->
            <!-- AQUI SE USA EL COMPONENTE WEB: recipe-card -->
            <!-- ========================================================================= -->
            <recipe-card 
              .receta=${r} 
              .index=${index}
              @delete-receta=${(e) => this.deleteReceta(e.detail.id, e)}
              @open-view=${() => this.openRecetaView(r)}>
            </recipe-card>
            <!-- ========================================================================= -->
          `)}
        </div>
        
        ${this.renderModal()}
        ${this.renderImportModal()}
        ${this.renderRecetaView()}
        
      </div>
    `;
  }

  static styles = css`
    :host { display: block; color: var(--text-main, #f8fafc); font-family: 'Outfit', sans-serif; }
    
    .page-container { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
    
    .slide-in { animation: slideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .page-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 3rem;
    }
    
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #f8fafc; }
    .subtitle { color: #94a3b8; font-size: 1.1rem; margin-bottom: 1.5rem; }
    
    .btn-glow {
      background: linear-gradient(135deg, #10b981, #0ea5e9);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    .btn-glow:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.5);
    }
    
    .btn-ai {
      background: linear-gradient(135deg, #a855f7, #ec4899);
      box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
    }
    .btn-ai:hover {
      box-shadow: 0 8px 20px rgba(168, 85, 247, 0.6);
    }
    
    .w-100 { width: 100%; margin-top: 1rem; }
    
    .error-msg {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      text-align: center;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 3rem;
      background: rgba(255,255,255,0.02);
      border-radius: 20px;
      border: 1px dashed rgba(255,255,255,0.1);
    }
    
    .recetas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
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
    }
    
    .receta-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0.1;
      z-index: -1;
      transition: opacity 0.3s;
    }
    
    .receta-card:nth-child(4n+1)::before { background: linear-gradient(135deg, #10b981, #0ea5e9); }
    .receta-card:nth-child(4n+2)::before { background: linear-gradient(135deg, #f59e0b, #ef4444); }
    .receta-card:nth-child(4n+3)::before { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
    .receta-card:nth-child(4n+4)::before { background: linear-gradient(135deg, #14b8a6, #3b82f6); }

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

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }
    
    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    
    .modal-content {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2rem;
      width: 90%;
      max-width: 500px;
      transform: scale(0.9);
      transition: all 0.3s;
      position: relative;
    }
    
    .modal-content.active {
      transform: scale(1);
    }
    
    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
      transition: color 0.2s;
    }
    .modal-close:hover { color: white; }

    form { text-align: left; margin-top: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group.row { display: flex; gap: 1rem; }
    .col { flex: 1; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-size: 0.9rem; }
    .form-group input, .form-group textarea, .form-group select {
      width: 100%;
      padding: 0.8rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(0,0,0,0.2);
      color: white;
      font-family: inherit;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      outline: none;
      border-color: #10b981;
      background: rgba(16,185,129,0.05);
    }
    .form-group select option {
      background: #0f172a;
      color: white;
    }

    /* Receta View Modal */
    .view-modal {
      max-width: 650px;
      background: #0f172a;
      border: 1px solid rgba(16, 185, 129, 0.3);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .view-header {
      text-align: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 1.5rem;
    }
    .view-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      text-shadow: 0 10px 20px rgba(0,0,0,0.3);
      animation: float 3s ease-in-out infinite;
    }
    .view-header h2 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      color: #10b981;
    }
    .view-meta {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      color: #94a3b8;
      font-size: 1.1rem;
    }
    .view-body h3 {
      color: #f8fafc;
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }
    .prep-list {
      background: rgba(0,0,0,0.2);
      border-radius: 16px;
      padding: 1.5rem;
      max-height: 50vh;
      overflow-y: auto;
    }
    .prep-list::-webkit-scrollbar { width: 6px; }
    .prep-list::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.5); border-radius: 10px; }
    
    .ing-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
      color: #e2e8f0;
      font-size: 1.05rem;
    }
    .ing-item:hover {
      background: rgba(16,185,129,0.1);
      transform: translateX(5px);
    }
    .ing-item.checked {
      opacity: 0.5;
      text-decoration: line-through;
      background: rgba(0,0,0,0.3);
    }
    .ing-item.checked .check-circle {
      background: #10b981;
      border-color: #10b981;
    }
    .check-circle {
      width: 20px;
      height: 20px;
      border: 2px solid #64748b;
      border-radius: 50%;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .step-title {
      font-weight: 700;
      color: #10b981;
      font-size: 1.2rem;
      margin-top: 1.5rem;
      margin-bottom: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .step-text {
      color: #cbd5e1;
      line-height: 1.7;
      margin-bottom: 0.8rem;
      font-size: 1.05rem;
    }

    /* Nutrition Card */
    .nutrition-card {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 20px;
      padding: 1.2rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .macros-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .macro-item {
      background: rgba(0,0,0,0.2);
      padding: 8px 12px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #e2e8f0;
    }
    .macro-item i { font-size: 1.1rem; }
    .tag-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .nutrition-tag {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .tag-healthy { background: rgba(16, 185, 129, 0.2); color: #10b981; border-color: #10b981; }
    .tag-other { background: rgba(255,255,255,0.05); color: #94a3b8; }

    .btn-nutrition {
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      transition: all 0.3s;
      margin-bottom: 0.5rem;
    }
    .btn-nutrition:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
    }
    .btn-nutrition:disabled { opacity: 0.6; cursor: not-allowed; }
  `;
}
customElements.define('page-recetas', PageRecetas);