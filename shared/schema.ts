import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, json, jsonb, date, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Multi-Company Core Tables
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  slug: text("slug").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("South Africa"),
  vatNumber: text("vat_number"),
  registrationNumber: text("registration_number"),
  isVatRegistered: boolean("is_vat_registered").default(false),
  vatRegistrationDate: date("vat_registration_date"),
  vatPeriodMonths: integer("vat_period_months").default(2), // 1=monthly, 2=bi-monthly, 6=bi-annual
  vatSubmissionDay: integer("vat_submission_day").default(25), // Day of month for VAT submissions
  logo: text("logo"), // URL to company logo
  primaryColor: text("primary_color").default("#3b82f6"),
  secondaryColor: text("secondary_color").default("#64748b"),
  timezone: text("timezone").default("Africa/Johannesburg"),
  currency: text("currency").default("ZAR"),
  dateFormat: text("date_format").default("DD/MM/YYYY"),
  fiscalYearStart: text("fiscal_year_start").default("04-01"), // April 1st
  isActive: boolean("is_active").default(true),
  subscriptionPlan: text("subscription_plan").default("basic"), // basic, professional, enterprise
  subscriptionStatus: text("subscription_status").default("active"), // active, suspended, cancelled
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  industry: text("industry").default("general"), // retail, services, manufacturing, construction, nonprofit, technology, healthcare, consulting, trading, agriculture
  industryTemplate: text("industry_template").default("general"), // COA template used
  vatInclusivePricing: boolean("vat_inclusive_pricing").default(false), // Whether prices include VAT
  defaultVatRate: decimal("default_vat_rate", { precision: 5, scale: 2 }).default("15.00"), // Default VAT rate for the company
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: index("companies_slug_idx").on(table.slug),
  activeIdx: index("companies_active_idx").on(table.isActive),
}));

// RBAC System Tables
export const systemRoles = pgTable("system_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  isSystemRole: boolean("is_system_role").default(true), // Cannot be deleted if true
  permissions: jsonb("permissions").notNull().default([]), // Array of permission strings
  level: integer("level").notNull().default(1), // 1=lowest, 10=highest access level
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companyRoles = pgTable("company_roles", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  basedOnSystemRole: integer("based_on_system_role"), // Reference to system_roles.id
  permissions: jsonb("permissions").notNull().default([]), // Custom permissions for this company
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyRoleUnique: unique().on(table.companyId, table.name),
  companyIdx: index("company_roles_company_idx").on(table.companyId),
}));

export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  companyId: integer("company_id").notNull(),
  systemRoleId: integer("system_role_id"), // Reference to system_roles.id
  companyRoleId: integer("company_role_id"), // Reference to company_roles.id
  customPermissions: jsonb("custom_permissions").default([]), // Additional permissions beyond role
  deniedPermissions: jsonb("denied_permissions").default([]), // Explicitly denied permissions
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // For temporary permissions
  grantedBy: integer("granted_by"), // User ID who granted these permissions
  grantedAt: timestamp("granted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userCompanyUnique: unique().on(table.userId, table.companyId),
  userIdx: index("user_permissions_user_idx").on(table.userId),
  companyIdx: index("user_permissions_company_idx").on(table.companyId),
}));

export const permissionAuditLog = pgTable("permission_audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User whose permissions were changed
  companyId: integer("company_id").notNull(),
  changedBy: integer("changed_by").notNull(), // User who made the change
  action: text("action").notNull(), // 'granted', 'revoked', 'role_assigned', 'role_removed', 'role_created', 'role_updated'
  targetType: text("target_type").notNull(), // 'user', 'role'
  targetId: integer("target_id"), // ID of the target (user_id, role_id)
  oldValue: jsonb("old_value"), // Previous state
  newValue: jsonb("new_value"), // New state
  reason: text("reason"), // Optional reason for the change
  metadata: jsonb("metadata").default({}), // Additional context
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => ({
  userIdx: index("permission_audit_user_idx").on(table.userId),
  companyIdx: index("permission_audit_company_idx").on(table.companyId),
  timestampIdx: index("permission_audit_timestamp_idx").on(table.timestamp),
}));

export const companyUsers = pgTable("company_users", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("employee"), // Legacy field, will be replaced by userPermissions
  permissions: jsonb("permissions").default([]), // Legacy field
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  companyUserUnique: unique().on(table.companyId, table.userId),
  companyIdx: index("company_users_company_idx").on(table.companyId),
  userIdx: index("company_users_user_idx").on(table.userId),
}));

// Company Module Activation Table
export const companyModules = pgTable("company_modules", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  moduleId: text("module_id").notNull(), // invoicing, accounting, pos, etc.
  isActive: boolean("is_active").default(true),
  activatedAt: timestamp("activated_at"),
  deactivatedAt: timestamp("deactivated_at"),
  activatedBy: integer("activated_by"), // User ID who activated
  deactivatedBy: integer("deactivated_by"), // User ID who deactivated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyModuleUnique: unique().on(table.companyId, table.moduleId),
  companyIdx: index("company_modules_company_idx").on(table.companyId),
  moduleIdx: index("company_modules_module_idx").on(table.moduleId),
}));

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  vatNumber: text("vat_number"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0.00"),
  paymentTerms: integer("payment_terms").default(30), // Days
  category: text("category").default("standard"), // standard, premium, wholesale, etc.
  notes: text("notes"),
  portalAccess: boolean("portal_access").default(false),
  portalPassword: text("portal_password"), // For customer portal login
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("customers_company_idx").on(table.companyId),
}));

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  customerId: integer("customer_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue, partially_paid
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyInvoiceUnique: unique().on(table.companyId, table.invoiceNumber),
  companyIdx: index("invoices_company_idx").on(table.companyId),
  customerIdx: index("invoices_customer_idx").on(table.customerId),
}));

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  invoiceId: integer("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  vatInclusive: boolean("vat_inclusive").default(false), // Whether the unit price includes VAT
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("invoice_items_company_idx").on(table.companyId),
}));

export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  estimateNumber: text("estimate_number").notNull(),
  customerId: integer("customer_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, viewed, accepted, rejected, expired
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyEstimateUnique: unique().on(table.companyId, table.estimateNumber),
  companyIdx: index("estimates_company_idx").on(table.companyId),
  customerIdx: index("estimates_customer_idx").on(table.customerId),
  statusIdx: index("estimates_status_idx").on(table.status),
  expiryIdx: index("estimates_expiry_idx").on(table.expiryDate),
}));

export const estimateItems = pgTable("estimate_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  estimateId: integer("estimate_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  vatInclusive: boolean("vat_inclusive").default(false), // Whether the unit price includes VAT
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("estimate_items_company_idx").on(table.companyId),
}));

// Sales Orders - Track orders before invoicing
export const salesOrders = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  orderNumber: text("order_number").notNull(),
  customerId: integer("customer_id").notNull(),
  estimateId: integer("estimate_id").references(() => estimates.id), // Optional link to estimate
  orderDate: timestamp("order_date").notNull(),
  requiredDate: timestamp("required_date"),
  status: text("status").notNull().default("draft"), // draft, confirmed, in_production, ready_to_ship, shipped, delivered, completed, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  // Status tracking timestamps
  confirmedAt: timestamp("confirmed_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  completedAt: timestamp("completed_at"),
  // Action tracking
  confirmedBy: integer("confirmed_by").references(() => users.id),
  shippedBy: integer("shipped_by").references(() => users.id),
  deliveredBy: integer("delivered_by").references(() => users.id),
  completedBy: integer("completed_by").references(() => users.id),
  // Created/updated fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyOrderUnique: unique().on(table.companyId, table.orderNumber),
  companyIdx: index("sales_orders_company_idx").on(table.companyId),
  customerIdx: index("sales_orders_customer_idx").on(table.customerId),
  statusIdx: index("sales_orders_status_idx").on(table.status),
  estimateIdx: index("sales_orders_estimate_idx").on(table.estimateId),
}));

export const salesOrderItems = pgTable("sales_order_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  salesOrderId: integer("sales_order_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  vatInclusive: boolean("vat_inclusive").default(false),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("sales_order_items_company_idx").on(table.companyId),
}));

// Deliveries - Track fulfillment and delivery
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  deliveryNumber: text("delivery_number").notNull(),
  salesOrderId: integer("sales_order_id").references(() => salesOrders.id),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  customerId: integer("customer_id").notNull(),
  deliveryDate: timestamp("delivery_date").notNull(),
  deliveryMethod: text("delivery_method").notNull().default("courier"), // courier, pickup, own_delivery
  trackingNumber: text("tracking_number"),
  deliveryAddress: text("delivery_address"),
  status: text("status").notNull().default("pending"), // pending, in_transit, delivered, failed, cancelled
  notes: text("notes"),
  // Delivery confirmation
  deliveredAt: timestamp("delivered_at"),
  deliveredBy: text("delivered_by"), // Person who received delivery
  deliverySignature: text("delivery_signature"), // Base64 encoded signature
  // Created/updated fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyDeliveryUnique: unique().on(table.companyId, table.deliveryNumber),
  companyIdx: index("deliveries_company_idx").on(table.companyId),
  customerIdx: index("deliveries_customer_idx").on(table.customerId),
  salesOrderIdx: index("deliveries_sales_order_idx").on(table.salesOrderId),
  statusIdx: index("deliveries_status_idx").on(table.status),
}));

export const deliveryItems = pgTable("delivery_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  deliveryId: integer("delivery_id").notNull(),
  description: text("description").notNull(),
  quantityOrdered: decimal("quantity_ordered", { precision: 10, scale: 2 }).notNull(),
  quantityDelivered: decimal("quantity_delivered", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("delivery_items_company_idx").on(table.companyId),
}));



// Auto-numbering sequence table
export const numberSequences = pgTable("number_sequences", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  documentType: text("document_type").notNull(), // invoice, estimate, purchase_order, etc.
  prefix: text("prefix").notNull().default(""), // INV-, EST-, PO-, etc.
  nextNumber: integer("next_number").notNull().default(1),
  format: text("format").notNull().default("prefix-year-number"), // prefix-year-number, prefix-number, number
  yearReset: boolean("year_reset").default(true), // Reset numbering each year
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyDocumentUnique: unique().on(table.companyId, table.documentType),
  companyIdx: index("number_sequences_company_idx").on(table.companyId),
}));

// Financial reporting tables
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // office_supplies, travel, utilities, etc.
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  vatInclusive: boolean("vat_inclusive").default(false), // Whether amount includes VAT
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  expenseDate: timestamp("expense_date").notNull(),
  isDeductible: boolean("is_deductible").default(true),
  receiptPath: text("receipt_path"), // Path to receipt image/PDF
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("expenses_company_idx").on(table.companyId),
}));

export const vatReturns = pgTable("vat_returns", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).notNull(),
  totalVatSales: decimal("total_vat_sales", { precision: 10, scale: 2 }).notNull(),
  totalPurchases: decimal("total_purchases", { precision: 10, scale: 2 }).notNull(),
  totalVatPurchases: decimal("total_vat_purchases", { precision: 10, scale: 2 }).notNull(),
  vatPayable: decimal("vat_payable", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, submitted, approved
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("vat_returns_company_idx").on(table.companyId),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"), // super_admin, admin, manager, employee, accountant
  permissions: text("permissions").array().default([]), // Array of permission strings
  activeCompanyId: integer("active_company_id"), // Currently active company for this user
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  passwordChangedAt: timestamp("password_changed_at").defaultNow(),
  // Enhanced 2FA and Security
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: jsonb("two_factor_backup_codes").default([]),
  phoneNumber: text("phone_number"),
  phoneVerified: boolean("phone_verified").default(false),
  smsNotifications: boolean("sms_notifications").default(false),
  // OAuth Integration
  googleId: text("google_id"),
  microsoftId: text("microsoft_id"),
  oauthProviders: jsonb("oauth_providers").default([]),
  // Notification Preferences
  emailNotifications: boolean("email_notifications").default(true),
  notificationPreferences: jsonb("notification_preferences").default({}),  // Detailed notification settings
  // Localization
  language: text("language").default("en"), // en, af, zu, xh
  timezone: text("timezone").default("Africa/Johannesburg"),
  theme: text("theme").default("light"), // light, dark, system
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").array().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription Plans Table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annual_price", { precision: 10, scale: 2 }).notNull(),
  features: jsonb("features").default([]), // Array of feature names
  limits: jsonb("limits").default({}), // Object with limits like {users: 5, invoices: 100}
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company Subscriptions Table
export const companySubscriptions = pgTable("company_subscriptions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull().default("active"), // active, suspended, cancelled, expired
  billingPeriod: text("billing_period").notNull().default("monthly"), // monthly, annual
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").default(true),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"), // card, bank_transfer, etc.
  lastPaymentDate: timestamp("last_payment_date"),
  nextBillingDate: timestamp("next_billing_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("company_subscriptions_company_idx").on(table.companyId),
  planIdx: index("company_subscriptions_plan_idx").on(table.planId),
}));

// Subscription Payments Table for tracking payment transactions
export const subscriptionPayments = pgTable("subscription_payments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  billingPeriod: text("billing_period").notNull(), // monthly, annual
  status: text("status").notNull().default("pending"), // pending, completed, failed, cancelled
  paymentMethod: text("payment_method").notNull().default("payfast"),
  paymentReference: text("payment_reference"), // PayFast payment ID
  description: text("description"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
  createdBy: integer("created_by").notNull().references(() => users.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("subscription_payments_company_idx").on(table.companyId),
  planIdx: index("subscription_payments_plan_idx").on(table.planId),
  statusIdx: index("subscription_payments_status_idx").on(table.status),
  referenceIdx: index("subscription_payments_reference_idx").on(table.paymentReference),
}));

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"), // Nullable for system-level actions
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // login, logout, create, update, delete, etc.
  resource: text("resource").notNull(), // table/entity name
  resourceId: integer("resource_id"), // ID of the affected record
  oldValues: jsonb("old_values"), // JSON of previous values
  newValues: jsonb("new_values"), // JSON of new values
  details: text("details"), // JSON string with additional details
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => ({
  companyIdx: index("audit_logs_company_idx").on(table.companyId),
  userIdx: index("audit_logs_user_idx").on(table.userId),
  resourceIdx: index("audit_logs_resource_idx").on(table.resource, table.resourceId),
  timestampIdx: index("audit_logs_timestamp_idx").on(table.timestamp),
}));

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  invoiceId: integer("invoice_id").notNull(),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'card', 'eft', 'payfast'
  paymentDate: timestamp("payment_date").defaultNow(),
  reference: text("reference"), // PayFast reference or manual reference
  notes: text("notes"),
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchase Order Management
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  vatNumber: text("vat_number"),
  paymentTerms: integer("payment_terms").default(30), // Days
  category: text("category").default("standard"), // standard, preferred, etc.
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  orderNumber: text("order_number").notNull(),
  supplierId: integer("supplier_id").notNull(),
  orderDate: timestamp("order_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  status: text("status").notNull().default("draft"), // draft, sent, received, completed, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  purchaseOrderId: integer("purchase_order_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  vatInclusive: boolean("vat_inclusive").default(false), // Whether the unit price includes VAT
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  expenseCategory: text("expense_category").default("office_supplies"), // Links to expense categories
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("purchase_order_items_company_idx").on(table.companyId),
}));

export const supplierPayments = pgTable("supplier_payments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  supplierId: integer("supplier_id").notNull(),
  purchaseOrderId: integer("purchase_order_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'card', 'eft', 'check'
  paymentDate: timestamp("payment_date").defaultNow(),
  reference: text("reference"),
  notes: text("notes"),
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Products and Services module
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  parentCategoryId: integer("parent_category_id"), // Forward reference issue fixed
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("product_categories_company_idx").on(table.companyId),
}));

// Product Brands
export const productBrands = pgTable("product_brands", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  logoPath: text("logo_path"),
  website: text("website"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("product_brands_company_idx").on(table.companyId),
}));

// Product Variants (for products with different sizes, colors, etc.)
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  parentProductId: integer("parent_product_id").notNull().references(() => products.id),
  variantName: text("variant_name").notNull(), // e.g., "Red Large", "Size M"
  variantSku: text("variant_sku").unique(),
  barcode: text("barcode").unique(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).default("0.00"),
  stockQuantity: integer("stock_quantity").default(0),
  reservedQuantity: integer("reserved_quantity").default(0),
  reorderPoint: integer("reorder_point").default(0),
  weight: decimal("weight", { precision: 10, scale: 3 }),
  dimensions: text("dimensions"),
  variantAttributes: jsonb("variant_attributes").default({}), // {color: "red", size: "large"}
  imagePath: text("image_path"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("product_variants_company_idx").on(table.companyId),
  parentProductIdx: index("product_variants_parent_idx").on(table.parentProductId),
}));

// Warehouses/Locations
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(), // Unique warehouse code
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  managerId: integer("manager_id"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyCodeUnique: unique().on(table.companyId, table.code),
  companyIdx: index("warehouses_company_idx").on(table.companyId),
}));

