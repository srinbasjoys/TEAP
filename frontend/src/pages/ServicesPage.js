import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Shield, Zap, Settings, Code, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ServicesPage = () => {
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/seo/services`).then(res => setSeoData(res.data)).catch(() => {});
  }, []);

  const services = [
    {
      icon: <Cloud size={40} />,
      title: "Azure Cloud Solutions",
      description: "Comprehensive Azure services from assessment to optimization",
      features: [
        "Azure Assessment & Planning",
        "Cloud Migration & Deployment",
        "Azure Security & Compliance",
        "Backup & Disaster Recovery",
        "Cost Optimization"
      ]
    },
    {
      icon: <Cloud size={40} />,
      title: "AWS Cloud Solutions",
      description: "Scalable AWS architecture, migration, and cost optimization",
      features: [
        "AWS Architecture Design",
        "Cloud Migration Services",
        "High Availability Setup",
        "Security Best Practices",
        "Cost Management"
      ]
    },
    {
      icon: <Zap size={40} />,
      title: "Office 365 Licensing",
      description: "Complete Office 365 deployment and optimization services",
      features: [
        "License Consultation",
        "Deployment & Configuration",
        "Migration Services",
        "Optimization & Training",
        "Tenant Management"
      ]
    },
    {
      icon: <Shield size={40} />,
      title: "Managed Services",
      description: "24/7 monitoring, security, and support for your infrastructure",
      features: [
        "24/7 Monitoring",
        "Incident Management",
        "Patch Management",
        "Backup & Recovery",
        "Security Management"
      ]
    },
    {
      icon: <Code size={40} />,
      title: "Website Development",
      description: "Professional, SEO-optimized websites tailored to your business needs",
      features: [
        "Custom Web Design",
        "Responsive Development",
        "E-commerce Solutions",
        "CMS Integration",
        "Performance Optimization"
      ]
    },
    {
      icon: <Search size={40} />,
      title: "SEO Services",
      description: "Comprehensive SEO strategies to boost your online visibility",
      features: [
        "Technical SEO Audit",
        "Keyword Research & Strategy",
        "On-Page Optimization",
        "Content Strategy",
        "Analytics & Reporting"
      ]
    }
  ];

  return (
    <>
      <SEOHead 
        title={seoData?.title || "TechResona Services - Azure, AWS, Office 365, SEO & Web Development"}
        description={seoData?.description || "Explore TechResona's comprehensive services: Azure Cloud, AWS Solutions, Office 365, Managed Services, Website Development, and SEO optimization for businesses in India and globally."}
        keywords={seoData?.keywords || "azure cloud services, aws solutions, office 365, managed services india, website development, SEO services, cloud migration"}
        jsonLd={seoData?.json_ld}
      />
      <div className="min-h-screen">
        <Navbar />
        
        <section className="pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-indigo-50 via-white to-teal-50" data-testid="services-hero">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 font-heading" data-testid="services-title">
                Our <span className="text-gradient">Services</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="services-subtitle">
                Comprehensive cloud solutions, web development, and SEO services tailored to your business needs
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-white" data-testid="services-grid">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-indigo-500/50 transition-all hover:shadow-lg"
                  data-testid={`service-detail-${idx}`}
                >
                  <div className="text-indigo-700 mb-6">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 font-heading">{service.title}</h3>
                  <p className="text-slate-600 mb-6">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center space-x-2 text-slate-700">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-br from-indigo-700 to-indigo-900 text-white" data-testid="services-cta">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 font-heading" data-testid="services-cta-heading">
              Need a Custom Solution?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Let's discuss how we can help your business thrive
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-indigo-700 px-8 py-4 rounded-full font-medium text-lg hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all"
              data-testid="services-contact-button"
            >
              Contact Us
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ServicesPage;