# AnaajAI Operations Runbook

## 🚨 Emergency Contacts
- **DevOps Lead**: [Your Name] - [Contact]
- **Backend Team**: [Contact]
- **On-Call Rotation**: [Link to schedule]

---

## 📊 Service Overview

### Architecture
- **Backend API**: Fastify (Node.js + TypeScript)
- **Database**: MongoDB (primary data store)
- **Cache/Queue**: Redis (BullMQ workers)
- **Vector DB**: ChromaDB (RAG/knowledge base)
- **Reverse Proxy**: Nginx (SSL termination)

### Service Dependencies
```
Internet → Nginx (443) → Backend API (4000)
                           ↓
                        MongoDB (27017)
                        Redis (6379)
                        ChromaDB (8000)
```

---

## 🔥 Common Issues & Solutions

### 1. Backend Service Down

**Symptoms:**
- Health endpoint returns 5xx or times out
- API requests failing
- High error rate in logs

**Diagnosis:**
```bash
# Check container status
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml ps

# Check logs
docker compose logs app --tail=100

# Check resource usage
docker stats

# Check process
ps aux | grep node
```

**Solutions:**

**Quick Fix (Restart):**
```bash
cd /opt/anaaj-ai/Backend
docker compose restart app

# Wait for health check
sleep 10
curl http://localhost:4000/health
```

**If restart doesn't help:**
```bash
# Check environment variables
docker compose exec app printenv | grep -E 'MONGODB_URI|REDIS_HOST|NODE_ENV'

# Check MongoDB connectivity
docker compose exec app nc -zv mongodb 27017

# Check Redis connectivity
docker compose exec app nc -zv redis 6379

# Full restart
docker compose down
docker compose up -d
```

---

### 2. High Memory Usage

**Symptoms:**
- OOM (Out of Memory) errors
- Slow response times
- Container restarts

**Diagnosis:**
```bash
# Check memory usage
free -h
docker stats

# Check specific container
docker stats app
```

**Solutions:**

**Immediate:**
```bash
# Restart backend (clears memory)
docker compose restart app

# Scale down workers temporarily
docker compose scale app=1
```

**Long-term:**
```bash
# Update docker-compose.prod.yml memory limits
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G  # Increase from 1G

# Apply changes
docker compose up -d
```

---

### 3. Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- "Authentication failed" errors
- Slow queries

**Diagnosis:**
```bash
# Check MongoDB status
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check connections
docker compose exec mongodb mongosh --eval "db.serverStatus().connections"

# Check database size
docker compose exec mongodb mongosh --eval "db.stats()"
```

**Solutions:**

**Connection Issues:**
```bash
# Restart MongoDB
docker compose restart mongodb

# Check MongoDB logs
docker compose logs mongodb --tail=100

# Verify credentials
docker compose exec app printenv | grep MONGODB_URI
```

**Performance Issues:**
```bash
# Check slow queries (inside MongoDB)
docker compose exec mongodb mongosh

use anaaj-ai-prod
db.setProfilingLevel(2, {slowms: 100})
db.system.profile.find().sort({ts: -1}).limit(10).pretty()

# Create missing indexes
db.users.createIndex({email: 1}, {unique: true})
db.sessions.createIndex({farmerId: 1, createdAt: -1})
```

---

### 4. SSL Certificate Issues

**Symptoms:**
- HTTPS not working
- Certificate expired warnings
- NET::ERR_CERT_AUTHORITY_INVALID

**Diagnosis:**
```bash
# Check certificate expiry
sudo certbot certificates

# Check Nginx configuration
sudo nginx -t

# Check certificate files
sudo ls -la /etc/letsencrypt/live/your-domain.com/
```

**Solutions:**

**Expired Certificate:**
```bash
# Renew certificate
sudo certbot renew

# Restart Nginx
sudo systemctl restart nginx
```

**Invalid Configuration:**
```bash
# Test Nginx config
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restore working config from backup
sudo cp /etc/nginx/sites-available/anaaj-ai.backup /etc/nginx/sites-available/anaaj-ai
sudo systemctl restart nginx
```

