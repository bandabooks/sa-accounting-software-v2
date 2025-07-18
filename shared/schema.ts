import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, jsonb, date, unique, index } from "drizzle-orm/pg-core";
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
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: index("companies_slug_idx").on(table.slug),
  activeIdx: index("companies_active_idx").on(table.isActive),
}));

export const companyUsers = pgTable("company_users", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("employee"), // owner, admin, manager, accountant, employee
  permissions: jsonb("permissions").default([]),
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  companyUserUnique: unique().on(table.companyId, table.userId),
  companyIdx: index("company_users_company_idx").on(table.companyId),
  userIdx: index("company_users_user_idx").on(table.userId),
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
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue
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
  invoiceId: integer("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  estimateNumber: text("estimate_number").notNull(),
  customerId: integer("customer_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, approved, rejected, expired
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyEstimateUnique: unique().on(table.companyId, table.estimateNumber),
  companyIdx: index("estimates_company_idx").on(table.companyId),
  customerIdx: index("estimates_customer_idx").on(table.customerId),
}));

export const estimateItems = pgTable("estimate_items", {
  id: serial("id").primaryKey(),
  estimateId: integer("estimate_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

// Financial reporting tables
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // office_supplies, travel, utilities, etc.
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
  role: text("role").notNull().default("admin"), // admin, manager, employee, accountant
  permissions: text("permissions").array().default([]), // Array of permission strings
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  passwordChangedAt: timestamp("password_changed_at").defaultNow(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
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

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // login, logout, create, update, delete, etc.
  resource: text("resource").notNull(), // table/entity name
  resourceId: integer("resource_id"), // ID of the affected record
  details: text("details"), // JSON string with additional details
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  invoiceId: integer("invoice_id").notNull(),
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
  purchaseOrderId: integer("purchase_order_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  expenseCategory: text("expense_category").default("office_supplies"), // Links to expense categories
});

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
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").unique(),
  categoryId: integer("category_id").references(() => productCategories.id),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).default("0.00"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  stockQuantity: integer("stock_quantity").default(0),
  minStockLevel: integer("min_stock_level").default(0),
  maxStockLevel: integer("max_stock_level").default(0),
  isActive: boolean("is_active").default(true),
  isService: boolean("is_service").default(false), // true for services, false for products
  imagePath: text("image_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  invoiceId: z.number(),
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

// Authentication types
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type LoginRequest = z.infer<typeof loginSchema>;
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
});

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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory management tables
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(), // 'in', 'out', 'adjustment'
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  reference: varchar("reference", { length: 100 }), // invoice, purchase order, adjustment ref
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email reminders table
export const emailReminders = pgTable("email_reminders", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  reminderType: varchar("reminder_type", { length: 20 }).notNull(), // 'overdue', 'payment_due'
  daysBefore: integer("days_before").notNull(),
  emailSent: boolean("email_sent").default(false),
  sentAt: timestamp("sent_at"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Currency exchange rates table
export const currencyRates = pgTable("currency_rates", {
  id: serial("id").primaryKey(),
  fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
  toCurrency: varchar("to_currency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  validFrom: timestamp("valid_from").defaultNow(),
  validTo: timestamp("valid_to"),
  source: varchar("source", { length: 50 }).default("manual"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertEmailReminderSchema = createInsertSchema(emailReminders).omit({
  id: true,
  createdAt: true,
});

export const insertCurrencyRateSchema = createInsertSchema(currencyRates).omit({
  id: true,
  createdAt: true,
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;

export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

export type InsertEmailReminder = z.infer<typeof insertEmailReminderSchema>;
export type EmailReminder = typeof emailReminders.$inferSelect;

export type InsertCurrencyRate = z.infer<typeof insertCurrencyRateSchema>;
export type CurrencyRate = typeof currencyRates.$inferSelect;

// Chart of Accounts - South African Business Accounting Standards
export const chartOfAccounts = pgTable("chart_of_accounts", {
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
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyCodeUnique: unique().on(table.companyId, table.accountCode),
  companyIdx: index("chart_accounts_company_idx").on(table.companyId),
  typeIdx: index("chart_accounts_type_idx").on(table.accountType),
  activeIdx: index("chart_accounts_active_idx").on(table.isActive),
}));

// Journal Entries for double-entry bookkeeping
export const journalEntries = pgTable("journal_entries", {
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
