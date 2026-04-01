# Production Deployment - Quick Start Guide

## 🚀 One-Command Deployment

This guide will get your AnaajAI backend deployed to Hostinger VPS in under 30 minutes.

---

## Prerequisites

- [x] Hostinger VPS with Ubuntu 22.04
- [x] SSH access to VPS
- [x] Domain name pointed to VPS IP
- [x] Gemini API key
- [x] Sarvam AI API key

---

## Step 1: Prepare Deployment Scripts

On your **local machine**, navigate to the backend folder and create the deployment directory structure:

```bash
cd "F:\Agency CLients works\AnaajAI\Backend"

# Create deployment directory
mkdir -p deployment\nginx

# The deployment scripts will be created by running the setup utility
```

---

## Step 2: Connect to VPS

```bash
ssh root@your-vps-ip
```

---

## Step 3: Run One-Line Setup

```bash
curl -fsSL https://raw.githubusercontent.com/yourusername/anaaj-ai/main/Backend/deployment/quick-deploy.sh | bash
```

**OR** Manual setup:

```bash
# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y git curl wget

# Clone repository
git clone https://github.com/yourusername/anaaj-ai.git /opt/anaaj-ai-repo
cp -r /opt/anaaj-ai-repo/Backend /opt/anaaj-ai/
cd /opt/anaaj-ai/Backend

# Install Docker
chmod +x deployment/install-docker.sh
./deployment/install-docker.sh

# Configure firewall
chmod +x deployment/firewall-setup.sh
./deployment/firewall-setup.sh
```

---

## Step 4: Configure Environment

```bash
cd /opt/anaaj-ai/Backend

# Copy production environment template
cp .env.production .env

# Generate secrets
echo "JWT_SECRET=$(openssl rand -base64 48)" >> .env.tmp
echo "MONGO_ROOT_PASSWORD=$(openssl rand -hex 32)" >> .env.tmp
echo "REDIS_PASSWORD=$(openssl rand -hex 32)" >> .env.tmp

# Edit .env file
nano .env
```

### Required Environment Variables:

```bash
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb://admin:YOUR_MONGO_PASSWORD@mongodb:27017/anaaj-ai-prod?authSource=admin
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=<GENERATED_ABOVE>

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<GENERATED_ABOVE>

# Authentication
JWT_SECRET=<GENERATED_ABOVE>

# AI APIs
GEMINI_API_KEY=<YOUR_GEMINI_KEY>
SARVAM_API_KEY=<YOUR_SARVAM_KEY>

# CORS (CRITICAL!)
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Other settings
CORS_ORIGINS=https://your-domain.com
PUBLIC_WEBSITE_URL=https://your-domain.com
```

**Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Deploy Backend

```bash
cd /opt/anaaj-ai/Backend/deployment
chmod +x deploy-backend.sh
./deploy-backend.sh
```

This will:
- ✅ Build Docker images
- ✅ Start MongoDB, Redis, ChromaDB
- ✅ Start Backend API
- ✅ Run health checks

---

## Step 6: Install Nginx & SSL

```bash
# Install Nginx
apt install -y nginx

# Copy Nginx config
cp deployment/nginx/nginx.conf /etc/nginx/nginx.conf
cp deployment/nginx/anaaj-ai.conf /etc/nginx/sites-available/anaaj-ai

# Update domain name
nano /etc/nginx/sites-available/anaaj-ai
# Replace 'your-domain.com' with your actual domain

# Enable site
ln -s /etc/nginx/sites-available/anaaj-ai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Step 7: Setup Backups & Monitoring

```bash
# Copy backup scripts
cp deployment/backup.sh /usr/local/bin/
cp deployment/restore.sh /usr/local/bin/
cp deployment/health-check.sh /usr/local/bin/
chmod +x /usr/local/bin/{backup,restore,health-check}.sh

# Setup automated backups (daily at 3 AM)
crontab -e
# Add:
0 3 * * * /usr/local/bin/backup.sh >> /var/log/anaaj-backup.log 2>&1

# Setup health monitoring (every 5 minutes)
# Add:
*/5 * * * * /usr/local/bin/health-check.sh
```

---

## Step 8: Verify Deployment

```bash
# Check container status
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml ps

# Check health endpoint
curl https://your-domain.com/health

# Check API endpoint
curl https://your-domain.com/api/v1/health

# View logs
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml logs -f app
```

---

## 🎉 Done!

Your backend is now live at:
- **API**: https://your-domain.com/api/v1
- **Docs**: https://your-domain.com/docs
- **Health**: https://your-domain.com/health

---

## Next Steps

1. **Test API Endpoints**
   ```bash
   # Register a user
   curl -X POST https://your-domain.com/api/v1/auth/request-otp \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+919876543210"}'
   ```

2. **Configure Frontend**
   - Update Website's API URL to: `https://your-domain.com/api/v1`
   - Update Mobile App's API URL

3. **Setup Monitoring Dashboard** (Optional)
   - Install Grafana + Prometheus
   - Or use simple health-check script

4. **Load Testing** (Optional)
   ```bash
   cd /opt/anaaj-ai/Backend
   npm run loadtest:smoke
   ```

---

## Troubleshooting

### Issue: Backend not starting
```bash
# Check logs
docker compose logs app

# Check environment
docker compose exec app printenv | grep -E 'NODE_ENV|MONGODB_URI'
```

### Issue: SSL certificate failed
```bash
# Ensure DNS is pointing to VPS
nslookup your-domain.com

# Try again
certbot --nginx -d your-domain.com
```

### Issue: Can't connect to database
```bash
# Check MongoDB
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker compose logs mongodb
```

---

## Useful Commands

```bash
# View logs
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml logs -f app

# Restart backend
docker compose -f /opt/anaaj-ai/Backend/docker-compose.prod.yml restart app

# Update deployment
cd /opt/anaaj-ai/Backend/deployment
./update-backend.sh

# Create backup
/usr/local/bin/backup.sh

# Check health
curl https://your-domain.com/health
```

---

## Support

- **Deployment Guide**: See `DEPLOYMENT.md` for detailed instructions
- **Operations**: See `OPERATIONS_RUNBOOK.md` for daily operations
- **Security**: See `SECURITY.md` for security best practices

---

**Deployment Time**: ~20-30 minutes  
**Difficulty**: Intermediate  
**Support**: Available in docs/

Good luck! 🚀
