/* ===================================================
   encargado.js — Lógica del panel del encargado.
   
   Módulo 0: navegación entre secciones + reloj.
   Módulo 4: pedidos y mesas en tiempo real.
   Módulo 5: caja y resumen del día.
   =================================================== */

import { mostrar, ocultar, formatearHora } from '../../js/utils.js';

/* --- Reloj en tiempo real (zona horaria Bolivia) --- */
function actualizarReloj() {
  const reloj = document.getElementById('reloj');
  if (!reloj) return;
  reloj.textContent = new Date().toLocaleTimeString('es-BO', {
    timeZone: 'America/La_Paz',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

setInterval(actualizarReloj, 1000);
actualizarReloj();

/* --- Navegación entre secciones --- */
const enlaces = document.querySelectorAll('.topbar-nav a[data-seccion]');
const secciones = document.querySelectorAll('.seccion-admin');

enlaces.forEach(enlace => {
  enlace.addEventListener('click', (e) => {
    e.preventDefault();
    const seccionId = 'seccion-' + enlace.dataset.seccion;

    // Marcar enlace activo
    enlaces.forEach(a => a.classList.remove('activo'));
    enlace.classList.add('activo');

    // Mostrar solo la sección correspondiente
    secciones.forEach(sec => {
      if (sec.id === seccionId) mostrar(sec);
      else ocultar(sec);
    });
  });
});

/* --- Cerrar sesión (Módulo 2 añade la llamada a Supabase Auth) --- */
document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
  window.location.href = 'login.html';
});
