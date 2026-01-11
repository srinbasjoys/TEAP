# TechResona Content Manager

Easy-to-use script for managing blogs, SEO settings, and other content on your TechResona website.

## Features

✅ **View Site Status** - See all current content (blogs, SEO, keywords, etc.)  
✅ **Manage SEO Settings** - Update meta tags, descriptions, and schema for all pages  
✅ **Add Blogs** - Add new SEO-optimized blog posts  
✅ **Track Keywords** - Add keywords for SEO monitoring  
✅ **Full Setup** - Do everything at once

## Quick Start

```bash
cd /app/backend
python content_manager.py
```

Then select from the menu:
- `1` - View current site content status
- `2` - Update SEO settings for all pages
- `3` - Add 2 new comprehensive blogs
- `4` - Add sample keywords for tracking
- `5` - Do everything (recommended for first run)
- `6` - Exit

## What Gets Added

### SEO Settings (Option 2)
Updates SEO meta tags, descriptions, and keywords for:
- Home page
- About page
- Services page
- Contact page
- Blog listing page

Includes Organization and LocalBusiness schema markup.

### Additional Blogs (Option 3)
Adds 2 more comprehensive blogs:

1. **Managed IT Services for Small Business: Complete 2025 Guide**
   - 1,500+ words
   - Keywords: managed services for small businesses, managed it services
   - Topics: Benefits, pricing, choosing MSP, ROI

2. **Cloud Migration Checklist: Essential Guide for Small Businesses 2025**
   - 1,600+ words
   - Keywords: cloud migration small business, aws cloud migration, azure cloud migration
   - Topics: Planning, execution, post-migration, common challenges

### Keywords (Option 4)
Adds 8 target keywords for tracking:
- azure cloud solutions for small business
- aws cloud solutions for small business
- office 365 licensing for small business
- power bi consulting services
- managed services for small businesses
- cloud service providers
- microsoft azure consulting small business
- aws managed services small business

## Current Site Content

After running the initial blog seeds, your site has:

**Existing Blogs (5):**
1. Azure Cloud Solutions for Small Business: Complete Guide 2025
2. AWS Cloud Solutions for Small Business: The Ultimate 2025 Guide
3. Office 365 Licensing for Small Business: Complete 2025 Guide
4. Power BI Consulting Services: Transform Your Business Data in 2025
5. Top 11 Cloud Service Providers for Small Businesses in 2025 (TechResona #1)

**Total After Adding New Blogs: 7 comprehensive articles**

## Adding Your Own Content

### To Add a New Blog:

1. Open `content_manager.py`
2. Find the `ADDITIONAL_BLOGS` list
3. Add your blog following this format:

```python
{
    "id": "your-blog-slug",
    "slug": "your-blog-slug",
    "title": "Your Blog Title",
    "excerpt": "Short description (150-160 chars)",
    "keywords": "keyword1, keyword2, keyword3",
    "meta_description": "SEO description (150-160 chars)",
    "author": "TechResona Team",
    "published": True,
    "featured_image": "https://images.unsplash.com/photo-xxxxx?w=1200",
    "content": """<article>
        <h2>Your heading</h2>
        <p>Your content...</p>
    </article>"""
}
```

4. Run the script and select option 3

### To Update SEO Settings:

1. Open `content_manager.py`
2. Find the `SEO_SETTINGS` dictionary
3. Update the page settings:

```python
"page_name": {
    "page": "page_name",
    "title": "Page Title | TechResona",
    "description": "Page description",
    "keywords": "keyword1, keyword2, keyword3",
    "json_ld": {...}  # Optional schema markup
}
```

4. Run the script and select option 2

## Verifying Changes

After adding content, verify it's working:

### Check Blogs:
```bash
curl http://localhost:8001/api/blogs
```

### Check SEO Settings:
```bash
curl http://localhost:8001/api/seo/home
```

### Check Keywords:
```bash
# Requires admin token
curl http://localhost:8001/api/keywords \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View in Admin Panel:
1. Login: http://localhost:3000/admin/login
2. Email: admin@techresona.com
3. Password: TechResona2025!

## Tips

💡 **Before Production:** Run option 5 (Do Everything) to ensure all content is ready

💡 **SEO Best Practices:** 
- Keep titles under 60 characters
- Keep descriptions between 150-160 characters
- Use target keywords naturally
- Include schema markup for better search results

💡 **Blog Writing:**
- Aim for 1,500+ words for SEO
- Use H2 and H3 headings
- Include lists and bullet points
- Add internal links to other pages
- Use target keywords in first 100 words

💡 **Performance:** All changes take effect immediately, no restart needed

## Troubleshooting

**Error: "Can't connect to MongoDB"**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb
# Start if needed
sudo systemctl start mongodb
```

**Error: "Permission denied"**
```bash
# Make script executable
chmod +x /app/backend/content_manager.py
```

**Content not showing on website:**
- Check if blog `published` is set to `True`
- Clear browser cache
- Restart frontend: `sudo supervisorctl restart frontend`

## Database Collections

The script manages these MongoDB collections:
- `blogs` - Blog posts
- `seo_settings` - SEO meta tags and schema
- `keywords` - Tracked keywords
- `contact_submissions` - Form submissions
- `admins` - Admin users

## Support

For help or questions:
- Email: info@techresona.com
- Phone: +91 7517402788
- Documentation: /app/README.md
- Deployment Guide: /app/PRODUCTION_DEPLOYMENT_GUIDE.md
