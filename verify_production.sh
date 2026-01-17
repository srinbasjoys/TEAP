#!/bin/bash

# Production Build Verification Script
# Verifies all optimizations are in place

echo "🔍 TechResona Production Build Verification"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAIL++))
    fi
}

# Check backend port
echo "=== Backend Configuration ==="
netstat -tlnp 2>/dev/null | grep -q ":9001"
check "Backend running on port 9001"
echo ""

# Check build directory
echo "=== Build Files ==="
test -d /app/frontend/build
check "Build directory exists"

test -f /app/frontend/build/index.html
check "index.html generated"

test -f /app/frontend/build/service-worker.js
check "Service worker generated"

test -f /app/frontend/build/workbox*.js
check "Workbox runtime generated"
echo ""

# Check compression
echo "=== Compression ==="
GZIP_COUNT=$(find /app/frontend/build -name "*.gz" 2>/dev/null | wc -l)
test $GZIP_COUNT -gt 0
check "Gzip files generated ($GZIP_COUNT files)"

BR_COUNT=$(find /app/frontend/build -name "*.br" 2>/dev/null | wc -l)
test $BR_COUNT -gt 0
check "Brotli files generated ($BR_COUNT files)"
echo ""

# Check vendor chunks
echo "=== Code Splitting ==="
test -f /app/frontend/build/static/js/vendor-react*.js
check "React vendor chunk created"

test -f /app/frontend/build/static/js/vendor-radix*.js
check "Radix UI vendor chunk created"

test -f /app/frontend/build/static/js/vendor-framer*.js
check "Framer Motion vendor chunk created"

test -f /app/frontend/build/static/js/vendor-other*.js
check "Other vendor chunk created"
echo ""

# Check cache headers file
echo "=== Cache Configuration ==="
test -f /app/frontend/build/_headers
check "_headers file present"

grep -q "immutable" /app/frontend/build/_headers
check "Immutable cache headers configured"
echo ""

# Check critical optimizations in source
echo "=== Source Optimizations ==="
grep -q "preconnect" /app/frontend/public/index.html
check "Preconnect hints in index.html"

grep -q "font-display.*swap" /app/frontend/public/index.html
check "Font-display swap configured"

grep -q "React.lazy" /app/frontend/src/App.js
check "React.lazy code splitting"

grep -q "serviceWorker" /app/frontend/src/index.js
check "Service worker registration"
echo ""

# Bundle size check
echo "=== Bundle Sizes ==="
MAIN_JS=$(find /app/frontend/build/static/js -name "main*.js.gz" -exec ls -l {} \; | awk '{print $5}')
if [ ! -z "$MAIN_JS" ]; then
    MAIN_KB=$((MAIN_JS / 1024))
    if [ $MAIN_KB -lt 20 ]; then
        echo -e "${GREEN}✅ PASS${NC}: Main bundle gzipped: ${MAIN_KB}KB (< 20KB target)"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: Main bundle gzipped: ${MAIN_KB}KB (target: < 20KB)"
    fi
fi

TOTAL_JS=$(find /app/frontend/build/static/js -name "*.js.gz" -exec ls -l {} \; | awk '{sum+=$5} END {print sum}')
if [ ! -z "$TOTAL_JS" ]; then
    TOTAL_KB=$((TOTAL_JS / 1024))
    echo "ℹ️  Total JS (gzipped): ${TOTAL_KB}KB"
fi
echo ""

# Summary
echo "==========================================="
echo -e "Summary: ${GREEN}${PASS} passed${NC}, ${RED}${FAIL} failed${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Production build is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test locally: cd /app/frontend && npx serve -s build -l 3000"
    echo "2. Run Google PageSpeed Insights test"
    echo "3. Deploy to production server"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please review above.${NC}"
    exit 1
fi
