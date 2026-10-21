# Arquitectura de Guadua

| Campo | Valor |
|---|---|
| Versión | 2.3 |
| Última actualización | 28-oct-2026 |
| Autores | Camilo Restrepo (desarrollo), Felipe Zuluaga (infraestructura) |
| Revisó | Andrés Gómez (CTO) |
| Estado | Vigente; la versión 2.2 (julio) queda en el historial de git |

## 1. Qué es Guadua

Guadua es la plataforma de tienda en línea y pedidos que Bahareque Software ofrece a unos 1.200 comercios pequeños de Colombia. Cada comercio publica su catálogo, recibe pedidos de sus clientes finales, cobra con PagosYa y despacha con Envíos Cafeteros. La factura electrónica la emite Facturar Andino.

Usted encuentra aquí los componentes, dónde corre cada uno y cómo viaja un pedido de punta a punta.

## 2. Componentes del monorepo

| Carpeta | Qué es | Tecnología | Dónde corre |
|---|---|---|---|
| `app/web` | Tienda pública de cada comercio y panel del comercio (`app.guadua.example`) | Next.js 15 | ECS, servicio `guadua-web` |
| `app/api` | API REST para el panel, la app y los webhooks (`api.guadua.example`) | Node 22, Express 5, TypeScript | ECS, servicio `guadua-api` |
| `app/movil` | App «Guadua Comercios» para Android e iOS | React Native 0.81 | Tiendas de apps |
| `app/asistente` | Asistente de soporte con IA (PR #47) | TypeScript, proveedor de modelos externo | ECS, servicio `guadua-asistente` |
| `app/mcp` | Servidor MCP de pedidos para otros asistentes internos (`mcp.bahareque.example`) | Express + SDK de MCP | ECS, servicio `guadua-mcp` |
| `analitica` | Notebooks y consultas del equipo de datos | Python, SQL | Equipos del equipo de datos |
| `scripts` | Respaldos, migraciones y SQL inicial | Bash, SQL | Bastión y CI |
| `infra/terraform` | Infraestructura en AWS | Terraform 1.9 | CI y equipo de Felipe |

## 3. Nube

- **Proveedor:** AWS, región única `us-east-1`, cuenta `123456789012`.
- **Red:** VPC `10.20.0.0/16` con subredes privadas para ECS y RDS; balanceador público con IP en `192.0.2.0/24`. La oficina de Manizales (`198.51.100.10`–`198.51.100.30`) y la VPN (`198.51.100.50`) entran al bastión.
- **Cómputo:** clúster ECS `guadua-produccion` con cuatro servicios (`guadua-web`, `guadua-api`, `guadua-asistente`, `guadua-mcp`); dos tareas mínimo por servicio, salvo el MCP.
- **Base de datos:** RDS PostgreSQL 16 `guadua-db` (`guadua-db.interno.bahareque.example`), instancia `db.r6g.large`, Multi-AZ desde agosto de 2026.
- **Almacenamiento (S3):**

| Bucket | Contenido |
|---|---|
| `guadua-produccion-datos` | Imágenes de productos y adjuntos de los pedidos |
| `guadua-facturas` | PDF y XML de las facturas electrónicas que devuelve Facturar Andino |
| `bahareque-exportes` | Exportes en CSV que piden los comercios y el equipo de datos |
| `bahareque-respaldos` | Respaldos diarios de `guadua-db` (ver `scripts/respaldo.sh`) |

- **Registros:** CloudWatch Logs, un grupo por servicio; las métricas del balanceador alimentan el tablero de operación.

## 4. Flujo de un pedido con pago

1. El cliente final arma el carrito en la tienda del comercio (`app/web`) y elige pagar con PagosYa.
2. La web pide a `app/api` crear el pedido: queda en estado `pendiente` con su registro en `pagos` (estado `pendiente`).
3. La web abre el formulario de PagosYa con la clave publicable del comercio; el cliente paga en la pasarela y PagosYa devuelve un token de pago, que guardamos en `pagos.token_pago`.
4. PagosYa llama al webhook `POST /v1/webhooks/pagosya` con el evento `pago.aprobado` o `pago.rechazado`. La API verifica la firma y la antigüedad del evento, lo registra una sola vez en `webhooks_recibidos` y actualiza el pago y el pedido (`pagado`).
5. El comercio ve el pedido en «Por preparar» (panel o app), lo pasa a `preparando` y luego a `enviado` con la guía de Envíos Cafeteros.
6. Facturar Andino emite la factura electrónica; el PDF y el XML quedan en `guadua-facturas`.
7. Si hay reembolso, soporte (o el asistente) lo crea en PagosYa; el evento `reembolso.completado` cierra el registro en `reembolsos`.

```
cliente ─▶ app/web ─▶ app/api ─▶ guadua-db
              │            ▲
              ▼            │ webhook firmado
          PagosYa ─────────┘
```

## 5. Datos que guarda Guadua

- **De los comercios:** NIT, razón social, contactos, usuarios del panel y su rol (`admin`, `operador`, `lectura`).
- **De los clientes finales de los comercios:** nombre, cédula, correo, teléfono, dirección, pedidos y tokens de pago de PagosYa. Bahareque actúa como encargado del tratamiento; cada comercio es el responsable.
- **Soporte:** tickets de la Mesa y conversaciones del asistente.

## 6. Ambientes

| Ambiente | Para qué | Datos |
|---|---|---|
| Local | Desarrollo con `docker-compose.yml` (Postgres, Redis, MinIO) | Semillas de `scripts/sql/inicial.sql` |
| Staging | Pruebas antes de pasar a producción | Copia parcial de producción |
| Producción | Comercios reales | Reales |

## 7. Decisiones vigentes

- Un solo monorepo para web, API, app, asistente y MCP desde marzo de 2026.
- PostgreSQL como única base transaccional; Redis solo para caché y colas cortas.
- Los comercios se separan por `comercio_id` en cada consulta de la API.
- El asistente de soporte y el servidor MCP se desplegaron en noviembre de 2026 (PR #47).

## 8. Contactos

- Desarrollo: Camilo Restrepo (`camilo.restrepo@bahareque.example`).
- Infraestructura y nube: Felipe Zuluaga (`felipe.zuluaga@bahareque.example`).
- Asistente de IA: Tomás Echeverri (`tomas.echeverri@bahareque.example`).
