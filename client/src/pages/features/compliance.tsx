import { Link } from "wouter";
import { 
  Shield, FileText, Building, Clock, CheckCircle, ArrowRight,
  AlertTriangle, Calendar, Award, Lock, Users, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComplianceFeatures() {
  const complianceAreas = [
    {
      icon: Shield,
      title: "SARS Compliance",
      description: "Complete tax compliance with automated SARS submissions",
      features: [
        "VAT201 electronic filing",
        "PAYE monthly submissions",
        "Income tax return preparation",
        "UIF and SDL compliance",
        "Real-time SARS integration"
      ],
      color: "blue"
    },
    {
      icon: Building,
      title: "CIPC Management",
      description: "Company registration and statutory compliance automation",
      features: [
        "Annual return filing",
        "Company information updates",
        "Director and shareholder management",
        "Share certificate generation",
        "Compliance certificate requests"
      ],
      color: "green"
    },
    {
      icon: Users,
      title: "Labour Compliance",
      description: "Employment law compliance and payroll management",
      features: [
        "Basic Conditions of Employment Act compliance",
        "Employment Equity reporting",
        "Skills Development Levy management",
        "Worker compensation tracking",
        "Leave management and tracking"
      ],
      color: "purple"
    },
    {
      icon: Globe,
      title: "POPIA Compliance",
      description: "Data protection and privacy law compliance",
      features: [
        "Data subject rights management",
        "Consent tracking and recording",
        "Data breach notification protocols",
        "Privacy impact assessments",
        "Third-party data processing agreements"
      ],
      color: "orange"
    }
  ];

  const deadlines = [
    { date: "7th", description: "PAYE monthly submission", type: "monthly" },
    { date: "25th", description: "VAT return submission", type: "bi-monthly" },
    { date: "31st July", description: "Annual company returns", type: "annual" },
    { date: "30th April", description: "Income tax returns", type: "annual" },
    { date: "31st December", description: "Employment Equity reports", type: "annual" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Stay Compliant with
              <span className="block text-orange-200">South African Regulations</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
              Automated compliance management for SARS, CIPC, Labour Law, and POPIA. 
              Never miss a deadline or face penalties again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                Start Compliance Audit
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Download Compliance Guide
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Compliance Areas */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Compliance Coverage</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive automation and management for all major South African compliance requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {complianceAreas.map((area, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 bg-${area.color}-100 rounded-lg flex items-center justify-center mb-6`}>
                  <area.icon className={`text-${area.color}-600`} size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{area.title}</h3>
                <p className="text-gray-600 mb-4">{area.description}</p>
                <ul className="space-y-2">
                  {area.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Calendar */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Never Miss a Deadline</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our automated compliance calendar tracks all important deadlines and sends 
                timely reminders to ensure you stay compliant with all regulations.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="text-green-600" size={16} />
                  </div>
                  <span className="text-gray-700">Automated deadline tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-blue-600" size={16} />
                  </div>
                  <span className="text-gray-700">Multi-channel reminder notifications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="text-purple-600" size={16} />
                  </div>
                  <span className="text-gray-700">Real-time compliance status monitoring</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {deadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{deadline.description}</div>
                      <div className="text-sm text-gray-500 capitalize">{deadline.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">{deadline.date}</div>
                      <div className="text-sm text-gray-500">Every {deadline.type === 'monthly' ? 'month' : deadline.type === 'bi-monthly' ? '2 months' : 'year'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Taxnify for Compliance?</h2>
            <p className="text-xl text-gray-600">Trusted by over 500 South African firms for comprehensive compliance management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">99.9% Accuracy</h3>
              <p className="text-gray-600">Industry-leading accuracy in compliance submissions and calculations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
              <p className="text-gray-600">Your sensitive compliance data is protected with enterprise-grade security</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Save 20+ Hours</h3>
              <p className="text-gray-600">Monthly time savings through automated compliance processes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Management */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Avoid Costly Penalties</h2>
            <p className="text-xl text-gray-600">Non-compliance can result in significant financial and reputational damage</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">R50,000+</div>
              <div className="text-sm text-gray-600">Average SARS penalty for late VAT submissions</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">R500,000</div>
              <div className="text-sm text-gray-600">Maximum POPIA fine for data breaches</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">R200</div>
              <div className="text-sm text-gray-600">Daily penalty for late CIPC returns</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">R0</div>
              <div className="text-sm text-gray-600">Penalties with Taxnify compliance automation</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ensure 100% Compliance Today</h2>
          <p className="text-xl text-red-100 mb-8">
            Don't risk penalties and legal issues. Start your compliance journey with Taxnify today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
              Start Compliance Audit
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Speak to Compliance Expert
            </Button>
          </div>
          <p className="text-red-200 mt-4 text-sm">Free compliance audit • No obligations</p>
        </div>
      </section>
    </div>
  );
}