import { Link } from "wouter";
import { 
  Heart, Users, FileText, DollarSign, CheckCircle, ArrowRight,
  Globe, Shield, TrendingUp, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NGOSolutions() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              NGO & Non-Profit Solutions
              <span className="block text-purple-200">Making Impact Measurable</span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Specialized tools for NGOs, charities, and non-profit organizations. 
              Manage donors, track grants, ensure compliance, and demonstrate impact transparently.
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Start Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Heart className="text-purple-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Donor Management</h3>
              <p className="text-gray-600 mb-4">Build lasting relationships with donors and supporters</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Donor database</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Donation tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Tax receipts (Section 18A)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <FileText className="text-purple-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Grant Management</h3>
              <p className="text-gray-600 mb-4">Track grants, manage funding, and ensure compliance</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Grant tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Funding reports</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Compliance monitoring</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <TrendingUp className="text-purple-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Impact Reporting</h3>
              <p className="text-gray-600 mb-4">Measure and communicate your organization's impact</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Impact metrics</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Outcome tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Annual reports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}