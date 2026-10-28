/* ===================================================
   jefe.js — Lógica del panel del jefe.
   Módulo 0: solo navegación entre secciones.
   =================================================== */

import { mostrar, ocultar } from '../../js/utils.js';

const enlaces = document.querySelectorAll('.topbar-nav a[data-seccion]');
const secciones = document.querySelectorAll('.seccion-admin');

enlaces.forEach(enlace => {
  enlace.addEventListener('click', (e) => {
    e.preventDefault();
    const seccionId = 'seccion-' + enlace.dataset.seccion;
    enlaces.forEach(a => a.classList.remove('activo'));
    enlace.classList.add('activo');
    secciones.forEach(sec => {
      if (sec.id === seccionId) mostrar(sec);
      else ocultar(sec);
    });
  });
});

document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
  window.location.href = 'login.html';
});