---

### 5. High CPU Usage

**Symptoms:**
- Slow API responses
- High load average
- Container throttling

**Diagnosis:**
```bash
# Check load average
uptime

# Check CPU usage
top
htop

# Check Docker CPU
docker stats
```

**Solutions:**

**Identify bottleneck:**
```bash
# Check which container is consuming CPU
docker stats --no-stream

# Check Node.js processes
docker compose exec app top

# Profile the application (if needed)
docker compose exec app node --prof dist/server.js
```

**Quick fixes:**
```bash
# Restart high-CPU container
docker compose restart app

# Scale workers if needed
docker compose scale app=2

# Check for infinite loops in logs
docker compose logs app | grep -i "error\|warning"
```

---

### 6. Disk Space Full

**Symptoms:**
- "No space left on device" errors
- Can't write logs
- Database writes failing

**Diagnosis:**
```bash
# Check disk usage
df -h

# Find large directories
du -sh /opt/anaaj-ai/* | sort -h
du -sh /var/lib/docker/* | sort -h

# Check Docker volumes
docker system df
```

**Solutions:**

**Clean Docker:**
```bash
# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Full cleanup
docker system prune -a -f --volumes
```

**Clean Logs:**
```bash
# Truncate large log files
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log

# Remove old backups
cd /opt/anaaj-ai/backups
ls -t | tail -n +6 | xargs rm -rf
```

**Clean Application:**
```bash
# Remove old Docker images
docker images | grep anaaj | grep -v latest | awk '{print $3}' | xargs docker rmi -f
```

---

## 🔄 Routine Operations

### Deploy New Version

```bash
cd /opt/anaaj-ai/Backend/deployment
./update-backend.sh

# Monitor deployment
docker compose logs -f app

# Verify health
curl https://your-domain.com/health
```

### Rollback Deployment

```bash
# Find backup timestamp
ls -lt /opt/anaaj-ai/backups/

# Restore backup
/usr/local/bin/restore.sh YYYYMMDD_HHMMSS

# Verify
curl http://localhost:4000/health
```

### Scale Workers

```bash
# Scale up
docker compose -f docker-compose.prod.yml scale app=3

# Scale down
docker compose -f docker-compose.prod.yml scale app=1

# Check status
docker compose ps
```

### Backup Database

```bash
# Manual backup
/usr/local/bin/backup.sh

# Verify backup
ls -lh /opt/anaaj-ai/backups/
```

### Restore Database

```bash
# List available backups
ls -lt /opt/anaaj-ai/backups/ | grep mongodb

# Restore specific backup
/usr/local/bin/restore.sh YYYYMMDD_HHMMSS
```

### Rotate Logs

```bash
# Manual log rotation
sudo logrotate -f /etc/logrotate.d/anaaj-ai

# Check log sizes
du -sh /var/log/nginx/*
du -sh /var/log/anaaj-*.log
```

### Update SSL Certificate

```bash
# Renew certificate
sudo certbot renew

# Force renewal (if expiring soon)
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📈 Performance Tuning

### MongoDB Optimization

```bash
# Connect to MongoDB
docker compose exec mongodb mongosh

# Use production database
use anaaj-ai-prod

# Create indexes for common queries
db.users.createIndex({email: 1}, {unique: true})
db.users.createIndex({phoneNumber: 1})
db.sessions.createIndex({farmerId: 1, createdAt: -1})
db.messages.createIndex({sessionId: 1, createdAt: -1})
db.notifications.createIndex({userId: 1, read: 1})

# Check query performance
db.sessions.find({farmerId: "xyz"}).explain("executionStats")
```

### Redis Optimization

```bash
# Connect to Redis
docker compose exec redis redis-cli

# Check memory usage
INFO memory

# Check key statistics
INFO keyspace

# Clear specific cache (if needed)
KEYS "cache:*"
DEL "cache:specific-key"

# Flush all cache (DANGER!)
# FLUSHALL
```

### Backend Optimization

**Update Environment:**
```bash
# Edit .env
nano /opt/anaaj-ai/Backend/.env

