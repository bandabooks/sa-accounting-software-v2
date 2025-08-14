import { db } from './db';
import { sql, eq, and, desc, gte, lte, isNotNull } from 'drizzle-orm';
import { 
  invoices, 
  customers, 
  expenses, 
  chartOfAccounts, 
  journalEntries,
  journalEntryLines,
  payments,
  estimates,
  auditLogs,
  bankAccounts
} from '@shared/schema';

/**
 * Fast Storage Layer - Optimized queries for better performance
 * All functions use raw SQL where needed and efficient joins
 */
export class FastStorage {

  /**
   * Get dashboard statistics with a single optimized query
   */
  async getFastDashboardStats(companyId: number) {
    try {
      // Use simple parallel queries like Sales Dashboard for maximum speed
      const [invoices, expenses, customers, estimates] = await Promise.all([
        db.execute(sql`
          SELECT 
            COALESCE(SUM(CASE WHEN status = 'paid' THEN total::numeric ELSE 0 END), 0) as total_revenue,
            COALESCE(SUM(CASE WHEN status != 'paid' THEN total::numeric ELSE 0 END), 0) as outstanding_invoices,
            COUNT(CASE WHEN status != 'paid' THEN 1 END) as outstanding_invoice_count,
            COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoice_count
          FROM invoices 
          WHERE company_id = ${companyId}
        `),
        db.execute(sql`
          SELECT COALESCE(SUM(amount::numeric), 0) as total_expenses
          FROM expenses 
          WHERE company_id = ${companyId}
        `),
        db.execute(sql`
          SELECT COUNT(*) as total_customers
          FROM customers 
          WHERE company_id = ${companyId}
        `),
        db.execute(sql`
          SELECT COUNT(CASE WHEN status = 'sent' THEN 1 END) as pending_estimates
          FROM estimates 
          WHERE company_id = ${companyId}
        `)
      ]);

      const stats = {
        total_revenue: invoices.rows[0]?.total_revenue?.toString() || "0.00",
        outstanding_invoices: invoices.rows[0]?.outstanding_invoices?.toString() || "0.00",
        outstanding_invoice_count: Number(invoices.rows[0]?.outstanding_invoice_count || 0),
        paid_invoice_count: Number(invoices.rows[0]?.paid_invoice_count || 0),
        total_expenses: expenses.rows[0]?.total_expenses?.toString() || "0.00",
        total_customers: customers.rows[0]?.total_customers?.toString() || "0",
        pending_estimates: estimates.rows[0]?.pending_estimates?.toString() || "0",
        bank_balance: "0.00", // Simplified for speed
        vat_due: "0.00", // Simplified for speed
        today_inflow: "0.00", // Simplified for speed
        today_outflow: "0.00" // Simplified for speed
      };

      return stats;
    } catch (error) {
      console.error('Error in getFastDashboardStats:', error);
      return {
        total_revenue: "0.00",
        outstanding_invoices: "0.00",
        total_expenses: "0.00", 
        total_customers: "0",
        bank_balance: "0.00",
        pending_estimates: "0",
        outstanding_invoice_count: 0,
        paid_invoice_count: 0,
        today_inflow: "0.00",
        today_outflow: "0.00",
        vat_due: "0.00"
      };
    }
  }

  /**
   * Get recent activities with optimized query
   */
  async getFastRecentActivities(companyId: number) {
    try {
      // Just get recent invoices for simplicity and speed
      const result = await db.execute(sql`
        SELECT 
          'invoice'::text as type,
          invoice_number as reference,
          total::text as amount,
          issue_date as date,
          status,
          ('Invoice ' || invoice_number || ' - ' || COALESCE(status, 'draft')) as description,
          created_at
        FROM invoices 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC 
        LIMIT 8
      `);

      return result.rows.map(row => ({
        type: row.type,
        reference: row.reference,
        amount: row.amount,
        date: row.date,
        status: row.status,
        description: row.description
      })) || [];
    } catch (error) {
      console.error('Error in getFastRecentActivities:', error);
      return [];
    }
  }

  /**
   * Get bank balances efficiently
   */
  async getFastBankBalances(companyId: number) {
    try {
      // Use simple bank_accounts table for fast results
      const result = await db.execute(sql`
        SELECT 
          id,
          account_name as name,
          account_number as account_code,
          COALESCE(current_balance::numeric, 0) as balance,
          'ZAR' as currency
        FROM bank_accounts
        WHERE company_id = ${companyId}
        ORDER BY current_balance DESC
        LIMIT 10
      `);

      return result.rows || [];
    } catch (error) {
      console.error('Error in getFastBankBalances:', error);
      return [];
    }
  }

