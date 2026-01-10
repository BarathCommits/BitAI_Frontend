# 🐳 Quick Docker Start Guide

## Simple Commands to Run

### 1. Check Docker is Running
```bash
docker --version
docker ps
```

### 2. Start Frontend Only (Recommended)
```bash
cd /Users/barathnatartajan/BitPorta/BitAI_Frontend
docker-compose -f docker/docker-compose.yml up frontend
```

**OR use npm script:**
```bash
npm run docker:dev
```

### 3. Access the App
- Open browser: http://localhost:3001

### 4. View Logs (in another terminal)
```bash
docker-compose -f docker/docker-compose.yml logs -f frontend
```

### 5. Stop Docker
```bash
docker-compose -f docker/docker-compose.yml down
```

**OR use npm script:**
```bash
npm run docker:stop
```

---

## Alternative: Use the Startup Script

1. Make script executable (run once):
```bash
chmod +x start-docker.sh
```

2. Run the script:
```bash
./start-docker.sh
```

---

## Troubleshooting

### Port 3001 Already in Use?
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Docker Not Running?
- Start Docker Desktop (macOS/Windows)
- Or: `sudo systemctl start docker` (Linux)

### Rebuild if Needed
```bash
docker-compose -f docker/docker-compose.yml build --no-cache frontend
docker-compose -f docker/docker-compose.yml up frontend
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run docker:dev` | Start frontend only |
| `npm run docker:stop` | Stop all services |
| `npm run docker:logs` | View logs |
| `npm run docker:ai` | Start with AI services |
| `npm run docker:monitoring` | Start with monitoring |

---

**That's it! Just run `npm run docker:dev` to start.**

