# AnaajAI Security Hardening Guide

## 🔒 Security Overview

This guide covers security best practices for deploying AnaajAI Backend in production on Hostinger VPS.

---

## 📋 Security Checklist

### Pre-Deployment Security
- [ ] Strong passwords generated (32+ characters)
- [ ] JWT secret is 48+ characters
- [ ] API keys stored securely
- [ ] .env file permissions set to 600
- [ ] SSH key-based authentication configured
- [ ] Root login disabled
- [ ] Firewall configured

### Application Security
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] Input validation with Zod
- [ ] SQL injection protection (MongoDB queries)
- [ ] XSS protection enabled
- [ ] CSRF protection for state-changing operations

### Infrastructure Security
- [ ] SSL/TLS certificates installed
- [ ] HTTPS enforced (HTTP redirects)
- [ ] Security headers configured in Nginx
- [ ] Docker daemon secured
- [ ] Container user is non-root
- [ ] Network segmentation configured
- [ ] Backup encryption enabled

### Operational Security
- [ ] Automated security updates
- [ ] Log monitoring enabled
- [ ] Intrusion detection configured
- [ ] Backup strategy implemented
- [ ] Incident response plan documented
- [ ] Access logs reviewed regularly

---

## 🔐 Generate Secure Secrets

### JWT Secret (Minimum 48 characters)

```bash
# Method 1: OpenSSL (Recommended)
openssl rand -base64 48

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Method 3: pwgen (if installed)
pwgen -s 64 1
```

### Database Passwords (Minimum 32 characters)

```bash
# OpenSSL
openssl rand -hex 32

# Or combination of methods for extra strength
echo "$(openssl rand -base64 32)$(date +%s)" | sha256sum | cut -d' ' -f1
```

### API Keys & Webhook Secrets

```bash
# UUID v4
uuidgen

# Random alphanumeric
openssl rand -base64 32 | tr -dc 'a-zA-Z0-9'
```

---

## 🔥 Firewall Configuration

### UFW (Uncomplicated Firewall)

```bash
# Reset firewall
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (IMPORTANT: Do this before enabling!)
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Optional: Allow specific IP for backend access
sudo ufw allow from YOUR_OFFICE_IP to any port 4000 comment 'Backend API - Office'

# Enable firewall
sudo ufw --force enable

# Verify
sudo ufw status verbose
```

### Advanced UFW Rules

```bash
# Rate limit SSH (prevent brute force)
sudo ufw limit 22/tcp comment 'SSH rate limit'

# Allow MongoDB only from localhost
sudo ufw allow from 127.0.0.1 to any port 27017 comment 'MongoDB local'

# Allow Redis only from localhost
sudo ufw allow from 127.0.0.1 to any port 6379 comment 'Redis local'

# Block specific IP (if under attack)
sudo ufw deny from ATTACKER_IP
```

---

## 🔑 SSH Hardening

### Disable Root Login

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Make these changes:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
MaxSessions 2
```

### SSH Key Setup

```bash
# On local machine, generate SSH key
ssh-keygen -t ed25519 -C "anaaj-vps-key"

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@vps-ip

# Test connection
ssh -i ~/.ssh/id_ed25519 user@vps-ip

# Restart SSH service
sudo systemctl restart sshd
```

### Fail2Ban (SSH Protection)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create configuration
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
destemail = your-email@domain.com
sendername = Fail2Ban

[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
```

```bash
# Start Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

## 🌐 Nginx Security Headers

### Security Headers Configuration

Edit `/etc/nginx/sites-available/anaaj-ai`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';" always;

    # Hide Nginx version
    server_tokens off;

    # Additional security
    client_max_body_size 20M;
    client_body_buffer_size 128k;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    limit_conn conn_limit 10;

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
}
```

### Test Nginx Security

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Test security headers
curl -I https://your-domain.com/health
```

---

## 🐳 Docker Security

### Docker Daemon Configuration

```bash
sudo nano /etc/docker/daemon.json
```

```json
{
  "icc": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "5"
  },
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true
}
```

### Container Security Best Practices

Already implemented in Dockerfile:
```dockerfile
# ✅ Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# ✅ Health checks
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

# ✅ Minimal base image
FROM node:20-alpine
```

### Docker Compose Security

```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
```

---

## 🔒 Environment Variable Security

### Secure .env File

```bash
# Set restrictive permissions
chmod 600 /opt/anaaj-ai/Backend/.env
chown anaaj:anaaj /opt/anaaj-ai/Backend/.env

# Verify
ls -la /opt/anaaj-ai/Backend/.env
# Should show: -rw------- 1 anaaj anaaj
```

### Secrets Management (Optional - Advanced)

For enhanced security, use a secrets manager:

**Option 1: Docker Secrets**
```yaml
services:
  app:
    secrets:
      - jwt_secret
      - mongodb_uri

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  mongodb_uri:
    file: ./secrets/mongodb_uri.txt
```

**Option 2: HashiCorp Vault** (Enterprise)
```bash
# Install Vault
wget https://releases.hashicorp.com/vault/1.15.0/vault_1.15.0_linux_amd64.zip
unzip vault_1.15.0_linux_amd64.zip
sudo mv vault /usr/local/bin/

# Store secrets
vault kv put secret/anaaj jwt_secret="..."
```

---

## 📊 Security Monitoring

### Automated Security Scanning

```bash
# Install ClamAV (antivirus)
sudo apt install -y clamav clamav-daemon

# Update virus definitions
sudo freshclam

# Scan deployment directory
sudo clamscan -r /opt/anaaj-ai/

# Schedule daily scans
sudo crontab -e
# Add: 0 2 * * * /usr/bin/clamscan -r /opt/anaaj-ai/ >> /var/log/clamav-scan.log 2>&1
```

### Security Audit Script

Create `/usr/local/bin/security-audit.sh`:

```bash
#!/bin/bash
# Security Audit Script

