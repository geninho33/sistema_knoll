#!/usr/bin/env bash
# Restore do dump no MySQL 8 do Docker (evita ERROR 2026 SSL)
# Uso: ./deploy/restore-dump.sh [caminho/arquivo.sql]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP="${1:-}"
if [[ -z "$DUMP" ]]; then
  if [[ -f "$ROOT/knoll_dados_local.sql" ]]; then
    DUMP="$ROOT/knoll_dados_local.sql"
  elif [[ -f "$ROOT/marlon20260804_mysql8.sql" ]]; then
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
# Garante checks desligados mesmo se o dump for data-only incompleto
{
  echo "SET NAMES utf8mb4;"
  echo "SET FOREIGN_KEY_CHECKS=0;"
  echo "SET UNIQUE_CHECKS=0;"
  echo "SET sql_mode='ALLOW_INVALID_DATES,NO_AUTO_VALUE_ON_ZERO,NO_ENGINE_SUBSTITUTION';"
  cat "$DUMP"
  echo "SET FOREIGN_KEY_CHECKS=1;"
  echo "SET UNIQUE_CHECKS=1;"
} | docker exec -i knoll-mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" --ssl-mode=DISABLED "$DB_NAME"
echo "==> OK"
echo "Rode repair (colunas novas / password_hash):"
echo "  docker exec -it knoll-backend node migrate.js repair"
echo "  docker exec -it knoll-backend node migrate.js status"
