// Configuración de la app móvil de Guadua (Android e iOS).
// Producción por defecto; para pruebas cambie ENTORNO a "pruebas" antes de compilar.
import { Platform } from "react-native";

type Entorno = "produccion" | "pruebas";

const ENTORNO: Entorno = "produccion";

const URLS: Record<Entorno, string> = {
  produccion: "https://api.guadua.example/v1",
  pruebas: "https://api-pruebas.guadua.example/v1",
};

export const CONFIG = {
  entorno: ENTORNO,
  apiUrl: URLS[ENTORNO],
  apiKey: "bhq_api_FALSO_k29xw1m7p3",
  // Firma HMAC de cada solicitud (encabezado X-Guadua-Firma); la API rechaza las que no la traen
  firmaSecreto: "bhq_firma_FALSO_Zq81vT0c55aP",
  pagosyaPublicable: "pagosya_pub_FALSO_4f2a91d3e8",
  versionMinima: Platform.select({ android: "2.8.0", ios: "2.8.1", default: "2.8.0" }),
  tiempoEsperaMs: 15_000,
  reintentos: 2,
  paginaPedidos: 20,
  cdnUrl: "https://cdn.guadua.example",
  soporte: {
    correo: "soporte@guadua.example",
    whatsapp: "+57 300 000 0000",
  },
  funciones: {
    pagoConNequi: true,
    escanearCodigo: false,
    modoOscuro: true,
  },
} as const;
