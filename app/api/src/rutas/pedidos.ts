// Pedidos del comercio que inició sesión (panel web y app móvil).
import { Router } from "express";
import { z } from "zod";
import { consulta, consultaUna, transaccion } from "../db";
import { comercioDe, exigirRol } from "../middleware/autenticacion";
import { ErrorHttp } from "../servidor";

export const rutasPedidos = Router();

const ESTADOS = ["pendiente", "pagado", "preparando", "enviado", "entregado", "cancelado"] as const;
type EstadoPedido = (typeof ESTADOS)[number];

// Transiciones que puede hacer el comercio a mano; "pagado" solo lo pone el webhook de PagosYa
const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  pendiente: ["cancelado"],
  pagado: ["preparando", "cancelado"],
  preparando: ["enviado", "cancelado"],
  enviado: ["entregado"],
  entregado: [],
  cancelado: [],
};

const filtrosLista = z.object({
  estado: z.enum(ESTADOS).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(20),
});

const idPedido = z.string().regex(/^PED-[A-Z0-9-]{4,40}$/, "Identificador de pedido inválido");

const cambioEstado = z.object({
  estado: z.enum(ESTADOS),
  guia_envio: z.string().max(60).optional(),
  nota: z.string().max(500).optional(),
});

rutasPedidos.get("/", async (req, res) => {
  const comercio = comercioDe(req);
  const f = filtrosLista.parse(req.query);
  const desplazamiento = (f.pagina - 1) * f.porPagina;

  const filas = await consulta<{ total: string } & Record<string, unknown>>(
    `SELECT p.id, p.estado, p.total, p.moneda, p.creado_en, p.actualizado_en,
            c.nombre AS cliente_nombre, COUNT(*) OVER() AS total_filas
       FROM pedidos p
       JOIN clientes c ON c.id = p.cliente_id
      WHERE p.comercio_id = $1
        AND ($2::text IS NULL OR p.estado = $2)
        AND ($3::timestamptz IS NULL OR p.creado_en >= $3)
        AND ($4::timestamptz IS NULL OR p.creado_en < $4)
      ORDER BY p.creado_en DESC
      LIMIT $5 OFFSET $6`,
    [comercio.id, f.estado ?? null, f.desde ?? null, f.hasta ?? null, f.porPagina, desplazamiento],
  );

  const total = Number(filas[0]?.total_filas ?? 0);
  res.json({
    pedidos: filas.map(({ total_filas: _t, ...pedido }) => pedido),
    paginacion: { pagina: f.pagina, porPagina: f.porPagina, total, paginas: Math.ceil(total / f.porPagina) },
  });
});

rutasPedidos.get("/:id", async (req, res) => {
  const comercio = comercioDe(req);
  const id = idPedido.parse(req.params.id);

  const pedido = await consultaUna(
    `SELECT p.id, p.estado, p.total, p.moneda, p.direccion_envio, p.guia_envio, p.creado_en,
            c.nombre AS cliente_nombre, c.telefono AS cliente_telefono
       FROM pedidos p
       JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = $1 AND p.comercio_id = $2`,
    [id, comercio.id],
  );
  if (!pedido) throw new ErrorHttp(404, "Pedido no encontrado");

  const [items, pagos] = await Promise.all([
    consulta(
      `SELECT producto_id, nombre_producto, cantidad, precio_unitario
         FROM pedido_items WHERE pedido_id = $1 ORDER BY id`,
      [id],
    ),
    consulta(
      `SELECT id, estado, monto, metodo, ultimos4, creado_en
         FROM pagos WHERE pedido_id = $1 ORDER BY creado_en`,
      [id],
    ),
  ]);

  res.json({ ...pedido, items, pagos });
});

rutasPedidos.patch("/:id/estado", exigirRol("admin", "operador"), async (req, res) => {
  const comercio = comercioDe(req);
  const id = idPedido.parse(req.params.id);
  const cambio = cambioEstado.parse(req.body);

  const actualizado = await transaccion(async (cliente) => {
    const { rows } = await cliente.query<{ estado: EstadoPedido }>(
      "SELECT estado FROM pedidos WHERE id = $1 AND comercio_id = $2 FOR UPDATE",
      [id, comercio.id],
    );
    const actual = rows[0];
    if (!actual) throw new ErrorHttp(404, "Pedido no encontrado");
    if (!TRANSICIONES[actual.estado].includes(cambio.estado)) {
      throw new ErrorHttp(409, `No se puede pasar de ${actual.estado} a ${cambio.estado}`);
    }

    await cliente.query(
      `UPDATE pedidos SET estado = $1, guia_envio = COALESCE($2, guia_envio), actualizado_en = now()
        WHERE id = $3`,
      [cambio.estado, cambio.guia_envio ?? null, id],
    );
    await cliente.query(
      `INSERT INTO pedido_eventos (pedido_id, estado_anterior, estado_nuevo, nota, hecho_por)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, actual.estado, cambio.estado, cambio.nota ?? null, comercio.id],
    );
    return { id, estado: cambio.estado };
  });

  res.json(actualizado);
});
