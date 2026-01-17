import requests
import sys
import json
from datetime import datetime

class TechResonaAPITester:
    def __init__(self, base_url="https://deploy-ready-87.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            return False, {}

    def test_seo_endpoints(self):
        """Test SEO verification endpoints"""
        print("\n📋 Testing SEO Endpoints...")
        
        # Test robots.txt
        robots_success, _ = self.run_test(
            "robots.txt endpoint",
            "GET",
            f"{self.base_url}/robots.txt",
            200
        )
        
        # Test sitemap.xml
        sitemap_success, _ = self.run_test(
            "sitemap.xml endpoint",
            "GET", 
            f"{self.base_url}/sitemap.xml",
            200
        )
        
        return robots_success and sitemap_success

    def test_authentication(self):
        """Test admin authentication"""
        print("\n🔐 Testing Authentication...")
        
        # Test login with correct credentials
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@techresona.com", "password": "admin123"}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"✅ Token obtained: {self.token[:20]}...")
            return True
        else:
            print("❌ Failed to get authentication token")
            return False

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("\n🌐 Testing Public Endpoints...")
        
        # Test get all blogs (public)
        blogs_success, blogs_response = self.run_test(
            "Get Public Blogs",
            "GET",
            "blogs",
            200
        )
        
        blog_detail_success = False
        if blogs_success and blogs_response and len(blogs_response) > 0:
            # Test get specific blog
            first_blog_slug = blogs_response[0]['slug']
            blog_detail_success, _ = self.run_test(
                f"Get Blog Detail ({first_blog_slug})",
                "GET",
                f"blogs/{first_blog_slug}",
                200
            )
        
        # Test get SEO settings (public)
        seo_success, _ = self.run_test(
            "Get SEO Settings",
            "GET",
            "seo",
            200
        )
        
        return blogs_success and blog_detail_success and seo_success

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.token:
            print("❌ No authentication token available for admin tests")
            return False
            
        print("\n👨‍💼 Testing Admin Endpoints...")
        
        # Test analytics
        analytics_success, analytics_data = self.run_test(
            "Get Analytics",
            "GET",
            "analytics",
            200
        )
        
        # Test keywords
        keywords_success, _ = self.run_test(
            "Get Keywords",
            "GET",
            "keywords",
            200
        )
        
        # Test robots.txt management
        robots_get_success, robots_data = self.run_test(
            "Get robots.txt content",
            "GET",
            "robots-txt",
            200
        )
        
        # Test sitemap generation
        sitemap_gen_success, _ = self.run_test(
            "Generate Sitemap",
            "GET",
            "sitemap/generate",
            200
        )
        
        return analytics_success and keywords_success and robots_get_success and sitemap_gen_success

    def test_seo_management(self):
        """Test SEO management functionality"""
        if not self.token:
            print("❌ No authentication token available for SEO tests")
            return False
            
        print("\n🔍 Testing SEO Management...")
        
        # Test create/update SEO settings
        seo_data = {
            "page": "test-page",
            "title": "Test Page Title",
            "description": "Test page description for SEO",
            "keywords": "test, seo, page",
            "og_image": "https://example.com/test.jpg"
        }
        
        seo_create_success, _ = self.run_test(
            "Create SEO Settings",
            "PUT",
            "seo/test-page",
            200,
            data=seo_data
        )
        
        # Test get specific SEO settings
        seo_get_success, _ = self.run_test(
            "Get Specific SEO Settings",
            "GET",
            "seo/test-page",
            200
        )
        
        return seo_create_success and seo_get_success

    def test_blog_management(self):
        """Test blog management functionality"""
        if not self.token:
            print("❌ No authentication token available for blog tests")
            return False
            
        print("\n📝 Testing Blog Management...")
        
        # Test create blog
        blog_data = {
            "slug": "test-blog-post",
            "title": "Test Blog Post",
            "excerpt": "This is a test blog post excerpt",
            "content": "This is the full content of the test blog post.",
            "keywords": "test, blog, post",
            "meta_description": "Test blog post meta description",
            "author": "Test Author",
            "published": True
        }
        
        blog_create_success, _ = self.run_test(
            "Create Blog Post",
            "POST",
            "blogs",
            201,
            data=blog_data
        )
        
        # Test update blog
        if blog_create_success:
            update_data = {
                "title": "Updated Test Blog Post",
                "content": "Updated content for the test blog post."
            }
            
            blog_update_success, _ = self.run_test(
                "Update Blog Post",
                "PUT",
                "blogs/test-blog-post",
                200,
                data=update_data
            )
            
            # Test delete blog
            blog_delete_success, _ = self.run_test(
                "Delete Blog Post",
                "DELETE",
                "blogs/test-blog-post",
                200
            )
            
            return blog_update_success and blog_delete_success
        
        return False

    def test_keyword_tracking(self):
        """Test keyword tracking functionality"""
        if not self.token:
            print("❌ No authentication token available for keyword tests")
            return False
            
        print("\n📊 Testing Keyword Tracking...")
        
        # Test add keyword
        keyword_data = {
            "keyword": "test keyword",
            "page": "home",
            "ranking": 10,
            "search_volume": 1000,
            "difficulty": "Low"
        }
        
        keyword_create_success, keyword_response = self.run_test(
            "Add Keyword",
            "POST",
            "keywords",
            200,
            data=keyword_data
        )
        
        # Test delete keyword
        if keyword_create_success and keyword_response and 'id' in keyword_response:
            keyword_id = keyword_response['id']
            keyword_delete_success, _ = self.run_test(
                "Delete Keyword",
                "DELETE",
                f"keywords/{keyword_id}",
                200
            )
            return keyword_delete_success
        
        return False

    def test_contact_form_api(self):
        """Test contact form submission API with email notifications"""
        print("\n📧 Testing Contact Form API...")
        
        # Test contact form submission with updated credentials (Phase 1 Final Test)
        contact_data = {
            "name": "Phase 1 Final Test",
            "email": "test@techresona.com",
            "company": "TechResona",
            "phone": "+91 7517402788",
            "message": "Testing email and Slack notifications after configuration update"
        }
        
        contact_success, contact_response = self.run_test(
            "Contact Form Submission",
            "POST",
            "contact/submit",
            200,
            data=contact_data
        )
        
        # Verify response structure
        if contact_success and contact_response:
            required_fields = ['id', 'name', 'email', 'message', 'submitted_at', 'status']
            missing_fields = [field for field in required_fields if field not in contact_response]
            
            if missing_fields:
                print(f"❌ Response missing fields: {missing_fields}")
                self.failed_tests.append({
                    'test': 'Contact Form Response Structure',
                    'error': f'Missing fields: {missing_fields}'
                })
                return False
            else:
                print(f"✅ Contact submission created with ID: {contact_response['id']}")
        
        # Test contact form with missing required fields
        invalid_data = {
            "name": "Test User",
            # Missing email and message
            "company": "Test Company"
        }
        
        validation_success, _ = self.run_test(
            "Contact Form Validation (Missing Fields)",
            "POST",
            "contact/submit",
            422,  # Validation error expected
            data=invalid_data
        )
        
        # Test contact form with invalid email
        invalid_email_data = {
            "name": "Test User",
            "email": "invalid-email",
            "message": "Test message"
        }
        
        email_validation_success, _ = self.run_test(
            "Contact Form Validation (Invalid Email)",
            "POST",
            "contact/submit",
            422,  # Validation error expected
            data=invalid_email_data
        )
        
        return contact_success and validation_success and email_validation_success

    def test_contact_submissions_admin(self):
        """Test admin access to contact submissions"""
        if not self.token:
            print("❌ No authentication token available for contact submissions test")
            return False
            
        print("\n👨‍💼 Testing Contact Submissions (Admin)...")
        
        # Test get all contact submissions (admin only)
        submissions_success, submissions_response = self.run_test(
            "Get Contact Submissions (Admin)",
            "GET",
            "contact/submissions",
            200
        )
        
        if submissions_success and isinstance(submissions_response, list):
            print(f"✅ Retrieved {len(submissions_response)} contact submissions")
            return True
        elif submissions_success:
            print("✅ Contact submissions endpoint accessible (empty list)")
            return True
        
        return False

def main():
    print("🚀 Starting TechResona API Testing...")
    print("=" * 50)
    
    tester = TechResonaAPITester()
    
    # Test sequence
    test_results = {
        'seo_endpoints': tester.test_seo_endpoints(),
        'public_endpoints': tester.test_public_endpoints(),
        'contact_form_api': tester.test_contact_form_api(),
        'authentication': tester.test_authentication(),
        'admin_endpoints': tester.test_admin_endpoints(),
        'contact_submissions_admin': tester.test_contact_submissions_admin(),
        'seo_management': tester.test_seo_management(),
        'blog_management': tester.test_blog_management(),
        'keyword_tracking': tester.test_keyword_tracking()
    }
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    print("\n📋 Test Categories:")
    for category, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {category}: {status}")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests Details:")
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"  {i}. {failure.get('test', 'Unknown')}")
            if 'error' in failure:
                print(f"     Error: {failure['error']}")
            else:
                print(f"     Expected: {failure.get('expected')}, Got: {failure.get('actual')}")
    
    # Return exit code
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())