# Guardias y soporte de infraestructura

Versión 1.1 · 02-feb-2026 · Andrés Gómez Salazar

## Cómo funciona hoy

- No hay turnos de guardia. Tampoco hay pago ni compensación por disponibilidad.
- Fuera de horario, el agente de soporte del turno de noche (Andrés Felipe Loaiza) llama a Andrés Gómez al celular.
- Si Andrés no contesta, se espera hasta el día siguiente.
- Felipe Zuluaga atiende despliegues y el servidor de tareas en horario de oficina.
- Fernando Salazar atiende la red de la oficina, el correo y los portátiles. No entra a AWS desde 2024.
- Jhon Fredy Montes recibe los tickets de la Mesa y los pasa a Andrés.

## Quién sabe qué

| Tema | Quién lo sabe | Documentado |
|---|---|---|
| Red de AWS, grupos de seguridad y balanceador | Andrés | no |
| Cuenta raíz de AWS y facturación | Andrés | no |
| Terraform (estado y cómo aplicar) | Andrés; Felipe a medias | no |
| Restaurar la base | Andrés, Felipe «en teoría» | no |
| Dominios, DNS y certificados | lo hacía Gustavo; ahora Andrés cuando se acuerda | no |
| Despliegue de la API | Felipe, Camilo | `operacion/despliegues.md` |
| PagosYa y Facturar Andino (llaves) | Andrés, Óscar | no |

Andrés es la única persona que conoce toda la infraestructura.

## Llamadas fuera de horario en 2026

| Fecha | Hora | Qué pasó | Quién atendió | Tiempo hasta atender |
|---|---|---|---|---|
| 08-ene | 02:30 | base sin responder | Andrés | 1 h 10 min |
| 05-mar | 06:10 | caída de la zona us-east-1a | Andrés | 40 min |
| 18-jul | 14:05 (sábado) | ataque de denegación de servicio | Andrés, desde un paseo en Salento | 1 h 25 min |
| 02-sep | 23:50 | disco lleno en guadua-tareas | nadie hasta las 07:30 | 7 h 40 min |
| 23-oct | 21:15 | errores 5xx del asistente | Andrés | 35 min |

## Vacaciones

Andrés sale a vacaciones del 21-dic-2026 al 11-ene-2027. Pendiente definir quién queda.
