import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    keywords: '',
    meta_description: '',
    author: 'TechResona Team',
    featured_image: '',
    published: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const token = localStorage.getItem('techresona_admin_token');
    try {
      const response = await axios.get(`${API}/blogs?published_only=false`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        keywords: blog.keywords,
        meta_description: blog.meta_description,
        author: blog.author,
        featured_image: blog.featured_image || '',
        published: blog.published
      });
    } else {
      setEditingBlog(null);
      setFormData({
        slug: '',
        title: '',
        excerpt: '',
        content: '',
        keywords: '',
        meta_description: '',
        author: 'TechResona Team',
        featured_image: '',
        published: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveBlog = async () => {
    const token = localStorage.getItem('techresona_admin_token');
    try {
      if (editingBlog) {
        await axios.put(`${API}/blogs/${editingBlog.slug}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Blog updated successfully');
      } else {
        await axios.post(`${API}/blogs`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Blog created successfully');
      }
      setIsDialogOpen(false);
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save blog');
      console.error(error);
    }
  };

  const handleDeleteBlog = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    const token = localStorage.getItem('techresona_admin_token');
    try {
      await axios.delete(`${API}/blogs/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to delete blog');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="blog-manager-loading">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          <p className="mt-4 text-slate-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100" data-testid="blog-manager">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 font-heading" data-testid="blog-manager-title">Blog Manager</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} data-testid="create-blog-button">
                <Plus size={18} className="mr-2" />
                Create Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Blog post title"
                      data-testid="blog-title-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      placeholder="blog-post-slug"
                      disabled={!!editingBlog}
                      data-testid="blog-slug-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    placeholder="Brief summary of the blog post"
                    data-testid="blog-excerpt-input"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Full blog content"
                    data-testid="blog-content-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="keywords">Keywords *</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                      placeholder="keyword1, keyword2"
                      data-testid="blog-keywords-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      placeholder="Author name"
                      data-testid="blog-author-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="meta_description">Meta Description *</Label>
                  <Textarea
                    id="meta_description"
                    rows={2}
                    value={formData.meta_description}
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    placeholder="SEO meta description"
                    data-testid="blog-meta-description-input"
                  />
                </div>

                <div>
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    data-testid="blog-featured-image-input"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({...formData, published: e.target.checked})}
                    className="w-4 h-4 text-indigo-700 border-slate-300 rounded focus:ring-indigo-500"
                    data-testid="blog-published-checkbox"
                  />
                  <Label htmlFor="published" className="cursor-pointer">Published</Label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleSaveBlog} className="flex-1" data-testid="save-blog-button">
                    <Save size={18} className="mr-2" />
                    {editingBlog ? 'Update' : 'Create'} Blog
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)} variant="outline" data-testid="cancel-blog-button">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl" data-testid="no-blogs">
            <p className="text-slate-500">No blogs yet. Create your first blog post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white p-6 rounded-xl border border-slate-200" data-testid={`blog-card-${blog.slug}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 font-heading line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-slate-500">/{blog.slug}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${blog.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenDialog(blog)} data-testid={`edit-blog-${blog.slug}`}>
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteBlog(blog.slug)} className="text-red-600 hover:text-red-700" data-testid={`delete-blog-${blog.slug}`}>
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManager;