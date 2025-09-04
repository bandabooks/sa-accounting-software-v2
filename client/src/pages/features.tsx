import { useState } from "react";
import { Link } from "wouter";
import { 
  Calculator, Shield, FileText, Building, Users, BarChart3,
  CreditCard, Package, Zap, Clock, Globe, CheckCircle, ArrowRight,
  Smartphone, Lock, Award, TrendingUp, Mail, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/layout/marketing-layout";

export default function Features() {
  const [activeTab, setActiveTab] = useState("overview");

  const features = [
    {
      icon: Calculator,
      title: "Complete Accounting Suite",
      description: "Full double-entry bookkeeping with invoicing, expenses, and financial management",
      benefits: [
        "Professional invoice generation and tracking",
        "Comprehensive expense management",
        "Bank reconciliation and cash flow monitoring",
        "Chart of accounts management",
        "Journal entries and general ledger"
      ]
    },
    {
      icon: Shield,
      title: "South African VAT Compliance",
      description: "Automated VAT calculations and SARS-ready reporting for full compliance",
      benefits: [
        "Automatic VAT rate application",
        "VAT201 return preparation",
        "Input and output VAT tracking",
        "Zero-rated and exempt transaction handling",
        "SARS e-filing integration"
      ]
    },
    {
      icon: FileText,
      title: "SARS Integration",
      description: "Direct submission of tax documents and seamless government compliance",
      benefits: [
        "Electronic VAT201 submissions",
        "Income tax return preparation",
        "PAYE submissions and tracking",
        "UIF and SDL compliance",
        "Real-time SARS status updates"
      ]
    },
    {
      icon: Building,
      title: "CIPC Compliance Management",
      description: "Company registration and ongoing statutory compliance made simple",
      benefits: [
        "Annual return preparation and filing",
        "Company information updates",
        "Director and shareholder management",
        "Compliance deadline tracking",
        "Document storage and retrieval"
      ]
    },
    {
      icon: Users,
      title: "Multi-Company Management",
      description: "Manage multiple businesses or clients from a single, unified dashboard",
      benefits: [
        "Centralized client management",
        "Cross-company reporting",
        "Role-based access control",
        "Company switching interface",
        "Consolidated financial oversight"
      ]
    },
    {
      icon: BarChart3,
      title: "Advanced Financial Reporting",
      description: "Real-time insights with IFRS-compliant financial statements and analytics",
      benefits: [
        "Profit & Loss statements",
        "Balance sheet generation",
        "Cash flow analysis",
        "Trial balance reports",
        "Custom reporting dashboards"
      ]
    },
    {
      icon: CreditCard,
      title: "Banking Integration",
      description: "Connect your bank accounts for automatic transaction import and reconciliation",
      benefits: [
        "Open Banking API connections",
        "Automatic transaction categorization",
        "Real-time balance updates",
        "Duplicate transaction detection",
        "Multi-currency support"
      ]
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track stock levels, manage suppliers, and automate purchase orders",
      benefits: [
        "Real-time stock tracking",
        "Automatic reorder points",
        "Supplier management",
        "Purchase order automation",
        "Cost of goods sold calculations"
      ]
    },
    {
      icon: Zap,
      title: "Automation & Workflows",
      description: "Automate repetitive tasks and create custom business workflows",
      benefits: [
        "Recurring invoice automation",
        "Payment reminder sequences",
        "Approval workflow management",
        "Custom notification rules",
        "Task scheduling and tracking"
      ]
    }
  ];

  const tabs = [
    { id: "overview", label: "Feature Overview" },
    { id: "accounting", label: "Accounting" },
    { id: "compliance", label: "Compliance" },
    { id: "reporting", label: "Reporting" },
    { id: "automation", label: "Automation" }
  ];

  return (
    <MarketingLayout>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Everything Your Business Needs
              <span className="block text-blue-200">in One Platform</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Discover how Taxnify's comprehensive feature set transforms business management, 
              ensures South African compliance, and drives growth for companies of all sizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <section className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="text-blue-600 group-hover:text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for South African Business</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is designed with South African regulations, compliance requirements, 
              and business practices in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Compliance Made Simple</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">SARS Integration</h4>
                    <p className="text-gray-600">Direct electronic filing of VAT201, PAYE, and income tax returns</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">CIPC Compliance</h4>
                    <p className="text-gray-600">Automated annual returns and company information updates</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">Deadline Management</h4>
                    <p className="text-gray-600">Never miss a compliance deadline with automated reminders</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Statistics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Saved Monthly</span>
                  <span className="text-2xl font-bold text-blue-600">40+ Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Compliance Accuracy</span>
                  <span className="text-2xl font-bold text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Error Reduction</span>
                  <span className="text-2xl font-bold text-blue-600">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Security</h2>
            <p className="text-xl text-gray-600">Your data is protected with bank-level security and compliance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">256-bit SSL Encryption</h3>
              <p className="text-gray-600">All data transmission is encrypted with military-grade security</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ISO 27001 Certified</h3>
              <p className="text-gray-600">Internationally recognized information security standards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">POPIA Compliant</h3>
              <p className="text-gray-600">Full compliance with South African data protection laws</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white w-full">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience All Features?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free trial today and discover how Taxnify can transform your business operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial - No Credit Card Required
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Phone className="mr-2" size={20} />
              Book a Personal Demo
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}