import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cloud, Shield, Zap, Users, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/seo/home`).then(res => setSeoData(res.data)).catch(() => {});
  }, []);

  // Organization Schema for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TechResona",
    "description": "Leading IT services provider in India offering Azure, AWS, Office 365, and Managed Services.",
    "url": "https://techresona.com",
    "logo": "https://techresona.com/logo.png",
    "email": "info@techresona.com",
    "telephone": "+917517402788",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "India"
    },
    "sameAs": [
      "https://www.linkedin.com/company/techresona",
      "https://twitter.com/techresona",
      "https://www.facebook.com/techresona"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500"
    },
    "founder": {
      "@type": "Person",
      "name": "TechResona Team"
    }
  };

  // LocalBusiness Schema for SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "TechResona",
    "image": "https://techresona.com/logo.png",
    "@id": "https://techresona.com",
    "url": "https://techresona.com",
    "telephone": "+917517402788",
    "email": "info@techresona.com",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.7041,
      "longitude": 77.1025
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "16:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "500"
    }
  };

  const services = [
    {
      icon: <Cloud size={32} />,
      title: "Azure Cloud Solutions",
      description: "Comprehensive Azure services from assessment to optimization"
    },
    {
      icon: <Cloud size={32} />,
      title: "AWS Cloud Solutions",
      description: "Scalable AWS architecture, migration, and cost optimization"
    },
    {
      icon: <Shield size={32} />,
      title: "Managed Services",
      description: "24/7 monitoring, security, and support for your infrastructure"
    },
    {
      icon: <Zap size={32} />,
      title: "Office 365",
      description: "Complete Office 365 deployment and optimization services"
    }
  ];

  const stats = [
    { number: "500+", label: "Clients Served" },
    { number: "99.9%", label: "Uptime SLA" },
    { number: "24/7", label: "Support Available" },
    { number: "50+", label: "Cloud Experts" }
  ];

  return (
    <>
      <SEOHead 
        title={seoData?.title || "TechResona - Cloud Solutions & Managed Services | Azure, AWS, Office 365"}
        description={seoData?.description || "Leading IT services provider in India offering Azure, AWS, Office 365, and Managed Services. Secure, scalable cloud solutions for SMBs and enterprises."}
        keywords={seoData?.keywords || "azure cloud solutions for small business, aws cloud solutions for small business, office 365 licensing for small business, managed services, IT services india"}
        canonical="https://techresona.com/"
        jsonLd={seoData?.json_ld || [organizationSchema, localBusinessSchema]}
      />
      <div className="min-h-screen">
        <Navbar />
        
        <section className="hero-section pt-32 pb-20 px-6 lg:px-12 relative" data-testid="hero-section">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-teal-50 -z-10"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-teal-500/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <motion.div 
                className="md:col-span-7"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 font-heading tracking-tight" data-testid="hero-title">
                  Empower Your Business with
                  <span className="text-gradient"> Cloud Excellence</span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed" data-testid="hero-description">
                  Secure, scalable cloud solutions tailored for SMBs, enterprises, and startups. 
                  Transform your infrastructure with Azure, AWS, and expert managed services.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/contact')}
                    className="bg-indigo-700 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-indigo-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
                    data-testid="hero-cta-primary"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={() => navigate('/services')}
                    className="border-2 border-indigo-700 text-indigo-700 px-8 py-4 rounded-full font-medium text-lg hover:bg-indigo-50 transition-all"
                    data-testid="hero-cta-secondary"
                  >
                    Our Services
                  </button>
                </div>
              </motion.div>
              
              <motion.div 
                className="md:col-span-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1633174074875-f09b1b53ecf6?crop=entropy&cs=srgb&fm=jpg&q=85" 
                  alt="Cloud Technology" 
                  className="rounded-2xl shadow-2xl"
                  data-testid="hero-image"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white" data-testid="stats-section">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  data-testid={`stat-${idx}`}
                >
                  <div className="text-4xl lg:text-5xl font-bold text-indigo-700 mb-2 font-heading">{stat.number}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-slate-50" data-testid="services-section">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 font-heading" data-testid="services-heading">
                Our Core Services
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Comprehensive cloud solutions designed to accelerate your digital transformation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-indigo-500/50 transition-all hover:shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  data-testid={`service-card-${idx}`}
                >
                  <div className="text-indigo-700 mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 font-heading">{service.title}</h3>
                  <p className="text-slate-600">{service.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/services')}
                className="bg-indigo-700 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-indigo-800 hover:scale-105 active:scale-95 transition-all"
                data-testid="view-all-services-button"
              >
                View All Services
              </button>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white" data-testid="why-choose-section">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-5">
                <img 
                  src="https://images.unsplash.com/photo-1760611656007-f767a8082758?crop=entropy&cs=srgb&fm=jpg&q=85" 
                  alt="Team Collaboration" 
                  className="rounded-2xl shadow-xl"
                  data-testid="why-choose-image"
                />
              </div>
              <div className="md:col-span-7">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-8 font-heading" data-testid="why-choose-heading">
                  Why Choose TechResona?
                </h2>
                <div className="space-y-6">
                  {[
                    { icon: <Award />, title: "Certified Experts", desc: "Team of certified cloud professionals with deep expertise" },
                    { icon: <Shield />, title: "Security First", desc: "Enterprise-grade security and compliance" },
                    { icon: <TrendingUp />, title: "Cost Optimization", desc: "Maximize ROI with intelligent resource management" },
                    { icon: <Users />, title: "24/7 Support", desc: "Round-the-clock monitoring and dedicated support" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex space-x-4" data-testid={`why-item-${idx}`}>
                      <div className="flex-shrink-0 w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1 font-heading">{item.title}</h3>
                        <p className="text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-br from-indigo-700 to-indigo-900 text-white" data-testid="cta-section">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 font-heading" data-testid="cta-heading">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Let's discuss how our cloud solutions can drive your growth
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="bg-white text-indigo-700 px-8 py-4 rounded-full font-medium text-lg hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all"
              data-testid="cta-contact-button"
            >
              Get in Touch
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;