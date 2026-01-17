#!/bin/bash

# TechResona Production Build Script
# This script creates an optimized production build

set -e  # Exit on any error

echo "🚀 Starting TechResona Production Build..."
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to frontend directory
cd /app/frontend

echo -e "${BLUE}📦 Cleaning previous build...${NC}"
rm -rf build

echo -e "${BLUE}📋 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    yarn install
fi

echo -e "${BLUE}🔧 Building production bundle...${NC}"
# Use production config
export NODE_ENV=production
export GENERATE_SOURCEMAP=true
export INLINE_RUNTIME_CHUNK=false

# Build with production config
CRACO_CONFIG_PATH=./craco.config.production.js yarn build

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""

# Display build statistics
echo -e "${BLUE}📊 Build Statistics:${NC}"
if [ -d "build" ]; then
    echo "Build directory size: $(du -sh build | cut -f1)"
    echo ""
    echo "Main bundles:"
    ls -lh build/static/js/*.js 2>/dev/null | awk '{print $9, $5}' | grep -v "map" || echo "No JS files found"
    echo ""
    echo "CSS files:"
    ls -lh build/static/css/*.css 2>/dev/null | awk '{print $9, $5}' | grep -v "map" || echo "No CSS files found"
    echo ""
    
    # Check for service worker
    if [ -f "build/service-worker.js" ]; then
        echo -e "${GREEN}✅ Service Worker generated${NC}"
    fi
    
    # Check for gzip files
    GZIP_COUNT=$(find build -name "*.gz" | wc -l)
    if [ $GZIP_COUNT -gt 0 ]; then
        echo -e "${GREEN}✅ Gzip compression: $GZIP_COUNT files${NC}"
    fi
    
    # Check for brotli files
    BR_COUNT=$(find build -name "*.br" | wc -l)
    if [ $BR_COUNT -gt 0 ]; then
        echo -e "${GREEN}✅ Brotli compression: $BR_COUNT files${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Production build ready in: /app/frontend/build${NC}"
echo ""
echo "Next steps:"
echo "1. Test the build locally: cd /app/frontend && npx serve -s build -l 3000"
echo "2. Deploy to production server"
echo "3. Verify Google PageSpeed Insights score"
echo ""
echo "Backend should be running on port 9001 (local only)"
