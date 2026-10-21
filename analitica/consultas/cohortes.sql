-- Cohortes de comercios y comportamiento de compra de sus clientes.
-- Equipo de datos (Ximena Botero, David Castro). Versión 4 · 30-sep-2026.
-- Se corre sobre la réplica de lectura; los resultados alimentan el tablero mensual.

-- 1. Cohorte de cada comercio = mes de su primer pedido pagado
WITH primer_pedido AS (
  SELECT comercio_id,
         date_trunc('month', MIN(creado_en) AT TIME ZONE 'America/Bogota')::date AS cohorte
    FROM pedidos
   WHERE estado IN ('pagado', 'preparando', 'enviado', 'entregado')
   GROUP BY comercio_id
),
actividad AS (
  SELECT DISTINCT p.comercio_id,
         date_trunc('month', p.creado_en AT TIME ZONE 'America/Bogota')::date AS mes
    FROM pedidos p
   WHERE p.estado IN ('pagado', 'preparando', 'enviado', 'entregado')
)
SELECT pp.cohorte,
       (EXTRACT(YEAR FROM age(a.mes, pp.cohorte)) * 12 + EXTRACT(MONTH FROM age(a.mes, pp.cohorte)))::int AS mes_desde_inicio,
       COUNT(DISTINCT a.comercio_id) AS comercios_activos,
       ROUND(100.0 * COUNT(DISTINCT a.comercio_id)
             / NULLIF(MAX(COUNT(DISTINCT a.comercio_id)) OVER (PARTITION BY pp.cohorte), 0), 1) AS retencion_pct
  FROM primer_pedido pp
  JOIN actividad a ON a.comercio_id = pp.comercio_id
 WHERE pp.cohorte >= DATE '2026-01-01'
 GROUP BY pp.cohorte, mes_desde_inicio
 ORDER BY pp.cohorte, mes_desde_inicio;

-- 2. Recompra: porcentaje de clientes finales con 2 o más pedidos en 90 días, por comercio
WITH pedidos_validos AS (
  SELECT comercio_id, cliente_id, creado_en
    FROM pedidos
   WHERE estado IN ('pagado', 'preparando', 'enviado', 'entregado')
     AND creado_en >= now() - interval '90 days'
),
por_cliente AS (
  SELECT comercio_id, cliente_id, COUNT(*) AS pedidos
    FROM pedidos_validos
   GROUP BY comercio_id, cliente_id
)
SELECT c.id AS comercio_id,
       c.nombre_visible,
       c.plan,
       COUNT(*) AS clientes,
       COUNT(*) FILTER (WHERE pc.pedidos >= 2) AS clientes_que_recompran,
       ROUND(100.0 * COUNT(*) FILTER (WHERE pc.pedidos >= 2) / NULLIF(COUNT(*), 0), 1) AS recompra_pct
  FROM por_cliente pc
  JOIN comercios c ON c.id = pc.comercio_id
 GROUP BY c.id, c.nombre_visible, c.plan
HAVING COUNT(*) >= 20
 ORDER BY recompra_pct DESC;

-- 3. Ticket promedio por mes y por plan (pesos, sin decimales)
SELECT date_trunc('month', p.creado_en AT TIME ZONE 'America/Bogota')::date AS mes,
       c.plan,
       COUNT(*) AS pedidos,
       SUM(p.total) AS ventas,
       ROUND(AVG(p.total))::int AS ticket_promedio,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.total)::int AS ticket_mediano
  FROM pedidos p
  JOIN comercios c ON c.id = p.comercio_id
 WHERE p.estado IN ('pagado', 'preparando', 'enviado', 'entregado')
   AND p.creado_en >= DATE '2026-03-01'
 GROUP BY 1, 2
 ORDER BY 1, 2;

-- 4. Reembolsos sobre ventas por mes (indicador para soporte)
SELECT date_trunc('month', r.creado_en AT TIME ZONE 'America/Bogota')::date AS mes,
       COUNT(*) AS reembolsos,
       SUM(r.monto) AS monto_reembolsado,
       ROUND(100.0 * SUM(r.monto) / NULLIF((
         SELECT SUM(p2.total) FROM pedidos p2
          WHERE date_trunc('month', p2.creado_en) = date_trunc('month', r.creado_en)
            AND p2.estado IN ('pagado', 'preparando', 'enviado', 'entregado')
       ), 0), 2) AS pct_sobre_ventas
  FROM reembolsos r
 WHERE r.estado = 'completado'
 GROUP BY 1, date_trunc('month', r.creado_en)
 ORDER BY 1;
