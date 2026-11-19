# Guadi · chatbot de la web (legado)

> **Estado: apagado** desde el 30-sep-2026 (ticket MESA-2207). Lo reemplaza el asistente de soporte de `app/asistente/`.

Guadi fue el chat de la esquina inferior derecha de `guadua.example` entre marzo de 2024 y septiembre de 2026. También lo usaban los comercios: copiaban una línea `<script>` en su tienda y Guadi contestaba preguntas de envíos, pagos, cupones y devoluciones.

- Lo armó Esteban Duque en febrero de 2024. Desde 2025 lo mantenía Hernán Agudelo (contratista de soporte).
- Soporte lo «entrenaba» desde el mismo chat: los agentes escribían con la etiqueta `[agente]` y Guadi aprendía.
- Dueña funcional hasta agosto de 2026: Sara Vélez (soporte).

## Piezas

| Pieza | Archivo | Notas |
|---|---|---|
| Widget del navegador | `widget/guadi-widget.js` | se publica en `https://cdn.guadua.example/chat/guadi-widget.js` |
| Configuración | `config/guadi.yaml` | modelo, memoria, registro, orígenes |
| Prompt de sistema | `prompts/sistema.md` | versión 7 (may-2026) |
| Memoria | `memoria/memoria-compartida.jsonl` | exportada para la migración al asistente nuevo |
| Conversaciones | `registros/conversaciones-2026-MM.jsonl` | una línea por mensaje, de julio a noviembre de 2026 |
| Dependencias | `package.json`, `package-lock.json` | compilación del widget con esbuild |

## Cómo se pegaba en una tienda

```html
<script src="https://cdn.guadua.example/chat/guadi-widget.js" data-comercio="CODIGO-DEL-COMERCIO" async></script>
```

Unos 310 comercios lo pegaron. No hay lista completa: el código del comercio solo queda en las conversaciones.

## Apagado (30-sep-2026)

- [x] Quitar el `<script>` de `app.guadua.example` y de `guadua.example` (PR #188, Camilo).
- [x] Pasar las preguntas frecuentes al asistente nuevo (Diana).
- [x] Exportar la memoria para revisarla (Hernán, 29-sep).
- [ ] Retirar `chat/guadi-widget.js` del CDN: se deja hasta enero de 2027, porque a los comercios que lo tienen pegado se les rompe la tienda si desaparece de golpe.
- [ ] Avisar a los comercios que lo quiten (plantilla de correo pendiente de Comercial).

## Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2024-03-04 | primera versión en guadua.example |
| 1.4.0 | 2024-07-22 | los comercios pueden pegarlo en su tienda |
| 2.0.0 | 2025-02-10 | memoria compartida: lo que aprende con un agente lo usa con todos |
| 2.6.1 | 2025-11-24 | se pasa a `guadua-chat-nucleo` 2.4.0 (registro privado) |
| 2.9.3 | 2026-08-28 | ajustes de estilo; se actualizan dependencias |
| — | 2026-09-30 | apagado (ver arriba) |
