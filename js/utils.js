/* ===================================================
   utils.js — Funciones de utilidad compartidas entre
   todas las páginas del sistema.
   
   No importa Supabase; solo trabaja con fechas,
   números y DOM. Se importa donde se necesite.
   =================================================== */

/* --- Formato de moneda boliviana ---
   Uso: formatearMonto(22) → "Bs 22,00"
        formatearMonto(1234.5) → "Bs 1.234,50"
*/
export function formatearMonto(numero) {
  return 'Bs ' + Number(numero).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* --- Formato de hora local (America/La_Paz) ---
   Uso: formatearHora(isoString) → "14:32"
        formatearFecha(isoString) → "28/10/2026 14:32"
*/
const ZONA_HORARIA = 'America/La_Paz';

export function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString('es-BO', {
    timeZone: ZONA_HORARIA,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatearFecha(iso) {
  return new Date(iso).toLocaleString('es-BO', {
    timeZone: ZONA_HORARIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatearFechaSolo(iso) {
  return new Date(iso).toLocaleDateString('es-BO', {
    timeZone: ZONA_HORARIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/* --- Sanitizar texto para evitar XSS ---
   Úsalo al insertar texto del usuario en el DOM via innerHTML.
   Preferir textContent cuando sea posible; usar esto cuando
   necesites mezclar texto con etiquetas.
*/
export function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = String(texto ?? '');
  return div.innerHTML;
}

/* --- Mostrar / ocultar elementos ---
   Uso: mostrar(el)  → quita la clase "hidden"
        ocultar(el) → agrega la clase "hidden"
*/
export function mostrar(elemento) {
  elemento?.classList.remove('hidden');
}

export function ocultar(elemento) {
  elemento?.classList.add('hidden');
}

export function alternar(elemento) {
  elemento?.classList.toggle('hidden');
}

/* --- Badge de estado de pedido ---
   Recibe un string de estado y devuelve el HTML del badge.
*/
const ETIQUETAS_ESTADO = {
  recibido:   'Recibido',
  preparando: 'Preparando',
  listo:      'Listo',
  entregado:  'Entregado',
  cancelado:  'Cancelado',
};

export function badgeEstado(estado) {
  const etiqueta = ETIQUETAS_ESTADO[estado] ?? estado;
  return `<span class="badge badge-${escaparHtml(estado)}">${escaparHtml(etiqueta)}</span>`;
}

/* --- Generar ID único en el cliente (para uso temporal, no para BD) --- */
export function idUnico() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* --- Leer parámetros de la URL ---
   Uso: leerParam('mesa') → '5' o null
*/
export function leerParam(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}

/* --- Debounce: retrasa ejecución para evitar llamadas excesivas ---
   Útil para campos de búsqueda.
   Uso: const buscarRetardada = debounce(buscar, 400);
*/
export function debounce(fn, espera = 300) {
  let temporizador;
  return function (...args) {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn.apply(this, args), espera);
  };
}
