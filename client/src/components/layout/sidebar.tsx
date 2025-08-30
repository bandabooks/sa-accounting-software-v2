import { Link, useLocation } from "wouter";
import React, { useState, useRef, useEffect } from "react";
import { 
  Calculator, ChartLine, FileText, Users, ShoppingCart, BarChart3, Receipt, 
  Settings, TrendingUp, Package, Building, Archive, Building2, BookOpen, 
  Landmark, BookOpenCheck, ReceiptText, ChevronDown, ChevronRight, 
  DollarSign, CreditCard, Box, Truck, PieChart, CheckCircle, Shield,
  Briefcase, FolderOpen, CheckSquare, Clock, Brain, UserCog, Key,
  Lock, ToggleLeft, Upload, Terminal, Zap, MessageCircle, PackageCheck, Mail, FileCheck, Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanySubscription } from "@/hooks/useCompanySubscription";
import { useSubscriptionNavigation } from "@/hooks/useSubscriptionNavigation";
import { UpgradePrompt } from "@/components/navigation/UpgradePrompt";

// Role-based navigation groups - Clean, focused menu for accounting professionals
const getNavigationGroupsForRole = (userRole: string) => {
  
  // Full menu for Super Admins and Company Admins - show everything
  if (userRole === 'super_admin' || userRole === 'company_admin') {
    return getFullNavigationGroups();
  }
  
  // Core accounting functions - ALWAYS visible for all accounting professionals
  const coreAccountingGroups = [
    // 1. Dashboard - Single item, no dropdown
    {
      id: "overview",
      label: "Dashboard",
      module: "dashboard",
      roleTypes: ["all"],
      items: [
        { path: "/dashboard", label: "Overview", icon: ChartLine, permission: null, module: "dashboard" }
      ]
    },
    
    // 2. Core Accounting - Essential for all accounting professionals
    {
      id: "accounting",
      label: "Accounting",
      icon: Calculator,
      module: "accounting",
      roleTypes: ["all"],
      items: [
        { path: "/chart-of-accounts", label: "Chart of Accounts", icon: BookOpen, permission: "CHART_OF_ACCOUNTS_VIEW", module: "accounting" },
        { path: "/journal-entries", label: "Journal Entries", icon: BookOpenCheck, permission: "JOURNAL_ENTRY_VIEW", module: "accounting" },
        { path: "/general-ledger", label: "General Ledger", icon: BookOpen, permission: "GENERAL_LEDGER_VIEW", module: "accounting" }
      ]
    },

    // 3. Client Revenue Management - Core for accounting practices
    {
      id: "revenue",
      label: "Revenue",
      icon: DollarSign,
      module: "sales",
      roleTypes: ["all"],
      items: [
        { path: "/invoices", label: "Invoices", icon: Receipt, permission: "INVOICE_VIEW", module: "sales" },
        { path: "/estimates", label: "Quotes & Estimates", icon: FileText, permission: "ESTIMATE_VIEW", module: "sales" },
        { path: "/customer-payments", label: "Customer Payments", icon: CreditCard, permission: "PAYMENTS_VIEW", module: "sales" },
        { path: "/customers", label: "Customers", icon: Users, permission: "CUSTOMER_VIEW", module: "customers" }
      ]
    },

    // 4. Business Expenses - Core accounting function
    {
      id: "expenses",
      label: "Expenses",
      icon: Receipt,
      module: "expenses", 
      roleTypes: ["all"],
      items: [
        { path: "/expenses", label: "Expense Management", icon: Receipt, permission: "EXPENSE_VIEW", module: "expenses" },
        { path: "/bills", label: "Bills & Accounts Payable", icon: FileText, permission: "EXPENSE_VIEW", module: "expenses" },
        { path: "/suppliers", label: "Suppliers", icon: Building, permission: "SUPPLIER_VIEW", module: "purchases" }
      ]
    },

    // 5. Banking & Cash Flow - Essential for accounting
    {
      id: "banking",
      label: "Banking",
      icon: Landmark,
      module: "banking",
      roleTypes: ["all"],
      items: [
        { path: "/banking", label: "Banking Center", icon: Landmark, permission: "BANKING_VIEW", module: "banking" },
        { path: "/bank-reconciliation", label: "Bank Reconciliation", icon: CheckCircle, permission: "BANKING_VIEW", module: "banking" }
      ]
    },

    // 6. Financial Reports - Core for all accounting professionals
    {
      id: "reports",
      label: "Financial Reports",
      icon: BarChart3,
      module: "reports",
      roleTypes: ["all"],
      items: [
        { path: "/balance-sheet", label: "Balance Sheet", icon: PieChart, permission: "FINANCIAL_VIEW", module: "reports" },
        { path: "/profit-loss", label: "Profit & Loss", icon: TrendingUp, permission: "FINANCIAL_VIEW", module: "reports" },
        { path: "/cash-flow-statement", label: "Cash Flow Statement", icon: TrendingUp, permission: "FINANCIAL_VIEW", module: "reports" },
        { path: "/trial-balance", label: "Trial Balance", icon: BarChart3, permission: "FINANCIAL_VIEW", module: "reports" },
        { path: "/aged-reports", label: "Aged Reports", icon: Clock, permission: "FINANCIAL_VIEW", module: "reports" }
      ]
    },

    // 7. VAT & Tax Compliance - Essential for South African tax professionals
    {
      id: "tax_compliance",
      label: "VAT & Tax Compliance",
      icon: FileCheck,
      module: "compliance",
      roleTypes: ["all"],
      items: [
        { path: "/vat-management", label: "VAT Management", icon: FileCheck, permission: "VAT_VIEW", module: "compliance" },
        { path: "/vat-management?tab=returns", label: "VAT201 Returns", icon: FileText, permission: "VAT_VIEW", module: "compliance" },
        { path: "/sars-integration", label: "SARS Integration", icon: Shield, permission: "COMPLIANCE_VIEW", module: "compliance" },
        { path: "/compliance-dashboard", label: "Compliance Dashboard", icon: CheckSquare, permission: "COMPLIANCE_VIEW", module: "compliance" }
      ]
    },

    // 8. Settings - Always needed
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      module: "dashboard",
      roleTypes: ["all"],
      items: [
        { path: "/user-management", label: "User Management", icon: Users, permission: "USERS_VIEW", module: "advanced_analytics" },
        { path: "/settings", label: "Company Settings", icon: Settings, permission: "SETTINGS_VIEW", module: "dashboard" },
        { path: "/subscription", label: "Subscription", icon: CreditCard, permission: null, module: "dashboard" }
      ]
    }
  ];

  // Additional modules available through subscription - for retail, manufacturing, etc.
  const subscriptionBasedGroups = [
    // Inventory Management - For retail/manufacturing businesses
    {
      id: "inventory",
      label: "Inventory & Products",
      icon: Package,
      module: "inventory",
      roleTypes: ["retail", "manufacturing"],
      items: [
        { path: "/products", label: "Products & Services", icon: Package, permission: "PRODUCT_VIEW", module: "inventory" },
        { path: "/inventory", label: "Inventory Management", icon: Archive, permission: "INVENTORY_VIEW", module: "inventory" },
        { path: "/stock-adjustments", label: "Stock Adjustments", icon: ToggleLeft, permission: "INVENTORY_VIEW", module: "inventory" }
      ]
    },

    // Purchase Orders & Procurement - For businesses with complex purchasing
    {
      id: "procurement",
      label: "Procurement",
      icon: Truck,
      module: "procurement",
      roleTypes: ["retail", "manufacturing", "logistics"],
      items: [
        { path: "/purchase-orders", label: "Purchase Orders", icon: Package, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
        { path: "/goods-receipts", label: "Goods Receipts", icon: PackageCheck, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
        { path: "/deliveries", label: "Deliveries", icon: Truck, permission: "DELIVERY_VIEW", module: "sales" }
      ]
    },

    // Point of Sale - For retail businesses
    {
      id: "pos",
      label: "Point of Sale",
      icon: Terminal,
      module: "pos_sales",
      roleTypes: ["retail"],
      items: [
        { path: "/pos", label: "POS Dashboard", icon: ChartLine, permission: "POS_VIEW", module: "pos_sales" },
        { path: "/pos/terminal", label: "POS Terminal", icon: Terminal, permission: "POS_PROCESS_SALES", module: "pos_sales" }
      ]
    }
  ];

  // Return appropriate groups based on role and subscription
  return [...coreAccountingGroups];
};

// Full navigation groups for Super Admins - complete menu structure
const getFullNavigationGroups = () => [
  // 1. Dashboard - Single item, no dropdown
  {
    id: "overview",
    label: "Dashboard",
    module: "dashboard",
    items: [
      { path: "/dashboard", label: "Overview", icon: ChartLine, permission: null, module: "dashboard" }
    ]
  },
  // 2. Banking & Cash
  {
    id: "banking",
    label: "Banking & Cash",
    icon: Landmark,
    module: "banking",
    items: [
      { path: "/banking", label: "Banking Center", icon: Landmark, permission: "BANKING_VIEW", module: "banking" },
      { path: "/cash-flow-forecasting", label: "Cash Flow Forecasting", icon: TrendingUp, permission: "CASH_FLOW_VIEW", module: "advanced_reports" }
    ]
  },
  // 3. Sales & Revenue
  {
    id: "sales",
    label: "Sales & Revenue",
    icon: DollarSign,
    module: "sales",
    items: [
      { path: "/sales-dashboard", label: "Sales Dashboard", icon: ChartLine, permission: "DASHBOARD_VIEW", module: "sales" },
      { path: "/invoices", label: "Invoices", icon: Receipt, permission: "INVOICE_VIEW", module: "sales" },
      { path: "/estimates", label: "Estimates / Quotes", icon: FileText, permission: "ESTIMATE_VIEW", module: "sales" },
      { path: "/sales-orders", label: "Sales Orders", icon: ShoppingCart, permission: "SALES_ORDER_VIEW", module: "sales" },
      { path: "/credit-notes", label: "Credit Notes", icon: FileText, permission: "CREDIT_NOTES_VIEW", module: "sales" },
      { path: "/customer-payments", label: "Customer Payments", icon: CreditCard, permission: "PAYMENTS_VIEW", module: "sales" },
      { path: "/deliveries", label: "Deliveries", icon: Truck, permission: "DELIVERY_VIEW", module: "sales" },
      { path: "/customers", label: "Customers", icon: Users, permission: "CUSTOMER_VIEW", module: "customers" },
      { path: "/sales-reports", label: "Sales Reports", icon: BarChart3, permission: "REPORTS_VIEW", module: "sales" }
    ]
  },
  // 4. Purchases & Expenses
  {
    id: "purchases",
    label: "Purchases & Expenses", 
    icon: Receipt,
    module: "purchases",
    items: [
      { path: "/purchase-dashboard", label: "Purchase Dashboard", icon: BarChart3, permission: "DASHBOARD_VIEW", module: "purchases" },
      { path: "/expenses", label: "Expense Management", icon: Receipt, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/bills", label: "Bills & Accounts Payable", icon: FileText, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/purchase-orders", label: "Purchase Orders", icon: Package, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/suppliers", label: "Suppliers", icon: Building, permission: "SUPPLIER_VIEW", module: "purchases" },
      { path: "/goods-receipts", label: "Goods Receipts", icon: PackageCheck, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/purchase-requisitions", label: "Purchase Requisitions", icon: FileText, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/payment-flows", label: "Payment Flows", icon: CreditCard, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/three-way-matching", label: "3-Way Matching", icon: CheckSquare, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/recurring-expenses", label: "Recurring Expenses", icon: Clock, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/expense-approvals", label: "Expense Approvals", icon: CheckSquare, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/exception-dashboard", label: "Exception Dashboard", icon: Shield, permission: "EXCEPTIONS_VIEW", module: "purchases" }
    ]
  },
  // 5. Accounting
  {
    id: "accounting",
    label: "Accounting",
    icon: Calculator,
    module: "accounting",
    items: [
      { path: "/chart-of-accounts", label: "Chart of Accounts", icon: BookOpen, permission: "CHART_OF_ACCOUNTS_VIEW", module: "accounting" },
      { path: "/journal-entries", label: "Journal Entries", icon: BookOpenCheck, permission: "JOURNAL_ENTRY_VIEW", module: "accounting" },
      { path: "/general-ledger", label: "General Ledger", icon: BookOpen, permission: "GENERAL_LEDGER_VIEW", module: "accounting" },
      { path: "/fixed-assets", label: "Fixed Assets", icon: Building, permission: "FIXED_ASSETS_VIEW", module: "advanced_reports" },
      { path: "/bulk-capture", label: "Bulk Data Entry", icon: Upload, permission: "BULK_DATA_ENTRY_VIEW", module: "accounting" },
      { path: "/budgeting", label: "Budgeting", icon: BarChart3, permission: "BUDGETING_VIEW", module: "advanced_reports" }
    ]
  },
  // 6. Employee Management
  {
    id: "employees",
    label: "Employee Management",
    icon: Users,
    module: "human_resources",
    items: [
      { path: "/employees", label: "Employee Directory", icon: Users, permission: "EMPLOYEES_VIEW", module: "human_resources" },
      { path: "/attendance", label: "Attendance Tracking", icon: Clock, permission: "ATTENDANCE_VIEW", module: "human_resources" },
      { path: "/payroll", label: "Payroll Management", icon: DollarSign, permission: "PAYROLL_VIEW", module: "human_resources" },
      { path: "/leave-management", label: "Leave Management", icon: Calendar, permission: "LEAVE_VIEW", module: "human_resources" }
    ]
  },
  // 7. Products & Inventory
  {
    id: "inventory",
    label: "Products & Inventory",
    icon: Package,
    module: "inventory",
    items: [
      { path: "/products", label: "Products", icon: Package, permission: "PRODUCT_VIEW", module: "inventory" },
      { path: "/professional-services", label: "Professional Services", icon: Briefcase, permission: "PROFESSIONAL_SERVICES_VIEW", module: "inventory" },
      { path: "/inventory", label: "Inventory", icon: Archive, permission: "INVENTORY_VIEW", module: "inventory" },
      { path: "/warehouses", label: "Warehouses", icon: Building, permission: "WAREHOUSES_VIEW", module: "inventory" },
      { path: "/lot-batch-tracking", label: "Lot/Batch Tracking", icon: Package, permission: "LOT_BATCH_VIEW", module: "inventory" },
      { path: "/serial-numbers", label: "Serial Numbers", icon: FileText, permission: "SERIAL_NUMBERS_VIEW", module: "inventory" },
      { path: "/stock-counts", label: "Stock Counts", icon: CheckCircle, permission: "STOCK_COUNTS_VIEW", module: "inventory" },
      { path: "/reorder-rules", label: "Reorder Rules", icon: ToggleLeft, permission: "REORDER_RULES_VIEW", module: "inventory" },
      { path: "/product-bundles", label: "Product Bundles", icon: Package, permission: "PRODUCT_BUNDLES_VIEW", module: "inventory" },
      { path: "/inventory-reports", label: "Inventory Reports", icon: BarChart3, permission: "INVENTORY_REPORTS_VIEW", module: "inventory" }
    ]
  },
  // 8. VAT Management
  {
    id: "vat",
    label: "VAT Management",
    icon: FileCheck,
    module: "compliance",
    items: [
      { path: "/vat-management", label: "VAT Management", icon: FileCheck, permission: "VAT_VIEW", module: "compliance" },
      { path: "/vat-management?tab=returns", label: "VAT201 Returns", icon: FileText, permission: "VAT_VIEW", module: "compliance" },
      { path: "/vat-reconciliation", label: "VAT Reconciliation", icon: CheckCircle, permission: "VAT_VIEW", module: "compliance" }
    ]
  },
  // 9. Compliance Management
  {
    id: "compliance",
    label: "Compliance Management",
    icon: Shield,
    module: "compliance",
    items: [
      { path: "/compliance-dashboard", label: "Compliance Dashboard", icon: CheckSquare, permission: "COMPLIANCE_VIEW", module: "compliance" },
      { path: "/sars-integration", label: "SARS Integration", icon: Shield, permission: "COMPLIANCE_VIEW", module: "compliance" },
      { path: "/audit-trail", label: "Audit Trail", icon: FileText, permission: "AUDIT_VIEW", module: "compliance" },
      { path: "/client-management", label: "Client Management", icon: Users, permission: "CLIENT_MANAGEMENT_VIEW", module: "compliance" },
      { path: "/cipc-compliance", label: "CIPC Compliance", icon: Building, permission: "CIPC_COMPLIANCE_VIEW", module: "compliance" },
      { path: "/labour-compliance", label: "Labour Compliance", icon: Users, permission: "LABOUR_COMPLIANCE_VIEW", module: "compliance" },
      { path: "/task-management", label: "Task Management", icon: CheckSquare, permission: "TASK_MANAGEMENT_VIEW", module: "compliance" },
      { path: "/calendar", label: "Calendar", icon: Calendar, permission: "CALENDAR_VIEW", module: "compliance" },
      { path: "/document-library", label: "Document Library", icon: FolderOpen, permission: "DOCUMENT_LIBRARY_VIEW", module: "compliance" }
    ]
  },
  // 10. Reports and Analytics
  {
    id: "reports",
    label: "Reports and Analytics",
    icon: BarChart3,
    module: "reports",
    items: [
      { path: "/reports/financial", label: "Financial Reports", icon: PieChart, permission: "FINANCIAL_VIEW", module: "reports" },
      { path: "/advanced-analytics", label: "Advanced Analytics", icon: BarChart3, permission: "ADVANCED_ANALYTICS_VIEW", module: "reports" },
      { path: "/business-reports", label: "Business Reports", icon: BarChart3, permission: "BUSINESS_REPORTS_VIEW", module: "reports" },
      { path: "/general-reports", label: "General Reports", icon: FileText, permission: "REPORTS_VIEW", module: "reports" },
      { path: "/audit-trail", label: "Audit Trail", icon: FileText, permission: "AUDIT_VIEW", module: "reports" }
    ]
  },
  // 11. CRM & Projects
  {
    id: "crm",
    label: "CRM & Projects",
    icon: Users,
    module: "customer_relationship",
    items: [
      { path: "/customer-lifecycle", label: "Customer Lifecycle", icon: Users, permission: "CUSTOMER_LIFECYCLE_VIEW", module: "customer_relationship" },
      { path: "/communication-center", label: "Communication Center", icon: MessageCircle, permission: "COMMUNICATIONS_VIEW", module: "customer_relationship" },
      { path: "/customer-segments", label: "Customer Segments", icon: Users, permission: "CUSTOMER_SEGMENTS_VIEW", module: "customer_relationship" },
      { path: "/customer-insights", label: "Customer Insights", icon: BarChart3, permission: "CUSTOMER_INSIGHTS_VIEW", module: "customer_relationship" },
      { path: "/projects", label: "Projects", icon: Briefcase, permission: "PROJECTS_VIEW", module: "customer_relationship" },
      { path: "/tasks", label: "Tasks", icon: CheckSquare, permission: "TASKS_VIEW", module: "customer_relationship" },
      { path: "/time-tracking", label: "Time Tracking", icon: Clock, permission: "TIME_TRACKING_VIEW", module: "customer_relationship" }
    ]
  },
  // 12. Point of Sale
  {
    id: "pos",
    label: "Point of Sale",
    icon: Terminal,
    module: "pos_sales",
    items: [
      { path: "/pos", label: "POS Dashboard", icon: ChartLine, permission: "POS_VIEW", module: "pos_sales" },
      { path: "/pos/terminal", label: "POS Terminal", icon: Terminal, permission: "POS_PROCESS_SALES", module: "pos_sales" },
      { path: "/pos/shifts", label: "Shift Management", icon: Clock, permission: "POS_MANAGE_SHIFTS", module: "pos_sales" },
      { path: "/pos/setup", label: "Terminal Setup", icon: Settings, permission: "POS_SETUP", module: "pos_sales" }
    ]
  },
  // 13. Administration
  {
    id: "administration",
    label: "Administration",
    icon: Settings,
    module: "administration",
    items: [
      { path: "/user-management", label: "User Management", icon: Users, permission: "USERS_VIEW", module: "advanced_analytics" },
      { path: "/companies", label: "Companies", icon: Building, permission: "COMPANIES_VIEW", module: "administration" },
      { path: "/settings", label: "Settings", icon: Settings, permission: "SETTINGS_VIEW", module: "dashboard" },
      { path: "/integrations", label: "Integrations", icon: Zap, permission: "INTEGRATIONS_VIEW", module: "administration" },
      { path: "/ai-monitor", label: "AI Health Monitor", icon: Brain, permission: "AI_HEALTH_VIEW", module: "administration" },
      { path: "/email-settings", label: "Email Settings", icon: Mail, permission: "EMAIL_SETTINGS_VIEW", module: "administration" },
      { path: "/enterprise-settings", label: "Enterprise Settings", icon: Settings, permission: "ENTERPRISE_SETTINGS_VIEW", module: "administration" },
      { path: "/subscription", label: "Subscription", icon: CreditCard, permission: null, module: "dashboard" },
      { path: "/super-admin", label: "Super Admin Panel", icon: UserCog, permission: "SUPER_ADMIN_VIEW", module: "administration" },
      { path: "/smart-spending-wizard", label: "Smart Spending Wizard", icon: Zap, permission: "SMART_SPENDING_VIEW", module: "administration" }
    ]
  }
];

// Legacy navigation structure for compatibility (will be replaced)
const navigationGroups = [
  // 4. Purchases & Expenses
  {
    id: "purchases",
    label: "Purchases & Expenses", 
    icon: Truck,
    module: "purchases",
    items: [
      { path: "/purchase-dashboard", label: "Purchase Dashboard", icon: BarChart3, permission: "DASHBOARD_VIEW", module: "purchases" },
      { path: "/expenses", label: "Expense Management", icon: Receipt, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/bills", label: "Bills & Accounts Payable", icon: FileText, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/purchase-orders", label: "Purchase Orders", icon: Package, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/suppliers", label: "Suppliers", icon: Building, permission: "SUPPLIER_VIEW", module: "purchases" },
      { path: "/goods-receipts", label: "Goods Receipts", icon: PackageCheck, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/purchase-requisitions", label: "Purchase Requisitions", icon: FileText, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/payment-flows", label: "Payment Flows", icon: CreditCard, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/three-way-matching", label: "3-Way Matching", icon: CheckCircle, permission: "PURCHASE_ORDER_VIEW", module: "purchases" },
      { path: "/recurring-expenses", label: "Recurring Expenses", icon: Clock, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/expense-approvals", label: "Expense Approvals", icon: CheckCircle, permission: "EXPENSE_VIEW", module: "expenses" },
      { path: "/exception-dashboard", label: "Exception Dashboard", icon: Shield, permission: "EXCEPTIONS_VIEW", module: "purchases" },
      { path: "/purchase-reports", label: "Purchase Reports", icon: FileText, permission: "REPORTS_VIEW", module: "purchases" }
    ]
  },
  // 5. Accounting
  {
    id: "accounting",
    label: "Accounting",
    icon: Calculator,
    module: "accounting",
    items: [
      { path: "/chart-of-accounts", label: "Chart of Accounts", icon: BookOpen, permission: "CHART_OF_ACCOUNTS_VIEW", module: "accounting" },
      { path: "/journal-entries", label: "Journal Entries", icon: BookOpenCheck, permission: "JOURNAL_ENTRY_VIEW", module: "accounting" },
      { path: "/general-ledger", label: "General Ledger", icon: CreditCard, permission: "GENERAL_LEDGER_VIEW", module: "accounting" },
      { path: "/fixed-assets", label: "Fixed Assets", icon: Building2, permission: "FIXED_ASSETS_VIEW", module: "accounting" },
      { path: "/bulk-capture", label: "Bulk Data Entry", icon: Upload, permission: "BULK_CAPTURE_VIEW", module: "accounting" },
      { path: "/budgeting", label: "Budgeting", icon: PieChart, permission: "BUDGETING_VIEW", module: "advanced_reports" }
    ]
  },
  // 6. Employee Management & Payroll
  {
    id: "employees",
    label: "Employee Management",
    icon: Users,
    module: "employees",
    items: [
      { path: "/employees", label: "Employee Directory", icon: Users, permission: "employees:view", module: "employees" },
      { path: "/employees/payroll", label: "Payroll Management", icon: DollarSign, permission: "payroll:view", module: "employees" },
      { path: "/employees/attendance", label: "Attendance Tracking", icon: Clock, permission: "attendance:view", module: "employees" }
    ]
  },
  // 7. Products & Inventory
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
  // 7. VAT Management (SEPARATE)
  {
    id: "vat",
    label: "VAT Management",
    icon: Receipt,
    module: "vat",
    items: [
      { path: "/vat-settings", label: "VAT Settings", icon: Settings, permission: "SETTINGS_VIEW", module: "vat" },
      { path: "/vat-types", label: "VAT Types", icon: FileText, permission: "SETTINGS_VIEW", module: "vat" },
      { path: "/vat-management?tab=returns", label: "VAT Returns (VAT201)", icon: BarChart3, permission: "FINANCIAL_VIEW", module: "vat" },
      { path: "/vat-reports", label: "VAT Reports", icon: TrendingUp, permission: "FINANCIAL_VIEW", module: "vat" }
    ]
  },
  // 8. Compliance Management (SEPARATE)
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
  // 8.5. Practice Management (for accounting professionals)
  {
    id: "practice",
    label: "Practice Management",
    icon: Briefcase,
    module: "practice",
    items: [
      { path: "/practice/dashboard", label: "Practice Dashboard", icon: ChartLine, permission: "DASHBOARD_VIEW", module: "practice" }
    ]
  },
  // 9. Reports and Analytics
  {
    id: "reports",
    label: "Reports and Analytics",
    icon: BarChart3,
    module: "reports",
    items: [
      { path: "/reports/financial", label: "Financial Reports", icon: TrendingUp, permission: "FINANCIAL_VIEW", module: "financial" },
      { path: "/advanced-analytics", label: "Advanced Analytics", icon: BarChart3, permission: "FINANCIAL_VIEW", module: "reports" },
      { path: "/business-reports", label: "Business Reports", icon: BarChart3, permission: "REPORT_VIEW", module: "basic_reports" },
      { path: "/general-reports", label: "General Reports", icon: BarChart3, permission: "REPORT_VIEW", module: "reports" },
      { path: "/audit-trail", label: "Audit Trail", icon: Shield, permission: "audit:view", module: "reports" }
    ]
  },
  // 10. CRM & Projects
  {
    id: "crm",
    label: "CRM & Projects",
    icon: UserCog,
    module: "crm",
    items: [
      { path: "/customer-lifecycle", label: "Customer Lifecycle", icon: TrendingUp, permission: "CUSTOMER_VIEW", module: "crm" },
      { path: "/communication-center", label: "Communication Center", icon: MessageCircle, permission: "CUSTOMER_VIEW", module: "crm" },
      { path: "/customer-segments", label: "Customer Segments", icon: Users, permission: "CUSTOMER_VIEW", module: "crm" },
      { path: "/customer-insights", label: "Customer Insights", icon: BarChart3, permission: "CUSTOMER_VIEW", module: "crm" },
      { path: "/projects", label: "Projects", icon: FolderOpen, permission: "PROJECTS_VIEW", module: "projects" },
      { path: "/tasks", label: "Tasks", icon: CheckSquare, permission: "TASKS_VIEW", module: "projects" },
      { path: "/time-tracking", label: "Time Tracking", icon: Clock, permission: "TIME_TRACKING_VIEW", module: "projects" }
    ]
  },
  // 11. Point of Sale
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
  // 12. Administration
  {
    id: "administration",
    label: "Administration",
    icon: Settings,
    module: "dashboard",
    items: [
      { path: "/user-management", label: "User Management", icon: Users, permission: "USERS_VIEW", module: "advanced_analytics" },
      { path: "/companies", label: "Companies", icon: Building2, permission: "COMPANY_VIEW", module: "multi_company" },
      { path: "/settings", label: "Settings", icon: Settings, permission: "SETTINGS_VIEW", module: "dashboard" },
      { path: "/integrations", label: "Integrations", icon: Zap, permission: "SETTINGS_VIEW", module: "dashboard" },
      { path: "/ai-monitor", label: "AI Health Monitor", icon: Brain, permission: "SETTINGS_VIEW", module: "dashboard" },
      { path: "/email-settings", label: "Email Settings", icon: Mail, permission: "SETTINGS_VIEW", module: "dashboard" },
      { path: "/enterprise-settings", label: "Enterprise Settings", icon: Shield, permission: "SETTINGS_VIEW", module: "advanced_analytics" },
      { path: "/subscription", label: "Subscription", icon: CreditCard, permission: null, module: "dashboard" },
      { path: "/super-admin", label: "Super Admin Panel", icon: Settings, requiredRole: "super_admin", module: "advanced_analytics" },
      { path: "/spending-wizard", label: "Smart Spending Wizard", icon: Brain, permission: null, module: "dashboard" }
    ]
  }
];

interface NavigationGroupProps {
  group: {
    id: string;
    label: string;
    module: string;
    icon?: any;
    requiredRole?: string;
    items: Array<{
      path: string;
      label: string;
      icon: any;
      permission?: string | null;
      requiredRole?: string;
      module: string;
    }>;
  };
  location: string;
  userPermissions: string[];
  userRole: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function NavigationGroup({ group, location, userPermissions, userRole, isExpanded, onToggle }: NavigationGroupProps) {
  const { isModuleAvailable } = useCompanySubscription();
  const { canAccessPath, getUpgradeInfo, filterNavigationItems, isGroupVisible } = useSubscriptionNavigation();
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to ensure expanded dropdown is always visible within sidebar
  useEffect(() => {
    if (isExpanded && dropdownRef.current && buttonRef.current) {
      setTimeout(() => {
        if (dropdownRef.current && buttonRef.current) {
          const dropdown = dropdownRef.current;
          const button = buttonRef.current;
          
          // Find the sidebar navigation container (the scrollable parent)
          const navContainer = button.closest('nav');
          if (navContainer) {
            const navRect = navContainer.getBoundingClientRect();
            const dropdownRect = dropdown.getBoundingClientRect();
            
            // Check if dropdown extends below the visible area of the navigation container
            if (dropdownRect.bottom > navRect.bottom - 20) { // 20px buffer
              // Calculate scroll needed to show the dropdown within the nav container
              const scrollAmount = dropdownRect.bottom - navRect.bottom + 30; // Extra padding
              
              // Smooth scroll the navigation container
              navContainer.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
              });
            }
          }
        }
      }, 150); // Wait for dropdown animation to complete
    }
  }, [isExpanded]);
  
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
    
    // Use subscription navigation to check access
    if (!canAccessPath(item.path)) {
      return false;
    }
    
    // Super admins, production administrators, and company admins should see everything - NO RESTRICTIONS
    const isOwnerOrAdmin = userRole === 'super_admin' || 
                          userRole === 'company_admin' ||
                          userRole === 'production_administrator';
    
    if (isOwnerOrAdmin) {
      return true; // Show everything for admins/owners
    }
    
    // For non-admin users, check permission-based access
    if (item.permission && item.permission !== null) {
      // Map old permission names to new module:permission format
      const permissionMappings = {
        'SALES_ORDER_VIEW': 'sales_orders:view',
        'DELIVERY_VIEW': 'deliveries:view', 
        'INVOICE_VIEW': 'invoicing:view',
        'ESTIMATE_VIEW': 'estimates:view',
        'CREDIT_NOTES_VIEW': 'credit_notes:view',
        'CUSTOMER_VIEW': 'customer_management:view',
        'SUPPLIER_VIEW': 'suppliers:view',
        'PURCHASE_ORDER_VIEW': 'purchase_orders:view',
        'EXPENSE_VIEW': 'expenses:view',
        'PRODUCT_VIEW': 'products_services:view',
        'INVENTORY_VIEW': 'inventory:view',
        'CHART_OF_ACCOUNTS_VIEW': 'chart_of_accounts:view',
        'JOURNAL_ENTRY_VIEW': 'journal_entries:view',
        'BANKING_VIEW': 'banking:view',
        'FINANCIAL_VIEW': 'financial_reports:view',
        'VAT_VIEW': 'vat_management:view',
        'COMPLIANCE_VIEW': 'compliance_management:view',
        'PAYMENTS_VIEW': 'payments:view',
        'REPORTS_VIEW': 'financial_reports:view',
        'POS_VIEW': 'pos_sales:view',
        'POS_PROCESS_SALES': 'pos_sales:create',
        'POS_MANAGE_SHIFTS': 'pos_sales:manage_terminals',
        'POS_MANAGE': 'pos_sales:manage_terminals',
        'USERS_VIEW': 'user_management:view',
        'SETTINGS_VIEW': 'company_settings:view',
        'DASHBOARD_VIEW': 'dashboard:view'
      };
      
      const newPermission = permissionMappings[item.permission as keyof typeof permissionMappings];
      if (newPermission && !userPermissions.includes(newPermission)) {
        return false;
      }
    }
    
    return true;
  });

  // If no items are visible, return null to hide the entire group
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
        ref={buttonRef}
        onClick={() => {
          // For main menu groups, navigate to their first item and expand dropdown
          if ((group.id === "sales" || group.id === "purchases") && visibleItems.length > 0) {
            setLocation(visibleItems[0].path); // Navigate to the first item (dashboard/main page)
          }
          onToggle(); // Always toggle the dropdown
        }}
        className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap transform hover:scale-[1.01] ${
          hasActiveItem || isExpanded
            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-blue-500/25" 
            : "text-slate-600 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 hover:text-green-800 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-lg transition-all duration-300 ${
            hasActiveItem || isExpanded
              ? "bg-white/20 shadow-md text-white" 
              : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-600"
          }`}>
            {group.icon && <group.icon size={16} />}
          </div>
          <span className="tracking-tight">{group.label}</span>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${
          hasActiveItem || isExpanded ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
        }`}>
          <ChevronDown size={16} />
        </div>
      </button>
      
      <div 
        ref={dropdownRef}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="ml-6 space-y-1 rounded-lg p-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
                data-onboarding={`nav-${item.path.split('/')[1]}`}
                className={`group relative flex items-center space-x-3 px-3 py-2 text-xs rounded-md transition-all duration-200 border-l-3 ${
                  isActive 
                    ? "bg-blue-100 text-blue-900 border-l-blue-500 shadow-sm font-semibold" 
                    : "bg-green-50 text-slate-700 hover:bg-amber-50 hover:text-amber-900 hover:border-l-amber-300 border-l-transparent hover:shadow-sm border border-green-200"
                }`}
              >
                <div className={`p-1 rounded transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-200/50 text-blue-700" 
                    : "bg-green-200/70 text-slate-600 group-hover:bg-amber-200/70 group-hover:text-amber-600"
                }`}>
                  <Icon size={12} />
                </div>
                <span className="font-medium text-xs leading-tight">{item.label}</span>
                {isActive && (
                  <div className="absolute right-2 w-1 h-1 bg-blue-500 rounded-full"></div>
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
  const { isModuleAvailable, currentPlan, subscription, planStatus, isSuperAdminOrOwner } = useCompanySubscription();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Get role-specific navigation groups
  const userRole = user?.role || 'accountant';
  const roleBasedNavigationGroups = getNavigationGroupsForRole(userRole);

  // Get user permissions (fallback to all permissions for super admin or if no user)
  const userPermissions = user?.permissions || [
    "INVOICE_VIEW", "ESTIMATE_VIEW", "CUSTOMER_VIEW", "SUPPLIER_VIEW", 
    "PURCHASE_ORDER_VIEW", "EXPENSE_VIEW", "PRODUCT_VIEW", "INVENTORY_VIEW",
    "CHART_OF_ACCOUNTS_VIEW", "JOURNAL_ENTRY_VIEW", "BANKING_VIEW", 
    "GENERAL_LEDGER_VIEW", "FINANCIAL_VIEW", "REPORT_VIEW", "VAT_VIEW",
    "COMPANY_VIEW", "SETTINGS_VIEW", "COMPLIANCE_VIEW"
  ];

  // Auto-expand the group containing the active page
  React.useEffect(() => {
    const activeGroup = roleBasedNavigationGroups.find(group => 
      group.items.some(item => 
        location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path))
      )
    );
    if (activeGroup) {
      setExpandedGroup(activeGroup.id);
    }
  }, [location]);

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
                ) : subscription ? (
                  <span className="text-xs px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 font-medium">
                    {planStatus === 'trial' ? `✨ ${currentPlan?.displayName || 'Basic'} Trial` : currentPlan?.displayName || 'Basic Plan'}
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
          {!subscription && !isSuperAdminOrOwner && (
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
        {roleBasedNavigationGroups.map((group) => (
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
