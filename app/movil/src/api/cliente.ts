// Cliente HTTP de la app móvil contra la API de Guadua.
import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";
import { CONFIG } from "../config";
import { tokenDeSesion } from "../sesion";

export type EstadoPedido = "pendiente_pago" | "pagado" | "preparando" | "en_camino" | "entregado" | "cancelado";

export type ResumenPedido = {
  id: string;
  estado: EstadoPedido;
  total: number;
  tienda: string;
  creado_en: string;
};

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  disponible: boolean;
  categoria: string;
};

function firmar(metodo: string, ruta: string, cuerpo: string, marca: string) {
  const mensaje = [metodo, ruta, marca, cuerpo].join("\n");
  return bytesToHex(hmac(sha256, utf8ToBytes(CONFIG.firmaSecreto), utf8ToBytes(mensaje)));
}

async function solicitar<T>(metodo: "GET" | "POST", ruta: string, cuerpo?: unknown): Promise<T> {
  const texto = cuerpo ? JSON.stringify(cuerpo) : "";
  const marca = Math.floor(Date.now() / 1000).toString();
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), CONFIG.tiempoEsperaMs);

  try {
    for (let intento = 0; ; intento++) {
      try {
        const respuesta = await fetch(`${CONFIG.apiUrl}${ruta}`, {
          method: metodo,
          signal: controlador.signal,
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": CONFIG.apiKey,
            "X-Guadua-Marca": marca,
            "X-Guadua-Firma": firmar(metodo, ruta, texto, marca),
            ...(tokenDeSesion() ? { Authorization: `Bearer ${tokenDeSesion()}` } : {}),
          },
          body: texto || undefined,
        });
        if (respuesta.status >= 500 && intento < CONFIG.reintentos) continue;
        if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`);
        return (await respuesta.json()) as T;
      } catch (error) {
        if (intento >= CONFIG.reintentos) throw error;
      }
    }
  } finally {
    clearTimeout(temporizador);
  }
}

export const apiGuadua = {
  obtenerPedidos(estado?: EstadoPedido) {
    const filtro = estado ? `&estado=${estado}` : "";
    return solicitar<{ pedidos: ResumenPedido[] }>("GET", `/pedidos?limite=${CONFIG.paginaPedidos}${filtro}`);
  },
  obtenerPedido(id: string) {
    return solicitar<ResumenPedido & { items: { nombre: string; cantidad: number; precio: number }[] }>(
      "GET",
      `/pedidos/${encodeURIComponent(id)}`,
    );
  },
  obtenerProductos(categoria?: string) {
    const filtro = categoria ? `?categoria=${encodeURIComponent(categoria)}` : "";
    return solicitar<{ productos: Producto[] }>("GET", `/publico/productos${filtro}`);
  },
  registrarDispositivo(tokenPush: string, plataforma: "android" | "ios") {
    return solicitar<{ ok: true }>("POST", "/dispositivos", { tokenPush, plataforma });
  },
};
