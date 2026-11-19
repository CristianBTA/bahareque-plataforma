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

1. **Grupos de 3 (o 4).** Cada grupo toma un frente de `FRENTES.md`.
2. **Clonen el repositorio** (para clonar no hace falta cuenta) y creen su rama:
   ```bash
   git clone https://github.com/CristianBTA/bahareque-plataforma.git
   cd bahareque-plataforma
   git switch -c frente-N-grupo-X
   ```
3. **Abran su IA en la carpeta** con `claude`. El repositorio trae reglas para la IA en `CLAUDE.md`, y Claude Code las lee solo al abrirse:
   - Si le piden la respuesta, no se la da. Primero ustedes dicen qué sospechan y con qué tema del curso lo relacionan, y con eso los orienta.
   - Si dicen algo vago, como «sé que algo no se debe hacer con la data, es de la CIA», les responde con una pista sencilla, sin dar la respuesta.
   - Cuando ya tienen un hallazgo concreto, la IA hace el trabajo: corrige archivos y redacta la entrega.
   - Si usan Claude en la web, creen un Proyecto y peguen el contenido de `CLAUDE.md` como instrucciones del proyecto.
4. **Trabajen solo en los archivos de su frente** y escriban su entrega donde diga `FRENTES.md`.
5. **Cuando el profesor avise**, traigan lo nuevo:
   ```bash
   git pull --no-rebase --no-edit origin main
   ```
   Llega algo a `incidentes/` y cada grupo lo responde desde su frente.
6. **Entreguen con un PR**, como se explica abajo.

## Reglas

- **Con IA:** todo se resuelve con IA, pero el criterio es suyo. Revisen lo que la IA cambie antes de aceptarlo.
- **Nada se ejecuta:** no corran nada del repositorio (ni `npm install`, ni terraform, ni docker, ni scripts).
- **Sin configuraciones de agentes:** no agreguen `.claude/`, `.mcp.json` ni hooks.
- **La evidencia se queda:** no borren registros ni correos. Corrijan configuraciones, código y documentos.

## Cómo entregar

**Con cuenta de GitHub (recomendado).** Haga un fork, suba su rama y abra el PR contra este repositorio:
```bash
gh repo fork --remote --remote-name mio
git add -A
git commit -m "Frente N: ordenado por el grupo X"
git push mio frente-N-grupo-X
gh pr create --repo CristianBTA/bahareque-plataforma --title "Frente N · Grupo X" --body "Integrantes: …"
```
Sin `gh`, haga lo mismo en la web: botón «Fork», `git remote add mio <url de su fork>`, `git push mio frente-N-grupo-X` y «Compare & pull request».

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
| `entregas/` | lo que entrega cada grupo |
