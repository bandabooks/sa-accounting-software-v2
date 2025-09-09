import { db } from '../db';
import { sql, eq, and, desc, gte, lte, isNotNull, lt, gt } from 'drizzle-orm';
import { 
  companies,
  sarsCompliance,
  complianceTasks,
  bankTransactions,
  bankAccounts,
  invoices,
  customers,
  expenses,
  estimates,
  auditLogs,
  payments,
  bankReconciliationItems
} from '@shared/schema';
import type { DashboardStats, DashboardStatsParams } from '../types/dashboard';
import { classifyAlertLevel } from '../types/dashboard';

/**
 * Comprehensive Dashboard Stats Service for SARS-focused Compliance
 */
export class DashboardStatsService {
  
  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(params: DashboardStatsParams): Promise<DashboardStats> {
    const { tenantId, entityId, periodFrom, periodTo } = params;
    
    // Default to last 30 days if no period specified
    const defaultPeriodFrom = periodFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const defaultPeriodTo = periodTo || new Date();
    
    try {
      // Fetch all stats in parallel for performance
      const [
        filingsStats,
        dueFilingsData,
        unreconciledData,
        tasksData,
        bankData,
        cashFlowData,
        arApData,
        legacyData
      ] = await Promise.all([
        this.getFilingsStats(tenantId, entityId),
        this.getDueFilings(tenantId, entityId),
        this.getUnreconciledCount(tenantId, defaultPeriodFrom, defaultPeriodTo, entityId),
        this.getTasksToday(tenantId, entityId),
        this.getBankBalances(tenantId, entityId),
        this.getCashFlow(tenantId, defaultPeriodFrom, defaultPeriodTo, entityId),
        this.getArApTotals(tenantId, entityId),
        this.getLegacyData(tenantId)
      ]);

      // Process compliance alerts from due filings
      const complianceAlerts = dueFilingsData.map(filing => ({
        id: filing.id,
        title: `${filing.service} ${filing.entityName}`,
        dueDate: filing.dueDate,
        level: classifyAlertLevel(new Date(filing.dueDate))
      }));

      return {
        // SARS-first KPIs
        filingsDue30: filingsStats.filingsDue30,
        dueFilingsNext14: dueFilingsData,
        unreconciledCount: unreconciledData.count,
        tasksToday: tasksData.count,
        
        // Timeline and alerts
        complianceAlerts,
        
        // Money
        bankBalances: bankData,
        cashInflow: cashFlowData.inflow,
        cashOutflow: cashFlowData.outflow,
        
        // AR/AP
        arTotal: arApData.arTotal,
        apTotal: arApData.apTotal,
        
        // Legacy compatibility (includes bankBalance from ALL bank accounts)
        ...legacyData
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return safe defaults on error
      return this.getDefaultStats();
    }
  }

  /**
   * Get filings statistics
   */
  private static async getFilingsStats(tenantId: number, entityId?: number) {
    try {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const result = await db.execute(sql`
        SELECT 
          COUNT(CASE WHEN due_date <= ${thirtyDaysFromNow.toISOString()} 
                     AND status NOT IN ('filed', 'cancelled') 
                THEN 1 END) as filings_due_30
        FROM sars_compliance 
        WHERE company_id = ${tenantId}
        ${entityId ? sql` AND entity_id = ${entityId}` : sql``}
      `);

      return {
        filingsDue30: Number(result.rows[0]?.filings_due_30 || 0)
      };
    } catch (error) {
      // Table doesn't exist, return defaults
      console.log('sars_compliance table not found, returning default values');
      return { filingsDue30: 0 }; // Return 0 for companies without compliance data
    }
  }

  /**
   * Get due filings for next 14 days
   */
  private static async getDueFilings(tenantId: number, entityId?: number) {
    try {
      const fourteenDaysFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      const result = await db.execute(sql`
        SELECT 
          sc.id,
          sc.compliance_type as service,
          COALESCE(c.display_name, c.name, 'Unknown Entity') as entity_name,
          sc.due_date,
          sc.status,
          CASE 
            WHEN sc.compliance_type = 'VAT201' THEN 'VAT Return'
            WHEN sc.compliance_type = 'EMP201' THEN 'Payroll Return'
            WHEN sc.compliance_type = 'ITR14' THEN 'Company Tax Return'
            ELSE sc.compliance_type
          END as period_label
        FROM sars_compliance sc
        LEFT JOIN companies c ON c.id = sc.company_id
        WHERE sc.company_id = ${tenantId}
        ${entityId ? sql` AND sc.entity_id = ${entityId}` : sql``}
        AND sc.due_date <= ${fourteenDaysFromNow.toISOString()}
        AND sc.status NOT IN ('filed', 'cancelled')
        ORDER BY sc.due_date ASC
        LIMIT 12
      `);

      return result.rows.map(row => ({
        id: String(row.id),
        service: row.service as any,
        entityName: String(row.entity_name),
        periodLabel: String(row.period_label),
        dueDate: new Date(String(row.due_date)).toISOString(),
        status: String(row.status) as any
      }));
    } catch (error) {
      // Table doesn't exist, return empty array
      console.log('sars_compliance table not found, returning empty filings');
      return []; // Return empty array for companies without compliance data
    }
  }

  /**
   * Get unreconciled bank transactions count
   */
  private static async getUnreconciledCount(tenantId: number, periodFrom: Date, periodTo: Date, entityId?: number) {
    const result = await db.execute(sql`
      SELECT COUNT(*) as unreconciled_count
      FROM bank_transactions bt
      WHERE bt.company_id = ${tenantId}
      ${entityId ? sql` AND bt.entity_id = ${entityId}` : sql``}
      AND bt.reconciled = false
      AND bt.transaction_date >= ${periodFrom.toISOString()}
      AND bt.transaction_date <= ${periodTo.toISOString()}
    `);

    return {
      count: Number(result.rows[0]?.unreconciled_count || 0)
    };
  }

  /**
   * Get tasks due today
   */
  private static async getTasksToday(tenantId: number, entityId?: number) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const result = await db.execute(sql`
        SELECT COUNT(*) as tasks_today
        FROM compliance_tasks ct
        WHERE ct.company_id = ${tenantId}
        ${entityId ? sql` AND ct.client_id = ${entityId}` : sql``}
        AND ct.status NOT IN ('completed', 'cancelled')
        AND DATE(ct.due_date) = ${today}
      `);

      return {
        count: Number(result.rows[0]?.tasks_today || 0)
      };
    } catch (error) {
      // Table doesn't exist, return default
      console.log('compliance_tasks table not found, returning default value');
      return { count: 0 }; // Return 0 for companies without task data
    }
  }

  /**
   * Get bank account balances
   */
  private static async getBankBalances(tenantId: number, entityId?: number) {
    try {
      // Get bank accounts from chart of accounts with real balances from journal entries
      const result = await db.execute(sql`
        SELECT 
          coa.id::text as account_id,
          coa.account_name,
          coa.account_code,
          COALESCE(
            (
              SELECT SUM(CASE 
                WHEN coa.normal_balance = 'debit' THEN 
                  jel.debit_amount::numeric - jel.credit_amount::numeric
                ELSE 
                  jel.credit_amount::numeric - jel.debit_amount::numeric
              END)
              FROM journal_entry_lines jel
              JOIN journal_entries je ON jel.journal_entry_id = je.id
              WHERE jel.account_id = coa.id
              AND je.company_id = ${tenantId}
              AND je.status = 'posted'
            ), 0
          ) as current_balance
        FROM chart_of_accounts coa
        WHERE coa.company_id = ${tenantId}
        AND coa.account_code IN ('1100', '1101', '1102', '1103', '1000')
        AND coa.is_active = true
        ORDER BY coa.account_code ASC
        LIMIT 5
      `);

      if (result.rows.length > 0) {
        return result.rows.map(row => ({
          accountId: String(row.account_id),
          accountName: String(row.account_name),
          balance: Number(row.current_balance) || 0
        }));
      }

      // Fallback: Try bank_accounts table if it exists
      const bankResult = await db.execute(sql`
        SELECT 
          ba.id::text as account_id,
          ba.account_name,
          COALESCE(ba.current_balance::numeric, 0) as current_balance
        FROM bank_accounts ba
        WHERE ba.company_id = ${tenantId}
        ${entityId ? sql` AND ba.entity_id = ${entityId}` : sql``}
        AND ba.is_active = true
        ORDER BY ba.account_name ASC
        LIMIT 5
      `);

      return bankResult.rows.map(row => ({
        accountId: String(row.account_id),
        accountName: String(row.account_name),
        balance: Number(row.current_balance) || 0
      }));
    } catch (error) {
      console.error('Error fetching bank balances:', error);
      return [];
    }
  }

  /**
   * Get cash flow (inflow/outflow)
   */
  private static async getCashFlow(tenantId: number, periodFrom: Date, periodTo: Date, entityId?: number) {
    const result = await db.execute(sql`
      SELECT 
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount::numeric ELSE 0 END), 0) as inflow,
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount::numeric) ELSE 0 END), 0) as outflow
      FROM bank_transactions bt
      WHERE bt.company_id = ${tenantId}
      ${entityId ? sql` AND bt.entity_id = ${entityId}` : sql``}
      AND bt.transaction_date >= ${periodFrom.toISOString()}
      AND bt.transaction_date <= ${periodTo.toISOString()}
    `);

    return {
      inflow: Number(result.rows[0]?.inflow || 0),
      outflow: Number(result.rows[0]?.outflow || 0)
    };
  }

  /**
   * Get AR/AP totals
   */
  private static async getArApTotals(tenantId: number, entityId?: number) {
    try {
      const [arResult, apResult] = await Promise.all([
      // Accounts Receivable (unpaid invoices)
      db.execute(sql`
        SELECT COALESCE(SUM(total::numeric), 0) as ar_total
        FROM invoices 
        WHERE company_id = ${tenantId}
        ${entityId ? sql` AND entity_id = ${entityId}` : sql``}
        AND status IN ('draft', 'sent', 'partially_paid', 'overdue')
      `),
      // Accounts Payable (unpaid bills/expenses) 
      db.execute(sql`
        SELECT COALESCE(SUM(total::numeric), 0) as ap_total
        FROM bills 
        WHERE company_id = ${tenantId}
        ${entityId ? sql` AND entity_id = ${entityId}` : sql``}
        AND status IN ('unpaid', 'partially_paid')
      `)
    ]);

      return {
        arTotal: Number(arResult.rows[0]?.ar_total || 0),
        apTotal: Number(apResult.rows[0]?.ap_total || 0)
      };
    } catch (error) {
      // Tables don't exist or column issues, return defaults
      console.log('AR/AP tables not found, returning default values');
      return { arTotal: 0, apTotal: 0 }; // Return 0 for companies without AR/AP data
    }
  }

  /**
   * Get legacy dashboard data for backwards compatibility
   */
  private static async getLegacyData(tenantId: number) {
    const [invoiceData, customerData, estimateData, expenseData, bankData] = await Promise.all([
      db.execute(sql`
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'paid' THEN total::numeric ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN status IN ('draft', 'sent', 'overdue', 'partially_paid') THEN total::numeric ELSE 0 END), 0) as outstanding_invoices,
          COALESCE(SUM(CASE WHEN status = 'paid' AND issue_date >= DATE_TRUNC('month', CURRENT_DATE) THEN total::numeric ELSE 0 END), 0) as monthly_revenue
        FROM invoices 
        WHERE company_id = ${tenantId}
      `),
      db.execute(sql`
        SELECT COUNT(*) as total_customers
        FROM customers 
        WHERE company_id = ${tenantId}
      `),
      db.execute(sql`
        SELECT COUNT(CASE WHEN status = 'sent' THEN 1 END) as pending_estimates
        FROM estimates 
        WHERE company_id = ${tenantId}
      `),
      db.execute(sql`
        SELECT COALESCE(SUM(amount::numeric), 0) as total_expenses
        FROM expenses 
        WHERE company_id = ${tenantId}
      `),
      db.execute(sql`
        SELECT COALESCE(SUM(current_balance::numeric), 0) as total_bank_balance
        FROM bank_accounts 
        WHERE company_id = ${tenantId}
        AND is_active = true
      `)
    ]);

    // Calculate profit margin from real company data
    const totalRevenue = Number(invoiceData.rows[0]?.total_revenue || 0);
    const monthlyRevenue = Number(invoiceData.rows[0]?.monthly_revenue || 0);
    const outstandingInvoices = Number(invoiceData.rows[0]?.outstanding_invoices || 0);
    const totalExpenses = Number(expenseData.rows[0]?.total_expenses || 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';
    
    // Use actual bank balance from database
    const totalBankBalance = Number(bankData.rows[0]?.total_bank_balance || 0);
    
    return {
      totalRevenue: totalRevenue,
      monthlyRevenue: monthlyRevenue, // Add monthly revenue
      outstandingInvoices: outstandingInvoices,
      totalCustomers: Number(customerData.rows[0]?.total_customers || 0),
      pendingEstimates: Number(estimateData.rows[0]?.pending_estimates || 0),
      totalExpenses: totalExpenses,
      bankBalance: totalBankBalance, // Use actual bank balance
      profitMargin: profitMargin, // Real profit margin calculated from company data
      recentActivities: [],
      recentInvoices: [],
      profitLossData: [],
      receivablesAging: null,
      payablesAging: null
    };
  }

  /**
   * Return safe default stats when queries fail
   */
  private static getDefaultStats(): DashboardStats {
    return {
      filingsDue30: 0,
      dueFilingsNext14: [],
      unreconciledCount: 0,
      tasksToday: 0,
      complianceAlerts: [],
      bankBalances: [],
      bankBalance: 0, // Default cash balance
      cashInflow: 0,
      cashOutflow: 0,
      arTotal: 0,
      apTotal: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalExpenses: 0,
      totalCustomers: 0,
      pendingEstimates: 0,
      outstandingInvoices: 0,
      profitMargin: '0.0',
      recentActivities: [],
      recentInvoices: [],
      profitLossData: [],
      receivablesAging: null,
      payablesAging: null
    };
  }
}