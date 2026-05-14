import { LitElement, html, css } from 'lit';

class PlanWeekly extends LitElement {
  static properties = {
    dias: { type: Array },
    selectedMeal: { type: Object },
    isModalOpen: { type: Boolean },
    isEditMode: { type: Boolean },
    isModalEditing: { type: Boolean },
    nutricionLoading: { type: Boolean }
  };

  constructor() {
    super();
    this.selectedMeal = null;
    this.isModalOpen = false;
    this.isEditMode = false;
    this.isModalEditing = false;
    this.nutricionLoading = false;
    
    // Fallback: datos por defecto
    this.dias = [
      { 
        nombre: 'Lunes', 
        desayuno: { tipo: 'Desayuno', icono: 'ph-sun-horizon', nombre: 'Batido verde energizante', ingredientes: ['1 taza de espinaca fresca', '1 manzana verde en trozos', '2 ramas de apio', '1 vaso de agua o leche de almendras', '1 cucharada de chía'], prep: '1. Lava bien todos los vegetales y la fruta.\n2. Corta la manzana y el apio en trozos medianos.\n3. Coloca todo en la licuadora junto con el agua o leche y la chía.\n4. Licúa a velocidad alta por 1-2 minutos hasta obtener una mezcla homogénea.\n5. Sirve inmediatamente.' },
        almuerzo: { tipo: 'Almuerzo', icono: 'ph-sun', nombre: 'Pollo a la plancha con arroz integral', ingredientes: ['200g de pechuga de pollo', '1 taza de arroz integral cocido', 'Especias al gusto (sal, pimienta, ajo en polvo)', '1 cucharada de aceite de oliva', 'Ensalada mixta (lechuga, tomate)'], prep: '1. Sazona la pechuga de pollo con sal, pimienta y ajo en polvo por ambos lados.\n2. Calienta el aceite de oliva en un sartén a fuego medio-alto.\n3. Cocina el pollo durante 5-7 minutos por cada lado hasta que esté dorado y bien cocido en el centro.\n4. Sirve acompañado del arroz integral previamente cocido y la ensalada fresca.' },
        cena: { tipo: 'Cena', icono: 'ph-moon', nombre: 'Ensalada de atún y garbanzos', ingredientes: ['1 lata de atún al natural', '1/2 taza de garbanzos cocidos', '1/4 de cebolla morada picada', '1 tomate en cubos', 'Zumo de medio limón', '1 cucharadita de aceite de oliva'], prep: '1. Escurre el agua o aceite del atún y ponlo en un bol grande.\n2. Añade los garbanzos, la cebolla finamente picada y el tomate.\n3. Aliña con el zumo de limón, aceite de oliva, sal y pimienta.\n4. Mezcla todo suavemente para no deshacer los ingredientes y sirve frío.' }
      },
      { 
        nombre: 'Martes', 
        desayuno: { tipo: 'Desayuno', icono: 'ph-sun-horizon', nombre: 'Huevos revueltos con vegetales', ingredientes: ['2 huevos grandes', '1/4 de pimiento rojo picado', '1/4 de cebolla picada', '1 puñado de espinacas', '1 chorrito de leche', 'Sal y pimienta'], prep: '1. Bate los huevos en un bol con un chorrito de leche, sal y pimienta.\n2. En un sartén con un poco de aceite, sofríe la cebolla y el pimiento por 2 minutos.\n3. Añade las espinacas y cocina por 1 minuto más hasta que se reduzcan.\n4. Vierte los huevos batidos y revuelve constantemente a fuego medio-bajo hasta que estén cocidos al gusto.' },
        almuerzo: { tipo: 'Almuerzo', icono: 'ph-sun', nombre: 'Guiso de lentejas con carne', ingredientes: ['1 taza de lentejas (remojadas)', '150g de carne de res en cubos', '1 zanahoria en rodajas', '1 papa en cubos', '1/2 cebolla', '2 dientes de ajo', '1 hoja de laurel'], prep: '1. En una olla, sofríe la cebolla, el ajo y la carne hasta que dore.\n2. Añade las lentejas, la zanahoria y la papa.\n3. Cubre con agua o caldo de carne y añade la hoja de laurel, sal y especias al gusto.\n4. Cocina a fuego medio durante 35-40 minutos o hasta que las lentejas estén tiernas y el caldo espese.' },
        cena: { tipo: 'Cena', icono: 'ph-moon', nombre: 'Crema de verduras', ingredientes: ['1 calabacín', '1 zanahoria', '1 trozo de calabaza', '1/2 cebolla', '1 cucharada de queso crema', 'Caldo de vegetales'], prep: '1. Pela y corta todas las verduras en trozos medianos.\n2. Ponlas a hervir en una olla con el caldo de vegetales hasta que estén muy tiernas (unos 20 minutos).\n3. Retira del fuego, añade el queso crema para dar textura y licúa todo hasta obtener una crema suave y sin grumos.\n4. Ajusta la sal y sirve caliente.' }
      },
      { 
        nombre: 'Miércoles', 
        desayuno: { tipo: 'Desayuno', icono: 'ph-sun-horizon', nombre: 'Porridge de avena con manzana', ingredientes: ['1/2 taza de hojuelas de avena', '1 taza de leche (o agua)', '1/2 manzana picada en cubos', '1 pizca de canela', '1 cucharadita de miel o endulzante'], prep: '1. En una olla pequeña, calienta la leche junto con la avena a fuego medio.\n2. Revuelve constantemente durante unos 5 minutos hasta que espese y absorba el líquido.\n3. Apaga el fuego, sirve en un tazón.\n4. Decora con los cubos de manzana fresca, espolvorea canela por encima y añade la miel.' },
        almuerzo: { tipo: 'Almuerzo', icono: 'ph-sun', nombre: 'Filete de pescado al horno', ingredientes: ['1 filete de pescado blanco (tilapia, merluza)', '1 papa en rodajas finas', '1/2 cebolla en julianas', 'Jugo de 1 limón', 'Aceite de oliva, sal y orégano'], prep: '1. Precalienta el horno a 200°C.\n2. En una bandeja de horno, coloca una cama con las rodajas de papa y la cebolla.\n3. Pon el filete de pescado encima, sazona con sal, orégano, el jugo de limón y un chorrito de aceite de oliva.\n4. Hornea por 20-25 minutos hasta que las papas estén tiernas y el pescado se desmenuce fácilmente.' },
        cena: { tipo: 'Cena', icono: 'ph-moon', nombre: 'Tostadas integrales con aguacate', ingredientes: ['2 rebanadas de pan integral', '1/2 aguacate maduro', '1 chorrito de aceite de oliva', 'Sal marina y pimienta negra', 'Opcional: tomate cherry o huevo pochado'], prep: '1. Tuesta las rebanadas de pan integral hasta que estén crujientes.\n2. En un plato, pisa el aguacate con un tenedor hasta hacerlo puré y sazona con sal, pimienta y limón.\n3. Unta la mezcla de aguacate sobre las tostadas calientes.\n4. Termina con un hilo de aceite de oliva y acompaña con tomates cherry o un huevo si lo deseas.' }
      },
      { 
        nombre: 'Jueves', 
        desayuno: { tipo: 'Desayuno', icono: 'ph-sun-horizon', nombre: 'Panqueques de avena y plátano', ingredientes: ['1 plátano maduro', '1 huevo', '1/2 taza de avena molida', 'Un chorrito de esencia de vainilla', 'Aceite de coco para el sartén'], prep: '1. En un bol, aplasta el plátano hasta hacerlo puré.\n2. Añade el huevo, la avena y la vainilla. Mezcla bien hasta integrar todo.\n3. Calienta un sartén antiadherente con un poco de aceite de coco a fuego medio-bajo.\n4. Vierte pequeñas porciones de la masa, cocina 2 minutos por lado hasta que salgan burbujas y voltea.\n5. Sirve con fruta fresca o miel.' },
        almuerzo: { tipo: 'Almuerzo', icono: 'ph-sun', nombre: 'Estofado de pollo con vegetales', ingredientes: ['2 piezas de pollo (muslo o pechuga)', '1 zanahoria cortada en dados', '1/2 taza de arvejas (guisantes)', '1 tomate licuado', '1/4 cebolla', 'Caldo de pollo'], prep: '1. Dora el pollo en una olla con un poco de aceite y resérvalo.\n2. En la misma olla, haz un sofrito con la cebolla y el tomate licuado.\n3. Regresa el pollo, añade la zanahoria, las arvejas y cubre con un poco de caldo de pollo.\n4. Tapa y cocina a fuego lento por 25-30 minutos para que los sabores se mezclen y la salsa reduzca.' },
        cena: { tipo: 'Cena', icono: 'ph-moon', nombre: 'Wrap de pollo y lechuga', ingredientes: ['1 tortilla integral grande', 'Restos de pollo desmenuzado', 'Hojas de lechuga lavadas', 'Tomate en rodajas finas', '1 cucharada de yogurt natural o mayonesa ligera'], prep: '1. Calienta ligeramente la tortilla en un sartén para que sea más flexible.\n2. Unta la base de la tortilla con el yogurt o mayonesa ligera.\n3. Coloca una capa de lechuga, rodajas de tomate y el pollo desmenuzado en el centro.\n4. Enrolla doblando primero los extremos hacia adentro para que no se desarme.\n5. Corta por la mitad y sirve.' }
      },
      { 
        nombre: 'Viernes', 
        desayuno: { tipo: 'Desayuno', icono: 'ph-sun-horizon', nombre: 'Bowl de yogurt con frutas y granola', ingredientes: ['1 taza de yogurt natural o griego', '1/2 taza de fresas picadas', '1/4 de taza de arándanos', '2 cucharadas de granola', '1 cucharada de miel'], prep: '1. Vierte el yogurt en un bol o tazón profundo.\n2. Lava y corta las fresas, y colócalas sobre el yogurt junto con los arándanos.\n3. Espolvorea la granola por encima para darle un toque crujiente.\n4. Añade un hilo de miel para endulzar si lo prefieres. Sirve frío.' },
        almuerzo: { tipo: 'Almuerzo', icono: 'ph-sun', nombre: 'Ceviche de camarón', ingredientes: ['250g de camarones cocidos y pelados', 'Zumo de 4 limones', '1/2 cebolla morada picada finamente', '1 tomate picado en cubitos', 'Cilantro fresco picado', 'Sal, pimienta y salsa de tomate (opcional)'], prep: '1. En un recipiente de vidrio, mezcla los camarones con el zumo de limón y deja reposar 10 minutos.\n2. Añade la cebolla morada (previamente lavada con sal y agua fría), el tomate y el cilantro.\n3. Sazona con sal, pimienta y, si te gusta el estilo ecuatoriano, un chorrito de salsa de tomate y naranja.\n4. Mezcla bien y acompaña con chifles o patacones.' },
        cena: { tipo: 'Cena', icono: 'ph-moon', nombre: 'Hamburguesa casera saludable', ingredientes: ['1 pan de hamburguesa integral', '1 medallón de carne molida magra', 'Lechuga y tomate', '1 rodaja de queso bajo en grasa', 'Mostaza y ketchup'], prep: '1. Condimenta la carne molida con sal, pimienta y ajo en polvo, y dale forma de medallón.\n2. Cocina la carne en un sartén o plancha a fuego medio por ambos lados hasta que esté hecha.\n3. Coloca la rodaja de queso sobre la carne en el último minuto para que se derrita.\n4. Abre el pan, úntalo con mostaza y ketchup, coloca la carne, la lechuga y el tomate. Cierra y disfruta.' }
      }
    ];

    // Intentar leer de localStorage si existe un plan generado
    try {
      const savedPlanData = localStorage.getItem('planComer_currentPlan');
      if (savedPlanData) {
        const parsedData = JSON.parse(savedPlanData);
        if (parsedData && parsedData.plan && Array.isArray(parsedData.plan)) {
          // Mapear el formato de Groq al formato que espera el componente
          this.dias = parsedData.plan.map(d => ({
            nombre: d.dia,
            desayuno: { 
              tipo: 'Desayuno', icono: 'ph-sun-horizon', 
              nombre: d.desayuno.nombre || 'Desayuno libre', 
              ingredientes: d.desayuno.ingredientes || [], 
              prep: d.desayuno.preparacion || 'Sin instrucciones.' 
            },
            almuerzo: { 
              tipo: 'Almuerzo', icono: 'ph-sun', 
              nombre: d.almuerzo.nombre || 'Almuerzo libre', 
              ingredientes: d.almuerzo.ingredientes || [], 
              prep: d.almuerzo.preparacion || 'Sin instrucciones.' 
            },
            cena: { 
              tipo: 'Cena', icono: 'ph-moon', 
              nombre: d.cena.nombre || 'Cena libre', 
              ingredientes: d.cena.ingredientes || [], 
              prep: d.cena.preparacion || 'Sin instrucciones.' 
            }
          }));
        }
      }
    } catch (e) {
      console.error('Error al leer el plan del localStorage', e);
    }
  }

