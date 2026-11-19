# Anexo 2 · Acuerdo de nivel de servicio (ANS) para comercios · Guadua

Versión 2026.1 · vigente desde el 01-feb-2026 · Área comercial (Alejandro Toro Gutiérrez)
Hace parte del contrato de servicios firmado con cada comercio.

## 1. Disponibilidad garantizada

Bahareque garantiza una **disponibilidad mensual del 99,9 %** de la tienda en línea, la API y el panel de comercios.

- Equivale a un máximo de 43 minutos sin servicio en un mes de 30 días (44 en uno de 31; 40 en febrero).
- Se mide con el tablero Guadua-Produccion (`infra/monitoreo/tableros.md`) y se informa cada mes a los comercios (`infra/monitoreo/disponibilidad-mensual-2026.csv`).

## 2. Exclusiones

Solo se excluyen del cálculo:
1. el mantenimiento programado avisado con 72 horas de anticipación, entre las 00:00 y las 05:00;
2. las caídas de PagosYa, Facturar Andino y Envíos Cafeteros cuando la plataforma Guadua sigue en línea.

No se excluye ninguna otra causa: errores propios, despliegues, fallas de AWS y ataques cuentan como tiempo sin servicio.

## 3. Recuperación

| Situación | Compromiso |
|---|---|
| Tiempo máximo para restablecer el servicio (RTO) | 1 hora |
| Pérdida máxima de datos de pedidos (RPO) | 15 minutos |
| Copias de los datos del comercio | diarias, guardadas 35 días, en otra región |

## 4. Compensación

| Disponibilidad del mes | Crédito sobre la mensualidad |
|---|---|
| entre 99,0 % y 99,9 % | 10 % |
| entre 95,0 % y 99,0 % | 25 % |
| menos de 95,0 % | 50 % |

El crédito se aplica en la factura siguiente cuando el informe mensual muestra el incumplimiento.

## 5. Atención de incidentes

- Severidad 1 (tienda caída): respuesta en 15 minutos, 24/7.
- Severidad 2 (función importante degradada): respuesta en 2 horas hábiles.

Firmado por Bahareque: Mariana Ocampo, gerente · 30-ene-2026
