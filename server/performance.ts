// Performance optimization utilities for fast dashboard loading
import { db } from "./db";
import { invoices, expenses, customers, bankAccounts, payments } from "@shared/schema";
import { sql, eq, and, ne, desc } from "drizzle-orm";

export class PerformanceOptimizedStorage {
  // Single optimized query for all dashboard stats
  async getFastDashboardStats(companyId: number): Promise<any> {
    try {
      const statsQuery = await db.execute(sql`
        WITH invoice_stats AS (
          SELECT 
            COALESCE(SUM(CASE WHEN status = 'paid' THEN total::numeric ELSE 0 END), 0) as revenue,
            COALESCE(SUM(CASE WHEN status != 'paid' THEN total::numeric ELSE 0 END), 0) as outstanding,
            COUNT(*) as invoice_count
          FROM invoices 
          WHERE company_id = ${companyId}
        ),
        expense_stats AS (
          SELECT 
            COALESCE(SUM(amount::numeric), 0) as total_expenses,
            COUNT(*) as expense_count
          FROM expenses 
          WHERE company_id = ${companyId}
        ),
        customer_stats AS (
          SELECT COUNT(*) as customer_count
          FROM customers 
          WHERE company_id = ${companyId}
        ),
        bank_stats AS (
          SELECT 
            COALESCE(SUM(balance::numeric), 0) as total_balance,
            COUNT(*) as account_count
          FROM bank_accounts 
          WHERE company_id = ${companyId}
        )
        SELECT 
          i.revenue::text as total_revenue,
          i.outstanding::text as outstanding_invoices,
          i.invoice_count::text,
          e.total_expenses::text,
          e.expense_count::text,
          c.customer_count::text as total_customers,
          b.total_balance::text as bank_balance,
          b.account_count::text
        FROM invoice_stats i 
        CROSS JOIN expense_stats e 
        CROSS JOIN customer_stats c 
        CROSS JOIN bank_stats b
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
        (
          SELECT 
            'invoice' as type,
            invoice_number as reference,
            total::text as amount,
            issue_date as date,
            status,
            'Invoice ' || invoice_number as description,
            created_at
          FROM invoices 
          WHERE company_id = ${companyId}
          ORDER BY created_at DESC 
          LIMIT 3
        )
        UNION ALL
        (
          SELECT 
            'expense' as type,
            COALESCE(internal_expense_ref, 'EXP-' || id::text) as reference,
            '-' || amount::text as amount,
            expense_date as date,
            COALESCE(paid_status, 'unpaid') as status,
            description,
            created_at
          FROM expenses 
          WHERE company_id = ${companyId}
          ORDER BY created_at DESC 
          LIMIT 3
        )
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
          balance,
          account_type
        FROM bank_accounts 
        WHERE company_id = ${companyId}
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
}

export const fastStorage = new PerformanceOptimizedStorage();