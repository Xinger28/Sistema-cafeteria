/* ===================================================
   login.js — Lógica de la pantalla de inicio de sesión.
   
   Módulo 0: simula el login con credenciales de prueba.
   Módulo 2: reemplaza la simulación por Supabase Auth.
   =================================================== */

import { mostrar, ocultar } from '../../js/utils.js';

const form       = document.getElementById('form-login');
const btnIngresar = document.getElementById('btn-ingresar');
const mensajeEl  = document.getElementById('mensaje-login');

function mostrarError(texto) {
  mensajeEl.textContent = texto;
  mostrar(mensajeEl);
}

function ocultarError() {
  ocultar(mensajeEl);
}

/* ======================================================
   CREDENCIALES DE PRUEBA (solo Módulo 0 y 1)
   Se eliminan en el Módulo 2 cuando se conecte Auth real.
   ====================================================== */
const USUARIOS_PRUEBA = [
  { correo: 'encargado@prueba.com', contrasena: '123456', rol: 'encargado' },
  { correo: 'jefe@prueba.com',      contrasena: '123456', rol: 'jefe' },
];

const RUTA_POR_ROL = {
  encargado: 'encargado.html',
  jefe:      'jefe.html',
  barista:   'barista.html',
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarError();

  const correo     = document.getElementById('correo').value.trim().toLowerCase();
  const contrasena = document.getElementById('contrasena').value;

  if (!correo || !contrasena) {
    mostrarError('Completa todos los campos.');
    return;
  }

  btnIngresar.disabled = true;
  btnIngresar.textContent = 'Ingresando…';

  // Simular retardo de red
  await new Promise(r => setTimeout(r, 600));

  const usuario = USUARIOS_PRUEBA.find(
    u => u.correo === correo && u.contrasena === contrasena
  );

  if (!usuario) {
    mostrarError('Correo o contraseña incorrectos.');
    btnIngresar.disabled = false;
    btnIngresar.textContent = 'Ingresar';
    return;
  }

  const destino = RUTA_POR_ROL[usuario.rol] ?? 'encargado.html';
  window.location.href = destino;
});
