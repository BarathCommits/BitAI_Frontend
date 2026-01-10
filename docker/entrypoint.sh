#!/bin/sh

# Entrypoint script for Docker development builds
# NOTE: Config files are at root level (React convention)
# Dockerfile.prod handles config copying during build stage
# This entrypoint is mainly for development Docker builds

echo "🔧 Checking config files..."

# Verify config files exist at root (they should be copied by Dockerfile or volume mount)
if [ ! -f /app/config-overrides.js ]; then
    echo "⚠️  Warning: config-overrides.js not found at root"
    # Try to copy from /config/ as fallback (for backward compatibility)
    if [ -f /app/config/config-overrides.js ]; then
        echo "📋 Copying config-overrides.js from /config/ (fallback)..."
        cp /app/config/config-overrides.js /app/config-overrides.js
    fi
fi

if [ ! -f /app/postcss.config.js ]; then
    echo "⚠️  Warning: postcss.config.js not found at root"
    if [ -f /app/config/postcss.config.js ]; then
        echo "📋 Copying postcss.config.js from /config/ (fallback)..."
        cp /app/config/postcss.config.js /app/postcss.config.js
    fi
fi

if [ ! -f /app/tailwind.config.js ]; then
    echo "⚠️  Warning: tailwind.config.js not found at root"
    if [ -f /app/config/tailwind.config.js ]; then
        echo "📋 Copying tailwind.config.js from /config/ (fallback)..."
        cp /app/config/tailwind.config.js /app/tailwind.config.js
    fi
fi

echo "✅ Config files ready"
echo "🚀 Building production version..."

# Build the production version and check if it succeeded
if npm run build; then
    # Verify that index.html was created
    if [ -f /app/build/index.html ]; then
echo "✅ Production build complete"
echo "🚀 Starting production server..."

# Serve the production build with SPA mode enabled
# -s flag enables single-page application mode (serves index.html for all routes)
# -l sets the port
npx serve -s build -l 3000
    else
        echo "❌ Build failed: index.html not found in build directory"
        echo "📋 Build directory contents:"
        ls -la /app/build/ || echo "Build directory does not exist"
        exit 1
    fi
else
    echo "❌ Build failed with exit code $?"
    exit 1
fi

