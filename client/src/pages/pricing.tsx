import React, { useState, useEffect } from 'react';
import { Link } from "wouter";
import { 
  CheckCircle, ArrowRight, Star, Shield, Users, Zap,
  Calculator, Phone, Mail, Clock, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");
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

  const plans = [
    {
      name: "Basic Plan",
      description: "Perfect for small businesses getting started",
      price: { monthly: 299.99, annually: 3329.89 },
      originalPrice: { annually: 3599.88 },
      popular: false,
      features: [
        "Customer Management",
        "Basic Invoicing",
        "Expense Tracking",
        "Financial Reports",
        "VAT Management",
        "Chart of Accounts"
      ],
      limitations: [
        "2 Users",
        "1 Company",
        "100 Customers",
        "50 Invoices/month"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Professional Plan",
      description: "Advanced features for growing businesses",
      price: { monthly: 679.99, annually: 7519.89 },
      originalPrice: { annually: 8159.88 },
      popular: true,
      features: [
        "Everything in Basic",
        "Advanced Invoicing",
        "Inventory Management",
        "VAT Management",
        "Advanced Analytics",
        "Compliance Management"
      ],
      limitations: [],
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise Plan",
      description: "Full-featured solution for large organizations",
      price: { monthly: 1199.99, annually: 13299.89 },
      originalPrice: { annually: 14399.88 },
      popular: false,
      features: [
        "Everything in Professional",
        "Multi-Company",
        "Payroll Management",
        "Point of Sale",
        "API Access",
        "Dedicated Support"
      ],
      limitations: [],
      cta: "Contact Sales"
    }
  ];

  const addOns = [
    { name: "Additional Users", price: "R99/user/month", description: "Add more team members" },
    { name: "Advanced Reporting", price: "R199/month", description: "Custom dashboards and reports" },
    { name: "SMS Notifications", price: "R49/month", description: "SMS alerts and reminders" },
    { name: "Dedicated Support", price: "R299/month", description: "Priority phone and email support" }
  ];

  const faqs = [
    {
      question: "Can I change plans at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
    },
    {
      question: "Is there a setup fee?",
      answer: "No, there are no setup fees. You only pay the monthly or annual subscription fee for your chosen plan."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, EFT payments, and annual invoice billing for Enterprise customers."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use bank-level 256-bit SSL encryption and are fully compliant with South African data protection laws (POPIA)."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees."
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
      <header className="relative pt-32 pb-20 w-full max-w-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Simple, Transparent Pricing
              <span className="block text-blue-200">for Every Business Size</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Choose the plan that's right for your business. Start with a 14-day free trial, 
              no credit card required. Upgrade or downgrade at any time.
            </p>
            <div className="inline-flex items-center bg-white/10 rounded-full p-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  billingPeriod === "monthly" ? "bg-white text-blue-600" : "text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annually")}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  billingPeriod === "annually" ? "bg-white text-blue-600" : "text-white"
                }`}
              >
                Annual (Save 17%)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                plan.popular ? 'border-blue-600 scale-105' : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">
                        R{billingPeriod === "monthly" ? plan.price.monthly : Math.round(plan.price.annually / 12)}
                      </span>
                      <span className="text-gray-600 ml-2">/{billingPeriod === "monthly" ? "month" : "month"}</span>
                    </div>
                    {billingPeriod === "annually" && plan.originalPrice && (
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="line-through">R{Math.round(plan.originalPrice.annually / 12)}/month</span>
                        <span className="text-green-600 ml-2">Save R{Math.round((plan.originalPrice.annually - plan.price.annually) / 12)}/month</span>
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={plan.cta === "Start Free Trial" ? "/trial-signup" : "/contact"}>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
                      size="lg"
                    >
                      {plan.cta}
                      {plan.cta === "Start Free Trial" && <ArrowRight className="ml-2" size={16} />}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="text-green-500" size={16} />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-green-500" size={16} />
                <span>24/7 system monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="text-green-500" size={16} />
                <span>South African support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Optional Add-ons</h2>
            <p className="text-xl text-gray-600">Enhance your plan with additional features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{addon.name}</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">{addon.price}</div>
                <p className="text-gray-600 text-sm">{addon.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about our pricing</p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your 14-day free trial today. No credit card required, cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trial-signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Phone className="mr-2" size={20} />
                Call Sales: +27 11 123 4567
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}