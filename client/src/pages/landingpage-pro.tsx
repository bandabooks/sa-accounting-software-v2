import { Link } from "wouter";
import { 
  CheckCircle, ArrowRight, Star, Play, Shield, Users, Award,
  TrendingUp, Calculator, FileText, Clock, Phone, Mail, Building2,
  Zap, Globe, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";

export default function LandingPagePro() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Calculator,
      title: "Complete Accounting Suite",
      description: "Full-featured accounting with invoicing, expenses, and financial reports",
      href: "/features/accounting"
    },
    {
      icon: Shield,
      title: "South African VAT Compliance",
      description: "Automated VAT calculations and SARS-ready reporting",
      href: "/features/compliance"
    },
    {
      icon: FileText,
      title: "SARS Integration",
      description: "Direct submission of VAT201 returns and tax documents",
      href: "/features/sars-integration"
    },
    {
      icon: Building2,
      title: "CIPC Compliance",
      description: "Annual returns and company registry compliance",
      href: "/features/cipc-compliance"
    },
    {
      icon: Users,
      title: "Multi-Company Management",
      description: "Manage multiple businesses from a single dashboard",
      href: "/features/multi-company"
    },
    {
      icon: TrendingUp,
      title: "Advanced Reporting",
      description: "Real-time insights and professional financial reports",
      href: "/features/reporting"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CA(SA), Managing Partner",
      company: "Johnson & Associates",
      content: "Taxnify has revolutionized our practice. We've reduced our compliance work by 60% and can now focus on growing our client base.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Financial Director",
      company: "Cape Town Retailers",
      content: "The VAT compliance features are exceptional. We haven't had a single SARS query since switching to Taxnify.",
      rating: 5
    },
    {
      name: "Nomsa Mthembu",
      role: "Small Business Owner",
      company: "Mthembu Consulting",
      content: "Finally, accounting software that understands South African business needs. The support team is outstanding.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Basic Plan",
      price: "R299.99",
      period: "/month",
      description: "Perfect for small businesses getting started",
      features: [
        "Customer Management",
        "Basic Invoicing",
        "Expense Tracking",
        "Financial Reports",
        "VAT Management",
        "Chart of Accounts"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional Plan",
      price: "R679.99",
      period: "/month",
      description: "Advanced features for growing businesses",
      features: [
        "Everything in Basic",
        "Advanced Invoicing",
        "Inventory Management",
        "VAT Management",
        "Advanced Analytics",
        "Compliance Management"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise Plan",
      price: "R1199.99",
      period: "/month",
      description: "Full-featured solution for large organizations",
      features: [
        "Everything in Professional",
        "Multi-Company",
        "Payroll Management",
        "Point of Sale",
        "API Access",
        "Dedicated Support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const fadeInVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion ? { duration: 0 } : { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden">
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-md z-50"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="mx-auto max-w-screen-xl px-4 w-full">
          <div className="flex items-center justify-between h-16 w-full">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Taxnify</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
              <Link href="/features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-md px-2 py-1">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-md px-2 py-1">
                Pricing
              </Link>
              <Link href="/resources" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-md px-2 py-1">
                Resources
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-md px-2 py-1">
                Contact
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4" role="navigation" aria-label="Mobile navigation">
              <div className="space-y-4">
                <Link href="/features" className="block text-gray-700 hover:text-indigo-600 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-md">
                  Features
                </Link>
                <Link href="/pricing" className="block text-gray-700 hover:text-indigo-600 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-md">
                  Pricing
                </Link>
                <Link href="/resources" className="block text-gray-700 hover:text-indigo-600 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-md">
                  Resources
                </Link>
                <Link href="/contact" className="block text-gray-700 hover:text-indigo-600 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-md">
                  Contact
                </Link>
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white pt-24 pb-20 overflow-hidden w-full max-w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-indigo-800/20"></div>
          <div className="relative mx-auto max-w-screen-xl px-4 w-full">
            <motion.div 
              className="text-center"
              initial="hidden"
              animate="visible"
              variants={fadeInVariant}
            >
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
                variants={fadeInVariant}
              >
                South Africa's Leading
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-300 mt-2">
                  Business Management Platform
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl lg:text-2xl text-indigo-100 max-w-4xl mx-auto mb-12 leading-relaxed"
                variants={fadeInVariant}
              >
                Unified accounting, compliance, and business intelligence designed specifically for South African enterprises. 
                SARS-ready, CIPC-compliant, and built for growth.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
                variants={fadeInVariant}
              >
                <Link href="/login">
                  <Button 
                    size="lg" 
                    className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-medium rounded-xl backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                >
                  <Play className="mr-2" size={20} />
                  Watch Demo
                </Button>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-indigo-100"
                variants={fadeInVariant}
              >
                <div className="flex items-center space-x-3">
                  <Shield size={24} className="text-amber-300" />
                  <span className="font-medium">SARS Integrated</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award size={24} className="text-amber-300" />
                  <span className="font-medium">CIPC Compliant</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users size={24} className="text-amber-300" />
                  <span className="font-medium">500+ SA Firms</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-gray-50 w-full max-w-full overflow-hidden" aria-labelledby="features-heading">
          <div className="mx-auto max-w-screen-xl px-4 w-full">
            <motion.div 
              className="text-center mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInVariant}
            >
              <h2 id="features-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need to Run Your Business
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive tools designed specifically for South African businesses and accounting practices
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInVariant}>
                  <Link href={feature.href}>
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer h-full">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-all duration-300 group-hover:scale-110">
                        <feature.icon className="text-indigo-600 group-hover:text-white transition-colors duration-300" size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                      <div className="flex items-center text-indigo-600 group-hover:text-indigo-700 font-medium">
                        <span>Learn more</span>
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={16} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 bg-white" aria-labelledby="testimonials-heading">
          <div className="mx-auto max-w-screen-xl px-4">
            <motion.div 
              className="text-center mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInVariant}
            >
              <h2 id="testimonials-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Trusted by South African Professionals
              </h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Join hundreds of businesses and accounting firms who trust Taxnify
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  variants={fadeInVariant}
                >
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-amber-400 fill-current" size={20} />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-8 text-lg leading-relaxed italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="border-t border-gray-100 pt-6">
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 mt-1">{testimonial.role}</div>
                    <div className="text-indigo-600 font-medium mt-1">{testimonial.company}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-indigo-600 text-white" aria-labelledby="stats-heading">
          <div className="mx-auto max-w-screen-xl px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <motion.div variants={fadeInVariant}>
                  <div className="text-4xl md:text-5xl font-bold mb-3 text-amber-300">500+</div>
                  <div className="text-indigo-200 text-lg">Active Firms</div>
                </motion.div>
                <motion.div variants={fadeInVariant}>
                  <div className="text-4xl md:text-5xl font-bold mb-3 text-amber-300">50K+</div>
                  <div className="text-indigo-200 text-lg">Transactions</div>
                </motion.div>
                <motion.div variants={fadeInVariant}>
                  <div className="text-4xl md:text-5xl font-bold mb-3 text-amber-300">99.9%</div>
                  <div className="text-indigo-200 text-lg">Uptime</div>
                </motion.div>
                <motion.div variants={fadeInVariant}>
                  <div className="text-4xl md:text-5xl font-bold mb-3 text-amber-300">R2B+</div>
                  <div className="text-indigo-200 text-lg">Managed</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-gray-50 w-full max-w-full overflow-hidden" aria-labelledby="pricing-heading">
          <div className="mx-auto max-w-screen-xl px-4 w-full">
            <motion.div 
              className="text-center mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInVariant}
            >
              <h2 id="pricing-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Choose the plan that's right for your business
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {pricingPlans.map((plan, index) => (
                <motion.div 
                  key={index} 
                  className={`bg-white rounded-2xl shadow-lg border-2 p-8 relative transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'border-indigo-500 scale-105 shadow-xl' : 'border-gray-200'
                  }`}
                  variants={fadeInVariant}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                    <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                      {plan.price}
                      <span className="text-lg text-gray-500 font-normal">{plan.period}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{plan.description}</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full py-4 text-lg font-medium rounded-xl transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white focus:ring-indigo-600' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-900'
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
        <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white relative overflow-hidden w-full max-w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-indigo-800/20"></div>
          <div className="relative mx-auto max-w-4xl text-center px-4 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInVariant}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg md:text-xl text-indigo-100 mb-12 leading-relaxed max-w-2xl mx-auto">
                Join thousands of South African businesses that trust Taxnify for their accounting and compliance needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <Link href="/login">
                  <Button 
                    size="lg" 
                    className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                  >
                    Start Your Free Trial
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-medium rounded-xl backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
              <p className="text-indigo-200 text-sm">
                No credit card required • 30-day free trial • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20 w-full max-w-full overflow-hidden" role="contentinfo">
        <div className="mx-auto max-w-screen-xl px-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-2xl font-bold">Taxnify</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-md leading-relaxed text-lg">
                South Africa's premier business management platform. Comprehensive accounting, 
                compliance, and business intelligence solutions built for local enterprises.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <Phone size={18} />
                  <span>+27 11 123 4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <Mail size={18} />
                  <span>hello@taxnify.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">Integrations</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">Security</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">System Status</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">API Documentation</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400">
              © 2025 Taxnify. All rights reserved.
            </div>
            <div className="flex space-x-8 text-gray-400 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}