CREATE TABLE "account_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"opening_balance" numeric(15, 2) DEFAULT '0.00',
	"debit_total" numeric(15, 2) DEFAULT '0.00',
	"credit_total" numeric(15, 2) DEFAULT '0.00',
	"closing_balance" numeric(15, 2) DEFAULT '0.00',
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "account_balances_company_id_account_id_period_start_unique" UNIQUE("company_id","account_id","period_start")
);
--> statement-breakpoint
CREATE TABLE "advanced_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"report_name" varchar(255) NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"parameters" jsonb,
	"schedule" varchar(20),
	"recipients" jsonb,
	"last_generated" timestamp,
	"next_scheduled" timestamp,
	"is_active" boolean DEFAULT true,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_assistant_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"client_id" integer,
	"company_id" integer NOT NULL,
	"title" text,
	"category" text NOT NULL,
	"context" jsonb,
	"message_count" integer DEFAULT 0,
	"last_message" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_assistant_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"intent" text,
	"confidence" numeric(3, 2),
	"suggestions" jsonb,
	"tokens" integer,
	"response_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"title" text,
	"context" text,
	"context_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_request_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"company_id" integer,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"status_code" integer NOT NULL,
	"response_time" integer,
	"ip_address" text,
	"user_agent" text,
	"request_body" jsonb,
	"response_body" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "approval_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"workflow_id" integer NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" integer NOT NULL,
	"requested_by" integer NOT NULL,
	"current_step_index" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"request_data" jsonb NOT NULL,
	"approval_history" jsonb DEFAULT '[]' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"workflow_name" varchar(255) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"trigger_conditions" jsonb NOT NULL,
	"approval_steps" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"user_id" integer,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" integer,
	"old_values" jsonb,
	"new_values" jsonb,
	"details" text,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"account_name" text NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"branch_code" text,
	"account_type" text DEFAULT 'current' NOT NULL,
	"currency" text DEFAULT 'ZAR' NOT NULL,
	"opening_balance" numeric(15, 2) DEFAULT '0.00',
	"current_balance" numeric(15, 2) DEFAULT '0.00',
	"reconcile_balance" numeric(15, 2) DEFAULT '0.00',
	"last_reconciled" timestamp,
	"chart_account_id" integer,
	"external_provider" text,
	"provider_account_id" text,
	"institution_name" text,
	"last_sync_at" timestamp,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bank_feed_cursors" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"bank_account_id" integer NOT NULL,
	"provider" text NOT NULL,
	"external_account_id" text NOT NULL,
	"txn_cursor" text,
	"last_sync_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bank_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"bank_account_id" integer NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_number" varchar(255) NOT NULL,
	"account_type" varchar(50) NOT NULL,
	"integration_provider" varchar(100) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"last_sync_date" timestamp,
	"sync_frequency" varchar(50) DEFAULT 'daily' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sync_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"last_sync_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_reconciliation_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"reconciliation_id" integer NOT NULL,
	"transaction_id" integer,
	"transaction_type" varchar(20) NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"transaction_date" date NOT NULL,
	"status" varchar(20) DEFAULT 'unmatched' NOT NULL,
	"matched_with" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bank_reconciliations" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"bank_account_id" integer NOT NULL,
	"reconciliation_date" timestamp NOT NULL,
	"statement_date" timestamp NOT NULL,
	"opening_balance" numeric(15, 2) NOT NULL,
	"closing_balance" numeric(15, 2) NOT NULL,
	"statement_balance" numeric(15, 2) NOT NULL,
	"difference" numeric(15, 2) DEFAULT '0.00',
	"is_complete" boolean DEFAULT false,
	"notes" text,
	"reconciled_by" integer,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bank_statement_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"upload_id" integer NOT NULL,
	"transaction_date" date NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"balance" numeric(12, 2),
	"reference" text,
	"transaction_type" text NOT NULL,
	"matched" boolean DEFAULT false,
	"suggested_category_id" integer,
	"confidence" integer,
	"matched_transaction_id" integer,
	"matched_transaction_type" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bank_statement_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"bank_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"file_type" text,
	"upload_date" timestamp DEFAULT now(),
	"processed_date" timestamp,
	"status" text DEFAULT 'processing',
	"total_transactions" integer DEFAULT 0,
	"matched_transactions" integer DEFAULT 0,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bank_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"bank_account_id" integer NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"posting_date" date NOT NULL,
	"description" text NOT NULL,
	"normalized_description" text,
	"reference" text,
	"external_id" text,
	"transaction_type" text NOT NULL,
	"debit_amount" numeric(15, 2) DEFAULT '0.00',
	"credit_amount" numeric(15, 2) DEFAULT '0.00',
	"amount" numeric(15, 2) NOT NULL,
	"balance" numeric(15, 2),
	"status" text DEFAULT 'pending',
	"import_batch_id" integer,
	"is_imported" boolean DEFAULT false,
	"source" text DEFAULT 'manual',
	"is_duplicate" boolean DEFAULT false,
	"reconciled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bill_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"bill_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"vat_type" text DEFAULT 'Inclusive' NOT NULL,
	"vat_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"line_total" numeric(10, 2) NOT NULL,
	"expense_category_id" integer,
	"project_id" integer,
	"department_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"bill_number" text NOT NULL,
	"supplier_id" integer NOT NULL,
	"supplier_invoice_number" text NOT NULL,
	"bill_date" date NOT NULL,
	"due_date" date NOT NULL,
	"description" text NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"vat_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0.00',
	"status" text DEFAULT 'draft' NOT NULL,
	"approval_status" text DEFAULT 'pending' NOT NULL,
	"approved_by" integer,
	"approved_at" timestamp,
	"rejected_by" integer,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"purchase_order_id" integer,
	"goods_receipt_id" integer,
	"payment_terms" integer DEFAULT 30,
	"attachment_url" text,
	"notes" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bills_company_id_bill_number_unique" UNIQUE("company_id","bill_number"),
	CONSTRAINT "bills_company_id_supplier_invoice_number_unique" UNIQUE("company_id","supplier_invoice_number")
);
--> statement-breakpoint
CREATE TABLE "budget_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"budget_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" varchar(255),
	"budgeted_amount" numeric(12, 2) NOT NULL,
	"actual_amount" numeric(12, 2) DEFAULT '0.00',
	"variance" numeric(12, 2) DEFAULT '0.00',
	"variance_percent" numeric(5, 2) DEFAULT '0.00',
	"period" varchar(7),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"budget_type" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_budget" numeric(15, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"approved_by" integer,
	"approved_at" timestamp,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulk_capture_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"batch_id" text NOT NULL,
	"session_type" text NOT NULL,
	"status" text DEFAULT 'draft',
	"total_entries" integer DEFAULT 0,
	"processed_entries" integer DEFAULT 0,
	"batch_notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bulk_capture_sessions_batch_id_unique" UNIQUE("batch_id")
);
--> statement-breakpoint
CREATE TABLE "bulk_expense_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"batch_id" text NOT NULL,
	"transaction_date" date NOT NULL,
	"category_id" integer NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"supplier_id" integer,
	"vat_type_id" integer DEFAULT 1 NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00',
	"vat_amount" numeric(12, 2) DEFAULT '0.00',
	"net_amount" numeric(12, 2) NOT NULL,
	"bank_account_id" integer,
	"reference" text,
	"notes" text,
	"status" text DEFAULT 'validated',
	"from_bank_statement" boolean DEFAULT false,
	"confidence" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulk_income_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"batch_id" text NOT NULL,
	"transaction_date" date NOT NULL,
	"income_account_id" integer NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"client_id" integer,
	"vat_type_id" integer DEFAULT 1 NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00',
	"vat_amount" numeric(12, 2) DEFAULT '0.00',
	"net_amount" numeric(12, 2) NOT NULL,
	"bank_account_id" integer,
	"reference" text,
	"notes" text,
	"status" text DEFAULT 'validated',
	"from_bank_statement" boolean DEFAULT false,
	"confidence" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_flow_forecast_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"forecast_id" integer NOT NULL,
	"period" date NOT NULL,
	"category" varchar(100) NOT NULL,
	"subcategory" varchar(100) NOT NULL,
	"description" varchar(255),
	"forecast_amount" numeric(12, 2) NOT NULL,
	"actual_amount" numeric(12, 2) DEFAULT '0.00',
	"variance" numeric(12, 2) DEFAULT '0.00',
	"probability" numeric(3, 2) DEFAULT '1.00',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_flow_forecasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"forecast_type" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"based_on_historical" boolean DEFAULT true,
	"historical_months" integer DEFAULT 12,
	"confidence" varchar(20) DEFAULT 'medium',
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chart_of_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"account_code" varchar(20) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"parent_account_id" integer,
	"account_type" varchar(50) NOT NULL,
	"account_sub_type" varchar(100),
	"normal_balance" varchar(10) NOT NULL,
	"is_active" boolean DEFAULT true,
	"description" text,
	"tax_type" varchar(50),
	"level" integer DEFAULT 1,
	"is_system_account" boolean DEFAULT false,
	"industry_templates" jsonb DEFAULT '[]'::jsonb,
	"balance" numeric(15, 2) DEFAULT '0.00',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chart_of_accounts_company_id_account_code_unique" UNIQUE("company_id","account_code")
);
--> statement-breakpoint
CREATE TABLE "cipc_compliance" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"compliance_type" text NOT NULL,
	"period" text,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'pending',
	"filed_date" date,
	"cipc_reference" text,
	"filing_fee" numeric(10, 2),
	"penalty_amount" numeric(10, 2),
	"total_amount" numeric(10, 2),
	"payment_status" text DEFAULT 'pending',
	"forms" text[],
	"documents" text[],
	"certificates" text[],
	"change_details" jsonb,
	"effective_date" date,
	"assigned_to" integer,
	"reviewed_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"trading_name" text,
	"registration_number" text,
	"tax_number" text,
	"vat_number" text,
	"industry_code" text,
	"business_type" text NOT NULL,
	"status" text DEFAULT 'active',
	"primary_contact" text,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"province" text,
	"postal_code" text,
	"is_vat_registered" boolean DEFAULT false,
	"paye_number" text,
	"uif_number" text,
	"coida_number" text,
	"service_package" text DEFAULT 'basic',
	"monthly_fee" numeric(10, 2) DEFAULT '0.00',
	"onboarding_status" text DEFAULT 'pending',
	"onboarding_completed_at" timestamp,
	"notes" text,
	"tags" text[],
	"assigned_to" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer,
	"lead_id" integer,
	"channel" text NOT NULL,
	"direction" text NOT NULL,
	"subject" text,
	"content" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"provider_id" text,
	"metadata" json,
	"sent_by" integer,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"replied_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"channel" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"variables" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"slug" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"postal_code" text,
	"country" text DEFAULT 'South Africa',
	"vat_number" text,
	"registration_number" text,
	"is_vat_registered" boolean DEFAULT false,
	"vat_registration_date" date,
	"vat_period_months" integer DEFAULT 2,
	"vat_category" text DEFAULT 'A',
	"vat_start_month" integer DEFAULT 1,
	"vat_submission_day" integer DEFAULT 25,
	"logo" text,
	"primary_color" text DEFAULT '#3b82f6',
	"secondary_color" text DEFAULT '#64748b',
	"timezone" text DEFAULT 'Africa/Johannesburg',
	"currency" text DEFAULT 'ZAR',
	"date_format" text DEFAULT 'DD/MM/YYYY',
	"fiscal_year_start" text DEFAULT '04-01',
	"is_active" boolean DEFAULT true,
	"subscription_plan" text DEFAULT 'basic',
	"subscription_status" text DEFAULT 'active',
	"subscription_expires_at" timestamp,
	"industry" text DEFAULT 'general',
	"industry_template" text DEFAULT 'general',
	"vat_inclusive_pricing" boolean DEFAULT false,
	"default_vat_rate" numeric(5, 2) DEFAULT '15.00',
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_company_id_unique" UNIQUE("company_id"),
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_chart_of_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"activated_at" timestamp DEFAULT now(),
	"activated_by" integer,
	"deactivated_at" timestamp,
	"deactivated_by" integer,
	CONSTRAINT "company_chart_of_accounts_company_id_account_id_unique" UNIQUE("company_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "company_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"module_id" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"activated_at" timestamp,
	"deactivated_at" timestamp,
	"activated_by" integer,
	"deactivated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "company_modules_company_id_module_id_unique" UNIQUE("company_id","module_id")
);
--> statement-breakpoint
CREATE TABLE "company_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"based_on_system_role" integer,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "company_roles_company_id_name_unique" UNIQUE("company_id","name")
);
--> statement-breakpoint
CREATE TABLE "company_sars_link" (
	"id" varchar PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"isv_number" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'disconnected' NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"linked_at" timestamp,
	"last_sync_at" timestamp,
	"error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "company_sars_link_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"company_email" varchar(255),
	"company_phone" varchar(50),
	"company_address" text,
	"vat_number" varchar(50),
	"registration_number" varchar(50),
	"logo" text,
	"primary_currency" varchar(3) DEFAULT 'ZAR',
	"secondary_currencies" jsonb DEFAULT '[]'::jsonb,
	"exchange_rates" jsonb DEFAULT '{}'::jsonb,
	"invoice_prefix" varchar(10) DEFAULT 'INV',
	"estimate_prefix" varchar(10) DEFAULT 'EST',
	"payment_terms" text,
	"email_reminder_days" jsonb DEFAULT '[7,3,1]'::jsonb,
	"auto_email_reminders" boolean DEFAULT false,
	"fiscal_year_start" date DEFAULT '2025-01-01',
	"tax_rate" numeric(5, 2) DEFAULT '15.00',
	"vat_registered" boolean DEFAULT false,
	"vat_period" varchar(20) DEFAULT 'monthly',
	"vat_submission_date" integer DEFAULT 25,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"billing_period" text DEFAULT 'monthly' NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp NOT NULL,
	"auto_renew" boolean DEFAULT true,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" text,
	"last_payment_date" timestamp,
	"next_billing_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'employee' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "company_users_company_id_user_id_unique" UNIQUE("company_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "compliance_calendar" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"company_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_type" text NOT NULL,
	"compliance_type" text,
	"event_date" date NOT NULL,
	"reminder_dates" date[],
	"is_recurring" boolean DEFAULT false,
	"recurrence_pattern" text,
	"status" text DEFAULT 'scheduled',
	"completed_at" timestamp,
	"assigned_to" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"check_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"compliance_score" integer DEFAULT 0,
	"issues" json DEFAULT '[]'::json,
	"recommendations" json DEFAULT '[]'::json,
	"last_checked" timestamp,
	"next_check" timestamp,
	"is_automated" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"document_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"file_path" text NOT NULL,
	"tags" text[],
	"period" text,
	"version" integer DEFAULT 1,
	"is_latest_version" boolean DEFAULT true,
	"access_level" text DEFAULT 'internal',
	"shared_with" integer[],
	"status" text DEFAULT 'active',
	"expiry_date" date,
	"retention_period" integer,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"company_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"task_type" text NOT NULL,
	"priority" text DEFAULT 'medium',
	"compliance_type" text,
	"compliance_id" integer,
	"status" text DEFAULT 'pending',
	"assigned_to" integer,
	"delegated_to" integer,
	"reviewed_by" integer,
	"start_date" date,
	"due_date" date,
	"completed_at" timestamp,
	"estimated_hours" numeric(5, 2),
	"actual_hours" numeric(5, 2),
	"depends_on" integer[],
	"blocked_by" integer[],
	"reminder_settings" jsonb,
	"last_reminder_sent" timestamp,
	"attachments" text[],
	"notes" text,
	"work_log" jsonb,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "correspondence_tracker" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"subject" text NOT NULL,
	"direction" text NOT NULL,
	"correspondence_type" text NOT NULL,
	"authority" text,
	"content" text,
	"summary" text,
	"from_name" text,
	"from_email" text,
	"to_name" text,
	"to_email" text,
	"reference_number" text,
	"related_compliance" integer,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"follow_up_date" date,
	"follow_up_action" text,
	"attachments" text[],
	"received_date" timestamp,
	"response_date" timestamp,
	"response_required" boolean DEFAULT false,
	"responded_by" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "credit_note_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"credit_note_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"original_invoice_item_id" integer,
	"product_id" integer,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"net_amount" numeric(10, 2) NOT NULL,
	"vat_type_id" integer,
	"vat_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"vat_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"line_total" numeric(10, 2) NOT NULL,
	"is_vat_inclusive" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"original_invoice_id" integer,
	"credit_note_number" varchar(255) NOT NULL,
	"issue_date" date NOT NULL,
	"reason" varchar(255) NOT NULL,
	"reason_description" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"vat_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"applied_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"remaining_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'ZAR' NOT NULL,
	"notes" text,
	"is_vat_inclusive" boolean DEFAULT false NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currency_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"from_currency" varchar(3) NOT NULL,
	"to_currency" varchar(3) NOT NULL,
	"rate" numeric(10, 6) NOT NULL,
	"valid_from" timestamp DEFAULT now(),
	"valid_to" timestamp,
	"source" varchar(50) DEFAULT 'manual',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "currency_rates_company_id_from_currency_to_currency_valid_from_unique" UNIQUE("company_id","from_currency","to_currency","valid_from")
);
--> statement-breakpoint
CREATE TABLE "customer_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"lifetime_value" numeric(12, 2) DEFAULT '0.00',
	"average_order_value" numeric(10, 2) DEFAULT '0.00',
	"total_orders" integer DEFAULT 0,
	"total_revenue" numeric(12, 2) DEFAULT '0.00',
	"first_purchase_date" timestamp,
	"last_purchase_date" timestamp,
	"average_days_between_orders" integer,
	"health_score" integer DEFAULT 50,
	"risk_level" text DEFAULT 'low' NOT NULL,
	"preferred_payment_method" text,
	"preferred_contact_method" text,
	"seasonal_trends" json,
	"purchase_patterns" json,
	"last_calculated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_insights_customer_unique" UNIQUE("company_id","customer_id")
);
--> statement-breakpoint
CREATE TABLE "customer_lifecycle_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"from_stage" text,
	"to_stage" text,
	"trigger" text NOT NULL,
	"description" text,
	"metadata" json,
	"performed_by" integer,
	"automation_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_price_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'ZAR' NOT NULL,
	"minimum_quantity" numeric(10, 2) DEFAULT '1.00',
	"valid_from" timestamp DEFAULT now(),
	"valid_to" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_price_lists_customer_id_product_id_unique" UNIQUE("customer_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "customer_segment_membership" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"segment_id" integer NOT NULL,
	"added_at" timestamp DEFAULT now(),
	"added_by" integer,
	"automatically_added" boolean DEFAULT false,
	CONSTRAINT "customer_segment_membership_unique" UNIQUE("customer_id","segment_id")
);
--> statement-breakpoint
CREATE TABLE "customer_segments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"criteria" json NOT NULL,
	"color" text DEFAULT '#3B82F6',
	"is_active" boolean DEFAULT true,
	"auto_update" boolean DEFAULT true,
	"member_count" integer DEFAULT 0,
	"last_updated" timestamp DEFAULT now(),
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"postal_code" text,
	"vat_number" text,
	"credit_limit" numeric(10, 2) DEFAULT '0.00',
	"payment_terms" integer DEFAULT 30,
	"category" text DEFAULT 'standard',
	"notes" text,
	"portal_access" boolean DEFAULT false,
	"portal_password" text,
	"lifecycle_stage" text DEFAULT 'prospect' NOT NULL,
	"lead_source" text DEFAULT 'direct',
	"assigned_to" integer,
	"tags" text[] DEFAULT '{}',
	"preferred_contact_method" text DEFAULT 'email',
	"timezone" text DEFAULT 'Africa/Johannesburg',
	"language" text DEFAULT 'en',
	"industry" text,
	"company_size" text,
	"annual_revenue" numeric(12, 2),
	"website" text,
	"social_media" json,
	"custom_fields" json,
	"is_active" boolean DEFAULT true,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"delivery_number" text NOT NULL,
	"sales_order_id" integer,
	"invoice_id" integer,
	"customer_id" integer NOT NULL,
	"delivery_date" timestamp NOT NULL,
	"delivery_method" text DEFAULT 'courier' NOT NULL,
	"tracking_number" text,
	"delivery_address" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"delivered_at" timestamp,
	"delivered_by" text,
	"delivery_signature" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "deliveries_company_id_delivery_number_unique" UNIQUE("company_id","delivery_number")
);
--> statement-breakpoint
CREATE TABLE "delivery_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"delivery_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity_ordered" numeric(10, 2) NOT NULL,
	"quantity_delivered" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "depreciation_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"asset_id" integer NOT NULL,
	"period" varchar(7) NOT NULL,
	"depreciation_amount" numeric(10, 2) NOT NULL,
	"accumulated_depreciation" numeric(12, 2) NOT NULL,
	"book_value" numeric(12, 2) NOT NULL,
	"journal_entry_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "digital_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"document_type" text NOT NULL,
	"document_id" integer NOT NULL,
	"signer_name" text NOT NULL,
	"signer_email" text NOT NULL,
	"signer_title" text,
	"signature_data" text NOT NULL,
	"signature_ip" text,
	"signature_device" text,
	"signed_at" timestamp DEFAULT now(),
	"is_valid" boolean DEFAULT true,
	"verification_code" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"user_id" integer,
	"to" text NOT NULL,
	"cc" text,
	"bcc" text,
	"subject" text NOT NULL,
	"body_html" text NOT NULL,
	"body_text" text NOT NULL,
	"template_id" integer,
	"priority" integer DEFAULT 5,
	"status" text DEFAULT 'pending',
	"attempts" integer DEFAULT 0,
	"error_message" text,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"reminder_type" varchar(20) NOT NULL,
	"days_before" integer NOT NULL,
	"email_sent" boolean DEFAULT false,
	"sent_at" timestamp,
	"scheduled_for" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body_html" text NOT NULL,
	"body_text" text NOT NULL,
	"template_type" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "engagement_letters" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"template_id" integer,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"renewal_terms" text,
	"fees" jsonb,
	"payment_terms" text DEFAULT 'Net 30',
	"status" text DEFAULT 'draft',
	"sent_at" timestamp,
	"signed_at" timestamp,
	"signed_by" text,
	"document_url" text,
	"e_signature_id" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "estimate_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"estimate_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"vat_inclusive" boolean DEFAULT false,
	"vat_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "estimates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"estimate_number" text NOT NULL,
	"customer_id" integer NOT NULL,
	"issue_date" timestamp NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"vat_amount" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "estimates_company_id_estimate_number_unique" UNIQUE("company_id","estimate_number")
);
--> statement-breakpoint
CREATE TABLE "exception_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"exception_id" integer NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"recipient_id" integer NOT NULL,
	"alert_title" varchar(200) NOT NULL,
	"alert_message" text NOT NULL,
	"sent" boolean DEFAULT false,
	"sent_at" timestamp,
	"read_at" timestamp,
	"action_required" boolean DEFAULT false,
	"action_taken" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exception_escalations" (
	"id" serial PRIMARY KEY NOT NULL,
	"exception_id" integer NOT NULL,
	"from_user_id" integer NOT NULL,
	"to_user_id" integer NOT NULL,
	"escalation_reason" text NOT NULL,
	"urgency_level" varchar(20) DEFAULT 'normal' NOT NULL,
	"requires_response" boolean DEFAULT true,
	"response_deadline" timestamp,
	"responded_at" timestamp,
	"response_action" varchar(50),
	"response_comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"expense_id" integer,
	"approver_level" integer DEFAULT 1 NOT NULL,
	"approver_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"comments" text,
	"approval_limit" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"supplier_id" integer,
	"bank_account_id" integer,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"category_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"vat_type" text DEFAULT 'No VAT' NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"vat_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"expense_date" date NOT NULL,
	"paid_status" text DEFAULT 'Unpaid' NOT NULL,
	"attachment_url" text,
	"supplier_invoice_number" text,
	"internal_expense_ref" text NOT NULL,
	"purchase_order_id" integer,
	"approval_status" text DEFAULT 'pending' NOT NULL,
	"approved_by" integer,
	"approved_at" timestamp,
	"rejected_by" integer,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"recurring_expense_id" integer,
	"is_recurring" boolean DEFAULT false,
	"expense_type" text DEFAULT 'one_time' NOT NULL,
	"reimbursement_status" text,
	"employee_id" integer,
	"project_id" integer,
	"department_id" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "expenses_company_id_supplier_invoice_number_unique" UNIQUE("company_id","supplier_invoice_number")
);
--> statement-breakpoint
CREATE TABLE "fixed_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"asset_name" varchar(255) NOT NULL,
	"asset_code" varchar(50) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"purchase_date" date NOT NULL,
	"purchase_price" numeric(12, 2) NOT NULL,
	"current_value" numeric(12, 2) NOT NULL,
	"depreciation_method" varchar(50) DEFAULT 'straight_line' NOT NULL,
	"useful_life" integer NOT NULL,
	"residual_value" numeric(12, 2) DEFAULT '0.00',
	"location" varchar(255),
	"supplier" varchar(255),
	"serial_number" varchar(100),
	"warranty_expiry" date,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"disposal_date" date,
	"disposal_value" numeric(12, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "general_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"journal_entry_id" integer NOT NULL,
	"journal_entry_line_id" integer NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"entry_number" text NOT NULL,
	"description" text NOT NULL,
	"reference" text,
	"debit_amount" numeric(15, 2) DEFAULT '0.00',
	"credit_amount" numeric(15, 2) DEFAULT '0.00',
	"running_balance" numeric(15, 2) DEFAULT '0.00',
	"source_module" text,
	"source_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goods_receipt_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"goods_receipt_id" integer NOT NULL,
	"purchase_order_item_id" integer,
	"description" text NOT NULL,
	"ordered_quantity" numeric(10, 2) NOT NULL,
	"received_quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"quality_status" text DEFAULT 'accepted',
	"rejection_reason" text,
	"lot_number" text,
	"batch_number" text,
	"expiry_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goods_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"receipt_number" text NOT NULL,
	"purchase_order_id" integer,
	"supplier_id" integer NOT NULL,
	"received_date" timestamp NOT NULL,
	"received_by" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"quality_check_passed" boolean DEFAULT true,
	"quality_check_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "help_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"language" text DEFAULT 'en',
	"is_published" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "help_search_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"query" text NOT NULL,
	"results_count" integer DEFAULT 0,
	"was_helpful" boolean,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "id_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"max_used_id" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"bank_account_id" integer NOT NULL,
	"batch_number" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text NOT NULL,
	"uploaded_by" integer NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"total_rows" integer DEFAULT 0,
	"new_rows" integer DEFAULT 0,
	"duplicate_rows" integer DEFAULT 0,
	"invalid_rows" integer DEFAULT 0,
	"statement_start_date" date,
	"statement_end_date" date,
	"processing_notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"import_batch_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"bank_account_id" integer NOT NULL,
	"row_number" integer NOT NULL,
	"transaction_date" timestamp,
	"posting_date" date,
	"description" text,
	"normalized_description" text,
	"reference" text,
	"external_id" text,
	"debit_amount" numeric(15, 2),
	"credit_amount" numeric(15, 2),
	"amount" numeric(15, 2),
	"balance" numeric(15, 2),
	"status" text NOT NULL,
	"validation_errors" jsonb DEFAULT '[]'::jsonb,
	"duplicate_transaction_id" integer,
	"will_import" boolean DEFAULT true,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "industry_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"industry_code" varchar(50) NOT NULL,
	"industry_name" varchar(100) NOT NULL,
	"description" text,
	"account_codes" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "industry_templates_industry_code_unique" UNIQUE("industry_code")
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer,
	"warehouse_id" integer,
	"lot_id" integer,
	"transaction_type" varchar(20) NOT NULL,
	"movement_type" varchar(30) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"reference" varchar(100),
	"reference_id" integer,
	"journal_entry_id" integer,
	"notes" text,
	"user_id" integer NOT NULL,
	"approved_by" integer,
	"approved_at" timestamp,
	"serial_numbers" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_aging_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"report_date" date NOT NULL,
	"report_name" varchar(255) NOT NULL,
	"aging_periods" jsonb NOT NULL,
	"total_outstanding" numeric(12, 2) NOT NULL,
	"current_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"period1_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"period2_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"period3_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"period4_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"customer_count" integer NOT NULL,
	"invoice_count" integer NOT NULL,
	"report_data" jsonb NOT NULL,
	"generated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"vat_inclusive" boolean DEFAULT false,
	"vat_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"reminder_type" varchar(50) NOT NULL,
	"days_from_due" integer NOT NULL,
	"reminder_number" integer DEFAULT 1 NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"sent_date" timestamp,
	"sent_method" varchar(50),
	"email_subject" varchar(255),
	"email_body" text,
	"sms_message" text,
	"sent_to_email" varchar(255),
	"sent_to_phone" varchar(50),
	"response_received" boolean DEFAULT false,
	"response_date" timestamp,
	"response_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"invoice_number" text NOT NULL,
	"customer_id" integer NOT NULL,
	"issue_date" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"vat_amount" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_company_id_invoice_number_unique" UNIQUE("company_id","invoice_number")
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"entry_number" varchar(50) NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"reference" varchar(100),
	"total_debit" numeric(15, 2) NOT NULL,
	"total_credit" numeric(15, 2) NOT NULL,
	"is_posted" boolean DEFAULT false,
	"is_reversed" boolean DEFAULT false,
	"reversal_entry_id" integer,
	"created_by" integer,
	"source_module" varchar(50),
	"source_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "journal_entries_company_id_entry_number_unique" UNIQUE("company_id","entry_number")
);
--> statement-breakpoint
CREATE TABLE "journal_entry_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"journal_entry_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"description" text,
	"debit_amount" numeric(15, 2) DEFAULT '0.00',
	"credit_amount" numeric(15, 2) DEFAULT '0.00',
	"vat_rate" numeric(5, 2) DEFAULT '0.00',
	"vat_inclusive" boolean DEFAULT false,
	"vat_amount" numeric(10, 2) DEFAULT '0.00',
	"reference" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "labour_compliance" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"compliance_type" text NOT NULL,
	"period" text NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'pending',
	"filed_date" date,
	"reference_number" text,
	"contribution_amount" numeric(12, 2),
	"penalty_amount" numeric(12, 2),
	"interest_amount" numeric(12, 2),
	"total_amount" numeric(12, 2),
	"payment_status" text DEFAULT 'pending',
	"employee_count" integer,
	"payroll_amount" numeric(12, 2),
	"documents" text[],
	"returns" text[],
	"assigned_to" integer,
	"reviewed_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "number_sequences" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"document_type" text NOT NULL,
	"prefix" text DEFAULT '' NOT NULL,
	"next_number" integer DEFAULT 1 NOT NULL,
	"format" text DEFAULT 'prefix-year-number' NOT NULL,
	"year_reset" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "number_sequences_company_id_document_type_unique" UNIQUE("company_id","document_type")
);
--> statement-breakpoint
CREATE TABLE "onboarding_workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"step_name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending',
	"required_documents" text[],
	"submitted_documents" text[],
	"assigned_to" integer,
	"due_date" date,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payfast_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"payfast_payment_id" text,
	"merchant_id" text NOT NULL,
	"merchant_key" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"item_name" text NOT NULL,
	"item_description" text,
	"return_url" text NOT NULL,
	"cancel_url" text NOT NULL,
	"notify_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payfast_data" text,
	"signature" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	CONSTRAINT "payfast_payments_payfast_payment_id_unique" UNIQUE("payfast_payment_id")
);
--> statement-breakpoint
CREATE TABLE "payment_exceptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"exception_type" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"detected_amount" numeric(15, 2),
	"expected_amount" numeric(15, 2),
	"variance_amount" numeric(15, 2),
	"auto_detected" boolean DEFAULT true,
	"payment_hold" boolean DEFAULT false,
	"requires_approval" boolean DEFAULT false,
	"detected_by" integer,
	"assigned_to" integer,
	"resolved_by" integer,
	"resolution" text,
	"escalated_to" integer,
	"escalation_reason" text,
	"due_date" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"bank_account_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"payment_date" timestamp DEFAULT now(),
	"reference" text,
	"notes" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permission_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"changed_by" integer NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" integer,
	"old_value" jsonb,
	"new_value" jsonb,
	"reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pos_customer_loyalty" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"program_id" integer NOT NULL,
	"card_number" varchar(20),
	"current_points" integer DEFAULT 0,
	"total_points_earned" integer DEFAULT 0,
	"total_points_redeemed" integer DEFAULT 0,
	"last_earned_date" timestamp,
	"last_redeemed_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pos_customer_loyalty_customer_id_program_id_unique" UNIQUE("customer_id","program_id")
);
--> statement-breakpoint
CREATE TABLE "pos_loyalty_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"points_per_rand" numeric(5, 2) DEFAULT '1.00',
	"reward_threshold" integer DEFAULT 100,
	"reward_value" numeric(10, 2) DEFAULT '10.00',
	"expiry_days" integer DEFAULT 365,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pos_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"bank_account_id" integer,
	"payment_method" varchar(20) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reference" varchar(100),
	"card_type" varchar(20),
	"card_last4" varchar(4),
	"auth_code" varchar(20),
	"status" varchar(20) DEFAULT 'completed',
	"processing_fee" numeric(10, 2) DEFAULT '0.00',
	"net_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pos_promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"type" varchar(20) NOT NULL,
	"value" numeric(10, 2),
	"min_purchase" numeric(10, 2) DEFAULT '0.00',
	"applicable_products" jsonb DEFAULT '[]'::jsonb,
	"applicable_categories" jsonb DEFAULT '[]'::jsonb,
	"start_date" timestamp,
	"end_date" timestamp,
	"start_time" varchar(8),
	"end_time" varchar(8),
	"days_of_week" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"usage_limit" integer,
	"total_usage_limit" integer,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pos_refund_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"refund_id" integer NOT NULL,
	"original_item_id" integer NOT NULL,
	"quantity_refunded" numeric(10, 3) NOT NULL,
	"refund_amount" numeric(10, 2) NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pos_refunds" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"original_sale_id" integer NOT NULL,
	"refund_number" varchar(50) NOT NULL,
	"user_id" integer NOT NULL,
	"refund_amount" numeric(10, 2) NOT NULL,
	"refund_method" varchar(20) NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'completed',
	"authorization_code" varchar(50),
	"authorized_by" integer,
	"refund_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pos_sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"product_id" integer,
	"barcode" varchar(50),
	"description" text NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount_percent" numeric(5, 2) DEFAULT '0.00',
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"vat_inclusive" boolean DEFAULT false,
	"vat_amount" numeric(10, 2) NOT NULL,
	"line_total" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pos_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"terminal_id" integer,
	"sale_number" varchar(50) NOT NULL,
	"customer_id" integer,
	"user_id" integer NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"vat_amount" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"payment_method" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'completed',
	"receipt_number" varchar(50),
	"notes" text,
	"is_voided" boolean DEFAULT false,
	"void_reason" text,
	"voided_by" integer,
	"voided_at" timestamp,
	"sale_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pos_shifts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"terminal_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"opening_cash" numeric(10, 2) DEFAULT '0.00',
	"closing_cash" numeric(10, 2),
	"expected_cash" numeric(10, 2),
	"cash_variance" numeric(10, 2),
	"total_sales" numeric(10, 2) DEFAULT '0.00',
	"total_transactions" integer DEFAULT 0,
	"notes" text,
	"status" varchar(20) DEFAULT 'open',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pos_terminals" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"terminal_name" varchar(100) NOT NULL,
	"location" varchar(100),
	"serial_number" varchar(50),
	"ip_address" varchar(45),
	"is_active" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"rule_type" text NOT NULL,
	"conditions" json,
	"discount" json,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"valid_from" timestamp DEFAULT now(),
	"valid_to" timestamp,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"logo_path" text,
	"website" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_bundles" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"bundle_product_id" integer NOT NULL,
	"component_product_id" integer NOT NULL,
	"component_variant_id" integer,
	"quantity" numeric(10, 3) NOT NULL,
	"unit_cost" numeric(10, 2),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "product_bundles_bundle_product_id_component_product_id_component_variant_id_unique" UNIQUE("bundle_product_id","component_product_id","component_variant_id")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_category_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_lots" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer,
	"lot_number" text NOT NULL,
	"batch_number" text,
	"manufacture_date" timestamp,
	"expiry_date" timestamp,
	"supplier_ref" text,
	"quantity" integer DEFAULT 0,
	"reserved_quantity" integer DEFAULT 0,
	"available_quantity" integer DEFAULT 0,
	"cost_per_unit" numeric(10, 2),
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_lots_company_id_product_id_lot_number_unique" UNIQUE("company_id","product_id","lot_number")
);
--> statement-breakpoint
CREATE TABLE "product_serials" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer,
	"lot_id" integer,
	"serial_number" text NOT NULL,
	"status" text DEFAULT 'available',
	"warehouse_id" integer,
	"customer_invoice_id" integer,
	"warranty_start_date" timestamp,
	"warranty_end_date" timestamp,
	"cost_per_unit" numeric(10, 2),
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_serials_company_id_serial_number_unique" UNIQUE("company_id","serial_number")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"parent_product_id" integer NOT NULL,
	"variant_name" text NOT NULL,
	"variant_sku" text,
	"barcode" text,
	"unit_price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2) DEFAULT '0.00',
	"stock_quantity" integer DEFAULT 0,
	"reserved_quantity" integer DEFAULT 0,
	"reorder_point" integer DEFAULT 0,
	"weight" numeric(10, 3),
	"dimensions" text,
	"variant_attributes" jsonb DEFAULT '{}'::jsonb,
	"image_path" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_variants_variant_sku_unique" UNIQUE("variant_sku"),
	CONSTRAINT "product_variants_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sku" text,
	"barcode" text,
	"category_id" integer,
	"brand" text,
	"unit_price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2) DEFAULT '0.00',
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"stock_quantity" integer DEFAULT 0,
	"min_stock_level" integer DEFAULT 0,
	"max_stock_level" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_service" boolean DEFAULT false,
	"image_path" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"vat_inclusive" boolean DEFAULT false,
	"income_account_id" integer,
	"expense_account_id" integer,
	"manufacturer" text,
	"weight" numeric(10, 2),
	"dimensions" text,
	"warranty_period" integer,
	"location" text,
	"supplier_code" text,
	"bundle_type" text,
	"track_inventory" boolean DEFAULT true,
	"track_serials" boolean DEFAULT false,
	"track_lots" boolean DEFAULT false,
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "project_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"task_id" integer,
	"uploaded_by" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'member',
	"hourly_rate" numeric(10, 2),
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_members_project_id_user_id_unique" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "project_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false,
	"template_data" jsonb NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'active',
	"priority" varchar(20) DEFAULT 'medium',
	"start_date" date,
	"end_date" date,
	"estimated_hours" numeric(10, 2),
	"actual_hours" numeric(10, 2) DEFAULT '0',
	"budget_amount" numeric(10, 2),
	"actual_cost" numeric(10, 2) DEFAULT '0',
	"hourly_rate" numeric(10, 2),
	"is_internal" boolean DEFAULT false,
	"project_manager_id" integer,
	"color" varchar(7) DEFAULT '#3B82F6',
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"vat_inclusive" boolean DEFAULT false,
	"vat_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"expense_category" text DEFAULT 'office_supplies',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"order_number" text NOT NULL,
	"supplier_id" integer NOT NULL,
	"order_date" timestamp NOT NULL,
	"delivery_date" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"vat_amount" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_requisition_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"requisition_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"estimated_unit_price" numeric(10, 2),
	"estimated_total" numeric(10, 2),
	"suggested_supplier_id" integer,
	"urgency" text DEFAULT 'normal',
	"specifications" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_requisitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"requisition_number" text NOT NULL,
	"requested_by" integer NOT NULL,
	"department" text,
	"request_date" timestamp NOT NULL,
	"required_date" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"priority" text DEFAULT 'normal',
	"justification" text,
	"total_estimated_cost" numeric(10, 2) DEFAULT '0.00',
	"approved_by" integer,
	"approved_at" timestamp,
	"rejected_by" integer,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"converted_to_purchase_order_id" integer,
	"converted_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "purchase_requisitions_company_id_requisition_number_unique" UNIQUE("company_id","requisition_number")
);
--> statement-breakpoint
CREATE TABLE "quote_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"estimate_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"viewer_email" text,
	"viewer_ip" text,
	"user_agent" text,
	"time_spent" integer,
	"page_views" integer DEFAULT 1,
	"device_type" text,
	"location" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"estimate_id" integer,
	"session_id" text,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"view_duration" integer,
	"section_viewed" text,
	"device_type" text,
	"location" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"template" json,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_billing" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"billing_frequency" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"next_billing_date" date NOT NULL,
	"last_billed_date" date,
	"status" text DEFAULT 'active',
	"payment_method" text,
	"payment_reference" text,
	"invoice_template" text,
	"auto_send" boolean DEFAULT true,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"template_name" text NOT NULL,
	"supplier_id" integer,
	"description" text NOT NULL,
	"category_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"vat_type" text DEFAULT 'No VAT' NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"frequency" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"next_due_date" date NOT NULL,
	"auto_approve" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"reminder_days" integer DEFAULT 7,
	"notes" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"template_invoice_id" integer,
	"customer_id" integer,
	"frequency" text NOT NULL,
	"interval_count" integer DEFAULT 1,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"next_invoice_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reorder_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer,
	"warehouse_id" integer,
	"supplier_id" integer,
	"reorder_point" integer NOT NULL,
	"reorder_quantity" integer NOT NULL,
	"max_stock_level" integer,
	"lead_time_days" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"last_order_date" timestamp,
	"next_review_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "reorder_rules_company_id_product_id_warehouse_id_variant_id_unique" UNIQUE("company_id","product_id","warehouse_id","variant_id")
);
--> statement-breakpoint
CREATE TABLE "sales_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"type" text NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"customer_id" integer,
	"lead_id" integer,
	"opportunity_id" integer,
	"estimate_id" integer,
	"sales_order_id" integer,
	"assigned_to" integer,
	"scheduled_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"outcome" text,
	"next_action" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"attachments" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales_forecasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"forecast_name" text NOT NULL,
	"period" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"target_revenue" numeric(12, 2) NOT NULL,
	"forecasted_revenue" numeric(12, 2) NOT NULL,
	"actual_revenue" numeric(12, 2) DEFAULT '0.00',
	"confidence" integer DEFAULT 75 NOT NULL,
	"methodology" text DEFAULT 'pipeline' NOT NULL,
	"notes" text,
	"created_by" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"lead_number" text NOT NULL,
	"title" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"source" text DEFAULT 'website' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"score" integer DEFAULT 0,
	"estimated_value" numeric(10, 2),
	"estimated_close_date" timestamp,
	"assigned_to" integer,
	"notes" text,
	"tags" text[],
	"custom_fields" json,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"converted_to_customer_id" integer,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sales_leads_company_id_lead_number_unique" UNIQUE("company_id","lead_number")
);
--> statement-breakpoint
CREATE TABLE "sales_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"opportunity_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"lead_id" integer,
	"customer_id" integer,
	"stage_id" integer NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"probability" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"expected_close_date" timestamp,
	"actual_close_date" timestamp,
	"assigned_to" integer NOT NULL,
	"source" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"lost_reason" text,
	"tags" text[],
	"custom_fields" json,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sales_opportunities_company_id_opportunity_number_unique" UNIQUE("company_id","opportunity_number")
);
--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"sales_order_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"vat_inclusive" boolean DEFAULT false,
	"vat_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"order_number" text NOT NULL,
	"customer_id" integer NOT NULL,
	"estimate_id" integer,
	"order_date" timestamp NOT NULL,
	"required_date" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"vat_amount" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"confirmed_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"completed_at" timestamp,
	"confirmed_by" integer,
	"shipped_by" integer,
	"delivered_by" integer,
	"completed_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sales_orders_company_id_order_number_unique" UNIQUE("company_id","order_number")
);
--> statement-breakpoint
CREATE TABLE "sales_pipeline_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"probability" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"color" text DEFAULT '#3B82F6' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sars_compliance" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"compliance_type" text NOT NULL,
	"period" text NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'pending',
	"filed_date" date,
	"payment_due_date" date,
	"payment_amount" numeric(12, 2),
	"payment_status" text DEFAULT 'pending',
	"efiling_reference" text,
	"efiling_status" text,
	"efiling_response" jsonb,
	"documents" text[],
	"workpapers" text[],
	"assessment_amount" numeric(12, 2),
	"penalty_amount" numeric(12, 2),
	"interest_amount" numeric(12, 2),
	"assigned_to" integer,
	"reviewed_by" integer,
	"approved_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sars_vendor_config" (
	"id" varchar PRIMARY KEY NOT NULL,
	"isv_number" varchar(50) NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"client_secret" varchar(255) NOT NULL,
	"api_key" varchar(255) NOT NULL,
	"api_url" varchar(255) DEFAULT 'https://secure.sarsefiling.co.za/api/v1' NOT NULL,
	"environment" varchar(20) DEFAULT 'sandbox' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sars_vendor_config_isv_number_unique" UNIQUE("isv_number")
);
--> statement-breakpoint
CREATE TABLE "security_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"metadata" json DEFAULT '{}'::json,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"assigned_to" integer,
	"resolved_at" timestamp,
	"resolved_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"event_type" text NOT NULL,
	"severity" text DEFAULT 'low',
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "security_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"policy_type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"rules" json DEFAULT '[]'::json,
	"is_active" boolean DEFAULT true,
	"enforcement_level" varchar(20) DEFAULT 'warning',
	"last_reviewed_at" timestamp,
	"reviewed_by" integer,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "security_scans" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"scan_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"risk_level" varchar(20),
	"findings" json DEFAULT '[]'::json,
	"recommendation" text,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sms_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"user_id" integer,
	"phone_number" text NOT NULL,
	"message" text NOT NULL,
	"sms_type" text NOT NULL,
	"priority" integer DEFAULT 5,
	"status" text DEFAULT 'pending',
	"attempts" integer DEFAULT 0,
	"error_message" text,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spending_wizard_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'active',
	"last_message" text,
	"message_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spending_wizard_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"insight_type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"priority" varchar(50) DEFAULT 'medium',
	"category" varchar(100) NOT NULL,
	"data_points" jsonb NOT NULL,
	"recommendations" jsonb DEFAULT '[]',
	"estimated_impact" numeric(12, 2),
	"implementation_effort" varchar(50) DEFAULT 'medium',
	"status" varchar(50) DEFAULT 'new',
	"illustration" varchar(255),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spending_wizard_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"message_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"advice_type" varchar(100),
	"illustration" varchar(255),
	"actionable" boolean DEFAULT false,
	"action_data" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spending_wizard_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"business_type" varchar(100) NOT NULL,
	"monthly_revenue" numeric(12, 2),
	"monthly_expenses" numeric(12, 2),
	"financial_goals" jsonb DEFAULT '[]',
	"risk_tolerance" varchar(50) DEFAULT 'moderate',
	"preferences" jsonb DEFAULT '{}',
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spending_wizard_tips" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"business_type" varchar(100) DEFAULT 'general',
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"illustration" varchar(255),
	"priority" integer DEFAULT 5,
	"is_active" boolean DEFAULT true,
	"seasonality" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_count_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"stock_count_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer,
	"lot_id" integer,
	"expected_quantity" integer DEFAULT 0,
	"counted_quantity" integer,
	"variance" integer DEFAULT 0,
	"unit_cost" numeric(10, 2),
	"variance_value" numeric(10, 2) DEFAULT '0.00',
	"counted_by" integer,
	"counted_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_counts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"count_number" text NOT NULL,
	"warehouse_id" integer,
	"count_type" text DEFAULT 'full',
	"status" text DEFAULT 'draft',
	"count_date" timestamp DEFAULT now(),
	"scheduled_date" timestamp,
	"started_by" integer,
	"completed_by" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"total_items_counted" integer DEFAULT 0,
	"total_variances" integer DEFAULT 0,
	"total_adjustment_value" numeric(10, 2) DEFAULT '0.00',
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "stock_counts_company_id_count_number_unique" UNIQUE("company_id","count_number")
);
--> statement-breakpoint
CREATE TABLE "subscription_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"billing_period" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text DEFAULT 'payfast' NOT NULL,
	"payment_reference" text,
	"description" text,
	"paid_amount" numeric(10, 2),
	"created_by" integer NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"monthly_price" numeric(10, 2) NOT NULL,
	"annual_price" numeric(10, 2) NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"limits" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscription_plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "supplier_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"purchase_order_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"payment_date" timestamp DEFAULT now(),
	"reference" text,
	"notes" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"postal_code" text,
	"vat_number" text,
	"payment_terms" integer DEFAULT 30,
	"category" text DEFAULT 'standard',
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT true,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"project_id" integer,
	"customer_id" integer,
	"parent_task_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'todo',
	"priority" varchar(20) DEFAULT 'medium',
	"assigned_to_id" integer,
	"start_date" date,
	"due_date" date,
	"completed_date" date,
	"estimated_hours" numeric(10, 2),
	"actual_hours" numeric(10, 2) DEFAULT '0',
	"is_internal" boolean DEFAULT false,
	"is_billable" boolean DEFAULT true,
	"hourly_rate" numeric(10, 2),
	"progress" integer DEFAULT 0,
	"tags" jsonb,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"task_id" integer,
	"customer_id" integer,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer,
	"is_billable" boolean DEFAULT true,
	"hourly_rate" numeric(10, 2),
	"amount" numeric(10, 2),
	"is_running" boolean DEFAULT false,
	"invoice_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"namespace" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"is_system_translation" boolean DEFAULT true,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "translations_language_namespace_key_unique" UNIQUE("language","namespace","key")
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"system_role_id" integer,
	"company_role_id" integer,
	"custom_permissions" jsonb DEFAULT '[]'::jsonb,
	"denied_permissions" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"granted_by" integer,
	"granted_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_permissions_user_id_company_id_unique" UNIQUE("user_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"permissions" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"last_activity" timestamp DEFAULT now(),
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"permissions" text[] DEFAULT '{}',
	"active_company_id" integer,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"password_changed_at" timestamp DEFAULT now(),
	"two_factor_enabled" boolean DEFAULT false,
	"two_factor_secret" text,
	"two_factor_backup_codes" jsonb DEFAULT '[]'::jsonb,
	"phone_number" text,
	"phone_verified" boolean DEFAULT false,
	"sms_notifications" boolean DEFAULT false,
	"google_id" text,
	"microsoft_id" text,
	"oauth_providers" jsonb DEFAULT '[]'::jsonb,
	"email_notifications" boolean DEFAULT true,
	"notification_preferences" jsonb DEFAULT '{}'::jsonb,
	"language" text DEFAULT 'en',
	"timezone" text DEFAULT 'Africa/Johannesburg',
	"theme" text DEFAULT 'light',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vat_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"report_type" varchar(20) DEFAULT 'VAT201',
	"total_sales_inc_vat" numeric(15, 2) DEFAULT '0.00',
	"total_sales_exc_vat" numeric(15, 2) DEFAULT '0.00',
	"total_sales_vat" numeric(15, 2) DEFAULT '0.00',
	"zero_rated_sales" numeric(15, 2) DEFAULT '0.00',
	"exempt_sales" numeric(15, 2) DEFAULT '0.00',
	"total_purchases_inc_vat" numeric(15, 2) DEFAULT '0.00',
	"total_purchases_exc_vat" numeric(15, 2) DEFAULT '0.00',
	"total_purchases_vat" numeric(15, 2) DEFAULT '0.00',
	"output_vat" numeric(15, 2) DEFAULT '0.00',
	"input_vat" numeric(15, 2) DEFAULT '0.00',
	"net_vat_payable" numeric(15, 2) DEFAULT '0.00',
	"net_vat_refund" numeric(15, 2) DEFAULT '0.00',
	"bad_debt_relief_claimed" numeric(15, 2) DEFAULT '0.00',
	"adjustments_to_previous_returns" numeric(15, 2) DEFAULT '0.00',
	"status" varchar(20) DEFAULT 'draft',
	"submitted_at" timestamp,
	"submitted_by" integer,
	"approved_at" timestamp,
	"approved_by" integer,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vat_reports_company_id_period_start_period_end_unique" UNIQUE("company_id","period_start","period_end")
);
--> statement-breakpoint
CREATE TABLE "vat_returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_sales" numeric(10, 2) NOT NULL,
	"total_vat_sales" numeric(10, 2) NOT NULL,
	"total_purchases" numeric(10, 2) NOT NULL,
	"total_vat_purchases" numeric(10, 2) NOT NULL,
	"vat_payable" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vat_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"transaction_type" varchar(20) NOT NULL,
	"source_module" varchar(50) NOT NULL,
	"source_id" integer NOT NULL,
	"vat_type_id" integer,
	"net_amount" numeric(15, 2) NOT NULL,
	"vat_amount" numeric(15, 2) NOT NULL,
	"gross_amount" numeric(15, 2) NOT NULL,
	"vat_rate" numeric(5, 2) NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"description" text,
	"customer_supplier_id" integer,
	"vat_period_start" date,
	"vat_period_end" date,
	"included_in_return" boolean DEFAULT false,
	"vat_report_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vat_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"rate" numeric(5, 2) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"is_system_type" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vat_types_company_id_code_unique" UNIQUE("company_id","code")
);
--> statement-breakpoint
CREATE TABLE "vendor_master_validation" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"validation_type" varchar(50) NOT NULL,
	"validation_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"old_value" text,
	"new_value" text,
	"validation_notes" text,
	"validated_by" integer,
	"validated_at" timestamp,
	"alert_generated" boolean DEFAULT false,
	"requires_review" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_stock" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer,
	"warehouse_id" integer NOT NULL,
	"quantity" integer DEFAULT 0,
	"reserved_quantity" integer DEFAULT 0,
	"available_quantity" integer DEFAULT 0,
	"min_stock_level" integer DEFAULT 0,
	"max_stock_level" integer DEFAULT 0,
	"last_restock_date" timestamp,
	"last_count_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "warehouse_stock_product_id_warehouse_id_variant_id_unique" UNIQUE("product_id","warehouse_id","variant_id")
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"manager_id" integer,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "warehouses_company_id_code_unique" UNIQUE("company_id","code")
);
--> statement-breakpoint
CREATE TABLE "workflow_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_id" integer NOT NULL,
	"trigger_data" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'pending',
	"error_message" text,
	"executed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger_type" text NOT NULL,
	"trigger_conditions" jsonb DEFAULT '{}'::jsonb,
	"actions" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_reports" ADD CONSTRAINT "advanced_reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_reports" ADD CONSTRAINT "advanced_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_workflow_id_approval_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."approval_workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_workflows" ADD CONSTRAINT "approval_workflows_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_workflows" ADD CONSTRAINT "approval_workflows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_chart_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("chart_account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_feed_cursors" ADD CONSTRAINT "bank_feed_cursors_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_integrations" ADD CONSTRAINT "bank_integrations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_integrations" ADD CONSTRAINT "bank_integrations_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliation_items" ADD CONSTRAINT "bank_reconciliation_items_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliation_items" ADD CONSTRAINT "bank_reconciliation_items_reconciliation_id_bank_reconciliations_id_fk" FOREIGN KEY ("reconciliation_id") REFERENCES "public"."bank_reconciliations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliation_items" ADD CONSTRAINT "bank_reconciliation_items_transaction_id_bank_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."bank_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_reconciled_by_users_id_fk" FOREIGN KEY ("reconciled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_import_batch_id_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."import_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_goods_receipt_id_goods_receipts_id_fk" FOREIGN KEY ("goods_receipt_id") REFERENCES "public"."goods_receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_flow_forecast_lines" ADD CONSTRAINT "cash_flow_forecast_lines_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_flow_forecast_lines" ADD CONSTRAINT "cash_flow_forecast_lines_forecast_id_cash_flow_forecasts_id_fk" FOREIGN KEY ("forecast_id") REFERENCES "public"."cash_flow_forecasts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_flow_forecasts" ADD CONSTRAINT "cash_flow_forecasts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_flow_forecasts" ADD CONSTRAINT "cash_flow_forecasts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("parent_account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_history" ADD CONSTRAINT "communication_history_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_history" ADD CONSTRAINT "communication_history_lead_id_sales_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."sales_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_history" ADD CONSTRAINT "communication_history_sent_by_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_templates" ADD CONSTRAINT "communication_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_chart_of_accounts" ADD CONSTRAINT "company_chart_of_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_chart_of_accounts" ADD CONSTRAINT "company_chart_of_accounts_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_chart_of_accounts" ADD CONSTRAINT "company_chart_of_accounts_activated_by_users_id_fk" FOREIGN KEY ("activated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_chart_of_accounts" ADD CONSTRAINT "company_chart_of_accounts_deactivated_by_users_id_fk" FOREIGN KEY ("deactivated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_sars_link" ADD CONSTRAINT "company_sars_link_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_note_items" ADD CONSTRAINT "credit_note_items_credit_note_id_credit_notes_id_fk" FOREIGN KEY ("credit_note_id") REFERENCES "public"."credit_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_note_items" ADD CONSTRAINT "credit_note_items_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_note_items" ADD CONSTRAINT "credit_note_items_original_invoice_item_id_invoice_items_id_fk" FOREIGN KEY ("original_invoice_item_id") REFERENCES "public"."invoice_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_note_items" ADD CONSTRAINT "credit_note_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_note_items" ADD CONSTRAINT "credit_note_items_vat_type_id_vat_types_id_fk" FOREIGN KEY ("vat_type_id") REFERENCES "public"."vat_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_original_invoice_id_invoices_id_fk" FOREIGN KEY ("original_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_insights" ADD CONSTRAINT "customer_insights_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_lifecycle_events" ADD CONSTRAINT "customer_lifecycle_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_lifecycle_events" ADD CONSTRAINT "customer_lifecycle_events_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_price_lists" ADD CONSTRAINT "customer_price_lists_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_price_lists" ADD CONSTRAINT "customer_price_lists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_segment_membership" ADD CONSTRAINT "customer_segment_membership_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_segment_membership" ADD CONSTRAINT "customer_segment_membership_segment_id_customer_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."customer_segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_segment_membership" ADD CONSTRAINT "customer_segment_membership_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_segments" ADD CONSTRAINT "customer_segments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "depreciation_records" ADD CONSTRAINT "depreciation_records_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "depreciation_records" ADD CONSTRAINT "depreciation_records_asset_id_fixed_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."fixed_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "depreciation_records" ADD CONSTRAINT "depreciation_records_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_reminders" ADD CONSTRAINT "email_reminders_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exception_alerts" ADD CONSTRAINT "exception_alerts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exception_alerts" ADD CONSTRAINT "exception_alerts_exception_id_payment_exceptions_id_fk" FOREIGN KEY ("exception_id") REFERENCES "public"."payment_exceptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exception_alerts" ADD CONSTRAINT "exception_alerts_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exception_escalations" ADD CONSTRAINT "exception_escalations_exception_id_payment_exceptions_id_fk" FOREIGN KEY ("exception_id") REFERENCES "public"."payment_exceptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exception_escalations" ADD CONSTRAINT "exception_escalations_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exception_escalations" ADD CONSTRAINT "exception_escalations_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_approvals" ADD CONSTRAINT "expense_approvals_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_approvals" ADD CONSTRAINT "expense_approvals_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD CONSTRAINT "fixed_assets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "general_ledger" ADD CONSTRAINT "general_ledger_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "general_ledger" ADD CONSTRAINT "general_ledger_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "general_ledger" ADD CONSTRAINT "general_ledger_journal_entry_line_id_journal_entry_lines_id_fk" FOREIGN KEY ("journal_entry_line_id") REFERENCES "public"."journal_entry_lines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_goods_receipt_id_goods_receipts_id_fk" FOREIGN KEY ("goods_receipt_id") REFERENCES "public"."goods_receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_purchase_order_item_id_purchase_order_items_id_fk" FOREIGN KEY ("purchase_order_item_id") REFERENCES "public"."purchase_order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_queue" ADD CONSTRAINT "import_queue_import_batch_id_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."import_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_queue" ADD CONSTRAINT "import_queue_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_lot_id_product_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."product_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_aging_reports" ADD CONSTRAINT "invoice_aging_reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_aging_reports" ADD CONSTRAINT "invoice_aging_reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_reminders" ADD CONSTRAINT "invoice_reminders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_reminders" ADD CONSTRAINT "invoice_reminders_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_reminders" ADD CONSTRAINT "invoice_reminders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_reversal_entry_id_journal_entries_id_fk" FOREIGN KEY ("reversal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_exceptions" ADD CONSTRAINT "payment_exceptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_exceptions" ADD CONSTRAINT "payment_exceptions_detected_by_users_id_fk" FOREIGN KEY ("detected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_exceptions" ADD CONSTRAINT "payment_exceptions_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_exceptions" ADD CONSTRAINT "payment_exceptions_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_exceptions" ADD CONSTRAINT "payment_exceptions_escalated_to_users_id_fk" FOREIGN KEY ("escalated_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_customer_loyalty" ADD CONSTRAINT "pos_customer_loyalty_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_customer_loyalty" ADD CONSTRAINT "pos_customer_loyalty_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_customer_loyalty" ADD CONSTRAINT "pos_customer_loyalty_program_id_pos_loyalty_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."pos_loyalty_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_loyalty_programs" ADD CONSTRAINT "pos_loyalty_programs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_payments" ADD CONSTRAINT "pos_payments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_payments" ADD CONSTRAINT "pos_payments_sale_id_pos_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."pos_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_payments" ADD CONSTRAINT "pos_payments_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_promotions" ADD CONSTRAINT "pos_promotions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_refund_items" ADD CONSTRAINT "pos_refund_items_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_refund_items" ADD CONSTRAINT "pos_refund_items_refund_id_pos_refunds_id_fk" FOREIGN KEY ("refund_id") REFERENCES "public"."pos_refunds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_refund_items" ADD CONSTRAINT "pos_refund_items_original_item_id_pos_sale_items_id_fk" FOREIGN KEY ("original_item_id") REFERENCES "public"."pos_sale_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_refunds" ADD CONSTRAINT "pos_refunds_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_refunds" ADD CONSTRAINT "pos_refunds_original_sale_id_pos_sales_id_fk" FOREIGN KEY ("original_sale_id") REFERENCES "public"."pos_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_refunds" ADD CONSTRAINT "pos_refunds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_refunds" ADD CONSTRAINT "pos_refunds_authorized_by_users_id_fk" FOREIGN KEY ("authorized_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sale_items" ADD CONSTRAINT "pos_sale_items_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sale_items" ADD CONSTRAINT "pos_sale_items_sale_id_pos_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."pos_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sale_items" ADD CONSTRAINT "pos_sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_terminal_id_pos_terminals_id_fk" FOREIGN KEY ("terminal_id") REFERENCES "public"."pos_terminals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_voided_by_users_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_shifts" ADD CONSTRAINT "pos_shifts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_shifts" ADD CONSTRAINT "pos_shifts_terminal_id_pos_terminals_id_fk" FOREIGN KEY ("terminal_id") REFERENCES "public"."pos_terminals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_shifts" ADD CONSTRAINT "pos_shifts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_terminals" ADD CONSTRAINT "pos_terminals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_bundles" ADD CONSTRAINT "product_bundles_bundle_product_id_products_id_fk" FOREIGN KEY ("bundle_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_bundles" ADD CONSTRAINT "product_bundles_component_product_id_products_id_fk" FOREIGN KEY ("component_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_bundles" ADD CONSTRAINT "product_bundles_component_variant_id_product_variants_id_fk" FOREIGN KEY ("component_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_lots" ADD CONSTRAINT "product_lots_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_lots" ADD CONSTRAINT "product_lots_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_lot_id_product_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."product_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_customer_invoice_id_invoices_id_fk" FOREIGN KEY ("customer_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_parent_product_id_products_id_fk" FOREIGN KEY ("parent_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_templates" ADD CONSTRAINT "project_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_templates" ADD CONSTRAINT "project_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_manager_id_users_id_fk" FOREIGN KEY ("project_manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_requisition_id_purchase_requisitions_id_fk" FOREIGN KEY ("requisition_id") REFERENCES "public"."purchase_requisitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_suggested_supplier_id_suppliers_id_fk" FOREIGN KEY ("suggested_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_converted_to_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("converted_to_purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_analytics" ADD CONSTRAINT "quote_analytics_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_interactions" ADD CONSTRAINT "quote_interactions_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_template_invoice_id_invoices_id_fk" FOREIGN KEY ("template_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_lead_id_sales_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."sales_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_opportunity_id_sales_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."sales_opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_forecasts" ADD CONSTRAINT "sales_forecasts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_leads" ADD CONSTRAINT "sales_leads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_leads" ADD CONSTRAINT "sales_leads_converted_to_customer_id_customers_id_fk" FOREIGN KEY ("converted_to_customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_opportunities" ADD CONSTRAINT "sales_opportunities_lead_id_sales_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."sales_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_opportunities" ADD CONSTRAINT "sales_opportunities_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_opportunities" ADD CONSTRAINT "sales_opportunities_stage_id_sales_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."sales_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_opportunities" ADD CONSTRAINT "sales_opportunities_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_shipped_by_users_id_fk" FOREIGN KEY ("shipped_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_delivered_by_users_id_fk" FOREIGN KEY ("delivered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_alerts" ADD CONSTRAINT "security_alerts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_alerts" ADD CONSTRAINT "security_alerts_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_alerts" ADD CONSTRAINT "security_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_policies" ADD CONSTRAINT "security_policies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_policies" ADD CONSTRAINT "security_policies_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_policies" ADD CONSTRAINT "security_policies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_scans" ADD CONSTRAINT "security_scans_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_scans" ADD CONSTRAINT "security_scans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spending_wizard_conversations" ADD CONSTRAINT "spending_wizard_conversations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spending_wizard_conversations" ADD CONSTRAINT "spending_wizard_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spending_wizard_insights" ADD CONSTRAINT "spending_wizard_insights_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spending_wizard_insights" ADD CONSTRAINT "spending_wizard_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spending_wizard_messages" ADD CONSTRAINT "spending_wizard_messages_conversation_id_spending_wizard_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."spending_wizard_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spending_wizard_profiles" ADD CONSTRAINT "spending_wizard_profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spending_wizard_profiles" ADD CONSTRAINT "spending_wizard_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_stock_count_id_stock_counts_id_fk" FOREIGN KEY ("stock_count_id") REFERENCES "public"."stock_counts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_lot_id_product_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."product_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_counted_by_users_id_fk" FOREIGN KEY ("counted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_counts" ADD CONSTRAINT "stock_counts_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_counts" ADD CONSTRAINT "stock_counts_started_by_users_id_fk" FOREIGN KEY ("started_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_counts" ADD CONSTRAINT "stock_counts_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vat_reports" ADD CONSTRAINT "vat_reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vat_reports" ADD CONSTRAINT "vat_reports_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vat_reports" ADD CONSTRAINT "vat_reports_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vat_reports" ADD CONSTRAINT "vat_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vat_transactions" ADD CONSTRAINT "vat_transactions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vat_transactions" ADD CONSTRAINT "vat_transactions_vat_type_id_vat_types_id_fk" FOREIGN KEY ("vat_type_id") REFERENCES "public"."vat_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vat_transactions" ADD CONSTRAINT "vat_transactions_vat_report_id_vat_reports_id_fk" FOREIGN KEY ("vat_report_id") REFERENCES "public"."vat_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_master_validation" ADD CONSTRAINT "vendor_master_validation_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_master_validation" ADD CONSTRAINT "vendor_master_validation_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_master_validation" ADD CONSTRAINT "vendor_master_validation_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_balances_company_idx" ON "account_balances" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "account_balances_account_idx" ON "account_balances" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "account_balances_period_idx" ON "account_balances" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "advanced_reports_company_idx" ON "advanced_reports" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "advanced_reports_type_idx" ON "advanced_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "advanced_reports_schedule_idx" ON "advanced_reports" USING btree ("schedule");--> statement-breakpoint
CREATE INDEX "ai_assistant_conversations_user_idx" ON "ai_assistant_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_assistant_conversations_client_idx" ON "ai_assistant_conversations" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "ai_assistant_conversations_category_idx" ON "ai_assistant_conversations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "ai_assistant_messages_conversation_idx" ON "ai_assistant_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "ai_assistant_messages_role_idx" ON "ai_assistant_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "audit_logs_company_idx" ON "audit_logs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource","resource_id");--> statement-breakpoint
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "bank_accounts_company_idx" ON "bank_accounts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bank_accounts_provider_account_idx" ON "bank_accounts" USING btree ("provider_account_id");--> statement-breakpoint
CREATE INDEX "bank_feed_cursors_company_idx" ON "bank_feed_cursors" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bank_feed_cursors_bank_account_idx" ON "bank_feed_cursors" USING btree ("bank_account_id");--> statement-breakpoint
CREATE INDEX "bank_feed_cursors_external_account_idx" ON "bank_feed_cursors" USING btree ("external_account_id");--> statement-breakpoint
CREATE INDEX "bank_feed_cursors_provider_idx" ON "bank_feed_cursors" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "bank_reconciliation_items_company_idx" ON "bank_reconciliation_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bank_reconciliation_items_reconciliation_idx" ON "bank_reconciliation_items" USING btree ("reconciliation_id");--> statement-breakpoint
CREATE INDEX "bank_reconciliation_items_status_idx" ON "bank_reconciliation_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bank_statement_transactions_company_idx" ON "bank_statement_transactions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bank_statement_transactions_upload_idx" ON "bank_statement_transactions" USING btree ("upload_id");--> statement-breakpoint
CREATE INDEX "bank_statement_transactions_date_idx" ON "bank_statement_transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "bank_statement_transactions_matched_idx" ON "bank_statement_transactions" USING btree ("matched");--> statement-breakpoint
CREATE INDEX "bank_statement_uploads_company_idx" ON "bank_statement_uploads" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bank_statement_uploads_status_idx" ON "bank_statement_uploads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bank_transactions_company_idx" ON "bank_transactions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bank_transactions_bank_account_idx" ON "bank_transactions" USING btree ("bank_account_id");--> statement-breakpoint
CREATE INDEX "bank_transactions_posting_date_idx" ON "bank_transactions" USING btree ("posting_date");--> statement-breakpoint
CREATE INDEX "bank_transactions_import_batch_idx" ON "bank_transactions" USING btree ("import_batch_id");--> statement-breakpoint
CREATE INDEX "bank_transactions_dedup_idx" ON "bank_transactions" USING btree ("company_id","bank_account_id","posting_date","amount","normalized_description");--> statement-breakpoint
CREATE INDEX "bill_items_company_idx" ON "bill_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bill_items_bill_idx" ON "bill_items" USING btree ("bill_id");--> statement-breakpoint
CREATE INDEX "bills_company_idx" ON "bills" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bills_supplier_idx" ON "bills" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "bills_status_idx" ON "bills" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bills_approval_status_idx" ON "bills" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "bills_due_date_idx" ON "bills" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "bills_purchase_order_idx" ON "bills" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "budget_lines_company_idx" ON "budget_lines" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "budget_lines_budget_idx" ON "budget_lines" USING btree ("budget_id");--> statement-breakpoint
CREATE INDEX "budget_lines_account_idx" ON "budget_lines" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "budgets_company_idx" ON "budgets" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "budgets_status_idx" ON "budgets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "budgets_type_idx" ON "budgets" USING btree ("budget_type");--> statement-breakpoint
CREATE INDEX "bulk_capture_sessions_company_idx" ON "bulk_capture_sessions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bulk_capture_sessions_batch_idx" ON "bulk_capture_sessions" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "bulk_expense_entries_company_idx" ON "bulk_expense_entries" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bulk_expense_entries_session_idx" ON "bulk_expense_entries" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "bulk_expense_entries_batch_idx" ON "bulk_expense_entries" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "bulk_expense_entries_date_idx" ON "bulk_expense_entries" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "bulk_income_entries_company_idx" ON "bulk_income_entries" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "bulk_income_entries_session_idx" ON "bulk_income_entries" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "bulk_income_entries_batch_idx" ON "bulk_income_entries" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "bulk_income_entries_date_idx" ON "bulk_income_entries" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "cash_flow_forecast_lines_company_idx" ON "cash_flow_forecast_lines" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "cash_flow_forecast_lines_forecast_idx" ON "cash_flow_forecast_lines" USING btree ("forecast_id");--> statement-breakpoint
CREATE INDEX "cash_flow_forecast_lines_period_idx" ON "cash_flow_forecast_lines" USING btree ("period");--> statement-breakpoint
CREATE INDEX "cash_flow_forecast_lines_category_idx" ON "cash_flow_forecast_lines" USING btree ("category");--> statement-breakpoint
CREATE INDEX "cash_flow_forecasts_company_idx" ON "cash_flow_forecasts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "cash_flow_forecasts_type_idx" ON "cash_flow_forecasts" USING btree ("forecast_type");--> statement-breakpoint
CREATE INDEX "chart_accounts_company_idx" ON "chart_of_accounts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "chart_accounts_type_idx" ON "chart_of_accounts" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "chart_accounts_active_idx" ON "chart_of_accounts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "cipc_compliance_client_idx" ON "cipc_compliance" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "cipc_compliance_type_idx" ON "cipc_compliance" USING btree ("compliance_type");--> statement-breakpoint
CREATE INDEX "cipc_compliance_status_idx" ON "cipc_compliance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cipc_compliance_due_date_idx" ON "cipc_compliance" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "clients_company_idx" ON "clients" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "clients_status_idx" ON "clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "clients_assigned_idx" ON "clients" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "communication_history_company_idx" ON "communication_history" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "communication_history_customer_idx" ON "communication_history" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "communication_history_lead_idx" ON "communication_history" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "communication_history_channel_idx" ON "communication_history" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "communication_history_status_idx" ON "communication_history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "communication_history_sent_at_idx" ON "communication_history" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "communication_templates_company_idx" ON "communication_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "communication_templates_category_idx" ON "communication_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "communication_templates_channel_idx" ON "communication_templates" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "companies_slug_idx" ON "companies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "companies_active_idx" ON "companies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "company_coa_company_idx" ON "company_chart_of_accounts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_coa_account_idx" ON "company_chart_of_accounts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "company_coa_active_idx" ON "company_chart_of_accounts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "company_modules_company_idx" ON "company_modules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_modules_module_idx" ON "company_modules" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "company_roles_company_idx" ON "company_roles" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_subscriptions_company_idx" ON "company_subscriptions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_subscriptions_plan_idx" ON "company_subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "company_users_company_idx" ON "company_users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_users_user_idx" ON "company_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "compliance_calendar_event_date_idx" ON "compliance_calendar" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "compliance_calendar_client_idx" ON "compliance_calendar" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "compliance_calendar_type_idx" ON "compliance_calendar" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "compliance_calendar_assigned_idx" ON "compliance_calendar" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "compliance_documents_client_idx" ON "compliance_documents" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "compliance_documents_category_idx" ON "compliance_documents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "compliance_documents_status_idx" ON "compliance_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "compliance_documents_uploaded_idx" ON "compliance_documents" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "compliance_tasks_client_idx" ON "compliance_tasks" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "compliance_tasks_assigned_idx" ON "compliance_tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "compliance_tasks_status_idx" ON "compliance_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "compliance_tasks_due_date_idx" ON "compliance_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "compliance_tasks_type_idx" ON "compliance_tasks" USING btree ("task_type");--> statement-breakpoint
CREATE INDEX "correspondence_tracker_client_idx" ON "correspondence_tracker" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "correspondence_tracker_status_idx" ON "correspondence_tracker" USING btree ("status");--> statement-breakpoint
CREATE INDEX "correspondence_tracker_authority_idx" ON "correspondence_tracker" USING btree ("authority");--> statement-breakpoint
CREATE INDEX "correspondence_tracker_received_idx" ON "correspondence_tracker" USING btree ("received_date");--> statement-breakpoint
CREATE INDEX "currency_rates_company_idx" ON "currency_rates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "customer_insights_company_idx" ON "customer_insights" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "customer_insights_health_score_idx" ON "customer_insights" USING btree ("health_score");--> statement-breakpoint
CREATE INDEX "customer_insights_risk_level_idx" ON "customer_insights" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "customer_lifecycle_events_company_idx" ON "customer_lifecycle_events" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "customer_lifecycle_events_customer_idx" ON "customer_lifecycle_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_lifecycle_events_type_idx" ON "customer_lifecycle_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "customer_lifecycle_events_stage_idx" ON "customer_lifecycle_events" USING btree ("to_stage");--> statement-breakpoint
CREATE INDEX "customer_price_lists_company_idx" ON "customer_price_lists" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "customer_price_lists_customer_idx" ON "customer_price_lists" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_price_lists_product_idx" ON "customer_price_lists" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "customer_segment_membership_company_idx" ON "customer_segment_membership" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "customer_segment_membership_customer_idx" ON "customer_segment_membership" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_segment_membership_segment_idx" ON "customer_segment_membership" USING btree ("segment_id");--> statement-breakpoint
CREATE INDEX "customer_segments_company_idx" ON "customer_segments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "customer_segments_name_idx" ON "customer_segments" USING btree ("name");--> statement-breakpoint
CREATE INDEX "customers_company_idx" ON "customers" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "customers_lifecycle_idx" ON "customers" USING btree ("lifecycle_stage");--> statement-breakpoint
CREATE INDEX "customers_assigned_idx" ON "customers" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "deliveries_company_idx" ON "deliveries" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "deliveries_customer_idx" ON "deliveries" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "deliveries_sales_order_idx" ON "deliveries" USING btree ("sales_order_id");--> statement-breakpoint
CREATE INDEX "deliveries_status_idx" ON "deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "delivery_items_company_idx" ON "delivery_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "depreciation_records_company_idx" ON "depreciation_records" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "depreciation_records_asset_idx" ON "depreciation_records" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "depreciation_records_period_idx" ON "depreciation_records" USING btree ("period");--> statement-breakpoint
CREATE INDEX "digital_signatures_company_idx" ON "digital_signatures" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "digital_signatures_document_idx" ON "digital_signatures" USING btree ("document_type","document_id");--> statement-breakpoint
CREATE INDEX "digital_signatures_email_idx" ON "digital_signatures" USING btree ("signer_email");--> statement-breakpoint
CREATE INDEX "email_reminders_company_idx" ON "email_reminders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "engagement_letters_client_idx" ON "engagement_letters" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "engagement_letters_status_idx" ON "engagement_letters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "estimate_items_company_idx" ON "estimate_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "estimates_company_idx" ON "estimates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "estimates_customer_idx" ON "estimates" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "estimates_status_idx" ON "estimates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "estimates_expiry_idx" ON "estimates" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "expense_approvals_company_idx" ON "expense_approvals" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "expense_approvals_expense_idx" ON "expense_approvals" USING btree ("expense_id");--> statement-breakpoint
CREATE INDEX "expense_approvals_approver_idx" ON "expense_approvals" USING btree ("approver_id");--> statement-breakpoint
CREATE INDEX "expense_approvals_status_idx" ON "expense_approvals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expenses_company_idx" ON "expenses" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "expenses_supplier_idx" ON "expenses" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "expenses_bank_account_idx" ON "expenses" USING btree ("bank_account_id");--> statement-breakpoint
CREATE INDEX "expenses_date_idx" ON "expenses" USING btree ("expense_date");--> statement-breakpoint
CREATE INDEX "expenses_approval_status_idx" ON "expenses" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "expenses_purchase_order_idx" ON "expenses" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "expenses_recurring_idx" ON "expenses" USING btree ("recurring_expense_id");--> statement-breakpoint
CREATE INDEX "expenses_type_idx" ON "expenses" USING btree ("expense_type");--> statement-breakpoint
CREATE INDEX "expenses_internal_ref_idx" ON "expenses" USING btree ("internal_expense_ref");--> statement-breakpoint
CREATE INDEX "fixed_assets_company_idx" ON "fixed_assets" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "fixed_assets_status_idx" ON "fixed_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "goods_receipt_items_company_idx" ON "goods_receipt_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "goods_receipt_items_receipt_idx" ON "goods_receipt_items" USING btree ("goods_receipt_id");--> statement-breakpoint
CREATE INDEX "goods_receipts_company_idx" ON "goods_receipts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "goods_receipts_po_idx" ON "goods_receipts" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "goods_receipts_supplier_idx" ON "goods_receipts" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "id_tracking_entity_type_idx" ON "id_tracking" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "import_batches_company_idx" ON "import_batches" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "import_batches_bank_account_idx" ON "import_batches" USING btree ("bank_account_id");--> statement-breakpoint
CREATE INDEX "import_batches_batch_number_idx" ON "import_batches" USING btree ("batch_number");--> statement-breakpoint
CREATE INDEX "import_batches_status_idx" ON "import_batches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "import_batches_uploaded_by_idx" ON "import_batches" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "import_queue_import_batch_idx" ON "import_queue" USING btree ("import_batch_id");--> statement-breakpoint
CREATE INDEX "import_queue_company_idx" ON "import_queue" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "import_queue_bank_account_idx" ON "import_queue" USING btree ("bank_account_id");--> statement-breakpoint
CREATE INDEX "import_queue_status_idx" ON "import_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "import_queue_row_number_idx" ON "import_queue" USING btree ("import_batch_id","row_number");--> statement-breakpoint
CREATE INDEX "industry_templates_code_idx" ON "industry_templates" USING btree ("industry_code");--> statement-breakpoint
CREATE INDEX "industry_templates_active_idx" ON "industry_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "inventory_transactions_company_idx" ON "inventory_transactions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "inventory_transactions_product_idx" ON "inventory_transactions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "inventory_transactions_type_idx" ON "inventory_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "inventory_transactions_reference_idx" ON "inventory_transactions" USING btree ("reference","reference_id");--> statement-breakpoint
CREATE INDEX "invoice_items_company_idx" ON "invoice_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "invoices_company_idx" ON "invoices" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "invoices_customer_idx" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "journal_entries_company_idx" ON "journal_entries" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "journal_entries_date_idx" ON "journal_entries" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "journal_entries_posted_idx" ON "journal_entries" USING btree ("is_posted");--> statement-breakpoint
CREATE INDEX "journal_lines_entry_idx" ON "journal_entry_lines" USING btree ("journal_entry_id");--> statement-breakpoint
CREATE INDEX "journal_lines_account_idx" ON "journal_entry_lines" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "labour_compliance_client_idx" ON "labour_compliance" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "labour_compliance_type_idx" ON "labour_compliance" USING btree ("compliance_type");--> statement-breakpoint
CREATE INDEX "labour_compliance_status_idx" ON "labour_compliance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "labour_compliance_due_date_idx" ON "labour_compliance" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "number_sequences_company_idx" ON "number_sequences" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "onboarding_workflows_client_idx" ON "onboarding_workflows" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "onboarding_workflows_status_idx" ON "onboarding_workflows" USING btree ("status");--> statement-breakpoint
CREATE INDEX "permission_audit_user_idx" ON "permission_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "permission_audit_company_idx" ON "permission_audit_log" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "permission_audit_timestamp_idx" ON "permission_audit_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "pos_customer_loyalty_company_idx" ON "pos_customer_loyalty" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pos_loyalty_programs_company_idx" ON "pos_loyalty_programs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pos_payments_company_idx" ON "pos_payments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pos_payments_sale_idx" ON "pos_payments" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "pos_promotions_company_idx" ON "pos_promotions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pos_promotions_active_idx" ON "pos_promotions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "pos_refund_items_company_idx" ON "pos_refund_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pos_refund_items_refund_idx" ON "pos_refund_items" USING btree ("refund_id");--> statement-breakpoint
CREATE INDEX "pos_refunds_company_idx" ON "pos_refunds" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pos_refunds_original_sale_idx" ON "pos_refunds" USING btree ("original_sale_id");--> statement-breakpoint
CREATE INDEX "pos_sale_items_company_idx" ON "pos_sale_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pos_sale_items_sale_idx" ON "pos_sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "pos_sales_company_idx" ON "pos_sales" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pos_sales_number_idx" ON "pos_sales" USING btree ("sale_number");--> statement-breakpoint
CREATE INDEX "pos_sales_date_idx" ON "pos_sales" USING btree ("sale_date");--> statement-breakpoint
CREATE INDEX "pos_shifts_company_idx" ON "pos_shifts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pos_shifts_terminal_idx" ON "pos_shifts" USING btree ("terminal_id");--> statement-breakpoint
CREATE INDEX "pos_shifts_user_idx" ON "pos_shifts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pos_terminals_company_idx" ON "pos_terminals" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pricing_rules_company_idx" ON "pricing_rules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pricing_rules_type_idx" ON "pricing_rules" USING btree ("rule_type");--> statement-breakpoint
CREATE INDEX "pricing_rules_active_idx" ON "pricing_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_brands_company_idx" ON "product_brands" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "product_bundles_company_idx" ON "product_bundles" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "product_bundles_bundle_idx" ON "product_bundles" USING btree ("bundle_product_id");--> statement-breakpoint
CREATE INDEX "product_categories_company_idx" ON "product_categories" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "product_lots_company_idx" ON "product_lots" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "product_lots_product_idx" ON "product_lots" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_lots_expiry_idx" ON "product_lots" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "product_serials_company_idx" ON "product_serials" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "product_serials_product_idx" ON "product_serials" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_serials_status_idx" ON "product_serials" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_variants_company_idx" ON "product_variants" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "product_variants_parent_idx" ON "product_variants" USING btree ("parent_product_id");--> statement-breakpoint
CREATE INDEX "products_company_idx" ON "products" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_barcode_idx" ON "products" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "projects_company_idx" ON "projects" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_customer_idx" ON "projects" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "purchase_order_items_company_idx" ON "purchase_order_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "purchase_requisition_items_company_idx" ON "purchase_requisition_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "purchase_requisition_items_requisition_idx" ON "purchase_requisition_items" USING btree ("requisition_id");--> statement-breakpoint
CREATE INDEX "purchase_requisitions_company_idx" ON "purchase_requisitions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "purchase_requisitions_requested_by_idx" ON "purchase_requisitions" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "purchase_requisitions_status_idx" ON "purchase_requisitions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quote_analytics_company_idx" ON "quote_analytics" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "quote_analytics_estimate_idx" ON "quote_analytics" USING btree ("estimate_id");--> statement-breakpoint
CREATE INDEX "quote_analytics_event_type_idx" ON "quote_analytics" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "quote_interactions_company_idx" ON "quote_interactions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "quote_interactions_estimate_idx" ON "quote_interactions" USING btree ("estimate_id");--> statement-breakpoint
CREATE INDEX "quote_interactions_action_idx" ON "quote_interactions" USING btree ("action");--> statement-breakpoint
CREATE INDEX "quote_interactions_timestamp_idx" ON "quote_interactions" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "quote_templates_company_idx" ON "quote_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "quote_templates_category_idx" ON "quote_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "recurring_billing_client_idx" ON "recurring_billing" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "recurring_billing_status_idx" ON "recurring_billing" USING btree ("status");--> statement-breakpoint
CREATE INDEX "recurring_billing_next_billing_idx" ON "recurring_billing" USING btree ("next_billing_date");--> statement-breakpoint
CREATE INDEX "recurring_expenses_company_idx" ON "recurring_expenses" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "recurring_expenses_supplier_idx" ON "recurring_expenses" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "recurring_expenses_category_idx" ON "recurring_expenses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "recurring_expenses_next_due_date_idx" ON "recurring_expenses" USING btree ("next_due_date");--> statement-breakpoint
CREATE INDEX "recurring_expenses_active_idx" ON "recurring_expenses" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "recurring_invoices_company_idx" ON "recurring_invoices" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "reorder_rules_company_idx" ON "reorder_rules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "reorder_rules_product_idx" ON "reorder_rules" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "sales_activities_company_idx" ON "sales_activities" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sales_activities_type_idx" ON "sales_activities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "sales_activities_assigned_idx" ON "sales_activities" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "sales_activities_scheduled_idx" ON "sales_activities" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "sales_activities_status_idx" ON "sales_activities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sales_forecasts_company_idx" ON "sales_forecasts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sales_forecasts_period_idx" ON "sales_forecasts" USING btree ("period");--> statement-breakpoint
CREATE INDEX "sales_forecasts_date_range_idx" ON "sales_forecasts" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "sales_leads_company_idx" ON "sales_leads" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sales_leads_status_idx" ON "sales_leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sales_leads_assigned_idx" ON "sales_leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "sales_leads_email_idx" ON "sales_leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sales_opportunities_company_idx" ON "sales_opportunities" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sales_opportunities_stage_idx" ON "sales_opportunities" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "sales_opportunities_assigned_idx" ON "sales_opportunities" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "sales_opportunities_status_idx" ON "sales_opportunities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sales_order_items_company_idx" ON "sales_order_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sales_orders_company_idx" ON "sales_orders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sales_orders_customer_idx" ON "sales_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "sales_orders_status_idx" ON "sales_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sales_orders_estimate_idx" ON "sales_orders" USING btree ("estimate_id");--> statement-breakpoint
CREATE INDEX "sales_pipeline_stages_company_idx" ON "sales_pipeline_stages" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sales_pipeline_stages_order_idx" ON "sales_pipeline_stages" USING btree ("order");--> statement-breakpoint
CREATE INDEX "sars_compliance_client_idx" ON "sars_compliance" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "sars_compliance_type_idx" ON "sars_compliance" USING btree ("compliance_type");--> statement-breakpoint
CREATE INDEX "sars_compliance_status_idx" ON "sars_compliance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sars_compliance_due_date_idx" ON "sars_compliance" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "stock_count_items_company_idx" ON "stock_count_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "stock_count_items_count_idx" ON "stock_count_items" USING btree ("stock_count_id");--> statement-breakpoint
CREATE INDEX "stock_counts_company_idx" ON "stock_counts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "stock_counts_status_idx" ON "stock_counts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_payments_company_idx" ON "subscription_payments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "subscription_payments_plan_idx" ON "subscription_payments" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "subscription_payments_status_idx" ON "subscription_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_payments_reference_idx" ON "subscription_payments" USING btree ("payment_reference");--> statement-breakpoint
CREATE INDEX "tasks_company_idx" ON "tasks" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_project_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_assigned_idx" ON "tasks" USING btree ("assigned_to_id");--> statement-breakpoint
CREATE INDEX "time_entries_company_idx" ON "time_entries" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "time_entries_user_idx" ON "time_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "time_entries_project_idx" ON "time_entries" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "time_entries_task_idx" ON "time_entries" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "time_entries_running_idx" ON "time_entries" USING btree ("is_running");--> statement-breakpoint
CREATE INDEX "user_permissions_user_idx" ON "user_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_permissions_company_idx" ON "user_permissions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "vat_reports_company_idx" ON "vat_reports" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "vat_reports_period_idx" ON "vat_reports" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "vat_reports_status_idx" ON "vat_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vat_returns_company_idx" ON "vat_returns" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "vat_transactions_company_idx" ON "vat_transactions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "vat_transactions_type_idx" ON "vat_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "vat_transactions_source_idx" ON "vat_transactions" USING btree ("source_module","source_id");--> statement-breakpoint
CREATE INDEX "vat_transactions_period_idx" ON "vat_transactions" USING btree ("vat_period_start","vat_period_end");--> statement-breakpoint
CREATE INDEX "vat_transactions_report_idx" ON "vat_transactions" USING btree ("vat_report_id");--> statement-breakpoint
CREATE INDEX "vat_types_code_idx" ON "vat_types" USING btree ("code");--> statement-breakpoint
CREATE INDEX "vat_types_active_idx" ON "vat_types" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "vat_types_company_idx" ON "vat_types" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "warehouse_stock_company_idx" ON "warehouse_stock" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "warehouse_stock_product_idx" ON "warehouse_stock" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "warehouse_stock_warehouse_idx" ON "warehouse_stock" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "warehouses_company_idx" ON "warehouses" USING btree ("company_id");