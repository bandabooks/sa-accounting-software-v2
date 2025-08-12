// Performance optimization utilities for fast dashboard loading
import { db } from "./db";
import { invoices, expenses, customers, bankAccounts, payments } from "@shared/schema";
import { sql, eq, and, ne, desc } from "drizzle-orm";

export class PerformanceOptimizedStorage {
  // Single optimized query for all dashboard stats
  async getFastDashboardStats(companyId: number): Promise<any> {
    try {
      const statsQuery = await db.execute(sql`
        SELECT 
          COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total::numeric ELSE 0 END), 0)::text as total_revenue,
          COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.total::numeric ELSE 0 END), 0)::text as outstanding_invoices,
          COUNT(i.id)::text as invoice_count,
          COALESCE(SUM(e.amount::numeric), 0)::text as total_expenses,
          COUNT(e.id)::text as expense_count,
          COUNT(DISTINCT c.id)::text as total_customers,
          COALESCE(SUM(b.current_balance::numeric), 0)::text as bank_balance,
          COUNT(DISTINCT b.id)::text as account_count
        FROM invoices i
        FULL OUTER JOIN expenses e ON e.company_id = i.company_id
        FULL OUTER JOIN customers c ON c.company_id = i.company_id
        FULL OUTER JOIN bank_accounts b ON b.company_id = i.company_id
        WHERE i.company_id = ${companyId} OR e.company_id = ${companyId} OR c.company_id = ${companyId} OR b.company_id = ${companyId}
      `);

      return statsQuery.rows[0] || {
        total_revenue: "0.00",
        outstanding_invoices: "0.00", 
        total_expenses: "0.00",
        total_customers: "0",
        bank_balance: "0.00"
      };
    } catch (error) {
      console.error("Fast dashboard stats error:", error);
      return {
        total_revenue: "0.00",
        outstanding_invoices: "0.00", 
        total_expenses: "0.00",
        total_customers: "0",
        bank_balance: "0.00"
      };
    }
  }

  // Optimized recent activities query - limit to essential data only
  async getFastRecentActivities(companyId: number): Promise<any[]> {
    try {
      const recentQuery = await db.execute(sql`
        SELECT 
          'invoice'::text as type,
          invoice_number as reference,
          total::text as amount,
          issue_date as date,
          status,
          ('Invoice ' || invoice_number) as description,
          created_at
        FROM invoices 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC 
        LIMIT 6
      `);

      return recentQuery.rows.map(row => ({
        type: row.type,
        reference: row.reference,
        amount: row.amount,
        date: row.date,
        status: row.status,
        description: row.description
      }));
    } catch (error) {
      console.error("Fast recent activities error:", error);
      return [];
    }
  }

  // Fast bank account balances - essential data only
  async getFastBankBalances(companyId: number): Promise<any[]> {
    try {
      if (!companyId) {
        return [];
      }
      
      const balances = await db.execute(sql`
        SELECT 
          id,
          account_name,
          current_balance as balance,
          account_type
        FROM bank_accounts 
        WHERE company_id = ${companyId}
        ORDER BY current_balance DESC
        LIMIT 5
      `);

      return balances.rows.map(row => ({
        id: row.id,
        accountName: row.account_name,
        balance: row.balance,
        accountType: row.account_type
      }));
    } catch (error) {
      console.error("Fast bank balances error:", error);
      return [];
    }
  }

  // Generate monthly profit & loss data
  async getFastProfitLossData(companyId: number): Promise<any[]> {
    try {
      if (!companyId) {
        return [];
      }
      
      // Get monthly data for the last 6 months - Fixed SQL query
      const profitLossData = await db.execute(sql`
        WITH monthly_data AS (
          SELECT 
            DATE_TRUNC('month', i.issue_date)::date as month,
            COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total::numeric ELSE 0 END), 0) as revenue,
            0 as expenses
          FROM invoices i
          WHERE i.company_id = ${companyId}
            AND i.issue_date >= NOW() - INTERVAL '6 months'
            AND i.issue_date IS NOT NULL
          GROUP BY DATE_TRUNC('month', i.issue_date)
          
          UNION ALL
          
          SELECT 
            DATE_TRUNC('month', e.expense_date)::date as month,
            0 as revenue,
            COALESCE(SUM(e.amount::numeric), 0) as expenses
          FROM expenses e
          WHERE e.company_id = ${companyId}
            AND e.expense_date >= NOW() - INTERVAL '6 months'
            AND e.expense_date IS NOT NULL
          GROUP BY DATE_TRUNC('month', e.expense_date)
        )
        SELECT 
          month,
          SUM(revenue) as revenue,
          SUM(expenses) as expenses,
          (SUM(revenue) - SUM(expenses)) as profit
        FROM monthly_data
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6
      `);
      
      return profitLossData.rows.map(row => ({
        month: row.month,
        revenue: parseFloat(row.revenue || '0'),
        expenses: parseFloat(row.expenses || '0'),
        profit: parseFloat(row.profit || '0')
      }));
    } catch (error) {
      console.error("Fast profit loss data error:", error);
      return [];
    }
  }
}

export const fastStorage = new PerformanceOptimizedStorage();