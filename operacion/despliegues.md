# Cómo se despliega Guadua

Versión 1.4 · 03-feb-2026 · Felipe Zuluaga Henao

## API y web

- Lo normal: al hacer push a `main`, GitHub Actions compila y despliega a ECS (`guadua-prod`) con las llaves del usuario `bahareque-ci`.
- Cuando GitHub Actions falla o va lento, se despliega desde el portátil: `npm run build`, `docker build`, `docker push` y `aws ecs update-service --force-new-deployment`. Para eso cada desarrollador tiene las llaves de `bahareque-ci` en `~/.aws/credentials` (se repartieron en 2025).
- `main` no tiene protección de rama. La revisión obligatoria de PR se quitó en feb-2025 porque «frenaba los arreglos urgentes». Cualquiera de las 22 personas con escritura puede hacer push directo.
- No hay ambiente intermedio: lo que pasa las pruebas unitarias va a producción.
- Las migraciones de base las corre la API al arrancar con su propio usuario (`guadua_api`).

## Infraestructura (Terraform)

- `terraform plan` y `terraform apply` se corren desde el portátil de Andrés o el de Felipe.
- El plan no lo revisa nadie más; si algo sale mal se corrige en caliente.
- El ambiente de pruebas se recrea cada lunes con `terraform apply -replace=aws_db_instance.guadua_pruebas`.

## Horario

Se despliega cuando está listo, también los viernes en la noche.

## Registro de despliegues · noviembre 2026

| Fecha | Hora | Qué | Desde dónde | Quién | Revisión |
|---|---|---|---|---|---|
| 03-nov | 10:12 | API 3.13.9 | GitHub Actions | Camilo Restrepo | — |
| 04-nov | 16:40 | web | GitHub Actions | Natalia Quintero | — |
| 05-nov | 19:55 | API 3.14.0 (asistente) | portátil de Tomás | Tomás Echeverri | — |
| 06-nov | 22:31 | API 3.14.0 (arreglo) | portátil de Felipe | Felipe Zuluaga | — |
| 09-nov | 08:05 | Terraform: pruebas | portátil de Felipe | Felipe Zuluaga | — |
| 10-nov | 11:20 | API 3.14.1 | GitHub Actions | Mateo Valencia | — |
| 12-nov | 15:02 | web | GitHub Actions | Natalia Quintero | — |
| 13-nov | 20:48 (viernes) | API 3.14.2 | portátil de Santiago | Santiago Marín | — |
| 17-nov | 08:12 | Terraform: pruebas | portátil de Felipe | Felipe Zuluaga | — |
| 17-nov | 17:30 | API 3.14.2 (MCP de pedidos) | GitHub Actions | Tomás Echeverri | — |
| 18-nov | 21:05 | Terraform: SG de la base | portátil de Andrés | Andrés Gómez | — |
