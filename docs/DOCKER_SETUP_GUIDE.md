# 🐳 Docker Setup Guide

**Date**: January 2024  
**Status**: Ready to Use

---

## 📋 Prerequisites

1. **Docker** installed and running
   - Check: `docker --version`
   - Check: `docker-compose --version`

2. **Ports Available**:
   - `3001` - Frontend (React app)
   - `8080` - AI Model Server (optional)
   - `6333` - Qdrant Vector DB (optional)
   - `9090` - Prometheus (optional)
   - `3002` - Grafana (optional)

---

## 🚀 Quick Start

### Option 1: Start Frontend Only (Recommended for Development)

```bash
# Navigate to project root
cd /Users/barathnatartajan/BitPorta/BitAI_Frontend

# Start frontend only
docker-compose -f docker/docker-compose.yml up frontend

# Or use npm script
npm run docker:dev
```

**Access**: http://localhost:3001

---

### Option 2: Start Frontend with AI Services

```bash
# Start frontend + AI model server + vector DB
docker-compose -f docker/docker-compose.yml --profile ai-local --profile ai-advanced up -d

# Or use npm script
npm run docker:ai
```

---

### Option 3: Start with Monitoring

```bash
# Start frontend + monitoring (Prometheus + Grafana)
docker-compose -f docker/docker-compose.yml --profile monitoring up -d

# Or use npm script
npm run docker:monitoring
```

**Access**:
- Frontend: http://localhost:3001
- Grafana: http://localhost:3002 (admin/admin123)
- Prometheus: http://localhost:9090

---

## 🔧 Environment Variables

### Quick Setup

1. **Copy environment template** (if needed):
   ```bash
   cp docker/env.example docker/.env
   ```

2. **Edit environment variables** in `docker/.env`:
   - Add your AI API keys (optional)
   - Configure backend URLs
   - Set feature flags

### Required Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8080/api/v1)

### Optional Variables

- AI Provider API Keys (HuggingFace, Gemini, Cohere, Claude)
- Stripe keys (for payments)
- Feature flags

---

## 📊 Available Services

### Core Services

1. **frontend** (Always runs)
   - React development server
   - Hot reload enabled
   - Port: 3001

### Optional Services (Profiles)

2. **ai-model-server** (Profile: `ai-local`)
   - HuggingFace text generation
   - Port: 8080

3. **qdrant** (Profile: `ai-advanced`)
   - Vector database for embeddings
   - Ports: 6333, 6334

4. **prometheus** (Profile: `monitoring`)
   - Metrics collection
   - Port: 9090

5. **grafana** (Profile: `monitoring`)
   - Dashboards and visualization
   - Port: 3002
   - Default: admin/admin123

---

## 🛠️ Common Commands

### Start Services

```bash
# Frontend only
npm run docker:dev

# Frontend + AI services
npm run docker:ai

# Frontend + Monitoring
npm run docker:monitoring

# All services
docker-compose -f docker/docker-compose.yml up -d
```

### Stop Services

```bash
# Stop all services
npm run docker:stop

# Or
docker-compose -f docker/docker-compose.yml down
```

### View Logs

```bash
# All services
npm run docker:logs

# Specific service
docker-compose -f docker/docker-compose.yml logs -f frontend
```

### Rebuild

```bash
# Rebuild frontend
docker-compose -f docker/docker-compose.yml build frontend

# Rebuild and start
docker-compose -f docker/docker-compose.yml up --build frontend
```

---

## 🔍 Troubleshooting

### Port Already in Use

If port 3001 is already in use:

1. **Stop local dev server**:
   ```bash
   # Find process using port 3001
   lsof -ti:3001 | xargs kill -9
   ```

2. **Or change port** in `docker-compose.yml`:
   ```yaml
   ports:
     - "3002:3000"  # Change 3001 to 3002
   ```

### Docker Not Running

```bash
# Check Docker status
docker ps

# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker
```

### Build Errors

```bash
# Clean build
docker-compose -f docker/docker-compose.yml build --no-cache frontend

# Remove old images
docker system prune -a
```

### Volume Mount Issues

If hot reload doesn't work:

1. Check file permissions
2. Ensure Docker has access to project directory
3. Try rebuilding: `docker-compose -f docker/docker-compose.yml up --build`

---

## 📝 Development Workflow

### Recommended Setup

1. **Start Docker frontend**:
   ```bash
   npm run docker:dev
   ```

2. **Access app**: http://localhost:3001

3. **Make changes**: Files are mounted as volumes, changes reflect immediately

4. **View logs**: 
   ```bash
   docker-compose -f docker/docker-compose.yml logs -f frontend
   ```

---

## 🎯 Next Steps

1. **Start Docker**: `npm run docker:dev`
2. **Access app**: http://localhost:3001
3. **Check logs**: `npm run docker:logs`
4. **Stop when done**: `npm run docker:stop`

---

**Status**: ✅ Ready to Use

