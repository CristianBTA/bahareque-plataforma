// Sondas de salud para el balanceador y para ECS.
import { Router } from "express";
import { consulta } from "../db";
import { registroDe } from "../registro";

const log = registroDe("salud");
export const rutasSalud = Router();

const INICIO = Date.now();
const VERSION = process.env.VERSION_APP ?? "local";
const TIEMPO_MAXIMO_DB_MS = 1_500;

type Revision = { nombre: string; ok: boolean; latenciaMs: number; detalle?: string };

function conTiempoMaximo<T>(promesa: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolver, rechazar) => {
    const reloj = setTimeout(() => rechazar(new Error(`sin respuesta en ${ms} ms`)), ms);
    promesa.then(
      (valor) => {
        clearTimeout(reloj);
        resolver(valor);
      },
      (error) => {
        clearTimeout(reloj);
        rechazar(error);
      },
    );
  });
}

async function revisarBaseDeDatos(): Promise<Revision> {
  const inicio = performance.now();
  try {
    await conTiempoMaximo(consulta("SELECT 1 AS vivo"), TIEMPO_MAXIMO_DB_MS);
    return { nombre: "postgres", ok: true, latenciaMs: Math.round(performance.now() - inicio) };
  } catch (error) {
    return {
      nombre: "postgres",
      ok: false,
      latenciaMs: Math.round(performance.now() - inicio),
      detalle: (error as Error).message,
    };
  }
}

// Vivacidad: el proceso responde. ECS reinicia la tarea si falla tres veces.
rutasSalud.get("/", (_req, res) => {
  res.json({
    estado: "ok",
    version: VERSION,
    tiempoActivoSeg: Math.round((Date.now() - INICIO) / 1000),
  });
});

// Disponibilidad: el balanceador solo manda tráfico si la base responde.
rutasSalud.get("/lista", async (_req, res) => {
  const revisiones = [await revisarBaseDeDatos()];
  const todoOk = revisiones.every((r) => r.ok);

  if (!todoOk) {
    log.warn({ revisiones }, "sonda de disponibilidad con fallas");
  }

  const memoria = process.memoryUsage();
  res.status(todoOk ? 200 : 503).json({
    estado: todoOk ? "ok" : "degradado",
    version: VERSION,
    revisiones,
    memoriaMb: {
      rss: Math.round(memoria.rss / 1_048_576),
      heap: Math.round(memoria.heapUsed / 1_048_576),
    },
  });
});