// Product Stock by Warehouse
export const warehouseStock = pgTable("warehouse_stock", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  productId: integer("product_id").notNull().references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  quantity: integer("quantity").default(0),
  reservedQuantity: integer("reserved_quantity").default(0),
  availableQuantity: integer("available_quantity").default(0),
  minStockLevel: integer("min_stock_level").default(0),
  maxStockLevel: integer("max_stock_level").default(0),
  lastRestockDate: timestamp("last_restock_date"),
  lastCountDate: timestamp("last_count_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  productWarehouseUnique: unique().on(table.productId, table.warehouseId, table.variantId),
  companyIdx: index("warehouse_stock_company_idx").on(table.companyId),
  productIdx: index("warehouse_stock_product_idx").on(table.productId),
  warehouseIdx: index("warehouse_stock_warehouse_idx").on(table.warehouseId),
}));

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").unique(),
  barcode: text("barcode").unique(),
  categoryId: integer("category_id").references(() => productCategories.id),
  brand: text("brand"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).default("0.00"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  stockQuantity: integer("stock_quantity").default(0),
  minStockLevel: integer("min_stock_level").default(0),
  maxStockLevel: integer("max_stock_level").default(0),
  isActive: boolean("is_active").default(true),
  isService: boolean("is_service").default(false),
  imagePath: text("image_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  vatInclusive: boolean("vat_inclusive").default(false),
  incomeAccountId: integer("income_account_id"),
  expenseAccountId: integer("expense_account_id"),
  manufacturer: text("manufacturer"),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  dimensions: text("dimensions"),
  warrantyPeriod: integer("warranty_period"),
  location: text("location"),
  supplierCode: text("supplier_code"),
  bundleType: text("bundle_type"),
  trackInventory: boolean("track_inventory").default(true),
  trackSerials: boolean("track_serials").default(false),
  trackLots: boolean("track_lots").default(false)
}, (table) => ({
  companyIdx: index("products_company_idx").on(table.companyId),
  categoryIdx: index("products_category_idx").on(table.categoryId),
  barcodeIdx: index("products_barcode_idx").on(table.barcode),
}));

// PayFast payment integration tables
export const payfastPayments = pgTable("payfast_payments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  invoiceId: integer("invoice_id").notNull(),
  payfastPaymentId: text("payfast_payment_id").unique(),
  merchantId: text("merchant_id").notNull(),
  merchantKey: text("merchant_key").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  itemName: text("item_name").notNull(),
  itemDescription: text("item_description"),
  returnUrl: text("return_url").notNull(),
  cancelUrl: text("cancel_url").notNull(),
  notifyUrl: text("notify_url").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed, cancelled
  payfastData: text("payfast_data"), // JSON string of PayFast response
  signature: text("signature"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});



// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = z.object({
  customerId: z.number(),
  invoiceNumber: z.string(),
  issueDate: z.string().transform((str) => new Date(str)),
  dueDate: z.string().transform((str) => new Date(str)),
  subtotal: z.string(),
  vatAmount: z.string(),
  total: z.string(),
  status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
  notes: z.string().optional(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

export const insertEstimateSchema = z.object({
  customerId: z.number(),
  estimateNumber: z.string(),
  issueDate: z.string().transform((str) => new Date(str)),
  expiryDate: z.string().transform((str) => new Date(str)),
  subtotal: z.string(),
  vatAmount: z.string(),
  total: z.string(),
  status: z.enum(["draft", "sent", "accepted", "rejected"]).default("draft"),
  notes: z.string().optional(),
});

export const insertEstimateItemSchema = createInsertSchema(estimateItems).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const trialSignupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  companySize: z.string().min(1, 'Please select company size'),
  industry: z.string().min(1, 'Please select industry'),
  planId: z.string().min(1, 'Please select a plan'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
  subscribeToUpdates: z.boolean().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertPaymentSchema = z.object({
  companyId: z.number(),
  invoiceId: z.number(),
  bankAccountId: z.number().optional(),
  amount: z.string(),
  paymentMethod: z.enum(["cash", "card", "eft", "payfast"]),
  paymentDate: z.string().optional().transform((str) => str ? new Date(str) : new Date()),
  reference: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]).default("completed"),
});

export const insertExpenseSchema = z.object({
  description: z.string(),
  amount: z.string(),
  category: z.string(),
  vatAmount: z.string().default("0.00"),
  expenseDate: z.string().transform((str) => new Date(str)),
  isDeductible: z.boolean().default(true),
  receiptPath: z.string().optional(),
});

export const insertVatReturnSchema = z.object({
  periodStart: z.string().transform((str) => new Date(str)),
  periodEnd: z.string().transform((str) => new Date(str)),
  totalSales: z.string(),
  totalVatSales: z.string(),
  totalPurchases: z.string(),
  totalVatPurchases: z.string(),
  vatPayable: z.string(),
  status: z.enum(["draft", "submitted", "approved"]).default("draft"),
});

// Products and Services schemas
export const insertProductCategorySchema = createInsertSchema(productCategories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Enhanced Inventory schemas
export const insertProductBrandSchema = createInsertSchema(productBrands).omit({
  id: true,
  createdAt: true,
});

export const insertProductVariantSchema = createInsertSchema(productVariants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWarehouseStockSchema = createInsertSchema(warehouseStock).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



export const insertPayfastPaymentSchema = createInsertSchema(payfastPayments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Customer portal login schema
export const customerPortalLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Purchase Order Management schemas
export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseOrderSchema = z.object({
  supplierId: z.number(),
  orderNumber: z.string(),
  orderDate: z.string().transform((str) => new Date(str)),
  deliveryDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  subtotal: z.string(),
  vatAmount: z.string(),
  total: z.string(),
  status: z.enum(["draft", "sent", "received", "completed", "cancelled"]).default("draft"),
  notes: z.string().optional(),
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
});

export const insertSupplierPaymentSchema = z.object({
  supplierId: z.number(),
  purchaseOrderId: z.number().optional(),
  amount: z.string(),
  paymentMethod: z.enum(["cash", "card", "eft", "check"]),
  paymentDate: z.string().optional().transform((str) => str ? new Date(str) : new Date()),
  reference: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]).default("completed"),
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type Estimate = typeof estimates.$inferSelect;
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;

export type EstimateItem = typeof estimateItems.$inferSelect;
export type InsertEstimateItem = z.infer<typeof insertEstimateItemSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

// RBAC Type exports (removed to avoid duplicates - defined later in file)

// Authentication types
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type LoginRequest = z.infer<typeof loginSchema>;
export type TrialSignupRequest = z.infer<typeof trialSignupSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type VatReturn = typeof vatReturns.$inferSelect;
export type InsertVatReturn = z.infer<typeof insertVatReturnSchema>;

// Purchase Order Management types
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;

export type SupplierPayment = typeof supplierPayments.$inferSelect;
export type InsertSupplierPayment = z.infer<typeof insertSupplierPaymentSchema>;
export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type PayfastPayment = typeof payfastPayments.$inferSelect;
export type InsertPayfastPayment = z.infer<typeof insertPayfastPaymentSchema>;

// Enhanced Inventory Types
export type ProductBrand = typeof productBrands.$inferSelect;
export type InsertProductBrand = z.infer<typeof insertProductBrandSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type WarehouseStock = typeof warehouseStock.$inferSelect;
export type InsertWarehouseStock = z.infer<typeof insertWarehouseStockSchema>;
export type ProductLot = typeof productLots.$inferSelect;
export type InsertProductLot = z.infer<typeof insertProductLotSchema>;
export type ProductSerial = typeof productSerials.$inferSelect;
export type InsertProductSerial = z.infer<typeof insertProductSerialSchema>;
export type StockCount = typeof stockCounts.$inferSelect;
export type InsertStockCount = z.infer<typeof insertStockCountSchema>;
export type StockCountItem = typeof stockCountItems.$inferSelect;
export type InsertStockCountItem = z.infer<typeof insertStockCountItemSchema>;
export type ReorderRule = typeof reorderRules.$inferSelect;
export type InsertReorderRule = z.infer<typeof insertReorderRuleSchema>;
export type ProductBundle = typeof productBundles.$inferSelect;
export type InsertProductBundle = z.infer<typeof insertProductBundleSchema>;

export const recurringInvoices = pgTable("recurring_invoices", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  templateInvoiceId: integer("template_invoice_id").references(() => invoices.id),
  customerId: integer("customer_id").references(() => customers.id),
  frequency: text("frequency").notNull(), // weekly, monthly, quarterly, yearly
  intervalCount: integer("interval_count").default(1),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  nextInvoiceDate: timestamp("next_invoice_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("recurring_invoices_company_idx").on(table.companyId),
}));

export const insertRecurringInvoiceSchema = z.object({
  templateInvoiceId: z.number(),
  customerId: z.number(),
  frequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
  intervalCount: z.number().default(1),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  nextInvoiceDate: z.string().transform((str) => new Date(str)),
  isActive: z.boolean().default(true),
});

export type RecurringInvoice = typeof recurringInvoices.$inferSelect;
export type InsertRecurringInvoice = z.infer<typeof insertRecurringInvoiceSchema>;

// Multi-Company Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type CompanyUser = typeof companyUsers.$inferSelect;
export type InsertCompanyUser = typeof companyUsers.$inferInsert;

// Bulk Capture System Tables
export const bulkCaptureSessions = pgTable("bulk_capture_sessions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  userId: integer("user_id").notNull(),
  batchId: text("batch_id").notNull().unique(),
  sessionType: text("session_type").notNull(), // 'income', 'expense', 'bank_import'
  status: text("status").default("draft"), // draft, processing, completed, error
  totalEntries: integer("total_entries").default(0),
  processedEntries: integer("processed_entries").default(0),
  batchNotes: text("batch_notes"),
  metadata: jsonb("metadata").default({}), // Store session-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("bulk_capture_sessions_company_idx").on(table.companyId),
  batchIdx: index("bulk_capture_sessions_batch_idx").on(table.batchId),
}));

export const bulkExpenseEntries = pgTable("bulk_expense_entries", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  sessionId: integer("session_id").notNull(),
  batchId: text("batch_id").notNull(),
  transactionDate: date("transaction_date").notNull(),
  categoryId: integer("category_id").notNull(), // Reference to chart of accounts
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  supplierId: integer("supplier_id"),
  vatTypeId: integer("vat_type_id").notNull().default(1), // Reference to VAT types from VAT module (1=STD, 2=ZER, 3=EXE, 4=OUT)
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15.00"),
  vatAmount: decimal("vat_amount", { precision: 12, scale: 2 }).default("0.00"),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
  bankAccountId: integer("bank_account_id"),
  reference: text("reference"),
  notes: text("notes"),
  status: text("status").default("validated"), // draft, validated, processed, error
  fromBankStatement: boolean("from_bank_statement").default(false),
  confidence: integer("confidence"), // For AI matching confidence
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("bulk_expense_entries_company_idx").on(table.companyId),
  sessionIdx: index("bulk_expense_entries_session_idx").on(table.sessionId),
  batchIdx: index("bulk_expense_entries_batch_idx").on(table.batchId),
  dateIdx: index("bulk_expense_entries_date_idx").on(table.transactionDate),
}));

export const bulkIncomeEntries = pgTable("bulk_income_entries", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  sessionId: integer("session_id").notNull(),
  batchId: text("batch_id").notNull(),
  transactionDate: date("transaction_date").notNull(),
  incomeAccountId: integer("income_account_id").notNull(), // Reference to chart of accounts
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  clientId: integer("client_id"), // Reference to customers table
  vatTypeId: integer("vat_type_id").notNull().default(1), // Reference to VAT types from VAT module
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15.00"),
  vatAmount: decimal("vat_amount", { precision: 12, scale: 2 }).default("0.00"),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
  bankAccountId: integer("bank_account_id"),
  reference: text("reference"),
  notes: text("notes"),
  status: text("status").default("validated"),
  fromBankStatement: boolean("from_bank_statement").default(false),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("bulk_income_entries_company_idx").on(table.companyId),
  sessionIdx: index("bulk_income_entries_session_idx").on(table.sessionId),
  batchIdx: index("bulk_income_entries_batch_idx").on(table.batchId),
  dateIdx: index("bulk_income_entries_date_idx").on(table.transactionDate),
}));

export const bankStatementUploads = pgTable("bank_statement_uploads", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  userId: integer("user_id").notNull(),
  bankId: text("bank_id").notNull(), // fnb, absa, standard, nedbank, capitec, discovery
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  fileType: text("file_type"), // csv, xlsx, pdf
  uploadDate: timestamp("upload_date").defaultNow(),
  processedDate: timestamp("processed_date"),
  status: text("status").default("processing"), // processing, completed, error
  totalTransactions: integer("total_transactions").default(0),
  matchedTransactions: integer("matched_transactions").default(0),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("bank_statement_uploads_company_idx").on(table.companyId),
  statusIdx: index("bank_statement_uploads_status_idx").on(table.status),
}));

export const bankStatementTransactions = pgTable("bank_statement_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  uploadId: integer("upload_id").notNull(),
  transactionDate: date("transaction_date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }),
  reference: text("reference"),
  transactionType: text("transaction_type").notNull(), // debit, credit
  matched: boolean("matched").default(false),
  suggestedCategoryId: integer("suggested_category_id"), // AI suggested category
  confidence: integer("confidence"), // AI confidence score
  matchedTransactionId: integer("matched_transaction_id"), // Link to created transaction
  matchedTransactionType: text("matched_transaction_type"), // expense, income, journal
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("bank_statement_transactions_company_idx").on(table.companyId),
  uploadIdx: index("bank_statement_transactions_upload_idx").on(table.uploadId),
  dateIdx: index("bank_statement_transactions_date_idx").on(table.transactionDate),
  matchedIdx: index("bank_statement_transactions_matched_idx").on(table.matched),
}));

// Bulk Capture Relations
export const bulkCaptureSessionsRelations = relations(bulkCaptureSessions, ({ one, many }) => ({
  company: one(companies, {
    fields: [bulkCaptureSessions.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [bulkCaptureSessions.userId],
    references: [users.id],
  }),
  expenseEntries: many(bulkExpenseEntries),
  incomeEntries: many(bulkIncomeEntries),
}));

export const bulkExpenseEntriesRelations = relations(bulkExpenseEntries, ({ one }) => ({
  company: one(companies, {
    fields: [bulkExpenseEntries.companyId],
    references: [companies.id],
  }),
  session: one(bulkCaptureSessions, {
    fields: [bulkExpenseEntries.sessionId],
    references: [bulkCaptureSessions.id],
  }),
  category: one(chartOfAccounts, {
    fields: [bulkExpenseEntries.categoryId],
    references: [chartOfAccounts.id],
  }),
  supplier: one(suppliers, {
    fields: [bulkExpenseEntries.supplierId],
    references: [suppliers.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [bulkExpenseEntries.bankAccountId],
    references: [bankAccounts.id],
  }),
}));

export const bulkIncomeEntriesRelations = relations(bulkIncomeEntries, ({ one }) => ({
  company: one(companies, {
    fields: [bulkIncomeEntries.companyId],
    references: [companies.id],
  }),
  session: one(bulkCaptureSessions, {
    fields: [bulkIncomeEntries.sessionId],
    references: [bulkCaptureSessions.id],
  }),
  incomeAccount: one(chartOfAccounts, {
    fields: [bulkIncomeEntries.incomeAccountId],
    references: [chartOfAccounts.id],
  }),
  client: one(customers, {
    fields: [bulkIncomeEntries.clientId],
    references: [customers.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [bulkIncomeEntries.bankAccountId],
    references: [bankAccounts.id],
  }),
}));

export const bankStatementUploadsRelations = relations(bankStatementUploads, ({ one, many }) => ({
  company: one(companies, {
    fields: [bankStatementUploads.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [bankStatementUploads.userId],
    references: [users.id],
  }),
  transactions: many(bankStatementTransactions),
}));

export const bankStatementTransactionsRelations = relations(bankStatementTransactions, ({ one }) => ({
  company: one(companies, {
    fields: [bankStatementTransactions.companyId],
    references: [companies.id],
  }),
  upload: one(bankStatementUploads, {
    fields: [bankStatementTransactions.uploadId],
    references: [bankStatementUploads.id],
  }),
  suggestedCategory: one(chartOfAccounts, {
    fields: [bankStatementTransactions.suggestedCategoryId],
    references: [chartOfAccounts.id],
  }),
}));

// Bulk Capture Types
export type InsertBulkCaptureSession = typeof bulkCaptureSessions.$inferInsert;
export type BulkCaptureSession = typeof bulkCaptureSessions.$inferSelect;
export type InsertBulkExpenseEntry = typeof bulkExpenseEntries.$inferInsert;
export type BulkExpenseEntry = typeof bulkExpenseEntries.$inferSelect;
export type InsertBulkIncomeEntry = typeof bulkIncomeEntries.$inferInsert;
export type BulkIncomeEntry = typeof bulkIncomeEntries.$inferSelect;
export type InsertBankStatementUpload = typeof bankStatementUploads.$inferInsert;
export type BankStatementUpload = typeof bankStatementUploads.$inferSelect;
export type InsertBankStatementTransaction = typeof bankStatementTransactions.$inferInsert;
export type BankStatementTransaction = typeof bankStatementTransactions.$inferSelect;

// Subscription Types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type CompanySubscription = typeof companySubscriptions.$inferSelect;
export type InsertCompanySubscription = typeof companySubscriptions.$inferInsert;
export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type InsertSubscriptionPayment = z.infer<typeof insertSubscriptionPaymentSchema>;

// Multi-Company Schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyUserSchema = createInsertSchema(companyUsers).omit({
  id: true,
  joinedAt: true,
});

// Subscription Schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  monthlyPrice: z.union([z.string(), z.number()]).transform((val) => String(val)),
  annualPrice: z.union([z.string(), z.number()]).transform((val) => String(val)),
});

export const insertCompanySubscriptionSchema = createInsertSchema(companySubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionPaymentSchema = createInsertSchema(subscriptionPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Company Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(companyUsers),
  customers: many(customers),
  invoices: many(invoices),
  estimates: many(estimates),
  expenses: many(expenses),
  suppliers: many(suppliers),
  purchaseOrders: many(purchaseOrders),
  products: many(products),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  invoices: many(invoices),
  estimates: many(estimates),
  salesOrders: many(salesOrders),
  deliveries: many(deliveries),
  creditNotes: many(creditNotes),
}));



export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
  payments: many(payments),
}));

// Extended types for API responses
export type InvoiceWithCustomer = Invoice & { customer: Customer };
export type InvoiceWithItems = Invoice & { items: InvoiceItem[]; customer: Customer };
export type EstimateWithCustomer = Estimate & { customer: Customer };
export type EstimateWithItems = Estimate & { items: EstimateItem[]; customer: Customer };
export type PurchaseOrderWithSupplier = PurchaseOrder & { supplier: Supplier };
export type PurchaseOrderWithItems = PurchaseOrder & { items: PurchaseOrderItem[]; supplier: Supplier };
export type SupplierPaymentWithSupplier = SupplierPayment & { supplier: Supplier };
export type SupplierPaymentWithPurchaseOrder = SupplierPayment & { purchaseOrder?: PurchaseOrder };

