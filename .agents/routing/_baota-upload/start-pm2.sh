#!/bin/bash
set -e
cd "$(dirname "$0")"
export PORT=5174
export ENABLE_NATIVE_PICK=0
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete skill-routing 2>/dev/null || true
  PORT=5174 ENABLE_NATIVE_PICK=0 pm2 start server.mjs --name skill-routing
  pm2 save
  echo "PM2 started. Health:"
  curl -s http://127.0.0.1:5174/api/health || true
  echo
else
  echo "PM2 not found. Install via BaoTa or run: PORT=5174 node server.mjs"
fi
