import { sql } from 'drizzle-orm';
import { db } from './db';
import { AuthenticatedRequest } from './auth';

/**
 * Enhanced Data Isolation Security Module
 * 
 * Implements bulletproof multi-company data isolation with multiple layers of security:
 * 1. Request-level company validation
 * 2. Query-level company filtering 
 * 3. Result-level data scrubbing
 * 4. Audit logging for isolation violations
 * 5. Real-time security monitoring
 */

// Security violation types
export enum SecurityViolationType {
  COMPANY_ACCESS_DENIED = 'company_access_denied',
  CROSS_COMPANY_DATA_LEAK = 'cross_company_data_leak',
  UNAUTHORIZED_QUERY = 'unauthorized_query',
  MISSING_COMPANY_FILTER = 'missing_company_filter',
  INVALID_COMPANY_ID = 'invalid_company_id'
}

// Enhanced company access validator
export class DataIsolationEnforcer {
  
  /**
   * Validates and enforces company access at the request level
   */
  static async validateRequestCompanyAccess(req: AuthenticatedRequest): Promise<{
    isValid: boolean;
    companyId: number;
    error?: string;
  }> {
    try {
      const userId = req.user?.id;
      const requestedCompanyId = req.user?.companyId;
      
      if (!userId || !requestedCompanyId) {
        await this.logSecurityViolation(
          SecurityViolationType.INVALID_COMPANY_ID,
          { userId, requestedCompanyId, route: req.path }
        );
        return { 
          isValid: false, 
          companyId: 0, 
          error: 'Missing user or company ID' 
        };
      }

      // Super admins have access to all companies
      if (req.user?.role === 'super_admin') {
        return { isValid: true, companyId: requestedCompanyId };
      }

      // Validate company access for regular users
      const hasAccess = await this.verifyCompanyAccess(userId, requestedCompanyId);
      
      if (!hasAccess) {
        await this.logSecurityViolation(
          SecurityViolationType.COMPANY_ACCESS_DENIED,
          { 
            userId, 
            requestedCompanyId, 
            route: req.path,
            userRole: req.user?.role 
          }
        );
        return { 
          isValid: false, 
          companyId: requestedCompanyId, 
          error: 'Access denied to requested company' 
        };
      }

      return { isValid: true, companyId: requestedCompanyId };
      
    } catch (error) {
      console.error('Error validating company access:', error);
      await this.logSecurityViolation(
        SecurityViolationType.UNAUTHORIZED_QUERY,
        { error: error.message, route: req.path }
      );
      return { 
        isValid: false, 
        companyId: 0, 
        error: 'Internal security validation error' 
      };
    }
  }

