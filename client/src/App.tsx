import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useUserActivity } from "@/hooks/useUserActivity";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { GlobalLoader } from "@/components/ui/global-loader";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import InvoiceCreate from "@/pages/invoice-create";
import InvoiceDetail from "@/pages/invoice-detail";
import Customers from "@/pages/customers";
import CustomerCreate from "@/pages/customer-create";
import CustomerDetail from "@/pages/customer-detail";
import CustomerPortal from "@/pages/customer-portal";
import Estimates from "@/pages/estimates";
import EstimateCreate from "@/pages/estimate-create";
import EstimateDetail from "@/pages/estimate-detail";
import Reports from "@/pages/reports";
import FinancialReports from "@/pages/financial-reports";
import BusinessReports from "@/pages/BusinessReports";
import GeneralReports from "@/pages/general-reports";
import ExpensesStandalone from "@/pages/expenses-standalone";
import BillsManagement from "@/pages/bills-management";
import BillCreate from "@/pages/bill-create";
import BillsPage from "@/pages/bills";
import RecurringExpenses from "@/pages/recurring-expenses";
import RecurringExpenseCreate from "@/pages/recurring-expense-create";
import ExpenseApprovals from "@/pages/expense-approvals";
import Suppliers from "@/pages/suppliers";
import PurchaseOrders from "@/pages/purchase-orders";
import PurchaseOrderCreate from "@/pages/purchase-order-create";
import Products from "@/pages/products";
import ProductCreate from "@/pages/product-create";
import ProductEdit from "@/pages/product-edit";
import Categories from "@/pages/categories";
import Settings from "@/pages/settings";
import EmailSettings from "@/pages/email-settings";
import Inventory from "@/pages/inventory";
import Companies from "@/pages/companies";
import Profile from "@/pages/profile";
import AdminPanel from "@/pages/admin-panel";
import Login from "@/pages/login";
import ResetPassword from "@/pages/reset-password";
import TrialSignup from "@/pages/trial-signup";
import ChartOfAccounts from "@/pages/chart-of-accounts";
import ChartManagement from "@/pages/chart-management";
import JournalEntries from "@/pages/journal-entries";
import Banking from "@/pages/banking";
import GeneralLedger from "@/pages/general-ledger";
import FixedAssets from "@/pages/fixed-assets";
import FixedAssetCreate from "@/pages/fixed-asset-create";
import Budgeting from "@/pages/budgeting";
import BudgetCreate from "@/pages/budget-create";
import CashFlowForecasting from "@/pages/cash-flow-forecasting";
import CashFlowForecastCreate from "@/pages/cash-flow-forecast-create";

import SuperAdminDashboard from "@/pages/super-admin-dashboard";
import SuperAdminCompanyDetail from "@/pages/super-admin-company-detail";
import SuperAdminUserDetail from "@/pages/super-admin-user-detail";
import SuperAdminPlanEdit from "@/pages/super-admin-plan-edit";
import SuperAdminAuditLogs from "@/pages/super-admin-audit-logs";
import ProfessionalIdsManagement from "@/pages/admin/professional-ids";
import ServicePackageAdmin from "@/pages/service-package-admin";
import Subscription from "@/pages/subscription";
import AdminSubscriptions from "@/pages/admin-subscriptions";
import SubscriptionSuccess from "@/pages/subscription-success";
import SubscriptionCancel from "@/pages/subscription-cancel";
import SubscriptionPayment from "@/pages/subscription-payment";
import PaymentSuccess from "@/pages/payment-success";
import PaymentCancel from "@/pages/payment-cancel";
import Projects from "@/pages/projects";
import Tasks from "@/pages/tasks";
import AlertsPage from "@/pages/alerts";
import TimeTracking from "@/pages/time-tracking";
import VatManagement from "@/pages/vat-management";
import VATSettings from "@/pages/vat-settings";
import VATTypes from "@/pages/vat-types";
import VATReturns from "@/pages/vat-returns";
import EMP201Returns from "@/pages/emp201";
import VATTransactionAnalysis from "@/pages/vat-transaction-analysis";
import VATReportsPage from "@/pages/vat-reports";
import VATPreparation from "@/pages/vat-preparation";
import VATHistory from "@/pages/vat-history";

