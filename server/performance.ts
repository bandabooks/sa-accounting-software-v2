// Performance optimization utilities for fast dashboard loading
import { db } from "./db";
import { invoices, expenses, customers, bankAccounts, payments } from "@shared/schema";
import { sql, eq, and, ne, desc } from "drizzle-orm";

export class PerformanceOptimizedStorage {
  // Single optimized query for all dashboard stats
  async getFastDashboardStats(companyId: number): Promise<any> {
    try {
      // Simplified query with separate CTEs for better performance
      const [invoiceStats, expenseStats, customerStats, bankStats, cashFlowStats, estimateStats] = await Promise.all([
        // Invoice statistics
        db.execute(sql`
          SELECT 
            COALESCE(SUM(CASE WHEN status = 'paid' THEN total::numeric ELSE 0 END), 0)::text as total_revenue,
            COALESCE(SUM(CASE WHEN status != 'paid' THEN total::numeric ELSE 0 END), 0)::text as outstanding_invoices,
            COUNT(CASE WHEN status != 'paid' THEN 1 END) as outstanding_invoice_count,
            COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoice_count,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN vat_amount::numeric ELSE 0 END), 0)::text as vat_due
          FROM invoices 
          WHERE company_id = ${companyId}
        `),
        // Expense statistics
        db.execute(sql`
          SELECT 
            COALESCE(SUM(amount::numeric), 0)::text as total_expenses,
            COUNT(*)::text as expense_count
          FROM expenses 
          WHERE company_id = ${companyId}
        `),
        // Customer count
        db.execute(sql`
          SELECT COUNT(*)::text as total_customers
          FROM customers 
          WHERE company_id = ${companyId}
        `),
        // Bank balance
        db.execute(sql`
          SELECT COALESCE(SUM(current_balance::numeric), 0)::text as bank_balance
          FROM bank_accounts 
          WHERE company_id = ${companyId}
        `),
        // Today's cash flow
        db.execute(sql`
          SELECT 
            COALESCE((
              SELECT SUM(amount::numeric) 
              FROM payments 
              WHERE company_id = ${companyId} 
              AND payment_date::date = CURRENT_DATE
            ), 0)::text as today_inflow,
            COALESCE((
              SELECT SUM(amount::numeric) 
              FROM expenses 
              WHERE company_id = ${companyId} 
              AND expense_date::date = CURRENT_DATE 
              AND is_paid = true
            ), 0)::text as today_outflow
        `),
        // Pending estimates count
        db.execute(sql`
          SELECT COUNT(*)::text as pending_estimates
          FROM estimates 
          WHERE company_id = ${companyId} 
          AND status = 'pending'
        `)
      ]);

      const statsQuery = {
        rows: [{
          ...invoiceStats.rows[0],
          ...expenseStats.rows[0],
          ...customerStats.rows[0],
          ...bankStats.rows[0],
          ...cashFlowStats.rows[0],
          ...estimateStats.rows[0]
        }]
      };

      return statsQuery.rows[0] || {
        total_revenue: "0.00",
        outstanding_invoices: "0.00", 
        total_expenses: "0.00",
        total_customers: "0",
        bank_balance: "0.00",
        vat_due: "0.00",
        pending_estimates: "0",
        outstanding_invoice_count: 0,
        paid_invoice_count: 0,
        today_inflow: "0.00",
        today_outflow: "0.00"
      };
    } catch (error) {
      console.error("Fast dashboard stats error:", error);
      return {
        total_revenue: "0.00",
        outstanding_invoices: "0.00", 
        total_expenses: "0.00",
        total_customers: "0",
        bank_balance: "0.00",
        vat_due: "0.00",
        pending_estimates: "0",
        outstanding_invoice_count: 0,
        paid_invoice_count: 0,
        today_inflow: "0.00",
        today_outflow: "0.00"
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