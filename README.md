# Bahareque Software S.A.S. · plataforma Guadua

> **Material de clase.** NODO · Universidad EAFIT · «Gestión de Riesgos de Seguridad en la Era de la IA» · clase 7, jueves 19 de noviembre de 2026.
>
> Bahareque Software S.A.S. es una **empresa ficticia**:
> - las claves dicen `FALSO`;
> - los dominios terminan en `.example`, que nunca abre;
> - las IP son de los rangos de documentación;
> - las personas no existen.
>
> Nada de este repositorio funciona ni se despliega: se analiza y se corrige.

## La situación

Bahareque tiene 48 personas en Manizales y hace Guadua, la tienda en línea de unos 1.200 comercios pequeños (ver `empresa/perfil.md`). Creció rápido y, en el camino, cometió casi todos los errores del curso:
- montó la infraestructura sin pensar en la tríada CIA;
- nunca armó un SGSI;
- dejó claves y tokens en el código;
- cayó en phishing una y otra vez;
- ahora quiere procesar con IA datos de clientes que nunca firmaron.

La gerencia les pide ordenar la casa en **cinco frentes** (ver `FRENTES.md`), con su IA.

## Cómo se trabaja

1. **Trabajo individual.** Cada persona elige un frente de `FRENTES.md` (unas tres personas por frente) y trabaja sola, con su IA y en su propio fork.
2. **Clonen el repositorio** (para clonar no hace falta cuenta) y creen su rama:
   ```bash
   git clone https://github.com/CristianBTA/bahareque-plataforma.git
   cd bahareque-plataforma
   git switch -c frente-N-su-nombre
   ```
3. **Abran su IA en la carpeta** con `claude`. El repositorio trae reglas para la IA en `CLAUDE.md`, y Claude Code las lee solo al abrirse:
   - Si le piden la respuesta, no se la da. Primero ustedes dicen qué sospechan y con qué tema del curso lo relacionan, y con eso los orienta.
   - Si dicen algo vago, como «sé que algo no se debe hacer con la data, es de la CIA», les responde con una pista sencilla, sin dar la respuesta.
   - Cuando ya tienen un hallazgo concreto, la IA hace el trabajo: corrige archivos y redacta la entrega.
   - Si usan Claude en la web, creen un Proyecto y peguen el contenido de `CLAUDE.md` como instrucciones del proyecto.
4. **Trabaje solo en los archivos de su frente** y escriba su entrega donde diga `FRENTES.md`.
5. **Cada persona escribe su reporte** en `entregas/frente-N/reporte-<su-nombre>.md`, con lo que encontró, alimentado con lo que aprendió en clase (ver `entregas/PLANTILLA-REPORTE.md`).
   Ejemplo: «El repo deja en evidencia que se filtraron tokens. En clase determinamos que se rotan de inmediato, porque hicimos una filtración».
   Su IA lleva la bitácora de lo que usted le dijo.
6. **Hay dos avisos.** Cada vez que el profesor avise, traigan lo nuevo:
   ```bash
   git pull --no-rebase --no-edit origin main
   ```
   Llega algo a `incidentes/`. Cada persona responde el primer aviso en `entregas/frente-N/incidente.md` y el segundo en `incidente-2.md`, desde su frente.
7. **Cada persona entrega con un PR**, como se explica abajo.

## Reglas

- **Con IA:** todo se resuelve con IA, pero el criterio es suyo. Revisen lo que la IA cambie antes de aceptarlo.
- **Nada se ejecuta:** no corran nada del repositorio (ni `npm install`, ni terraform, ni docker, ni scripts).
- **Sin configuraciones de agentes activas:** no agreguen `.claude/`, `.mcp.json` ni hooks en la raíz del repositorio. Las mejoras a la configuración de Claude de cada equipo, hooks incluidos, van en `estaciones/`.
- **Prioricen:** el tiempo no alcanza para todo. Empiecen por lo más grave de su frente; el revisor mide cuánto quedó en orden.
- **La evidencia se queda:** no borren registros ni correos. Corrijan configuraciones, código y documentos.

## Al terminar: no queda nada

Este repositorio no cambia las reglas ni la configuración de su Claude Code. `CLAUDE.md` solo aplica mientras Claude está abierto en esta carpeta, y no hay `.claude/`, `.mcp.json` ni hooks. Cuando el profesor haya revisado su PR:
- **La carpeta:** borre la carpeta del repositorio. Con ella se van también los permisos que haya aprobado en esa sesión.
- **El fork:** si quiere, borre su fork en GitHub.
- **El plan B:** si usó Claude en la web, borre el Proyecto o la conversación.
- **El historial:** Claude Code guarda el historial de sus conversaciones en su equipo, como en cualquier proyecto. Si no quiere conservarlo, bórrelo.

## Cómo entregar

**Con cuenta de GitHub (recomendado).** Cada persona hace su propio fork, sube su rama y abre su PR contra este repositorio, con el título «Frente N · su nombre»:
```bash
gh repo fork --remote --remote-name mio
git add -A
git commit -m "Frente N: hallazgos y reporte"
git push mio frente-N-su-nombre
gh pr create --repo CristianBTA/bahareque-plataforma --title "Frente N · Su nombre" --body "Mi reporte está en entregas/"
```
Sin `gh`, haga lo mismo en la web: botón «Fork», `git remote add mio <url de su fork>`, `git push mio frente-N-su-nombre` y «Compare & pull request».

**Sin GitHub.** Comprima la carpeta del repositorio y compártala con el profesor. Él corre el mismo revisor sobre su copia.

## Mapa del repositorio

| Carpeta | Qué hay |
|---|---|
| `empresa/` | perfil de Bahareque y catálogo de sistemas |
| `personal/` | nómina, accesos, capacitaciones, acuerdos de confidencialidad, ingreso y retiro |
| `politicas/` | políticas de la empresa |
| `estaciones/` | configuración de las herramientas de cada equipo, Claude incluido |
| `datos/` | inventario de activos, clasificación y respaldos |
| `infra/` | infraestructura como código y monitoreo |
| `operacion/` | continuidad, guardias, despliegues y caídas |
| `app/` | tienda web, app móvil, API, asistente de soporte con IA y servidor MCP |
| `.github/workflows/` | integración continua |
| `scripts/`, `analitica/`, `docs/` | scripts, análisis de datos y documentación técnica |
| `correo/`, `dns/` | bandeja de entrada, filtro de correo, apps autorizadas y zonas DNS |
| `contratos/` | clientes que se quieren procesar con IA, autorizaciones y contratos |
| `incidentes/` | historial de incidentes |
| `registros/` | registros de nube, proxy, correo y portal |
| `entregas/` | lo que entrega cada persona |
