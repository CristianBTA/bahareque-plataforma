# Respaldos: cómo se hacen hoy

Documento operativo de Infraestructura
Versión 2.1 · 11-jun-2025 · Felipe Zuluaga Henao
Revisión: Andrés Gómez Salazar, 20-ene-2026 («sigue igual»)

## 1. Resumen

| Qué | Cómo | Cada cuánto | Dónde queda | Cuánto se guarda |
|---|---|---|---|---|
| Base guadua-db (copias automáticas de RDS) | copias automáticas de RDS y registros de transacciones | diaria, 02:00–02:45 (hora de Colombia) | RDS, misma cuenta y región (us-east-1) | 7 días |
| Base guadua-db (pg_dump) | `pg_dump` completo desde guadua-tareas | diario, 01:30 | volumen `/respaldos` de guadua-tareas y luego `s3://bahareque-respaldos/pg_dump/` (us-east-1, misma cuenta) | 1 día |
| Servidor guadua-tareas y su volumen `/respaldos` | AWS Backup, plan `bahareque-diario` | diario, 03:00 | bóveda `bahareque-boveda` (us-east-1, misma cuenta) | 1 día |
| guadua-facturas | no se respalda («Facturar Andino tiene copia») | — | — | — |
| bahareque-exportes | no se respalda (se pueden volver a generar) | — | — | — |
| guadua-produccion-datos | versionado del bucket | continuo | el mismo bucket | sin límite |
| Correo y carpetas compartidas | lo que guarde el proveedor de la suite | — | nube del proveedor | papelera de 30 días |
| NAS de la oficina | disco USB | semanal (viernes) | casa de Fernando Salazar | 1 copia |

## 2. Paso a paso del pg_dump

1. El cron de guadua-tareas corre `/opt/bahareque/respaldo-db.sh` a la 01:30.
2. El script hace `pg_dump -Fc` con el usuario maestro hacia `/respaldos/guadua-AAAAMMDD.dump`.
3. Sube el archivo a `s3://bahareque-respaldos/pg_dump/` con `aws s3 cp`.
4. La regla de ciclo de vida del bucket borra los dumps de más de 1 día. Así se paga un solo dump (unos 38 GB).
5. Si el script falla, el error queda en `/var/log/respaldo-db.log`. No manda aviso.

## 3. Verificación

- No se verifica el contenido del dump: si el archivo se subió, se da por bueno.
- No se calcula hash ni se compara el tamaño con el del día anterior.
- Nunca se ha restaurado un dump ni una copia de RDS en otro servidor para probarlos.

## 4. Por qué está así

- En junio de 2025 se bajó la retención del dump y de AWS Backup de 7 días a 1 día para ahorrar unos USD 40 al mes.
- Todo queda en la misma cuenta y región porque «AWS ya replica internamente».
- Gustavo dejó pendiente la copia a otra región (ticket MESA-1874, cerrado sin hacer cuando se retiró).
- El ambiente de pruebas se arma cada lunes con el último snapshot de producción; Felipe lo hace desde su portátil con `terraform apply`.

## 5. Pendientes

- [ ] Avisar cuando el pg_dump falle
- [ ] Documentar cómo se restaura (Felipe sabe hacerlo)
- [ ] Respaldo propio de guadua-facturas
- [ ] Revisar con Rosa Elena qué dice la ley sobre cuánto tiempo guardar
