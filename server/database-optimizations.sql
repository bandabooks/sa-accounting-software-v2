-- Database Performance Optimization Script
-- This script adds indexes to improve query performance across the application

-- Critical indexes for frequently queried tables

-- Invoices table - heavily queried for dashboard and reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoices_company_id_idx ON invoices(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoices_issue_date_idx ON invoices(issue_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoices_customer_id_idx ON invoices(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoices_created_at_idx ON invoices(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoices_company_status_idx ON invoices(company_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoices_company_date_idx ON invoices(company_id, issue_date DESC);

-- Expenses table - frequently used in dashboard and financial reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_company_id_idx ON expenses(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_created_at_idx ON expenses(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_expense_date_idx ON expenses(expense_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_category_idx ON expenses(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_company_date_idx ON expenses(company_id, expense_date DESC);

-- Customers table - frequent lookups and searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS customers_company_id_idx ON customers(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS customers_email_idx ON customers(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS customers_name_idx ON customers(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS customers_created_at_idx ON customers(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS customers_company_name_idx ON customers(company_id, name);

-- Bank accounts table - used in dashboard stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS bank_accounts_company_id_idx ON bank_accounts(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS bank_accounts_is_active_idx ON bank_accounts(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS bank_accounts_company_active_idx ON bank_accounts(company_id, is_active);

-- Estimates table - frequently accessed for sales reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS estimates_company_id_idx ON estimates(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS estimates_status_idx ON estimates(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS estimates_customer_id_idx ON estimates(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS estimates_created_at_idx ON estimates(created_at DESC);

-- User sessions table - critical for authentication performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_sessions_token_idx ON user_sessions(session_token);
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_sessions_is_active_idx ON user_sessions(is_active);

-- Company users table - frequent joins in authentication
CREATE INDEX CONCURRENTLY IF NOT EXISTS company_users_user_id_idx ON company_users(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS company_users_company_id_idx ON company_users(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS company_users_is_active_idx ON company_users(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS company_users_user_company_idx ON company_users(user_id, company_id);

-- Products table - frequent lookups in invoicing
CREATE INDEX CONCURRENTLY IF NOT EXISTS products_company_id_idx ON products(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS products_name_idx ON products(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS products_sku_idx ON products(sku);
CREATE INDEX CONCURRENTLY IF NOT EXISTS products_is_active_idx ON products(is_active);

-- Invoice items table - frequently joined with invoices
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items(invoice_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoice_items_product_id_idx ON invoice_items(product_id);

-- Expense items table - frequently joined with expenses
CREATE INDEX CONCURRENTLY IF NOT EXISTS expense_items_expense_id_idx ON expense_items(expense_id);

-- Chart of accounts - frequently referenced in accounting
CREATE INDEX CONCURRENTLY IF NOT EXISTS chart_of_accounts_company_id_idx ON chart_of_accounts(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS chart_of_accounts_code_idx ON chart_of_accounts(code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS chart_of_accounts_name_idx ON chart_of_accounts(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS chart_of_accounts_type_idx ON chart_of_accounts(account_type);

-- Audit logs - frequently queried for compliance
CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_logs_company_id_idx ON audit_logs(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_logs_timestamp_idx ON audit_logs("timestamp" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);

-- Sales leads - frequently searched and filtered
CREATE INDEX CONCURRENTLY IF NOT EXISTS sales_leads_company_id_idx ON sales_leads(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS sales_leads_status_idx ON sales_leads(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS sales_leads_assigned_to_idx ON sales_leads(assigned_to);
CREATE INDEX CONCURRENTLY IF NOT EXISTS sales_leads_email_idx ON sales_leads(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS sales_leads_created_at_idx ON sales_leads(created_at DESC);

-- AI conversations and messages - growing tables that need optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_conversations_user_id_idx ON ai_conversations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_conversations_company_id_idx ON ai_conversations(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_conversations_created_at_idx ON ai_conversations(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_messages_conversation_id_idx ON ai_messages(conversation_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_messages_created_at_idx ON ai_messages(created_at DESC);

-- Partial indexes for better performance on filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoices_unpaid_idx ON invoices(company_id, created_at DESC) WHERE status != 'paid';
CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_unpaid_idx ON expenses(company_id, created_at DESC) WHERE paid_status != 'paid';
CREATE INDEX CONCURRENTLY IF NOT EXISTS active_customers_idx ON customers(company_id, name) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS active_products_idx ON products(company_id, name) WHERE is_active = true;

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS invoices_dashboard_stats_idx ON invoices(company_id, status, total);
CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_dashboard_stats_idx ON expenses(company_id, amount, expense_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS recent_activities_idx ON invoices(company_id, created_at DESC, status) WHERE created_at >= NOW() - INTERVAL '30 days';

-- Text search indexes for better search performance (if using PostgreSQL full-text search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS customers_search_idx ON customers USING gin(to_tsvector('english', name || ' ' || COALESCE(email, '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS products_search_idx ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Add statistics update for better query planning
ANALYZE invoices;
ANALYZE expenses; 
ANALYZE customers;
ANALYZE products;
ANALYZE bank_accounts;
ANALYZE company_users;
ANALYZE user_sessions;

-- Optimization notes:
-- 1. Use CONCURRENTLY to avoid blocking operations during index creation
-- 2. Indexes are created only if they don't exist to allow safe re-runs
-- 3. Partial indexes reduce storage and improve performance for filtered queries
-- 4. Composite indexes match common query patterns in the application
-- 5. Text search indexes enable efficient full-text search capabilities