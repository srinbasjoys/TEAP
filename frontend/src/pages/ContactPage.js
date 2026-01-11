import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const [seoData, setSeoData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${API}/seo/contact`).then(res => setSeoData(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post(`${API}/contact/submit`, formData);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again or contact us directly.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead 
        title={seoData?.title || "Contact TechResona - Get Cloud Solutions for Your Business"}
        description={seoData?.description || "Get in touch with TechResona for Azure, AWS, Office 365, and managed services. Contact us for a free consultation on your cloud transformation needs."}
        keywords={seoData?.keywords || "contact techresona, cloud consultation, IT services inquiry, azure support, aws help"}
        canonical="https://techresona.com/contact"
        jsonLd={seoData?.json_ld}
      />
      <div className="min-h-screen">
        <Navbar />
        
        <section className="pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-indigo-50 via-white to-teal-50" data-testid="contact-hero">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 font-heading" data-testid="contact-title">
                Get in <span className="text-gradient">Touch</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="contact-subtitle">
                Let's discuss how we can help transform your business with our cloud solutions
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-white" data-testid="contact-form-section">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 font-heading" data-testid="contact-info-heading">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4" data-testid="contact-email">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1 font-heading">Email</h3>
                      <a href="mailto:info@techresona.com" className="text-slate-600 hover:text-indigo-700 transition-colors">
                        info@techresona.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4" data-testid="contact-phone">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1 font-heading">Phone</h3>
                      <a href="tel:+917517402788" className="text-slate-600 hover:text-teal-600 transition-colors">
                        +91 7517402788
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4" data-testid="contact-whatsapp">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1 font-heading">WhatsApp</h3>
                      <a 
                        href="https://wa.me/917517402788" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-green-600 transition-colors"
                      >
                        +91 7517402788
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4" data-testid="contact-location">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1 font-heading">Location</h3>
                      <p className="text-slate-600">India</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-8 bg-gradient-to-br from-indigo-50 to-teal-50 rounded-2xl">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 font-heading">Business Hours</h3>
                  <div className="space-y-2 text-slate-700">
                    <p><span className="font-semibold">Monday - Friday:</span> 9:00 AM - 6:00 PM</p>
                    <p><span className="font-semibold">Saturday:</span> 10:00 AM - 4:00 PM</p>
                    <p><span className="font-semibold">Sunday:</span> Closed</p>
                  </div>
                  <p className="text-sm text-slate-600 mt-4">*24/7 Support available for managed service clients</p>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-slate-50 p-8 lg:p-12 rounded-2xl">
                  <h2 className="text-3xl font-bold text-slate-900 mb-8 font-heading" data-testid="form-heading">
                    Send us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                        data-testid="contact-name-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="john@company.com"
                        data-testid="contact-email-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="Your Company"
                        data-testid="contact-company-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="+91 XXXXXXXXXX"
                        data-testid="contact-phone-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        required
                        rows="5"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Tell us about your project or inquiry..."
                        data-testid="contact-message-textarea"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-700 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-indigo-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="contact-submit-button"
                    >
                      <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;