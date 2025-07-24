import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  FileText, 
  BarChart3, 
  Shield, 
  Users, 
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Zap,
  Clock,
  Building,
  TrendingUp,
  Banknote,
  Lock,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import { Link } from 'wouter';

const features = [
  {
    icon: FileText,
    title: "Effortless Invoicing & Billing",
    description: "Create professional invoices in seconds with automated recurring billing and instant payment tracking."
  },
  {
    icon: Calculator,
    title: "VAT-Ready for South Africa",
    description: "Automated VAT calculations, VAT201 submissions, and full SARS compliance built-in from day one."
  },
  {
    icon: BarChart3,
    title: "Professional Reports",
    description: "Generate P&L statements, Balance Sheets, and Cash Flow reports that meet IFRS standards."
  },
  {
    icon: Banknote,
    title: "Bank Integration & Secure Feeds",
    description: "Connect to major South African banks for automatic transaction imports and reconciliation."
  },
  {
    icon: Shield,
    title: "Built-in SARS/CIPC Compliance",
    description: "Stay compliant with automated tax calculations and regulatory reporting requirements."
  },
  {
    icon: Users,
    title: "Multi-user & Team Access",
    description: "Collaborate with your team and clients with role-based permissions and real-time updates."
  }
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    title: "CA(SA), Mitchell & Associates",
    image: "/api/placeholder/60/60",
    quote: "This software has transformed how we handle VAT submissions. The automated VAT201 feature alone saves us 10+ hours monthly.",
    rating: 5
  },
  {
    name: "Johan van der Merwe",
    title: "Tax Practitioner, Cape Town",
    image: "/api/placeholder/60/60", 
    quote: "Finally, accounting software built specifically for South African requirements. The SARS integration is seamless.",
    rating: 5
  },
  {
    name: "Priya Patel",
    title: "Managing Partner, Patel Accounting",
    image: "/api/placeholder/60/60",
    quote: "Our clients love the professional invoices and real-time reporting. We've increased efficiency by 40% since switching.",
    rating: 5
  }
];

const comparisonData = [
  {
    feature: "South African VAT Compliance",
    us: true,
    quickbooks: false,
    zoho: "Limited",
    sage: true
  },
  {
    feature: "SARS Integration",
    us: true,
    quickbooks: false,
    zoho: false,
    sage: "Partial"
  },
  {
    feature: "Local Bank Feeds",
    us: true,
    quickbooks: "Limited",
    zoho: false,
    sage: true
  },
  {
    feature: "24/7 SA Support",
    us: true,
    quickbooks: false,
    zoho: false,
    sage: "Business hours"
  },
  {
    feature: "Multi-company Management",
    us: true,
    quickbooks: "Premium only",
    zoho: "Higher tiers",
    sage: true
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "R299",
    period: "/month",
    description: "Perfect for solo practitioners and small businesses",
    features: [
      "Up to 5 clients",
      "Basic invoicing & estimates", 
      "VAT compliance & VAT201",
      "Standard reports",
      "Email support"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    price: "R599",
    period: "/month", 
    description: "Ideal for growing practices and accounting firms",
    features: [
      "Up to 25 clients",
      "Advanced invoicing & recurring billing",
      "Full SARS integration",
      "All professional reports",
      "Bank feeds & reconciliation",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "R999",
    period: "/month",
    description: "Complete solution for large firms and multi-location practices",
    features: [
      "Unlimited clients",
      "Multi-company management",
      "Advanced reporting & analytics",
      "API access & integrations",
      "Dedicated account manager",
      "24/7 phone support"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export default function Landing() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate signup process
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you! We\'ll be in touch soon to set up your free trial.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900">Think Mybiz</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Reviews</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Button>Start Free Trial</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                  ⭐ Trusted by 500+ SA Accounting Professionals
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Modern Accounting.
                <br />
                <span className="text-blue-600">Built for South African</span>
                <br />
                Professionals.
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Automate your accounting, VAT, and compliance in one secure, easy-to-use cloud platform. 
                Purpose-built for South African tax practitioners and accounting firms.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free 30-Day Trial
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-3">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo (2 min)
                </Button>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No credit card required • Full SARS compliance • Cancel anytime
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Professional Dashboard Preview</p>
                    <p className="text-sm text-gray-500 mt-2">Real-time insights for your practice</p>
                  </div>
                </div>
              </div>
              
              {/* Floating testimonial */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">"Game changer for our firm!"</p>
                    <p className="text-xs text-gray-500">- CA(SA), Johannesburg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Accounting
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Purpose-built features that understand South African tax requirements and compliance needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-blue-200 transition-colors h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Accountants and Tax Practitioners
            </h2>
            <p className="text-xl text-gray-600">
              See what South African professionals are saying about Think Mybiz
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-2 border-gray-100">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Trust badges */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-8">Trusted by leading South African institutions</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="h-12 w-24 bg-gray-200 rounded flex items-center justify-center">
                <Building className="h-6 w-6 text-gray-400" />
              </div>
              <div className="h-12 w-24 bg-gray-200 rounded flex items-center justify-center">
                <Shield className="h-6 w-6 text-gray-400" />
              </div>
              <div className="h-12 w-24 bg-gray-200 rounded flex items-center justify-center">
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Think Mybiz?
            </h2>
            <p className="text-xl text-gray-600">
              See how we compare to other accounting solutions
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">Think Mybiz</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">QuickBooks</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Zoho Books</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Sage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {row.us === true ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-sm text-gray-600">{row.us}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.quickbooks === true ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : row.quickbooks === false ? (
                          <span className="text-red-500">✗</span>
                        ) : (
                          <span className="text-sm text-yellow-600">{row.quickbooks}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.zoho === true ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : row.zoho === false ? (
                          <span className="text-red-500">✗</span>
                        ) : (
                          <span className="text-sm text-yellow-600">{row.zoho}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.sage === true ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : row.sage === false ? (
                          <span className="text-red-500">✗</span>
                        ) : (
                          <span className="text-sm text-yellow-600">{row.sage}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your practice
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : 'border border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">All plans include 30-day free trial • No setup fees • Cancel anytime</p>
            <Button variant="link" className="text-blue-600">
              See Full Feature Comparison <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              From signup to first invoice in under 10 minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign Up</h3>
              <p className="text-gray-600">Create your account in 30 seconds. No credit card required for your free trial.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Import Data</h3>
              <p className="text-gray-600">Easily import your existing clients, products, and financial data from any accounting system.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Accounting</h3>
              <p className="text-gray-600">Begin creating invoices, tracking expenses, and generating reports immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Modernize Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of South African accounting professionals who've already made the switch to Think Mybiz.
          </p>
          
          <form onSubmit={handleSignup} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-0"
                required
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8"
              >
                {isSubmitting ? 'Starting...' : 'Start Free Trial'}
              </Button>
            </div>
            <p className="text-sm text-blue-100">
              30-day free trial • No credit card required • Full support included
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}  
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calculator className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold">Think Mybiz</span>
              </div>
              <p className="text-gray-400 mb-6">
                Modern accounting software built specifically for South African professionals.
              </p>
              <div className="flex space-x-4">
                <Globe className="h-5 w-5 text-gray-400" />
                <Mail className="h-5 w-5 text-gray-400" />
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Think Mybiz. All rights reserved. Built with ❤️ for South African accounting professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}