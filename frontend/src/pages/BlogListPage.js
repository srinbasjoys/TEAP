import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsRes, seoRes] = await Promise.all([
          axios.get(`${API}/blogs`),
          axios.get(`${API}/seo/blog`).catch(() => ({}))
        ]);
        setBlogs(blogsRes.data);
        if (seoRes.data) setSeoData(seoRes.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <>
      <SEOHead 
        title={seoData?.title || "TechResona Blog - Cloud Solutions, SEO & Web Development Insights"}
        description={seoData?.description || "Read expert insights on cloud migration, Azure, AWS, SEO optimization, and web development trends from TechResona's team of specialists."}
        keywords={seoData?.keywords || "cloud blog, azure tips, aws best practices, seo guides, web development blog, tech insights"}
        jsonLd={seoData?.json_ld}
      />
      <div className="min-h-screen">
        <Navbar />
        
        <section className="pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-indigo-50 via-white to-teal-50" data-testid="blog-hero">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 font-heading" data-testid="blog-title">
                Our <span className="text-gradient">Blog</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="blog-subtitle">
                Expert insights and best practices for cloud solutions, SEO, and digital transformation
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-white" data-testid="blog-grid">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-20" data-testid="blog-loading">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                <p className="mt-4 text-slate-600">Loading articles...</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-20" data-testid="blog-empty">
                <p className="text-xl text-slate-600">No articles published yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog, idx) => (
                  <motion.article
                    key={blog.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-500/50 transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => navigate(`/blog/${blog.slug}`)}
                    data-testid={`blog-card-${idx}`}
                  >
                    {blog.featured_image && (
                      <img 
                        src={blog.featured_image} 
                        alt={blog.title} 
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar size={16} />
                          <span>{formatDate(blog.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User size={16} />
                          <span>{blog.author}</span>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-3 font-heading line-clamp-2">
                        {blog.title}
                      </h2>
                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                      <button className="text-indigo-700 font-semibold flex items-center space-x-2 hover:space-x-3 transition-all">
                        <span>Read More</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default BlogListPage;