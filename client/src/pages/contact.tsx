import { useState, useEffect } from "react";
import { 
  Phone, Mail, MapPin, Clock, MessageSquare, Send,
  CheckCircle, ArrowRight, Users, Shield, Award, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    inquiryType: "general"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our South African support team",
      details: "+27 11 123 4567",
      hours: "Mon-Fri: 8:00 AM - 6:00 PM SAST"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help via email within 2 hours",
      details: "support@taxnify.com",
      hours: "24/7 response within 2 hours"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Instant help through our website chat",
      details: "Available on all pages",
      hours: "Mon-Fri: 8:00 AM - 8:00 PM SAST"
    }
  ];

  const offices = [
    {
      city: "Johannesburg",
      address: "123 Sandton Drive, Sandton, 2196",
      phone: "+27 11 123 4567",
      email: "jhb@taxnify.com"
    },
    {
      city: "Cape Town",
      address: "456 Waterfront Way, V&A Waterfront, 8001",
      phone: "+27 21 987 6543",
      email: "cpt@taxnify.com"
    },
    {
      city: "Durban",
      address: "789 Marine Parade, Durban, 4001",
      phone: "+27 31 555 0123",
      email: "dbn@taxnify.com"
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We'll get back to you within 2 hours during business hours.
          </p>
          <Button onClick={() => setIsSubmitted(false)} className="bg-blue-600 hover:bg-blue-700">
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

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
      <header className="relative pt-40 pb-20 w-full max-w-full overflow-hidden bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Get in Touch
              <span className="block text-teal-200">We're Here to Help</span>
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
              Have questions about Taxnify? Need help with your account? Want to schedule a demo? 
              Our South African support team is ready to assist you.
            </p>
          </div>
        </div>
      </header>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Multiple Ways to Reach Us</h2>
            <p className="text-xl text-gray-600">Choose the contact method that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <method.icon className="text-teal-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <div className="text-lg font-semibold text-teal-600 mb-2">{method.details}</div>
                <div className="text-sm text-gray-500">{method.hours}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
            <p className="text-xl text-gray-600">Fill out the form below and we'll get back to you within 2 hours</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  placeholder="your.email@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="+27 11 123 4567"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                Inquiry Type
              </label>
              <select
                id="inquiryType"
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="general">General Inquiry</option>
                <option value="sales">Sales & Pricing</option>
                <option value="support">Technical Support</option>
                <option value="demo">Request Demo</option>
                <option value="partnership">Partnership</option>
                <option value="billing">Billing Question</option>
              </select>
            </div>

            <div className="mb-8">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full"
                placeholder="Tell us how we can help you..."
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Sending Message...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="ml-2" size={20} />
                </>
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our South African Offices</h2>
            <p className="text-xl text-gray-600">Visit us at one of our convenient locations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{office.city}</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-teal-600 flex-shrink-0 mt-1" size={16} />
                    <span className="text-gray-600 text-sm">{office.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="text-teal-600 flex-shrink-0" size={16} />
                    <span className="text-gray-600 text-sm">{office.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="text-teal-600 flex-shrink-0" size={16} />
                    <span className="text-gray-600 text-sm">{office.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Stats */}
      <section className="py-20 bg-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Award-Winning Support</h2>
            <p className="text-xl text-gray-600">See why our customers love our support team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-teal-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-blue-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">&lt; 2hrs</div>
              <div className="text-gray-600">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">System Monitoring</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-purple-600" size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-gray-600">Support Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-teal-100 mb-8">
            Don't wait! Start your free trial today and experience the Taxnify difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
              Start Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}