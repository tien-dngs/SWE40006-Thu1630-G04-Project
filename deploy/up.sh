#!/bin/sh
set -eu

HTTP_PORT="${HTTP_PORT:-80}"
BIND_ADDRESS="${BIND_ADDRESS:-0.0.0.0}"
INSTALL_HOST_NGINX="${INSTALL_HOST_NGINX:-0}"
DEPLOY_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"

docker volume create taskboard_data >/dev/null
docker network inspect taskboard >/dev/null 2>&1 || docker network create taskboard >/dev/null

docker rm -f taskboard-frontend taskboard-backend >/dev/null 2>&1 || true

docker run -d --name taskboard-backend \
  --network taskboard \
  --network-alias backend \
  --restart unless-stopped \
  -e DB_PATH=/data/db.sqlite \
  -e SQL_PATH=/app/seed/commands.sql \
  -e PORT=4004 \
  -v taskboard_data:/data \
  taskboard-backend:latest

ready=0
i=0
while [ "$i" -lt 30 ]; do
  if docker exec taskboard-backend node -e "fetch('http://127.0.0.1:4004/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
    ready=1
    break
  fi
  i=$((i + 1))
  sleep 2
done

if [ "$ready" -ne 1 ]; then
  echo "backend did not become healthy" >&2
  docker logs taskboard-backend >&2 || true
  exit 1
fi

docker run -d --name taskboard-frontend \
  --network taskboard \
  --restart unless-stopped \
  -p "${BIND_ADDRESS}:${HTTP_PORT}:80" \
  taskboard-frontend:latest

if [ "$INSTALL_HOST_NGINX" = "1" ]; then
  sudo cp "$DEPLOY_DIR/deploy/nginx-host.conf" /etc/nginx/sites-available/taskboard
  sudo ln -sfn /etc/nginx/sites-available/taskboard /etc/nginx/sites-enabled/taskboard
  default_target=""
  if [ -e /etc/nginx/sites-enabled/default ]; then
    default_target="$(readlink -f /etc/nginx/sites-enabled/default || true)"
    sudo rm -f /etc/nginx/sites-enabled/default
  fi
  if ! sudo nginx -t; then
    sudo rm -f /etc/nginx/sites-enabled/taskboard
    if [ -n "$default_target" ]; then
      sudo ln -sfn "$default_target" /etc/nginx/sites-enabled/default
    fi
    exit 1
  fi
  sudo systemctl reload nginx
fi