  openModal(meal) {
    if (this.isEditMode) return;
    this.selectedMeal = { ...meal, originalNombre: meal.nombre }; // Copia y guardar nombre para búsqueda
    this.isModalOpen = true;
    this.isModalEditing = false;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isModalEditing = false;
    setTimeout(() => { this.selectedMeal = null; }, 300); // Esperar animación
  }

  handleNameChange(e, diaIndex, mealType) {
    const newName = e.target.innerText.trim();
    if (this.dias[diaIndex] && this.dias[diaIndex][mealType]) {
      this.dias[diaIndex][mealType].nombre = newName;
    }
  }

  savePlan() {
    try {
      const savedPlanData = localStorage.getItem('planComer_currentPlan');
      if (savedPlanData) {
        const parsedData = JSON.parse(savedPlanData);
        if (parsedData && parsedData.plan) {
          parsedData.plan.forEach((p, index) => {
            if (this.dias[index]) {
              p.desayuno.nombre = this.dias[index].desayuno.nombre;
              p.almuerzo.nombre = this.dias[index].almuerzo.nombre;
              p.cena.nombre = this.dias[index].cena.nombre;
            }
          });
          localStorage.setItem('planComer_currentPlan', JSON.stringify(parsedData));
        }
      }
      // Actualizar vista
      this.requestUpdate();
    } catch(e) {
      console.error('Error guardando cambios manuales', e);
    }
  }

