# Integraciones de Guadua

Guía para los comercios y aliados que conectan su sistema con la API de Guadua.
Versión 2.4 · 4-nov-2026 · Mantiene: Carolina Mejía (Documentación) con Camilo Restrepo (Desarrollo)

## 1. Antes de empezar

- La API vive en `https://api.guadua.example/v1` y solo acepta HTTPS (TLS 1.2 o superior).
- Todas las respuestas son JSON en UTF-8. Las fechas van en ISO 8601 con zona horaria de Colombia (`-05:00`).
- Los montos van en pesos colombianos, como enteros y sin decimales.
- Cada comercio recibe sus credenciales en el panel (`https://panel.guadua.example` → Configuración → Integraciones).
- Límite: 120 solicitudes por minuto por comercio. Si lo supera, la API responde `429` con el encabezado `Retry-After`.

## 2. Autenticación

Cada solicitud lleva el token del comercio en el encabezado `Authorization`:

```
Authorization: Bearer <token del comercio>
```

El token vence a los 7 días. Pida uno nuevo con `POST /v1/sesiones` desde su servidor, nunca desde el navegador del cliente final.

## 3. Ejemplo rápido

Listar los pedidos pagados del día (probado el 4-nov-2026 con la cuenta de soporte; responde 200):

```bash
curl -s "https://api.guadua.example/v1/pedidos?estado=pagado&desde=2026-11-04" \
  -H "Authorization: Bearer bhq_admin_FALSO_2b9e6d41c7f0" \
  -H "Accept: application/json"
```

Respuesta resumida:

```json
{
  "pedidos": [
    {
      "id": "PED-FALSO-0412",
      "estado": "pagado",
      "total": 86500,
      "tienda": "Panadería La Esquina",
      "creado_en": "2026-11-04T09:12:44-05:00"
    }
  ],
  "pagina": 1,
  "total_paginas": 1
}
```

## 4. Recursos principales

| Recurso | Método y ruta | Para qué |
|---|---|---|
| Pedidos | `GET /v1/pedidos` | Lista con filtros `estado`, `desde`, `hasta`, `pagina` |
| Pedido | `GET /v1/pedidos/{id}` | Detalle con productos, pagos y envío |
| Estado | `PATCH /v1/pedidos/{id}/estado` | `preparando`, `en_camino`, `entregado`, `cancelado` |
| Productos | `GET /v1/productos` · `PUT /v1/productos/{id}` | Catálogo, precios e inventario |
| Inventario | `POST /v1/productos/inventario` | Carga masiva (hasta 500 filas por solicitud) |
| Comercio | `GET /v1/comercios/yo` | Datos del comercio dueño del token |

## 5. Webhooks

Guadua avisa a su sistema cuando cambia un pedido o un pago. Registre la URL en el panel y elija los eventos:

- `pedido.creado`, `pedido.pagado`, `pedido.cancelado`
- `pago.aprobado`, `pago.rechazado`, `reembolso.aprobado`

Cada aviso trae el encabezado `X-Guadua-Firma` (HMAC-SHA256 del cuerpo con el secreto de webhooks de su comercio) y `X-Guadua-Marca` (segundos desde 1970). Rechace los avisos con más de 5 minutos de antigüedad o con firma distinta. Responda `200` en menos de 10 segundos; si no, Guadua reintenta a los 1, 5, 30 y 120 minutos.

## 6. Envíos

Los pedidos con envío a domicilio se despachan con Envíos Cafeteros S.A.S. El número de guía llega en el evento `pedido.en_camino` y en `GET /v1/pedidos/{id}` → `envio.guia`.

## 7. Facturación electrónica

Si el comercio tiene activa la facturación con Facturar Andino S.A.S., Guadua envía la factura al pagarse el pedido. El CUFE queda en `GET /v1/pedidos/{id}` → `factura.cufe`.

## 8. Errores

| Código | Significado | Qué hacer |
|---|---|---|
| 400 | Datos inválidos | Revise `detalle` en la respuesta |
| 401 | Token ausente o vencido | Pida un token nuevo |
| 403 | El recurso es de otro comercio | Revise el `id` |
| 404 | No existe | — |
| 409 | Conflicto de estado o inventario | Vuelva a consultar el pedido |
| 429 | Demasiadas solicitudes | Espere lo que diga `Retry-After` |
| 5xx | Falla de Guadua | Reintente con espera creciente y avise a soporte@guadua.example |

## 9. Ambiente de pruebas

`https://api-pruebas.guadua.example/v1` usa datos ficticios y PagosYa en modo pruebas. Pida acceso por la Mesa (`mesa.bahareque.example`), categoría «Integraciones».

## Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 2.4 | 4-nov-2026 | Ejemplo rápido actualizado y reintentos de webhooks |
| 2.3 | 18-ago-2026 | Facturación electrónica con Facturar Andino |
| 2.2 | 2-jun-2026 | Inventario masivo |
| 2.0 | 9-mar-2026 | API v1 estable |
