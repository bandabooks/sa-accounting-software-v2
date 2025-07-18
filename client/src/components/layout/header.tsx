import { Bell, User } from "lucide-react";
import { useLocation } from "wouter";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/invoices": "Invoices",
  "/estimates": "Estimates", 
  "/customers": "Customers",
  "/reports": "Reports",
};

export default function Header() {
  const [location] = useLocation();
  
  const getPageName = () => {
    if (location.includes("/invoices/new")) return "Create Invoice";
    if (location.includes("/invoices/") && location !== "/invoices") return "Invoice Details";
    if (location.includes("/customers/new")) return "Add Customer";
    return pageNames[location] || "Dashboard";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getPageName()}</h2>
          <p className="text-gray-600">
            Welcome back, <span className="font-medium">John Smith</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">John Smith</div>
              <div className="text-sm text-gray-500">Admin</div>
            </div>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="text-gray-600" size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