// Company settings table
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  companyEmail: varchar("company_email", { length: 255 }),
  companyPhone: varchar("company_phone", { length: 50 }),
  companyAddress: text("company_address"),
  vatNumber: varchar("vat_number", { length: 50 }),
  registrationNumber: varchar("registration_number", { length: 50 }),
  logo: text("logo"),
  primaryCurrency: varchar("primary_currency", { length: 3 }).default("ZAR"),
  secondaryCurrencies: jsonb("secondary_currencies").$type<string[]>().default([]),
  exchangeRates: jsonb("exchange_rates").$type<Record<string, number>>().default({}),
  invoicePrefix: varchar("invoice_prefix", { length: 10 }).default("INV"),
  estimatePrefix: varchar("estimate_prefix", { length: 10 }).default("EST"),
  paymentTerms: text("payment_terms"),
  emailReminderDays: jsonb("email_reminder_days").$type<number[]>().default([7, 3, 1]),
  autoEmailReminders: boolean("auto_email_reminders").default(false),
  fiscalYearStart: date("fiscal_year_start").default("2025-01-01"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("15.00"),
  // VAT Registration Settings
  vatRegistered: boolean("vat_registered").default(false),
  vatPeriod: varchar("vat_period", { length: 20 }).default("monthly"), // monthly, bi-monthly
  vatSubmissionDate: integer("vat_submission_date").default(25), // Day of month
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lot/Batch Tracking
export const productLots = pgTable("product_lots", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  productId: integer("product_id").notNull().references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  lotNumber: text("lot_number").notNull(),
  batchNumber: text("batch_number"),
  manufactureDate: timestamp("manufacture_date"),
  expiryDate: timestamp("expiry_date"),
  supplierRef: text("supplier_ref"), // Supplier's lot/batch reference
  quantity: integer("quantity").default(0),
  reservedQuantity: integer("reserved_quantity").default(0),
  availableQuantity: integer("available_quantity").default(0),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyLotUnique: unique().on(table.companyId, table.productId, table.lotNumber),
  companyIdx: index("product_lots_company_idx").on(table.companyId),
  productIdx: index("product_lots_product_idx").on(table.productId),
  expiryIdx: index("product_lots_expiry_idx").on(table.expiryDate),
}));

// Serial Number Tracking
export const productSerials = pgTable("product_serials", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  productId: integer("product_id").notNull().references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  lotId: integer("lot_id").references(() => productLots.id),
  serialNumber: text("serial_number").notNull(),
  status: text("status").default("available"), // available, sold, reserved, damaged, returned
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  customerInvoiceId: integer("customer_invoice_id").references(() => invoices.id), // When sold
  warrantyStartDate: timestamp("warranty_start_date"),
  warrantyEndDate: timestamp("warranty_end_date"),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companySerialUnique: unique().on(table.companyId, table.serialNumber),
  companyIdx: index("product_serials_company_idx").on(table.companyId),
  productIdx: index("product_serials_product_idx").on(table.productId),
  statusIdx: index("product_serials_status_idx").on(table.status),
}));

// Enhanced Inventory Transactions with lot/serial support
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  variantId: integer("variant_id").references(() => productVariants.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  lotId: integer("lot_id").references(() => productLots.id),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(), // 'in', 'out', 'adjustment', 'transfer'
  movementType: varchar("movement_type", { length: 30 }).notNull(), // 'purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage', 'shrinkage'
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  // Note: from_warehouse_id and to_warehouse_id columns don't exist in current database
  // These will be added in future schema migrations if needed
  reference: varchar("reference", { length: 100 }), // invoice, purchase order, adjustment ref
  referenceId: integer("reference_id"), // ID of related document
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id), // GL posting
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id).notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  serialNumbers: jsonb("serial_numbers").default([]), // Array of serial numbers involved
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("inventory_transactions_company_idx").on(table.companyId),
  productIdx: index("inventory_transactions_product_idx").on(table.productId),
  typeIdx: index("inventory_transactions_type_idx").on(table.transactionType),
  referenceIdx: index("inventory_transactions_reference_idx").on(table.reference, table.referenceId),
}));

// Physical Inventory / Stocktaking
export const stockCounts = pgTable("stock_counts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  countNumber: text("count_number").notNull(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  countType: text("count_type").default("full"), // full, partial, cycle
  status: text("status").default("draft"), // draft, in_progress, completed, cancelled
  countDate: timestamp("count_date").defaultNow(),
  scheduledDate: timestamp("scheduled_date"),
  startedBy: integer("started_by").references(() => users.id),
  completedBy: integer("completed_by").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  totalItemsCounted: integer("total_items_counted").default(0),
  totalVariances: integer("total_variances").default(0),
  totalAdjustmentValue: decimal("total_adjustment_value", { precision: 10, scale: 2 }).default("0.00"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyCountUnique: unique().on(table.companyId, table.countNumber),
  companyIdx: index("stock_counts_company_idx").on(table.companyId),
  statusIdx: index("stock_counts_status_idx").on(table.status),
}));

// Stock Count Items
export const stockCountItems = pgTable("stock_count_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  stockCountId: integer("stock_count_id").notNull().references(() => stockCounts.id),
  productId: integer("product_id").notNull().references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  lotId: integer("lot_id").references(() => productLots.id),
  expectedQuantity: integer("expected_quantity").default(0),
  countedQuantity: integer("counted_quantity"),
  variance: integer("variance").default(0),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  varianceValue: decimal("variance_value", { precision: 10, scale: 2 }).default("0.00"),
  countedBy: integer("counted_by").references(() => users.id),
  countedAt: timestamp("counted_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("stock_count_items_company_idx").on(table.companyId),
  stockCountIdx: index("stock_count_items_count_idx").on(table.stockCountId),
}));

// Automatic Reorder Rules
export const reorderRules = pgTable("reorder_rules", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  productId: integer("product_id").notNull().references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  reorderPoint: integer("reorder_point").notNull(),
  reorderQuantity: integer("reorder_quantity").notNull(),
  maxStockLevel: integer("max_stock_level"),
  leadTimeDays: integer("lead_time_days").default(0),
  isActive: boolean("is_active").default(true),
  lastOrderDate: timestamp("last_order_date"),
  nextReviewDate: timestamp("next_review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyProductUnique: unique().on(table.companyId, table.productId, table.warehouseId, table.variantId),
  companyIdx: index("reorder_rules_company_idx").on(table.companyId),
  productIdx: index("reorder_rules_product_idx").on(table.productId),
}));

// Product Bundles/Kits
export const productBundles = pgTable("product_bundles", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  bundleProductId: integer("bundle_product_id").notNull().references(() => products.id),
  componentProductId: integer("component_product_id").notNull().references(() => products.id),
  componentVariantId: integer("component_variant_id").references(() => productVariants.id),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  bundleComponentUnique: unique().on(table.bundleProductId, table.componentProductId, table.componentVariantId),
  companyIdx: index("product_bundles_company_idx").on(table.companyId),
  bundleIdx: index("product_bundles_bundle_idx").on(table.bundleProductId),
}));

// Enhanced Inventory Insert Schemas
export const insertProductLotSchema = createInsertSchema(productLots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSerialSchema = createInsertSchema(productSerials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockCountSchema = createInsertSchema(stockCounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockCountItemSchema = createInsertSchema(stockCountItems).omit({
  id: true,
  createdAt: true,
});

export const insertReorderRuleSchema = createInsertSchema(reorderRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductBundleSchema = createInsertSchema(productBundles).omit({
  id: true,
  createdAt: true,
});

// Email reminders table
export const emailReminders = pgTable("email_reminders", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  reminderType: varchar("reminder_type", { length: 20 }).notNull(), // 'overdue', 'payment_due'
  daysBefore: integer("days_before").notNull(),
  emailSent: boolean("email_sent").default(false),
  sentAt: timestamp("sent_at"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("email_reminders_company_idx").on(table.companyId),
}));

// Currency exchange rates table
export const currencyRates = pgTable("currency_rates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"), // Nullable for global rates
  fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
  toCurrency: varchar("to_currency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  validFrom: timestamp("valid_from").defaultNow(),
  validTo: timestamp("valid_to"),
  source: varchar("source", { length: 50 }).default("manual"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyCurrencyUnique: unique().on(table.companyId, table.fromCurrency, table.toCurrency, table.validFrom),
  companyIdx: index("currency_rates_company_idx").on(table.companyId),
}));

// Schema exports
export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailReminderSchema = createInsertSchema(emailReminders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCurrencyRateSchema = createInsertSchema(currencyRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;

export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

export type InsertEmailReminder = z.infer<typeof insertEmailReminderSchema>;
export type EmailReminder = typeof emailReminders.$inferSelect;

export type InsertCurrencyRate = z.infer<typeof insertCurrencyRateSchema>;
export type CurrencyRate = typeof currencyRates.$inferSelect;

// VAT Types - South African Standard VAT Categories
export const vatTypes = pgTable("vat_types", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"), // Nullable for system-wide types
  code: varchar("code", { length: 10 }).notNull(), // STD, ZER, EXE, NR
  name: varchar("name", { length: 100 }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  isSystemType: boolean("is_system_type").default(false), // Cannot be deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyCodeUnique: unique().on(table.companyId, table.code),
  codeIdx: index("vat_types_code_idx").on(table.code),
  activeIdx: index("vat_types_active_idx").on(table.isActive),
  companyIdx: index("vat_types_company_idx").on(table.companyId),
}));

// VAT Returns - VAT201 Reports
export const vatReports = pgTable("vat_reports", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  reportType: varchar("report_type", { length: 20 }).default("VAT201"), // VAT201, VAT202
  
  // VAT201 Fields - Standard South African VAT Return
  totalSalesIncVat: decimal("total_sales_inc_vat", { precision: 15, scale: 2 }).default("0.00"),
  totalSalesExcVat: decimal("total_sales_exc_vat", { precision: 15, scale: 2 }).default("0.00"),
  totalSalesVat: decimal("total_sales_vat", { precision: 15, scale: 2 }).default("0.00"),
  zeroRatedSales: decimal("zero_rated_sales", { precision: 15, scale: 2 }).default("0.00"),
  exemptSales: decimal("exempt_sales", { precision: 15, scale: 2 }).default("0.00"),
  
  totalPurchasesIncVat: decimal("total_purchases_inc_vat", { precision: 15, scale: 2 }).default("0.00"),
  totalPurchasesExcVat: decimal("total_purchases_exc_vat", { precision: 15, scale: 2 }).default("0.00"),
  totalPurchasesVat: decimal("total_purchases_vat", { precision: 15, scale: 2 }).default("0.00"),
  
  // Net VAT Calculation
  outputVat: decimal("output_vat", { precision: 15, scale: 2 }).default("0.00"), // VAT on sales
  inputVat: decimal("input_vat", { precision: 15, scale: 2 }).default("0.00"), // VAT on purchases
  netVatPayable: decimal("net_vat_payable", { precision: 15, scale: 2 }).default("0.00"),
  netVatRefund: decimal("net_vat_refund", { precision: 15, scale: 2 }).default("0.00"),
  
  // Additional VAT201 Fields
  badDebtReliefClaimed: decimal("bad_debt_relief_claimed", { precision: 15, scale: 2 }).default("0.00"),
  adjustmentsToPreviousReturns: decimal("adjustments_to_previous_returns", { precision: 15, scale: 2 }).default("0.00"),
  
  // Status and submission
  status: varchar("status", { length: 20 }).default("draft"), // draft, submitted, approved, paid
  submittedAt: timestamp("submitted_at"),
  submittedBy: integer("submitted_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id),
  
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyPeriodUnique: unique().on(table.companyId, table.periodStart, table.periodEnd),
  companyIdx: index("vat_reports_company_idx").on(table.companyId),
  periodIdx: index("vat_reports_period_idx").on(table.periodStart, table.periodEnd),
  statusIdx: index("vat_reports_status_idx").on(table.status),
}));

// VAT Transactions - Links invoices/purchases to VAT types
export const vatTransactions = pgTable("vat_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(), // sale, purchase
  sourceModule: varchar("source_module", { length: 50 }).notNull(), // invoice, expense, purchase_order
  sourceId: integer("source_id").notNull(), // ID from source module
  vatTypeId: integer("vat_type_id").references(() => vatTypes.id),
  
  // Amounts
  netAmount: decimal("net_amount", { precision: 15, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).notNull(),
  grossAmount: decimal("gross_amount", { precision: 15, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull(),
  
  // Transaction details
  transactionDate: timestamp("transaction_date").notNull(),
  description: text("description"),
  customerSupplierId: integer("customer_supplier_id"), // Customer or Supplier ID
  
  // VAT reporting
  vatPeriodStart: date("vat_period_start"), // Which VAT period this belongs to
  vatPeriodEnd: date("vat_period_end"),
  includedInReturn: boolean("included_in_return").default(false),
  vatReportId: integer("vat_report_id").references(() => vatReports.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("vat_transactions_company_idx").on(table.companyId),
  typeIdx: index("vat_transactions_type_idx").on(table.transactionType),
  sourceIdx: index("vat_transactions_source_idx").on(table.sourceModule, table.sourceId),
  periodIdx: index("vat_transactions_period_idx").on(table.vatPeriodStart, table.vatPeriodEnd),
  reportIdx: index("vat_transactions_report_idx").on(table.vatReportId),
}));

// Fixed Assets Management
export const fixedAssets = pgTable("fixed_assets", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  assetCode: varchar("asset_code", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  purchaseDate: date("purchase_date").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  depreciationMethod: varchar("depreciation_method", { length: 50 }).notNull().default("straight_line"),
  usefulLife: integer("useful_life").notNull(), // in years
  residualValue: decimal("residual_value", { precision: 12, scale: 2 }).default("0.00"),
  location: varchar("location", { length: 255 }),
  supplier: varchar("supplier", { length: 255 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  warrantyExpiry: date("warranty_expiry"),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, disposed, sold
  disposalDate: date("disposal_date"),
  disposalValue: decimal("disposal_value", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("fixed_assets_company_idx").on(table.companyId),
  statusIdx: index("fixed_assets_status_idx").on(table.status),
}));

// Depreciation Records
export const depreciationRecords = pgTable("depreciation_records", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  assetId: integer("asset_id").notNull().references(() => fixedAssets.id),
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM format
  depreciationAmount: decimal("depreciation_amount", { precision: 10, scale: 2 }).notNull(),
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 12, scale: 2 }).notNull(),
  bookValue: decimal("book_value", { precision: 12, scale: 2 }).notNull(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("depreciation_records_company_idx").on(table.companyId),
  assetIdx: index("depreciation_records_asset_idx").on(table.assetId),
  periodIdx: index("depreciation_records_period_idx").on(table.period),
}));

// Budgets
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  budgetType: varchar("budget_type", { length: 50 }).notNull(), // annual, quarterly, monthly, project
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalBudget: decimal("total_budget", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, active, completed, cancelled
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("budgets_company_idx").on(table.companyId),
  statusIdx: index("budgets_status_idx").on(table.status),
  typeIdx: index("budgets_type_idx").on(table.budgetType),
}));

// Budget Lines
export const budgetLines = pgTable("budget_lines", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  budgetId: integer("budget_id").notNull().references(() => budgets.id),
  accountId: integer("account_id").notNull().references(() => chartOfAccounts.id),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  budgetedAmount: decimal("budgeted_amount", { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 12, scale: 2 }).default("0.00"),
  variance: decimal("variance", { precision: 12, scale: 2 }).default("0.00"),
  variancePercent: decimal("variance_percent", { precision: 5, scale: 2 }).default("0.00"),
  period: varchar("period", { length: 7 }), // YYYY-MM for monthly budgets
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("budget_lines_company_idx").on(table.companyId),
  budgetIdx: index("budget_lines_budget_idx").on(table.budgetId),
  accountIdx: index("budget_lines_account_idx").on(table.accountId),
}));

// Cash Flow Forecasts
export const cashFlowForecasts = pgTable("cash_flow_forecasts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  forecastType: varchar("forecast_type", { length: 50 }).notNull(), // weekly, monthly, quarterly
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  basedOnHistorical: boolean("based_on_historical").default(true),
  historicalMonths: integer("historical_months").default(12),
  confidence: varchar("confidence", { length: 20 }).default("medium"), // low, medium, high
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("cash_flow_forecasts_company_idx").on(table.companyId),
  typeIdx: index("cash_flow_forecasts_type_idx").on(table.forecastType),
}));

// Cash Flow Forecast Lines
export const cashFlowForecastLines = pgTable("cash_flow_forecast_lines", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  forecastId: integer("forecast_id").notNull().references(() => cashFlowForecasts.id),
  period: date("period").notNull(), // Start of period (week/month/quarter)
  category: varchar("category", { length: 100 }).notNull(), // inflow, outflow
  subcategory: varchar("subcategory", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  forecastAmount: decimal("forecast_amount", { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 12, scale: 2 }).default("0.00"),
  variance: decimal("variance", { precision: 12, scale: 2 }).default("0.00"),
  probability: decimal("probability", { precision: 3, scale: 2 }).default("1.00"), // 0.00 to 1.00
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("cash_flow_forecast_lines_company_idx").on(table.companyId),
  forecastIdx: index("cash_flow_forecast_lines_forecast_idx").on(table.forecastId),
  periodIdx: index("cash_flow_forecast_lines_period_idx").on(table.period),
  categoryIdx: index("cash_flow_forecast_lines_category_idx").on(table.category),
}));

