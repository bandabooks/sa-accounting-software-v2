// Comprehensive Permissions Matrix for Accounting/Business System
export const SYSTEM_MODULES = {
  // Core System
  DASHBOARD: 'dashboard',
  USER_MANAGEMENT: 'user_management',
  SYSTEM_SETTINGS: 'system_settings',
  AUDIT_LOGS: 'audit_logs',
  
  // Financial Core
  CHART_OF_ACCOUNTS: 'chart_of_accounts',
  JOURNAL_ENTRIES: 'journal_entries',
  BANKING: 'banking',
  FINANCIAL_REPORTS: 'financial_reports',
  
  // Sales & Revenue
  CUSTOMERS: 'customers',
  INVOICING: 'invoicing',
  ESTIMATES: 'estimates',
  RECURRING_BILLING: 'recurring_billing',
  CREDIT_NOTES: 'credit_notes',
  
  // Purchases & Expenses
  SUPPLIERS: 'suppliers',
  PURCHASE_ORDERS: 'purchase_orders',
  BILLS: 'bills',
  EXPENSES: 'expenses',
  SUPPLIER_PAYMENTS: 'supplier_payments',
  
  // Inventory & Products
  PRODUCTS_SERVICES: 'products_services',
  INVENTORY_MANAGEMENT: 'inventory_management',
  STOCK_ADJUSTMENTS: 'stock_adjustments',
  PRODUCT_CATEGORIES: 'product_categories',
  
  // Point of Sale
  POS_TERMINALS: 'pos_terminals',
  POS_SALES: 'pos_sales',
  POS_SHIFTS: 'pos_shifts',
  POS_REPORTS: 'pos_reports',
  POS_LOYALTY: 'pos_loyalty',
  
  // Payroll & HR
  PAYROLL: 'payroll',
  EMPLOYEES: 'employees',
  TIME_TRACKING: 'time_tracking',
  LEAVE_MANAGEMENT: 'leave_management',
  PERFORMANCE: 'performance',
  
  // Tax & Compliance
  VAT_MANAGEMENT: 'vat_management',
  TAX_RETURNS: 'tax_returns',
  SARS_INTEGRATION: 'sars_integration',
  CIPC_COMPLIANCE: 'cipc_compliance',
  LABOUR_COMPLIANCE: 'labour_compliance',
  
  // Advanced Features
  PROJECT_MANAGEMENT: 'project_management',
  FIXED_ASSETS: 'fixed_assets',
  BUDGETING: 'budgeting',
  CASH_FLOW: 'cash_flow',
  BANK_RECONCILIATION: 'bank_reconciliation',
  
  // Integration & API
  API_ACCESS: 'api_access',
  THIRD_PARTY_INTEGRATIONS: 'third_party_integrations',
  DATA_IMPORT_EXPORT: 'data_import_export',
  BACKUP_RESTORE: 'backup_restore'
} as const;

export const PERMISSION_TYPES = {
  VIEW: 'view',
  CREATE: 'create', 
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
  MANAGE: 'manage',
  CONFIGURE: 'configure',
  AUDIT: 'audit'
} as const;

export type SystemModule = typeof SYSTEM_MODULES[keyof typeof SYSTEM_MODULES];
export type PermissionType = typeof PERMISSION_TYPES[keyof typeof PERMISSION_TYPES];

