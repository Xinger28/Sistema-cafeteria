/* ===================================================
   cliente.js — Lógica de la vista del cliente.
   
   Este archivo se activa cuando el cliente abre
   index.html. Hace tres cosas:
   1. Lee el número de mesa de la URL (?mesa=N)
   2. Carga el menú desde la base de datos
   3. Permite agregar productos al carrito y enviar
      el pedido a la BD
   
   Por ahora (Módulo 0) solo muestra un menú estático
   de ejemplo para poder abrir el HTML y ver que
   funciona sin conectar Supabase todavía.
   El Módulo 3 reemplazará la carga estática por
   consultas reales a Supabase.
   =================================================== */

import { mostrar, ocultar, formatearMonto, leerParam, escaparHtml } from './utils.js';

/* --- Estado local del carrito --- */
const estado = {
  numerMesa: null,
  carrito: [],   // [{ id, nombre, precio, cantidad, nota }]
};

/* --- Referencias al DOM --- */
const secSinMesa    = document.getElementById('seccion-sin-mesa');
const secMenu       = document.getElementById('seccion-menu');
const secCarrito    = document.getElementById('seccion-carrito');
const secConfirmado = document.getElementById('seccion-confirmado');
const etiquetaMesa  = document.getElementById('etiqueta-mesa');
const contenedorMenu = document.getElementById('contenedor-menu');
const carritoFlotante = document.getElementById('carrito-flotante');
const carritoTotal  = document.getElementById('carrito-total');
const listaCarrito  = document.getElementById('lista-carrito');
const resumenCarrito = document.getElementById('resumen-carrito');

/* ======================================================
   DATOS DE EJEMPLO — Solo para el Módulo 0.
   El Módulo 3 los reemplaza por una consulta a Supabase.
   ====================================================== */
const MENU_EJEMPLO = [
  { categoria: '☕ Café',          id: 1, nombre: 'Cappuccino',            precio: 22, disponible: true },
  { categoria: '☕ Café',          id: 2, nombre: 'Latte',                 precio: 20, disponible: true },
  { categoria: '☕ Café',          id: 3, nombre: 'Mocha',                 precio: 24, disponible: true },
  { categoria: '☕ Café',          id: 4, nombre: 'Americano',             precio: 16, disponible: true },
  { categoria: '🥤 Frappes',       id: 5, nombre: 'Frappe Caramelo',       precio: 26, disponible: true },
  { categoria: '🥤 Frappes',       id: 6, nombre: 'Frappe Moka',           precio: 27, disponible: true },
  { categoria: '🧊 Bebidas Frías', id: 7, nombre: 'Limonada de Coco',      precio: 18, disponible: true },
  { categoria: '🧊 Bebidas Frías', id: 8, nombre: 'Té Helado de Durazno',  precio: 15, disponible: true },
  { categoria: '🥐 Desayunos',     id: 9, nombre: 'Croissant Clásico',     precio: 12, disponible: true },
  { categoria: '🥐 Desayunos',     id:10, nombre: 'Sandwich de Jamón y Queso', precio: 19, disponible: true },
];

/* ======================================================
   INICIO
   ====================================================== */
function init() {
  const mesa = leerParam('mesa');

  if (!mesa || isNaN(Number(mesa)) || Number(mesa) < 1) {
    // No hay mesa válida: mostrar aviso de "escanea el QR"
    mostrar(secSinMesa);
    return;
  }

  estado.numerMesa = Number(mesa);
  etiquetaMesa.textContent = `Mesa ${estado.numerMesa}`;
  mostrar(secMenu);

  renderizarMenu(MENU_EJEMPLO);
  conectarEventos();
}

/* ======================================================
   RENDERIZAR MENÚ
   ====================================================== */
function renderizarMenu(productos) {
  contenedorMenu.innerHTML = '';

  // Agrupar por categoría
  const categorias = {};
  for (const p of productos) {
    if (!categorias[p.categoria]) categorias[p.categoria] = [];
    categorias[p.categoria].push(p);
  }

  for (const [cat, items] of Object.entries(categorias)) {
    // Título de categoría
    const tit = document.createElement('h2');
    tit.className = 'categoria-titulo';
    tit.textContent = cat;
    contenedorMenu.appendChild(tit);

    for (const prod of items) {
      contenedorMenu.appendChild(crearTarjetaProducto(prod));
    }
  }
}

function crearTarjetaProducto(prod) {
  const card = document.createElement('div');
  card.className = 'producto-card' + (prod.disponible ? '' : ' agotado');
  card.dataset.id = prod.id;

  card.innerHTML = `
    <div class="producto-info">
      <span class="producto-nombre">${escaparHtml(prod.nombre)}</span>
      ${prod.disponible
        ? `<span class="producto-precio">${formatearMonto(prod.precio)}</span>`
        : `<span class="badge-agotado">Agotado</span>`}
    </div>
    ${prod.disponible ? `
    <div class="control-cantidad">
      <button class="btn-cantidad btn-restar" data-id="${prod.id}" aria-label="Quitar uno">−</button>
      <span class="cantidad-texto" id="cantidad-${prod.id}">0</span>
      <button class="btn-cantidad btn-sumar" data-id="${prod.id}" aria-label="Agregar uno">+</button>
    </div>
    <div class="producto-nota-contenedor" id="nota-contenedor-${prod.id}">
      <input
        type="text"
        class="producto-nota-input"
        id="nota-${prod.id}"
        placeholder="Nota (ej: sin azúcar)"
        maxlength="120"
      />
    </div>` : ''}
  `;

  return card;
}