  async saveRecipeEdit() {
    if (!this.selectedMeal) return;
    
    // Aquí podrías llamar al backend si la receta tiene un ID
    // Por ahora actualizaremos el estado local y el localStorage
    const diaIndex = this.dias.findIndex(d => 
      d.desayuno.nombre === this.selectedMeal.originalNombre || 
      d.almuerzo.nombre === this.selectedMeal.originalNombre || 
      d.cena.nombre === this.selectedMeal.originalNombre
    );

    // Si no encontramos por nombre original (porque ya se cambió), 
    // tendríamos que buscar por una referencia más sólida. 
    // Para simplificar, asumiremos que el usuario edita lo que abrió.
    
    // Actualizar el plan principal
    this.dias = this.dias.map(dia => {
      const newDia = { ...dia };
      if (newDia.desayuno.nombre === this.selectedMeal.originalNombre) newDia.desayuno = { ...this.selectedMeal };
      if (newDia.almuerzo.nombre === this.selectedMeal.originalNombre) newDia.almuerzo = { ...this.selectedMeal };
      if (newDia.cena.nombre === this.selectedMeal.originalNombre) newDia.cena = { ...this.selectedMeal };
      return newDia;
    });

    this.savePlan();
    this.isModalEditing = false;
    this.requestUpdate();
    alert('Receta actualizada localmente. (Backend CRUD listo para integración)');
  }

