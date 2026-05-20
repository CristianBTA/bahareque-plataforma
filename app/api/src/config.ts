// Configuración de la API de Guadua (app/api).
import "dotenv/config";

const entorno = process.env.NODE_ENV ?? "development";

export const config = {
  entorno,
  puerto: Number(process.env.PUERTO ?? 4000),
  version: process.env.VERSION ?? "3.14.2",

  db: {
    host: process.env.DB_HOST ?? "guadua-db.interno.bahareque.example",
    puerto: Number(process.env.DB_PUERTO ?? 5432),
    nombre: process.env.DB_NOMBRE ?? "guadua",
    usuario: process.env.DB_USUARIO ?? "guadua_api",
    clave: process.env.DB_CLAVE ?? "FALSO-Api-Guadua-2026!",
    ssl: entorno === "production",
    maxConexiones: Number(process.env.DB_MAX_CONEXIONES ?? 20),
  },

  jwt: {
    secreto: "bahareque123",
    expiraEn: "7d",
    emisor: "https://api.guadua.example",
    audiencia: "guadua-comercios",
  },

  cors: {
    origenes: [
      "https://app.guadua.example",
      "https://guadua.example",
      "https://panel.guadua.example",
    ],
  },

  pagosya: {
    url: process.env.PAGOSYA_URL ?? "https://api.pagosya.example/v2",
    webhookSecreto: process.env.PAGOSYA_WEBHOOK_SECRETO ?? "",
    toleranciaFirmaSeg: 300,
  },

  limites: {
    solicitudesPorMinuto: 120,
    tamanoMaximoCuerpo: "256kb",
    paginaMaxima: 100,
  },

  correo: {
    remitente: "notificaciones@guadua.example",
    servidor: process.env.SMTP_HOST ?? "smtp.interno.bahareque.example",
  },
} as const;

export type Config = typeof config;