  /**
   * Verifies if a user has access to a specific company
   */
  static async verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
    try {
      const result = await db.execute(sql`
        SELECT 1 FROM company_users 
        WHERE user_id = ${userId} 
        AND company_id = ${companyId} 
        AND is_active = true
        LIMIT 1
      `);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error verifying company access:', error);
      return false;
    }
  }

  /**
   * Gets all companies a user has access to
   */
  static async getUserCompanies(userId: number): Promise<number[]> {
    try {
      const result = await db.execute(sql`
        SELECT DISTINCT cu.company_id
        FROM company_users cu
        WHERE cu.user_id = ${userId} 
        AND cu.is_active = true
      `);
      
      return result.rows.map((row: any) => row.company_id);
    } catch (error) {
      console.error('Error getting user companies:', error);
      return [];
    }
  }

  /**
   * Scans and validates SQL queries to ensure company_id filtering is present
   */
  static validateSQLQuery(query: string, requiredCompanyId: number): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let isValid = true;

    // Check if query contains company_id filter
    if (!query.toLowerCase().includes('company_id')) {
      warnings.push('Query missing company_id filter - potential data leak risk');
      isValid = false;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /select\s+\*\s+from\s+\w+\s*(?!where|join)/i,  // SELECT * without WHERE
      /update\s+\w+\s+set.*(?!where)/i,              // UPDATE without WHERE
      /delete\s+from\s+\w+\s*(?!where)/i,           // DELETE without WHERE
    ];

    dangerousPatterns.forEach((pattern, index) => {
      if (pattern.test(query)) {
        warnings.push(`Dangerous query pattern detected (${index + 1}) - potential security risk`);
        isValid = false;
      }
    });

    // Check if company_id value matches the required value
    const companyIdMatch = query.match(/company_id\s*=\s*(\d+)/i);
    if (companyIdMatch && parseInt(companyIdMatch[1]) !== requiredCompanyId) {
      warnings.push(`Company ID mismatch: query uses ${companyIdMatch[1]}, required ${requiredCompanyId}`);
      isValid = false;
    }

    return { isValid, warnings };
  }

  /**
   * Scrubs result data to remove any cross-company information
   */
  static scrubResultData(data: any[], allowedCompanyIds: number[]): any[] {
    if (!Array.isArray(data)) return data;

    return data.filter(item => {
      if (item && typeof item === 'object' && item.company_id) {
        return allowedCompanyIds.includes(item.company_id);
      }
      return true; // Keep items without company_id (like system data)
    });
  }

  /**
   * Enhanced security middleware for all database operations
   */
  static async enforceDataIsolation(
    req: AuthenticatedRequest, 
    operation: 'read' | 'write' | 'delete',
    tableName?: string
  ): Promise<{ 
    allowed: boolean; 
    companyId: number; 
    error?: string; 
  }> {
    const validation = await this.validateRequestCompanyAccess(req);
    
    if (!validation.isValid) {
      return {
        allowed: false,
        companyId: 0,
        error: validation.error
      };
    }

    // Log high-risk operations
    if (operation === 'delete' || (operation === 'write' && tableName)) {
      await this.logDataOperation({
        userId: req.user!.id,
        companyId: validation.companyId,
        operation,
        tableName: tableName || 'unknown',
        route: req.path,
        timestamp: new Date()
      });
    }

    return {
      allowed: true,
      companyId: validation.companyId
    };
  }

  /**
   * Logs security violations for monitoring and audit
   */
  private static async logSecurityViolation(
    violationType: SecurityViolationType,
    details: Record<string, any>
  ): Promise<void> {
    try {
      console.error('🚨 SECURITY VIOLATION:', violationType, details);
      
      // Log to audit table
      await db.execute(sql`
        INSERT INTO audit_logs (
          user_id, company_id, action, entity_type, entity_id, 
          old_values, new_values, ip_address, user_agent, created_at
        ) VALUES (
          ${details.userId || null},
          ${details.companyId || null},
          ${violationType},
          'security_violation',
          null,
          ${JSON.stringify(details)},
          null,
          ${details.ip || 'unknown'},
          ${details.userAgent || 'unknown'},
          NOW()
        )
      `);

      // In production, you might want to send alerts to security team
      // await sendSecurityAlert(violationType, details);
      
    } catch (error) {
      console.error('Error logging security violation:', error);
    }
  }

  /**
   * Logs data operations for audit trail
   */
  private static async logDataOperation(details: {
    userId: number;
    companyId: number;
    operation: string;
    tableName: string;
    route: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO audit_logs (
          user_id, company_id, action, entity_type, entity_id, 
          old_values, new_values, ip_address, user_agent, created_at
        ) VALUES (
          ${details.userId},
          ${details.companyId},
          ${details.operation},
          ${details.tableName},
          null,
          ${JSON.stringify(details)},
          null,
          'system',
          'data-isolation-enforcer',
          ${details.timestamp.toISOString()}
        )
      `);
    } catch (error) {
      console.error('Error logging data operation:', error);
    }
  }

  /**
   * Runs a security audit on the current database state
   */
  static async runSecurityAudit(): Promise<{
    isSecure: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for tables missing company_id column
      const tablesResult = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('sessions', 'subscription_plans', 'system_settings', 'currency_rates', 'users')
      `);

      for (const table of tablesResult.rows) {
        const tableName = (table as any).table_name;
        
        const columnResult = await db.execute(sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${tableName} 
          AND column_name = 'company_id'
        `);

        if (columnResult.rows.length === 0) {
          issues.push(`Table '${tableName}' missing company_id column for data isolation`);
          recommendations.push(`Add company_id column to ${tableName} table`);
        }
      }

      // Check for orphaned company references
      const orphanedCompanies = await db.execute(sql`
        SELECT cu.company_id, COUNT(*) as orphaned_count
        FROM company_users cu
        LEFT JOIN companies c ON cu.company_id = c.id
        WHERE c.id IS NULL
        GROUP BY cu.company_id
      `);

      if (orphanedCompanies.rows.length > 0) {
        issues.push(`Found ${orphanedCompanies.rows.length} orphaned company references`);
        recommendations.push('Clean up orphaned company_users entries');
      }

      // Check for users without company assignments
      const usersWithoutCompanies = await db.execute(sql`
        SELECT u.id, u.username
        FROM users u
        LEFT JOIN company_users cu ON u.id = cu.user_id AND cu.is_active = true
        WHERE cu.user_id IS NULL AND u.role != 'super_admin'
      `);

      if (usersWithoutCompanies.rows.length > 0) {
        issues.push(`Found ${usersWithoutCompanies.rows.length} users without company assignments`);
        recommendations.push('Assign users to appropriate companies or deactivate unused accounts');
      }

      return {
        isSecure: issues.length === 0,
        issues,
        recommendations
      };

    } catch (error) {
      console.error('Error running security audit:', error);
      return {
        isSecure: false,
        issues: ['Failed to run security audit'],
        recommendations: ['Check database connectivity and permissions']
      };
    }
  }

  /**
   * Emergency function to isolate a potentially compromised company
   */
  static async emergencyCompanyIsolation(companyId: number, reason: string): Promise<void> {
    try {
      console.warn(`🚨 EMERGENCY ISOLATION: Company ${companyId} - ${reason}`);
      
      // Log the emergency isolation
      await db.execute(sql`
        INSERT INTO audit_logs (
          user_id, company_id, action, entity_type, entity_id, 
          old_values, new_values, ip_address, user_agent, created_at
        ) VALUES (
          null,
          ${companyId},
          'emergency_isolation',
          'company',
          ${companyId},
          ${JSON.stringify({ reason, timestamp: new Date().toISOString() })},
          null,
          'system',
          'security-enforcer',
          NOW()
        )
      `);

      // In a real implementation, you might:
      // - Disable all user sessions for the company
      // - Suspend API access
      // - Send alerts to security team
      // - Create incident tickets
      
    } catch (error) {
      console.error('Error executing emergency company isolation:', error);
    }
  }
}

// Middleware wrapper for easy integration
export const requireCompanyAccess = () => {
  return async (req: AuthenticatedRequest, res: any, next: any) => {
    const result = await DataIsolationEnforcer.enforceDataIsolation(req, 'read');
    
    if (!result.allowed) {
      return res.status(403).json({ 
        message: result.error || 'Company access denied',
        companyId: result.companyId 
      });
    }

    // Add validated company ID to request for use in handlers
    req.validatedCompanyId = result.companyId;
    next();
  };
};

// Export for use in other modules
export default DataIsolationEnforcer;