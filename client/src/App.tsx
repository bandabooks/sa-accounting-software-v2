import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { GlobalLoader } from "@/components/ui/global-loader";

// Critical path components - loaded immediately
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";

// Lazy load all other components to reduce initial bundle size
const Invoices = lazy(() => import("@/pages/invoices"));
const InvoiceCreate = lazy(() => import("@/pages/invoice-create"));
const InvoiceDetail = lazy(() => import("@/pages/invoice-detail"));
const Customers = lazy(() => import("@/pages/customers"));
const CustomerCreate = lazy(() => import("@/pages/customer-create"));
const CustomerDetail = lazy(() => import("@/pages/customer-detail"));
const CustomerPortal = lazy(() => import("@/pages/customer-portal"));
const Estimates = lazy(() => import("@/pages/estimates"));
const EstimateCreate = lazy(() => import("@/pages/estimate-create"));
const EstimateDetail = lazy(() => import("@/pages/estimate-detail"));
const Reports = lazy(() => import("@/pages/reports"));
const FinancialReports = lazy(() => import("@/pages/financial-reports"));
const BusinessReports = lazy(() => import("@/pages/business-reports"));
const GeneralReports = lazy(() => import("@/pages/general-reports"));
const ExpensesStandalone = lazy(() => import("@/pages/expenses-standalone"));
const BillsManagement = lazy(() => import("@/pages/bills-management"));
const BillCreate = lazy(() => import("@/pages/bill-create"));
const RecurringExpenses = lazy(() => import("@/pages/recurring-expenses"));
const RecurringExpenseCreate = lazy(() => import("@/pages/recurring-expense-create"));
const ExpenseApprovals = lazy(() => import("@/pages/expense-approvals"));
const Suppliers = lazy(() => import("@/pages/suppliers"));
const PurchaseOrders = lazy(() => import("@/pages/purchase-orders"));
const PurchaseOrderCreate = lazy(() => import("@/pages/purchase-order-create"));
const Products = lazy(() => import("@/pages/products"));
const ProductCreate = lazy(() => import("@/pages/product-create"));
const ProductEdit = lazy(() => import("@/pages/product-edit"));
const Categories = lazy(() => import("@/pages/categories"));
const Settings = lazy(() => import("@/pages/settings"));
const Inventory = lazy(() => import("@/pages/inventory"));
const Companies = lazy(() => import("@/pages/companies"));
const Profile = lazy(() => import("@/pages/profile"));
const AdminPanel = lazy(() => import("@/pages/admin-panel"));
const TrialSignup = lazy(() => import("@/pages/trial-signup"));
const ChartOfAccounts = lazy(() => import("@/pages/chart-of-accounts"));
const JournalEntries = lazy(() => import("@/pages/journal-entries"));
const Banking = lazy(() => import("@/pages/banking"));
const GeneralLedger = lazy(() => import("@/pages/general-ledger"));
const FixedAssets = lazy(() => import("@/pages/fixed-assets"));
const FixedAssetCreate = lazy(() => import("@/pages/fixed-asset-create"));
const Budgeting = lazy(() => import("@/pages/budgeting"));
const BudgetCreate = lazy(() => import("@/pages/budget-create"));
const CashFlowForecasting = lazy(() => import("@/pages/cash-flow-forecasting"));
const CashFlowForecastCreate = lazy(() => import("@/pages/cash-flow-forecast-create"));
const BankReconciliation = lazy(() => import("@/pages/bank-reconciliation"));
const BankCapture = lazy(() => import("@/pages/BankCapture"));

// Admin and Super Admin modules - lazy loaded
const SuperAdminDashboard = lazy(() => import("@/pages/super-admin-dashboard"));
const SuperAdminCompanyDetail = lazy(() => import("@/pages/super-admin-company-detail"));
const SuperAdminUserDetail = lazy(() => import("@/pages/super-admin-user-detail"));
const SuperAdminPlanEdit = lazy(() => import("@/pages/super-admin-plan-edit"));
const SuperAdminAuditLogs = lazy(() => import("@/pages/super-admin-audit-logs"));
const ProfessionalIdsManagement = lazy(() => import("@/pages/admin/professional-ids"));

