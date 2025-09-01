import { useState, useEffect, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { PullToRefresh } from "@/components/mobile/pull-to-refresh";
import { FloatingActionButton } from "@/components/mobile/floating-action-button";
import {
  Plus,
  FileText,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Bell,
  ChevronDown,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  Wallet,
  Building,
  Eye,
  Download,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProfitLossChart from "@/components/dashboard/profit-loss-chart";
import RecentActivities from "@/components/dashboard/recent-activities";
import BankComplianceCard from "@/components/dashboard/bank-compliance-card";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import { dashboardApi, userApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils-invoice";
import { TooltipWizard } from "@/components/onboarding/TooltipWizard";
import { useOnboardingWizard } from "@/hooks/useOnboardingWizard";
import { PaymentFormModal } from "@/components/payments/PaymentFormModal";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

// ──────────────────────────────────────────────────────────────────────────────
// Compact KPI card (inline component so this file is drop‑in)
// ──────────────────────────────────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  sub,
  intent = "info",
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  sub?: string;
  intent?: "info" | "success" | "warn" | "danger";
  icon: any;
  href?: string;
}) {
  const ring =
    intent === "success"
      ? "ring-emerald-200"
      : intent === "warn"
        ? "ring-amber-200"
        : intent === "danger"
          ? "ring-rose-200"
          : "ring-slate-200";
  const body = (
    <div
      className={`w-full rounded-xl border border-slate-200 ring-2 ${ring} bg-white px-3 py-2 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <span aria-hidden className="mt-0.5 text-slate-500">
            <Icon className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-medium text-slate-700">{title}</div>
            <div className="text-2xl font-semibold leading-tight mt-1 text-slate-900">
              {value}
            </div>
            {sub ? (
              <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block" aria-label={`${title} link`}>
      {body}
    </Link>
  ) : (
    body
  );
}

// Thin compliance timeline strip (uses stats.complianceAlerts if present)
function TimelineStrip({
  items,
}: {
  items: {
    id: string;
    label: string;
    date: string;
    intent?: "info" | "warn" | "danger" | "success";
  }[];
}) {
  const badge = {
    info: "bg-slate-100 text-slate-700",
    warn: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    success: "bg-emerald-100 text-emerald-800",
  } as const;
  const today = new Date();
  return (
    <div className="w-full overflow-x-auto whitespace-nowrap py-2 -mx-2 px-2 border-y border-slate-200 bg-white">
      <span className="inline-flex items-center text-xs px-2 py-1 mr-2 rounded bg-slate-200 text-slate-800 border border-slate-300">
        <CalendarIcon className="w-3 h-3 mr-1" /> Today{" "}
        {today.toLocaleDateString()}
      </span>
      {items.map((it) => (
        <span
          key={it.id}
          className={`inline-flex items-center text-xs px-2 py-1 mr-2 rounded ${badge[it.intent || "info"]} border border-slate-200/50`}
        >
          <span className="font-medium mr-1">{it.label}</span>
          <span className="opacity-70">
            {new Date(it.date).toLocaleDateString()}
          </span>
        </span>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [, setLocation] = useLocation();

  // Alerts (light polling)
  const { data: alertCounts } = useQuery({
    queryKey: ["/api/alerts/counts"],
    refetchInterval: 60000,
    staleTime: 45000,
  });

  // Dashboard stats
  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 45000,
    staleTime: 30000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user/me"],
    queryFn: userApi.getCurrentUser,
    staleTime: 300000,
  });

  useLoadingStates({
    loadingStates: [{ isLoading, message: "Loading dashboard data..." }],
    progressSteps: ["Loading dashboard", "Processing data"],
  });

  if (isLoading) return <PageLoader message="Loading dashboard data..." />;

  const s =
    stats ||
    ({
      totalRevenue: "0.00",
      totalExpenses: "0.00",
      outstandingInvoices: "0.00",
      payablesAging: { totalPayables: 0 },
      totalCustomers: 0,
      pendingEstimates: 0,
      bankBalances: [],
      profitLossData: [],
      recentActivities: [],
      complianceAlerts: [],
      recentInvoices: [],
    } as any);

  const totalActiveAlerts = (alertCounts as any)?.active || 0;

  const name = currentUser?.name ? `, ${currentUser.name}` : "";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const totalCash = (s.bankBalances || []).reduce(
    (acc: number, b: any) => acc + (parseFloat(b.balance) || 0),
    0,
  );
  const revenueGrowth = (() => {
    const cur = parseFloat(s.totalRevenue) || 0;
    if (!cur) return "0.0";
    const last = cur * 0.85; // placeholder trend
    return (((cur - last) / (last || 1)) * 100).toFixed(1);
  })();

  const handleRefresh = async () => {
    await refetch();
  };

  const timelineItems = (s.complianceAlerts || [])
    .slice(0, 12)
    .map((a: any, i: number) => ({
      id: a.id || String(i),
      label: a.title || a.type || "Compliance",
      date: a.dueDate || new Date().toISOString(),
      intent:
        a.level === "critical"
          ? "danger"
          : a.level === "warn"
            ? "warn"
            : "info",
    }));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-3 shadow-sm">
          <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                {greeting}
                {name}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Business performance overview
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Quick Create{" "}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/invoices/create"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" /> New Invoice
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/estimates/create"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" /> New Estimate
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsPaymentModalOpen(true)}>
                    <DollarSign className="h-4 w-4 mr-2" /> Record Payment
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/customers/create"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" /> Add Customer
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Link href="/alerts">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4 mr-2" /> Alerts
                  {totalActiveAlerts > 0 && (
                    <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] bg-rose-500 text-white">
                      {totalActiveAlerts}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-screen-2xl mx-auto px-4 py-4 space-y-4">
          {/* KPI strip (4 only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              title="Cash (all accounts)"
              value={formatCurrency(totalCash)}
              sub={`as of ${new Date().toLocaleDateString()}`}
              intent="success"
              icon={Wallet}
              href="/banking"
            />
            <KpiCard
              title="Receivable"
              value={formatCurrency(s.outstandingInvoices || "0.00")}
              sub="Money owed to you"
              intent="info"
              icon={ArrowUpRight}
              href="/customer-payments"
            />
            <KpiCard
              title="Expenses"
              value={formatCurrency(s.totalExpenses || "0.00")}
              sub="This period"
              intent="warn"
              icon={TrendingDown}
              href="/expenses"
            />
            <KpiCard
              title="Payables"
              value={formatCurrency(s?.payablesAging?.totalPayables || 0)}
              sub="Money you owe"
              intent="danger"
              icon={ArrowDownLeft}
              href="/expenses"
            />
          </div>

          {/* Compliance timeline (1 line) */}
          <TimelineStrip items={timelineItems} />

          {/* Tabs remain (Overview / Sales / Finance / Reports) but compact */}
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-3"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1">
              <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-transparent p-0">
                {[
                  { key: "overview", label: "Overview" },
                  { key: "sales", label: "Sales" },
                  { key: "finance", label: "Finance" },
                  { key: "reports", label: "Reports" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.key}
                    value={t.key}
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium px-5 py-2 rounded-md transition-all hover:bg-slate-100 text-slate-700"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-3">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                {/* Chart */}
                <Card className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold text-slate-800">
                          Revenue Trends
                        </CardTitle>
                        <CardDescription>
                          Monthly performance overview
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation("/reports/financial")}
                          title="View detailed revenue reports"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Download revenue report"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProfitLossChart data={s.profitLossData || []} />
                  </CardContent>
                </Card>

                {/* Activities */}
                <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold text-slate-800">
                          Recent Activities
                        </CardTitle>
                        <CardDescription>
                          Latest business updates
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/activities">
                          <Eye className="h-4 w-4 mr-2" /> View All
                        </Link>
                      </Button>
                    </div>
                    {/* Search */}
                    <div className="relative mt-2">
                      <input
                        type="text"
                        placeholder="Search invoices, clients, amounts, or status..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-9 bg-slate-50 hover:bg-white"
                        onChange={(e) => setActivitySearchTerm(e.target.value)}
                        value={activitySearchTerm}
                      />
                      <div className="absolute left-3 top-2.5">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                      {activitySearchTerm && (
                        <button
                          onClick={() => setActivitySearchTerm("")}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[30rem] overflow-y-auto px-4 pb-4">
                      <RecentActivities
                        activities={
                          activitySearchTerm
                            ? (s.recentActivities || []).filter(
                                (a: any) =>
                                  (a.description || "")
                                    .toLowerCase()
                                    .includes(
                                      activitySearchTerm.toLowerCase(),
                                    ) ||
                                  (a.customerName || "")
                                    .toLowerCase()
                                    .includes(
                                      activitySearchTerm.toLowerCase(),
                                    ) ||
                                  (a.amount || "")
                                    .toString()
                                    .includes(activitySearchTerm) ||
                                  (a.status || "")
                                    .toLowerCase()
                                    .includes(activitySearchTerm.toLowerCase()),
                              )
                            : s.recentActivities || []
                        }
                        showMore
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sales */}
            <TabsContent value="sales" className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" /> Recent
                        Invoices
                      </CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/invoices">
                          <Eye className="h-4 w-4 mr-2" /> View All
                        </Link>
                      </Button>
                    </div>
                    <CardDescription>Latest billing activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {s.recentInvoices?.length ? (
                      <RecentInvoices invoices={s.recentInvoices} />
                    ) : (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        No recent invoices
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" /> Sales
                      Performance
                    </CardTitle>
                    <CardDescription>
                      Interactive analytics from real transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {s.recentInvoices?.length ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded">
                          <div className="text-lg font-bold text-slate-900">
                            R{" "}
                            {(
                              parseFloat(s.totalRevenue) /
                                ((s.paidInvoiceCount || 0) +
                                  (s.outstandingInvoiceCount || 1)) || 0
                            ).toFixed(0)}
                          </div>
                          <div className="text-xs text-slate-600">
                            Avg Invoice Value
                          </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded">
                          <div className="text-lg font-bold text-slate-900">
                            {s.recentInvoices.length}
                          </div>
                          <div className="text-xs text-slate-600">
                            Active Invoices
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        No sales data yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-800">
                      Sales Pipeline
                    </CardTitle>
                    <CardDescription>
                      Real customer opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="text-lg font-bold text-blue-700">
                          {s.totalCustomers}
                        </div>
                        <div className="text-xs text-blue-600">
                          Active Customers
                        </div>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                        <div className="text-lg font-bold text-emerald-700">
                          {s.pendingEstimates || 0}
                        </div>
                        <div className="text-xs text-emerald-600">
                          Pending Estimates
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Link href="/customers">Manage Customers</Link>
                      </Button>
                      <Button asChild size="sm" className="w-full">
                        <Link href="/estimates/new">Create Estimate</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Finance */}
            <TabsContent value="finance" className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                <BankComplianceCard />
                {/* Compact bank balances */}
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-600" /> Bank
                      Balances
                    </CardTitle>
                    <CardDescription>Current account positions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(s.bankBalances || [])
                        .slice(0, 3)
                        .map((account: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
                          >
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-emerald-100 rounded">
                                <Building className="w-3 h-3 text-emerald-700" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-800">
                                  {account.accountName || "Bank Account"}
                                </div>
                                <div className="text-xs text-slate-600">
                                  {account.accountNumber || "Current Account"}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-slate-900">
                                {formatCurrency(account.balance || "0.00")}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Available
                              </div>
                            </div>
                          </div>
                        ))}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Link href="/banking">
                          <Eye className="h-3 w-3 mr-2" /> View All Accounts
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Aged analysis compact */}
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      Aged Analysis
                    </CardTitle>
                    <CardDescription>
                      Receivables & payables aging
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded border border-slate-200">
                        <div className="font-bold text-slate-900">
                          Receivables
                        </div>
                        <div className="text-slate-600">Coming soon</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-200">
                        <div className="font-bold text-slate-900">Payables</div>
                        <div className="text-slate-600">Coming soon</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reports (links) */}
            <TabsContent value="reports" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-800">
                      Financial Reports
                    </CardTitle>
                    <CardDescription>
                      P&L, Balance Sheet, Cash Flow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/advanced-analytics">View Reports</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-800">
                      Sales Analytics
                    </CardTitle>
                    <CardDescription>
                      Customer insights & trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/business-reports">View Analytics</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-800">
                      Audit Trail
                    </CardTitle>
                    <CardDescription>
                      User activity & system logs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/audit-trail">View Audit Trail</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Onboarding */}
          <TooltipWizard
            isVisible={useOnboardingWizard().isWizardVisible}
            steps={useOnboardingWizard().onboardingSteps}
            onComplete={useOnboardingWizard().completeOnboarding}
            onSkip={useOnboardingWizard().skipOnboarding}
          />
        </div>

        {/* Modal + FAB */}
        <PaymentFormModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
        <FloatingActionButton
          onClick={() => setLocation("/invoices/new")}
          label="New Invoice"
          extended={false}
          className="md:hidden"
        />
      </div>
    </PullToRefresh>
  );
}
