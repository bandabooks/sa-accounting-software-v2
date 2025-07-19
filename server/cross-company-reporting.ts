import { eq, sql, and, desc, gte, lte, inArray } from 'drizzle-orm';
import { db } from './db';
import { companies, invoices, customers, expenses, payments, bankAccounts } from '@shared/schema';
import { getCrossCompanyAccess, validateCompanyScope } from './database-policies';

/**
 * Cross-Company Reporting System
 * 
 * Provides comprehensive reporting capabilities across multiple companies
 * for users with appropriate permissions while maintaining data security.
 */

export interface CompanyReportFilters {
  companyIds?: number[];
  startDate?: Date;
  endDate?: Date;
  includeInactive?: boolean;
}

export interface CrossCompanyFinancialReport {
  companyId: number;
  companyName: string;
  totalRevenue: string;
  paidRevenue: string;
  outstandingRevenue: string;
  totalExpenses: string;
  netProfit: string;
  customerCount: number;
  invoiceCount: number;
  paymentCount: number;
  averageInvoiceValue: string;
  currency: string;
}

export interface ConsolidatedReport {
  summary: {
    totalCompanies: number;
    totalRevenue: string;
    totalExpenses: string;
    totalProfit: string;
    totalCustomers: number;
    totalInvoices: number;
  };
  companies: CrossCompanyFinancialReport[];
  topPerformers: {
    byRevenue: CrossCompanyFinancialReport[];
    byProfitability: CrossCompanyFinancialReport[];
    byGrowth: CrossCompanyFinancialReport[];
  };
}

// Cross-company financial summary
export const getCrossCompanyFinancialReport = async (
  userId: number,
  filters: CompanyReportFilters = {}
): Promise<CrossCompanyFinancialReport[]> => {
  try {
    const accessibleCompanies = filters.companyIds || await getCrossCompanyAccess(userId);
    
    if (accessibleCompanies.length === 0) {
      return [];
    }

    // Build date filter
    let dateFilter = '';
    if (filters.startDate || filters.endDate) {
      const conditions = [];
      if (filters.startDate) {
        conditions.push(`i.issue_date >= '${filters.startDate.toISOString()}'`);
        conditions.push(`e.expense_date >= '${filters.startDate.toISOString()}'`);
      }
      if (filters.endDate) {
        conditions.push(`i.issue_date <= '${filters.endDate.toISOString()}'`);
        conditions.push(`e.expense_date <= '${filters.endDate.toISOString()}'`);
      }
      if (conditions.length > 0) {
        dateFilter = `AND (${conditions.join(' AND ')})`;
      }
    }

    const query = sql.raw(`
      SELECT 
        c.id as company_id,
        c.name as company_name,
        c.currency,
        -- Revenue calculations
        COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total::numeric ELSE 0 END), 0) as paid_revenue,
        COALESCE(SUM(CASE WHEN i.status IN ('draft', 'sent', 'overdue') THEN i.total::numeric ELSE 0 END), 0) as outstanding_revenue,
        COALESCE(SUM(i.total::numeric), 0) as total_revenue,
        
        -- Expense calculations
        COALESCE(SUM(e.amount::numeric), 0) as total_expenses,
        
        -- Profit calculation
        COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total::numeric ELSE 0 END), 0) - COALESCE(SUM(e.amount::numeric), 0) as net_profit,
        
        -- Counts
        COUNT(DISTINCT cu.id) as customer_count,
        COUNT(DISTINCT i.id) as invoice_count,
        COUNT(DISTINCT p.id) as payment_count,
        
        -- Average invoice value
        CASE 
          WHEN COUNT(DISTINCT i.id) > 0 THEN COALESCE(SUM(i.total::numeric), 0) / COUNT(DISTINCT i.id)
          ELSE 0 
        END as average_invoice_value
        
      FROM companies c
      LEFT JOIN customers cu ON c.id = cu.company_id
      LEFT JOIN invoices i ON c.id = i.company_id ${dateFilter}
      LEFT JOIN expenses e ON c.id = e.company_id ${dateFilter}
      LEFT JOIN payments p ON c.id = p.company_id
      WHERE c.id IN (${accessibleCompanies.join(',')})
      ${filters.includeInactive ? '' : 'AND c.is_active = true'}
      GROUP BY c.id, c.name, c.currency
      ORDER BY total_revenue DESC
    `);

    const result = await db.execute(query);
    
    return result.rows.map((row: any) => ({
      companyId: row.company_id,
      companyName: row.company_name,
      totalRevenue: row.total_revenue.toString(),
      paidRevenue: row.paid_revenue.toString(),
      outstandingRevenue: row.outstanding_revenue.toString(),
      totalExpenses: row.total_expenses.toString(),
      netProfit: row.net_profit.toString(),
      customerCount: parseInt(row.customer_count),
      invoiceCount: parseInt(row.invoice_count),
      paymentCount: parseInt(row.payment_count),
      averageInvoiceValue: row.average_invoice_value.toString(),
      currency: row.currency || 'ZAR'
    })) as CrossCompanyFinancialReport[];

  } catch (error) {
    console.error('Error generating cross-company financial report:', error);
    return [];
  }
};

