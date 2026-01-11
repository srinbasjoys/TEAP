import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <img 
              src="/logo.png" 
              alt="TechResona Logo" 
              className="h-12 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-700 to-teal-500 rounded-lg items-center justify-center hidden">
              <span className="text-white font-bold text-xl font-heading">TR</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-700 hover:text-indigo-700 font-medium transition-colors" data-testid="nav-home">Home</Link>
            <Link to="/about" className="text-slate-700 hover:text-indigo-700 font-medium transition-colors" data-testid="nav-about">About</Link>
            <Link to="/services" className="text-slate-700 hover:text-indigo-700 font-medium transition-colors" data-testid="nav-services">Services</Link>
            <Link to="/blog" className="text-slate-700 hover:text-indigo-700 font-medium transition-colors" data-testid="nav-blog">Blog</Link>
            <Link to="/contact" className="text-slate-700 hover:text-indigo-700 font-medium transition-colors" data-testid="nav-contact">Contact</Link>
            <button
              onClick={() => navigate('/contact')}
              className="bg-indigo-700 text-white px-6 py-2.5 rounded-full font-medium hover:bg-indigo-800 hover:scale-105 active:scale-95 transition-all"
              data-testid="nav-cta-button"
            >
              Get Started
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-900"
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-6" data-testid="mobile-menu">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-slate-700 hover:text-indigo-700 font-medium" data-testid="mobile-nav-home">Home</Link>
              <Link to="/about" className="text-slate-700 hover:text-indigo-700 font-medium" data-testid="mobile-nav-about">About</Link>
              <Link to="/services" className="text-slate-700 hover:text-indigo-700 font-medium" data-testid="mobile-nav-services">Services</Link>
              <Link to="/blog" className="text-slate-700 hover:text-indigo-700 font-medium" data-testid="mobile-nav-blog">Blog</Link>
              <Link to="/contact" className="text-slate-700 hover:text-indigo-700 font-medium" data-testid="mobile-nav-contact">Contact</Link>
              <button
                onClick={() => navigate('/contact')}
                className="bg-indigo-700 text-white px-6 py-2.5 rounded-full font-medium w-full"
                data-testid="mobile-cta-button"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;