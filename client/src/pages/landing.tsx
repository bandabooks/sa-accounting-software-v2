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
      <header className="border-b border-gray-100 bg-white/98 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Think Mybiz</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group">
                Reviews
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
            </nav>
            
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="font-medium hover:bg-gray-50 transition-colors">Sign In</Button>
              </Link>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium shadow-sm">
                  ⭐ Trusted by 500+ SA Accounting Professionals
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                  Modern Accounting.
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Built for South African
                  </span>
                  <br />
                  Professionals.
                </h1>
                
                <p className="text-xl text-gray-700 leading-relaxed max-w-lg">
                  Automate your accounting, VAT, and compliance in one secure, easy-to-use cloud platform. 
                  Purpose-built for South African tax practitioners and accounting firms.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free 30-Day Trial
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-4 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo (2 min)
                </Button>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>No credit card required • Full SARS compliance • Cancel anytime</span>
              </div>
            </div>
            
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="h-80 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Mock dashboard elements */}
                  <div className="absolute top-4 left-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">Professional Dashboard Preview</div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <BarChart3 className="h-20 w-20 text-blue-600 mx-auto animate-pulse" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-700 font-semibold">Real-time insights for your practice</p>
                      <div className="flex justify-center space-x-4 text-xs text-gray-500">
                        <span className="bg-blue-100 px-2 py-1 rounded">VAT Ready</span>
                        <span className="bg-green-100 px-2 py-1 rounded">SARS Compliant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 max-w-xs border border-gray-100 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">CA</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">"Game changer for our firm!"</p>
                    <p className="text-xs text-gray-500">- CA(SA), Johannesburg</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Small floating badge */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full text-xs font-semibold shadow-lg animate-bounce">
                SARS Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
                Complete Feature Suite
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Everything You Need for Modern Accounting
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Purpose-built features that understand South African tax requirements and compliance needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 h-full bg-white/80 backdrop-blur-sm hover:-translate-y-2"
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Learn more</span>
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Additional trust indicators */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6 font-medium">Integrated with leading South African institutions</p>
            <div className="flex justify-center items-center space-x-12 opacity-70">
              <div className="flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">SARS Approved</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                <Lock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Bank Grade Security</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">IFRS Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-r from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-medium">
                Client Success Stories
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Trusted by Accountants and Tax Practitioners
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what South African professionals are saying about Think Mybiz
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="bg-white/90 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <CardContent className="p-8">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-8 text-lg leading-relaxed relative">
                    <span className="text-4xl text-blue-300 absolute -top-2 -left-2">"</span>
                    <span className="relative italic">{testimonial.quote}</span>
                    <span className="text-4xl text-blue-300 absolute -bottom-4 -right-2">"</span>
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-4 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                      <p className="text-sm text-gray-600 font-medium">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Enhanced trust badges */}
          <div className="mt-20 text-center">
            <p className="text-gray-600 mb-8 text-lg font-medium">Trusted by leading South African institutions</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Building, label: "Major Banks" },
                { icon: Shield, label: "Security Certified" },
                { icon: Lock, label: "Data Protected" },
                { icon: CheckCircle, label: "SARS Approved" },
                { icon: Globe, label: "Cloud Secure" },
                { icon: Users, label: "500+ Users" }
              ].map((badge, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <badge.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700">{badge.label}</p>
                </div>
              ))}
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
      <section id="pricing" className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium">
                Transparent Pricing
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for your practice. All plans include our full feature suite.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative transform transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-2 border-blue-500 shadow-2xl scale-105 bg-gradient-to-b from-blue-50 to-white' 
                    : 'border-2 border-gray-200 hover:border-blue-300 shadow-lg bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 text-sm font-medium shadow-lg">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                  <div className="mt-6 mb-4">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-lg text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full py-4 text-lg font-medium transition-all duration-200 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl' 
                        : 'border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50'
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                    {plan.popular && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 max-w-2xl mx-auto shadow-lg">
              <p className="text-gray-700 mb-4 text-lg font-medium">
                All plans include 30-day free trial • No setup fees • Cancel anytime
              </p>
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  <span>Money-back guarantee</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-2" />
                  <span>24/7 support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Free migration</span>
                </div>
              </div>
            </div>
            <Button variant="link" className="text-blue-600 mt-6 text-lg font-medium hover:text-blue-700">
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
      <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-24 h-24 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                  🚀 Ready to Get Started?
                </Badge>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Ready to Modernize Your Practice?
                </h2>
                
                <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Join hundreds of South African accounting professionals who've already made the switch to Think Mybiz.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/90 backdrop-blur-sm border-0 text-gray-900 placeholder-gray-500 h-12"
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Company name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-white/90 backdrop-blur-sm border-0 text-gray-900 placeholder-gray-500 h-12"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-white text-blue-600 hover:bg-gray-100 h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                        Starting Your Trial...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Zap className="mr-2 h-5 w-5" />
                        Start Free 30-Day Trial
                      </div>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 flex justify-center items-center space-x-6 text-sm text-blue-100">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>30-day free trial</span>
                  </div>
                  <div className="flex items-center">  
                    <Shield className="h-4 w-4 mr-2" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Full support included</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-white/20">
                <p className="text-blue-100 text-lg font-medium mb-4">
                  Questions? Speak to our South African team
                </p>
                <div className="flex justify-center items-center space-x-8">
                  <a href="tel:+27123456789" className="flex items-center text-white hover:text-blue-200 transition-colors">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>+27 12 345 6789</span>
                  </a>
                  <a href="mailto:hello@thinkmybiz.com" className="flex items-center text-white hover:text-blue-200 transition-colors">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>hello@thinkmybiz.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
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