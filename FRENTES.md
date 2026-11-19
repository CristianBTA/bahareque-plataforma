# Los cinco frentes

Cada persona elige un frente y trabaja sola, con su IA. Lo que está mal no se dice: lo encuentran ustedes, con su IA y con las reglas de `CLAUDE.md`. Primero dicen qué sospechan y de qué tema del curso; después la IA corrige y redacta con ustedes.

| Frente | Tema |
|---|---|
| 1 | La empresa no tuvo en cuenta la tríada CIA |
| 2 | Hay que crear un SGSI para el personal |
| 3 | La app tiene tokens y API expuestos (todos FALSOS) |
| 4 | Phishing: qué hacer y qué mecanismos aplicar a las personas |
| 5 | Contratos que se quieren procesar con IA |

Reglas comunes:
- **Su frente:** corrijan solo los archivos de su frente y escriban sus documentos donde diga el encargo.
- **Lo que no se borra:** no borren evidencia (registros, correos ni tickets).
- **Lo que no se cambia:** algunas cosas están bien. Si la cambian sin razón, el revisor lo cuenta en contra.
- **Los avisos:** llegan dos. El primero se responde en `entregas/frente-N/incidente.md` y el segundo en `incidente-2.md`.
- **El reporte de cada persona:** `entregas/frente-N/reporte-<su-nombre>.md`, con lo que encontró, alimentado con lo que aprendió en clase (plantilla en `entregas/PLANTILLA-REPORTE.md`). El revisor evalúa el frente y también la comprensión.
- **La entrega:** cada persona hace su fork y su PR, titulado «Frente N · su nombre» (ver `README.md`).


---

## Frente 1 · La tríada CIA

**Lo que pide la gerencia**

Mariana Ocampo, gerente general: «Un comercio grande nos preguntó qué pasa con sus datos y con sus ventas si mañana algo falla, y no supe qué responder. Necesito saber qué tenemos, cuánto le importa cada cosa al negocio y qué tan expuestos estamos: quién puede ver la información, si alguien puede cambiarla sin que lo notemos y cuánto tiempo aguantamos sin servicio. Quiero lo más grave corregido antes de fin de año».

**Dónde mirar**

`datos/`, `infra/terraform/` (sin tocar `terraform.tfvars`), `infra/monitoreo/`, `operacion/` y `registros/nube/`.

**Qué entregar** (PR «Frente 1 · …»)

1. `entregas/frente-1/analisis-cia.md`, con:
   - al menos 15 activos críticos clasificados en confidencialidad, integridad y disponibilidad (alto, medio o bajo), cada uno con su porqué;
   - las tres fallas más graves de cada pilar, con evidencia (archivo:línea);
   - el RPO y el RTO que usted propone para los procesos críticos;
   - los cambios que hizo y lo que queda pendiente, con responsable y fecha.
2. `datos/inventario-activos.csv` con las columnas C, I y A.
3. Los archivos `.tf` corregidos y los documentos de `operacion/` e `infra/monitoreo/` que haga falta actualizar.

---

## Frente 2 · Hay que crear un SGSI para el personal

**Lo que piden la gerente, Mariana Ocampo, y la jefa de talento humano, Claudia Patricia Hoyos:**
«Ya somos más de 40 personas y nunca ordenamos la seguridad de la gente. Un comercio grande nos pidió demostrar que tenemos un SGSI, y queremos empezar por las personas: quién entra a qué, con qué permisos y si debería; cómo entra y cómo sale alguien de la empresa; qué se le enseña y qué reglas sigue, también con la IA».

**Contexto que debe tener en cuenta:** en Bahareque los desarrolladores tienen terminales con muchos permisos, pero bien estructuradas. El equipo de documentación usa Claude Code solo para leer documentos.

**Dónde mirar:** `personal/` (`empleados.csv` es de solo lectura), `politicas/politica-seguridad-2019.md`, `politicas/uso-de-ia.md`, `estaciones/documentacion/`, `estaciones/soporte/` y `estaciones/finanzas/`.

**Qué entregar:**
1. En `entregas/frente-2/sgsi/`, el SGSI del personal según ISO/IEC 27001:2022 (cláusulas 4 a 6; controles A.5.15 a A.5.18 y A.6.1 a A.6.8): `alcance-y-contexto.md`, `politica-de-seguridad.md`, `roles-y-responsabilidades.md`, `controles-de-personas.md`, `procedimiento-ingreso-retiro.md`, `uso-aceptable-de-ia-por-rol.md`, `plan-de-concienciacion.md`, `riesgos-del-personal.md` y `soa-personas.md`.
2. `personal/accesos.csv` corregido.
3. La configuración de IA de documentación corregida o retirada, con su justificación.
4. Un PR titulado «Frente 2 · …».

