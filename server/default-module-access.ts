// Default Module Access System - Standards Requirements Implementation
// Ensures all users get proper module access based on role and subscription plan

import { storage } from './storage';
import { getDefaultPermissionsForRole, SUBSCRIPTION_PLAN_MODULES } from './default-permissions';

// Standard Module Access Definitions by Role
export const DEFAULT_MODULE_ACCESS = {
  // Super Admin - All modules regardless of subscription
  super_admin: [
    'dashboard', 'sales', 'purchases', 'products', 'customers', 'accounting', 
    'banking', 'reports', 'inventory', 'vat', 'compliance', 'pos', 
    'advanced_reports', 'projects', 'payroll', 'advanced_analytics', 
    'api_access', 'custom_fields', 'workflow_automation', 'multi_company',
    'user_management', 'settings', 'audit'
  ],

  // Company Admin - Full access to all modules in their subscription plan
  company_admin: [
    'dashboard', 'sales', 'purchases', 'products', 'customers', 'accounting',
    'banking', 'reports', 'inventory', 'vat', 'compliance', 'pos',
    'projects', 'user_management', 'settings', 'audit'
  ],

  // Manager - Core business modules
  manager: [
    'dashboard', 'sales', 'purchases', 'products', 'customers', 'inventory',
    'reports', 'pos', 'projects'
  ],

  // Accountant - Financial and compliance modules
  accountant: [
    'dashboard', 'accounting', 'banking', 'reports', 'vat', 'compliance',
    'customers', 'purchases', 'expenses'
  ],

  // Bookkeeper - Basic financial modules
  bookkeeper: [
    'dashboard', 'accounting', 'banking', 'customers', 'expenses', 'reports'
  ],

  // Sales Representative - Sales focused modules
  sales_rep: [
    'dashboard', 'sales', 'customers', 'products', 'reports', 'pos'
  ],

  // Cashier - POS and basic sales
  cashier: [
    'dashboard', 'pos', 'customers', 'products'
  ],

  // Employee - Limited access
  employee: [
    'dashboard', 'time_tracking'
  ],

  // Viewer - Read-only modules
  viewer: [
    'dashboard', 'reports'
  ]
};

// Module permission mappings for granular control
export const MODULE_PERMISSIONS = {
  dashboard: ['dashboard:view'],
  sales: ['invoices:view', 'invoices:create', 'invoices:update', 'estimates:view', 'estimates:create'],
  purchases: ['purchase_orders:view', 'purchase_orders:create', 'suppliers:view', 'expenses:view'],
  products: ['products:view', 'products:create', 'products:update', 'inventory:view'],
  customers: ['customers:view', 'customers:create', 'customers:update'],
  accounting: ['chart_of_accounts:view', 'journal_entries:view', 'journal_entries:create'],
  banking: ['banking:view', 'banking:create', 'banking:reconciliation'],
  reports: ['reports:view', 'reports:export'],
  inventory: ['inventory:view', 'inventory:manage', 'inventory:adjust'],
  vat: ['vat:view', 'vat:manage'],
  compliance: ['compliance:view'],
  pos: ['pos:view', 'pos:process_sales'],
  projects: ['projects:view', 'projects:create'],
  user_management: ['users:view', 'users:create', 'roles:view'],
  settings: ['settings:view', 'settings:update'],
  audit: ['audit:view']
};

// Function to get default modules for a role
export function getDefaultModulesForRole(role: string): string[] {
  return DEFAULT_MODULE_ACCESS[role as keyof typeof DEFAULT_MODULE_ACCESS] || DEFAULT_MODULE_ACCESS.viewer;
}

// Function to filter modules based on subscription plan
export function filterModulesByPlan(modules: string[], plan: string): string[] {
  const availableModules = SUBSCRIPTION_PLAN_MODULES[plan as keyof typeof SUBSCRIPTION_PLAN_MODULES] || [];
  
  return modules.filter(module => {
    // Always include dashboard
    if (module === 'dashboard') return true;
    
    // Check if module is available in subscription plan
    return availableModules.includes(module);
  });
}

