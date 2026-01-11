#!/bin/bash

#############################################################
# TechResona Production Build & Deployment Script
# Version: 1.0
# Description: Complete production build for techresona.com
#############################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  $1"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (use sudo)"
    exit 1
fi

print_header "TECHRESONA PRODUCTION BUILD"

log_info "Starting production build process..."
log_info "Target: techresona.com"
log_info "Backend Port: 9010 (localhost only)"
echo ""

#############################################################
# STEP 1: Environment Validation
#############################################################

print_header "Step 1: Environment Validation"

# Check MongoDB
if ! systemctl is-active --quiet mongodb; then
    log_error "MongoDB is not running"
    log_info "Starting MongoDB..."
    systemctl start mongodb
    sleep 2
fi
log_success "MongoDB is running"

# Check required directories
if [ ! -d "/app/frontend" ]; then
    log_error "Frontend directory not found"
    exit 1
fi

if [ ! -d "/app/backend" ]; then
    log_error "Backend directory not found"
    exit 1
fi

log_success "All required directories found"

#############################################################
# STEP 2: Database Seeding
#############################################################

print_header "Step 2: Database Seeding"

cd /app/backend

# Update database name to production
if grep -q "test_database" .env; then
    log_info "Updating database name to production..."
    sed -i 's/DB_NAME="test_database"/DB_NAME="techresona_production"/' .env
    log_success "Database name updated to techresona_production"
fi

# Run production seeder
log_info "Running production database seeder..."
python3 seed_production.py

if [ $? -eq 0 ]; then
    log_success "Database seeding completed"
else
    log_error "Database seeding failed"
    exit 1
fi

#############################################################
# STEP 3: Backend Configuration
#############################################################

print_header "Step 3: Backend Configuration (Port 9010)"

# Update CORS if needed
if ! grep -q "techresona.com" .env; then
    log_info "Adding production CORS origins..."
    sed -i 's|CORS_ORIGINS=".*"|CORS_ORIGINS="https://techresona.com,https://www.techresona.com"|' .env
fi

log_success "Backend configured for production"

#############################################################
# STEP 4: Frontend Production Build
#############################################################

print_header "Step 4: Frontend Production Build"

cd /app/frontend

# Update backend URL for production
log_info "Updating frontend environment for production..."
cat > .env.production << EOF
REACT_APP_BACKEND_URL=https://techresona.com
GENERATE_SOURCEMAP=false
EOF

log_success "Frontend environment configured"

# Install dependencies
log_info "Installing frontend dependencies..."
yarn install --silent 2>&1 | grep -v "warning" || true

# Build production bundle
log_info "Building production bundle (this may take 2-3 minutes)..."
log_warning "Building... Please wait..."

DISABLE_ESLINT_PLUGIN=true yarn build

if [ $? -eq 0 ]; then
    log_success "Production build completed"
    
    # Check build directory
    if [ -d "build" ]; then
        BUILD_SIZE=$(du -sh build | cut -f1)
        log_info "Build size: $BUILD_SIZE"
        log_success "Build directory created successfully"
    else
        log_error "Build directory not created"
        exit 1
    fi
else
    log_error "Frontend build failed"
    exit 1
fi

#############################################################
# STEP 5: Backend Service Configuration
#############################################################

print_header "Step 5: Backend Service (Port 9010)"

# Create systemd service for backend
log_info "Creating backend systemd service..."

cat > /etc/systemd/system/techresona-backend.service << 'EOF'
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
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable techresona-backend
log_success "Backend service configured"

# Stop development services
log_info "Stopping development services..."
supervisorctl stop all 2>/dev/null || true

# Start production backend
log_info "Starting production backend on port 9010..."
systemctl restart techresona-backend
sleep 3

# Check backend status
if systemctl is-active --quiet techresona-backend; then
    log_success "Backend running on localhost:9010"
else
    log_error "Backend failed to start"
    journalctl -u techresona-backend -n 20
    exit 1
fi