// Consolidated multi-company report
export const getConsolidatedReport = async (
  userId: number,
  filters: CompanyReportFilters = {}
): Promise<ConsolidatedReport> => {
  try {
    const companies = await getCrossCompanyFinancialReport(userId, filters);
    
    if (companies.length === 0) {
      return {
        summary: {
          totalCompanies: 0,
          totalRevenue: '0',
          totalExpenses: '0',
          totalProfit: '0',
          totalCustomers: 0,
          totalInvoices: 0
        },
        companies: [],
        topPerformers: {
          byRevenue: [],
          byProfitability: [],
          byGrowth: []
        }
      };
    }

    // Calculate summary metrics
    const summary = {
      totalCompanies: companies.length,
      totalRevenue: companies.reduce((sum, c) => sum + parseFloat(c.totalRevenue), 0).toString(),
      totalExpenses: companies.reduce((sum, c) => sum + parseFloat(c.totalExpenses), 0).toString(),
      totalProfit: companies.reduce((sum, c) => sum + parseFloat(c.netProfit), 0).toString(),
      totalCustomers: companies.reduce((sum, c) => sum + c.customerCount, 0),
      totalInvoices: companies.reduce((sum, c) => sum + c.invoiceCount, 0)
    };

    // Top performers
    const topPerformers = {
      byRevenue: [...companies].sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue)).slice(0, 5),
      byProfitability: [...companies].sort((a, b) => parseFloat(b.netProfit) - parseFloat(a.netProfit)).slice(0, 5),
      byGrowth: [...companies].slice(0, 5) // Would need historical data for real growth calculation
    };

    return {
      summary,
      companies,
      topPerformers
    };

  } catch (error) {
    console.error('Error generating consolidated report:', error);
    throw error;
  }
};

// Company comparison metrics
export const getCompanyComparison = async (
  userId: number,
  companyIds: number[],
  metric: 'revenue' | 'profit' | 'customers' | 'efficiency' = 'revenue'
): Promise<any[]> => {
  try {
    const accessibleCompanies = await getCrossCompanyAccess(userId);
    const validCompanyIds = companyIds.filter(id => accessibleCompanies.includes(id));
    
    if (validCompanyIds.length === 0) {
      return [];
    }

    const companies = await getCrossCompanyFinancialReport(userId, { companyIds: validCompanyIds });
    
    // Sort by selected metric
    let sortedCompanies;
    switch (metric) {
      case 'revenue':
        sortedCompanies = companies.sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue));
        break;
      case 'profit':
        sortedCompanies = companies.sort((a, b) => parseFloat(b.netProfit) - parseFloat(a.netProfit));
        break;
      case 'customers':
        sortedCompanies = companies.sort((a, b) => b.customerCount - a.customerCount);
        break;
      case 'efficiency':
        sortedCompanies = companies.sort((a, b) => parseFloat(b.averageInvoiceValue) - parseFloat(a.averageInvoiceValue));
        break;
      default:
        sortedCompanies = companies;
    }

    return sortedCompanies.map((company, index) => ({
      ...company,
      rank: index + 1,
      benchmarkMetric: metric
    }));

  } catch (error) {
    console.error('Error generating company comparison:', error);
    return [];
  }
};

// Multi-company cash flow analysis
export const getCrossCompanyCashFlow = async (
  userId: number,
  filters: CompanyReportFilters = {}
): Promise<any[]> => {
  try {
    const accessibleCompanies = filters.companyIds || await getCrossCompanyAccess(userId);
    
    if (accessibleCompanies.length === 0) {
      return [];
    }

    const query = sql.raw(`
      SELECT 
        c.id as company_id,
        c.name as company_name,
        c.currency,
        DATE_TRUNC('month', COALESCE(p.payment_date, i.issue_date)) as period,
        
        -- Cash inflows (payments received)
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount::numeric ELSE 0 END), 0) as cash_inflow,
        
        -- Cash outflows (expenses and supplier payments)
        COALESCE(SUM(e.amount::numeric), 0) as cash_outflow,
        
        -- Net cash flow
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount::numeric ELSE 0 END), 0) - 
        COALESCE(SUM(e.amount::numeric), 0) as net_cash_flow
        
      FROM companies c
      LEFT JOIN invoices i ON c.id = i.company_id
      LEFT JOIN payments p ON i.id = p.invoice_id
      LEFT JOIN expenses e ON c.id = e.company_id AND DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', COALESCE(p.payment_date, i.issue_date))
      WHERE c.id IN (${accessibleCompanies.join(',')})
      AND c.is_active = true
      ${filters.startDate ? `AND COALESCE(p.payment_date, i.issue_date) >= '${filters.startDate.toISOString()}'` : ''}
      ${filters.endDate ? `AND COALESCE(p.payment_date, i.issue_date) <= '${filters.endDate.toISOString()}'` : ''}
      GROUP BY c.id, c.name, c.currency, period
      HAVING period IS NOT NULL
      ORDER BY c.name, period
    `);

    const result = await db.execute(query);
    
    return result.rows.map((row: any) => ({
      companyId: row.company_id,
      companyName: row.company_name,
      currency: row.currency || 'ZAR',
      period: row.period,
      cashInflow: row.cash_inflow.toString(),
      cashOutflow: row.cash_outflow.toString(),
      netCashFlow: row.net_cash_flow.toString()
    }));

  } catch (error) {
    console.error('Error generating cross-company cash flow:', error);
    return [];
  }
};

export default {
  getCrossCompanyFinancialReport,
  getConsolidatedReport,
  getCompanyComparison,
  getCrossCompanyCashFlow
};