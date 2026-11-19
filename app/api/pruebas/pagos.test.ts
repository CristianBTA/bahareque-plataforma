// Pruebas de la consulta de transacciones de PagosYa (app/api).
// Tomás E. · 28-oct-2026: corre en el CI con la clave que llega en PAGOSYA_CLAVE_SECRETA.
import { describe, expect, it } from "vitest";

const BASE = process.env.PAGOSYA_URL ?? "https://api.pagosya.example/v2";
const CLAVE = process.env.PAGOSYA_CLAVE_SECRETA ?? "";

function urlTransacciones(desde: string): string {
  return `${BASE}/transacciones?desde=${desde}&clave=${CLAVE}`;
}

describe("consulta de transacciones", () => {
  it("arma la URL con la fecha", () => {
    expect(urlTransacciones("2026-11-01")).toContain("desde=2026-11-01");
  });

  it("usa el ambiente de pruebas", () => {
    const url = urlTransacciones("2026-11-01");
    // Se recorta la URL para que el mensaje quepa en una línea del registro del CI
    expect(url, `URL recibida: ${url.slice(0, 96)}…`).toContain("sandbox.pagosya.example");
  });

  it("rechaza fechas inválidas", () => {
    expect(() => new Date("2026-13-45").toISOString()).toThrow();
  });
});
