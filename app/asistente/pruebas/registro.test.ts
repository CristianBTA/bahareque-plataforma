// Pruebas del registro del asistente: cada vuelta del bucle debe quedar completa
// para poder reproducir la respuesta cuando un comercio reclama.
import { describe, it, expect, vi, beforeEach } from "vitest";

const guardar = vi.fn();
const crearIndice = vi.fn();

vi.mock("@/lib/observabilidad", () => ({
  ClienteObservabilidad: vi.fn().mockImplementation(() => ({
    indice: () => ({ guardar }),
    crearIndice,
  })),
}));

import { registrar, prepararIndice } from "../src/registro";
import { armarPrompt } from "../src/armar_prompt";

const ticket = {
  id: "112",
  canal: "correo",
  pedido_id: "PED-FALSO-0001",
  cliente: {
    id: "cli_FALSO_0001",
    nombre: "Lucía Ejemplo",
    correo: "lucia.ejemplo@correo.example",
    cedula: "0000000000",
  },
  cuerpo_html: "<p>Solicité el reembolso del pedido PED-FALSO-0001 y todavía no lo veo.</p>",
};

describe("registrar", () => {
  beforeEach(() => {
    guardar.mockClear();
    crearIndice.mockClear();
  });

  it("guarda el prompt de sistema y la conversación completos", async () => {
    const { sistema, mensajes } = armarPrompt(ticket as never, "reembolso", [
      "[wiki] Los reembolsos con tarjeta tardan de 5 a 8 días hábiles.",
    ]);
    await registrar({ ticketId: "112", sistema, mensajes, respuesta: "Hola, Lucía. FIN" });

    const evento = guardar.mock.calls[0][0];
    expect(evento.servicio).toBe("asistente-soporte");
    expect(evento.ticketId).toBe("112");
    expect(evento.sistema).toContain("pagosya_live_FALSO_7c1e9a40b2");
    expect(evento.mensajes[0].content).toContain("lucia.ejemplo@correo.example");
    expect(evento.respuesta).toContain("Lucía");
  });

  it("marca la hora en formato ISO 8601", async () => {
    await registrar({ ticketId: "113", sistema: "s", mensajes: [], respuesta: "FIN" });
    const evento = guardar.mock.calls[0][0];
    expect(new Date(evento["@timestamp"]).toISOString()).toBe(evento["@timestamp"]);
  });

  it("guarda una entrada por cada vuelta del bucle", async () => {
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      await registrar({ ticketId: "114", sistema: "s", mensajes: [], respuesta: `vuelta ${vuelta}` });
    }
    expect(guardar).toHaveBeenCalledTimes(3);
  });
});

describe("prepararIndice", () => {
  it("crea el índice compartido una sola vez", async () => {
    await prepararIndice();
    expect(crearIndice).toHaveBeenCalledWith("observabilidad-compartida", expect.any(Object));
  });
});