// Subscription and payment modules - lazy loaded
const Subscription = lazy(() => import("@/pages/subscription"));
const SubscriptionSuccess = lazy(() => import("@/pages/subscription-success"));
const SubscriptionCancel = lazy(() => import("@/pages/subscription-cancel"));
const SubscriptionPayment = lazy(() => import("@/pages/subscription-payment"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const PaymentCancel = lazy(() => import("@/pages/payment-cancel"));

// Project management modules - lazy loaded
const Projects = lazy(() => import("@/pages/projects"));
const Tasks = lazy(() => import("@/pages/tasks"));
const TimeTracking = lazy(() => import("@/pages/time-tracking"));

// VAT management modules - lazy loaded
const VatManagement = lazy(() => import("@/pages/vat-management"));
const VATSettings = lazy(() => import("@/pages/vat-settings"));
const VATTypes = lazy(() => import("@/pages/vat-types"));
const VATReturns = lazy(() => import("@/pages/vat-returns"));
const VATReportsPage = lazy(() => import("@/pages/vat-reports"));
const VATPreparation = lazy(() => import("@/pages/vat-preparation"));
const VATHistory = lazy(() => import("@/pages/vat-history"));

// Enterprise and settings modules - lazy loaded
const EnterpriseSettings = lazy(() => import("@/pages/enterprise-settings"));
const Landing = lazy(() => import("@/pages/landing"));
const Features = lazy(() => import("@/pages/features"));
const AccountingFeatures = lazy(() => import("@/pages/features/accounting"));
const Activities = lazy(() => import("@/pages/activities"));
const ComplianceFeatures = lazy(() => import("@/pages/features/compliance"));

// Small business solutions - lazy loaded
const SmallBusiness = lazy(() => import("@/pages/small-business"));
const RetailSolutions = lazy(() => import("@/pages/small-business/retail"));
const RestaurantSolutions = lazy(() => import("@/pages/small-business/restaurants"));
const ConsultantSolutions = lazy(() => import("@/pages/small-business/consultants"));
const NGOSolutions = lazy(() => import("@/pages/small-business/ngos"));

// Marketing and public pages - lazy loaded
const Pricing = lazy(() => import("@/pages/pricing"));
const Contact = lazy(() => import("@/pages/contact"));
const Resources = lazy(() => import("@/pages/resources"));

// Professional services - lazy loaded
const Accountants = lazy(() => import("@/pages/accountants"));
const TaxPractitioners = lazy(() => import("@/pages/accountants/tax-practitioners"));
const Auditors = lazy(() => import("@/pages/accountants/auditors"));

// Onboarding and workflows - lazy loaded
const Onboarding = lazy(() => import("@/pages/onboarding"));
const SpendingWizard = lazy(() => import("@/pages/spending-wizard"));

// Compliance modules - lazy loaded
const ComplianceDashboard = lazy(() => import("@/pages/compliance-dashboard"));
const ComplianceClients = lazy(() => import("@/pages/compliance-clients"));
const CustomerLifecycle = lazy(() => import("@/pages/customer-lifecycle"));
const CommunicationCenter = lazy(() => import("@/pages/communication-center"));
const CustomerSegments = lazy(() => import("@/pages/customer-segments"));
const CustomerInsights = lazy(() => import("@/pages/customer-insights"));

// Integrations and compliance - lazy loaded
const Integrations = lazy(() => import("@/pages/integrations"));
const CIPCCompliance = lazy(() => import("@/pages/cipc-compliance"));
const LabourCompliance = lazy(() => import("@/pages/labour-compliance"));
const ComplianceTasks = lazy(() => import("@/pages/compliance-tasks"));
const ComplianceCalendar = lazy(() => import("@/pages/compliance-calendar"));
const ComplianceDocuments = lazy(() => import("@/pages/compliance-documents"));

// User management - lazy loaded
const ProfessionalUserManagement = lazy(() => import("@/pages/ProfessionalUserManagement"));

// Advanced workflows - lazy loaded
const PaymentFlows = lazy(() => import("@/pages/payment-flows"));
const ThreeWayMatching = lazy(() => import("@/pages/three-way-matching"));
const ExceptionDashboard = lazy(() => import("@/pages/exception-dashboard"));
const BulkCapture = lazy(() => import("@/pages/bulk-capture-enhanced"));

// Sales modules - lazy loaded
const SalesDashboard = lazy(() => import("@/pages/sales-dashboard"));
const SalesOrders = lazy(() => import("@/pages/sales-orders"));
const SalesOrderCreate = lazy(() => import("@/pages/sales-order-create"));
const CreditNotes = lazy(() => import("@/pages/credit-notes"));
const CreditNoteCreate = lazy(() => import("@/pages/credit-note-create"));
const CustomerPayments = lazy(() => import("@/pages/customer-payments"));
const CustomerPaymentRecord = lazy(() => import("@/pages/customer-payment-record"));
const Deliveries = lazy(() => import("@/pages/deliveries"));
const Payments = lazy(() => import("@/pages/payments"));
const SalesReports = lazy(() => import("@/pages/sales-reports"));

// Purchase modules - lazy loaded
const PurchaseDashboard = lazy(() => import("@/pages/purchase-dashboard"));
const PurchaseReports = lazy(() => import("@/pages/purchase-reports"));
const GoodsReceipts = lazy(() => import("@/pages/goods-receipts"));
const PurchaseRequisitions = lazy(() => import("@/pages/purchase-requisitions"));


// Inventory and warehouse management - lazy loaded
const Warehouses = lazy(() => import("@/pages/warehouses"));
const LotBatchTracking = lazy(() => import("@/pages/lot-batch-tracking"));
const SerialNumbers = lazy(() => import("@/pages/serial-numbers"));
const StockCounts = lazy(() => import("@/pages/stock-counts"));
const ReorderRules = lazy(() => import("@/pages/reorder-rules"));
const ProductBundles = lazy(() => import("@/pages/product-bundles"));
const InventoryReports = lazy(() => import("@/pages/inventory-reports"));
const ProductLots = lazy(() => import("@/pages/product-lots"));
const ProductSerials = lazy(() => import("@/pages/product-serials"));

// POS Module - lazy loaded
const POSDashboard = lazy(() => import("@/pages/pos-dashboard"));
const POSTerminal = lazy(() => import("@/pages/pos-terminal"));
const POSShifts = lazy(() => import("@/pages/pos-shifts"));
const POSTerminals = lazy(() => import("@/pages/pos-terminals"));

// Professional services - lazy loaded
const ProfessionalServices = lazy(() => import("@/pages/professional-services"));

// Layout component - critical path, loaded immediately
import AppLayout from "@/components/layout/app-layout";

// Permission constants for route protection
const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CREATE: 'customers:create',
  INVOICES_VIEW: 'invoices:view',
  INVOICES_CREATE: 'invoices:create',
  ESTIMATES_VIEW: 'estimates:view',
  ESTIMATES_CREATE: 'estimates:create',
  SALES_ORDERS_VIEW: 'sales_orders:view',
  SALES_ORDERS_CREATE: 'sales_orders:create',
  DELIVERIES_VIEW: 'deliveries:view',
  DELIVERIES_CREATE: 'deliveries:create',
  FINANCIAL_VIEW: 'financial:view',
  EXPENSES_VIEW: 'expenses:view',
  EXPENSES_CREATE: 'expenses:create',
  SUPPLIERS_VIEW: 'suppliers:view',
  PURCHASE_ORDERS_VIEW: 'purchase_orders:view',
  PURCHASE_ORDERS_CREATE: 'purchase_orders:create',
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  SETTINGS_VIEW: 'settings:view',
  INVENTORY_VIEW: 'inventory:view',
  CHART_OF_ACCOUNTS_VIEW: 'chart_of_accounts:view',
  JOURNAL_ENTRIES_VIEW: 'journal_entries:view',  
  BULK_CAPTURE_VIEW: 'bulk_capture:view',
  BANKING_VIEW: 'banking:view',
  GENERAL_LEDGER_VIEW: 'general_ledger:view',
  PROJECTS_VIEW: 'projects:view',
  PROJECTS_CREATE: 'projects:create',
  TASKS_VIEW: 'tasks:view',
  TASKS_CREATE: 'tasks:create',
  TIME_TRACKING_VIEW: 'time_tracking:view',
  // POS permissions
  POS_VIEW: 'pos:view',
  POS_MANAGE: 'pos:manage',
  POS_PROCESS_SALES: 'pos:process_sales',
  POS_MANAGE_SHIFTS: 'pos:manage_shifts',
  POS_VIEW_REPORTS: 'pos:view_reports',
  // RBAC permissions  
  USERS_VIEW: 'users:view',
  ROLES_VIEW: 'roles:view',
  ROLES_CREATE: 'roles:create',
  USERS_ASSIGN_ROLES: 'users:assign_roles',
  PERMISSIONS_GRANT: 'permissions:grant',
  // Exception handling permissions
  EXCEPTIONS_VIEW: 'exceptions:view',
  EXCEPTIONS_MANAGE: 'exceptions:manage',
} as const;

// Import the optimized loader
import { PageLoader } from "@/components/ui/page-loader";

function AuthenticatedApp() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/login">
            <Dashboard />
          </Route>
          <Route path="/">
            <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/expenses">
            <ProtectedRoute permission={PERMISSIONS.EXPENSES_VIEW}>
              <ExpensesStandalone />
            </ProtectedRoute>
          </Route>
        <Route path="/bills">
          <ProtectedRoute permission={PERMISSIONS.EXPENSES_VIEW}>
            <BillsManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/bills/create">
          <ProtectedRoute permission={PERMISSIONS.EXPENSES_CREATE}>
            <BillCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/recurring-expenses">
          <ProtectedRoute permission={PERMISSIONS.EXPENSES_VIEW}>
            <RecurringExpenses />
          </ProtectedRoute>
        </Route>
        <Route path="/recurring-expenses/create">
          <ProtectedRoute permission={PERMISSIONS.EXPENSES_CREATE}>
            <RecurringExpenseCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/expense-approvals">
          <ProtectedRoute permission={PERMISSIONS.EXPENSES_VIEW}>
            <ExpenseApprovals />
          </ProtectedRoute>
        </Route>
        <Route path="/invoices">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_VIEW}>
            <Invoices />
          </ProtectedRoute>
        </Route>
        <Route path="/invoices/new">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_CREATE}>
            <InvoiceCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/invoices/create">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_CREATE}>
            <InvoiceCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/invoices/:id">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_VIEW}>
            <InvoiceDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/customers">
          <ProtectedRoute permission={PERMISSIONS.CUSTOMERS_VIEW}>
            <Customers />
          </ProtectedRoute>
        </Route>
        <Route path="/customers/new">
          <ProtectedRoute permission={PERMISSIONS.CUSTOMERS_CREATE}>
            <CustomerCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/customers/:id">
          <ProtectedRoute permission={PERMISSIONS.CUSTOMERS_VIEW}>
            <CustomerDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/estimates">
          <ProtectedRoute permission={PERMISSIONS.ESTIMATES_VIEW}>
            <Estimates />
          </ProtectedRoute>
        </Route>
        <Route path="/estimates/create">
          <ProtectedRoute permission={PERMISSIONS.ESTIMATES_CREATE}>
            <EstimateCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/estimates/new">
          <ProtectedRoute permission={PERMISSIONS.ESTIMATES_CREATE}>
            <EstimateCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/estimates/edit/:id">
          <ProtectedRoute permission={PERMISSIONS.ESTIMATES_CREATE}>
            <EstimateCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/estimates/:id">
          <ProtectedRoute permission={PERMISSIONS.ESTIMATES_VIEW}>
            <EstimateDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/sales-dashboard">
          <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
            <SalesDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/sales-orders">
          <ProtectedRoute permission={PERMISSIONS.SALES_ORDERS_VIEW}>
            <SalesOrders />
          </ProtectedRoute>
        </Route>
        <Route path="/sales-orders/create">
          <ProtectedRoute permission={PERMISSIONS.SALES_ORDERS_CREATE}>
            <SalesOrderCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/deliveries">
          <ProtectedRoute permission={PERMISSIONS.DELIVERIES_VIEW}>
            <Deliveries />
          </ProtectedRoute>
        </Route>
        <Route path="/credit-notes">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_VIEW}>
            <CreditNotes />
          </ProtectedRoute>
        </Route>
        <Route path="/customer-payments">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_VIEW}>
            <CustomerPayments />
          </ProtectedRoute>
        </Route>
        <Route path="/customer-payments/record">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_CREATE}>
            <CustomerPaymentRecord />
          </ProtectedRoute>
        </Route>
        <Route path="/credit-notes/create">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_CREATE}>
            <CreditNoteCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/payments">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_VIEW}>
            <Payments />
          </ProtectedRoute>
        </Route>
        {/* Removed /payments/new route - component doesn't exist */}
        <Route path="/sales-reports">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_VIEW}>
            <SalesReports />
          </ProtectedRoute>
        </Route>
        <Route path="/purchase-dashboard">
          <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
            <PurchaseDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/suppliers">
          <ProtectedRoute permission={PERMISSIONS.SUPPLIERS_VIEW}>
            <Suppliers />
          </ProtectedRoute>
        </Route>
        <Route path="/purchase-orders/create">
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS_CREATE}>
            <PurchaseOrderCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/purchase-orders">
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS_VIEW}>
            <PurchaseOrders />
          </ProtectedRoute>
        </Route>
        <Route path="/payment-flows">
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS_VIEW}>
            <PaymentFlows />
          </ProtectedRoute>
        </Route>
        <Route path="/three-way-matching">
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS_VIEW}>
            <ThreeWayMatching />
          </ProtectedRoute>
        </Route>
        <Route path="/exception-dashboard">
          <ProtectedRoute permission={PERMISSIONS.EXCEPTIONS_VIEW}>
            <ExceptionDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/bulk-capture">
          <ProtectedRoute permission={PERMISSIONS.BULK_CAPTURE_VIEW}>
            <BulkCapture />
          </ProtectedRoute>
        </Route>
        <Route path="/purchase-reports">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <PurchaseReports />
          </ProtectedRoute>
        </Route>
        <Route path="/goods-receipts">
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS_VIEW}>
            <GoodsReceipts />
          </ProtectedRoute>
        </Route>
        <Route path="/purchase-requisitions">
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS_VIEW}>
            <PurchaseRequisitions />
          </ProtectedRoute>
        </Route>

        <Route path="/products">
          <Products />
        </Route>
        <Route path="/products/create">
          <ProductCreate />
        </Route>
        <Route path="/products/:id/edit">
          <ProductEdit />
        </Route>
        <Route path="/products/categories">
          <Categories />
        </Route>
        <Route path="/reports">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <Reports />
          </ProtectedRoute>
        </Route>
        <Route path="/general-reports">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <GeneralReports />
          </ProtectedRoute>
        </Route>
        <Route path="/financial-reports">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <FinancialReports />
          </ProtectedRoute>
        </Route>

        <Route path="/business-reports">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <BusinessReports />
          </ProtectedRoute>
        </Route>
        <Route path="/customer-lifecycle">
          <ProtectedRoute permission={PERMISSIONS.CUSTOMERS_VIEW}>
            <CustomerLifecycle />
          </ProtectedRoute>
        </Route>
        <Route path="/communication-center">
          <ProtectedRoute permission={PERMISSIONS.CUSTOMERS_VIEW}>
            <CommunicationCenter />
          </ProtectedRoute>
        </Route>
        <Route path="/customer-segments">
          <ProtectedRoute permission={PERMISSIONS.CUSTOMERS_VIEW}>
            <CustomerSegments />
          </ProtectedRoute>
        </Route>
        <Route path="/customer-insights">
          <ProtectedRoute permission={PERMISSIONS.CUSTOMERS_VIEW}>
            <CustomerInsights />
          </ProtectedRoute>
        </Route>

        <Route path="/activities">
          <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
            <Activities />
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <Settings />
          </ProtectedRoute>
        </Route>
        <Route path="/inventory">
          <Inventory />
        </Route>
        <Route path="/warehouses">
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <Warehouses />
          </ProtectedRoute>
        </Route>
        <Route path="/lot-batch-tracking">
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <LotBatchTracking />
          </ProtectedRoute>
        </Route>
        <Route path="/serial-numbers">
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <SerialNumbers />
          </ProtectedRoute>
        </Route>
        <Route path="/stock-counts">
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <StockCounts />
          </ProtectedRoute>
        </Route>
        <Route path="/reorder-rules">
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <ReorderRules />
          </ProtectedRoute>
        </Route>
        <Route path="/product-bundles">
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <ProductBundles />
          </ProtectedRoute>
        </Route>
        <Route path="/inventory-reports">
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <InventoryReports />
          </ProtectedRoute>
        </Route>
        <Route path="/product-lots">
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <ProductLots />
          </ProtectedRoute>
        </Route>
        <Route path="/product-serials">
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <ProductSerials />
          </ProtectedRoute>
        </Route>

        {/* POS Module Routes */}
        <Route path="/pos">
          <ProtectedRoute permission={PERMISSIONS.POS_VIEW}>
            <POSDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/pos/dashboard">
          <ProtectedRoute permission={PERMISSIONS.POS_VIEW}>
            <POSDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/pos/terminal">
          <ProtectedRoute permission={PERMISSIONS.POS_PROCESS_SALES}>
            <POSTerminal />
          </ProtectedRoute>
        </Route>
        <Route path="/pos/shifts">
          <ProtectedRoute permission={PERMISSIONS.POS_MANAGE_SHIFTS}>
            <POSShifts />
          </ProtectedRoute>
        </Route>
        <Route path="/pos/terminals">
          <ProtectedRoute permission={PERMISSIONS.POS_MANAGE}>
            <POSTerminals />
          </ProtectedRoute>
        </Route>
        
        {/* Professional Services Module */}
        <Route path="/professional-services">
          <ProtectedRoute permission={PERMISSIONS.PRODUCTS_VIEW}>
            <ProfessionalServices />
          </ProtectedRoute>
        </Route>

        <Route path="/companies">
          <Companies />
        </Route>
        <Route path="/profile">
          <Profile />
        </Route>
        <Route path="/admin-panel">
          <AdminPanel />
        </Route>
        <Route path="/chart-of-accounts">
          <ProtectedRoute permission={PERMISSIONS.CHART_OF_ACCOUNTS_VIEW}>
            <ChartOfAccounts />
          </ProtectedRoute>
        </Route>
        <Route path="/journal-entries">
          <ProtectedRoute permission={PERMISSIONS.JOURNAL_ENTRIES_VIEW}>
            <JournalEntries />
          </ProtectedRoute>
        </Route>
        <Route path="/banking">
          <ProtectedRoute permission={PERMISSIONS.BANKING_VIEW}>
            <Banking />
          </ProtectedRoute>
        </Route>
        <Route path="/bank/capture">
          <ProtectedRoute permission={PERMISSIONS.BANKING_VIEW}>
            <BankCapture />
          </ProtectedRoute>
        </Route>
        <Route path="/general-ledger">
          <ProtectedRoute permission={PERMISSIONS.GENERAL_LEDGER_VIEW}>
            <GeneralLedger />
          </ProtectedRoute>
        </Route>
        <Route path="/fixed-assets">
          <FixedAssets />
        </Route>
        <Route path="/fixed-assets/new">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <FixedAssetCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/budgeting">
          <Budgeting />
        </Route>
        <Route path="/budgets/new">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <BudgetCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/cash-flow-forecasting">
          <CashFlowForecasting />
        </Route>
        <Route path="/cash-flow-forecasts/new">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <CashFlowForecastCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/bank-reconciliation">
          <BankReconciliation />
        </Route>

        <Route path="/projects">
          <ProtectedRoute permission={PERMISSIONS.PROJECTS_VIEW}>
            <Projects />
          </ProtectedRoute>
        </Route>
        <Route path="/tasks">
          <ProtectedRoute permission={PERMISSIONS.TASKS_VIEW}>
            <Tasks />
          </ProtectedRoute>
        </Route>
        <Route path="/time-tracking">
          <ProtectedRoute permission={PERMISSIONS.TIME_TRACKING_VIEW}>
            <TimeTracking />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-management">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <VatManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-settings">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <VATSettings />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-types">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <VATTypes />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-returns">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <VATReturns />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-reports">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <VATReportsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-preparation">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <VATPreparation />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-history">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <VATHistory />
          </ProtectedRoute>
        </Route>
        <Route path="/enterprise-settings">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <EnterpriseSettings />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin">
          <ProtectedRoute requiredRole="super_admin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/companies/:id">
          <ProtectedRoute requiredRole="super_admin">
            <SuperAdminCompanyDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/users/:id">
          <ProtectedRoute requiredRole="super_admin">
            <SuperAdminUserDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/companies/:companyId/audit-logs">
          <ProtectedRoute requiredRole="super_admin">
            <SuperAdminAuditLogs />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/plans/:id">
          <ProtectedRoute requiredRole="super_admin">
            <SuperAdminPlanEdit />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/professional-ids">
          <ProtectedRoute requiredRole="super_admin">
            <ProfessionalIdsManagement />
          </ProtectedRoute>
        </Route>

        <Route path="/subscription">
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        </Route>
        <Route path="/subscription/payment/:planId/:period">
          <ProtectedRoute>
            <SubscriptionPayment />
          </ProtectedRoute>
        </Route>
        <Route path="/subscription/success">
          <ProtectedRoute>
            <SubscriptionSuccess />
          </ProtectedRoute>
        </Route>
        <Route path="/subscription/cancel">
          <ProtectedRoute>
            <SubscriptionCancel />
          </ProtectedRoute>
        </Route>
        <Route path="/payment/success">
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        </Route>
        <Route path="/payment/cancel">
          <ProtectedRoute>
            <PaymentCancel />
          </ProtectedRoute>
        </Route>
        <Route path="/onboarding">
          <Onboarding />
        </Route>
        <Route path="/spending-wizard">
          <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
            <SpendingWizard />
          </ProtectedRoute>
        </Route>

        {/* Unified Permission Management Routes */}
        <Route path="/user-management">
          <ProtectedRoute permission={PERMISSIONS.USERS_VIEW}>
            <ProfessionalUserManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/permissions-management">
          <ProtectedRoute permission={PERMISSIONS.USERS_VIEW}>
            <ProfessionalUserManagement />
          </ProtectedRoute>
        </Route>

        {/* Compliance Management Routes */}
        <Route path="/compliance/dashboard">
          <ProtectedRoute>
            <ComplianceDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/compliance/clients">
          <ProtectedRoute>
            <ComplianceClients />
          </ProtectedRoute>
        </Route>

        <Route path="/integrations">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <Integrations />
          </ProtectedRoute>
        </Route>
        <Route path="/compliance/cipc">
          <ProtectedRoute>
            <CIPCCompliance />
          </ProtectedRoute>
        </Route>
        <Route path="/compliance/labour">
          <ProtectedRoute>
            <LabourCompliance />
          </ProtectedRoute>
        </Route>
        <Route path="/compliance/tasks">
          <ProtectedRoute>
            <ComplianceTasks />
          </ProtectedRoute>
        </Route>
        <Route path="/compliance/calendar">
          <ProtectedRoute>
            <ComplianceCalendar />
          </ProtectedRoute>
        </Route>
        <Route path="/compliance/documents">
          <ProtectedRoute>
            <ComplianceDocuments />
          </ProtectedRoute>
        </Route>
        <Route path="/portal" component={CustomerPortal} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </AppLayout>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/features" component={Features} />
        <Route path="/features/accounting" component={AccountingFeatures} />
        <Route path="/features/compliance" component={ComplianceFeatures} />
        <Route path="/small-business" component={SmallBusiness} />
        <Route path="/small-business/retail" component={RetailSolutions} />
        <Route path="/small-business/restaurants" component={RestaurantSolutions} />
        <Route path="/small-business/consultants" component={ConsultantSolutions} />
        <Route path="/small-business/ngos" component={NGOSolutions} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/contact" component={Contact} />
        <Route path="/resources" component={Resources} />
        <Route path="/accountants" component={Accountants} />
        <Route path="/accountants/tax-practitioners" component={TaxPractitioners} />
        <Route path="/accountants/auditors" component={Auditors} />
        <Route path="/login" component={Login} />
        <Route path="/trial-signup" component={TrialSignup} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/portal" component={CustomerPortal} />
        <Route>
          <Landing />
        </Route>
      </Switch>
    );
  }

  // Show protected routes with authentication
  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LoadingProvider>
          <NotificationProvider>
            <GlobalLoader />
            <Toaster />
            <Router />
          </NotificationProvider>
        </LoadingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
