#!/bin/bash

# TechResona - Deployment Verification Script
# Run this on your server after deployment to verify everything is working

echo "=============================================="
echo "  TechResona Deployment Verification"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0

# Function to check status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        FAILED=$((FAILED + 1))
    fi
}

echo "1. Checking Backend Service..."
systemctl is-active --quiet techresona-backend
check_status "Backend service is running"

echo ""
echo "2. Checking Backend Port..."
nc -z 127.0.0.1 9001 >/dev/null 2>&1
check_status "Backend listening on port 9001"

echo ""
echo "3. Checking Backend Health..."
HEALTH=$(curl -s http://127.0.0.1:9001/health)
if [ "$HEALTH" = '{"status":"ok"}' ]; then
    echo -e "${GREEN}✅ PASS${NC}: Backend health check"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC}: Backend health check (Response: $HEALTH)"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "4. Checking Frontend Files..."
if [ -f "/var/www/techresona/public/index.html" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Frontend files deployed"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC}: Frontend files not found"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "5. Checking Nginx Configuration..."
nginx -t >/dev/null 2>&1
check_status "Nginx configuration valid"

echo ""
echo "6. Checking Nginx Service..."
systemctl is-active --quiet nginx
check_status "Nginx service is running"

echo ""
echo "7. Checking SSL Certificate..."
if [ -d "/etc/letsencrypt/live/techresona.com" ] || [ -f "/www/server/panel/vhost/cert/techresona.com/fullchain.pem" ]; then
    echo -e "${GREEN}✅ PASS${NC}: SSL certificate found"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: SSL certificate not found (Install via aapanel)"
fi

echo ""
echo "8. Checking MongoDB..."
if command -v mongo &> /dev/null || command -v mongosh &> /dev/null; then
    systemctl is-active --quiet mongod || systemctl is-active --quiet mongodb
    check_status "MongoDB service is running"
else
    echo -e "${YELLOW}⚠️  WARN${NC}: MongoDB command not found"
fi

echo ""
echo "9. Checking Frontend Response..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://techresona.com)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Frontend accessible (HTTP 200)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: Frontend response code: $RESPONSE"
fi

echo ""
echo "10. Checking API Proxy..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://techresona.com/api/health)
if [ "$API_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}: API proxy working (HTTP 200)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: API response code: $API_RESPONSE"
fi

echo ""
echo "=============================================="
echo "  Verification Summary"
echo "=============================================="
echo -e "Tests Passed: ${GREEN}$PASSED${NC}"
echo -e "Tests Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Deployment successful!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Test contact form: https://techresona.com/contact"
    echo "2. Run Google PageSpeed: https://pagespeed.web.dev/"
    echo "3. Monitor logs: journalctl -u techresona-backend -f"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please review the errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check backend logs: journalctl -u techresona-backend -n 50"
    echo "2. Check nginx logs: tail -f /var/log/nginx/error.log"
    echo "3. Verify environment variables in backend/.env"
    echo "4. Ensure MongoDB is running and accessible"
    exit 1
fi
