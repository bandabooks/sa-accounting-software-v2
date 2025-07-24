import { Link } from "wouter";
import { 
  Users, Clock, FileText, DollarSign, CheckCircle, ArrowRight,
  Briefcase, Target, TrendingUp, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/layout/marketing-layout";

export default function ConsultantSolutions() {
  return (
    <MarketingLayout>
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Professional Services & Consulting
              <span className="block text-blue-200">Built for Knowledge Workers</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Comprehensive tools for consultants, lawyers, accountants, and professional service providers. 
              Track time, manage projects, bill clients, and maintain professional standards.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
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
              <Clock className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Time Tracking & Billing</h3>
              <p className="text-gray-600 mb-4">Accurate time tracking with automated billing for professional services</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Project-based time tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Hourly rate management</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Automated invoicing</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Target className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Project Management</h3>
              <p className="text-gray-600 mb-4">Organize projects, track milestones, and deliver on time</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Project planning</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Milestone tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Resource allocation</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Award className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Standards</h3>
              <p className="text-gray-600 mb-4">Maintain compliance with professional body requirements</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>CPD tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Ethics compliance</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Professional insurance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}