import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { 
  Calculator, ChevronDown, Menu, X, Star, Shield, Users, Zap,
  CheckCircle, ArrowRight, Play, Quote, Award, Globe, Clock,
  BarChart3, FileText, Building, Receipt, Package, CreditCard,
  TrendingUp, Lock, Phone, Mail, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      href: "/features/vat-compliance"
    },
    {
      icon: FileText,
      title: "SARS Integration",
      description: "Direct submission of VAT201 returns and tax documents",
      href: "/features/sars-integration"
    },
    {
      icon: Building,
      title: "CIPC Compliance",
      description: "Company registration and compliance management",
      href: "/features/cipc-compliance"
    },
    {
      icon: Users,
      title: "Multi-Company Management",
      description: "Manage multiple businesses from a single dashboard",
      href: "/features/multi-company"
    },
    {
      icon: BarChart3,
      title: "Advanced Reporting",
      description: "Real-time insights with IFRS-compliant financial reports",
      href: "/features/reporting"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Tax Practitioner",
      company: "Mitchell & Associates",
      content: "Taxnify has revolutionized our practice. The SARS integration saves us hours every week, and our clients love the transparency.",
      rating: 5
    },
    {
      name: "David Johnson",
      role: "Managing Director",
      company: "Johnson Manufacturing",
      content: "Finally, accounting software built for South African businesses. The VAT compliance features are exceptional.",
      rating: 5
    },
    {
      name: "Lisa Williams",
      role: "Senior Accountant",
      company: "Williams CPA",
      content: "The multi-company feature allows us to manage all our clients efficiently. Best investment we've made.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "R299",
      period: "/month",
      description: "Perfect for small businesses",
      features: [
        "Up to 5 invoices per month",
        "Basic VAT compliance",
        "Essential reports",
        "Email support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "R599",
      period: "/month",
      description: "Most popular for growing businesses",
      features: [
        "Unlimited invoices",
        "Full VAT & SARS integration",
        "Advanced reporting",
        "Multi-company support",
        "Priority support",
        "API access"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "R1,299",
      period: "/month",
      description: "For accounting firms and large businesses",
      features: [
        "Everything in Professional",
        "White-label options",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "Advanced security"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header ref={headerRef} className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Taxnify</h1>
                <p className="text-xs text-gray-500 -mt-1">Unified Business, Accounting, Compliance Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {/* Features Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('features')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Features</span>
                  <ChevronDown size={16} />
                </button>
                {activeDropdown === 'features' && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
                    <div className="grid grid-cols-1 gap-4">
                      <Link href="/features/accounting" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <Calculator className="text-blue-600 mt-1" size={20} />
                        <div>
                          <div className="font-medium text-gray-900">Accounting Suite</div>
                          <div className="text-sm text-gray-500">Complete financial management</div>
                        </div>
                      </Link>
                      <Link href="/features/compliance" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <Shield className="text-blue-600 mt-1" size={20} />
                        <div>
                          <div className="font-medium text-gray-900">Compliance Management</div>
                          <div className="text-sm text-gray-500">SARS, CIPC, and more</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Small Businesses Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('small-business')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Small Businesses</span>
                  <ChevronDown size={16} />
                </button>
                {activeDropdown === 'small-business' && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                    <Link href="/small-business/retail" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">Retail Businesses</Link>
                    <Link href="/small-business/restaurants" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">Restaurants</Link>
                    <Link href="/small-business/consultants" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">Consultants</Link>
                    <Link href="/small-business/ngos" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">NGOs</Link>
                  </div>
                )}
              </div>

              {/* Accountants Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('accountants')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Accountants</span>
                  <ChevronDown size={16} />
                </button>
                {activeDropdown === 'accountants' && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                    <Link href="/accountants/tax-practitioners" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">Tax Practitioners</Link>
                    <Link href="/accountants/auditors" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">Auditors</Link>
                    <Link href="/accountants/bookkeepers" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">Bookkeepers</Link>
                    <Link href="/accountants/payroll" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">Payroll Providers</Link>
                    <Link href="/accountants/partner-program" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">Partner Program</Link>
                  </div>
                )}
              </div>

              <Link href="/resources" className="text-gray-700 hover:text-blue-600 transition-colors">Resources</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <Link href="/features" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">Features</Link>
              <Link href="/small-business" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">Small Businesses</Link>
              <Link href="/accountants" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">Accountants</Link>
              <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">Pricing</Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">Contact</Link>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                </Link>
                <Link href="/onboarding" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-100 text-sm font-medium mb-6">
              <Star className="mr-2" size={16} />
              Trusted by 500+ South African Firms
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The Complete South African
              <span className="text-blue-200 block">Business Platform</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Streamline your accounting, ensure compliance, and grow your business with South Africa's most comprehensive business management platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/onboarding">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                <Play className="mr-2" size={20} />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <CheckCircle size={20} />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={20} />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={20} />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by South African Businesses</h2>
            <p className="text-lg text-gray-600">Join hundreds of accounting firms and businesses across South Africa</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Active Firms</div>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600">Businesses Served</div>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">4.9/5</div>
                <div className="text-sm text-gray-600">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need in One Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive business management designed specifically for South African regulations and requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="text-blue-600 group-hover:text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link href={feature.href} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  Learn More
                  <ArrowRight className="ml-1" size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real feedback from accounting professionals and business owners</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <Quote className="text-gray-300 mb-4" size={32} />
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for your business</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-white p-8 rounded-xl border-2 ${plan.popular ? 'border-blue-600' : 'border-gray-200'} ${plan.popular ? 'shadow-xl' : 'shadow-sm'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">Most Popular</span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="text-green-500 mr-3" size={20} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of South African businesses already using Taxnify to streamline their operations and ensure compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Your Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calculator className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Taxnify</h3>
                  <p className="text-gray-400 text-sm">Unified Business, Accounting, Compliance Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                South Africa's most comprehensive business management platform, designed specifically for local regulations and compliance requirements.
              </p>
              <div className="flex space-x-4">
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
    </div>
  );
}