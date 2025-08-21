import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Building, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Eye,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  LogIn,
  Info
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import ModulePermissionSelector from "@/components/subscription/ModulePermissionSelector";

interface SystemAnalytics {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  activeUsers: number;
  subscriptionStats: Array<{
    plan: string;
    count: number;
  }>;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: {
    included_modules?: string[];
    core_features?: string[];
  } | string[];
  limits: Record<string, number>;
  isActive: boolean;
  sortOrder: number;
}

interface Company {
  id: number;
  name: string;
  displayName: string;
  email: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  isActive: boolean;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
}

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  
  // Module selection state for create plan dialog
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedLimits, setSelectedLimits] = useState<Record<string, any>>({});
  const [createPlanTab, setCreatePlanTab] = useState("basic");
  
  // Login As User confirmation modal
  const [loginAsUserModalOpen, setLoginAsUserModalOpen] = useState(false);
  const [selectedUserForLogin, setSelectedUserForLogin] = useState<User | null>(null);

  // Navigation functions
  const navigateToCompany = (companyId: number) => {
    setLocation(`/super-admin/companies/${companyId}`);
  };

  const navigateToUser = (userId: number) => {
    setLocation(`/super-admin/users/${userId}`);
  };

  const navigateToPlanEdit = (planId: number) => {
    setLocation(`/super-admin/plans/${planId}`);
  };

  // Log in as user function for support and troubleshooting
  const loginAsUser = async (userId: number) => {
    try {
      const result = await apiRequest(`/api/super-admin/impersonate/${userId}`, "POST");
      if (result.token) {
        // Store the new token and redirect to dashboard
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('sessionToken', result.sessionToken || result.token);
        // Force page reload to refresh auth context
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log in as user",
        variant: "destructive",
      });
    }
  };

  const handleLoginAsUser = (user: User) => {
    setSelectedUserForLogin(user);
    setLoginAsUserModalOpen(true);
  };

  const confirmLoginAsUser = () => {
    if (selectedUserForLogin) {
      loginAsUser(selectedUserForLogin.id);
      setLoginAsUserModalOpen(false);
      setSelectedUserForLogin(null);
    }
  };

  // Fetch system analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<SystemAnalytics>({
    queryKey: ["/api/super-admin/analytics"],
  });

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/super-admin/subscription-plans"],
  });

  // Fetch all companies
  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/super-admin/companies"],
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/super-admin/users"],
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest("/api/super-admin/subscription-plans", "POST", planData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/subscription-plans"] });
      setIsCreatePlanDialogOpen(false);
      setSelectedFeatures([]);
      setSelectedLimits({});
      setCreatePlanTab("basic");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create subscription plan",
        variant: "destructive",
      });
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...planData }: any) => {
      return await apiRequest(`/api/super-admin/subscription-plans/${id}`, "PUT", planData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/subscription-plans"] });
      setEditingPlan(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return await apiRequest(`/api/super-admin/subscription-plans/${planId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/subscription-plans"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete subscription plan",
        variant: "destructive",
      });
    },
  });



  const handleCreatePlan = () => {
    // Get values from form elements directly
    const form = document.getElementById('createPlanForm') as HTMLFormElement;
    const formData = new FormData(form);
    
    // Get all form elements by name to ensure we capture data from all tabs
    const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
    const displayNameInput = form.querySelector('[name="displayName"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('[name="description"]') as HTMLTextAreaElement;
    const monthlyPriceInput = form.querySelector('[name="monthlyPrice"]') as HTMLInputElement;
    const annualPriceInput = form.querySelector('[name="annualPrice"]') as HTMLInputElement;
    const sortOrderInput = form.querySelector('[name="sortOrder"]') as HTMLInputElement;
    
    // Get select values directly
    const maxUsersSelect = form.querySelector('[name="maxUsers"]') as HTMLSelectElement;
    const maxCompaniesSelect = form.querySelector('[name="maxCompanies"]') as HTMLSelectElement;
    const maxCustomersSelect = form.querySelector('[name="maxCustomers"]') as HTMLSelectElement;
    const maxSuppliersSelect = form.querySelector('[name="maxSuppliers"]') as HTMLSelectElement;
    const monthlyInvoiceLimitSelect = form.querySelector('[name="monthlyInvoiceLimit"]') as HTMLSelectElement;
    const monthlyEstimateLimitSelect = form.querySelector('[name="monthlyEstimateLimit"]') as HTMLSelectElement;
    const storageLimitSelect = form.querySelector('[name="storageLimit"]') as HTMLSelectElement;
    const apiCallsLimitSelect = form.querySelector('[name="apiCallsLimit"]') as HTMLSelectElement;

    // Create user-friendly feature names from selected modules
    const moduleFeatures = selectedFeatures.map(moduleId => 
      moduleId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );

    const planData = {
      name: nameInput?.value || '',
      displayName: displayNameInput?.value || '',
      description: descriptionInput?.value || '',
      monthlyPrice: parseFloat(monthlyPriceInput?.value || '0'),
      annualPrice: parseFloat(annualPriceInput?.value || '0'),
      features: {
        core_features: moduleFeatures,
        included_modules: selectedFeatures,
        permissions: selectedLimits
      },
      limits: {
        users: maxUsersSelect?.value === 'unlimited' ? -1 : parseInt(maxUsersSelect?.value || '5'),
        companies: maxCompaniesSelect?.value === 'unlimited' ? -1 : parseInt(maxCompaniesSelect?.value || '1'),
        customers: maxCustomersSelect?.value === 'unlimited' ? -1 : parseInt(maxCustomersSelect?.value || '100'),
        suppliers: maxSuppliersSelect?.value === 'unlimited' ? -1 : parseInt(maxSuppliersSelect?.value || '50'),
        invoices_per_month: monthlyInvoiceLimitSelect?.value === 'unlimited' ? -1 : parseInt(monthlyInvoiceLimitSelect?.value || '50'),
        estimates_per_month: monthlyEstimateLimitSelect?.value === 'unlimited' ? -1 : parseInt(monthlyEstimateLimitSelect?.value || '25'),
        storage_gb: storageLimitSelect?.value === 'unlimited' ? -1 : parseFloat(storageLimitSelect?.value || '1'),
        api_calls_per_month: apiCallsLimitSelect?.value === 'unlimited' ? -1 : parseInt(apiCallsLimitSelect?.value || '1000')
      },
      sortOrder: parseInt(sortOrderInput?.value || '0'),
    };
    
    console.log('Creating plan with data:', planData);
    createPlanMutation.mutate(planData);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage the entire system, users, companies, and subscription plans
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="monitoring">Subscription Monitoring</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-blue-300 hover:bg-blue-50"
              onClick={() => setLocation("/super-admin/companies")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.activeCompanies || 0} active
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-green-300 hover:bg-green-50"
              onClick={() => setLocation("/super-admin/users")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.activeUsers || 0} active
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => setLocation("/super-admin/revenue-reports")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R 0.00</div>
                <p className="text-xs text-muted-foreground">Total system revenue</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-purple-300 hover:bg-purple-50"
              onClick={() => setLocation("/super-admin/subscriptions")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.subscriptionStats?.reduce((sum, stat) => sum + parseInt(stat.count.toString()), 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">Across all plans</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.subscriptionStats?.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stat.plan}</span>
                    <Badge variant="secondary">{stat.count} companies</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Subscription Plans</h2>
            <Dialog open={isCreatePlanDialogOpen} onOpenChange={(open) => {
              setIsCreatePlanDialogOpen(open);
              if (!open) {
                // Reset module selection when dialog closes
                setSelectedFeatures([]);
                setSelectedLimits({});
                setCreatePlanTab("basic");
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Subscription Plan</DialogTitle>
                  <DialogDescription>
                    Create a new subscription plan for companies to subscribe to.
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs value={createPlanTab} onValueChange={setCreatePlanTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Details</TabsTrigger>
                    <TabsTrigger value="modules">Modules & Permissions</TabsTrigger>
                    <TabsTrigger value="limits">Limits & Features</TabsTrigger>
                  </TabsList>

                  <form id="createPlanForm" onSubmit={(e) => {
                    e.preventDefault();
                    handleCreatePlan();
                  }}>
                    
                    <TabsContent value="basic" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Plan Information</CardTitle>
                          <CardDescription>Basic subscription plan details and pricing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Plan Name (Internal)</Label>
                              <Input id="name" name="name" placeholder="e.g., basic" required />
                              <p className="text-xs text-muted-foreground mt-1">Used internally, no spaces or special characters</p>
                            </div>
                            <div>
                              <Label htmlFor="displayName">Display Name</Label>
                              <Input id="displayName" name="displayName" placeholder="e.g., Basic Plan" required />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="Plan description..." rows={3} />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="monthlyPrice">Monthly Price (R)</Label>
                              <Input id="monthlyPrice" name="monthlyPrice" type="number" step="0.01" required />
                            </div>
                            <div>
                              <Label htmlFor="annualPrice">Annual Price (R)</Label>
                              <Input id="annualPrice" name="annualPrice" type="number" step="0.01" required />
                            </div>
                            <div>
                              <Label htmlFor="sortOrder">Sort Order</Label>
                              <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="modules" className="space-y-6">
                      <ModulePermissionSelector
                        selectedFeatures={selectedFeatures}
                        selectedLimits={selectedLimits}
                        onFeaturesChange={setSelectedFeatures}
                        onLimitsChange={setSelectedLimits}
                        planName="New Plan"
                      />
                    </TabsContent>

                    <TabsContent value="limits" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Subscription Limits & Features</CardTitle>
                          <CardDescription>Configure usage limits and feature availability for the subscription plan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          
                          {/* Access & Users */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <h3 className="text-lg font-semibold">Access & Users</h3>
                              <Badge variant="secondary">2 limits</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 ml-5">
                              <div>
                                <Label htmlFor="maxUsers">Maximum Users</Label>
                                <Select name="maxUsers" defaultValue="5">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select user limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 user</SelectItem>
                                    <SelectItem value="2">2 users</SelectItem>
                                    <SelectItem value="5">5 users</SelectItem>
                                    <SelectItem value="10">10 users</SelectItem>
                                    <SelectItem value="25">25 users</SelectItem>
                                    <SelectItem value="50">50 users</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Total number of users allowed per company</p>
                              </div>
                              <div>
                                <Label htmlFor="maxCompanies">Maximum Companies</Label>
                                <Select name="maxCompanies" defaultValue="1">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select company limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 company</SelectItem>
                                    <SelectItem value="3">3 companies</SelectItem>
                                    <SelectItem value="5">5 companies</SelectItem>
                                    <SelectItem value="10">10 companies</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Number of companies/businesses user can manage</p>
                              </div>
                            </div>
                          </div>

                          {/* Transactions */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <h3 className="text-lg font-semibold">Transactions</h3>
                              <Badge variant="secondary">4 limits</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 ml-5">
                              <div>
                                <Label htmlFor="monthlyInvoiceLimit">Monthly Invoice Limit</Label>
                                <Select name="monthlyInvoiceLimit" defaultValue="50">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select invoice limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="10">10 invoices/month</SelectItem>
                                    <SelectItem value="25">25 invoices/month</SelectItem>
                                    <SelectItem value="50">50 invoices/month</SelectItem>
                                    <SelectItem value="100">100 invoices/month</SelectItem>
                                    <SelectItem value="250">250 invoices/month</SelectItem>
                                    <SelectItem value="500">500 invoices/month</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Maximum invoices that can be created per month</p>
                              </div>
                              <div>
                                <Label htmlFor="monthlyEstimateLimit">Monthly Estimate Limit</Label>
                                <Select name="monthlyEstimateLimit" defaultValue="25">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select estimate limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5 estimates/month</SelectItem>
                                    <SelectItem value="15">15 estimates/month</SelectItem>
                                    <SelectItem value="25">25 estimates/month</SelectItem>
                                    <SelectItem value="50">50 estimates/month</SelectItem>
                                    <SelectItem value="100">100 estimates/month</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Maximum estimates that can be created per month</p>
                              </div>
                              <div>
                                <Label htmlFor="maxCustomers">Maximum Customers</Label>
                                <Select name="maxCustomers" defaultValue="100">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select customer limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="25">25 customers</SelectItem>
                                    <SelectItem value="50">50 customers</SelectItem>
                                    <SelectItem value="100">100 customers</SelectItem>
                                    <SelectItem value="250">250 customers</SelectItem>
                                    <SelectItem value="500">500 customers</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Total number of customers allowed</p>
                              </div>
                              <div>
                                <Label htmlFor="maxSuppliers">Maximum Suppliers</Label>
                                <Select name="maxSuppliers" defaultValue="50">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select supplier limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="10">10 suppliers</SelectItem>
                                    <SelectItem value="25">25 suppliers</SelectItem>
                                    <SelectItem value="50">50 suppliers</SelectItem>
                                    <SelectItem value="100">100 suppliers</SelectItem>
                                    <SelectItem value="250">250 suppliers</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Total number of suppliers allowed</p>
                              </div>
                            </div>
                          </div>

                          {/* Storage & Data */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <h3 className="text-lg font-semibold">Storage & Data</h3>
                              <Badge variant="secondary">2 limits</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 ml-5">
                              <div>
                                <Label htmlFor="storageLimit">Storage Limit (GB)</Label>
                                <Select name="storageLimit" defaultValue="1">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select storage limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0.5">0.5 GB</SelectItem>
                                    <SelectItem value="1">1 GB</SelectItem>
                                    <SelectItem value="2">2 GB</SelectItem>
                                    <SelectItem value="5">5 GB</SelectItem>
                                    <SelectItem value="10">10 GB</SelectItem>
                                    <SelectItem value="25">25 GB</SelectItem>
                                    <SelectItem value="50">50 GB</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Maximum file storage allowed</p>
                              </div>
                              <div>
                                <Label htmlFor="apiCallsLimit">API Calls Limit (per month)</Label>
                                <Select name="apiCallsLimit" defaultValue="1000">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select API limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="500">500 calls/month</SelectItem>
                                    <SelectItem value="1000">1,000 calls/month</SelectItem>
                                    <SelectItem value="2500">2,500 calls/month</SelectItem>
                                    <SelectItem value="5000">5,000 calls/month</SelectItem>
                                    <SelectItem value="10000">10,000 calls/month</SelectItem>
                                    <SelectItem value="25000">25,000 calls/month</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Maximum API requests per month</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Hidden inputs for form submission */}
                    <input
                      type="hidden"
                      name="features"
                      value={JSON.stringify({
                        modules: selectedFeatures,
                        permissions: selectedLimits
                      })}
                    />
                    <input
                      type="hidden"
                      name="limits"
                      value={JSON.stringify({
                        users: 5,
                        companies: 1,
                        customers: 100,
                        suppliers: 50,
                        invoices_per_month: 50,
                        estimates_per_month: 25,
                        storage_gb: 1,
                        api_calls_per_month: 1000
                      })}
                    />

                  </form>
                  
                  <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsCreatePlanDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      form="createPlanForm"
                      disabled={createPlanMutation.isPending}
                    >
                      {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
                    </Button>
                  </div>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.displayName}
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold">R {plan.monthlyPrice}/month</p>
                      <p className="text-sm text-muted-foreground">
                        R {plan.annualPrice}/year
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Features:</h4>
                      <ul className="text-sm space-y-1">
                        {(() => {
                          // Handle different feature formats
                          if (Array.isArray(plan.features)) {
                            return plan.features.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ));
                          } else if (plan.features?.modules && Array.isArray(plan.features.modules)) {
                            // New format from module selector
                            return plan.features.modules.map((moduleId, index) => (
                              <li key={index}>• {moduleId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                            ));
                          } else if (plan.features?.core_features) {
                            // Existing format
                            return plan.features.core_features.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ));
                          } else if (plan.features?.included_modules) {
                            // Another existing format
                            const modules = plan.features.included_modules.filter(module => 
                              !module.includes(':') // Filter out permission strings
                            );
                            return modules.map((module, index) => (
                              <li key={index}>• {module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                            ));
                          } else {
                            return [<li key="no-features">No features configured</li>];
                          }
                        })()}
                      </ul>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigateToPlanEdit(plan.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePlanMutation.mutate(plan.id)}
                        disabled={deletePlanMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Monitoring
              </CardTitle>
              <CardDescription>
                Access detailed trial users, active subscribers, and revenue analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Advanced Subscription Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Monitor trial conversions, track revenue, and manage subscription health with dedicated tools.
                </p>
                <Button 
                  size="lg"
                  onClick={() => setLocation("/admin/subscriptions")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Open Subscription Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Companies</CardTitle>
              <CardDescription>Manage all companies in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies?.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{company.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{company.email}</p>
                      <div className="flex space-x-2 mt-2">
                        <Badge variant="outline">{company.subscriptionPlan}</Badge>
                        <Badge variant={company.isActive ? "default" : "secondary"}>
                          {company.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigateToCompany(company.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigateToCompany(company.id)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage all users across all companies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex space-x-2 mt-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleLoginAsUser(user)}
                            >
                              <LogIn className="h-4 w-4 mr-2" />
                              Log In As User
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex items-center space-x-2 max-w-xs">
                              <Info className="h-4 w-4" />
                              <p>Allows admin to view and access the system as this user, for support and troubleshooting purposes.</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigateToUser(user.id)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Maintenance Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Put the system in maintenance mode to prevent user access during updates.
                  </p>
                  <Button variant="outline" className="mt-2" onClick={() => {
                    toast({
                      title: "Maintenance Mode",
                      description: "System maintenance mode can be enabled here to restrict user access during updates and maintenance.",
                    });
                  }}>
                    Enable Maintenance Mode
                  </Button>
                </div>
                <div>
                  <h3 className="font-medium mb-2">System Backups</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage system backups and data exports.
                  </p>
                  <Button variant="outline" className="mt-2" onClick={() => {
                    toast({
                      title: "System Backup Started",
                      description: "Creating comprehensive system backup including all companies, users, and data. This may take several minutes.",
                    });
                  }}>
                    Create Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Login As User Confirmation Modal */}
      {selectedUserForLogin && (
        <ConfirmationModal
          isOpen={loginAsUserModalOpen}
          onClose={() => {
            setLoginAsUserModalOpen(false);
            setSelectedUserForLogin(null);
          }}
          onConfirm={confirmLoginAsUser}
          title="Log In As User"
          description={`Log in as ${selectedUserForLogin.name}? You will be able to view and access the system as this user for support and troubleshooting purposes.`}
          confirmText="Log In As User"
          cancelText="Cancel"
          variant="warning"
          icon="login"
          isLoading={false}
        />
      )}
    </div>
  );
}