import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

async def seed_database():
    print("Starting database seeding...")
    
    admin_email = "admin@techresona.com"
    existing_admin = await db.admins.find_one({"email": admin_email})
    
    if not existing_admin:
        admin_data = {
            "id": "admin-001",
            "email": admin_email,
            "password_hash": pwd_context.hash("admin123"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admins.insert_one(admin_data)
        print(f"✓ Created admin user: {admin_email} / admin123")
    else:
        print(f"✓ Admin user already exists: {admin_email}")
    
    blogs = [
        {
            "id": "blog-001",
            "slug": "cloud-migration-strategy-india-2025",
            "title": "Cloud Migration Strategy for Indian SMBs in 2025: A Complete Guide",
            "excerpt": "Discover proven cloud migration strategies tailored for Indian small and medium businesses. Learn cost-effective approaches to Azure and AWS migration.",
            "content": "Cloud migration has become essential for Indian SMBs looking to scale efficiently and reduce IT costs. In this comprehensive guide, we'll explore the key strategies for successful cloud migration in 2025.\\n\\nWhy Cloud Migration Matters for Indian Businesses\\n\\nIndian businesses are increasingly adopting cloud solutions due to reduced infrastructure costs, improved scalability, and enhanced security. With India's digital transformation accelerating, cloud adoption is no longer optional—it's necessary for competitive advantage.\\n\\nKey Steps for Successful Cloud Migration\\n\\n1. Assessment Phase: Evaluate your current infrastructure and identify workloads suitable for cloud migration.\\n\\n2. Planning Phase: Choose the right cloud provider (Azure or AWS) based on your business requirements and budget.\\n\\n3. Migration Phase: Use proven migration tools and methodologies to minimize downtime and data loss.\\n\\n4. Optimization Phase: Fine-tune your cloud resources for cost efficiency and performance.\\n\\nCost Considerations for Indian SMBs\\n\\nCloud migration can reduce IT costs by 30-40% for most Indian SMBs. Consider using reserved instances and right-sizing strategies to maximize savings.\\n\\nSecurity and Compliance\\n\\nEnsure your cloud migration includes robust security measures and complies with Indian data protection regulations. Both Azure and AWS offer India-specific data centers for compliance.\\n\\nConclusion\\n\\nCloud migration is a strategic investment that can transform your business. With proper planning and expert guidance, Indian SMBs can successfully migrate to the cloud and reap significant benefits.",
            "keywords": "cloud migration India, SMB cloud strategy, Azure migration India, AWS migration guide, cloud cost optimization India",
            "meta_description": "Learn proven cloud migration strategies for Indian SMBs. Complete guide covering Azure and AWS migration, cost optimization, and security best practices for 2025.",
            "author": "TechResona Team",
            "published": True,
            "featured_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=srgb&fm=jpg&q=85",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "blog-002",
            "slug": "azure-cost-optimization-tips-indian-enterprises",
            "title": "10 Azure Cost Optimization Tips for Indian Enterprises in 2025",
            "excerpt": "Reduce your Azure cloud costs by up to 50% with these proven optimization strategies designed specifically for Indian enterprises.",
            "content": "Azure cloud services offer tremendous value, but without proper optimization, costs can spiral. Here are 10 actionable tips to optimize your Azure spending in 2025.\\n\\n1. Implement Auto-Scaling\\n\\nUse Azure's auto-scaling features to automatically adjust resources based on demand. This prevents over-provisioning during low-traffic periods.\\n\\n2. Use Azure Reserved Instances\\n\\nCommit to 1 or 3-year reserved instances for predictable workloads and save up to 72% compared to pay-as-you-go pricing.\\n\\n3. Right-Size Your Resources\\n\\nRegularly audit your virtual machines and databases. Downsize underutilized resources to match actual usage patterns.\\n\\n4. Leverage Azure Hybrid Benefit\\n\\nIf you have existing Windows Server or SQL Server licenses, use Azure Hybrid Benefit to save on licensing costs.\\n\\n5. Implement Azure Cost Management Tools\\n\\nUse Azure Cost Management + Billing to track spending, set budgets, and receive alerts when costs exceed thresholds.\\n\\n6. Optimize Storage Costs\\n\\nMove infrequently accessed data to cool or archive storage tiers. This can reduce storage costs by up to 80%.\\n\\n7. Use Azure Advisor Recommendations\\n\\nAzure Advisor provides personalized recommendations for cost optimization. Review and implement these suggestions regularly.\\n\\n8. Implement Tagging Strategy\\n\\nUse resource tags to track costs by department, project, or environment. This enables better cost allocation and accountability.\\n\\n9. Delete Unused Resources\\n\\nRegularly identify and delete unused virtual machines, storage accounts, and other resources that accumulate over time.\\n\\n10. Consider Azure Spot VMs\\n\\nFor non-critical workloads, use Azure Spot VMs to access unused capacity at significantly reduced rates.\\n\\nConclusion\\n\\nImplementing these cost optimization strategies can significantly reduce your Azure spending while maintaining performance and reliability.",
            "keywords": "Azure cost optimization, reduce Azure costs India, Azure pricing tips, cloud cost management, Azure reserved instances India",
            "meta_description": "Discover 10 proven Azure cost optimization tips for Indian enterprises. Learn how to reduce cloud costs by up to 50% with reserved instances, right-sizing, and more.",
            "author": "TechResona Team",
            "published": True,
            "featured_image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=srgb&fm=jpg&q=85",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "blog-003",
            "slug": "seo-best-practices-small-business-websites-india",
            "title": "SEO Best Practices for Small Business Websites in India 2025",
            "excerpt": "Boost your small business website's visibility on Google with these proven SEO strategies tailored for the Indian market.",
            "content": "Search Engine Optimization (SEO) is crucial for small businesses in India to compete in the digital marketplace. Here's your comprehensive guide to SEO success in 2025.\\n\\nUnderstanding Indian Search Behavior\\n\\nIndian users increasingly search in local languages and use mobile devices. Optimize for both English and regional language searches to maximize reach.\\n\\nKeyword Research for Indian Market\\n\\n1. Focus on Long-Tail Keywords: Target specific phrases like 'affordable cloud solutions in Mumbai' rather than generic terms.\\n\\n2. Include Location-Based Keywords: Add city and region names to capture local search traffic.\\n\\n3. Analyze Competitor Keywords: Study successful competitors to identify keyword opportunities.\\n\\nTechnical SEO Essentials\\n\\n1. Mobile Optimization: Ensure your website is fully responsive. Over 80% of Indian internet users access websites via mobile devices.\\n\\n2. Page Speed: Optimize loading times to under 3 seconds. Use tools like Google PageSpeed Insights to identify improvements.\\n\\n3. Structured Data: Implement JSON-LD schemas for better search engine understanding.\\n\\n4. XML Sitemap: Create and submit sitemaps to Google Search Console and Bing Webmaster Tools.\\n\\nContent Strategy\\n\\n1. Create Valuable Content: Write helpful, informative content that addresses your audience's questions.\\n\\n2. Regular Updates: Publish new content consistently to signal website activity to search engines.\\n\\n3. Local Content: Create region-specific content to capture local search traffic.\\n\\nLocal SEO for Indian Businesses\\n\\n1. Google My Business: Claim and optimize your GMB listing with accurate information and photos.\\n\\n2. Local Citations: List your business in Indian directories like JustDial and Sulekha.\\n\\n3. Reviews: Encourage satisfied customers to leave positive reviews on Google.\\n\\nLink Building Strategies\\n\\n1. Guest Blogging: Write for reputable Indian business blogs and websites.\\n\\n2. Industry Partnerships: Collaborate with complementary businesses for mutual linking opportunities.\\n\\n3. Quality Over Quantity: Focus on earning links from authoritative, relevant websites.\\n\\nMeasuring SEO Success\\n\\nUse Google Analytics and Google Search Console to track organic traffic, keyword rankings, and user behavior. Set specific KPIs and monitor progress monthly.\\n\\nConclusion\\n\\nEffective SEO requires consistent effort and adaptation to algorithm changes. Implement these strategies systematically to improve your website's search visibility and attract more customers.",
            "keywords": "SEO India, small business SEO, local SEO India, Google ranking tips, website optimization India",
            "meta_description": "Master SEO for your Indian small business website. Learn keyword research, technical SEO, content strategy, and local optimization tactics to rank higher on Google in 2025.",
            "author": "TechResona Team",
            "published": True,
            "featured_image": "https://images.unsplash.com/photo-1432888622747-4eb9a8a2c293?crop=entropy&cs=srgb&fm=jpg&q=85",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "blog-004",
            "slug": "office-365-migration-guide-indian-companies",
            "title": "Complete Office 365 Migration Guide for Indian Companies",
            "excerpt": "Migrate to Office 365 seamlessly with this step-by-step guide. Learn best practices, common pitfalls, and cost-saving strategies.",
            "content": "Office 365 (Microsoft 365) has become the productivity suite of choice for Indian businesses. This comprehensive guide will help you plan and execute a smooth migration.\\n\\nWhy Migrate to Office 365?\\n\\nOffice 365 offers cloud-based productivity tools, enhanced collaboration features, automatic updates, and robust security—all at a predictable monthly cost.\\n\\nPre-Migration Planning\\n\\n1. Assessment: Inventory your current email, documents, and collaboration tools.\\n\\n2. License Selection: Choose appropriate Office 365 plans based on user requirements.\\n\\n3. Timeline: Plan migration during low-activity periods to minimize disruption.\\n\\n4. Communication: Inform all stakeholders about the migration schedule and expected changes.\\n\\nMigration Steps\\n\\n1. Domain Verification\\n\\nVerify domain ownership in Office 365 admin center by adding DNS records.\\n\\n2. User Account Creation\\n\\nCreate user accounts in Office 365 matching your current directory structure.\\n\\n3. Email Migration\\n\\nUse Microsoft's migration tools for Exchange, IMAP, or PST file migrations. For large organizations, consider staged or hybrid migrations.\\n\\n4. Data Migration\\n\\nMigrate files from local servers to OneDrive and SharePoint Online.\\n\\n5. Client Configuration\\n\\nConfigure Outlook and other Office applications on user devices.\\n\\n6. DNS Cutover\\n\\nUpdate MX records to route email through Office 365.\\n\\nPost-Migration Tasks\\n\\n1. User Training: Conduct training sessions on new features and workflows.\\n\\n2. Security Configuration: Enable multi-factor authentication and data loss prevention policies.\\n\\n3. Backup Solution: Implement third-party backup for Office 365 data.\\n\\n4. Monitoring: Use Office 365 admin center to monitor service health and usage.\\n\\nCost Optimization Tips\\n\\n1. Annual Commitment: Save up to 20% by committing to annual licenses instead of monthly.\\n\\n2. Right Licensing: Don't over-license users. Assign appropriate plans based on actual needs.\\n\\n3. Azure Hybrid Benefit: Leverage existing Windows and Office licenses.\\n\\nCommon Migration Challenges\\n\\n1. Mailbox Size Limits: Plan for large mailboxes that may need archiving.\\n\\n2. Internet Bandwidth: Ensure sufficient bandwidth for initial data transfer.\\n\\n3. Legacy Applications: Test compatibility of custom applications with Office 365.\\n\\n4. User Adoption: Address resistance to change through training and support.\\n\\nConclusion\\n\\nOffice 365 migration requires careful planning and execution. With proper preparation and expert guidance, Indian companies can successfully migrate and enjoy enhanced productivity and collaboration.",
            "keywords": "Office 365 migration India, Microsoft 365 setup, email migration guide, cloud productivity India, Office 365 best practices",
            "meta_description": "Complete guide to Office 365 migration for Indian companies. Learn migration steps, best practices, cost optimization, and common challenges to ensure smooth transition.",
            "author": "TechResona Team",
            "published": True,
            "featured_image": "https://images.unsplash.com/photo-1553877522-43269d4ea984?crop=entropy&cs=srgb&fm=jpg&q=85",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "blog-005",
            "slug": "managed-services-benefits-startups-india",
            "title": "5 Reasons Why Indian Startups Need Managed IT Services",
            "excerpt": "Discover how managed IT services can help Indian startups focus on growth while ensuring reliable, secure infrastructure at predictable costs.",
            "content": "Indian startups face unique challenges in managing IT infrastructure while focusing on core business growth. Managed IT services offer a compelling solution.\\n\\n1. Cost Predictability and Reduction\\n\\nBuilding an in-house IT team is expensive. Managed services provide enterprise-grade IT support at a fraction of the cost, with predictable monthly pricing that aids budget planning.\\n\\nFor startups, this means:\\n- No hiring and training costs\\n- No infrastructure investment\\n- Predictable operating expenses\\n- Scalable services that grow with your business\\n\\n2. Access to Expert Talent\\n\\nManaged service providers employ certified professionals with expertise across multiple technologies. Startups gain access to:\\n- Cloud architects\\n- Security specialists\\n- Database administrators\\n- Network engineers\\n\\nThis expertise would be impossible to afford in-house for most startups.\\n\\n3. 24/7 Monitoring and Support\\n\\nDowntime costs startups revenue and reputation. Managed services provide:\\n- Round-the-clock infrastructure monitoring\\n- Proactive issue detection and resolution\\n- Rapid incident response\\n- Regular system maintenance\\n\\nThis ensures your systems remain operational even outside business hours.\\n\\n4. Enhanced Security and Compliance\\n\\nCybersecurity threats are growing in India. Managed services offer:\\n- Enterprise-grade security tools\\n- Regular security patches and updates\\n- Compliance with data protection regulations\\n- Backup and disaster recovery solutions\\n\\nFor startups handling customer data, this protection is invaluable.\\n\\n5. Focus on Core Business\\n\\nManaged services free startup founders and teams to focus on:\\n- Product development\\n- Customer acquisition\\n- Market expansion\\n- Revenue generation\\n\\nInstead of firefighting IT issues, teams can concentrate on activities that drive business growth.\\n\\nChoosing the Right Managed Service Provider\\n\\nWhen selecting a managed service provider, consider:\\n\\n1. Experience with Startups: Choose providers who understand startup dynamics and growth challenges.\\n\\n2. Service Level Agreements: Ensure clear SLAs for response times and uptime guarantees.\\n\\n3. Scalability: Verify the provider can scale services as your startup grows.\\n\\n4. Technology Stack: Confirm expertise in your preferred cloud platforms and tools.\\n\\n5. References: Check reviews and ask for startup client references.\\n\\nCost Comparison\\n\\nA typical Indian startup might spend:\\n- In-house IT team: ₹50-80 lakhs annually\\n- Managed services: ₹15-30 lakhs annually\\n\\nThe savings can be redirected to product development and marketing.\\n\\nReal-World Example\\n\\nA Mumbai-based fintech startup reduced IT costs by 60% after switching to managed services. They eliminated three full-time IT positions while improving system reliability from 95% to 99.9% uptime.\\n\\nConclusion\\n\\nFor Indian startups focused on rapid growth, managed IT services provide a strategic advantage. They offer professional IT management at startup-friendly prices, allowing founders to focus on building great products and acquiring customers.",
            "keywords": "managed IT services India, startup IT solutions, IT outsourcing startups, cloud management India, 24/7 IT support",
            "meta_description": "Learn why Indian startups are choosing managed IT services. Discover benefits including cost savings, expert support, 24/7 monitoring, and enhanced security.",
            "author": "TechResona Team",
            "published": True,
            "featured_image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=srgb&fm=jpg&q=85",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for blog in blogs:
        existing = await db.blogs.find_one({"slug": blog["slug"]})
        if not existing:
            await db.blogs.insert_one(blog)
            print(f"✓ Created blog: {blog['title']}")
        else:
            print(f"✓ Blog already exists: {blog['title']}")
    
    default_seo_settings = [
        {
            "id": "seo-home",
            "page": "home",
            "title": "TechResona - Cloud Solutions & Managed Services | Azure, AWS, Office 365",
            "description": "Leading IT services provider in India offering Azure, AWS, Office 365, and Managed Services. Secure, scalable cloud solutions for SMBs and enterprises.",
            "keywords": "cloud services india, azure solutions, aws cloud, managed services, office 365, IT services, website development, SEO services",
            "og_image": "https://images.unsplash.com/photo-1633174074875-f09b1b53ecf6?crop=entropy&cs=srgb&fm=jpg&q=85",
            "json_ld": {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "TechResona Pvt Ltd",
                "url": "https://cacheboost-2.preview.emergentagent.com",
                "logo": "https://cacheboost-2.preview.emergentagent.com/logo.png",
                "description": "Leading cloud solutions and IT services provider in India",
                "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "IN"
                },
                "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "info@techresona.com",
                    "contactType": "customer service"
                }
            },
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for seo in default_seo_settings:
        existing = await db.seo_settings.find_one({"page": seo["page"]})
        if not existing:
            await db.seo_settings.insert_one(seo)
            print(f"✓ Created SEO settings for: {seo['page']}")
        else:
            print(f"✓ SEO settings already exist for: {seo['page']}")
    
    default_robots = {
        "id": "robots-001",
        "content": "User-agent: *\\nAllow: /\\nDisallow: /admin\\n\\nSitemap: https://cacheboost-2.preview.emergentagent.com/sitemap.xml",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_robots = await db.robots_txt.find_one({})
    if not existing_robots:
        await db.robots_txt.insert_one(default_robots)
        print("✓ Created robots.txt")
    else:
        print("✓ robots.txt already exists")
    
    print("\\n✅ Database seeding completed!")
    print("\\nAdmin Login Credentials:")
    print("Email: admin@techresona.com")
    print("Password: admin123")
    print("\\nPlease change the password after first login.")

if __name__ == "__main__":
    asyncio.run(seed_database())