// Advanced Reports
export const advancedReports = pgTable("advanced_reports", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  reportName: varchar("report_name", { length: 255 }).notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(), // financial_analysis, budget_variance, cash_flow, asset_register, custom
  parameters: jsonb("parameters"), // Store report parameters as JSON
  schedule: varchar("schedule", { length: 20 }), // manual, daily, weekly, monthly, quarterly
  recipients: jsonb("recipients"), // Array of email addresses
  lastGenerated: timestamp("last_generated"),
  nextScheduled: timestamp("next_scheduled"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("advanced_reports_company_idx").on(table.companyId),
  typeIdx: index("advanced_reports_type_idx").on(table.reportType),
  scheduleIdx: index("advanced_reports_schedule_idx").on(table.schedule),
}));

// Bank Reconciliation Items
export const bankReconciliationItems = pgTable("bank_reconciliation_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  reconciliationId: integer("reconciliation_id").notNull().references(() => bankReconciliations.id),
  transactionId: integer("transaction_id").references(() => bankTransactions.id),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(), // bank, book
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("unmatched"), // matched, unmatched, pending
  matchedWith: integer("matched_with"), // Reference to matching item
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("bank_reconciliation_items_company_idx").on(table.companyId),
  reconciliationIdx: index("bank_reconciliation_items_reconciliation_idx").on(table.reconciliationId),
  statusIdx: index("bank_reconciliation_items_status_idx").on(table.status),
}));

// VAT Types - Schema definitions after tables
export const insertVatTypeSchema = createInsertSchema(vatTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVatReportSchema = createInsertSchema(vatReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVatTransactionSchema = createInsertSchema(vatTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type VatType = typeof vatTypes.$inferSelect;
export type InsertVatType = z.infer<typeof insertVatTypeSchema>;

export type VatReport = typeof vatReports.$inferSelect;
export type InsertVatReport = z.infer<typeof insertVatReportSchema>;

export type VatTransaction = typeof vatTransactions.$inferSelect;
export type InsertVatTransaction = z.infer<typeof insertVatTransactionSchema>;

// Advanced Financial Management - Schema definitions
export const insertFixedAssetSchema = createInsertSchema(fixedAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDepreciationRecordSchema = createInsertSchema(depreciationRecords).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetLineSchema = createInsertSchema(budgetLines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCashFlowForecastSchema = createInsertSchema(cashFlowForecasts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCashFlowForecastLineSchema = createInsertSchema(cashFlowForecastLines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdvancedReportSchema = createInsertSchema(advancedReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBankReconciliationItemSchema = createInsertSchema(bankReconciliationItems).omit({
  id: true,
  createdAt: true,
});

// Advanced Financial Management - Type definitions
export type FixedAsset = typeof fixedAssets.$inferSelect;
export type InsertFixedAsset = z.infer<typeof insertFixedAssetSchema>;

export type DepreciationRecord = typeof depreciationRecords.$inferSelect;
export type InsertDepreciationRecord = z.infer<typeof insertDepreciationRecordSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type BudgetLine = typeof budgetLines.$inferSelect;
export type InsertBudgetLine = z.infer<typeof insertBudgetLineSchema>;

export type CashFlowForecast = typeof cashFlowForecasts.$inferSelect;
export type InsertCashFlowForecast = z.infer<typeof insertCashFlowForecastSchema>;

export type CashFlowForecastLine = typeof cashFlowForecastLines.$inferSelect;
export type InsertCashFlowForecastLine = z.infer<typeof insertCashFlowForecastLineSchema>;

export type AdvancedReport = typeof advancedReports.$inferSelect;
export type InsertAdvancedReport = z.infer<typeof insertAdvancedReportSchema>;

export type BankReconciliationItem = typeof bankReconciliationItems.$inferSelect;
export type InsertBankReconciliationItem = z.infer<typeof insertBankReconciliationItemSchema>;

// Chart of Accounts - South African Business Accounting Standards
export const chartOfAccounts: any = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  accountCode: varchar("account_code", { length: 20 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  parentAccountId: integer("parent_account_id").references(() => chartOfAccounts.id),
  accountType: varchar("account_type", { length: 50 }).notNull(), // Asset, Liability, Equity, Revenue, Expense
  accountSubType: varchar("account_sub_type", { length: 100 }), // Current Asset, Fixed Asset, etc.
  normalBalance: varchar("normal_balance", { length: 10 }).notNull(), // Debit or Credit
  isActive: boolean("is_active").default(true),
  description: text("description"),
  taxType: varchar("tax_type", { length: 50 }), // VAT, PAYE, etc.
  level: integer("level").default(1), // Account hierarchy level
  isSystemAccount: boolean("is_system_account").default(false), // Cannot be deleted
  industryTemplates: jsonb("industry_templates").default([]), // Array of industry codes this account applies to
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyCodeUnique: unique().on(table.companyId, table.accountCode),
  companyIdx: index("chart_accounts_company_idx").on(table.companyId),
  typeIdx: index("chart_accounts_type_idx").on(table.accountType),
  activeIdx: index("chart_accounts_active_idx").on(table.isActive),
}));

// Industry Templates for Chart of Accounts
export const industryTemplates = pgTable("industry_templates", {
  id: serial("id").primaryKey(),
  industryCode: varchar("industry_code", { length: 50 }).notNull().unique(),
  industryName: varchar("industry_name", { length: 100 }).notNull(),
  description: text("description"),
  accountCodes: jsonb("account_codes").notNull(), // Array of account codes to activate for this industry
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  codeIdx: index("industry_templates_code_idx").on(table.industryCode),
  activeIdx: index("industry_templates_active_idx").on(table.isActive),
}));

// Company Chart of Accounts Activation
export const companyChartOfAccounts = pgTable("company_chart_of_accounts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  accountId: integer("account_id").notNull().references(() => chartOfAccounts.id),
  isActive: boolean("is_active").default(true),
  activatedAt: timestamp("activated_at").defaultNow(),
  activatedBy: integer("activated_by").references(() => users.id),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: integer("deactivated_by").references(() => users.id),
}, (table) => ({
  companyAccountUnique: unique().on(table.companyId, table.accountId),
  companyIdx: index("company_coa_company_idx").on(table.companyId),
  accountIdx: index("company_coa_account_idx").on(table.accountId),
  activeIdx: index("company_coa_active_idx").on(table.isActive),
}));

// Journal Entries for double-entry bookkeeping
export const journalEntries: any = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  entryNumber: varchar("entry_number", { length: 50 }).notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  description: text("description").notNull(),
  reference: varchar("reference", { length: 100 }), // Invoice number, payment ref, etc.
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).notNull(),
  isPosted: boolean("is_posted").default(false),
  isReversed: boolean("is_reversed").default(false),
  reversalEntryId: integer("reversal_entry_id").references(() => journalEntries.id),
  createdBy: integer("created_by").references(() => users.id),
  sourceModule: varchar("source_module", { length: 50 }), // invoice, payment, expense, etc.
  sourceId: integer("source_id"), // ID from source module
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyEntryUnique: unique().on(table.companyId, table.entryNumber),
  companyIdx: index("journal_entries_company_idx").on(table.companyId),
  dateIdx: index("journal_entries_date_idx").on(table.transactionDate),
  postedIdx: index("journal_entries_posted_idx").on(table.isPosted),
}));

// Journal Entry Lines (the actual debits and credits)
export const journalEntryLines = pgTable("journal_entry_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: integer("account_id").references(() => chartOfAccounts.id).notNull(),
  description: text("description"),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0.00"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("0.00"),
  vatInclusive: boolean("vat_inclusive").default(false),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).default("0.00"),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  entryIdx: index("journal_lines_entry_idx").on(table.journalEntryId),
  accountIdx: index("journal_lines_account_idx").on(table.accountId),
}));

// Account Balances (for performance - calculated periodically)
export const accountBalances = pgTable("account_balances", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  accountId: integer("account_id").references(() => chartOfAccounts.id).notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default("0.00"),
  debitTotal: decimal("debit_total", { precision: 15, scale: 2 }).default("0.00"),
  creditTotal: decimal("credit_total", { precision: 15, scale: 2 }).default("0.00"),
  closingBalance: decimal("closing_balance", { precision: 15, scale: 2 }).default("0.00"),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => ({
  companyAccountPeriodUnique: unique().on(table.companyId, table.accountId, table.periodStart),
  companyIdx: index("account_balances_company_idx").on(table.companyId),
  accountIdx: index("account_balances_account_idx").on(table.accountId),
  periodIdx: index("account_balances_period_idx").on(table.periodStart, table.periodEnd),
}));

// Chart of Accounts schemas
export const insertChartOfAccountSchema = createInsertSchema(chartOfAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntryLineSchema = createInsertSchema(journalEntryLines).omit({
  id: true,
  createdAt: true,
});

export const insertAccountBalanceSchema = createInsertSchema(accountBalances).omit({
  id: true,
  lastUpdated: true,
});

// Chart of Accounts types
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = z.infer<typeof insertChartOfAccountSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertJournalEntryLine = z.infer<typeof insertJournalEntryLineSchema>;
export type AccountBalance = typeof accountBalances.$inferSelect;
export type InsertAccountBalance = z.infer<typeof insertAccountBalanceSchema>;

// Extended types for Chart of Accounts
export type ChartOfAccountWithBalance = ChartOfAccount & {
  currentBalance: string;
  children?: ChartOfAccountWithBalance[];
};

// Industry Template types
export type IndustryTemplate = typeof industryTemplates.$inferSelect;
export type InsertIndustryTemplate = typeof industryTemplates.$inferInsert;
export type CompanyChartOfAccount = typeof companyChartOfAccounts.$inferSelect;
export type InsertCompanyChartOfAccount = typeof companyChartOfAccounts.$inferInsert;

export type JournalEntryWithLines = JournalEntry & {
  lines: JournalEntryLine[];
  createdByUser?: { name: string; username: string };
};

export type AccountBalanceReport = {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  openingBalance: string;
  debitTotal: string;
  creditTotal: string;
  closingBalance: string;
};

// Relations for Chart of Accounts
export const chartOfAccountsRelations = relations(chartOfAccounts, ({ one, many }) => ({
  company: one(companies, {
    fields: [chartOfAccounts.companyId],
    references: [companies.id],
  }),
  parentAccount: one(chartOfAccounts, {
    fields: [chartOfAccounts.parentAccountId],
    references: [chartOfAccounts.id],
  }),
  childAccounts: many(chartOfAccounts),
  journalLines: many(journalEntryLines),
  balances: many(accountBalances),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  company: one(companies, {
    fields: [journalEntries.companyId],
    references: [companies.id],
  }),
  createdBy: one(users, {
    fields: [journalEntries.createdBy],
    references: [users.id],
  }),
  lines: many(journalEntryLines),
  reversalEntry: one(journalEntries, {
    fields: [journalEntries.reversalEntryId],
    references: [journalEntries.id],
  }),
}));

export const journalEntryLinesRelations = relations(journalEntryLines, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalEntryLines.journalEntryId],
    references: [journalEntries.id],
  }),
  account: one(chartOfAccounts, {
    fields: [journalEntryLines.accountId],
    references: [chartOfAccounts.id],
  }),
}));

export const accountBalancesRelations = relations(accountBalances, ({ one }) => ({
  company: one(companies, {
    fields: [accountBalances.companyId],
    references: [companies.id],
  }),
  account: one(chartOfAccounts, {
    fields: [accountBalances.accountId],
    references: [chartOfAccounts.id],
  }),
}));

// Bank Accounts
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  branchCode: text("branch_code"),
  accountType: text("account_type").notNull().default("current"), // current, savings, credit, loan
  currency: text("currency").notNull().default("ZAR"),
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default("0.00"),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  reconcileBalance: decimal("reconcile_balance", { precision: 15, scale: 2 }).default("0.00"),
  lastReconciled: timestamp("last_reconciled"),
  chartAccountId: integer("chart_account_id").references(() => chartOfAccounts.id),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bank Transactions
export const bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  bankAccountId: integer("bank_account_id").notNull().references(() => bankAccounts.id),
  transactionDate: timestamp("transaction_date").notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  transactionType: text("transaction_type").notNull(), // debit, credit
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0.00"),
  balance: decimal("balance", { precision: 15, scale: 2 }),
  status: text("status").default("pending"), // pending, cleared, reconciled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// General Ledger View (Real-time calculated from journal entries)
