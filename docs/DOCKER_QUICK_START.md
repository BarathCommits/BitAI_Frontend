# 🚀 Docker Quick Start

## One Command to Start

```bash
npm run docker:dev
```

That's it! The app will be available at **http://localhost:3001**

---

## What This Does

- Starts the React frontend in Docker
- Enables hot reload (changes reflect immediately)
- Mounts your code as a volume
- Runs on port 3001

---

## Other Useful Commands

| Command | What It Does |
|---------|--------------|
| `npm run docker:dev` | Start frontend (development) |
| `npm run docker:stop` | Stop all Docker services |
| `npm run docker:logs` | View container logs |
| `npm run docker:ai` | Start with AI services |
| `npm run docker:monitoring` | Start with monitoring tools |

---

## Manual Docker Commands

If npm scripts don't work:

```bash
# Start
docker-compose -f docker/docker-compose.yml up frontend

# Stop
docker-compose -f docker/docker-compose.yml down

# View logs
docker-compose -f docker/docker-compose.yml logs -f frontend
```

---

## Troubleshooting

**Port 3001 in use?**
```bash
lsof -ti:3001 | xargs kill -9
```

**Docker not running?**
- Start Docker Desktop
- Or check: `docker ps`

**Need to rebuild?**
```bash
docker-compose -f docker/docker-compose.yml build frontend
```

---

**Ready? Run: `npm run docker:dev`**

