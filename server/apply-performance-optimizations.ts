import { Pool } from '@neondatabase/serverless';
import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Apply comprehensive database performance optimizations
 */
export async function applyDatabaseOptimizations() {
  console.log('🚀 Starting database performance optimizations...');
  
  try {
    // Create essential indexes for frequently queried columns
    await createPerformanceIndexes();
    
    // Update table statistics for query optimizer
    await updateTableStatistics();
    
    // Configure database settings for optimal performance
    await configureDatabaseSettings();
    
    console.log('✅ Database performance optimizations completed successfully!');
  } catch (error) {
    console.error('❌ Error applying database optimizations:', error);
    throw error;
  }
}

/**
 * Create essential database indexes for performance
 */
async function createPerformanceIndexes() {
  console.log('📊 Creating performance indexes...');
  
  const indexes = [
    // Invoice-related indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_company_status ON invoices(company_id, status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_company_date ON invoices(company_id, invoice_date DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_company_due_date ON invoices(company_id, due_date)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_total_amount ON invoices(total_amount)',
    
    // Invoice items performance
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)',
    
    // Customer indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_company_id ON customers(company_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email ON customers(email)',
    
    // Payment indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_company_invoice ON payments(company_id, invoice_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status_date ON payments(status, payment_date DESC)',
    
    // Journal entry indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_company_posted ON journal_entries(company_id, is_posted)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_date ON journal_entries(transaction_date DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entry_lines_account ON journal_entry_lines(account_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entry_lines_entry_id ON journal_entry_lines(journal_entry_id)',
    
    // Chart of accounts indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chart_accounts_company_type ON chart_of_accounts(company_id, account_type)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chart_accounts_company_active ON chart_of_accounts(company_id, is_active)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chart_accounts_code ON chart_of_accounts(account_code)',
    
    // Bank account indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bank_accounts_company ON bank_accounts(company_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bank_transactions_account_date ON bank_transactions(bank_account_id, transaction_date DESC)',
    
    // User permission indexes for faster RBAC
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_user_company ON user_permissions(user_id, company_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_users_company_user ON company_users(company_id, user_id)',
    
    // Expense indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_company_date ON expenses(company_id, expense_date DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_supplier ON expenses(supplier_id)',
    
    // Product indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_company_active ON products(company_id, is_active)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category_id)',
    
    // Estimate indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estimates_company_status ON estimates(company_id, status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estimates_date ON estimates(estimate_date DESC)',
    
    // Audit log indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_company_date ON audit_logs(company_id, created_at DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action)',
    
    // Session indexes for authentication
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)',
    
    // VAT indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vat_returns_company_period ON vat_returns(company_id, period_start, period_end)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vat_transactions_company_date ON vat_transactions(company_id, transaction_date DESC)'
  ];
  
  for (const indexSQL of indexes) {
    try {
      await db.execute(sql.raw(indexSQL));
    } catch (error: any) {
      // Skip if index already exists
      if (!error.message?.includes('already exists')) {
        console.warn(`Warning creating index: ${error.message}`);
      }
    }
  }
  
  console.log(`✅ Created ${indexes.length} performance indexes`);
}

/**
 * Update table statistics for query optimizer
 */
async function updateTableStatistics() {
  console.log('📈 Updating table statistics...');
  
  const tables = [
    'invoices', 'invoice_items', 'customers', 'payments',
    'journal_entries', 'journal_entry_lines', 'chart_of_accounts',
    'bank_accounts', 'bank_transactions', 'expenses', 'products',
    'estimates', 'estimate_items', 'user_permissions', 'company_users',
    'audit_logs', 'vat_returns', 'vat_transactions'
  ];
  
  for (const table of tables) {
    try {
      await db.execute(sql.raw(`ANALYZE ${table}`));
    } catch (error: any) {
      console.warn(`Warning analyzing table ${table}:`, error.message);
    }
  }
  
  console.log(`✅ Updated statistics for ${tables.length} tables`);
}

/**
 * Configure database connection settings for optimal performance
 */
async function configureDatabaseSettings() {
  console.log('⚙️ Configuring database settings...');
  
  const settings = [
    // Optimize for read-heavy workloads
    'SET statement_timeout = 30000', // 30 second timeout
    'SET lock_timeout = 10000', // 10 second lock timeout
    'SET idle_in_transaction_session_timeout = 60000', // 60 second idle timeout
    
    // Memory settings for better performance
    'SET work_mem = "64MB"',
    'SET maintenance_work_mem = "256MB"',
    
    // Enable query plan caching
    'SET plan_cache_mode = auto'
  ];
  
  for (const setting of settings) {
    try {
      await db.execute(sql.raw(setting));
    } catch (error: any) {
      console.warn(`Warning setting database config: ${error.message}`);
    }
  }
  
  console.log('✅ Database settings configured');
}

/**
 * Get slow queries for analysis
 */
export async function getSlowQueries() {
  try {
    const result = await db.execute(sql.raw(`
      SELECT 
        query,
        calls,
        total_exec_time,
        mean_exec_time,
        max_exec_time
      FROM pg_stat_statements 
      WHERE mean_exec_time > 1000 
      ORDER BY mean_exec_time DESC 
      LIMIT 10
    `));
    return result.rows;
  } catch (error) {
    console.warn('pg_stat_statements extension not available');
    return [];
  }
}

/**
 * Get database performance metrics
 */
export async function getDatabaseMetrics() {
  try {
    const result = await db.execute(sql.raw(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins,
        n_tup_upd,
        n_tup_del,
        n_live_tup,
        n_dead_tup,
        last_autovacuum,
        last_autoanalyze
      FROM pg_stat_user_tables 
      ORDER BY n_live_tup DESC 
      LIMIT 20
    `));
    return result.rows;
  } catch (error) {
    console.warn('Could not fetch database metrics:', error);
    return [];
  }
}