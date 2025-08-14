import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Plus, 
  Search, 
  Calendar, 
  Repeat, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Building2,
  Calculator,
  Timer,
  Bell
} from "lucide-react";
import { format, addDays } from "date-fns";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

interface RecurringExpense {
  id: number;
  companyId: number;
  templateName: string;
  supplierId?: number;
  supplierName?: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  amount: string;
  vatType: string;
  vatRate: string;
  frequency: "monthly" | "quarterly" | "annually" | "weekly";
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  autoApprove: boolean;
  isActive: boolean;
  reminderDays: number;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface RecurringExpenseMetrics {
  totalActiveTemplates: number;
  totalMonthlyValue: string;
  nextDueAmount: string;
  overdueCount: number;
  automatedExpenses: number;
  manualExpenses: number;
}

interface GeneratedExpense {
  id: number;
  templateId: number;
  templateName: string;
  amount: string;
  generatedDate: string;
  status: "pending" | "approved" | "posted";
}

export default function RecurringExpenses() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all_suppliers");

  // Fetch recurring expense metrics
  const { data: metrics } = useQuery<RecurringExpenseMetrics>({
    queryKey: ['/api/recurring-expenses/metrics'],
    staleTime: 30000,
  });

  // Fetch recurring expenses
  const { data: recurringExpenses, isLoading } = useQuery<RecurringExpense[]>({
    queryKey: ['/api/recurring-expenses', { 
      search: searchTerm,
      frequency: selectedFrequency,
      status: selectedStatus,
      supplier: selectedSupplier
    }],
    staleTime: 10000,
  });

