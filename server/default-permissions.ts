// Default Role-Permission Mapping System
// This ensures all new companies and users get proper access permissions

export const DEFAULT_ROLE_PERMISSIONS = {
  // Company Admin/Owner - Full access to all modules in their plan
  company_admin: [
    'dashboard:view',
    'sales:view', 'sales:create', 'sales:update', 'sales:delete',
    'purchases:view', 'purchases:create', 'purchases:update', 'purchases:delete',
    'products:view', 'products:create', 'products:update', 'products:delete',
    'inventory:view', 'inventory:manage', 'inventory:adjust', 'inventory:count',
    'accounting:view', 'chart_of_accounts:view', 'chart_of_accounts:create', 'chart_of_accounts:update', 'chart_of_accounts:delete',
    'journal_entries:view', 'journal_entries:create', 'journal_entries:update',
    'banking:view', 'banking:create', 'banking:update', 'banking:reconciliation',
    'reports:view', 'reports:export', 'reports:schedule',
    'customers:view', 'customers:create', 'customers:update', 'customers:delete',
    'invoices:view', 'invoices:create', 'invoices:update', 'invoices:send',
    'estimates:view', 'estimates:create', 'estimates:update', 'estimates:convert',
    'payments:view', 'payments:create', 'payments:update',
    'users:view', 'users:create', 'users:update', 'users:assign_roles',
    'settings:view', 'settings:update', 'settings:company',
    'pos:view', 'pos:process_sales', 'pos:manage_shifts', 'pos:view_reports',
    'vat:view', 'vat:manage', 'vat:submit_returns'
  ],

  // Manager - Full access except company/user settings
  manager: [
    'dashboard:view',
    'sales:view', 'sales:create', 'sales:update', 'sales:delete',
    'purchases:view', 'purchases:create', 'purchases:update', 'purchases:delete',
    'products:view', 'products:create', 'products:update', 'products:delete',
    'inventory:view', 'inventory:manage', 'inventory:adjust',
    'accounting:view', 'chart_of_accounts:view',
    'journal_entries:view', 'journal_entries:create', 'journal_entries:update',
    'banking:view', 'banking:create', 'banking:update',
    'reports:view', 'reports:export',
    'customers:view', 'customers:create', 'customers:update', 'customers:delete',
    'invoices:view', 'invoices:create', 'invoices:update', 'invoices:send',
    'estimates:view', 'estimates:create', 'estimates:update', 'estimates:convert',
    'payments:view', 'payments:create', 'payments:update',
    'pos:view', 'pos:process_sales', 'pos:manage_shifts', 'pos:view_reports',
    'vat:view', 'vat:manage'
  ],

  // Accountant - Enhanced financial and reporting modules with full VAT/Expense access
  accountant: [
    'dashboard:view',
    'purchases:view', 'purchases:create', 'purchases:update', 'purchases:delete',
    'purchase_orders:view', 'purchase_orders:create', 'purchase_orders:update', 'purchase_orders:delete',
    'suppliers:view', 'suppliers:create', 'suppliers:update', 'suppliers:delete',
    'accounting:view', 'chart_of_accounts:view', 'chart_of_accounts:create', 'chart_of_accounts:update', 'chart_of_accounts:delete',
    'journal_entries:view', 'journal_entries:create', 'journal_entries:update',
    'banking:view', 'banking:create', 'banking:update', 'banking:reconciliation',
    'reports:view', 'reports:export', 'reports:schedule',
    'invoices:view', 'invoices:create', 'invoices:update',
    'estimates:view',
    'payments:view', 'payments:create', 'payments:update',
    'expenses:view', 'expenses:create', 'expenses:update', 'expenses:delete',
    'expense_management:view', 'expense_management:create', 'expense_management:update',
    'vat:view', 'vat:manage', 'vat:submit_returns', 'vat_returns:view', 'vat_returns:create',
    'vat_reporting:view', 'vat_reporting:export'
  ],

  // Bookkeeper - Enhanced data entry with purchase and VAT access
  bookkeeper: [
    'dashboard:view',
    'accounting:view', 'chart_of_accounts:view', 'chart_of_accounts:create', 'journal_entries:view', 'journal_entries:create',
    'banking:view', 'banking:create',
    'reports:view',
    'invoices:view', 'invoices:create', 'invoices:update',
    'estimates:view', 'estimates:create',
    'payments:view', 'payments:create',
    'expenses:view', 'expenses:create', 'expenses:update',
    'purchases:view', 'purchases:create', 'purchases:update',
    'suppliers:view', 'suppliers:create', 'suppliers:update',
    'vat:view', 'vat:manage',
    'customers:view', 'customers:create', 'customers:update',
    'products:view'
  ],

  // Sales Representative - Sales focused
  sales_rep: [
    'dashboard:view',
    'customers:view', 'customers:create', 'customers:update',
    'invoices:view', 'invoices:create', 'invoices:update', 'invoices:send',
    'estimates:view', 'estimates:create', 'estimates:update', 'estimates:convert',
    'products:view',
    'reports:view',
    'pos:view', 'pos:process_sales'
  ],

  // Cashier - POS and basic sales
  cashier: [
    'dashboard:view',
    'pos:view', 'pos:process_sales', 'pos:handle_returns',
    'customers:view',
    'products:view',
    'payments:view', 'payments:create'
  ],

  // Employee - Limited access
  employee: [
    'dashboard:view',
    'time:tracking',
    'tasks:view'
  ],

  // Viewer - Read-only access
  viewer: [
    'dashboard:view',
    'reports:view',
    'customers:view',
    'invoices:view',
    'products:view'
  ]
};

