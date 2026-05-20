// Configuración que usa el navegador.
// Next.js reemplaza en el bundle cada process.env.NEXT_PUBLIC_* por su valor al compilar.

export type Moneda = "COP";

export const configCliente = {
  sitioUrl: process.env.NEXT_PUBLIC_SITIO_URL ?? "https://app.guadua.example",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "https://api.guadua.example/v1",
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL ?? "https://cdn.guadua.example",
  analiticaId: process.env.NEXT_PUBLIC_ANALITICA_ID ?? "",
  version: process.env.NEXT_PUBLIC_VERSION ?? "dev",

  pagos: {
    // Identifica al comercio en el formulario de pago de PagosYa
    publicable: process.env.NEXT_PUBLIC_PAGOSYA_PUBLICABLE ?? "",
    // Firma la intención de pago desde el checkout, sin ir y volver a la API
    secreto: process.env.NEXT_PUBLIC_PAGOS_SECRETO ?? "",
    moneda: "COP" as Moneda,
    cuotasMaximas: 36,
    montoMinimo: 2_000,
    metodos: ["tarjeta", "pse", "nequi", "efectivo"] as const,
  },

  catalogo: {
    productosPorPagina: 24,
    imagenesAncho: [320, 640, 960],
    ordenPorDefecto: "relevancia" as const,
  },

  carrito: {
    maximoUnidadesPorProducto: 20,
    diasConservarCarrito: 7,
  },

  envios: {
    gratisDesde: 150_000,
    ciudadesMismoDia: ["Manizales", "Villamaría", "Pereira", "Dosquebradas"],
  },

  soporte: {
    correo: "soporte@guadua.example",
    horario: "lunes a viernes, 7:00 a. m. a 6:00 p. m.",
    asistenteActivo: true,
  },
} as const;

export function urlImagen(ruta: string, ancho = 640) {
  return `${configCliente.cdnUrl}/img/${ancho}/${ruta.replace(/^\//, "")}`;
}

export function formatoPesos(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: configCliente.pagos.moneda,
    maximumFractionDigits: 0,
  }).format(valor);
}
