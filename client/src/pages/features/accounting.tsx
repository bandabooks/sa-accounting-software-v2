import { Link } from "wouter";
import { 
  Calculator, FileText, CreditCard, TrendingUp, CheckCircle, ArrowRight,
  DollarSign, BarChart3, Receipt, PieChart, Clock, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/layout/marketing-layout";

export default function AccountingFeatures() {
  const accountingFeatures = [
    {
      icon: Calculator,
      title: "Professional Invoicing",
      description: "Create, send, and track professional invoices with automated reminders",
      features: [
        "Customizable invoice templates",
        "Automated recurring invoices",
        "Multi-currency support",
        "Payment tracking and reminders",
        "Client portal access"
      ]
    },
    {
      icon: Receipt,
      title: "Expense Management",
      description: "Track and categorize business expenses with receipt capture",
      features: [
        "Mobile receipt scanning",
        "Automatic categorization",
        "Mileage tracking",
        "Supplier management",
        "Tax deduction optimization"
      ]
    },
    {
      icon: TrendingUp,
      title: "Financial Reporting",
      description: "Generate comprehensive financial reports for informed decision-making",
      features: [
        "Profit & Loss statements",
        "Balance sheets",
        "Cash flow reports",
        "Budget vs actual analysis",
        "Custom dashboard metrics"
      ]
    },
    {
      icon: CreditCard,
      title: "Bank Reconciliation",
      description: "Automatically match transactions and maintain accurate records",
      features: [
        "Open Banking integration",
        "Automatic transaction import",
        "Smart matching algorithms",
        "Duplicate detection",
        "Multi-account management"
      ]
    }
  ];

  return (
    <MarketingLayout>
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Complete Accounting Suite
              <span className="block text-green-200">for South African Business</span>
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
              Streamline your financial management with professional accounting tools designed 
              specifically for South African businesses and compliance requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Financial Management</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From invoicing to financial reporting, our accounting suite covers all aspects 
              of business financial management with South African compliance built-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {accountingFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Taxnify Accounting?</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Save 40+ Hours Monthly</h3>
                    <p className="text-gray-600">Automate repetitive tasks and streamline your financial processes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Insights</h3>
                    <p className="text-gray-600">Make informed decisions with up-to-date financial data and reports</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Collaboration</h3>
                    <p className="text-gray-600">Work together with role-based access and approval workflows</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Accounting Dashboard Preview</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="text-2xl font-bold text-green-600">R 245,780</span>
                  </div>
                  <div className="text-sm text-gray-500">+15% from last month</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Outstanding Invoices</span>
                    <span className="text-2xl font-bold text-orange-600">R 48,920</span>
                  </div>
                  <div className="text-sm text-gray-500">12 invoices pending</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Monthly Expenses</span>
                    <span className="text-2xl font-bold text-red-600">R 89,450</span>
                  </div>
                  <div className="text-sm text-gray-500">Within budget limits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* South African Focus */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for South African Regulations</h2>
            <p className="text-xl text-gray-600">Every feature is designed with local compliance and business practices in mind</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">VAT Ready</h3>
              <p className="text-gray-600">Automatic VAT calculations and VAT201 return preparation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">IFRS Compliant</h3>
              <p className="text-gray-600">Financial statements that meet international standards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Currency</h3>
              <p className="text-gray-600">Handle ZAR and international currencies seamlessly</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Transform Your Financial Management Today</h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of South African businesses who have streamlined their accounting with Taxnify.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Start Your Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-green-200 mt-4 text-sm">No credit card required • 14-day free trial</p>
        </div>
      </section>
    </MarketingLayout>
  );
}