# Test backend
log_info "Testing backend API..."
if curl -s http://localhost:9010/api/blogs > /dev/null; then
    log_success "Backend API responding correctly"
else
    log_error "Backend API not responding"
    exit 1
fi

#############################################################
# STEP 6: Nginx Configuration
#############################################################

print_header "Step 6: Nginx Configuration"

log_info "Creating Nginx configuration for techresona.com..."

cat > /etc/nginx/sites-available/techresona.com << 'EOF'
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
    
    # SSL Certificates (configure after obtaining)
    # ssl_certificate /etc/letsencrypt/live/techresona.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/techresona.com/privkey.pem;
    
    # For now, use self-signed (REPLACE IN PRODUCTION)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Root directory
    root /app/frontend/build;
    index index.html;
    
    # Backend API proxy (localhost:9010 - not exposed externally)
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
    
    # Logo and images
    location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache";
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
EOF

# Enable site
if [ -f "/etc/nginx/sites-enabled/techresona.com" ]; then
    rm /etc/nginx/sites-enabled/techresona.com
fi
ln -s /etc/nginx/sites-available/techresona.com /etc/nginx/sites-enabled/

# Test nginx configuration
log_info "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    log_success "Nginx configuration valid"
    
    # Reload nginx
    systemctl reload nginx || systemctl restart nginx
    log_success "Nginx reloaded"
else
    log_error "Nginx configuration invalid"
    exit 1
fi

#############################################################
# STEP 7: Final Verification
#############################################################

print_header "Step 7: Final Verification"

# Check backend
log_info "Checking backend..."
if curl -s http://localhost:9010/api/blogs > /dev/null; then
    log_success "✓ Backend API: Working"
else
    log_error "✗ Backend API: Failed"
fi

# Check sitemap
if curl -s http://localhost:9010/sitemap.xml > /dev/null; then
    log_success "✓ Sitemap: Generated"
else
    log_warning "⚠ Sitemap: Not accessible"
fi

# Check robots.txt
if curl -s http://localhost:9010/robots.txt > /dev/null; then
    log_success "✓ Robots.txt: Available"
else
    log_warning "⚠ Robots.txt: Not accessible"
fi

# Check services
if systemctl is-active --quiet techresona-backend; then
    log_success "✓ Backend Service: Running"
else
    log_error "✗ Backend Service: Not running"
fi

if systemctl is-active --quiet nginx; then
    log_success "✓ Nginx: Running"
else
    log_error "✗ Nginx: Not running"
fi

if systemctl is-active --quiet mongodb; then
    log_success "✓ MongoDB: Running"
else
    log_error "✗ MongoDB: Not running"
fi

#############################################################
# STEP 8: Summary
#############################################################

print_header "BUILD SUMMARY"

echo "Production build completed successfully!"
echo ""
echo "Configuration:"
echo "  Frontend: /app/frontend/build"
echo "  Backend: localhost:9010 (not externally exposed)"
echo "  Database: techresona_production"
echo "  Domain: techresona.com"
echo ""
echo "Admin Access:"
echo "  URL: https://techresona.com/admin/login"
echo "  Email: admin@techresona.com"
echo "  Password: TechResona2025!"
echo ""
echo "Services:"
echo "  Backend: systemctl status techresona-backend"
echo "  Nginx: systemctl status nginx"
echo "  MongoDB: systemctl status mongodb"
echo ""
echo "Logs:"
echo "  Backend: journalctl -u techresona-backend -f"
echo "  Nginx: tail -f /var/log/nginx/error.log"
echo ""
echo "Next Steps:"
echo "  1. Point domain DNS to this server IP"
echo "  2. Obtain SSL certificate: certbot certonly --webroot -w /var/www/certbot -d techresona.com -d www.techresona.com"
echo "  3. Update Nginx config with real SSL certificates"
echo "  4. Test site: https://techresona.com"
echo "  5. Submit sitemap to Google Search Console"
echo ""

print_header "DEPLOYMENT COMPLETE"

log_success "TechResona is ready for production!"
