import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SEOManager = () => {
  const [seoSettings, setSeoSettings] = useState([]);
  const [robotsTxt, setRobotsTxt] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    og_image: '',
    json_ld: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const pages = ['home', 'about', 'services', 'contact', 'blog'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      const existing = seoSettings.find(s => s.page === selectedPage);
      if (existing) {
        setFormData({
          title: existing.title || '',
          description: existing.description || '',
          keywords: existing.keywords || '',
          og_image: existing.og_image || '',
          json_ld: existing.json_ld ? JSON.stringify(existing.json_ld, null, 2) : ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          keywords: '',
          og_image: '',
          json_ld: ''
        });
      }
    }
  }, [selectedPage, seoSettings]);

  const fetchData = async () => {
    const token = localStorage.getItem('techresona_admin_token');
    try {
      const [seoRes, robotsRes] = await Promise.all([
        axios.get(`${API}/seo`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/robots-txt`)
      ]);
      setSeoSettings(seoRes.data);
      setRobotsTxt(robotsRes.data.content);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSEO = async () => {
    if (!selectedPage) {
      toast.error('Please select a page');
      return;
    }

    const token = localStorage.getItem('techresona_admin_token');
    const payload = {
      page: selectedPage,
      title: formData.title,
      description: formData.description,
      keywords: formData.keywords,
      og_image: formData.og_image,
      json_ld: formData.json_ld ? JSON.parse(formData.json_ld) : null
    };

    try {
      await axios.put(`${API}/seo/${selectedPage}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('SEO settings saved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to save SEO settings');
      console.error(error);
    }
  };

  const handleSaveRobotsTxt = async () => {
    const token = localStorage.getItem('techresona_admin_token');
    try {
      await axios.put(`${API}/robots-txt`, { content: robotsTxt }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('robots.txt updated successfully');
    } catch (error) {
      toast.error('Failed to update robots.txt');
      console.error(error);
    }
  };

  const generateSitemap = async () => {
    const token = localStorage.getItem('techresona_admin_token');
    try {
      await axios.get(`${API}/sitemap/generate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Sitemap generated successfully. Available at /sitemap.xml');
    } catch (error) {
      toast.error('Failed to generate sitemap');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="seo-loading">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          <p className="mt-4 text-slate-600">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100" data-testid="seo-manager">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 font-heading" data-testid="seo-title">SEO Manager</h1>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200" data-testid="meta-tags-section">
            <h2 className="text-xl font-bold text-slate-900 mb-6 font-heading">Meta Tags & JSON-LD</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="page-select">Select Page</Label>
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger data-testid="page-select">
                    <SelectValue placeholder="Choose a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map(page => (
                      <SelectItem key={page} value={page}>{page}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPage && (
                <>
                  <div>
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="SEO-friendly page title"
                      data-testid="title-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Meta Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description for search engines"
                      data-testid="description-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                      placeholder="keyword1, keyword2, keyword3"
                      data-testid="keywords-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="og_image">OG Image URL</Label>
                    <Input
                      id="og_image"
                      value={formData.og_image}
                      onChange={(e) => setFormData({...formData, og_image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      data-testid="og-image-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="json_ld">JSON-LD Schema (optional)</Label>
                    <Textarea
                      id="json_ld"
                      rows={6}
                      value={formData.json_ld}
                      onChange={(e) => setFormData({...formData, json_ld: e.target.value})}
                      placeholder='{"@context": "https://schema.org", "@type": "Organization"}'
                      className="font-mono text-sm"
                      data-testid="json-ld-input"
                    />
                  </div>

                  <Button onClick={handleSaveSEO} className="w-full" data-testid="save-seo-button">
                    <Save size={18} className="mr-2" />
                    Save SEO Settings
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200" data-testid="robots-section">
              <h2 className="text-xl font-bold text-slate-900 mb-6 font-heading">robots.txt</h2>
              <Textarea
                rows={10}
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                className="font-mono text-sm"
                placeholder="User-agent: *\nAllow: /"
                data-testid="robots-txt-input"
              />
              <Button onClick={handleSaveRobotsTxt} className="w-full mt-4" data-testid="save-robots-button">
                <Save size={18} className="mr-2" />
                Save robots.txt
              </Button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200" data-testid="sitemap-section">
              <h2 className="text-xl font-bold text-slate-900 mb-4 font-heading">Sitemap Generator</h2>
              <p className="text-slate-600 mb-4">Generate an XML sitemap for all your pages and blog posts.</p>
              <Button onClick={generateSitemap} variant="outline" className="w-full" data-testid="generate-sitemap-button">
                <Plus size={18} className="mr-2" />
                Generate Sitemap
              </Button>
              <p className="text-sm text-slate-500 mt-4">Sitemap will be available at: <code className="bg-slate-100 px-2 py-1 rounded">/sitemap.xml</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOManager;