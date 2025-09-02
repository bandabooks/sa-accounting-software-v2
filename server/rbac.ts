import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { PERMISSIONS } from './auth';
import { SystemRole, CompanyRole, UserPermission, InsertPermissionAuditLog } from '@shared/schema';

// System Role Definitions with Permissions - Authoritative Business Roles Hierarchy
// Level 10-1 hierarchy matching database implementation
export const SYSTEM_ROLES = {
  // Level 10: Platform Owner/System Operator
  SUPER_ADMIN: {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Platform & subscription owner. Global access to all companies, billing, plans, platform settings.',
    level: 10,
    permissions: Object.values(PERMISSIONS), // All permissions across the platform
  },
  
  // Level 9: System Administrator
  SYSTEM_ADMIN: {
    name: 'system_admin',
    displayName: 'System Administrator',
    description: 'System/integrations/configuration. No subscription billing authority.',
    level: 9,
    permissions: Object.values(PERMISSIONS), // Full system access but not billing
  },
  
  // Level 8: Company Administrator
  COMPANY_ADMIN: {
    name: 'company_admin',
    displayName: 'Company Administrator',
    description: 'Full control within their company (users, roles, company billing, settings).',
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
      PERMISSIONS.POS_MANAGE_TERMINAL,
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

  // Level 7: Company Owner
  COMPANY_OWNER: {
    name: 'company_owner',
    displayName: 'Company Owner',
    description: 'Operational owner for a single company; full day-to-day business control.',
    level: 7,
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
      PERMISSIONS.POS_MANAGE_TERMINAL,
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

  // Level 6: Accountant - Core Accounting Features
  ACCOUNTANT: {
    name: 'accountant',
    displayName: 'Accountant',
    description: 'Core accounting: invoicing, expenses, journals, bank rec, VAT; can edit financial data.',
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

  // Level 6: Manager - Business Unit Access
  MANAGER: {
    name: 'manager',
    displayName: 'Manager',
    description: 'Department/business unit scope. Approvals, reports, limited edits.',
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

  // Level 5: Bookkeeper - Day-to-day Transactions
  BOOKKEEPER: {
    name: 'bookkeeper',
    displayName: 'Bookkeeper',
    description: 'Daily entries: sales, expenses, receipts, bills. Limited reporting.',
    level: 5,
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

  // Level 5: Payroll Administrator - HR and Payroll Access
  PAYROLL_ADMIN: {
    name: 'payroll_admin',
    displayName: 'Payroll Administrator',
    description: 'Payroll/HR: employees, leave, salaries. No sales/supplier data.',
    level: 5,
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

  // Level 5: Compliance Officer/Tax Practitioner - Compliance Focus
  COMPLIANCE_OFFICER: {
    name: 'compliance_officer',
    displayName: 'Compliance Officer',
    description: 'Compliance modules (SARS, CIPC, Labour, VAT). Submit/track filings.',
    level: 5,
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

  // Level 4: Auditor - Read-only Financial Access
  AUDITOR: {
    name: 'auditor',
    displayName: 'Auditor',
    description: 'Read-only; can run/export reports, view logs. No edits.',
    level: 4,
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

  // Level 3: Sales Representative - Sales Focused
  SALES_REPRESENTATIVE: {
    name: 'sales_representative',
    displayName: 'Sales Representative',
    description: 'Sales/customer modules (customers, quotes, invoices, products). Limited reporting.',
    level: 3,
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

  // Level 2: Cashier/POS Operator - Point of Sale Access
  CASHIER: {
    name: 'cashier',
    displayName: 'Cashier',
    description: 'POS only; process sales/print receipts. No back-office access.',
    level: 2,
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

  // Level 2: Employee/Staff/Operator - Limited Module Access
  EMPLOYEE: {
    name: 'employee',
    displayName: 'Employee',
    description: 'Only modules needed for tasks (POS, timesheets, tasks). No financial access.',
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

  // Level 1: Viewer/Read-Only User - View Only Access
  VIEWER: {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'View-only dashboards/reports. No management or edits.',
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

// Permission Check Functions
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes(PERMISSIONS.SYSTEM_ADMIN);
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
}

// Role hierarchy checking
export function hasHigherOrEqualRole(userLevel: number, requiredLevel: number): boolean {
  return userLevel >= requiredLevel;
}

// RBAC Middleware Factory
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user || !user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Get user permissions for current company
      const companyId = (req as any).companyId || req.headers['x-company-id'];
      if (!companyId) {
        return res.status(400).json({ message: 'Company context required' });
      }

      const userPermissions = await storage.getUserPermissions(user.id, parseInt(companyId));
      
      if (!hasPermission(userPermissions, permission)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: permission,
          user: userPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
}

// Multiple permission requirement
export function requireAnyPermission(permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const companyId = (req as any).companyId || req.headers['x-company-id'];
      
      if (!user || !companyId) {
        return res.status(401).json({ message: 'Authentication and company context required' });
      }

      const userPermissions = await storage.getUserPermissions(user.id, parseInt(companyId));
      
      if (!hasAnyPermission(userPermissions, permissions)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          requiredAny: permissions,
          user: userPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
}

// Role-based middleware
export function requireRole(roleName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const companyId = (req as any).companyId || req.headers['x-company-id'];
      
      if (!user || !companyId) {
        return res.status(401).json({ message: 'Authentication and company context required' });
      }

      const userRole = await storage.getUserRole(user.id, parseInt(companyId));
      
      if (!userRole || userRole.name !== roleName) {
        return res.status(403).json({ 
          message: 'Insufficient role access',
          required: roleName,
          current: userRole?.name || 'none'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Role check failed' });
    }
  };
}

// Audit logging for permission changes
export async function logPermissionChange(
  userId: number,
  companyId: number,
  action: string,
  resource: string,
  oldValues?: any,
  newValues?: any
): Promise<void> {
  try {
    const auditLog: InsertPermissionAuditLog = {
      userId,
      companyId,
      action,
      resource,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      timestamp: new Date(),
    };
    
    await storage.createPermissionAuditLog(auditLog);
  } catch (error) {
    console.error('Failed to log permission change:', error);
  }
}

// Get effective permissions for a user (including inherited from roles)
export async function getEffectivePermissions(userId: number, companyId: number): Promise<string[]> {
  try {
    // Get direct user permissions
    const directPermissions = await storage.getUserPermissions(userId, companyId);
    
    // Get role-based permissions
    const userRole = await storage.getUserRole(userId, companyId);
    let rolePermissions: string[] = [];
    
    if (userRole) {
      const systemRole = Object.values(SYSTEM_ROLES).find(role => role.name === userRole.name);
      if (systemRole) {
        rolePermissions = systemRole.permissions;
      }
    }
    
    // Combine and deduplicate permissions
    const allPermissions = [...directPermissions, ...rolePermissions];
    return Array.from(new Set(allPermissions));
  } catch (error) {
    console.error('Failed to get effective permissions:', error);
    return [];
  }
}

// Check if user can manage another user (based on role hierarchy)
export function canManageUser(managerLevel: number, targetLevel: number): boolean {
  return managerLevel > targetLevel;
}

// Role assignment validation
export function canAssignRole(assignerLevel: number, roleToAssign: string): boolean {
  const roleData = Object.values(SYSTEM_ROLES).find(role => role.name === roleToAssign);
  if (!roleData) return false;
  
  // Can only assign roles of lower or equal level
  return assignerLevel >= roleData.level;
}