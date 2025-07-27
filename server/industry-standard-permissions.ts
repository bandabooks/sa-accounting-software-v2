/**
 * Industry-Standard Default Permissions for Business Roles
 * Based on real-world job responsibilities and best practices from QuickBooks, Xero, Sage, Zoho
 */

export interface RolePermissionMapping {
  roleName: string;
  displayName: string;
  permissions: string[];
  modules: string[];
  description: string;
}

export const INDUSTRY_STANDARD_ROLE_PERMISSIONS: RolePermissionMapping[] = [
  {
    roleName: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Platform owner with unlimited access to all systems and companies',
    modules: ['*'], // Access to all modules
    permissions: [
      // System Administration
      'system:manage',
      'system:backup',
      'system:audit',
      'companies:create',
      'companies:delete',
      'companies:manage_all',
      
      // User Management
      'users:create',
      'users:delete', 
      'users:manage_all',
      'users:assign_roles',
      'users:impersonate',
      
      // Financial & Compliance
      'financial:full_access',
      'compliance:manage',
      'reports:all',
      'data:export_all',
      
      // All module permissions
      'dashboard:view',
      'invoices:*', 'customers:*', 'estimates:*', 'expenses:*',
      'suppliers:*', 'purchase_orders:*', 'products:*', 'inventory:*',
      'chart_of_accounts:*', 'journal_entries:*', 'banking:*',
      'vat:*', 'payroll:*', 'pos:*', 'projects:*', 'settings:*'
    ]
  },
  
  {
    roleName: 'company_admin',
    displayName: 'Company Administrator', 
    description: 'Full control over their company including users, settings, and all business operations',
    modules: ['dashboard', 'invoices', 'customers', 'estimates', 'expenses', 'suppliers', 'purchase_orders', 'products', 'inventory', 'financial_reports', 'chart_of_accounts', 'journal_entries', 'banking', 'vat', 'payroll', 'pos', 'projects', 'settings', 'user_management'],
    permissions: [
      // Company Management
      'company:manage',
      'company:settings',
      'company:backup',
      
      // User Management (within company)
      'users:create',
      'users:edit',
      'users:deactivate',
      'users:assign_roles',
      'users:view_all',
      
      // All Business Operations
      'dashboard:view',
      'invoices:create', 'invoices:edit', 'invoices:delete', 'invoices:view',
      'customers:create', 'customers:edit', 'customers:delete', 'customers:view',
      'estimates:create', 'estimates:edit', 'estimates:delete', 'estimates:view',
      'expenses:create', 'expenses:edit', 'expenses:delete', 'expenses:view',
      'suppliers:create', 'suppliers:edit', 'suppliers:delete', 'suppliers:view',
      'purchase_orders:create', 'purchase_orders:edit', 'purchase_orders:delete', 'purchase_orders:view',
      'products:create', 'products:edit', 'products:delete', 'products:view',
      'inventory:create', 'inventory:edit', 'inventory:delete', 'inventory:view',
      'chart_of_accounts:create', 'chart_of_accounts:edit', 'chart_of_accounts:delete', 'chart_of_accounts:view',
      'journal_entries:create', 'journal_entries:edit', 'journal_entries:delete', 'journal_entries:view',
      'banking:create', 'banking:edit', 'banking:delete', 'banking:view',
      'vat:create', 'vat:edit', 'vat:delete', 'vat:view',
      'payroll:create', 'payroll:edit', 'payroll:delete', 'payroll:view',
      'pos:create', 'pos:edit', 'pos:delete', 'pos:view', 'pos:manage',
      'projects:create', 'projects:edit', 'projects:delete', 'projects:view',
      'settings:edit', 'settings:view',
      'reports:all'
    ]
  },

  {
    roleName: 'accountant',
    displayName: 'Accountant',
    description: 'Full financial management with reporting capabilities but no system administration',
    modules: ['dashboard', 'invoices', 'customers', 'estimates', 'expenses', 'suppliers', 'purchase_orders', 'financial_reports', 'chart_of_accounts', 'journal_entries', 'banking', 'vat'],
    permissions: [
      'dashboard:view',
      'invoices:create', 'invoices:edit', 'invoices:delete', 'invoices:view',
      'customers:create', 'customers:edit', 'customers:view',
      'estimates:create', 'estimates:edit', 'estimates:delete', 'estimates:view',
      'expenses:create', 'expenses:edit', 'expenses:delete', 'expenses:view',
      'suppliers:create', 'suppliers:edit', 'suppliers:view',
      'purchase_orders:create', 'purchase_orders:edit', 'purchase_orders:view',
      'chart_of_accounts:create', 'chart_of_accounts:edit', 'chart_of_accounts:view',
      'journal_entries:create', 'journal_entries:edit', 'journal_entries:delete', 'journal_entries:view',
      'banking:create', 'banking:edit', 'banking:view',
      'vat:create', 'vat:edit', 'vat:view',
      'reports:financial', 'reports:tax', 'reports:compliance'
    ]
  },

  {
    roleName: 'bookkeeper',
    displayName: 'Bookkeeper',
    description: 'Data entry and basic transaction management without delete permissions',
    modules: ['dashboard', 'invoices', 'customers', 'estimates', 'expenses', 'suppliers', 'banking'],
    permissions: [
      'dashboard:view',
      'invoices:create', 'invoices:edit', 'invoices:view',
      'customers:create', 'customers:edit', 'customers:view',
      'estimates:create', 'estimates:edit', 'estimates:view',
      'expenses:create', 'expenses:edit', 'expenses:view',
      'suppliers:create', 'suppliers:edit', 'suppliers:view',
      'banking:create', 'banking:edit', 'banking:view',
      'reports:basic'
    ]
  },

  {
    roleName: 'manager',
    displayName: 'Manager',
    description: 'Department oversight with reporting and team management capabilities',
    modules: ['dashboard', 'invoices', 'customers', 'estimates', 'expenses', 'projects', 'pos'],
    permissions: [
      'dashboard:view',
      'invoices:view', 'invoices:edit',
      'customers:view', 'customers:edit',
      'estimates:view', 'estimates:create', 'estimates:edit',
      'expenses:view', 'expenses:approve',
      'projects:view', 'projects:edit', 'projects:manage',
      'pos:view', 'pos:manage',
      'reports:departmental', 'reports:sales',
      'users:view_team'
    ]
  },

  {
    roleName: 'sales_representative',
    displayName: 'Sales Representative',
    description: 'Customer and sales transaction management',
    modules: ['dashboard', 'invoices', 'customers', 'estimates', 'pos'],
    permissions: [
      'dashboard:view',
      'invoices:create', 'invoices:edit', 'invoices:view',
      'customers:create', 'customers:edit', 'customers:view',
      'estimates:create', 'estimates:edit', 'estimates:view',
      'pos:create', 'pos:view',
      'reports:sales'
    ]
  },

  {
    roleName: 'payroll_administrator',
    displayName: 'Payroll Administrator',
    description: 'Employee payroll and related financial management',
    modules: ['dashboard', 'payroll', 'employees', 'banking'],
    permissions: [
      'dashboard:view',
      'payroll:create', 'payroll:edit', 'payroll:delete', 'payroll:view',
      'employees:create', 'employees:edit', 'employees:view',
      'banking:view',
      'reports:payroll'
    ]
  },

  {
    roleName: 'compliance_officer',
    displayName: 'Compliance Officer',
    description: 'VAT, tax compliance, and regulatory reporting',
    modules: ['dashboard', 'vat', 'financial_reports', 'chart_of_accounts', 'journal_entries'],
    permissions: [
      'dashboard:view',
      'vat:create', 'vat:edit', 'vat:view',
      'chart_of_accounts:view',
      'journal_entries:view',
      'reports:compliance', 'reports:tax', 'reports:vat'
    ]
  },

  {
    roleName: 'auditor',
    displayName: 'Auditor',
    description: 'Read-only access to financial records for audit purposes',
    modules: ['dashboard', 'financial_reports', 'chart_of_accounts', 'journal_entries', 'banking', 'vat'],
    permissions: [
      'dashboard:view',
      'invoices:view',
      'customers:view',
      'expenses:view',
      'suppliers:view',
      'chart_of_accounts:view',
      'journal_entries:view',
      'banking:view',
      'vat:view',
      'reports:all'
    ]
  },

  {
    roleName: 'cashier',
    displayName: 'Cashier',
    description: 'Point of sale operations and basic customer transactions',
    modules: ['pos', 'customers'],
    permissions: [
      'pos:create', 'pos:view',
      'customers:view', 'customers:create'
    ]
  },

  {
    roleName: 'employee',
    displayName: 'Employee',
    description: 'Basic access to relevant work modules and personal information',
    modules: ['dashboard', 'expenses'],
    permissions: [
      'dashboard:view',
      'expenses:create', 'expenses:view'
    ]
  },

  {
    roleName: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access to basic business information',
    modules: ['dashboard'],
    permissions: [
      'dashboard:view'
    ]
  }
];