// Subscription Plan Module Access - Enhanced with trial permissions
export const SUBSCRIPTION_PLAN_MODULES = {
  trial: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'expenses', 'invoices', 'estimates', 'accounting', 'banking',
    'reports', 'inventory', 'vat', 'chart_of_accounts', 'journal_entries',
    'payments', 'settings'
  ],
  
  basic: [
    'dashboard', 'sales', 'purchases', 'products', 'customers', 
    'expenses', 'invoices', 'estimates', 'accounting', 'banking',
    'reports', 'inventory', 'vat', 'vat_management', 'chart_of_accounts', 
    'journal_entries', 'payments', 'settings', 'suppliers', 'purchase_orders',
    'expense_management', 'vat_returns', 'vat_reporting', 'basic_reports', 
    'basic_accounting'
  ],
  
  standard: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'expenses', 'invoices', 'estimates', 'accounting', 'banking', 
    'reports', 'inventory', 'vat', 'chart_of_accounts', 'journal_entries',
    'payments', 'settings', 'compliance_basic'
  ],
  
  professional: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'expenses', 'invoices', 'estimates', 'accounting', 'banking', 
    'reports', 'inventory', 'vat', 'chart_of_accounts', 'journal_entries',
    'payments', 'settings', 'compliance', 'pos', 'advanced_reports', 
    'projects', 'payroll_basic'
  ],
  
  enterprise: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'expenses', 'invoices', 'estimates', 'accounting', 'banking', 
    'reports', 'inventory', 'vat', 'chart_of_accounts', 'journal_entries',
    'payments', 'settings', 'compliance', 'pos', 'advanced_reports', 
    'projects', 'payroll', 'advanced_analytics', 'api_access', 
    'custom_fields', 'workflow_automation', 'multi_company'
  ]
};

// Function to get default permissions for a role
export function getDefaultPermissionsForRole(role: string): string[] {
  return DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS] || DEFAULT_ROLE_PERMISSIONS.viewer;
}

// Function to check if module is available for subscription plan
export function isModuleAvailableForPlan(module: string, plan: string): boolean {
  const planModules = SUBSCRIPTION_PLAN_MODULES[plan as keyof typeof SUBSCRIPTION_PLAN_MODULES];
  return planModules ? planModules.includes(module) : false;
}

// Function to filter permissions based on subscription plan
export function filterPermissionsByPlan(permissions: string[], plan: string): string[] {
  const availableModules = SUBSCRIPTION_PLAN_MODULES[plan as keyof typeof SUBSCRIPTION_PLAN_MODULES] || [];
  
  return permissions.filter(permission => {
    const module = permission.split(':')[0];
    return availableModules.includes(module) || availableModules.includes('dashboard');
  });
}

// Function to create default user permissions for a new company
export async function createDefaultUserPermissions(
  userId: number,
  companyId: number,
  role: string = 'company_admin',
  subscriptionPlan: string = 'trial'
): Promise<void> {
  try {
    // Get default permissions for role
    const rolePermissions = getDefaultPermissionsForRole(role);
    
    // Filter permissions based on subscription plan
    const filteredPermissions = filterPermissionsByPlan(rolePermissions, subscriptionPlan);
    
    // Get appropriate system role
    let systemRoleId = 1; // Default to super_admin for company_admin
    if (role === 'manager') systemRoleId = 6;
    else if (role === 'accountant') systemRoleId = 3;
    else if (role === 'bookkeeper') systemRoleId = 4;
    else if (role === 'sales_rep') systemRoleId = 7;
    else if (role === 'cashier') systemRoleId = 8;
    else if (role === 'employee') systemRoleId = 11;
    else if (role === 'viewer') systemRoleId = 12;
    
    // Import storage for database operations
    const { storage } = await import('./storage');
    
    // Create user permission record
    await storage.createUserPermission({
      userId,
      companyId,
      systemRoleId,
      customPermissions: filteredPermissions,
      deniedPermissions: [],
      isActive: true,
      grantedBy: userId, // Self-granted for company owner
      grantedAt: new Date()
    });
    
    console.log(`✅ Created default permissions for user ${userId} in company ${companyId} with role ${role}`);
  } catch (error) {
    console.error(`❌ Failed to create default permissions for user ${userId}:`, error);
  }
}