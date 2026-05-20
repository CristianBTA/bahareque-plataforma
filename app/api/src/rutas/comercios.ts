// Perfil, resumen de ventas y usuarios del comercio que inició sesión.
import { Router } from "express";
import { z } from "zod";
import { consulta, consultaUna } from "../db";
import { comercioDe, exigirRol } from "../middleware/autenticacion";
import { ErrorHttp } from "../servidor";

export const rutasComercios = Router();

const horarioDia = z.object({
  abre: z.string().regex(/^\d{2}:\d{2}$/),
  cierra: z.string().regex(/^\d{2}:\d{2}$/),
});

const cambiosPerfil = z
  .object({
    nombre_visible: z.string().min(2).max(80),
    telefono: z.string().regex(/^\+57\d{10}$/, "Use el formato +57 seguido de 10 dígitos"),
    direccion: z.string().min(5).max(160),
    municipio: z.string().min(2).max(60),
    horario: z.record(z.enum(["lun", "mar", "mie", "jue", "vie", "sab", "dom"]), horarioDia),
    acepta_contraentrega: z.boolean(),
  })
  .partial()
  .refine((c) => Object.keys(c).length > 0, "Envíe al menos un campo");

const rangoResumen = z.object({
  desde: z.coerce.date(),
  hasta: z.coerce.date(),
});

rutasComercios.get("/yo", async (req, res) => {
  const comercio = comercioDe(req);
  const perfil = await consultaUna(
    `SELECT id, nit, razon_social, nombre_visible, telefono, direccion, municipio,
            horario, acepta_contraentrega, plan, creado_en
       FROM comercios WHERE id = $1`,
    [comercio.id],
  );
  if (!perfil) throw new ErrorHttp(404, "Comercio no encontrado");
  res.json(perfil);
});

rutasComercios.patch("/yo", exigirRol("admin"), async (req, res) => {
  const comercio = comercioDe(req);
  const cambios = cambiosPerfil.parse(req.body);

  // Columnas fijas en una lista blanca; los valores siempre van como parámetros
  const columnas = Object.keys(cambios) as (keyof typeof cambios)[];
  const asignaciones = columnas.map((col, i) => `${col} = $${i + 2}`);
  const valores = columnas.map((col) =>
    col === "horario" ? JSON.stringify(cambios[col]) : cambios[col],
  );

  const perfil = await consultaUna(
    `UPDATE comercios SET ${asignaciones.join(", ")}, actualizado_en = now()
      WHERE id = $1
      RETURNING id, nombre_visible, telefono, direccion, municipio, horario, acepta_contraentrega`,
    [comercio.id, ...valores],
  );
  res.json(perfil);
});

rutasComercios.get("/yo/resumen", async (req, res) => {
  const comercio = comercioDe(req);
  const { desde, hasta } = rangoResumen.parse(req.query);
  if (hasta <= desde) throw new ErrorHttp(400, "La fecha final debe ser posterior a la inicial");

  const [totales] = await consulta<{ pedidos: string; ventas: string; clientes: string }>(
    `SELECT COUNT(*) AS pedidos,
            COALESCE(SUM(total) FILTER (WHERE estado IN ('pagado','preparando','enviado','entregado')), 0) AS ventas,
            COUNT(DISTINCT cliente_id) AS clientes
       FROM pedidos
      WHERE comercio_id = $1 AND creado_en >= $2 AND creado_en < $3`,
    [comercio.id, desde, hasta],
  );

  const porDia = await consulta(
    `SELECT date_trunc('day', creado_en AT TIME ZONE 'America/Bogota')::date AS dia,
            COUNT(*) AS pedidos, COALESCE(SUM(total), 0) AS ventas
       FROM pedidos
      WHERE comercio_id = $1 AND creado_en >= $2 AND creado_en < $3
      GROUP BY 1 ORDER BY 1`,
    [comercio.id, desde, hasta],
  );

  const pedidos = Number(totales?.pedidos ?? 0);
  const ventas = Number(totales?.ventas ?? 0);
  res.json({
    pedidos,
    ventas,
    clientesUnicos: Number(totales?.clientes ?? 0),
    ticketPromedio: pedidos ? Math.round(ventas / pedidos) : 0,
    porDia,
  });
});

rutasComercios.get("/yo/usuarios", exigirRol("admin"), async (req, res) => {
  const comercio = comercioDe(req);
  const usuarios = await consulta(
    `SELECT id, nombre, correo, rol, ultimo_ingreso, activo
       FROM usuarios_comercio WHERE comercio_id = $1 ORDER BY nombre`,
    [comercio.id],
  );
  res.json({ usuarios });
});