export const generalLedger = pgTable("general_ledger", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  accountId: integer("account_id").notNull().references(() => chartOfAccounts.id),
  journalEntryId: integer("journal_entry_id").notNull().references(() => journalEntries.id),
  journalEntryLineId: integer("journal_entry_line_id").notNull().references(() => journalEntryLines.id),
  transactionDate: timestamp("transaction_date").notNull(),
  entryNumber: text("entry_number").notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0.00"),
  runningBalance: decimal("running_balance", { precision: 15, scale: 2 }).default("0.00"),
  sourceModule: text("source_module"), // invoice, expense, journal, bank, etc.
  sourceId: integer("source_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bank Reconciliation
export const bankReconciliations = pgTable("bank_reconciliations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  bankAccountId: integer("bank_account_id").notNull().references(() => bankAccounts.id),
  reconciliationDate: timestamp("reconciliation_date").notNull(),
  statementDate: timestamp("statement_date").notNull(),
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).notNull(),
  closingBalance: decimal("closing_balance", { precision: 15, scale: 2 }).notNull(),
  statementBalance: decimal("statement_balance", { precision: 15, scale: 2 }).notNull(),
  difference: decimal("difference", { precision: 15, scale: 2 }).default("0.00"),
  isComplete: boolean("is_complete").default(false),
  notes: text("notes"),
  reconciledBy: integer("reconciled_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Banking and GL schemas
export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBankTransactionSchema = createInsertSchema(bankTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBankReconciliationSchema = createInsertSchema(bankReconciliations).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Banking and GL types
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankTransaction = typeof bankTransactions.$inferSelect;
export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>;
export type GeneralLedger = typeof generalLedger.$inferSelect;
export type BankReconciliation = typeof bankReconciliations.$inferSelect;
export type InsertBankReconciliation = z.infer<typeof insertBankReconciliationSchema>;

export type BankAccountWithTransactions = BankAccount & {
  transactions: BankTransaction[];
  chartAccount?: ChartOfAccount;
};

export type GeneralLedgerEntry = {
  id: number;
  transactionDate: Date;
  accountCode: string;
  accountName: string;
  description: string;
  reference?: string;
  debitAmount: string;
  creditAmount: string;
  runningBalance: string;
  entryNumber: string;
  sourceModule?: string;
  sourceId?: string;
  accountId: number;
  companyId: number;
  createdAt: Date;
};

// South African Standard VAT Types
export const SOUTH_AFRICAN_VAT_TYPES = [
  { code: "STD", name: "Standard Rate", rate: "15.00", description: "Standard VAT rate applicable to most goods and services", isSystemType: true },
  { code: "ZER", name: "Zero-Rated", rate: "0.00", description: "Zero-rated supplies (exports, basic foodstuffs)", isSystemType: true },
  { code: "EXE", name: "Exempt", rate: "0.00", description: "Exempt supplies (financial services, residential rent)", isSystemType: true },
  { code: "NR", name: "Not Reportable", rate: "0.00", description: "Non-VAT transactions (wages, dividends)", isSystemType: true },
  { code: "OUT", name: "Out of Scope", rate: "0.00", description: "Transactions outside the scope of VAT", isSystemType: true },
];

// South African IFRS-compliant Chart of Accounts structure
export const SOUTH_AFRICAN_CHART_OF_ACCOUNTS = [
  // 1000-1999 ASSETS
  // Current Assets
  { accountCode: "1001", accountName: "Petty Cash", accountType: "Asset", category: "Current Assets", normalBalance: "Debit", isSystemAccount: true },
  { accountCode: "1100", accountName: "Bank Account - Current", accountType: "Asset", category: "Current Assets", normalBalance: "Debit", isSystemAccount: true },
  { accountCode: "1101", accountName: "Bank Account - Savings", accountType: "Asset", category: "Current Assets", normalBalance: "Debit", isSystemAccount: true },
  { accountCode: "1102", accountName: "Bank Account - Credit Card", accountType: "Asset", category: "Current Assets", normalBalance: "Debit", isSystemAccount: true },
  { accountCode: "1103", accountName: "Bank Account - Money Market", accountType: "Asset", category: "Current Assets", normalBalance: "Debit", isSystemAccount: true },
  { accountCode: "1200", accountName: "Accounts Receivable", accountType: "Asset", category: "Current Assets", normalBalance: "Debit", isSystemAccount: true },
  { accountCode: "1201", accountName: "Accounts Receivable - Trade", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1202", accountName: "Allowance for Doubtful Debts", accountType: "Asset", category: "Current Assets", normalBalance: "Credit" },
  { accountCode: "1210", accountName: "VAT Input", accountType: "Asset", category: "Current Assets", normalBalance: "Debit", isSystemAccount: true },
  { accountCode: "1211", accountName: "VAT Receivable", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1300", accountName: "Inventory - Raw Materials", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1301", accountName: "Inventory - Work in Progress", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1302", accountName: "Inventory - Finished Goods", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1303", accountName: "Inventory - Merchandise", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1400", accountName: "Prepaid Expenses", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1401", accountName: "Prepaid Rent", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1402", accountName: "Prepaid Insurance", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1403", accountName: "Prepaid Legal Fees", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1500", accountName: "Other Current Assets", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1501", accountName: "Loans to Employees", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },
  { accountCode: "1502", accountName: "Deposits Paid", accountType: "Asset", category: "Current Assets", normalBalance: "Debit" },

  // Non-Current Assets
  { accountCode: "1600", accountName: "Property, Plant & Equipment", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1601", accountName: "Land", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1602", accountName: "Buildings", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1603", accountName: "Plant & Machinery", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1604", accountName: "Office Equipment", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1605", accountName: "Computer Equipment", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1606", accountName: "Motor Vehicles", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1607", accountName: "Furniture & Fittings", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1650", accountName: "Accumulated Depreciation - Buildings", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Credit" },
  { accountCode: "1651", accountName: "Accumulated Depreciation - Plant & Machinery", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Credit" },
  { accountCode: "1652", accountName: "Accumulated Depreciation - Office Equipment", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Credit" },
  { accountCode: "1653", accountName: "Accumulated Depreciation - Computer Equipment", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Credit" },
  { accountCode: "1654", accountName: "Accumulated Depreciation - Motor Vehicles", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Credit" },
  { accountCode: "1655", accountName: "Accumulated Depreciation - Furniture & Fittings", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Credit" },
  { accountCode: "1700", accountName: "Intangible Assets", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1701", accountName: "Goodwill", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1702", accountName: "Patents & Trademarks", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1703", accountName: "Software Licenses", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1750", accountName: "Accumulated Amortisation - Intangible Assets", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Credit" },
  { accountCode: "1800", accountName: "Investments", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },
  { accountCode: "1801", accountName: "Long-term Investments", accountType: "Asset", category: "Non-Current Assets", normalBalance: "Debit" },

  // 2000-2999 LIABILITIES
  // Current Liabilities
  { accountCode: "2100", accountName: "Accounts Payable", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit", isSystemAccount: true },
  { accountCode: "2101", accountName: "Accounts Payable - Trade", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2110", accountName: "VAT Output", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit", isSystemAccount: true },
  { accountCode: "2111", accountName: "VAT Payable", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2120", accountName: "PAYE Payable", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2121", accountName: "UIF Payable", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2122", accountName: "SDL Payable", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2123", accountName: "WCA Payable", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2200", accountName: "Accrued Expenses", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2201", accountName: "Accrued Salaries", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2202", accountName: "Accrued Interest", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2203", accountName: "Accrued Utilities", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2300", accountName: "Short-term Loans", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2301", accountName: "Bank Overdraft", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2302", accountName: "Credit Card Liability", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2400", accountName: "Deferred Revenue", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2401", accountName: "Customer Deposits", accountType: "Liability", category: "Current Liabilities", normalBalance: "Credit" },

  // Non-Current Liabilities
  { accountCode: "2500", accountName: "Long-term Debt", accountType: "Liability", category: "Non-Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2501", accountName: "Mortgage Payable", accountType: "Liability", category: "Non-Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2502", accountName: "Equipment Loans", accountType: "Liability", category: "Non-Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2600", accountName: "Deferred Tax Liability", accountType: "Liability", category: "Non-Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2700", accountName: "Provisions", accountType: "Liability", category: "Non-Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2701", accountName: "Provision for Leave Pay", accountType: "Liability", category: "Non-Current Liabilities", normalBalance: "Credit" },
  { accountCode: "2702", accountName: "Provision for Bonus", accountType: "Liability", category: "Non-Current Liabilities", normalBalance: "Credit" },

  // 3000-3999 EQUITY
  { accountCode: "3000", accountName: "Share Capital", accountType: "Equity", category: "Equity", normalBalance: "Credit", isSystemAccount: true },
  { accountCode: "3001", accountName: "Ordinary Shares", accountType: "Equity", category: "Equity", normalBalance: "Credit" },
  { accountCode: "3002", accountName: "Preference Shares", accountType: "Equity", category: "Equity", normalBalance: "Credit" },
  { accountCode: "3100", accountName: "Retained Earnings", accountType: "Equity", category: "Equity", normalBalance: "Credit", isSystemAccount: true },
  { accountCode: "3200", accountName: "Current Year Earnings", accountType: "Equity", category: "Equity", normalBalance: "Credit" },
  { accountCode: "3300", accountName: "Drawings", accountType: "Equity", category: "Equity", normalBalance: "Debit" },
  { accountCode: "3301", accountName: "Owner's Drawings", accountType: "Equity", category: "Equity", normalBalance: "Debit" },
  { accountCode: "3400", accountName: "Reserves", accountType: "Equity", category: "Equity", normalBalance: "Credit" },
  { accountCode: "3401", accountName: "Capital Reserves", accountType: "Equity", category: "Equity", normalBalance: "Credit" },
  { accountCode: "3402", accountName: "Revaluation Reserves", accountType: "Equity", category: "Equity", normalBalance: "Credit" },

  // 4000-4999 REVENUE
  // Operating Revenue
  { accountCode: "4000", accountName: "Sales Revenue", accountType: "Revenue", category: "Operating Revenue", normalBalance: "Credit", isSystemAccount: true },
  { accountCode: "4001", accountName: "Product Sales", accountType: "Revenue", category: "Operating Revenue", normalBalance: "Credit" },
  { accountCode: "4002", accountName: "Service Revenue", accountType: "Revenue", category: "Operating Revenue", normalBalance: "Credit" },
  { accountCode: "4003", accountName: "Consulting Revenue", accountType: "Revenue", category: "Operating Revenue", normalBalance: "Credit" },
  { accountCode: "4010", accountName: "Sales Returns & Allowances", accountType: "Revenue", category: "Operating Revenue", normalBalance: "Debit" },
  { accountCode: "4011", accountName: "Sales Discounts", accountType: "Revenue", category: "Operating Revenue", normalBalance: "Debit" },

  // Other Revenue
  { accountCode: "4100", accountName: "Other Revenue", accountType: "Revenue", category: "Other Revenue", normalBalance: "Credit" },
  { accountCode: "4101", accountName: "Interest Income", accountType: "Revenue", category: "Other Revenue", normalBalance: "Credit" },
  { accountCode: "4102", accountName: "Dividend Income", accountType: "Revenue", category: "Other Revenue", normalBalance: "Credit" },
  { accountCode: "4103", accountName: "Rental Income", accountType: "Revenue", category: "Other Revenue", normalBalance: "Credit" },
  { accountCode: "4104", accountName: "Foreign Exchange Gains", accountType: "Revenue", category: "Other Revenue", normalBalance: "Credit" },
  { accountCode: "4105", accountName: "Gain on Sale of Assets", accountType: "Revenue", category: "Other Revenue", normalBalance: "Credit" },

  // 5000-5999 COST OF GOODS SOLD
  { accountCode: "5000", accountName: "Cost of Goods Sold", accountType: "Cost of Goods Sold", category: "Direct Materials", normalBalance: "Debit", isSystemAccount: true },
  { accountCode: "5001", accountName: "Cost of Materials", accountType: "Cost of Goods Sold", category: "Direct Materials", normalBalance: "Debit" },
  { accountCode: "5002", accountName: "Cost of Labor - Direct", accountType: "Cost of Goods Sold", category: "Direct Labor", normalBalance: "Debit" },
  { accountCode: "5003", accountName: "Manufacturing Overhead", accountType: "Cost of Goods Sold", category: "Manufacturing Overhead", normalBalance: "Debit" },
  { accountCode: "5010", accountName: "Freight & Shipping Costs", accountType: "Cost of Goods Sold", category: "Direct Materials", normalBalance: "Debit" },
  { accountCode: "5011", accountName: "Import Duties", accountType: "Cost of Goods Sold", category: "Direct Materials", normalBalance: "Debit" },
  { accountCode: "5020", accountName: "Inventory Adjustments", accountType: "Cost of Goods Sold", category: "Finished Goods", normalBalance: "Debit" },
  { accountCode: "5021", accountName: "Obsolete Inventory Write-off", accountType: "Cost of Goods Sold", category: "Finished Goods", normalBalance: "Debit" },

  // 6000-6999 OPERATING EXPENSES
  // Administrative Expenses
  { accountCode: "6000", accountName: "Administrative Expenses", accountType: "Expense", category: "Administrative Expenses", normalBalance: "Debit" },
  { accountCode: "6001", accountName: "Salaries & Wages - Admin", accountType: "Expense", category: "Administrative Expenses", normalBalance: "Debit" },
  { accountCode: "6002", accountName: "Employee Benefits", accountType: "Expense", category: "Administrative Expenses", normalBalance: "Debit" },
  { accountCode: "6003", accountName: "Pension Contributions", accountType: "Expense", category: "Administrative Expenses", normalBalance: "Debit" },
  { accountCode: "6004", accountName: "Medical Aid Contributions", accountType: "Expense", category: "Administrative Expenses", normalBalance: "Debit" },
  { accountCode: "6005", accountName: "UIF Contributions", accountType: "Expense", category: "Administrative Expenses", normalBalance: "Debit" },
  { accountCode: "6006", accountName: "SDL Contributions", accountType: "Expense", category: "Administrative Expenses", normalBalance: "Debit" },
  { accountCode: "6007", accountName: "WCA Contributions", accountType: "Expense", category: "Administrative Expenses", normalBalance: "Debit" },
  
  // Office & General Expenses
  { accountCode: "6100", accountName: "Office Rent", accountType: "Expense", category: "Office & General" },
  { accountCode: "6101", accountName: "Utilities", accountType: "Expense", category: "Office & General" },
  { accountCode: "6102", accountName: "Electricity", accountType: "Expense", category: "Office & General" },
  { accountCode: "6103", accountName: "Water & Rates", accountType: "Expense", category: "Office & General" },
  { accountCode: "6104", accountName: "Telephone & Internet", accountType: "Expense", category: "Office & General" },
  { accountCode: "6105", accountName: "Postage & Courier", accountType: "Expense", category: "Office & General" },
  { accountCode: "6106", accountName: "Office Supplies", accountType: "Expense", category: "Office & General" },
  { accountCode: "6107", accountName: "Stationery", accountType: "Expense", category: "Office & General" },
  { accountCode: "6108", accountName: "Cleaning & Maintenance", accountType: "Expense", category: "Office & General" },
  { accountCode: "6109", accountName: "Security", accountType: "Expense", category: "Office & General" },

  // Professional Services
  { accountCode: "6200", accountName: "Professional Fees", accountType: "Expense", category: "Professional Services" },
  { accountCode: "6201", accountName: "Legal Fees", accountType: "Expense", category: "Professional Services" },
  { accountCode: "6202", accountName: "Accounting & Audit Fees", accountType: "Expense", category: "Professional Services" },
  { accountCode: "6203", accountName: "Consulting Fees", accountType: "Expense", category: "Professional Services" },
  { accountCode: "6204", accountName: "Tax Preparation Fees", accountType: "Expense", category: "Professional Services" },

  // Marketing & Advertising
  { accountCode: "6300", accountName: "Marketing & Advertising", accountType: "Expense", category: "Marketing & Sales" },
  { accountCode: "6301", accountName: "Website & Online Marketing", accountType: "Expense", category: "Marketing & Sales" },
  { accountCode: "6302", accountName: "Print Advertising", accountType: "Expense", category: "Marketing & Sales" },
  { accountCode: "6303", accountName: "Trade Shows & Events", accountType: "Expense", category: "Marketing & Sales" },
  { accountCode: "6304", accountName: "Sales Commissions", accountType: "Expense", category: "Marketing & Sales" },

  // Travel & Entertainment
  { accountCode: "6400", accountName: "Travel & Accommodation", accountType: "Expense", category: "Travel & Entertainment" },
  { accountCode: "6401", accountName: "Local Travel", accountType: "Expense", category: "Travel & Entertainment" },
  { accountCode: "6402", accountName: "Overseas Travel", accountType: "Expense", category: "Travel & Entertainment" },
  { accountCode: "6403", accountName: "Meals & Entertainment", accountType: "Expense", category: "Travel & Entertainment" },

  // Vehicle Expenses
  { accountCode: "6500", accountName: "Motor Vehicle Expenses", accountType: "Expense", category: "Vehicle Expenses" },
  { accountCode: "6501", accountName: "Fuel", accountType: "Expense", category: "Vehicle Expenses" },
  { accountCode: "6502", accountName: "Vehicle Maintenance", accountType: "Expense", category: "Vehicle Expenses" },
  { accountCode: "6503", accountName: "Vehicle Insurance", accountType: "Expense", category: "Vehicle Expenses" },
  { accountCode: "6504", accountName: "Vehicle Licenses", accountType: "Expense", category: "Vehicle Expenses" },

  // Insurance
  { accountCode: "6600", accountName: "Insurance", accountType: "Expense", category: "Insurance" },
  { accountCode: "6601", accountName: "Building Insurance", accountType: "Expense", category: "Insurance" },
  { accountCode: "6602", accountName: "Equipment Insurance", accountType: "Expense", category: "Insurance" },
  { accountCode: "6603", accountName: "Public Liability Insurance", accountType: "Expense", category: "Insurance" },
  { accountCode: "6604", accountName: "Professional Indemnity Insurance", accountType: "Expense", category: "Insurance" },

  // Finance Costs
  { accountCode: "6700", accountName: "Finance Costs", accountType: "Expense", category: "Finance Costs" },
  { accountCode: "6701", accountName: "Interest Expense", accountType: "Expense", category: "Finance Costs" },
  { accountCode: "6702", accountName: "Bank Charges", accountType: "Expense", category: "Finance Costs" },
  { accountCode: "6703", accountName: "Foreign Exchange Losses", accountType: "Expense", category: "Finance Costs" },
  { accountCode: "6704", accountName: "Loss on Sale of Assets", accountType: "Expense", category: "Finance Costs" },

  // Depreciation & Amortisation
  { accountCode: "6800", accountName: "Depreciation", accountType: "Expense", category: "Depreciation & Amortisation" },
  { accountCode: "6801", accountName: "Depreciation - Buildings", accountType: "Expense", category: "Depreciation & Amortisation" },
  { accountCode: "6802", accountName: "Depreciation - Plant & Machinery", accountType: "Expense", category: "Depreciation & Amortisation" },
  { accountCode: "6803", accountName: "Depreciation - Office Equipment", accountType: "Expense", category: "Depreciation & Amortisation" },
  { accountCode: "6804", accountName: "Depreciation - Computer Equipment", accountType: "Expense", category: "Depreciation & Amortisation" },
  { accountCode: "6805", accountName: "Depreciation - Motor Vehicles", accountType: "Expense", category: "Depreciation & Amortisation" },
  { accountCode: "6806", accountName: "Depreciation - Furniture & Fittings", accountType: "Expense", category: "Depreciation & Amortisation" },
  { accountCode: "6810", accountName: "Amortisation - Intangible Assets", accountType: "Expense", category: "Depreciation & Amortisation" },

  // Other Expenses
  { accountCode: "6900", accountName: "Other Expenses", accountType: "Expense", category: "Other Expenses" },
  { accountCode: "6901", accountName: "Donations", accountType: "Expense", category: "Other Expenses" },
  { accountCode: "6902", accountName: "Subscriptions & Memberships", accountType: "Expense", category: "Other Expenses" },
  { accountCode: "6903", accountName: "Training & Development", accountType: "Expense", category: "Other Expenses" },
  { accountCode: "6904", accountName: "Bad Debts", accountType: "Expense", category: "Other Expenses" },
  { accountCode: "6905", accountName: "Penalties & Fines", accountType: "Expense", category: "Other Expenses" },

  // 7000-7999 EXTRAORDINARY ITEMS
  { accountCode: "7000", accountName: "Extraordinary Income", accountType: "Revenue", category: "Extraordinary Items" },
  { accountCode: "7100", accountName: "Extraordinary Expenses", accountType: "Expense", category: "Extraordinary Items" },

  // 8000-8999 TAX
  { accountCode: "8000", accountName: "Income Tax Expense", accountType: "Expense", category: "Tax" },
  { accountCode: "8001", accountName: "Current Tax", accountType: "Expense", category: "Tax" },
  { accountCode: "8002", accountName: "Deferred Tax", accountType: "Expense", category: "Tax" },
  { accountCode: "8100", accountName: "Income Tax Payable", accountType: "Liability", category: "Tax" },
] as const;

// Point of Sale (POS) Module Tables
export const posTerminals = pgTable("pos_terminals", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  terminalName: varchar("terminal_name", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings").default({}), // layout, receipt settings, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_terminals_company_idx").on(table.companyId),
}));

export const posSales = pgTable("pos_sales", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  terminalId: integer("terminal_id").references(() => posTerminals.id),
  saleNumber: varchar("sale_number", { length: 50 }).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // cash, card, mobile, credit, voucher
  status: varchar("status", { length: 20 }).default("completed"), // draft, completed, refunded, voided
  receiptNumber: varchar("receipt_number", { length: 50 }),
  notes: text("notes"),
  isVoided: boolean("is_voided").default(false),
  voidReason: text("void_reason"),
  voidedBy: integer("voided_by").references(() => users.id),
  voidedAt: timestamp("voided_at"),
  saleDate: timestamp("sale_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_sales_company_idx").on(table.companyId),
  saleNumberIdx: index("pos_sales_number_idx").on(table.saleNumber),
  saleDateIdx: index("pos_sales_date_idx").on(table.saleDate),
}));

export const posSaleItems = pgTable("pos_sale_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  saleId: integer("sale_id").references(() => posSales.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  barcode: varchar("barcode", { length: 50 }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  vatInclusive: boolean("vat_inclusive").default(false),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_sale_items_company_idx").on(table.companyId),
  saleIdx: index("pos_sale_items_sale_idx").on(table.saleId),
}));

export const posPayments = pgTable("pos_payments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  saleId: integer("sale_id").references(() => posSales.id).notNull(),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reference: varchar("reference", { length: 100 }),
  cardType: varchar("card_type", { length: 20 }), // visa, mastercard, amex
  cardLast4: varchar("card_last4", { length: 4 }),
  authCode: varchar("auth_code", { length: 20 }),
  status: varchar("status", { length: 20 }).default("completed"),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).default("0.00"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_payments_company_idx").on(table.companyId),
  saleIdx: index("pos_payments_sale_idx").on(table.saleId),
}));

export const posPromotions = pgTable("pos_promotions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull(), // percentage, fixed, buy_x_get_y, happy_hour
  value: decimal("value", { precision: 10, scale: 2 }), // discount amount or percentage
  minPurchase: decimal("min_purchase", { precision: 10, scale: 2 }).default("0.00"),
  applicableProducts: jsonb("applicable_products").$type<number[]>().default([]), // product IDs
  applicableCategories: jsonb("applicable_categories").$type<number[]>().default([]), // category IDs
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  startTime: varchar("start_time", { length: 8 }), // HH:MM:SS for happy hour
  endTime: varchar("end_time", { length: 8 }),
  daysOfWeek: jsonb("days_of_week").$type<number[]>().default([]), // 0=Sunday, 1=Monday, etc.
  isActive: boolean("is_active").default(true),
  usageLimit: integer("usage_limit"), // max uses per customer
  totalUsageLimit: integer("total_usage_limit"), // max total uses
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_promotions_company_idx").on(table.companyId),
  activeIdx: index("pos_promotions_active_idx").on(table.isActive),
}));

export const posLoyaltyPrograms = pgTable("pos_loyalty_programs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // points, visits, amount_spent
  pointsPerRand: decimal("points_per_rand", { precision: 5, scale: 2 }).default("1.00"),
  rewardThreshold: integer("reward_threshold").default(100), // points needed for reward
  rewardValue: decimal("reward_value", { precision: 10, scale: 2 }).default("10.00"),
  expiryDays: integer("expiry_days").default(365), // days before points expire
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_loyalty_programs_company_idx").on(table.companyId),
}));

export const posCustomerLoyalty = pgTable("pos_customer_loyalty", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  programId: integer("program_id").references(() => posLoyaltyPrograms.id).notNull(),
  cardNumber: varchar("card_number", { length: 20 }),
  currentPoints: integer("current_points").default(0),
  totalPointsEarned: integer("total_points_earned").default(0),
  totalPointsRedeemed: integer("total_points_redeemed").default(0),
  lastEarnedDate: timestamp("last_earned_date"),
  lastRedeemedDate: timestamp("last_redeemed_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_customer_loyalty_company_idx").on(table.companyId),
  customerProgramUnique: unique().on(table.customerId, table.programId),
}));

