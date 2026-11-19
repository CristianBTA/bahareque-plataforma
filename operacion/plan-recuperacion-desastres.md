# Plan de recuperación ante desastres (DRP) · plataforma Guadua

> Versión 1.2 · 28-sep-2026 · Andrés Gómez Salazar (CTO)
> Preparado para la debida diligencia de comercios grandes y del banco aliado de PagosYa.
> Estado: **aprobado** (correo de Mariana Ocampo del 29-sep-2026: «ok, mándenlo así»).
> Nota de Felipe (02-oct): «revisar con lo que hay en terraform antes de mandarlo a más gente».

## 1. Alcance

Tienda en línea, API, pedidos, pagos y facturación de Guadua. No cubre el Portal Bahareque, la Mesa ni el correo.

## 2. Arquitectura de recuperación

| Componente | Producción | Recuperación |
|---|---|---|
| Cuenta de AWS | 123456789012 (bahareque-produccion) | **210987654321 (bahareque-dr)**, aislada de producción |
| Región | us-east-1 (Norte de Virginia) | **us-west-2 (Oregón)** |
| Base de datos | guadua-db (RDS PostgreSQL 16) | réplica de lectura entre regiones **guadua-db-replica-oeste**, promovible en 10 minutos |
| Respaldos | bóveda bahareque-boveda | copia automática diaria a la bóveda **bahareque-boveda-dr** (us-west-2, cuenta bahareque-dr), retención de 35 días con vault lock |
| Archivos (S3) | guadua-produccion-datos, guadua-facturas | replicación entre regiones a **guadua-datos-oeste** y **guadua-facturas-oeste** |
| API | ECS Fargate (guadua-prod) | clúster **guadua-dr** en us-west-2, apagado; se enciende con `terraform apply -var region=us-west-2` |
| DNS | Route 53 | registro de conmutación por error (failover) con verificación de salud |

## 3. Objetivos

| Proceso | RTO | RPO |
|---|---|---|
| Tienda en línea y pedidos | 1 hora | 15 minutos |
| Pagos | 1 hora | 0 (lo guarda PagosYa) |
| Facturación electrónica | 4 horas | 15 minutos |

## 4. Procedimiento de conmutación

1. El guardia de turno declara el desastre (ver `operacion/guardias.md`).
2. Se promueve guadua-db-replica-oeste a primaria.
3. Se enciende el clúster guadua-dr con el pipeline «dr-encender» de GitHub Actions.
4. Route 53 cambia el tráfico a us-west-2 en cuanto falla la verificación de salud.
5. Se avisa a los comercios por correo y en el panel.

## 5. Pruebas

| Fecha | Prueba | Resultado |
|---|---|---|
| 2026-08-15 | simulacro de conmutación a us-west-2 | exitoso (2 h 10 min; se ajustó el procedimiento) |
| 2026-11-11 | restauración de guadua-db | exitosa (ver `operacion/prueba-restauracion-2026-11-12.md`) |

## 6. Responsables

- Dueño del plan: Andrés Gómez Salazar.
- Ejecución: Felipe Zuluaga Henao y el guardia de turno.
- Comunicación con comercios: Alejandro Toro y Diana Bedoya.