  // Fetch recently generated expenses
  const { data: generatedExpenses } = useQuery<GeneratedExpense[]>({
    queryKey: ['/api/recurring-expenses/recent-generated'],
    staleTime: 30000,
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ templateId, isActive }: { templateId: number; isActive: boolean }) => {
      return apiRequest(`/api/recurring-expenses/${templateId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-expenses'] });
      toast({
        title: "Template Updated",
        description: "Recurring expense template status updated successfully.",
      });
    },
  });

  // Generate expense now mutation
  const generateNowMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return apiRequest(`/api/recurring-expenses/${templateId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({
        title: "Expense Generated",
        description: "Recurring expense has been generated successfully.",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return apiRequest(`/api/recurring-expenses/${templateId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-expenses'] });
      toast({
        title: "Template Deleted",
        description: "Recurring expense template has been deleted.",
      });
    },
  });

  // Use loading states for comprehensive loading feedback including mutations
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading recurring expenses...' },
      { isLoading: toggleActiveMutation.isPending, message: 'Updating template status...' },
      { isLoading: generateNowMutation.isPending, message: 'Generating expense...' },
      { isLoading: deleteTemplateMutation.isPending, message: 'Deleting template...' },
    ],
    progressSteps: ['Fetching recurring expenses', 'Loading metrics data', 'Processing templates'],
  });

  if (isLoading) {
    return <PageLoader message="Loading recurring expenses..." />;
  }

  const getFrequencyBadge = (frequency: string) => {
    const config = {
      weekly: { color: "bg-blue-100 text-blue-800", label: "Weekly" },
      monthly: { color: "bg-green-100 text-green-800", label: "Monthly" },
      quarterly: { color: "bg-purple-100 text-purple-800", label: "Quarterly" },
      annually: { color: "bg-orange-100 text-orange-800", label: "Annually" },
    };
    
    const freq = config[frequency as keyof typeof config] || config.monthly;
    return (
      <Badge className={freq.color}>
        {freq.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: string) => {
    return `R ${parseFloat(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  const calculateNextDue = (template: RecurringExpense) => {
    const nextDue = new Date(template.nextDueDate);
    const today = new Date();
    const diffTime = nextDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: "overdue", days: Math.abs(diffDays), label: `${Math.abs(diffDays)} days overdue` };
    } else if (diffDays === 0) {
      return { status: "today", days: 0, label: "Due today" };
    } else if (diffDays <= template.reminderDays) {
      return { status: "upcoming", days: diffDays, label: `Due in ${diffDays} days` };
    } else {
      return { status: "future", days: diffDays, label: `Due in ${diffDays} days` };
    }
  };

  const filteredTemplates = recurringExpenses?.filter(template => {
    const matchesSearch = !searchTerm || 
      template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFrequency = selectedFrequency === "all" || template.frequency === selectedFrequency;
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "active" && template.isActive) ||
      (selectedStatus === "inactive" && !template.isActive);
    const matchesSupplier = selectedSupplier === "all_suppliers" || 
      template.supplierId?.toString() === selectedSupplier;
    
    return matchesSearch && matchesFrequency && matchesStatus && matchesSupplier;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recurring Expenses</h1>
            <p className="text-gray-600 mt-1">
              Automate repetitive expenses like rent, utilities, and subscriptions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setLocation("/recurring-expenses/create")}
            >
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.totalActiveTemplates || 0}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Repeat className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics?.totalMonthlyValue || "0.00")}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Due Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics?.nextDueAmount || "0.00")}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Templates</p>
                <p className="text-3xl font-bold text-red-600">{metrics?.overdueCount || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto-Generated</p>
                <p className="text-3xl font-bold text-green-600">{metrics?.automatedExpenses || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manual Review</p>
                <p className="text-3xl font-bold text-yellow-600">{metrics?.manualExpenses || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Recurring Templates</TabsTrigger>
          <TabsTrigger value="generated">Recently Generated</TabsTrigger>
          <TabsTrigger value="schedule">Upcoming Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Frequencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_suppliers">All Suppliers</SelectItem>
                    <SelectItem value="1">Supplier 1</SelectItem>
                    <SelectItem value="2">Supplier 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const nextDueInfo = calculateNextDue(template);
              
              return (
                <Card key={template.id} className={`transition-all duration-200 hover:shadow-lg ${
                  !template.isActive ? 'opacity-60' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.templateName}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Template
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => generateNowMutation.mutate(template.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Generate Now
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleActiveMutation.mutate({
                              templateId: template.id,
                              isActive: !template.isActive
                            })}
                          >
                            {template.isActive ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(template.amount)}
                      </span>
                      {getFrequencyBadge(template.frequency)}
                    </div>

                    {template.supplierName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        {template.supplierName}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className={`font-medium ${
                        nextDueInfo.status === 'overdue' ? 'text-red-600' :
                        nextDueInfo.status === 'today' ? 'text-orange-600' :
                        nextDueInfo.status === 'upcoming' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {nextDueInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={template.isActive}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({
                              templateId: template.id,
                              isActive: checked
                            })
                          }
                        />
                        <span className="text-gray-600">
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {template.autoApprove && (
                        <Badge variant="secondary" className="text-xs">
                          Auto-approve
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => generateNowMutation.mutate(template.id)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Repeat className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recurring templates</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first recurring expense template to automate repetitive expenses.
                  </p>
                  <div className="mt-6">
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Generated Expenses</CardTitle>
              <CardDescription>
                Expenses automatically created from recurring templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedExpenses && generatedExpenses.length > 0 ? (
                <div className="space-y-4">
                  {generatedExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Repeat className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{expense.templateName}</div>
                          <div className="text-sm text-gray-500">
                            Generated on {format(new Date(expense.generatedDate), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatCurrency(expense.amount)}</span>
                        <Badge variant={
                          expense.status === 'posted' ? 'default' :
                          expense.status === 'approved' ? 'secondary' : 'outline'
                        }>
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No generated expenses</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Generated expenses will appear here when recurring templates create them.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>
                Preview of upcoming recurring expense generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Timer className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Schedule view coming soon</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Calendar view of all upcoming recurring expense generations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}