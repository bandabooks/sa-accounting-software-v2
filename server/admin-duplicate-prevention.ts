import { storage } from "./storage";
import type { User } from "@shared/schema";

// Critical admin roles that require duplicate prevention
const CRITICAL_ADMIN_ROLES = [
  'super_admin',
  'system_admin', 
  'company_admin'
] as const;

export interface DuplicateAdminResult {
  hasDuplicates: boolean;
  duplicates: Array<{
    role: string;
    users: Array<{
      id: number;
      username: string;
      email: string;
      companyId?: number;
      companyName?: string;
    }>;
  }>;
  totalDuplicateUsers: number;
}

export interface AdminCreationValidation {
  isValid: boolean;
  error?: string;
  existingUser?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * Validates if a new admin role assignment would create duplicates
 */
export async function validateAdminCreation(
  email: string,
  role: string,
  companyId?: number
): Promise<AdminCreationValidation> {
  try {
    // Check if role is a critical admin role that needs validation
    if (!CRITICAL_ADMIN_ROLES.includes(role as any)) {
      return { isValid: true };
    }

    // For system/super admin roles, check globally
    if (role === 'super_admin' || role === 'system_admin') {
      const existingUsers = await storage.getUsersByRole(role);
      const duplicateByEmail = existingUsers.find(user => user.email === email);
      
      if (duplicateByEmail) {
        return {
          isValid: false,
          error: `Admin user with email "${email}" and role "${role}" already exists.`,
          existingUser: {
            id: duplicateByEmail.id,
            username: duplicateByEmail.username,
            email: duplicateByEmail.email || '',
            role: role
          }
        };
      }

      // For super admin, enforce single instance rule
      if (role === 'super_admin' && existingUsers.length > 0) {
        return {
          isValid: false,
          error: `Only one Super Admin is allowed in the system. Current Super Admin: ${existingUsers[0].username}`,
          existingUser: {
            id: existingUsers[0].id,
            username: existingUsers[0].username,
            email: existingUsers[0].email || '',
            role: role
          }
        };
      }
    }

    // For company admin roles, check within company scope
    if (role === 'company_admin' && companyId) {
      const existingCompanyAdmins = await storage.getCompanyAdminsByCompanyId(companyId);
      const duplicateByEmail = existingCompanyAdmins.find(admin => admin.email === email);
      
      if (duplicateByEmail) {
        return {
          isValid: false,
          error: `Company Admin with email "${email}" already exists in this company.`,
          existingUser: {
            id: duplicateByEmail.id,
            username: duplicateByEmail.username,
            email: duplicateByEmail.email || '',
            role: role
          }
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    console.error('Error validating admin creation:', error);
    return {
      isValid: false,
      error: 'Unable to validate admin creation due to system error.'
    };
  }
}

/**
 * Comprehensive audit of duplicate admin roles across the system
 */
export async function auditDuplicateAdmins(): Promise<DuplicateAdminResult> {
  try {
    const duplicates: DuplicateAdminResult['duplicates'] = [];
    let totalDuplicateUsers = 0;

    // Audit each critical admin role
    for (const role of CRITICAL_ADMIN_ROLES) {
      const users = await storage.getUsersByRole(role);
      
      if (users.length > 1) {
        // For super admin, any multiple is a duplicate
        if (role === 'super_admin') {
          const userDetails = await Promise.all(
            users.map(async (user) => {
              const companies = await storage.getUserCompanies(user.id);
              return {
                id: user.id,
                username: user.username,
                email: user.email || '',
                companyId: companies[0]?.companyId,
                companyName: companies[0]?.companyName
              };
            })
          );

          duplicates.push({
            role,
            users: userDetails
          });
          totalDuplicateUsers += users.length - 1; // All but one are duplicates
        }
        
        // For company admin, group by email and find duplicates
        if (role === 'company_admin') {
          const emailGroups = users.reduce((groups, user) => {
            const email = user.email || '';
            if (!groups[email]) groups[email] = [];
            groups[email].push(user);
            return groups;
          }, {} as Record<string, typeof users>);

          for (const [email, emailUsers] of Object.entries(emailGroups)) {
            if (emailUsers.length > 1) {
              const userDetails = await Promise.all(
                emailUsers.map(async (user) => {
                  const companies = await storage.getUserCompanies(user.id);
                  return {
                    id: user.id,
                    username: user.username,
                    email: user.email || '',
                    companyId: companies[0]?.companyId,
                    companyName: companies[0]?.companyName
                  };
                })
              );

              duplicates.push({
                role: `${role} (${email})`,
                users: userDetails
              });
              totalDuplicateUsers += emailUsers.length - 1;
            }
          }
        }
      }
    }

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates,
      totalDuplicateUsers
    };
  } catch (error) {
    console.error('Error auditing duplicate admins:', error);
    return {
      hasDuplicates: false,
      duplicates: [],
      totalDuplicateUsers: 0
    };
  }
}

/**
 * Resolve duplicate admin by deactivating specified user
 */
export async function resolveDuplicateAdmin(
  userId: number,
  reason: string,
  resolvedBy: number
): Promise<{ success: boolean; message: string }> {
  try {
    // Get user details before deactivation
    const user = await storage.getUser(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // Deactivate the duplicate user
    await storage.updateUserStatus(userId, false);

    // Log the resolution action
    await storage.createAuditLog({
      userId: resolvedBy,
      action: 'admin_duplicate_resolved',
      resource: 'user',
      resourceId: userId,
      details: JSON.stringify({
        resolvedUser: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        reason,
        timestamp: new Date().toISOString()
      }),
      companyId: null // System-level audit
    });

    return {
      success: true,
      message: `Duplicate admin user "${user.username}" has been deactivated and audit log created.`
    };
  } catch (error) {
    console.error('Error resolving duplicate admin:', error);
    return {
      success: false,
      message: 'Failed to resolve duplicate admin due to system error.'
    };
  }
}

/**
 * Get admin role assignment history for audit purposes
 */
export async function getAdminRoleHistory(
  timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'
): Promise<Array<{
  id: number;
  username: string;
  email: string;
  role: string;
  action: string;
  timestamp: string;
  performedBy: string;
  companyName?: string;
}>> {
  try {
    const days = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    }[timeframe];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const auditLogs = await storage.getAuditLogsByActionAndDate(
      ['role_assigned', 'role_removed', 'admin_duplicate_resolved', 'user_created'],
      startDate
    );

    return auditLogs
      .filter(log => {
        const details = log.details as any;
        return details?.role && CRITICAL_ADMIN_ROLES.includes(details.role);
      })
      .map(log => {
        const details = log.details as any;
        return {
          id: parseInt(log.resourceId || '0'),
          username: details.username || details.resolvedUser?.username || 'Unknown',
          email: details.email || details.resolvedUser?.email || '',
          role: details.role || 'Unknown',
          action: log.action,
          timestamp: log.createdAt?.toISOString() || '',
          performedBy: details.performedBy || 'System',
          companyName: details.companyName
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error getting admin role history:', error);
    return [];
  }
}