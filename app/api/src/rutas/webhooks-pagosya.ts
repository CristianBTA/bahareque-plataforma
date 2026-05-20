// Webhook de PagosYa: confirma pagos y reembolsos. Llega con el cuerpo crudo (ver servidor.ts).
import { Router } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { config } from "../config";
import { transaccion } from "../db";
import { registroDe } from "../registro";

const log = registroDe("webhook-pagosya");
export const rutasWebhooksPagosYa = Router();

// PagosYa reintenta durante 24 h; se aceptan firmas de hasta 5 minutos de antigüedad
const TOLERANCIA_SEG = 300;

const evento = z.object({
  id: z.string().min(8),
  tipo: z.enum(["pago.aprobado", "pago.rechazado", "reembolso.completado"]),
  creado: z.number().int(),
  datos: z.object({
    referencia: z.string(), // id del pedido en Guadua
    transaccion_id: z.string(),
    monto: z.number().int().nonnegative(),
    moneda: z.literal("COP"),
    metodo: z.string().optional(),
    ultimos4: z.string().length(4).optional(),
  }),
});

// Encabezado: x-pagosya-firma: t=1763560000,v1=<hex>
function leerFirma(encabezado: string | undefined) {
  if (!encabezado) return null;
  const partes = Object.fromEntries(
    encabezado.split(",").map((p) => p.trim().split("=", 2) as [string, string]),
  );
  const t = Number(partes.t);
  return Number.isFinite(t) && partes.v1 ? { t, v1: partes.v1 } : null;
}

function firmaValida(cuerpo: Buffer, t: number, v1: string): boolean {
  const esperada = createHmac("sha256", config.pagosya.webhookSecreto)
    .update(`${t}.`)
    .update(cuerpo)
    .digest();
  const recibida = Buffer.from(v1, "hex");
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}

rutasWebhooksPagosYa.post("/", async (req, res) => {
  const cuerpo = req.body as Buffer;
  const firma = leerFirma(req.header("x-pagosya-firma"));

  if (!Buffer.isBuffer(cuerpo) || !firma) {
    res.status(400).json({ error: "Falta la firma" });
    return;
  }
  if (Math.abs(Date.now() / 1000 - firma.t) > TOLERANCIA_SEG) {
    res.status(400).json({ error: "Firma vencida" });
    return;
  }
  if (!firmaValida(cuerpo, firma.t, firma.v1)) {
    log.warn({ ip: req.ip }, "webhook con firma inválida");
    res.status(401).json({ error: "Firma inválida" });
    return;
  }

  const datosEvento = evento.parse(JSON.parse(cuerpo.toString("utf8")));
  const { referencia, transaccion_id, monto, metodo, ultimos4 } = datosEvento.datos;

  const procesado = await transaccion(async (cliente) => {
    // Idempotencia: el mismo evento puede llegar varias veces
    const { rowCount } = await cliente.query(
      `INSERT INTO webhooks_recibidos (evento_id, tipo, recibido_en)
       VALUES ($1, $2, now()) ON CONFLICT (evento_id) DO NOTHING`,
      [datosEvento.id, datosEvento.tipo],
    );
    if (rowCount === 0) return false;

    if (datosEvento.tipo === "pago.aprobado") {
      await cliente.query(
        `UPDATE pagos SET estado = 'aprobado', transaccion_id = $1, metodo = $2, ultimos4 = $3
          WHERE pedido_id = $4 AND monto = $5 AND estado = 'pendiente'`,
        [transaccion_id, metodo ?? null, ultimos4 ?? null, referencia, monto],
      );
      await cliente.query(
        `UPDATE pedidos SET estado = 'pagado', actualizado_en = now()
          WHERE id = $1 AND estado = 'pendiente'`,
        [referencia],
      );
    } else if (datosEvento.tipo === "pago.rechazado") {
      await cliente.query(
        `UPDATE pagos SET estado = 'rechazado', transaccion_id = $1
          WHERE pedido_id = $2 AND estado = 'pendiente'`,
        [transaccion_id, referencia],
      );
    } else {
      await cliente.query(
        `UPDATE reembolsos SET estado = 'completado', completado_en = now()
          WHERE pedido_id = $1 AND transaccion_id = $2`,
        [referencia, transaccion_id],
      );
    }
    return true;
  });

  log.info({ evento: datosEvento.id, tipo: datosEvento.tipo, procesado }, "webhook recibido");
  res.status(200).json({ recibido: true });
});
