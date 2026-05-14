/**
 * =========================================================================
 * ARCHIVO: counter.js
 * FUNCIÓN: Este es un archivo de ejemplo que viene por defecto al crear un
 * proyecto web moderno (como con Vite). Sirve para crear un botón contador 
 * básico, pero en realidad NO tiene ninguna utilidad dentro de la lógica de 
 * nuestra aplicación (PlanComer). Está aquí solo como código residual.
 * =========================================================================
 */
export function setupCounter(element) {
  let counter = 0
  const setCounter = (count) => {
    counter = count
    element.innerHTML = `Count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
