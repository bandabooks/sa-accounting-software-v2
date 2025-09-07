/**
 * Dashboard Statistics Types for SARS-focused Compliance Dashboard
 */

export interface DashboardStats {
  // SARS-first KPIs
  filingsDue30: number;
  dueFilingsNext14: Array<{
    id: string;
    service: 'VAT201' | 'EMP201' | 'EMP501' | 'IRP6' | 'ITR14' | 'CIPC_AR' | 'UIF' | 'COIDA_ROE';
    entityName: string;
    periodLabel: string;
    dueDate: string; // ISO
    status: 'not_started' | 'in_progress' | 'ready' | 'filed' | 'overdue';
  }>;

  unreconciledCount: number; // bank lines to code
  tasksToday: number; // open tasks due today (mine + team)

  // timeline chips
  complianceAlerts: Array<{
    id: string;
    title: string; // e.g. "VAT201 ABC Pty"
    dueDate: string; // ISO
    level: 'info' | 'warn' | 'critical'; // critical: overdue or <3d; warn: <7d
  }>;

  // money
  bankBalances: Array<{ accountId: string; accountName: string; balance: number }>;
  cashInflow: number; // period inflow
  cashOutflow: number; // period outflow

  // AR/AP
  arTotal: number; // open invoices (unpaid portion)
  apTotal: number; // open bills (unpaid portion)

  // existing fields (preserve compatibility)
  totalRevenue?: string | number;
  totalExpenses?: string | number;
  recentActivities?: Array<any>;
  recentInvoices?: Array<any>;
  profitLossData?: Array<any>;
  
  // Additional fields for legacy compatibility
  totalCustomers?: number;
  pendingEstimates?: number;
  outstandingInvoices?: string | number;
  receivablesAging?: any;
  payablesAging?: any;
}

export interface DashboardStatsParams {
  tenantId: number;
  entityId?: number;
  periodFrom?: Date;
  periodTo?: Date;
}

/**
 * Classify alert level based on due date
 */
export function classifyAlertLevel(dueDate: Date): 'info' | 'warn' | 'critical' {
  const now = new Date();
  const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) return 'critical'; // overdue
  if (daysDiff <= 3) return 'critical'; // due in 3 days or less
  if (daysDiff <= 7) return 'warn'; // due in 7 days or less
  return 'info';
}