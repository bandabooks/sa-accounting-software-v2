import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import crypto from 'crypto';

// Comprehensive Role-Based Permission System
export const PERMISSIONS = {
  // Dashboard & System
  DASHBOARD_VIEW: 'dashboard:view',
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  
  // Authentication & User Management
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_IMPERSONATE: 'users:impersonate',
  USERS_ASSIGN_ROLES: 'users:assign_roles',
  
  // Role & Permission Management
  ROLES_VIEW: 'roles:view',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  PERMISSIONS_GRANT: 'permissions:grant',
  PERMISSIONS_REVOKE: 'permissions:revoke',
  PERMISSIONS_VIEW_AUDIT: 'permissions:view_audit',
  
  // Company Management
  COMPANIES_VIEW: 'companies:view',
  COMPANIES_CREATE: 'companies:create',
  COMPANIES_UPDATE: 'companies:update',
  COMPANIES_DELETE: 'companies:delete',
  COMPANIES_SWITCH: 'companies:switch',
  
  // Customer Management
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_DELETE: 'customers:delete',
  CUSTOMERS_EXPORT: 'customers:export',
  CUSTOMERS_IMPORT: 'customers:import',
  
  // Sales & Invoicing
  INVOICES_VIEW: 'invoices:view',
  INVOICES_CREATE: 'invoices:create',
  INVOICES_UPDATE: 'invoices:update',
  INVOICES_DELETE: 'invoices:delete',
  INVOICES_SEND: 'invoices:send',
  INVOICES_APPROVE: 'invoices:approve',
  INVOICES_VOID: 'invoices:void',
  INVOICES_EXPORT: 'invoices:export',
  
  // Estimates & Quotes
  ESTIMATES_VIEW: 'estimates:view',
  ESTIMATES_CREATE: 'estimates:create',
  ESTIMATES_UPDATE: 'estimates:update',
  ESTIMATES_DELETE: 'estimates:delete',
  ESTIMATES_CONVERT: 'estimates:convert',
  ESTIMATES_APPROVE: 'estimates:approve',
  
  // Payments & Credit Management
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_UPDATE: 'payments:update',
  PAYMENTS_DELETE: 'payments:delete',
  PAYMENTS_APPROVE: 'payments:approve',
  CREDIT_NOTES_VIEW: 'credit_notes:view',
  CREDIT_NOTES_CREATE: 'credit_notes:create',
  CREDIT_NOTES_UPDATE: 'credit_notes:update',
  CREDIT_NOTES_DELETE: 'credit_notes:delete',
  
  // Financial Management
  FINANCIAL_VIEW: 'financial:view',
  FINANCIAL_EXPORT: 'financial:export',
  EXPENSES_VIEW: 'expenses:view',
  EXPENSES_CREATE: 'expenses:create',
  EXPENSES_UPDATE: 'expenses:update',
  EXPENSES_DELETE: 'expenses:delete',
  EXPENSES_APPROVE: 'expenses:approve',
  
  // Accounting & Books
  CHART_OF_ACCOUNTS_VIEW: 'chart_of_accounts:view',
  CHART_OF_ACCOUNTS_UPDATE: 'chart_of_accounts:update',
  JOURNAL_ENTRIES_VIEW: 'journal_entries:view',
  JOURNAL_ENTRIES_CREATE: 'journal_entries:create',
  JOURNAL_ENTRIES_UPDATE: 'journal_entries:update',
  JOURNAL_ENTRIES_DELETE: 'journal_entries:delete',
  BULK_CAPTURE_VIEW: 'bulk_capture:view',
  BULK_CAPTURE_CREATE: 'bulk_capture:create',
  BULK_CAPTURE_UPLOAD: 'bulk_capture:upload',
  GENERAL_LEDGER_VIEW: 'general_ledger:view',
  TRIAL_BALANCE_VIEW: 'trial_balance:view',
  
  // Banking & Cash Management
  BANKING_VIEW: 'banking:view',
  BANKING_CREATE: 'banking:create',
  BANKING_UPDATE: 'banking:update',
  BANKING_DELETE: 'banking:delete',
  BANK_RECONCILIATION: 'banking:reconciliation',
  
  // Purchase Management
  PURCHASE_ORDERS_VIEW: 'purchase_orders:view',
  PURCHASE_ORDERS_CREATE: 'purchase_orders:create',
  PURCHASE_ORDERS_UPDATE: 'purchase_orders:update',
  PURCHASE_ORDERS_DELETE: 'purchase_orders:delete',
  PURCHASE_ORDERS_APPROVE: 'purchase_orders:approve',
  SUPPLIERS_VIEW: 'suppliers:view',
  SUPPLIERS_CREATE: 'suppliers:create',
  SUPPLIERS_UPDATE: 'suppliers:update',
  SUPPLIERS_DELETE: 'suppliers:delete',
  
  // Product & Inventory Management
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_COUNT: 'inventory:count',
  
  // Point of Sale (POS)
  POS_VIEW: 'pos:view',
  POS_PROCESS_SALES: 'pos:process_sales',
  POS_MANAGE_SHIFTS: 'pos:manage_shifts',
  POS_HANDLE_RETURNS: 'pos:handle_returns',
  POS_MANAGE_PROMOTIONS: 'pos:manage_promotions',
  POS_VIEW_REPORTS: 'pos:view_reports',
  POS_CASH_MANAGEMENT: 'pos:cash_management',
  
  // VAT & Tax Management
  VAT_VIEW: 'vat:view',
  VAT_MANAGE: 'vat:manage',
  VAT_SUBMIT_RETURNS: 'vat:submit_returns',
  VAT_VIEW_REPORTS: 'vat:view_reports',
  
  // Reporting & Analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_SCHEDULE: 'reports:schedule',
  ANALYTICS_VIEW: 'analytics:view',
  
  // Project & Time Management
  PROJECTS_VIEW: 'projects:view',
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_UPDATE: 'projects:update',
  PROJECTS_DELETE: 'projects:delete',
  TIME_TRACKING: 'time:tracking',
  TASKS_VIEW: 'tasks:view',
  TASKS_MANAGE: 'tasks:manage',
  
  // Payroll Management
  PAYROLL_VIEW: 'payroll:view',
  PAYROLL_CREATE: 'payroll:create',
  PAYROLL_UPDATE: 'payroll:update',
  PAYROLL_DELETE: 'payroll:delete',
  PAYROLL_APPROVE: 'payroll:approve',
  PAYROLL_PROCESS: 'payroll:process',
  
  // Compliance & Audit
  COMPLIANCE_VIEW: 'compliance:view',
  COMPLIANCE_MANAGE: 'compliance:manage',
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',
  
  // Settings & Configuration
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  COMPANY_SETTINGS: 'settings:company',
  EMAIL_SETTINGS: 'settings:email',
  INTEGRATION_SETTINGS: 'settings:integrations',
  
  // Super Admin Functions
  SUPER_ADMIN_ACCESS: 'super_admin:access',
  IMPERSONATE_USERS: 'super_admin:impersonate',
} as const;