// Subscription plan module definitions
export interface SubscriptionPlanModules {
  planName: string;
  modules: {
    included: string[];
    defaultActive: string[];
    dependencies: Record<string, string[]>;
  };
}

export const SUBSCRIPTION_PLAN_MODULES: SubscriptionPlanModules[] = [
  {
    planName: 'basic',
    modules: {
      included: ['dashboard', 'invoices', 'customers', 'estimates', 'expenses', 'basic_reports'],
      defaultActive: ['dashboard', 'invoices', 'customers', 'estimates'],
      dependencies: {
        'invoices': ['customers'],
        'estimates': ['customers']
      }
    }
  },
  {
    planName: 'professional', 
    modules: {
      included: ['dashboard', 'invoices', 'customers', 'estimates', 'expenses', 'suppliers', 'purchase_orders', 'products', 'inventory', 'financial_reports', 'banking', 'vat', 'payroll', 'pos'],
      defaultActive: ['dashboard', 'invoices', 'customers', 'estimates', 'expenses', 'suppliers', 'products', 'financial_reports'],
      dependencies: {
        'invoices': ['customers', 'products'],
        'estimates': ['customers', 'products'],
        'inventory': ['products'],
        'purchase_orders': ['suppliers', 'products'],
        'pos': ['products', 'customers']
      }
    }
  },
  {
    planName: 'enterprise',
    modules: {
      included: ['*'], // All modules
      defaultActive: ['dashboard', 'invoices', 'customers', 'estimates', 'expenses', 'suppliers', 'purchase_orders', 'products', 'inventory', 'financial_reports', 'chart_of_accounts', 'journal_entries', 'banking', 'vat', 'payroll', 'pos', 'projects', 'user_management'],
      dependencies: {
        'invoices': ['customers', 'products', 'chart_of_accounts'],
        'estimates': ['customers', 'products'],
        'inventory': ['products'],
        'purchase_orders': ['suppliers', 'products'],
        'pos': ['products', 'customers', 'inventory'],
        'payroll': ['chart_of_accounts'],
        'journal_entries': ['chart_of_accounts']
      }
    }
  }
];

