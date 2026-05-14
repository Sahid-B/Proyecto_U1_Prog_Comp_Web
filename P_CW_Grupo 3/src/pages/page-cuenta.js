import { LitElement, html, css } from 'lit';
import '../components/auth-form.js';

class PageCuenta extends LitElement {
  static properties = {
    user: { type: Object },
    isLoginMode: { type: Boolean },
    loading: { type: Boolean },
    errorMsg: { type: String },
    activeAdminView: { type: String },
    adminData: { type: Object }
  };

  constructor() {
    super();
    this.user = null;
    this.isLoginMode = true;
    this.loading = false;
    this.errorMsg = '';
    this.activeAdminView = 'menu';
    this.adminData = null;
    this.checkAuth();
  }

  async checkAuth() {
    const token = localStorage.getItem('planComer_token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.ok) {
        this.user = data.user;
      } else {
        localStorage.removeItem('planComer_token');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async handleSubmit(e) {
    if (e.preventDefault) e.preventDefault();
    this.errorMsg = '';
    this.loading = true;

    const body = e.detail;

    const endpoint = this.isLoginMode ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch('http://localhost:3001' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error en autenticación');

      if (this.isLoginMode) {
        localStorage.setItem('planComer_token', data.token);
        this.user = data.user;
      } else {
        this.isLoginMode = true;
        this.errorMsg = '¡Registro exitoso! Por favor, inicia sesión.';
      }
    } catch (err) {
      this.errorMsg = err.message;
    } finally {
      this.loading = false;
    }
  }

  logout() {
    localStorage.removeItem('planComer_token');
    this.user = null;
    this.activeAdminView = 'menu';
    localStorage.removeItem('planComer_currentPlan');
  }

  async fetchAdminData(type) {
    this.activeAdminView = type;
    if (type === 'config') return;

    this.loading = true;
    const token = localStorage.getItem('planComer_token');

    try {
      const res = await fetch(`http://localhost:3001/api/admin/${type}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.ok) {
        if (type === 'users') this.adminData = data.users;
        if (type === 'stats') this.adminData = data.stats;
        if (type === 'recetas') this.adminData = data.recetas;
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async deleteUser(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción es irreversible.')) return;

    const token = localStorage.getItem('planComer_token');
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.ok) {
        this.fetchAdminData('users');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async updateUserRole(id, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const token = localStorage.getItem('planComer_token');
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rol: newRole })
      });
      const data = await res.json();
      if (data.ok) {
        this.fetchAdminData('users');
      }
    } catch (e) {
      console.error(e);
    }
  }

  renderAuthForm() {
    return html`
      <div class="auth-card slide-in">
        <div class="avatar">
          <img src="/img/usuario.png" alt="User Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
        </div>
        <h2>${this.isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
        <p class="subtitle">Accede a tus planes guardados y recetas.</p>
        
        ${this.errorMsg ? html`<div class="error-msg">${this.errorMsg}</div>` : ''}
        
        <!-- ========================================================================= -->
        <!-- AQUI SE USA EL COMPONENTE WEB: auth-form -->
        <!-- ========================================================================= -->
        <auth-form 
          .isLoginMode=${this.isLoginMode} 
          .loading=${this.loading}
          @auth-submit=${this.handleSubmit}
          @toggle-mode=${() => { this.isLoginMode = !this.isLoginMode; this.errorMsg = ''; }}>
        </auth-form>
        <!-- ========================================================================= -->
      </div>
    `;
  }

  renderAdminView() {
    if (this.activeAdminView === 'menu') {
      return html`
        <div class="admin-actions">
          <button class="btn-admin" @click=${() => this.fetchAdminData('users')}><i class="ph ph-users"></i> Gestionar Usuarios</button>
          <button class="btn-admin" @click=${() => this.fetchAdminData('recetas')}><i class="ph ph-cooking-pot"></i> Moderar Recetas</button>
          <button class="btn-admin" @click=${() => this.fetchAdminData('stats')}><i class="ph ph-chart-line"></i> Estadísticas Globales</button>
          
        </div>
      `;
    }

    if (this.loading) {
      return html`<p style="color: #10b981; margin: 2rem 0;">Cargando datos...</p>`;
    }

    if (this.activeAdminView === 'users') {
      return html`
        <div class="admin-data-view">
          <button class="btn-back" @click=${() => this.activeAdminView = 'menu'}><i class="ph ph-arrow-left"></i> Volver</button>
          <h3>Usuarios Registrados</h3>
          <div class="table-container">
            <table>
              <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
              ${(this.adminData || []).map(u => html`
                <tr>
                  <td>${u.nombre}</td>
                  <td>${u.email}</td>
                  <td><span class="role-badge ${u.rol}">${u.rol}</span></td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-icon" title="Cambiar Rol" @click=${() => this.updateUserRole(u.id, u.rol)}><i class="ph ph-swap"></i></button>
                      ${u.id !== this.user.id ? html`
                        <button class="btn-icon delete" title="Eliminar" @click=${() => this.deleteUser(u.id)}><i class="ph ph-trash"></i></button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `)}
            </table>
          </div>
        </div>
      `;
    }

    if (this.activeAdminView === 'recetas') {
      return html`
        <div class="admin-data-view">
          <button class="btn-back" @click=${() => this.activeAdminView = 'menu'}><i class="ph ph-arrow-left"></i> Volver</button>
          <h3>Recetas de Usuarios</h3>
          <div class="table-container">
            <table>
              <tr><th>Nombre</th><th>Autor</th><th>Categoría</th></tr>
              ${(this.adminData || []).map(r => html`
                <tr>
                  <td>${r.nombre}</td>
                  <td>${r.autor}</td>
                  <td><span class="role-badge user">${r.categoria || 'General'}</span></td>
                </tr>
              `)}
            </table>
          </div>
        </div>
      `;
    }

    if (this.activeAdminView === 'stats') {
      return html`
        <div class="admin-data-view">
          <button class="btn-back" @click=${() => this.activeAdminView = 'menu'}><i class="ph ph-arrow-left"></i> Volver</button>
          <h3><i class="ph ph-chart-pie"></i> Estadísticas Globales</h3>
          <div class="stats-grid admin-stats">
            <div class="stat">
              <i class="ph ph-users-three" style="font-size: 1.5rem; color: #3b82f6; margin-bottom: 5px;"></i>
              <span class="value">${this.adminData?.totalUsuarios || 0}</span>
              <span class="label">Usuarios</span>
            </div>
            <div class="stat">
              <i class="ph ph-magic-wand" style="font-size: 1.5rem; color: #a855f7; margin-bottom: 5px;"></i>
              <span class="value">${this.adminData?.totalPlanes || 0}</span>
              <span class="label">Planes Gen.</span>
            </div>
          </div>
          <h4><i class="ph ph-storefront"></i> Productos por Tienda</h4>
          <ul class="store-list">
            ${(this.adminData?.productosPorTienda || []).map(t => html`
              <li><strong>${t.tienda}</strong> <span>${t.total_productos} prods</span></li>
            `)}
          </ul>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
            <div>
              <h4 style="color: #fca5a5;"><i class="ph ph-trend-up"></i> Más Caros</h4>
              <ul class="mini-list">
                ${(this.adminData?.topExpensive || []).map(p => html`
                  <li>${p.nombre.substring(0, 15)}... <span>$${parseFloat(p.precio).toFixed(2)}</span></li>
                `)}
              </ul>
            </div>
            <div>
              <h4 style="color: #6ee7b7;"><i class="ph ph-trend-down"></i> Más Baratos</h4>
              <ul class="mini-list">
                ${(this.adminData?.topCheap || []).map(p => html`
                  <li>${p.nombre.substring(0, 15)}... <span>$${parseFloat(p.precio).toFixed(2)}</span></li>
                `)}
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeAdminView === 'config') {
      return html`
        <div class="admin-data-view">
          <button class="btn-back" @click=${() => this.activeAdminView = 'menu'}><i class="ph ph-arrow-left"></i> Volver</button>
          <h3><i class="ph ph-gear"></i> Configuración del Sistema</h3>
          
          <div class="config-list">
            <div class="config-item">
              <div class="config-info">
                <strong>Modo Mantenimiento</strong>
                <span>Desactiva el acceso a usuarios externos</span>
              </div>
              <label class="switch">
                <input type="checkbox">
                <span class="slider round"></span>
              </label>
            </div>

            <div class="config-item">
              <div class="config-info">
                <strong>Notificaciones Email</strong>
                <span>Enviar avisos de nuevos planes</span>
              </div>
              <label class="switch">
                <input type="checkbox" checked>
                <span class="slider round"></span>
              </label>
            </div>

            <div class="config-item">
              <div class="config-info">
                <strong>Modelo de IA</strong>
                <span>Versión del motor de sugerencias</span>
              </div>
              <select class="admin-select">
                <option>GPT-4o Optimized</option>
                <option>Claude 3.5 Sonnet</option>
                <option>Llama 3 (Local)</option>
              </select>
            </div>

            <button class="btn-admin mt-1" style="width:100%; background:rgba(16,185,129,0.1); color:#10b981; border-color:rgba(16,185,129,0.3)">
              <i class="ph ph-database"></i> Realizar Backup de Base de Datos
            </button>
          </div>
        </div>
      `;
    }
  }

  renderAdminDashboard() {
    return html`
      <div class="profile-card slide-in admin-card">
        <div class="avatar admin-avatar">
          <img src="/img/usuario.png" alt="Admin Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
        </div>
        <h2>Panel de Administrador</h2>
        <p class="email">${this.user.email}</p>
        <div class="badge-pro">ADMIN</div>
        
        ${this.renderAdminView()}
        
        <button class="btn-logout mt-1" @click=${this.logout}><i class="ph ph-sign-out"></i> Cerrar Sesión</button>
      </div>
    `;
  }

  renderUserProfile() {
    return html`
      <div class="profile-card slide-in">
        <div class="avatar">
          <img src="/img/usuario.png" alt="User Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
        </div>
        <h2>${this.user.nombre || 'Usuario PlanComer'}</h2>
        <p class="email">${this.user.email}</p>
        <div class="badge-pro">Plan Gratis</div>
        
        <div class="stats-grid">
          <div class="stat">
            <span class="value">0</span>
            <span class="label">Recetas</span>
          </div>
          <div class="stat">
            <span class="value">1</span>
            <span class="label">Planes</span>
          </div>
          <div class="stat">
            <span class="value">$0</span>
            <span class="label">Ahorrados</span>
          </div>
        </div>
        
        <button class="btn-upgrade"><i class="ph ph-rocket-launch"></i> Actualizar a PRO</button>
        <button class="btn-logout" @click=${this.logout}><i class="ph ph-sign-out"></i> Cerrar Sesión</button>
      </div>
    `;
  }

  render() {
    return html`
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
      <div class="page-container">
        ${!this.user ? this.renderAuthForm() :
        (this.user.rol === 'admin' ? this.renderAdminDashboard() : this.renderUserProfile())}
      </div>
    `;
  }

  static styles = css`
    :host { display: block; color: var(--text-main, #f8fafc); font-family: 'Outfit', sans-serif; }
    
    .page-container { 
      max-width: 650px; 
      margin: 0 auto; 
      padding: 4rem 2rem; 
      display: flex;
      justify-content: center;
    }
    
    .slide-in { animation: slideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .profile-card, .auth-card {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 3rem 2rem;
      backdrop-filter: blur(16px);
      text-align: center;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    
    .admin-card {
      border-color: rgba(234, 179, 8, 0.3);
      box-shadow: 0 25px 50px -12px rgba(234, 179, 8, 0.2);
    }
    
    .avatar {
      width: 80px;
      height: 80px;
      background: rgba(0,0,0,0.2);
      border: 2px solid #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      overflow: hidden;
    }
    
    .admin-avatar {
      border-color: #eab308;
    }
    
    h2 { margin: 0 0 0.5rem; font-size: 1.8rem; }
    .subtitle, .email { color: #94a3b8; margin: 0 0 1.5rem; }
    
    .badge-pro {
      display: inline-block;
      background: rgba(148, 163, 184, 0.2);
      color: #cbd5e1;
      padding: 0.4rem 1rem;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 2.5rem;
    }
    
    .admin-card .badge-pro {
      background: rgba(234, 179, 8, 0.2);
      color: #fde047;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding: 1.5rem 0;
    }
    
    .stat { display: flex; flex-direction: column; }
    .value { font-size: 1.8rem; font-weight: 700; color: #10b981; }
    .label { font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    
    form { text-align: left; margin-bottom: 1.5rem; }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group { margin-bottom: 1.2rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-size: 0.9rem; }
    .form-group input {
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
    .form-group input:focus {
      outline: none;
      border-color: #10b981;
      background: rgba(16,185,129,0.05);
    }
    
    .btn-primary {
      width: 100%;
      background: #10b981;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary:hover { background: #059669; }
    .btn-primary:disabled { background: #64748b; cursor: not-allowed; }
    
    .error-msg {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      padding: 0.8rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    
    .toggle-mode { color: #94a3b8; font-size: 0.9rem; }
    .toggle-mode a { color: #10b981; text-decoration: none; font-weight: 600; }
    
    .admin-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .btn-admin {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      padding: 1rem;
      border-radius: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-admin:hover { background: rgba(234, 179, 8, 0.15); border-color: #eab308; }
    
    .btn-upgrade {
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      width: 100%;
      margin-bottom: 1rem;
      transition: all 0.3s;
    }
    
    .btn-logout {
      background: transparent;
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.8rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: all 0.3s;
    }
    .btn-logout:hover { background: rgba(239, 68, 68, 0.1); }
    .mt-1 { margin-top: 1rem; }

    /* Admin Views Styles */
    .admin-data-view {
      text-align: left;
      animation: slideIn 0.3s ease;
      margin-bottom: 2rem;
    }
    .btn-back {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0;
      margin-bottom: 1rem;
      transition: color 0.2s;
    }
    .btn-back:hover { color: #f8fafc; }
    .admin-data-view h3 {
      color: #f8fafc;
      margin-top: 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 0.5rem;
    }
    .table-container {
      overflow-x: auto;
      margin-top: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    th, td {
      padding: 0.8rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      text-align: left;
    }
    th { color: #cbd5e1; font-weight: 600; }
    td { color: #94a3b8; }
    .role-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }
    .role-badge.admin { background: rgba(234, 179, 8, 0.2); color: #fde047; }
    .role-badge.user { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
    
    .admin-stats { border: none; padding: 0; }
    .admin-data-view h4 { color: #cbd5e1; margin-top: 1.5rem; }
    .store-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .store-list li {
      display: flex;
      justify-content: space-between;
      padding: 0.8rem;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      margin-bottom: 0.5rem;
      color: #cbd5e1;
    }
    .store-list li strong { color: #10b981; }

    .action-btns {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border-color: #10b981;
    }

    .btn-icon.delete:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border-color: #ef4444;
    }

    .mini-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.8rem;
    }
    .mini-list li {
      display: flex;
      justify-content: space-between;
      padding: 0.4rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #94a3b8;
    }
    .mini-list li span { font-weight: 600; color: #f8fafc; }

    /* Switch Style */
    .config-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: rgba(0,0,0,0.2);
      border-radius: 12px;
      margin-bottom: 0.8rem;
    }
    .config-info { text-align: left; display: flex; flex-direction: column; }
    .config-info strong { color: #f8fafc; font-size: 0.95rem; }
    .config-info span { color: #94a3b8; font-size: 0.8rem; }

    .admin-select {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      padding: 0.5rem;
      border-radius: 8px;
      outline: none;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 24px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #334155;
      transition: .4s;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 18px; width: 18px;
      left: 3px; bottom: 3px;
      background-color: white;
      transition: .4s;
    }
    input:checked + .slider { background-color: #10b981; }
    input:checked + .slider:before { transform: translateX(22px); }
    .slider.round { border-radius: 34px; }
    .slider.round:before { border-radius: 50%; }
  `;
}
customElements.define('page-cuenta', PageCuenta);