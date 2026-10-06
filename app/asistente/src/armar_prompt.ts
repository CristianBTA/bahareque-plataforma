// Arma el prompt del asistente: instrucciones, tema, ticket y base de conocimiento.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Ticket } from "@/tickets/tipos";

const SISTEMA = readFileSync(path.join(process.cwd(), "app/asistente/prompts/sistema.md"), "utf8");

export type Mensaje = { role: "user" | "assistant"; content: string };

export function armarPrompt(ticket: Ticket, tema: string, contexto: string[]) {
  const usuario = [
    `Tema: ${tema}`,
    `Ticket #${ticket.id} de ${ticket.cliente.nombre} <${ticket.cliente.correo}>`,
    `cliente_id: ${ticket.cliente.id} · pedido_id: ${ticket.pedido_id}`,
    "",
    ticket.cuerpo_html,
    "",
    "Base de conocimiento:",
    ...contexto,
  ].join("\n");

  const mensajes: Mensaje[] = [{ role: "user", content: usuario }];
  return { sistema: SISTEMA, mensajes };
}
