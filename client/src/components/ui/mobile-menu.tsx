import { useState } from "react";
import { Menu, ChevronDown, ChevronRight, Brain } from "lucide-react";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Link, useLocation } from "wouter";
import { 
  Calculator, ChartLine, FileText, Users, BarChart3, Receipt, 
  Settings, TrendingUp, Package, Building, Archive, Building2, 
  BookOpen, Landmark, BookOpenCheck, ReceiptText, DollarSign, 
  CreditCard, Box, Truck, PieChart, CheckCircle, Shield, Briefcase,
  FolderOpen, CheckSquare, Clock, UserCog, Key, ToggleLeft, Upload, Terminal, Zap, Mail
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanySubscription } from "@/hooks/useCompanySubscription";

// Same navigation groups as sidebar with module mapping
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
    module: "invoicing",
    items: [
      { path: "/invoices", label: "Invoices", icon: FileText, permission: "INVOICE_VIEW", module: "invoicing" },
      { path: "/estimates", label: "Estimates", icon: FileText, permission: "ESTIMATE_VIEW", module: "invoicing" },
      { path: "/customers", label: "Customers", icon: Users, permission: "CUSTOMER_VIEW", module: "invoicing" }
    ]
  },
  {
    id: "purchases",
    label: "Purchases", 
    icon: Truck,
    module: "expense_management",
    items: [
      { path: "/suppliers", label: "Suppliers", icon: Building, permission: "SUPPLIER_VIEW", module: "expense_management" },
      { path: "/purchase-orders", label: "Purchase Orders", icon: Package, permission: "PURCHASE_ORDER_VIEW", module: "expense_management" },
      { path: "/payment-flows", label: "Payment Flows", icon: CreditCard, permission: "PURCHASE_ORDER_VIEW", module: "expense_management" },
      { path: "/three-way-matching", label: "3-Way Matching", icon: CheckCircle, permission: "PURCHASE_ORDER_VIEW", module: "expense_management" },
      { path: "/expenses", label: "Expenses", icon: Receipt, permission: "EXPENSE_VIEW", module: "expense_management" }
    ]
  },
  {
    id: "inventory",
    label: "Products & Inventory",
    icon: Box,
    module: "inventory",
    items: [
      { path: "/products", label: "Products", icon: Package, permission: "PRODUCT_VIEW", module: "inventory" },
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
    id: "accounting",
    label: "Accounting",
    icon: Calculator,
    module: "accounting",
    items: [
      { path: "/chart-of-accounts", label: "Chart of Accounts", icon: BookOpen, permission: "CHART_OF_ACCOUNTS_VIEW", module: "accounting" },
      { path: "/journal-entries", label: "Journal Entries", icon: BookOpenCheck, permission: "JOURNAL_ENTRY_VIEW", module: "accounting" },
      { path: "/banking", label: "Banking", icon: Landmark, permission: "BANKING_VIEW", module: "accounting" },
      { path: "/general-ledger", label: "General Ledger", icon: CreditCard, permission: "GENERAL_LEDGER_VIEW", module: "accounting" },
      { path: "/fixed-assets", label: "Fixed Assets", icon: Building2, permission: "FIXED_ASSETS_VIEW", module: "advanced_analytics" },
      { path: "/budgeting", label: "Budgeting", icon: PieChart, permission: "BUDGETING_VIEW", module: "advanced_analytics" },
      { path: "/cash-flow-forecasting", label: "Cash Flow Forecasting", icon: TrendingUp, permission: "CASH_FLOW_VIEW", module: "advanced_analytics" },
      { path: "/bank-reconciliation", label: "Bank Reconciliation", icon: CheckCircle, permission: "BANK_RECONCILIATION_VIEW", module: "advanced_analytics" }
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
    id: "projects",
    label: "Project Management",
    icon: Briefcase,
    module: "project_management",
    items: [
      { path: "/projects", label: "Projects", icon: FolderOpen, permission: "PROJECTS_VIEW", module: "project_management" },
      { path: "/tasks", label: "Tasks", icon: CheckSquare, permission: "TASKS_VIEW", module: "project_management" },
      { path: "/time-tracking", label: "Time Tracking", icon: Clock, permission: "TIME_TRACKING_VIEW", module: "project_management" }
    ]
  },
  {
    id: "compliance",
    label: "Practice Management",
    icon: Shield,
    path: "/compliance-dashboard",
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
    module: "vat_management",
    items: [
      { path: "/vat-settings", label: "VAT Settings", icon: Settings, permission: "SETTINGS_VIEW", module: "vat_management" },

      { path: "/vat-types", label: "VAT Types", icon: FileText, permission: "SETTINGS_VIEW", module: "vat_management" },
      { path: "/vat-returns", label: "VAT Returns (VAT201)", icon: BarChart3, permission: "FINANCIAL_VIEW", module: "vat_management" },
      { path: "/vat-reports", label: "VAT Reports", icon: TrendingUp, permission: "FINANCIAL_VIEW", module: "vat_management" }
    ]
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    module: "reporting",
    items: [
      { path: "/general-reports", label: "General Reports", icon: BarChart3, permission: "REPORT_VIEW", module: "reporting" },
      { path: "/advanced-analytics", label: "Advanced Analytics", icon: TrendingUp, permission: "FINANCIAL_VIEW", module: "reporting" },
      { path: "/business-reports", label: "Business Reports", icon: BarChart3, permission: "REPORT_VIEW", module: "reporting" }
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
      { path: "/enterprise-settings", label: "Enterprise Settings", icon: Shield, permission: "SETTINGS_VIEW", module: "advanced_analytics" },
      { path: "/email-settings", label: "Email Settings", icon: Mail, permission: "SETTINGS_VIEW", module: "dashboard" }
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

interface MobileNavigationGroupProps {
  group: typeof navigationGroups[0];
  location: string;
  userPermissions: string[];
  userRole: string;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: () => void;
}

function MobileNavigationGroup({ group, location, userPermissions, userRole, isExpanded, onToggle, onItemClick }: MobileNavigationGroupProps) {
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
    
    // Check permissions for items that have permission property
    if ('permission' in item) {
      return !item.permission || userPermissions.includes(item.permission);
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
        onClick={onItemClick}
        className={`mobile-nav-item flex items-center space-x-3 px-4 py-4 text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 touch-manipulation ${
          isActive ? "bg-primary text-white hover:bg-primary shadow-lg" : ""
        }`}
        role="menuitem"
        tabIndex={0}
      >
        <Icon size={20} />
        <span className="font-medium text-base">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 touch-manipulation min-h-[52px] ${
          hasActiveItem 
            ? "bg-blue-50 dark:bg-blue-900/30 text-primary shadow-sm" 
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
        }`}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`Toggle ${group.label} menu`}
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
                onClick={onItemClick}
                className={`mobile-nav-subitem flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 touch-manipulation min-h-[48px] ${
                  isActive ? "bg-blue-50 dark:bg-blue-900/30 text-primary font-medium shadow-sm" : ""
                }`}
                role="menuitem"
                tabIndex={0}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const { isModuleAvailable, currentPlan, isSuperAdminOrOwner } = useCompanySubscription();
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

  const handleItemClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden min-w-[44px] min-h-[44px] p-2 touch-none"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="p-0 w-80 mobile-safe-area"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Calculator className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Taxnify</h1>
                <p className="text-sm text-blue-100">Business & Compliance</p>
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
            
            {/* Super Admin Quick Access - Mobile */}
            {(user?.role === "super_admin" || user?.username === "sysadmin_7f3a2b8e" || user?.email === "accounts@thinkmybiz.com") && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/super-admin"
                  onClick={handleItemClick}
                  className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Shield size={16} />
                  <span>Super Admin Panel</span>
                </Link>
              </div>
            )}
          </div>
          
          <nav className="flex-1 overflow-y-auto mt-4 px-4 pb-6 scrollbar-thin" role="menu">
            <div className="space-y-2">
              {navigationGroups
                .filter(group => {
                  // Check if group module is available in subscription plan
                  if (group.module && !isModuleAvailable(group.module)) {
                    return false;
                  }
                  
                  // Check for role requirements  
                  if ('requiredRole' in group && group.requiredRole && user?.role !== group.requiredRole) {
                    return false;
                  }
                  
                  return true;
                })
                .map((group) => (
                  <MobileNavigationGroup
                    key={group.id}
                    group={group}
                    location={location}
                    userPermissions={userPermissions}
                    userRole={user?.role || ""}
                    isExpanded={expandedGroup === group.id}
                    onToggle={() => toggleGroup(group.id)}
                    onItemClick={handleItemClick}
                  />
                ))}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}