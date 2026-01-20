# Frontend Dev Deployment Guide

## Overview

This guide explains how to deploy the BitAI Frontend to the development server separately from the backend.

## Prerequisites

1. **GitLab CI/CD Variables** (in Frontend repository):
   - `DEV_CLOUD_HOST` - Dev server IP (e.g., `46.224.177.202`)
   - `DEV_SSH_USER` - SSH user (e.g., `root`)
   - `DEV_SSH_PRIVATE_KEY` - SSH private key for server access
   - `CI_REGISTRY_USER` - GitLab registry username
   - `CI_REGISTRY_PASSWORD` - GitLab registry password

2. **Backend must be running**:
   - API Gateway on port 8080
   - `bitai-network` Docker network must exist

## Deployment Process

### Automatic Deployment (CI/CD)

1. Push to `dev` branch in frontend repository
2. CI/CD pipeline will:
   - Build Docker image with dev API URLs
   - Push to GitLab Container Registry
   - Deploy to dev server automatically

### Manual Deployment

If you need to deploy manually:

```bash
# On the dev server
cd /opt/bitai-frontend

# Login to registry
docker login -u <registry-user> -p <registry-password> registry.gitlab.com

# Set environment variables
export DOCKER_REGISTRY=registry.gitlab.com/your-group/bitai-frontend
export IMAGE_TAG=<commit-sha>

# Pull and deploy
docker-compose -f .gitlab/docker-compose.dev.yml pull
docker-compose -f .gitlab/docker-compose.dev.yml up -d
```

## Configuration

### API URLs

The frontend is configured to connect to:
- **API Gateway**: `http://46.224.177.202:8080/api/v1`
- **Auth**: `http://46.224.177.202:8080/api/v1/auth`
- **WebSocket**: `ws://46.224.177.202:8080`

These are set during Docker build via build args.

### Network

The frontend connects to the `bitai-network` Docker network, which is shared with the backend services. This allows:
- Frontend to communicate with API Gateway
- All services to be on the same network

### Ports

- **Frontend**: Port 3000 (mapped to container port 80)
- **Backend API Gateway**: Port 8080

## Health Check

The frontend exposes a health endpoint:
```bash
curl http://46.224.177.202:3000/health
```

Should return: `{"status":"healthy"}`

## Troubleshooting

### Frontend can't connect to backend

1. Check if `bitai-network` exists:
   ```bash
   docker network ls | grep bitai-network
   ```

2. If it doesn't exist, create it:
   ```bash
   docker network create bitai-network
   ```

3. Verify backend containers are on the network:
   ```bash
   docker network inspect bitai-network
   ```

### Container won't start

1. Check logs:
   ```bash
   docker logs bitai_frontend_dev
   ```

2. Verify image exists:
   ```bash
   docker images | grep frontend
   ```

3. Check port availability:
   ```bash
   netstat -tlnp | grep 3000
   ```

## Separate Repositories

✅ **Frontend Repository**: Handles frontend build and deployment
✅ **Backend Repository**: Handles backend services deployment

Both deploy to the same server but maintain separate:
- CI/CD pipelines
- Docker images
- Deployment processes
