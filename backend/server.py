from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.responses import Response, PlainTextResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
        default_content = "User-agent: *\nAllow: /\nSitemap: https://crawler-friendly-web.preview.emergentagent.com/sitemap.xml"
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
    
    base_url = "https://crawler-friendly-web.preview.emergentagent.com"
    
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    static_pages = [
        {"loc": "/", "priority": "1.0"},
        {"loc": "/about", "priority": "0.8"},
        {"loc": "/services", "priority": "0.9"},
        {"loc": "/contact", "priority": "0.7"},
        {"loc": "/blog", "priority": "0.8"},
    ]
    
    for page in static_pages:
        sitemap += f'  <url>\n'
        sitemap += f'    <loc>{base_url}{page["loc"]}</loc>\n'
        sitemap += f'    <changefreq>weekly</changefreq>\n'
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
        return "User-agent: *\nAllow: /\nSitemap: https://crawler-friendly-web.preview.emergentagent.com/sitemap.xml"
    return robots['content']

@app.get("/sitemap.xml", response_class=Response)
async def sitemap_xml():
    blogs = await db.blogs.find({"published": True}, {"_id": 0, "slug": 1, "updated_at": 1}).to_list(1000)
    
    base_url = "https://crawler-friendly-web.preview.emergentagent.com"
    
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    static_pages = [
        {"loc": "/", "priority": "1.0"},
        {"loc": "/about", "priority": "0.8"},
        {"loc": "/services", "priority": "0.9"},
        {"loc": "/contact", "priority": "0.7"},
        {"loc": "/blog", "priority": "0.8"},
    ]
    
    for page in static_pages:
        sitemap += f'  <url>\n'
        sitemap += f'    <loc>{base_url}{page["loc"]}</loc>\n'
        sitemap += f'    <changefreq>weekly</changefreq>\n'
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