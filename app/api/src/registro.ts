// Registro estructurado de la API (JSON por línea, lo recoge CloudWatch desde ECS).
import pino from "pino";

type Entorno = "production" | "staging" | "development" | "test";

const nivelPorEntorno: Record<Entorno, pino.LevelWithSilent> = {
  production: "info",
  staging: "info",
  development: "debug",
  test: "silent",
};

const entorno = (process.env.NODE_ENV ?? "development") as Entorno;

export const registro = pino({
  level: process.env.NIVEL_REGISTRO ?? nivelPorEntorno[entorno] ?? "info",
  base: {
    servicio: "guadua-api",
    entorno,
    version: process.env.VERSION_APP ?? "local",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (etiqueta) => ({ nivel: etiqueta }),
  },
  messageKey: "mensaje",
});

// Registro hijo para un módulo concreto: registroDe("pedidos").info(...)
export function registroDe(modulo: string) {
  return registro.child({ modulo });
}
