import React, { useState, useEffect } from 'react';
import { Link } from "wouter";
import { 
  Store, Coffee, Users, Heart, CheckCircle, ArrowRight,
  Calculator, Shield, Clock, TrendingUp, Smartphone, Award, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const industries = [
    {
      icon: Store,
      title: "Retail Businesses",
      description: "Point-of-sale integration, inventory management, and customer loyalty programs",
      href: "/small-business/retail",
      features: ["Inventory tracking", "POS integration", "Customer management", "Sales reporting"]
    },
    {
      icon: Coffee,
      title: "Restaurants & Hospitality",
      description: "Table management, menu costing, staff scheduling, and compliance tracking",
      href: "/small-business/restaurants",
      features: ["Menu costing", "Staff scheduling", "Supplier management", "Health compliance"]
    },
    {
      icon: Users,
      title: "Consultants & Professionals",
      description: "Time tracking, project management, client billing, and professional compliance",
      href: "/small-business/consultants",
      features: ["Time tracking", "Project billing", "Client portals", "Professional standards"]
    },
    {
      icon: Heart,
      title: "NGOs & Non-Profits",
      description: "Donor management, grant tracking, compliance reporting, and transparency tools",
      href: "/small-business/ngos",
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
      <nav className="fixed top-0 left-0 right-0 z-[9999] bg-white shadow-lg border-b border-slate-200">
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
      <header className="relative pt-40 pb-20 w-full max-w-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Built for Small Business
              <span className="block text-purple-200">Success in South Africa</span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Whether you're running a retail store, restaurant, consultancy, or NGO, 
              Taxnify provides the tools and compliance features you need to grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                See Industry Solutions
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Industry Solutions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Solutions for Every Industry</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized features and workflows designed for different types of small businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industries.map((industry, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                  <industry.icon className="text-purple-600 group-hover:text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{industry.title}</h3>
                <p className="text-gray-600 mb-4">{industry.description}</p>
                <ul className="space-y-2 mb-6">
                  {industry.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={industry.href}>
                  <Button className="w-full group-hover:bg-purple-600 group-hover:text-white">
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Small Businesses Choose Taxnify</h2>
            <p className="text-xl text-gray-600">Simple, affordable, and designed specifically for South African businesses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="text-purple-600" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Small Business Success Stories</h2>
            <p className="text-xl text-gray-600">Real results from real South African businesses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="mb-6">
                <Store className="text-purple-600 mb-4" size={40} />
                <h3 className="text-lg font-semibold text-gray-900">Cape Town Boutique</h3>
                <p className="text-gray-600">Fashion Retail</p>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "Taxnify helped us reduce our accounting costs by 60% and never miss a VAT deadline again. 
                The inventory management features are perfect for our retail business."
              </blockquote>
              <div className="text-sm text-gray-500">Sarah Johnson, Owner</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="mb-6">
                <Coffee className="text-purple-600 mb-4" size={40} />
                <h3 className="text-lg font-semibold text-gray-900">Café Ubuntu</h3>
                <p className="text-gray-600">Restaurant</p>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "The menu costing and staff management features transformed how we operate. 
                We can now track profitability per dish and manage our team efficiently."
              </blockquote>
              <div className="text-sm text-gray-500">Michael Ndlovu, Manager</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="mb-6">
                <Users className="text-purple-600 mb-4" size={40} />
                <h3 className="text-lg font-semibold text-gray-900">Consulting Plus</h3>
                <p className="text-gray-600">Management Consultancy</p>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "Time tracking and project billing features have doubled our billing accuracy. 
                The client portal keeps our customers informed and happy."
              </blockquote>
              <div className="text-sm text-gray-500">Lisa Van Der Merwe, Director</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing for Small Business */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Affordable Plans for Growing Businesses</h2>
          <p className="text-xl text-gray-600 mb-12">Start small and scale as you grow</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-purple-600 mb-4">R299<span className="text-lg text-gray-500">/month</span></div>
              <p className="text-gray-600 mb-6">Perfect for small businesses just getting started</p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Up to 5 invoices per month</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Basic VAT compliance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Essential reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Start Free Trial</Button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-purple-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <div className="text-4xl font-bold text-purple-600 mb-4">R599<span className="text-lg text-gray-500">/month</span></div>
              <p className="text-gray-600 mb-6">For growing businesses that need more features</p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Unlimited invoices</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Full VAT & SARS integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Advanced reporting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Inventory management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Start Free Trial</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Grow Your Small Business?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of South African small businesses who trust Taxnify for their success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Start Your Free Trial Today
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-purple-200 mt-4 text-sm">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>
    </div>
  );
}