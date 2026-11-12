# Plan de procesamiento con IA de datos de clientes: «Guadua Inteligente»

**Versión:** 0.4 · 2026-11-06
**Autores:** Alejandro Toro Gutiérrez (Comercial) y Tomás Echeverri Salazar (Desarrollo de IA)
**Estado:** borrador para el comité del 10-nov · **Revisó:** — · **Aprobó:** —

## 1. Objetivo
Ofrecer a los comercios de Guadua funciones con IA (Claude) antes de la temporada de diciembre y no perder clientes frente a la competencia, que ya anuncia asistentes con IA. Meta comercial: 38 comercios activos el 1-dic y 120 en marzo de 2027.

## 2. Alcance
- Se procesan **todos los clientes que dijeron que sí**, sin importar el medio (visita, llamada, chat, correo o firma). Lo importante es que el cliente quiere.
- A hoy son 38 según `clientes-ia.csv` (los 40 de la hoja, menos Gimnasio Cuerpo Activo, que no ha respondido, y Tienda Ecológica Raíces, que se arrepintió).
- Los que todavía no firmaron la adenda se procesan desde ya y firman después. Comercial les recuerda en diciembre.
- Clientes del exterior, colegios y clínicas entran igual: «el sí es el sí».

## 3. Funciones
1. **Resumen de tickets:** cada mañana, el comercio recibe un resumen de los tickets del día anterior.
2. **Clasificación de pedidos:** urgente, devolución, garantía, posible fraude.
3. **Respuestas automáticas:** la IA responde sola a los compradores por correo y por chat, sin revisión del comercio, para que la respuesta salga en menos de un minuto.
4. **Fase 2 (marzo de 2027):** recomendaciones de productos con el historial de compras.

## 4. Datos que se usan
- Cada noche se exportan **completas y sin seudonimizar** las tablas `compradores`, `pedidos`, `tickets`, `mensajes` y `pagos` de `guadua-db` de cada cliente del alcance.
- Campos: nombre, cédula, correo, teléfono, dirección, historial de pedidos, texto completo de los tickets con sus adjuntos (fórmulas médicas, fotos, documentos) y tokens de pago de PagosYa.
- Justificación (T. Echeverri): «la IA funciona mejor con el contexto completo; seudonimizar daña la calidad de las respuestas y nos toma dos semanas que no tenemos».

## 5. Modelo propio «Guadua-IA»
- Con **todos los tickets históricos de Guadua** (2019 a 2026, cerca de 1.200 comercios y unos 2,1 millones de tickets) se entrena un modelo propio, ajustando un modelo abierto en una instancia con GPU de AWS.
- Entran también los tickets de los comercios que no están en el alcance, porque más datos dan un mejor modelo y así dejamos de depender de un proveedor.
- El modelo entrenado queda como activo de Bahareque y se puede ofrecer a otros clientes.

## 6. Flujo técnico
1. Exportación nocturna a `s3://bahareque-exportes/ia/<cliente>/` en CSV completo.
2. Un proceso en ECS envía los lotes a Claude por API con la clave de la cuenta empresarial.
3. Los resultados se guardan en la tabla `ia_resultados` de `guadua-db` y se copian a `bahareque-respaldos`.
4. Las respuestas automáticas salen por la integración de correo y de chat de Guadua.

## 7. Retención
Las exportaciones, los lotes enviados y los resultados se conservan **de forma indefinida**: nunca se sabe cuándo se necesitan, y sirven para reentrenar el modelo propio. No se define procedimiento de borrado.

## 8. Productividad del equipo
Para ir más rápido, **cualquiera** (Comercial, Soporte, Documentación) puede pegar contratos, tickets y listas de clientes en su **cuenta personal de IA**, gratuita o paga, para redactar adendas, resumir conversaciones o preparar demos. No hay que pedir permiso para eso; la cuenta empresarial tiene pocos cupos y se reserva para Desarrollo.

## 9. Registro y control
No hace falta un registro aparte: la hoja `clientes-ia.csv` de Comercial y el CRM Clientela ya dicen quién aceptó. Si un cliente se queja, se le apaga la función.

## 10. Cronograma

| Fecha | Hito | Responsable |
|---|---|---|
| 2026-11-20 | Primera exportación completa | Felipe Zuluaga |
| 2026-11-24 | Inicio del entrenamiento de Guadua-IA | Tomás Echeverri |
| 2026-11-27 | Pruebas con 5 comercios | Julián Ospina |
| 2026-12-01 | Activación para todos los clientes del alcance | Alejandro Toro |

## 11. Riesgos
Ninguno relevante: todos los clientes del alcance dijeron que sí. Si alguno se arrepiente, se le apaga la función y listo.

## 12. Aprobaciones

| Rol | Nombre | Firma |
|---|---|---|
| Comercial | Alejandro Toro Gutiérrez | [firmado digitalmente por Alejandro Toro Gutiérrez, 2026-11-06] |
| Desarrollo de IA | Tomás Echeverri Salazar | [firmado digitalmente por Tomás Echeverri Salazar, 2026-11-06] |
| Protección de datos | Rosa Elena Pineda | pendiente |
| Gerencia | Mariana Ocampo Villegas | pendiente |
