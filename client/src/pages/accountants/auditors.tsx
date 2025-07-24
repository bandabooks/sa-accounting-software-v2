import { Link } from "wouter";
import { 
  Shield, FileText, CheckSquare, Clock, CheckCircle, ArrowRight,
  Users, Building, Award, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/layout/marketing-layout";

export default function Auditors() {
  return (
    <MarketingLayout>
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Auditor Solutions
              <span className="block text-blue-200">Professional Audit Management</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Comprehensive audit management tools for South African auditing firms. 
              Streamline audit planning, working papers, and compliance reporting.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Professional Trial
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <CheckSquare className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Audit Planning & Management</h3>
              <p className="text-gray-600 mb-4">Comprehensive audit planning and execution tools</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Risk assessment</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Audit planning</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Team coordination</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <FileText className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Working Papers</h3>
              <p className="text-gray-600 mb-4">Digital working papers with version control and collaboration</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Digital documentation</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Version control</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Review trails</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Award className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Compliance Reporting</h3>
              <p className="text-gray-600 mb-4">Automated compliance reports and regulatory submissions</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Audit reports</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>IRBA compliance</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Quality control</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}