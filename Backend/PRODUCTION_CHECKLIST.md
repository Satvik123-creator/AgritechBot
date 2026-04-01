# 🎯 Production Readiness Checklist

Use this checklist to verify your AnaajAI backend is production-ready before launch.

---

## 📋 Pre-Deployment

### Infrastructure
- [ ] VPS provisioned (min 4GB RAM, 2 vCPU, 50GB storage)
- [ ] Ubuntu 22.04 LTS installed
- [ ] SSH access configured
- [ ] Domain purchased and accessible
- [ ] DNS A records pointing to VPS IP
- [ ] DNS propagation verified (`nslookup your-domain.com`)

### API Keys & Services
- [ ] Gemini API key obtained from https://makersuite.google.com/app/apikey
- [ ] Sarvam AI API key obtained from https://www.sarvam.ai/
- [ ] Razorpay keys (if payments enabled)
- [ ] MongoDB Atlas (or using Docker MongoDB)
- [ ] Redis instance (or using Docker Redis)

### Local Setup
- [ ] Repository cloned
- [ ] Deployment scripts reviewed
- [ ] Environment template prepared

---

## 🔐 Security

### Secrets Generation
- [ ] JWT_SECRET generated (48+ characters)
  ```bash
  openssl rand -base64 48
  ```
- [ ] MongoDB root password generated (32+ characters)
  ```bash
  openssl rand -hex 32
  ```
- [ ] Redis password generated (32+ characters)
  ```bash
  openssl rand -hex 32
  ```
- [ ] All secrets documented securely (password manager)

### SSH Hardening
- [ ] Root login disabled (`PermitRootLogin no`)
- [ ] Password authentication disabled
- [ ] SSH keys configured
- [ ] Non-root user created
- [ ] Sudo access configured for non-root user

### Firewall
- [ ] UFW installed and enabled
- [ ] SSH port allowed (22)
- [ ] HTTP port allowed (80)
- [ ] HTTPS port allowed (443)
- [ ] All other ports denied by default
- [ ] Firewall rules verified (`sudo ufw status`)

### Application Security
- [ ] CORS_ORIGINS configured with actual domains (not *)
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] Input validation with Zod
- [ ] .env file permissions set to 600
- [ ] .env* files in .gitignore

---

## 🐳 Docker Setup

### Docker Installation
- [ ] Docker Engine installed
- [ ] Docker Compose plugin installed
- [ ] Docker service running
- [ ] User added to docker group
- [ ] Docker daemon configured for production

### Container Configuration
- [ ] docker-compose.prod.yml reviewed
- [ ] Resource limits set (memory, CPU)
- [ ] Health checks configured
- [ ] Restart policies set to `unless-stopped`
- [ ] Logging drivers configured (max-size, max-file)
- [ ] Non-root user in Dockerfile

---

## ⚙️ Environment Configuration

### Required Variables (.env)
- [ ] `NODE_ENV=production`
- [ ] `PORT=4000`
- [ ] `MONGODB_URI` (with authentication)
- [ ] `MONGO_ROOT_USER`
- [ ] `MONGO_ROOT_PASSWORD`
- [ ] `REDIS_ENABLED=true`
- [ ] `REDIS_HOST=redis`
- [ ] `REDIS_PASSWORD`
- [ ] `JWT_SECRET` (48+ chars)
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `GEMINI_API_KEY`
- [ ] `SARVAM_API_KEY`
- [ ] `CORS_ORIGINS` (actual frontend domains)
- [ ] `PUBLIC_WEBSITE_URL`
- [ ] `CHROMA_URL=http://chromadb:8000`

### Optional Variables
- [ ] `PAYMENTS_ENABLED` (if using Razorpay)
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `RAZORPAY_WEBHOOK_SECRET`
- [ ] `LOG_LEVEL=info`
- [ ] `CLUSTER_WORKERS=0` (auto-detect)

### Validation
- [ ] Environment variables validated
- [ ] No `<REPLACE>` placeholders remaining
- [ ] No localhost URLs in production settings
- [ ] All API keys tested

---

## 🚀 Deployment

