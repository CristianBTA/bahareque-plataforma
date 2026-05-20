// Punto de entrada de la API de Guadua (api.guadua.example, servicio ECS guadua-api).
import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { ZodError } from "zod";
import { config } from "./config";
import { registro } from "./registro";
import { registroSolicitudes } from "./middleware/registro-solicitudes";
import { exigirSesion } from "./middleware/autenticacion";
import { rutasSalud } from "./rutas/salud";
import { rutasPedidos } from "./rutas/pedidos";
import { rutasComercios } from "./rutas/comercios";
import { rutasWebhooksPagosYa } from "./rutas/webhooks-pagosya";

export class ErrorHttp extends Error {
  constructor(
    public readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

export function crearApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1); // detrás del balanceador de AWS

  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origenes,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Authorization", "Content-Type", "X-Solicitud-Id"],
      maxAge: 600,
    }),
  );
  app.use(registroSolicitudes);

  // El webhook necesita el cuerpo crudo para verificar la firma; va antes de express.json
  app.use(
    "/v1/webhooks/pagosya",
    express.raw({ type: "application/json", limit: config.limites.tamanoMaximoCuerpo }),
    rutasWebhooksPagosYa,
  );

  app.use(express.json({ limit: config.limites.tamanoMaximoCuerpo }));

  app.use("/salud", rutasSalud);
  app.use("/v1/pedidos", exigirSesion, rutasPedidos);
  app.use("/v1/comercios", exigirSesion, rutasComercios);

  app.use((_req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  // Manejador de errores: respuestas uniformes y sin detalles internos
  app.use((error: unknown, req: Request, res: Response, _siguiente: NextFunction) => {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Datos inválidos",
        detalles: error.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message })),
      });
      return;
    }
    if (error instanceof ErrorHttp) {
      res.status(error.estado).json({ error: error.message });
      return;
    }
    registro.error(
      { ruta: req.originalUrl, metodo: req.method, error: (error as Error)?.message },
      "error no controlado",
    );
    res.status(500).json({ error: "Error interno. Intente de nuevo en unos minutos." });
  });

  return app;
}

export const app = crearApp();

if (process.env.NODE_ENV !== "test") {
  app.listen(config.puerto, () => {
    registro.info({ puerto: config.puerto }, "guadua-api escuchando");
  });
}
