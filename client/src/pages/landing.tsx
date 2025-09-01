import { Link } from "wouter";
import { 
  CheckCircle, ArrowRight, Star, Play, Shield, Users, Award,
  TrendingUp, Calculator, FileText, Clock, Phone, Mail, Building2,
  Zap, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/layout/marketing-layout";

export default function Landing() {
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

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
        <div className="w-full px-8 sm:px-12 lg:px-20 xl:px-32">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              South Africa's Leading
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Business Management Platform
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-5xl mx-auto mb-8">
              Unified accounting, compliance, and business intelligence designed specifically for South African enterprises. 
              SARS-ready, CIPC-compliant, and built for growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/login">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                <Play className="mr-2" size={20} />
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <Shield size={20} />
                <span>SARS Integrated</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award size={20} />
                <span>CIPC Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={20} />
                <span>500+ SA Firms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="w-full px-8 sm:px-12 lg:px-20 xl:px-32">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Run Your Business</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Comprehensive tools designed specifically for South African businesses and accounting practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 group cursor-pointer">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                    <feature.icon className="text-blue-600 group-hover:text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="ml-1" size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="w-full px-8 sm:px-12 lg:px-20 xl:px-32">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by South African Professionals</h2>
            <p className="text-xl text-gray-600">Join hundreds of businesses and accounting firms who trust Taxnify</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="w-full px-8 sm:px-12 lg:px-20 xl:px-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Active Firms</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-200">Transactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-200">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">R2B+</div>
              <div className="text-blue-200">Managed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="w-full px-8 sm:px-12 lg:px-20 xl:px-32">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-xl shadow-lg border-2 p-8 relative ${
                plan.popular ? 'border-blue-500 transform scale-105' : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.price}
                    <span className="text-lg text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full py-3 ${
                  plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="w-full flex flex-col items-center justify-center text-center px-8 sm:px-12 lg:px-20 xl:px-32">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business 1000 Times?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of South African businesses that trust Taxnify for their accounting and compliance needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4">
                Start Your Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 mt-6 text-sm">No credit card required • 30-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="w-full px-8 sm:px-12 lg:px-20 xl:px-32">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-xl font-bold">Taxnify</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                South Africa's premier business management platform. Comprehensive accounting, 
                compliance, and business intelligence solutions built for local enterprises.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone size={16} />
                  <span>+27 11 123 4567</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail size={16} />
                  <span>hello@taxnify.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Documentation</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2025 Taxnify. All rights reserved.
            </div>
            <div className="flex space-x-6 text-gray-400 text-sm mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </MarketingLayout>
  );
}