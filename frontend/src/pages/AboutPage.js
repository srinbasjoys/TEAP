import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Globe, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AboutPage = () => {
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/seo/about`).then(res => setSeoData(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <SEOHead 
        title={seoData?.title || "About TechResona - Leading Cloud Solutions Provider in India"}
        description={seoData?.description || "Learn about TechResona's mission to empower businesses with secure, scalable cloud solutions. Trusted partner for Azure, AWS, and managed services."}
        keywords={seoData?.keywords || "about techresona, cloud provider india, IT services company, azure partner, aws partner, microsoft azure consulting small business"}
        canonical="https://techresona.com/about"
        jsonLd={seoData?.json_ld}
      />
      <div className="min-h-screen">
        <Navbar />
        
        <section className="pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-indigo-50 via-white to-teal-50" data-testid="about-hero">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 font-heading" data-testid="about-title">
                About <span className="text-gradient">TechResona</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="about-subtitle">
                Empowering businesses with innovative cloud solutions and expert managed services
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-white" data-testid="mission-vision">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-50 p-10 rounded-2xl"
                data-testid="mission-card"
              >
                <Target className="text-indigo-700 mb-6" size={48} />
                <h2 className="text-3xl font-bold text-slate-900 mb-4 font-heading">Our Mission</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  To empower businesses with secure and scalable cloud solutions that drive digital transformation and accelerate growth. We are committed to delivering excellence through innovation and expertise.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-50 p-10 rounded-2xl"
                data-testid="vision-card"
              >
                <Globe className="text-teal-500 mb-6" size={48} />
                <h2 className="text-3xl font-bold text-slate-900 mb-4 font-heading">Our Vision</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  To become a trusted global cloud partner, recognized for our commitment to client success, technical excellence, and innovative solutions that shape the future of enterprise technology.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-slate-50" data-testid="story-section">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-5">
                <img 
                  src="https://images.unsplash.com/photo-1758873268379-39301764793f?w=800&h=600&fit=crop&fm=webp&q=75" 
                  srcSet="https://images.unsplash.com/photo-1758873268379-39301764793f?w=500&h=375&fit=crop&fm=webp&q=75 500w,
                          https://images.unsplash.com/photo-1758873268379-39301764793f?w=800&h=600&fit=crop&fm=webp&q=75 800w"
                  sizes="(max-width: 768px) 100vw, 42vw"
                  alt="TechResona Office" 
                  className="rounded-2xl shadow-xl"
                  loading="lazy"
                  data-testid="story-image"
                  width="500"
                  height="375"
                />
              </div>
              <div className="md:col-span-7">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 font-heading" data-testid="story-heading">
                  Our Story
                </h2>
                <div className="space-y-4 text-lg text-slate-600">
                  <p>
                    TechResona Pvt Ltd is an emerging IT services company focused on cloud and managed services. We specialize in helping SMBs, enterprises, and startups transition to the cloud with confidence.
                  </p>
                  <p>
                    Our core focus on Cloud Platforms, Licensing, and Managed Services enables us to provide comprehensive solutions that address the unique challenges faced by modern businesses in their digital transformation journey.
                  </p>
                  <p>
                    With expertise in Azure, AWS, and Office 365, we deliver cost-effective, secure, and scalable solutions backed by 24/7 support and certified professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white" data-testid="values-section">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-12 text-center font-heading" data-testid="values-heading">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Award />, title: "Excellence", desc: "Committed to delivering the highest quality in every project" },
                { icon: <Users />, title: "Client-Centric", desc: "Your success is our success. We prioritize your needs" },
                { icon: <Target />, title: "Innovation", desc: "Continuously exploring new technologies and solutions" },
                { icon: <Globe />, title: "Integrity", desc: "Transparent, honest, and ethical in all our dealings" }
              ].map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-8 bg-slate-50 rounded-2xl"
                  data-testid={`value-card-${idx}`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-700 rounded-full mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">{value.title}</h3>
                  <p className="text-slate-600">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;