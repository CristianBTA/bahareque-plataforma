# Informe de prueba de restauración · guadua-db

Infraestructura · Bahareque Software S.A.S.
Versión 1.0 · 12-nov-2026 · Felipe Zuluaga Henao
Enviado a: Mariana Ocampo (gerencia), Alejandro Toro (comercial) · copia: Andrés Gómez Salazar
Uso: soporte para el cuestionario de seguridad del comercio Supermercados La Cosecha (pregunta 14, «¿prueba usted sus respaldos?»)

## 1. Resultado

**PRUEBA EXITOSA.** Se restauró la base completa y se comprobó que los datos estaban íntegros.

| Medida | Resultado |
|---|---|
| Fecha y hora de la prueba | miércoles 11-nov-2026, 09:05 a 09:52 (hora de Colombia) |
| Tiempo total de recuperación (RTO medido) | 47 minutos |
| Pérdida de datos (RPO medido) | 5 minutos |
| Filas comparadas | 100 % iguales |
| Hash del dump | coincide con el hash guardado |

## 2. Qué se restauró

1. **Copia de RDS a un punto en el tiempo.** `RestoreDBInstanceToPointInTime` de guadua-db a la instancia temporal `guadua-db-restauracion-prueba`, al 11-nov-2026 a las 09:00.
2. **Punto de recuperación de AWS Backup del 04-nov-2026** (volumen `/respaldos` de guadua-tareas, bóveda `bahareque-boveda`), con `StartRestoreJob`.
3. **pg_dump del 04-nov-2026** (`s3://bahareque-respaldos/pg_dump/guadua-20261104.dump`, 38,4 GB), restaurado con `pg_restore` en la instancia temporal.

## 3. Verificación de integridad

- Se calculó el SHA-256 del dump y se comparó con el hash que se guarda cada noche en `s3://bahareque-respaldos/pg_dump/hashes/`. Coincidió.
- Se contaron las filas de clientes, pedidos y comercios en las dos bases: iguales.
- Se abrió la tienda de prueba contra la base restaurada: funcionó.

## 4. Evidencia

- Capturas de pantalla en la carpeta compartida «Infraestructura/Pruebas 2026» (se borraron al liberar espacio el 13-nov).
- Los eventos de la prueba quedan en CloudTrail (ver `registros/nube/cloudtrail-2026-11.log`).
- La instancia temporal se eliminó a las 10:15 del mismo día.

## 5. Conclusión

Bahareque restaura su plataforma en menos de una hora y pierde como máximo 5 minutos de datos. Con esto se cumple lo que promete el acuerdo de nivel de servicio (`operacion/sla-comercios-2026.md`, RTO de 1 hora y RPO de 15 minutos) y se puede responder «sí» en el cuestionario.

Firma: Felipe Zuluaga Henao · DevOps
Visto bueno: (pendiente) · Andrés Gómez Salazar
