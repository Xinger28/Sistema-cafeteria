/**
 * servidor.js — Servidor local para desarrollo.
 * 
 * Sirve todos los archivos del proyecto en http://localhost:3000
 * No necesita instalar ningún paquete extra; usa solo módulos
 * que vienen incluidos en Node.js.
 * 
 * Cómo usarlo:
 *   node servidor.js
 * Luego abre en el navegador:
 *   http://localhost:3000              ← aviso "escanea el QR"
 *   http://localhost:3000/?mesa=1      ← menú de la mesa 1
 *   http://localhost:3000/admin/login.html
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PUERTO = 3000;
const RAIZ   = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css; charset=utf-8',
  '.js'  : 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg' : 'image/svg+xml',
  '.ico' : 'image/x-icon',
};

const servidor = http.createServer((req, res) => {
  // Quitar query string para resolver la ruta del archivo
  let ruta = req.url.split('?')[0];
  if (ruta === '/' || ruta === '') ruta = '/index.html';

  const archivoAbsoluto = path.join(RAIZ, ruta);
  const ext = path.extname(archivoAbsoluto).toLowerCase();
  const tipoMime = MIME[ext] || 'application/octet-stream';

  fs.readFile(archivoAbsoluto, (err, datos) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Archivo no encontrado: ${ruta}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': tipoMime });
    res.end(datos);
  });
});

servidor.listen(PUERTO, () => {
  console.log(`\n☕ Servidor Coffee Bar Katy corriendo en:\n`);
  console.log(`   http://localhost:${PUERTO}              ← Vista del cliente`);
  console.log(`   http://localhost:${PUERTO}/?mesa=1      ← Menú mesa 1`);
  console.log(`   http://localhost:${PUERTO}/admin/login.html`);
  console.log(`\nPresiona Ctrl+C para detenerlo.\n`);
});
