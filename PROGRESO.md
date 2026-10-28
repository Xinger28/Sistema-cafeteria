# PROGRESO — Sistema Coffee Bar Katy

> Actualizado automáticamente al cierre de cada módulo.

---

## ✅ Módulos completados

### Módulo 0 — Fundaciones
**Estado:** ✅ Completado  
**Commit:** `Módulo 0: fundaciones — estructura, estilos base y esqueletos HTML`

**Qué se hizo:**
- Estructura de carpetas: `css/`, `js/`, `admin/`, `admin/css/`, `admin/js/`, `qr/`
- Estilos base compartidos (`css/base.css`) con variables de color, botones, cards, badges, formularios y tabla genérica — paleta marrón café
- Estilos del cliente (`css/cliente.css`) — diseño móvil primero
- Estilos del admin (`admin/css/admin.css`) — topbar, cards de pedido, modal, KPI
- Configuración de Supabase (`js/supabase-cliente.js`) — con URL y clave anon para rellenar en el Módulo 1
- Utilidades compartidas (`js/utils.js`) — formato de moneda Bs, zona horaria America/La_Paz, sanitización XSS, helpers de DOM
- Vista del cliente (`index.html` + `js/cliente.js`) — menú de ejemplo con carrito funcional en el navegador (sin BD aún)
- Panel de login (`admin/login.html` + `admin/js/login.js`) — formulario con credenciales de prueba (encargado@prueba.com / jefe@prueba.com, contraseña 123456)
- Esqueleto del encargado (`admin/encargado.html` + `admin/js/encargado.js`) — navegación entre secciones + reloj en tiempo real
- Esqueleto del jefe (`admin/jefe.html` + `admin/js/jefe.js`) — navegación entre secciones
- `.gitignore` configurado
- Repositorio git inicializado

---

## ⏳ Módulos pendientes

| # | Módulo | Depende de | Estado |
|---|--------|------------|--------|
| 1 | Base de datos (Supabase: tablas, RLS básico, datos iniciales) | 0 | Pendiente |
| 2 | Autenticación y seguridad por rol | 1 | Pendiente |
| 3 | Vista del cliente (menú real, pedidos, carrito) | 2 | Pendiente |
| 4 | Panel del encargado: pedidos y mesas en tiempo real | 3 | Pendiente |
| 5 | Caja: resumen del día, cobros, cierre | 4 | Pendiente |
| 6 | Productos e inventario (alta, baja, stock) | 5 | Pendiente |
| 7 | Panel del jefe: reportes y gestión de usuarios | 6 | Pendiente |
| 8 | Vista del barista (opcional) | 4 | Pendiente |
| 9 | Integración, pruebas y seguridad | 0–8 | Pendiente |
| 10 | Despliegue, QR y puesta en marcha | 9 | Pendiente |

---

## 🔧 Decisiones tomadas

| Fecha | Decisión |
|-------|----------|
| 28/10/2026 | Nombre del negocio: **Coffee Bar Katy** |
| 28/10/2026 | Mesas: número configurable en la BD (no hardcodeado) |
| 28/10/2026 | El QR solo asigna mesa y lleva al menú; sin confirmación por QR adicional |
| 28/10/2026 | Moneda: **bolivianos (Bs)**, zona horaria: **America/La_Paz** |
| 28/10/2026 | Stack: HTML + CSS + JS puro, Supabase, Netlify — **costo inicial $0** |
| 28/10/2026 | Menú inicial: 10 productos en 4 categorías (Café, Frappes, Bebidas Frías, Desayunos) |
| 28/10/2026 | El jefe crea y gestiona usuarios desde el sistema (Módulo 7) |
| 28/10/2026 | No hay pagos en línea en la v1; cobro físico registrado por el encargado |

---

## 🚧 Problemas abiertos

_Ninguno por ahora._

---

## 📁 Estructura del proyecto

```
Sistema Cafeteria/
├── index.html              ← Vista del cliente (escaneo QR)
├── PROGRESO.md             ← Este archivo
├── .gitignore
├── css/
│   ├── base.css            ← Estilos globales compartidos
│   └── cliente.css         ← Estilos específicos del cliente
├── js/
│   ├── supabase-cliente.js ← Config de Supabase (rellenar claves en M1)
│   ├── utils.js            ← Utilidades: moneda, fechas, DOM
│   └── cliente.js          ← Lógica del menú y carrito
├── admin/
│   ├── login.html          ← Login del personal
│   ├── encargado.html      ← Panel del encargado
│   ├── jefe.html           ← Panel del jefe
│   ├── css/
│   │   └── admin.css       ← Estilos del panel de admin
│   └── js/
│       ├── login.js        ← Lógica del login
│       ├── encargado.js    ← Lógica del encargado
│       └── jefe.js         ← Lógica del jefe
└── qr/                     ← QR por mesa (se genera en Módulo 10)
```
