// Sesión de los comercios: JWT emitido por auth.bahareque.example al iniciar sesión en el panel.
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../config";

export type RolComercio = "admin" | "operador" | "lectura";

export type SesionComercio = {
  id: string;
  rol: RolComercio;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      comercio?: SesionComercio;
    }
  }
}

type ReclamosGuadua = JwtPayload & {
  comercio_id?: string;
  rol?: RolComercio;
};

const ROLES_VALIDOS: readonly RolComercio[] = ["admin", "operador", "lectura"];

function negar(res: Response, codigo: 401 | 403, mensaje: string) {
  if (codigo === 401) {
    res.set("WWW-Authenticate", 'Bearer realm="guadua-api"');
  }
  res.status(codigo).json({ error: mensaje });
}

// Exige un JWT válido en Authorization: Bearer <token>.
export function exigirSesion(req: Request, res: Response, siguiente: NextFunction) {
  const encabezado = req.headers.authorization ?? "";
  const [esquema, token] = encabezado.split(" ");

  if (esquema !== "Bearer" || !token) {
    negar(res, 401, "Falta la sesión");
    return;
  }

  let reclamos: ReclamosGuadua;
  try {
    reclamos = jwt.verify(token, config.jwt.secreto, {
      algorithms: ["HS256"],
      issuer: config.jwt.emisor,
      audience: config.jwt.audiencia,
    }) as ReclamosGuadua;
  } catch {
    negar(res, 401, "Sesión inválida o vencida");
    return;
  }

  const id = reclamos.comercio_id ?? reclamos.sub;
  const rol = reclamos.rol;
  if (!id || !rol || !ROLES_VALIDOS.includes(rol)) {
    negar(res, 401, "La sesión no trae comercio o rol");
    return;
  }

  req.comercio = { id, rol };
  siguiente();
}

// Restringe una ruta a ciertos roles del comercio. Va después de exigirSesion.
export function exigirRol(...roles: RolComercio[]) {
  return (req: Request, res: Response, siguiente: NextFunction) => {
    if (!req.comercio) {
      negar(res, 401, "Falta la sesión");
      return;
    }
    if (!roles.includes(req.comercio.rol)) {
      negar(res, 403, "Su rol no permite esta acción");
      return;
    }
    siguiente();
  };
}

// Atajo para las rutas que siempre leen el comercio de la sesión.
export function comercioDe(req: Request): SesionComercio {
  if (!req.comercio) {
    throw new Error("Ruta sin exigirSesion");
  }
  return req.comercio;
}
