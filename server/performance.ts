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
          COALESCE(SUM(b.balance::numeric), 0)::text as bank_balance,
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
          balance,
          account_type
        FROM bank_accounts 
        WHERE company_id = ${companyId}
        ORDER BY balance DESC
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