#!/bin/bash

# SafeBrowser Docker AI Setup Script
# This script sets up the complete Docker environment with AI capabilities

set -e

echo "🚀 Setting up SafeBrowser Frontend Docker AI Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f "docker/.env" ]; then
    print_status "Creating environment file from template..."
    cp docker/env.example docker/.env
    print_warning "Please edit docker/.env file and add your AI API keys before continuing."
    print_warning "Also configure your backend API URL if it's not running on localhost:3000"
    print_warning "You can get free API keys from:"
    print_warning "  - Hugging Face: https://huggingface.co/settings/tokens"
    print_warning "  - Google Gemini: https://makersuite.google.com/app/apikey"
    print_warning "  - Cohere: https://dashboard.cohere.ai/api-keys"
    print_warning "  - Claude: https://console.anthropic.com/"
    
    read -p "Press Enter to continue after adding your API keys..."
fi

# Build and start frontend
print_status "Building and starting frontend with AI integration..."
docker-compose -f docker/docker-compose.yml up -d frontend

print_success "Frontend service started successfully!"

# Ask if user wants to start AI services
echo ""
print_status "Would you like to start additional AI services?"
echo "1) Local AI Model Server (Hugging Face models)"
echo "2) Vector Database (Qdrant) for embeddings"
echo "3) Monitoring (Prometheus + Grafana)"
echo "4) All AI services"
echo "5) Skip"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_status "Starting AI Model Server..."
        docker-compose -f docker/docker-compose.yml --profile ai-local up -d ai-model-server
        print_success "AI Model Server started on http://localhost:8080"
        ;;
    2)
        print_status "Starting Vector Database..."
        docker-compose -f docker/docker-compose.yml --profile ai-advanced up -d qdrant
        print_success "Qdrant Vector Database started on http://localhost:6333"
        ;;
    3)
        print_status "Starting Monitoring services..."
        docker-compose -f docker/docker-compose.yml --profile monitoring up -d prometheus grafana
        print_success "Monitoring started:"
        print_success "  - Prometheus: http://localhost:9090"
        print_success "  - Grafana: http://localhost:3001 (admin/admin123)"
        ;;
    4)
        print_status "Starting all AI services..."
        docker-compose -f docker/docker-compose.yml --profile ai-local --profile ai-advanced --profile monitoring up -d
        print_success "All AI services started!"
        print_success "  - AI Model Server: http://localhost:8080"
        print_success "  - Qdrant: http://localhost:6333"
        print_success "  - Prometheus: http://localhost:9090"
        print_success "  - Grafana: http://localhost:3001 (admin/admin123)"
        ;;
    5)
        print_status "Skipping additional AI services."
        ;;
    *)
        print_warning "Invalid choice. Skipping additional services."
        ;;
esac

echo ""
print_success "🎉 SafeBrowser Frontend Docker AI Environment is ready!"
echo ""
print_status "Services available:"
print_status "  - Frontend: http://localhost:3001"
print_status "  - AI Model Server: http://localhost:8080 (if enabled)"
print_status "  - Qdrant Vector DB: http://localhost:6333 (if enabled)"
print_status "  - Prometheus: http://localhost:9090 (if enabled)"
print_status "  - Grafana: http://localhost:3002 (if enabled)"
echo ""
print_status "Useful commands:"
print_status "  - View logs: docker-compose -f docker/docker-compose.yml logs -f"
print_status "  - Stop services: docker-compose -f docker/docker-compose.yml down"
print_status "  - Restart: docker-compose -f docker/docker-compose.yml restart"
print_status "  - View all containers: docker ps"
echo ""
print_warning "Remember to:"
print_warning "  1. Configure your AI API keys in docker/.env file"
print_warning "  2. Ensure your backend service is running on the configured URL"
print_warning "  3. Check the browser console for any connection issues"
