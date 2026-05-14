import { LitElement, html, css } from 'lit';

class AuthForm extends LitElement {
  static properties = {
    isLoginMode: { type: Boolean },
    loading: { type: Boolean }
  };

  createRenderRoot() {
    return this;
  }

  handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData);
    this.dispatchEvent(new CustomEvent('auth-submit', { 
      detail: body,
      bubbles: true, 
      composed: true 
    }));
  }

  toggleMode(e) {
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('toggle-mode', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        ${!this.isLoginMode ? html`
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" name="nombre" required placeholder="Tu nombre">
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input type="text" name="apellido" required placeholder="Tu apellido">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" name="telefono" required placeholder="09xxxxxxx">
            </div>
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" name="email" required placeholder="tu@email.com">
            </div>
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input type="text" name="direccion" required placeholder="Tu dirección">
          </div>
        ` : html`
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" name="email" required placeholder="tu@email.com">
          </div>
        `}
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" name="password" required placeholder="••••••••">
        </div>
        
        <button type="submit" class="btn-primary" ?disabled=${this.loading}>
          ${this.loading ? 'Procesando...' : (this.isLoginMode ? 'Entrar' : 'Registrarse')}
        </button>
      </form>
      
      <div class="toggle-mode">
        ${this.isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
        <a href="#" @click=${this.toggleMode}>
          ${this.isLoginMode ? 'Regístrate aquí' : 'Inicia sesión'}
        </a>
      </div>
    `;
  }
}
customElements.define('auth-form', AuthForm);