  /**
   * Get profit/loss data for charts efficiently
   */
  async getFastProfitLossData(companyId: number) {
    try {
      // Use simple parallel queries for maximum speed
      const [revenue, expenses] = await Promise.all([
        db.execute(sql`
          SELECT 
            TO_CHAR(DATE_TRUNC('month', issue_date), 'Mon DD') as month,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN total::numeric ELSE 0 END), 0) as revenue
          FROM invoices 
          WHERE company_id = ${companyId}
            AND issue_date >= NOW() - INTERVAL '6 months'
            AND issue_date IS NOT NULL
          GROUP BY DATE_TRUNC('month', issue_date)
          ORDER BY DATE_TRUNC('month', issue_date) DESC
          LIMIT 6
        `),
        db.execute(sql`
          SELECT 
            TO_CHAR(DATE_TRUNC('month', expense_date), 'Mon DD') as month,
            COALESCE(SUM(amount::numeric), 0) as expenses
          FROM expenses 
          WHERE company_id = ${companyId}
            AND expense_date >= NOW() - INTERVAL '6 months'
            AND expense_date IS NOT NULL
          GROUP BY DATE_TRUNC('month', expense_date)
          ORDER BY DATE_TRUNC('month', expense_date) DESC
          LIMIT 6
        `)
      ]);

      // Combine revenue and expense data by month
      const monthlyData = new Map();
      
      revenue.rows.forEach(row => {
        monthlyData.set(row.month, { 
          month: row.month, 
          revenue: parseFloat(row.revenue || '0'), 
          expenses: 0 
        });
      });
      
      expenses.rows.forEach(row => {
        const existing = monthlyData.get(row.month);
        if (existing) {
          existing.expenses = parseFloat(row.expenses || '0');
        } else {
          monthlyData.set(row.month, { 
            month: row.month, 
            revenue: 0, 
            expenses: parseFloat(row.expenses || '0')
          });
        }
      });

      return Array.from(monthlyData.values()).map(data => ({
        ...data,
        profit: data.revenue - data.expenses
      }));
    } catch (error) {
      console.error('Error in getFastProfitLossData:', error);
      return [];
    }
  }

  /**
   * Fast invoice statistics
   */
  async getFastInvoiceStats(companyId: number) {
    try {
      const result = await db.execute(sql.raw(`
        SELECT 
          COUNT(*) as total_invoices,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
          COUNT(CASE WHEN status = 'sent' OR status = 'overdue' THEN 1 END) as outstanding_invoices,
          COALESCE(SUM(total), 0) as total_value,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as paid_value,
          COALESCE(SUM(CASE WHEN status = 'sent' OR status = 'overdue' THEN total ELSE 0 END), 0) as outstanding_value,
          COALESCE(AVG(total), 0) as average_invoice_value
        FROM invoices 
        WHERE company_id = ${companyId}
      `));

      return result.rows[0] || {
        total_invoices: 0,
        paid_invoices: 0,
        outstanding_invoices: 0,
        total_value: "0.00",
        paid_value: "0.00", 
        outstanding_value: "0.00",
        average_invoice_value: "0.00"
      };
    } catch (error) {
      console.error('Error in getFastInvoiceStats:', error);
      return {
        total_invoices: 0,
        paid_invoices: 0,
        outstanding_invoices: 0,
        total_value: "0.00",
        paid_value: "0.00",
        outstanding_value: "0.00", 
        average_invoice_value: "0.00"
      };
    }
  }

  /**
   * Fast customer list with minimal data
   */
  async getFastCustomers(companyId: number, limit: number = 50) {
    try {
      const result = await db.execute(sql.raw(`
        SELECT 
          c.id,
          c.name,
          c.email,
          c.phone,
          COALESCE(SUM(CASE WHEN i.status = 'sent' OR i.status = 'overdue' THEN i.total ELSE 0 END), 0) as outstanding_balance
        FROM customers c
        LEFT JOIN invoices i ON i.customer_id = c.id AND i.company_id = c.company_id
        WHERE c.company_id = ${companyId}
        GROUP BY c.id, c.name, c.email, c.phone
        ORDER BY outstanding_balance DESC, c.name
        LIMIT ${limit}
      `));

      return result.rows || [];
    } catch (error) {
      console.error('Error in getFastCustomers:', error);
      return [];
    }
  }

  /**
   * Fast permission check for users
   */
  async getFastUserPermissions(userId: number, companyId: number) {
    try {
      const result = await db.execute(sql.raw(`
        SELECT DISTINCT up.permission_name
        FROM user_permissions up
        WHERE up.user_id = ${userId} AND up.company_id = ${companyId}
        
        UNION
        
        SELECT DISTINCT sr.permissions
        FROM company_users cu
        JOIN system_roles sr ON sr.id = cu.role_id  
        WHERE cu.user_id = ${userId} AND cu.company_id = ${companyId}
      `));

      return result.rows.map(row => row.permission_name || row.permissions).filter(Boolean);
    } catch (error) {
      console.error('Error in getFastUserPermissions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const fastStorage = new FastStorage();