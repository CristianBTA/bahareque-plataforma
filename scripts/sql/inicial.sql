-- Esquema inicial de Guadua para el ambiente local (docker-compose).
-- Producción se crea con las migraciones de scripts/sql/migraciones/.
-- Última actualización: 21-oct-2026 · Camilo Restrepo

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Comercios clientes de Bahareque
CREATE TABLE comercios (
  id                    text PRIMARY KEY,                  -- com_xxxx
  nit                   text NOT NULL UNIQUE,
  razon_social          text NOT NULL,
  nombre_visible        text NOT NULL,
  telefono              text,
  direccion             text,
  municipio             text,
  horario               jsonb NOT NULL DEFAULT '{}'::jsonb,
  acepta_contraentrega  boolean NOT NULL DEFAULT false,
  plan                  text NOT NULL DEFAULT 'basico' CHECK (plan IN ('basico', 'crecer', 'pro')),
  creado_en             timestamptz NOT NULL DEFAULT now(),
  actualizado_en        timestamptz NOT NULL DEFAULT now()
);

-- Usuarios del panel de cada comercio (la autenticación la hace auth.bahareque.example)
CREATE TABLE usuarios_comercio (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id     text NOT NULL REFERENCES comercios(id),
  nombre          text NOT NULL,
  correo          text NOT NULL,
  rol             text NOT NULL CHECK (rol IN ('admin', 'operador', 'lectura')),
  ultimo_ingreso  timestamptz,
  activo          boolean NOT NULL DEFAULT true,
  UNIQUE (comercio_id, correo)
);

-- Clientes finales de los comercios
CREATE TABLE clientes (
  id           text PRIMARY KEY,                           -- cli_xxxx
  comercio_id  text NOT NULL REFERENCES comercios(id),
  nombre       text NOT NULL,
  cedula       text,
  correo       text,
  telefono     text,
  direccion    text,
  municipio    text,
  acepta_publicidad  boolean NOT NULL DEFAULT false,
  creado_en    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE productos (
  id           text PRIMARY KEY,
  comercio_id  text NOT NULL REFERENCES comercios(id),
  nombre       text NOT NULL,
  categoria    text NOT NULL,
  precio       integer NOT NULL CHECK (precio >= 0),       -- pesos, sin decimales
  existencias  integer NOT NULL DEFAULT 0,
  imagen       text,
  activo       boolean NOT NULL DEFAULT true,
  creado_en    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pedidos (
  id               text PRIMARY KEY,                       -- PED-xxxx
  comercio_id      text NOT NULL REFERENCES comercios(id),
  cliente_id       text NOT NULL REFERENCES clientes(id),
  estado           text NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado')),
  total            integer NOT NULL CHECK (total >= 0),
  moneda           text NOT NULL DEFAULT 'COP',
  direccion_envio  text,
  guia_envio       text,
  creado_en        timestamptz NOT NULL DEFAULT now(),
  actualizado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pedido_items (
  id               bigserial PRIMARY KEY,
  pedido_id        text NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id      text NOT NULL REFERENCES productos(id),
  nombre_producto  text NOT NULL,
  cantidad         integer NOT NULL CHECK (cantidad > 0),
  precio_unitario  integer NOT NULL CHECK (precio_unitario >= 0)
);

CREATE TABLE pedido_eventos (
  id               bigserial PRIMARY KEY,
  pedido_id        text NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  estado_anterior  text,
  estado_nuevo     text NOT NULL,
  nota             text,
  hecho_por        text NOT NULL,
  creado_en        timestamptz NOT NULL DEFAULT now()
);

-- Pagos con PagosYa; token_pago es el token que devuelve la pasarela
CREATE TABLE pagos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id       text NOT NULL REFERENCES pedidos(id),
  estado          text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  monto           integer NOT NULL,
  metodo          text,
  ultimos4        char(4),
  token_pago      text,
  transaccion_id  text UNIQUE,
  creado_en       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reembolsos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id       text NOT NULL REFERENCES pedidos(id),
  pago_id         uuid REFERENCES pagos(id),
  monto           integer NOT NULL CHECK (monto > 0),
  motivo          text,
  estado          text NOT NULL DEFAULT 'solicitado' CHECK (estado IN ('solicitado', 'completado', 'fallido')),
  transaccion_id  text,
  solicitado_por  text NOT NULL,
  creado_en       timestamptz NOT NULL DEFAULT now(),
  completado_en   timestamptz
);

-- Tickets de soporte (los lee el asistente)
CREATE TABLE tickets (
  id           bigserial PRIMARY KEY,
  comercio_id  text REFERENCES comercios(id),
  cliente_id   text REFERENCES clientes(id),
  pedido_id    text REFERENCES pedidos(id),
  canal        text NOT NULL CHECK (canal IN ('correo', 'chat', 'telefono', 'mesa')),
  asunto       text NOT NULL,
  cuerpo_html  text NOT NULL,
  estado       text NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_curso', 'resuelto', 'cerrado')),
  asignado_a   text,
  creado_en    timestamptz NOT NULL DEFAULT now(),
  cerrado_en   timestamptz
);

-- Idempotencia de los webhooks de PagosYa
CREATE TABLE webhooks_recibidos (
  evento_id    text PRIMARY KEY,
  tipo         text NOT NULL,
  recibido_en  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clientes_comercio        ON clientes (comercio_id);
CREATE INDEX idx_clientes_correo          ON clientes (lower(correo));
CREATE INDEX idx_productos_comercio_cat   ON productos (comercio_id, categoria) WHERE activo;
CREATE INDEX idx_pedidos_comercio_fecha   ON pedidos (comercio_id, creado_en DESC);
CREATE INDEX idx_pedidos_comercio_estado  ON pedidos (comercio_id, estado);
CREATE INDEX idx_pedidos_cliente          ON pedidos (cliente_id);
CREATE INDEX idx_items_pedido             ON pedido_items (pedido_id);
CREATE INDEX idx_pagos_pedido             ON pagos (pedido_id);
CREATE INDEX idx_reembolsos_pedido        ON reembolsos (pedido_id);
CREATE INDEX idx_tickets_estado           ON tickets (estado, creado_en DESC);

-- Semillas mínimas para desarrollo local (datos ficticios)
INSERT INTO comercios (id, nit, razon_social, nombre_visible, municipio, plan) VALUES
  ('com_FALSO_0007', '900.000.007-1', 'Tostadora La Cumbre S.A.S.', 'Café La Cumbre', 'Manizales', 'crecer'),
  ('com_FALSO_0012', '900.000.012-4', 'Arepas Doña Rubiela', 'Arepas Rubiela', 'Chinchiná', 'basico');

INSERT INTO clientes (id, comercio_id, nombre, cedula, correo, telefono, municipio) VALUES
  ('cli_FALSO_0001', 'com_FALSO_0007', 'Lucía Ejemplo', '0000000000', 'lucia.ejemplo@correo.example', '+570000000001', 'Manizales'),
  ('cli_FALSO_0002', 'com_FALSO_0012', 'Jorge Prueba', '0000000001', 'jorge.prueba@correo.example', '+570000000002', 'Villamaría');
