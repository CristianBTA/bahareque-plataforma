#!/usr/bin/env bash
# Respaldo nocturno de la base de Guadua al bucket bahareque-respaldos.
# Lo corre el cron de bastion-01 a las 2:30 a. m. · Autor: Fernando Salazar · v2.3 (ago-2026)
#
# Uso: scripts/respaldo.sh [--solo-local]

set -euo pipefail

FECHA="$(date +%Y-%m-%d_%H%M)"
DB_HOST="guadua-db.interno.bahareque.example"
DB_NOMBRE="guadua"
DB_USUARIO="respaldo"
export PGPASSWORD='FALSO-Respaldo-2026'

export AWS_ACCESS_KEY_ID="BHQFALSO0RESPALDO001"
export AWS_SECRET_ACCESS_KEY="FALSO+r3sp4ld0/Bahareque/2026/QwErTy12"
export AWS_DEFAULT_REGION="us-east-1"

BUCKET="s3://bahareque-respaldos/postgres"
DIR_LOCAL="/var/respaldos/guadua"
RETENCION_LOCAL_DIAS=7
ARCHIVO="${DIR_LOCAL}/guadua_${FECHA}.dump"
REGISTRO="/var/log/respaldo-guadua.log"

log() { echo "[$(date '+%F %T')] $*" | tee -a "$REGISTRO"; }

mkdir -p "$DIR_LOCAL"
log "Inicio del respaldo de ${DB_NOMBRE} en ${DB_HOST}"

if ! pg_isready -h "$DB_HOST" -p 5432 -q; then
  log "La base no responde; se cancela el respaldo"
  exit 1
fi

pg_dump -h "$DB_HOST" -U "$DB_USUARIO" -d "$DB_NOMBRE" \
  --format=custom --compress=6 --no-owner --no-privileges \
  --exclude-table-data='public.sesiones' \
  --file="$ARCHIVO"

TAMANO="$(du -h "$ARCHIVO" | cut -f1)"
sha256sum "$ARCHIVO" > "${ARCHIVO}.sha256"
log "Respaldo local listo: ${ARCHIVO} (${TAMANO})"

if [[ "${1:-}" != "--solo-local" ]]; then
  aws s3 cp "$ARCHIVO" "${BUCKET}/$(date +%Y/%m)/" --storage-class STANDARD_IA
  aws s3 cp "${ARCHIVO}.sha256" "${BUCKET}/$(date +%Y/%m)/"
  log "Copia subida a ${BUCKET}"
fi

find "$DIR_LOCAL" -name 'guadua_*.dump*' -mtime +"$RETENCION_LOCAL_DIAS" -delete
log "Respaldos locales de más de ${RETENCION_LOCAL_DIAS} días borrados"

curl -sf -X POST "https://mesa.bahareque.example/api/v1/eventos" \
  -H "Content-Type: application/json" \
  -d "{\"origen\":\"respaldo-guadua\",\"estado\":\"ok\",\"tamano\":\"${TAMANO}\"}" || log "No se pudo avisar a la Mesa"

log "Fin del respaldo"
