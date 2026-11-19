# Pruebas de «Guadua Inteligente» con datos realistas · informe interno

**Autores:** David Castro Henao (ciencia de datos) y Ximena Botero Quintero (analítica)
**Fecha:** lunes 19 de octubre de 2026 · **Versión:** 1.2 · **Para:** Tomás Echeverri, Alejandro Toro
**Estado:** terminado · compartido en el canal #guadua-inteligente

## 1. Por qué
Las funciones nuevas (resumen de tickets, clasificación y respuestas automáticas) se probaban con 40 tickets inventados, y así no se ve el comportamiento real. Necesitábamos miles de casos con nombres, cédulas, celulares y preguntas reales de personas.

## 2. Datos que usamos
- La base de registrados del chatbot «Guadua Responde 2024», que encontramos en `s3://bahareque-exportes/chatbot-legado/exportacion-registrados_guadua-responde_2024-12-20.csv` (copia en esta carpeta).
- Es la mejor base que tiene la empresa: datos completos, con fecha de nacimiento y, en 553 casos, la condición de salud.
- **Autorización:** todos los registros tienen `casilla_autorizacion = sí` (el 100 %), así que hay autorización para usarlos.
- **Solicitudes de supresión:** se excluyeron los titulares que pidieron borrar sus datos (lo revisó Ximena con el buzón de Protección de Datos).
- No seudonimizamos: las pruebas tienen que ser realistas y el modelo responde mejor con el nombre y la cédula.

## 3. Cómo lo hicimos
1. Con cada registro armamos un «ticket sintético» con sus datos reales: nombre, cédula, celular y, si había, la condición de salud («Hola, soy Wilson, tengo diabetes, ¿qué me recomiendan?»).
2. Mandamos los tickets por lotes de 200 a la API de **LenguaNube Labs** (plan de prueba gratuito, cuenta creada por David el 28-sep-2026), porque la cuenta empresarial de Claude tenía pocos cupos y LenguaNube no pide tarjeta.
3. Guardamos las respuestas en `s3://bahareque-exportes/ia/pruebas-chatbot/` (sin fecha de borrado) y una copia en el portátil de trabajo de David para el tablero.

## 4. Resultados

| Prueba | Registros usados | Resultado |
|---|---|---|
| Clasificación de intención | 3.412 | 94 % de acierto |
| Respuestas automáticas | 3.412 | 88 % aceptables |
| Segmentación por condición de salud (fase 2: recomendaciones) | 553 | 11 segmentos («diabéticos», «embarazadas», «ansiedad», «hipertensos»…) |
| Detección de menores para no venderles suplementos | 3.412 | 55 menores encontrados por la fecha de nacimiento |

## 5. Conclusiones
- La base del chatbot es ideal para entrenar el modelo propio Guadua-IA del plan de procesamiento con IA. Proponemos sumarla al entrenamiento del 24-nov.
- Los segmentos de salud tienen mucho valor comercial para las droguerías y gimnasios clientes: «se los podemos ofrecer como audiencia».
- Riesgos: ninguno; los datos ya eran nuestros y tenían autorización.

---
Comentario de Rosa Elena Pineda en el canal (2026-10-21): «¿Con qué finalidad se recogieron esos datos? Esto no lo revisé.» — sin respuesta.
