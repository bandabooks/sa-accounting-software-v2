import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Search, Filter, Calendar, DollarSign, CreditCard, Receipt, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/ui/page-loader";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { useLocation } from "wouter";
import AddBillModal from "@/components/bills/AddBillModal";

export default function BillsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  const [showAddBillModal, setShowAddBillModal] = useState(false);

  // Fetch bills data
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['/api/bills'],
    enabled: !!user?.companyId,
  });

  // Fetch bills metrics
  const { data: billsMetrics } = useQuery({
    queryKey: ['/api/bills/metrics'],
    enabled: !!user?.companyId,
  });

  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading bills...' },
    ],
    progressSteps: ['Fetching bills', 'Processing data'],
  });

  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading bills...' },
    ],
    progressSteps: ['Fetching bills', 'Processing data'],
  });

  const formatCurrency = (amount: string | number) => {
    return `R ${Number(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Bills & Accounts Payable
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base">
                  Manage unpaid bills and accounts payable
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowAddBillModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-base px-6 py-3 rounded-xl"
            >
              <Plus className="h-5 w-5" />
              Add New Bill
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/expenses')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200 text-base px-6 py-3 rounded-xl"
            >
              <DollarSign className="h-5 w-5" />
              View Expenses
            </Button>
          </div>
        </div>

        {/* Enhanced Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Unpaid Bills</CardTitle>
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                <TrendingDown className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {formatCurrency("0.00")}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Outstanding amount
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bills Count</CardTitle>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                0
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Total unpaid bills
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overdue Bills</CardTitle>
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                0
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Past due date
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">VAT on Bills</CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Receipt className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatCurrency("0.00")}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                VAT on unpaid bills
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters and Search */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Filters & Search
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Bills</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bills Table */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Bills & Accounts Payable
              </span>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Track and manage all your unpaid bills and accounts payable
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bills && bills.length > 0 ? (
              <div className="space-y-4">
                {/* Bills Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Bill Number</th>
                        <th className="text-left p-3">Supplier</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Due Date</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill: any) => (
                        <tr key={bill.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{bill.billNumber}</td>
                          <td className="p-3">{bill.supplierName || `Supplier ${bill.supplierId}`}</td>
                          <td className="p-3">{new Date(bill.billDate).toLocaleDateString()}</td>
                          <td className="p-3">{new Date(bill.dueDate).toLocaleDateString()}</td>
                          <td className="p-3">{formatCurrency(bill.total)}</td>
                          <td className="p-3">
                            <Badge variant={bill.status === 'paid' ? 'default' : 'secondary'}>
                              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-200 dark:from-blue-700 dark:to-purple-800 rounded-2xl mb-4">
                  <FileText className="h-16 w-16" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Bills Found</h3>
                <p className="text-sm text-center max-w-md">
                  You haven't created any bills yet. Click "Add New Bill" to create your first bill with proper GL account validation and accounting workflows.
                </p>
                <div className="mt-4">
                  <Badge variant="outline" className="px-4 py-2">
                    Ready to Use
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Bill Modal */}
        <AddBillModal
          open={showAddBillModal}
          onOpenChange={setShowAddBillModal}
        />
      </div>
    </div>
  );
}