from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.responses import Response, PlainTextResponse, FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiohttp
import json
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "techresona-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminCreate(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class SEOSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: str
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    og_image: Optional[str] = None
    json_ld: Optional[Dict[str, Any]] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SEOSettingsCreate(BaseModel):
    page: str
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    og_image: Optional[str] = None
    json_ld: Optional[Dict[str, Any]] = None

class RobotsTxt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RobotsTxtCreate(BaseModel):
    content: str

class Blog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    excerpt: str
    content: str
    keywords: str
    meta_description: str
    author: str = "TechResona Team"
    published: bool = True
    featured_image: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogCreate(BaseModel):
    slug: str
    title: str
    excerpt: str
    content: str
    keywords: str
    meta_description: str
    author: Optional[str] = "TechResona Team"
    published: Optional[bool] = True
    featured_image: Optional[str] = None

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    keywords: Optional[str] = None
    meta_description: Optional[str] = None
    published: Optional[bool] = None
    featured_image: Optional[str] = None

class Keyword(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    keyword: str
    page: str
    ranking: Optional[int] = None
    search_volume: Optional[int] = None
    difficulty: Optional[str] = None
    tracked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class KeywordCreate(BaseModel):
    keyword: str
    page: str
    ranking: Optional[int] = None
    search_volume: Optional[int] = None
    difficulty: Optional[str] = None

class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    message: str
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"  # new, contacted, closed

class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    message: str

class AnalyticsData(BaseModel):
    total_pages: int
    total_blogs: int
    total_keywords: int
    recent_updates: List[str]

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def send_email(to_email: str, subject: str, body: str):
    """Send email using SMTP"""
    try:
        smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        smtp_user = os.environ.get("SMTP_USER")
        smtp_password = os.environ.get("SMTP_PASSWORD")
        
        message = MIMEMultipart("alternative")
        message["From"] = smtp_user
        message["To"] = to_email
        message["Subject"] = subject
        
        html_part = MIMEText(body, "html")
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True,
        )
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

