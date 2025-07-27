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
  // RBAC imports
  systemRoles,
  companyRoles,
  userPermissions,
  permissionAuditLog,
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
  creditNotes,
  creditNoteItems,
  invoiceReminders,
  invoiceAgingReports,
  approvalWorkflows,
  approvalRequests,
  bankIntegrations,
  spendingWizardProfiles,
  spendingWizardConversations,
  spendingWizardMessages,
  spendingWizardInsights,
  spendingWizardTips,
  // Compliance Management imports
  clients,
  onboardingWorkflows,
  engagementLetters,
  sarsCompliance,
  cipcCompliance,
  labourCompliance,
  complianceDocuments,
  complianceTasks,
  complianceCalendar,
  correspondenceTracker,
  recurringBilling,
  aiAssistantConversations,
  aiAssistantMessages,
  // POS Module imports
  posTerminals,
  posSales,
  posSaleItems,
  posPayments,
  posPromotions,
  posLoyaltyPrograms,
  posCustomerLoyalty,
  posShifts,
  posRefunds,
  posRefundItems,
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
  type CreditNote,
  type InsertCreditNote,
  type CreditNoteItem,
  type InsertCreditNoteItem,
  type InvoiceReminder,
  type InsertInvoiceReminder,
  type InvoiceAgingReport,
  type InsertInvoiceAgingReport,
  type ApprovalWorkflow,
  type InsertApprovalWorkflow,
  type ApprovalRequest,
  type InsertApprovalRequest,
  type BankIntegration,
  type InsertBankIntegration,
  type SpendingWizardProfile,
  type InsertSpendingWizardProfile,
  type SpendingWizardConversation,
  type InsertSpendingWizardConversation,
  type SpendingWizardMessage,
  type InsertSpendingWizardMessage,
  type SpendingWizardInsight,
  type InsertSpendingWizardInsight,
  type SpendingWizardTip,
  type InsertSpendingWizardTip,
  // POS Module type imports
  type PosTerminal,
  type InsertPosTerminal,
  type PosSale,
  type InsertPosSale,
  type PosSaleItem,
  type InsertPosSaleItem,
  type PosPayment,
  type InsertPosPayment,
  type PosPromotion,
  type InsertPosPromotion,
  type PosLoyaltyProgram,
  type InsertPosLoyaltyProgram,
  type PosCustomerLoyalty,
  type InsertPosCustomerLoyalty,
  type PosShift,
  type InsertPosShift,
  type PosRefund,
  type InsertPosRefund,
  type PosRefundItem,
  type InsertPosRefundItem,
  type PosSaleWithItems,
  type PosShiftWithSales,
  type PosRefundWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sum, count, sql, and, gte, lte, or, isNull, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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

  // === CRITICAL MISSING FEATURES ===
  
  // Credit Notes Management - Critical missing feature
  getCreditNotes(companyId: number): Promise<CreditNote[]>;
  getCreditNote(id: number): Promise<CreditNote | undefined>;
  createCreditNote(creditNote: InsertCreditNote): Promise<CreditNote>;
  updateCreditNote(id: number, creditNote: Partial<InsertCreditNote>): Promise<CreditNote | undefined>;
  deleteCreditNote(id: number): Promise<boolean>;
  getCreditNoteItems(creditNoteId: number): Promise<CreditNoteItem[]>;
  createCreditNoteItem(item: InsertCreditNoteItem): Promise<CreditNoteItem>;
  applyCreditNoteToInvoice(creditNoteId: number, invoiceId: number, amount: number): Promise<boolean>;

  // Invoice Reminders - Critical missing feature
  getInvoiceReminders(companyId: number): Promise<InvoiceReminder[]>;
  createInvoiceReminder(reminder: InsertInvoiceReminder): Promise<InvoiceReminder>;
  updateInvoiceReminder(id: number, reminder: Partial<InsertInvoiceReminder>): Promise<InvoiceReminder | undefined>;
  markReminderSent(id: number, sentDate: Date, method: string): Promise<boolean>;
  getOverdueInvoicesForReminders(companyId: number): Promise<Invoice[]>;
  processAutomaticReminders(companyId: number): Promise<number>;

  // Invoice Aging Reports - Critical missing feature
  getInvoiceAgingReports(companyId: number): Promise<InvoiceAgingReport[]>;
  generateInvoiceAgingReport(companyId: number, reportName: string, agingPeriods: number[]): Promise<InvoiceAgingReport>;
  getLatestAgingReport(companyId: number): Promise<InvoiceAgingReport | undefined>;

  // Approval Workflows - Critical missing feature
  getApprovalWorkflows(companyId: number): Promise<ApprovalWorkflow[]>;
  getApprovalWorkflow(id: number): Promise<ApprovalWorkflow | undefined>;
  createApprovalWorkflow(workflow: InsertApprovalWorkflow): Promise<ApprovalWorkflow>;
  updateApprovalWorkflow(id: number, workflow: Partial<InsertApprovalWorkflow>): Promise<ApprovalWorkflow | undefined>;
  deleteApprovalWorkflow(id: number): Promise<boolean>;
  
  // Approval Requests
  getApprovalRequests(companyId: number, userId?: number): Promise<ApprovalRequest[]>;
  createApprovalRequest(request: InsertApprovalRequest): Promise<ApprovalRequest>;
  updateApprovalRequest(id: number, request: Partial<InsertApprovalRequest>): Promise<ApprovalRequest | undefined>;
  processApprovalAction(requestId: number, userId: number, action: 'approve' | 'reject', comments?: string): Promise<boolean>;

  // Bank Integrations - Critical missing feature
  getBankIntegrations(companyId: number): Promise<BankIntegration[]>;
  createBankIntegration(integration: InsertBankIntegration): Promise<BankIntegration>;
  updateBankIntegration(id: number, integration: Partial<InsertBankIntegration>): Promise<BankIntegration | undefined>;
  deleteBankIntegration(id: number): Promise<boolean>;
  syncBankTransactions(integrationId: number): Promise<boolean>;

  // Companies
  getAllCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyBySlug(slug: string): Promise<Company | undefined>;
  createCompany(insertCompany: InsertCompany, userId?: number): Promise<Company>;
  addUserToCompany(userId: number, companyId: number, role: string): Promise<any>;

  // POS Module - Critical new functionality
  // POS Terminals
  getPosTerminals(companyId: number): Promise<PosTerminal[]>;
  getPosTerminal(id: number): Promise<PosTerminal | undefined>;
  createPosTerminal(terminal: InsertPosTerminal): Promise<PosTerminal>;
  updatePosTerminal(id: number, terminal: Partial<InsertPosTerminal>): Promise<PosTerminal | undefined>;
  deletePosTerminal(id: number): Promise<boolean>;

  // POS Sales
  getPosSales(companyId: number, terminalId?: number): Promise<PosSale[]>;
  getPosSale(id: number): Promise<PosSaleWithItems | undefined>;
  createPosSale(sale: InsertPosSale, items: Omit<InsertPosSaleItem, 'saleId'>[], payments: Omit<InsertPosPayment, 'saleId'>[]): Promise<PosSaleWithItems>;
  updatePosSale(id: number, sale: Partial<InsertPosSale>): Promise<PosSale | undefined>;
  voidPosSale(id: number, voidReason: string, voidedBy: number): Promise<boolean>;

  // POS Sale Items
  getPosSaleItems(saleId: number): Promise<PosSaleItem[]>;
  createPosSaleItem(item: InsertPosSaleItem): Promise<PosSaleItem>;
  updatePosSaleItem(id: number, item: Partial<InsertPosSaleItem>): Promise<PosSaleItem | undefined>;

  // POS Payments
  getPosSalePayments(saleId: number): Promise<PosPayment[]>;
  createPosPayment(payment: InsertPosPayment): Promise<PosPayment>;

  // POS Shifts
  getPosShifts(companyId: number, terminalId?: number): Promise<PosShift[]>;
  getCurrentShift(terminalId: number, userId: number): Promise<PosShift | undefined>;
  createPosShift(shift: InsertPosShift): Promise<PosShift>;
  closeShift(id: number, closingData: { closingCash: number; notes?: string }): Promise<PosShift | undefined>;

  // POS Refunds
  getPosRefunds(companyId: number): Promise<PosRefund[]>;
  getPosRefund(id: number): Promise<PosRefundWithItems | undefined>;
  createPosRefund(refund: InsertPosRefund, refundItems: Omit<InsertPosRefundItem, 'refundId'>[]): Promise<PosRefundWithItems>;

  // POS Promotions
  getPosPromotions(companyId: number): Promise<PosPromotion[]>;
  getActivePosPromotions(companyId: number): Promise<PosPromotion[]>;
  createPosPromotion(promotion: InsertPosPromotion): Promise<PosPromotion>;
  updatePosPromotion(id: number, promotion: Partial<InsertPosPromotion>): Promise<PosPromotion | undefined>;

  // POS Loyalty Programs
  getPosLoyaltyPrograms(companyId: number): Promise<PosLoyaltyProgram[]>;
  createPosLoyaltyProgram(program: InsertPosLoyaltyProgram): Promise<PosLoyaltyProgram>;
  getCustomerLoyalty(customerId: number, programId: number): Promise<PosCustomerLoyalty | undefined>;
  updateCustomerLoyaltyPoints(customerId: number, programId: number, pointsChange: number): Promise<PosCustomerLoyalty | undefined>;

  // POS Reports & Analytics
  getPosDailySalesReport(companyId: number, date: Date): Promise<{ totalSales: number; totalTransactions: number; averageTransaction: number }>;
  getPosTopProducts(companyId: number, startDate: Date, endDate: Date): Promise<{ productId: number; productName: string; totalQuantity: number; totalRevenue: number }[]>;

  // RBAC - System Roles
  getSystemRoles(): Promise<SystemRole[]>;
  getSystemRole(id: number): Promise<SystemRole | undefined>;
  getSystemRoleByName(name: string): Promise<SystemRole | undefined>;
  createSystemRole(role: InsertSystemRole): Promise<SystemRole>;
  updateSystemRole(id: number, role: Partial<InsertSystemRole>): Promise<SystemRole | undefined>;
  deleteSystemRole(id: number): Promise<boolean>;

  // RBAC - Company Roles
  getCompanyRoles(companyId: number): Promise<CompanyRole[]>;
  getCompanyRole(id: number): Promise<CompanyRole | undefined>;
  getCompanyRoleByName(companyId: number, name: string): Promise<CompanyRole | undefined>;
  createCompanyRole(role: InsertCompanyRole): Promise<CompanyRole>;
  updateCompanyRole(id: number, role: Partial<InsertCompanyRole>): Promise<CompanyRole | undefined>;
  deleteCompanyRole(id: number): Promise<boolean>;

  // RBAC - User Permissions
  getUserPermission(userId: number, companyId: number): Promise<UserPermission | undefined>;
  getAllUserPermissions(userId: number): Promise<UserPermission[]>;
  createUserPermission(permission: InsertUserPermission): Promise<UserPermission>;
  updateUserPermission(id: number, permission: Partial<InsertUserPermission>): Promise<UserPermission | undefined>;
  deleteUserPermission(id: number): Promise<boolean>;
  getUsersWithRole(roleId: number, roleType: 'system' | 'company'): Promise<User[]>;

  // RBAC - Permission Audit
  createPermissionAuditLog(log: InsertPermissionAuditLog): Promise<PermissionAuditLog>;
  getPermissionAuditLogs(companyId: number, limit?: number): Promise<PermissionAuditLog[]>;
  getUserPermissionAuditLogs(userId: number, companyId: number, limit?: number): Promise<PermissionAuditLog[]>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async convertEstimateToInvoice(estimateId: number, userId?: number): Promise<InvoiceWithItems> {
    const estimate = await this.getEstimate(estimateId);
    if (!estimate) throw new Error("Estimate not found");

    // Mark estimate as accepted if converting
    await this.updateEstimateStatus(estimateId, "accepted", userId, "Converted to invoice");

    const invoiceData: InsertInvoice = {
      companyId: estimate.companyId,
      customerId: estimate.customerId,
      invoiceNumber: await this.getNextDocumentNumber(estimate.companyId, 'invoice'),
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subtotal: estimate.subtotal,
      vatAmount: estimate.vatAmount,
      total: estimate.total,
      status: "draft",
      notes: `Converted from estimate ${estimate.estimateNumber}`
    };

    const invoiceItems = estimate.items.map(item => ({
      companyId: estimate.companyId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      vatInclusive: item.vatInclusive,
      vatAmount: item.vatAmount,
      total: item.total
    }));

    return this.createInvoice(invoiceData, invoiceItems);
  }

  // Estimate Workflow Methods
  async updateEstimateStatus(
    estimateId: number, 
    status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired",
    userId?: number,
    notes?: string
  ): Promise<Estimate | undefined> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };

    // Set appropriate timestamp and user fields based on status
    switch (status) {
      case "sent":
        updateData.sentAt = new Date();
        updateData.sentBy = userId;
        break;
      case "viewed":
        updateData.viewedAt = new Date();
        break;
      case "accepted":
        updateData.acceptedAt = new Date();
        updateData.acceptedBy = userId;
        updateData.acceptanceNotes = notes;
        break;
      case "rejected":
        updateData.rejectedAt = new Date();
        updateData.rejectedBy = userId;
        updateData.rejectionReason = notes;
        break;
      case "expired":
        updateData.expiredAt = new Date();
        break;
    }

    const [estimate] = await db
      .update(estimates)
      .set(updateData)
      .where(eq(estimates.id, estimateId))
      .returning();
    
    return estimate || undefined;
  }

  async sendEstimate(estimateId: number, userId?: number): Promise<Estimate | undefined> {
    return this.updateEstimateStatus(estimateId, "sent", userId);
  }

  async markEstimateAsViewed(estimateId: number): Promise<Estimate | undefined> {
    // Only update if current status is 'sent' to avoid overriding later statuses
    const currentEstimate = await this.getEstimate(estimateId);
    if (currentEstimate?.status === "sent") {
      return this.updateEstimateStatus(estimateId, "viewed");
    }
    return currentEstimate;
  }

  async acceptEstimate(estimateId: number, userId?: number, notes?: string): Promise<Estimate | undefined> {
    return this.updateEstimateStatus(estimateId, "accepted", userId, notes);
  }

  async rejectEstimate(estimateId: number, userId?: number, reason?: string): Promise<Estimate | undefined> {
    return this.updateEstimateStatus(estimateId, "rejected", userId, reason);
  }

  async checkExpiredEstimates(): Promise<void> {
    // Find estimates that are sent/viewed and past expiry date
    const expiredEstimates = await db
      .select()
      .from(estimates)
      .where(
        and(
          or(
            eq(estimates.status, "sent"),
            eq(estimates.status, "viewed")
          ),
          lt(estimates.expiryDate, new Date())
        )
      );

    // Mark them as expired
    for (const estimate of expiredEstimates) {
      await this.updateEstimateStatus(estimate.id, "expired");
    }
  }

  async getEstimateStats(companyId: number): Promise<{
    total: number;
    draft: number;
    sent: number;
    viewed: number;
    accepted: number;
    rejected: number;
    expired: number;
  }> {
    const allEstimates = await db
      .select()
      .from(estimates)
      .where(eq(estimates.companyId, companyId));

    const stats = {
      total: allEstimates.length,
      draft: 0,
      sent: 0,
      viewed: 0,
      accepted: 0,
      rejected: 0,
      expired: 0
    };

    allEstimates.forEach(estimate => {
      if (estimate.status in stats) {
        (stats as any)[estimate.status]++;
      }
    });

    return stats;
  }

  // Enhanced Dashboard Stats for List Pages
  async getCustomerStats(companyId: number): Promise<{
    total: number;
    active: number;
    inactive: number;
    withPortalAccess: number;
  }> {
    const allCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.companyId, companyId));

    return {
      total: allCustomers.length,
      active: allCustomers.filter(c => c.isActive !== false).length,
      inactive: allCustomers.filter(c => c.isActive === false).length,
      withPortalAccess: allCustomers.filter(c => c.portalAccess === true).length
    };
  }

  async getInvoiceStats(companyId: number): Promise<{
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    partiallyPaid: number;
  }> {
    const allInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.companyId, companyId));

    const today = new Date();
    
    return {
      total: allInvoices.length,
      draft: allInvoices.filter(i => i.status === "draft").length,
      sent: allInvoices.filter(i => i.status === "sent").length,
      paid: allInvoices.filter(i => i.status === "paid").length,
      overdue: allInvoices.filter(i => 
        (i.status === "sent" || i.status === "partially_paid") && 
        new Date(i.dueDate) < today
      ).length,
      partiallyPaid: allInvoices.filter(i => i.status === "partially_paid").length
    };
  }

  async getProductStats(companyId: number): Promise<{
    total: number;
    active: number;
    services: number;
    lowStock: number;
  }> {
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.companyId, companyId));

    return {
      total: allProducts.length,
      active: allProducts.filter(p => p.isActive !== false).length,
      services: allProducts.filter(p => p.isService === true).length,
      lowStock: allProducts.filter(p => 
        p.isService !== true && 
        p.stockQuantity !== null && 
        p.stockQuantity <= (p.minStockLevel || 10)
      ).length
    };
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

  // ========================================
  // Smart Spending Wizard Methods
  // ========================================

  // Wizard Profile Management
  async getWizardProfile(companyId: number, userId: number): Promise<SpendingWizardProfile | undefined> {
    const [profile] = await db.select()
      .from(spendingWizardProfiles)
      .where(and(
        eq(spendingWizardProfiles.companyId, companyId),
        eq(spendingWizardProfiles.userId, userId)
      ));
    return profile;
  }

  async createWizardProfile(profile: InsertSpendingWizardProfile): Promise<SpendingWizardProfile> {
    const [newProfile] = await db.insert(spendingWizardProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateWizardProfile(companyId: number, userId: number, profile: Partial<InsertSpendingWizardProfile>): Promise<SpendingWizardProfile | undefined> {
    const [updated] = await db.update(spendingWizardProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(and(
        eq(spendingWizardProfiles.companyId, companyId),
        eq(spendingWizardProfiles.userId, userId)
      ))
      .returning();
    return updated;
  }

  // Conversation Management
  async getWizardConversations(companyId: number, userId: number): Promise<SpendingWizardConversation[]> {
    return await db.select()
      .from(spendingWizardConversations)
      .where(and(
        eq(spendingWizardConversations.companyId, companyId),
        eq(spendingWizardConversations.userId, userId)
      ))
      .orderBy(desc(spendingWizardConversations.updatedAt));
  }

  async createWizardConversation(conversation: InsertSpendingWizardConversation): Promise<SpendingWizardConversation> {
    const [newConversation] = await db.insert(spendingWizardConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateWizardConversation(conversationId: number, updates: Partial<InsertSpendingWizardConversation>): Promise<SpendingWizardConversation | undefined> {
    const [updated] = await db.update(spendingWizardConversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(spendingWizardConversations.id, conversationId))
      .returning();
    return updated;
  }

  // Message Management
  async getWizardMessages(conversationId: number): Promise<SpendingWizardMessage[]> {
    return await db.select()
      .from(spendingWizardMessages)
      .where(eq(spendingWizardMessages.conversationId, conversationId))
      .orderBy(spendingWizardMessages.createdAt);
  }

  async createWizardMessage(message: InsertSpendingWizardMessage): Promise<SpendingWizardMessage> {
    const [newMessage] = await db.insert(spendingWizardMessages)
      .values(message)
      .returning();

    // Update conversation message count and last message
    await db.update(spendingWizardConversations)
      .set({
        messageCount: sql`${spendingWizardConversations.messageCount} + 1`,
        lastMessage: message.content,
        updatedAt: new Date()
      })
      .where(eq(spendingWizardConversations.id, message.conversationId));

    return newMessage;
  }

  // Insights Management
  async getWizardInsights(companyId: number, userId: number, status?: string): Promise<SpendingWizardInsight[]> {
    let query = db.select()
      .from(spendingWizardInsights)
      .where(and(
        eq(spendingWizardInsights.companyId, companyId),
        eq(spendingWizardInsights.userId, userId)
      ));

    if (status) {
      query = query.where(eq(spendingWizardInsights.status, status));
    }

    return await query.orderBy(desc(spendingWizardInsights.createdAt));
  }

  async createWizardInsight(insight: InsertSpendingWizardInsight): Promise<SpendingWizardInsight> {
    const [newInsight] = await db.insert(spendingWizardInsights)
      .values(insight)
      .returning();
    return newInsight;
  }

  async updateWizardInsightStatus(insightId: number, status: string): Promise<SpendingWizardInsight | undefined> {
    const [updated] = await db.update(spendingWizardInsights)
      .set({ status, updatedAt: new Date() })
      .where(eq(spendingWizardInsights.id, insightId))
      .returning();
    return updated;
  }

  // Tips Management
  async getWizardTips(category?: string, businessType?: string): Promise<SpendingWizardTip[]> {
    let query = db.select()
      .from(spendingWizardTips)
      .where(eq(spendingWizardTips.isActive, true));

    if (category) {
      query = query.where(eq(spendingWizardTips.category, category));
    }

    if (businessType) {
      query = query.where(or(
        eq(spendingWizardTips.businessType, businessType),
        eq(spendingWizardTips.businessType, 'general')
      ));
    }

    return await query.orderBy(spendingWizardTips.priority, spendingWizardTips.createdAt);
  }

  async createWizardTip(tip: InsertSpendingWizardTip): Promise<SpendingWizardTip> {
    const [newTip] = await db.insert(spendingWizardTips)
      .values(tip)
      .returning();
    return newTip;
  }

  // AI-Powered Financial Analysis
  // ===========================
  // COMPLIANCE MANAGEMENT METHODS
  // ===========================

  // Client Management
  async getAllClients(companyId: number): Promise<Client[]> {
    return await db.select().from(clients)
      .where(eq(clients.companyId, companyId))
      .orderBy(clients.name);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(data: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(data).returning();
    
    // Create audit log
    await this.createAuditLog({
      companyId: data.companyId,
      userId: data.assignedTo || 1,
      action: "CREATE",
      resource: "client",
      resourceId: client.id.toString(),
      oldValues: {},
      newValues: data,
      metadata: { module: "compliance_management" }
    });
    
    return client;
  }

  async updateClient(id: number, data: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = await this.getClient(id);
    if (!existing) return undefined;

    const [updated] = await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();

    // Create audit log
    await this.createAuditLog({
      companyId: existing.companyId,
      userId: data.assignedTo || existing.assignedTo || 1,
      action: "UPDATE",
      resource: "client",
      resourceId: id.toString(),
      oldValues: existing,
      newValues: data,
      metadata: { module: "compliance_management" }
    });

    return updated || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const existing = await this.getClient(id);
    if (!existing) return false;

    const result = await db.delete(clients).where(eq(clients.id, id));
    
    // Create audit log
    await this.createAuditLog({
      companyId: existing.companyId,
      userId: existing.assignedTo || 1,
      action: "DELETE",
      resource: "client",
      resourceId: id.toString(),
      oldValues: existing,
      newValues: {},
      metadata: { module: "compliance_management" }
    });

    return result.rowCount > 0;
  }

  // Onboarding Workflows
  async getOnboardingWorkflows(clientId: number): Promise<OnboardingWorkflow[]> {
    return await db.select().from(onboardingWorkflows)
      .where(eq(onboardingWorkflows.clientId, clientId))
      .orderBy(onboardingWorkflows.stepNumber);
  }

  async createOnboardingWorkflow(data: InsertOnboardingWorkflow): Promise<OnboardingWorkflow> {
    const [workflow] = await db.insert(onboardingWorkflows).values(data).returning();
    return workflow;
  }

  async updateOnboardingWorkflow(id: number, data: Partial<InsertOnboardingWorkflow>): Promise<OnboardingWorkflow | undefined> {
    const [updated] = await db
      .update(onboardingWorkflows)
      .set(data)
      .where(eq(onboardingWorkflows.id, id))
      .returning();
    return updated || undefined;
  }

  // Engagement Letters
  async getEngagementLetters(clientId: number): Promise<EngagementLetter[]> {
    return await db.select().from(engagementLetters)
      .where(eq(engagementLetters.clientId, clientId))
      .orderBy(desc(engagementLetters.createdAt));
  }

  async getEngagementLetter(id: number): Promise<EngagementLetter | undefined> {
    const [letter] = await db.select().from(engagementLetters).where(eq(engagementLetters.id, id));
    return letter || undefined;
  }

  async createEngagementLetter(data: InsertEngagementLetter): Promise<EngagementLetter> {
    const [letter] = await db.insert(engagementLetters).values(data).returning();
    return letter;
  }

  async updateEngagementLetter(id: number, data: Partial<InsertEngagementLetter>): Promise<EngagementLetter | undefined> {
    const [updated] = await db
      .update(engagementLetters)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(engagementLetters.id, id))
      .returning();
    return updated || undefined;
  }

  // SARS Compliance
  async getSarsCompliance(clientId: number): Promise<SarsCompliance[]> {
    return await db.select().from(sarsCompliance)
      .where(eq(sarsCompliance.clientId, clientId))
      .orderBy(desc(sarsCompliance.dueDate));
  }

  async getSarsComplianceByType(clientId: number, complianceType: string): Promise<SarsCompliance[]> {
    return await db.select().from(sarsCompliance)
      .where(and(
        eq(sarsCompliance.clientId, clientId),
        eq(sarsCompliance.complianceType, complianceType)
      ))
      .orderBy(desc(sarsCompliance.dueDate));
  }

  async createSarsCompliance(data: InsertSarsCompliance): Promise<SarsCompliance> {
    const [compliance] = await db.insert(sarsCompliance).values(data).returning();
    return compliance;
  }

  async updateSarsCompliance(id: number, data: Partial<InsertSarsCompliance>): Promise<SarsCompliance | undefined> {
    const [updated] = await db
      .update(sarsCompliance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sarsCompliance.id, id))
      .returning();
    return updated || undefined;
  }

  // CIPC Compliance
  async getCipcCompliance(clientId: number): Promise<CipcCompliance[]> {
    return await db.select().from(cipcCompliance)
      .where(eq(cipcCompliance.clientId, clientId))
      .orderBy(desc(cipcCompliance.dueDate));
  }

  async createCipcCompliance(data: InsertCipcCompliance): Promise<CipcCompliance> {
    const [compliance] = await db.insert(cipcCompliance).values(data).returning();
    return compliance;
  }

  async updateCipcCompliance(id: number, data: Partial<InsertCipcCompliance>): Promise<CipcCompliance | undefined> {
    const [updated] = await db
      .update(cipcCompliance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cipcCompliance.id, id))
      .returning();
    return updated || undefined;
  }

  // Labour Compliance
  async getLabourCompliance(clientId: number): Promise<LabourCompliance[]> {
    return await db.select().from(labourCompliance)
      .where(eq(labourCompliance.clientId, clientId))
      .orderBy(desc(labourCompliance.dueDate));
  }

  async createLabourCompliance(data: InsertLabourCompliance): Promise<LabourCompliance> {
    const [compliance] = await db.insert(labourCompliance).values(data).returning();
    return compliance;
  }

  async updateLabourCompliance(id: number, data: Partial<InsertLabourCompliance>): Promise<LabourCompliance | undefined> {
    const [updated] = await db
      .update(labourCompliance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(labourCompliance.id, id))
      .returning();
    return updated || undefined;
  }

  // Document Management
  async getComplianceDocuments(clientId: number, category?: string): Promise<ComplianceDocument[]> {
    let query = db.select().from(complianceDocuments)
      .where(eq(complianceDocuments.clientId, clientId));
    
    if (category) {
      query = query.where(eq(complianceDocuments.category, category));
    }
    
    return query.orderBy(desc(complianceDocuments.createdAt));
  }

  async createComplianceDocument(data: InsertComplianceDocument): Promise<ComplianceDocument> {
    const [document] = await db.insert(complianceDocuments).values(data).returning();
    return document;
  }

  async updateComplianceDocument(id: number, data: Partial<InsertComplianceDocument>): Promise<ComplianceDocument | undefined> {
    const [updated] = await db
      .update(complianceDocuments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(complianceDocuments.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteComplianceDocument(id: number): Promise<boolean> {
    const result = await db.delete(complianceDocuments).where(eq(complianceDocuments.id, id));
    return result.rowCount > 0;
  }

  // Task Management
  async getComplianceTasks(companyId: number, clientId?: number, assignedTo?: number): Promise<ComplianceTask[]> {
    let query = db.select().from(complianceTasks)
      .where(eq(complianceTasks.companyId, companyId));
    
    if (clientId) {
      query = query.where(eq(complianceTasks.clientId, clientId));
    }
    
    if (assignedTo) {
      query = query.where(eq(complianceTasks.assignedTo, assignedTo));
    }
    
    return query.orderBy(complianceTasks.dueDate, desc(complianceTasks.priority));
  }

  async createComplianceTask(data: InsertComplianceTask): Promise<ComplianceTask> {
    const [task] = await db.insert(complianceTasks).values(data).returning();
    return task;
  }

  async updateComplianceTask(id: number, data: Partial<InsertComplianceTask>): Promise<ComplianceTask | undefined> {
    const [updated] = await db
      .update(complianceTasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(complianceTasks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteComplianceTask(id: number): Promise<boolean> {
    const result = await db.delete(complianceTasks).where(eq(complianceTasks.id, id));
    return result.rowCount > 0;
  }

  // Compliance Calendar
  async getComplianceCalendar(companyId: number, startDate?: Date, endDate?: Date): Promise<ComplianceCalendar[]> {
    let query = db.select().from(complianceCalendar)
      .where(eq(complianceCalendar.companyId, companyId));
    
    if (startDate) {
      query = query.where(gte(complianceCalendar.eventDate, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(complianceCalendar.eventDate, endDate));
    }
    
    return query.orderBy(complianceCalendar.eventDate);
  }

  async createComplianceCalendarEvent(data: InsertComplianceCalendar): Promise<ComplianceCalendar> {
    const [event] = await db.insert(complianceCalendar).values(data).returning();
    return event;
  }

  async updateComplianceCalendarEvent(id: number, data: Partial<InsertComplianceCalendar>): Promise<ComplianceCalendar | undefined> {
    const [updated] = await db
      .update(complianceCalendar)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(complianceCalendar.id, id))
      .returning();
    return updated || undefined;
  }

  // Correspondence Tracker
  async getCorrespondence(clientId: number): Promise<CorrespondenceTracker[]> {
    return await db.select().from(correspondenceTracker)
      .where(eq(correspondenceTracker.clientId, clientId))
      .orderBy(desc(correspondenceTracker.receivedDate));
  }

  async createCorrespondence(data: InsertCorrespondenceTracker): Promise<CorrespondenceTracker> {
    const [correspondence] = await db.insert(correspondenceTracker).values(data).returning();
    return correspondence;
  }

  async updateCorrespondence(id: number, data: Partial<InsertCorrespondenceTracker>): Promise<CorrespondenceTracker | undefined> {
    const [updated] = await db
      .update(correspondenceTracker)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(correspondenceTracker.id, id))
      .returning();
    return updated || undefined;
  }

  // Recurring Billing
  async getRecurringBilling(companyId: number): Promise<RecurringBilling[]> {
    return await db.select().from(recurringBilling)
      .where(eq(recurringBilling.companyId, companyId))
      .orderBy(recurringBilling.nextBillingDate);
  }

  async createRecurringBilling(data: InsertRecurringBilling): Promise<RecurringBilling> {
    const [billing] = await db.insert(recurringBilling).values(data).returning();
    return billing;
  }

  async updateRecurringBilling(id: number, data: Partial<InsertRecurringBilling>): Promise<RecurringBilling | undefined> {
    const [updated] = await db
      .update(recurringBilling)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(recurringBilling.id, id))
      .returning();
    return updated || undefined;
  }

  // AI Assistant
  async getAiAssistantConversations(userId: number, companyId: number): Promise<AiAssistantConversation[]> {
    return await db.select().from(aiAssistantConversations)
      .where(and(
        eq(aiAssistantConversations.userId, userId),
        eq(aiAssistantConversations.companyId, companyId)
      ))
      .orderBy(desc(aiAssistantConversations.updatedAt));
  }

  async createAiAssistantConversation(data: InsertAiAssistantConversation): Promise<AiAssistantConversation> {
    const [conversation] = await db.insert(aiAssistantConversations).values(data).returning();
    return conversation;
  }

  async getAiAssistantMessages(conversationId: number): Promise<AiAssistantMessage[]> {
    return await db.select().from(aiAssistantMessages)
      .where(eq(aiAssistantMessages.conversationId, conversationId))
      .orderBy(aiAssistantMessages.createdAt);
  }

  async createAiAssistantMessage(data: InsertAiAssistantMessage): Promise<AiAssistantMessage> {
    const [message] = await db.insert(aiAssistantMessages).values(data).returning();
    
    // Update conversation message count and last message
    await db
      .update(aiAssistantConversations)
      .set({ 
        messageCount: sql`${aiAssistantConversations.messageCount} + 1`,
        lastMessage: data.content.substring(0, 100),
        updatedAt: new Date()
      })
      .where(eq(aiAssistantConversations.id, data.conversationId));
    
    return message;
  }

  // Compliance Dashboard Analytics
  async getComplianceDashboardStats(companyId: number): Promise<any> {
    // Get client counts
    const clientStats = await db
      .select({
        total: count(clients.id),
        active: count(sql`CASE WHEN ${clients.status} = 'active' THEN 1 END`),
        onboarding: count(sql`CASE WHEN ${clients.onboardingStatus} = 'pending' OR ${clients.onboardingStatus} = 'in_progress' THEN 1 END`)
      })
      .from(clients)
      .where(eq(clients.companyId, companyId));

    // Get task counts
    const taskStats = await db
      .select({
        total: count(complianceTasks.id),
        pending: count(sql`CASE WHEN ${complianceTasks.status} = 'pending' THEN 1 END`),
        overdue: count(sql`CASE WHEN ${complianceTasks.status} = 'pending' AND ${complianceTasks.dueDate} < CURRENT_DATE THEN 1 END`),
        urgent: count(sql`CASE WHEN ${complianceTasks.priority} = 'urgent' THEN 1 END`)
      })
      .from(complianceTasks)
      .where(eq(complianceTasks.companyId, companyId));

    // Get upcoming deadlines
    const upcomingDeadlines = await db
      .select()
      .from(complianceCalendar)
      .where(and(
        eq(complianceCalendar.companyId, companyId),
        gte(complianceCalendar.eventDate, new Date()),
        lte(complianceCalendar.eventDate, sql`CURRENT_DATE + INTERVAL '30 days'`)
      ))
      .orderBy(complianceCalendar.eventDate)
      .limit(10);

    return {
      clients: clientStats[0] || { total: 0, active: 0, onboarding: 0 },
      tasks: taskStats[0] || { total: 0, pending: 0, overdue: 0, urgent: 0 },
      upcomingDeadlines
    };
  }

  async generateFinancialInsights(companyId: number, userId: number): Promise<SpendingWizardInsight[]> {
    // Get company's financial data for analysis
    const recentExpenses = await db.select()
      .from(expenses)
      .where(and(
        eq(expenses.companyId, companyId),
        gte(expenses.expenseDate, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) // Last 90 days
      ))
      .orderBy(desc(expenses.expenseDate));

    const recentInvoices = await db.select()
      .from(invoices)
      .where(and(
        eq(invoices.companyId, companyId),
        gte(invoices.issueDate, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) // Last 90 days
      ))
      .orderBy(desc(invoices.issueDate));

    const insights: InsertSpendingWizardInsight[] = [];

    // Analyze spending patterns
    if (recentExpenses.length > 0) {
      const totalExpenses = recentExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const avgExpense = totalExpenses / recentExpenses.length;

      // High expense alert
      const highExpenses = recentExpenses.filter(exp => parseFloat(exp.amount) > avgExpense * 2);
      if (highExpenses.length > 0) {
        insights.push({
          companyId,
          userId,
          insightType: 'spending_pattern',
          title: 'Unusual High Expenses Detected',
          description: `You've had ${highExpenses.length} expenses significantly above your average in the last 90 days.`,
          priority: 'high',
          category: 'expense_management',
          dataPoints: { highExpenses: highExpenses.length, averageExpense: avgExpense },
          recommendations: ['Review high-value expenses for optimization opportunities', 'Consider implementing expense approval workflows'],
          estimatedImpact: (totalExpenses * 0.1).toFixed(2), // Potential 10% savings
          illustration: '💰'
        });
      }
    }

    // Analyze cash flow
    if (recentInvoices.length > 0 && recentExpenses.length > 0) {
      const totalRevenue = recentInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      const totalExpenses = recentExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const profitMargin = ((totalRevenue - totalExpenses) / totalRevenue) * 100;

      if (profitMargin < 20) {
        insights.push({
          companyId,
          userId,
          insightType: 'cash_flow_forecast',
          title: 'Low Profit Margin Alert',
          description: `Your profit margin is ${profitMargin.toFixed(1)}%, which is below the recommended 20% for healthy businesses.`,
          priority: 'high',
          category: 'profitability',
          dataPoints: { profitMargin, totalRevenue, totalExpenses },
          recommendations: ['Review pricing strategy', 'Analyze cost structure for optimization', 'Focus on high-margin services/products'],
          estimatedImpact: (totalRevenue * 0.05).toFixed(2), // Potential 5% revenue increase
          illustration: '📊'
        });
      }
    }

    // Save insights to database
    const savedInsights = [];
    for (const insight of insights) {
      const saved = await this.createWizardInsight(insight);
      savedInsights.push(saved);
    }

    return savedInsights;
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

  async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.slug, slug));
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
            activatedBy: userId,
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
            activatedBy: userId,
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
  // Comprehensive Financial Reporting Methods - Integrate all transaction data
  async getComprehensiveProfitLoss(companyId: number, startDate: Date, endDate: Date) {
    try {
      // Get all revenue sources: invoice totals
      const invoiceRevenue = await db
        .select({
          category: sql<string>`'Sales Revenue'`,
          amount: sql<string>`COALESCE(SUM(${invoices.total}), '0.00')`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.companyId, companyId),
            gte(invoices.invoiceDate, startDate),
            lte(invoices.invoiceDate, endDate),
            ne(invoices.status, "draft")
          )
        );

      // Get all expenses by category
      const expenseData = await db
        .select({
          category: expenseCategories.name,
          amount: sql<string>`COALESCE(SUM(${expenses.amount}), '0.00')`,
        })
        .from(expenses)
        .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
        .where(
          and(
            eq(expenses.companyId, companyId),
            gte(expenses.expenseDate, startDate),
            lte(expenses.expenseDate, endDate)
          )
        )
        .groupBy(expenseCategories.name);

      // Get journal entry data for other income/expenses
      const journalData = await db
        .select({
          accountName: chartOfAccounts.name,
          accountType: chartOfAccounts.accountType,
          debitTotal: sql<string>`COALESCE(SUM(${journalEntryLines.debitAmount}), '0.00')`,
          creditTotal: sql<string>`COALESCE(SUM(${journalEntryLines.creditAmount}), '0.00')`,
        })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
        .where(
          and(
            eq(journalEntries.companyId, companyId),
            gte(journalEntries.transactionDate, startDate),
            lte(journalEntries.transactionDate, endDate),
            eq(journalEntries.status, "posted"),
            inArray(chartOfAccounts.accountType, ['revenue', 'expense'])
          )
        )
        .groupBy(chartOfAccounts.name, chartOfAccounts.accountType);

      // Calculate totals
      const totalRevenue = (parseFloat(invoiceRevenue[0]?.amount || "0") +
        journalData
          .filter(item => item.accountType === 'revenue')
          .reduce((sum, item) => sum + parseFloat(item.creditTotal) - parseFloat(item.debitTotal), 0)
      ).toFixed(2);

      const totalExpenses = (expenseData
        .reduce((sum, item) => sum + parseFloat(item.amount), 0) +
        journalData
          .filter(item => item.accountType === 'expense')
          .reduce((sum, item) => sum + parseFloat(item.debitTotal) - parseFloat(item.creditTotal), 0)
      ).toFixed(2);

      const netProfit = (parseFloat(totalRevenue) - parseFloat(totalExpenses)).toFixed(2);

      return {
        revenue: [
          { category: "Sales Revenue", amount: invoiceRevenue[0]?.amount || "0.00" },
          ...journalData
            .filter(item => item.accountType === 'revenue')
            .map(item => ({
              category: item.accountName,
              amount: (parseFloat(item.creditTotal) - parseFloat(item.debitTotal)).toFixed(2)
            }))
        ],
        expenses: [
          ...expenseData,
          ...journalData
            .filter(item => item.accountType === 'expense')
            .map(item => ({
              category: item.accountName,
              amount: (parseFloat(item.debitTotal) - parseFloat(item.creditTotal)).toFixed(2)
            }))
        ],
        totalRevenue,
        totalExpenses,
        grossProfit: totalRevenue,
        netProfit,
      };
    } catch (error) {
      console.error("Error generating comprehensive profit & loss:", error);
      throw error;
    }
  }

  async getComprehensiveBalanceSheet(companyId: number, asOfDate: Date) {
    try {
      // Get all account balances from journal entries
      const accountBalances = await db
        .select({
          accountId: chartOfAccounts.id,
          accountName: chartOfAccounts.name,
          accountType: chartOfAccounts.accountType,
          accountCode: chartOfAccounts.accountCode,
          debitTotal: sql<string>`COALESCE(SUM(${journalEntryLines.debitAmount}), '0.00')`,
          creditTotal: sql<string>`COALESCE(SUM(${journalEntryLines.creditAmount}), '0.00')`,
        })
        .from(chartOfAccounts)
        .leftJoin(journalEntryLines, eq(chartOfAccounts.id, journalEntryLines.accountId))
        .leftJoin(journalEntries, and(
          eq(journalEntryLines.journalEntryId, journalEntries.id),
          lte(journalEntries.transactionDate, asOfDate),
          eq(journalEntries.status, "posted")
        ))
        .where(eq(chartOfAccounts.companyId, companyId))
        .groupBy(chartOfAccounts.id, chartOfAccounts.name, chartOfAccounts.accountType, chartOfAccounts.accountCode)
        .orderBy(chartOfAccounts.accountCode);

      // Calculate balances based on account type (normal balance)
      const processedBalances = accountBalances.map(account => {
        const debit = parseFloat(account.debitTotal);
        const credit = parseFloat(account.creditTotal);
        
        let balance;
        if (['asset', 'expense'].includes(account.accountType)) {
          balance = debit - credit; // Normal debit balance
        } else {
          balance = credit - debit; // Normal credit balance (liability, equity, revenue)
        }
        
        return {
          account: account.accountName,
          amount: balance.toFixed(2),
          type: account.accountType,
          code: account.accountCode,
        };
      });

      // Group by balance sheet categories
      const assets = {
        currentAssets: processedBalances
          .filter(item => item.type === 'asset' && parseFloat(item.amount) !== 0)
          .filter(item => item.code.startsWith('1100') || item.code.startsWith('1200')), // Current assets
        nonCurrentAssets: processedBalances
          .filter(item => item.type === 'asset' && parseFloat(item.amount) !== 0)
          .filter(item => item.code.startsWith('1300') || item.code.startsWith('1400')), // Non-current assets
        totalAssets: processedBalances
          .filter(item => item.type === 'asset')
          .reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2),
      };

      const liabilities = {
        currentLiabilities: processedBalances
          .filter(item => item.type === 'liability' && parseFloat(item.amount) !== 0)
          .filter(item => item.code.startsWith('2100')), // Current liabilities
        nonCurrentLiabilities: processedBalances
          .filter(item => item.type === 'liability' && parseFloat(item.amount) !== 0)
          .filter(item => item.code.startsWith('2200') || item.code.startsWith('2300')), // Non-current liabilities
        totalLiabilities: processedBalances
          .filter(item => item.type === 'liability')
          .reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2),
      };

      const equity = {
        items: processedBalances
          .filter(item => item.type === 'equity' && parseFloat(item.amount) !== 0),
        totalEquity: processedBalances
          .filter(item => item.type === 'equity')
          .reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2),
      };

      const totalLiabilitiesAndEquity = (
        parseFloat(liabilities.totalLiabilities) + parseFloat(equity.totalEquity)
      ).toFixed(2);

      return {
        assets,
        liabilities,
        equity,
        totalLiabilitiesAndEquity,
      };
    } catch (error) {
      console.error("Error generating comprehensive balance sheet:", error);
      throw error;
    }
  }

  // === CRITICAL MISSING FEATURES IMPLEMENTATION ===

  // Credit Notes Management - Critical missing feature
  async getCreditNotes(companyId: number): Promise<CreditNote[]> {
    return await db
      .select()
      .from(creditNotes)
      .where(eq(creditNotes.companyId, companyId))
      .orderBy(desc(creditNotes.createdAt));
  }

  async getCreditNote(id: number): Promise<CreditNote | undefined> {
    const [creditNote] = await db
      .select()
      .from(creditNotes)
      .where(eq(creditNotes.id, id));
    return creditNote;
  }

  async createCreditNote(creditNote: InsertCreditNote): Promise<CreditNote> {
    const [newCreditNote] = await db
      .insert(creditNotes)
      .values(creditNote)
      .returning();
    return newCreditNote;
  }

  async updateCreditNote(id: number, creditNote: Partial<InsertCreditNote>): Promise<CreditNote | undefined> {
    const [updatedCreditNote] = await db
      .update(creditNotes)
      .set({ ...creditNote, updatedAt: new Date() })
      .where(eq(creditNotes.id, id))
      .returning();
    return updatedCreditNote;
  }

  async deleteCreditNote(id: number): Promise<boolean> {
    const result = await db.delete(creditNotes).where(eq(creditNotes.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCreditNoteItems(creditNoteId: number): Promise<CreditNoteItem[]> {
    return await db
      .select()
      .from(creditNoteItems)
      .where(eq(creditNoteItems.creditNoteId, creditNoteId))
      .orderBy(creditNoteItems.sortOrder);
  }

  async createCreditNoteItem(item: InsertCreditNoteItem): Promise<CreditNoteItem> {
    const [newItem] = await db
      .insert(creditNoteItems)
      .values(item)
      .returning();
    return newItem;
  }

  async applyCreditNoteToInvoice(creditNoteId: number, invoiceId: number, amount: number): Promise<boolean> {
    try {
      // Update credit note applied amount
      await db
        .update(creditNotes)
        .set({ 
          appliedAmount: sql`applied_amount + ${amount}`,
          remainingAmount: sql`remaining_amount - ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(creditNotes.id, creditNoteId));

      // Update invoice total (reduce by credit note amount)
      await db
        .update(invoices)
        .set({ 
          total: sql`total - ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(invoices.id, invoiceId));

      return true;
    } catch (error) {
      console.error("Error applying credit note to invoice:", error);
      return false;
    }
  }

  // Invoice Reminders - Critical missing feature
  async getInvoiceReminders(companyId: number): Promise<InvoiceReminder[]> {
    return await db
      .select()
      .from(invoiceReminders)
      .where(eq(invoiceReminders.companyId, companyId))
      .orderBy(desc(invoiceReminders.createdAt));
  }

  async createInvoiceReminder(reminder: InsertInvoiceReminder): Promise<InvoiceReminder> {
    const [newReminder] = await db
      .insert(invoiceReminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async updateInvoiceReminder(id: number, reminder: Partial<InsertInvoiceReminder>): Promise<InvoiceReminder | undefined> {
    const [updatedReminder] = await db
      .update(invoiceReminders)
      .set({ ...reminder, updatedAt: new Date() })
      .where(eq(invoiceReminders.id, id))
      .returning();
    return updatedReminder;
  }

  async markReminderSent(id: number, sentDate: Date, method: string): Promise<boolean> {
    const result = await db
      .update(invoiceReminders)
      .set({ 
        status: 'sent',
        sentDate,
        sentMethod: method,
        updatedAt: new Date()
      })
      .where(eq(invoiceReminders.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getOverdueInvoicesForReminders(companyId: number): Promise<Invoice[]> {
    const today = new Date();
    return await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.companyId, companyId),
          eq(invoices.status, 'overdue'),
          lte(invoices.dueDate, today)
        )
      );
  }

  async processAutomaticReminders(companyId: number): Promise<number> {
    // This would contain logic to process automatic reminders
    // For now, return 0 as a placeholder
    return 0;
  }

  // Invoice Aging Reports - Critical missing feature
  async getInvoiceAgingReports(companyId: number): Promise<InvoiceAgingReport[]> {
    return await db
      .select()
      .from(invoiceAgingReports)
      .where(eq(invoiceAgingReports.companyId, companyId))
      .orderBy(desc(invoiceAgingReports.createdAt));
  }

  async generateInvoiceAgingReport(companyId: number, reportName: string, agingPeriods: number[]): Promise<InvoiceAgingReport> {
    try {
      const today = new Date();
      
      // Get all outstanding invoices
      const outstandingInvoices = await db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.companyId, companyId),
            or(eq(invoices.status, 'sent'), eq(invoices.status, 'overdue'))
          )
        );

      // Calculate aging buckets
      let currentAmount = 0;
      let period1Amount = 0; // 1-30 days
      let period2Amount = 0; // 31-60 days  
      let period3Amount = 0; // 61-90 days
      let period4Amount = 0; // 90+ days

      const reportData: any[] = [];

      outstandingInvoices.forEach(invoice => {
        const daysPastDue = Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        const amount = parseFloat(invoice.total);

        if (daysPastDue <= 0) {
          currentAmount += amount;
        } else if (daysPastDue <= 30) {
          period1Amount += amount;
        } else if (daysPastDue <= 60) {
          period2Amount += amount;
        } else if (daysPastDue <= 90) {
          period3Amount += amount;
        } else {
          period4Amount += amount;
        }

        reportData.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerId: invoice.customerId,
          amount,
          dueDate: invoice.dueDate,
          daysPastDue,
          agingBucket: daysPastDue <= 0 ? 'current' : 
                      daysPastDue <= 30 ? '1-30' :
                      daysPastDue <= 60 ? '31-60' :
                      daysPastDue <= 90 ? '61-90' : '90+'
        });
      });

      const totalOutstanding = currentAmount + period1Amount + period2Amount + period3Amount + period4Amount;

      const reportInsert: InsertInvoiceAgingReport = {
        companyId,
        reportDate: today.toISOString().split('T')[0],
        reportName,
        agingPeriods,
        totalOutstanding: totalOutstanding.toFixed(2),
        currentAmount: currentAmount.toFixed(2),
        period1Amount: period1Amount.toFixed(2),
        period2Amount: period2Amount.toFixed(2),
        period3Amount: period3Amount.toFixed(2),
        period4Amount: period4Amount.toFixed(2),
        customerCount: new Set(outstandingInvoices.map(inv => inv.customerId)).size,
        invoiceCount: outstandingInvoices.length,
        reportData,
        generatedBy: null // Would be set from the authenticated user context
      };

      const [report] = await db
        .insert(invoiceAgingReports)
        .values(reportInsert)
        .returning();

      return report;
    } catch (error) {
      console.error("Error generating invoice aging report:", error);
      throw error;
    }
  }

  async getLatestAgingReport(companyId: number): Promise<InvoiceAgingReport | undefined> {
    const [report] = await db
      .select()
      .from(invoiceAgingReports)
      .where(eq(invoiceAgingReports.companyId, companyId))
      .orderBy(desc(invoiceAgingReports.createdAt))
      .limit(1);
    return report;
  }

  // Approval Workflows - Critical missing feature
  async getApprovalWorkflows(companyId: number): Promise<ApprovalWorkflow[]> {
    return await db
      .select()
      .from(approvalWorkflows)
      .where(eq(approvalWorkflows.companyId, companyId))
      .orderBy(approvalWorkflows.workflowName);
  }

  async getApprovalWorkflow(id: number): Promise<ApprovalWorkflow | undefined> {
    const [workflow] = await db
      .select()
      .from(approvalWorkflows)
      .where(eq(approvalWorkflows.id, id));
    return workflow;
  }

  async createApprovalWorkflow(workflow: InsertApprovalWorkflow): Promise<ApprovalWorkflow> {
    const [newWorkflow] = await db
      .insert(approvalWorkflows)
      .values(workflow)
      .returning();
    return newWorkflow;
  }

  async updateApprovalWorkflow(id: number, workflow: Partial<InsertApprovalWorkflow>): Promise<ApprovalWorkflow | undefined> {
    const [updatedWorkflow] = await db
      .update(approvalWorkflows)
      .set({ ...workflow, updatedAt: new Date() })
      .where(eq(approvalWorkflows.id, id))
      .returning();
    return updatedWorkflow;
  }

  async deleteApprovalWorkflow(id: number): Promise<boolean> {
    const result = await db.delete(approvalWorkflows).where(eq(approvalWorkflows.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Approval Requests
  async getApprovalRequests(companyId: number, userId?: number): Promise<ApprovalRequest[]> {
    let query = db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.companyId, companyId));

    if (userId) {
      query = query.where(eq(approvalRequests.requestedBy, userId));
    }

    return await query.orderBy(desc(approvalRequests.createdAt));
  }

  async createApprovalRequest(request: InsertApprovalRequest): Promise<ApprovalRequest> {
    const [newRequest] = await db
      .insert(approvalRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async updateApprovalRequest(id: number, request: Partial<InsertApprovalRequest>): Promise<ApprovalRequest | undefined> {
    const [updatedRequest] = await db
      .update(approvalRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(approvalRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async processApprovalAction(requestId: number, userId: number, action: 'approve' | 'reject', comments?: string): Promise<boolean> {
    try {
      // Get the request
      const [request] = await db
        .select()
        .from(approvalRequests)
        .where(eq(approvalRequests.id, requestId));

      if (!request) return false;

      // Update approval history
      const history = Array.isArray(request.approvalHistory) ? request.approvalHistory : [];
      history.push({
        userId,
        action,
        comments: comments || '',
        timestamp: new Date().toISOString()
      });

      // Update request status
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const completedAt = new Date();

      await db
        .update(approvalRequests)
        .set({
          status: newStatus,
          approvalHistory: history,
          completedAt,
          updatedAt: new Date()
        })
        .where(eq(approvalRequests.id, requestId));

      return true;
    } catch (error) {
      console.error("Error processing approval action:", error);
      return false;
    }
  }

  // Bank Integrations - Critical missing feature
  async getBankIntegrations(companyId: number): Promise<BankIntegration[]> {
    return await db
      .select()
      .from(bankIntegrations)
      .where(eq(bankIntegrations.companyId, companyId))
      .orderBy(bankIntegrations.bankName);
  }

  async createBankIntegration(integration: InsertBankIntegration): Promise<BankIntegration> {
    const [newIntegration] = await db
      .insert(bankIntegrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  async updateBankIntegration(id: number, integration: Partial<InsertBankIntegration>): Promise<BankIntegration | undefined> {
    const [updatedIntegration] = await db
      .update(bankIntegrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(bankIntegrations.id, id))
      .returning();
    return updatedIntegration;
  }

  async deleteBankIntegration(id: number): Promise<boolean> {
    const result = await db.delete(bankIntegrations).where(eq(bankIntegrations.id, id));
    return (result.rowCount || 0) > 0;
  }

  async syncBankTransactions(integrationId: number): Promise<boolean> {
    try {
      // Placeholder for bank synchronization logic
      // In a real implementation, this would connect to the bank's API
      // and import transactions into the bank_transactions table
      
      await db
        .update(bankIntegrations)
        .set({
          lastSyncDate: new Date(),
          syncStatus: 'completed',
          updatedAt: new Date()
        })
        .where(eq(bankIntegrations.id, integrationId));

      return true;
    } catch (error) {
      console.error("Error syncing bank transactions:", error);
      
      await db
        .update(bankIntegrations)
        .set({
          syncStatus: 'error',
          lastSyncError: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date()
        })
        .where(eq(bankIntegrations.id, integrationId));

      return false;
    }
  }

  // ===== POS MODULE IMPLEMENTATION =====
  
  // POS Terminals
  async getPosTerminals(companyId: number): Promise<PosTerminal[]> {
    return await db
      .select()
      .from(posTerminals)
      .where(eq(posTerminals.companyId, companyId))
      .orderBy(desc(posTerminals.createdAt));
  }

  async getPosTerminal(id: number): Promise<PosTerminal | undefined> {
    const [terminal] = await db
      .select()
      .from(posTerminals)
      .where(eq(posTerminals.id, id));
    return terminal;
  }

  async createPosTerminal(terminal: InsertPosTerminal): Promise<PosTerminal> {
    const [newTerminal] = await db
      .insert(posTerminals)
      .values(terminal)
      .returning();
    return newTerminal;
  }

  async updatePosTerminal(id: number, terminal: Partial<InsertPosTerminal>): Promise<PosTerminal | undefined> {
    const [updatedTerminal] = await db
      .update(posTerminals)
      .set({ ...terminal, updatedAt: new Date() })
      .where(eq(posTerminals.id, id))
      .returning();
    return updatedTerminal;
  }

  async deletePosTerminal(id: number): Promise<boolean> {
    const result = await db.delete(posTerminals).where(eq(posTerminals.id, id));
    return (result.rowCount || 0) > 0;
  }

  // POS Sales
  async getPosSales(companyId: number, terminalId?: number): Promise<PosSale[]> {
    let query = db
      .select()
      .from(posSales)
      .where(eq(posSales.companyId, companyId));

    if (terminalId) {
      query = query.where(and(eq(posSales.companyId, companyId), eq(posSales.terminalId, terminalId)));
    }

    return await query.orderBy(desc(posSales.saleDate));
  }

  async getPosSale(id: number): Promise<PosSaleWithItems | undefined> {
    const [sale] = await db
      .select()
      .from(posSales)
      .where(eq(posSales.id, id));

    if (!sale) return undefined;

    const items = await db
      .select()
      .from(posSaleItems)
      .where(eq(posSaleItems.saleId, id));

    const payments = await db
      .select()
      .from(posPayments)
      .where(eq(posPayments.saleId, id));

    return {
      ...sale,
      items,
      payments
    };
  }

  async createPosSale(
    sale: InsertPosSale, 
    items: Omit<InsertPosSaleItem, 'saleId'>[], 
    payments: Omit<InsertPosPayment, 'saleId'>[]
  ): Promise<PosSaleWithItems> {
    // Generate POS sale number
    const saleNumber = await this.getNextDocumentNumber(sale.companyId, 'pos_sale');
    
    const [newSale] = await db
      .insert(posSales)
      .values({ ...sale, saleNumber })
      .returning();

    // Insert sale items
    const saleItems = items.length > 0 ? await db
      .insert(posSaleItems)
      .values(items.map(item => ({ ...item, saleId: newSale.id })))
      .returning() : [];

    // Insert payments
    const salePayments = payments.length > 0 ? await db
      .insert(posPayments)
      .values(payments.map(payment => ({ ...payment, saleId: newSale.id })))
      .returning() : [];

    // Update inventory for products if product_id exists
    for (const item of saleItems) {
      if (item.productId) {
        await this.createInventoryTransaction({
          companyId: sale.companyId,
          productId: item.productId,
          transactionType: 'out',
          quantity: -Math.abs(item.quantity), // Negative for outgoing
          cost: item.unitPrice,
          reference: `POS Sale ${saleNumber}`,
          notes: `Sold via POS - ${item.description}`,
          transactionDate: new Date()
        });
      }
    }

    return {
      ...newSale,
      items: saleItems,
      payments: salePayments
    };
  }

  async updatePosSale(id: number, sale: Partial<InsertPosSale>): Promise<PosSale | undefined> {
    const [updatedSale] = await db
      .update(posSales)
      .set({ ...sale, updatedAt: new Date() })
      .where(eq(posSales.id, id))
      .returning();
    return updatedSale;
  }

  async voidPosSale(id: number, voidReason: string, voidedBy: number): Promise<boolean> {
    const result = await db
      .update(posSales)
      .set({
        isVoided: true,
        voidReason,
        voidedBy,
        voidedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(posSales.id, id));

    // Reverse inventory transactions for voided sale
    const saleItems = await db
      .select()
      .from(posSaleItems)
      .where(eq(posSaleItems.saleId, id));

    const [sale] = await db
      .select()
      .from(posSales)
      .where(eq(posSales.id, id));

    if (sale) {
      for (const item of saleItems) {
        if (item.productId) {
          await this.createInventoryTransaction({
            companyId: sale.companyId,
            productId: item.productId,
            transactionType: 'in',
            quantity: Math.abs(item.quantity), // Positive to reverse the sale
            cost: item.unitPrice,
            reference: `POS Sale ${sale.saleNumber} - VOIDED`,
            notes: `Inventory returned due to voided sale - ${voidReason}`,
            transactionDate: new Date()
          });
        }
      }
    }

    return (result.rowCount || 0) > 0;
  }

  // POS Sale Items
  async getPosSaleItems(saleId: number): Promise<PosSaleItem[]> {
    return await db
      .select()
      .from(posSaleItems)
      .where(eq(posSaleItems.saleId, saleId));
  }

  async createPosSaleItem(item: InsertPosSaleItem): Promise<PosSaleItem> {
    const [newItem] = await db
      .insert(posSaleItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updatePosSaleItem(id: number, item: Partial<InsertPosSaleItem>): Promise<PosSaleItem | undefined> {
    const [updatedItem] = await db
      .update(posSaleItems)
      .set(item)
      .where(eq(posSaleItems.id, id))
      .returning();
    return updatedItem;
  }

  // POS Payments
  async getPosSalePayments(saleId: number): Promise<PosPayment[]> {
    return await db
      .select()
      .from(posPayments)
      .where(eq(posPayments.saleId, saleId));
  }

  async createPosPayment(payment: InsertPosPayment): Promise<PosPayment> {
    const [newPayment] = await db
      .insert(posPayments)
      .values(payment)
      .returning();
    return newPayment;
  }

  // POS Shifts
  async getPosShifts(companyId: number, terminalId?: number): Promise<PosShift[]> {
    let query = db
      .select()
      .from(posShifts)
      .where(eq(posShifts.companyId, companyId));

    if (terminalId) {
      query = query.where(and(eq(posShifts.companyId, companyId), eq(posShifts.terminalId, terminalId)));
    }

    return await query.orderBy(desc(posShifts.startTime));
  }

  async getCurrentShift(terminalId: number, userId: number): Promise<PosShift | undefined> {
    const [shift] = await db
      .select()
      .from(posShifts)
      .where(
        and(
          eq(posShifts.terminalId, terminalId),
          eq(posShifts.userId, userId),
          eq(posShifts.status, 'open')
        )
      )
      .orderBy(desc(posShifts.startTime));
    
    return shift;
  }

  async createPosShift(shift: InsertPosShift): Promise<PosShift> {
    const [newShift] = await db
      .insert(posShifts)
      .values(shift)
      .returning();
    return newShift;
  }

  async closeShift(id: number, closingData: { closingCash: number; notes?: string }): Promise<PosShift | undefined> {
    // Calculate expected cash from sales
    const salesTotal = await db
      .select({ total: sum(posSales.total) })
      .from(posSales)
      .leftJoin(posShifts, eq(posShifts.id, id))
      .where(
        and(
          eq(posSales.terminalId, posShifts.terminalId),
          gte(posSales.saleDate, posShifts.startTime),
          eq(posSales.paymentMethod, 'cash')
        )
      );

    const expectedCash = Number(salesTotal[0]?.total) || 0;
    const cashVariance = closingData.closingCash - expectedCash;

    const [updatedShift] = await db
      .update(posShifts)
      .set({
        endTime: new Date(),
        closingCash: closingData.closingCash,
        expectedCash,
        cashVariance,
        notes: closingData.notes,
        status: 'closed',
        updatedAt: new Date()
      })
      .where(eq(posShifts.id, id))
      .returning();

    return updatedShift;
  }

  // POS Refunds
  async getPosRefunds(companyId: number): Promise<PosRefund[]> {
    return await db
      .select()
      .from(posRefunds)
      .where(eq(posRefunds.companyId, companyId))
      .orderBy(desc(posRefunds.refundDate));
  }

  async getPosRefund(id: number): Promise<PosRefundWithItems | undefined> {
    const [refund] = await db
      .select()
      .from(posRefunds)
      .where(eq(posRefunds.id, id));

    if (!refund) return undefined;

    const refundItems = await db
      .select()
      .from(posRefundItems)
      .where(eq(posRefundItems.refundId, id));

    return {
      ...refund,
      refundItems
    };
  }

  async createPosRefund(
    refund: InsertPosRefund, 
    refundItems: Omit<InsertPosRefundItem, 'refundId'>[]
  ): Promise<PosRefundWithItems> {
    // Generate refund number
    const refundNumber = await this.getNextDocumentNumber(refund.companyId, 'pos_refund');
    
    const [newRefund] = await db
      .insert(posRefunds)
      .values({ ...refund, refundNumber })
      .returning();

    const newRefundItems = refundItems.length > 0 ? await db
      .insert(posRefundItems)
      .values(refundItems.map(item => ({ ...item, refundId: newRefund.id })))
      .returning() : [];

    // Update inventory for refunded items
    for (const item of newRefundItems) {
      const [originalItem] = await db
        .select()
        .from(posSaleItems)
        .where(eq(posSaleItems.id, item.originalItemId));

      if (originalItem?.productId) {
        await this.createInventoryTransaction({
          companyId: refund.companyId,
          productId: originalItem.productId,
          transactionType: 'in',
          quantity: Math.abs(item.quantityRefunded),
          cost: originalItem.unitPrice,
          reference: `POS Refund ${refundNumber}`,
          notes: `Refunded item: ${item.reason}`,
          transactionDate: new Date()
        });
      }
    }

    return {
      ...newRefund,
      refundItems: newRefundItems
    };
  }

  // POS Promotions
  async getPosPromotions(companyId: number): Promise<PosPromotion[]> {
    return await db
      .select()
      .from(posPromotions)
      .where(eq(posPromotions.companyId, companyId))
      .orderBy(desc(posPromotions.createdAt));
  }

  async getActivePosPromotions(companyId: number): Promise<PosPromotion[]> {
    const now = new Date();
    return await db
      .select()
      .from(posPromotions)
      .where(
        and(
          eq(posPromotions.companyId, companyId),
          eq(posPromotions.isActive, true),
          or(
            isNull(posPromotions.startDate),
            lte(posPromotions.startDate, now)
          ),
          or(
            isNull(posPromotions.endDate),
            gte(posPromotions.endDate, now)
          )
        )
      );
  }

  async createPosPromotion(promotion: InsertPosPromotion): Promise<PosPromotion> {
    const [newPromotion] = await db
      .insert(posPromotions)
      .values(promotion)
      .returning();
    return newPromotion;
  }

  async updatePosPromotion(id: number, promotion: Partial<InsertPosPromotion>): Promise<PosPromotion | undefined> {
    const [updatedPromotion] = await db
      .update(posPromotions)
      .set({ ...promotion, updatedAt: new Date() })
      .where(eq(posPromotions.id, id))
      .returning();
    return updatedPromotion;
  }

  // POS Loyalty Programs
  async getPosLoyaltyPrograms(companyId: number): Promise<PosLoyaltyProgram[]> {
    return await db
      .select()
      .from(posLoyaltyPrograms)
      .where(eq(posLoyaltyPrograms.companyId, companyId))
      .orderBy(desc(posLoyaltyPrograms.createdAt));
  }

  async createPosLoyaltyProgram(program: InsertPosLoyaltyProgram): Promise<PosLoyaltyProgram> {
    const [newProgram] = await db
      .insert(posLoyaltyPrograms)
      .values(program)
      .returning();
    return newProgram;
  }

  async getCustomerLoyalty(customerId: number, programId: number): Promise<PosCustomerLoyalty | undefined> {
    const [loyalty] = await db
      .select()
      .from(posCustomerLoyalty)
      .where(
        and(
          eq(posCustomerLoyalty.customerId, customerId),
          eq(posCustomerLoyalty.programId, programId)
        )
      );
    return loyalty;
  }

  async updateCustomerLoyaltyPoints(customerId: number, programId: number, pointsChange: number): Promise<PosCustomerLoyalty | undefined> {
    // Get existing loyalty record or create one
    let [loyalty] = await db
      .select()
      .from(posCustomerLoyalty)
      .where(
        and(
          eq(posCustomerLoyalty.customerId, customerId),
          eq(posCustomerLoyalty.programId, programId)
        )
      );

    if (!loyalty) {
      // Create new loyalty record
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId));
      
      if (!customer) return undefined;

      [loyalty] = await db
        .insert(posCustomerLoyalty)
        .values({
          companyId: customer.companyId,
          customerId,
          programId,
          currentPoints: Math.max(0, pointsChange),
          totalPointsEarned: pointsChange > 0 ? pointsChange : 0,
          totalPointsRedeemed: pointsChange < 0 ? Math.abs(pointsChange) : 0,
          lastEarnedDate: pointsChange > 0 ? new Date() : null,
          lastRedeemedDate: pointsChange < 0 ? new Date() : null,
        })
        .returning();
    } else {
      // Update existing loyalty record
      const newCurrentPoints = Math.max(0, loyalty.currentPoints + pointsChange);
      const newTotalEarned = pointsChange > 0 ? loyalty.totalPointsEarned + pointsChange : loyalty.totalPointsEarned;
      const newTotalRedeemed = pointsChange < 0 ? loyalty.totalPointsRedeemed + Math.abs(pointsChange) : loyalty.totalPointsRedeemed;

      [loyalty] = await db
        .update(posCustomerLoyalty)
        .set({
          currentPoints: newCurrentPoints,
          totalPointsEarned: newTotalEarned,
          totalPointsRedeemed: newTotalRedeemed,
          lastEarnedDate: pointsChange > 0 ? new Date() : loyalty.lastEarnedDate,
          lastRedeemedDate: pointsChange < 0 ? new Date() : loyalty.lastRedeemedDate,
          updatedAt: new Date()
        })
        .where(eq(posCustomerLoyalty.id, loyalty.id))
        .returning();
    }

    return loyalty;
  }

  // POS Reports & Analytics
  async getPosDailySalesReport(companyId: number, date: Date): Promise<{ totalSales: number; totalTransactions: number; averageTransaction: number }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [salesData] = await db
      .select({
        totalSales: sum(posSales.total),
        totalTransactions: count(posSales.id)
      })
      .from(posSales)
      .where(
        and(
          eq(posSales.companyId, companyId),
          gte(posSales.saleDate, startOfDay),
          lte(posSales.saleDate, endOfDay),
          eq(posSales.isVoided, false)
        )
      );

    const totalSales = Number(salesData.totalSales) || 0;
    const totalTransactions = salesData.totalTransactions || 0;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    return {
      totalSales,
      totalTransactions,
      averageTransaction
    };
  }

  async getPosTopProducts(companyId: number, startDate: Date, endDate: Date): Promise<{ productId: number; productName: string; totalQuantity: number; totalRevenue: number }[]> {
    const results = await db
      .select({
        productId: posSaleItems.productId,
        productName: products.name,
        totalQuantity: sum(posSaleItems.quantity),
        totalRevenue: sum(posSaleItems.lineTotal)
      })
      .from(posSaleItems)
      .leftJoin(posSales, eq(posSaleItems.saleId, posSales.id))
      .leftJoin(products, eq(posSaleItems.productId, products.id))
      .where(
        and(
          eq(posSales.companyId, companyId),
          gte(posSales.saleDate, startDate),
          lte(posSales.saleDate, endDate),
          eq(posSales.isVoided, false)
        )
      )
      .groupBy(posSaleItems.productId, products.name)
      .orderBy(desc(sum(posSaleItems.lineTotal)))
      .limit(10);

    return results.map(result => ({
      productId: result.productId || 0,
      productName: result.productName || 'Unknown Product',
      totalQuantity: Number(result.totalQuantity) || 0,
      totalRevenue: Number(result.totalRevenue) || 0
    }));
  }
  // =============================================
  // RBAC Implementation Methods
  // =============================================

  // System Roles
  async getSystemRoles(): Promise<SystemRole[]> {
    return await db.select().from(systemRoles).orderBy(desc(systemRoles.level));
  }

  async getSystemRole(id: number): Promise<SystemRole | undefined> {
    const [role] = await db.select().from(systemRoles).where(eq(systemRoles.id, id));
    return role || undefined;
  }

  async getSystemRoleByName(name: string): Promise<SystemRole | undefined> {
    const [role] = await db.select().from(systemRoles).where(eq(systemRoles.name, name));
    return role || undefined;
  }

  async createSystemRole(role: InsertSystemRole): Promise<SystemRole> {
    const [newRole] = await db.insert(systemRoles).values(role).returning();
    return newRole;
  }

  async updateSystemRole(id: number, role: Partial<InsertSystemRole>): Promise<SystemRole | undefined> {
    const [updatedRole] = await db
      .update(systemRoles)
      .set({ ...role, updatedAt: new Date() })
      .where(eq(systemRoles.id, id))
      .returning();
    return updatedRole || undefined;
  }

  async deleteSystemRole(id: number): Promise<boolean> {
    // Check if it's a system role that can't be deleted
    const role = await this.getSystemRole(id);
    if (!role || role.isSystemRole) {
      return false;
    }

    const result = await db.delete(systemRoles).where(eq(systemRoles.id, id));
    return result.rowCount > 0;
  }

  // Company Roles
  async getCompanyRoles(companyId: number): Promise<CompanyRole[]> {
    return await db
      .select()
      .from(companyRoles)
      .where(and(eq(companyRoles.companyId, companyId), eq(companyRoles.isActive, true)))
      .orderBy(companyRoles.displayName);
  }

  async getCompanyRole(id: number): Promise<CompanyRole | undefined> {
    const [role] = await db.select().from(companyRoles).where(eq(companyRoles.id, id));
    return role || undefined;
  }

  async getCompanyRoleByName(companyId: number, name: string): Promise<CompanyRole | undefined> {
    const [role] = await db
      .select()
      .from(companyRoles)
      .where(and(eq(companyRoles.companyId, companyId), eq(companyRoles.name, name)));
    return role || undefined;
  }

  async createCompanyRole(role: InsertCompanyRole): Promise<CompanyRole> {
    const [newRole] = await db.insert(companyRoles).values(role).returning();
    return newRole;
  }

  async updateCompanyRole(id: number, role: Partial<InsertCompanyRole>): Promise<CompanyRole | undefined> {
    const [updatedRole] = await db
      .update(companyRoles)
      .set({ ...role, updatedAt: new Date() })
      .where(eq(companyRoles.id, id))
      .returning();
    return updatedRole || undefined;
  }

  async deleteCompanyRole(id: number): Promise<boolean> {
    // Soft delete by setting isActive to false
    const [updatedRole] = await db
      .update(companyRoles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(companyRoles.id, id))
      .returning();
    return !!updatedRole;
  }

  // User Permissions
  async getUserPermission(userId: number, companyId: number): Promise<UserPermission | undefined> {
    const [permission] = await db
      .select()
      .from(userPermissions)
      .where(
        and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.companyId, companyId),
          eq(userPermissions.isActive, true)
        )
      );
    return permission || undefined;
  }

  async getAllUserPermissions(userId: number): Promise<UserPermission[]> {
    return await db
      .select()
      .from(userPermissions)
      .where(and(eq(userPermissions.userId, userId), eq(userPermissions.isActive, true)));
  }

  async createUserPermission(permission: InsertUserPermission): Promise<UserPermission> {
    const [newPermission] = await db.insert(userPermissions).values(permission).returning();
    return newPermission;
  }

  async updateUserPermission(id: number, permission: Partial<InsertUserPermission>): Promise<UserPermission | undefined> {
    const [updatedPermission] = await db
      .update(userPermissions)
      .set({ ...permission, updatedAt: new Date() })
      .where(eq(userPermissions.id, id))
      .returning();
    return updatedPermission || undefined;
  }

  async deleteUserPermission(id: number): Promise<boolean> {
    // Soft delete by setting isActive to false
    const [updatedPermission] = await db
      .update(userPermissions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(userPermissions.id, id))
      .returning();
    return !!updatedPermission;
  }

  async getUsersWithRole(roleId: number, roleType: 'system' | 'company'): Promise<User[]> {
    let query;
    if (roleType === 'system') {
      query = db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .innerJoin(userPermissions, eq(users.id, userPermissions.userId))
        .where(
          and(
            eq(userPermissions.systemRoleId, roleId),
            eq(userPermissions.isActive, true),
            eq(users.isActive, true)
          )
        );
    } else {
      query = db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .innerJoin(userPermissions, eq(users.id, userPermissions.userId))
        .where(
          and(
            eq(userPermissions.companyRoleId, roleId),
            eq(userPermissions.isActive, true),
            eq(users.isActive, true)
          )
        );
    }
    
    return await query;
  }

  // Get all users with role details for enhanced user management
  async getAllUsersWithRoleDetails(): Promise<any[]> {
    const usersQuery = sql`
      SELECT 
        u.id,
        u.username,
        u.name,
        u.email,
        u.phone,
        u.department,
        u.is_active,
        u.last_login,
        u.created_at,
        u.updated_at,
        u.login_attempts,
        u.is_locked,
        uc.role,
        uc.company_id,
        sr.display_name as role_display_name,
        sr.level as role_level,
        sr.color as role_color,
        sr.description as role_description,
        c.name as company_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'moduleId', up.module_id,
              'permissions', up.permissions
            )
          ) FILTER (WHERE up.module_id IS NOT NULL), 
          '[]'::json
        ) as assigned_modules,
        COALESCE(
          json_agg(
            DISTINCT up.custom_permissions
          ) FILTER (WHERE up.custom_permissions IS NOT NULL), 
          '[]'::json
        ) as custom_permissions,
        u.notes
      FROM users u
      LEFT JOIN company_users uc ON u.id = uc.user_id
      LEFT JOIN system_roles sr ON uc.role = sr.id
      LEFT JOIN companies c ON uc.company_id = c.id
      LEFT JOIN user_permissions up ON u.id = up.user_id AND uc.company_id = up.company_id
      GROUP BY u.id, uc.role, uc.company_id, sr.display_name, sr.level, sr.color, sr.description, c.name
      ORDER BY u.created_at DESC
    `;
    
    return await db.execute(usersQuery);
  }

  // Get roles with their permissions for permissions matrix
  async getRolesWithPermissions(): Promise<any[]> {
    const rolesQuery = sql`
      SELECT 
        sr.id,
        sr.name,
        sr.display_name,
        sr.description,
        sr.level,
        'from-blue-500 to-indigo-500' as color,
        'Shield' as icon,
        sr.is_system_role,
        50 as max_users,
        'standard' as security_level,
        COUNT(DISTINCT up.user_id) as current_users,
        '{}' as permissions
      FROM system_roles sr
      LEFT JOIN user_permissions up ON sr.id = up.system_role_id
      GROUP BY sr.id, sr.name, sr.display_name, sr.description, sr.level, sr.is_system_role
      ORDER BY sr.level DESC, sr.display_name
    `;
    
    const result = await db.execute(rolesQuery);
    return result.rows || [];
  }

  // Get active company modules - simplified version without complex tables
  async getActiveCompanyModules(companyId: number): Promise<any[]> {
    // Return default active modules for all companies
    return [
      { id: 'dashboard', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'user_management', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'customers', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'invoicing', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'products_services', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'expenses', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'suppliers', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'pos_sales', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'chart_of_accounts', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'journal_entries', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'banking', is_active: true, activated_date: new Date(), activated_by: 1 },
      { id: 'financial_reports', is_active: true, activated_date: new Date(), activated_by: 1 }
    ];
  }

  // Get company module settings - simplified version
  async getCompanyModuleSettings(companyId: number): Promise<any[]> {
    // Return the same default active modules
    return await this.getActiveCompanyModules(companyId);
  }

  // Update company module activation - simplified version
  async updateCompanyModuleActivation(data: {
    companyId: number;
    moduleId: string;
    isActive: boolean;
    reason?: string;
    updatedBy: number;
  }): Promise<void> {
    // In this simplified version, all modules are always active
    // This method exists for interface compliance but doesn't modify any data
    console.log(`Module ${data.moduleId} activation request for company ${data.companyId}: ${data.isActive}`);
  }

  // Update role permissions - simplified version using existing system_roles
  async updateRolePermissions(roleId: string, modulePermissions: Record<string, Record<string, boolean>>): Promise<void> {
    // Update the permissions JSON field in system_roles table
    const updateQuery = sql`
      UPDATE system_roles 
      SET permissions = ${JSON.stringify(modulePermissions)}, updated_at = NOW()
      WHERE id = ${roleId}
    `;
    
    await db.execute(updateQuery);
  }

  // Update individual role permission
  async updateRolePermission(roleId: number, module: string, permission: string, enabled: boolean): Promise<void> {
    try {
      // For now, this is a simplified implementation that logs the permission change
      // In a full implementation, this would update a role_permissions table
      console.log(`Role ${roleId}: ${enabled ? 'Granting' : 'Revoking'} ${permission} permission for ${module} module`);
      
      // Create audit log entry for the permission change
      await this.createAuditLog({
        userId: roleId,
        action: enabled ? 'GRANT_PERMISSION' : 'REVOKE_PERMISSION',
        resource: 'role_permission',
        resourceId: roleId,
        details: `${enabled ? 'Granted' : 'Revoked'} ${permission} permission for ${module} module`,
        oldValues: enabled ? null : { [module]: { [permission]: true } },
        newValues: enabled ? { [module]: { [permission]: true } } : null
      });
    } catch (error) {
      console.error('Error updating role permission:', error);
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId: number, isActive: boolean): Promise<void> {
    const updateQuery = sql`
      UPDATE users 
      SET is_active = ${isActive}, updated_at = NOW()
      WHERE id = ${userId}
    `;
    
    await db.execute(updateQuery);
  }

  // Update user role
  async updateUserRole(userId: number, roleId: string, options: {
    assignedBy: number;
    reason?: string;
    effectiveDate?: string;
  }): Promise<void> {
    const { assignedBy, reason } = options;
    
    const updateQuery = sql`
      UPDATE company_users 
      SET role = ${roleId}, updated_at = NOW()
      WHERE user_id = ${userId}
    `;
    
    await db.execute(updateQuery);
    
    // Log the role assignment
    const logQuery = sql`
      INSERT INTO audit_logs (user_id, action, resource, resource_id, details, created_at)
      VALUES (${assignedBy}, 'ROLE_ASSIGNED', 'user', ${userId.toString()}, ${JSON.stringify({ newRole: roleId, reason })}, NOW())
    `;
    
    await db.execute(logQuery);
  }

  // Permission Audit
  async createPermissionAuditLog(log: InsertPermissionAuditLog): Promise<PermissionAuditLog> {
    const [newLog] = await db.insert(permissionAuditLog).values(log).returning();
    return newLog;
  }

  async getPermissionAuditLogs(companyId: number, limit: number = 100): Promise<PermissionAuditLog[]> {
    return await db
      .select()
      .from(permissionAuditLog)
      .where(eq(permissionAuditLog.companyId, companyId))
      .orderBy(desc(permissionAuditLog.timestamp))
      .limit(limit);
  }

  async getUserPermissionAuditLogs(userId: number, companyId: number, limit: number = 50): Promise<PermissionAuditLog[]> {
    return await db
      .select()
      .from(permissionAuditLog)
      .where(
        and(
          eq(permissionAuditLog.userId, userId),
          eq(permissionAuditLog.companyId, companyId)
        )
      )
      .orderBy(desc(permissionAuditLog.timestamp))
      .limit(limit);
  }

  // Admin duplicate prevention methods - moved inside class
  async getUsersByRole(role: string): Promise<User[]> {
    const userCompanies = await db
      .select({
        user: users,
        role: userCompanyMemberships.role
      })
      .from(userCompanyMemberships)
      .innerJoin(users, eq(users.id, userCompanyMemberships.userId))
      .where(eq(userCompanyMemberships.role, role));

    return userCompanies.map(uc => uc.user);
  }

  async getCompanyAdminsByCompanyId(companyId: number): Promise<User[]> {
    const admins = await db
      .select({
        user: users
      })
      .from(userCompanyMemberships)
      .innerJoin(users, eq(users.id, userCompanyMemberships.userId))
      .where(
        and(
          eq(userCompanyMemberships.companyId, companyId),
          eq(userCompanyMemberships.role, 'company_admin')
        )
      );

    return admins.map(a => a.user);
  }

  async getUserCompanies(userId: number): Promise<Array<{
    companyId: number;
    companyName: string;
    role: string;
  }>> {
    const memberships = await db
      .select({
        companyId: userCompanyMemberships.companyId,
        companyName: companies.name,
        role: userCompanyMemberships.role
      })
      .from(userCompanyMemberships)
      .innerJoin(companies, eq(companies.id, userCompanyMemberships.companyId))
      .where(eq(userCompanyMemberships.userId, userId));

    return memberships;
  }

  async getAuditLogsByActionAndDate(actions: string[], startDate: Date): Promise<any[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(
        and(
          inArray(auditLogs.action, actions),
          gte(auditLogs.createdAt, startDate)
        )
      )
      .orderBy(desc(auditLogs.createdAt));
  }
}

export const storage = new DatabaseStorage();
