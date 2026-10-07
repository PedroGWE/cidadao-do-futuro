#!/usr/bin/env bash
# Script de deploy para o VPS — execute como o usuário do app
set -euo pipefail

REPO_DIR="/var/www/cidadao-futuro"
NGINX_CONF="/etc/nginx/sites-available/projeto.gtmcorepro.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/projeto.gtmcorepro.com"

cd "$REPO_DIR"

echo "=== 0. Atualizando código ==="
git fetch origin main
git pull --ff-only origin main

echo "=== 1. Instalando dependências ==="
pnpm install --frozen-lockfile

echo "=== 2. Build da API ==="
cd apps/api
pnpm build
cd "$REPO_DIR"

echo "=== 3. Migrations Prisma ==="
cd apps/api
npx prisma migrate deploy
cd "$REPO_DIR"

echo "=== 4. Build do Web ==="
cd apps/web
pnpm build
cd "$REPO_DIR"

echo "=== 5. Configurando Nginx ==="
if systemctl is-active --quiet nginx; then
  sudo cp infra/nginx/projeto.gtmcorepro.com.conf "$NGINX_CONF"
  sudo ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
  sudo nginx -t && sudo systemctl reload nginx
else
  echo "Nginx do host inativo; mantendo o proxy reverso externo/containerizado."
fi

echo "=== 6. Reiniciando processos PM2 ==="
pm2 startOrRestart infra/pm2/ecosystem.config.js --env production --update-env
pm2 save

echo "=== 7. Verificando saúde dos serviços ==="
for attempt in {1..12}; do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:3000/login >/dev/null \
    && curl --silent --show-error --max-time 5 http://127.0.0.1:3001/api/v1/auth/login >/dev/null; then
    echo "Frontend e API respondendo."
    break
  fi
  if [ "$attempt" -eq 12 ]; then
    pm2 status
    pm2 logs cidadao-web --lines 80 --nostream
    pm2 logs cidadao-api --lines 80 --nostream
    exit 1
  fi
  sleep 5
done

echo "=== Deploy concluído! ==="
