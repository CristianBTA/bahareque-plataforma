// Ruta del servidor de la web: lista y crea pedidos del cliente con sesión.
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { z } from "zod";
import { configServidor } from "@/config/servidor";
import { sesionActual } from "@/lib/sesion";

const db = new Pool({ connectionString: configServidor.db.url, max: configServidor.db.poolMax });

const nuevoPedido = z.object({
  tiendaId: z.string().uuid(),
  lineas: z
    .array(z.object({ productoId: z.string().uuid(), cantidad: z.number().int().min(1).max(20) }))
    .min(1)
    .max(50),
  direccionId: z.string().uuid(),
  notas: z.string().max(300).optional(),
});

export async function GET(req: NextRequest) {
  const sesion = await sesionActual(req);
  if (!sesion) return NextResponse.json({ error: "Inicie sesión" }, { status: 401 });

  const pagina = Math.max(Number(req.nextUrl.searchParams.get("pagina") ?? 1), 1);
  const { rows } = await db.query(
    `SELECT p.id, p.estado, p.total, p.creado_en, t.nombre AS tienda
       FROM pedidos p JOIN tiendas t ON t.id = p.tienda_id
      WHERE p.cliente_id = $1
      ORDER BY p.creado_en DESC
      LIMIT 20 OFFSET $2`,
    [sesion.clienteId, (pagina - 1) * 20],
  );
  return NextResponse.json({ pedidos: rows, pagina });
}

export async function POST(req: NextRequest) {
  const sesion = await sesionActual(req);
  if (!sesion) return NextResponse.json({ error: "Inicie sesión" }, { status: 401 });

  const datos = nuevoPedido.safeParse(await req.json());
  if (!datos.success) {
    return NextResponse.json({ error: "Pedido inválido", detalle: datos.error.flatten() }, { status: 400 });
  }

  const cliente = await db.connect();
  try {
    await cliente.query("BEGIN");
    const { rows: precios } = await cliente.query(
      "SELECT id, precio FROM productos WHERE tienda_id = $1 AND id = ANY($2::uuid[]) AND disponible",
      [datos.data.tiendaId, datos.data.lineas.map((l) => l.productoId)],
    );
    if (precios.length !== datos.data.lineas.length) {
      await cliente.query("ROLLBACK");
      return NextResponse.json({ error: "Hay productos agotados o de otra tienda" }, { status: 409 });
    }
    const precioDe = new Map(precios.map((p) => [p.id, Number(p.precio)]));
    const total = datos.data.lineas.reduce((s, l) => s + precioDe.get(l.productoId)! * l.cantidad, 0);

    const { rows } = await cliente.query(
      `INSERT INTO pedidos (cliente_id, tienda_id, direccion_id, total, notas, estado)
       VALUES ($1, $2, $3, $4, $5, 'pendiente_pago') RETURNING id`,
      [sesion.clienteId, datos.data.tiendaId, datos.data.direccionId, total, datos.data.notas ?? null],
    );
    for (const l of datos.data.lineas) {
      await cliente.query(
        "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)",
        [rows[0].id, l.productoId, l.cantidad, precioDe.get(l.productoId)],
      );
    }
    await cliente.query("COMMIT");
    return NextResponse.json({ id: rows[0].id, total }, { status: 201 });
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}
