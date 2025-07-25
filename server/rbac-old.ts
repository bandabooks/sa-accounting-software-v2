import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { PERMISSIONS } from './auth';
import { SystemRole, CompanyRole, UserPermission, InsertPermissionAuditLog } from '@shared/schema';

// System Role Definitions with Permissions - Comprehensive Business Roles
export const SYSTEM_ROLES = {
  // 1. Platform Owner/System Operator
  SUPER_ADMIN: {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Platform owner with full access to all companies, billing, subscription, platform settings, and global system management',
    level: 10,
    permissions: Object.values(PERMISSIONS), // All permissions across the platform
  },
  
  // 2. Company Admin/Owner - Full Company Access
  COMPANY_ADMIN: {
    name: 'company_admin',
    displayName: 'Company Administrator',
    description: 'Full access to all modules and settings within their company. Can invite, create, and manage users, assign roles and permissions, control billing',
    level: 9,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.COMPANIES_VIEW,
      PERMISSIONS.COMPANIES_UPDATE,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_ASSIGN_ROLES,
      PERMISSIONS.ROLES_VIEW,
      PERMISSIONS.ROLES_CREATE,
      PERMISSIONS.ROLES_UPDATE,
      PERMISSIONS.PERMISSIONS_GRANT,
      PERMISSIONS.PERMISSIONS_REVOKE,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.CUSTOMERS_DELETE,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_UPDATE,
      PERMISSIONS.SUPPLIERS_DELETE,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_DELETE,
      PERMISSIONS.INVOICES_SEND,
      PERMISSIONS.INVOICES_APPROVE,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.ESTIMATES_CREATE,
      PERMISSIONS.ESTIMATES_UPDATE,
      PERMISSIONS.ESTIMATES_DELETE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.PRODUCTS_DELETE,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_MANAGE,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.EXPENSES_DELETE,
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_CREATE,
      PERMISSIONS.PURCHASE_ORDERS_UPDATE,
      PERMISSIONS.PURCHASE_ORDERS_DELETE,
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.FINANCIAL_EXPORT,
      PERMISSIONS.CHART_OF_ACCOUNTS_VIEW,
      PERMISSIONS.CHART_OF_ACCOUNTS_UPDATE,
      PERMISSIONS.JOURNAL_ENTRIES_VIEW,
      PERMISSIONS.JOURNAL_ENTRIES_CREATE,
      PERMISSIONS.JOURNAL_ENTRIES_UPDATE,
      PERMISSIONS.BANKING_VIEW,
      PERMISSIONS.BANKING_CREATE,
      PERMISSIONS.BANKING_UPDATE,
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_PROCESS_SALES,
      PERMISSIONS.POS_HANDLE_RETURNS,
      PERMISSIONS.POS_CASH_MANAGEMENT,
      PERMISSIONS.POS_MANAGE_SHIFTS,
      PERMISSIONS.POS_MANAGE_TERMINALS,
      PERMISSIONS.POS_VIEW_REPORTS,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_UPDATE,
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.COMPLIANCE_VIEW,
      PERMISSIONS.VAT_MANAGE,
    ],
  },

  // 3. Accountant - Core Accounting Features
  ACCOUNTANT: {
    name: 'accountant',
    displayName: 'Accountant',
    description: 'Access to core accounting features including invoicing, expenses, bank reconciliation, journals, VAT. Can view, create, and edit financial records',
    level: 7,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_UPDATE,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_SEND,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.ESTIMATES_CREATE,
      PERMISSIONS.ESTIMATES_UPDATE,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_CREATE,
      PERMISSIONS.PURCHASE_ORDERS_UPDATE,
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.FINANCIAL_EXPORT,
      PERMISSIONS.CHART_OF_ACCOUNTS_VIEW,
      PERMISSIONS.CHART_OF_ACCOUNTS_UPDATE,
      PERMISSIONS.JOURNAL_ENTRIES_VIEW,
      PERMISSIONS.JOURNAL_ENTRIES_CREATE,
      PERMISSIONS.JOURNAL_ENTRIES_UPDATE,
      PERMISSIONS.BANKING_VIEW,
      PERMISSIONS.BANKING_CREATE,
      PERMISSIONS.BANKING_UPDATE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.VAT_MANAGE,
      PERMISSIONS.COMPLIANCE_VIEW,
    ],
  },

  // 4. Bookkeeper - Day-to-day Transactions
  BOOKKEEPER: {
    name: 'bookkeeper',
    displayName: 'Bookkeeper',
    description: 'Enter day-to-day transactions including sales, expenses, receipts, bills. Access to client, supplier, product, and transaction modules with limited reporting',
    level: 6,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_UPDATE,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.ESTIMATES_CREATE,
      PERMISSIONS.ESTIMATES_UPDATE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_CREATE,
      PERMISSIONS.PURCHASE_ORDERS_UPDATE,
      PERMISSIONS.JOURNAL_ENTRIES_VIEW,
      PERMISSIONS.JOURNAL_ENTRIES_CREATE,
      PERMISSIONS.BANKING_VIEW,
      PERMISSIONS.BANKING_CREATE,
    ],
  },

  // 5. Auditor - Read-only Financial Access
  AUDITOR: {
    name: 'auditor',
    displayName: 'Auditor',
    description: 'Read-only access to financial data, transactions, and compliance modules. Can run and export reports, view logs, but cannot create or edit records',
    level: 5,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.FINANCIAL_EXPORT,
      PERMISSIONS.CHART_OF_ACCOUNTS_VIEW,
      PERMISSIONS.JOURNAL_ENTRIES_VIEW,
      PERMISSIONS.BANKING_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.COMPLIANCE_VIEW,
    ],
  },

  // 6. Manager/Department Manager - Business Unit Access
  MANAGER: {
    name: 'manager',
    displayName: 'Manager',
    description: 'Access to relevant business units or departments. Can approve transactions, view reports, limited edit rights for their area of responsibility',
    level: 6,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_APPROVE,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.ESTIMATES_CREATE,
      PERMISSIONS.ESTIMATES_UPDATE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_CREATE,
      PERMISSIONS.PURCHASE_ORDERS_UPDATE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
    ],
  },

  // 7. Sales Representative - Sales Focused
  SALES_REP: {
    name: 'sales_representative',
    displayName: 'Sales Representative',
    description: 'Access to sales-related modules including customers, invoices, estimates, products. Limited access to financial reports',
    level: 4,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_SEND,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.ESTIMATES_CREATE,
      PERMISSIONS.ESTIMATES_UPDATE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_PROCESS_SALES,
    ],
  },

  // 8. Cashier/POS Operator - Point of Sale Access
  CASHIER: {
    name: 'cashier',
    displayName: 'Cashier',
    description: 'Use the Point of Sale module, process sales, print receipts. No access to back-office functions or sensitive financial data',
    level: 3,
    permissions: [
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_PROCESS_SALES,
      PERMISSIONS.POS_HANDLE_RETURNS,
      PERMISSIONS.POS_CASH_MANAGEMENT,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
    ],
  },

  // 9. Payroll Admin - HR and Payroll Access
  PAYROLL_ADMIN: {
    name: 'payroll_admin',
    displayName: 'Payroll Administrator',
    description: 'Access to payroll, employee management, leave, and salary modules. No access to sales or supplier data',
    level: 6,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.JOURNAL_ENTRIES_VIEW,
      PERMISSIONS.JOURNAL_ENTRIES_CREATE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.BANKING_VIEW,
    ],
  },

  // 10. Compliance Officer/Tax Practitioner - Compliance Focus
  COMPLIANCE_OFFICER: {
    name: 'compliance_officer',
    displayName: 'Compliance Officer',
    description: 'Access to compliance modules including SARS, CIPC, Labour, VAT. Submit, track, and download compliance documents and reports',
    level: 6,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.COMPLIANCE_VIEW,
      PERMISSIONS.VAT_MANAGE,
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.FINANCIAL_EXPORT,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.JOURNAL_ENTRIES_VIEW,
    ],
  },

  // 11. Employee/Staff/Operator - Limited Module Access
  EMPLOYEE: {
    name: 'employee',
    displayName: 'Employee',
    description: 'Access to only the modules necessary for their job such as POS, sales entry, timesheets, tasks. Cannot view financial reports or manage company/users',
    level: 2,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_PROCESS_SALES,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
    ],
  },

  // 12. Viewer/Read-Only User - View Only Access
  VIEWER: {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Can only view data, reports, and dashboards. No editing or management rights whatsoever',
    level: 1,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.AUDIT_VIEW,
    ],
  },
};
      PERMISSIONS.INVOICES_SEND,
      PERMISSIONS.INVOICES_APPROVE,
      
      // Estimate Management
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.ESTIMATES_CREATE,
      PERMISSIONS.ESTIMATES_UPDATE,
      PERMISSIONS.ESTIMATES_DELETE,
      
      // Payment Management
      PERMISSIONS.PAYMENTS_VIEW,
      PERMISSIONS.PAYMENTS_CREATE,
      PERMISSIONS.PAYMENTS_UPDATE,
      PERMISSIONS.PAYMENTS_DELETE,
      
      // Financial Management
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.FINANCIAL_EXPORT,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.EXPENSES_DELETE,
      
      // Accounting
      PERMISSIONS.CHART_OF_ACCOUNTS_VIEW,
      PERMISSIONS.CHART_OF_ACCOUNTS_UPDATE,
      PERMISSIONS.JOURNAL_ENTRIES_VIEW,
      PERMISSIONS.JOURNAL_ENTRIES_CREATE,
      PERMISSIONS.JOURNAL_ENTRIES_UPDATE,
      PERMISSIONS.GENERAL_LEDGER_VIEW,
      PERMISSIONS.TRIAL_BALANCE_VIEW,
      
      // Banking
      PERMISSIONS.BANKING_VIEW,
      PERMISSIONS.BANKING_CREATE,
      PERMISSIONS.BANKING_UPDATE,
      
      // Product Management
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.PRODUCTS_DELETE,
      
      // Inventory Management
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_MANAGE,
      
      // Purchase Orders & Suppliers
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_CREATE,
      PERMISSIONS.PURCHASE_ORDERS_UPDATE,
      PERMISSIONS.PURCHASE_ORDERS_DELETE,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_UPDATE,
      PERMISSIONS.SUPPLIERS_DELETE,
      
      // VAT Management
      PERMISSIONS.VAT_VIEW,
      PERMISSIONS.VAT_MANAGE,
      
      // POS Management
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_PROCESS_SALES,
      PERMISSIONS.POS_HANDLE_RETURNS,
      PERMISSIONS.POS_CASH_MANAGEMENT,
      PERMISSIONS.POS_MANAGE_SHIFTS,
      PERMISSIONS.POS_MANAGE_TERMINALS,
      PERMISSIONS.POS_VIEW_REPORTS,
      
      // Reports & Analytics
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.ANALYTICS_VIEW,
      
      // Settings & Configuration
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_UPDATE,
      
      // Audit Access (can view company audit logs)
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.PERMISSIONS_VIEW_AUDIT,
    ],
  },
  ACCOUNTANT: {
    name: 'accountant',
    displayName: 'Accountant',
    description: 'Financial and accounting operations access',
    level: 6,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.PAYMENTS_VIEW,
      PERMISSIONS.PAYMENTS_CREATE,
      PERMISSIONS.PAYMENTS_UPDATE,
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.CHART_OF_ACCOUNTS_VIEW,
      PERMISSIONS.JOURNAL_ENTRIES_VIEW,
      PERMISSIONS.JOURNAL_ENTRIES_CREATE,
      PERMISSIONS.JOURNAL_ENTRIES_UPDATE,
      PERMISSIONS.GENERAL_LEDGER_VIEW,
      PERMISSIONS.TRIAL_BALANCE_VIEW,
      PERMISSIONS.BANKING_VIEW,
      PERMISSIONS.BANKING_CREATE,
      PERMISSIONS.BANKING_UPDATE,
      PERMISSIONS.VAT_VIEW,
      PERMISSIONS.VAT_MANAGE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
    ],
  },
  MANAGER: {
    name: 'manager',
    displayName: 'Manager',
    description: 'Operational management access',
    level: 5,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_SEND,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.ESTIMATES_CREATE,
      PERMISSIONS.ESTIMATES_UPDATE,
      PERMISSIONS.PAYMENTS_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_CREATE,
      PERMISSIONS.PURCHASE_ORDERS_UPDATE,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_UPDATE,
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_MANAGE_SHIFTS,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
  SALES_REP: {
    name: 'sales_rep',
    displayName: 'Sales Representative',
    description: 'Sales and customer management access',
    level: 4,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_SEND,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.ESTIMATES_CREATE,
      PERMISSIONS.ESTIMATES_UPDATE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_PROCESS_SALES,
    ],
  },
  CASHIER: {
    name: 'cashier',
    displayName: 'Cashier',
    description: 'Point of sale operations access',
    level: 3,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_PROCESS_SALES,
      PERMISSIONS.POS_HANDLE_RETURNS,
      PERMISSIONS.POS_CASH_MANAGEMENT,
    ],
  },
  EMPLOYEE: {
    name: 'employee',
    displayName: 'Employee',
    description: 'Basic operational access',
    level: 2,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.TIME_TRACKING,
      PERMISSIONS.TASKS_VIEW,
    ],
  },
  VIEWER: {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access to basic modules',
    level: 1,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
};

