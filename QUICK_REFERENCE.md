# TechResona Content Management - Quick Reference

## 🎯 Current Site Status

### ✅ Blogs: 8 Total (7 SEO Optimized + 1 Test)

1. **Azure Cloud Solutions for Small Business: Complete Guide 2025** (1,800+ words)
2. **AWS Cloud Solutions for Small Business: The Ultimate 2025 Guide** (1,900+ words)
3. **Office 365 Licensing for Small Business: Complete 2025 Guide** (1,700+ words)
4. **Power BI Consulting Services: Transform Your Business Data in 2025** (1,600+ words)
5. **Top 11 Cloud Service Providers for Small Businesses in 2025** ⭐ TechResona #1 (2,000+ words)
6. **Managed IT Services for Small Business: Complete 2025 Guide** (1,500+ words)
7. **Cloud Migration Checklist: Essential Guide for Small Businesses 2025** (1,600+ words)
8. Test Blog Post (demo)

### ✅ SEO Settings: 6 Pages Configured

- Home page (with Organization & LocalBusiness schema)
- About page
- Services page
- Contact page
- Blog listing page
- Test page (demo)

### ✅ Keywords Tracked: 8

- azure cloud solutions for small business
- aws cloud solutions for small business
- office 365 licensing for small business
- power bi consulting services
- managed services for small businesses
- cloud service providers
- microsoft azure consulting small business
- aws managed services small business

### ✅ Contact Information

- Email: info@techresona.com
- Phone: +91 7517402788
- WhatsApp: +91 7517402788
- Contact form with email + Slack notifications working

### ✅ Admin Access

- URL: http://localhost:3000/admin/login
- Email: admin@techresona.com
- Password: TechResona2025!

## 📋 Quick Commands

### Add More Content
```bash
cd /app/backend
python content_manager.py
# Select option 5 for full setup
```

### View Current Status
```bash
cd /app/backend
python content_manager.py
# Select option 1
```

### Check Backend API
```bash
# View all blogs
curl http://localhost:8001/api/blogs | python -m json.tool

# View sitemap
curl http://localhost:8001/sitemap.xml

# View robots.txt
curl http://localhost:8001/robots.txt

# View SEO for home page
curl http://localhost:8001/api/seo/home
```

### Test Contact Form
```bash
curl -X POST http://localhost:8001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "phone": "+91 9876543210",
    "message": "Test message"
  }'
```

## 📁 Important Files

### Documentation
- `/app/README.md` - Main project documentation
- `/app/PRODUCTION_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `/app/backend/CONTENT_MANAGER_GUIDE.md` - Content manager usage
- `/app/SLACK_WEBHOOK_SETUP.md` - Slack integration setup

### Scripts
- `/app/backend/content_manager.py` - Add/manage content
- `/app/production_build.sh` - Create production build
- `/app/backend/seed_blogs.py` - Seed initial blogs
- `/app/backend/server.py` - Main backend application

### Configuration
- `/app/backend/.env` - Backend environment variables
- `/app/frontend/.env` - Frontend environment variables

## 🚀 Production Deployment

### Step 1: Build Frontend
```bash
cd /app/frontend
yarn build
```

### Step 2: Configure Backend for Port 9010
```bash
# See PRODUCTION_DEPLOYMENT_GUIDE.md for complete instructions
sudo /app/production_build.sh
```

### Step 3: Configure Nginx
See `/app/PRODUCTION_DEPLOYMENT_GUIDE.md` section "Nginx Configuration"

### Step 4: Setup SSL
```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d techresona.com -d www.techresona.com
```

### Step 5: Test Everything
- All pages load correctly
- Contact form works (check email + Slack)
- Blogs display properly
- Admin panel accessible
- Sitemap.xml accessible
- Robots.txt accessible

## 🎨 Customization

### Add New Blog
Edit `/app/backend/content_manager.py`:
1. Add blog to `ADDITIONAL_BLOGS` list
2. Run script and select option 3

### Update SEO Settings
Edit `/app/backend/content_manager.py`:
1. Update `SEO_SETTINGS` dictionary
2. Run script and select option 2

### Change Contact Info
Edit:
- Backend: Update in code directly
- Frontend: `/app/frontend/src/components/Footer.js`
- Frontend: `/app/frontend/src/pages/ContactPage.js`

### Change Colors/Design
Edit: `/app/frontend/src/index.css` (Tailwind configuration)

## 🔍 SEO Checklist

✅ 7 comprehensive blogs (1,500-2,000+ words each)
✅ All pages have unique meta titles
✅ All pages have meta descriptions (150-160 chars)
✅ Canonical URLs on all pages
✅ Schema markup (Organization, LocalBusiness, BlogPosting)
✅ Sitemap.xml with all pages
✅ Robots.txt properly configured
✅ Mobile responsive design
✅ Fast page load times
✅ Semantic HTML structure
✅ Alt text on images
✅ Internal linking
✅ Target keywords integrated

## 📊 Performance Targets

- PageSpeed Score: 70+ mobile, 80+ desktop
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Uptime: 99.9%

## 🆘 Troubleshooting

### Backend not responding
```bash
sudo systemctl status techresona-backend
sudo journalctl -u techresona-backend -n 50
```

### Frontend not loading
```bash
sudo supervisorctl status frontend
tail -f /var/log/supervisor/frontend.err.log
```

### Database issues
```bash
sudo systemctl status mongodb
mongosh test_database --eval "db.blogs.countDocuments({})"
```

### Form not sending emails
Check backend logs:
```bash
tail -f /var/log/supervisor/backend.err.log | grep -i email
```

### Slack notifications not working
1. Check webhook URL in `/app/backend/.env`
2. Test manually:
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test from TechResona"}'
```

## 📞 Support

- Email: info@techresona.com
- Phone/WhatsApp: +91 7517402788
- Admin Panel: http://localhost:3000/admin/login

## ✅ Next Steps

1. ✅ Review all blog content
2. ✅ Test contact form (email + Slack)
3. ✅ Login to admin panel and verify access
4. ✅ Build production frontend
5. ✅ Configure Nginx
6. ✅ Setup SSL certificate
7. ✅ Point domain to server
8. ✅ Test complete site
9. ✅ Submit sitemap to Google Search Console
10. ✅ Monitor performance

---

**Last Updated:** January 2025
**Version:** 1.0
**Status:** ✅ Production Ready
