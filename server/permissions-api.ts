// Comprehensive Permissions Matrix API Implementation
import { Request, Response } from 'express';
import { storage } from "./storage";
import { SYSTEM_MODULES, PERMISSION_TYPES, ACCOUNTING_ROLES, type SystemModule, type PermissionType } from "@shared/permissions-matrix";

interface PermissionsMatrixRequest extends Request {
  user?: any;
}

// Enhanced User Management API
export async function getEnhancedUsers(req: PermissionsMatrixRequest, res: Response) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get all users with enhanced information
    const users = await storage.getAllUsersWithRoleDetails();
    
    // Get role distribution data
    const roles = await storage.getAccountingRoles();
    
    // Calculate statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;
    const lockedUsers = users.filter(u => u.isLocked).length;

    const response = {
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role,
        roleDisplayName: user.roleDisplayName,
        roleLevel: user.roleLevel,
        roleColor: user.roleColor,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        loginAttempts: user.loginAttempts || 0,
        isLocked: user.isLocked || false,
        assignedModules: user.assignedModules || [],
        customPermissions: user.customPermissions || [],
        notes: user.notes
      })),
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        level: role.level,
        color: role.color,
        currentUsers: users.filter(u => u.role === role.id).length,
        maxUsers: role.maxUsers,
        securityLevel: role.securityLevel
      })),
      totalUsers,
      activeUsers,
      inactiveUsers,
      lockedUsers
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching enhanced users:", error);
    res.status(500).json({ message: "Failed to fetch enhanced users" });
  }
}

// Permissions Matrix API
export async function getPermissionsMatrix(req: PermissionsMatrixRequest, res: Response) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get all roles with their permissions
    const roles = await storage.getRolesWithPermissions();
    
    // Get active modules for the company
    const companyModules = await storage.getActiveCompanyModules(currentUser.companyId);
    
    // Transform roles data
    const transformedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      color: role.color,
      icon: role.icon,
      isSystemRole: role.isSystemRole,
      maxUsers: role.maxUsers,
      securityLevel: role.securityLevel,
      currentUsers: role.currentUsers || 0,
      permissions: role.permissions || {}
    }));

    // Transform modules data
    const transformedModules = Object.values(SYSTEM_MODULES).map(moduleId => {
      const moduleConfig = companyModules.find(m => m.id === moduleId);
      return {
        id: moduleId,
        name: moduleId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: getModuleCategory(moduleId),
        isActive: moduleConfig?.isActive || false
      };
    });

    // Transform permission types
    const transformedPermissionTypes = Object.values(PERMISSION_TYPES).map(permType => ({
      id: permType,
      name: permType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: getPermissionDescription(permType)
    }));

    const response = {
      roles: transformedRoles,
      modules: transformedModules,
      permissionTypes: transformedPermissionTypes
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching permissions matrix:", error);
    res.status(500).json({ message: "Failed to fetch permissions matrix" });
  }
}

// Company Module Settings API
export async function getCompanyModules(req: PermissionsMatrixRequest, res: Response) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get company module settings
    const moduleSettings = await storage.getCompanyModuleSettings(currentUser.companyId);
    
    // Transform modules with categories and dependencies
    const modules = Object.values(SYSTEM_MODULES).map(moduleId => {
      const setting = moduleSettings.find(s => s.moduleId === moduleId);
      return {
        id: moduleId,
        name: moduleId,
        displayName: moduleId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: getModuleDescription(moduleId),
        category: getModuleCategory(moduleId),
        icon: moduleId,
        isActive: setting?.isActive || false,
        isCore: isModuleCore(moduleId),
        dependencies: getModuleDependencies(moduleId),
        activatedDate: setting?.activatedDate,
        activatedBy: setting?.activatedBy
      };
    });

    // Group modules by category
    const modulesByCategory = modules.reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    }, {} as Record<string, any[]>);

    const response = {
      companyId: currentUser.companyId,
      totalModules: modules.length,
      activeModules: modules.filter(m => m.isActive).length,
      lastUpdated: new Date().toISOString(),
      modules: modules
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching company modules:", error);
    res.status(500).json({ message: "Failed to fetch company modules" });
  }
}

