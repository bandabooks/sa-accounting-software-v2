import { Link, useLocation } from "wouter";
import { Calculator, ChartLine, FileText, Users, ShoppingCart, BarChart3, Receipt, CreditCard, Settings, TrendingUp, DollarSign, Package, Building, Archive } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: ChartLine },
  { path: "/invoices", label: "Invoices", icon: FileText, badge: "12" },
  { path: "/estimates", label: "Estimates", icon: FileText },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/suppliers", label: "Suppliers", icon: Building },
  { path: "/purchase-orders", label: "Purchase Orders", icon: Package },
  { path: "/products", label: "Products", icon: Package },
  { path: "/inventory", label: "Inventory", icon: Archive },
  { path: "/expenses", label: "Expenses", icon: Receipt },
  { path: "/financial-reports", label: "Financial Reports", icon: TrendingUp },
  { path: "/reports", label: "Business Reports", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-30 lg:block hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calculator className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Think Mybiz</h1>
            <p className="text-sm text-gray-500">Accounting</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-accent text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="absolute bottom-6 left-3 right-3">
        <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-lg text-white">
          <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
          <p className="text-xs opacity-90 mt-1">Unlock unlimited features</p>
          <button className="bg-white text-primary text-xs font-medium px-3 py-1 rounded mt-2 hover:bg-gray-100 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
