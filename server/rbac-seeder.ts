import { storage } from './storage';
import { SYSTEM_ROLES } from './rbac';

// Initialize system roles in the database
export async function seedSystemRoles(): Promise<void> {
  console.log('Seeding RBAC system roles...');
  
  try {
    for (const [key, roleData] of Object.entries(SYSTEM_ROLES)) {
      // Check if role already exists
      const existingRole = await storage.getSystemRoleByName(roleData.name);
      
      if (!existingRole) {
        // Create new system role
        await storage.createSystemRole({
          name: roleData.name,
          displayName: roleData.displayName,
          description: roleData.description,
          isSystemRole: true,
          permissions: roleData.permissions,
          level: roleData.level,
        });
        console.log(`✓ Created system role: ${roleData.displayName}`);
      } else {
        // Update existing role permissions
        await storage.updateSystemRole(existingRole.id, {
          permissions: roleData.permissions,
          level: roleData.level,
          description: roleData.description,
        });
        console.log(`✓ Updated system role: ${roleData.displayName}`);
      }
    }
    
    console.log('RBAC system roles seeded successfully!');
  } catch (error) {
    console.error('Error seeding RBAC system roles:', error);
    throw error;
  }
}

// Create default user permissions for existing users
export async function createDefaultUserPermissions(): Promise<void> {
  console.log('Creating default user permissions...');
  
  try {
    // Get all users
    const users = await storage.getAllUsers();
    const companies = await storage.getAllCompanies();
    
    // Get default system roles
    const viewerRole = await storage.getSystemRoleByName('viewer');
    const superAdminRole = await storage.getSystemRoleByName('super_admin');
    
    if (!viewerRole || !superAdminRole) {
      console.log('System roles not found, skipping user permission creation');
      return;
    }
    
    for (const user of users) {
      for (const company of companies) {
        // Check if user already has permissions for this company
        const existingPermission = await storage.getUserPermission(user.id, company.id);
        
        if (!existingPermission) {
          // Determine role based on username/email
          const isAdmin = user.username.includes('admin') || 
                         user.email?.includes('admin') || 
                         user.username === 'sysadmin_7f3a2b8e';
          
          const roleId = isAdmin ? superAdminRole.id : viewerRole.id;
          
          // Create user permission
          await storage.createUserPermission({
            userId: user.id,
            companyId: company.id,
            systemRoleId: roleId,
            companyRoleId: null,
            customPermissions: [],
            deniedPermissions: [],
            isActive: true,
            grantedBy: user.id, // Self-granted for initial setup
          });
          
          console.log(`✓ Created permissions for ${user.username} in ${company.name} (${isAdmin ? 'Super Admin' : 'Viewer'})`);
        }
      }
    }
    
    console.log('Default user permissions created successfully!');
  } catch (error) {
    console.error('Error creating default user permissions:', error);
    throw error;
  }
}