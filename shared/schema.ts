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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").notNull().default("admin"),
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

// Extended types for API responses
export type InvoiceWithCustomer = Invoice & { customer: Customer };
export type InvoiceWithItems = Invoice & { items: InvoiceItem[]; customer: Customer };
export type EstimateWithCustomer = Estimate & { customer: Customer };
export type EstimateWithItems = Estimate & { items: EstimateItem[]; customer: Customer };
