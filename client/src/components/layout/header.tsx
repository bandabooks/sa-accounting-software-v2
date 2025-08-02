import { Bell, User, LogOut, Settings, Shield } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import GlobalSearch from "@/components/global-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CompanySwitcher from "./company-switcher";

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
  "/profile": "Profile",
  "/admin-panel": "Admin Panel",
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
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{getPageName()}</h2>
          {user && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
              Welcome back, <span className="font-medium">{user.name}</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Global Search - Hidden on very small screens */}
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
          
          {/* Company Switcher - Hidden on very small screens */}
          <div className="hidden xs:block">
            <CompanySwitcher />
          </div>
          
          {/* Onboarding Help Button */}
          <OnboardingHelpButton />
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Bell size={18} className="sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button data-onboarding="user-profile" variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50">
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
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin-panel" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
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
