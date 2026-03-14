#!/bin/bash

set -e

# VARIABLES
REPO_URL="https://github.com/lecodeur228/challenge-cac.git"
REPO_DIR="challenge-cac"

NETWORK_NAME="challenge-cac-net"

echo "🚀 Starting installation..."

# Clone ou update du repo
if [ -d "$REPO_DIR" ]; then
  echo "🔄 Updating $REPO_DIR..."
  cd $REPO_DIR
  git pull origin main
  cd ..
else
  echo "📥 Cloning $REPO_DIR..."
  git clone $REPO_URL $REPO_DIR
fi

cd $REPO_DIR

# Création réseau docker si absent
if ! docker network ls | grep -q "$NETWORK_NAME"; then
  echo "🌐 Creating docker network $NETWORK_NAME..."
  docker network create $NETWORK_NAME
else
  echo "🌐 Docker network $NETWORK_NAME already exists."
fi

# Création base SQLite si absente
if [ ! -f backend/database/database.sqlite ]; then
  echo "🗄 Creating SQLite database..."
  touch backend/database/database.sqlite
fi

# Permissions Laravel
echo "🔐 Setting permissions..."
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache

# Build et lancement docker
echo "🐳 Building and starting containers..."
docker compose up -d --build

echo "✅ Deployment complete."