export const posShifts = pgTable("pos_shifts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  terminalId: integer("terminal_id").references(() => posTerminals.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  openingCash: decimal("opening_cash", { precision: 10, scale: 2 }).default("0.00"),
  closingCash: decimal("closing_cash", { precision: 10, scale: 2 }),
  expectedCash: decimal("expected_cash", { precision: 10, scale: 2 }),
  cashVariance: decimal("cash_variance", { precision: 10, scale: 2 }),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0.00"),
  totalTransactions: integer("total_transactions").default(0),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("open"), // open, closed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_shifts_company_idx").on(table.companyId),
  terminalIdx: index("pos_shifts_terminal_idx").on(table.terminalId),
  userIdx: index("pos_shifts_user_idx").on(table.userId),
}));

export const posRefunds = pgTable("pos_refunds", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  originalSaleId: integer("original_sale_id").references(() => posSales.id).notNull(),
  refundNumber: varchar("refund_number", { length: 50 }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).notNull(),
  refundMethod: varchar("refund_method", { length: 20 }).notNull(), // original_payment, cash, store_credit
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("completed"),
  authorizationCode: varchar("authorization_code", { length: 50 }),
  authorizedBy: integer("authorized_by").references(() => users.id),
  refundDate: timestamp("refund_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_refunds_company_idx").on(table.companyId),
  originalSaleIdx: index("pos_refunds_original_sale_idx").on(table.originalSaleId),
}));

export const posRefundItems = pgTable("pos_refund_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  refundId: integer("refund_id").references(() => posRefunds.id).notNull(),
  originalItemId: integer("original_item_id").references(() => posSaleItems.id).notNull(),
  quantityRefunded: decimal("quantity_refunded", { precision: 10, scale: 3 }).notNull(),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdx: index("pos_refund_items_company_idx").on(table.companyId),
  refundIdx: index("pos_refund_items_refund_idx").on(table.refundId),
}));

// Project Management Tables
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("active"), // active, on_hold, completed, cancelled
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  startDate: date("start_date"),
  endDate: date("end_date"),
  estimatedHours: decimal("estimated_hours", { precision: 10, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 10, scale: 2 }).default("0"),
  budgetAmount: decimal("budget_amount", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }).default("0"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  isInternal: boolean("is_internal").default(false),
  projectManagerId: integer("project_manager_id").references(() => users.id),
  color: varchar("color", { length: 7 }).default("#3B82F6"), // Hex color for UI
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  companyIdx: index("projects_company_idx").on(table.companyId),
  statusIdx: index("projects_status_idx").on(table.status),
  customerIdx: index("projects_customer_idx").on(table.customerId),
}));

export const tasks: any = pgTable("tasks", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  projectId: integer("project_id").references(() => projects.id), // nullable for standalone tasks
  customerId: integer("customer_id").references(() => customers.id), // nullable for internal tasks
  parentTaskId: integer("parent_task_id").references(() => tasks.id), // for subtasks
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("todo"), // todo, in_progress, review, completed, cancelled
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  assignedToId: integer("assigned_to_id").references(() => users.id),
  startDate: date("start_date"),
  dueDate: date("due_date"),
  completedDate: date("completed_date"),
  estimatedHours: decimal("estimated_hours", { precision: 10, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 10, scale: 2 }).default("0"),
  isInternal: boolean("is_internal").default(false),
  isBillable: boolean("is_billable").default(true),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  progress: integer("progress").default(0), // 0-100 percentage
  tags: jsonb("tags"), // array of tags
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  companyIdx: index("tasks_company_idx").on(table.companyId),
  statusIdx: index("tasks_status_idx").on(table.status),
  projectIdx: index("tasks_project_idx").on(table.projectId),
  assignedIdx: index("tasks_assigned_idx").on(table.assignedToId),
}));

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  taskId: integer("task_id").references(() => tasks.id),
  customerId: integer("customer_id").references(() => customers.id),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  isBillable: boolean("is_billable").default(true),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  isRunning: boolean("is_running").default(false), // for active timers
  invoiceId: integer("invoice_id").references(() => invoices.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  companyIdx: index("time_entries_company_idx").on(table.companyId),
  userIdx: index("time_entries_user_idx").on(table.userId),
  projectIdx: index("time_entries_project_idx").on(table.projectId),
  taskIdx: index("time_entries_task_idx").on(table.taskId),
  runningIdx: index("time_entries_running_idx").on(table.isRunning),
}));

export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 50 }).default("member"), // owner, manager, member, viewer
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  uniqueProjectUser: unique().on(table.projectId, table.userId),
}));

