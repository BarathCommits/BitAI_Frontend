# 🚀 BitAI Frontend

> Web3 Browser with Hybrid AI and Wallet-Only Authentication

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Features](#features)
- [Development](#development)
- [Docker Deployment](#docker-deployment)
- [Documentation](#documentation)
- [Testing](#testing)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for containerized deployment)
- MetaMask or compatible Web3 wallet

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm start

# Access at http://localhost:3000
```

### Docker Development
```bash
# Start with hot reload
docker-compose -f docker/docker-compose.yml up frontend

# Access at http://localhost:3001
```

### Docker Production
```bash
# Build and start production
docker-compose -f docker/docker-compose.prod.yml up -d frontend-prod

# Access at http://localhost
```

---

## 📁 Project Structure

```
BitAI_Frontend/
├── 📱 src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components (Header, Footer, Sidebar)
│   │   ├── ui/          # UI primitives (Button, Card, Input)
│   │   ├── vault/       # Vault-specific components
│   │   └── wallet/      # Wallet connection components
│   ├── config/          # ✨ Centralized configuration
│   │   └── api.ts       # API endpoints & settings
│   ├── constants/       # ✨ Application constants
│   │   └── storage.ts   # LocalStorage keys
│   ├── hooks/           # React custom hooks
│   ├── pages/           # Page components (lazy-loaded)
│   ├── services/        # API services & business logic
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript type definitions
│   └── utils/           # ✨ Utility functions
│       ├── logger.ts    # Production-safe logger
│       ├── apiInterceptor.ts  # 401 error handling
│       └── authDebugger.ts    # Auth debugging tools
├── 🐳 docker/
│   ├── Dockerfile           # Development
│   ├── Dockerfile.prod      # Production (multi-stage)
│   ├── docker-compose.yml   # Development compose
│   ├── docker-compose.prod.yml  # Production compose
│   └── nginx.conf           # Production Nginx config
├── 📚 docs/
│   ├── deployment/      # Deployment guides
│   ├── optimization/    # Optimization reports
│   ├── troubleshooting/ # Problem-solving guides
│   ├── architecture/    # Architecture docs
│   ├── api/             # API documentation
│   └── features/        # Feature documentation
├── 🔧 config/           # Build configuration
│   ├── config-overrides.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
└── 📜 scripts/          # Utility scripts
    ├── docker-test.sh   # Automated testing
    └── setup-env.sh     # Environment setup
```

---

## ✨ Features

### 🔐 Wallet-Only Authentication
- **No passwords** - Your wallet is your identity
- MetaMask, WalletConnect, Phantom support
- JWT token-based session management
- Automatic token expiration handling

### 🔒 Personal Vault
- Encrypted data storage
- QR code generation
- Secure backup & restore
- Wallet-based encryption

### 🤖 AI Chat Integration
- Multi-provider AI support (Gemini, Claude, Cohere, HuggingFace)
- Context-aware responses
- dApp interaction suggestions
- Wallet balance integration

### 🏪 dApp Store
- Browse and connect to Web3 dApps
- AI-powered recommendations
- One-click dApp integration

### 📊 Portfolio Management
- Multi-chain wallet tracking
- Real-time balance updates
- Transaction history
- Performance analytics

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm start              # Start dev server
npm run build          # Build for production
npm test              # Run tests
npm run type-check    # TypeScript type checking

# Code Quality
npm run lint          # Check code style
npm run lint:fix      # Fix code style issues
npm run format        # Format code with Prettier
npm run format:check  # Check formatting

# Docker
npm run docker:build  # Build Docker image
npm run docker:dev    # Start development container
npm run docker:prod   # Start production container
```

### Environment Variables

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_AUTH_URL=http://localhost:3000/api/auth
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_DEFAULT_CHAIN_ID=1
REACT_APP_DEBUG=true
```

---

## 🐳 Docker Deployment

### Development Mode
```bash
# Start with hot reload
docker-compose -f docker/docker-compose.yml up frontend

# Features:
# ✅ Hot reload
# ✅ Source maps
# ✅ Debug logs
# ✅ Volume mounts
```

### Production Mode
```bash
# Build and deploy
docker-compose -f docker/docker-compose.prod.yml up -d frontend-prod

# Features:
# ✅ 50MB optimized image
# ✅ Nginx with gzip
# ✅ Security headers
# ✅ 1-year asset caching
# ✅ Health check endpoint
```

### Test Production Build
```bash
./scripts/docker-test.sh

# Automated tests:
# ✅ Build verification
# ✅ Health checks
# ✅ Image size
# ✅ Gzip compression
# ✅ Security headers
```

---

## 📚 Documentation

### Quick Links
- **[Docker Deployment Guide](docs/deployment/DOCKER_DEPLOYMENT_GUIDE.md)** - Complete Docker setup
- **[Optimization Report](docs/optimization/OPTIMIZATION_PROGRESS.md)** - Performance improvements
- **[Wallet Auth Migration](docs/deployment/WALLET_AUTH_MIGRATION_COMPLETE.md)** - Authentication guide
- **[Troubleshooting 403](docs/troubleshooting/TROUBLESHOOTING_403.md)** - Common issues

### Architecture
- [Frontend Architecture](docs/architecture/frontend-architecture.md)
- [Component Architecture](docs/architecture/component-architecture.md)
- [API Integration](docs/api/backend-integration.md)

### Features
- [AI Chat Integration](docs/features/ai-chat.md)
- [Wallet Setup](docs/WALLET_SETUP_COMPLETE.md)
- [Personal Vault](docs/api/personal-vault.md)

---

## 🧪 Testing

### Manual Testing
```bash
# Start development server
npm start

# Test wallet connection at /auth
# Test vault at /vault
# Test AI chat at /chat
```

### Docker Testing
```bash
# Run full test suite
./scripts/docker-test.sh

# Manual production test
docker-compose -f docker/docker-compose.prod.yml up frontend-prod
curl http://localhost/health
```

### Debugging Tools
```javascript
// Open browser console (F12)
debugAuth()              // Check auth status
clearAuthAndReconnect()  // Reset auth
isValidWalletToken()     // Validate token
```

---

## 📊 Performance

### Metrics
- **Initial Bundle**: 500KB (down from 800KB)
- **Code Splitting**: All pages lazy-loaded
- **Docker Image**: 50MB production (vs 800MB dev)
- **First Contentful Paint**: +30% faster
- **Lighthouse Score**: 90+

### Optimizations
✅ Code splitting with React.lazy()  
✅ Production-safe logger (no debug logs)  
✅ Gzip compression (Nginx)  
✅ 1-year static asset caching  
✅ Error boundaries on all routes  
✅ Centralized API configuration  

---

## 🔐 Security

### Features
- Wallet-only authentication (no passwords)
- JWT token-based sessions
- Automatic token expiration handling
- Production logger (no sensitive data in logs)
- Security headers (XSS, Frame, Content-Type)
- CORS configuration
- Input sanitization

### Best Practices
- Never commit `.env` files
- Use backend proxy for AI API keys
- Token stored in httpOnly cookies (future)
- Regular dependency updates
- Security headers in Nginx

---

## 🤝 Contributing

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component documentation

### Development Flow
1. Create feature branch
2. Make changes
3. Run `npm run lint && npm run type-check`
4. Test locally
5. Create pull request

---

## 📝 License

[Your License Here]

---

## 🎯 Roadmap

- [ ] Unit tests with Jest
- [ ] E2E tests with Playwright
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Analytics integration
- [ ] Multi-language support
- [ ] Mobile responsive improvements

---

## 🆘 Support

### Common Issues
- **403 Error**: See [Troubleshooting 403](docs/troubleshooting/TROUBLESHOOTING_403.md)
- **Wallet Connection**: Check MetaMask is installed
- **Build Errors**: Clear `node_modules` and reinstall

### Get Help
- Check documentation in `docs/`
- Run `debugAuth()` in browser console
- Check Docker logs: `docker-compose logs -f`

---

## 🎉 Quick Start Checklist

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Update environment variables
- [ ] Run `npm start` or Docker
- [ ] Connect MetaMask wallet
- [ ] Test all features
- [ ] Read documentation
- [ ] Deploy! 🚀

---

**Built with ❤️ using React, TypeScript, TailwindCSS, and Web3**
