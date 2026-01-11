import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-700 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl font-heading">TR</span>
              </div>
              <span className="text-xl font-bold font-heading">TechResona</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Empowering businesses with secure and scalable cloud solutions. Your trusted partner for digital transformation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-teal-500 transition-colors" aria-label="LinkedIn" data-testid="social-linkedin">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-teal-500 transition-colors" aria-label="Twitter" data-testid="social-twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-teal-500 transition-colors" aria-label="Facebook" data-testid="social-facebook">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-bold text-lg mb-4 font-heading">Services</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/services" className="text-slate-400 hover:text-teal-500 transition-colors" data-testid="footer-services-azure">Azure Cloud</Link></li>
              <li><Link to="/services" className="text-slate-400 hover:text-teal-500 transition-colors" data-testid="footer-services-aws">AWS Cloud</Link></li>
              <li><Link to="/services" className="text-slate-400 hover:text-teal-500 transition-colors" data-testid="footer-services-office365">Office 365</Link></li>
              <li><Link to="/services" className="text-slate-400 hover:text-teal-500 transition-colors" data-testid="footer-services-managed">Managed Services</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-bold text-lg mb-4 font-heading">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="text-slate-400 hover:text-teal-500 transition-colors" data-testid="footer-about">About Us</Link></li>
              <li><Link to="/blog" className="text-slate-400 hover:text-teal-500 transition-colors" data-testid="footer-blog">Blog</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-teal-500 transition-colors" data-testid="footer-contact">Contact</Link></li>
              <li><Link to="/admin/login" className="text-slate-400 hover:text-teal-500 transition-colors" data-testid="footer-admin">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-bold text-lg mb-4 font-heading">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-slate-400">
                <Mail size={16} />
                <span data-testid="footer-email">info@techresona.com</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <Phone size={16} />
                <span data-testid="footer-phone">+91-XXXXXXXXXX</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <MapPin size={16} />
                <span data-testid="footer-location">India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} TechResona Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;