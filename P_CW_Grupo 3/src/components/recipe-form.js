import { LitElement, html, css } from 'lit';

class RecipeForm extends LitElement {
  static properties = {
    receta: { type: Object },
    isEditMode: { type: Boolean }
  };

  createRenderRoot() {
    return this; // Render en Light DOM para heredar estilos de page-recetas
  }

  handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    this.dispatchEvent(new CustomEvent('save-receta', { 
      detail: { formData },
      bubbles: true, 
      composed: true 
    }));
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent('cancel-edit', { bubbles: true, composed: true }));
  }

  render() {
    const r = this.receta || {};
    return html`
      <form id="form-nueva-receta" @submit=${this.handleSubmit}>
        <div class="form-group">
          <label>Nombre de la Receta</label>
          <input type="text" name="nombre" required placeholder="Ej: Pollo Asado" .value=${r.nombre || ''}>
        </div>
        <div class="form-group row">
          <div class="col">
            <label>Tiempo (min)</label>
            <input type="number" name="tiempo_min" .value=${r.tiempo_min || 30} required>
          </div>
          <div class="col">
            <label>Porciones</label>
            <input type="number" name="porciones" .value=${r.porciones || 2} required>
          </div>
          <div class="col">
            <label>Categoría</label>
            <select name="categoria" .value=${r.categoria || 'ph-fork-knife'}>
              <option value="ph-fork-knife">General</option>
              <option value="ph-cooking-pot">Guisos / Sopas</option>
              <option value="ph-bowl-food">Ensaladas / Bowls</option>
              <option value="ph-pizza">Masas / Pizzas</option>
              <option value="ph-hamburger">Comida Rápida</option>
              <option value="ph-carrot">Vegetariano</option>
              <option value="ph-fish-simple">Mariscos</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Instrucciones / Preparación</label>
          <textarea name="descripcion" rows="${this.isEditMode ? 6 : 4}" placeholder="Pasos para prepararla..." .value=${r.descripcion || ''}></textarea>
        </div>
        
        ${this.isEditMode ? html`
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn-glow w-100">Guardar Cambios</button>
            <button type="button" class="btn-glow w-100" style="background:#64748b; box-shadow:none;" @click=${this.handleCancel}>Cancelar</button>
          </div>
        ` : html`
          <button type="submit" class="btn-glow w-100">Guardar Receta</button>
        `}
      </form>
    `;
  }
}
customElements.define('recipe-form', RecipeForm);