### Initial Deployment
- [ ] Repository cloned to `/opt/anaaj-ai`
- [ ] Deployment scripts executable (`chmod +x *.sh`)
- [ ] Docker images built successfully
- [ ] MongoDB container running
- [ ] Redis container running
- [ ] ChromaDB container running
- [ ] Backend app container running
- [ ] All containers healthy
- [ ] Health endpoint responding (http://localhost:4000/health)

### Network Configuration
- [ ] Nginx installed
- [ ] Nginx configuration copied
- [ ] Domain name updated in Nginx config
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx service running
- [ ] Port 80 accessible from internet
- [ ] HTTP to HTTPS redirect working

---

## 🔒 SSL/TLS

### Certificate Setup
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] Certificate auto-renewal configured
- [ ] HTTPS working (https://your-domain.com)
- [ ] Mixed content warnings resolved
- [ ] SSL Labs test passed (A or A+)
  ```
  https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
  ```

### Security Headers
- [ ] Strict-Transport-Security header present
- [ ] X-Frame-Options header present
- [ ] X-Content-Type-Options header present
- [ ] X-XSS-Protection header present
- [ ] Referrer-Policy header present
- [ ] Security headers verified
  ```bash
  curl -I https://your-domain.com/health
  ```

---

## 📊 Monitoring & Logging

### Health Checks
- [ ] Health endpoint accessible
- [ ] Health monitoring script installed
- [ ] Cron job configured (every 5 minutes)
- [ ] Alert webhook/email configured (optional)
- [ ] Health logs being written

### Application Logging
- [ ] Log rotation configured
- [ ] Docker logging limits set
- [ ] Log files accessible
- [ ] No sensitive data in logs
- [ ] Log aggregation configured (optional)

### System Monitoring
- [ ] Disk usage monitoring
- [ ] Memory usage monitoring
- [ ] CPU usage monitoring
- [ ] Container stats accessible
- [ ] Resource alerts configured (optional)

---

## 💾 Backup & Recovery

### Backup Setup
- [ ] Backup scripts installed (`backup.sh`, `restore.sh`)
- [ ] Backup directory created (`/opt/anaaj-ai/backups`)
- [ ] Automated daily backups configured (cron)
- [ ] Backup retention policy set (keep last 10)
- [ ] Backup verification tested

### Backup Validation
- [ ] MongoDB backup tested
- [ ] Redis backup tested
- [ ] Application files backup tested
- [ ] Restore procedure documented
- [ ] Restore tested on staging environment

### Disaster Recovery
- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined
- [ ] Runbook for disaster recovery created
- [ ] Team trained on recovery procedures

---

## 🧪 Testing

### API Testing
- [ ] Health endpoint returns 200 OK
  ```bash
  curl https://your-domain.com/health
  ```
- [ ] Auth endpoints working (OTP request/verify)
- [ ] Protected endpoints require authentication
- [ ] Rate limiting working
- [ ] CORS headers correct for frontend domain

### Load Testing
- [ ] Smoke test passed (`npm run loadtest:smoke`)
- [ ] Load test passed (`npm run loadtest`)
- [ ] Stress test results reviewed
- [ ] Performance benchmarks met
- [ ] Resource usage acceptable under load

### Integration Testing
- [ ] Mobile app can connect
- [ ] Website can connect
- [ ] All API endpoints functional
- [ ] WebSocket connections working (if applicable)
- [ ] File uploads working
- [ ] Voice features working (STT/TTS)

---

## 📈 Performance

### Database Optimization
- [ ] MongoDB indexes created
- [ ] Query performance acceptable
- [ ] Connection pooling configured
- [ ] Slow query logging enabled

### Caching
- [ ] Redis connected and working
- [ ] Cache hit rate monitored
- [ ] Cache TTL configured appropriately
- [ ] Cache invalidation working

### Application Performance
- [ ] Response times < 200ms (p95)
- [ ] No memory leaks detected
- [ ] Cluster mode working (if enabled)
- [ ] Worker queue processing

---

## 🔍 Final Verification

### Security Audit
- [ ] No hardcoded secrets in code
- [ ] Environment variables secured
- [ ] Firewall rules verified
- [ ] Fail2Ban configured (optional)
- [ ] Security headers validated
- [ ] OWASP Top 10 checklist reviewed

### Documentation
- [ ] DEPLOYMENT.md reviewed
- [ ] OPERATIONS_RUNBOOK.md reviewed
- [ ] SECURITY.md reviewed
- [ ] Team trained on operations
- [ ] Incident response plan documented

### Compliance
- [ ] Data privacy requirements met
- [ ] Logging compliant with regulations
- [ ] Backup retention policies compliant
- [ ] Security policies documented

### Business Readiness
- [ ] Scaling plan documented
- [ ] Cost monitoring configured
- [ ] SLA defined
- [ ] Support process defined
- [ ] Escalation path documented

---

## 🎉 Go-Live

### Pre-Launch
- [ ] All checklist items above completed
- [ ] Stakeholders notified
- [ ] Maintenance window scheduled (if needed)
- [ ] Rollback plan ready
- [ ] Monitoring dashboard open
- [ ] Team on standby

### Launch
- [ ] DNS switched to production
- [ ] Frontend deployed and pointing to backend
- [ ] Mobile app updated with production API URL
- [ ] First production transaction tested
- [ ] Monitoring confirmed working
- [ ] Backups running

### Post-Launch
- [ ] Monitor logs for 24 hours
- [ ] Check error rates
- [ ] Verify backups successful
- [ ] Review performance metrics
- [ ] Document any issues
- [ ] Celebrate! 🎊

---

## 📝 Sign-Off

### Deployment Team
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Backend Lead: ________________ Date: _______
- [ ] Security Lead: _______________ Date: _______
- [ ] QA Lead: ____________________ Date: _______

### Business Approval
- [ ] Product Manager: _____________ Date: _______
- [ ] CTO/Tech Lead: ______________ Date: _______

---

## 🆘 Emergency Contacts

**On-Call Engineer**: [Name] - [Phone/Email]  
**Hosting Support**: Hostinger - https://www.hostinger.com/cpanel-login  
**DNS Provider**: [Provider] - [Support Link]

---

## 📚 Resources

- **Deployment Guide**: `DEPLOYMENT.md`
- **Operations Runbook**: `OPERATIONS_RUNBOOK.md`
- **Security Guide**: `SECURITY.md`
- **Quick Start**: `QUICKSTART.md`
- **API Documentation**: https://your-domain.com/docs

---

**Checklist Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date + 3 months]

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Current Status**: ___________

**Deployment Date**: ___________

**Notes**:
```
[Add any deployment-specific notes here]
```
