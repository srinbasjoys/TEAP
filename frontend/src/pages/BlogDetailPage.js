import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`${API}/blogs/${slug}`);
        setBlog(response.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="blog-detail-loading">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          <p className="mt-4 text-slate-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="blog-not-found">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Article Not Found</h1>
          <button
            onClick={() => navigate('/blog')}
            className="text-indigo-700 hover:text-indigo-800 font-semibold"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt,
    "image": blog.featured_image || "https://techresona.com/default-blog-image.jpg",
    "author": {
      "@type": "Organization",
      "name": blog.author || "TechResona Team",
      "url": "https://techresona.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TechResona",
      "logo": {
        "@type": "ImageObject",
        "url": "https://techresona.com/logo.png"
      }
    },
    "datePublished": blog.created_at,
    "dateModified": blog.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://techresona.com/blog/${blog.slug}`
    },
    "keywords": blog.keywords || "",
    "articleBody": blog.content
  };

  return (
    <>
      <SEOHead 
        title={`${blog.title} | TechResona Blog`}
        description={blog.meta_description || blog.excerpt}
        keywords={blog.keywords}
        ogImage={blog.featured_image}
        canonical={`https://techresona.com/blog/${blog.slug}`}
        jsonLd={jsonLd}
      />
      <div className="min-h-screen">
        <Navbar />
        
        <article className="pt-32 pb-20 px-6 lg:px-12" data-testid="blog-detail-article">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => navigate('/blog')}
                className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-800 font-semibold mb-8 transition-colors"
                data-testid="back-to-blog-button"
              >
                <ArrowLeft size={20} />
                <span>Back to Blog</span>
              </button>

              {blog.featured_image && (
                <img 
                  src={blog.featured_image} 
                  alt={blog.title} 
                  className="w-full h-96 object-cover rounded-2xl mb-8"
                  data-testid="blog-featured-image"
                />
              )}

              <div className="flex items-center space-x-6 text-slate-500 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar size={20} />
                  <span>{formatDate(blog.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User size={20} />
                  <span>{blog.author}</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 font-heading" data-testid="blog-detail-title">
                {blog.title}
              </h1>

              <div className="prose prose-lg max-w-none" data-testid="blog-detail-content">
                {blog.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-lg text-slate-700 leading-relaxed mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex flex-wrap gap-2">
                  {blog.keywords.split(',').map((keyword, idx) => (
                    <span 
                      key={idx}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
};

export default BlogDetailPage;