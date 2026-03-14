#!/bin/bash
set -e

cd /var/www

echo "--- [Backend] Starting setup ---"

# 1. Copy .env if it doesn't exist
if [ ! -f .env ]; then
    echo ">>> Copying .env.example to .env..."
    cp .env.example .env
fi

# 2. Install composer dependencies if vendor/ is missing
if [ ! -d vendor ]; then
    echo ">>> Running composer install..."
    composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts
fi

# 3. Generate APP_KEY only if not already set
if grep -q "^APP_KEY=$" .env || grep -q "^APP_KEY=\"\"" .env; then
    echo ">>> Generating APP_KEY..."
    php artisan key:generate --force
fi

# 4. Create SQLite database file if missing
mkdir -p database
if [ ! -f database/database.sqlite ]; then
    echo ">>> Creating SQLite database..."
    touch database/database.sqlite
fi

# 5. Run migrations
echo ">>> Running migrations..."
php artisan migrate --force

# 6. Set permissions
echo ">>> Setting permissions..."
chmod -R 775 storage bootstrap/cache

echo "--- [Backend] Setup complete. Starting server on port 8000 ---"
exec php artisan serve --host=0.0.0.0 --port=8000
