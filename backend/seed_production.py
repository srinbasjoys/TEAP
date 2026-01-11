#!/usr/bin/env python3
"""
Production Database Seeding Script for TechResona
Seeds all necessary data for production deployment
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext
import uuid
import sys

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'techresona_production')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Password hashing
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# Admin credentials
ADMIN_EMAIL = "admin@techresona.com"
ADMIN_PASSWORD = "TechResona2025!"

print("="*70)
print("TECHRESONA PRODUCTION DATABASE SEEDER")
print("="*70)
print(f"\nDatabase: {db_name}")
print(f"MongoDB URL: {mongo_url}")
print("="*70)

async def seed_admin():
    """Create admin user"""
    print("\n[1/4] Seeding Admin User...")
    
    existing = await db.admins.find_one({'email': ADMIN_EMAIL})
    if existing:
        print(f"  ⊘ Admin already exists: {ADMIN_EMAIL}")
        # Update password
        await db.admins.update_one(
            {'email': ADMIN_EMAIL},
            {'$set': {'password_hash': pwd_context.hash(ADMIN_PASSWORD)}}
        )
        print(f"  ✓ Password updated for: {ADMIN_EMAIL}")
    else:
        admin = {
            'id': str(uuid.uuid4()),
            'email': ADMIN_EMAIL,
            'password_hash': pwd_context.hash(ADMIN_PASSWORD),
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        await db.admins.insert_one(admin)
        print(f"  ✓ Created admin: {ADMIN_EMAIL}")
    
    print(f"\n  📧 Email: {ADMIN_EMAIL}")
    print(f"  🔑 Password: {ADMIN_PASSWORD}")

async def seed_seo_settings():
    """Seed SEO settings for all pages"""
    print("\n[2/4] Seeding SEO Settings...")
    
    seo_pages = {
        "home": {
            "page": "home",
            "title": "TechResona Pvt Ltd - Cloud Solutions & Managed Services | Azure, AWS, Office 365",
            "description": "Leading IT services provider in India offering Azure, AWS, Office 365, and Managed Services. Secure, scalable cloud solutions for SMBs and enterprises.",
            "keywords": "azure cloud solutions for small business, aws cloud solutions for small business, office 365 licensing for small business, managed services, power bi consulting services",
            "json_ld": {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "TechResona Pvt Ltd",
                "alternateName": "TechResona",
                "url": "https://techresona.com",
                "logo": "https://techresona.com/logo.png",
                "email": "info@techresona.com",
                "telephone": "+917517402788"
            }
        },
        "about": {
            "page": "about",
            "title": "About TechResona Pvt Ltd - Leading Cloud Solutions Provider in India",
            "description": "Learn about TechResona's mission to empower businesses with secure, scalable cloud solutions.",
            "keywords": "about techresona, cloud provider india, IT services company"
        },
        "services": {
            "page": "services",
            "title": "TechResona Pvt Ltd Services - Azure, AWS, Office 365, Power BI",
            "description": "Comprehensive cloud services for small businesses.",
            "keywords": "azure cloud solutions, aws cloud solutions, office 365 licensing"
        },
        "contact": {
            "page": "contact",
            "title": "Contact TechResona Pvt Ltd - Get Cloud Solutions",
            "description": "Get in touch with TechResona for cloud services.",
            "keywords": "contact techresona, cloud consultation"
        },
        "blog": {
            "page": "blog",
            "title": "TechResona Pvt Ltd Blog - Cloud Solutions Insights",
            "description": "Expert insights on cloud solutions for small businesses.",
            "keywords": "cloud blog, azure tips, aws best practices"
        }
    }
    
    for page_key, seo_data in seo_pages.items():
        existing = await db.seo_settings.find_one({"page": seo_data["page"]})
        if existing:
            print(f"  ⊘ SEO exists for: {seo_data['page']}")
        else:
            seo_data['id'] = str(uuid.uuid4())
            seo_data['updated_at'] = datetime.now(timezone.utc).isoformat()
            await db.seo_settings.insert_one(seo_data)
            print(f"  ✓ Created SEO for: {seo_data['page']}")

async def seed_blogs():
    """Seed all blog posts"""
    print("\n[3/4] Seeding Blog Posts...")
    
    # Check existing blogs
    existing_count = await db.blogs.count_documents({})
    
    if existing_count >= 5:
        print(f"  ⊘ {existing_count} blogs already exist. Skipping...")
        return
    
    print(f"  Current blog count: {existing_count}")
    print(f"  Running blog seed scripts...")
    
    # Import and run blog seeders
    import subprocess
    scripts = [
        'seed_blogs.py',
        'seed_remaining_blogs.py', 
        'seed_final_blogs.py',
        'seed_top11_blog.py'
    ]
    
    for script in scripts:
        script_path = ROOT_DIR / script
        if script_path.exists():
            try:
                result = subprocess.run(
                    ['python', str(script_path)],
                    cwd=str(ROOT_DIR),
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                if result.returncode == 0:
                    print(f"  ✓ Executed: {script}")
                else:
                    print(f"  ⚠ Warning from {script}: {result.stderr[:100]}")
            except Exception as e:
                print(f"  ⚠ Error running {script}: {str(e)[:100]}")
        else:
            print(f"  ⊘ Script not found: {script}")
    
    # Verify blogs
    final_count = await db.blogs.count_documents({})
    published_count = await db.blogs.count_documents({"published": True})
    print(f"\n  ✓ Total blogs: {final_count} ({published_count} published)")

async def seed_keywords():
    """Seed target keywords"""
    print("\n[4/4] Seeding Keywords...")
    
    keywords = [
        {"keyword": "azure cloud solutions for small business", "page": "services", "search_volume": 500},
        {"keyword": "aws cloud solutions for small business", "page": "services", "search_volume": 400},
        {"keyword": "office 365 licensing for small business", "page": "services", "search_volume": 300},
        {"keyword": "power bi consulting services", "page": "services", "search_volume": 150},
        {"keyword": "managed services for small businesses", "page": "services", "search_volume": 200},
        {"keyword": "microsoft azure consulting small business", "page": "services", "search_volume": 80},
        {"keyword": "aws managed services small business", "page": "services", "search_volume": 200},
        {"keyword": "cloud migration small business", "page": "blog", "search_volume": 150},
    ]
    
    added = 0
    for kw_data in keywords:
        existing = await db.keywords.find_one({"keyword": kw_data["keyword"]})
        if not existing:
            kw = {
                "id": str(uuid.uuid4()),
                "keyword": kw_data["keyword"],
                "page": kw_data["page"],
                "search_volume": kw_data.get("search_volume"),
                "ranking": None,
                "tracked_at": datetime.now(timezone.utc).isoformat()
            }
            await db.keywords.insert_one(kw)
            added += 1
    
    if added > 0:
        print(f"  ✓ Added {added} keywords")
    else:
        print(f"  ⊘ Keywords already exist")

async def verify_data():
    """Verify all data is seeded"""
    print("\n" + "="*70)
    print("VERIFICATION")
    print("="*70)
    
    admin_count = await db.admins.count_documents({})
    seo_count = await db.seo_settings.count_documents({})
    blog_count = await db.blogs.count_documents({})
    published_count = await db.blogs.count_documents({"published": True})
    keyword_count = await db.keywords.count_documents({})
    
    print(f"\n✓ Admins: {admin_count}")
    print(f"✓ SEO Settings: {seo_count}")
    print(f"✓ Blogs: {blog_count} ({published_count} published)")
    print(f"✓ Keywords: {keyword_count}")
    
    # List blog titles
    if blog_count > 0:
        print(f"\nBlog Posts:")
        blogs = await db.blogs.find({}, {"title": 1, "published": 1, "_id": 0}).to_list(100)
        for i, blog in enumerate(blogs, 1):
            status = "✓" if blog.get('published') else "✗"
            print(f"  {i}. {status} {blog['title'][:60]}...")
    
    print("\n" + "="*70)
    print("SEEDING COMPLETE!")
    print("="*70)
    print(f"\nAdmin Login:")
    print(f"  URL: https://techresona.com/admin/login")
    print(f"  Email: {ADMIN_EMAIL}")
    print(f"  Password: {ADMIN_PASSWORD}")
    print("\n" + "="*70)

async def main():
    try:
        await seed_admin()
        await seed_seo_settings()
        await seed_blogs()
        await seed_keywords()
        await verify_data()
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
