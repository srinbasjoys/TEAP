#!/bin/bash

echo "=========================================="
echo "TechResona Production Build Verification"
echo "=========================================="
echo ""

# Check build directory exists
if [ -d "/app/frontend/build" ]; then
    echo "✅ Build directory exists"
else
    echo "❌ Build directory missing"
    exit 1
fi

# Check critical files
echo ""
echo "Critical Files Check:"
files=(
    "/app/frontend/build/index.html"
    "/app/frontend/build/service-worker.js"
    "/app/frontend/build/_headers"
    "/app/frontend/build/logo-48.webp"
    "/app/frontend/build/logo-96.webp"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $(basename $file)"
    else
        echo "❌ $(basename $file) missing"
    fi
done

# Check compression
echo ""
echo "Compression Check:"
gz_count=$(find /app/frontend/build -name "*.gz" | wc -l)
br_count=$(find /app/frontend/build -name "*.br" | wc -l)
echo "✅ Gzip files: $gz_count"
echo "✅ Brotli files: $br_count"

# Check main bundles
echo ""
echo "Main Bundles:"
if [ -f "/app/frontend/build/static/js/main."*.js ]; then
    main_size=$(du -h /app/frontend/build/static/js/main.*.js | cut -f1)
    main_gz_size=$(du -h /app/frontend/build/static/js/main.*.js.gz | cut -f1)
    echo "✅ Main JS: $main_size (Gzipped: $main_gz_size)"
fi

if [ -f "/app/frontend/build/static/css/main."*.css ]; then
    css_size=$(du -h /app/frontend/build/static/css/main.*.css | cut -f1)
    css_gz_size=$(du -h /app/frontend/build/static/css/main.*.css.gz | cut -f1)
    echo "✅ Main CSS: $css_size (Gzipped: $css_gz_size)"
fi

# Check vendor bundles
echo ""
echo "Vendor Bundles:"
for vendor in react framer radix other; do
    if [ -f "/app/frontend/build/static/js/vendor-$vendor."*.js ]; then
        size=$(du -h /app/frontend/build/static/js/vendor-$vendor.*.js | cut -f1)
        gz_size=$(du -h /app/frontend/build/static/js/vendor-$vendor.*.js.gz | cut -f1)
        echo "✅ vendor-$vendor: $size (Gzipped: $gz_size)"
    fi
done

# Total build size
echo ""
echo "Build Statistics:"
total_size=$(du -sh /app/frontend/build | cut -f1)
echo "📦 Total Size: $total_size"

# Check environment
echo ""
echo "Environment Configuration:"
if [ -f "/app/frontend/.env.production" ]; then
    echo "✅ .env.production exists"
    if grep -q "REACT_APP_BACKEND_URL=https://techresona.com" /app/frontend/.env.production; then
        echo "✅ Backend URL configured correctly"
    else
        echo "⚠️  Backend URL needs verification"
    fi
else
    echo "❌ .env.production missing"
fi

# Check index.html for optimizations
echo ""
echo "Index.html Optimizations:"
if grep -q "preconnect" /app/frontend/build/index.html; then
    echo "✅ Resource hints (preconnect) present"
fi
if grep -q "fetchpriority" /app/frontend/build/index.html; then
    echo "✅ Priority hints present"
fi
if grep -q "upgrade-insecure-requests" /app/frontend/build/index.html; then
    echo "✅ HTTPS enforcement present"
fi
if grep -q "contain:" /app/frontend/build/index.html; then
    echo "✅ Critical CSS present"
fi

echo ""
echo "=========================================="
echo "✅ Production Build Verification Complete"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Deploy /app/frontend/build/ to production server"
echo "2. Configure server to serve pre-compressed files (.gz, .br)"
echo "3. Apply _headers configuration to your server"
echo "4. Run Lighthouse audit on production URL"
echo "5. Verify Core Web Vitals in Chrome DevTools"
echo ""
