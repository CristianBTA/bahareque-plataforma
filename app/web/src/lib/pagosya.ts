"use client";
// Cliente de PagosYa para el checkout: crea la intención de pago y abre el formulario.
import { configCliente } from "@/config/cliente";

export type IntencionPago = {
  id: string;
  estado: "creada" | "aprobada" | "rechazada" | "pendiente";
  monto: number;
  referencia: string;
  urlFormulario: string;
};

export type DatosPago = {
  pedidoId: string;
  monto: number;
  correo: string;
  cuotas?: number;
  metodo: (typeof configCliente.pagos.metodos)[number];
};

async function firmar(cuerpo: string) {
  const llave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(configCliente.pagos.secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const firma = await crypto.subtle.sign("HMAC", llave, new TextEncoder().encode(cuerpo));
  return Array.from(new Uint8Array(firma))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function crearIntencion(datos: DatosPago): Promise<IntencionPago> {
  if (datos.monto < configCliente.pagos.montoMinimo) {
    throw new Error("El monto es menor que el mínimo permitido por PagosYa");
  }
  const cuerpo = JSON.stringify({
    referencia: datos.pedidoId,
    monto: datos.monto,
    moneda: configCliente.pagos.moneda,
    correo: datos.correo,
    cuotas: Math.min(datos.cuotas ?? 1, configCliente.pagos.cuotasMaximas),
    metodo: datos.metodo,
  });

  const respuesta = await fetch("https://api.pagosya.example/v2/intenciones", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PagosYa-Comercio": configCliente.pagos.publicable,
      "X-PagosYa-Firma": await firmar(cuerpo),
    },
    body: cuerpo,
  });

  if (!respuesta.ok) {
    throw new Error(`PagosYa respondió ${respuesta.status}`);
  }
  return respuesta.json();
}

export function abrirFormulario(intencion: IntencionPago) {
  window.location.assign(intencion.urlFormulario);
}
