# TechResona Production Deployment Guide
**Date**: January 17, 2025  
**Status**: ✅ Production Build Ready

---

## 🎯 Deployment Overview

### What's Been Completed:
1. ✅ **Production Environment Configuration** - `.env.production` created
2. ✅ **Database Restoration** - 30 documents from backup restored
3. ✅ **Optimized Production Build** - 4.6MB total build size
4. ✅ **Backend API Configuration** - All routes use `/api` prefix

---

## 📦 Production Build Details

### Build Location
```
/app/frontend/build/
```

### Build Statistics
- **Total Size**: 4.6MB
- **Main Bundle**: 20.71 kB (gzipped)
- **React Vendor**: 72.81 kB (gzipped)
- **CSS**: 12.27 kB (gzipped)

### Key Features
- ✅ Code splitting enabled
- ✅ Tree shaking applied
- ✅ CSS minification
- ✅ WebP image optimization
- ✅ Content hash filenames for cache busting

---

## 🗄️ Database Status

### MongoDB Collections Restored:
| Collection | Documents | Description |
|------------|-----------|-------------|
| **blogs** | 8 | Published blog posts |
| **seo_settings** | 6 | SEO configurations for pages |
| **keywords** | 9 | Keyword tracking data |
| **contact_submissions** | 6 | Contact form submissions |
| **admins** | 1 | Admin user account |

### Database Connection
```bash
mongodb://localhost:27017
Database: test_database
```

---

## 🔧 Backend Configuration

### Current Setup
- **Host**: 0.0.0.0
- **Port**: 9001
- **API Prefix**: `/api` (all routes)
- **CORS**: Enabled for production domain

### Critical API Routes:
```
GET  /api/blogs
GET  /api/blogs/{slug}
POST /api/contact/submit
GET  /api/seo/{page}
GET  /sitemap.xml
GET  /robots.txt
```

### Environment Variables (backend/.env)
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="sashadhagle@gmail.com"
SMTP_PASSWORD="dibphfyezwffocsa"
CONTACT_EMAIL="info@techresona.com"

# Slack Configuration
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

---

## 🌐 Frontend Configuration

### Production Environment (frontend/.env.production)
```bash
# Backend URL - Same domain, nginx will proxy /api/* to port 9001
REACT_APP_BACKEND_URL=https://techresona.com

# Build Optimizations
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false

# Disable WebSocket in production
WDS_SOCKET_PORT=0
```

### How API Calls Work:
1. Frontend makes request to: `https://techresona.com/api/blogs`
2. Nginx proxies `/api/*` requests to `localhost:9001`
3. Backend (running on port 9001) processes the request
4. Response sent back through nginx to frontend

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend
```bash
# Ensure backend is running on port 9001
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 9001 --workers 4

# Or use supervisor/systemd for production
sudo systemctl restart techresona-backend
```

