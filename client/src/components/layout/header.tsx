import { Bell, User, LogOut, Settings, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/invoices": "Invoices",
  "/estimates": "Estimates", 
  "/customers": "Customers",
  "/reports": "Reports",
  "/financial-reports": "Financial Reports",
  "/expenses": "Expenses",
  "/suppliers": "Suppliers",
  "/purchase-orders": "Purchase Orders",
};

export default function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const getPageName = () => {
    if (location.includes("/invoices/new")) return "Create Invoice";
    if (location.includes("/invoices/") && location !== "/invoices") return "Invoice Details";
    if (location.includes("/customers/new")) return "Add Customer";
    if (location.includes("/customers/") && location !== "/customers") return "Customer Details";
    if (location.includes("/estimates/new")) return "Create Estimate";
    if (location.includes("/estimates/") && location !== "/estimates") return "Estimate Details";
    return pageNames[location] || "Dashboard";
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'accountant': return 'Accountant';
      case 'employee': return 'Employee';
      default: return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getPageName()}</h2>
          {user && (
            <p className="text-gray-600">
              Welcome back, <span className="font-medium">{user.name}</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{getRoleDisplayName(user.role)}</div>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={20} />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