import EnterpriseSettings from "@/pages/enterprise-settings";
import Landing from "@/pages/landing";
import LandingPagePro from "@/pages/landingpage-pro";
import Features from "@/pages/features";
import AccountingFeatures from "@/pages/features/accounting";
import Activities from "@/pages/activities";
import Alerts from "@/pages/alerts";
import ComplianceFeatures from "@/pages/features/compliance";
import SmallBusiness from "@/pages/small-business";
import RetailSolutions from "@/pages/small-business/retail";
import RestaurantSolutions from "@/pages/small-business/restaurants";
import ConsultantSolutions from "@/pages/small-business/consultants";
import NGOSolutions from "@/pages/small-business/ngos";
import Pricing from "@/pages/pricing";
import Contact from "@/pages/contact";
import Resources from "@/pages/resources";
import Accountants from "@/pages/accountants";
import TaxPractitioners from "@/pages/accountants/tax-practitioners";
import Auditors from "@/pages/accountants/auditors";
import PracticeDashboard from "@/pages/practice-dashboard";
import Onboarding from "@/pages/onboarding";
import SpendingWizard from "@/pages/spending-wizard";
import ComplianceDashboard from "@/pages/compliance-dashboard";
import ComplianceClients from "@/pages/compliance-clients";
import ComplianceTracker from "@/pages/compliance-tracker";
import CustomerLifecycle from "@/pages/customer-lifecycle";
import CommunicationCenter from "@/pages/communication-center";
import CustomerSegments from "@/pages/customer-segments";
import CustomerInsights from "@/pages/customer-insights";
import AgingReports from "@/pages/aging-reports";
import Contracts from "@/pages/ContractsNew";
import CreateContract from "@/pages/CreateContract";

import Integrations from "@/pages/integrations";
import CIPCCompliance from "@/pages/cipc-compliance";
import LabourCompliance from "@/pages/labour-compliance";
import ComplianceTasks from "@/pages/compliance-tasks";
import ComplianceCalendar from "@/pages/compliance-calendar";
import ComplianceDocuments from "@/pages/compliance-documents";
import ProfessionalUserManagement from "@/pages/ProfessionalUserManagement";
import PaymentFlows from "@/pages/payment-flows";
import ThreeWayMatching from "@/pages/three-way-matching";
import ExceptionDashboard from "@/pages/exception-dashboard";
import BulkCapture from "@/pages/bulk-capture";
import TestAutoMatch from "@/pages/test-auto-match";

// Employee Management imports
import EmployeesPage from "@/pages/employees";
import PayrollPage from "@/pages/employees/payroll";
import AttendancePage from "@/pages/employees/attendance";
import LeavePage from "@/pages/employees/leave";

// Root-level Employee pages (restored working versions)
import Attendance from "@/pages/attendance";
import Payroll from "@/pages/payroll";
import LeaveManagement from "@/pages/leave-management";
import SalesDashboard from "@/pages/sales-dashboard";
import SalesOrders from "@/pages/sales-orders";
import SalesOrderCreate from "@/pages/sales-order-create";
import CreditNotes from "@/pages/credit-notes";
import CreditNoteCreate from "@/pages/credit-note-create";
import CustomerPayments from "@/pages/customer-payments";
import CustomerPaymentRecord from "@/pages/customer-payment-record";
import Deliveries from "@/pages/deliveries";

// import NewPayment from "@/pages/new-payment"; // Commented out - file doesn't exist
import SalesReports from "@/pages/sales-reports";
import PurchaseDashboard from "@/pages/purchase-dashboard";
import PurchaseReports from "@/pages/purchase-reports";
import GoodsReceipts from "@/pages/goods-receipts";
import PurchaseRequisitions from "@/pages/purchase-requisitions";


