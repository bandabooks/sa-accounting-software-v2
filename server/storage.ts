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
  numberSequences,
  inventoryTransactions,
  emailReminders,
  currencyRates,
  chartOfAccounts,
  journalEntries,
  journalEntryLines,
  accountBalances,
  bankAccounts,
  bankTransactions,
  generalLedger,
  bankReconciliations,
  companies,
  industryTemplates,
  companyChartOfAccounts,
  companyUsers,
  subscriptionPlans,
  companySubscriptions,
  subscriptionPayments,
  vatTypes,
  vatReports,
  vatTransactions,
  fixedAssets,
  depreciationRecords,
  budgets,
  budgetLines,
  cashFlowForecasts,
  cashFlowForecastLines,
  advancedReports,
  bankReconciliationItems,
  SOUTH_AFRICAN_CHART_OF_ACCOUNTS,
  SOUTH_AFRICAN_VAT_TYPES,
  projects,
  tasks,
  timeEntries,
  projectMembers,
  taskComments,
  projectFiles,
  projectTemplates,
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
  type InsertCurrencyRate,
  type ChartOfAccount,
  type InsertChartOfAccount,
  type JournalEntry,
  type InsertJournalEntry,
  type JournalEntryLine,
  type InsertJournalEntryLine,
  type AccountBalance,
  type InsertAccountBalance,
  type ChartOfAccountWithBalance,
  type JournalEntryWithLines,
  type AccountBalanceReport,
  type BankAccount,
  type InsertBankAccount,
  type BankTransaction,
  type InsertBankTransaction,
  type BankAccountWithTransactions,
  type GeneralLedgerEntry,
  type Company,
  type InsertCompany,
  type CompanyUser,
  type InsertCompanyUser,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type CompanySubscription,
  type InsertCompanySubscription,
  type SubscriptionPayment,
  type InsertSubscriptionPayment,
  type VatType,
  type InsertVatType,
  type VatReport,
  type InsertVatReport,
  type VatTransaction,
  type InsertVatTransaction,
  type FixedAsset,
  type InsertFixedAsset,
  type DepreciationRecord,
  type InsertDepreciationRecord,
  type Budget,
  type InsertBudget,
  type BudgetLine,
  type InsertBudgetLine,
  type CashFlowForecast,
  type InsertCashFlowForecast,
  type CashFlowForecastLine,
  type InsertCashFlowForecastLine,
  type AdvancedReport,
  type InsertAdvancedReport,
  type BankReconciliationItem,
  type InsertBankReconciliationItem,
  type IndustryTemplate,
  type InsertIndustryTemplate,
  type CompanyChartOfAccount,
  type InsertCompanyChartOfAccount,
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
  type TimeEntry,
  type InsertTimeEntry,
  type ProjectMember,
  type InsertProjectMember,
  type TaskComment,
  type InsertTaskComment,
  type ProjectFile,
  type InsertProjectFile,
  type ProjectTemplate,
  type InsertProjectTemplate,
  type NumberSequence,
  type InsertNumberSequence,
  type ProjectWithDetails,
  type TaskWithDetails,
  type TimeEntryWithDetails,
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
  getUserAuditLogs(userId: number, limit?: number): Promise<AuditLog[]>;
  getCompanyAuditLogs(companyId: number, limit?: number): Promise<AuditLog[]>;

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

  // Chart of Accounts
  getAllChartOfAccounts(companyId: number): Promise<ChartOfAccountWithBalance[]>;
  getActiveChartOfAccounts(companyId: number): Promise<ChartOfAccountWithBalance[]>;
  getChartOfAccount(id: number): Promise<ChartOfAccount | undefined>;
  getChartOfAccountByCode(companyId: number, accountCode: string): Promise<ChartOfAccount | undefined>;
  createChartOfAccount(account: InsertChartOfAccount): Promise<ChartOfAccount>;
  updateChartOfAccount(id: number, account: Partial<InsertChartOfAccount>): Promise<ChartOfAccount | undefined>;
  deleteChartOfAccount(id: number): Promise<boolean>;
  toggleAccountActivation(accountId: number, isActive: boolean, companyId: number): Promise<ChartOfAccount | undefined>;
  seedSouthAfricanChartOfAccounts(companyId: number): Promise<void>;
  
  // Journal Entries
  getAllJournalEntries(companyId: number): Promise<JournalEntryWithLines[]>;
  getJournalEntry(id: number): Promise<JournalEntryWithLines | undefined>;
  createJournalEntry(entry: InsertJournalEntry, lines: Omit<InsertJournalEntryLine, 'journalEntryId'>[]): Promise<JournalEntryWithLines>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  postJournalEntry(id: number): Promise<JournalEntry | undefined>;
  reverseJournalEntry(id: number, description: string, createdBy: number): Promise<JournalEntryWithLines>;
  deleteJournalEntry(id: number): Promise<boolean>;
  
  // Account Balances
  calculateAccountBalance(accountId: number, asOfDate?: Date): Promise<string>;
  getAccountBalanceReport(companyId: number, periodStart: Date, periodEnd: Date): Promise<AccountBalanceReport[]>;
  updateAccountBalances(companyId: number, periodStart: Date, periodEnd: Date): Promise<void>;
  getTrialBalance(companyId: number, asOfDate: Date): Promise<AccountBalanceReport[]>;
  
  // Automated Journal Entries
  createInvoiceJournalEntry(invoiceId: number): Promise<JournalEntryWithLines>;
  createPaymentJournalEntry(paymentId: number): Promise<JournalEntryWithLines>;
  createExpenseJournalEntry(expenseId: number): Promise<JournalEntryWithLines>;

  // VAT Management
  getVatTypes(): Promise<VatType[]>;
  getVatType(id: number): Promise<VatType | undefined>;
  createVatType(data: InsertVatType): Promise<VatType>;
  getVatReports(companyId: number): Promise<VatReport[]>;
  getVatReport(id: number): Promise<VatReport | undefined>;
  createVatReport(data: InsertVatReport): Promise<VatReport>;
  updateVatReport(id: number, data: Partial<InsertVatReport>): Promise<VatReport | undefined>;
  getVatTransactions(companyId: number): Promise<VatTransaction[]>;
  createVatTransaction(data: InsertVatTransaction): Promise<VatTransaction>;
  updateCompanyVatSettings(companyId: number, settings: { 
    vatRegistered: boolean; 
    vatNumber?: string; 
    vatPeriod?: string; 
    vatSubmissionDate?: number;
  }): Promise<Company | undefined>;

  // Fixed Assets Management
  getFixedAssets(companyId: number): Promise<FixedAsset[]>;
  getFixedAsset(id: number): Promise<FixedAsset | undefined>;
  createFixedAsset(data: InsertFixedAsset): Promise<FixedAsset>;
  updateFixedAsset(id: number, data: Partial<InsertFixedAsset>): Promise<FixedAsset | undefined>;
  deleteFixedAsset(id: number): Promise<boolean>;
  getDepreciationRecords(assetId: number): Promise<DepreciationRecord[]>;
  createDepreciationRecord(data: InsertDepreciationRecord): Promise<DepreciationRecord>;
  calculateDepreciation(assetId: number, period: string): Promise<void>;

  // Budgeting
  getBudgets(companyId: number): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  createBudget(data: InsertBudget): Promise<Budget>;
  updateBudget(id: number, data: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  getBudgetLines(budgetId: number): Promise<BudgetLine[]>;
  createBudgetLine(data: InsertBudgetLine): Promise<BudgetLine>;
  updateBudgetLine(id: number, data: Partial<InsertBudgetLine>): Promise<BudgetLine | undefined>;
  deleteBudgetLine(id: number): Promise<boolean>;
  updateBudgetActuals(companyId: number, period: string): Promise<void>;

  // Cash Flow Forecasting
  getCashFlowForecasts(companyId: number): Promise<CashFlowForecast[]>;
  getCashFlowForecast(id: number): Promise<CashFlowForecast | undefined>;
  createCashFlowForecast(data: InsertCashFlowForecast): Promise<CashFlowForecast>;
  updateCashFlowForecast(id: number, data: Partial<InsertCashFlowForecast>): Promise<CashFlowForecast | undefined>;
  deleteCashFlowForecast(id: number): Promise<boolean>;
  getCashFlowForecastLines(forecastId: number): Promise<CashFlowForecastLine[]>;
  createCashFlowForecastLine(data: InsertCashFlowForecastLine): Promise<CashFlowForecastLine>;
  updateCashFlowForecastLine(id: number, data: Partial<InsertCashFlowForecastLine>): Promise<CashFlowForecastLine | undefined>;
  deleteCashFlowForecastLine(id: number): Promise<boolean>;
  generateCashFlowProjections(companyId: number, months: number): Promise<any>;

  // Advanced Reporting
  getAdvancedReports(companyId: number): Promise<AdvancedReport[]>;
  getAdvancedReport(id: number): Promise<AdvancedReport | undefined>;
  createAdvancedReport(data: InsertAdvancedReport): Promise<AdvancedReport>;
  updateAdvancedReport(id: number, data: Partial<InsertAdvancedReport>): Promise<AdvancedReport | undefined>;
  deleteAdvancedReport(id: number): Promise<boolean>;
  generateReport(reportId: number): Promise<any>;

  // Bank Reconciliation
  getBankReconciliationItems(reconciliationId: number): Promise<BankReconciliationItem[]>;
  createBankReconciliationItem(data: InsertBankReconciliationItem): Promise<BankReconciliationItem>;
  updateBankReconciliationItem(id: number, data: Partial<InsertBankReconciliationItem>): Promise<BankReconciliationItem | undefined>;
  deleteBankReconciliationItem(id: number): Promise<boolean>;
  matchBankTransactions(reconciliationId: number): Promise<void>;
  getUnmatchedTransactions(companyId: number, bankAccountId: number): Promise<any[]>;

  // Project Management
  // Projects
  getProjects(companyId: number): Promise<ProjectWithDetails[]>;
  getProject(id: number, companyId: number): Promise<ProjectWithDetails | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>, companyId: number): Promise<Project | undefined>;
  deleteProject(id: number, companyId: number): Promise<boolean>;
  
  // Tasks
  getTasks(companyId: number, projectId?: number): Promise<TaskWithDetails[]>;
  getTask(id: number, companyId: number): Promise<TaskWithDetails | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>, companyId: number): Promise<Task | undefined>;
  deleteTask(id: number, companyId: number): Promise<boolean>;
  
  // Time Entries
  getTimeEntries(companyId: number, userId?: number, projectId?: number, taskId?: number): Promise<TimeEntryWithDetails[]>;
  getActiveTimeEntry(userId: number, companyId: number): Promise<TimeEntry | undefined>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, entry: Partial<InsertTimeEntry>, companyId: number): Promise<TimeEntry | undefined>;
  stopTimeEntry(id: number, companyId: number, endTime: Date): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number, companyId: number): Promise<boolean>;
  
  // Task Comments
  createTaskComment(comment: InsertTaskComment): Promise<TaskComment>;
  getTaskComments(taskId: number): Promise<TaskComment[]>;
  deleteTaskComment(id: number): Promise<boolean>;
  
  // Project Members
  addProjectMember(member: InsertProjectMember): Promise<ProjectMember>;
  removeProjectMember(projectId: number, userId: number): Promise<boolean>;
  getProjectMembers(projectId: number): Promise<ProjectMember[]>;
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
    const results = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resource: auditLogs.resource,
        resourceId: auditLogs.resourceId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        timestamp: auditLogs.timestamp,
        userName: users.username,
        userEmail: users.email,
        userFullName: users.name,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    // Transform results to include user object with null safety
    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      action: result.action,
      resource: result.resource,
      resourceId: result.resourceId,
      details: result.details,
      ipAddress: result.ipAddress,
      userAgent: result.userAgent,
      timestamp: result.timestamp,
      user: result.userId ? {
        id: result.userId,
        username: result.userName || 'Unknown',
        name: result.userFullName || 'Unknown User',
        email: result.userEmail || 'unknown@domain.com',
      } : null
    }));
  }

  async getAuditLogsByUser(userId: number, limit: number = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  async getUserAuditLogs(userId: number, limit: number = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  async getCompanyAuditLogs(companyId: number, limit: number = 500): Promise<AuditLog[]> {
    return await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        description: auditLogs.description,
        details: auditLogs.details,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        timestamp: auditLogs.timestamp,
        createdAt: auditLogs.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username
        }
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.companyId, companyId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  // Auto-numbering sequences
  async getNextDocumentNumber(companyId: number, documentType: string): Promise<string> {
    // Get or create sequence for this document type
    let [sequence] = await db
      .select()
      .from(numberSequences)
      .where(
        and(
          eq(numberSequences.companyId, companyId),
          eq(numberSequences.documentType, documentType)
        )
      );

    if (!sequence) {
      // Create default sequence for this document type
      const defaultPrefix = documentType.toUpperCase().substring(0, 3) + "-";
      sequence = await this.createDefaultSequence(companyId, documentType, defaultPrefix);
    }

    // Generate the document number
    const currentYear = new Date().getFullYear();
    const formatParts = sequence.format.split('-');
    let documentNumber = '';

    // Reset numbering if it's a new year and yearReset is true
    if (sequence.yearReset) {
      const sequenceYear = sequence.updatedAt ? sequence.updatedAt.getFullYear() : currentYear;
      if (sequenceYear < currentYear) {
        await db
          .update(numberSequences)
          .set({ nextNumber: 1, updatedAt: new Date() })
          .where(eq(numberSequences.id, sequence.id));
        sequence.nextNumber = 1;
      }
    }

    // Build document number according to format
    for (const part of formatParts) {
      switch (part) {
        case 'prefix':
          documentNumber += sequence.prefix;
          break;
        case 'year':
          documentNumber += currentYear.toString() + '-';
          break;
        case 'number':
          documentNumber += sequence.nextNumber.toString().padStart(3, '0');
          break;
        default:
          documentNumber += part;
      }
    }

    // Update the next number
    await db
      .update(numberSequences)
      .set({ 
        nextNumber: sequence.nextNumber + 1,
        updatedAt: new Date()
      })
      .where(eq(numberSequences.id, sequence.id));

    return documentNumber;
  }

  private async createDefaultSequence(companyId: number, documentType: string, prefix: string): Promise<NumberSequence> {
    const [sequence] = await db
      .insert(numberSequences)
      .values({
        companyId,
        documentType,
        prefix,
        nextNumber: 1,
        format: 'prefix-year-number',
        yearReset: true,
      })
      .returning();
    return sequence;
  }

  async updateNumberSequence(companyId: number, documentType: string, sequenceData: Partial<InsertNumberSequence>): Promise<NumberSequence | undefined> {
    const [updatedSequence] = await db
      .update(numberSequences)
      .set({ ...sequenceData, updatedAt: new Date() })
      .where(
        and(
          eq(numberSequences.companyId, companyId),
          eq(numberSequences.documentType, documentType)
        )
      )
      .returning();
    return updatedSequence;
  }

  // Customers
  async getAllCustomers(companyId?: number): Promise<Customer[]> {
    let query = db.select().from(customers);
    
    // Apply company filtering if companyId is provided
    if (companyId) {
      query = query.where(eq(customers.companyId, companyId));
    }
    
    const result = await query.orderBy(desc(customers.id));
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
  async getAllInvoices(companyId?: number): Promise<InvoiceWithCustomer[]> {
    let query = db
      .select({
        invoice: invoices,
        customer: customers
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id));

    // Apply company filtering if companyId is provided
    if (companyId) {
      query = query.where(eq(invoices.companyId, companyId));
    }

    const result = await query.orderBy(desc(invoices.id));
    
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
  async getAllEstimates(companyId?: number): Promise<EstimateWithCustomer[]> {
    let query = db
      .select({
        estimate: estimates,
        customer: customers
      })
      .from(estimates)
      .leftJoin(customers, eq(estimates.customerId, customers.id));

    // Apply company filtering if companyId is provided
    if (companyId) {
      query = query.where(eq(estimates.companyId, companyId));
    }

    const result = await query.orderBy(desc(estimates.id));
    
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

  // Dashboard stats - Company Isolated
  async getDashboardStats(companyId?: number): Promise<{
    totalRevenue: string;
    outstandingInvoices: string;
    totalCustomers: number;
    vatDue: string;
    recentInvoices: InvoiceWithCustomer[];
    revenueByMonth: { month: string; revenue: number }[];
    outstandingInvoiceCount: number;
    paidInvoiceCount: number;
  }> {
    // If no companyId provided, return zero stats for safety
    if (!companyId) {
      return {
        totalRevenue: "0.00",
        outstandingInvoices: "0.00",
        totalCustomers: 0,
        vatDue: "0.00",
        recentInvoices: [],
        revenueByMonth: [],
        outstandingInvoiceCount: 0,
        paidInvoiceCount: 0
      };
    }

    // Get only invoices for this company
    const allInvoices = await db.select().from(invoices).where(eq(invoices.companyId, companyId));
    
    // Calculate totals
    const paidInvoices = allInvoices.filter(inv => inv.status === "paid");
    const outstandingInvoiceList = allInvoices.filter(inv => inv.status === "sent" || inv.status === "draft");
    
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const outstandingInvoices = outstandingInvoiceList.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const vatDue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.vatAmount), 0);

    // Get customer count for this company only
    const customerCount = await db.select({ count: count() }).from(customers).where(eq(customers.companyId, companyId));
    const totalCustomers = customerCount[0]?.count || 0;

    // Get recent invoices with customer info for this company only
    const recentInvoices = await this.getAllInvoices(companyId);

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
    
    // Update bank account balance if bankAccountId is provided
    if (insertPayment.bankAccountId && insertPayment.status === 'completed') {
      await this.updateBankAccountBalance(
        insertPayment.bankAccountId, 
        parseFloat(insertPayment.amount)
      );
    }
    
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
    
    let newStatus: "draft" | "sent" | "paid" | "overdue" | "partially_paid" = invoice.status as "draft" | "sent" | "paid" | "overdue" | "partially_paid";
    
    if (totalPaid >= invoiceTotal) {
      newStatus = "paid";
    } else if (totalPaid > 0 && totalPaid < invoiceTotal) {
      newStatus = "partially_paid";
    } else if (totalPaid === 0 && invoice.status !== "draft") {
      newStatus = "sent";
    }
    
    if (newStatus !== invoice.status) {
      await this.updateInvoiceStatus(invoiceId, newStatus);
    }
  }

  private async updateBankAccountBalance(bankAccountId: number, amount: number): Promise<void> {
    // Get current balance
    const [account] = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.id, bankAccountId));
    
    if (!account) return;
    
    const currentBalance = parseFloat(account.currentBalance);
    const newBalance = currentBalance + amount;
    
    // Update bank account balance
    await db
      .update(bankAccounts)
      .set({ 
        currentBalance: newBalance.toFixed(2),
        updatedAt: new Date()
      })
      .where(eq(bankAccounts.id, bankAccountId));
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
  async getCompanySettings(companyId?: number): Promise<any> {
    if (companyId) {
      const [settings] = await db
        .select()
        .from(companySettings)
        .where(eq(companySettings.companyId, companyId));
      return settings || null;
    }
    
    const [settings] = await db.select().from(companySettings);
    return settings || null;
  }

  async updateCompanySettings(companyId: number, updates: Partial<any>): Promise<any> {
    const existing = await this.getCompanySettings(companyId);
    if (!existing) {
      const settingsData = {
        companyId,
        companyName: updates.companyName || "My Company",
        ...updates
      };
      const [newSettings] = await db.insert(companySettings).values(settingsData).returning();
      return newSettings;
    }
    
    const [updated] = await db
      .update(companySettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companySettings.id, existing.id))
      .returning();
    return updated;
  }

  // Subscription Plan Management (Super Admin Only)
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .orderBy(subscriptionPlans.sortOrder, subscriptionPlans.name);
  }

  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder, subscriptionPlans.name);
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(planData: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db
      .insert(subscriptionPlans)
      .values(planData)
      .returning();
    return plan;
  }

  async updateSubscriptionPlan(id: number, updates: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db
      .update(subscriptionPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return plan;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    const result = await db
      .update(subscriptionPlans)
      .set({ isActive: false })
      .where(eq(subscriptionPlans.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Company Subscription Management
  async getCompanySubscription(companyId: number): Promise<CompanySubscription | undefined> {
    const [subscription] = await db
      .select({
        subscription: companySubscriptions,
        plan: subscriptionPlans,
      })
      .from(companySubscriptions)
      .innerJoin(subscriptionPlans, eq(companySubscriptions.planId, subscriptionPlans.id))
      .where(eq(companySubscriptions.companyId, companyId))
      .orderBy(desc(companySubscriptions.createdAt))
      .limit(1);
    
    return subscription ? { ...subscription.subscription, plan: subscription.plan } : undefined;
  }

  async createCompanySubscription(subscriptionData: InsertCompanySubscription): Promise<CompanySubscription> {
    const [subscription] = await db
      .insert(companySubscriptions)
      .values(subscriptionData)
      .returning();
    return subscription;
  }

  async updateCompanySubscription(companyId: number, updates: Partial<InsertCompanySubscription>): Promise<CompanySubscription | undefined> {
    const [subscription] = await db
      .update(companySubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companySubscriptions.companyId, companyId))
      .returning();
    return subscription;
  }

  // Subscription Payment Management
  async createSubscriptionPayment(paymentData: InsertSubscriptionPayment): Promise<SubscriptionPayment> {
    const [payment] = await db
      .insert(subscriptionPayments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async getSubscriptionPayment(paymentId: number): Promise<SubscriptionPayment | undefined> {
    const [payment] = await db
      .select()
      .from(subscriptionPayments)
      .where(eq(subscriptionPayments.id, paymentId));
    return payment;
  }

  async getSubscriptionPaymentsByCompany(companyId: number): Promise<SubscriptionPayment[]> {
    return await db
      .select()
      .from(subscriptionPayments)
      .where(eq(subscriptionPayments.companyId, companyId))
      .orderBy(desc(subscriptionPayments.createdAt));
  }

  async updateSubscriptionPaymentStatus(paymentId: number, statusData: {
    status: string;
    paymentReference?: string;
    paidAmount?: string;
    completedAt?: Date | null;
  }): Promise<SubscriptionPayment | undefined> {
    const [payment] = await db
      .update(subscriptionPayments)
      .set({ ...statusData, updatedAt: new Date() })
      .where(eq(subscriptionPayments.id, paymentId))
      .returning();
    return payment;
  }

  // Super Admin Analytics
  async getSystemAnalytics(): Promise<any> {
    const totalCompanies = await db.select({ count: sql`count(*)` }).from(companies);
    const activeCompanies = await db.select({ count: sql`count(*)` }).from(companies).where(eq(companies.isActive, true));
    const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
    const activeUsers = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.isActive, true));
    
    // Subscription stats
    const subscriptionStats = await db
      .select({
        plan: subscriptionPlans.displayName,
        count: sql`count(*)`,
      })
      .from(companySubscriptions)
      .innerJoin(subscriptionPlans, eq(companySubscriptions.planId, subscriptionPlans.id))
      .where(eq(companySubscriptions.status, 'active'))
      .groupBy(subscriptionPlans.displayName);

    return {
      totalCompanies: totalCompanies[0]?.count || 0,
      activeCompanies: activeCompanies[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      subscriptionStats,
    };
  }

  async checkUserAccess(userId: number, companyId: number): Promise<boolean> {
    const [access] = await db
      .select()
      .from(companyUsers)
      .where(and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, companyId),
        eq(companyUsers.isActive, true)
      ));
    return !!access;
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

  // Chart of Accounts Implementation
  async getAllChartOfAccounts(companyId: number): Promise<ChartOfAccountWithBalance[]> {
    const accounts = await db.select().from(chartOfAccounts)
      .where(eq(chartOfAccounts.companyId, companyId))
      .orderBy(chartOfAccounts.accountCode);
    
    return await Promise.all(accounts.map(async (account) => ({
      ...account,
      currentBalance: await this.calculateAccountBalance(account.id),
    })));
  }

  async getActiveChartOfAccounts(companyId: number): Promise<ChartOfAccountWithBalance[]> {
    const accounts = await db.select().from(chartOfAccounts)
      .where(
        and(
          eq(chartOfAccounts.companyId, companyId),
          eq(chartOfAccounts.isActive, true)
        )
      )
      .orderBy(chartOfAccounts.accountCode);

    return await Promise.all(accounts.map(async (account) => ({
      ...account,
      currentBalance: await this.calculateAccountBalance(account.id),
    })));
  }

  async toggleAccountActivation(accountId: number, isActive: boolean, companyId: number): Promise<ChartOfAccount | undefined> {
    const [updatedAccount] = await db
      .update(chartOfAccounts)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(chartOfAccounts.id, accountId),
          eq(chartOfAccounts.companyId, companyId)
        )
      )
      .returning();
    return updatedAccount;
  }

  async getChartOfAccount(id: number): Promise<ChartOfAccount | undefined> {
    const [account] = await db.select().from(chartOfAccounts).where(eq(chartOfAccounts.id, id));
    return account || undefined;
  }

  async getChartOfAccountByCode(companyId: number, accountCode: string): Promise<ChartOfAccount | undefined> {
    const [account] = await db.select().from(chartOfAccounts)
      .where(and(eq(chartOfAccounts.companyId, companyId), eq(chartOfAccounts.accountCode, accountCode)));
    return account || undefined;
  }

  async createChartOfAccount(account: InsertChartOfAccount): Promise<ChartOfAccount> {
    const [newAccount] = await db.insert(chartOfAccounts).values(account).returning();
    return newAccount;
  }

  async updateChartOfAccount(id: number, account: Partial<InsertChartOfAccount>): Promise<ChartOfAccount | undefined> {
    const [updated] = await db
      .update(chartOfAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(chartOfAccounts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteChartOfAccount(id: number): Promise<boolean> {
    const result = await db.delete(chartOfAccounts).where(eq(chartOfAccounts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async seedSouthAfricanChartOfAccounts(companyId: number): Promise<void> {
    // Check if accounts already exist
    const existingAccounts = await db
      .select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.companyId, companyId));

    if (existingAccounts.length === 0) {
      // Insert comprehensive South African IFRS-compliant Chart of Accounts
      for (const account of SOUTH_AFRICAN_CHART_OF_ACCOUNTS) {
        await db.insert(chartOfAccounts).values({
          ...account,
          companyId,
          isActive: true,
          level: 1,
          isSystemAccount: account.isSystemAccount || false,
        }).onConflictDoNothing();
      }
    }
  }

  async seedDefaultSouthAfricanBanks(companyId: number): Promise<void> {
    // Check if bank accounts already exist
    const existingBanks = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.companyId, companyId));

    if (existingBanks.length === 0) {
      // Find relevant chart of accounts for banking
      const bankingAccounts = await db
        .select()
        .from(chartOfAccounts)
        .where(
          and(
            eq(chartOfAccounts.companyId, companyId),
            or(
              eq(chartOfAccounts.accountCode, "1100"), // Bank Account - Current
              eq(chartOfAccounts.accountCode, "1101"), // Bank Account - Savings
              eq(chartOfAccounts.accountCode, "1103"), // Bank Account - Money Market
            )
          )
        );

      const currentAccount = bankingAccounts.find(acc => acc.accountCode === "1100");
      const savingsAccount = bankingAccounts.find(acc => acc.accountCode === "1101");
      const moneyMarketAccount = bankingAccounts.find(acc => acc.accountCode === "1103");

      // Top 6 South African Banks
      const defaultBanks = [
        {
          companyId,
          accountName: "FNB Business Current Account",
          bankName: "First National Bank (FNB)",
          accountNumber: "74500123456",
          branchCode: "250655",
          accountType: "current",
          currency: "ZAR",
          openingBalance: "0.00",
          currentBalance: "0.00",
          chartAccountId: currentAccount?.id,
          isActive: true,
          notes: "Primary business banking account"
        },
        {
          companyId,
          accountName: "Standard Bank Business Account",
          bankName: "Standard Bank",
          accountNumber: "11070012345",
          branchCode: "051001",
          accountType: "current",
          currency: "ZAR",
          openingBalance: "0.00",
          currentBalance: "0.00",
          chartAccountId: currentAccount?.id,
          isActive: true,
          notes: "Secondary business account"
        },
        {
          companyId,
          accountName: "ABSA Business Plus Account",
          bankName: "ABSA Bank",
          accountNumber: "40480012345",
          branchCode: "632005",
          accountType: "current",
          currency: "ZAR",
          openingBalance: "0.00",
          currentBalance: "0.00",
          chartAccountId: currentAccount?.id,
          isActive: true,
          notes: "ABSA business banking"
        },
        {
          companyId,
          accountName: "Nedbank Business Account",
          bankName: "Nedbank",
          accountNumber: "11980012345",
          branchCode: "198765",
          accountType: "current",
          currency: "ZAR",
          openingBalance: "0.00",
          currentBalance: "0.00",
          chartAccountId: currentAccount?.id,
          isActive: true,
          notes: "Nedbank business solutions"
        },
        {
          companyId,
          accountName: "Capitec Business Account",
          bankName: "Capitec Bank",
          accountNumber: "14700012345",
          branchCode: "470010",
          accountType: "current",
          currency: "ZAR",
          openingBalance: "0.00",
          currentBalance: "0.00",
          chartAccountId: currentAccount?.id,
          isActive: true,
          notes: "Capitec business banking"
        },
        {
          companyId,
          accountName: "Investec Business Account",
          bankName: "Investec Bank",
          accountNumber: "58050012345",
          branchCode: "580105",
          accountType: "current",
          currency: "ZAR",
          openingBalance: "0.00",
          currentBalance: "0.00",
          chartAccountId: currentAccount?.id,
          isActive: true,
          notes: "Investec private banking"
        },
        
        // Top 3 Investment/Money Market Accounts
        {
          companyId,
          accountName: "FNB Money Market Plus",
          bankName: "First National Bank (FNB)",
          accountNumber: "74520987654",
          branchCode: "250655",
          accountType: "money_market",
          currency: "ZAR",
          openingBalance: "0.00",
          currentBalance: "0.00",
          chartAccountId: moneyMarketAccount?.id,
          isActive: true,
          notes: "High yield money market account"
        },
        {
          companyId,
          accountName: "Nedbank Money Market Account",
          bankName: "Nedbank",
          accountNumber: "11985678901",
          branchCode: "198765",
          accountType: "money_market",
          currency: "ZAR",
          openingBalance: "0.00",
          currentBalance: "0.00",
          chartAccountId: moneyMarketAccount?.id,
          isActive: true,
          notes: "Nedbank money market investment"
        },
        {
          companyId,
          accountName: "ABSA Investment Account",
          bankName: "ABSA Bank",
          accountNumber: "40489876543",
          branchCode: "632005",
          accountType: "investment",
          currency: "ZAR",
          openingBalance: "0.00",
          currentBalance: "0.00",
          chartAccountId: savingsAccount?.id,
          isActive: true,
          notes: "ABSA investment and savings account"
        }
      ];

      // Insert default bank accounts
      for (const bank of defaultBanks) {
        try {
          await db.insert(bankAccounts).values(bank).onConflictDoNothing();
        } catch (error) {
          console.log(`Skipping duplicate bank: ${bank.accountName}`);
        }
      }
    }
  }

  // Journal Entries
  async getAllJournalEntries(companyId: number): Promise<JournalEntryWithLines[]> {
    const entries = await db.select().from(journalEntries)
      .where(eq(journalEntries.companyId, companyId))
      .orderBy(desc(journalEntries.transactionDate));

    return await Promise.all(entries.map(async (entry) => {
      const lines = await db.select().from(journalEntryLines)
        .where(eq(journalEntryLines.journalEntryId, entry.id));
      return { ...entry, lines };
    }));
  }

  async getJournalEntry(id: number): Promise<JournalEntryWithLines | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    if (!entry) return undefined;

    const lines = await db.select().from(journalEntryLines)
      .where(eq(journalEntryLines.journalEntryId, entry.id));
    return { ...entry, lines };
  }

  async createJournalEntry(entry: InsertJournalEntry, lines: Omit<InsertJournalEntryLine, 'journalEntryId'>[]): Promise<JournalEntryWithLines> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    
    const entryLines = await Promise.all(
      lines.map(line => 
        db.insert(journalEntryLines)
          .values({ ...line, journalEntryId: newEntry.id })
          .returning()
          .then(([insertedLine]) => insertedLine)
      )
    );

    return { ...newEntry, lines: entryLines };
  }

  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [updated] = await db
      .update(journalEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return updated || undefined;
  }

  async postJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [posted] = await db
      .update(journalEntries)
      .set({ isPosted: true, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return posted || undefined;
  }

  async reverseJournalEntry(id: number, description: string, createdBy: number): Promise<JournalEntryWithLines> {
    const originalEntry = await this.getJournalEntry(id);
    if (!originalEntry) throw new Error("Journal entry not found");

    // Create reversal entry
    const reversalEntry: InsertJournalEntry = {
      companyId: originalEntry.companyId,
      entryNumber: `REV-${originalEntry.entryNumber}`,
      transactionDate: new Date(),
      description,
      reference: `Reversal of ${originalEntry.entryNumber}`,
      totalDebit: originalEntry.totalCredit,
      totalCredit: originalEntry.totalDebit,
      createdBy,
      sourceModule: 'reversal',
      sourceId: originalEntry.id,
    };

    // Reverse the line items (swap debit/credit)
    const reversalLines = originalEntry.lines.map(line => ({
      accountId: line.accountId,
      description: `Reversal: ${line.description}`,
      debitAmount: line.creditAmount,
      creditAmount: line.debitAmount,
      reference: line.reference,
    }));

    const newEntry = await this.createJournalEntry(reversalEntry, reversalLines);
    
    // Mark original as reversed
    await db.update(journalEntries)
      .set({ isReversed: true, reversalEntryId: newEntry.id })
      .where(eq(journalEntries.id, id));

    return newEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    // Delete lines first
    await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, id));
    // Delete entry
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async calculateAccountBalance(accountId: number, asOfDate?: Date): Promise<string> {
    const account = await this.getChartOfAccount(accountId);
    if (!account) return "0.00";

    let query = db
      .select({
        debitTotal: sql<string>`COALESCE(SUM(${journalEntryLines.debitAmount}), 0)`,
        creditTotal: sql<string>`COALESCE(SUM(${journalEntryLines.creditAmount}), 0)`,
      })
      .from(journalEntryLines)
      .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
      .where(
        and(
          eq(journalEntryLines.accountId, accountId),
          eq(journalEntries.isPosted, true)
        )
      );

    if (asOfDate) {
      query = query.where(lte(journalEntries.transactionDate, asOfDate));
    }

    const [result] = await query;
    const debitTotal = parseFloat(result?.debitTotal || "0");
    const creditTotal = parseFloat(result?.creditTotal || "0");

    let balance: number;
    if (account.normalBalance === "Debit") {
      balance = debitTotal - creditTotal;
    } else {
      balance = creditTotal - debitTotal;
    }

    return balance.toFixed(2);
  }

  // Banking Implementation
  async getAllBankAccounts(companyId: number): Promise<BankAccountWithTransactions[]> {
    const accounts = await db.select().from(bankAccounts)
      .where(and(eq(bankAccounts.companyId, companyId), eq(bankAccounts.isActive, true)))
      .orderBy(bankAccounts.accountName);
    
    return await Promise.all(accounts.map(async (account) => {
      const transactions = await db.select().from(bankTransactions)
        .where(eq(bankTransactions.bankAccountId, account.id))
        .orderBy(desc(bankTransactions.transactionDate))
        .limit(10);
      
      let chartAccount;
      if (account.chartAccountId) {
        chartAccount = await this.getChartOfAccount(account.chartAccountId);
      }
      
      return { ...account, transactions, chartAccount };
    }));
  }

  async getBankAccount(id: number): Promise<BankAccountWithTransactions | undefined> {
    const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
    if (!account) return undefined;
    
    const transactions = await db.select().from(bankTransactions)
      .where(eq(bankTransactions.bankAccountId, id))
      .orderBy(desc(bankTransactions.transactionDate));
    
    let chartAccount;
    if (account.chartAccountId) {
      chartAccount = await this.getChartOfAccount(account.chartAccountId);
    }
    
    return { ...account, transactions, chartAccount };
  }

  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const [newAccount] = await db.insert(bankAccounts).values(account).returning();
    return newAccount;
  }

  async updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const [updated] = await db
      .update(bankAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(bankAccounts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBankAccount(id: number): Promise<boolean> {
    const result = await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllBankTransactions(companyId: number, bankAccountId?: number): Promise<BankTransaction[]> {
    let query = db.select().from(bankTransactions).where(eq(bankTransactions.companyId, companyId));
    
    if (bankAccountId) {
      query = query.where(eq(bankTransactions.bankAccountId, bankAccountId));
    }
    
    return await query.orderBy(desc(bankTransactions.transactionDate));
  }

  async createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction> {
    const [newTransaction] = await db.insert(bankTransactions).values(transaction).returning();
    
    // Update bank account balance
    const account = await this.getBankAccount(transaction.bankAccountId);
    if (account) {
      const newBalance = transaction.transactionType === 'credit' 
        ? parseFloat(account.currentBalance) + parseFloat(transaction.amount.toString())
        : parseFloat(account.currentBalance) - parseFloat(transaction.amount.toString());
      
      await this.updateBankAccount(transaction.bankAccountId, {
        currentBalance: newBalance.toString()
      });
    }
    
    return newTransaction;
  }

  async updateBankTransaction(id: number, transaction: Partial<InsertBankTransaction>): Promise<BankTransaction | undefined> {
    const [updated] = await db
      .update(bankTransactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(bankTransactions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBankTransaction(id: number): Promise<boolean> {
    const result = await db.delete(bankTransactions).where(eq(bankTransactions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // General Ledger Implementation
  async getGeneralLedger(companyId: number, accountId?: number, startDate?: Date, endDate?: Date): Promise<GeneralLedgerEntry[]> {
    let query = db
      .select({
        id: journalEntryLines.id,
        transactionDate: journalEntries.transactionDate,
        accountCode: chartOfAccounts.accountCode,
        accountName: chartOfAccounts.accountName,
        description: journalEntryLines.description,
        reference: journalEntryLines.reference,
        debitAmount: journalEntryLines.debitAmount,
        creditAmount: journalEntryLines.creditAmount,
        entryNumber: journalEntries.entryNumber,
        sourceModule: journalEntries.sourceModule,
      })
      .from(journalEntryLines)
      .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
      .innerJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
      .where(
        and(
          eq(chartOfAccounts.companyId, companyId),
          eq(journalEntries.isPosted, true)
        )
      );

    if (accountId) {
      query = query.where(eq(journalEntryLines.accountId, accountId));
    }

    if (startDate) {
      query = query.where(gte(journalEntries.transactionDate, startDate));
    }

    if (endDate) {
      query = query.where(lte(journalEntries.transactionDate, endDate));
    }

    const results = await query.orderBy(
      journalEntries.transactionDate,
      chartOfAccounts.accountCode,
      journalEntries.entryNumber
    );

    // Calculate running balances
    let runningBalance = 0;
    return results.map((row) => {
      const debitAmount = parseFloat(row.debitAmount || "0");
      const creditAmount = parseFloat(row.creditAmount || "0");
      runningBalance += debitAmount - creditAmount;
      
      return {
        id: row.id,
        transactionDate: row.transactionDate,
        accountCode: row.accountCode,
        accountName: row.accountName,
        description: row.description || "",
        reference: row.reference || undefined,
        debitAmount: row.debitAmount,
        creditAmount: row.creditAmount,
        runningBalance: runningBalance.toFixed(2),
        entryNumber: row.entryNumber,
        sourceModule: row.sourceModule || undefined,
      };
    });
  }

  async syncGeneralLedgerFromJournalEntries(companyId: number): Promise<void> {
    // Clear existing GL entries for the company
    await db.delete(generalLedger).where(eq(generalLedger.companyId, companyId));

    // Get all posted journal entries with their lines
    const entries = await db
      .select({
        entryId: journalEntries.id,
        lineId: journalEntryLines.id,
        accountId: journalEntryLines.accountId,
        transactionDate: journalEntries.transactionDate,
        entryNumber: journalEntries.entryNumber,
        description: journalEntryLines.description,
        reference: journalEntryLines.reference,
        debitAmount: journalEntryLines.debitAmount,
        creditAmount: journalEntryLines.creditAmount,
        sourceModule: journalEntries.sourceModule,
        sourceId: journalEntries.sourceId,
      })
      .from(journalEntries)
      .innerJoin(journalEntryLines, eq(journalEntries.id, journalEntryLines.journalEntryId))
      .where(
        and(
          eq(journalEntries.companyId, companyId),
          eq(journalEntries.isPosted, true)
        )
      )
      .orderBy(journalEntries.transactionDate, journalEntries.entryNumber);

    // Calculate running balances by account
    const accountBalances: Record<number, number> = {};
    const glEntries = entries.map((entry) => {
      const debitAmount = parseFloat(entry.debitAmount || "0");
      const creditAmount = parseFloat(entry.creditAmount || "0");
      
      if (!accountBalances[entry.accountId]) {
        accountBalances[entry.accountId] = 0;
      }
      
      accountBalances[entry.accountId] += debitAmount - creditAmount;

      return {
        companyId,
        accountId: entry.accountId,
        journalEntryId: entry.entryId,
        journalEntryLineId: entry.lineId,
        transactionDate: entry.transactionDate,
        entryNumber: entry.entryNumber,
        description: entry.description || "",
        reference: entry.reference,
        debitAmount: entry.debitAmount,
        creditAmount: entry.creditAmount,
        runningBalance: accountBalances[entry.accountId].toFixed(2),
        sourceModule: entry.sourceModule,
        sourceId: entry.sourceId,
      };
    });

    // Batch insert GL entries
    if (glEntries.length > 0) {
      await db.insert(generalLedger).values(glEntries);
    }
  }

  async getAccountBalanceReport(companyId: number, periodStart: Date, periodEnd: Date): Promise<AccountBalanceReport[]> {
    const accounts = await db.select().from(chartOfAccounts)
      .where(and(eq(chartOfAccounts.companyId, companyId), eq(chartOfAccounts.isActive, true)))
      .orderBy(chartOfAccounts.accountCode);

    return await Promise.all(accounts.map(async (account) => {
      const balance = await this.calculateAccountBalance(account.id, periodEnd);
      return {
        accountId: account.id,
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        openingBalance: "0.00", // TODO: Calculate opening balance
        debitTotal: "0.00", // TODO: Calculate period debits
        creditTotal: "0.00", // TODO: Calculate period credits
        closingBalance: balance,
      };
    }));
  }

  async updateAccountBalances(companyId: number, periodStart: Date, periodEnd: Date): Promise<void> {
    // This would typically be run as a scheduled job
    // Implementation would calculate and store period balances for performance
  }

  async getTrialBalance(companyId: number, asOfDate: Date): Promise<AccountBalanceReport[]> {
    return this.getAccountBalanceReport(companyId, new Date(asOfDate.getFullYear(), 0, 1), asOfDate);
  }

  // Automated Journal Entries
  async createInvoiceJournalEntry(invoiceId: number): Promise<JournalEntryWithLines> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    // Get the appropriate revenue and receivables accounts
    const revenueAccount = await this.getChartOfAccountByCode(invoice.companyId, "4010"); // Sales Revenue
    const receivablesAccount = await this.getChartOfAccountByCode(invoice.companyId, "1100"); // Accounts Receivable
    const vatAccount = await this.getChartOfAccountByCode(invoice.companyId, "2020"); // VAT Output Tax

    if (!revenueAccount || !receivablesAccount || !vatAccount) {
      throw new Error("Required accounts not found for invoice journal entry");
    }

    const entry: InsertJournalEntry = {
      companyId: invoice.companyId,
      entryNumber: `INV-${invoice.invoiceNumber}`,
      transactionDate: invoice.issueDate,
      description: `Sale to ${invoice.customer.name}`,
      reference: invoice.invoiceNumber,
      totalDebit: invoice.total,
      totalCredit: invoice.total,
      sourceModule: 'invoice',
      sourceId: invoice.id,
      createdBy: 1, // System user
    };

    const lines = [
      {
        accountId: receivablesAccount.id,
        description: `Invoice ${invoice.invoiceNumber}`,
        debitAmount: invoice.total,
        creditAmount: "0.00",
        reference: invoice.invoiceNumber,
      },
      {
        accountId: revenueAccount.id,
        description: `Sale to ${invoice.customer.name}`,
        debitAmount: "0.00",
        creditAmount: invoice.subtotal,
        reference: invoice.invoiceNumber,
      },
      {
        accountId: vatAccount.id,
        description: `VAT on Invoice ${invoice.invoiceNumber}`,
        debitAmount: "0.00",
        creditAmount: invoice.vatAmount,
        reference: invoice.invoiceNumber,
      },
    ];

    return this.createJournalEntry(entry, lines);
  }

  async createPaymentJournalEntry(paymentId: number): Promise<JournalEntryWithLines> {
    const payment = await db.select().from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(payments.id, paymentId));

    if (!payment.length) throw new Error("Payment not found");

    const paymentData = payment[0];
    const bankAccount = await this.getChartOfAccountByCode(paymentData.invoices.companyId, "1010"); // Bank Account
    const receivablesAccount = await this.getChartOfAccountByCode(paymentData.invoices.companyId, "1100"); // Accounts Receivable

    if (!bankAccount || !receivablesAccount) {
      throw new Error("Required accounts not found for payment journal entry");
    }

    const entry: InsertJournalEntry = {
      companyId: paymentData.invoices.companyId,
      entryNumber: `PAY-${paymentData.payments.id}`,
      transactionDate: paymentData.payments.paymentDate,
      description: `Payment from ${paymentData.customers.name}`,
      reference: paymentData.payments.reference || '',
      totalDebit: paymentData.payments.amount,
      totalCredit: paymentData.payments.amount,
      sourceModule: 'payment',
      sourceId: paymentData.payments.id,
      createdBy: 1, // System user
    };

    const lines = [
      {
        accountId: bankAccount.id,
        description: `Payment for Invoice ${paymentData.invoices.invoiceNumber}`,
        debitAmount: paymentData.payments.amount,
        creditAmount: "0.00",
        reference: paymentData.payments.reference || '',
      },
      {
        accountId: receivablesAccount.id,
        description: `Payment from ${paymentData.customers.name}`,
        debitAmount: "0.00",
        creditAmount: paymentData.payments.amount,
        reference: paymentData.payments.reference || '',
      },
    ];

    return this.createJournalEntry(entry, lines);
  }

  async createExpenseJournalEntry(expenseId: number): Promise<JournalEntryWithLines> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, expenseId));
    if (!expense) throw new Error("Expense not found");

    // Map expense category to account
    let expenseAccountCode = "6090"; // Default to Office Supplies
    if (expense.category === "Utilities") expenseAccountCode = "6030";
    else if (expense.category === "Rent") expenseAccountCode = "6020";
    else if (expense.category === "Marketing") expenseAccountCode = "6070";

    const expenseAccount = await this.getChartOfAccountByCode(expense.companyId, expenseAccountCode);
    const bankAccount = await this.getChartOfAccountByCode(expense.companyId, "1010"); // Bank Account
    const vatInputAccount = await this.getChartOfAccountByCode(expense.companyId, "1400"); // VAT Input Tax

    if (!expenseAccount || !bankAccount || !vatInputAccount) {
      throw new Error("Required accounts not found for expense journal entry");
    }

    const entry: InsertJournalEntry = {
      companyId: expense.companyId,
      entryNumber: `EXP-${expense.id}`,
      transactionDate: expense.expenseDate,
      description: expense.description,
      reference: `Expense-${expense.id}`,
      totalDebit: expense.amount,
      totalCredit: expense.amount,
      sourceModule: 'expense',
      sourceId: expense.id,
      createdBy: 1, // System user
    };

    const netAmount = (parseFloat(expense.amount) - parseFloat(expense.vatAmount)).toFixed(2);
    const lines = [
      {
        accountId: expenseAccount.id,
        description: expense.description,
        debitAmount: netAmount,
        creditAmount: "0.00",
        reference: `Expense-${expense.id}`,
      },
      {
        accountId: vatInputAccount.id,
        description: `VAT on ${expense.description}`,
        debitAmount: expense.vatAmount,
        creditAmount: "0.00",
        reference: `Expense-${expense.id}`,
      },
      {
        accountId: bankAccount.id,
        description: `Payment for ${expense.description}`,
        debitAmount: "0.00",
        creditAmount: expense.amount,
        reference: `Expense-${expense.id}`,
      },
    ];

    return this.createJournalEntry(entry, lines);
  }

  // Companies
  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.id));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany, userId?: number): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();

    // Initialize company with clean data and essential setup
    await this.initializeNewCompany(company.id, company.industry || 'general', userId || 1);

    return company;
  }

  // Initialize a new company with clean data and essential configurations
  async initializeNewCompany(companyId: number, industryCode: string, userId: number): Promise<void> {
    try {
      // 1. Initialize Chart of Accounts based on industry template
      if (industryCode && industryCode !== 'general') {
        await this.activateIndustryChartOfAccounts(companyId, industryCode, userId);
      } else {
        await this.activateBasicChartOfAccounts(companyId, userId);
      }

      // 2. Initialize VAT types for the company
      await this.initializeCompanyVatTypes(companyId);

      // 3. Initialize company settings with defaults
      await this.initializeCompanySettings(companyId);

      // 4. Create initial bank account
      await this.createDefaultBankAccount(companyId);

      console.log(`✓ New company ${companyId} initialized with clean data and essential configurations`);
    } catch (error) {
      console.error(`Error initializing company ${companyId}:`, error);
      throw error;
    }
  }

  // Initialize VAT types for a new company
  async initializeCompanyVatTypes(companyId: number): Promise<void> {
    try {
      // Get all system VAT types
      const systemVatTypes = await db
        .select()
        .from(vatTypes)
        .where(eq(vatTypes.isSystemType, true));

      // Create company-specific VAT types based on system defaults
      const companyVatTypes = systemVatTypes.map(vatType => ({
        companyId,
        code: vatType.code,
        name: vatType.name,
        rate: vatType.rate,
        description: vatType.description,
        isSystemType: false, // Company-specific copy
        isActive: true,
      }));

      if (companyVatTypes.length > 0) {
        await db.insert(vatTypes).values(companyVatTypes).onConflictDoNothing();
        console.log(`✓ Initialized ${companyVatTypes.length} VAT types for company ${companyId}`);
      }
    } catch (error) {
      console.error(`Error initializing VAT types for company ${companyId}:`, error);
      // Don't throw - VAT types can be set up later if needed
    }
  }

  // Initialize company settings with safe defaults
  async initializeCompanySettings(companyId: number): Promise<void> {
    try {
      const defaultSettings = {
        companyId,
        companyName: '', // Will be filled from company data
        fiscalYearStart: '01-01',
        baseCurrency: 'ZAR',
        emailNotifications: true,
        smsNotifications: false,
        autoBackup: true,
        vatSubmissionFrequency: 'monthly',
        vatSubmissionDate: '01',
        companyType: 'private',
        enableMultiCurrency: false,
        defaultPaymentTerms: 30,
        enableInventoryTracking: true,
        enableProjectTracking: false,
      };

      await db.insert(companySettings).values(defaultSettings).onConflictDoNothing();
      console.log(`✓ Initialized default settings for company ${companyId}`);
    } catch (error) {
      console.error(`Error initializing settings for company ${companyId}:`, error);
      // Don't throw - settings can be configured later
    }
  }

  // Create a default bank account for the new company
  async createDefaultBankAccount(companyId: number): Promise<void> {
    try {
      const defaultBankAccount = {
        companyId,
        accountName: 'Primary Bank Account',
        bankName: '',
        accountNumber: '',
        branchCode: '',
        accountType: 'cheque' as const,
        balance: '0.00',
        currency: 'ZAR',
        isActive: true,
      };

      await db.insert(bankAccounts).values(defaultBankAccount);
      console.log(`✓ Created default bank account for company ${companyId}`);
    } catch (error) {
      console.error(`Error creating default bank account for company ${companyId}:`, error);
      // Don't throw - bank account can be set up later
    }
  }

  async updateCompany(id: number, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }

  // Industry-specific Chart of Accounts activation
  async activateIndustryChartOfAccounts(companyId: number, industryCode: string, userId: number): Promise<void> {
    // Get the industry template
    const [template] = await db
      .select()
      .from(industryTemplates)
      .where(eq(industryTemplates.industryCode, industryCode));

    if (!template) {
      // Fallback to basic accounts if template not found
      await this.activateBasicChartOfAccounts(companyId, userId);
      return;
    }

    // Get account codes from template
    const accountCodes = template.accountCodes as string[];
    
    // Get all Chart of Accounts that match the industry template
    const accountsToActivate = await db
      .select()
      .from(chartOfAccounts)
      .where(inArray(chartOfAccounts.accountCode, accountCodes));

    // Activate accounts for the company
    const companyAccounts = accountsToActivate.map(account => ({
      companyId,
      accountId: account.id,
      isActive: true,
      activatedBy: userId,
    }));

    if (companyAccounts.length > 0) {
      await db
        .insert(companyChartOfAccounts)
        .values(companyAccounts)
        .onConflictDoUpdate({
          target: [companyChartOfAccounts.companyId, companyChartOfAccounts.accountId],
          set: {
            isActive: true,
            activatedAt: sql`now()`,
            activatedBy: sql.placeholder('activatedBy'),
            deactivatedAt: null,
            deactivatedBy: null,
          },
        });
    }
  }

  async activateBasicChartOfAccounts(companyId: number, userId: number): Promise<void> {
    // Basic accounts for general business
    const basicAccountCodes = [
      '1000', '1100', '1200', // Assets
      '2000', '2100', '2200', // Liabilities  
      '3000', '3100', // Equity
      '4000', '4100', // Revenue
      '6000', '6100', '6200', '6300', // Expenses
      '7000', '7100' // Extraordinary Items
    ];

    const accountsToActivate = await db
      .select()
      .from(chartOfAccounts)
      .where(inArray(chartOfAccounts.accountCode, basicAccountCodes));

    const companyAccounts = accountsToActivate.map(account => ({
      companyId,
      accountId: account.id,
      isActive: true,
      activatedBy: userId,
    }));

    if (companyAccounts.length > 0) {
      await db
        .insert(companyChartOfAccounts)
        .values(companyAccounts)
        .onConflictDoUpdate({
          target: [companyChartOfAccounts.companyId, companyChartOfAccounts.accountId],
          set: {
            isActive: true,
            activatedAt: sql`now()`,
            activatedBy: sql.placeholder('activatedBy'),
            deactivatedAt: null,
            deactivatedBy: null,
          },
        });
    }
  }

  // Get industry templates
  async getIndustryTemplates(): Promise<IndustryTemplate[]> {
    return await db
      .select()
      .from(industryTemplates)
      .where(eq(industryTemplates.isActive, true))
      .orderBy(industryTemplates.industryName);
  }

  // Company Management Methods
  async getUserCompanies(userId: number): Promise<any[]> {
    const results = await db
      .select({
        id: companyUsers.id,
        companyId: companyUsers.companyId,
        userId: companyUsers.userId,
        role: companyUsers.role,
        company: {
          id: companies.id,
          name: companies.name,
          displayName: companies.displayName,
          industry: companies.industry,
        }
      })
      .from(companyUsers)
      .innerJoin(companies, eq(companyUsers.companyId, companies.id))
      .where(eq(companyUsers.userId, userId))
      .orderBy(companies.name);
    
    return results;
  }

  async getUserActiveCompany(userId: number): Promise<Company | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user || !user.activeCompanyId) {
      // If no active company set, get the first company the user has access to
      const userCompanies = await this.getUserCompanies(userId);
      if (userCompanies.length > 0) {
        const firstCompany = userCompanies[0].company;
        await this.setUserActiveCompany(userId, firstCompany.id);
        return firstCompany;
      }
      return undefined;
    }

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, user.activeCompanyId));
    
    return company || undefined;
  }

  async setUserActiveCompany(userId: number, companyId: number): Promise<void> {
    await db
      .update(users)
      .set({ activeCompanyId: companyId })
      .where(eq(users.id, userId));
  }

  async addUserToCompany(userId: number, companyId: number, role: string): Promise<any> {
    const result = await db
      .insert(companyUsers)
      .values({
        userId,
        companyId,
        role,
      })
      .onConflictDoUpdate({
        target: [companyUsers.companyId, companyUsers.userId],
        set: { role },
      })
      .returning();
    
    return result[0];
  }

  async getCompanyUsers(companyId: number): Promise<any[]> {
    const results = await db
      .select({
        id: companyUsers.id,
        userId: companyUsers.userId,
        companyId: companyUsers.companyId,
        role: companyUsers.role,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          isActive: users.isActive,
        }
      })
      .from(companyUsers)
      .innerJoin(users, eq(companyUsers.userId, users.id))
      .where(eq(companyUsers.companyId, companyId))
      .orderBy(users.name);
    
    return results;
  }

  async updateUserCompanyRole(userId: number, companyId: number, role: string): Promise<any> {
    const result = await db
      .update(companyUsers)
      .set({ role })
      .where(and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, companyId)
      ))
      .returning();
    
    return result[0];
  }

  async removeUserFromCompany(userId: number, companyId: number): Promise<void> {
    await db
      .delete(companyUsers)
      .where(and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, companyId)
      ));
  }

  // Get active accounts for a company
  async getCompanyChartOfAccounts(companyId: number): Promise<(ChartOfAccount & { isActivated: boolean })[]> {
    const activeAccountIds = await db
      .select({ accountId: companyChartOfAccounts.accountId })
      .from(companyChartOfAccounts)
      .where(
        and(
          eq(companyChartOfAccounts.companyId, companyId),
          eq(companyChartOfAccounts.isActive, true)
        )
      );

    const activeIds = activeAccountIds.map(row => row.accountId);

    // Get all accounts and mark which ones are activated
    const allAccounts = await db
      .select()
      .from(chartOfAccounts)
      .orderBy(chartOfAccounts.accountCode);

    return allAccounts.map(account => ({
      ...account,
      isActivated: activeIds.includes(account.id),
    }));
  }

  // Toggle account activation for a company
  async toggleAccountActivation(companyId: number, accountId: number, userId: number): Promise<boolean> {
    // Check if account is currently active
    const [existing] = await db
      .select()
      .from(companyChartOfAccounts)
      .where(
        and(
          eq(companyChartOfAccounts.companyId, companyId),
          eq(companyChartOfAccounts.accountId, accountId)
        )
      );

    if (existing) {
      // Toggle existing record
      const newState = !existing.isActive;
      await db
        .update(companyChartOfAccounts)
        .set({
          isActive: newState,
          ...(newState 
            ? { activatedAt: sql`now()`, activatedBy: userId, deactivatedAt: null, deactivatedBy: null }
            : { deactivatedAt: sql`now()`, deactivatedBy: userId }
          ),
        })
        .where(
          and(
            eq(companyChartOfAccounts.companyId, companyId),
            eq(companyChartOfAccounts.accountId, accountId)
          )
        );
      return newState;
    } else {
      // Create new active record
      await db
        .insert(companyChartOfAccounts)
        .values({
          companyId,
          accountId,
          isActive: true,
          activatedBy: userId,
        });
      return true;
    }
  }

  // Banking Methods
  async getAllBankAccounts(companyId: number): Promise<BankAccountWithTransactions[]> {
    const accounts = await db
      .select({
        bank_accounts: bankAccounts,
        chart_of_accounts: chartOfAccounts
      })
      .from(bankAccounts)
      .leftJoin(chartOfAccounts, eq(bankAccounts.chartAccountId, chartOfAccounts.id))
      .where(eq(bankAccounts.companyId, companyId));

    // Get transactions for each account
    const accountsWithTransactions = await Promise.all(
      accounts.map(async (row) => {
        const account = row.bank_accounts;
        const chartAccount = row.chart_of_accounts;
        
        const transactions = await db
          .select()
          .from(bankTransactions)
          .where(eq(bankTransactions.bankAccountId, account.id))
          .orderBy(desc(bankTransactions.transactionDate))
          .limit(10);

        return {
          ...account,
          chartAccount: chartAccount || null,
          transactions: transactions || []
        };
      })
    );

    return accountsWithTransactions;
  }

  async getBankAccount(id: number): Promise<BankAccount | undefined> {
    const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
    return account;
  }

  async createBankAccount(data: InsertBankAccount): Promise<BankAccount> {
    const [account] = await db.insert(bankAccounts).values(data).returning();
    return account;
  }

  async updateBankAccount(id: number, data: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const [account] = await db
      .update(bankAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bankAccounts.id, id))
      .returning();
    return account;
  }

  async deleteBankAccount(id: number): Promise<boolean> {
    const result = await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
    return result.rowCount > 0;
  }

  async getAllBankTransactions(companyId: number, bankAccountId?: number): Promise<BankTransaction[]> {
    let query = db.select().from(bankTransactions).where(eq(bankTransactions.companyId, companyId));
    
    if (bankAccountId) {
      query = query.where(eq(bankTransactions.bankAccountId, bankAccountId));
    }
    
    return query.orderBy(desc(bankTransactions.transactionDate));
  }

  async createBankTransaction(data: InsertBankTransaction): Promise<BankTransaction> {
    const [transaction] = await db.insert(bankTransactions).values(data).returning();

    // Update bank account balance
    const account = await this.getBankAccount(data.bankAccountId);
    if (account) {
      const currentBalance = parseFloat(account.currentBalance);
      const transactionAmount = parseFloat(data.amount);
      const newBalance = data.transactionType === 'credit' 
        ? currentBalance + transactionAmount 
        : currentBalance - transactionAmount;

      await this.updateBankAccount(data.bankAccountId, { 
        currentBalance: newBalance.toFixed(2) 
      });
    }

    return transaction;
  }

  // General Ledger Methods
  async getGeneralLedger(
    companyId: number, 
    accountId?: number, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<GeneralLedgerEntry[]> {
    let query = db
      .select({
        id: generalLedger.id,
        entryNumber: generalLedger.entryNumber,
        accountId: generalLedger.accountId,
        accountCode: generalLedger.accountCode,
        accountName: generalLedger.accountName,
        transactionDate: generalLedger.transactionDate,
        description: generalLedger.description,
        reference: generalLedger.reference,
        debitAmount: generalLedger.debitAmount,
        creditAmount: generalLedger.creditAmount,
        runningBalance: generalLedger.runningBalance,
        sourceModule: generalLedger.sourceModule,
        sourceId: generalLedger.sourceId,
        companyId: generalLedger.companyId,
        createdAt: generalLedger.createdAt,
      })
      .from(generalLedger)
      .where(eq(generalLedger.companyId, companyId));

    if (accountId) {
      query = query.where(eq(generalLedger.accountId, accountId));
    }

    if (startDate) {
      query = query.where(gte(generalLedger.transactionDate, startDate));
    }

    if (endDate) {
      query = query.where(lte(generalLedger.transactionDate, endDate));
    }

    return query.orderBy(
      generalLedger.transactionDate, 
      generalLedger.entryNumber, 
      generalLedger.id
    );
  }

  async syncGeneralLedgerFromJournalEntries(companyId: number): Promise<void> {
    // Clear existing GL entries for this company
    await db.delete(generalLedger).where(eq(generalLedger.companyId, companyId));

    // Get all posted journal entries with their lines
    const entries = await db
      .select()
      .from(journalEntries)
      .leftJoin(journalEntryLines, eq(journalEntries.id, journalEntryLines.journalEntryId))
      .leftJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
      .where(and(
        eq(journalEntries.companyId, companyId),
        eq(journalEntries.status, 'posted')
      ))
      .orderBy(journalEntries.entryDate, journalEntries.entryNumber);

    // Group by journal entry
    const entriesMap = new Map();
    for (const row of entries) {
      const entryId = row.journal_entries.id;
      if (!entriesMap.has(entryId)) {
        entriesMap.set(entryId, {
          entry: row.journal_entries,
          lines: []
        });
      }
      if (row.journal_entry_lines) {
        entriesMap.get(entryId).lines.push({
          ...row.journal_entry_lines,
          account: row.chart_of_accounts
        });
      }
    }

    // Create GL entries for each journal entry line
    const glEntries = [];
    for (const { entry, lines } of entriesMap.values()) {
      for (const line of lines) {
        glEntries.push({
          entryNumber: entry.entryNumber,
          accountId: line.accountId,
          accountCode: line.account.accountCode,
          accountName: line.account.accountName,
          transactionDate: entry.entryDate,
          description: entry.description,
          reference: entry.reference || null,
          debitAmount: line.debitAmount || "0.00",
          creditAmount: line.creditAmount || "0.00",
          runningBalance: "0.00", // Will calculate below
          sourceModule: "journal_entries",
          sourceId: entry.id.toString(),
          companyId: companyId,
        });
      }
    }

    // Insert GL entries
    if (glEntries.length > 0) {
      await db.insert(generalLedger).values(glEntries);

      // Calculate running balances
      await this.calculateRunningBalances(companyId);
    }
  }

  async calculateRunningBalances(companyId: number): Promise<void> {
    // Get all accounts with GL entries
    const accounts = await db
      .select({ accountId: generalLedger.accountId })
      .from(generalLedger)
      .where(eq(generalLedger.companyId, companyId))
      .groupBy(generalLedger.accountId);

    for (const { accountId } of accounts) {
      // Get entries for this account in chronological order
      const entries = await db
        .select()
        .from(generalLedger)
        .where(and(
          eq(generalLedger.companyId, companyId),
          eq(generalLedger.accountId, accountId)
        ))
        .orderBy(generalLedger.transactionDate, generalLedger.id);

      let runningBalance = 0;
      for (const entry of entries) {
        const debit = parseFloat(entry.debitAmount);
        const credit = parseFloat(entry.creditAmount);
        runningBalance += debit - credit;

        await db
          .update(generalLedger)
          .set({ runningBalance: runningBalance.toFixed(2) })
          .where(eq(generalLedger.id, entry.id));
      }
    }
  }

  // VAT Management
  async getVatTypes(companyId?: number): Promise<VatType[]> {
    return await db.select().from(vatTypes)
      .where(and(
        eq(vatTypes.isActive, true),
        companyId ? eq(vatTypes.companyId, companyId) : isNull(vatTypes.companyId)
      ))
      .orderBy(vatTypes.code);
  }

  async getVatType(id: number): Promise<VatType | undefined> {
    const [vatType] = await db.select().from(vatTypes).where(eq(vatTypes.id, id));
    return vatType || undefined;
  }

  async createVatType(data: InsertVatType): Promise<VatType> {
    const [vatType] = await db
      .insert(vatTypes)
      .values(data)
      .returning();
    return vatType;
  }

  async getVatReports(companyId: number): Promise<VatReport[]> {
    return await db.select().from(vatReports)
      .where(eq(vatReports.companyId, companyId))
      .orderBy(desc(vatReports.periodStart));
  }

  async getVatReport(id: number): Promise<VatReport | undefined> {
    const [vatReport] = await db.select().from(vatReports).where(eq(vatReports.id, id));
    return vatReport || undefined;
  }

  async createVatReport(data: InsertVatReport): Promise<VatReport> {
    const [vatReport] = await db
      .insert(vatReports)
      .values(data)
      .returning();
    return vatReport;
  }

  async updateVatReport(id: number, data: Partial<InsertVatReport>): Promise<VatReport | undefined> {
    const [vatReport] = await db
      .update(vatReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vatReports.id, id))
      .returning();
    return vatReport || undefined;
  }

  async getVatTransactions(companyId: number): Promise<VatTransaction[]> {
    return await db.select().from(vatTransactions)
      .where(eq(vatTransactions.companyId, companyId))
      .orderBy(desc(vatTransactions.transactionDate));
  }

  async createVatTransaction(data: InsertVatTransaction): Promise<VatTransaction> {
    const [vatTransaction] = await db
      .insert(vatTransactions)
      .values(data)
      .returning();
    return vatTransaction;
  }

  // Enhanced VAT Management System
  async updateCompanyVatSettings(companyId: number, vatSettings: {
    isVatRegistered: boolean;
    vatNumber?: string;
    vatRegistrationDate?: string;
    vatPeriodMonths?: number;
    vatSubmissionDay?: number;
  }): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({
        isVatRegistered: vatSettings.isVatRegistered,
        vatNumber: vatSettings.vatNumber,
        vatRegistrationDate: vatSettings.vatRegistrationDate,
        vatPeriodMonths: vatSettings.vatPeriodMonths,
        vatSubmissionDay: vatSettings.vatSubmissionDay,
        updatedAt: new Date()
      })
      .where(eq(companies.id, companyId))
      .returning();
      
    // Audit log for VAT settings change
    await this.createAuditLog({
      companyId,
      userId: 1, // System user - will need to be updated with actual user context
      action: "UPDATE",
      resource: "company_vat_settings",
      resourceId: companyId.toString(),
      oldValues: {},
      newValues: vatSettings,
      metadata: { feature: "vat_management" }
    });
    
    return company || undefined;
  }

  async getCompanyVatSettings(companyId: number): Promise<any> {
    const [company] = await db
      .select({
        isVatRegistered: companies.isVatRegistered,
        vatNumber: companies.vatNumber,
        vatRegistrationDate: companies.vatRegistrationDate,
        vatPeriodMonths: companies.vatPeriodMonths,
        vatSubmissionDay: companies.vatSubmissionDay
      })
      .from(companies)
      .where(eq(companies.id, companyId));
    
    return company || {
      isVatRegistered: false,
      vatNumber: null,
      vatRegistrationDate: null,
      vatPeriodMonths: 2,
      vatSubmissionDay: 25
    };
  }

  async getAvailableVatTypes(companyId: number): Promise<VatType[]> {
    const company = await this.getCompanyVatSettings(companyId);
    
    // If company is not VAT registered, return empty array
    if (!company.isVatRegistered) {
      return [];
    }

    // Get all active VAT types for this company (system + company-specific)
    const vatTypesResult = await db
      .select()
      .from(vatTypes)
      .where(
        and(
          eq(vatTypes.isActive, true),
          or(
            isNull(vatTypes.companyId), // System-wide types
            eq(vatTypes.companyId, companyId) // Company-specific types
          )
        )
      );
    
    return vatTypesResult;
  }

  async seedDefaultVatTypes(companyId?: number): Promise<void> {
    // Seed system-wide South African VAT types if they don't exist
    const existingSystemTypes = await db
      .select()
      .from(vatTypes)
      .where(isNull(vatTypes.companyId));
      
    if (existingSystemTypes.length === 0) {
      await db.insert(vatTypes).values(
        SOUTH_AFRICAN_VAT_TYPES.map(type => ({
          companyId: null,
          code: type.code,
          name: type.name,
          rate: type.rate,
          description: type.description,
          isActive: true,
          isSystemType: type.isSystemType
        }))
      );
    }
  }

  async manageCompanyVatType(companyId: number, vatTypeId: number, isActive: boolean): Promise<void> {
    // Only allow activation/deactivation of company-specific types
    // System types cannot be deactivated
    const [vatType] = await db
      .select()
      .from(vatTypes)
      .where(eq(vatTypes.id, vatTypeId));
      
    if (!vatType || vatType.isSystemType) {
      throw new Error("Cannot modify system VAT types");
    }
    
    if (vatType.companyId !== companyId) {
      throw new Error("Cannot modify VAT types of other companies");
    }

    await db.update(vatTypes)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(eq(vatTypes.id, vatTypeId));
      
    // Audit log
    await this.createAuditLog({
      companyId,
      userId: 1,
      action: isActive ? "ACTIVATE" : "DEACTIVATE",
      resource: "vat_type",
      resourceId: vatTypeId.toString(),
      oldValues: { isActive: !isActive },
      newValues: { isActive },
      metadata: { vatTypeCode: vatType.code }
    });
  }

  // Fixed Assets Management
  async getFixedAssets(companyId: number): Promise<FixedAsset[]> {
    return await db.select().from(fixedAssets)
      .where(eq(fixedAssets.companyId, companyId))
      .orderBy(fixedAssets.assetName);
  }

  async getFixedAsset(id: number): Promise<FixedAsset | undefined> {
    const [asset] = await db.select().from(fixedAssets).where(eq(fixedAssets.id, id));
    return asset || undefined;
  }

  async createFixedAsset(data: InsertFixedAsset): Promise<FixedAsset> {
    const [asset] = await db
      .insert(fixedAssets)
      .values(data)
      .returning();
    return asset;
  }

  async updateFixedAsset(id: number, data: Partial<InsertFixedAsset>): Promise<FixedAsset | undefined> {
    const [updatedAsset] = await db
      .update(fixedAssets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fixedAssets.id, id))
      .returning();
    return updatedAsset || undefined;
  }

  async deleteFixedAsset(id: number): Promise<boolean> {
    const result = await db.delete(fixedAssets).where(eq(fixedAssets.id, id));
    return result.rowCount > 0;
  }

  async getDepreciationRecords(assetId: number): Promise<DepreciationRecord[]> {
    return await db.select().from(depreciationRecords)
      .where(eq(depreciationRecords.assetId, assetId))
      .orderBy(depreciationRecords.period);
  }

  async createDepreciationRecord(data: InsertDepreciationRecord): Promise<DepreciationRecord> {
    const [record] = await db
      .insert(depreciationRecords)
      .values(data)
      .returning();
    return record;
  }

  async calculateDepreciation(assetId: number, period: string): Promise<void> {
    const asset = await this.getFixedAsset(assetId);
    if (!asset) return;

    const depreciableAmount = parseFloat(asset.purchasePrice) - parseFloat(asset.residualValue);
    const monthlyDepreciation = depreciableAmount / (asset.usefulLife * 12);
    
    // Get previous accumulated depreciation
    const previousRecords = await db.select().from(depreciationRecords)
      .where(and(
        eq(depreciationRecords.assetId, assetId),
        sql`${depreciationRecords.period} < ${period}`
      ))
      .orderBy(desc(depreciationRecords.period));

    const accumulatedDepreciation = previousRecords.length > 0 
      ? parseFloat(previousRecords[0].accumulatedDepreciation) + monthlyDepreciation
      : monthlyDepreciation;

    const bookValue = parseFloat(asset.currentValue) - accumulatedDepreciation;

    await this.createDepreciationRecord({
      companyId: asset.companyId,
      assetId: assetId,
      period: period,
      depreciationAmount: monthlyDepreciation.toFixed(2),
      accumulatedDepreciation: accumulatedDepreciation.toFixed(2),
      bookValue: Math.max(bookValue, parseFloat(asset.residualValue)).toFixed(2)
    });
  }

  // Budgeting
  async getBudgets(companyId: number): Promise<Budget[]> {
    return await db.select().from(budgets)
      .where(eq(budgets.companyId, companyId))
      .orderBy(desc(budgets.startDate));
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget || undefined;
  }

  async createBudget(data: InsertBudget): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values(data)
      .returning();
    return budget;
  }

  async updateBudget(id: number, data: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [updatedBudget] = await db
      .update(budgets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgets.id, id))
      .returning();
    return updatedBudget || undefined;
  }

  async deleteBudget(id: number): Promise<boolean> {
    const result = await db.delete(budgets).where(eq(budgets.id, id));
    return result.rowCount > 0;
  }

  async getBudgetLines(budgetId: number): Promise<BudgetLine[]> {
    return await db.select().from(budgetLines)
      .where(eq(budgetLines.budgetId, budgetId))
      .orderBy(budgetLines.category);
  }

  async createBudgetLine(data: InsertBudgetLine): Promise<BudgetLine> {
    const [budgetLine] = await db
      .insert(budgetLines)
      .values(data)
      .returning();
    return budgetLine;
  }

  async updateBudgetLine(id: number, data: Partial<InsertBudgetLine>): Promise<BudgetLine | undefined> {
    const [updatedLine] = await db
      .update(budgetLines)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgetLines.id, id))
      .returning();
    return updatedLine || undefined;
  }

  async deleteBudgetLine(id: number): Promise<boolean> {
    const result = await db.delete(budgetLines).where(eq(budgetLines.id, id));
    return result.rowCount > 0;
  }

  async updateBudgetActuals(companyId: number, period: string): Promise<void> {
    // Update budget actuals based on journal entries for the period
    const periodStart = new Date(period + '-01');
    const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);

    const budgetLinesResult = await db.select()
      .from(budgetLines)
      .innerJoin(budgets, eq(budgetLines.budgetId, budgets.id))
      .where(eq(budgets.companyId, companyId));

    for (const { budget_lines: line } of budgetLinesResult) {
      const actualAmount = await this.calculateAccountBalance(line.accountId, periodEnd);
      const variance = parseFloat(actualAmount) - parseFloat(line.budgetedAmount);
      const variancePercent = parseFloat(line.budgetedAmount) !== 0 
        ? (variance / parseFloat(line.budgetedAmount)) * 100 
        : 0;

      await db.update(budgetLines)
        .set({
          actualAmount: actualAmount,
          variance: variance.toFixed(2),
          variancePercent: variancePercent.toFixed(2),
          updatedAt: new Date()
        })
        .where(eq(budgetLines.id, line.id));
    }
  }

  // Cash Flow Forecasting
  async getCashFlowForecasts(companyId: number): Promise<CashFlowForecast[]> {
    return await db.select().from(cashFlowForecasts)
      .where(eq(cashFlowForecasts.companyId, companyId))
      .orderBy(desc(cashFlowForecasts.startDate));
  }

  async getCashFlowForecast(id: number): Promise<CashFlowForecast | undefined> {
    const [forecast] = await db.select().from(cashFlowForecasts).where(eq(cashFlowForecasts.id, id));
    return forecast || undefined;
  }

  async createCashFlowForecast(data: InsertCashFlowForecast): Promise<CashFlowForecast> {
    const [forecast] = await db
      .insert(cashFlowForecasts)
      .values(data)
      .returning();
    return forecast;
  }

  async updateCashFlowForecast(id: number, data: Partial<InsertCashFlowForecast>): Promise<CashFlowForecast | undefined> {
    const [updatedForecast] = await db
      .update(cashFlowForecasts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cashFlowForecasts.id, id))
      .returning();
    return updatedForecast || undefined;
  }

  async deleteCashFlowForecast(id: number): Promise<boolean> {
    const result = await db.delete(cashFlowForecasts).where(eq(cashFlowForecasts.id, id));
    return result.rowCount > 0;
  }

  async getCashFlowForecastLines(forecastId: number): Promise<CashFlowForecastLine[]> {
    return await db.select().from(cashFlowForecastLines)
      .where(eq(cashFlowForecastLines.forecastId, forecastId))
      .orderBy(cashFlowForecastLines.period, cashFlowForecastLines.category);
  }

  async createCashFlowForecastLine(data: InsertCashFlowForecastLine): Promise<CashFlowForecastLine> {
    const [forecastLine] = await db
      .insert(cashFlowForecastLines)
      .values(data)
      .returning();
    return forecastLine;
  }

  async updateCashFlowForecastLine(id: number, data: Partial<InsertCashFlowForecastLine>): Promise<CashFlowForecastLine | undefined> {
    const [updatedLine] = await db
      .update(cashFlowForecastLines)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cashFlowForecastLines.id, id))
      .returning();
    return updatedLine || undefined;
  }

  async deleteCashFlowForecastLine(id: number): Promise<boolean> {
    const result = await db.delete(cashFlowForecastLines).where(eq(cashFlowForecastLines.id, id));
    return result.rowCount > 0;
  }

  async generateCashFlowProjections(companyId: number, months: number): Promise<any> {
    const projections = [];
    const currentDate = new Date();

    for (let i = 0; i < months; i++) {
      const projectionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      
      // Calculate historical averages for inflows and outflows based on actual data
      const historicalInflows = await this.calculateHistoricalCashFlow(companyId, 'inflow', 12);
      const historicalOutflows = await this.calculateHistoricalCashFlow(companyId, 'outflow', 12);

      projections.push({
        period: projectionDate.toISOString().substring(0, 7),
        projectedInflow: historicalInflows,
        projectedOutflow: historicalOutflows,
        netCashFlow: historicalInflows - historicalOutflows,
        confidence: 'medium'
      });
    }

    return projections;
  }

  private async calculateHistoricalCashFlow(companyId: number, type: 'inflow' | 'outflow', months: number): Promise<number> {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months, 1);
    
    if (type === 'inflow') {
      // Calculate revenue from invoices
      const invoiceTotal = await db.select({ total: sum(invoices.totalAmount) })
        .from(invoices)
        .where(and(
          eq(invoices.companyId, companyId),
          eq(invoices.status, 'paid'),
          gte(invoices.issueDate, startDate),
          lte(invoices.issueDate, endDate)
        ));
      
      return parseFloat(invoiceTotal[0]?.total || '0') / months;
    } else {
      // Calculate expenses
      const expenseTotal = await db.select({ total: sum(expenses.amount) })
        .from(expenses)
        .where(and(
          eq(expenses.companyId, companyId),
          gte(expenses.expenseDate, startDate),
          lte(expenses.expenseDate, endDate)
        ));
      
      return parseFloat(expenseTotal[0]?.total || '0') / months;
    }
  }

  // Advanced Reporting
  async getAdvancedReports(companyId: number): Promise<AdvancedReport[]> {
    return await db.select().from(advancedReports)
      .where(eq(advancedReports.companyId, companyId))
      .orderBy(advancedReports.reportName);
  }

  async getAdvancedReport(id: number): Promise<AdvancedReport | undefined> {
    const [report] = await db.select().from(advancedReports).where(eq(advancedReports.id, id));
    return report || undefined;
  }

  async createAdvancedReport(data: InsertAdvancedReport): Promise<AdvancedReport> {
    const [report] = await db
      .insert(advancedReports)
      .values(data)
      .returning();
    return report;
  }

  async updateAdvancedReport(id: number, data: Partial<InsertAdvancedReport>): Promise<AdvancedReport | undefined> {
    const [updatedReport] = await db
      .update(advancedReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(advancedReports.id, id))
      .returning();
    return updatedReport || undefined;
  }

  async deleteAdvancedReport(id: number): Promise<boolean> {
    const result = await db.delete(advancedReports).where(eq(advancedReports.id, id));
    return result.rowCount > 0;
  }

  async generateReport(reportId: number): Promise<any> {
    const report = await this.getAdvancedReport(reportId);
    if (!report) return null;

    const parameters = report.parameters as any;
    
    switch (report.reportType) {
      case 'financial_analysis':
        return await this.generateFinancialAnalysisReport(report.companyId, parameters);
      case 'budget_variance':
        return await this.generateBudgetVarianceReport(report.companyId, parameters);
      case 'cash_flow':
        return await this.generateCashFlowReport(report.companyId, parameters);
      case 'asset_register':
        return await this.generateAssetRegisterReport(report.companyId, parameters);
      default:
        return null;
    }
  }

  private async generateFinancialAnalysisReport(companyId: number, parameters: any): Promise<any> {
    const startDate = new Date(parameters.startDate);
    const endDate = new Date(parameters.endDate);
    
    const trialBalance = await this.getTrialBalance(companyId, endDate);
    const totalRevenue = trialBalance
      .filter(account => account.accountType === 'Revenue')
      .reduce((sum, account) => sum + parseFloat(account.balance || '0'), 0);
    
    const totalExpenses = trialBalance
      .filter(account => account.accountType === 'Expense')
      .reduce((sum, account) => sum + parseFloat(account.balance || '0'), 0);

    return {
      reportType: 'financial_analysis',
      period: { startDate, endDate },
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      trialBalance,
      generatedAt: new Date()
    };
  }

  private async generateBudgetVarianceReport(companyId: number, parameters: any): Promise<any> {
    const budgets = await this.getBudgets(companyId);
    const budgetData = [];

    for (const budget of budgets) {
      const lines = await this.getBudgetLines(budget.id);
      budgetData.push({
        budget,
        lines,
        totalBudgeted: lines.reduce((sum, line) => sum + parseFloat(line.budgetedAmount), 0),
        totalActual: lines.reduce((sum, line) => sum + parseFloat(line.actualAmount), 0),
        totalVariance: lines.reduce((sum, line) => sum + parseFloat(line.variance), 0)
      });
    }

    return {
      reportType: 'budget_variance',
      budgets: budgetData,
      generatedAt: new Date()
    };
  }

  private async generateCashFlowReport(companyId: number, parameters: any): Promise<any> {
    const forecasts = await this.getCashFlowForecasts(companyId);
    const forecastData = [];

    for (const forecast of forecasts) {
      const lines = await this.getCashFlowForecastLines(forecast.id);
      forecastData.push({
        forecast,
        lines,
        totalInflow: lines.filter(l => l.category === 'inflow').reduce((sum, line) => sum + parseFloat(line.forecastAmount), 0),
        totalOutflow: lines.filter(l => l.category === 'outflow').reduce((sum, line) => sum + parseFloat(line.forecastAmount), 0)
      });
    }

    return {
      reportType: 'cash_flow',
      forecasts: forecastData,
      generatedAt: new Date()
    };
  }

  private async generateAssetRegisterReport(companyId: number, parameters: any): Promise<any> {
    const assets = await this.getFixedAssets(companyId);
    const assetData = [];

    for (const asset of assets) {
      const depreciationRecords = await this.getDepreciationRecords(asset.id);
      const totalDepreciation = depreciationRecords.reduce((sum, record) => sum + parseFloat(record.depreciationAmount), 0);
      
      assetData.push({
        ...asset,
        totalDepreciation,
        netBookValue: parseFloat(asset.currentValue) - totalDepreciation,
        depreciationRecords
      });
    }

    return {
      reportType: 'asset_register',
      assets: assetData,
      totalAssetValue: assetData.reduce((sum, asset) => sum + parseFloat(asset.purchasePrice), 0),
      totalDepreciation: assetData.reduce((sum, asset) => sum + asset.totalDepreciation, 0),
      totalNetBookValue: assetData.reduce((sum, asset) => sum + asset.netBookValue, 0),
      generatedAt: new Date()
    };
  }

  // Bank Reconciliation
  async getBankReconciliationItems(reconciliationId: number): Promise<BankReconciliationItem[]> {
    return await db.select().from(bankReconciliationItems)
      .where(eq(bankReconciliationItems.reconciliationId, reconciliationId))
      .orderBy(bankReconciliationItems.transactionDate);
  }

  async createBankReconciliationItem(data: InsertBankReconciliationItem): Promise<BankReconciliationItem> {
    const [item] = await db
      .insert(bankReconciliationItems)
      .values(data)
      .returning();
    return item;
  }

  async updateBankReconciliationItem(id: number, data: Partial<InsertBankReconciliationItem>): Promise<BankReconciliationItem | undefined> {
    const [updatedItem] = await db
      .update(bankReconciliationItems)
      .set(data)
      .where(eq(bankReconciliationItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deleteBankReconciliationItem(id: number): Promise<boolean> {
    const result = await db.delete(bankReconciliationItems).where(eq(bankReconciliationItems.id, id));
    return result.rowCount > 0;
  }

  async matchBankTransactions(reconciliationId: number): Promise<void> {
    const items = await this.getBankReconciliationItems(reconciliationId);
    const bankItems = items.filter(item => item.transactionType === 'bank');
    const bookItems = items.filter(item => item.transactionType === 'book');

    for (const bankItem of bankItems) {
      const matchingBookItem = bookItems.find(bookItem => 
        Math.abs(parseFloat(bankItem.amount) - parseFloat(bookItem.amount)) < 0.01 &&
        Math.abs(new Date(bankItem.transactionDate).getTime() - new Date(bookItem.transactionDate).getTime()) < (7 * 24 * 60 * 60 * 1000)
      );

      if (matchingBookItem) {
        await db.update(bankReconciliationItems)
          .set({ status: 'matched', matchedWith: matchingBookItem.id })
          .where(eq(bankReconciliationItems.id, bankItem.id));

        await db.update(bankReconciliationItems)
          .set({ status: 'matched', matchedWith: bankItem.id })
          .where(eq(bankReconciliationItems.id, matchingBookItem.id));
      }
    }
  }

  async getUnmatchedTransactions(companyId: number, bankAccountId: number): Promise<any[]> {
    const bankTransactions = await db.select()
      .from(bankTransactions)
      .where(and(
        eq(bankTransactions.companyId, companyId),
        eq(bankTransactions.bankAccountId, bankAccountId),
        isNull(bankTransactions.reconciledAt)
      ))
      .orderBy(desc(bankTransactions.transactionDate));

    return bankTransactions.map(transaction => ({
      ...transaction,
      type: 'bank',
      matched: false
    }));
  }

  // WORLD-CLASS FINANCIAL REPORTING SUITE

  async getBalanceSheetReport(companyId: number, from: string, to: string) {
    try {
      const toDate = to || new Date().toISOString().split('T')[0];
      
      // Get all accounts with their balances
      const accounts = await db
        .select({
          id: chartOfAccounts.id,
          accountName: chartOfAccounts.accountName,
          accountCode: chartOfAccounts.accountCode,
          category: chartOfAccounts.category,
          subcategory: chartOfAccounts.subcategory,
          accountType: chartOfAccounts.accountType,
          balance: sql<string>`COALESCE(SUM(
            CASE 
              WHEN ${journalEntries.entryType} = 'debit' THEN ${journalEntries.amount}
              ELSE -${journalEntries.amount}
            END
          ), 0)`.as('balance')
        })
        .from(chartOfAccounts)
        .leftJoin(journalEntries, 
          and(
            eq(journalEntries.accountId, chartOfAccounts.id),
            eq(journalEntries.companyId, companyId),
            lte(journalEntries.transactionDate, toDate)
          )
        )
        .where(eq(chartOfAccounts.companyId, companyId))
        .groupBy(chartOfAccounts.id, chartOfAccounts.accountName, chartOfAccounts.accountCode, 
                chartOfAccounts.category, chartOfAccounts.subcategory, chartOfAccounts.accountType);

      // Categorize accounts
      const currentAssets = accounts
        .filter(acc => acc.accountType === 'Asset' && acc.subcategory?.includes('Current'))
        .map(acc => ({ account: acc.accountName, amount: acc.balance }));

      const nonCurrentAssets = accounts
        .filter(acc => acc.accountType === 'Asset' && !acc.subcategory?.includes('Current'))
        .map(acc => ({ account: acc.accountName, amount: acc.balance }));

      const currentLiabilities = accounts
        .filter(acc => acc.accountType === 'Liability' && acc.subcategory?.includes('Current'))
        .map(acc => ({ account: acc.accountName, amount: acc.balance }));

      const nonCurrentLiabilities = accounts
        .filter(acc => acc.accountType === 'Liability' && !acc.subcategory?.includes('Current'))
        .map(acc => ({ account: acc.accountName, amount: acc.balance }));

      const equity = accounts
        .filter(acc => acc.accountType === 'Equity')
        .map(acc => ({ account: acc.accountName, amount: acc.balance }));

      // Calculate totals
      const totalCurrentAssets = currentAssets.reduce((sum, acc) => sum + parseFloat(acc.amount), 0);
      const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, acc) => sum + parseFloat(acc.amount), 0);
      const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

      const totalCurrentLiabilities = currentLiabilities.reduce((sum, acc) => sum + parseFloat(acc.amount), 0);
      const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((sum, acc) => sum + parseFloat(acc.amount), 0);
      const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

      const totalEquity = equity.reduce((sum, acc) => sum + parseFloat(acc.amount), 0);

      return {
        assets: {
          currentAssets,
          nonCurrentAssets,
          totalAssets: totalAssets.toFixed(2)
        },
        liabilities: {
          currentLiabilities,
          nonCurrentLiabilities,
          totalLiabilities: totalLiabilities.toFixed(2)
        },
        equity: {
          items: equity,
          totalEquity: totalEquity.toFixed(2)
        },
        totalLiabilitiesAndEquity: (totalLiabilities + totalEquity).toFixed(2)
      };
    } catch (error) {
      console.error("Error generating balance sheet:", error);
      throw error;
    }
  }

  async getTrialBalanceReport(companyId: number, from: string, to: string) {
    try {
      const toDate = to || new Date().toISOString().split('T')[0];
      
      // Get all accounts with their debit and credit balances
      const accounts = await db
        .select({
          accountCode: chartOfAccounts.accountCode,
          accountName: chartOfAccounts.accountName,
          accountType: chartOfAccounts.accountType,
          debitTotal: sql<string>`COALESCE(SUM(
            CASE WHEN ${journalEntries.entryType} = 'debit' THEN ${journalEntries.amount} ELSE 0 END
          ), 0)`.as('debit_total'),
          creditTotal: sql<string>`COALESCE(SUM(
            CASE WHEN ${journalEntries.entryType} = 'credit' THEN ${journalEntries.amount} ELSE 0 END
          ), 0)`.as('credit_total')
        })
        .from(chartOfAccounts)
        .leftJoin(journalEntries, 
          and(
            eq(journalEntries.accountId, chartOfAccounts.id),
            eq(journalEntries.companyId, companyId),
            lte(journalEntries.transactionDate, toDate)
          )
        )
        .where(eq(chartOfAccounts.companyId, companyId))
        .groupBy(chartOfAccounts.id, chartOfAccounts.accountCode, chartOfAccounts.accountName, chartOfAccounts.accountType)
        .orderBy(chartOfAccounts.accountCode);

      // Calculate trial balance based on account type
      const trialBalanceAccounts = accounts.map(account => {
        const debitAmount = parseFloat(account.debitTotal);
        const creditAmount = parseFloat(account.creditTotal);
        
        let debit = "0.00";
        let credit = "0.00";
        
        // For assets and expenses, debit balance is positive
        if (account.accountType === 'Asset' || account.accountType === 'Expense') {
          const balance = debitAmount - creditAmount;
          if (balance > 0) {
            debit = balance.toFixed(2);
          } else {
            credit = Math.abs(balance).toFixed(2);
          }
        }
        // For liabilities, equity, and revenue, credit balance is positive
        else if (account.accountType === 'Liability' || account.accountType === 'Equity' || account.accountType === 'Revenue') {
          const balance = creditAmount - debitAmount;
          if (balance > 0) {
            credit = balance.toFixed(2);
          } else {
            debit = Math.abs(balance).toFixed(2);
          }
        }

        return {
          accountCode: account.accountCode,
          accountName: account.accountName,
          debit,
          credit
        };
      });

      const totalDebits = trialBalanceAccounts.reduce((sum, acc) => sum + parseFloat(acc.debit), 0);
      const totalCredits = trialBalanceAccounts.reduce((sum, acc) => sum + parseFloat(acc.credit), 0);

      return {
        accounts: trialBalanceAccounts,
        totalDebits: totalDebits.toFixed(2),
        totalCredits: totalCredits.toFixed(2)
      };
    } catch (error) {
      console.error("Error generating trial balance:", error);
      throw error;
    }
  }

  async getGeneralLedgerReport(companyId: number, from: string, to: string, accountId?: number) {
    try {
      const fromDate = from || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const toDate = to || new Date().toISOString().split('T')[0];
      
      const whereConditions = [
        eq(journalEntries.companyId, companyId),
        gte(journalEntries.transactionDate, fromDate),
        lte(journalEntries.transactionDate, toDate)
      ];

      if (accountId) {
        whereConditions.push(eq(journalEntries.accountId, accountId));
      }

      const ledgerEntries = await db
        .select({
          accountId: journalEntries.accountId,
          accountCode: chartOfAccounts.accountCode,
          accountName: chartOfAccounts.accountName,
          transactionDate: journalEntries.transactionDate,
          description: journalEntries.description,
          reference: journalEntries.reference,
          debitAmount: sql<string>`CASE WHEN ${journalEntries.entryType} = 'debit' THEN ${journalEntries.amount} ELSE 0 END`,
          creditAmount: sql<string>`CASE WHEN ${journalEntries.entryType} = 'credit' THEN ${journalEntries.amount} ELSE 0 END`,
          amount: journalEntries.amount,
          entryType: journalEntries.entryType
        })
        .from(journalEntries)
        .innerJoin(chartOfAccounts, eq(journalEntries.accountId, chartOfAccounts.id))
        .where(and(...whereConditions))
        .orderBy(chartOfAccounts.accountCode, journalEntries.transactionDate);

      // Group by account
      const accountsMap = new Map();
      
      ledgerEntries.forEach(entry => {
        const key = `${entry.accountCode}-${entry.accountName}`;
        if (!accountsMap.has(key)) {
          accountsMap.set(key, {
            accountCode: entry.accountCode,
            accountName: entry.accountName,
            transactions: [],
            openingBalance: "0.00",
            closingBalance: "0.00"
          });
        }
        
        const account = accountsMap.get(key);
        account.transactions.push({
          date: entry.transactionDate,
          description: entry.description,
          reference: entry.reference || "",
          debit: entry.debitAmount,
          credit: entry.creditAmount,
          balance: "0.00" // Would need running balance calculation
        });
      });

      return {
        accounts: Array.from(accountsMap.values())
      };
    } catch (error) {
      console.error("Error generating general ledger:", error);
      throw error;
    }
  }

  async getAgedReceivablesReport(companyId: number, asAt: string) {
    try {
      const asAtDate = asAt || new Date().toISOString().split('T')[0];
      
      // Get outstanding invoices
      const outstandingInvoices = await db
        .select({
          customerName: customers.name,
          invoiceId: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          invoiceDate: invoices.issueDate,
          dueDate: invoices.dueDate,
          totalAmount: invoices.totalAmount,
          paidAmount: sql<string>`COALESCE(SUM(${payments.amount}), 0)`.as('paid_amount')
        })
        .from(invoices)
        .innerJoin(customers, eq(invoices.customerId, customers.id))
        .leftJoin(payments, eq(payments.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.companyId, companyId),
            ne(invoices.status, 'paid'),
            lte(invoices.issueDate, asAtDate)
          )
        )
        .groupBy(
          customers.name, invoices.id, invoices.invoiceNumber, 
          invoices.issueDate, invoices.dueDate, invoices.totalAmount
        );

      // Calculate aging
      const customersMap = new Map();
      
      outstandingInvoices.forEach(invoice => {
        const outstanding = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount);
        if (outstanding <= 0) return;

        const daysDiff = Math.floor((new Date(asAtDate).getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (!customersMap.has(invoice.customerName)) {
          customersMap.set(invoice.customerName, {
            customerName: invoice.customerName,
            current: 0,
            days30: 0,
            days60: 0,
            days90: 0,
            total: 0
          });
        }
        
        const customer = customersMap.get(invoice.customerName);
        
        if (daysDiff <= 0) {
          customer.current += outstanding;
        } else if (daysDiff <= 30) {
          customer.days30 += outstanding;
        } else if (daysDiff <= 60) {
          customer.days60 += outstanding;
        } else {
          customer.days90 += outstanding;
        }
        
        customer.total += outstanding;
      });

      const customers_list = Array.from(customersMap.values()).map(customer => ({
        customerName: customer.customerName,
        current: customer.current.toFixed(2),
        days30: customer.days30.toFixed(2),
        days60: customer.days60.toFixed(2),
        days90: customer.days90.toFixed(2),
        total: customer.total.toFixed(2)
      }));

      const totals = customers_list.reduce((acc, customer) => ({
        current: (parseFloat(acc.current) + parseFloat(customer.current)).toFixed(2),
        days30: (parseFloat(acc.days30) + parseFloat(customer.days30)).toFixed(2),
        days60: (parseFloat(acc.days60) + parseFloat(customer.days60)).toFixed(2),
        days90: (parseFloat(acc.days90) + parseFloat(customer.days90)).toFixed(2),
        total: (parseFloat(acc.total) + parseFloat(customer.total)).toFixed(2)
      }), { current: "0.00", days30: "0.00", days60: "0.00", days90: "0.00", total: "0.00" });

      return {
        customers: customers_list,
        totals
      };
    } catch (error) {
      console.error("Error generating aged receivables:", error);
      throw error;
    }
  }

  async getAgedPayablesReport(companyId: number, asAt: string) {
    try {
      const asAtDate = asAt || new Date().toISOString().split('T')[0];
      
      // Get outstanding purchase orders
      const outstandingPOs = await db
        .select({
          supplierName: suppliers.name,
          poId: purchaseOrders.id,
          poNumber: purchaseOrders.orderNumber,
          orderDate: purchaseOrders.orderDate,
          expectedDate: purchaseOrders.expectedDate,
          totalAmount: purchaseOrders.totalAmount,
          paidAmount: sql<string>`COALESCE(SUM(${purchaseOrderPayments.amount}), 0)`.as('paid_amount')
        })
        .from(purchaseOrders)
        .innerJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
        .leftJoin(purchaseOrderPayments, eq(purchaseOrderPayments.purchaseOrderId, purchaseOrders.id))
        .where(
          and(
            eq(purchaseOrders.companyId, companyId),
            ne(purchaseOrders.status, 'paid'),
            lte(purchaseOrders.orderDate, asAtDate)
          )
        )
        .groupBy(
          suppliers.name, purchaseOrders.id, purchaseOrders.orderNumber, 
          purchaseOrders.orderDate, purchaseOrders.expectedDate, purchaseOrders.totalAmount
        );

      // Calculate aging
      const suppliersMap = new Map();
      
      outstandingPOs.forEach(po => {
        const outstanding = parseFloat(po.totalAmount) - parseFloat(po.paidAmount);
        if (outstanding <= 0) return;

        const daysDiff = Math.floor((new Date(asAtDate).getTime() - new Date(po.expectedDate || po.orderDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (!suppliersMap.has(po.supplierName)) {
          suppliersMap.set(po.supplierName, {
            supplierName: po.supplierName,
            current: 0,
            days30: 0,
            days60: 0,
            days90: 0,
            total: 0
          });
        }
        
        const supplier = suppliersMap.get(po.supplierName);
        
        if (daysDiff <= 0) {
          supplier.current += outstanding;
        } else if (daysDiff <= 30) {
          supplier.days30 += outstanding;
        } else if (daysDiff <= 60) {
          supplier.days60 += outstanding;
        } else {
          supplier.days90 += outstanding;
        }
        
        supplier.total += outstanding;
      });

      const suppliers_list = Array.from(suppliersMap.values()).map(supplier => ({
        supplierName: supplier.supplierName,
        current: supplier.current.toFixed(2),
        days30: supplier.days30.toFixed(2),
        days60: supplier.days60.toFixed(2),
        days90: supplier.days90.toFixed(2),
        total: supplier.total.toFixed(2)
      }));

      const totals = suppliers_list.reduce((acc, supplier) => ({
        current: (parseFloat(acc.current) + parseFloat(supplier.current)).toFixed(2),
        days30: (parseFloat(acc.days30) + parseFloat(supplier.days30)).toFixed(2),
        days60: (parseFloat(acc.days60) + parseFloat(supplier.days60)).toFixed(2),
        days90: (parseFloat(acc.days90) + parseFloat(supplier.days90)).toFixed(2),
        total: (parseFloat(acc.total) + parseFloat(supplier.total)).toFixed(2)
      }), { current: "0.00", days30: "0.00", days60: "0.00", days90: "0.00", total: "0.00" });

      return {
        suppliers: suppliers_list,
        totals
      };
    } catch (error) {
      console.error("Error generating aged payables:", error);
      throw error;
    }
  }

  // Project Management Methods
  // Projects
  async getProjects(companyId: number): Promise<ProjectWithDetails[]> {
    const result = await db
      .select({
        id: projects.id,
        companyId: projects.companyId,
        customerId: projects.customerId,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        priority: projects.priority,
        startDate: projects.startDate,
        endDate: projects.endDate,
        estimatedHours: projects.estimatedHours,
        actualHours: projects.actualHours,
        budgetAmount: projects.budgetAmount,
        actualCost: projects.actualCost,
        hourlyRate: projects.hourlyRate,
        isInternal: projects.isInternal,
        projectManagerId: projects.projectManagerId,
        color: projects.color,
        createdBy: projects.createdBy,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        customerName: customers.name,
        projectManagerName: users.name,
      })
      .from(projects)
      .leftJoin(customers, eq(projects.customerId, customers.id))
      .leftJoin(users, eq(projects.projectManagerId, users.id))
      .where(eq(projects.companyId, companyId))
      .orderBy(desc(projects.createdAt));

    // Get task counts for each project
    const projectTasks = await db
      .select({
        projectId: tasks.projectId,
        totalTasks: sql<number>`count(*)`,
        completedTasks: sql<number>`count(case when ${tasks.status} = 'completed' then 1 end)`,
      })
      .from(tasks)
      .where(eq(tasks.companyId, companyId))
      .groupBy(tasks.projectId);

    const taskMap = new Map(
      projectTasks.map((t) => [t.projectId, t])
    );

    return result.map((project) => ({
      ...project,
      customer: project.customerName ? { name: project.customerName } : undefined,
      projectManager: project.projectManagerName ? { name: project.projectManagerName } : undefined,
      totalTasks: taskMap.get(project.id)?.totalTasks || 0,
      completedTasks: taskMap.get(project.id)?.completedTasks || 0,
    })) as ProjectWithDetails[];
  }

  async getProject(id: number, companyId: number): Promise<ProjectWithDetails | undefined> {
    const [project] = await db
      .select({
        id: projects.id,
        companyId: projects.companyId,
        customerId: projects.customerId,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        priority: projects.priority,
        startDate: projects.startDate,
        endDate: projects.endDate,
        estimatedHours: projects.estimatedHours,
        actualHours: projects.actualHours,
        budgetAmount: projects.budgetAmount,
        actualCost: projects.actualCost,
        hourlyRate: projects.hourlyRate,
        isInternal: projects.isInternal,
        projectManagerId: projects.projectManagerId,
        color: projects.color,
        createdBy: projects.createdBy,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        customerName: customers.name,
        projectManagerName: users.name,
      })
      .from(projects)
      .leftJoin(customers, eq(projects.customerId, customers.id))
      .leftJoin(users, eq(projects.projectManagerId, users.id))
      .where(and(eq(projects.id, id), eq(projects.companyId, companyId)));

    if (!project) return undefined;

    // Get project tasks
    const projectTasks = await this.getTasks(companyId, project.id);

    // Get project members
    const members = await db
      .select({
        id: projectMembers.id,
        projectId: projectMembers.projectId,
        userId: projectMembers.userId,
        role: projectMembers.role,
        hourlyRate: projectMembers.hourlyRate,
        addedAt: projectMembers.addedAt,
        userName: users.name,
      })
      .from(projectMembers)
      .leftJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, id));

    return {
      ...project,
      customer: project.customerName ? { name: project.customerName } : undefined,
      projectManager: project.projectManagerName ? { name: project.projectManagerName } : undefined,
      tasks: projectTasks,
      members: members as ProjectMember[],
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter(t => t.status === 'completed').length,
    } as ProjectWithDetails;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>, companyId: number): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.companyId, companyId)))
      .returning();
    return updated;
  }

  async deleteProject(id: number, companyId: number): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.companyId, companyId)));
    return (result.rowCount || 0) > 0;
  }

  // Tasks
  async getTasks(companyId: number, projectId?: number): Promise<TaskWithDetails[]> {
    let whereCondition = eq(tasks.companyId, companyId);
    if (projectId) {
      whereCondition = and(whereCondition, eq(tasks.projectId, projectId));
    }

    const result = await db
      .select({
        id: tasks.id,
        companyId: tasks.companyId,
        projectId: tasks.projectId,
        customerId: tasks.customerId,
        parentTaskId: tasks.parentTaskId,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        assignedToId: tasks.assignedToId,
        startDate: tasks.startDate,
        dueDate: tasks.dueDate,
        completedDate: tasks.completedDate,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        isInternal: tasks.isInternal,
        isBillable: tasks.isBillable,
        hourlyRate: tasks.hourlyRate,
        progress: tasks.progress,
        tags: tasks.tags,
        createdBy: tasks.createdBy,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        projectName: projects.name,
        customerName: customers.name,
        assignedToName: users.name,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(customers, eq(tasks.customerId, customers.id))
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .where(whereCondition)
      .orderBy(desc(tasks.createdAt));

    // Get time entries for each task
    const taskTimeEntries = await db
      .select({
        taskId: timeEntries.taskId,
        totalTime: sql<number>`coalesce(sum(${timeEntries.duration}), 0)`,
      })
      .from(timeEntries)
      .where(eq(timeEntries.companyId, companyId))
      .groupBy(timeEntries.taskId);

    const timeMap = new Map(
      taskTimeEntries.map((t) => [t.taskId, t.totalTime])
    );

    return result.map((task) => ({
      ...task,
      project: task.projectName ? { name: task.projectName } : undefined,
      customer: task.customerName ? { name: task.customerName } : undefined,
      assignedTo: task.assignedToName ? { name: task.assignedToName } : undefined,
      totalTimeSpent: timeMap.get(task.id) || 0,
    })) as TaskWithDetails[];
  }

  async getTask(id: number, companyId: number): Promise<TaskWithDetails | undefined> {
    const [task] = await db
      .select({
        id: tasks.id,
        companyId: tasks.companyId,
        projectId: tasks.projectId,
        customerId: tasks.customerId,
        parentTaskId: tasks.parentTaskId,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        assignedToId: tasks.assignedToId,
        startDate: tasks.startDate,
        dueDate: tasks.dueDate,
        completedDate: tasks.completedDate,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        isInternal: tasks.isInternal,
        isBillable: tasks.isBillable,
        hourlyRate: tasks.hourlyRate,
        progress: tasks.progress,
        tags: tasks.tags,
        createdBy: tasks.createdBy,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        projectName: projects.name,
        customerName: customers.name,
        assignedToName: users.name,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(customers, eq(tasks.customerId, customers.id))
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .where(and(eq(tasks.id, id), eq(tasks.companyId, companyId)));

    if (!task) return undefined;

    // Get comments
    const comments = await db
      .select({
        id: taskComments.id,
        taskId: taskComments.taskId,
        userId: taskComments.userId,
        content: taskComments.content,
        isInternal: taskComments.isInternal,
        createdAt: taskComments.createdAt,
        updatedAt: taskComments.updatedAt,
        userName: users.name,
      })
      .from(taskComments)
      .leftJoin(users, eq(taskComments.userId, users.id))
      .where(eq(taskComments.taskId, id))
      .orderBy(taskComments.createdAt);

    // Get time entries
    const taskTimeEntries = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.taskId, id))
      .orderBy(desc(timeEntries.startTime));

    return {
      ...task,
      project: task.projectName ? { name: task.projectName } : undefined,
      customer: task.customerName ? { name: task.customerName } : undefined,
      assignedTo: task.assignedToName ? { name: task.assignedToName } : undefined,
      comments: comments as TaskComment[],
      timeEntries: taskTimeEntries,
      totalTimeSpent: taskTimeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0),
    } as TaskWithDetails;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>, companyId: number): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.companyId, companyId)))
      .returning();
    return updated;
  }

  async deleteTask(id: number, companyId: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.companyId, companyId)));
    return (result.rowCount || 0) > 0;
  }

  // Time Entries
  async getTimeEntries(companyId: number, userId?: number, projectId?: number, taskId?: number): Promise<TimeEntryWithDetails[]> {
    let whereCondition = eq(timeEntries.companyId, companyId);
    
    if (userId) whereCondition = and(whereCondition, eq(timeEntries.userId, userId));
    if (projectId) whereCondition = and(whereCondition, eq(timeEntries.projectId, projectId));
    if (taskId) whereCondition = and(whereCondition, eq(timeEntries.taskId, taskId));

    const result = await db
      .select({
        id: timeEntries.id,
        companyId: timeEntries.companyId,
        userId: timeEntries.userId,
        projectId: timeEntries.projectId,
        taskId: timeEntries.taskId,
        customerId: timeEntries.customerId,
        description: timeEntries.description,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime,
        duration: timeEntries.duration,
        isBillable: timeEntries.isBillable,
        hourlyRate: timeEntries.hourlyRate,
        amount: timeEntries.amount,
        isRunning: timeEntries.isRunning,
        invoiceId: timeEntries.invoiceId,
        notes: timeEntries.notes,
        createdAt: timeEntries.createdAt,
        updatedAt: timeEntries.updatedAt,
        projectName: projects.name,
        taskTitle: tasks.title,
        userName: users.name,
        customerName: customers.name,
      })
      .from(timeEntries)
      .leftJoin(projects, eq(timeEntries.projectId, projects.id))
      .leftJoin(tasks, eq(timeEntries.taskId, tasks.id))
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .leftJoin(customers, eq(timeEntries.customerId, customers.id))
      .where(whereCondition)
      .orderBy(desc(timeEntries.startTime));

    return result.map((entry) => ({
      ...entry,
      project: entry.projectName ? { name: entry.projectName } : undefined,
      task: entry.taskTitle ? { title: entry.taskTitle } : undefined,
      user: entry.userName ? { name: entry.userName } : undefined,
      customer: entry.customerName ? { name: entry.customerName } : undefined,
    })) as TimeEntryWithDetails[];
  }

  async getActiveTimeEntry(userId: number, companyId: number): Promise<TimeEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timeEntries)
      .where(and(
        eq(timeEntries.userId, userId),
        eq(timeEntries.companyId, companyId),
        eq(timeEntries.isRunning, true)
      ));
    return entry;
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    const [newEntry] = await db.insert(timeEntries).values(entry).returning();
    return newEntry;
  }

  async updateTimeEntry(id: number, entry: Partial<InsertTimeEntry>, companyId: number): Promise<TimeEntry | undefined> {
    const [updated] = await db
      .update(timeEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(and(eq(timeEntries.id, id), eq(timeEntries.companyId, companyId)))
      .returning();
    return updated;
  }

  async stopTimeEntry(id: number, companyId: number, endTime: Date): Promise<TimeEntry | undefined> {
    const duration = await db
      .select({ startTime: timeEntries.startTime })
      .from(timeEntries)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.companyId, companyId)));

    if (duration.length === 0) return undefined;

    const durationSeconds = Math.floor((endTime.getTime() - duration[0].startTime.getTime()) / 1000);

    const [updated] = await db
      .update(timeEntries)
      .set({
        endTime,
        duration: durationSeconds,
        isRunning: false,
        updatedAt: new Date(),
      })
      .where(and(eq(timeEntries.id, id), eq(timeEntries.companyId, companyId)))
      .returning();

    return updated;
  }

  async deleteTimeEntry(id: number, companyId: number): Promise<boolean> {
    const result = await db
      .delete(timeEntries)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.companyId, companyId)));
    return (result.rowCount || 0) > 0;
  }

  // Task Comments
  async createTaskComment(comment: InsertTaskComment): Promise<TaskComment> {
    const [newComment] = await db.insert(taskComments).values(comment).returning();
    return newComment;
  }

  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    return await db
      .select()
      .from(taskComments)
      .where(eq(taskComments.taskId, taskId))
      .orderBy(taskComments.createdAt);
  }

  async deleteTaskComment(id: number): Promise<boolean> {
    const result = await db.delete(taskComments).where(eq(taskComments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Project Members
  async addProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const [newMember] = await db.insert(projectMembers).values(member).returning();
    return newMember;
  }

  async removeProjectMember(projectId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    return await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));
  }
}

export const storage = new DatabaseStorage();






