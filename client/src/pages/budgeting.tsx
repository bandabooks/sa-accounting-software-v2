import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, PieChart, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Budget {
  id: number;
  name: string;
  description?: string;
  budgetType: string;
  startDate: string;
  endDate: string;
  totalBudget: string;
  status: string;
  approvedBy?: number;
  approvedAt?: string;
  createdBy: number;
  createdAt: string;
  lines?: BudgetLine[];
}

interface BudgetLine {
  id: number;
  category: string;
  description?: string;
  budgetedAmount: string;
  actualAmount: string;
  variance: string;
  variancePercent: string;
}

export default function Budgeting() {
  const [activeTab, setActiveTab] = useState("budgets");
  const { toast } = useToast();

  // Fetch budgets
  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  // Delete budget mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/budgets/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({ title: "Success", description: "Budget deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete budget", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBudgetTypeColor = (type: string) => {
    switch (type) {
      case "annual": return "bg-purple-100 text-purple-800";
      case "quarterly": return "bg-blue-100 text-blue-800";
      case "monthly": return "bg-green-100 text-green-800";
      case "project": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalBudgetAmount = budgets.reduce((sum, budget) => sum + parseFloat(budget.totalBudget), 0);
  const activeBudgets = budgets.filter(budget => budget.status === "active").length;

  if (budgetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgeting & Forecasting</h1>
          <p className="text-gray-600 mt-1">Plan and track your financial budgets with variance analysis</p>
        </div>
        <Link href="/budgets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudgetAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBudgets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Performance</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="budgets">Budget Overview</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>Create and manage your company budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Budgets Created</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first budget</p>
                    <Link href="/budgets/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Budget
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgets.map((budget) => (
                      <Card key={budget.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{budget.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {budget.description}
                              </CardDescription>
                            </div>
                            <div className="flex space-x-1">
                              <Badge className={`capitalize ${getStatusColor(budget.status)}`}>
                                {budget.status}
                              </Badge>
                              <Badge className={`capitalize ${getBudgetTypeColor(budget.budgetType)}`}>
                                {budget.budgetType}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Period:</span>
                              <span>{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Budget:</span>
                              <span className="font-medium">{formatCurrency(parseFloat(budget.totalBudget))}</span>
                            </div>
                            <div className="flex justify-between pt-2">
                              <Link href={`/budgets/${budget.id}`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteBudgetMutation.mutate(budget.id)}
                                disabled={deleteBudgetMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variance Analysis</CardTitle>
              <CardDescription>Compare budgeted vs actual performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Variance Analysis</h3>
                <p className="text-gray-600 mb-4">Track performance against your budgets</p>
                <Button>Generate Variance Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Forecasting</CardTitle>
              <CardDescription>Predict future financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Forecasting</h3>
                <p className="text-gray-600 mb-4">Create financial forecasts based on historical data</p>
                <Button>Create Forecast</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}