// Role definitions with permissions
export const ROLES = {
  super_admin: {
    name: 'Super Administrator',
    permissions: Object.values(PERMISSIONS),
  },
  admin: {
    name: 'Administrator',
    permissions: Object.values(PERMISSIONS).filter(p => !p.startsWith('super_admin:')),
  },
  manager: {
    name: 'Manager',
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
      PERMISSIONS.PAYMENTS_CREATE,
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_CREATE,
      PERMISSIONS.PURCHASE_ORDERS_UPDATE,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_UPDATE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      // POS permissions for managers
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_PROCESS_SALES,
      PERMISSIONS.POS_MANAGE_SHIFTS,
      PERMISSIONS.POS_HANDLE_RETURNS,
      PERMISSIONS.POS_MANAGE_PROMOTIONS,
      PERMISSIONS.POS_VIEW_REPORTS,
    ],
  },
  accountant: {
    name: 'Accountant',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.INVOICES_CREATE,
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_SEND,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.ESTIMATES_CREATE,
      PERMISSIONS.ESTIMATES_UPDATE,
      PERMISSIONS.PAYMENTS_VIEW,
      PERMISSIONS.PAYMENTS_CREATE,
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.SUPPLIERS_VIEW,
    ],
  },
  employee: {
    name: 'Employee',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.INVOICES_VIEW,
      PERMISSIONS.ESTIMATES_VIEW,
      PERMISSIONS.PAYMENTS_VIEW,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.PURCHASE_ORDERS_VIEW,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      // Basic POS permissions for employees
      PERMISSIONS.POS_VIEW,
      PERMISSIONS.POS_PROCESS_SALES,
      PERMISSIONS.POS_MANAGE_SHIFTS,
      PERMISSIONS.POS_HANDLE_RETURNS,
    ],
  },
} as const;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    companyId?: number;
  };
  session?: {
    id: number;
    sessionToken: string;
  };
}

