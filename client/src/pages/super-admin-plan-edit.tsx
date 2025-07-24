import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function SuperAdminPlanEdit() {
  const [, params] = useRoute("/super-admin/plans/:id");
  const planId = params?.id;
  const { toast } = useToast();

  // Fetch plan details
  const { data: plan, isLoading } = useQuery({
    queryKey: ["/api/super-admin/subscription-plans", planId],
    enabled: !!planId,
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/super-admin/subscription-plans/${planId}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
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
      const featuresText = formData.get("features") as string;
      const limitsText = formData.get("limits") as string;
      
      let features = [];
      let limits = {};
      
      if (featuresText) {
        features = JSON.parse(featuresText);
      }
      
      if (limitsText) {
        limits = JSON.parse(limitsText);
      }

      const data = {
        name: formData.get("name"),
        displayName: formData.get("displayName"),
        description: formData.get("description"),
        monthlyPrice: parseFloat(formData.get("monthlyPrice") as string),
        annualPrice: parseFloat(formData.get("annualPrice") as string),
        features,
        limits,
        sortOrder: parseInt(formData.get("sortOrder") as string),
        isActive: formData.get("isActive") === "on",
      };
      
      updatePlanMutation.mutate(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format in features or limits",
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Subscription Plan Details</span>
          </CardTitle>
          <CardDescription>Update the subscription plan information</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdatePlan} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Plan Name (Internal)</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g., basic" 
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
                  placeholder="e.g., Basic Plan" 
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
                placeholder="Plan description..."
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
                  defaultValue={plan.sortOrder}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="features">Features (JSON Array)</Label>
              <Textarea 
                id="features" 
                name="features" 
                placeholder='["Feature 1", "Feature 2", "Feature 3"]'
                defaultValue={JSON.stringify(plan.features, null, 2)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                JSON array of feature strings
              </p>
            </div>

            <div>
              <Label htmlFor="limits">Limits (JSON Object)</Label>
              <Textarea 
                id="limits" 
                name="limits" 
                placeholder='{"users": 5, "invoices": 100, "storage": "1GB"}'
                defaultValue={JSON.stringify(plan.limits, null, 2)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                JSON object with limit keys and values
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                name="isActive"
                defaultChecked={plan.isActive}
              />
              <Label htmlFor="isActive">Plan is active and available for subscription</Label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={updatePlanMutation.isPending}>
                {updatePlanMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Link href="/super-admin">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}