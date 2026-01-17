# TechResona Production Deployment Guide

## 🎯 Quick Overview
- Frontend: Static files to be served via Nginx
- Backend: FastAPI on port 9001 (localhost only, NOT exposed externally)
- Backend URL for API calls: https://techresona.com/api

## 📋 Prerequisites
- Ubuntu/Debian server with aapanel installed
- Python 3.8+ installed
- MongoDB running (local or remote)
- Domain pointed to server: techresona.com
- SSL certificate (Let's Encrypt via aapanel)

## 🚀 Deployment Steps

### 1. Upload Files
```bash
# Upload frontend files
scp -r production_deploy/* user@your-server:/var/www/techresona/public/

# Upload backend files separately
scp -r production_deploy/backend/* user@your-server:/var/www/techresona/backend/
```

### 2. Setup Backend
```bash
# SSH into your server
ssh user@your-server

# Navigate to backend directory
cd /var/www/techresona/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.template .env
nano .env
# Update with your actual values:
# - MONGO_URL (your MongoDB connection string)
# - SMTP credentials (for email notifications)
# - SLACK_WEBHOOK_URL (for Slack notifications)
```

### 3. Create Log Directory
```bash
sudo mkdir -p /var/log/techresona
sudo chown www-data:www-data /var/log/techresona
```

### 4. Install Systemd Service
```bash
sudo cp techresona-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable techresona-backend
sudo systemctl start techresona-backend
sudo systemctl status techresona-backend
```

### 5. Configure Nginx in aapanel
1. Login to aapanel
2. Go to Website → Add Site
3. Domain: techresona.com, www.techresona.com
4. Root directory: /var/www/techresona/public
5. Enable SSL (Let's Encrypt)
6. Edit site configuration and replace with content from `nginx.conf.example`
7. Test and reload: `nginx -t && systemctl reload nginx`

### 6. Verify Deployment

#### Backend Health Check
```bash
curl http://127.0.0.1:9001/health
# Should return: {"status":"ok"}
```

#### Frontend Check
Visit: https://techresona.com
- Check homepage loads
- Test contact form
- Verify all pages work

#### Performance Check
1. Run Google PageSpeed Insights: https://pagespeed.web.dev/
2. Test with your domain: https://techresona.com
3. Expected scores: Mobile 85-95, Desktop 95-100

## 🔧 Maintenance

### View Backend Logs
```bash
sudo journalctl -u techresona-backend -f
# Or
tail -f /var/log/techresona/backend.log
```

### Restart Backend
```bash
sudo systemctl restart techresona-backend
```

### Update Application
```bash
# Backend
cd /var/www/techresona/backend
source venv/bin/activate
# Update files...
sudo systemctl restart techresona-backend

# Frontend
# Upload new build files to /var/www/techresona/public/
# No restart needed for static files
```

## ⚡ Performance Optimizations Included

✅ **JavaScript**
- Tree shaking (removes unused code)
- Minification with Terser
- Code splitting (vendor chunks)
- Gzip + Brotli compression

✅ **CSS**
- Purged unused styles
- Minified
- Compressed

✅ **Images**
- WebP format
- Responsive sizing
- Lazy loading

✅ **Caching**
- Static assets: 1 year cache
- HTML: No cache (always fresh)
- Service worker for offline support

✅ **Loading**
- Async font loading
- Preconnect to external resources
- Critical CSS inlined
- Code splitting

## 🎯 Expected Performance

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s ✅
- **FID** (First Input Delay): < 100ms ✅
- **CLS** (Cumulative Layout Shift): < 0.1 ✅

### Google PageSpeed Scores
- **Mobile**: 85-95
- **Desktop**: 95-100

### Network Performance
- First Load: ~200-300KB (compressed)
- Subsequent Loads: ~50KB (cached)
- API Response Time: < 200ms

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
sudo journalctl -u techresona-backend -n 50

# Common issues:
# 1. Port 9001 already in use
sudo lsof -i :9001

# 2. MongoDB not accessible
mongo --eval "db.adminCommand('ping')"

# 3. Permission issues
sudo chown -R www-data:www-data /var/www/techresona
```

### Frontend 404 errors
```bash
# Check Nginx configuration
sudo nginx -t

# Verify files exist
ls -la /var/www/techresona/public/

# Check permissions
chmod -R 755 /var/www/techresona/public/
```

### API calls failing (CORS)
- Verify backend .env has correct CORS_ORIGINS
- Should be: CORS_ORIGINS=https://techresona.com,https://www.techresona.com
- Restart backend after changes

## 📞 Support
For issues or questions:
- Check logs first (backend and nginx)
- Verify environment variables
- Ensure MongoDB is accessible
- Test backend health endpoint: http://127.0.0.1:9001/health

---

**Important Notes:**
- Backend runs on port 9001 (localhost only, NOT exposed to internet)
- All API requests go through Nginx proxy at /api/
- Frontend expects backend at https://techresona.com/api
- Never expose port 9001 directly to the internet