# Increase worker concurrency
QUEUE_CONCURRENCY=50

# Increase cluster workers
CLUSTER_WORKERS=4

# Restart
docker compose restart app
```

---

## 🔍 Monitoring Commands

### Health Checks

```bash
# API health
curl https://your-domain.com/health

# Database health
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis health
docker compose exec redis redis-cli ping

# ChromaDB health
curl http://localhost:8000/api/v1/heartbeat
```

### Log Monitoring

```bash
# Real-time logs
docker compose logs -f app

# Error logs
docker compose logs app | grep -i error

# Last 100 lines
docker compose logs app --tail=100

# Specific time range
docker compose logs --since 30m app
```

### Resource Monitoring

```bash
# All containers
docker stats

# Specific container
docker stats app

# System resources
htop
free -h
df -h
```

---

## 📋 Maintenance Schedule

### Daily
- [ ] Check health endpoints
- [ ] Review error logs
- [ ] Verify backups completed

### Weekly
- [ ] Review application logs
- [ ] Check disk space usage
- [ ] Verify SSL certificate expiry
- [ ] Review monitoring alerts

### Monthly
- [ ] Test backup restoration
- [ ] Update system packages
- [ ] Review and optimize database
- [ ] Clean up old Docker images
- [ ] Review security logs

### Quarterly
- [ ] Perform security audit
- [ ] Review and update documentation
- [ ] Capacity planning review
- [ ] Disaster recovery drill

---

## 🚨 Incident Response

### Severity Levels

**P0 - Critical (Immediate Response)**
- Complete service outage
- Data loss or corruption
- Security breach

**P1 - High (< 1 hour)**
- Partial service degradation
- High error rate (>10%)
- Performance severely impacted

**P2 - Medium (< 4 hours)**
- Minor feature unavailable
- Moderate error rate (1-10%)
- Non-critical bug

**P3 - Low (< 24 hours)**
- Cosmetic issues
- Documentation updates
- Enhancement requests

### Incident Checklist

1. **Acknowledge**
   - [ ] Confirm incident
   - [ ] Notify team
   - [ ] Create incident ticket

2. **Assess**
   - [ ] Check health endpoints
   - [ ] Review logs
   - [ ] Identify affected users

3. **Mitigate**
   - [ ] Apply quick fix
   - [ ] Restore service
   - [ ] Communicate status

4. **Resolve**
   - [ ] Implement permanent fix
   - [ ] Verify resolution
   - [ ] Update documentation

5. **Post-Mortem**
   - [ ] Document timeline
   - [ ] Identify root cause
   - [ ] Create action items

---

## 📞 Escalation Path

1. **On-Call Engineer** (First responder)
   - Attempt standard remediation
   - If unresolved in 30 min → Escalate

2. **Backend Team Lead**
   - Coordinate response
   - Make architectural decisions
   - If needed → Escalate

3. **CTO/Technical Director**
   - Major incidents only
   - Business impact decisions

---

## 🔐 Security Operations

### Security Checklist

```bash
# Check for failed login attempts
docker compose logs app | grep "authentication failed"

# Check for unusual API calls
docker compose logs app | grep "rate limit exceeded"

# Check system users
cat /etc/passwd

# Check SSH attempts
sudo cat /var/log/auth.log | grep "Failed password"

# Check firewall rules
sudo ufw status verbose

# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### Security Incident Response

**If compromised:**
1. Isolate affected systems
2. Change all passwords and secrets
3. Review access logs
4. Restore from known good backup
5. Conduct security audit
6. Update security measures

---

## 📚 Useful Resources

- **API Documentation**: https://your-domain.com/docs
- **Health Dashboard**: https://your-domain.com/health
- **Repository**: https://github.com/yourusername/anaaj-ai
- **Deployment Guide**: `/opt/anaaj-ai/Backend/DEPLOYMENT.md`
- **Docker Docs**: https://docs.docker.com
- **Fastify Docs**: https://www.fastify.io

---

**Last Updated**: [Date]  
**Maintained By**: [Team Name]
