# Despliegue de Guadua

Versión 1.6 · 3-nov-2026 · Felipe Zuluaga (DevOps). Última revisión: Camilo Restrepo.

## Resumen

Todo lo que llega a `main` se despliega a producción con GitHub Actions. No se despliega a mano desde los equipos, salvo en una reversión de emergencia autorizada por Andrés Gómez.

| Flujo | Archivo | Cuándo corre |
|---|---|---|
| Pruebas | `.github/workflows/pruebas.yml` | En cada pull request |
| Despliegue | `.github/workflows/desplegar.yml` | Al hacer merge a `main` (y a mano con «Run workflow») |

## Qué hace el despliegue

1. Instala dependencias de cada aplicación y corre las pruebas.
2. Construye las imágenes de `guadua-web`, `guadua-api`, `guadua-asistente` y `guadua-mcp`.
3. Sube las imágenes a ECR en la cuenta `123456789012` (`us-east-1`) con la etiqueta del commit.
4. Corre las migraciones con `scripts/migrar.sh` contra `guadua-db`.
5. Actualiza los servicios del clúster ECS `guadua-produccion` y espera a que queden estables.
6. Avisa en el canal de despliegues con el commit, el autor y la duración.

Un despliegue normal tarda entre 9 y 14 minutos.

## Secretos del CI

Los valores se guardan en **Settings → Secrets and variables → Actions** del repositorio. Solo Felipe Zuluaga y Andrés Gómez los administran. Los nombres que usan los flujos son:

| Nombre | Para qué |
|---|---|
| `AWS_ACCESS_KEY_ID` | Acceso a AWS para ECR, ECS y S3 |
| `AWS_SECRET_ACCESS_KEY` | Pareja del anterior |
| `DATABASE_URL` | Conexión de las migraciones a `guadua-db` |
| `PAGOSYA_CLAVE_SECRETA` | Pruebas de integración con PagosYa y variables del servicio web |
| `PROVEEDOR_MODELOS_API_KEY` | Llamadas del asistente de soporte al proveedor de modelos |

Si necesita un secreto nuevo, pídalo por la Mesa (`mesa.bahareque.example`) con el nombre, para qué es y qué flujo lo usa.

## Antes de hacer merge

- El PR tiene al menos una aprobación de alguien distinto al autor.
- `pruebas.yml` está en verde.
- Si el PR trae migraciones, el archivo nuevo está en `scripts/sql/migraciones/` con número consecutivo.
- Evite hacer merge los viernes después de las 4:00 p. m. y la víspera de festivos.

## Reversión

1. En la pestaña **Actions**, abra el último despliegue exitoso anterior al problema.
2. Use «Re-run all jobs»: vuelve a desplegar las imágenes de ese commit.
3. Si el problema vino de una migración, avísele a Felipe Zuluaga antes de revertir: las migraciones no se deshacen solas y puede hacer falta restaurar desde `bahareque-respaldos`.
4. Registre la reversión en la Mesa con la hora, el commit revertido y el motivo.

Para revertir solo un servicio, en la consola de ECS se puede volver a la definición de tarea anterior; deje constancia en la Mesa.

## Ventanas y contactos

- Ventana preferida: martes a jueves, de 9:00 a. m. a 3:00 p. m.
- Responsable del CI: Felipe Zuluaga (`felipe.zuluaga@bahareque.example`).
- Escalamiento: Andrés Gómez (`andres.gomez@bahareque.example`).
