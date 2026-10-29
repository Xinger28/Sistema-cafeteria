-- =====================================================
-- COFFEE BAR KATY — Script completo de base de datos
-- Módulo 1: Tablas, RLS básico y datos iniciales
--
-- Ejecutar en: Supabase → SQL Editor → New query
-- Pegar todo el contenido y presionar "Run"
-- =====================================================


-- =====================================================
-- 1. EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =====================================================
-- 2. TABLAS
-- =====================================================

-- Perfiles del personal (ligados a auth.users)
CREATE TABLE IF NOT EXISTS perfiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre    TEXT NOT NULL,
  rol       TEXT NOT NULL CHECK (rol IN ('jefe', 'encargado', 'barista')),
  activo    BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mesas del local
CREATE TABLE IF NOT EXISTS mesas (
  id      SERIAL PRIMARY KEY,
  numero  INTEGER NOT NULL UNIQUE,
  nombre  TEXT,                            -- ej: "Terraza 1" (opcional)
  estado  TEXT NOT NULL DEFAULT 'libre'
            CHECK (estado IN ('libre', 'ocupada', 'cuenta_pedida')),
  activa  BOOLEAN NOT NULL DEFAULT TRUE    -- el jefe puede desactivar mesas
);

-- Categorías del menú
CREATE TABLE IF NOT EXISTS categorias (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  orden  INTEGER NOT NULL DEFAULT 0,       -- orden de aparición en el menú
  activa BOOLEAN NOT NULL DEFAULT TRUE
);

-- Productos del menú
CREATE TABLE IF NOT EXISTS productos (
  id           SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  nombre       TEXT NOT NULL,
  precio       NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  disponible   BOOLEAN NOT NULL DEFAULT TRUE,  -- visible y pedible hoy
  tiene_stock  BOOLEAN NOT NULL DEFAULT FALSE, -- ¿controlar inventario?
  stock_actual INTEGER NOT NULL DEFAULT 0,
  activo       BOOLEAN NOT NULL DEFAULT TRUE,  -- visible en el sistema
  orden        INTEGER NOT NULL DEFAULT 0
);

-- Cuentas: una por sesión de mesa (se crea al primer pedido, se cierra al cobrar)
CREATE TABLE IF NOT EXISTS cuentas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id     INTEGER NOT NULL REFERENCES mesas(id),
  estado      TEXT NOT NULL DEFAULT 'abierta'
                CHECK (estado IN ('abierta', 'cobrada')),
  creada_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cerrada_en  TIMESTAMPTZ
);

-- Pedidos: cada vez que el cliente pulsa "Confirmar pedido"
CREATE TABLE IF NOT EXISTS pedidos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_id      UUID NOT NULL REFERENCES cuentas(id),
  mesa_id        INTEGER NOT NULL REFERENCES mesas(id),  -- desnormalizado para filtrar fácil
  estado         TEXT NOT NULL DEFAULT 'recibido'
                   CHECK (estado IN ('recibido','preparando','listo','entregado','cancelado')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atendido_por   UUID REFERENCES auth.users(id)          -- encargado que lo avanzó
);

-- Ítems de cada pedido (líneas)
CREATE TABLE IF NOT EXISTS pedidos_items (
  id               SERIAL PRIMARY KEY,
  pedido_id        UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id      INTEGER NOT NULL REFERENCES productos(id),
  nombre_producto  TEXT NOT NULL,           -- snapshot: precio/nombre al momento del pedido
  precio_unitario  NUMERIC(10,2) NOT NULL,
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  nota             TEXT,                    -- "sin azúcar", "extra caliente", etc.
  subtotal         NUMERIC(10,2) GENERATED ALWAYS AS (precio_unitario * cantidad) STORED
);

-- Cobros: un cobro puede pagar parcial o total (efectivo, tarjeta, QR)
CREATE TABLE IF NOT EXISTS cobros (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_id     UUID NOT NULL REFERENCES cuentas(id),
  monto         NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  metodo        TEXT NOT NULL CHECK (metodo IN ('efectivo','tarjeta','qr')),
  notas         TEXT,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  encargado_id  UUID REFERENCES auth.users(id)
);


