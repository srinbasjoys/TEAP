#!/bin/bash

# TechResona Production Deployment Configuration
# This script creates an optimized production build for deployment on aapanel

set -e

echo "========================================"
echo "TechResona Production Build Script"
echo "========================================"
echo ""

# Configuration
PROJECT_ROOT="/app"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BUILD_DIR="$FRONTEND_DIR/build"
DEPLOY_DIR="$PROJECT_ROOT/production_deploy"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "📦 Cleaning previous builds..."
rm -rf "$BUILD_DIR"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

echo "✅ Installing frontend dependencies..."
cd "$FRONTEND_DIR"
yarn install --frozen-lockfile --production=false

echo "🔧 Configuring production environment..."
cat > "$FRONTEND_DIR/.env.production" << 'EOF'
REACT_APP_BACKEND_URL=https://techresona.com/api
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
IMAGE_INLINE_SIZE_LIMIT=0
EOF

echo "🏗️  Building optimized production bundle..."
cd "$FRONTEND_DIR"
NODE_ENV=production yarn build

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build failed! Build directory not found."
    exit 1
fi

echo "📊 Build Statistics:"
du -sh "$BUILD_DIR"
echo ""
echo "JavaScript bundles:"
du -h "$BUILD_DIR/static/js"/*.js 2>/dev/null | sort -rh | head -10
echo ""
echo "CSS bundles:"
du -h "$BUILD_DIR/static/css"/*.css 2>/dev/null
echo ""

echo "📦 Creating deployment package..."
cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"

# Create backend deployment directory
echo "📦 Packaging backend..."
mkdir -p "$DEPLOY_DIR/backend"
cp "$BACKEND_DIR/server.py" "$DEPLOY_DIR/backend/"
cp "$BACKEND_DIR/requirements.txt" "$DEPLOY_DIR/backend/"
cp "$BACKEND_DIR/.env" "$DEPLOY_DIR/backend/.env.example"

# Create deployment instructions
cat > "$DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# TechResona Production Deployment Instructions

## Prerequisites
- aapanel installed and configured
- Python 3.8+ installed
- Node.js/Nginx configured in aapanel
- MongoDB running (local or remote)

## Backend Deployment (Port 9001 - Internal Only)

### 1. Upload Backend Files
```bash
# Upload the backend directory to your server
scp -r backend/ user@your-server:/var/www/techresona/
```

### 2. Install Python Dependencies
```bash
cd /var/www/techresona/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
# Copy and edit .env file
cp .env.example .env
nano .env

# Update these values:
MONGO_URL="mongodb://localhost:27017"  # or your MongoDB URL
DB_NAME="techresona_production"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
CONTACT_EMAIL="info@techresona.com"
SLACK_WEBHOOK_URL="your-slack-webhook-url"
```

### 4. Create Systemd Service (Backend on Port 9001)
```bash
sudo nano /etc/systemd/system/techresona-backend.service
```

Add this configuration:
```ini
[Unit]
Description=TechResona Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/techresona/backend
Environment="PATH=/var/www/techresona/backend/venv/bin"
ExecStart=/var/www/techresona/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 9001 --workers 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**IMPORTANT:** Backend runs on 127.0.0.1:9001 (localhost only, NOT exposed externally)

### 5. Start Backend Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable techresona-backend
sudo systemctl start techresona-backend
sudo systemctl status techresona-backend
```

## Frontend Deployment

### 1. Upload Frontend Build Files
```bash
# Upload all files from production_deploy (except backend/) to your web root
scp -r production_deploy/* user@your-server:/var/www/techresona/public/
```

### 2. Configure Nginx in aapanel

Add a new site in aapanel for `techresona.com`, then edit the Nginx configuration:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name techresona.com www.techresona.com;
    
    # SSL configuration (aapanel will handle this)
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;
    
    root /var/www/techresona/public;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Serve pre-compressed files if available
    gzip_static on;
    
    # API proxy to backend (port 9001 - internal only)
    location /api/ {
        proxy_pass http://127.0.0.1:9001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Static files with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
        access_log off;
    }
    
    # Service worker - no cache
    location = /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
    }
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name techresona.com www.techresona.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Test Configuration and Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Verification

### 1. Check Backend is Running
```bash
sudo systemctl status techresona-backend
curl http://127.0.0.1:9001/health  # Should return OK
```

### 2. Test Frontend
- Visit https://techresona.com
- Check browser console for errors
- Test contact form submission
- Verify all pages load correctly

### 3. Performance Testing
- Run Google PageSpeed Insights: https://pagespeed.web.dev/
- Check Lighthouse scores
- Verify cache headers: Network tab in DevTools

## Post-Deployment

### Monitor Logs
```bash
# Backend logs
sudo journalctl -u techresona-backend -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Update Application
```bash
# Backend
cd /var/www/techresona/backend
source venv/bin/activate
git pull  # or upload new files
pip install -r requirements.txt
sudo systemctl restart techresona-backend

# Frontend
# Upload new build files and clear browser cache
```

## Troubleshooting

### Backend not starting
- Check logs: `sudo journalctl -u techresona-backend -n 50`
- Verify MongoDB connection
- Check .env file configuration
- Ensure port 9001 is not in use: `sudo lsof -i :9001`

### Frontend 404 errors
- Verify Nginx configuration
- Check file permissions: `chmod -R 755 /var/www/techresona/public`
- Ensure index.html exists in root

### API calls failing
- Check backend is running on port 9001
- Verify Nginx proxy configuration
- Check CORS settings in backend
- Test direct API call: `curl http://127.0.0.1:9001/health`

## Performance Optimizations Applied

✅ JavaScript tree shaking and minification
✅ CSS purging and minification
✅ Gzip and Brotli compression
✅ Long-term caching for static assets
✅ Code splitting (vendor chunks separated)
✅ Image optimization (WebP format)
✅ Service worker for offline support
✅ Critical CSS inlined
✅ Async font loading
✅ Preconnect to external resources

Expected Performance Scores:
- Mobile: 85-95
- Desktop: 95-100
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
EOF

echo "✅ Deployment package created successfully!"
echo ""
echo "📁 Deployment location: $DEPLOY_DIR"
echo "📄 Instructions: $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "🎯 Next Steps:"
echo "1. Review deployment instructions in DEPLOYMENT_INSTRUCTIONS.md"
echo "2. Upload backend/ to your server"
echo "3. Upload frontend build files to web root"
echo "4. Configure Nginx as per instructions"
echo "5. Start backend service on port 9001 (internal only)"
echo ""
echo "========================================"
echo "Build Complete! 🚀"
echo "========================================"