async def send_slack_notification(message: str):
    """Send notification to Slack using webhook"""
    try:
        webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
        
        # If webhook URL is not set or is placeholder, skip Slack notification
        if not webhook_url or "YOUR_WEBHOOK_URL" in webhook_url:
            logger.warning("Slack webhook URL not configured, skipping Slack notification")
            return False
            
        payload = {
            "text": message,
            "username": "TechResona Contact Form",
            "icon_emoji": ":email:"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(webhook_url, json=payload) as response:
                if response.status == 200:
                    logger.info("Slack notification sent successfully")
                    return True
                else:
                    logger.error(f"Slack notification failed with status {response.status}")
                    return False
    except Exception as e:
        logger.error(f"Failed to send Slack notification: {str(e)}")
        return False

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    admin = await db.admins.find_one({"email": email}, {"_id": 0})
    if admin is None:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin

@api_router.post("/auth/register", response_model=TokenResponse)
async def register_admin(admin_data: AdminCreate):
    existing = await db.admins.find_one({"email": admin_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = get_password_hash(admin_data.password)
    admin = Admin(email=admin_data.email, password_hash=password_hash)
    
    doc = admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.admins.insert_one(doc)
    
    access_token = create_access_token(data={"sub": admin.email})
    return TokenResponse(access_token=access_token, token_type="bearer")

@api_router.post("/auth/login", response_model=TokenResponse)
async def login_admin(login_data: AdminLogin):
    admin = await db.admins.find_one({"email": login_data.email}, {"_id": 0})
    if not admin or not verify_password(login_data.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": admin['email']})
    return TokenResponse(access_token=access_token, token_type="bearer")

@api_router.get("/seo", response_model=List[SEOSettings])
async def get_all_seo_settings():
    settings = await db.seo_settings.find({}, {"_id": 0}).to_list(1000)
    for s in settings:
        if isinstance(s.get('updated_at'), str):
            s['updated_at'] = datetime.fromisoformat(s['updated_at'])
    return settings

@api_router.get("/seo/{page}", response_model=SEOSettings)
async def get_seo_settings(page: str):
    setting = await db.seo_settings.find_one({"page": page}, {"_id": 0})
    if not setting:
        raise HTTPException(status_code=404, detail="SEO settings not found")
    if isinstance(setting.get('updated_at'), str):
        setting['updated_at'] = datetime.fromisoformat(setting['updated_at'])
    return setting

@api_router.post("/seo", response_model=SEOSettings)
async def create_seo_settings(seo_data: SEOSettingsCreate, admin: dict = Depends(get_current_admin)):
    existing = await db.seo_settings.find_one({"page": seo_data.page}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="SEO settings already exist for this page")
    
    seo = SEOSettings(**seo_data.model_dump())
    doc = seo.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.seo_settings.insert_one(doc)
    return seo

@api_router.put("/seo/{page}", response_model=SEOSettings)
async def update_seo_settings(page: str, seo_data: SEOSettingsCreate, admin: dict = Depends(get_current_admin)):
    data = seo_data.model_dump()
    data['page'] = page
    seo = SEOSettings(**data)
    doc = seo.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    result = await db.seo_settings.update_one(
        {"page": page},
        {"$set": doc},
        upsert=True
    )
    return seo

@api_router.get("/robots-txt")
async def get_robots_txt():
    robots = await db.robots_txt.find_one({}, {"_id": 0}, sort=[("updated_at", -1)])
    if not robots:
        default_content = "User-agent: *\nAllow: /\nSitemap: https://deploy-ready-87.preview.emergentagent.com/sitemap.xml"
        return {"content": default_content}
    return {"content": robots['content']}

@api_router.put("/robots-txt", response_model=RobotsTxt)
async def update_robots_txt(robots_data: RobotsTxtCreate, admin: dict = Depends(get_current_admin)):
    robots = RobotsTxt(content=robots_data.content)
    doc = robots.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.robots_txt.delete_many({})
    await db.robots_txt.insert_one(doc)
    return robots

@api_router.get("/blogs", response_model=List[Blog])
async def get_all_blogs(published_only: bool = True):
    query = {"published": True} if published_only else {}
    blogs = await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for blog in blogs:
        if isinstance(blog.get('created_at'), str):
            blog['created_at'] = datetime.fromisoformat(blog['created_at'])
        if isinstance(blog.get('updated_at'), str):
            blog['updated_at'] = datetime.fromisoformat(blog['updated_at'])
    return blogs

@api_router.get("/blogs/{slug}", response_model=Blog)
async def get_blog(slug: str):
    blog = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if isinstance(blog.get('created_at'), str):
        blog['created_at'] = datetime.fromisoformat(blog['created_at'])
    if isinstance(blog.get('updated_at'), str):
        blog['updated_at'] = datetime.fromisoformat(blog['updated_at'])
    return blog

@api_router.post("/blogs", response_model=Blog)
async def create_blog(blog_data: BlogCreate, admin: dict = Depends(get_current_admin)):
    existing = await db.blogs.find_one({"slug": blog_data.slug}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Blog with this slug already exists")
    
    blog = Blog(**blog_data.model_dump())
    doc = blog.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.blogs.insert_one(doc)
    return blog

@api_router.put("/blogs/{slug}", response_model=Blog)
async def update_blog(slug: str, blog_data: BlogUpdate, admin: dict = Depends(get_current_admin)):
    existing = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    update_data = {k: v for k, v in blog_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.blogs.update_one({"slug": slug}, {"$set": update_data})
    
    updated_blog = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if isinstance(updated_blog.get('created_at'), str):
        updated_blog['created_at'] = datetime.fromisoformat(updated_blog['created_at'])
    if isinstance(updated_blog.get('updated_at'), str):
        updated_blog['updated_at'] = datetime.fromisoformat(updated_blog['updated_at'])
    return updated_blog

@api_router.delete("/blogs/{slug}")
async def delete_blog(slug: str, admin: dict = Depends(get_current_admin)):
    result = await db.blogs.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"message": "Blog deleted successfully"}

@api_router.post("/contact/submit", response_model=ContactSubmission)
async def submit_contact_form(contact_data: ContactSubmissionCreate):
    """Handle contact form submission with email and Slack notifications"""
    try:
        # Create contact submission record
        submission = ContactSubmission(**contact_data.model_dump())
        doc = submission.model_dump()
        doc['submitted_at'] = doc['submitted_at'].isoformat()
        await db.contact_submissions.insert_one(doc)
        
        # Prepare email content
        email_subject = f"New Contact Form Submission from {contact_data.name}"
        email_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4F46E5;">New Contact Form Submission</h2>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Name:</strong> {contact_data.name}</p>
                    <p><strong>Email:</strong> {contact_data.email}</p>
                    <p><strong>Company:</strong> {contact_data.company or 'Not provided'}</p>
                    <p><strong>Phone:</strong> {contact_data.phone or 'Not provided'}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4F46E5;">
                        {contact_data.message}
                    </p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    Submitted at: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
                </p>
            </body>
        </html>
        """
        
        # Send email notification
        contact_email = os.environ.get("CONTACT_EMAIL", "info@techresona.com")
        email_sent = await send_email(contact_email, email_subject, email_body)
        
        # Prepare Slack message
        slack_message = f"""
🆕 *New Contact Form Submission*

*Name:* {contact_data.name}
*Email:* {contact_data.email}
*Company:* {contact_data.company or 'Not provided'}
*Phone:* {contact_data.phone or 'Not provided'}

*Message:*
{contact_data.message}

_Submitted at: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}_
        """
        
        # Send Slack notification
        slack_sent = await send_slack_notification(slack_message)
        
        logger.info(f"Contact form submitted - Email: {email_sent}, Slack: {slack_sent}")
        
        return submission
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process contact form submission")

@api_router.get("/contact/submissions", response_model=List[ContactSubmission])
async def get_contact_submissions(admin: dict = Depends(get_current_admin)):
    """Get all contact form submissions (admin only)"""
    submissions = await db.contact_submissions.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(1000)
    for sub in submissions:
        if isinstance(sub.get('submitted_at'), str):
            sub['submitted_at'] = datetime.fromisoformat(sub['submitted_at'])
    return submissions

@api_router.post("/logo/upload")
async def upload_logo(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    """Upload a new logo (admin only)"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Define frontend public directory
        frontend_public_dir = Path(__file__).parent.parent / "frontend" / "public"
        frontend_public_dir.mkdir(parents=True, exist_ok=True)
        
        # Save as logo.png
        logo_path = frontend_public_dir / "logo.png"
        
        # Save the file
        with open(logo_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Save logo info to database
        logo_doc = {
            "id": str(uuid.uuid4()),
            "filename": file.filename,
            "uploaded_by": admin.get("email"),
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "path": "/logo.png"
        }
        await db.logos.insert_one(logo_doc)
        
        logger.info(f"Logo uploaded by {admin.get('email')}: {file.filename}")
        
        return {
            "message": "Logo uploaded successfully",
            "path": "/logo.png",
            "filename": file.filename
        }
    except Exception as e:
        logger.error(f"Error uploading logo: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload logo")

@api_router.get("/logo/current")
async def get_current_logo():
    """Get current logo information"""
    logo = await db.logos.find_one({}, {"_id": 0}, sort=[("uploaded_at", -1)])
    if logo:
        return logo
    return {"path": "/logo.png", "filename": "logo.png"}

@api_router.get("/logo/history")
async def get_logo_history(admin: dict = Depends(get_current_admin)):
    """Get logo upload history (admin only)"""
    logos = await db.logos.find({}, {"_id": 0}).sort("uploaded_at", -1).to_list(100)
    return logos

@api_router.get("/keywords", response_model=List[Keyword])
async def get_all_keywords(admin: dict = Depends(get_current_admin)):
    keywords = await db.keywords.find({}, {"_id": 0}).to_list(1000)
    for kw in keywords:
        if isinstance(kw.get('tracked_at'), str):
            kw['tracked_at'] = datetime.fromisoformat(kw['tracked_at'])
    return keywords

@api_router.post("/keywords", response_model=Keyword)
async def create_keyword(keyword_data: KeywordCreate, admin: dict = Depends(get_current_admin)):
    keyword = Keyword(**keyword_data.model_dump())
    doc = keyword.model_dump()
    doc['tracked_at'] = doc['tracked_at'].isoformat()
    await db.keywords.insert_one(doc)
    return keyword

@api_router.delete("/keywords/{keyword_id}")
async def delete_keyword(keyword_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.keywords.delete_one({"id": keyword_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Keyword not found")
    return {"message": "Keyword deleted successfully"}

@api_router.get("/analytics", response_model=AnalyticsData)
async def get_analytics(admin: dict = Depends(get_current_admin)):
    total_seo = await db.seo_settings.count_documents({})
    total_blogs = await db.blogs.count_documents({})
    total_keywords = await db.keywords.count_documents({})
    
    recent_blogs = await db.blogs.find({}, {"_id": 0, "title": 1, "updated_at": 1}).sort("updated_at", -1).limit(5).to_list(5)
    recent_updates = [blog['title'] for blog in recent_blogs]
    
    return AnalyticsData(
        total_pages=total_seo,
        total_blogs=total_blogs,
        total_keywords=total_keywords,
        recent_updates=recent_updates
    )

@api_router.get("/sitemap/generate")
async def generate_sitemap():
    blogs = await db.blogs.find({"published": True}, {"_id": 0, "slug": 1, "updated_at": 1}).to_list(1000)
    
    # Use environment variable for base URL, fallback to techresona.com for production
    base_url = os.environ.get('SITE_BASE_URL', 'https://deploy-ready-87.preview.emergentagent.com')
    
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
        {"loc": "/about", "priority": "0.8", "changefreq": "monthly"},
        {"loc": "/services", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/contact", "priority": "0.7", "changefreq": "monthly"},
        {"loc": "/blog", "priority": "0.8", "changefreq": "daily"},
    ]
    
    for page in static_pages:
        sitemap += f'  <url>\n'
        sitemap += f'    <loc>{base_url}{page["loc"]}</loc>\n'
        sitemap += f'    <changefreq>{page["changefreq"]}</changefreq>\n'
        sitemap += f'    <priority>{page["priority"]}</priority>\n'
        sitemap += f'  </url>\n'
    
    for blog in blogs:
        updated = blog.get('updated_at')
        if isinstance(updated, str):
            lastmod = updated.split('T')[0]
        else:
            lastmod = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        sitemap += f'  <url>\n'
        sitemap += f'    <loc>{base_url}/blog/{blog["slug"]}</loc>\n'
        sitemap += f'    <lastmod>{lastmod}</lastmod>\n'
        sitemap += f'    <changefreq>monthly</changefreq>\n'
        sitemap += f'    <priority>0.6</priority>\n'
        sitemap += f'  </url>\n'
    
    sitemap += '</urlset>'
    
    return Response(content=sitemap, media_type="application/xml")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt():
    robots = await db.robots_txt.find_one({}, {"_id": 0}, sort=[("updated_at", -1)])
    if not robots:
        default_content = """User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Crawl-delay
Crawl-delay: 1

# Sitemap
Sitemap: https://techresona.com/sitemap.xml"""
        return default_content
    return robots['content']

@app.get("/sitemap.xml", response_class=Response)
async def sitemap_xml():
    blogs = await db.blogs.find({"published": True}, {"_id": 0, "slug": 1, "updated_at": 1}).to_list(1000)
    
    base_url = "https://techresona.com"
    
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
        {"loc": "/about", "priority": "0.8", "changefreq": "monthly"},
        {"loc": "/services", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/contact", "priority": "0.7", "changefreq": "monthly"},
        {"loc": "/blog", "priority": "0.8", "changefreq": "daily"},
    ]
    
    for page in static_pages:
        sitemap += f'  <url>\n'
        sitemap += f'    <loc>{base_url}{page["loc"]}</loc>\n'
        sitemap += f'    <changefreq>{page["changefreq"]}</changefreq>\n'
        sitemap += f'    <priority>{page["priority"]}</priority>\n'
        sitemap += f'  </url>\n'
    
    for blog in blogs:
        updated = blog.get('updated_at')
        if isinstance(updated, str):
            lastmod = updated.split('T')[0]
        else:
            lastmod = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        sitemap += f'  <url>\n'
        sitemap += f'    <loc>{base_url}/blog/{blog["slug"]}</loc>\n'
        sitemap += f'    <lastmod>{lastmod}</lastmod>\n'
        sitemap += f'    <changefreq>monthly</changefreq>\n'
        sitemap += f'    <priority>0.6</priority>\n'
        sitemap += f'  </url>\n'
    
    sitemap += '</urlset>'
    
    return Response(content=sitemap, media_type="application/xml", headers={"Content-Type": "application/xml"})