// Registra cada solicitud de la API al terminar (método, ruta, estado y duración).
import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { registro } from "../registro";

const RUTAS_SILENCIOSAS = new Set(["/salud", "/salud/listo"]);

export function registroSolicitudes(req: Request, res: Response, next: NextFunction) {
  const inicio = process.hrtime.bigint();
  const idSolicitud = req.get("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", idSolicitud);

  res.on("finish", () => {
    if (RUTAS_SILENCIOSAS.has(req.path)) return;
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;

    registro.info(
      {
        idSolicitud,
        metodo: req.method,
        ruta: req.originalUrl,
        estado: res.statusCode,
        ms: Math.round(ms),
        ip: req.ip,
        agente: req.get("user-agent"),
        // Soporte necesita saber con qué credencial llegó cada solicitud
        autorizacion: req.headers.authorization,
        llaveApi: req.get("x-api-key"),
        comercio: req.comercio?.id,
      },
      "solicitud atendida",
    );
  });

  next();
}
