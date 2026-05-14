import { LitElement, html, css } from 'lit';

class PageHome extends LitElement {
  render() {
    return html`
      <div class="hero-section">
        <div class="hero-content">
          <div class="badge">Revoluciona tu cocina</div>
          <h1 class="title">Tu alimentación,<br> <span class="highlight">organizada con IA</span></h1>
          <p class="subtitle">
            Planifica tus comidas semanales, descubre nuevas recetas y genera tu lista de compras automáticamente. Ahorra tiempo, dinero y come más sano.
          </p>
          <div class="cta-group">
            <a href="/plan" class="btn btn-primary">Crear mi Plan</a>
            <a href="/ia" class="btn btn-ai">✨ Probar IA</a>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="card float-1">
            <div class="card-icon">📅</div>
            <div class="card-text">
              <h4>Plan Semanal</h4>
              <p>Organizado</p>
            </div>
          </div>
          <div class="card float-2">
            <div class="card-icon">🛒</div>
            <div class="card-text">
              <h4>Compras</h4>
              <p>Optimizadas</p>
            </div>
          </div>
          <div class="card float-3">
            <div class="card-icon">👨‍🍳</div>
            <div class="card-text">
              <h4>Recetas</h4>
              <p>Deliciosas</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .hero-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: calc(100vh - 80px);
      padding: 0 5rem;
      max-width: 1400px;
      margin: 0 auto;
      gap: 4rem;
    }

    .hero-content {
      flex: 1;
      max-width: 600px;
    }

    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      letter-spacing: 0.5px;
    }

    .title {
      font-size: 4.5rem;
      font-weight: 700;
      line-height: 1.1;
      margin: 0 0 1.5rem 0;
      color: #f8fafc;
    }

    .highlight {
      background: linear-gradient(135deg, #10b981, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .subtitle {
      font-size: 1.2rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 2.5rem;
    }

    .cta-group {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary {
      background: #10b981;
      color: #0f1115;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
      background: #0ea5e9;
      color: white;
    }

    .btn-ai {
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .btn-ai:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(168, 85, 247, 0.5);
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
      transform: translateY(-2px);
    }

    .hero-visual {
      flex: 1;
      position: relative;
      height: 500px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      padding: 1.5rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      position: absolute;
      transition: transform 0.3s ease;
    }

    .card:hover {
      transform: scale(1.05) !important;
      border-color: rgba(16, 185, 129, 0.3);
      z-index: 10;
    }

    .card-icon {
      font-size: 2.5rem;
      background: rgba(255,255,255,0.05);
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
    }

    .card-text h4 {
      margin: 0 0 0.2rem 0;
      color: #f8fafc;
      font-size: 1.1rem;
    }

    .card-text p {
      margin: 0;
      color: #10b981;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .float-1 {
      top: 10%;
      right: 15%;
      animation: float 6s ease-in-out infinite;
    }

    .float-2 {
      bottom: 20%;
      left: 10%;
      animation: float 7s ease-in-out infinite 1s;
    }

    .float-3 {
      top: 45%;
      right: -5%;
      animation: float 5s ease-in-out infinite 2s;
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1024px) {
      .hero-section {
        flex-direction: column;
        padding: 3rem 2rem;
        text-align: center;
        gap: 3rem;
      }
      .cta-group {
        justify-content: center;
      }
      .hero-visual {
        width: 100%;
        height: 400px;
      }
    }
  `;
}

customElements.define('page-home', PageHome);