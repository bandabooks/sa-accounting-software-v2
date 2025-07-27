import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, Settings2 } from "lucide-react";
import { Link } from "wouter";
import ModulePermissionSelector from "@/components/subscription/ModulePermissionSelector";
import LimitConfigurationPanel from "@/components/subscription/LimitConfigurationPanel";

export default function SuperAdminPlanEdit() {
  const [, params] = useRoute("/super-admin/plans/:id");
  const planId = params?.id;
  const { toast } = useToast();
  const successModal = useSuccessModal();
  
  // Enhanced state management for modern UI
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedLimits, setSelectedLimits] = useState<Record<string, any>>({});
  const [currentTab, setCurrentTab] = useState("basic");

  // Fetch plan details
  const { data: plan, isLoading } = useQuery({
    queryKey: ["/api/super-admin/subscription-plans", planId],
    enabled: !!planId,
  });

  // Initialize features and limits from plan data
  useEffect(() => {
    if (plan) {
      // Handle both old array format and new object format
      if (Array.isArray(plan.features)) {
        setSelectedFeatures(plan.features);
      } else if (plan.features?.included_modules) {
        setSelectedFeatures(plan.features.included_modules);
      } else {
        setSelectedFeatures([]);
      }
      setSelectedLimits(typeof plan.limits === 'object' ? plan.limits : {});
    }
  }, [plan]);

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/super-admin/subscription-plans/${planId}`, "PUT", data);
    },
    onSuccess: () => {
      successModal.showSuccess({
        title: "Plan Updated Successfully",
        description: "The subscription plan has been updated and changes are now active.",
        confirmText: "Continue"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/subscription-plans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription plan",
        variant: "destructive",
      });
    },
  });

  const handleUpdatePlan = async (formData: FormData) => {
    try {
      // Validate that at least one module is selected
      if (selectedFeatures.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please select at least one module for this subscription plan",
          variant: "destructive",
        });
        return;
      }

      const data = {
        name: formData.get("name") || plan.name,
        displayName: formData.get("displayName") || plan.displayName,
        description: formData.get("description") || plan.description,
        monthlyPrice: formData.get("monthlyPrice") ? parseFloat(formData.get("monthlyPrice") as string) : parseFloat(plan.monthlyPrice),
        annualPrice: formData.get("annualPrice") ? parseFloat(formData.get("annualPrice") as string) : parseFloat(plan.annualPrice),
        features: {
          included_modules: selectedFeatures,
          core_features: Array.isArray(plan.features) ? plan.features : (plan.features?.core_features || [])
        },
        limits: selectedLimits,
        sortOrder: formData.get("sortOrder") ? parseInt(formData.get("sortOrder") as string) : plan.sortOrder,
        isActive: formData.get("isActive") !== null ? formData.get("isActive") === "on" : plan.isActive,
      };
      
      updatePlanMutation.mutate(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Subscription Plan Not Found</h1>
          <Link href="/super-admin">
            <Button>Back to Super Admin</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/super-admin">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit {plan.displayName}</h1>
          <p className="text-muted-foreground">Modify subscription plan details</p>
        </div>
      </div>

      {/* Enhanced Subscription Plan Management Interface */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Basic Details</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center space-x-2">
            <Settings2 className="h-4 w-4" />
            <span>Modules & Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Settings2 className="h-4 w-4" />
            <span>Limits & Features</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          await handleUpdatePlan(formData);
        }}>
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Information</CardTitle>
                <CardDescription>Basic subscription plan details and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Plan Name (Internal)</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="e.g., professional" 
                      defaultValue={plan.name}
                      required 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used internally, no spaces or special characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      name="displayName" 
                      placeholder="e.g., Professional Plan" 
                      defaultValue={plan.displayName}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Plan description for customers"
                    defaultValue={plan.description}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="monthlyPrice">Monthly Price (R)</Label>
                    <Input 
                      id="monthlyPrice" 
                      name="monthlyPrice" 
                      type="number" 
                      step="0.01"
                      placeholder="79.99" 
                      defaultValue={plan.monthlyPrice}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="annualPrice">Annual Price (R)</Label>
                    <Input 
                      id="annualPrice" 
                      name="annualPrice" 
                      type="number" 
                      step="0.01"
                      placeholder="799.99" 
                      defaultValue={plan.annualPrice}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input 
                      id="sortOrder" 
                      name="sortOrder" 
                      type="number" 
                      placeholder="2" 
                      defaultValue={plan.sortOrder}
                      required 
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isActive" 
                    name="isActive"
                    defaultChecked={plan.isActive}
                  />
                  <Label htmlFor="isActive">Plan is active and available for subscription</Label>
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
              planName={plan.displayName}
            />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <LimitConfigurationPanel
              selectedLimits={selectedLimits}
              onLimitsChange={setSelectedLimits}
              planName={plan.displayName}
            />
          </TabsContent>

          <div className="flex justify-between items-center pt-6 border-t">
            <Link href="/super-admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Super Admin
              </Button>
            </Link>
            <div className="flex space-x-4">
              <Button type="submit" disabled={updatePlanMutation.isPending}>
                {updatePlanMutation.isPending ? "Saving Changes..." : "Save Subscription Plan"}
              </Button>
            </div>
          </div>
        </form>
      </Tabs>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={successModal.hideSuccess}
        title={successModal.modalOptions.title}
        description={successModal.modalOptions.description}
        confirmText={successModal.modalOptions.confirmText}
      />
    </div>
  );
}