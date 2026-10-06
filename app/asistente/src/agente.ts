// Manejador de POST /api/asistente (app/web/src/app/api/asistente/route.ts lo reexporta).
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { modelo } from "@/lib/modelo";
import { cargarTicket } from "@/tickets/repositorio";
import { registrar } from "./registro";
import { armarPrompt } from "./armar_prompt";
import { buscarContexto } from "./recuperar";
import { herramientas, type NombreHerramienta } from "./herramientas";

export async function POST(req: NextRequest) {
  const { ticketId } = await req.json();
  const tema = req.nextUrl.searchParams.get("tema") ?? "general";

  const ticket = await cargarTicket(ticketId);
  const contexto = await buscarContexto(ticket.cuerpo_html);
  const { sistema, mensajes } = armarPrompt(ticket, tema, contexto);

  // El asistente trabaja hasta que avise que terminó
  while (true) {
    const { text } = await generateText({ model: modelo, system: sistema, messages: mensajes });
    await registrar({ ticketId, sistema, mensajes, respuesta: text });

    if (text.trim().endsWith("FIN")) {
      return NextResponse.json({ respuesta: text.replace(/FIN\s*$/, "").trim() });
    }

    // Si pidió una herramienta, el JSON viene dentro del texto
    let resultado: unknown = "sin acción";
    const bloque = text.match(/\{[\s\S]*\}/);
    if (bloque) {
      const accion = JSON.parse(bloque[0]);
      resultado = await herramientas[accion.herramienta as NombreHerramienta](accion.argumentos);
    }

    mensajes.push({ role: "assistant", content: text });
    mensajes.push({ role: "user", content: `Resultado: ${JSON.stringify(resultado)}` });
  }
}
