import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  Calculator, ChartLine, FileText, Users, ShoppingCart, BarChart3, Receipt, 
  Settings, TrendingUp, Package, Building, Archive, Building2, BookOpen, 
  Landmark, BookOpenCheck, ReceiptText, ChevronDown, ChevronRight, 
  DollarSign, CreditCard, Box, Truck
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Navigation group structure
const navigationGroups = [
  {
    id: "overview",
    label: "Dashboard",
    items: [
      { path: "/dashboard", label: "Overview", icon: ChartLine, permission: null }
    ]
  },
  {
    id: "sales",
    label: "Sales",
    icon: DollarSign,
    items: [
      { path: "/invoices", label: "Invoices", icon: FileText, permission: "INVOICE_VIEW" },
      { path: "/estimates", label: "Estimates", icon: FileText, permission: "ESTIMATE_VIEW" },
      { path: "/customers", label: "Customers", icon: Users, permission: "CUSTOMER_VIEW" }
    ]
  },
  {
    id: "purchases",
    label: "Purchases", 
    icon: Truck,
    items: [
      { path: "/suppliers", label: "Suppliers", icon: Building, permission: "SUPPLIER_VIEW" },
      { path: "/purchase-orders", label: "Purchase Orders", icon: Package, permission: "PURCHASE_ORDER_VIEW" },
      { path: "/expenses", label: "Expenses", icon: Receipt, permission: "EXPENSE_VIEW" }
    ]
  },
  {
    id: "inventory",
    label: "Products & Inventory",
    icon: Box,
    items: [
      { path: "/products", label: "Products", icon: Package, permission: "PRODUCT_VIEW" },
      { path: "/inventory", label: "Inventory", icon: Archive, permission: "INVENTORY_VIEW" }
    ]
  },
  {
    id: "accounting",
    label: "Accounting",
    icon: Calculator,
    items: [
      { path: "/chart-of-accounts", label: "Chart of Accounts", icon: BookOpen, permission: "CHART_OF_ACCOUNTS_VIEW" },
      { path: "/journal-entries", label: "Journal Entries", icon: BookOpenCheck, permission: "JOURNAL_ENTRY_VIEW" },
      { path: "/banking", label: "Banking", icon: Landmark, permission: "BANKING_VIEW" },
      { path: "/general-ledger", label: "General Ledger", icon: CreditCard, permission: "GENERAL_LEDGER_VIEW" }
    ]
  },
  {
    id: "vat",
    label: "VAT Management",
    icon: ReceiptText,
    items: [
      { path: "/vat-management", label: "VAT Management", icon: ReceiptText, permission: "VAT_VIEW" }
    ]
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    items: [
      { path: "/financial-reports", label: "Financial Reports", icon: TrendingUp, permission: "FINANCIAL_VIEW" },
      { path: "/reports", label: "Business Reports", icon: BarChart3, permission: "REPORT_VIEW" }
    ]
  },
  {
    id: "company",
    label: "Company",
    icon: Building2,
    items: [
      { path: "/companies", label: "Companies", icon: Building2, permission: "COMPANY_VIEW" },
      { path: "/settings", label: "Settings", icon: Settings, permission: "SETTINGS_VIEW" }
    ]
  }
];

interface NavigationGroupProps {
  group: typeof navigationGroups[0];
  location: string;
  userPermissions: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

function NavigationGroup({ group, location, userPermissions, isExpanded, onToggle }: NavigationGroupProps) {
  // Temporarily show all items - permissions will be handled later
  const visibleItems = group.items;

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
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
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
  const [expandedGroup, setExpandedGroup] = useState<string | null>("sales");

  // Get user permissions (fallback to all permissions for super admin or if no user)
  const userPermissions = user?.permissions || [
    "INVOICE_VIEW", "ESTIMATE_VIEW", "CUSTOMER_VIEW", "SUPPLIER_VIEW", 
    "PURCHASE_ORDER_VIEW", "EXPENSE_VIEW", "PRODUCT_VIEW", "INVENTORY_VIEW",
    "CHART_OF_ACCOUNTS_VIEW", "JOURNAL_ENTRY_VIEW", "BANKING_VIEW", 
    "GENERAL_LEDGER_VIEW", "FINANCIAL_VIEW", "REPORT_VIEW", "VAT_VIEW",
    "COMPANY_VIEW", "SETTINGS_VIEW"
  ];

  const toggleGroup = (groupId: string) => {
    // If clicking the same group, collapse it. Otherwise, expand the new group
    setExpandedGroup(prev => prev === groupId ? null : groupId);
  };

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-30 hidden lg:flex lg:flex-col">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
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
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden mt-6 px-3 pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        <div className="space-y-2">
          {navigationGroups.map((group) => (
            <NavigationGroup
              key={group.id}
              group={group}
              location={location}
              userPermissions={userPermissions}
              isExpanded={expandedGroup === group.id}
              onToggle={() => toggleGroup(group.id)}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}
