# AnaajAI Backend Deployment Scripts - Setup Instructions

## ⚠️ Setup Required

This system requires PowerShell 6+ to run automated scripts. Since it's not installed, 
please follow these manual steps to create the deployment directory structure:

## Step 1: Create Directory Structure

Open Command Prompt or PowerShell and run:

```batch
cd "F:\Agency CLients works\AnaajAI\Backend"
mkdir deployment\nginx
```

Or use this Python one-liner if Python is installed:
```
python -c "import os; os.makedirs(r'F:\Agency CLients works\AnaajAI\Backend\deployment\nginx', exist_ok=True)"
```

## Step 2: Create Deployment Files

After creating the directories, I'll create all the deployment scripts and configuration files.

The following files will be created:

### Shell Scripts (deployment/)
- install-docker.sh - Docker & Docker Compose installation
- deploy-backend.sh - Initial deployment script
- update-backend.sh - Zero-downtime update script
- backup.sh - Database and application backup
- restore.sh - Restore from backup
- firewall-setup.sh - UFW firewall configuration
- health-check.sh - Health monitoring and alerting

### Nginx Configuration (deployment/nginx/)
- nginx.conf - Main Nginx configuration
- anaaj-ai.conf - AnaajAI backend reverse proxy config

## Step 3: Make Scripts Executable

Once deployed to your Linux VPS, run:
```bash
cd /path/to/deployment
chmod +x *.sh
```

## Directory Structure

```
deployment/
├── install-docker.sh
├── deploy-backend.sh
├── update-backend.sh
├── backup.sh
├── restore.sh
├── firewall-setup.sh
├── health-check.sh
└── nginx/
    ├── nginx.conf
    └── anaaj-ai.conf
```

## Next Steps

After creating the deployment directory manually:
1. Re-run this command to create all deployment files
2. Transfer the deployment folder to your VPS
3. Follow the deployment guide

---
Generated for AnaajAI Backend Deployment
