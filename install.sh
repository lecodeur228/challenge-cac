#!/bin/bash

set -e

# VARIABLES
REPO_URL="https://github.com/lecodeur228/challenge-cac.git"
REPO_DIR="challenge-cac"

NETWORK_NAME="challenge-cac-net"

echo "Starting installation..."

# Clone ou update du repo
if [ -d "$REPO_DIR" ]; then
  echo "Updating $REPO_DIR..."
  cd $REPO_DIR
  git pull origin main
  cd ..
else
  echo "Cloning $REPO_DIR..."
  git clone $REPO_URL $REPO_DIR
fi

cd $REPO_DIR

# Détection de l'IP publique du serveur
echo "Detecting server IP..."
SERVER_IP=$(curl -s --max-time 5 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"

# Écriture du fichier .env pour docker-compose
echo "SERVER_IP=$SERVER_IP" > .env

# Création réseau docker si absent
if ! docker network ls | grep -q "$NETWORK_NAME"; then
  echo "Creating docker network $NETWORK_NAME..."
  docker network create $NETWORK_NAME
else
  echo "Docker network $NETWORK_NAME already exists."
fi

# Création répertoire logs
echo "Creating log directories..."
mkdir -p logs/backend

# Création base SQLite si absente
if [ ! -f challenge-cac-backend/database/database.sqlite ]; then
  echo "Creating SQLite database..."
  touch challenge-cac-backend/database/database.sqlite
fi

# Permissions Laravel
echo "Setting permissions..."
chmod -R 775 challenge-cac-backend/storage
chmod -R 775 challenge-cac-backend/bootstrap/cache

# Build et lancement docker
echo "Building and starting containers..."
docker compose up -d --build

echo ""
echo "✔ Deployment complete."
echo "   Frontend  : http://$SERVER_IP:4000"
echo "   Backend API: http://$SERVER_IP:4099/api"
