import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building, Plus, Users, Settings, Crown, Shield, User, UserPlus, Edit, CreditCard, ArrowUp } from "lucide-react";
import { type Company, type CompanyUser } from "@shared/schema";
import CompanyCreationForm from "@/components/forms/CompanyCreationForm";

export default function Companies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [selectedSubscriptionCompany, setSelectedSubscriptionCompany] = useState<Company | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<string>('monthly');

  // Check for create=true in URL and open dialog automatically
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('create') === 'true') {
      setIsCreateDialogOpen(true);
      // Clean up URL without causing page reload
      window.history.replaceState({}, '', '/companies');
    }
  }, []);

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Fetch user's companies
  const { data: userCompanies = [], isLoading } = useQuery<(CompanyUser & { company: Company })[]>({
    queryKey: ["/api/companies/my"],
  });

  // Fetch active company
  const { data: activeCompany } = useQuery<Company>({
    queryKey: ["/api/companies/active"],
  });

  // Fetch company users when a company is selected
  const { data: companyUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/companies", selectedCompany?.id, "users"],
    enabled: !!selectedCompany,
  });

  // Fetch subscription plans
  const { data: subscriptionPlans = [], isLoading: isLoadingPlans, error: plansError } = useQuery<any[]>({
    queryKey: ["/api/subscription-plans"],
  });

  // Debug logging for subscription plans (remove in production)
  console.log("Subscription plans data:", subscriptionPlans);
  console.log("Plans loading:", isLoadingPlans);
  console.log("Plans error:", plansError);

  // Set active company mutation
  const setActiveCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return await apiRequest(`/api/companies/switch`, "POST", { companyId });
    },
    onSuccess: (data) => {
      toast({
        title: "Company Switched",
        description: `Successfully switched to ${data?.company?.name || 'selected company'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to switch company.",
        variant: "destructive",
      });
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: { companyId: number; planId: number; billingPeriod: string }) => {
      return await apiRequest(`/api/companies/${data.companyId}/subscription`, "PATCH", {
        planId: data.planId,
        billingPeriod: data.billingPeriod,
      });
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Subscription plan updated successfully.",
      });
      // Invalidate all subscription-related queries for immediate UI refresh
      queryClient.invalidateQueries({ queryKey: ["/api/companies/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      // Force refresh any company-specific subscription status
      queryClient.invalidateQueries({ 
        queryKey: ["/api/company", "subscription"],
        exact: false 
      });
      setIsSubscriptionDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin": return <Shield className="h-4 w-4 text-blue-500" />;
      case "manager": return <UserPlus className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: "bg-yellow-100 text-yellow-800",
      admin: "bg-blue-100 text-blue-800", 
      manager: "bg-green-100 text-green-800",
      accountant: "bg-purple-100 text-purple-800",
      employee: "bg-gray-100 text-gray-800",
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || colors.employee}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600 mt-2">Manage your companies and switch between them</p>
        </div>
        
        <Button 
          className="touch-button"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Company
        </Button>
      </div>

      {/* Active Company */}
      {activeCompany && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Active Company: {activeCompany.displayName}
            </CardTitle>
            <CardDescription>
              All operations will be performed under this company
              {activeCompany.companyId && (
                <span className="block text-xs font-mono text-gray-600 mt-1">
                  Company ID: {activeCompany.companyId}
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Company List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Companies</h2>
          <div className="space-y-4">
            {userCompanies?.map((companyUser: CompanyUser & { company: Company }) => (
              <Card 
                key={companyUser.company.id} 
                className={`cursor-pointer transition-all hover:shadow-md mobile-tap-area ${
                  activeCompany?.id === companyUser.company.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCompany(companyUser.company)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{companyUser.company.displayName}</h3>
                        {getRoleIcon(companyUser.role)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{companyUser.company.email}</p>
                      {companyUser.company.companyId && (
                        <p className="text-xs text-gray-500 font-mono mb-2">
                          Company ID: {companyUser.company.companyId}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {getRoleBadge(companyUser.role)}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          companyUser.company.subscriptionStatus === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {companyUser.company.subscriptionPlan}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {activeCompany?.id !== companyUser.company.id && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setActiveCompanyMutation.mutate(companyUser.company.id);
                          }}
                          disabled={setActiveCompanyMutation.isPending}
                          data-testid={`switch-to-company-${companyUser.company.id}`}
                        >
                          {setActiveCompanyMutation.isPending ? "Switching..." : "Switch To"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSelectedCompany(companyUser.company);
                        }}
                        data-testid={`settings-company-${companyUser.company.id}`}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSelectedSubscriptionCompany(companyUser.company);
                          setIsSubscriptionDialogOpen(true);
                        }}
                        className="flex items-center gap-1"
                        data-testid={`plan-company-${companyUser.company.id}`}
                      >
                        <CreditCard className="h-3 w-3" />
                        Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Company Details */}
        {selectedCompany && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Company Details</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {selectedCompany.displayName}
                </CardTitle>
                <CardDescription>
                  Company information and team members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-gray-600">{selectedCompany.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Plan:</span>
                    <p className="text-gray-600">{selectedCompany.subscriptionPlan}</p>
                  </div>
                  {selectedCompany.companyId && (
                    <div className="col-span-2">
                      <span className="font-medium">Company ID:</span>
                      <p className="text-gray-600 font-mono">{selectedCompany.companyId}</p>
                    </div>
                  )}
                </div>

                {/* Team Members */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    Team Members
                  </h4>
                  <div className="space-y-2">
                    {companyUsers?.map((companyUser: any) => (
                      <div key={companyUser.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{companyUser.user.name}</span>
                          <span className="text-sm text-gray-500">({companyUser.user.email})</span>
                        </div>
                        {getRoleBadge(companyUser.role)}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Subscription Update Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Subscription Plan</DialogTitle>
            <DialogDescription>
              Change the subscription plan for this company. Current plan: {selectedSubscriptionCompany?.subscriptionPlan}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan">Select Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subscription plan" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans?.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.displayName} - R{plan.monthlyPrice}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="billingPeriod">Billing Period</Label>
              <Select value={selectedBillingPeriod} onValueChange={setSelectedBillingPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly (Save 10%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsSubscriptionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    console.log('Update plan clicked:', {
                      company: selectedSubscriptionCompany?.id,
                      planId: selectedPlanId,
                      billing: selectedBillingPeriod
                    });
                    
                    if (selectedPlanId && selectedSubscriptionCompany) {
                      updateSubscriptionMutation.mutate({
                        companyId: selectedSubscriptionCompany.id,
                        planId: parseInt(selectedPlanId),
                        billingPeriod: selectedBillingPeriod
                      });
                    } else {
                      toast({
                        title: "Error",
                        description: "Please select a subscription plan",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={updateSubscriptionMutation.isPending || !selectedPlanId}
                  className="flex items-center gap-2"
                >
                  <ArrowUp className="h-4 w-4" />
                  {updateSubscriptionMutation.isPending ? "Updating..." : "Update Plan"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Creation Form */}
      <CompanyCreationForm 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/companies/my"] });
          queryClient.invalidateQueries({ queryKey: ["/api/companies/active"] });
        }}
      />
    </div>
  );
}