// Comprehensive Role Definitions for Accounting/Business Environment
export const ACCOUNTING_ROLES = {
  SUPER_ADMIN: {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Platform owners with full system access across all companies',
    level: 10,
    color: 'from-red-600 to-pink-600',
    icon: 'Crown',
    isSystemRole: true,
    maxUsers: 2,
    securityLevel: 'CRITICAL'
  },
  
  COMPANY_ADMIN: {
    name: 'company_admin', 
    displayName: 'Company Administrator',
    description: 'Full company access - business owners and managing directors',
    level: 9,
    color: 'from-blue-600 to-indigo-600',
    icon: 'Building',
    isSystemRole: false,
    maxUsers: 5,
    securityLevel: 'HIGH'
  },
  
  ACCOUNTANT: {
    name: 'accountant',
    displayName: 'Qualified Accountant',
    description: 'CA/CPA with full financial data access and reporting',
    level: 7,
    color: 'from-green-600 to-emerald-600', 
    icon: 'Calculator',
    isSystemRole: false,
    maxUsers: 10,
    securityLevel: 'HIGH'
  },
  
  BOOKKEEPER: {
    name: 'bookkeeper',
    displayName: 'Bookkeeper',
    description: 'Transaction recording and basic financial operations',
    level: 6,
    color: 'from-teal-600 to-cyan-600',
    icon: 'FileText',
    isSystemRole: false,
    maxUsers: 20,
    securityLevel: 'MEDIUM'
  },
  
  AUDITOR: {
    name: 'auditor',
    displayName: 'Auditor',
    description: 'Read-only access to financial records for auditing',
    level: 6,
    color: 'from-orange-600 to-red-600',
    icon: 'Search',
    isSystemRole: false,
    maxUsers: 5,
    securityLevel: 'MEDIUM'
  },
  
  PAYROLL_ADMIN: {
    name: 'payroll_admin',
    displayName: 'Payroll Administrator', 
    description: 'Payroll processing and employee management',
    level: 5,
    color: 'from-purple-600 to-violet-600',
    icon: 'Users',
    isSystemRole: false,
    maxUsers: 3,
    securityLevel: 'HIGH'
  },
  
  INVENTORY_MANAGER: {
    name: 'inventory_manager',
    displayName: 'Inventory Manager',
    description: 'Stock management and inventory control',
    level: 5,
    color: 'from-amber-600 to-orange-600',
    icon: 'Package',
    isSystemRole: false,
    maxUsers: 10,
    securityLevel: 'MEDIUM'
  },
  
  SALES_MANAGER: {
    name: 'sales_manager',
    displayName: 'Sales Manager',
    description: 'Customer management and sales operations',
    level: 4,
    color: 'from-emerald-600 to-teal-600',
    icon: 'TrendingUp',
    isSystemRole: false,
    maxUsers: 15,
    securityLevel: 'MEDIUM'
  },
  
  PURCHASES_MANAGER: {
    name: 'purchases_manager',
    displayName: 'Purchases Manager',
    description: 'Supplier management and procurement',
    level: 4,
    color: 'from-slate-600 to-gray-600',
    icon: 'ShoppingCart',
    isSystemRole: false,
    maxUsers: 10,
    securityLevel: 'MEDIUM'
  },
  
  POS_OPERATOR: {
    name: 'pos_operator',
    displayName: 'POS Operator',
    description: 'Point of sale operations and cash handling',
    level: 3,
    color: 'from-rose-600 to-pink-600',
    icon: 'CreditCard',
    isSystemRole: false,
    maxUsers: 50,
    securityLevel: 'LOW'
  },
  
  SALES_REP: {
    name: 'sales_rep',
    displayName: 'Sales Representative',
    description: 'Customer interaction and sales processing',
    level: 3,
    color: 'from-blue-500 to-cyan-500',
    icon: 'UserCheck',
    isSystemRole: false,
    maxUsers: 30,
    securityLevel: 'LOW'
  },
  
  COMPLIANCE_OFFICER: {
    name: 'compliance_officer',
    displayName: 'Compliance Officer',  
    description: 'VAT, SARS, and regulatory compliance management',
    level: 4,
    color: 'from-indigo-600 to-purple-600',
    icon: 'Shield',
    isSystemRole: false,
    maxUsers: 5,
    securityLevel: 'HIGH'
  },
  
  PROJECT_MANAGER: {
    name: 'project_manager',
    displayName: 'Project Manager',
    description: 'Project tracking and resource management',
    level: 4,
    color: 'from-cyan-600 to-blue-600',
    icon: 'Briefcase',
    isSystemRole: false,
    maxUsers: 10,
    securityLevel: 'MEDIUM'
  },
  
  EMPLOYEE: {
    name: 'employee',
    displayName: 'Employee',
    description: 'Basic access for general staff members',
    level: 2,
    color: 'from-gray-500 to-slate-500',
    icon: 'User',
    isSystemRole: false,
    maxUsers: 100,
    securityLevel: 'LOW'
  },
  
  VIEWER: {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access for stakeholders and investors',
    level: 1,
    color: 'from-stone-500 to-gray-400',
    icon: 'Eye',
    isSystemRole: false,
    maxUsers: 20,
    securityLevel: 'LOW'
  }
} as const;