import Warehouses from "@/pages/warehouses";
import LotBatchTracking from "@/pages/lot-batch-tracking";
import SerialNumbers from "@/pages/serial-numbers";
import StockCounts from "@/pages/stock-counts";
import ReorderRules from "@/pages/reorder-rules";
import ProductBundles from "@/pages/product-bundles";
import InventoryReports from "@/pages/inventory-reports";
import ProductLots from "@/pages/product-lots";
import ProductSerials from "@/pages/product-serials";

// POS Module imports
import POSDashboard from "@/pages/pos-dashboard";
import POSTerminal from "@/pages/pos-terminal";
import POSShifts from "@/pages/pos-shifts";
import POSTerminals from "@/pages/pos-terminals";
// Note: These components don't exist yet, commenting out to fix build
// import POSCustomerLoyalty from "@/pages/pos-customer-loyalty";
// import POSReports from "@/pages/pos-reports";
// import PayFastPayments from "@/pages/payfast-payments";
// import POSShiftManagement from "@/pages/pos-shift-management";
import ProfessionalServices from "@/pages/professional-services";
import FinancialReportsPage from "@/pages/reports/financial";
import ProfitLossDetailedPage from "@/pages/reports/profit-loss-detailed";
import AppLayout from "@/components/layout/app-layout";
import { AIHealthBanner } from "@/components/ai-assistant/AIHealthBanner";
import AIMonitorPage from "@/pages/ai-monitor";
import AuditTrail from "@/pages/audit-trail";
import { SubscriptionProtectedRoute } from "@/components/SubscriptionProtectedRoute";

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
  CONTRACTS_VIEW: 'contracts:view',
  CONTRACTS_CREATE: 'contracts:create',
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
  // Employee Management permissions
  EMPLOYEES_VIEW: 'employees:view',
  EMPLOYEES_CREATE: 'employees:create',
  EMPLOYEES_UPDATE: 'employees:update',
  EMPLOYEES_DELETE: 'employees:delete',
  PAYROLL_VIEW: 'payroll:view',
  PAYROLL_CREATE: 'payroll:create',
  PAYROLL_APPROVE: 'payroll:approve',
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_MANAGE: 'attendance:manage',
  LEAVE_VIEW: 'leave:view',
  LEAVE_MANAGE: 'leave:manage',
} as const;

