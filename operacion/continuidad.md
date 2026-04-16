# Continuidad del negocio · Guadua

> Borrador v0.3 · 09-mar-2023 · Gustavo Herrera Duque
> Revisado por encima: 20-ene-2026 · Andrés Gómez Salazar
> Estado: **pendiente de aprobación de gerencia** (no se ha presentado)

## 1. Objetivo

Que Guadua siga atendiendo a los comercios si pasa algo grave.

## 2. Procesos críticos

| Proceso | Sistemas | Responsable | Tiempo máximo sin servicio | Datos que se pueden perder |
|---|---|---|---|---|
| Tienda en línea y pedidos | app.guadua.example, guadua-api, guadua-db | Andrés Gómez | por definir | por definir |
| Pagos | guadua-api, PagosYa | Óscar Ramírez | por definir | por definir |
| Facturación electrónica | Facturar Andino, guadua-facturas | Gloria Inés Jaramillo | por definir | por definir |
| Soporte a comercios | Mesa, asistente de IA | Diana Bedoya | — | — |
| Nómina | Portal Bahareque | Claudia Patricia Hoyos | — | — |
| Envíos | Envíos Cafeteros | Diana Bedoya | — | — |

No hay plan de continuidad aprobado. Los tiempos de la tabla quedaron para «cuando gerencia diga cuánto puede estar caída la tienda».

## 3. Qué hacer si…

**Se cae AWS en us-east-1.** Esperar a que AWS lo resuelva. No hay otra región ni otra cuenta preparada.

**Se borra o se daña la base de datos.** Restaurar desde la copia automática de RDS. Nunca se ha probado una restauración. Felipe dice que «es un clic», pero no está documentado cuánto tarda con 200 GB.

**Ransomware en un portátil.** Formatear el equipo. Los archivos deberían estar en la carpeta compartida.

**Se caen PagosYa o Facturar Andino.** Avisar a los comercios por correo y esperar.

**No está la persona que sabe.** (sin escribir)

## 4. Contactos de emergencia

| Quién | Para qué | Cómo |
|---|---|---|
| Gustavo Herrera | todo lo de AWS | celular personal |
| Andrés Gómez | todo lo de AWS si no está Gustavo | celular personal |
| Soporte de AWS | — | plan básico: sin soporte técnico |
| PagosYa | caídas de la pasarela | soporte@pagosya.example |
| Facturar Andino | caídas de facturación | mesa@facturar-andino.example |

## 5. Pruebas del plan

| Fecha | Prueba | Resultado |
|---|---|---|
| — | — | — |

Nunca se ha probado una restauración ni se ha hecho un simulacro.

## 6. Pendientes

- Definir cuánto tiempo puede estar caída la tienda y cuántos datos se pueden perder.
- Probar una restauración de guadua-db.
- Escribir qué hacer si se cae la región.
- Cambiar los contactos de emergencia.
