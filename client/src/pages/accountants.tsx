import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Menu, 
  X,
  CheckCircle,
  Calculator,
  Users,
  Shield,
  Award,
  FileText,
  Building,
  Clock,
  TrendingUp,
  Briefcase,
  Star
} from 'lucide-react';

export default function Accountants() {
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

  const accountantTypes = [
    {
      icon: Calculator,
      title: "Tax Practitioners",
      description: "Specialized tools for tax preparation, SARS submissions, and client compliance",
      features: ["Multi-client management", "Tax return preparation", "SARS e-filing", "Compliance tracking"]
    },
    {
      icon: Shield,
      title: "Auditors",
      description: "Audit management, working papers, and compliance reporting tools",
      features: ["Audit planning", "Working papers", "Risk assessment", "Reporting tools"]
    },
    {
      icon: FileText,
      title: "Bookkeepers",
      description: "Comprehensive bookkeeping tools for multiple clients and businesses",
      features: ["Client portfolios", "Bank reconciliation", "Financial statements", "VAT returns"]
    },
    {
      icon: Users,
      title: "Payroll Providers",
      description: "Complete payroll processing and compliance for multiple companies",
      features: ["Payroll processing", "PAYE submissions", "UIF compliance", "Employee management"]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save 50+ Hours Monthly",
      description: "Automate repetitive tasks and streamline client workflows"
    },
    {
      icon: Users,
      title: "Manage 100+ Clients",
      description: "Scale your practice with unlimited client management"
    },
    {
      icon: Shield,
      title: "100% Compliance Ready",
      description: "Stay current with all South African regulations"
    },
    {
      icon: Award,
      title: "Professional Standards",
      description: "Maintain SAICA, SAIPA, and other professional body requirements"
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>
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
                <Award className="w-5 h-5 text-indigo-600" />
                <span className="text-slate-700 font-medium">For Professional Accountants</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={fadeInVariant}
              className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight"
            >
              Built for Accounting
              <span className="block bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Professionals
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeInVariant}
              className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              Professional-grade tools designed specifically for South African accounting firms, tax practitioners, and bookkeepers. Scale your practice with confidence.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInVariant}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group"
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
                See Professional Tools
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Professional Services */}
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
              Professional Services for Every Practice
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Specialized tools and workflows designed for different types of accounting professionals
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {accountantTypes.map((type, index) => (
              <motion.div 
                key={index}
                variants={fadeInVariant}
                className="group relative bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <type.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {type.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {type.description}
                </p>
                <ul className="space-y-3 text-sm text-slate-600">
                  {type.features.map((feature, featureIndex) => (
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

      {/* Benefits Section */}
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
              Why Professionals Choose Taxnify
            </h2>
            <p className="text-xl text-slate-600">
              Scale your practice with professional-grade tools designed for South African compliance
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
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
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
              Ready to Scale Your Practice?
            </h2>
            <p className="text-xl text-indigo-100 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of South African accounting professionals who trust Taxnify to manage their practice and serve their clients better.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group"
                >
                  Start Your Free Trial
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
            <p className="text-indigo-200 text-sm">
              No credit card required • 30-day free trial • Professional support included
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
                Professional-grade business management platform designed specifically for South African accounting professionals.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Professional Services</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/accountants/tax-practitioners" className="hover:text-white transition-colors">Tax Practitioners</Link></li>
                <li><Link href="/accountants/auditors" className="hover:text-white transition-colors">Auditors</Link></li>
                <li><Link href="/accountants/bookkeepers" className="hover:text-white transition-colors">Bookkeepers</Link></li>
                <li><Link href="/accountants/payroll-providers" className="hover:text-white transition-colors">Payroll Providers</Link></li>
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