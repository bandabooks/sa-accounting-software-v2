import { Response } from 'express';
import { storage } from './storage';
import { AuthenticatedRequest } from './auth';
import { 
  SYSTEM_MODULES, 
  PERMISSION_TYPES, 
  type SystemModule,
  type PermissionType 
} from '../shared/permissions-matrix';

// Enhanced request interface for permissions matrix endpoints
export interface PermissionsMatrixRequest extends AuthenticatedRequest {
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    companyId?: number;
  };
}

// Enhanced Users API
export async function getEnhancedUsers(req: PermissionsMatrixRequest, res: Response) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get all users with their company associations and permissions
    const users = await storage.getAllUsers();
    
    // Transform users data with enhanced information
    const enhancedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      // Remove sensitive data
      password: undefined,
      twoFactorSecret: undefined
    }));

    res.json(enhancedUsers);
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
    const companyModules = await storage.getActiveCompanyModules(currentUser.companyId || 1);
    
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

    // Transform modules data with default permissions
    const transformedModules = companyModules.map((module: any) => ({
      id: module.id,
      name: module.id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      description: `${module.id.replace(/_/g, ' ')} management and operations`,
      category: 'business',
      isActive: module.is_active,
      permissions: [
        { type: 'view', name: 'View' },
        { type: 'create', name: 'Create' },
        { type: 'edit', name: 'Edit' },
        { type: 'delete', name: 'Delete' }
      ]
    }));

    // Transform permission types
    const transformedPermissionTypes = [
      { id: 'view', name: 'View', description: 'View and read access' },
      { id: 'create', name: 'Create', description: 'Create new records' },
      { id: 'edit', name: 'Edit', description: 'Modify existing records' },
      { id: 'delete', name: 'Delete', description: 'Remove records' }
    ];

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
      companyId: currentUser.companyId || 1,  
      moduleId: moduleId as SystemModule,
      isActive,
      reason,
      updatedBy: currentUser.id
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

    // For now, return a mock response since createCustomRole doesn't exist
    const newRole = {
      id: Date.now(),
      name: roleData.name,
      displayName: roleData.displayName,
      description: roleData.description,
      companyId: currentUser.companyId,
      permissions: roleData.permissions || {},
      isActive: true,
      createdAt: new Date()
    };

    res.json(newRole);
  } catch (error) {
    console.error("Error creating custom role:", error);
    res.status(500).json({ message: "Failed to create custom role" });
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

    // Verify user has permission to update roles
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    await storage.updateRolePermissions(roleId, modulePermissions);

    res.json({ success: true, message: "Role permissions updated successfully" });
  } catch (error) {
    console.error("Error updating role permissions:", error);
    res.status(500).json({ message: "Failed to update role permissions" });
  }
}

// Assign User Role
export async function assignUserRole(req: PermissionsMatrixRequest, res: Response) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { userId, roleId, reason, effectiveDate } = req.body;

    await storage.updateUserRole(parseInt(userId), roleId, {
      assignedBy: currentUser.id,
      reason,
      effectiveDate
    });

    res.json({ success: true, message: "User role assigned successfully" });
  } catch (error) {
    console.error("Error assigning user role:", error);
    res.status(500).json({ message: "Failed to assign user role" });
  }
}

// Helper functions for module and permission categorization
function getModuleCategory(moduleId: string): string {
  const categories = {
    'dashboard': 'Core System',
    'user_management': 'Core System',
    'customers': 'Sales & Revenue',
    'invoicing': 'Sales & Revenue',
    'products_services': 'Inventory & Products',
    'expenses': 'Financial Management',
    'suppliers': 'Purchases & Expenses',
    'pos_sales': 'Point of Sale',
    'chart_of_accounts': 'Financial Management',
    'journal_entries': 'Financial Management',
    'banking': 'Financial Management',
    'financial_reports': 'Financial Management'
  };
  return categories[moduleId as keyof typeof categories] || 'Other';
}

function getPermissionDescription(permType: string): string {
  const descriptions = {
    'view': 'Can view and read data',
    'create': 'Can create new records',
    'edit': 'Can modify existing records',
    'delete': 'Can delete records',
    'manage': 'Full administrative access',
    'approve': 'Can approve transactions'
  };
  return descriptions[permType as keyof typeof descriptions] || 'Permission access';
}

function getModuleDescription(moduleId: string): string {
  return `${moduleId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} module for managing business operations`;
}

function isModuleCore(moduleId: string): boolean {
  const coreModules = ['dashboard', 'user_management', 'chart_of_accounts'];
  return coreModules.includes(moduleId);
}

function getModuleDependencies(moduleId: string): string[] {
  const dependencies = {
    'invoicing': ['customers'],
    'pos_sales': ['products_services', 'customers'],
    'journal_entries': ['chart_of_accounts'],
    'financial_reports': ['chart_of_accounts']
  };
  return dependencies[moduleId as keyof typeof dependencies] || [];
}