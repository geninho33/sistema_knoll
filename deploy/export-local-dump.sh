#!/usr/bin/env bash
# Exporta dados do MySQL local para restore na VPS / Docker MySQL 8
# Uso: ./deploy/export-local-dump.sh [arquivo_saida.sql]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/knoll_dados_local.sql}"

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=masterkey
DB_NAME=nffac617_marlon
if [[ -f "$ROOT/nova_versao/backend/.env" ]]; then
  # shellcheck disable=SC1091
  set -a; source "$ROOT/nova_versao/backend/.env"; set +a
fi

echo "==> Export $DB_NAME @ $DB_HOST -> $OUT"
mysqldump \
  -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" \
  --single-transaction \
  --quick \
  --skip-lock-tables \
  --add-drop-table \
  --disable-keys \
  --extended-insert \
  --default-character-set=utf8mb4 \
  --set-gtid-purged=OFF \
  --column-statistics=0 \
  --hex-blob \
  "$DB_NAME" \
  knoll_clientes knoll_clientes_produtos knoll_configuracao knoll_departamento \
  knoll_funcionario knoll_menu knoll_menu_usuario knoll_pagamento knoll_pesquisa \
  knoll_produtos knoll_servicos knoll_servicos_itens knoll_servicos_produtos knoll_usuarios \
  sys_acessos sys_auditoria sys_configuracoes_relatorio sys_horarios_acesso \
  sys_logs_login sys_menus sys_perfil_permissoes sys_perfis sys_permissoes sys_usuarios \
  > "$OUT"

echo "==> OK: $(du -h "$OUT" | cut -f1)"
echo
echo "Proximo passo na VPS:"
echo "  scp knoll_dados_local.sql root@SEU_IP:/root/sistema_knoll/"
echo "  cd .../deploy && ./restore-dump.sh ../knoll_dados_local.sql"
echo "  docker exec -it knoll-backend node migrate.js repair"
