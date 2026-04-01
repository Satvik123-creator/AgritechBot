# AnaajAI Backend - Production Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Requirements](#vps-requirements)
3. [Initial Setup](#initial-setup)
4. [Domain & DNS Configuration](#domain--dns-configuration)
5. [Deployment Steps](#deployment-steps)
6. [SSL Certificate Setup](#ssl-certificate-setup)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Scaling Guide](#scaling-guide)

---

## Prerequisites

### Required Access
- ✅ Hostinger VPS with SSH access
- ✅ Domain name (for SSL/HTTPS)
- ✅ GitHub repository access
- ✅ API Keys:
  - Gemini API (Google AI Studio)
  - Sarvam AI API
  - Razorpay (optional, for payments)

### Local Machine Requirements
- Git
- SSH client
- Text editor

---

## VPS Requirements

### Minimum Specifications (Recommended)
- **CPU**: 2 vCores
- **RAM**: 4 GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS or Debian 11+
- **Network**: Public IP address

### Why These Specs?
- Backend API + MongoDB + Redis + ChromaDB
- Docker containers overhead
- Room for logs and backups
- Production workload handling

---

## Initial Setup

### Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
```

### Step 2: Create Non-Root User (Security Best Practice)

```bash
# Create user
adduser anaaj
usermod -aG sudo anaaj

# Setup SSH key for new user
mkdir -p /home/anaaj/.ssh
cp ~/.ssh/authorized_keys /home/anaaj/.ssh/
chown -R anaaj:anaaj /home/anaaj/.ssh
chmod 700 /home/anaaj/.ssh
chmod 600 /home/anaaj/.ssh/authorized_keys

# Test connection (from local machine)
ssh anaaj@your-vps-ip
```

### Step 3: Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget htop ufw
```

### Step 4: Install Docker

```bash
# Clone repository
git clone https://github.com/yourusername/anaaj-ai.git /tmp/anaaj-ai
cd /tmp/anaaj-ai/Backend/deployment

# Make scripts executable
chmod +x *.sh

# Install Docker
sudo ./install-docker.sh

# Verify installation
docker --version
docker compose version
```

### Step 5: Configure Firewall

```bash
sudo ./firewall-setup.sh

# Firewall will allow:
# - SSH (port 22)
# - HTTP (port 80)
# - HTTPS (port 443)
```

---

## Domain & DNS Configuration

### Step 1: Point Domain to VPS

In your domain registrar (Hostinger, Namecheap, etc.), create DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `your-vps-ip` | 3600 |
| A | www | `your-vps-ip` | 3600 |
| A | api | `your-vps-ip` | 3600 |

### Step 2: Wait for DNS Propagation

```bash
# Check DNS propagation (run from local machine)
nslookup your-domain.com
dig your-domain.com

# Should show your VPS IP
```

---

## Deployment Steps

### Step 1: Prepare Environment

```bash
# Set environment variables for deployment
export DEPLOY_DIR=/opt/anaaj-ai
export REPO_URL=https://github.com/yourusername/anaaj-ai.git
export BRANCH=main

# Create deployment directory
sudo mkdir -p $DEPLOY_DIR
sudo chown -R $USER:$USER $DEPLOY_DIR
```

### Step 2: Configure Production Environment

```bash
cd /tmp/anaaj-ai/Backend

# Copy production environment template
cp .env.production $DEPLOY_DIR/Backend/.env

# Edit environment file with your values
nano $DEPLOY_DIR/Backend/.env
```

**Critical Environment Variables to Update:**

```bash
# Generate strong JWT secret (48+ characters)
openssl rand -base64 48

# Generate Redis password
openssl rand -hex 32

# Generate MongoDB password
openssl rand -hex 32
```

Update `.env` with:
- `JWT_SECRET` - Generated secret (48+ chars)
- `MONGO_ROOT_PASSWORD` - Generated password
- `REDIS_PASSWORD` - Generated password
- `GEMINI_API_KEY` - Your Gemini API key
- `SARVAM_API_KEY` - Your Sarvam API key
- `CORS_ORIGINS` - Your frontend domain(s)
- `PUBLIC_WEBSITE_URL` - Your website URL

### Step 3: Update Docker Compose for Production

```bash
cd $DEPLOY_DIR/Backend

# Edit docker-compose.prod.yml
nano docker-compose.prod.yml
```

Update MongoDB URI to include authentication:
```yaml
services:
  app:
    environment:
      - MONGODB_URI=mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb:27017/anaaj-ai-prod?authSource=admin
```

### Step 4: Deploy Backend

```bash
cd /tmp/anaaj-ai/Backend/deployment

# Deploy application
./deploy-backend.sh

# This will:
# - Clone repository to /opt/anaaj-ai
# - Build Docker images
# - Start all services (MongoDB, Redis, ChromaDB, Backend)
# - Run health checks
```

### Step 5: Verify Deployment

```bash
# Check container status
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml ps

# Check logs
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml logs -f app

# Test health endpoint
curl http://localhost:4000/health

# Expected response:
# {"status":"ok","timestamp":"...","services":{...}}
```

---

## SSL Certificate Setup

### Option 1: Using Certbot (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Install Nginx
sudo apt install -y nginx

# Copy Nginx configuration
sudo cp /tmp/anaaj-ai/Backend/deployment/nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp /tmp/anaaj-ai/Backend/deployment/nginx/anaaj-ai.conf /etc/nginx/sites-available/anaaj-ai

# Update domain in configuration
sudo nano /etc/nginx/sites-available/anaaj-ai
# Replace 'your-domain.com' with your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/anaaj-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will:
# - Verify domain ownership
# - Install SSL certificate
# - Configure automatic renewal
```

### Option 2: Using Docker Compose with Certbot

Add to `docker-compose.prod.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./deployment/nginx/anaaj-ai.conf:/etc/nginx/conf.d/default.conf:ro
      - certbot-conf:/etc/letsencrypt
      - certbot-www:/var/www/certbot
    depends_on:
      - app
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-conf:/etc/letsencrypt
      - certbot-www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  certbot-conf:
  certbot-www:
```

---

## Post-Deployment

### 1. Setup Automated Backups

```bash
# Copy backup scripts
sudo cp /tmp/anaaj-ai/Backend/deployment/backup.sh /usr/local/bin/
sudo cp /tmp/anaaj-ai/Backend/deployment/restore.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup.sh /usr/local/bin/restore.sh

# Create backup directory
sudo mkdir -p /opt/anaaj-ai/backups

# Setup cron job for daily backups (3 AM)
sudo crontab -e

# Add this line:
0 3 * * * /usr/local/bin/backup.sh >> /var/log/anaaj-backup.log 2>&1
```

### 2. Setup Health Monitoring

```bash
# Copy monitoring script
sudo cp /tmp/anaaj-ai/Backend/deployment/health-check.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/health-check.sh

# Test monitoring
/usr/local/bin/health-check.sh

# Setup cron job for monitoring (every 5 minutes)
crontab -e

# Add this line:
*/5 * * * * /usr/local/bin/health-check.sh
```

### 3. Configure Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/anaaj-ai
```

Add:
```
/var/log/anaaj-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
```

### 4. Setup Process Monitoring (Optional)

```bash
# Install PM2 (alternative to Docker restart policies)
npm install -g pm2

# Or use systemd service
sudo nano /etc/systemd/system/anaaj-backend.service
```

---

## Monitoring & Maintenance

### Daily Tasks

**Check Health:**
```bash
curl https://your-domain.com/health
```

**Check Logs:**
```bash
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml logs -f app --tail=100
```

**Check Resource Usage:**
```bash
docker stats
htop
df -h
```

### Weekly Tasks

**Review Logs:**
```bash
grep ERROR /var/log/anaaj-*.log
```

**Check Backups:**
```bash
ls -lh /opt/anaaj-ai/backups/
```

**Update System:**
```bash
sudo apt update && sudo apt upgrade -y
```

### Monthly Tasks

**Review and Rotate Logs:**
```bash
sudo logrotate -f /etc/logrotate.conf
```

**Check Disk Space:**
```bash
du -sh /opt/anaaj-ai/*
docker system df
docker system prune -f
```

**Test Restore Procedure:**
```bash
# Restore to test environment
/usr/local/bin/restore.sh YYYYMMDD_HHMMSS
```

---

## Troubleshooting

### Issue: Backend Not Starting

**Check Logs:**
```bash
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml logs app
```

**Common Causes:**
1. Invalid environment variables
2. MongoDB connection failure
3. Port already in use
4. Insufficient resources

**Solution:**
```bash
# Validate .env file
cat /opt/anaaj-ai/Backend/.env

# Check MongoDB logs
docker compose logs mongodb

# Check port usage
sudo netstat -tlnp | grep 4000

# Restart services
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml restart
```

### Issue: SSL Certificate Error

**Check Certificate:**
```bash
sudo certbot certificates
```

**Renew Certificate:**
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

### Issue: High Memory Usage

**Check Container Stats:**
```bash
docker stats
```

**Solution:**
```bash
# Restart specific service
docker compose restart app

# Or scale workers down
docker compose scale app=1
```

### Issue: Database Connection Error

**Check MongoDB:**
```bash
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

**Solution:**
```bash
# Restart MongoDB
docker compose restart mongodb

# Check MongoDB logs
docker compose logs mongodb
```

---

## Scaling Guide

### Vertical Scaling (Upgrade VPS)

**When to Scale:**
- CPU usage consistently > 80%
- Memory usage > 85%
- High response times (> 500ms p95)

**How to Scale:**
1. Create backup
2. Upgrade VPS plan in Hostinger panel
3. Restart services

### Horizontal Scaling (Multiple Workers)

**Update docker-compose.prod.yml:**
```yaml
services:
  app:
    deploy:
      replicas: 3  # Increase from 2
```

**Apply:**
```bash
docker compose -f docker-compose.prod.yml up -d --scale app=3
```

### Database Scaling

**MongoDB:**
- Upgrade to MongoDB Atlas (managed)
- Setup replica set
- Enable sharding

**Redis:**
- Upgrade to Redis Cloud (managed)
- Setup Redis Sentinel
- Enable clustering

---

## Quick Reference Commands

### Deployment
```bash
# Deploy fresh installation
./deploy-backend.sh

# Update existing deployment
./update-backend.sh

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml down
```

### Monitoring
```bash
# Check health
curl http://localhost:4000/health

# View logs
docker compose logs -f app

# Check resources
docker stats
```

### Backup & Restore
```bash
# Create backup
/usr/local/bin/backup.sh

# List backups
ls -lh /opt/anaaj-ai/backups/

# Restore backup
/usr/local/bin/restore.sh YYYYMMDD_HHMMSS
```

### Maintenance
```bash
# Update code
cd /opt/anaaj-ai/Backend && git pull

# Rebuild containers
docker compose build --no-cache

# Clean up Docker
docker system prune -af
```

---

## Security Checklist

- [ ] Strong passwords (32+ characters) for all services
- [ ] JWT_SECRET is 48+ characters
- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication only
- [ ] SSL/HTTPS enabled
- [ ] CORS properly configured
- [ ] .env file has 600 permissions
- [ ] Regular backups enabled
- [ ] Monitoring enabled
- [ ] Log rotation configured
- [ ] System updates automated

---

## Support & Resources

- **Documentation**: `/opt/anaaj-ai/Backend/README.md`
- **API Docs**: `https://your-domain.com/docs`
- **Health Check**: `https://your-domain.com/health`
- **Logs**: `/var/log/anaaj-*.log`

---

## Deployment Checklist

### Pre-Deployment
- [ ] VPS provisioned and accessible
- [ ] Domain DNS configured
- [ ] API keys obtained (Gemini, Sarvam)
- [ ] .env file configured with production values
- [ ] Docker installed
- [ ] Firewall configured

### Deployment
- [ ] Backend deployed successfully
- [ ] Health check returns 200 OK
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] HTTPS redirects working
- [ ] API accessible via domain

### Post-Deployment
- [ ] Automated backups configured
- [ ] Health monitoring enabled
- [ ] Log rotation configured
- [ ] Security hardening complete
- [ ] Documentation reviewed
- [ ] Team trained on operations

---

**🎉 Congratulations! Your AnaajAI Backend is now production-ready!**
