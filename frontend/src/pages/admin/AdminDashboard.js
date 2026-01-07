import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Search, Settings, FileText, TrendingUp, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('techresona_admin_token');
    try {
      const response = await axios.get(`${API}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('techresona_admin_token');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin', testId: 'nav-dashboard' },
    { icon: <Settings size={20} />, label: 'SEO Manager', path: '/admin/seo', testId: 'nav-seo' },
    { icon: <FileText size={20} />, label: 'Blog Manager', path: '/admin/blogs', testId: 'nav-blogs' },
    { icon: <TrendingUp size={20} />, label: 'Keyword Tracker', path: '/admin/keywords', testId: 'nav-keywords' },
  ];

  return (
    <div className="min-h-screen bg-slate-100" data-testid="admin-dashboard">
      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading" data-testid="admin-logo">TechResona Admin</h2>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                    data-testid={item.testId}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
              data-testid="logout-button"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 lg:ml-64">
          <header className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
                data-testid="mobile-menu-toggle"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold text-slate-900 font-heading" data-testid="dashboard-title">Dashboard Overview</h1>
              <a href="/" target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:text-indigo-800 font-medium" data-testid="view-website">View Website →</a>
            </div>
          </header>

          <main className="p-6">
            {loading ? (
              <div className="text-center py-20" data-testid="loading">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                <p className="mt-4 text-slate-600">Loading analytics...</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl border border-slate-200" data-testid="stat-pages">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-600">SEO Pages</h3>
                      <Settings className="text-indigo-700" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{analytics?.total_pages || 0}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200" data-testid="stat-blogs">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-600">Blog Posts</h3>
                      <FileText className="text-teal-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{analytics?.total_blogs || 0}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200" data-testid="stat-keywords">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-600">Keywords Tracked</h3>
                      <TrendingUp className="text-purple-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{analytics?.total_keywords || 0}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200" data-testid="stat-updates">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-600">Recent Updates</h3>
                      <Search className="text-orange-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{analytics?.recent_updates?.length || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200" data-testid="quick-actions">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 font-heading">Quick Actions</h2>
                    <div className="space-y-3">
                      <Link to="/admin/seo" className="block px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium" data-testid="action-seo">
                        Manage SEO Settings
                      </Link>
                      <Link to="/admin/blogs" className="block px-4 py-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors font-medium" data-testid="action-blogs">
                        Create New Blog Post
                      </Link>
                      <Link to="/admin/keywords" className="block px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium" data-testid="action-keywords">
                        Track New Keyword
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200" data-testid="recent-updates-card">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 font-heading">Recent Blog Updates</h2>
                    {analytics?.recent_updates?.length > 0 ? (
                      <ul className="space-y-3">
                        {analytics.recent_updates.map((title, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-slate-700">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <span className="line-clamp-1">{title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500">No recent updates</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;