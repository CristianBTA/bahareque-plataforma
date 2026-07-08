#!/usr/bin/env bash
# Aplica las migraciones pendientes de la base de Guadua (app/api/migraciones).
# Uso: scripts/migrar.sh [pruebas|produccion] [--simular]
# En producción solo lo corren Camilo Restrepo o Felipe Zuluaga, con ventana anunciada en la Mesa.

set -euo pipefail

ENTORNO="${1:-pruebas}"
SIMULAR="${2:-}"

case "$ENTORNO" in
  pruebas)
    export DATABASE_URL="${DATABASE_URL_PRUEBAS:-postgres://guadua_app@localhost:5432/guadua}"
    ;;
  produccion)
    export DATABASE_URL="postgres://bahareque_owner:FALSO-Owner-Migra-2026@guadua-db.interno.bahareque.example:5432/guadua?sslmode=require"
    read -r -p "Va a migrar PRODUCCIÓN. Escriba 'guadua' para continuar: " confirmacion
    [[ "$confirmacion" == "guadua" ]] || { echo "Cancelado"; exit 1; }
    ;;
  *)
    echo "Entorno desconocido: $ENTORNO (use pruebas o produccion)"
    exit 2
    ;;
esac

cd "$(dirname "$0")/../app/api"

echo "Migraciones pendientes en ${ENTORNO}:"
npx --no-install node-pg-migrate up --dry-run --migrations-dir migraciones | grep -E '^> Migrating' || echo "  (ninguna)"

if [[ "$SIMULAR" == "--simular" ]]; then
  echo "Modo simulación: no se aplicó nada."
  exit 0
fi

npx --no-install node-pg-migrate up --migrations-dir migraciones --migrations-table migraciones_aplicadas
echo "Migraciones aplicadas en ${ENTORNO} · $(date '+%F %T')"
