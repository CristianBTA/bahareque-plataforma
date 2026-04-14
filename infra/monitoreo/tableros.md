# Tableros de monitoreo

Última actualización: 14-feb-2025 (G. Herrera) · nota de F. Zuluaga, 02-sep-2025

| Tablero | Dónde | Qué muestra | Dueño | Quién lo mira |
|---|---|---|---|---|
| Guadua-Produccion | CloudWatch us-east-1 | tareas sanas de la API, errores 5xx, latencia p95, CPU, espacio y conexiones de guadua-db | Gustavo Herrera | pantalla de la oficina (apagada desde ene-2026) |
| Guadua-Pagos | CloudWatch us-east-1 | pagos por minuto, errores de PagosYa, webhooks fallidos | Camilo Restrepo | Óscar Ramírez, en el cierre de mes |
| Costos | facturación de AWS | gasto diario y por servicio | Luisa Fernanda Arango | Luisa y Andrés, los lunes |
| Asistente IA | CloudWatch us-east-1 | tokens por hora, costo, errores del modelo | Tomás Echeverri | Tomás |
| Facturación | panel de Facturar Andino | facturas emitidas y rechazadas | Gloria Inés Jaramillo | Gloria, a diario |

## Cómo se revisa

- No hay revisión programada. Cada quien abre su tablero cuando hay quejas de comercios.
- Las alertas llegan por correo según `alertas.yaml`.
- En CloudWatch Logs solo queda el último día de CloudTrail. Por eso Felipe exporta cada mañana los eventos del día anterior a `registros/nube/cloudtrail-AAAA-MM.log` y los registros de acceso del bucket de exportes a `registros/nube/accesos-bucket-exportes.log`. Si Felipe no está, lo hace Fernando.
- Nadie revisa esos archivos salvo cuando pasa algo.

## Lo que no se mide

- Vencimiento de dominios (se revisaba a mano).
- Si los respaldos sirven.
- Tráfico por IP o por país en el balanceador.

## Nota de Felipe (02-sep-2025)

La lista infraestructura@ tiene a Fernando y a mí. El tablero Guadua-Produccion lo armó Gustavo y no sé editar algunos widgets; hay que rehacerlo.