function AuthenticatedApp() {
  // Track user activity for real-time monitoring
  useUserActivity();
  
  return (
    <CompanyProvider>
      <AppLayout>
        <AIHealthBanner />
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
            <SubscriptionProtectedRoute featureKey="expenses">
              <ExpensesStandalone />
            </SubscriptionProtectedRoute>
          </ProtectedRoute>
        </Route>
        <Route path="/bills">
          <ProtectedRoute permission={PERMISSIONS.EXPENSES_VIEW}>
            <SubscriptionProtectedRoute featureKey="expenses">
              <BillsPage />
            </SubscriptionProtectedRoute>
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

        {/* Removed /payments/new route - component doesn't exist */}
        <Route path="/sales-reports">
          <ProtectedRoute permission={PERMISSIONS.INVOICES_VIEW}>
            <SalesReports />
          </ProtectedRoute>
        </Route>
        <Route path="/purchase-dashboard">
          <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
            <SubscriptionProtectedRoute featureKey="purchases">
              <PurchaseDashboard />
            </SubscriptionProtectedRoute>
          </ProtectedRoute>
        </Route>
        <Route path="/suppliers">
          <ProtectedRoute permission={PERMISSIONS.SUPPLIERS_VIEW}>
            <SubscriptionProtectedRoute featureKey="suppliers">
              <Suppliers />
            </SubscriptionProtectedRoute>
          </ProtectedRoute>
        </Route>
        <Route path="/purchase-orders/create">
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS_CREATE}>
            <SubscriptionProtectedRoute featureKey="purchases">
              <PurchaseOrderCreate />
            </SubscriptionProtectedRoute>
          </ProtectedRoute>
        </Route>
        <Route path="/purchase-orders">
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS_VIEW}>
            <SubscriptionProtectedRoute featureKey="purchases">
              <PurchaseOrders />
            </SubscriptionProtectedRoute>
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
        <Route path="/test-auto-match">
          <ProtectedRoute permission={PERMISSIONS.BULK_CAPTURE_VIEW}>
            <TestAutoMatch />
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

        {/* Employee Management Routes */}
        <Route path="/employees">
          <ProtectedRoute permission={PERMISSIONS.EMPLOYEES_VIEW}>
            <EmployeesPage />
          </ProtectedRoute>
        </Route>
        <Route path="/employees/payroll">
          <ProtectedRoute permission={PERMISSIONS.PAYROLL_VIEW}>
            <PayrollPage />
          </ProtectedRoute>
        </Route>
        <Route path="/employees/attendance">
          <ProtectedRoute permission={PERMISSIONS.ATTENDANCE_VIEW}>
            <AttendancePage />
          </ProtectedRoute>
        </Route>
        <Route path="/employees/leave">
          <ProtectedRoute permission={PERMISSIONS.LEAVE_VIEW}>
            <LeavePage />
          </ProtectedRoute>
        </Route>

        {/* Root-level Employee Management routes (restored working versions) */}
        <Route path="/attendance">
          <ProtectedRoute permission={PERMISSIONS.ATTENDANCE_VIEW}>
            <Attendance />
          </ProtectedRoute>
        </Route>
        <Route path="/payroll">
          <ProtectedRoute permission={PERMISSIONS.PAYROLL_VIEW}>
            <Payroll />
          </ProtectedRoute>
        </Route>
        <Route path="/leave-management">
          <ProtectedRoute permission={PERMISSIONS.LEAVE_VIEW}>
            <LeaveManagement />
          </ProtectedRoute>
        </Route>

        <Route path="/products">
          <SubscriptionProtectedRoute featureKey="products_services">
            <Products />
          </SubscriptionProtectedRoute>
        </Route>
        <Route path="/products/create">
          <SubscriptionProtectedRoute featureKey="products_services">
            <ProductCreate />
          </SubscriptionProtectedRoute>
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
        <Route path="/advanced-analytics">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <FinancialReports />
          </ProtectedRoute>
        </Route>
        <Route path="/reports/financial">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <FinancialReportsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/reports/profit-loss-detailed">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <ProfitLossDetailedPage />
          </ProtectedRoute>
        </Route>
        <Route path="/reports/aging">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <AgingReports />
          </ProtectedRoute>
        </Route>
        <Route path="/audit-trail">
          <ProtectedRoute permission="audit:view">
            <AuditTrail />
          </ProtectedRoute>
        </Route>
        
        {/* SARS Integration Route */}
        <Route path="/sars-integration">
          <ProtectedRoute>
            <Integrations />
          </ProtectedRoute>
        </Route>
        
        {/* Client Management Route */}
        <Route path="/client-management">
          <ProtectedRoute>
            <ComplianceClients />
          </ProtectedRoute>
        </Route>
        
        {/* Task Management Route */}
        <Route path="/task-management">
          <ProtectedRoute>
            <ComplianceTasks />
          </ProtectedRoute>
        </Route>
        
        {/* Calendar Route */}
        <Route path="/calendar">
          <ProtectedRoute>
            <ComplianceCalendar />
          </ProtectedRoute>
        </Route>
        
        {/* Compliance Dashboard Route (alternative URL) */}
        <Route path="/compliance-dashboard">
          <ProtectedRoute>
            <ComplianceDashboard />
          </ProtectedRoute>
        </Route>
        
        {/* CIPC Compliance Route (alternative URL) */}
        <Route path="/cipc-compliance">
          <ProtectedRoute>
            <CIPCCompliance />
          </ProtectedRoute>
        </Route>
        
        {/* Labour Compliance Route (alternative URL) */}
        <Route path="/labour-compliance">
          <ProtectedRoute>
            <LabourCompliance />
          </ProtectedRoute>
        </Route>
        
        {/* Document Library Route */}
        <Route path="/document-library">
          <ProtectedRoute>
            <ComplianceDocuments />
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
        <Route path="/alerts">
          <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
            <AlertsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/alerts">
          <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
            <Alerts />
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <Settings />
          </ProtectedRoute>
        </Route>
        <Route path="/email-settings">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <EmailSettings />
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
        <Route path="/pos/setup">
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
        <Route path="/chart-management">
          <ProtectedRoute permission={PERMISSIONS.CHART_OF_ACCOUNTS_VIEW}>
            <ChartManagement />
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
        <Route path="/contracts/create">
          <ProtectedRoute permission={PERMISSIONS.CONTRACTS_CREATE}>
            <CreateContract />
          </ProtectedRoute>
        </Route>
        <Route path="/contracts">
          <ProtectedRoute permission={PERMISSIONS.CONTRACTS_VIEW}>
            <Contracts />
          </ProtectedRoute>
        </Route>
        <Route path="/banking/:accountId">
          <ProtectedRoute permission={PERMISSIONS.BANKING_VIEW}>
            <Banking />
          </ProtectedRoute>
        </Route>
        {/* Redirects for old routes */}
        <Route path="/bank-capture">
          <ProtectedRoute permission={PERMISSIONS.BANKING_VIEW}>
            <Banking />
          </ProtectedRoute>
        </Route>
        <Route path="/bank/capture">
          <ProtectedRoute permission={PERMISSIONS.BANKING_VIEW}>
            <Banking />
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
        {/* Bank reconciliation now part of unified banking */}
        <Route path="/bank-reconciliation">
          <ProtectedRoute permission={PERMISSIONS.BANKING_VIEW}>
            <Banking />
          </ProtectedRoute>
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
            <Redirect to="/vat-management?tab=returns" />
          </ProtectedRoute>
        </Route>
        <Route path="/reports/vat">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <VATReportsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-reports">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <VATReportsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-preparation">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <Redirect to="/vat-management?tab=returns" />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-history">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <VATHistory />
          </ProtectedRoute>
        </Route>
        <Route path="/emp201">
          <ProtectedRoute permission={PERMISSIONS.PAYROLL_VIEW}>
            <EMP201Returns />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-transaction-analysis">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <VATTransactionAnalysis />
          </ProtectedRoute>
        </Route>
        <Route path="/vat201-returns">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <Redirect to="/vat-management?tab=returns" />
          </ProtectedRoute>
        </Route>
        <Route path="/vat-reconciliation">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <Redirect to="/vat-management?tab=returns" />
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
        <Route path="/admin/service-packages">
          <ProtectedRoute requiredRole="super_admin">
            <ServicePackageAdmin />
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
        <Route path="/admin/subscriptions">
          <ProtectedRoute requiredRole="super_admin">
            <AdminSubscriptions />
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
        <Route path="/compliance/clients/new">
          <ProtectedRoute>
            <ComplianceClients />
          </ProtectedRoute>
        </Route>
        <Route path="/compliance/tracker">
          <ProtectedRoute>
            <ComplianceTracker />
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
        <Route path="/compliance/tasks/new">
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

        {/* Practice Management Routes */}
        <Route path="/practice/dashboard">
          <ProtectedRoute>
            <PracticeDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/ai-monitor">
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
            <AIMonitorPage />
          </ProtectedRoute>
        </Route>
        <Route path="/portal" component={CustomerPortal} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
    </CompanyProvider>
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
        <Route path="/landingpage-pro" component={LandingPagePro} />
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
        <Route path="/reset-password" component={ResetPassword} />
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
