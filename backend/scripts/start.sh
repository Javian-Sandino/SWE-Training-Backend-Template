#!/usr/bin/env bash
# backend/scripts/start.sh
# Safely stop any running node index.js and start the server, redirecting logs to server.log

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "Stopping any existing node index.js processes..."
PIDS=$(ps aux | grep "node index.js" | grep -v grep | awk '{print $2}' || true)
if [ -n "$PIDS" ]; then
  echo "Killing: $PIDS"
  kill $PIDS || true
  sleep 1
fi

echo "Starting server (logs -> server.log)..."
# Start in background and disown so it survives the shell exit
nohup npm start > server.log 2>&1 &
echo "Server started. Tail server.log to view logs: tail -f server.log"