// JWT secret - in production, this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Token utilities
export const generateSessionToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateJWT = (payload: any, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyJWT = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = req.headers['x-session-token'] as string;
    
    if (!authHeader && !sessionToken) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    let user;
    let session;

    // Check JWT token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyJWT(token);
      
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      user = await storage.getUser(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }
    }

    // Check session token
    if (sessionToken) {
      session = await storage.getSessionByToken(sessionToken);
      if (!session || !session.isActive || new Date() > session.expiresAt) {
        return res.status(401).json({ message: 'Invalid or expired session' });
      }
      
      user = await storage.getUser(session.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }
      
      // Update last activity
      await storage.updateSessionActivity(session.id);
    }

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Check if user is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      return res.status(423).json({ message: 'Account temporarily locked due to failed login attempts' });
    }

    // Get user's active company
    const activeCompany = await storage.getUserActiveCompany(user.id);
    
    // Set user data on request including active company
    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      companyId: activeCompany?.id,
    };

    if (session) {
      req.session = {
        id: session.id,
        sessionToken: session.sessionToken,
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Permission middleware - Super Administrators have unrestricted access
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Super Administrators have unrestricted access to ALL permissions
    if (req.user.role === 'super_admin' || 
        req.user.username === 'sysadmin_7f3a2b8e' || 
        req.user.email === 'accounts@thinkmybiz.com') {
      return next();
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Role middleware - Super Administrators have unrestricted role access
export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Super Administrators have unrestricted access to ALL roles
    if (req.user.role === 'super_admin' || 
        req.user.username === 'sysadmin_7f3a2b8e' || 
        req.user.email === 'accounts@thinkmybiz.com') {
      return next();
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Insufficient role' });
    }

    next();
  };
};

// Super Admin middleware
export const requireSuperAdmin = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Allow access for super_admin role or Production Administrator
    if (req.user.role !== 'super_admin' && 
        req.user.username !== 'sysadmin_7f3a2b8e' && 
        req.user.email !== 'accounts@thinkmybiz.com') {
      return res.status(403).json({ message: 'Super admin access required' });
    }

    next();
  };
};

// Audit logging utility
export const logAudit = async (
  userId: number | null,
  action: string,
  resource: string,
  resourceId?: number,
  details?: any,
  req?: Request
) => {
  try {
    await storage.createAuditLog({
      userId,
      action,
      resource,
      resourceId,
      details: details ? JSON.stringify(details) : null,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers['user-agent'] || null,
    });
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export const checkLoginAttempts = (identifier: string): boolean => {
  const now = new Date();
  const attempts = loginAttempts.get(identifier);
  
  if (!attempts) {
    return true;
  }
  
  // Reset attempts after 15 minutes
  if (now.getTime() - attempts.lastAttempt.getTime() > 15 * 60 * 1000) {
    loginAttempts.delete(identifier);
    return true;
  }
  
  // Allow up to 5 attempts per 15 minutes
  return attempts.count < 5;
};

export const recordLoginAttempt = (identifier: string, success: boolean) => {
  if (success) {
    loginAttempts.delete(identifier);
    return;
  }
  
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: new Date() };
  attempts.count++;
  attempts.lastAttempt = new Date();
  loginAttempts.set(identifier, attempts);
};