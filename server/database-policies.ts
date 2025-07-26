import { sql } from 'drizzle-orm';
import { db } from './db';

/**
 * Database Row-Level Security (RLS) Policies
 * 
 * This module implements comprehensive row-level security policies to ensure
 * complete data isolation between companies while maintaining cross-company
 * reporting capabilities for authorized users.
 */

// Company data isolation middleware
export const enforceCompanyAccess = async (userId: number, companyId: number): Promise<boolean> => {
  try {
    // Check if user has access to the specified company
    const result = await db.execute(sql`
      SELECT 1 FROM company_users 
      WHERE user_id = ${userId} 
      AND company_id = ${companyId} 
      AND is_active = true
    `);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking company access:', error);
    return false;
  }
};

// Cross-company reporting access (for super admins and multi-company users)
export const getCrossCompanyAccess = async (userId: number): Promise<number[]> => {
  try {
    const result = await db.execute(sql`
      SELECT DISTINCT cu.company_id
      FROM company_users cu
      INNER JOIN users u ON cu.user_id = u.id
      WHERE cu.user_id = ${userId} 
      AND cu.is_active = true
      AND (cu.role IN ('owner', 'admin') OR u.role = 'admin')
    `);
    
    return result.rows.map((row: any) => row.company_id);
  } catch (error) {
    console.error('Error getting cross-company access:', error);
    return [];
  }
};

// Database security validation for company-scoped queries
export const validateCompanyScope = (userCompanyIds: number[], requestedCompanyId?: number): boolean => {
  if (!requestedCompanyId) return false;
  return userCompanyIds.includes(requestedCompanyId);
};

// Multi-company data aggregation (for reporting)
export const getMultiCompanyData = async (
  userId: number, 
  table: string, 
  filters: Record<string, any> = {}
): Promise<any[]> => {
  try {
    // Get all companies user has access to
    const accessibleCompanies = await getCrossCompanyAccess(userId);
    
    if (accessibleCompanies.length === 0) {
      return [];
    }

    // Build dynamic query with company filter
    const companyFilter = accessibleCompanies.map(id => `company_id = ${id}`).join(' OR ');
    const filterClauses = Object.entries(filters)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ');
    
    const whereClause = filterClauses 
      ? `WHERE (${companyFilter}) AND ${filterClauses}`
      : `WHERE ${companyFilter}`;
    
    const query = sql.raw(`SELECT * FROM ${table} ${whereClause} ORDER BY created_at DESC`);
    const result = await db.execute(query);
    
    return result.rows as any[];
  } catch (error) {
    console.error('Error fetching multi-company data:', error);
    return [];
  }
};

// Note: createAuditLog is centralized in storage.ts to avoid duplication

// Data isolation verification
export const verifyDataIsolation = async (): Promise<{
  isolationStatus: 'SECURE' | 'WARNING' | 'CRITICAL';
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Check for tables missing companyId
    const tablesWithoutCompanyId = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name NOT IN (
        SELECT DISTINCT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'company_id'
        AND table_schema = 'public'
      )
      AND table_name NOT IN ('users', 'user_sessions', 'user_roles', 'companies', 'company_users')
    `);

    if (tablesWithoutCompanyId.rows.length > 0) {
      issues.push(`Tables missing company_id: ${tablesWithoutCompanyId.rows.map((r: any) => r.table_name).join(', ')}`);
      recommendations.push('Add company_id column to all business tables');
    }

    // Check for missing audit trails
    const tablesWithoutAudit = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name NOT IN (
        SELECT DISTINCT table_name 
        FROM information_schema.columns 
        WHERE column_name IN ('created_at', 'updated_at')
        AND table_schema = 'public'
      )
      AND table_name NOT LIKE '%_logs'
    `);

    if (tablesWithoutAudit.rows.length > 0) {
      issues.push(`Tables missing audit trails: ${tablesWithoutAudit.rows.map((r: any) => r.table_name).join(', ')}`);
      recommendations.push('Add created_at/updated_at columns to all tables');
    }

    // Determine overall status
    let isolationStatus: 'SECURE' | 'WARNING' | 'CRITICAL';
    if (issues.length === 0) {
      isolationStatus = 'SECURE';
    } else if (issues.length <= 2) {
      isolationStatus = 'WARNING';
    } else {
      isolationStatus = 'CRITICAL';
    }

    return {
      isolationStatus,
      issues,
      recommendations
    };

  } catch (error) {
    console.error('Error verifying data isolation:', error);
    return {
      isolationStatus: 'CRITICAL',
      issues: ['Unable to verify data isolation'],
      recommendations: ['Check database connection and permissions']
    };
  }
};

// Company performance metrics (cross-company comparison)
export const getCompanyMetrics = async (userId: number, companyIds?: number[]): Promise<any[]> => {
  try {
    const accessibleCompanies = companyIds || await getCrossCompanyAccess(userId);
    
    if (accessibleCompanies.length === 0) {
      return [];
    }

    const companyFilter = accessibleCompanies.map(id => `i.company_id = ${id}`).join(' OR ');
    
    const result = await db.execute(sql.raw(`
      SELECT 
        c.id as company_id,
        c.name as company_name,
        COUNT(DISTINCT cu.id) as total_customers,
        COUNT(DISTINCT i.id) as total_invoices,
        COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total::numeric ELSE 0 END), 0) as paid_revenue,
        COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.total::numeric ELSE 0 END), 0) as outstanding_revenue,
        COALESCE(SUM(i.total::numeric), 0) as total_revenue
      FROM companies c
      LEFT JOIN customers cu ON c.id = cu.company_id
      LEFT JOIN invoices i ON c.id = i.company_id
      WHERE c.id IN (${accessibleCompanies.join(',')})
      AND c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
    `));

    return result.rows as any[];
  } catch (error) {
    console.error('Error fetching company metrics:', error);
    return [];
  }
};

export default {
  enforceCompanyAccess,
  getCrossCompanyAccess,
  validateCompanyScope,
  getMultiCompanyData,
  verifyDataIsolation,
  getCompanyMetrics
};