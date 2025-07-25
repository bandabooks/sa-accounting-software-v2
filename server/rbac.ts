import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { PERMISSIONS } from './auth';
import { SystemRole, CompanyRole, UserPermission, InsertPermissionAuditLog } from '@shared/schema';

// System Role Definitions with Permissions
export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access across all companies and modules',
    level: 10,
    permissions: Object.values(PERMISSIONS), // All permissions
  },
  SYSTEM_ADMIN: {
    name: 'system_admin',
    displayName: 'System Administrator',
    description: 'Administrative access to system-level functions',
    level: 9,
    permissions: [
      PERMISSIONS.SYSTEM_ADMIN,
      PERMISSIONS.COMPANIES_VIEW,
      PERMISSIONS.COMPANIES_CREATE,
      PERMISSIONS.COMPANIES_UPDATE,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_UPDATE,
    ],
  },
  COMPANY_OWNER: {
    name: 'company_owner',
    displayName: 'Company Owner',
    description: 'Full access to company operations and settings',
    level: 8,
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
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_DELETE,
      PERMISSIONS.INVOICES_SEND,
      PERMISSIONS.INVOICES_APPROVE,
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
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_UPDATE,
      PERMISSIONS.AUDIT_VIEW,
    ],
  },
  COMPANY_ADMIN: {
    name: 'company_admin',
    displayName: 'Company Administrator',
    description: 'Administrative access to company operations',
    level: 7,
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.CUSTOMERS_DELETE,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_DELETE,
      PERMISSIONS.INVOICES_SEND,
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_MANAGE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.SETTINGS_VIEW,
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