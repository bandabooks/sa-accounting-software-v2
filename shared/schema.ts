import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
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
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  estimateNumber: text("estimate_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, approved, rejected, expired
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // office_supplies, travel, utilities, etc.
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  expenseDate: timestamp("expense_date").notNull(),
  isDeductible: boolean("is_deductible").default(true),
  receiptPath: text("receipt_path"), // Path to receipt image/PDF
  createdAt: timestamp("created_at").defaultNow(),
});

export const vatReturns = pgTable("vat_returns", {
  id: serial("id").primaryKey(),
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
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").notNull().default("admin"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'card', 'eft', 'payfast'
  paymentDate: timestamp("payment_date").defaultNow(),
  reference: text("reference"), // PayFast reference or manual reference
  notes: text("notes"),
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
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

// Customer portal login schema
export const customerPortalLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type VatReturn = typeof vatReturns.$inferSelect;
export type InsertVatReturn = z.infer<typeof insertVatReturnSchema>;

export const recurringInvoices = pgTable("recurring_invoices", {
  id: serial("id").primaryKey(),
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

// Extended types for API responses
export type InvoiceWithCustomer = Invoice & { customer: Customer };
export type InvoiceWithItems = Invoice & { items: InvoiceItem[]; customer: Customer };
export type EstimateWithCustomer = Estimate & { customer: Customer };
export type EstimateWithItems = Estimate & { items: EstimateItem[]; customer: Customer };
