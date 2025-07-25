import { storage } from './storage';

/**
 * Migration script to fix incorrect role assignments
 * Converts incorrectly assigned Super Admin users to Company Admin for their respective companies
 */
export async function migrateIncorrectRoleAssignments(): Promise<void> {
  console.log('🔄 Starting RBAC role migration...');
  
  try {
    // Get all user permissions
    const allUsers = await storage.getAllUsers();
    const superAdminRole = await storage.getSystemRoleByName('super_admin');
    const companyAdminRole = await storage.getSystemRoleByName('company_admin');
    
    if (!superAdminRole || !companyAdminRole) {
      console.log('❌ Required roles not found, skipping migration');
      return;
    }
    
    let migratedCount = 0;
    
    for (const user of allUsers) {
      // Skip the actual system admin
      if (user.username === 'sysadmin_7f3a2b8e' || user.email === 'bandabookkeepers@gmail.com') {
        console.log(`⏭️  Skipping system admin: ${user.username}`);
        continue;
      }
      
      // Get all companies this user has permissions for
      const companies = await storage.getAllCompanies();
      
      for (const company of companies) {
        const userPermission = await storage.getUserPermission(user.id, company.id);
        
        if (userPermission && userPermission.systemRoleId === superAdminRole.id) {
          // Check if this user is the owner of this company
          try {
            const userCompanies = await storage.getUserCompanies(user.id);
            const isOwnerOfThisCompany = userCompanies.some(uc => 
              uc.companyId === company.id && uc.role === 'owner'
            );
            
            if (isOwnerOfThisCompany) {
              // Convert Super Admin to Company Admin for company owners
              await storage.updateUserPermission(userPermission.id, {
                systemRoleId: companyAdminRole.id,
              });
              
              console.log(`✅ Migrated ${user.username} from Super Admin to Company Admin for ${company.name}`);
              migratedCount++;
            } else {
              // For non-owners with Super Admin, remove their permissions (they shouldn't have access)
              await storage.deleteUserPermission(userPermission.id);
              console.log(`🔒 Removed unauthorized Super Admin access for ${user.username} from ${company.name}`);
              migratedCount++;
            }
          } catch (error) {
            console.error(`❌ Error processing ${user.username} for company ${company.name}:`, error);
          }
        }
      }
    }
    
    console.log(`✅ Migration completed successfully! ${migratedCount} role assignments corrected.`);
  } catch (error) {
    console.error('❌ RBAC migration failed:', error);
    throw error;
  }
}

/**
 * Audit current role assignments to identify security issues
 */
export async function auditCurrentRoleAssignments(): Promise<void> {
  console.log('🔍 Starting RBAC role audit...');
  
  try {
    const allUsers = await storage.getAllUsers();
    const superAdminRole = await storage.getSystemRoleByName('super_admin');
    const companyAdminRole = await storage.getSystemRoleByName('company_admin');
    
    if (!superAdminRole || !companyAdminRole) {
      console.log('❌ Required roles not found, skipping audit');
      return;
    }
    
    console.log('\n📊 RBAC Security Audit Report');
    console.log('================================');
    
    let superAdminCount = 0;
    let companyAdminCount = 0;
    let inappropriateSuperAdmins = [];
    
    for (const user of allUsers) {
      const companies = await storage.getAllCompanies();
      
      for (const company of companies) {
        const userPermission = await storage.getUserPermission(user.id, company.id);
        
        if (userPermission) {
          if (userPermission.systemRoleId === superAdminRole.id) {
            superAdminCount++;
            
            // Check if this is a legitimate Super Admin
            if (user.username !== 'sysadmin_7f3a2b8e' && user.email !== 'bandabookkeepers@gmail.com') {
              inappropriateSuperAdmins.push({
                username: user.username,
                email: user.email,
                company: company.name
              });
            }
          } else if (userPermission.systemRoleId === companyAdminRole.id) {
            companyAdminCount++;
          }
        }
      }
    }
    
    console.log(`🔑 Total Super Admin assignments: ${superAdminCount}`);
    console.log(`👔 Total Company Admin assignments: ${companyAdminCount}`);
    
    if (inappropriateSuperAdmins.length > 0) {
      console.log(`\n⚠️  SECURITY ISSUES FOUND:`);
      console.log(`${inappropriateSuperAdmins.length} users have inappropriate Super Admin access:`);
      inappropriateSuperAdmins.forEach(admin => {
        console.log(`   - ${admin.username} (${admin.email}) in ${admin.company}`);
      });
    } else {
      console.log('\n✅ No security issues found - all Super Admin assignments are appropriate');
    }
    
    console.log('\n================================\n');
  } catch (error) {
    console.error('❌ RBAC audit failed:', error);
    throw error;
  }
}