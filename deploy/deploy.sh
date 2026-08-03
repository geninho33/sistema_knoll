#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="${ROOT_DIR}/deploy"
ENV_FILE="${DEPLOY_DIR}/.env"

echo "==> Knoll deploy"
echo "    root: ${ROOT_DIR}"

cd "${ROOT_DIR}"

if [ -d .git ]; then
  echo "==> git pull"
  git pull --ff-only
else
  echo "==> aviso: não é um repositório git; pulando git pull"
fi

if [ ! -f "${ENV_FILE}" ]; then
  echo "==> criando ${ENV_FILE} a partir de .env.example"
  cp "${DEPLOY_DIR}/.env.example" "${ENV_FILE}"
  echo "    edite ${ENV_FILE} com senhas/JWT/CORS antes de uso em produção"
fi

cd "${DEPLOY_DIR}"

echo "==> docker compose build + up -d"
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Erro: docker compose não encontrado" >&2
  exit 1
fi

"${COMPOSE[@]}" --env-file "${ENV_FILE}" up -d --build

echo "==> status"
"${COMPOSE[@]}" --env-file "${ENV_FILE}" ps

echo ""
echo "Deploy concluído."
echo "  Frontend: http://HOST:${FRONTEND_HOST_PORT:-8089}"
echo "  Backend:  http://HOST:${BACKEND_HOST_PORT:-3300}/api/health"
echo "  MySQL:    HOST:${MYSQL_HOST_PORT:-3308}"
echo ""
echo "Após o primeiro deploy, se necessário rode as migrations:"
echo "  docker exec -it knoll-backend node migrate.js"