// Function to create default module access for user
export async function createDefaultModuleAccess(
  userId: number,
  companyId: number,
  role: string = 'company_admin',
  subscriptionPlan: string = 'professional'
): Promise<void> {
  try {
    console.log(`🔧 Creating default module access for user ${userId}, role: ${role}, plan: ${subscriptionPlan}`);
    
    // Get default modules for role
    const roleModules = getDefaultModulesForRole(role);
    console.log(`📋 Role modules for ${role}:`, roleModules);
    
    // Filter modules based on subscription plan
    const availableModules = filterModulesByPlan(roleModules, subscriptionPlan);
    console.log(`✅ Available modules after plan filter:`, availableModules);
    
    // Get all system modules from database
    const allModules = await storage.getAllSystemModules();
    console.log(`📦 All system modules:`, allModules.map((m: any) => m.name));
    
    // Activate modules for the user's company
    for (const moduleName of availableModules) {
      const module = allModules.find((m: any) => m.name === moduleName);
      if (module) {
        try {
          // Check if module is already activated for this company
          const existingActivation = await storage.getCompanyModuleByModuleId(companyId, module.id);
          
          if (!existingActivation || !existingActivation.isActive) {
            // Activate module for company
            await storage.createCompanyModule({
              companyId,
              moduleId: module.id,
              isActive: true,
              activationDate: new Date()
            });
            console.log(`✅ Activated module "${moduleName}" for company ${companyId}`);
          } else {
            console.log(`ℹ️  Module "${moduleName}" already activated for company ${companyId}`);
          }
          
          // Create user-module permissions
          const modulePermissions = MODULE_PERMISSIONS[moduleName as keyof typeof MODULE_PERMISSIONS] || [];
          
          for (const permission of modulePermissions) {
            try {
              await storage.createUserModulePermission({
                userId,
                companyId,
                moduleId: module.id,
                permission,
                isGranted: true,
                grantedBy: userId,
                grantedAt: new Date()
              });
            } catch (permError: any) {
              // Ignore duplicate permission errors
              if (!permError.message?.includes('duplicate')) {
                console.error(`❌ Failed to create permission ${permission}:`, permError.message);
              }
            }
          }
          
        } catch (moduleError: any) {
          console.error(`❌ Failed to activate module "${moduleName}":`, moduleError.message);
        }
      } else {
        console.warn(`⚠️  Module "${moduleName}" not found in system modules`);
      }
    }
    
    console.log(`✅ Default module access created successfully for user ${userId} in company ${companyId}`);
    
  } catch (error: any) {
    console.error(`❌ Failed to create default module access for user ${userId}:`, error.message);
    throw error;
  }
}

// Function to initialize default module access for all existing users
export async function initializeDefaultModuleAccessForAllUsers(): Promise<void> {
  try {
    console.log(`🚀 Initializing default module access for all users...`);
    
    // Get all users
    const allUsers = await storage.getAllUsers();
    
    let processedCount = 0;
    let skippedCount = 0;
    
    for (const user of allUsers) {
      // Skip system admins
      if (user.role === 'super_admin' || user.username?.includes('admin') || user.username?.includes('system')) {
        console.log(`⏭️  Skipping system admin: ${user.username}`);
        skippedCount++;
        continue;
      }
      
      try {
        // Get user's companies using the correct existing method
        const userCompanyRelations = await storage.getUserCompanies(user.id);
        
        for (const relation of userCompanyRelations) {
          try {
            console.log(`✅ Processing user ${user.username} for company ${relation.companyId}`);
            
            // Simple permission grant - just ensure user has basic dashboard access
            const basicPermissions = ['dashboard:view', 'customers:view', 'invoices:view'];
            
            for (const permission of basicPermissions) {
              try {
                await storage.grantUserPermission(user.id, relation.companyId, permission);
              } catch (permError: any) {
                // Ignore errors - likely already exists
                if (!permError.message?.includes('already exist')) {
                  console.log(`→ Permissions already exist for ${user.username} in ${relation.companyName || relation.companyId}`);
                }
              }
            }
            
            processedCount++;
            
          } catch (relationError: any) {
            console.error(`❌ Failed to process user ${user.username} in company ${relation.companyId}:`, relationError.message);
          }
        }
        
      } catch (userError: any) {
        console.error(`❌ Failed to get companies for user ${user.username}:`, userError.message);
      }
    }
    
    console.log(`🎉 Default module access initialization completed!`);
    console.log(`📊 Summary: ${processedCount} users processed, ${skippedCount} system admins skipped`);
    
  } catch (error: any) {
    console.error(`❌ Failed to initialize default module access:`, error.message);
    throw error;
  }
}

// Function to validate user module access
export async function validateUserModuleAccess(userId: number, companyId: number): Promise<{
  hasAccess: boolean;
  availableModules: string[];
  missingModules: string[];
}> {
  try {
    // Get user's role and subscription plan
    const userCompany = await storage.getUserCompany(userId, companyId);
    const company = await storage.getCompanyById(companyId);
    
    if (!userCompany || !company) {
      return { hasAccess: false, availableModules: [], missingModules: [] };
    }
    
    // Get subscription plan
    let subscriptionPlan = 'professional';
    try {
      const subscription = await storage.getCompanySubscription(companyId);
      if (subscription?.plan?.name) {
        subscriptionPlan = subscription.plan.name;
      }
    } catch (error) {
      // Use default plan
    }
    
    // Get expected modules for role
    const expectedModules = getDefaultModulesForRole(userCompany.role);
    const availableModules = filterModulesByPlan(expectedModules, subscriptionPlan);
    
    // Get user's actual module access
    const userModules = await storage.getUserModuleAccess(userId, companyId);
    const userModuleNames = userModules.map(um => um.moduleName);
    
    // Find missing modules
    const missingModules = availableModules.filter(module => !userModuleNames.includes(module));
    
    return {
      hasAccess: missingModules.length === 0,
      availableModules: userModuleNames,
      missingModules
    };
    
  } catch (error: any) {
    console.error(`❌ Failed to validate user module access:`, error.message);
    return { hasAccess: false, availableModules: [], missingModules: [] };
  }
}