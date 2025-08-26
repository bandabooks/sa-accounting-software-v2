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
  SALES_REPRESENTATIVE: {
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

      const userPerms = await storage.getAllUserPermissions(user.id);
      const userPermissions = userPerms.map(p => p.customPermissions).flat().filter(Boolean) as string[];
      
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

      const userPerms = await storage.getAllUserPermissions(user.id);
      const userPermissions = userPerms.map(p => p.customPermissions).flat().filter(Boolean) as string[];
      
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

      const userRoles = await storage.getUsersByRole('company_admin');
      const userRole = userRoles.find(u => u.id === user.id);
      
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
      changedBy: userId, // Required field
      action,
      targetType: resource,
      oldValue: oldValues ? JSON.stringify(oldValues) : null,
      newValue: newValues ? JSON.stringify(newValues) : null,
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
    const userPerms = await storage.getAllUserPermissions(userId);
    const directPermissions = userPerms.map(p => p.customPermissions).flat().filter(Boolean) as string[];
    
    // Get role-based permissions
    const userRoles = await storage.getUsersByRole('company_admin');
    const userRole = userRoles.find(u => u.id === userId);
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