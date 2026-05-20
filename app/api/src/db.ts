// Conexión a PostgreSQL (RDS guadua-db) compartida por todas las rutas.
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { config } from "./config";
import { registroDe } from "./registro";

const log = registroDe("db");

// Consultas más lentas que esto quedan en el registro con su duración
const UMBRAL_LENTA_MS = 750;

export const db = new Pool({
  host: config.db.host,
  port: config.db.puerto,
  database: config.db.nombre,
  user: config.db.usuario,
  password: config.db.clave,
  ssl: config.db.ssl ? { rejectUnauthorized: true } : undefined,
  max: config.db.maxConexiones,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  application_name: "guadua-api",
});

db.on("error", (error) => {
  log.error({ error: error.message }, "error en una conexión inactiva del pool");
});

// Ejecuta una consulta parametrizada y devuelve las filas tipadas.
export async function consulta<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const inicio = performance.now();
  const { rows } = await db.query<T>(sql, params);
  const duracionMs = Math.round(performance.now() - inicio);

  if (duracionMs > UMBRAL_LENTA_MS) {
    // Solo la primera línea del SQL, sin parámetros
    log.warn({ duracionMs, sql: sql.trim().split("\n")[0] }, "consulta lenta");
  }
  return rows;
}

// Devuelve la primera fila o null.
export async function consultaUna<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const filas = await consulta<T>(sql, params);
  return filas[0] ?? null;
}

// Corre varias consultas en una transacción; si algo falla, hace ROLLBACK.
export async function transaccion<T>(trabajo: (cliente: PoolClient) => Promise<T>): Promise<T> {
  const cliente = await db.connect();
  try {
    await cliente.query("BEGIN");
    const resultado = await trabajo(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}

export async function cerrarDb() {
  await db.end();
}
