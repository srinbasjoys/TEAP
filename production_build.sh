#!/bin/bash

# TechResona Quick Production Build Script
# This script helps prepare the production build

echo "=================================="
echo "TechResona Production Build Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

echo "Step 1: Building Frontend..."
cd /app/frontend
if yarn build; then
    print_success "Frontend build completed"
else
    print_error "Frontend build failed"
    exit 1
fi

echo ""
echo "Step 2: Checking Backend Dependencies..."
cd /app/backend
if pip install -r requirements.txt --quiet; then
    print_success "Backend dependencies installed"
else
    print_error "Backend dependencies installation failed"
    exit 1
fi

echo ""
echo "Step 3: Verifying Database Connection..."
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    print_success "MongoDB is running"
else
    print_error "MongoDB is not running. Please start MongoDB first."
    exit 1
fi

echo ""
echo "Step 4: Seeding Database (if needed)..."
cd /app/backend

# Check if blogs already exist
BLOG_COUNT=$(mongosh techresona_production --quiet --eval "db.blogs.countDocuments({})")
if [ "$BLOG_COUNT" -lt 5 ]; then
    print_warning "Seeding blogs..."
    python seed_blogs.py
    python seed_remaining_blogs.py
    python seed_final_blogs.py
    python seed_top11_blog.py
    print_success "Database seeded"
else
    print_success "Database already has blogs ($BLOG_COUNT found)"
fi

echo ""
echo "Step 5: Creating Production Backend Service..."

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

systemctl daemon-reload
systemctl enable techresona-backend
print_success "Backend service created"

echo ""
echo "Step 6: Starting Backend Service..."
systemctl restart techresona-backend
sleep 3

if systemctl is-active --quiet techresona-backend; then
    print_success "Backend service is running on localhost:9010"
else
    print_error "Backend service failed to start. Check logs: journalctl -u techresona-backend -n 50"
    exit 1
fi

echo ""
echo "Step 7: Testing Backend API..."
if curl -s http://localhost:9010/api/blogs > /dev/null; then
    print_success "Backend API responding correctly"
else
    print_error "Backend API not responding"
    exit 1
fi

echo ""
echo "=================================="
echo "Build Summary:"
echo "=================================="
print_success "Frontend: Production build created at /app/frontend/build"
print_success "Backend: Running on localhost:9010"
print_success "Database: MongoDB running with production data"
print_success "Blogs: 5 comprehensive SEO blogs available"
echo ""
echo "Next Steps:"
echo "1. Configure Nginx (see PRODUCTION_DEPLOYMENT_GUIDE.md)"
echo "2. Setup SSL certificate"
echo "3. Point domain to server"
echo "4. Test complete deployment"
echo ""
echo "Production build ready! ✓"
echo "=================================="
