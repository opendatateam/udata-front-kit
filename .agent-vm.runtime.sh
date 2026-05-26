#!/usr/bin/env bash
set -euo pipefail

sudo corepack enable pnpm
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
command -v pm2 || pnpm add --global pm2

CI=true pnpm install --store-dir ~/.local/share/pnpm/store

pm2 delete dev-server 2>/dev/null || true
export CHOKIDAR_USEPOLLING=true
pm2 start "pnpm run dev" --name dev-server
pnpm exec wait-on --timeout 60000 http://localhost:5173
echo "Dev server ready on http://localhost:5173"
