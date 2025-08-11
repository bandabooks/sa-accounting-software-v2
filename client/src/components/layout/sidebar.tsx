import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  Calculator, ChartLine, FileText, Users, ShoppingCart, BarChart3, Receipt, 
  Settings, TrendingUp, Package, Building, Archive, Building2, BookOpen, 
  Landmark, BookOpenCheck, ReceiptText, ChevronDown, ChevronRight, 
  DollarSign, CreditCard, Box, Truck, PieChart, CheckCircle, Shield,
  Briefcase, FolderOpen, CheckSquare, Clock, Brain, UserCog, Key,
  Lock, ToggleLeft, Upload, Terminal, Zap, MessageCircle, PackageCheck
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
      { path: "/sales-dashboard", label: "Sales Dashboard", icon: ChartLine, permission: "DASHBOARD_VIEW", module: "sales" },
      { path: "/estimates", label: "Estimates / Quotes", icon: FileText, permission: "ESTIMATE_VIEW", module: "sales" },
      { path: "/sales-orders", label: "Sales Orders", icon: ShoppingCart, permission: "SALES_ORDER_VIEW", module: "sales" },
      { path: "/deliveries", label: "Deliveries", icon: Truck, permission: "DELIVERY_VIEW", module: "sales" },
      { path: "/invoices", label: "Invoices", icon: Receipt, permission: "INVOICE_VIEW", module: "sales" },
      { path: "/credit-notes", label: "Credit Notes", icon: ReceiptText, permission: "CREDIT_NOTES_VIEW", module: "sales" },
      { path: "/customer-payments", label: "Customer Payments", icon: CreditCard, permission: "PAYMENTS_VIEW", module: "sales" },
      { path: "/customers", label: "Customers", icon: Users, permission: "CUSTOMER_VIEW", module: "customers" },
      { path: "/sales-reports", label: "Sales Reports", icon: BarChart3, permission: "REPORTS_VIEW", module: "sales" }
    ]
  },
  {
    id: "expenses",
    label: "Expenses & Bills",
    icon: Receipt,
    module: "expenses",
    items: [
      { path: "/expenses", label: "Expense Management", icon: Receipt, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/bills", label: "Bills & Accounts Payable", icon: FileText, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/recurring-expenses", label: "Recurring Expenses", icon: Clock, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/expense-approvals", label: "Expense Approvals", icon: CheckCircle, permission: "EXPENSE_VIEW", module: "expenses" }
    ]
  },
  {
    id: "purchases",
    label: "Purchases", 
    icon: Truck,
    module: "purchases",
    items: [
      { path: "/purchase-dashboard", label: "Purchase Dashboard", icon: BarChart3, permission: "DASHBOARD_VIEW", module: "purchases" },
      { path: "/suppliers", label: "Suppliers", icon: Building, permission: "SUPPLIER_VIEW", module: "purchases" },
      { path: "/purchase-orders", label: "Purchase Orders", icon: Package, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/goods-receipts", label: "Goods Receipts", icon: PackageCheck, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/purchase-requisitions", label: "Purchase Requisitions", icon: FileText, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/payment-flows", label: "Payment Flows", icon: CreditCard, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/three-way-matching", label: "3-Way Matching", icon: CheckCircle, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/exception-dashboard", label: "Exception Dashboard", icon: Shield, permission: "EXCEPTIONS_VIEW", module: "purchases" },
      { path: "/purchase-reports", label: "Purchase Reports", icon: FileText, permission: "REPORTS_VIEW", module: "purchases" }
    ]
  },
  {
    id: "inventory",
    label: "Products & Inventory",
    icon: Box,
    module: "inventory",
    items: [
      { path: "/products", label: "Products", icon: Package, permission: "PRODUCT_VIEW", module: "products" },
      { path: "/professional-services", label: "Professional Services", icon: Briefcase, permission: "PRODUCT_VIEW", module: "products" },
      { path: "/inventory", label: "Inventory", icon: Archive, permission: "INVENTORY_VIEW", module: "inventory" },
      { path: "/warehouses", label: "Warehouses", icon: Building2, permission: "INVENTORY_VIEW", module: "inventory" },
      { path: "/product-lots", label: "Lot/Batch Tracking", icon: ReceiptText, permission: "INVENTORY_VIEW", module: "inventory" },
      { path: "/product-serials", label: "Serial Numbers", icon: CheckSquare, permission: "INVENTORY_VIEW", module: "inventory" },
      { path: "/stock-counts", label: "Stock Counts", icon: CheckCircle, permission: "INVENTORY_VIEW", module: "inventory" },
      { path: "/reorder-rules", label: "Reorder Rules", icon: TrendingUp, permission: "INVENTORY_VIEW", module: "inventory" },
      { path: "/product-bundles", label: "Product Bundles", icon: FolderOpen, permission: "INVENTORY_VIEW", module: "inventory" },
      { path: "/inventory-reports", label: "Inventory Reports", icon: BarChart3, permission: "INVENTORY_VIEW", module: "inventory" }
    ]
  },
  {
    id: "pos",
    label: "Point of Sale",
    icon: Terminal,
    module: "pos_sales",
    items: [
      { path: "/pos", label: "POS Dashboard", icon: ChartLine, permission: "POS_VIEW", module: "pos_sales" },
      { path: "/pos/terminal", label: "POS Terminal", icon: Terminal, permission: "POS_PROCESS_SALES", module: "pos_sales" },
      { path: "/pos/shifts", label: "Shift Management", icon: Clock, permission: "POS_MANAGE_SHIFTS", module: "pos_sales" },
      { path: "/pos/terminals", label: "Terminal Setup", icon: Settings, permission: "POS_MANAGE", module: "pos_sales" }
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
    id: "bulk-capture",
    label: "Bulk Capture",
    icon: Upload,
    module: "accounting",
    items: [
      { path: "/bulk-capture", label: "Bulk Data Entry", icon: Upload, permission: "BULK_CAPTURE_VIEW", module: "accounting" }
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
      { path: "/vat-returns", label: "VAT Returns (VAT201)", icon: BarChart3, permission: "FINANCIAL_VIEW", module: "vat" },
      { path: "/vat-reports", label: "VAT Reports", icon: TrendingUp, permission: "FINANCIAL_VIEW", module: "vat" }
    ]
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    module: "reports",
    items: [
      { path: "/general-reports", label: "General Reports", icon: BarChart3, permission: "REPORT_VIEW", module: "reports" },
      { path: "/financial-reports", label: "Financial Reports", icon: TrendingUp, permission: "FINANCIAL_VIEW", module: "reports" },
      { path: "/business-reports", label: "Business Reports", icon: BarChart3, permission: "REPORT_VIEW", module: "basic_reports" }
    ]
  },
  {
    id: "crm",
    label: "CRM",
    icon: UserCog,
    module: "crm",
    items: [
      { path: "/customer-lifecycle", label: "Customer Lifecycle", icon: TrendingUp, permission: "CUSTOMER_VIEW", module: "crm" },
      { path: "/communication-center", label: "Communication Center", icon: MessageCircle, permission: "CUSTOMER_VIEW", module: "crm" },
      { path: "/customer-segments", label: "Customer Segments", icon: Users, permission: "CUSTOMER_VIEW", module: "crm" },
      { path: "/customer-insights", label: "Customer Insights", icon: BarChart3, permission: "CUSTOMER_VIEW", module: "crm" }
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
      { path: "/integrations", label: "Integrations", icon: Zap, permission: "SETTINGS_VIEW", module: "dashboard" },
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
        className={`group relative flex items-center space-x-4 px-4 py-3 text-slate-700 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
          isActive 
            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-blue-500/25" 
            : "hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 hover:text-green-800 hover:shadow-md"
        }`}
      >
        <div className={`p-2 rounded-lg transition-all duration-300 ${
          isActive 
            ? "bg-white/20 shadow-md" 
            : "bg-slate-100 group-hover:bg-white group-hover:shadow-sm"
        }`}>
          <Icon size={18} className={isActive ? "text-white" : "text-slate-600 group-hover:text-slate-700"} />
        </div>
        <span className="font-semibold tracking-tight">{item.label}</span>
        {isActive && (
          <div className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
        )}
      </Link>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap transform hover:scale-[1.01] ${
          hasActiveItem 
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50" 
            : "text-slate-600 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 hover:text-green-800 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-lg transition-all duration-300 ${
            hasActiveItem 
              ? "bg-blue-100 text-blue-600" 
              : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-600"
          }`}>
            {group.icon && <group.icon size={16} />}
          </div>
          <span className="tracking-tight">{group.label}</span>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${
          hasActiveItem ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
        }`}>
          <ChevronDown size={16} />
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
      }`}>
        <div className="ml-2 pl-4 border-l-2 border-slate-200/60 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
                data-onboarding={`nav-${item.path.split('/')[1]}`}
                className={`group relative flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-300 transform hover:scale-[1.01] ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20" 
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-sm"
                }`}
              >
                <div className={`p-1.5 rounded-md transition-all duration-300 ${
                  isActive 
                    ? "bg-white/20" 
                    : "bg-slate-100 group-hover:bg-white"
                }`}>
                  <Icon size={14} className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-600"} />
                </div>
                <span className="font-medium tracking-tight">{item.label}</span>
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
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
    <aside className="w-72 bg-gradient-to-b from-slate-50 via-white to-slate-50 shadow-2xl border-r border-slate-200/60 fixed h-full z-30 hidden lg:flex lg:flex-col backdrop-blur-sm">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Header Content */}
        <div className="relative p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
              <Calculator className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Taxnify</h1>
              <p className="text-blue-100 text-sm font-medium">Business & Compliance</p>
              <div className="flex items-center gap-2 mt-2">
                {isSuperAdminOrOwner ? (
                  <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-semibold shadow-lg border border-white/20">
                    ⚡ Super Admin
                  </span>
                ) : currentPlan ? (
                  <span className="text-xs px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 font-medium">
                    {currentPlan.displayName}
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-semibold">
                    ⚠ No Active Plan
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Super Admin Quick Access */}
          {(user?.role === "super_admin" || user?.username === "sysadmin_7f3a2b8e" || user?.email === "accounts@thinkmybiz.com") && (
            <div className="mt-4">
              <Link
                href="/super-admin"
                className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <Shield size={18} />
                <span>Super Admin Panel</span>
              </Link>
            </div>
          )}
          
          {/* Subscription Plan Information */}
          {!currentPlan && !isSuperAdminOrOwner && (
            <div className="mt-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Lock className="h-4 w-4 text-yellow-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">No Active Plan</p>
                    <p className="text-xs text-blue-100">Limited features available</p>
                  </div>
                </div>
                <Link
                  href="/subscription"
                  className="mt-3 block text-center text-sm bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  Choose Plan
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Section */}
      <nav data-onboarding="main-nav" className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
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
      </nav>
    </aside>
  );
}
