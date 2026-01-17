# TechResona Production Deployment Guide

## Quick Start

Your optimized production build is ready at:
```
/app/frontend/build/
```

## Deployment Steps

### Step 1: Copy Build to Production Server

```bash
# If deploying to the same server
sudo cp -r /app/frontend/build/* /var/www/techresona.com/

# If deploying to remote server
rsync -avz /app/frontend/build/ user@techresona.com:/var/www/html/
```

### Step 2: Configure Nginx (Recommended)

Create or update `/etc/nginx/sites-available/techresona.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name techresona.com www.techresona.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name techresona.com www.techresona.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory
    root /var/www/techresona.com;
    index index.html;

    # Enable Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Enable Brotli (if module available)
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css text/xml text/javascript 
                 application/json application/javascript application/xml+rss 
                 application/rss+xml font/truetype font/opentype 
                 application/vnd.ms-fontobject image/svg+xml;

    # Serve pre-compressed files
    gzip_static on;
    brotli_static on;

    # Cache headers for static assets
    location ~* \.(js|css)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, stale-while-revalidate=86400";
        access_log off;
    }

    # No cache for HTML
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # No cache for service worker
    location = /service-worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:9001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://techresona.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "DENY" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }

    # Security headers
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;
}
```

### Step 3: Enable Nginx Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/techresona.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 4: Backend Service Configuration

Ensure backend is running on port 9001:

```bash
# Check backend status
sudo supervisorctl status backend

# If not running on 9001, update supervisor config
# Edit /etc/supervisor/conf.d/backend.conf
# Change port to 9001 in the command

# Restart backend
sudo supervisorctl restart backend
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d techresona.com -d www.techresona.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

## Alternative: Apache Configuration

If using Apache instead of Nginx:

```apache
<VirtualHost *:80>
    ServerName techresona.com
    ServerAlias www.techresona.com
    Redirect permanent / https://techresona.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName techresona.com
    ServerAlias www.techresona.com
    
    DocumentRoot /var/www/techresona.com
    
    SSLEngine on
    SSLCertificateFile /path/to/ssl/certificate.crt
    SSLCertificateKeyFile /path/to/ssl/private.key
    
    # Enable compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
        AddOutputFilterByType DEFLATE text/javascript application/javascript application/json
        AddOutputFilterByType DEFLATE application/xml application/rss+xml
        AddOutputFilterByType DEFLATE font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml
    </IfModule>
    
    # Serve pre-compressed files
    <IfModule mod_brotli.c>
        AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/xml text/css text/javascript
    </IfModule>
    
    # Cache headers
    <FilesMatch "\.(js|css)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    <FilesMatch "\.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot)$">
        Header set Cache-Control "public, max-age=31536000, stale-while-revalidate=86400"
    </FilesMatch>
    
    <FilesMatch "\.html$">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
    </FilesMatch>
    
    <Files "service-worker.js">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
    </Files>
    
    # Backend API proxy
    ProxyPass /api/ http://localhost:9001/api/
    ProxyPassReverse /api/ http://localhost:9001/api/
    
    # SPA routing
    <Directory /var/www/techresona.com>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Security headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</VirtualHost>
```

## Verification Checklist

After deployment, verify:

### 1. Site Accessibility
```bash
curl -I https://techresona.com
# Should return 200 OK with proper headers
```

### 2. Compression
```bash
curl -I -H "Accept-Encoding: gzip, br" https://techresona.com/static/js/main.*.js
# Should show Content-Encoding: br or gzip
```

### 3. Cache Headers
```bash
curl -I https://techresona.com/static/js/main.*.js
# Should show Cache-Control: public, max-age=31536000, immutable
```

### 4. Backend API
```bash
curl https://techresona.com/api/health
# Should return backend health status
```

### 5. HTTPS Redirect
```bash
curl -I http://techresona.com
# Should return 301 redirect to https://
```

### 6. Lighthouse Audit
- Open Chrome DevTools (F12)
- Go to Lighthouse tab
- Run audit for Performance, Accessibility, Best Practices, SEO
- Expected scores: 90+ on all metrics

### 7. Core Web Vitals
- Install [Web Vitals Extension](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)
- Visit https://techresona.com
- Check LCP < 2.5s, FID < 100ms, CLS < 0.1

## Troubleshooting

### Issue: 404 on routes
**Solution**: Ensure SPA routing is configured (try_files in Nginx or RewriteRule in Apache)

### Issue: API calls failing
**Solution**: 
- Check backend is running on port 9001
- Verify proxy configuration in Nginx/Apache
- Check CORS headers

### Issue: Compression not working
**Solution**:
- Verify gzip_static/brotli_static is on
- Check .gz and .br files exist in build directory
- Ensure Accept-Encoding header is sent by browser

### Issue: Cache not working
**Solution**:
- Verify _headers file is being read
- Check server cache configuration
- Clear browser cache and test

### Issue: Fonts not loading
**Solution**:
- Check CORS headers for fonts
- Verify preconnect headers in index.html
- Check font files are accessible

## Performance Monitoring

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: techresona.com
3. Verify ownership
4. Monitor Core Web Vitals in Experience section

### Google Analytics
Add tracking code to monitor:
- Page load times
- User engagement
- Bounce rates
- Traffic sources

### Uptime Monitoring
Set up monitoring with:
- UptimeRobot (free)
- Pingdom
- StatusCake

## Build Statistics Summary

```
Total Build Size:     5.3 MB
Initial Load (gzip):  210 KB (69% reduction)
Build Time:           37 seconds
Code Chunks:          19 chunks
Compression:          Gzip + Brotli

Main Bundles (gzipped):
- Main JS:            8.6 KB
- Main CSS:           15 KB
- Runtime:            1.8 KB
- vendor-react:       59 KB
- vendor-other:       112 KB
- vendor-radix:       17 KB
- vendor-framer:      10 KB
```

## Expected Performance

```
Mobile Lighthouse:    90-95
Desktop Lighthouse:   98-100
LCP:                  1.5-2.0s
FID:                  <50ms
CLS:                  <0.05
```

## Support

For deployment assistance:
- Email: info@techresona.com
- Phone: +91 7517402788

---

**Last Updated**: January 17, 2025
**Build Version**: Production v1.0
**Status**: ✅ Ready for Deployment
