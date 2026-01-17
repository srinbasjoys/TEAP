import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './App.css';
import { Toaster } from './components/ui/sonner';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import SEOManager from './pages/admin/SEOManager';
import BlogManager from './pages/admin/BlogManager';
import KeywordTracker from './pages/admin/KeywordTracker';
import LogoManager from './pages/admin/LogoManager';

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
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;