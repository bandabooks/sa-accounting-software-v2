import { lazy, Suspense } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { GlobalLoader } from "@/components/ui/global-loader";
import { Loader2 } from "lucide-react";

// Lazy loading spinner component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

// Critical pages - load immediately
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";

// Lazy load all other pages
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
const EmailSettings = lazy(() => import("@/pages/email-settings"));
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

const SuperAdminDashboard = lazy(() => import("@/pages/super-admin-dashboard"));
const SuperAdminCompanyDetail = lazy(() => import("@/pages/super-admin-company-detail"));
const SuperAdminUserDetail = lazy(() => import("@/pages/super-admin-user-detail"));
const SuperAdminPlanEdit = lazy(() => import("@/pages/super-admin-plan-edit"));
const SuperAdminAuditLogs = lazy(() => import("@/pages/super-admin-audit-logs"));
const ProfessionalIdsManagement = lazy(() => import("@/pages/admin/professional-ids"));
const Subscription = lazy(() => import("@/pages/subscription"));
const SubscriptionSuccess = lazy(() => import("@/pages/subscription-success"));
const SubscriptionCancel = lazy(() => import("@/pages/subscription-cancel"));
const SubscriptionPayment = lazy(() => import("@/pages/subscription-payment"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const PaymentCancel = lazy(() => import("@/pages/payment-cancel"));
const Projects = lazy(() => import("@/pages/projects"));
const Tasks = lazy(() => import("@/pages/tasks"));
const TimeTracking = lazy(() => import("@/pages/time-tracking"));
const VatManagement = lazy(() => import("@/pages/vat-management"));
const VATSettings = lazy(() => import("@/pages/vat-settings"));
const VATTypes = lazy(() => import("@/pages/vat-types"));
const VATReturns = lazy(() => import("@/pages/vat-returns"));
const VATReportsPage = lazy(() => import("@/pages/vat-reports"));
const VATPreparation = lazy(() => import("@/pages/vat-preparation"));
const VATHistory = lazy(() => import("@/pages/vat-history"));

const EnterpriseSettings = lazy(() => import("@/pages/enterprise-settings"));
const Features = lazy(() => import("@/pages/features"));
const AccountingFeatures = lazy(() => import("@/pages/features/accounting"));
const Activities = lazy(() => import("@/pages/activities"));
const ComplianceFeatures = lazy(() => import("@/pages/features/compliance"));
const SmallBusiness = lazy(() => import("@/pages/small-business"));
const RetailSolutions = lazy(() => import("@/pages/small-business/retail"));
const RestaurantSolutions = lazy(() => import("@/pages/small-business/restaurants"));
const ConsultantSolutions = lazy(() => import("@/pages/small-business/consultants"));
const NGOSolutions = lazy(() => import("@/pages/small-business/ngos"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Contact = lazy(() => import("@/pages/contact"));
const Resources = lazy(() => import("@/pages/resources"));
const Accountants = lazy(() => import("@/pages/accountants"));
const TaxPractitioners = lazy(() => import("@/pages/accountants/tax-practitioners"));
const Auditors = lazy(() => import("@/pages/accountants/auditors"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const SpendingWizard = lazy(() => import("@/pages/spending-wizard"));
const ComplianceDashboard = lazy(() => import("@/pages/compliance-dashboard"));
const ComplianceClients = lazy(() => import("@/pages/compliance-clients"));
const CustomerLifecycle = lazy(() => import("@/pages/customer-lifecycle"));
const CommunicationCenter = lazy(() => import("@/pages/communication-center"));
const CustomerSegments = lazy(() => import("@/pages/customer-segments"));
const CustomerInsights = lazy(() => import("@/pages/customer-insights"));
const AgingReports = lazy(() => import("@/pages/aging-reports"));

const Integrations = lazy(() => import("@/pages/integrations"));
const CIPCCompliance = lazy(() => import("@/pages/cipc-compliance"));
const LabourCompliance = lazy(() => import("@/pages/labour-compliance"));
const ComplianceTasks = lazy(() => import("@/pages/compliance-tasks"));
const ComplianceCalendar = lazy(() => import("@/pages/compliance-calendar"));
const ComplianceDocuments = lazy(() => import("@/pages/compliance-documents"));
const ProfessionalUserManagement = lazy(() => import("@/pages/ProfessionalUserManagement"));
const PaymentFlows = lazy(() => import("@/pages/payment-flows"));
const ThreeWayMatching = lazy(() => import("@/pages/three-way-matching"));
const ExceptionDashboard = lazy(() => import("@/pages/exception-dashboard"));
const BulkCapture = lazy(() => import("@/pages/bulk-capture"));
const SalesDashboard = lazy(() => import("@/pages/sales-dashboard"));
const SalesOrders = lazy(() => import("@/pages/sales-orders"));
const SalesOrderCreate = lazy(() => import("@/pages/sales-order-create"));
const CreditNotes = lazy(() => import("@/pages/credit-notes"));
const CreditNoteCreate = lazy(() => import("@/pages/credit-note-create"));
const CreditNoteDetail = lazy(() => import("@/pages/credit-note-detail"));
const CRMDashboard = lazy(() => import("@/pages/crm-dashboard"));
const Leads = lazy(() => import("@/pages/leads"));
const LeadDetail = lazy(() => import("@/pages/lead-detail"));
const Deals = lazy(() => import("@/pages/deals"));
const DealDetail = lazy(() => import("@/pages/deal-detail"));
const POSSystem = lazy(() => import("@/pages/pos-system"));
const POSReports = lazy(() => import("@/pages/pos-reports"));
const POSSettings = lazy(() => import("@/pages/pos-settings"));
const Sessions = lazy(() => import("@/pages/sessions"));
const SessionDetail = lazy(() => import("@/pages/session-detail"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const PurchaseOrderDetail = lazy(() => import("@/pages/purchase-order-detail"));
const PaymentsManagement = lazy(() => import("@/pages/payments-management"));
const UnifiedUserManagement = lazy(() => import("@/pages/UnifiedUserManagement"));
const EmailNotifications = lazy(() => import("@/pages/email-notifications"));
const NotificationRules = lazy(() => import("@/pages/notification-rules"));
const NotificationTemplates = lazy(() => import("@/pages/notification-templates"));
const SalesOrderDetail = lazy(() => import("@/pages/sales-order-detail"));
const SalesReports = lazy(() => import("@/pages/sales-reports"));
const SARSSettings = lazy(() => import("@/pages/sars-settings"));
const SARSSubmissions = lazy(() => import("@/pages/sars-submissions"));
const SARSDashboard = lazy(() => import("@/pages/sars-dashboard"));
const SARSEfiling = lazy(() => import("@/pages/sars-efiling"));
const AIAssistant = lazy(() => import("@/pages/ai-assistant"));
const AIMonitor = lazy(() => import("@/pages/ai-monitor"));
const ServiceWizard = lazy(() => import("@/pages/service-wizard"));
const ServiceDetail = lazy(() => import("@/pages/service-detail"));
const ContractManagement = lazy(() => import("@/pages/contract-management"));
const ContractCreate = lazy(() => import("@/pages/contract-create"));
const ContractDetail = lazy(() => import("@/pages/contract-detail"));
const DocumentRequests = lazy(() => import("@/pages/document-requests"));
const DocumentRequestCreate = lazy(() => import("@/pages/document-request-create"));
const DocumentRequestDetail = lazy(() => import("@/pages/document-request-detail"));
const EngagementLetters = lazy(() => import("@/pages/engagement-letters"));
const EngagementLetterCreate = lazy(() => import("@/pages/engagement-letter-create"));
const EngagementLetterDetail = lazy(() => import("@/pages/engagement-letter-detail"));
const WorkflowAutomation = lazy(() => import("@/pages/workflow-automation"));
const WorkflowCreate = lazy(() => import("@/pages/workflow-create"));
const WorkflowDetail = lazy(() => import("@/pages/workflow-detail"));
const PracticeManagement = lazy(() => import("@/pages/practice-management"));
const ClientManagement = lazy(() => import("@/pages/client-management"));
const ClientDetail = lazy(() => import("@/pages/client-detail"));

function App() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <NotificationProvider>
          <TooltipProvider>
            <GlobalLoader />
            <Suspense fallback={<PageLoader />}>
              <Switch>
                {/* Public routes */}
                <Route path="/" component={Landing} />
                <Route path="/login" component={Login} />
                <Route path="/trial-signup" component={TrialSignup} />
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
                <Route path="/customer-portal/:portalId" component={CustomerPortal} />

                {/* Protected routes */}
                <Route path="/dashboard">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Route>
                
                {/* Add all other protected routes here with ProtectedRoute wrapper */}
                {/* ... rest of routes ... */}
                
                <Route component={NotFound} />
              </Switch>
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </NotificationProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}

export default App;