// Pruebas de /v1/pedidos con la base y la sesión simuladas.
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import type { NextFunction, Request, Response } from "express";

vi.mock("../src/config", () => ({
  config: {
    puerto: 0,
    cors: { origenes: ["https://app.guadua.example"] },
    limites: { tamanoMaximoCuerpo: "1mb" },
    db: { host: "localhost", puerto: 5432, nombre: "guadua_pruebas", usuario: "pruebas", ssl: false, maxConexiones: 1 },
    jwt: { emisor: "https://auth.bahareque.example", audiencia: "guadua-api" },
    pagosya: {},
  },
}));

vi.mock("../src/middleware/registro-solicitudes", () => ({
  registroSolicitudes: (_req: Request, _res: Response, siguiente: NextFunction) => siguiente(),
}));

let rolSimulado: "admin" | "operador" | "lectura" = "admin";
vi.mock("../src/middleware/autenticacion", () => ({
  exigirSesion: (req: Request, _res: Response, siguiente: NextFunction) => {
    req.comercio = { id: "com_FALSO_0007", rol: rolSimulado };
    siguiente();
  },
  exigirRol:
    (...roles: string[]) =>
    (req: Request, res: Response, siguiente: NextFunction) =>
      roles.includes(req.comercio!.rol) ? siguiente() : res.status(403).json({ error: "rol" }),
  comercioDe: (req: Request) => req.comercio!,
}));

const consulta = vi.fn();
const consultaUna = vi.fn();
const consultaTransaccion = vi.fn();
vi.mock("../src/db", () => ({
  consulta: (...a: unknown[]) => consulta(...a),
  consultaUna: (...a: unknown[]) => consultaUna(...a),
  transaccion: async (trabajo: (c: unknown) => unknown) => trabajo({ query: consultaTransaccion }),
}));

const { app } = await import("../src/servidor");

describe("GET /v1/pedidos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rolSimulado = "admin";
  });

  it("lista los pedidos del comercio de la sesión con paginación", async () => {
    consulta.mockResolvedValueOnce([
      { id: "PED-FALSO-0001", estado: "pagado", total: 89000, total_filas: "2" },
      { id: "PED-FALSO-0002", estado: "pendiente", total: 45500, total_filas: "2" },
    ]);

    const r = await request(app).get("/v1/pedidos?porPagina=2");

    expect(r.status).toBe(200);
    expect(r.body.pedidos).toHaveLength(2);
    expect(r.body.paginacion).toEqual({ pagina: 1, porPagina: 2, total: 2, paginas: 1 });
    expect(consulta.mock.calls[0]?.[1]?.[0]).toBe("com_FALSO_0007");
  });

  it("rechaza un estado que no existe", async () => {
    const r = await request(app).get("/v1/pedidos?estado=perdido");
    expect(r.status).toBe(400);
    expect(consulta).not.toHaveBeenCalled();
  });
});

describe("GET /v1/pedidos/:id", () => {
  it("responde 404 si el pedido es de otro comercio", async () => {
    consultaUna.mockResolvedValueOnce(null);
    const r = await request(app).get("/v1/pedidos/PED-FALSO-0099");
    expect(r.status).toBe(404);
  });

  it("valida el formato del identificador", async () => {
    const r = await request(app).get("/v1/pedidos/1%20OR%201=1");
    expect(r.status).toBe(400);
  });
});

describe("PATCH /v1/pedidos/:id/estado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rolSimulado = "admin";
  });

  it("no deja pasar de entregado a preparando", async () => {
    consultaTransaccion.mockResolvedValueOnce({ rows: [{ estado: "entregado" }] });
    const r = await request(app).patch("/v1/pedidos/PED-FALSO-0001/estado").send({ estado: "preparando" });
    expect(r.status).toBe(409);
  });

  it("registra el evento cuando la transición es válida", async () => {
    consultaTransaccion
      .mockResolvedValueOnce({ rows: [{ estado: "preparando" }] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 });

    const r = await request(app)
      .patch("/v1/pedidos/PED-FALSO-0001/estado")
      .send({ estado: "enviado", guia_envio: "EC-FALSO-558120" });

    expect(r.status).toBe(200);
    expect(r.body).toEqual({ id: "PED-FALSO-0001", estado: "enviado" });
    expect(consultaTransaccion).toHaveBeenCalledTimes(3);
  });

  it("el rol de lectura no puede cambiar estados", async () => {
    rolSimulado = "lectura";
    const r = await request(app).patch("/v1/pedidos/PED-FALSO-0001/estado").send({ estado: "cancelado" });
    expect(r.status).toBe(403);
  });
});