---

## Frente 3 · Llaves a la vista en Guadua

**El pedido.** Una revisión interna concluyó que el código de Guadua deja a la vista llaves, contraseñas y tokens de Bahareque y de sus proveedores. Son falsos y no funcionan, pero trátelos como reales. La gerencia quiere tres cosas: que el código quede sin secretos, saber qué hay que cambiar en cada sistema y que esto no vuelva a pasar.

Además, el equipo de desarrollo pide mejores medidas al usar su Claude, sin perder velocidad. Su pedido está en `estaciones/desarrollo/`.

**Dónde mirar.** En `app/` (web, app móvil, API, asistente de soporte y servidor MCP), `.github/workflows/`, `scripts/`, `analitica/`, `docs/`, `infra/terraform/terraform.tfvars`, `docker-compose.yml`, `.gitignore`, `.npmrc` y `estaciones/desarrollo/`. Revise también lo que el repositorio recuerda, no solo lo que muestra hoy.

**Qué entregar** (en un PR «Frente 3 · …»):

1. Los archivos corregidos: cada secreto fuera del código, con referencias a variables de entorno o a un gestor de secretos.
2. `entregas/frente-3/rotacion.md`: una tabla con cada secreto (archivo y línea, sistema, impacto y acción: rotar o revocar).
3. Una plantilla de variables sin valores y reglas para que los archivos de secretos no entren al repositorio.
4. Un CI que maneje bien las llaves y revise si hay secretos en cada cambio.
5. La configuración de Claude del equipo de desarrollo, mejorada.

---

## Frente 4 · Phishing: qué hacer y cómo proteger a las personas

**Lo que pide la gerente, Mariana Ocampo:**
«Hemos caído en phishing en todo: facturas, pagos, contraseñas y hasta llamadas. Cada vez castigamos a alguien y al mes vuelve a pasar. Quiero saber qué nos está entrando hoy, cerrar las puertas que dejamos abiertas y tener por escrito qué hacemos cuando alguien cae y cómo protegemos a la gente».

**Dónde mirar:** `correo/` (bandeja de noviembre, filtro, ajustes de la suite, apps autorizadas y reportes de los empleados), `dns/`, `politicas/procedimiento-pagos.md`, `incidentes/historial-phishing.md`, `registros/proxy/` y `registros/correo/`.

**Qué entregar:**
1. `seguridad/phishing/analisis-bandeja.md`: cada correo de la bandeja clasificado como legítimo o phishing, con la señal que lo prueba, y lo que muestran los registros sobre esos correos.
2. La configuración corregida de correo, DNS, apps y pagos.
3. `seguridad/phishing/playbook-respuesta.md`: qué hace Bahareque desde que llega un reporte hasta que aprende del caso, según lo que haya hecho cada persona.
4. `seguridad/phishing/mecanismos-para-personas.md`: qué cambia para la gente, no solo para las máquinas.
5. Un PR titulado «Frente 4 · …».

Corrija lo que esté mal sin dañar lo que funciona. Los correos y los registros son evidencia: no se borran.

---

## Frente 5 · Contratos y datos de clientes que Bahareque quiere procesar con IA

**Pedido de la gerencia (Mariana Ocampo):**
«Comercial quiere activar el 1 de diciembre funciones con IA para nuestros clientes: resúmenes de tickets, clasificación de pedidos y respuestas automáticas. Varios clientes dijeron que sí, pero el comité del 10 de noviembre terminó sin decisión. Necesito saber, cliente por cliente, a quién podemos procesar con IA, y que esa decisión se pueda demostrar si alguien la pide mañana.»

**Dónde mirar:** la carpeta `contratos/`. Ahí están la hoja de Comercial (`clientes-ia.csv`), el registro de consentimientos, los documentos de `autorizaciones/`, los correos de `correos/`, la plantilla del contrato, el plan de procesamiento y el acta del comité.

**Qué entregar:**
1. `entregas/frente-5/decision.md`: la regla escrita y una tabla con los 40 clientes. Para cada uno, escriba «procesar», «no procesar» o «procesar cuando complete…» y diga qué le falta.
2. `contratos/clientes-ia.csv` con dos columnas nuevas: `apto_ia` y `motivo`.
3. La plantilla del contrato corregida.
4. El plan de procesamiento corregido.

Justifique cada decisión con la fuente en la que se basa. Abra un PR con el título «Frente 5 · …».