/**
 * Apply industry-standard permissions to a role
 */
export function getDefaultPermissionsForRole(roleName: string): string[] {
  const roleMapping = INDUSTRY_STANDARD_ROLE_PERMISSIONS.find(r => r.roleName === roleName);
  return roleMapping ? roleMapping.permissions : [];
}

/**
 * Get default modules for a role
 */
export function getDefaultModulesForRole(roleName: string): string[] {
  const roleMapping = INDUSTRY_STANDARD_ROLE_PERMISSIONS.find(r => r.roleName === roleName);
  return roleMapping ? roleMapping.modules : [];
}

/**
 * Get included and default active modules for a subscription plan
 */
export function getModulesForPlan(planName: string): SubscriptionPlanModules['modules'] | null {
  const planMapping = SUBSCRIPTION_PLAN_MODULES.find(p => p.planName === planName);
  return planMapping ? planMapping.modules : null;
}

/**
 * Check if a module has dependencies and return them
 */
export function getModuleDependencies(moduleName: string, planName: string): string[] {
  const planMapping = SUBSCRIPTION_PLAN_MODULES.find(p => p.planName === planName);
  if (!planMapping) return [];
  
  return planMapping.modules.dependencies[moduleName] || [];
}

/**
 * Activate module with all its dependencies
 */
export function activateModuleWithDependencies(moduleName: string, planName: string): string[] {
  const dependencies = getModuleDependencies(moduleName, planName);
  const modulesToActivate = [moduleName];
  
  // Recursively add dependencies
  dependencies.forEach(dep => {
    const subDependencies = activateModuleWithDependencies(dep, planName);
    modulesToActivate.unshift(...subDependencies);
  });
  
  // Remove duplicates and return
  return [...new Set(modulesToActivate)];
}