echo "=== Security Audit Report $(date) ===" > /var/log/security-audit.log

# Check file permissions
echo "Checking .env permissions..." >> /var/log/security-audit.log
ls -la /opt/anaaj-ai/Backend/.env >> /var/log/security-audit.log

# Check for updates
echo "Checking for security updates..." >> /var/log/security-audit.log
sudo apt update && apt list --upgradable >> /var/log/security-audit.log

# Check failed login attempts
echo "Checking failed logins..." >> /var/log/security-audit.log
sudo grep "Failed password" /var/log/auth.log | tail -20 >> /var/log/security-audit.log

# Check listening ports
echo "Checking open ports..." >> /var/log/security-audit.log
sudo netstat -tlnp >> /var/log/security-audit.log

# Check Docker security
echo "Checking Docker security..." >> /var/log/security-audit.log
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" >> /var/log/security-audit.log

echo "=== Audit Complete ===" >> /var/log/security-audit.log
```

```bash
chmod +x /usr/local/bin/security-audit.sh

# Run weekly
sudo crontab -e
# Add: 0 9 * * 1 /usr/local/bin/security-audit.sh
```

---

## 🚨 Intrusion Detection

### AIDE (Advanced Intrusion Detection Environment)

```bash
# Install AIDE
sudo apt install -y aide

# Initialize database
sudo aideinit

# Move database
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Run check
sudo aide --check

# Schedule daily checks
sudo crontab -e
# Add: 0 5 * * * /usr/bin/aide --check | mail -s "AIDE Report" admin@domain.com
```

---

## 🔐 Application-Level Security

### Rate Limiting (Already Implemented)

Verify in `src/app.ts`:
```typescript
// Global rate limiting
app.register(fastifyRateLimit, {
  max: env.RATE_LIMIT_MAX,        // 100 requests
  timeWindow: env.RATE_LIMIT_WINDOW_MS,  // per minute
  cache: 10000,
  allowList: [],
  redis: env.REDIS_ENABLED ? redisClient : undefined,
});
```

### Input Validation (Already Implemented)

Using Zod schemas in routes:
```typescript
const registerSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/),
  name: z.string().min(2).max(100),
  // ...
});
```

### Authentication Best Practices

```typescript
// JWT with secure settings
const token = jwt.sign(
  { userId, farmerId },
  env.JWT_SECRET,
  {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
    issuer: 'anaaj-ai',
    audience: 'anaaj-api'
  }
);

// Verify with strict checks
jwt.verify(token, env.JWT_SECRET, {
  algorithms: ['HS256'],
  issuer: 'anaaj-ai',
  audience: 'anaaj-api'
});
```

---

## 📝 Security Logging

### Centralized Logging

```bash
# Install rsyslog (usually pre-installed)
sudo apt install -y rsyslog

# Configure remote logging (optional)
sudo nano /etc/rsyslog.d/50-default.conf
```

Add:
```
# Log all authentication events
auth,authpriv.*                 /var/log/auth.log

# Log all security events
*.info;mail.none;authpriv.none  /var/log/messages
```

### Application Security Logs

In your backend, log security events:
```typescript
// Log failed authentication
logger.warn({
  event: 'auth_failure',
  ip: request.ip,
  phoneNumber: sanitizedPhone,
  timestamp: new Date()
}, 'Authentication failed');

// Log rate limit hits
logger.warn({
  event: 'rate_limit_exceeded',
  ip: request.ip,
  path: request.url
}, 'Rate limit exceeded');
```

---

## 🔄 Automated Security Updates

### Unattended Upgrades

```bash
# Install
sudo apt install -y unattended-upgrades

# Configure
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Edit configuration
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Enable security updates:
```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
```

---

## 🎯 Compliance Checklist

### OWASP Top 10 Mitigation

- [x] **A01 - Broken Access Control**: JWT authentication, role-based access
- [x] **A02 - Cryptographic Failures**: HTTPS, strong encryption, secure password hashing
- [x] **A03 - Injection**: Input validation with Zod, parameterized queries
- [x] **A04 - Insecure Design**: Security by design, defense in depth
- [x] **A05 - Security Misconfiguration**: Hardened defaults, security headers
- [x] **A06 - Vulnerable Components**: Regular updates, dependency scanning
- [x] **A07 - Auth Failures**: Rate limiting, MFA ready, secure sessions
- [x] **A08 - Data Integrity Failures**: Input validation, HTTPS, integrity checks
- [x] **A09 - Logging Failures**: Comprehensive logging, monitoring
- [x] **A10 - SSRF**: Input validation, network segmentation

---

## 📞 Security Incident Response

### Immediate Actions

1. **Isolate**: Disconnect affected systems
2. **Assess**: Determine scope and impact
3. **Contain**: Stop the attack progression
4. **Eradicate**: Remove threat from environment
5. **Recover**: Restore from clean backup
6. **Review**: Conduct post-incident analysis

### Contact Information

- **Security Team**: security@your-domain.com
- **Incident Hotline**: [Phone Number]
- **Emergency Contact**: [On-Call Engineer]

---

## 🔍 Regular Security Review

### Monthly Tasks
- [ ] Review access logs
- [ ] Check for unauthorized changes
- [ ] Update dependencies
- [ ] Review firewall rules
- [ ] Test backup restoration

### Quarterly Tasks
- [ ] Penetration testing
- [ ] Security audit
- [ ] Update incident response plan
- [ ] Review and rotate secrets
- [ ] Security training

---

**Remember**: Security is an ongoing process, not a one-time setup!

**Last Updated**: [Date]  
**Maintained By**: Security Team
