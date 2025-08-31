import { Bell, User, LogOut, Settings, Shield, Plus, ChevronDown, RefreshCw, FileText, UserPlus, Receipt } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import GlobalSearch from "@/components/global-search";
import { useQuery } from "@tanstack/react-query";
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
  "/advanced-analytics": "Advanced Analytics",
  "/expenses": "Expenses",
  "/suppliers": "Suppliers",
  "/purchase-orders": "Purchase Orders",
  "/profile": "Profile",
  "/admin-panel": "Admin Panel",
};

export default function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const isDashboard = location === '/dashboard' || location === '/';
  
  // Get alert counts for all pages
  const { data: alertCounts, refetch: refetchAlerts } = useQuery({
    queryKey: ["/api/alerts/counts"],
    enabled: true,
    refetchInterval: 60000,
    staleTime: 45000,
  });
  
  // Dashboard refresh functionality
  const { refetch: refetchDashboard } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: false, // Only use for manual refresh
  });
  
  const handleDashboardRefresh = async () => {
    if (isDashboard) {
      // Trigger background refresh without page reload
      await Promise.all([
        refetchDashboard(),
        refetchAlerts()
      ]);
    }
  };
  
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
      case 'super_admin': return 'Super Administrator';
      case 'manager': return 'Manager';
      case 'accountant': return 'Accountant';
      case 'employee': return 'Employee';
      case 'business_owner': return 'Business Owner';
      case 'finance_manager': return 'Finance Manager';
      case 'sales_manager': return 'Sales Manager';
      default: return role.replace(/_/g, ' ');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-slate-800 to-blue-900 shadow-lg border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4 lg:left-72">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white truncate">{getPageName()}</h2>
          {user && (
            <p className="text-sm sm:text-base text-gray-300 truncate">
              Welcome back, <span className="font-medium">{user.name}</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Professional Company Switcher - Always visible */}
          <div className="block">
            <CompanySwitcher />
          </div>
          
          {/* Quick Create - Always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Quick Create
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 max-h-[500px] overflow-y-auto">
              <DropdownMenuLabel className="text-center font-semibold">Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* SALES Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sales</div>
                <DropdownMenuItem asChild>
                  <Link href="/invoices/new" className="cursor-pointer flex items-center px-2 py-1.5">
                    <FileText className="h-4 w-4 mr-3 text-blue-600" />
                    <span>Invoice</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/estimates/new" className="cursor-pointer flex items-center px-2 py-1.5">
                    <Receipt className="h-4 w-4 mr-3 text-green-600" />
                    <span>Estimate</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/customers/new" className="cursor-pointer flex items-center px-2 py-1.5">
                    <UserPlus className="h-4 w-4 mr-3 text-purple-600" />
                    <span>Customer</span>
                  </Link>
                </DropdownMenuItem>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* PURCHASES Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Purchases</div>
                <DropdownMenuItem asChild>
                  <Link href="/expenses" className="cursor-pointer flex items-center px-2 py-1.5">
                    <Receipt className="h-4 w-4 mr-3 text-red-600" />
                    <span>Expense</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/purchase-orders" className="cursor-pointer flex items-center px-2 py-1.5">
                    <FileText className="h-4 w-4 mr-3 text-orange-600" />
                    <span>Purchase Order</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/suppliers" className="cursor-pointer flex items-center px-2 py-1.5">
                    <UserPlus className="h-4 w-4 mr-3 text-indigo-600" />
                    <span>Supplier</span>
                  </Link>
                </DropdownMenuItem>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* BANKING Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Banking</div>
                <DropdownMenuItem asChild>
                  <Link href="/banking/transfer" className="cursor-pointer flex items-center px-2 py-1.5">
                    <RefreshCw className="h-4 w-4 mr-3 text-teal-600" />
                    <span>Bank Transfer</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/banking/deposit" className="cursor-pointer flex items-center px-2 py-1.5">
                    <Plus className="h-4 w-4 mr-3 text-green-600" />
                    <span>Deposit</span>
                  </Link>
                </DropdownMenuItem>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* PROJECTS Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Projects</div>
                <DropdownMenuItem asChild>
                  <Link href="/projects" className="cursor-pointer flex items-center px-2 py-1.5">
                    <Settings className="h-4 w-4 mr-3 text-blue-600" />
                    <span>Project</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/task" className="cursor-pointer flex items-center px-2 py-1.5">
                    <Bell className="h-4 w-4 mr-3 text-yellow-600" />
                    <span>Task</span>
                  </Link>
                </DropdownMenuItem>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* GENERAL Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">General</div>
                <DropdownMenuItem asChild>
                  <Link href="/user-management" className="cursor-pointer flex items-center px-2 py-1.5">
                    <User className="h-4 w-4 mr-3 text-gray-600" />
                    <span>User</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/employees" className="cursor-pointer flex items-center px-2 py-1.5">
                    <UserPlus className="h-4 w-4 mr-3 text-blue-600" />
                    <span>Employee</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products/create" className="cursor-pointer flex items-center px-2 py-1.5">
                    <Settings className="h-4 w-4 mr-3 text-green-600" />
                    <span>Product & Service</span>
                  </Link>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Alerts - Always visible */}
          <Link href="/alerts">
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
              {((alertCounts as any)?.active || 0) > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-red-500 text-white">
                  {(alertCounts as any)?.active}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Onboarding Help Button */}
          <OnboardingHelpButton />
          
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  data-onboarding="user-profile" 
                  variant="ghost" 
                  className="flex items-center space-x-3 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 p-3 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-600"
                >
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-gray-300 capitalize">
                      {user.role.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-100">
                    <User className="text-white" size={18} />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-200">
                    <User className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {user.role.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/admin-panel" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
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
