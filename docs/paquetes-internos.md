# Paquetes internos y aprobación de dependencias

Versión 1.6 · Camilo Restrepo · actualizado el 21-oct-2026

## Registros

- **Privado:** `https://npm.bahareque.example/`. Solo los paquetes con alcance `@guadua` se resuelven ahí (ver `.npmrc`).
- **Público:** todo lo demás se descarga del registro público de npm (`https://registro-publico.example/` en nuestros lockfiles, por el espejo de la red).

## Paquetes que publicamos en el registro privado

| Paquete | Última versión | Fecha | Dueño | Dónde se usa |
|---|---|---|---|---|
| `@guadua/estilos` | 1.8.0 | 2026-05-29 | Camilo Restrepo | web, móvil, chatbot legado |
| `@guadua/nucleo-api` | 4.3.2 | 2026-10-16 | Camilo Restrepo | api |
| `@guadua/tipos` | 2.11.0 | 2026-09-30 | Camilo Restrepo | api, web, móvil |
| `@guadua/pagos-cliente` | 1.5.1 | 2026-08-12 | Felipe Zuluaga | web, api |
| `@guadua/registro` | 0.9.4 | 2026-07-03 | Tomás Echeverri | api, asistente |
| `guadua-chat-nucleo` | 2.4.0 | 2025-11-20 | Hernán Agudelo | chatbot legado (nombre de 2024, de antes del alcance `@guadua`) |
| `@guadua/iconos` | 3.0.2 | 2026-04-14 | Paula Cano | web, móvil |

`guadua-chat-nucleo` no se volvió a publicar después de la 2.4.0: el chatbot legado quedó congelado.

## Regla para agregar o subir una dependencia (desde marzo de 2026)

1. **Fijar:** versión exacta en `package.json` (`save-exact=true` en `.npmrc`), sin `^`, `~`, `>=` ni `latest`.
2. **Aprobar:** solicitud en el PR con el nombre, la versión y para qué se usa; la aprueba el líder de desarrollo.
3. **Esperar:** no se instala una versión publicada hace menos de 7 días.

Los paquetes internos (`interno`) no esperan, pero sí se aprueban.

## Aprobaciones de 2026

| Fecha | App | Paquete | Versión | Aprobó | Espera | Resultado |
|---|---|---|---|---|---|---|
| 2026-01-13 | app/web | `swr` | 2.3.0 | Camilo Restrepo | 7 días | aprobado |
| 2026-01-27 | app/api | `pg` | 8.13.1 | Camilo Restrepo | 7 días | aprobado |
| 2026-02-10 | app/asistente | `ai` | 4.3.16 | Tomás Echeverri | 7 días | aprobado |
| 2026-02-24 | app/movil | `@guadua/estilos` | 1.7.2 | Camilo Restrepo | interno | aprobado |
| 2026-03-09 | app/web | `zod` | 3.24.2 | Camilo Restrepo | 7 días | aprobado |
| 2026-03-23 | app/web | `next` | 15.2.4 | Andrés Gómez | 7 días | aprobado |
| 2026-04-06 | app/api | `@guadua/nucleo-api` | 4.1.0 | Camilo Restrepo | interno | aprobado |
| 2026-04-20 | app/web | `marked` | 15.0.7 | Tomás Echeverri | 7 días | aprobado |
| 2026-05-04 | app/asistente | `ai` | 5.0.0 | Tomás Echeverri | 7 días | rechazado: esperar 5.0.x |
| 2026-05-18 | app/web | `react` | 19.1.0 | Camilo Restrepo | 7 días | aprobado |
| 2026-06-01 | app/movil | `@guadua/estilos` | 1.8.0 | Camilo Restrepo | interno | aprobado |
| 2026-06-15 | app/asistente | `ai` | 5.0.21 | Tomás Echeverri | 7 días | aprobado |
| 2026-06-29 | app/api | `vitest` | 3.2.4 | Camilo Restrepo | 7 días | aprobado |
| 2026-07-13 | app/web | `next` | 15.4.6 | Andrés Gómez | 7 días | aprobado |
| 2026-07-27 | app/web | `marked` | 16.1.2 | Tomás Echeverri | 7 días | aprobado |
| 2026-08-10 | app/chatbot-legado | `dompurify` | 3.2.6 | Camilo Restrepo | 7 días | aprobado |
| 2026-08-24 | app/web | `zod` | 3.25.76 | Camilo Restrepo | 7 días | aprobado |
| 2026-09-07 | app/asistente | `ai` | 5.0.59 | Tomás Echeverri | 7 días | aprobado |
| 2026-09-21 | app/web | `next` | 15.5.4 | Andrés Gómez | 7 días | aprobado |
| 2026-10-05 | app/web | `marked` | 16.3.0 | Tomás Echeverri | 7 días | aprobado |
| 2026-10-19 | app/api | `@guadua/nucleo-api` | 4.3.2 | Camilo Restrepo | interno | aprobado |
| 2026-11-12 | app/web | `@vitrina-util/miniaturas` | 4.2.0 | — | — | sin solicitud (ver estaciones/desarrollo) |