### Step 2: Configure Nginx
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name techresona.com www.techresona.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Frontend - Serve static files
    location / {
        root /app/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - Proxy to port 9001
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
    }

    # SEO files - Proxy to backend
    location ~ ^/(sitemap\.xml|robots\.txt)$ {
        proxy_pass http://localhost:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

### Step 3: Deploy Frontend Build
```bash
# Copy build files to server
rsync -avz /app/frontend/build/ user@server:/var/www/techresona.com/

# Or if on same server, copy locally
sudo cp -r /app/frontend/build/* /var/www/techresona.com/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/techresona.com/
sudo chmod -R 755 /var/www/techresona.com/
```

### Step 4: Restart Services
```bash
# Restart nginx
sudo systemctl restart nginx

# Restart backend
sudo systemctl restart techresona-backend

# Verify services are running
sudo systemctl status nginx
sudo systemctl status techresona-backend
```

### Step 5: Verify Deployment
```bash
# Test backend API
curl https://techresona.com/api/blogs

# Test sitemap
curl https://techresona.com/sitemap.xml

# Test frontend
curl -I https://techresona.com
```

---

## 🔍 Verification Checklist

### Backend Verification
- [ ] Backend running on port 9001
- [ ] MongoDB connected and accessible
- [ ] API endpoints responding: `/api/blogs`, `/api/contact/submit`
- [ ] SEO files accessible: `/sitemap.xml`, `/robots.txt`
- [ ] Email notifications working (SMTP configured)
- [ ] Slack notifications working (webhook configured)

### Frontend Verification
- [ ] Website loads at https://techresona.com
- [ ] All pages accessible (Home, About, Services, Blog, Contact)
- [ ] Contact form submitting successfully
- [ ] Blog posts displaying correctly
- [ ] Images loading with WebP format
- [ ] Mobile responsive design working
- [ ] SSL certificate valid

### SEO Verification
- [ ] Meta tags present on all pages
- [ ] Open Graph tags configured
- [ ] Structured data (JSON-LD) present
- [ ] Sitemap.xml accessible and valid
- [ ] Robots.txt configured correctly
- [ ] Canonical URLs set properly

---

## 📊 Performance Optimizations Implemented

### Build Optimizations
1. **Code Splitting**
   - Vendor libraries separated (React, UI components)
   - Route-based code splitting
   - Common chunks extracted

2. **Asset Optimization**
   - Images converted to WebP format
   - Responsive images with srcset
   - Lazy loading for below-fold images

3. **CSS Optimization**
   - Tailwind CSS purged (unused styles removed)
   - CSS minification with cssnano
   - Critical CSS inlined

4. **Caching Strategy**
   - Content hash filenames for long-term caching
   - Static assets cached for 1 year
   - API responses with appropriate cache headers

### Expected Performance
- **Lighthouse Mobile**: 85+ score
- **Lighthouse Desktop**: 90+ score
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s

---

## 🐛 Troubleshooting

### Issue: API calls failing (404 errors)
**Solution**: 
- Verify nginx is proxying `/api/*` to port 9001
- Check backend is running on port 9001
- Verify firewall allows traffic on port 9001

### Issue: Images not loading
**Solution**:
- Check file permissions on `/var/www/techresona.com/`
- Verify nginx has read access to build directory
- Check browser console for CORS errors

### Issue: Contact form not working
**Solution**:
- Verify backend API endpoint: `/api/contact/submit`
- Check MongoDB connection
- Verify SMTP credentials in backend/.env
- Check backend logs for errors

### Issue: SEO files (sitemap.xml) not accessible
**Solution**:
- Verify nginx location block for `/sitemap.xml`
- Check backend route is working: `curl localhost:9001/sitemap.xml`
- Ensure proxy_pass is configured correctly

### Issue: Frontend shows old content after deployment
**Solution**:
- Clear nginx cache: `sudo nginx -s reload`
- Clear browser cache (hard refresh: Ctrl+Shift+R)
- Verify build files are updated on server

---

## 📝 Maintenance

### Backend Logs
```bash
# Backend application logs
tail -f /var/log/techresona-backend/app.log

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### Database Backup
```bash
# Create backup
mongodump --db test_database --out /backups/$(date +%Y%m%d)

# Restore backup
mongorestore --db test_database /backups/20250117/test_database/
```

### SSL Certificate Renewal (Let's Encrypt)
```bash
# Renew certificate
sudo certbot renew

# Test renewal process
sudo certbot renew --dry-run
```

---

## 🎯 Next Steps

### Immediate Actions:
1. ✅ Backend running on port 9001
2. ✅ Database restored with production data
3. ✅ Production build created and optimized
4. ⏳ Deploy build files to production server
5. ⏳ Configure nginx proxy rules
6. ⏳ Test all functionality on production domain

### Future Enhancements:
- [ ] Set up automated backups (daily MongoDB dumps)
- [ ] Configure monitoring (Uptime monitoring, error tracking)
- [ ] Implement CDN for static assets
- [ ] Set up CI/CD pipeline for automated deployments
- [ ] Configure log aggregation and analysis
- [ ] Add performance monitoring (New Relic, Datadog)

---

## 📞 Support

### Contact Information:
- **Email**: info@techresona.com
- **Phone**: +91 7517402788
- **WhatsApp**: https://wa.me/917517402788

### Technical Support:
- **Backend Issues**: Check logs at `/var/log/techresona-backend/`
- **Frontend Issues**: Check nginx logs and browser console
- **Database Issues**: Check MongoDB logs and connection status

---

## 📚 Additional Resources

### Documentation:
- [Backend API Documentation](/app/backend/README.md)
- [Frontend Components Guide](/app/frontend/README.md)
- [Performance Optimization Guide](/app/PERFORMANCE_OPTIMIZATION_GUIDE.md)
- [SEO Configuration Guide](/app/backend/CONTENT_MANAGER_GUIDE.md)

### External Links:
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**Generated**: January 17, 2025  
**Build Version**: Production v1.0  
**Build Size**: 4.6MB  
**Status**: ✅ Ready for Deployment
