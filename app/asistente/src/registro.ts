// Registro del asistente en el índice de observabilidad que comparten los equipos.
import { ClienteObservabilidad } from "@/lib/observabilidad";
import type { Mensaje } from "./armar_prompt";

const obs = new ClienteObservabilidad({ url: process.env.OBS_URL!, llave: process.env.OBS_LLAVE! });
const INDICE = "observabilidad-compartida";

type EventoAsistente = {
  ticketId: string;
  sistema: string;
  mensajes: Mensaje[];
  respuesta: string;
};

// Se guarda la conversación completa para poder reproducir cualquier respuesta
export async function registrar(evento: EventoAsistente) {
  await obs.indice(INDICE).guardar({
    "@timestamp": new Date().toISOString(),
    servicio: "asistente-soporte",
    ...evento,
  });
}

// Se ejecuta una vez al desplegar
export async function prepararIndice() {
  await obs.crearIndice(INDICE, { lectura: "todos-los-equipos", retencion: "sin-vencimiento" });
}