// Permission utility functions
export class PermissionManager {
  // Get user's effective permissions for a company
  static async getUserPermissions(userId: number, companyId: number): Promise<string[]> {
    const userPermission = await storage.getUserPermission(userId, companyId);
    if (!userPermission) {
      return [];
    }

    let permissions: string[] = [];

    // Add system role permissions
    if (userPermission.systemRoleId) {
      const systemRole = await storage.getSystemRole(userPermission.systemRoleId);
      if (systemRole?.permissions) {
        permissions = permissions.concat(systemRole.permissions as string[]);
      }
    }

    // Add company role permissions
    if (userPermission.companyRoleId) {
      const companyRole = await storage.getCompanyRole(userPermission.companyRoleId);
      if (companyRole?.permissions) {
        permissions = permissions.concat(companyRole.permissions as string[]);
      }
    }

    // Add custom permissions
    if (userPermission.customPermissions) {
      permissions = permissions.concat(userPermission.customPermissions as string[]);
    }

    // Remove denied permissions
    if (userPermission.deniedPermissions) {
      const deniedPerms = userPermission.deniedPermissions as string[];
      permissions = permissions.filter(perm => !deniedPerms.includes(perm));
    }

    // Remove duplicates and return
    return [...new Set(permissions)];
  }

  // Check if user has specific permission
  static async hasPermission(userId: number, companyId: number, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, companyId);
    return userPermissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  static async hasAnyPermission(userId: number, companyId: number, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, companyId);
    return permissions.some(perm => userPermissions.includes(perm));
  }

  // Check if user has all of the specified permissions
  static async hasAllPermissions(userId: number, companyId: number, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, companyId);
    return permissions.every(perm => userPermissions.includes(perm));
  }

  // Get user's role level for permission hierarchy
  static async getUserLevel(userId: number, companyId: number): Promise<number> {
    const userPermission = await storage.getUserPermission(userId, companyId);
    if (!userPermission) {
      return 0;
    }

    let maxLevel = 0;

    // Check system role level
    if (userPermission.systemRoleId) {
      const systemRole = await storage.getSystemRole(userPermission.systemRoleId);
      if (systemRole) {
        maxLevel = Math.max(maxLevel, systemRole.level);
      }
    }

    return maxLevel;
  }

  // Log permission changes for audit
  static async logPermissionChange(params: {
    userId: number;
    companyId: number;
    changedBy: number;
    action: string;
    targetType: string;
    targetId?: number;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    metadata?: any;
  }): Promise<void> {
    const auditLog: InsertPermissionAuditLog = {
      userId: params.userId,
      companyId: params.companyId,
      changedBy: params.changedBy,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      reason: params.reason,
      metadata: params.metadata || {},
    };

    await storage.createPermissionAuditLog(auditLog);
  }
}

