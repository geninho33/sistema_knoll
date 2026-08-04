#!/usr/bin/env bash
# Restore do dump no MySQL 8 do Docker (evita ERROR 2026 SSL)
# Uso: ./deploy/restore-dump.sh [caminho/arquivo.sql]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP="${1:-}"
if [[ -z "$DUMP" ]]; then
  if [[ -f "$ROOT/marlon20260804_mysql8.sql" ]]; then
    DUMP="$ROOT/marlon20260804_mysql8.sql"
  else
    DUMP="$ROOT/marlon20260804.sql"
  fi
fi
[[ -f "$DUMP" ]] || { echo "Arquivo nao encontrado: $DUMP"; exit 1; }

DB_USER=knoll
DB_PASSWORD=knoll_change_me
DB_NAME=knoll
if [[ -f "$ROOT/deploy/.env" ]]; then
  # shellcheck disable=SC1091
  set -a; source "$ROOT/deploy/.env"; set +a
fi

echo "==> Restore $DUMP -> knoll-mysql / $DB_NAME"
docker exec -i knoll-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" --ssl-mode=DISABLED "$DB_NAME" < "$DUMP"
echo "==> OK"
echo "Rode: docker exec -it knoll-backend node migrate.js"
