import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import Expenses from "@/pages/expenses";
import Suppliers from "@/pages/suppliers";
import PurchaseOrders from "@/pages/purchase-orders";
import Products from "@/pages/products";
import ProductCreate from "@/pages/product-create";
import ProductEdit from "@/pages/product-edit";
import Categories from "@/pages/categories";
import Settings from "@/pages/settings";
import Inventory from "@/pages/inventory";
import Companies from "@/pages/companies";
import Profile from "@/pages/profile";
import AdminPanel from "@/pages/admin-panel";
import Login from "@/pages/login";
import ChartOfAccounts from "@/pages/chart-of-accounts";
import JournalEntries from "@/pages/journal-entries";
import Banking from "@/pages/banking";
import GeneralLedger from "@/pages/general-ledger";
import FixedAssets from "@/pages/fixed-assets";
import Budgeting from "@/pages/budgeting";
import CashFlowForecasting from "@/pages/cash-flow-forecasting";
import BankReconciliation from "@/pages/bank-reconciliation";
import VatManagement from "@/pages/vat-management";
import SuperAdminDashboard from "@/pages/super-admin-dashboard";
import SuperAdminCompanyDetail from "@/pages/super-admin-company-detail";
import SuperAdminUserDetail from "@/pages/super-admin-user-detail";
import SuperAdminPlanEdit from "@/pages/super-admin-plan-edit";
import SuperAdminAuditLogs from "@/pages/super-admin-audit-logs";
import Subscription from "@/pages/subscription";
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
  FINANCIAL_VIEW: 'financial:view',
  EXPENSES_VIEW: 'expenses:view',
  SUPPLIERS_VIEW: 'suppliers:view',
  PURCHASE_ORDERS_VIEW: 'purchase_orders:view',
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  SETTINGS_VIEW: 'settings:view',
  INVENTORY_VIEW: 'inventory:view',
  CHART_OF_ACCOUNTS_VIEW: 'chart_of_accounts:view',
  JOURNAL_ENTRIES_VIEW: 'journal_entries:view',
  BANKING_VIEW: 'banking:view',
  GENERAL_LEDGER_VIEW: 'general_ledger:view',
} as const;

function AuthenticatedApp() {
  return (
    <AppLayout>
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
        <Route path="/estimates/new">
          <ProtectedRoute permission={PERMISSIONS.ESTIMATES_CREATE}>
            <EstimateCreate />
          </ProtectedRoute>
        </Route>
        <Route path="/estimates/:id">
          <ProtectedRoute permission={PERMISSIONS.ESTIMATES_VIEW}>
            <EstimateDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/suppliers">
          <ProtectedRoute permission={PERMISSIONS.SUPPLIERS_VIEW}>
            <Suppliers />
          </ProtectedRoute>
        </Route>
        <Route path="/purchase-orders">
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS_VIEW}>
            <PurchaseOrders />
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
        <Route path="/financial-reports">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <FinancialReports />
          </ProtectedRoute>
        </Route>
        <Route path="/expenses">
          <ProtectedRoute permission={PERMISSIONS.EXPENSES_VIEW}>
            <Expenses />
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
        <Route path="/general-ledger">
          <ProtectedRoute permission={PERMISSIONS.GENERAL_LEDGER_VIEW}>
            <GeneralLedger />
          </ProtectedRoute>
        </Route>
        <Route path="/fixed-assets">
          <FixedAssets />
        </Route>
        <Route path="/budgeting">
          <Budgeting />
        </Route>
        <Route path="/cash-flow-forecasting">
          <CashFlowForecasting />
        </Route>
        <Route path="/bank-reconciliation">
          <BankReconciliation />
        </Route>
        <Route path="/vat-management">
          <ProtectedRoute permission={PERMISSIONS.FINANCIAL_VIEW}>
            <VatManagement />
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
        <Route path="/subscription">
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        </Route>
        <Route path="/portal" component={CustomerPortal} />
        <Route component={NotFound} />
      </Switch>
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

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/portal" component={CustomerPortal} />
        <Route>
          <Login />
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
