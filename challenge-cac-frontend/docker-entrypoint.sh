#!/bin/sh
set -e

cd /app

echo "--- [Frontend] Running npm install ---"
npm install

echo "--- [Frontend] Starting Vite dev server on port 5173 ---"
exec npm run dev -- --host 0.0.0.0 --port 5173
