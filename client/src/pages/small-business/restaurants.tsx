import { Link } from "wouter";
import { 
  Coffee, Users, Calendar, DollarSign, CheckCircle, ArrowRight,
  Clock, ChefHat, Utensils, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/layout/marketing-layout";

export default function RestaurantSolutions() {
  return (
    <MarketingLayout>
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Restaurant & Hospitality Solutions
              <span className="block text-orange-200">Streamline Your Food Service Business</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
              Comprehensive management tools for restaurants, cafés, bars, and hospitality businesses. 
              Handle menu costing, staff scheduling, supplier management, and compliance tracking.
            </p>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
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
              <ChefHat className="text-orange-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Menu Cost Management</h3>
              <p className="text-gray-600 mb-4">Calculate recipe costs and optimize menu pricing for maximum profitability</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Recipe cost calculation</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Menu engineering analysis</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Profit margin tracking</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Users className="text-orange-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Staff Management</h3>
              <p className="text-gray-600 mb-4">Schedule staff, track hours, and manage payroll with ease</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Shift scheduling</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Time tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Labour cost analysis</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Utensils className="text-orange-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Supplier Management</h3>
              <p className="text-gray-600 mb-4">Manage suppliers, track deliveries, and control food costs</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Supplier contracts</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Delivery tracking</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Cost comparison</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}