// Default Module Permissions per Role
export const ROLE_MODULE_PERMISSIONS = {
  super_admin: {
    // Full access to everything
    [SYSTEM_MODULES.DASHBOARD]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CONFIGURE],
    [SYSTEM_MODULES.USER_MANAGEMENT]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT, PERMISSION_TYPES.DELETE, PERMISSION_TYPES.MANAGE],
    [SYSTEM_MODULES.SYSTEM_SETTINGS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CONFIGURE, PERMISSION_TYPES.MANAGE],
    [SYSTEM_MODULES.AUDIT_LOGS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.EXPORT, PERMISSION_TYPES.AUDIT],
    // ... All other modules with full permissions
  },
  
  company_admin: {
    [SYSTEM_MODULES.DASHBOARD]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CONFIGURE],
    [SYSTEM_MODULES.USER_MANAGEMENT]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT, PERMISSION_TYPES.MANAGE],
    [SYSTEM_MODULES.CHART_OF_ACCOUNTS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT, PERMISSION_TYPES.DELETE],
    [SYSTEM_MODULES.JOURNAL_ENTRIES]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT, PERMISSION_TYPES.APPROVE],
    [SYSTEM_MODULES.BANKING]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT, PERMISSION_TYPES.MANAGE],
    [SYSTEM_MODULES.FINANCIAL_REPORTS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.EXPORT],
    [SYSTEM_MODULES.CUSTOMERS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT, PERMISSION_TYPES.DELETE],
    [SYSTEM_MODULES.INVOICING]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT, PERMISSION_TYPES.DELETE, PERMISSION_TYPES.APPROVE],
    [SYSTEM_MODULES.SUPPLIERS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT, PERMISSION_TYPES.DELETE],
    [SYSTEM_MODULES.VAT_MANAGEMENT]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.MANAGE, PERMISSION_TYPES.CONFIGURE],
    // ... All business modules with management permissions
  },
  
  accountant: {
    [SYSTEM_MODULES.DASHBOARD]: [PERMISSION_TYPES.VIEW],
    [SYSTEM_MODULES.CHART_OF_ACCOUNTS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.JOURNAL_ENTRIES]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.BANKING]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.FINANCIAL_REPORTS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.EXPORT],
    [SYSTEM_MODULES.CUSTOMERS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.INVOICING]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.SUPPLIERS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.EXPENSES]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.VAT_MANAGEMENT]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.MANAGE],
    [SYSTEM_MODULES.TAX_RETURNS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.BANK_RECONCILIATION]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.MANAGE],
  },
  
  bookkeeper: {
    [SYSTEM_MODULES.DASHBOARD]: [PERMISSION_TYPES.VIEW],
    [SYSTEM_MODULES.CHART_OF_ACCOUNTS]: [PERMISSION_TYPES.VIEW],
    [SYSTEM_MODULES.JOURNAL_ENTRIES]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.BANKING]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE],
    [SYSTEM_MODULES.CUSTOMERS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.INVOICING]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.SUPPLIERS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.EXPENSES]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
    [SYSTEM_MODULES.PURCHASE_ORDERS]: [PERMISSION_TYPES.VIEW, PERMISSION_TYPES.CREATE, PERMISSION_TYPES.EDIT],
  },
  
  // ... Define permissions for all other roles
} as const;

// Company Module Activation Settings
export interface CompanyModuleSettings {
  companyId: number;
  moduleId: SystemModule;
  isActive: boolean;
  activatedDate?: string;
  deactivatedDate?: string;
  activatedBy?: number;
  deactivatedBy?: number;
  reason?: string;
}

// Permission Audit Trail
export interface PermissionAuditLog {
  id: number;
  userId: number;
  targetUserId?: number;
  roleId?: number;
  companyId: number;
  action: 'ROLE_ASSIGNED' | 'ROLE_REMOVED' | 'PERMISSION_GRANTED' | 'PERMISSION_REVOKED' | 'MODULE_ACTIVATED' | 'MODULE_DEACTIVATED';
  oldValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}