// Express middleware for permission checking
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const companyId = (req as any).companyId || user.activeCompanyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company context required' });
    }

    const hasPermission = await PermissionManager.hasPermission(user.id, companyId, permission);
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission 
      });
    }

    next();
  };
}

// Middleware for requiring any of multiple permissions
export function requireAnyPermission(permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const companyId = (req as any).companyId || user.activeCompanyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company context required' });
    }

    const hasPermission = await PermissionManager.hasAnyPermission(user.id, companyId, permissions);
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: `One of: ${permissions.join(', ')}` 
      });
    }

    next();
  };
}

// Middleware for requiring minimum level access
export function requireMinimumLevel(level: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const companyId = (req as any).companyId || user.activeCompanyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company context required' });
    }

    const userLevel = await PermissionManager.getUserLevel(user.id, companyId);
    if (userLevel < level) {
      return res.status(403).json({ 
        error: 'Insufficient access level',
        required: level,
        current: userLevel
      });
    }

    next();
  };
}

// Super admin check (system-wide access)
export function requireSuperAdmin() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has super admin role in any company or system-wide
    const userPermissions = await storage.getAllUserPermissions(user.id);
    const isSuperAdmin = userPermissions.some(async (perm) => {
      if (perm.systemRoleId) {
        const systemRole = await storage.getSystemRole(perm.systemRoleId);
        return systemRole?.name === 'super_admin';
      }
      return false;
    });

    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Super Administrator access required' });
    }

    next();
  };
}