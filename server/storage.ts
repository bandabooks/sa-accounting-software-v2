import { 
  customers, 
  invoices, 
  invoiceItems, 
  estimates, 
  estimateItems, 
  users,
  userSessions,
  userRoles,
  auditLogs,
  payments,
  expenses,
  vatReturns,
  suppliers,
  purchaseOrders,
  purchaseOrderItems,
  supplierPayments,
  productCategories,
  products,
  payfastPayments,
  companySettings,
  inventoryTransactions,
  emailReminders,
  currencyRates,
  type Customer, 
  type InsertCustomer,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type Estimate,
  type InsertEstimate,
  type EstimateItem,
  type InsertEstimateItem,
  type User, 
  type InsertUser,
  type UserSession,
  type InsertUserSession,
  type UserRole,
  type InsertUserRole,
  type AuditLog,
  type InsertAuditLog,
  type Payment,
  type InsertPayment,
  type Expense,
  type InsertExpense,
  type VatReturn,
  type InsertVatReturn,
  type Supplier,
  type InsertSupplier,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type PurchaseOrderItem,
  type InsertPurchaseOrderItem,
  type SupplierPayment,
  type InsertSupplierPayment,
  type ProductCategory,
  type InsertProductCategory,
  type Product,
  type InsertProduct,
  type PayfastPayment,
  type InsertPayfastPayment,
  type InvoiceWithCustomer,
  type InvoiceWithItems,
  type EstimateWithCustomer,
  type EstimateWithItems,
  type PurchaseOrderWithSupplier,
  type PurchaseOrderWithItems,
  type SupplierPaymentWithSupplier,
  type CompanySettings,
  type InsertCompanySettings,
  type InventoryTransaction,
  type InsertInventoryTransaction,
  type EmailReminder,
  type InsertEmailReminder,
  type CurrencyRate,
  type InsertCurrencyRate
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sum, count, sql, and, gte, lte, or, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  updateUserLoginAttempts(id: number, attempts: number, lockedUntil?: Date): Promise<void>;
  updateUserLastLogin(id: number): Promise<void>;

  // Authentication & Sessions
  createSession(session: InsertUserSession): Promise<UserSession>;
  getSessionByToken(token: string): Promise<UserSession | undefined>;
  updateSessionActivity(sessionId: number): Promise<void>;
  deleteSession(sessionId: number): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  deleteUserSessions(userId: number): Promise<void>;

  // Roles
  getAllRoles(): Promise<UserRole[]>;
  getRole(id: number): Promise<UserRole | undefined>;
  createRole(role: InsertUserRole): Promise<UserRole>;
  updateRole(id: number, role: Partial<InsertUserRole>): Promise<UserRole | undefined>;
  deleteRole(id: number): Promise<boolean>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number, offset?: number): Promise<AuditLog[]>;
  getAuditLogsByUser(userId: number, limit?: number): Promise<AuditLog[]>;

  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  setupCustomerPortal(id: number, data: { portalAccess: boolean; portalPassword?: string }): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getInvoicesByCustomer(customerId: number): Promise<InvoiceWithCustomer[]>;

  // Invoices
  getAllInvoices(): Promise<InvoiceWithCustomer[]>;
  getInvoice(id: number): Promise<InvoiceWithItems | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithItems | undefined>;
  createInvoice(invoice: InsertInvoice, items: Omit<InsertInvoiceItem, 'invoiceId'>[]): Promise<InvoiceWithItems>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Invoice Items
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;

  // Estimates
  getAllEstimates(): Promise<EstimateWithCustomer[]>;
  getEstimate(id: number): Promise<EstimateWithItems | undefined>;
  createEstimate(estimate: InsertEstimate, items: Omit<InsertEstimateItem, 'estimateId'>[]): Promise<EstimateWithItems>;
  updateEstimate(id: number, estimate: Partial<InsertEstimate>): Promise<Estimate | undefined>;
  deleteEstimate(id: number): Promise<boolean>;
  convertEstimateToInvoice(estimateId: number): Promise<InvoiceWithItems>;

  // Payments
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByInvoice(invoiceId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;

  // Expenses
  getAllExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  getExpensesByCategory(category: string): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;

  // VAT Returns
  getAllVatReturns(): Promise<VatReturn[]>;
  getVatReturn(id: number): Promise<VatReturn | undefined>;
  createVatReturn(vatReturn: InsertVatReturn): Promise<VatReturn>;
  updateVatReturn(id: number, vatReturn: Partial<InsertVatReturn>): Promise<VatReturn | undefined>;
  deleteVatReturn(id: number): Promise<boolean>;
  getVatReturnByPeriod(startDate: Date, endDate: Date): Promise<VatReturn | undefined>;

  // Financial Reports
  getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalRevenue: string;
    totalExpenses: string;
    grossProfit: string;
    netProfit: string;
    totalVatCollected: string;
    totalVatPaid: string;
  }>;
  getProfitAndLoss(startDate: Date, endDate: Date): Promise<{
    revenue: { category: string; amount: string }[];
    expenses: { category: string; amount: string }[];
    netProfit: string;
  }>;
  getCashFlowReport(startDate: Date, endDate: Date): Promise<{
    cashInflow: { source: string; amount: string }[];
    cashOutflow: { category: string; amount: string }[];
    netCashFlow: string;
  }>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalRevenue: string;
    outstandingInvoices: string;
    totalCustomers: number;
    vatDue: string;
    recentInvoices: InvoiceWithCustomer[];
    revenueByMonth: { month: string; revenue: number }[];
  }>;

  // Purchase Order Management
  // Suppliers
  getAllSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  getSupplierByEmail(email: string): Promise<Supplier | undefined>;

  // Purchase Orders
  getAllPurchaseOrders(): Promise<PurchaseOrderWithSupplier[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrderWithItems | undefined>;
  getPurchaseOrderByNumber(orderNumber: string): Promise<PurchaseOrderWithItems | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder, items: Omit<InsertPurchaseOrderItem, 'purchaseOrderId'>[]): Promise<PurchaseOrderWithItems>;
  updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  updatePurchaseOrderStatus(id: number, status: string): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: number): Promise<boolean>;

  // Purchase Order Items
  getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  updatePurchaseOrderItem(id: number, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined>;
  deletePurchaseOrderItem(id: number): Promise<boolean>;

  // Supplier Payments
  getAllSupplierPayments(): Promise<SupplierPaymentWithSupplier[]>;
  getSupplierPaymentsBySupplier(supplierId: number): Promise<SupplierPayment[]>;
  getSupplierPaymentsByPurchaseOrder(purchaseOrderId: number): Promise<SupplierPayment[]>;
  createSupplierPayment(payment: InsertSupplierPayment): Promise<SupplierPayment>;
  updateSupplierPayment(id: number, payment: Partial<InsertSupplierPayment>): Promise<SupplierPayment | undefined>;
  deleteSupplierPayment(id: number): Promise<boolean>;

  // Product Categories
  getAllProductCategories(): Promise<ProductCategory[]>;
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: number, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined>;
  deleteProductCategory(id: number): Promise<boolean>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getProductsBySku(sku: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;

  // PayFast Payments
  createPayfastPayment(payment: InsertPayfastPayment): Promise<PayfastPayment>;
  getPayfastPaymentByInvoiceId(invoiceId: number): Promise<PayfastPayment | undefined>;
  getPayfastPaymentByPaymentId(payfastPaymentId: string): Promise<PayfastPayment | undefined>;
  updatePayfastPayment(id: number, payment: Partial<InsertPayfastPayment>): Promise<PayfastPayment | undefined>;
  updatePayfastPaymentStatus(id: number, status: string, payfastData?: string): Promise<PayfastPayment | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password: hashedPassword, 
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async updateUserLoginAttempts(id: number, attempts: number, lockedUntil?: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        failedLoginAttempts: attempts,
        lockedUntil: lockedUntil || null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  // Authentication & Sessions
  async createSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db.insert(userSessions).values(session).returning();
    return newSession;
  }

  async getSessionByToken(token: string): Promise<UserSession | undefined> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessionToken, token));
    return session;
  }

  async updateSessionActivity(sessionId: number): Promise<void> {
    await db
      .update(userSessions)
      .set({ lastActivity: new Date() })
      .where(eq(userSessions.id, sessionId));
  }

  async deleteSession(sessionId: number): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.id, sessionId));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(userSessions).where(lte(userSessions.expiresAt, new Date()));
  }

  async deleteUserSessions(userId: number): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
  }

  // Roles
  async getAllRoles(): Promise<UserRole[]> {
    return await db.select().from(userRoles).orderBy(userRoles.name);
  }

  async getRole(id: number): Promise<UserRole | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.id, id));
    return role;
  }

  async createRole(role: InsertUserRole): Promise<UserRole> {
    const [newRole] = await db.insert(userRoles).values(role).returning();
    return newRole;
  }

  async updateRole(id: number, role: Partial<InsertUserRole>): Promise<UserRole | undefined> {
    const [updatedRole] = await db
      .update(userRoles)
      .set(role)
      .where(eq(userRoles.id, id))
      .returning();
    return updatedRole;
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(userRoles).where(eq(userRoles.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Audit Logs
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }

  async getAuditLogs(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    return await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        timestamp: auditLogs.timestamp,
        createdAt: auditLogs.createdAt,
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
        }
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getAuditLogsByUser(userId: number, limit: number = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    const result = await db.select().from(customers).orderBy(desc(customers.id));
    return result;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async setupCustomerPortal(id: number, data: { portalAccess: boolean; portalPassword?: string }): Promise<Customer | undefined> {
    const updateData: any = { portalAccess: data.portalAccess };
    if (data.portalPassword) {
      updateData.portalPassword = data.portalPassword; // In real app, hash this password
    }
    const [customer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async getInvoicesByCustomer(customerId: number): Promise<InvoiceWithCustomer[]> {
    const result = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerId: invoices.customerId,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        status: invoices.status,
        subtotal: invoices.subtotal,
        vatAmount: invoices.vatAmount,
        total: invoices.total,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          address: customers.address,
          city: customers.city,
          postalCode: customers.postalCode,
          vatNumber: customers.vatNumber,
          creditLimit: customers.creditLimit,
          paymentTerms: customers.paymentTerms,
          category: customers.category,
          notes: customers.notes,
          portalAccess: customers.portalAccess,
          portalPassword: customers.portalPassword,
          createdAt: customers.createdAt,
        }
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));

    return result;
  }

  // Invoices
  async getAllInvoices(): Promise<InvoiceWithCustomer[]> {
    const result = await db
      .select({
        invoice: invoices,
        customer: customers
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(desc(invoices.id));
    
    return result.map(row => ({
      ...row.invoice,
      customer: row.customer!
    }));
  }

  async getInvoice(id: number): Promise<InvoiceWithItems | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;

    const [customer] = await db.select().from(customers).where(eq(customers.id, invoice.customerId));
    if (!customer) return undefined;

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    
    return {
      ...invoice,
      customer,
      items
    };
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithItems | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
    if (!invoice) return undefined;

    return this.getInvoice(invoice.id);
  }

  async createInvoice(insertInvoice: InsertInvoice, items: Omit<InsertInvoiceItem, 'invoiceId'>[]): Promise<InvoiceWithItems> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();

    const createdItems: InvoiceItem[] = [];
    for (const item of items) {
      const [invoiceItem] = await db
        .insert(invoiceItems)
        .values({ ...item, invoiceId: invoice.id })
        .returning();
      createdItems.push(invoiceItem);
    }

    const [customer] = await db.select().from(customers).where(eq(customers.id, invoice.customerId));
    return {
      ...invoice,
      customer: customer!,
      items: createdItems
    };
  }

  async updateInvoice(id: number, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();
    return invoice || undefined;
  }

  async updateInvoiceStatus(id: number, status: "draft" | "sent" | "paid" | "overdue"): Promise<Invoice | undefined> {
    return this.updateInvoice(id, { status });
  }

  async deleteInvoice(id: number): Promise<boolean> {
    // Delete associated items first
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Invoice Items
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const [item] = await db
      .insert(invoiceItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateInvoiceItem(id: number, updateData: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const [item] = await db
      .update(invoiceItems)
      .set(updateData)
      .where(eq(invoiceItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Estimates
  async getAllEstimates(): Promise<EstimateWithCustomer[]> {
    const result = await db
      .select({
        estimate: estimates,
        customer: customers
      })
      .from(estimates)
      .leftJoin(customers, eq(estimates.customerId, customers.id))
      .orderBy(desc(estimates.id));
    
    return result.map(row => ({
      ...row.estimate,
      customer: row.customer!
    }));
  }

  async getEstimate(id: number): Promise<EstimateWithItems | undefined> {
    const [estimate] = await db.select().from(estimates).where(eq(estimates.id, id));
    if (!estimate) return undefined;

    const [customer] = await db.select().from(customers).where(eq(customers.id, estimate.customerId));
    if (!customer) return undefined;

    const items = await db.select().from(estimateItems).where(eq(estimateItems.estimateId, id));
    
    return {
      ...estimate,
      customer,
      items
    };
  }

  async createEstimate(insertEstimate: InsertEstimate, items: Omit<InsertEstimateItem, 'estimateId'>[]): Promise<EstimateWithItems> {
    const [estimate] = await db
      .insert(estimates)
      .values(insertEstimate)
      .returning();

    const createdItems: EstimateItem[] = [];
    for (const item of items) {
      const [estimateItem] = await db
        .insert(estimateItems)
        .values({ ...item, estimateId: estimate.id })
        .returning();
      createdItems.push(estimateItem);
    }

    const [customer] = await db.select().from(customers).where(eq(customers.id, estimate.customerId));
    return {
      ...estimate,
      customer: customer!,
      items: createdItems
    };
  }

  async updateEstimate(id: number, updateData: Partial<InsertEstimate>): Promise<Estimate | undefined> {
    const [estimate] = await db
      .update(estimates)
      .set(updateData)
      .where(eq(estimates.id, id))
      .returning();
    return estimate || undefined;
  }

  async deleteEstimate(id: number): Promise<boolean> {
    // Delete associated items first
    await db.delete(estimateItems).where(eq(estimateItems.estimateId, id));
    
    const result = await db.delete(estimates).where(eq(estimates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async convertEstimateToInvoice(estimateId: number): Promise<InvoiceWithItems> {
    const estimate = await this.getEstimate(estimateId);
    if (!estimate) throw new Error("Estimate not found");

    const invoiceData: InsertInvoice = {
      customerId: estimate.customerId,
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subtotal: estimate.subtotal,
      vatAmount: estimate.vatAmount,
      total: estimate.total,
      status: "draft",
      notes: `Converted from estimate ${estimate.estimateNumber}`
    };

    const invoiceItems = estimate.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      total: item.total
    }));

    return this.createInvoice(invoiceData, invoiceItems);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalRevenue: string;
    outstandingInvoices: string;
    totalCustomers: number;
    vatDue: string;
    recentInvoices: InvoiceWithCustomer[];
    revenueByMonth: { month: string; revenue: number }[];
    outstandingInvoiceCount: number;
    paidInvoiceCount: number;
  }> {
    // Get all invoices for calculations
    const allInvoices = await db.select().from(invoices);
    
    // Calculate totals
    const paidInvoices = allInvoices.filter(inv => inv.status === "paid");
    const outstandingInvoiceList = allInvoices.filter(inv => inv.status === "sent" || inv.status === "draft");
    
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const outstandingInvoices = outstandingInvoiceList.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const vatDue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.vatAmount), 0);

    // Get customer count
    const customerCount = await db.select({ count: count() }).from(customers);
    const totalCustomers = customerCount[0]?.count || 0;

    // Get recent invoices with customer info
    const recentInvoices = await this.getAllInvoices();

    // Calculate real revenue by month from actual invoices
    const revenueByMonth = this.calculateRevenueByMonth(paidInvoices);

    return {
      totalRevenue: totalRevenue.toFixed(2),
      outstandingInvoices: outstandingInvoices.toFixed(2),
      totalCustomers: Number(totalCustomers),
      vatDue: vatDue.toFixed(2),
      recentInvoices: recentInvoices.slice(0, 5),
      revenueByMonth,
      outstandingInvoiceCount: outstandingInvoiceList.length,
      paidInvoiceCount: paidInvoices.length
    };
  }

  private calculateRevenueByMonth(paidInvoices: Invoice[]): { month: string; revenue: number }[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize last 6 months with zero revenue
    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      revenueByMonth.push({
        month: months[date.getMonth()],
        revenue: 0
      });
    }
    
    // Add actual revenue from paid invoices
    paidInvoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.issueDate);
      const monthIndex = invoiceDate.getMonth();
      const year = invoiceDate.getFullYear();
      
      if (year === currentYear) {
        const monthName = months[monthIndex];
        const monthData = revenueByMonth.find(m => m.month === monthName);
        if (monthData) {
          monthData.revenue += parseFloat(invoice.total);
        }
      }
    });
    
    return revenueByMonth;
  }

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.id));
  }

  async getPaymentsByInvoice(invoiceId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.invoiceId, invoiceId)).orderBy(desc(payments.id));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    
    // Update invoice status and amount based on payments
    await this.updateInvoicePaymentStatus(insertPayment.invoiceId);
    
    return payment;
  }

  async updatePayment(id: number, updateData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    
    if (payment) {
      await this.updateInvoicePaymentStatus(payment.invoiceId);
    }
    
    return payment || undefined;
  }

  async deletePayment(id: number): Promise<boolean> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    if (!payment) return false;
    
    const result = await db.delete(payments).where(eq(payments.id, id));
    
    if (result.rowCount !== null && result.rowCount > 0) {
      await this.updateInvoicePaymentStatus(payment.invoiceId);
      return true;
    }
    
    return false;
  }

  private async updateInvoicePaymentStatus(invoiceId: number): Promise<void> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) return;
    
    const invoicePayments = await this.getPaymentsByInvoice(invoiceId);
    const totalPaid = invoicePayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const invoiceTotal = parseFloat(invoice.total);
    
    let newStatus: "draft" | "sent" | "paid" | "overdue" = invoice.status as "draft" | "sent" | "paid" | "overdue";
    
    if (totalPaid >= invoiceTotal) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "sent"; // Partially paid
    }
    
    if (newStatus !== invoice.status) {
      await this.updateInvoiceStatus(invoiceId, newStatus);
    }
  }

  // Expenses
  async getAllExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updatedExpense] = await db.update(expenses).set(expense).where(eq(expenses.id, id)).returning();
    return updatedExpense || undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.category, category)).orderBy(desc(expenses.expenseDate));
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return await db.select().from(expenses)
      .where(and(
        sql`${expenses.expenseDate} >= ${startDate}`,
        sql`${expenses.expenseDate} <= ${endDate}`
      ))
      .orderBy(desc(expenses.expenseDate));
  }

  // VAT Returns
  async getAllVatReturns(): Promise<VatReturn[]> {
    return await db.select().from(vatReturns).orderBy(desc(vatReturns.createdAt));
  }

  async getVatReturn(id: number): Promise<VatReturn | undefined> {
    const [vatReturn] = await db.select().from(vatReturns).where(eq(vatReturns.id, id));
    return vatReturn || undefined;
  }

  async createVatReturn(vatReturn: InsertVatReturn): Promise<VatReturn> {
    const [newVatReturn] = await db.insert(vatReturns).values(vatReturn).returning();
    return newVatReturn;
  }

  async updateVatReturn(id: number, vatReturn: Partial<InsertVatReturn>): Promise<VatReturn | undefined> {
    const [updatedVatReturn] = await db.update(vatReturns).set(vatReturn).where(eq(vatReturns.id, id)).returning();
    return updatedVatReturn || undefined;
  }

  async deleteVatReturn(id: number): Promise<boolean> {
    const result = await db.delete(vatReturns).where(eq(vatReturns.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getVatReturnByPeriod(startDate: Date, endDate: Date): Promise<VatReturn | undefined> {
    const [vatReturn] = await db.select().from(vatReturns)
      .where(and(
        eq(vatReturns.periodStart, startDate),
        eq(vatReturns.periodEnd, endDate)
      ));
    return vatReturn || undefined;
  }

  // Financial Reports
  async getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalRevenue: string;
    totalExpenses: string;
    grossProfit: string;
    netProfit: string;
    totalVatCollected: string;
    totalVatPaid: string;
  }> {
    const [revenueResult, expenseResult] = await Promise.all([
      db.select({
        totalRevenue: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
        totalVatCollected: sql<string>`COALESCE(SUM(${invoices.vatAmount}), 0)`,
      }).from(invoices)
        .where(and(
          sql`${invoices.issueDate} >= ${startDate}`,
          sql`${invoices.issueDate} <= ${endDate}`,
          eq(invoices.status, 'paid')
        )),
      
      db.select({
        totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
        totalVatPaid: sql<string>`COALESCE(SUM(${expenses.vatAmount}), 0)`,
      }).from(expenses)
        .where(and(
          sql`${expenses.expenseDate} >= ${startDate}`,
          sql`${expenses.expenseDate} <= ${endDate}`
        ))
    ]);

    const totalRevenue = parseFloat(revenueResult[0]?.totalRevenue || '0');
    const totalExpenses = parseFloat(expenseResult[0]?.totalExpenses || '0');
    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = grossProfit; // Simplified for now

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      grossProfit: grossProfit.toFixed(2),
      netProfit: netProfit.toFixed(2),
      totalVatCollected: revenueResult[0]?.totalVatCollected || '0',
      totalVatPaid: expenseResult[0]?.totalVatPaid || '0',
    };
  }

  async getProfitAndLoss(startDate: Date, endDate: Date): Promise<{
    revenue: { category: string; amount: string }[];
    expenses: { category: string; amount: string }[];
    netProfit: string;
  }> {
    const [revenueData, expenseData] = await Promise.all([
      db.select({
        category: sql<string>`'Sales'`,
        amount: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
      }).from(invoices)
        .where(and(
          sql`${invoices.issueDate} >= ${startDate}`,
          sql`${invoices.issueDate} <= ${endDate}`,
          eq(invoices.status, 'paid')
        )),
      
      db.select({
        category: expenses.category,
        amount: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      }).from(expenses)
        .where(and(
          sql`${expenses.expenseDate} >= ${startDate}`,
          sql`${expenses.expenseDate} <= ${endDate}`
        ))
        .groupBy(expenses.category)
    ]);

    const totalRevenue = parseFloat(revenueData[0]?.amount || '0');
    const totalExpenses = expenseData.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      revenue: revenueData,
      expenses: expenseData,
      netProfit: netProfit.toFixed(2),
    };
  }

  async getCashFlowReport(startDate: Date, endDate: Date): Promise<{
    cashInflow: { source: string; amount: string }[];
    cashOutflow: { category: string; amount: string }[];
    netCashFlow: string;
  }> {
    const [inflowData, outflowData] = await Promise.all([
      db.select({
        source: sql<string>`'Customer Payments'`,
        amount: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      }).from(payments)
        .where(and(
          sql`${payments.paymentDate} >= ${startDate}`,
          sql`${payments.paymentDate} <= ${endDate}`,
          eq(payments.status, 'completed')
        )),
      
      db.select({
        category: expenses.category,
        amount: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      }).from(expenses)
        .where(and(
          sql`${expenses.expenseDate} >= ${startDate}`,
          sql`${expenses.expenseDate} <= ${endDate}`
        ))
        .groupBy(expenses.category)
    ]);

    const totalInflow = parseFloat(inflowData[0]?.amount || '0');
    const totalOutflow = outflowData.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const netCashFlow = totalInflow - totalOutflow;

    return {
      cashInflow: inflowData,
      cashOutflow: outflowData,
      netCashFlow: netCashFlow.toFixed(2),
    };
  }

  // Purchase Order Management
  // Suppliers
  async getAllSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db
      .insert(suppliers)
      .values(supplier)
      .returning();
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db
      .update(suppliers)
      .set(supplier)
      .where(eq(suppliers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSupplierByEmail(email: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.email, email));
    return supplier || undefined;
  }

  // Purchase Orders
  async getAllPurchaseOrders(): Promise<PurchaseOrderWithSupplier[]> {
    const results = await db
      .select()
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .orderBy(desc(purchaseOrders.createdAt));

    return results.map((result) => ({
      ...result.purchase_orders,
      supplier: result.suppliers || {
        id: 0,
        name: 'Unknown Supplier',
        email: null,
        phone: null,
        address: null,
        city: null,
        postalCode: null,
        vatNumber: null,
        paymentTerms: null,
        category: null,
        notes: null,
        isActive: null,
        createdAt: null,
      },
    }));
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrderWithItems | undefined> {
    const [result] = await db
      .select()
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .where(eq(purchaseOrders.id, id));

    if (!result) return undefined;

    const items = await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, id));

    return {
      ...result.purchase_orders,
      supplier: result.suppliers || {
        id: 0,
        name: 'Unknown Supplier',
        email: null,
        phone: null,
        address: null,
        city: null,
        postalCode: null,
        vatNumber: null,
        paymentTerms: null,
        category: null,
        notes: null,
        isActive: null,
        createdAt: null,
      },
      items,
    };
  }

  async getPurchaseOrderByNumber(orderNumber: string): Promise<PurchaseOrderWithItems | undefined> {
    const [result] = await db
      .select()
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .where(eq(purchaseOrders.orderNumber, orderNumber));

    if (!result) return undefined;

    const items = await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, result.purchase_orders.id));

    return {
      ...result.purchase_orders,
      supplier: result.suppliers || {
        id: 0,
        name: 'Unknown Supplier',
        email: null,
        phone: null,
        address: null,
        city: null,
        postalCode: null,
        vatNumber: null,
        paymentTerms: null,
        category: null,
        notes: null,
        isActive: null,
        createdAt: null,
      },
      items,
    };
  }

  async createPurchaseOrder(order: InsertPurchaseOrder, items: Omit<InsertPurchaseOrderItem, 'purchaseOrderId'>[]): Promise<PurchaseOrderWithItems> {
    const [newOrder] = await db
      .insert(purchaseOrders)
      .values(order)
      .returning();

    const orderItems = await db
      .insert(purchaseOrderItems)
      .values(items.map(item => ({ ...item, purchaseOrderId: newOrder.id })))
      .returning();

    const supplier = await this.getSupplier(newOrder.supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return { ...newOrder, items: orderItems, supplier };
  }

  async updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [updated] = await db
      .update(purchaseOrders)
      .set(order)
      .where(eq(purchaseOrders.id, id))
      .returning();
    return updated || undefined;
  }

  async updatePurchaseOrderStatus(id: number, status: string): Promise<PurchaseOrder | undefined> {
    const [updated] = await db
      .update(purchaseOrders)
      .set({ status })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    // First delete all items
    await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id));
    
    // Then delete the order
    const result = await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Purchase Order Items
  async getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    return await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId));
  }

  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [newItem] = await db
      .insert(purchaseOrderItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updatePurchaseOrderItem(id: number, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    const [updated] = await db
      .update(purchaseOrderItems)
      .set(item)
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePurchaseOrderItem(id: number): Promise<boolean> {
    const result = await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Supplier Payments
  async getAllSupplierPayments(): Promise<SupplierPaymentWithSupplier[]> {
    const results = await db
      .select()
      .from(supplierPayments)
      .leftJoin(suppliers, eq(supplierPayments.supplierId, suppliers.id))
      .orderBy(desc(supplierPayments.createdAt));

    return results.map((result) => ({
      ...result.supplier_payments,
      supplier: result.suppliers || {
        id: 0,
        name: 'Unknown Supplier',
        email: null,
        phone: null,
        address: null,
        city: null,
        postalCode: null,
        vatNumber: null,
        paymentTerms: null,
        category: null,
        notes: null,
        isActive: null,
        createdAt: null,
      },
    }));
  }

  async getSupplierPaymentsBySupplier(supplierId: number): Promise<SupplierPayment[]> {
    return await db
      .select()
      .from(supplierPayments)
      .where(eq(supplierPayments.supplierId, supplierId))
      .orderBy(desc(supplierPayments.createdAt));
  }

  async getSupplierPaymentsByPurchaseOrder(purchaseOrderId: number): Promise<SupplierPayment[]> {
    return await db
      .select()
      .from(supplierPayments)
      .where(eq(supplierPayments.purchaseOrderId, purchaseOrderId))
      .orderBy(desc(supplierPayments.createdAt));
  }

  async createSupplierPayment(payment: InsertSupplierPayment): Promise<SupplierPayment> {
    const [newPayment] = await db
      .insert(supplierPayments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updateSupplierPayment(id: number, payment: Partial<InsertSupplierPayment>): Promise<SupplierPayment | undefined> {
    const [updated] = await db
      .update(supplierPayments)
      .set(payment)
      .where(eq(supplierPayments.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSupplierPayment(id: number): Promise<boolean> {
    const result = await db.delete(supplierPayments).where(eq(supplierPayments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Product Categories
  async getAllProductCategories(): Promise<ProductCategory[]> {
    return await db.select().from(productCategories).where(eq(productCategories.isActive, true));
  }

  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    const [category] = await db.select().from(productCategories).where(eq(productCategories.id, id));
    return category || undefined;
  }

  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> {
    const [newCategory] = await db.insert(productCategories).values(category).returning();
    return newCategory;
  }

  async updateProductCategory(id: number, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined> {
    const [updated] = await db
      .update(productCategories)
      .set(category)
      .where(eq(productCategories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProductCategory(id: number): Promise<boolean> {
    const result = await db.delete(productCategories).where(eq(productCategories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getProductsBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product || undefined;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  // PayFast Payments
  async createPayfastPayment(payment: InsertPayfastPayment): Promise<PayfastPayment> {
    const [newPayment] = await db.insert(payfastPayments).values(payment).returning();
    return newPayment;
  }

  async getPayfastPaymentByInvoiceId(invoiceId: number): Promise<PayfastPayment | undefined> {
    const [payment] = await db.select().from(payfastPayments).where(eq(payfastPayments.invoiceId, invoiceId));
    return payment || undefined;
  }

  async getPayfastPaymentByPaymentId(payfastPaymentId: string): Promise<PayfastPayment | undefined> {
    const [payment] = await db.select().from(payfastPayments).where(eq(payfastPayments.payfastPaymentId, payfastPaymentId));
    return payment || undefined;
  }

  async updatePayfastPayment(id: number, payment: Partial<InsertPayfastPayment>): Promise<PayfastPayment | undefined> {
    const [updated] = await db
      .update(payfastPayments)
      .set(payment)
      .where(eq(payfastPayments.id, id))
      .returning();
    return updated || undefined;
  }

  async updatePayfastPaymentStatus(id: number, status: string, payfastData?: string): Promise<PayfastPayment | undefined> {
    const updateData: any = { status };
    if (payfastData) {
      updateData.payfastData = payfastData;
    }
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    const [updated] = await db
      .update(payfastPayments)
      .set(updateData)
      .where(eq(payfastPayments.id, id))
      .returning();
    return updated || undefined;
  }

  // Company Settings
  async getCompanySettings(): Promise<any> {
    const [settings] = await db.select().from(companySettings);
    return settings || null;
  }

  async updateCompanySettings(updates: Partial<any>): Promise<any> {
    const existing = await this.getCompanySettings();
    if (!existing) {
      const settingsData = {
        companyName: updates.companyName || "My Company",
        ...updates
      };
      const [newSettings] = await db.insert(companySettings).values(settingsData).returning();
      return newSettings;
    }
    
    const [updated] = await db
      .update(companySettings)
      .set(updates)
      .where(eq(companySettings.id, existing.id))
      .returning();
    return updated;
  }

  // Inventory Transactions
  async createInventoryTransaction(transaction: any): Promise<any> {
    const [newTransaction] = await db.insert(inventoryTransactions).values(transaction).returning();
    
    // Update product stock quantity
    const product = await this.getProduct(transaction.productId);
    if (product) {
      let newQuantity = product.stockQuantity;
      if (transaction.transactionType === 'in') {
        newQuantity += transaction.quantity;
      } else if (transaction.transactionType === 'out') {
        newQuantity = (newQuantity || 0) - transaction.quantity;
      } else if (transaction.transactionType === 'adjustment') {
        newQuantity = transaction.quantity;
      }
      
      await db.update(products).set({ stockQuantity: newQuantity }).where(eq(products.id, product.id));
    }
    
    return newTransaction;
  }

  async getInventoryTransactions(): Promise<any[]> {
    return await db.select().from(inventoryTransactions);
  }

  async getInventoryTransactionsByProduct(productId: number): Promise<any[]> {
    return await db.select().from(inventoryTransactions).where(eq(inventoryTransactions.productId, productId));
  }

  // Email Reminders
  async createEmailReminder(reminder: any): Promise<any> {
    const [newReminder] = await db.insert(emailReminders).values(reminder).returning();
    return newReminder;
  }

  async getEmailReminders(): Promise<any[]> {
    return await db.select().from(emailReminders);
  }

  async getPendingEmailReminders(): Promise<any[]> {
    const now = new Date();
    return await db.select().from(emailReminders).where(
      and(
        eq(emailReminders.emailSent, false),
        lte(emailReminders.scheduledFor, now)
      )
    );
  }

  async markEmailReminderSent(id: number): Promise<void> {
    await db.update(emailReminders).set({ emailSent: true, sentAt: new Date() }).where(eq(emailReminders.id, id));
  }

  // Currency Rates
  async getCurrencyRates(): Promise<any[]> {
    return await db.select().from(currencyRates);
  }

  async getCurrentRate(fromCurrency: string, toCurrency: string): Promise<any | null> {
    const now = new Date();
    const [rate] = await db.select().from(currencyRates).where(
      and(
        eq(currencyRates.fromCurrency, fromCurrency),
        eq(currencyRates.toCurrency, toCurrency),
        lte(currencyRates.validFrom, now),
        or(
          isNull(currencyRates.validTo),
          gte(currencyRates.validTo, now)
        )
      )
    );
    return rate || null;
  }

  async createCurrencyRate(rate: any): Promise<any> {
    const [newRate] = await db.insert(currencyRates).values(rate).returning();
    return newRate;
  }

  async updateCurrencyRate(id: number, updates: Partial<any>): Promise<any | undefined> {
    const [updated] = await db
      .update(currencyRates)
      .set(updates)
      .where(eq(currencyRates.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();