export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false), // client can't see internal comments
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  taskId: integer("task_id").references(() => tasks.id),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  isPublic: boolean("is_public").default(false), // client can access
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectTemplates = pgTable("project_templates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false), // available to all companies
  templateData: jsonb("template_data").notNull(), // project structure, tasks, etc.
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for project management
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectMemberSchema = createInsertSchema(projectMembers).omit({
  id: true,
  addedAt: true,
});

export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectFileSchema = createInsertSchema(projectFiles).omit({
  id: true,
  createdAt: true,
});

export const insertProjectTemplateSchema = createInsertSchema(projectTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for project management
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = z.infer<typeof insertProjectMemberSchema>;

export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;

export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;

export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertProjectTemplate = z.infer<typeof insertProjectTemplateSchema>;
export type NumberSequence = typeof numberSequences.$inferSelect;
export type InsertNumberSequence = typeof numberSequences.$inferInsert;

// Extended types for API responses
export type ProjectWithDetails = Project & {
  customer?: Customer;
  projectManager?: User;
  members?: ProjectMember[];
  tasks?: Task[];
  totalHours?: number;
  completedTasks?: number;
  totalTasks?: number;
};

export type TaskWithDetails = Task & {
  project?: Project;
  customer?: Customer;
  assignedTo?: User;
  comments?: TaskComment[];
  timeEntries?: TimeEntry[];
  files?: ProjectFile[];
  totalTimeSpent?: number;
};

export type TimeEntryWithDetails = TimeEntry & {
  project?: Project;
  task?: Task;
  user?: User;
  customer?: Customer;
};

// Email and SMS Services
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text").notNull(),
  templateType: text("template_type").notNull(), // invoice, payment_reminder, welcome, etc.
  variables: jsonb("variables").default([]), // Available template variables
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailQueue = pgTable("email_queue", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"),
  userId: integer("user_id"),
  to: text("to").notNull(),
  cc: text("cc"),
  bcc: text("bcc"),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text").notNull(),
  templateId: integer("template_id"),
  priority: integer("priority").default(5), // 1=high, 5=normal, 10=low
  status: text("status").default("pending"), // pending, sending, sent, failed
  attempts: integer("attempts").default(0),
  errorMessage: text("error_message"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const smsQueue = pgTable("sms_queue", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"),
  userId: integer("user_id"),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  smsType: text("sms_type").notNull(), // security, alert, reminder, marketing
  priority: integer("priority").default(5),
  status: text("status").default("pending"), // pending, sending, sent, failed
  attempts: integer("attempts").default(0),
  errorMessage: text("error_message"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workflow Automation System
export const workflowRules = pgTable("workflow_rules", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  triggerType: text("trigger_type").notNull(), // invoice_created, payment_received, etc.
  triggerConditions: jsonb("trigger_conditions").default({}),
  actions: jsonb("actions").default([]), // Array of actions to perform
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowExecutions = pgTable("workflow_executions", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").notNull(),
  triggerData: jsonb("trigger_data").default({}),
  status: text("status").default("pending"), // pending, running, completed, failed
  errorMessage: text("error_message"),
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Assistant Integration
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  companyId: integer("company_id").notNull(),
  title: text("title"),
  context: text("context"), // invoice, customer, report, etc.
  contextId: integer("context_id"), // ID of the related record
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(), // user, assistant, system
  message: text("message").notNull(),
  metadata: jsonb("metadata").default({}), // Additional context, tokens used, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Help Center System
export const helpArticles = pgTable("help_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").default([]),
  language: text("language").default("en"),
  isPublished: boolean("is_published").default(false),
  viewCount: integer("view_count").default(0),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const helpSearchQueries = pgTable("help_search_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  query: text("query").notNull(),
  resultsCount: integer("results_count").default(0),
  wasHelpful: boolean("was_helpful"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Monitoring and Security
export const apiRequestLogs = pgTable("api_request_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  companyId: integer("company_id"),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"), // milliseconds
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestBody: jsonb("request_body"),
  responseBody: jsonb("response_body"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  eventType: text("event_type").notNull(), // login_failed, password_changed, 2fa_enabled, etc.
  severity: text("severity").default("low"), // low, medium, high, critical
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Language Support
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  language: text("language").notNull(), // en, af, zu, xh
  namespace: text("namespace").notNull(), // common, dashboard, invoices, etc.
  key: text("key").notNull(),
  value: text("value").notNull(),
  isSystemTranslation: boolean("is_system_translation").default(true),
  updatedBy: integer("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  translationUnique: unique().on(table.language, table.namespace, table.key),
}));

// Enterprise Feature Insert Schemas
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailQueueSchema = createInsertSchema(emailQueue).omit({
  id: true,
  createdAt: true,
});

export const insertSMSQueueSchema = createInsertSchema(smsQueue).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowRuleSchema = createInsertSchema(workflowRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions).omit({
  id: true,
  createdAt: true,
});

export const insertAIConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAIMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  createdAt: true,
});

export const insertHelpArticleSchema = createInsertSchema(helpArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Enterprise Feature Types
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailQueue = typeof emailQueue.$inferSelect;
export type InsertEmailQueue = z.infer<typeof insertEmailQueueSchema>;
export type SMSQueue = typeof smsQueue.$inferSelect;
export type InsertSMSQueue = z.infer<typeof insertSMSQueueSchema>;

export type WorkflowRule = typeof workflowRules.$inferSelect;
export type InsertWorkflowRule = z.infer<typeof insertWorkflowRuleSchema>;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type InsertWorkflowExecution = z.infer<typeof insertWorkflowExecutionSchema>;

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = z.infer<typeof insertAIConversationSchema>;
export type AIMessage = typeof aiMessages.$inferSelect;
export type InsertAIMessage = z.infer<typeof insertAIMessageSchema>;

export type HelpArticle = typeof helpArticles.$inferSelect;
export type InsertHelpArticle = z.infer<typeof insertHelpArticleSchema>;

export type APIRequestLog = typeof apiRequestLogs.$inferSelect;
export type SecurityEvent = typeof securityEvents.$inferSelect;

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

// === CRITICAL MISSING FEATURES SCHEMA ===

// Credit Notes table - Critical missing feature
export const creditNotes = pgTable("credit_notes", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  originalInvoiceId: integer("original_invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  creditNoteNumber: varchar("credit_note_number", { length: 255 }).notNull(),
  issueDate: date("issue_date").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(), // return, discount, error_correction, cancellation
  reasonDescription: text("reason_description"),
  status: varchar("status", { length: 50 }).default("draft").notNull(), // draft, issued, applied, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  appliedAmount: decimal("applied_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("ZAR").notNull(),
  notes: text("notes"),
  isVatInclusive: boolean("is_vat_inclusive").default(false).notNull(),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Credit Note Items table
export const creditNoteItems = pgTable("credit_note_items", {
  id: serial("id").primaryKey(),
  creditNoteId: integer("credit_note_id").references(() => creditNotes.id, { onDelete: "cascade" }).notNull(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  originalInvoiceItemId: integer("original_invoice_item_id").references(() => invoiceItems.id, { onDelete: "set null" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  vatTypeId: integer("vat_type_id").references(() => vatTypes.id, { onDelete: "set null" }),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  isVatInclusive: boolean("is_vat_inclusive").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull()
});

// Automated Invoice Reminders table - Critical missing feature
export const invoiceReminders = pgTable("invoice_reminders", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  reminderType: varchar("reminder_type", { length: 50 }).notNull(), // overdue, payment_due, follow_up
  daysFromDue: integer("days_from_due").notNull(), // negative for before due, positive for after
  reminderNumber: integer("reminder_number").default(1).notNull(), // 1st, 2nd, 3rd reminder
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, sent, failed, cancelled
  sentDate: timestamp("sent_date"),
  sentMethod: varchar("sent_method", { length: 50 }), // email, sms, both
  emailSubject: varchar("email_subject", { length: 255 }),
  emailBody: text("email_body"),
  smsMessage: text("sms_message"),
  sentToEmail: varchar("sent_to_email", { length: 255 }),
  sentToPhone: varchar("sent_to_phone", { length: 50 }),
  responseReceived: boolean("response_received").default(false),
  responseDate: timestamp("response_date"),
  responseNotes: text("response_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Invoice Aging Reports table - Critical missing feature
export const invoiceAgingReports = pgTable("invoice_aging_reports", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  reportDate: date("report_date").notNull(),
  reportName: varchar("report_name", { length: 255 }).notNull(),
  agingPeriods: jsonb("aging_periods").notNull(), // [30, 60, 90, 120+]
  totalOutstanding: decimal("total_outstanding", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  period1Amount: decimal("period1_amount", { precision: 12, scale: 2 }).default("0.00").notNull(), // 1-30 days
  period2Amount: decimal("period2_amount", { precision: 12, scale: 2 }).default("0.00").notNull(), // 31-60 days
  period3Amount: decimal("period3_amount", { precision: 12, scale: 2 }).default("0.00").notNull(), // 61-90 days
  period4Amount: decimal("period4_amount", { precision: 12, scale: 2 }).default("0.00").notNull(), // 90+ days
  customerCount: integer("customer_count").notNull(),
  invoiceCount: integer("invoice_count").notNull(),
  reportData: jsonb("report_data").notNull(), // detailed customer aging data
  generatedBy: integer("generated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Approval Workflows table - Critical missing feature
export const approvalWorkflows = pgTable("approval_workflows", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  workflowName: varchar("workflow_name", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(), // invoice, expense, purchase_order, journal_entry
  triggerConditions: jsonb("trigger_conditions").notNull(), // amount thresholds, departments, etc.
  approvalSteps: jsonb("approval_steps").notNull(), // ordered list of approval steps
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Approval Requests table
export const approvalRequests = pgTable("approval_requests", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  workflowId: integer("workflow_id").references(() => approvalWorkflows.id, { onDelete: "cascade" }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: integer("entity_id").notNull(), // ID of the entity being approved
  requestedBy: integer("requested_by").references(() => users.id, { onDelete: "set null" }).notNull(),
  currentStepIndex: integer("current_step_index").default(0).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, rejected, cancelled
  requestData: jsonb("request_data").notNull(), // snapshot of entity data at request time
  approvalHistory: jsonb("approval_history").default("[]").notNull(), // array of approval actions
  priority: varchar("priority", { length: 20 }).default("normal").notNull(), // low, normal, high, urgent
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Bank Integration table - Critical missing feature
export const bankIntegrations = pgTable("bank_integrations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id, { onDelete: "cascade" }).notNull(),
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 255 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // checking, savings, credit_card
  integrationProvider: varchar("integration_provider", { length: 100 }).notNull(), // yodlee, saltedge, custom
  accessToken: text("access_token"), // encrypted
  refreshToken: text("refresh_token"), // encrypted
  lastSyncDate: timestamp("last_sync_date"),
  syncFrequency: varchar("sync_frequency", { length: 50 }).default("daily").notNull(), // daily, weekly, manual
  isActive: boolean("is_active").default(true).notNull(),
  syncStatus: varchar("sync_status", { length: 50 }).default("pending").notNull(), // pending, syncing, completed, error
  lastSyncError: text("last_sync_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Insert schemas for new critical features
export const insertCreditNoteSchema = createInsertSchema(creditNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditNoteItemSchema = createInsertSchema(creditNoteItems).omit({
  id: true,
});

// Enhanced Sales Module Insert Schemas
export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItems).omit({
  id: true,
  createdAt: true,
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryItemSchema = createInsertSchema(deliveryItems).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceReminderSchema = createInsertSchema(invoiceReminders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceAgingReportSchema = createInsertSchema(invoiceAgingReports).omit({
  id: true,
  createdAt: true,
});

export const insertApprovalWorkflowSchema = createInsertSchema(approvalWorkflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApprovalRequestSchema = createInsertSchema(approvalRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBankIntegrationSchema = createInsertSchema(bankIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



// Smart Spending Wizard - AI-powered financial advice system
export const spendingWizardProfiles = pgTable("spending_wizard_profiles", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  businessType: varchar("business_type", { length: 100 }).notNull(), // retail, services, manufacturing, etc.
  monthlyRevenue: decimal("monthly_revenue", { precision: 12, scale: 2 }),
  monthlyExpenses: decimal("monthly_expenses", { precision: 12, scale: 2 }),
  financialGoals: jsonb("financial_goals").default("[]"), // Array of financial goals
  riskTolerance: varchar("risk_tolerance", { length: 50 }).default("moderate"), // conservative, moderate, aggressive
  preferences: jsonb("preferences").default("{}"), // User preferences for advice types
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const spendingWizardConversations = pgTable("spending_wizard_conversations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // cash_flow, expenses, investments, tax_planning, etc.
  status: varchar("status", { length: 50 }).default("active"), // active, completed, archived
  lastMessage: text("last_message"),
  messageCount: integer("message_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const spendingWizardMessages = pgTable("spending_wizard_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => spendingWizardConversations.id, { onDelete: "cascade" }).notNull(),
  messageType: varchar("message_type", { length: 50 }).notNull(), // user, wizard, system
  content: text("content").notNull(),
  adviceType: varchar("advice_type", { length: 100 }), // tip, warning, recommendation, insight
  illustration: varchar("illustration", { length: 255 }), // SVG or emoji for visual appeal
  actionable: boolean("actionable").default(false), // Whether this message includes actionable advice
  actionData: jsonb("action_data").default("{}"), // Data for implementing suggested actions
  metadata: jsonb("metadata").default("{}"), // Additional context data
  createdAt: timestamp("created_at").defaultNow()
});

export const spendingWizardInsights = pgTable("spending_wizard_insights", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  insightType: varchar("insight_type", { length: 100 }).notNull(), // spending_pattern, cash_flow_forecast, cost_optimization
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 50 }).default("medium"), // low, medium, high, urgent
  category: varchar("category", { length: 100 }).notNull(),
  dataPoints: jsonb("data_points").notNull(), // Supporting data for the insight
  recommendations: jsonb("recommendations").default("[]"), // Specific action recommendations
  estimatedImpact: decimal("estimated_impact", { precision: 12, scale: 2 }), // Potential financial impact
  implementationEffort: varchar("implementation_effort", { length: 50 }).default("medium"), // low, medium, high
  status: varchar("status", { length: 50 }).default("new"), // new, viewed, dismissed, implemented
  illustration: varchar("illustration", { length: 255 }),
  expiresAt: timestamp("expires_at"), // Some insights may be time-sensitive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const spendingWizardTips = pgTable("spending_wizard_tips", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  businessType: varchar("business_type", { length: 100 }).default("general"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  illustration: varchar("illustration", { length: 255 }), // SVG or emoji
  priority: integer("priority").default(5), // 1-10 priority for display order
  isActive: boolean("is_active").default(true),
  seasonality: varchar("seasonality", { length: 100 }), // When tip is most relevant
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas for Smart Spending Wizard
export const insertSpendingWizardProfileSchema = createInsertSchema(spendingWizardProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpendingWizardConversationSchema = createInsertSchema(spendingWizardConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpendingWizardMessageSchema = createInsertSchema(spendingWizardMessages).omit({
  id: true,
  createdAt: true,
});

export const insertSpendingWizardInsightSchema = createInsertSchema(spendingWizardInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpendingWizardTipSchema = createInsertSchema(spendingWizardTips).omit({
  id: true,
  createdAt: true,
});

// Types for new critical features
export type CreditNote = typeof creditNotes.$inferSelect;
export type InsertCreditNote = z.infer<typeof insertCreditNoteSchema>;
export type CreditNoteItem = typeof creditNoteItems.$inferSelect;
export type InsertCreditNoteItem = z.infer<typeof insertCreditNoteItemSchema>;

export type InvoiceReminder = typeof invoiceReminders.$inferSelect;
export type InsertInvoiceReminder = z.infer<typeof insertInvoiceReminderSchema>;

export type InvoiceAgingReport = typeof invoiceAgingReports.$inferSelect;
export type InsertInvoiceAgingReport = z.infer<typeof insertInvoiceAgingReportSchema>;

export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect;
export type InsertApprovalWorkflow = z.infer<typeof insertApprovalWorkflowSchema>;

export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type InsertApprovalRequest = z.infer<typeof insertApprovalRequestSchema>;

export type BankIntegration = typeof bankIntegrations.$inferSelect;
export type InsertBankIntegration = z.infer<typeof insertBankIntegrationSchema>;

// Smart Spending Wizard types
export type SpendingWizardProfile = typeof spendingWizardProfiles.$inferSelect;
export type InsertSpendingWizardProfile = z.infer<typeof insertSpendingWizardProfileSchema>;

export type SpendingWizardConversation = typeof spendingWizardConversations.$inferSelect;
export type InsertSpendingWizardConversation = z.infer<typeof insertSpendingWizardConversationSchema>;

export type SpendingWizardMessage = typeof spendingWizardMessages.$inferSelect;
export type InsertSpendingWizardMessage = z.infer<typeof insertSpendingWizardMessageSchema>;

export type SpendingWizardInsight = typeof spendingWizardInsights.$inferSelect;
export type InsertSpendingWizardInsight = z.infer<typeof insertSpendingWizardInsightSchema>;

export type SpendingWizardTip = typeof spendingWizardTips.$inferSelect;
export type InsertSpendingWizardTip = z.infer<typeof insertSpendingWizardTipSchema>;

// ===========================
// COMPLIANCE MANAGEMENT SYSTEM
// ===========================

// Client Management and Onboarding
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  tradingName: text("trading_name"),
  registrationNumber: text("registration_number"),
  taxNumber: text("tax_number"),
  vatNumber: text("vat_number"),
  industryCode: text("industry_code"),
  businessType: text("business_type").notNull(), // pty, cc, sole_proprietor, trust, partnership, npc
  status: text("status").default("active"), // active, inactive, pending
  
  // Contact Information
  primaryContact: text("primary_contact"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  
  // Compliance Settings
  isVatRegistered: boolean("is_vat_registered").default(false),
  payeNumber: text("paye_number"),
  uifNumber: text("uif_number"),
  coida_number: text("coida_number"),
  
  // Service Settings
  servicePackage: text("service_package").default("basic"), // basic, standard, premium, enterprise
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).default("0.00"),
  
  // Onboarding Status
  onboardingStatus: text("onboarding_status").default("pending"), // pending, in_progress, completed
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  
  // Metadata
  notes: text("notes"),
  tags: text("tags").array(),
  assignedTo: integer("assigned_to"), // User ID of assigned accountant
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("clients_company_idx").on(table.companyId),
  statusIdx: index("clients_status_idx").on(table.status),
  assignedIdx: index("clients_assigned_idx").on(table.assignedTo),
}));

// Client Onboarding Workflows
export const onboardingWorkflows = pgTable("onboarding_workflows", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  stepName: text("step_name").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // pending, in_progress, completed, skipped
  requiredDocuments: text("required_documents").array(),
  submittedDocuments: text("submitted_documents").array(),
  assignedTo: integer("assigned_to"),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  clientIdx: index("onboarding_workflows_client_idx").on(table.clientId),
  statusIdx: index("onboarding_workflows_status_idx").on(table.status),
}));

// Engagement Letters and Contracts
export const engagementLetters = pgTable("engagement_letters", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  templateId: integer("template_id"),
  type: text("type").notNull(), // audit, review, compilation, bookkeeping, tax_prep, payroll
  title: text("title").notNull(),
  content: text("content").notNull(),
  
  // Contract Terms
  startDate: date("start_date"),
  endDate: date("end_date"),
  renewalTerms: text("renewal_terms"),
  fees: jsonb("fees"), // { monthly: 0, annual: 0, hourly: 0, fixed: 0 }
  paymentTerms: text("payment_terms").default("Net 30"),
  
  // Workflow Status
  status: text("status").default("draft"), // draft, sent, signed, active, expired, terminated
  sentAt: timestamp("sent_at"),
  signedAt: timestamp("signed_at"),
  signedBy: text("signed_by"),
  documentUrl: text("document_url"),
  eSignatureId: text("e_signature_id"),
  
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("engagement_letters_client_idx").on(table.clientId),
  statusIdx: index("engagement_letters_status_idx").on(table.status),
}));

// SARS Compliance Module
export const sarsCompliance = pgTable("sars_compliance", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  complianceType: text("compliance_type").notNull(), // income_tax, vat, paye, provisional_tax, customs
  period: text("period").notNull(), // YYYY-MM or YYYY
  dueDate: date("due_date").notNull(),
  
  // Status and Workflow
  status: text("status").default("pending"), // pending, in_progress, filed, late, penalty
  filedDate: date("filed_date"),
  paymentDueDate: date("payment_due_date"),
  paymentAmount: decimal("payment_amount", { precision: 12, scale: 2 }),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, overdue
  
  // E-Filing Integration
  efilingReference: text("efiling_reference"),
  efilingStatus: text("efiling_status"), // submitted, accepted, rejected
  efilingResponse: jsonb("efiling_response"),
  
  // Documents
  documents: text("documents").array(),
  workpapers: text("workpapers").array(),
  
  // Compliance Details
  assessmentAmount: decimal("assessment_amount", { precision: 12, scale: 2 }),
  penaltyAmount: decimal("penalty_amount", { precision: 12, scale: 2 }),
  interestAmount: decimal("interest_amount", { precision: 12, scale: 2 }),
  
  assignedTo: integer("assigned_to"),
  reviewedBy: integer("reviewed_by"),
  approvedBy: integer("approved_by"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("sars_compliance_client_idx").on(table.clientId),
  typeIdx: index("sars_compliance_type_idx").on(table.complianceType),
  statusIdx: index("sars_compliance_status_idx").on(table.status),
  dueDateIdx: index("sars_compliance_due_date_idx").on(table.dueDate),
}));

// CIPC Compliance Module
export const cipcCompliance = pgTable("cipc_compliance", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  complianceType: text("compliance_type").notNull(), // annual_return, change_of_directors, registered_office, name_change, shares
  period: text("period"), // YYYY for annual returns
  dueDate: date("due_date").notNull(),
  
  // Status and Workflow
  status: text("status").default("pending"), // pending, in_progress, filed, late, penalty
  filedDate: date("filed_date"),
  cipcReference: text("cipc_reference"),
  
  // Filing Details
  filingFee: decimal("filing_fee", { precision: 10, scale: 2 }),
  penaltyAmount: decimal("penalty_amount", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  paymentStatus: text("payment_status").default("pending"),
  
  // Documents and Forms
  forms: text("forms").array(), // CoR forms used
  documents: text("documents").array(),
  certificates: text("certificates").array(),
  
  // Change Details (for amendments)
  changeDetails: jsonb("change_details"),
  effectiveDate: date("effective_date"),
  
  assignedTo: integer("assigned_to"),
  reviewedBy: integer("reviewed_by"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("cipc_compliance_client_idx").on(table.clientId),
  typeIdx: index("cipc_compliance_type_idx").on(table.complianceType),
  statusIdx: index("cipc_compliance_status_idx").on(table.status),
  dueDateIdx: index("cipc_compliance_due_date_idx").on(table.dueDate),
}));

// Labour Compliance Module
export const labourCompliance = pgTable("labour_compliance", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  complianceType: text("compliance_type").notNull(), // uif, sdl, coida, equity_reports, skills_development
  period: text("period").notNull(), // YYYY-MM
  dueDate: date("due_date").notNull(),
  
  // Status and Workflow
  status: text("status").default("pending"), // pending, in_progress, filed, late, penalty
  filedDate: date("filed_date"),
  referenceNumber: text("reference_number"),
  
  // Financial Details
  contributionAmount: decimal("contribution_amount", { precision: 12, scale: 2 }),
  penaltyAmount: decimal("penalty_amount", { precision: 12, scale: 2 }),
  interestAmount: decimal("interest_amount", { precision: 12, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  paymentStatus: text("payment_status").default("pending"),
  
  // Compliance Details
  employeeCount: integer("employee_count"),
  payrollAmount: decimal("payroll_amount", { precision: 12, scale: 2 }),
  
  // Documents
  documents: text("documents").array(),
  returns: text("returns").array(),
  
  assignedTo: integer("assigned_to"),
  reviewedBy: integer("reviewed_by"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("labour_compliance_client_idx").on(table.clientId),
  typeIdx: index("labour_compliance_type_idx").on(table.complianceType),
  statusIdx: index("labour_compliance_status_idx").on(table.status),
  dueDateIdx: index("labour_compliance_due_date_idx").on(table.dueDate),
}));

// Document Management
export const complianceDocuments = pgTable("compliance_documents", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  companyId: integer("company_id").notNull(),
  
  // Document Classification
  category: text("category").notNull(), // sars, cipc, labour, general, contracts
  subcategory: text("subcategory"), // income_tax, vat, annual_return, uif, etc.
  documentType: text("document_type").notNull(), // return, certificate, correspondence, working_paper
  
  // Document Details
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  filePath: text("file_path").notNull(),
  
  // Metadata
  tags: text("tags").array(),
  period: text("period"), // Financial period this document relates to
  version: integer("version").default(1),
  isLatestVersion: boolean("is_latest_version").default(true),
  
  // Access Control
  accessLevel: text("access_level").default("internal"), // public, client, internal, confidential
  sharedWith: integer("shared_with").array(), // User IDs
  
  // Workflow
  status: text("status").default("active"), // active, archived, deleted
  expiryDate: date("expiry_date"),
  retentionPeriod: integer("retention_period"), // Years to retain
  
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("compliance_documents_client_idx").on(table.clientId),
  categoryIdx: index("compliance_documents_category_idx").on(table.category),
  statusIdx: index("compliance_documents_status_idx").on(table.status),
  uploadedIdx: index("compliance_documents_uploaded_idx").on(table.uploadedBy),
}));

// Task Management and Workflows
export const complianceTasks = pgTable("compliance_tasks", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  companyId: integer("company_id").notNull(),
  
  // Task Details
  title: text("title").notNull(),
  description: text("description"),
  taskType: text("task_type").notNull(), // compliance, review, follow_up, document_request
  priority: text("priority").default("medium"), // low, medium, high, urgent
  
  // Compliance Reference
  complianceType: text("compliance_type"), // sars, cipc, labour
  complianceId: integer("compliance_id"), // Reference to specific compliance record
  
  // Workflow
  status: text("status").default("pending"), // pending, in_progress, completed, cancelled, on_hold
  assignedTo: integer("assigned_to"),
  delegatedTo: integer("delegated_to"),
  reviewedBy: integer("reviewed_by"),
  
  // Timeline
  startDate: date("start_date"),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  
  // Dependencies
  dependsOn: integer("depends_on").array(), // Task IDs this task depends on
  blockedBy: integer("blocked_by").array(), // Task IDs blocking this task
  
  // Reminders
  reminderSettings: jsonb("reminder_settings"),
  lastReminderSent: timestamp("last_reminder_sent"),
  
  // Attachments and Notes
  attachments: text("attachments").array(),
  notes: text("notes"),
  workLog: jsonb("work_log"), // Array of work entries with timestamps
  
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("compliance_tasks_client_idx").on(table.clientId),
  assignedIdx: index("compliance_tasks_assigned_idx").on(table.assignedTo),
  statusIdx: index("compliance_tasks_status_idx").on(table.status),
  dueDateIdx: index("compliance_tasks_due_date_idx").on(table.dueDate),
  typeIdx: index("compliance_tasks_type_idx").on(table.taskType),
}));

// Compliance Calendar and Deadlines
export const complianceCalendar = pgTable("compliance_calendar", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  companyId: integer("company_id").notNull(),
  
  // Calendar Entry Details
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // deadline, reminder, meeting, filing
  complianceType: text("compliance_type"), // sars, cipc, labour
  
  // Timing
  eventDate: date("event_date").notNull(),
  reminderDates: date("reminder_dates").array(),
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: text("recurrence_pattern"), // monthly, quarterly, annually
  
  // Status
  status: text("status").default("scheduled"), // scheduled, completed, overdue, cancelled
  completedAt: timestamp("completed_at"),
  
  // Assignment
  assignedTo: integer("assigned_to"),
  createdBy: integer("created_by").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  eventDateIdx: index("compliance_calendar_event_date_idx").on(table.eventDate),
  clientIdx: index("compliance_calendar_client_idx").on(table.clientId),
  typeIdx: index("compliance_calendar_type_idx").on(table.eventType),
  assignedIdx: index("compliance_calendar_assigned_idx").on(table.assignedTo),
}));

// Correspondence Tracker
export const correspondenceTracker = pgTable("correspondence_tracker", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  companyId: integer("company_id").notNull(),
  
  // Correspondence Details
  subject: text("subject").notNull(),
  direction: text("direction").notNull(), // inbound, outbound
  correspondenceType: text("correspondence_type").notNull(), // email, letter, phone, meeting, sms
  authority: text("authority"), // sars, cipc, dol, other
  
  // Content
  content: text("content"),
  summary: text("summary"),
  
  // Contact Information
  fromName: text("from_name"),
  fromEmail: text("from_email"),
  toName: text("to_name"),
  toEmail: text("to_email"),
  
  // Reference and Tracking
  referenceNumber: text("reference_number"),
  relatedCompliance: integer("related_compliance"), // Link to compliance record
  
  // Status and Follow-up
  status: text("status").default("open"), // open, in_progress, closed, follow_up_required
  priority: text("priority").default("medium"), // low, medium, high, urgent
  followUpDate: date("follow_up_date"),
  followUpAction: text("follow_up_action"),
  
  // Attachments
  attachments: text("attachments").array(),
  
  // Tracking
  receivedDate: timestamp("received_date"),
  responseDate: timestamp("response_date"),
  responseRequired: boolean("response_required").default(false),
  respondedBy: integer("responded_by"),
  
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("correspondence_tracker_client_idx").on(table.clientId),
  statusIdx: index("correspondence_tracker_status_idx").on(table.status),
  authorityIdx: index("correspondence_tracker_authority_idx").on(table.authority),
  receivedIdx: index("correspondence_tracker_received_idx").on(table.receivedDate),
}));

// Billing and Point of Sale Integration
export const recurringBilling = pgTable("recurring_billing", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  companyId: integer("company_id").notNull(),
  
  // Billing Details
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  billingFrequency: text("billing_frequency").notNull(), // monthly, quarterly, annually
  
  // Timing
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextBillingDate: date("next_billing_date").notNull(),
  lastBilledDate: date("last_billed_date"),
  
  // Status
  status: text("status").default("active"), // active, paused, cancelled, completed
  
  // Payment
  paymentMethod: text("payment_method"), // credit_card, debit_order, eft, cash
  paymentReference: text("payment_reference"),
  
  // Integration
  invoiceTemplate: text("invoice_template"),
  autoSend: boolean("auto_send").default(true),
  
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("recurring_billing_client_idx").on(table.clientId),
  statusIdx: index("recurring_billing_status_idx").on(table.status),
  nextBillingIdx: index("recurring_billing_next_billing_idx").on(table.nextBillingDate),
}));

// AI Assistant Conversations
export const aiAssistantConversations = pgTable("ai_assistant_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id"),
  companyId: integer("company_id").notNull(),
  
  // Conversation Details
  title: text("title"),
  category: text("category").notNull(), // compliance, tax_advice, general, workflow
  context: jsonb("context"), // Additional context for AI
  
  // Metadata
  messageCount: integer("message_count").default(0),
  lastMessage: text("last_message"),
  
  status: text("status").default("active"), // active, archived, deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("ai_assistant_conversations_user_idx").on(table.userId),
  clientIdx: index("ai_assistant_conversations_client_idx").on(table.clientId),
  categoryIdx: index("ai_assistant_conversations_category_idx").on(table.category),
}));

export const aiAssistantMessages = pgTable("ai_assistant_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  
  // Message Details
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // text, suggestion, document, workflow
  
  // AI Context
  intent: text("intent"), // Detected user intent
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // AI confidence score
  suggestions: jsonb("suggestions"), // Follow-up suggestions
  
  // Metadata
  tokens: integer("tokens"), // Token usage for billing
  responseTime: integer("response_time"), // Response time in ms
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conversationIdx: index("ai_assistant_messages_conversation_idx").on(table.conversationId),
  roleIdx: index("ai_assistant_messages_role_idx").on(table.role),
}));

// Schema Creation and Validation for all new tables
export const insertClientSchema = createInsertSchema(clients);
export const insertOnboardingWorkflowSchema = createInsertSchema(onboardingWorkflows);
export const insertEngagementLetterSchema = createInsertSchema(engagementLetters);
export const insertSarsComplianceSchema = createInsertSchema(sarsCompliance);
export const insertCipcComplianceSchema = createInsertSchema(cipcCompliance);
export const insertLabourComplianceSchema = createInsertSchema(labourCompliance);
export const insertComplianceDocumentSchema = createInsertSchema(complianceDocuments);
export const insertComplianceTaskSchema = createInsertSchema(complianceTasks);
export const insertComplianceCalendarSchema = createInsertSchema(complianceCalendar);
export const insertCorrespondenceTrackerSchema = createInsertSchema(correspondenceTracker);
export const insertRecurringBillingSchema = createInsertSchema(recurringBilling);
export const insertAiAssistantConversationSchema = createInsertSchema(aiAssistantConversations);
export const insertAiAssistantMessageSchema = createInsertSchema(aiAssistantMessages);

// Type exports for all new tables
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type OnboardingWorkflow = typeof onboardingWorkflows.$inferSelect;
export type InsertOnboardingWorkflow = z.infer<typeof insertOnboardingWorkflowSchema>;

export type EngagementLetter = typeof engagementLetters.$inferSelect;
export type InsertEngagementLetter = z.infer<typeof insertEngagementLetterSchema>;

export type SarsCompliance = typeof sarsCompliance.$inferSelect;
export type InsertSarsCompliance = z.infer<typeof insertSarsComplianceSchema>;

export type CipcCompliance = typeof cipcCompliance.$inferSelect;
export type InsertCipcCompliance = z.infer<typeof insertCipcComplianceSchema>;

export type LabourCompliance = typeof labourCompliance.$inferSelect;
export type InsertLabourCompliance = z.infer<typeof insertLabourComplianceSchema>;

export type ComplianceDocument = typeof complianceDocuments.$inferSelect;
export type InsertComplianceDocument = z.infer<typeof insertComplianceDocumentSchema>;

export type ComplianceTask = typeof complianceTasks.$inferSelect;
export type InsertComplianceTask = z.infer<typeof insertComplianceTaskSchema>;

export type ComplianceCalendar = typeof complianceCalendar.$inferSelect;
export type InsertComplianceCalendar = z.infer<typeof insertComplianceCalendarSchema>;

export type CorrespondenceTracker = typeof correspondenceTracker.$inferSelect;
export type InsertCorrespondenceTracker = z.infer<typeof insertCorrespondenceTrackerSchema>;

export type RecurringBilling = typeof recurringBilling.$inferSelect;
export type InsertRecurringBilling = z.infer<typeof insertRecurringBillingSchema>;

export type AiAssistantConversation = typeof aiAssistantConversations.$inferSelect;
export type InsertAiAssistantConversation = z.infer<typeof insertAiAssistantConversationSchema>;

export type AiAssistantMessage = typeof aiAssistantMessages.$inferSelect;
export type InsertAiAssistantMessage = z.infer<typeof insertAiAssistantMessageSchema>;

// === POS MODULE SCHEMAS ===

// POS Insert schemas
export const insertPosTerminalSchema = createInsertSchema(posTerminals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPosSaleSchema = createInsertSchema(posSales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPosSaleItemSchema = createInsertSchema(posSaleItems).omit({
  id: true,
  createdAt: true,
});

export const insertPosPaymentSchema = createInsertSchema(posPayments).omit({
  id: true,
  createdAt: true,
});

export const insertPosPromotionSchema = createInsertSchema(posPromotions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPosLoyaltyProgramSchema = createInsertSchema(posLoyaltyPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPosCustomerLoyaltySchema = createInsertSchema(posCustomerLoyalty).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPosShiftSchema = createInsertSchema(posShifts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPosRefundSchema = createInsertSchema(posRefunds).omit({
  id: true,
  createdAt: true,
});

export const insertPosRefundItemSchema = createInsertSchema(posRefundItems).omit({
  id: true,
  createdAt: true,
});

// POS Type exports
export type PosTerminal = typeof posTerminals.$inferSelect;
export type InsertPosTerminal = z.infer<typeof insertPosTerminalSchema>;

export type PosSale = typeof posSales.$inferSelect;
export type InsertPosSale = z.infer<typeof insertPosSaleSchema>;

export type PosSaleItem = typeof posSaleItems.$inferSelect;
export type InsertPosSaleItem = z.infer<typeof insertPosSaleItemSchema>;

export type PosPayment = typeof posPayments.$inferSelect;
export type InsertPosPayment = z.infer<typeof insertPosPaymentSchema>;

export type PosPromotion = typeof posPromotions.$inferSelect;
export type InsertPosPromotion = z.infer<typeof insertPosPromotionSchema>;

export type PosLoyaltyProgram = typeof posLoyaltyPrograms.$inferSelect;
export type InsertPosLoyaltyProgram = z.infer<typeof insertPosLoyaltyProgramSchema>;

export type PosCustomerLoyalty = typeof posCustomerLoyalty.$inferSelect;
export type InsertPosCustomerLoyalty = z.infer<typeof insertPosCustomerLoyaltySchema>;

export type PosShift = typeof posShifts.$inferSelect;
export type InsertPosShift = z.infer<typeof insertPosShiftSchema>;

export type PosRefund = typeof posRefunds.$inferSelect;
export type InsertPosRefund = z.infer<typeof insertPosRefundSchema>;

export type PosRefundItem = typeof posRefundItems.$inferSelect;
export type InsertPosRefundItem = z.infer<typeof insertPosRefundItemSchema>;

// Extended POS types for API responses
export type PosSaleWithItems = PosSale & { 
  items: PosSaleItem[]; 
  customer?: Customer; 
  user: User;
  payments: PosPayment[];
};

export type PosShiftWithSales = PosShift & { 
  sales: PosSale[];
  user: User;
  terminal: PosTerminal;
};

export type PosRefundWithItems = PosRefund & {
  items: PosRefundItem[];
  originalSale: PosSale;
  user: User;
};

// === RBAC SCHEMA EXPORTS ===

// RBAC Insert schemas
export const insertSystemRoleSchema = createInsertSchema(systemRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyRoleSchema = createInsertSchema(companyRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  grantedAt: true,
  updatedAt: true,
});

export const insertPermissionAuditLogSchema = createInsertSchema(permissionAuditLog).omit({
  id: true,
  timestamp: true,
});

// RBAC Type exports
export type SystemRole = typeof systemRoles.$inferSelect;
export type InsertSystemRole = typeof systemRoles.$inferInsert;
export type CompanyRole = typeof companyRoles.$inferSelect;
export type InsertCompanyRole = typeof companyRoles.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = typeof userPermissions.$inferInsert;
export type PermissionAuditLog = typeof permissionAuditLog.$inferSelect;
export type InsertPermissionAuditLog = typeof permissionAuditLog.$inferInsert;

// Exception Handling System Tables
export const paymentExceptions = pgTable("payment_exceptions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  exceptionType: varchar("exception_type", { length: 50 }).notNull(), // 'amount_mismatch', 'duplicate_supplier', 'missing_docs', etc.
  severity: varchar("severity", { length: 20 }).notNull().default("medium"), // 'low', 'medium', 'high', 'critical'
  status: varchar("status", { length: 20 }).notNull().default("open"), // 'open', 'resolved', 'escalated', 'closed'
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'purchase_order', 'supplier_payment', 'invoice'
  entityId: integer("entity_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  detectedAmount: decimal("detected_amount", { precision: 15, scale: 2 }),
  expectedAmount: decimal("expected_amount", { precision: 15, scale: 2 }),
  varianceAmount: decimal("variance_amount", { precision: 15, scale: 2 }),
  autoDetected: boolean("auto_detected").default(true),
  paymentHold: boolean("payment_hold").default(false),
  requiresApproval: boolean("requires_approval").default(false),
  detectedBy: integer("detected_by").references(() => users.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolution: text("resolution"),
  escalatedTo: integer("escalated_to").references(() => users.id),
  escalationReason: text("escalation_reason"),
  dueDate: timestamp("due_date"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const exceptionEscalations = pgTable("exception_escalations", {
  id: serial("id").primaryKey(),
  exceptionId: integer("exception_id").references(() => paymentExceptions.id).notNull(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  escalationReason: text("escalation_reason").notNull(),
  urgencyLevel: varchar("urgency_level", { length: 20 }).notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  requiresResponse: boolean("requires_response").default(true),
  responseDeadline: timestamp("response_deadline"),
  respondedAt: timestamp("responded_at"),
  responseAction: varchar("response_action", { length: 50 }), // 'approved', 'rejected', 'reassigned', 'escalated_further'
  responseComments: text("response_comments"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const exceptionAlerts = pgTable("exception_alerts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  exceptionId: integer("exception_id").references(() => paymentExceptions.id).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'email', 'in_app', 'sms'
  recipientId: integer("recipient_id").references(() => users.id).notNull(),
  alertTitle: varchar("alert_title", { length: 200 }).notNull(),
  alertMessage: text("alert_message").notNull(),
  sent: boolean("sent").default(false),
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  actionRequired: boolean("action_required").default(false),
  actionTaken: boolean("action_taken").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const vendorMasterValidation = pgTable("vendor_master_validation", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  validationType: varchar("validation_type", { length: 50 }).notNull(), // 'bank_details', 'vat_number', 'bee_status'
  validationStatus: varchar("validation_status", { length: 20 }).notNull().default("pending"), // 'pending', 'verified', 'failed', 'manual_review'
  oldValue: text("old_value"),
  newValue: text("new_value"),
  validationNotes: text("validation_notes"),
  validatedBy: integer("validated_by").references(() => users.id),
  validatedAt: timestamp("validated_at"),
  alertGenerated: boolean("alert_generated").default(false),
  requiresReview: boolean("requires_review").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertPaymentExceptionSchema = createInsertSchema(paymentExceptions);
export const insertExceptionEscalationSchema = createInsertSchema(exceptionEscalations);
export const insertExceptionAlertSchema = createInsertSchema(exceptionAlerts);
export const insertVendorMasterValidationSchema = createInsertSchema(vendorMasterValidation);

export type PaymentException = typeof paymentExceptions.$inferSelect;
export type InsertPaymentException = z.infer<typeof insertPaymentExceptionSchema>;
export type ExceptionEscalation = typeof exceptionEscalations.$inferSelect;
export type InsertExceptionEscalation = z.infer<typeof insertExceptionEscalationSchema>;
export type ExceptionAlert = typeof exceptionAlerts.$inferSelect;
export type InsertExceptionAlert = z.infer<typeof insertExceptionAlertSchema>;
export type VendorMasterValidation = typeof vendorMasterValidation.$inferSelect;
export type InsertVendorMasterValidation = z.infer<typeof insertVendorMasterValidationSchema>;

// === ENHANCED SALES MODULE TYPE EXPORTS ===

// Sales Orders
export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;

export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = z.infer<typeof insertSalesOrderItemSchema>;

// Deliveries
export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;

export type DeliveryItem = typeof deliveryItems.$inferSelect;
export type InsertDeliveryItem = z.infer<typeof insertDeliveryItemSchema>;

// Credit Notes (existing, but adding for completeness) - moved to avoid duplicates

// Extended Sales module types for API responses
export type SalesOrderWithCustomer = SalesOrder & { customer: Customer };
export type SalesOrderWithItems = SalesOrder & { items: SalesOrderItem[]; customer: Customer };
export type DeliveryWithCustomer = Delivery & { customer: Customer };
export type DeliveryWithItems = Delivery & { items: DeliveryItem[]; customer: Customer };
export type CreditNoteWithCustomer = CreditNote & { customer: Customer };
export type CreditNoteWithItems = CreditNote & { items: CreditNoteItem[]; customer: Customer };

// Enhanced Inventory Management Types (removed duplicates - already defined above)

// Enhanced Inventory Extended Types for API responses
export type StockCountWithItems = StockCount & { items: StockCountItem[] };
export type ProductLotWithSerial = ProductLot & { serialNumbers: ProductSerial[] };
export type ProductWithVariants = Product & { variants: ProductVariant[]; lots: ProductLot[]; bundles: ProductBundle[] };
export type WarehouseWithStock = Warehouse & { inventory: InventoryTransaction[] };

// Security and Compliance Tables
export const securityScans = pgTable("security_scans", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  scanType: varchar("scan_type", { length: 50 }).notNull(), // 'vulnerability', 'compliance', 'password', 'data_integrity'
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'running', 'completed', 'failed'
  riskLevel: varchar("risk_level", { length: 20 }), // 'low', 'medium', 'high', 'critical'
  findings: json("findings").$type<SecurityFinding[]>().default([]),
  recommendation: text("recommendation"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complianceChecks = pgTable("compliance_checks", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  checkType: varchar("check_type", { length: 50 }).notNull(), // 'popi', 'pci_dss', 'gdpr', 'sars', 'data_retention'
  status: varchar("status", { length: 20 }).notNull().default('pending'),
  complianceScore: integer("compliance_score").default(0), // 0-100
  issues: json("issues").$type<ComplianceIssue[]>().default([]),
  recommendations: json("recommendations").$type<string[]>().default([]),
  lastChecked: timestamp("last_checked"),
  nextCheck: timestamp("next_check"),
  isAutomated: boolean("is_automated").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'failed_login', 'suspicious_activity', 'compliance_violation', 'data_breach'
  severity: varchar("severity", { length: 20 }).notNull(), // 'info', 'warning', 'high', 'critical'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  status: varchar("status", { length: 20 }).notNull().default('active'), // 'active', 'investigating', 'resolved', 'dismissed'
  assignedTo: integer("assigned_to").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const securityPolicies = pgTable("security_policies", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  policyType: varchar("policy_type", { length: 50 }).notNull(), // 'password', 'access', 'data_retention', 'backup'
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  rules: json("rules").$type<SecurityRule[]>().default([]),
  isActive: boolean("is_active").default(true),
  enforcementLevel: varchar("enforcement_level", { length: 20 }).default('warning'), // 'warning', 'block', 'audit'
  lastReviewedAt: timestamp("last_reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type definitions for security and compliance
export interface SecurityFinding {
  id: string;
  type: 'vulnerability' | 'weakness' | 'misconfiguration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_resource: string;
  recommendation: string;
  references?: string[];
}

export interface ComplianceIssue {
  id: string;
  regulation: string; // 'POPI', 'GDPR', 'PCI-DSS', 'SARS'
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'needs_review';
  description: string;
  remediation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'warn' | 'log';
  parameters: Record<string, any>;
}

// Insert schemas for security and compliance
export const insertSecurityScanSchema = createInsertSchema(securityScans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecurityPolicySchema = createInsertSchema(securityPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for security and compliance
export type SecurityScan = typeof securityScans.$inferSelect;
export type InsertSecurityScan = z.infer<typeof insertSecurityScanSchema>;

export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;

export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;

export type SecurityPolicy = typeof securityPolicies.$inferSelect;
export type InsertSecurityPolicy = z.infer<typeof insertSecurityPolicySchema>;
