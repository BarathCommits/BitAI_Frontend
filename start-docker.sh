#!/bin/bash

# BitAI Frontend - Docker Startup Script
# Simple script to start Docker containers

set -e

echo "🐳 Starting BitAI Frontend Docker containers..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

# Start frontend service
echo "🚀 Starting frontend service..."
docker-compose -f docker/docker-compose.yml up -d frontend

echo ""
echo "✅ Docker containers started!"
echo ""
echo "📱 Frontend available at: http://localhost:3001"
echo ""
echo "📊 Useful commands:"
echo "  - View logs: docker-compose -f docker/docker-compose.yml logs -f frontend"
echo "  - Stop: docker-compose -f docker/docker-compose.yml down"
echo "  - Restart: docker-compose -f docker/docker-compose.yml restart frontend"
echo ""

