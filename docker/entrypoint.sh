#!/bin/sh

# Entrypoint script to handle config files location
# react-app-rewired expects config files in root

echo "🔧 Setting up config files..."

# Copy config files to root
if [ -f /app/config/config-overrides.js ]; then
    echo "📋 Copying config-overrides.js..."
    cp /app/config/config-overrides.js /app/config-overrides.js
fi

if [ -f /app/config/postcss.config.js ]; then
    echo "📋 Copying postcss.config.js..."
    cp /app/config/postcss.config.js /app/postcss.config.js
fi

if [ -f /app/config/tailwind.config.js ]; then
    echo "📋 Copying tailwind.config.js..."
    cp /app/config/tailwind.config.js /app/tailwind.config.js
fi

echo "✅ Config files ready"
echo "🚀 Building production version..."

# Build the production version
npm run build

echo "✅ Production build complete"
echo "🚀 Starting production server..."

# Serve the production build
npx serve -s build -l 3000

