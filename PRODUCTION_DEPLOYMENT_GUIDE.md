# TechResona Production Deployment Guide

## Complete Production Build & Deployment Instructions

This guide provides step-by-step instructions for deploying the TechResona website to production on techresona.com with the backend running on localhost:9010.

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Configuration (Port 9010)](#backend-configuration-port-9010)
3. [Frontend Production Build](#frontend-production-build)
4. [Nginx Configuration](#nginx-configuration)
5. [Environment Variables](#environment-variables)
6. [SSL Certificate Setup](#ssl-certificate-setup)
7. [Database Setup](#database-setup)
8. [Deployment Steps](#deployment-steps)
9. [Post-Deployment Testing](#post-deployment-testing)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

- [ ] Domain configured (techresona.com pointing to server IP)
- [ ] SSL certificate obtained (Let's Encrypt or commercial)
- [ ] MongoDB installed and running
- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] Nginx installed
- [ ] All API keys and credentials ready
- [ ] Backup of current site (if updating)

---

## Backend Configuration (Port 9010)

### 1. Update Backend Environment Variables

Edit `/app/backend/.env`:

```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="techresona_production"
CORS_ORIGINS="https://techresona.com,https://www.techresona.com"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="sashadhagle@gmail.com"
SMTP_PASSWORD="dibphfyezwffocsa"
CONTACT_EMAIL="info@techresona.com"

# Slack Configuration
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/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"
SLACK_CLIENT_ID="10256821234903.10270299955206"
SLACK_CLIENT_SECRET="ad1a3cf1ddd2991755171a89459a9289"
SLACK_SIGNING_SECRET="eaf9129320cdc3b1bbafa57036a50955"
SLACK_VERIFICATION_TOKEN="x97PJugb9kkbvOMlbSJk3X1w"

# Security
SECRET_KEY="your-secure-random-secret-key-change-this"
```

### 2. Create Production Backend Start Script

Create `/app/backend/start_production.sh`:

```bash
#!/bin/bash
cd /app/backend
source /root/.venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 9010 --workers 2 --no-reload
```

Make it executable:
```bash
chmod +x /app/backend/start_production.sh
```

### 3. Create Systemd Service for Backend

Create `/etc/systemd/system/techresona-backend.service`:

```ini
[Unit]
Description=TechResona FastAPI Backend
After=network.target mongodb.service

[Service]
Type=simple
User=root
WorkingDirectory=/app/backend
Environment="PATH=/root/.venv/bin"
ExecStart=/root/.venv/bin/uvicorn server:app --host 127.0.0.1 --port 9010 --workers 2 --no-reload
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable techresona-backend
sudo systemctl start techresona-backend
sudo systemctl status techresona-backend
```

---

## Frontend Production Build

### 1. Update Frontend Environment Variables

Edit `/app/frontend/.env.production`:

```bash
REACT_APP_BACKEND_URL=https://techresona.com
GENERATE_SOURCEMAP=false
```

### 2. Build Frontend for Production

```bash
cd /app/frontend
yarn build
```

This creates an optimized production build in `/app/frontend/build/`

### 3. Verify Build

```bash
ls -la /app/frontend/build/
# Should see: index.html, static/, asset-manifest.json, etc.
```

---

## Nginx Configuration

### 1. Create Nginx Site Configuration

Create `/etc/nginx/sites-available/techresona.com`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name techresona.com www.techresona.com;
    
    # Let's Encrypt certificate renewal
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name techresona.com www.techresona.com;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/techresona.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/techresona.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/techresona.com/chain.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json;
    
    # Root directory for static files
    root /app/frontend/build;
    index index.html;
    
    # Backend API proxy (all /api requests go to localhost:9010)
    location /api {
        proxy_pass http://127.0.0.1:9010;
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
    }
    
    # Backend root endpoints (robots.txt, sitemap.xml)
    location ~ ^/(robots\.txt|sitemap\.xml)$ {
        proxy_pass http://127.0.0.1:9010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files with caching
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Service worker
    location = /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Optimize file access
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 2. Enable Site and Test Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/techresona.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Create certificate directory
sudo mkdir -p /var/www/certbot

# Obtain certificate
sudo certbot certonly --webroot -w /var/www/certbot -d techresona.com -d www.techresona.com --email info@techresona.com --agree-tos --no-eff-email

# Auto-renewal (cron job)
sudo crontab -e
# Add this line:
0 0 1 * * certbot renew --quiet && systemctl reload nginx
```

---

## Database Setup

### 1. Create Production Database

```bash
# Connect to MongoDB
mongosh

# Create production database and admin user
use techresona_production

db.createUser({
  user: "techresona_admin",
  pwd: "YOUR_SECURE_PASSWORD",
  roles: [{ role: "readWrite", db: "techresona_production" }]
})

exit
```

### 2. Seed Initial Data

```bash
cd /app/backend

# Run blog seeding scripts
python seed_blogs.py
python seed_remaining_blogs.py
python seed_final_blogs.py
python seed_top11_blog.py

# Create first admin user (update email/password)
python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import uuid
from datetime import datetime, timezone

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

async def create_admin():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['techresona_production']
    
    admin = {
        'id': str(uuid.uuid4()),
        'email': 'admin@techresona.com',
        'password_hash': pwd_context.hash('ChangeThisPassword123!'),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.admins.insert_one(admin)
    print('Admin created: admin@techresona.com')
    client.close()

asyncio.run(create_admin())
"
```

---

## Deployment Steps

### Step-by-Step Deployment Process

```bash
# 1. Stop development services
sudo supervisorctl stop all

# 2. Build frontend
cd /app/frontend
yarn build

# 3. Update backend configuration
cd /app/backend
# Edit .env file with production settings

# 4. Install/update dependencies
pip install -r requirements.txt
cd /app/frontend && yarn install

# 5. Start production backend
sudo systemctl start techresona-backend
sudo systemctl status techresona-backend

# 6. Configure and start Nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# 7. Verify services
sudo systemctl status techresona-backend
sudo systemctl status nginx
sudo systemctl status mongodb

# 8. Check logs
sudo journalctl -u techresona-backend -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Post-Deployment Testing

### 1. Test Backend API

```bash
# Test health check
curl http://localhost:9010/api/blogs

# Test public endpoints
curl https://techresona.com/api/blogs
curl https://techresona.com/robots.txt
curl https://techresona.com/sitemap.xml
```

### 2. Test Frontend

- Visit https://techresona.com
- Navigate all pages (Home, About, Services, Contact, Blog)
- Test contact form submission
- Check email and Slack notifications
- Test admin login at https://techresona.com/admin/login

### 3. Performance Testing

```bash
# Test page load speed
curl -o /dev/null -s -w '%{time_total}\n' https://techresona.com

# Run Lighthouse audit (Chrome DevTools)
# Target scores:
# - Performance: 70+ mobile, 80+ desktop
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

### 4. SEO Validation

- Verify robots.txt: https://techresona.com/robots.txt
- Verify sitemap.xml: https://techresona.com/sitemap.xml
- Test schema markup: https://search.google.com/test/rich-results
- Check meta tags on all pages
- Validate canonical tags

---

## Monitoring & Maintenance

### 1. Setup Monitoring

```bash
# Backend health check cron
crontab -e
# Add:
*/5 * * * * curl -f http://localhost:9010/api/blogs || echo "Backend down" | mail -s "TechResona Backend Alert" admin@techresona.com
```

### 2. Log Rotation

Create `/etc/logrotate.d/techresona`:

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### 3. Backup Script

Create `/app/scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/techresona"

mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --db techresona_production --out $BACKUP_DIR/mongo_$DATE

# Backup uploaded files (if any)
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /app/uploads 2>/dev/null || true

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to cron:
```bash
chmod +x /app/scripts/backup.sh
crontab -e
# Add daily backup at 2 AM:
0 2 * * * /app/scripts/backup.sh
```

### 4. Update Procedure

```bash
# Pull latest code
cd /app
git pull origin main

# Update dependencies
cd /app/backend && pip install -r requirements.txt
cd /app/frontend && yarn install

# Rebuild frontend
cd /app/frontend && yarn build

# Restart backend
sudo systemctl restart techresona-backend

# Reload Nginx
sudo systemctl reload nginx
```

---

## Production Optimizations Applied

### Backend Optimizations:
- ✅ Running on localhost:9010 (not exposed publicly)
- ✅ 2 worker processes for better concurrency
- ✅ Production database (techresona_production)
- ✅ Proper CORS configuration
- ✅ Email and Slack notifications configured
- ✅ Secure secret keys
- ✅ Systemd service with auto-restart

### Frontend Optimizations:
- ✅ Production build (minified, optimized)
- ✅ Code splitting enabled
- ✅ Source maps disabled for security
- ✅ Semantic HTML for SEO
- ✅ Schema markup (Organization, LocalBusiness, BlogPosting)
- ✅ Canonical URLs on all pages
- ✅ Meta tags optimized with target keywords
- ✅ Lazy loading for images
- ✅ Mobile responsive design

### Nginx Optimizations:
- ✅ Gzip compression enabled
- ✅ Browser caching configured (1 year for static assets)
- ✅ Security headers added
- ✅ SSL/TLS with modern protocols
- ✅ HTTP/2 enabled
- ✅ API proxying to localhost:9010
- ✅ React Router support (SPA)

### SEO Optimizations:
- ✅ Sitemap.xml with all pages and blogs
- ✅ Robots.txt properly configured
- ✅ Canonical tags on all pages
- ✅ Organization & LocalBusiness schema
- ✅ BlogPosting schema with proper metadata
- ✅ Target keywords integrated throughout content
- ✅ 5 comprehensive SEO-optimized blogs (1500-2000+ words each)
- ✅ Mobile-friendly and responsive
- ✅ Fast page load times
- ✅ Semantic HTML structure

---

## Troubleshooting

### Backend not starting:
```bash
# Check logs
sudo journalctl -u techresona-backend -n 50
sudo tail -f /var/log/supervisor/backend.err.log

# Check if port is in use
sudo lsof -i :9010

# Test manually
cd /app/backend
source /root/.venv/bin/activate
python -c "import server; print('Import successful')"
```

### Frontend build issues:
```bash
# Clear cache and rebuild
cd /app/frontend
rm -rf node_modules build
yarn install
yarn build
```

### Nginx errors:
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL certificate issues:
```bash
# Renew manually
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

## Support & Contacts

**TechResona Support:**
- Email: info@techresona.com
- Phone/WhatsApp: +91 7517402788
- Website: https://techresona.com

**Emergency Contacts:**
- Database Issues: Check MongoDB logs at /var/log/mongodb.err.log
- Backend Issues: Check systemd logs with `journalctl -u techresona-backend`
- Frontend Issues: Check Nginx logs at /var/log/nginx/error.log

---

## Production Checklist

### Pre-Launch:
- [ ] All 5 blogs seeded and published
- [ ] Admin account created
- [ ] Email notifications tested
- [ ] Slack notifications tested
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Backup system configured
- [ ] Monitoring setup

### Launch Day:
- [ ] Final frontend build created
- [ ] Backend running on port 9010
- [ ] Nginx configured and tested
- [ ] All pages loading correctly
- [ ] Contact form working
- [ ] Sitemap.xml accessible
- [ ] Robots.txt accessible
- [ ] Schema markup validated
- [ ] Mobile responsiveness verified
- [ ] Performance tested (Lighthouse)

### Post-Launch:
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Monitor error logs for 24 hours
- [ ] Test all forms and integrations
- [ ] Verify analytics setup (if applicable)
- [ ] Schedule regular backups
- [ ] Document any custom configurations

---

**Deployment Guide Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** TechResona Team