// Toggle Module Activation
export async function toggleModuleActivation(req: PermissionsMatrixRequest, res: Response) {
  try {
    const { moduleId } = req.params;
    const { isActive, reason } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify user has super admin permissions
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: "Super admin access required" });
    }

    // Validate module exists
    if (!Object.values(SYSTEM_MODULES).includes(moduleId as SystemModule)) {
      return res.status(400).json({ message: "Invalid module ID" });
    }

    // Prevent deactivation of core modules
    if (!isActive && isModuleCore(moduleId)) {
      return res.status(400).json({ message: "Core modules cannot be deactivated" });
    }

    // Update module activation status
    await storage.updateCompanyModuleActivation({
      companyId: currentUser.companyId,
      moduleId: moduleId as SystemModule,
      isActive,
      reason,
      updatedBy: currentUser.id
    });

    // Log the action for audit
    await storage.createAuditLog({
      userId: currentUser.id,
      companyId: currentUser.companyId,
      action: isActive ? 'MODULE_ACTIVATED' : 'MODULE_DEACTIVATED',
      resource: moduleId,
      details: { reason },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ 
      success: true, 
      message: `Module ${isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error("Error toggling module activation:", error);
    res.status(500).json({ message: "Failed to update module status" });
  }
}

// Create Custom Role
export async function createCustomRole(req: PermissionsMatrixRequest, res: Response) {
  try {
    const roleData = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate required permissions
    const hasPermission = await storage.checkUserPermission(currentUser.id, 'roles:create');
    if (!hasPermission && currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: "Insufficient permissions to create roles" });
    }

    // Create the role
    const newRole = await storage.createCustomRole({
      ...roleData,
      companyId: currentUser.companyId,
      createdBy: currentUser.id
    });

    // Log the action
    await storage.createAuditLog({
      userId: currentUser.id,
      companyId: currentUser.companyId,
      action: 'ROLE_CREATED',
      resource: `role:${newRole.id}`,
      details: { roleName: roleData.displayName },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating custom role:", error);
    res.status(500).json({ message: "Failed to create role" });
  }
}

// Update Role Permissions
export async function updateRolePermissions(req: PermissionsMatrixRequest, res: Response) {
  try {
    const { roleId } = req.params;
    const { modulePermissions, reason } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate permissions
    const hasPermission = await storage.checkUserPermission(currentUser.id, 'permissions:grant');
    if (!hasPermission && currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: "Insufficient permissions to modify role permissions" });
    }

    // Update role permissions
    await storage.updateRolePermissions(roleId, modulePermissions);

    // Log the action
    await storage.createAuditLog({
      userId: currentUser.id,
      companyId: currentUser.companyId,
      action: 'ROLE_PERMISSIONS_UPDATED',
      resource: `role:${roleId}`,
      details: { reason, updatedPermissions: Object.keys(modulePermissions).length },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: "Role permissions updated successfully" });
  } catch (error) {
    console.error("Error updating role permissions:", error);
    res.status(500).json({ message: "Failed to update role permissions" });
  }
}

// Assign Role to User
export async function assignUserRole(req: PermissionsMatrixRequest, res: Response) {
  try {
    const { userId, roleId, reason, effectiveDate } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate permissions
    const hasPermission = await storage.checkUserPermission(currentUser.id, 'users:assign_roles');
    if (!hasPermission && currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: "Insufficient permissions to assign roles" });
    }

    // Get target user to validate security level
    const targetUser = await storage.getUser(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent demo users from getting super admin role
    if (roleId === 'super_admin' && (targetUser.username.includes('demo') || targetUser.email.includes('demo'))) {
      return res.status(400).json({ message: "Demo users cannot be assigned Super Admin role" });
    }

    // Update user role
    await storage.updateUserRole(userId, roleId, {
      assignedBy: currentUser.id,
      reason,
      effectiveDate
    });

    // Log the action
    await storage.createAuditLog({
      userId: currentUser.id,
      companyId: currentUser.companyId,
      action: 'ROLE_ASSIGNED',
      resource: `user:${userId}`,
      details: { newRole: roleId, reason },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: "Role assigned successfully" });
  } catch (error) {
    console.error("Error assigning user role:", error);
    res.status(500).json({ message: "Failed to assign role" });
  }
}

// Helper Functions
function getModuleCategory(moduleId: string): string {
  const categoryMap = {
    dashboard: 'Core System',
    user_management: 'Core System',
    system_settings: 'Core System',
    audit_logs: 'Core System',
    chart_of_accounts: 'Financial Management',
    journal_entries: 'Financial Management',
    banking: 'Financial Management',
    financial_reports: 'Financial Management',
    customers: 'Sales & Revenue',
    invoicing: 'Sales & Revenue',
    estimates: 'Sales & Revenue',
    recurring_billing: 'Sales & Revenue',
    credit_notes: 'Sales & Revenue',
    suppliers: 'Purchases & Expenses',
    purchase_orders: 'Purchases & Expenses',
    bills: 'Purchases & Expenses',
    expenses: 'Purchases & Expenses',
    supplier_payments: 'Purchases & Expenses',
    products_services: 'Inventory & Products',
    inventory_management: 'Inventory & Products',
    stock_adjustments: 'Inventory & Products',
    product_categories: 'Inventory & Products',
    pos_terminals: 'Point of Sale',
    pos_sales: 'Point of Sale',
    pos_shifts: 'Point of Sale',
    pos_reports: 'Point of Sale',
    pos_loyalty: 'Point of Sale',
    payroll: 'Payroll & HR',
    employees: 'Payroll & HR',
    time_tracking: 'Payroll & HR',
    leave_management: 'Payroll & HR',
    performance: 'Payroll & HR',
    vat_management: 'Tax & Compliance',
    tax_returns: 'Tax & Compliance',
    sars_integration: 'Tax & Compliance',
    cipc_compliance: 'Tax & Compliance',
    labour_compliance: 'Tax & Compliance',
    project_management: 'Advanced Features',
    fixed_assets: 'Advanced Features',
    budgeting: 'Advanced Features',
    cash_flow: 'Advanced Features',
    bank_reconciliation: 'Advanced Features',
    api_access: 'Integration & API',
    third_party_integrations: 'Integration & API',
    data_import_export: 'Integration & API',
    backup_restore: 'Integration & API'
  };
  
  return categoryMap[moduleId as keyof typeof categoryMap] || 'Other';
}

function getModuleDescription(moduleId: string): string {
  const descriptionMap = {
    dashboard: 'Central business overview and analytics',
    user_management: 'Manage user accounts and access',
    system_settings: 'Configure system preferences',
    audit_logs: 'Track system activities and changes',
    chart_of_accounts: 'Manage accounting structure',
    journal_entries: 'Record financial transactions',
    banking: 'Bank account management and reconciliation',
    financial_reports: 'Generate financial statements',
    customers: 'Customer relationship management',
    invoicing: 'Create and manage invoices',
    estimates: 'Quotation and estimate management',
    recurring_billing: 'Automated recurring invoices',
    credit_notes: 'Credit note processing',
    suppliers: 'Supplier management and procurement',
    purchase_orders: 'Purchase order processing',
    bills: 'Supplier bill management',
    expenses: 'Expense tracking and management',
    supplier_payments: 'Supplier payment processing',
    products_services: 'Product and service catalog',
    inventory_management: 'Stock level monitoring',
    stock_adjustments: 'Inventory adjustments and counts',
    product_categories: 'Product categorization',
    pos_terminals: 'Point of sale terminal management',
    pos_sales: 'Process retail sales',
    pos_shifts: 'Staff shift management',
    pos_reports: 'POS analytics and reports',
    pos_loyalty: 'Customer loyalty programs',
    payroll: 'Employee payroll processing',
    employees: 'Employee information management',
    time_tracking: 'Track employee working hours',
    leave_management: 'Manage employee leave requests',
    performance: 'Employee performance tracking',
    vat_management: 'VAT calculation and reporting',
    tax_returns: 'Tax return preparation',
    sars_integration: 'SARS electronic submission',
    cipc_compliance: 'CIPC compliance management',
    labour_compliance: 'Labour law compliance',
    project_management: 'Project tracking and billing',
    fixed_assets: 'Asset management and depreciation',
    budgeting: 'Budget planning and analysis',
    cash_flow: 'Cash flow forecasting',
    bank_reconciliation: 'Automated bank reconciliation',
    api_access: 'Third-party API access',
    third_party_integrations: 'External system integrations',
    data_import_export: 'Data import and export tools',
    backup_restore: 'System backup and restoration'
  };
  
  return descriptionMap[moduleId as keyof typeof descriptionMap] || 'System module';
}

function isModuleCore(moduleId: string): boolean {
  const coreModules = ['dashboard', 'user_management', 'system_settings', 'audit_logs'];
  return coreModules.includes(moduleId);
}

function getModuleDependencies(moduleId: string): string[] {
  const dependencyMap = {
    financial_reports: ['chart_of_accounts', 'journal_entries'],
    bank_reconciliation: ['banking', 'chart_of_accounts'],
    pos_reports: ['pos_sales', 'pos_terminals'],
    vat_management: ['chart_of_accounts', 'invoicing'],
    payroll: ['employees', 'chart_of_accounts'],
    project_management: ['customers', 'invoicing'],
    fixed_assets: ['chart_of_accounts', 'journal_entries']
  };
  
  return dependencyMap[moduleId as keyof typeof dependencyMap] || [];
}

function getPermissionDescription(permType: string): string {
  const descriptionMap = {
    view: 'View and read access to data',
    create: 'Create new records and entries',
    edit: 'Modify existing records',
    delete: 'Remove records permanently',
    approve: 'Approve transactions and workflows',
    export: 'Export data to external formats',
    manage: 'Full management access',
    configure: 'Configure system settings',
    audit: 'Access audit trails and logs'
  };
  
  return descriptionMap[permType as keyof typeof descriptionMap] || 'System permission';
}