import React, { useState, useEffect } from 'react';
import { Link } from "wouter";
import { 
  Calculator, Users, Shield, Award, CheckCircle, ArrowRight,
  FileText, Building, Clock, TrendingUp, Briefcase, Star,
  Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const accountantTypes = [
    {
      icon: Calculator,
      title: "Tax Practitioners",
      description: "Specialized tools for tax preparation, SARS submissions, and client compliance",
      href: "/accountants/tax-practitioners",
      features: ["Multi-client management", "Tax return preparation", "SARS e-filing", "Compliance tracking"]
    },
    {
      icon: Shield,
      title: "Auditors",
      description: "Audit management, working papers, and compliance reporting tools",
      href: "/accountants/auditors",
      features: ["Audit planning", "Working papers", "Risk assessment", "Reporting tools"]
    },
    {
      icon: FileText,
      title: "Bookkeepers",
      description: "Comprehensive bookkeeping tools for multiple clients and businesses",
      href: "/accountants/bookkeepers",
      features: ["Client portfolios", "Bank reconciliation", "Financial statements", "VAT returns"]
    },
    {
      icon: Users,
      title: "Payroll Providers",
      description: "Complete payroll processing and compliance for multiple companies",
      href: "/accountants/payroll-providers",
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
      <nav className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
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
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Taxnify
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
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
            <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/50 py-6">
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
            </div>
          )}
        </div>
      </nav>

      {/* Header */}
      <header className="relative pt-32 pb-20 w-full max-w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Built for Accounting Professionals
              <span className="block text-indigo-200">Scale Your Practice with Confidence</span>
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Professional-grade tools designed specifically for South African accounting firms, 
              tax practitioners, auditors, and bookkeepers. Manage multiple clients, ensure compliance, 
              and grow your practice efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Start Professional Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Request Demo for Firms
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Professional Solutions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Solutions for Every Accounting Professional</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized workflows and features designed for different types of accounting practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {accountantTypes.map((type, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                  <type.icon className="text-indigo-600 group-hover:text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-600 mb-4">{type.description}</p>
                <ul className="space-y-2 mb-6">
                  {type.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={type.href}>
                  <Button className="w-full group-hover:bg-indigo-600 group-hover:text-white">
                    Learn More
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Taxnify */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Accounting Professionals Choose Taxnify</h2>
            <p className="text-xl text-gray-600">Built specifically for the South African accounting industry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="text-indigo-600" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Program */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-12 text-white text-center">
            <div className="max-w-4xl mx-auto">
              <Star className="mx-auto mb-6 text-yellow-300" size={48} />
              <h2 className="text-4xl font-bold mb-6">Join Our Partner Program</h2>
              <p className="text-xl text-indigo-100 mb-8">
                Become a certified Taxnify partner and grow your practice with our support. 
                Get training, marketing materials, and referral commissions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Training & Certification</h3>
                  <p className="text-indigo-100">Comprehensive training program with certification</p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Marketing Support</h3>
                  <p className="text-indigo-100">Co-branded materials and lead generation</p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Revenue Sharing</h3>
                  <p className="text-indigo-100">Earn commissions on client referrals</p>
                </div>
              </div>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Apply for Partnership
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Leading Accounting Firms</h2>
            <p className="text-xl text-gray-600">See how professionals are transforming their practices</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="mb-6">
                <Calculator className="text-indigo-600 mb-4" size={40} />
                <h3 className="text-lg font-semibold text-gray-900">Johannesburg Tax Associates</h3>
                <p className="text-gray-600">Mid-size Tax Practice</p>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "Taxnify transformed our practice. We now handle 3x more clients with the same team. 
                The automated SARS submissions alone save us 40 hours per month."
              </blockquote>
              <div className="text-sm text-gray-500">David Molefe, CA(SA), Managing Partner</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="mb-6">
                <Shield className="text-indigo-600 mb-4" size={40} />
                <h3 className="text-lg font-semibold text-gray-900">Cape Audit Specialists</h3>
                <p className="text-gray-600">Audit Firm</p>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "The audit management features and working papers system have streamlined our entire 
                audit process. Client reporting is now automated and professional."
              </blockquote>
              <div className="text-sm text-gray-500">Sarah van der Merwe, CA(SA), Audit Partner</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="mb-6">
                <FileText className="text-indigo-600 mb-4" size={40} />
                <h3 className="text-lg font-semibold text-gray-900">Durban Bookkeeping Services</h3>
                <p className="text-gray-600">Bookkeeping Practice</p>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "Managing 80+ small business clients was becoming impossible. Taxnify's multi-client 
                dashboard and automated processes have been a game-changer."
              </blockquote>
              <div className="text-sm text-gray-500">Priya Patel, Professional Bookkeeper</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Practice?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of South African accounting professionals who trust Taxnify to grow their practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              Start Professional Trial
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Firm Demo
            </Button>
          </div>
          <p className="text-indigo-200 mt-4 text-sm">30-day free trial • No setup fees • Cancel anytime</p>
        </div>
      </section>
    </div>
  );
}