  async analizarNutricion() {
    if (!this.selectedMeal) return;
    this.nutricionLoading = true;
    try {
      const res = await fetch('http://localhost:3001/api/analizar-nutricion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: this.selectedMeal.nombre,
          ingredientes: this.selectedMeal.ingredientes
        })
      });
      const data = await res.json();
      if (data.ok) {
        this.selectedMeal = { ...this.selectedMeal, nutricion: data.nutricion };
      } else {
        alert(data.error || 'No se pudo analizar.');
      }
    } catch(err) {
      console.error(err);
      alert('Error de conexión al analizar. ¿Seguro que reiniciaste el backend? Detalle: ' + err.message);
    } finally {
      this.nutricionLoading = false;
    }
  }

  renderMealSlot(meal, diaIndex, mealType) {
    return html`
      <div class="meal-slot ${this.isEditMode ? 'edit-mode' : ''}" @click=${() => this.openModal(meal)}>
        <span class="meal-icon"><i class="ph ${meal.icono}"></i></span>
        <div class="meal-info">
          <span class="meal-type">${meal.tipo}</span>
          ${this.isEditMode 
            ? html`<div class="meal-name editable" contenteditable="true" @blur=${(e) => this.handleNameChange(e, diaIndex, mealType)} @click=${e => e.stopPropagation()}>${meal.nombre}</div>`
            : html`<span class="meal-name">${meal.nombre}</span>`
          }
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
      <div class="weekly-grid">
        ${this.dias.map((dia, i) => html`
          <div class="day-card">
            <div class="day-header">${dia.nombre}</div>
            ${this.renderMealSlot(dia.desayuno, i, 'desayuno')}
            ${this.renderMealSlot(dia.almuerzo, i, 'almuerzo')}
            ${this.renderMealSlot(dia.cena, i, 'cena')}
          </div>
        `)}
      </div>

      <!-- Modal -->
      <div class="modal-overlay ${this.isModalOpen ? 'active' : ''}" @click=${this.closeModal}>
        <div class="modal-content ${this.isModalOpen ? 'active' : ''}" @click=${e => e.stopPropagation()}>
          <button class="modal-close" @click=${this.closeModal}>&times;</button>
          
          ${this.selectedMeal ? html`
            <div class="modal-header" style="flex-direction: column; text-align: center; gap: 5px;">
              <span class="modal-icon"><i class="ph ${this.selectedMeal.icono}"></i></span>
              <div class="modal-type">${this.selectedMeal.tipo}</div>
              ${this.isModalEditing 
                ? html`<input class="edit-input title-input" style="text-align: center;" .value=${this.selectedMeal.nombre} @input=${e => this.selectedMeal.nombre = e.target.value} />`
                : html`<h2 class="modal-title" style="font-size: 2rem; margin: 10px 0;">${this.selectedMeal.nombre}</h2>`
              }
              
              <div style="display: flex; gap: 15px; justify-content: center; color: #94a3b8; font-size: 0.9rem; margin-bottom: 15px;">
                <span><i class="ph ph-clock"></i> ${this.selectedMeal.tiempo_min || 30} min</span>
                <span><i class="ph ph-users"></i> ${this.selectedMeal.porciones || 2} porciones</span>
              </div>

              <div class="modal-actions" style="justify-content: center; width: 100%;">
                ${this.isModalEditing 
                  ? html`
                      <button class="btn-glow" @click=${this.saveRecipeEdit}><i class="ph ph-floppy-disk"></i> Guardar Cambios</button>
                      <button class="btn-outline" style="padding: 0.6rem 1.5rem;" @click=${() => this.isModalEditing = false}><i class="ph ph-x"></i> Cancelar</button>
                    `
                  : html`
                      <button class="btn-glow btn-ai" @click=${this.analizarNutricion} ?disabled=${this.nutricionLoading}>
                        ${this.nutricionLoading ? html`⏳ ...` : html`🧬 Nutrición`}
                      </button>
                      <button class="btn-glow btn-edit" style="background: rgba(16, 185, 129, 0.1); border-color: #10b981; color: #10b981;" @click=${() => this.isModalEditing = true}>
                        <i class="ph ph-pencil"></i> Editar Receta
                      </button>
                    `
                }
              </div>
            </div>
            
            ${this.selectedMeal.nutricion && !this.isModalEditing ? html`
              <div class="nutricion-box">
                <div class="nutri-item"><i class="ph ph-fire" style="color: #ef4444"></i> <strong>Calorías:</strong> ${this.selectedMeal.nutricion.calorias}</div>
                <div class="nutri-item"><i class="ph ph-steak" style="color: #f87171"></i> <strong>Proteínas:</strong> ${this.selectedMeal.nutricion.proteinas}</div>
                <div class="nutri-item"><i class="ph ph-bread" style="color: #fbbf24"></i> <strong>Carbs:</strong> ${this.selectedMeal.nutricion.carbohidratos}</div>
                <div class="nutri-item"><i class="ph ph-drop" style="color: #34d399"></i> <strong>Grasas:</strong> ${this.selectedMeal.nutricion.grasas}</div>
                <div class="nutri-badges">
                  <span class="badge"><i class="ph ph-check-circle"></i> ${this.selectedMeal.nutricion.semaforo}</span>
                  ${(this.selectedMeal.nutricion.etiquetas || []).map(e => html`<span class="badge badge-outline"><i class="ph ph-tag"></i> ${e}</span>`)}
                </div>
              </div>
            ` : ''}
            
            <div class="modal-body">
              <div class="section">
                <h3><i class="ph ph-shopping-cart"></i> Ingredientes:</h3>
                ${this.isModalEditing 
                  ? html`
                      <textarea class="edit-input area-input" 
                        .value=${this.selectedMeal.ingredientes.join('\n')} 
                        @input=${e => this.selectedMeal.ingredientes = e.target.value.split('\n').filter(i => i.trim())}>
                      </textarea>
                      <small style="color: #94a3b8;">Un ingrediente por línea</small>
                    `
                  : html`
                      <ul class="ing-list">
                        ${this.selectedMeal.ingredientes.map(i => html`<li><span class="bullet"></span>${i}</li>`)}
                      </ul>
                    `
                }
              </div>
              
              <div class="section">
                <h3><i class="ph ph-cooking-pot"></i> Preparación:</h3>
                ${this.isModalEditing 
                  ? html`
                      <textarea class="edit-input area-input" style="height: 150px;"
                        .value=${this.selectedMeal.prep} 
                        @input=${e => this.selectedMeal.prep = e.target.value}>
                      </textarea>
                    `
                  : html`<p class="prep-text">${this.selectedMeal.prep}</p>`
                }
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host { display: block; font-family: 'Outfit', sans-serif; }
    
    .weekly-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    
    .day-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease, border-color 0.3s ease;
    }
    
    .day-card:hover {
      transform: translateY(-5px);
      border-color: rgba(16, 185, 129, 0.4);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .day-header {
      font-size: 1.4rem;
      font-weight: 600;
      color: #10b981;
      margin-bottom: 1.5rem;
      padding-bottom: 0.8rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .meal-slot {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 1.2rem;
      padding: 0.8rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .meal-slot:hover {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.05);
      transform: translateX(5px);
    }
    
    .meal-slot.edit-mode {
      cursor: default;
    }
    .meal-slot.edit-mode:hover {
      transform: none;
      background: rgba(0, 0, 0, 0.2);
      border-color: transparent;
    }
    
    .meal-slot:last-child { margin-bottom: 0; }
    
    .meal-icon { font-size: 1.5rem; }
    
    .meal-info { display: flex; flex-direction: column; width: 100%; }
    
    .meal-type {
      font-size: 0.8rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 0.2rem;
    }
    
    .meal-name {
      font-size: 1rem;
      color: #f8fafc;
      font-weight: 500;
      line-height: 1.3;
    }
    
    .editable {
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px dashed #10b981;
      padding: 2px 4px;
      border-radius: 4px;
      min-height: 1.2em;
      outline: none;
      transition: background 0.2s;
    }
    
    .editable:focus {
      background: rgba(255, 255, 255, 0.15);
      border-bottom-style: solid;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .modal-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }
    
    .modal-content {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .modal-content.active {
      transform: translateY(0) scale(1);
    }
    
    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .modal-close:hover {
      background: #ef4444;
      color: white;
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .modal-icon {
      font-size: 3rem;
      background: rgba(255, 255, 255, 0.05);
      padding: 10px;
      border-radius: 16px;
    }
    
    .modal-type {
      color: #10b981;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }
    
    .modal-title {
      margin: 0;
      font-size: 1.6rem;
      color: #f8fafc;
      line-height: 1.2;
    }
    
    .section {
      margin-bottom: 1.5rem;
      background: rgba(0, 0, 0, 0.2);
      padding: 1.5rem;
      border-radius: 16px;
    }
    
    .section h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #e2e8f0;
      font-size: 1.1rem;
    }
    
    .ing-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .ing-list li {
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .bullet {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
    }
    
    .prep-text {
      margin: 0;
      color: #cbd5e1;
      line-height: 1.6;
      font-size: 0.95rem;
      white-space: pre-wrap;
    }

    .btn-glow {
      background: linear-gradient(135deg, #10b981, #0ea5e9);
      color: white;
      border: none;
      padding: 0.6rem 1rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      white-space: nowrap;
    }
    .btn-glow:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.5);
    }
    .btn-glow:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .btn-ai {
      background: linear-gradient(135deg, #a855f7, #ec4899);
      box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
    }
    .btn-ai:hover {
      box-shadow: 0 8px 20px rgba(168, 85, 247, 0.6);
    }

    .nutricion-box {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      animation: fadeIn 0.3s ease;
    }
    
    .nutri-item {
      background: rgba(0,0,0,0.3);
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #e2e8f0;
    }

    .nutri-badges {
      width: 100%;
      display: flex;
      gap: 8px;
      margin-top: 5px;
      flex-wrap: wrap;
    }

    .badge {
      background: #10b981;
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge-outline {
      background: transparent;
      border: 1px solid #10b981;
      color: #10b981;
    }
    
    .btn-edit {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: none;
    }
    .btn-edit:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-actions {
      display: flex;
      gap: 10px;
    }

    .edit-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: white;
      border-radius: 8px;
      padding: 8px;
      font-family: inherit;
      font-size: 1rem;
      outline: none;
    }
    .edit-input:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    .title-input {
      font-size: 1.6rem;
      font-weight: 600;
      padding: 4px 8px;
    }
    .area-input {
      resize: vertical;
      min-height: 100px;
      line-height: 1.5;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
}
customElements.define('plan-weekly', PlanWeekly);