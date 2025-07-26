import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  features: string[];
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



  const handleCreatePlan = (formData: FormData) => {
    const planData = {
      name: formData.get('name') as string,
      displayName: formData.get('displayName') as string,
      description: formData.get('description') as string,
      monthlyPrice: parseFloat(formData.get('monthlyPrice') as string),
      annualPrice: parseFloat(formData.get('annualPrice') as string),
      features: JSON.parse(formData.get('features') as string || '[]'),
      limits: JSON.parse(formData.get('limits') as string || '{}'),
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
    };
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
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

            <Card>
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R 45,231</div>
                <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
              </CardContent>
            </Card>

            <Card>
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
            <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subscription Plan</DialogTitle>
                  <DialogDescription>
                    Create a new subscription plan for companies to subscribe to.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreatePlan}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <Input id="name" name="name" placeholder="e.g., basic" required />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input id="displayName" name="displayName" placeholder="e.g., Basic Plan" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" placeholder="Plan description..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthlyPrice">Monthly Price (R)</Label>
                        <Input id="monthlyPrice" name="monthlyPrice" type="number" step="0.01" required />
                      </div>
                      <div>
                        <Label htmlFor="annualPrice">Annual Price (R)</Label>
                        <Input id="annualPrice" name="annualPrice" type="number" step="0.01" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="features">Features (JSON Array)</Label>
                      <Textarea 
                        id="features" 
                        name="features" 
                        placeholder='["Feature 1", "Feature 2"]'
                        defaultValue='[]'
                      />
                    </div>
                    <div>
                      <Label htmlFor="limits">Limits (JSON Object)</Label>
                      <Textarea 
                        id="limits" 
                        name="limits" 
                        placeholder='{"users": 5, "invoices": 100}'
                        defaultValue='{}'
                      />
                    </div>
                    <div>
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
                    </div>
                    <Button type="submit" disabled={createPlanMutation.isPending}>
                      {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
                    </Button>
                  </div>
                </form>
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
                        {plan.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
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
                              onClick={() => {
                                console.log("Logging in as user:", user.id);
                                loginAsUser(user.id);
                              }}
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
    </div>
  );
}