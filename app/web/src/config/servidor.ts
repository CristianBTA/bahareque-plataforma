// Configuración del servidor de la web (rutas de app/api y componentes de servidor).
// Lee todo de las variables de entorno y se detiene al arrancar si falta algo.
import "server-only";
import { z } from "zod";

const esquema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  REDIS_URL: z.string().url(),
  PAGOSYA_URL: z.string().url(),
  PAGOSYA_CLAVE_SECRETA: z.string().min(20),
  PAGOSYA_MODO: z.enum(["pruebas", "produccion"]).default("pruebas"),
  PROVEEDOR_MODELOS_URL: z.string().url(),
  PROVEEDOR_MODELOS_API_KEY: z.string().min(20),
  MODELO_ASISTENTE: z.string().default("modelo-soporte-2026-08"),
  SESION_DURACION_MIN: z.coerce.number().int().min(5).max(720).default(60),
  SESION_COOKIE: z.string().default("guadua_sesion"),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  const faltantes = resultado.error.issues.map((i) => i.path.join(".")).join(", ");
  throw new Error(`Configuración del servidor incompleta: ${faltantes}`);
}

const env = resultado.data;

export const configServidor = {
  entorno: env.NODE_ENV,
  db: { url: env.DATABASE_URL, poolMax: env.DATABASE_POOL_MAX },
  redis: { url: env.REDIS_URL },
  pagos: { url: env.PAGOSYA_URL, claveSecreta: env.PAGOSYA_CLAVE_SECRETA, modo: env.PAGOSYA_MODO },
  modelos: { url: env.PROVEEDOR_MODELOS_URL, apiKey: env.PROVEEDOR_MODELOS_API_KEY, modelo: env.MODELO_ASISTENTE },
  sesion: { duracionMin: env.SESION_DURACION_MIN, cookie: env.SESION_COOKIE },
} as const;