/* ======================================================
   EVENTOS
   ====================================================== */
function conectarEventos() {
  // Delegación: clic en cualquier botón + / − del menú
  contenedorMenu.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-id]');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const prod = MENU_EJEMPLO.find(p => p.id === id);
    if (!prod) return;

    if (btn.classList.contains('btn-sumar')) {
      cambiarCantidad(prod, +1);
    } else if (btn.classList.contains('btn-restar')) {
      cambiarCantidad(prod, -1);
    }
  });

  // Ver carrito
  document.getElementById('btn-ver-carrito').addEventListener('click', () => {
    renderizarCarrito();
    ocultar(secMenu);
    ocultar(carritoFlotante);
    mostrar(secCarrito);
  });

  // Volver al menú
  document.getElementById('btn-volver-menu').addEventListener('click', () => {
    ocultar(secCarrito);
    mostrar(secMenu);
    actualizarFlotante();
  });

  // Confirmar pedido
  document.getElementById('btn-confirmar-pedido').addEventListener('click', confirmarPedido);

  // Pedir más
  document.getElementById('btn-pedir-mas').addEventListener('click', () => {
    ocultar(secConfirmado);
    mostrar(secMenu);
    actualizarFlotante();
  });
}

/* ======================================================
   CARRITO
   ====================================================== */
function cambiarCantidad(prod, delta) {
  let item = estado.carrito.find(i => i.id === prod.id);

  if (!item) {
    if (delta < 0) return; // no puede restar si no está
    item = { id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 0, nota: '' };
    estado.carrito.push(item);
  }

  item.cantidad = Math.max(0, item.cantidad + delta);

  // Actualizar contador en la tarjeta
  const spanCantidad = document.getElementById(`cantidad-${prod.id}`);
  if (spanCantidad) spanCantidad.textContent = item.cantidad;

  // Mostrar / ocultar campo de nota
  const notaContenedor = document.getElementById(`nota-contenedor-${prod.id}`);
  if (notaContenedor) {
    if (item.cantidad > 0) {
      notaContenedor.classList.add('visible');
    } else {
      notaContenedor.classList.remove('visible');
    }
  }

  // Si cantidad llega a 0, quitar del carrito
  if (item.cantidad === 0) {
    estado.carrito = estado.carrito.filter(i => i.id !== prod.id);
  }

  actualizarFlotante();
}

function actualizarFlotante() {
  const total = calcularTotal();
  const hayItems = estado.carrito.length > 0;

  if (hayItems) {
    carritoTotal.textContent = formatearMonto(total);
    mostrar(carritoFlotante);
  } else {
    ocultar(carritoFlotante);
  }
}

function calcularTotal() {
  return estado.carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

function leerNotas() {
  for (const item of estado.carrito) {
    const input = document.getElementById(`nota-${item.id}`);
    if (input) item.nota = input.value.trim();
  }
}

function renderizarCarrito() {
  leerNotas();
  listaCarrito.innerHTML = '';

  for (const item of estado.carrito) {
    const div = document.createElement('div');
    div.className = 'item-carrito';
    div.innerHTML = `
      <div style="flex:1">
        <div class="item-carrito-nombre">${escaparHtml(item.nombre)} × ${item.cantidad}</div>
        ${item.nota ? `<div class="item-carrito-nota">📝 ${escaparHtml(item.nota)}</div>` : ''}
      </div>
      <span class="item-carrito-precio">${formatearMonto(item.precio * item.cantidad)}</span>
      <button class="btn-quitar-item" data-id="${item.id}" aria-label="Quitar">🗑</button>
    `;
    listaCarrito.appendChild(div);
  }

  // Delegación para quitar ítems desde el carrito
  listaCarrito.querySelectorAll('.btn-quitar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const item = estado.carrito.find(i => i.id === id);
      if (!item) return;
      item.cantidad = 0;
      estado.carrito = estado.carrito.filter(i => i.id !== id);
      // Actualizar contador en la tarjeta del menú
      const spanCantidad = document.getElementById(`cantidad-${id}`);
      if (spanCantidad) spanCantidad.textContent = '0';
      const notaContenedor = document.getElementById(`nota-contenedor-${id}`);
      if (notaContenedor) notaContenedor.classList.remove('visible');
      renderizarCarrito();
      actualizarFlotante();
    });
  });

  resumenCarrito.textContent = `Total: ${formatearMonto(calcularTotal())}`;
}

/* ======================================================
   CONFIRMAR PEDIDO
   (Módulo 0: solo simula el envío y muestra confirmación)
   El Módulo 3 reemplaza esto por una inserción en Supabase.
   ====================================================== */
async function confirmarPedido() {
  if (estado.carrito.length === 0) return;
  leerNotas();

  console.log('[Módulo 0 - simulación] Pedido que se enviaría:', {
    mesa: estado.numerMesa,
    items: estado.carrito,
    total: calcularTotal(),
  });

  // Limpiar carrito después de "enviar"
  estado.carrito = [];
  // Resetear contadores visuales
  document.querySelectorAll('.cantidad-texto').forEach(el => { el.textContent = '0'; });
  document.querySelectorAll('.producto-nota-contenedor').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.producto-nota-input').forEach(el => { el.value = ''; });

  ocultar(secCarrito);
  ocultar(carritoFlotante);
  mostrar(secConfirmado);
}

/* --- Arrancar la app --- */
init();
