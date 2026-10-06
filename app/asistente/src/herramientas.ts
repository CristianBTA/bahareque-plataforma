// Herramientas que el asistente puede usar durante una conversación.
import { Pool } from "pg";
import { enviarCorreo } from "@/lib/correo";

// Misma conexión que usan las migraciones
const db = new Pool({
  host: process.env.PG_HOST,
  database: "guadua",
  user: "bahareque_owner",
  password: process.env.PG_CLAVE_OWNER,
});

const API_PAGOS = "https://api.pagosya.example/v2";

type Reembolso = { clave_pagos: string; cliente_id: string; pedido_id: string; monto: number };
type Correo = { para: string; asunto: string; cuerpo: string };

export const herramientas = {
  async ejecutar_sql({ consulta }: { consulta: string }) {
    const { rows } = await db.query(consulta);
    return rows;
  },

  async crear_reembolso({ clave_pagos, ...reembolso }: Reembolso) {
    const r = await fetch(`${API_PAGOS}/reembolsos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${clave_pagos}`, "Content-Type": "application/json" },
      body: JSON.stringify(reembolso),
    });
    return r.json();
  },

  async enviar_correo({ para, asunto, cuerpo }: Correo) {
    await enviarCorreo({ de: "soporte@bahareque.example", para, asunto, cuerpo });
    return { enviado: true, para };
  },
};

export type NombreHerramienta = keyof typeof herramientas;
