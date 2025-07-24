import { Link } from "wouter";
import { 
  Store, Package, BarChart3, Users, CheckCircle, ArrowRight,
  ShoppingCart, CreditCard, Smartphone, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RetailSolutions() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Retail Business Solutions
              <span className="block text-green-200">Built for South African Retailers</span>
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
              Comprehensive retail management with inventory tracking, POS integration, 
              customer management, and full South African compliance.
            </p>
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
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
              <Package className="text-green-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inventory Management</h3>
              <p className="text-gray-600 mb-4">Real-time stock tracking with automatic reorder points</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Barcode scanning</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Low stock alerts</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Supplier management</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <ShoppingCart className="text-green-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Point of Sale Integration</h3>
              <p className="text-gray-600 mb-4">Seamless POS integration with real-time sales tracking</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Multi-payment methods</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Digital receipts</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Return management</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Users className="text-green-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Management</h3>
              <p className="text-gray-600 mb-4">Build customer loyalty with comprehensive CRM features</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Loyalty programs</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Purchase history</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Marketing campaigns</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}