-- =====================================================
-- 3. ÍNDICES (para búsquedas frecuentes)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pedidos_cuenta    ON pedidos(cuenta_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado    ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa      ON pedidos(mesa_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_mesa      ON cuentas(mesa_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_estado    ON cuentas(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_items_ped ON pedidos_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_productos_cat     ON productos(categoria_id);


-- =====================================================
-- 4. FUNCIÓN: actualizar timestamp automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pedidos_actualizado
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();


-- =====================================================
-- 5. FUNCIÓN: obtener o crear cuenta abierta de una mesa
--    Llamada desde el cliente al escanear el QR.
--    Devuelve el id de la cuenta abierta existente
--    o crea una nueva si la mesa está libre.
-- =====================================================
CREATE OR REPLACE FUNCTION obtener_o_crear_cuenta(p_mesa_numero INTEGER)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_mesa_id   INTEGER;
  v_cuenta_id UUID;
BEGIN
  -- Obtener id de la mesa por su número
  SELECT id INTO v_mesa_id
    FROM mesas
   WHERE numero = p_mesa_numero AND activa = TRUE;

  IF v_mesa_id IS NULL THEN
    RAISE EXCEPTION 'Mesa % no existe o no está activa', p_mesa_numero;
  END IF;

  -- Buscar cuenta abierta para esta mesa
  SELECT id INTO v_cuenta_id
    FROM cuentas
   WHERE mesa_id = v_mesa_id AND estado = 'abierta'
   ORDER BY creada_en DESC
   LIMIT 1;

  -- Si no hay cuenta abierta, crear una y marcar la mesa como ocupada
  IF v_cuenta_id IS NULL THEN
    INSERT INTO cuentas (mesa_id) VALUES (v_mesa_id)
    RETURNING id INTO v_cuenta_id;

    UPDATE mesas SET estado = 'ocupada' WHERE id = v_mesa_id;
  END IF;

  RETURN v_cuenta_id;
END;
$$;


-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE perfiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias     ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobros         ENABLE ROW LEVEL SECURITY;

-- Helper: rol del usuario autenticado actual
CREATE OR REPLACE FUNCTION mi_rol()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT rol FROM perfiles WHERE id = auth.uid() AND activo = TRUE;
$$;

-- Helper: ¿el usuario actual es jefe?
CREATE OR REPLACE FUNCTION es_jefe()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'jefe' AND activo = TRUE
  );
$$;

-- Helper: ¿el usuario actual es personal (cualquier rol)?
CREATE OR REPLACE FUNCTION es_personal()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfiles WHERE id = auth.uid() AND activo = TRUE
  );
$$;

-- ---- CATEGORÍAS: lectura pública, escritura solo jefe ----
CREATE POLICY "categorias_leer_publico"
  ON categorias FOR SELECT USING (activa = TRUE);

CREATE POLICY "categorias_gestionar_jefe"
  ON categorias FOR ALL USING (es_jefe());

-- ---- PRODUCTOS: lectura pública (solo activos), escritura solo jefe ----
CREATE POLICY "productos_leer_publico"
  ON productos FOR SELECT USING (activo = TRUE);

CREATE POLICY "productos_gestionar_jefe"
  ON productos FOR ALL USING (es_jefe());

-- ---- MESAS: lectura pública, escritura solo personal ----
CREATE POLICY "mesas_leer_publico"
  ON mesas FOR SELECT USING (activa = TRUE);

CREATE POLICY "mesas_gestionar_personal"
  ON mesas FOR ALL USING (es_personal());

-- ---- CUENTAS: inserción pública (la función obtener_o_crear_cuenta usa SECURITY DEFINER),
--              lectura y actualización solo personal ----
CREATE POLICY "cuentas_leer_personal"
  ON cuentas FOR SELECT USING (es_personal());

CREATE POLICY "cuentas_actualizar_personal"
  ON cuentas FOR UPDATE USING (es_personal());

-- La inserción de cuentas la hace la función SECURITY DEFINER, no el cliente directamente.

-- ---- PEDIDOS: inserción pública, lectura/actualización solo personal ----
CREATE POLICY "pedidos_insertar_publico"
  ON pedidos FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "pedidos_leer_personal"
  ON pedidos FOR SELECT USING (es_personal());

CREATE POLICY "pedidos_actualizar_personal"
  ON pedidos FOR UPDATE USING (es_personal());

-- ---- PEDIDOS_ITEMS: inserción pública junto al pedido ----
CREATE POLICY "items_insertar_publico"
  ON pedidos_items FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "items_leer_personal"
  ON pedidos_items FOR SELECT USING (es_personal());

-- ---- COBROS: solo personal ----
CREATE POLICY "cobros_gestionar_personal"
  ON cobros FOR ALL USING (es_personal());

-- ---- PERFILES: cada usuario ve el suyo; el jefe ve todos ----
CREATE POLICY "perfiles_leer_propio"
  ON perfiles FOR SELECT
  USING (id = auth.uid() OR es_jefe());

CREATE POLICY "perfiles_gestionar_jefe"
  ON perfiles FOR ALL USING (es_jefe());


-- =====================================================
-- 7. DATOS INICIALES
-- =====================================================

-- Categorías del menú
INSERT INTO categorias (nombre, orden) VALUES
  ('Café',          1),
  ('Frappes',       2),
  ('Bebidas Frías', 3),
  ('Desayunos',     4)
ON CONFLICT DO NOTHING;

-- Productos (con los precios en Bs del menú de Coffee Bar Katy)
INSERT INTO productos (categoria_id, nombre, precio, orden) VALUES
  -- Café
  ((SELECT id FROM categorias WHERE nombre = 'Café'), 'Cappuccino',           22.00, 1),
  ((SELECT id FROM categorias WHERE nombre = 'Café'), 'Latte',                20.00, 2),
  ((SELECT id FROM categorias WHERE nombre = 'Café'), 'Mocha',                24.00, 3),
  ((SELECT id FROM categorias WHERE nombre = 'Café'), 'Americano',            16.00, 4),
  -- Frappes
  ((SELECT id FROM categorias WHERE nombre = 'Frappes'), 'Frappe Caramelo',   26.00, 1),
  ((SELECT id FROM categorias WHERE nombre = 'Frappes'), 'Frappe Moka',       27.00, 2),
  -- Bebidas Frías
  ((SELECT id FROM categorias WHERE nombre = 'Bebidas Frías'), 'Limonada de Coco',     18.00, 1),
  ((SELECT id FROM categorias WHERE nombre = 'Bebidas Frías'), 'Té Helado de Durazno', 15.00, 2),
  -- Desayunos
  ((SELECT id FROM categorias WHERE nombre = 'Desayunos'), 'Croissant Clásico',          12.00, 1),
  ((SELECT id FROM categorias WHERE nombre = 'Desayunos'), 'Sandwich de Jamón y Queso',  19.00, 2)
ON CONFLICT DO NOTHING;

-- Mesas (empezamos con 8; el jefe puede agregar más desde su panel)
INSERT INTO mesas (numero) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8)
ON CONFLICT DO NOTHING;


-- =====================================================
-- ✅ FIN DEL SCRIPT
-- Si no ves errores, el esquema está listo.
-- =====================================================
