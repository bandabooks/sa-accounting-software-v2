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
      const result = await db.execute(sql.raw(`
        WITH revenue_stats AS (
          SELECT 
            COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue,
            COALESCE(SUM(CASE WHEN status = 'sent' OR status = 'overdue' THEN total_amount ELSE 0 END), 0) as outstanding_invoices,
            COUNT(CASE WHEN status = 'sent' OR status = 'overdue' THEN 1 END) as outstanding_invoice_count,
            COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoice_count
          FROM invoices 
          WHERE company_id = ${companyId}
        ),
        expense_stats AS (
          SELECT COALESCE(SUM(total_amount), 0) as total_expenses
          FROM expenses 
          WHERE company_id = ${companyId}
        ),
        customer_stats AS (
          SELECT COUNT(*) as total_customers
          FROM customers 
          WHERE company_id = ${companyId}
        ),
        bank_stats AS (
          SELECT 
            COALESCE(SUM(
              COALESCE(jel.debit_amount, 0) - COALESCE(jel.credit_amount, 0)
            ), 0) as bank_balance
          FROM chart_of_accounts coa
          LEFT JOIN journal_entry_lines jel ON jel.account_id = coa.id
          LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id AND je.is_posted = true
          WHERE coa.company_id = ${companyId} 
            AND coa.account_type = 'Asset'
            AND coa.account_code >= '1110' 
            AND coa.account_code <= '1199'
            AND coa.is_active = true
        ),
        estimate_stats AS (
          SELECT COUNT(CASE WHEN status = 'sent' THEN 1 END) as pending_estimates
          FROM estimates 
          WHERE company_id = ${companyId}
        ),
        cash_flow_stats AS (
          SELECT 
            COALESCE(SUM(CASE WHEN p.payment_date = CURRENT_DATE THEN p.amount ELSE 0 END), 0) as today_inflow,
            COALESCE(SUM(CASE WHEN e.expense_date = CURRENT_DATE THEN e.total_amount ELSE 0 END), 0) as today_outflow
          FROM payments p
          FULL OUTER JOIN expenses e ON e.company_id = p.company_id
          WHERE COALESCE(p.company_id, e.company_id) = ${companyId}
        )
        SELECT 
          r.total_revenue,
          r.outstanding_invoices,
          r.outstanding_invoice_count,
          r.paid_invoice_count,
          e.total_expenses,
          c.total_customers,
          b.bank_balance,
          es.pending_estimates,
          cf.today_inflow,
          cf.today_outflow,
          0 as vat_due
        FROM revenue_stats r
        CROSS JOIN expense_stats e  
        CROSS JOIN customer_stats c
        CROSS JOIN bank_stats b
        CROSS JOIN estimate_stats es
        CROSS JOIN cash_flow_stats cf
      `));

      return result.rows[0] || {
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
      const result = await db.execute(sql.raw(`
        (SELECT 
          'invoice' as type,
          'Invoice ' || invoice_number || ' created' as description,
          created_at as date,
          total_amount as amount
        FROM invoices 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
        LIMIT 5)
        
        UNION ALL
        
        (SELECT 
          'payment' as type,
          'Payment received: R' || amount as description,
          payment_date as date,
          amount
        FROM payments 
        WHERE company_id = ${companyId}
        ORDER BY payment_date DESC
        LIMIT 5)
        
        UNION ALL
        
        (SELECT 
          'expense' as type,
          'Expense: ' || COALESCE(description, 'No description') as description,
          expense_date as date,
          total_amount as amount
        FROM expenses 
        WHERE company_id = ${companyId}
        ORDER BY expense_date DESC
        LIMIT 5)
        
        ORDER BY date DESC
        LIMIT 10
      `));

      return result.rows || [];
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
      const result = await db.execute(sql.raw(`
        SELECT 
          coa.id,
          coa.account_name as name,
          coa.account_code,
          COALESCE(SUM(
            COALESCE(jel.debit_amount, 0) - COALESCE(jel.credit_amount, 0)
          ), 0) as balance,
          'ZAR' as currency
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel ON jel.account_id = coa.id
        LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id AND je.is_posted = true
        WHERE coa.company_id = ${companyId}
          AND coa.account_type = 'Asset'
          AND coa.account_code >= '1110' 
          AND coa.account_code <= '1199'
          AND coa.is_active = true
        GROUP BY coa.id, coa.account_name, coa.account_code
        ORDER BY coa.account_code
      `));

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
      const result = await db.execute(sql.raw(`
        WITH monthly_data AS (
          SELECT 
            DATE_TRUNC('month', i.invoice_date) as month,
            COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as revenue,
            0 as expenses
          FROM invoices i
          WHERE i.company_id = ${companyId}
            AND i.invoice_date >= CURRENT_DATE - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', i.invoice_date)
          
          UNION ALL
          
          SELECT 
            DATE_TRUNC('month', e.expense_date) as month,
            0 as revenue,
            COALESCE(SUM(e.total_amount), 0) as expenses
          FROM expenses e
          WHERE e.company_id = ${companyId}
            AND e.expense_date >= CURRENT_DATE - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', e.expense_date)
        )
        SELECT 
          TO_CHAR(month, 'Mon YY') as month,
          SUM(revenue) as revenue,
          SUM(expenses) as expenses,
          SUM(revenue) - SUM(expenses) as profit
        FROM monthly_data
        GROUP BY month
        ORDER BY month
      `));

      return result.rows || [];
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
          COALESCE(SUM(total_amount), 0) as total_value,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_value,
          COALESCE(SUM(CASE WHEN status = 'sent' OR status = 'overdue' THEN total_amount ELSE 0 END), 0) as outstanding_value,
          COALESCE(AVG(total_amount), 0) as average_invoice_value
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
          COALESCE(SUM(CASE WHEN i.status = 'sent' OR i.status = 'overdue' THEN i.total_amount ELSE 0 END), 0) as outstanding_balance
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