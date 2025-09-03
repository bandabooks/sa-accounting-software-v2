import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Menu, 
  X,
  CheckCircle,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Users,
  TrendingUp,
  Lock,
  Clock,
  Phone,
  Mail,
  Award,
  Briefcase,
  FileText,
  Calculator,
  CreditCard,
  Target,
  Star,
  Play
} from 'lucide-react';

export default function LandingPagePro() {
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
                { name: 'Solutions', href: '/solutions' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'Resources', href: '/resources' }
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
                  { name: 'Solutions', href: '/solutions' },
                  { name: 'Pricing', href: '/pricing' },
                  { name: 'Resources', href: '/resources' }
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
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
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-slate-700 font-medium">South Africa's #1 Business Platform</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={fadeInVariant}
              className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight"
            >
              Transform Your
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Business Operations
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeInVariant}
              className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              Complete accounting, compliance, and business intelligence platform designed specifically for South African enterprises. SARS-ready, CIPC-compliant, and built for growth.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInVariant}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group"
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
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={fadeInVariant}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { icon: Shield, text: "SARS Integrated", desc: "Direct compliance" },
                { icon: CheckCircle, text: "CIPC Compliant", desc: "Full regulatory support" },
                { icon: Users, text: "500+ SA Firms", desc: "Trusted nationwide" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-3">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.text}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
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
              Everything Your Business Needs
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for South African businesses and accounting practices
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Calculator,
                title: "Complete Accounting Suite",
                description: "IFRS-compliant Chart of Accounts, Journal Entries, Fixed Assets Management, and comprehensive financial reporting.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: FileText,
                title: "South African VAT Compliance",
                description: "Automated VAT calculations, VAT201 returns, and intelligent compliance guidance with SARS integration.",
                color: "from-indigo-500 to-indigo-600"
              },
              {
                icon: Shield,
                title: "SARS API Integration",
                description: "Direct integration with SARS systems for automated submissions, returns, and real-time compliance monitoring.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Briefcase,
                title: "Business Operations",
                description: "Complete transaction management including invoices, estimates, purchase orders, and credit notes.",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                icon: BarChart3,
                title: "Advanced Reporting",
                description: "Professional financial reports, dashboards, and business intelligence with PDF export capabilities.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: CreditCard,
                title: "Payment Processing",
                description: "Integrated South African payment gateways including PayFast, Peach Payments, and Yoco.",
                color: "from-pink-500 to-pink-600"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInVariant}
                className="group relative bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
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
              Choose Your Plan
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Flexible pricing designed for businesses of all sizes, from startups to enterprises
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                name: "Starter",
                price: "R299",
                period: "/month",
                description: "Perfect for small businesses and freelancers",
                features: [
                  "Up to 5 users",
                  "Basic accounting features",
                  "VAT compliance",
                  "Standard reporting",
                  "Email support"
                ],
                cta: "Start Free Trial",
                popular: false
              },
              {
                name: "Professional",
                price: "R799",
                period: "/month",
                description: "Ideal for growing businesses and accounting practices",
                features: [
                  "Up to 25 users",
                  "Full accounting suite",
                  "SARS integration",
                  "Advanced reporting",
                  "Priority support",
                  "Multi-company support"
                ],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large organizations with complex needs",
                features: [
                  "Unlimited users",
                  "Custom integrations",
                  "Dedicated support",
                  "Advanced security",
                  "Custom reporting",
                  "SLA guarantee"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div 
                key={index}
                variants={fadeInVariant}
                className={`relative bg-white rounded-2xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-blue-600 shadow-2xl scale-105' 
                    : 'border-slate-200 shadow-lg hover:shadow-xl'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-end justify-center mb-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-slate-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-6 lg:px-8 w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInVariant}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of South African businesses that trust Taxnify for their accounting and compliance needs. Start your free trial today.
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
                  Contact Sales
                </Button>
              </Link>
            </div>
            <p className="text-blue-200 text-sm">
              No credit card required • 30-day free trial • Cancel anytime
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
                South Africa's premier business management platform. Comprehensive accounting, 
                compliance, and business intelligence solutions built for local enterprises.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors">
                  <Phone size={18} />
                  <span>+27 11 123 4567</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors">
                  <Mail size={18} />
                  <span>hello@taxnify.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Product</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Documentation</Link></li>
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