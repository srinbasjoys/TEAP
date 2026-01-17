import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './App.css';
import { Toaster } from './components/ui/sonner';

// Eager load critical pages for better initial render
import HomePage from './pages/HomePage';

// Lazy load non-critical pages for code splitting
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const SEOManager = lazy(() => import('./pages/admin/SEOManager'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const KeywordTracker = lazy(() => import('./pages/admin/KeywordTracker'));
const LogoManager = lazy(() => import('./pages/admin/LogoManager'));

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '4px solid rgba(79, 70, 229, 0.2)',
      borderTop: '4px solid #4f46e5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('techresona_admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    // Optimized Lenis configuration to reduce forced reflows
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
      // Performance optimizations
      infinite: false,
      autoResize: true,
      // Reduce sync frequency to minimize layout thrashing
      syncTouch: false,
      syncTouchLerp: 0.1,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/seo" element={
              <ProtectedRoute>
                <SEOManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/blogs" element={
              <ProtectedRoute>
                <BlogManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/keywords" element={
              <ProtectedRoute>
                <KeywordTracker />
              </ProtectedRoute>
            } />
            <Route path="/admin/logo" element={
              <ProtectedRoute>
                <LogoManager />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;