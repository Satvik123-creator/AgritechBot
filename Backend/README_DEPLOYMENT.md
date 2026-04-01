# 🌾 AnaajAI Backend - Production Deployment Guide

> **Production-ready Agritech AI Assistant Backend for Hostinger VPS**

[![Production Ready](https://img.shields.io/badge/Production-Ready-success)](./PRODUCTION_READY.md)
[![Deployment Time](https://img.shields.io/badge/Deployment-30min-blue)](./QUICKSTART.md)
[![Security](https://img.shields.io/badge/Security-Hardened-green)](./SECURITY.md)

---

## 🚀 Quick Start

**Want to deploy in 30 minutes?** → [QUICKSTART.md](./QUICKSTART.md)

**First time deploying?** → [DEPLOYMENT.md](./DEPLOYMENT.md)

**Already deployed?** → [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md)

---

## 📚 Documentation Index

### Deployment Guides
- **[QUICKSTART.md](./QUICKSTART.md)** - Fast 30-minute deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete step-by-step guide (detailed)
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Pre-launch verification checklist
- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** - Overview of production readiness

### Operations & Maintenance
- **[OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md)** - Daily operations, troubleshooting, maintenance
- **[SECURITY.md](./SECURITY.md)** - Security hardening and best practices

### Application Documentation
- **[README.chat.md](./README.chat.md)** - Chat module documentation

---

## 🎯 What This Is

AnaajAI Backend is a production-ready API server for an agriculture AI assistant that helps farmers with:
- 🌱 Crop advice and disease management
- 🤖 AI-powered chat (Gemini + RAG)
- 🎙️ Voice interactions (Sarvam STT/TTS)
- 📊 Knowledge base (agricultural best practices)
- 💬 Session-based conversations
- 🔔 Notifications and alerts

---

## ⚡ Technology Stack

### Backend
- **Framework**: Fastify (Node.js + TypeScript)
- **Language**: TypeScript
- **Runtime**: Node.js 20

### Databases
- **Primary DB**: MongoDB 7
- **Cache/Queue**: Redis 7
- **Vector DB**: ChromaDB (for RAG)

### AI/ML Services
- **LLM**: Google Gemini 2.5 Flash
- **Voice**: Sarvam AI (Indian languages STT/TTS)
- **Context**: Gemini Context Caching

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt (Certbot)
- **Hosting**: Hostinger VPS (Ubuntu 22.04)

---

## 📦 What's Included

### ✅ Production Features

#### High Availability
- Multi-replica deployment (2+ instances)
- Auto-restart on failure
- Health checks every 30 seconds
- Graceful shutdown
- Cluster mode for multi-core CPUs

#### Security
- HTTPS with auto-renewing SSL
- Security headers (HSTS, XSS, CORS)
- Rate limiting (100 req/min per IP)
- Firewall configuration (UFW)
- Non-root Docker containers
- Input validation (Zod)
- JWT authentication

#### Performance
- Redis caching
- Connection pooling
- Nginx reverse proxy
- Resource limits (memory/CPU)
- Query optimization

#### Reliability
- Automated daily backups
- Health monitoring (5-min checks)
- Log rotation
- Docker restart policies
- Rollback procedures
- Zero-downtime updates

#### Observability
- Structured logging (Pino)
- Health endpoints
- Container statistics
- Resource monitoring
- Error tracking

---

## 🏗️ Architecture

```
Internet
  ↓
Nginx (443) - HTTPS/SSL
  ↓
Backend API (4000)
  ├─→ MongoDB (27017) - User data, sessions, messages
  ├─→ Redis (6379) - Cache, queues (BullMQ)
  └─→ ChromaDB (8000) - Vector DB for RAG
```

---

## 🚀 Deployment Overview

### Prerequisites
- Hostinger VPS (4GB RAM, 2 vCPU, 50GB storage)
- Ubuntu 22.04 LTS
- Domain name
- Gemini API key
- Sarvam AI API key

### Deployment Steps

1. **Setup VPS** (5 min)
   - Connect via SSH
   - Update system packages

2. **Install Docker** (5 min)
   - Run `install-docker.sh`

3. **Configure Environment** (5 min)
   - Copy `.env.production` to `.env`
   - Add API keys and secrets

4. **Deploy Backend** (5 min)
   - Run `deploy-backend.sh`

5. **Setup Nginx & SSL** (10 min)
   - Configure reverse proxy
   - Obtain SSL certificate

**Total**: ~30 minutes

### Detailed Guides
- **Quick**: [QUICKSTART.md](./QUICKSTART.md)
- **Detailed**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🔐 Security Highlights

### Network Security
✅ UFW firewall (only SSH, HTTP, HTTPS)  
✅ Nginx reverse proxy with rate limiting  
✅ SSL/TLS encryption (Let's Encrypt)  
✅ Fail2Ban for brute-force protection  

### Application Security
✅ JWT authentication with strong secrets  
✅ CORS whitelisting  
✅ Helmet security headers  
✅ Input validation (Zod)  
✅ Rate limiting (100/min per IP)  

### Infrastructure Security
✅ Non-root Docker containers  
✅ Resource limits  
✅ Restricted file permissions  
✅ SSH key authentication  
✅ Root login disabled  

**Full Security Guide**: [SECURITY.md](./SECURITY.md)

---

## 📊 Monitoring

### Automated
- Health checks every 5 minutes
- Daily backups at 3 AM
- Log rotation
- Security updates (unattended-upgrades)

### Manual (Weekly)
- Review error logs
- Check disk space
- Verify backups
- Monitor resource usage

**Operations Guide**: [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md)

---

## 🛠️ Local Development

### Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start MongoDB, Redis, ChromaDB
docker compose up -d mongodb redis chromadb

# Run in development mode
npm run dev

# Run in production mode (locally)
npm run build
npm start
```

### Available Scripts
```bash
npm run dev              # Development with hot reload
npm run build            # Build TypeScript
npm start                # Start production server
npm run start:cluster    # Start with cluster mode
npm run worker           # Start queue worker
npm run lint             # Run ESLint
npm run seed             # Seed database
npm run kb:ingest        # Ingest knowledge base
npm run loadtest:smoke   # Smoke test
npm run loadtest         # Load test
```

---

## 📋 API Endpoints

### Health & Docs
- `GET /health` - Health check
- `GET /docs` - Swagger API documentation

### Authentication
- `POST /api/v1/auth/request-otp` - Request OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP & login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Chat
- `POST /api/v1/chat/sessions` - Create session
- `GET /api/v1/chat/sessions` - List sessions
- `POST /api/v1/chat/sessions/:id/message` - Send message
- `POST /api/v1/chat/sessions/:id/message/stream` - Stream response
- `GET /api/v1/chat/sessions/:id/messages` - Get history

### Voice
- `POST /api/v1/voice/stt` - Speech to Text
- `POST /api/v1/voice/tts` - Text to Speech

**Full API Docs**: https://your-domain.com/docs

---

## 🔄 Deployment Workflow

### Initial Deployment
```bash
# On VPS
cd /opt/anaaj-ai/Backend/deployment
./deploy-backend.sh
```

### Updates (Zero-Downtime)
```bash
# On VPS
cd /opt/anaaj-ai/Backend/deployment
./update-backend.sh
```

### Rollback
```bash
# On VPS
/usr/local/bin/restore.sh YYYYMMDD_HHMMSS
```

---

## 🆘 Troubleshooting

### Backend not starting?
```bash
docker compose -f docker-compose.prod.yml logs app
```

### Database connection issues?
```bash
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### High memory usage?
```bash
docker stats
```

**Full Troubleshooting Guide**: [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md#-common-issues--solutions)

---

## 📈 Performance

### Targets
- Response time: < 200ms (p95)
- Uptime: 99.9%
- Concurrent users: 1000+
- Requests/second: 100+

### Optimization
- Redis caching
- Database indexing
- Connection pooling
- Cluster workers
- Nginx buffering

---

## 🔧 Configuration

### Environment Variables

**Required**:
- `NODE_ENV` - Environment (production)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - JWT secret (48+ chars)
- `GEMINI_API_KEY` - Google Gemini API key
- `SARVAM_API_KEY` - Sarvam AI API key
- `CORS_ORIGINS` - Allowed frontend domains

**Optional**:
- `PAYMENTS_ENABLED` - Enable Razorpay
- `CLUSTER_WORKERS` - Worker count (0 = auto)
- `LOG_LEVEL` - Logging level

**Template**: [.env.production](./.env.production)

---

## 📁 Project Structure

```
Backend/
├── src/                      # Source code
│   ├── app.ts               # Fastify app setup
│   ├── server.ts            # Server entry point
│   ├── cluster.ts           # Cluster mode
│   ├── config/              # Configuration
│   ├── controllers/         # Route controllers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── middlewares/         # Custom middlewares
│   ├── chat/                # Chat module
│   └── utils/               # Utilities
├── deployment/              # Deployment scripts
│   ├── install-docker.sh
│   ├── deploy-backend.sh
│   ├── update-backend.sh
│   ├── backup.sh
│   ├── restore.sh
│   └── nginx/
├── knowledge/               # Knowledge base (MD files)
├── loadtest/                # Artillery load tests
├── DEPLOYMENT.md            # Deployment guide
├── QUICKSTART.md            # Quick start
├── OPERATIONS_RUNBOOK.md    # Operations guide
├── SECURITY.md              # Security guide
├── PRODUCTION_CHECKLIST.md  # Launch checklist
├── PRODUCTION_READY.md      # Production overview
├── docker-compose.prod.yml  # Production compose
├── Dockerfile               # Production Dockerfile
└── .env.production          # Environment template
```

---

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Authentication (OTP-based)
- [x] Chat with AI (Gemini)
- [x] Voice interactions (Sarvam)
- [x] RAG with knowledge base
- [x] Session management

### Phase 2: Production Ready ✅
- [x] Docker deployment
- [x] SSL/HTTPS
- [x] Monitoring & logging
- [x] Automated backups
- [x] Security hardening
- [x] Documentation

### Phase 3: Scale (Future)
- [ ] Kubernetes deployment
- [ ] Multi-region setup
- [ ] Advanced monitoring (Prometheus/Grafana)
- [ ] CI/CD pipeline
- [ ] Load balancer
- [ ] CDN integration

---

## 🤝 Support

### Documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick deployment
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment
- [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) - Operations
- [SECURITY.md](./SECURITY.md) - Security
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Checklist

### Resources
- **API Docs**: https://your-domain.com/docs
- **Docker**: https://docs.docker.com
- **Fastify**: https://www.fastify.io
- **MongoDB**: https://docs.mongodb.com

---

## 📄 License

[Your License]

---

## 👥 Team

- **Backend Development**: [Your Team]
- **DevOps**: [Your Team]
- **Security**: [Your Team]

---

**Status**: ✅ Production Ready  
**Last Updated**: [Date]  
**Version**: 1.0.0  

---

## 🎉 Ready to Deploy!

Follow [QUICKSTART.md](./QUICKSTART.md) to get your backend live in 30 minutes!

Or dive into [DEPLOYMENT.md](./DEPLOYMENT.md) for a comprehensive guide.

**Good luck with your launch!** 🚀
