import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Menu, 
  X,
  CheckCircle,
  Store, 
  Coffee, 
  Users, 
  Heart,
  Calculator,
  Shield,
  Clock,
  Smartphone,
  TrendingUp,
  Award
} from 'lucide-react';

export default function SmallBusiness() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reduced motion detection
  const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fadeInVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion ? { duration: 0 } : { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const industries = [
    {
      icon: Store,
      title: "Retail Businesses",
      description: "Point-of-sale integration, inventory management, and customer loyalty programs",
      features: ["Inventory tracking", "POS integration", "Customer management", "Sales reporting"]
    },
    {
      icon: Coffee,
      title: "Restaurants & Hospitality",
      description: "Table management, menu costing, staff scheduling, and compliance tracking",
      features: ["Menu costing", "Staff scheduling", "Supplier management", "Health compliance"]
    },
    {
      icon: Users,
      title: "Consultants & Professionals",
      description: "Time tracking, project management, client billing, and professional compliance",
      features: ["Time tracking", "Project billing", "Client portals", "Professional standards"]
    },
    {
      icon: Heart,
      title: "NGOs & Non-Profits",
      description: "Donor management, grant tracking, compliance reporting, and transparency tools",
      features: ["Donor tracking", "Grant management", "Impact reporting", "Transparency tools"]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Quick Setup",
      description: "Get started in under 15 minutes with our guided onboarding process"
    },
    {
      icon: Calculator,
      title: "Affordable Pricing",
      description: "Plans starting from R299/month with no hidden fees or setup costs"
    },
    {
      icon: Shield,
      title: "Compliance Ready",
      description: "Built-in South African tax and regulatory compliance features"
    },
    {
      icon: Smartphone,
      title: "Mobile Access",
      description: "Manage your business on-the-go with our mobile-optimized platform"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-slate-200/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Taxnify
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {[
                { name: 'Features', href: '/features' },
                { name: 'Small Business', href: '/small-business' },
                { name: 'Accountants', href: '/accountants' },
                { name: 'Resources', href: '/resources' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'Contact', href: '/contact' }
              ].map((item) => (
                <Link key={item.name} href={item.href}>
                  <div className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-all duration-200 hover:bg-slate-100/70 rounded-lg">
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 font-medium shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div 
              className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/50 py-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                {[
                  { name: 'Features', href: '/features' },
                  { name: 'Small Business', href: '/small-business' },
                  { name: 'Accountants', href: '/accountants' },
                  { name: 'Resources', href: '/resources' },
                  { name: 'Pricing', href: '/pricing' },
                  { name: 'Contact', href: '/contact' }
                ].map((item) => (
                  <Link key={item.name} href={item.href}>
                    <div className="block text-slate-600 hover:text-slate-900 font-medium py-2">
                      {item.name}
                    </div>
                  </Link>
                ))}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 w-full max-w-full overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInVariant} className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-6 py-3 shadow-lg">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="text-slate-700 font-medium">Built for Small Business Success</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={fadeInVariant}
              className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight"
            >
              Built for Small Business
              <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Success in South Africa
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeInVariant}
              className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              Whether you're running a retail store, restaurant, consultancy, or NGO, Taxnify provides the tools and compliance features you need to grow your business.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInVariant}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm group"
              >
                See Industry Solutions
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-24 bg-white w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInVariant}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Solutions for Every Industry
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Specialized features and workflows designed for different types of small businesses
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {industries.map((industry, index) => (
              <motion.div 
                key={index}
                variants={fadeInVariant}
                className="group relative bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <industry.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors">
                  {industry.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {industry.description}
                </p>
                <ul className="space-y-3 text-sm text-slate-600">
                  {industry.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Taxnify */}
      <section className="py-24 bg-slate-50 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInVariant}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Why Small Businesses Choose Taxnify
            </h2>
            <p className="text-xl text-slate-600">
              Simple, affordable, and designed specifically for South African businesses
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                variants={fadeInVariant}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 text-white relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-6 lg:px-8 w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInVariant}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              Ready to Grow Your Small Business?
            </h2>
            <p className="text-xl text-purple-100 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join thousands of South African small businesses who trust Taxnify for their success.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group"
                >
                  Start Your Free Trial Today
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  Schedule a Demo
                </Button>
              </Link>
            </div>
            <p className="text-purple-200 text-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="text-2xl font-bold">Taxnify</span>
              </div>
              <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
                South Africa's premier business management platform designed specifically for small businesses.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Solutions</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/small-business/retail" className="hover:text-white transition-colors">Retail</Link></li>
                <li><Link href="/small-business/restaurants" className="hover:text-white transition-colors">Restaurants</Link></li>
                <li><Link href="/small-business/consultants" className="hover:text-white transition-colors">Consultants</Link></li>
                <li><Link href="/small-business/ngos" className="hover:text-white transition-colors">NGOs</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 Taxnify. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}