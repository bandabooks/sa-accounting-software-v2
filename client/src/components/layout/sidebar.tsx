import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  Calculator, ChartLine, FileText, Users, ShoppingCart, BarChart3, Receipt, 
  Settings, TrendingUp, Package, Building, Archive, Building2, BookOpen, 
  Landmark, BookOpenCheck, ReceiptText, ChevronDown, ChevronRight, 
  DollarSign, CreditCard, Box, Truck, PieChart, CheckCircle, Shield,
  Briefcase, FolderOpen, CheckSquare, Clock, Brain, Tablet, UserCog, Key,
  Lock, ToggleLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanySubscription } from "@/hooks/useCompanySubscription";

// Navigation group structure with module mapping
const navigationGroups = [
  {
    id: "overview",
    label: "Dashboard",
    module: "dashboard",
    items: [
      { path: "/dashboard", label: "Overview", icon: ChartLine, permission: null, module: "dashboard" },
      { path: "/spending-wizard", label: "Smart Spending Wizard", icon: Brain, permission: null, module: "dashboard" }
    ]
  },
  {
    id: "sales",
    label: "Sales",
    icon: DollarSign,
    module: "sales",
    items: [
      { path: "/invoices", label: "Invoices", icon: FileText, permission: "INVOICE_VIEW", module: "sales" },
      { path: "/estimates", label: "Estimates", icon: FileText, permission: "ESTIMATE_VIEW", module: "sales" },
      { path: "/customers", label: "Customers", icon: Users, permission: "CUSTOMER_VIEW", module: "customers" }
    ]
  },
  {
    id: "purchases",
    label: "Purchases", 
    icon: Truck,
    module: "purchases",
    items: [
      { path: "/suppliers", label: "Suppliers", icon: Building, permission: "SUPPLIER_VIEW", module: "purchases" },
      { path: "/purchase-orders", label: "Purchase Orders", icon: Package, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/expenses", label: "Expenses", icon: Receipt, permission: "EXPENSE_VIEW", module: "purchases" }
    ]
  },
  {
    id: "inventory",
    label: "Products & Inventory",
    icon: Box,
    module: "inventory",
    items: [
      { path: "/products", label: "Products", icon: Package, permission: "PRODUCT_VIEW", module: "products" },
      { path: "/inventory", label: "Inventory", icon: Archive, permission: "INVENTORY_VIEW", module: "inventory" }
    ]
  },
  {
    id: "pos",
    label: "Point of Sale",
    icon: Tablet,
    module: "pos",
    items: [
      { path: "/pos", label: "POS Terminal", icon: Tablet, permission: "POS_VIEW", module: "pos" },
      { path: "/pos/shifts", label: "Shift Management", icon: Clock, permission: "POS_MANAGE_SHIFTS", module: "pos" },
      { path: "/pos/reports", label: "POS Reports", icon: BarChart3, permission: "POS_VIEW_REPORTS", module: "pos" }
    ]
  },
  {
    id: "accounting",
    label: "Accounting",
    icon: Calculator,
    module: "accounting",
    items: [
      { path: "/chart-of-accounts", label: "Chart of Accounts", icon: BookOpen, permission: "CHART_OF_ACCOUNTS_VIEW", module: "accounting" },
      { path: "/journal-entries", label: "Journal Entries", icon: BookOpenCheck, permission: "JOURNAL_ENTRY_VIEW", module: "accounting" },
      { path: "/banking", label: "Banking", icon: Landmark, permission: "BANKING_VIEW", module: "banking" },
      { path: "/general-ledger", label: "General Ledger", icon: CreditCard, permission: "GENERAL_LEDGER_VIEW", module: "accounting" },
      { path: "/fixed-assets", label: "Fixed Assets", icon: Building2, permission: "FIXED_ASSETS_VIEW", module: "accounting" },
      { path: "/budgeting", label: "Budgeting", icon: PieChart, permission: "BUDGETING_VIEW", module: "advanced_reports" },
      { path: "/cash-flow-forecasting", label: "Cash Flow Forecasting", icon: TrendingUp, permission: "CASH_FLOW_VIEW", module: "advanced_reports" },
      { path: "/bank-reconciliation", label: "Bank Reconciliation", icon: CheckCircle, permission: "BANK_RECONCILIATION_VIEW", module: "banking" }
    ]
  },
  {
    id: "projects",
    label: "Project Management",
    icon: Briefcase,
    module: "projects",
    items: [
      { path: "/projects", label: "Projects", icon: FolderOpen, permission: "PROJECTS_VIEW", module: "projects" },
      { path: "/tasks", label: "Tasks", icon: CheckSquare, permission: "TASKS_VIEW", module: "projects" },
      { path: "/time-tracking", label: "Time Tracking", icon: Clock, permission: "TIME_TRACKING_VIEW", module: "projects" }
    ]
  },
  {
    id: "compliance",
    label: "Compliance Management",
    icon: Shield,
    module: "compliance",
    items: [
      { path: "/compliance/dashboard", label: "Compliance Dashboard", icon: ChartLine, permission: "COMPLIANCE_VIEW", module: "compliance" },
      { path: "/compliance/clients", label: "Client Management", icon: Users, permission: "COMPLIANCE_VIEW", module: "compliance" },
      { path: "/compliance/sars", label: "SARS Compliance", icon: FileText, permission: "COMPLIANCE_VIEW", module: "compliance" },
      { path: "/compliance/cipc", label: "CIPC Compliance", icon: Building2, permission: "COMPLIANCE_VIEW", module: "compliance" },
      { path: "/compliance/labour", label: "Labour Compliance", icon: Shield, permission: "COMPLIANCE_VIEW", module: "compliance" },
      { path: "/compliance/tasks", label: "Task Management", icon: CheckSquare, permission: "COMPLIANCE_VIEW", module: "compliance" },
      { path: "/compliance/calendar", label: "Calendar", icon: Clock, permission: "COMPLIANCE_VIEW", module: "compliance" },
      { path: "/compliance/documents", label: "Document Library", icon: FolderOpen, permission: "COMPLIANCE_VIEW", module: "compliance" }
    ]
  },
  {
    id: "vat",
    label: "VAT Management",
    icon: Receipt,
    module: "vat",
    items: [
      { path: "/vat-settings", label: "VAT Settings", icon: Settings, permission: "SETTINGS_VIEW", module: "vat" },
      { path: "/vat-types", label: "VAT Types", icon: FileText, permission: "SETTINGS_VIEW", module: "vat" },
      { path: "/vat-returns", label: "VAT Returns (VAT201)", icon: BarChart3, permission: "FINANCIAL_VIEW", module: "vat" }
    ]
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    module: "reports",
    items: [
      { path: "/financial-reports", label: "Financial Reports", icon: TrendingUp, permission: "FINANCIAL_VIEW", module: "reports" },
      { path: "/reports", label: "Business Reports", icon: BarChart3, permission: "REPORT_VIEW", module: "basic_reports" }
    ]
  },
  {
    id: "rbac",
    label: "User Management", 
    icon: UserCog,
    module: "advanced_analytics",
    items: [
      { path: "/user-management", label: "User Management", icon: Users, permission: "USERS_VIEW", module: "advanced_analytics" }
    ]
  },
  {
    id: "company",
    label: "Company",
    icon: Building2,
    module: "dashboard",
    items: [
      { path: "/companies", label: "Companies", icon: Building2, permission: "COMPANY_VIEW", module: "multi_company" },
      { path: "/subscription", label: "Subscription", icon: CreditCard, permission: null, module: "dashboard" },
      { path: "/settings", label: "Settings", icon: Settings, permission: "SETTINGS_VIEW", module: "dashboard" },
      { path: "/enterprise-settings", label: "Enterprise Settings", icon: Shield, permission: "SETTINGS_VIEW", module: "advanced_analytics" }
    ]
  },
  {
    id: "super-admin",
    label: "Super Admin",
    icon: Settings,
    requiredRole: "super_admin",
    module: "advanced_analytics",
    items: [
      { path: "/super-admin", label: "Super Admin Panel", icon: Settings, requiredRole: "super_admin", module: "advanced_analytics" }
    ]
  }
];

interface NavigationGroupProps {
  group: typeof navigationGroups[0];
  location: string;
  userPermissions: string[];
  userRole: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function NavigationGroup({ group, location, userPermissions, userRole, isExpanded, onToggle }: NavigationGroupProps) {
  const { isModuleAvailable } = useCompanySubscription();
  
  // Check if group should be visible based on role requirements
  if (group.requiredRole && userRole !== group.requiredRole) {
    return null;
  }

  // Check if group module is available in subscription plan
  if (group.module && !isModuleAvailable(group.module)) {
    return null;
  }

  // Filter items based on permissions, role requirements, and subscription plan
  const visibleItems = group.items.filter(item => {
    if ('requiredRole' in item && item.requiredRole && userRole !== item.requiredRole) {
      return false;
    }
    
    // Check subscription plan module availability
    if (item.module && !isModuleAvailable(item.module)) {
      return false;
    }
    
    return true;
  });

  if (visibleItems.length === 0) return null;

  // Check if any item in the group is active
  const hasActiveItem = visibleItems.some(item => 
    location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path))
  );

  // Single item groups (like Dashboard) don't need collapsing
  if (visibleItems.length === 1 && group.id === "overview") {
    const item = visibleItems[0];
    const Icon = item.icon;
    const isActive = location === item.path;
    
    return (
      <Link
        href={item.path}
        className={`flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors ${
          isActive ? "bg-primary text-white hover:bg-primary/90" : ""
        }`}
      >
        <Icon size={18} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
          hasActiveItem 
            ? "bg-primary/10 text-primary" 
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          {group.icon && <group.icon size={18} />}
          <span>{group.label}</span>
        </div>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      
      {isExpanded && (
        <div className="mt-1 ml-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
                data-onboarding={`nav-${item.path.split('/')[1]}`}
                className={`flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : ""
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { isModuleAvailable, currentPlan, planName, isSuperAdminOrOwner } = useCompanySubscription();
  const [expandedGroup, setExpandedGroup] = useState<string | null>("overview");

  // Get user permissions (fallback to all permissions for super admin or if no user)
  const userPermissions = user?.permissions || [
    "INVOICE_VIEW", "ESTIMATE_VIEW", "CUSTOMER_VIEW", "SUPPLIER_VIEW", 
    "PURCHASE_ORDER_VIEW", "EXPENSE_VIEW", "PRODUCT_VIEW", "INVENTORY_VIEW",
    "CHART_OF_ACCOUNTS_VIEW", "JOURNAL_ENTRY_VIEW", "BANKING_VIEW", 
    "GENERAL_LEDGER_VIEW", "FINANCIAL_VIEW", "REPORT_VIEW", "VAT_VIEW",
    "COMPANY_VIEW", "SETTINGS_VIEW", "COMPLIANCE_VIEW"
  ];

  const toggleGroup = (groupId: string) => {
    // If clicking the same group, collapse it. Otherwise, expand the new group
    setExpandedGroup(prev => prev === groupId ? null : groupId);
  };

  return (
    <aside className="w-72 bg-white shadow-lg border-r border-gray-200 fixed h-full z-30 hidden lg:flex lg:flex-col">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calculator className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Taxnify</h1>
            <p className="text-sm text-gray-500">Business & Compliance</p>
            <div className="flex items-center gap-2 mt-1">
              {isSuperAdminOrOwner ? (
                <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-medium">
                  Super Admin - Full Access
                </span>
              ) : currentPlan ? (
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {currentPlan.displayName}
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  No Active Plan
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Super Admin Quick Access */}
        {(user?.role === "super_admin" || user?.username === "sysadmin_7f3a2b8e" || user?.email === "accounts@thinkmybiz.com") && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/super-admin"
              className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Shield size={16} />
              <span>Super Admin Panel</span>
            </Link>
          </div>
        )}
        
        {/* Subscription Plan Information - Only show for non-super admins without active plans */}
        {!currentPlan && !isSuperAdminOrOwner && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-xs font-medium text-yellow-800">No Active Plan</p>
                  <p className="text-xs text-yellow-600">Limited features available</p>
                </div>
              </div>
              <Link
                href="/subscription"
                className="mt-2 block text-center text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-2 rounded transition-colors"
              >
                Choose Plan
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <nav data-onboarding="main-nav" className="flex-1 overflow-y-auto overflow-x-hidden mt-6 px-3 pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        <div className="space-y-2">
          {navigationGroups.map((group) => (
            <NavigationGroup
              key={group.id}
              group={group}
              location={location}
              userPermissions={userPermissions}
              userRole={user?.role || ""}
              isExpanded={expandedGroup === group.id}
              onToggle={() => toggleGroup(group.id)}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}
