import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, Check, Settings, BarChart, Users, ShoppingCart, Package, DollarSign, FileText, Calculator, Shield, Smartphone, Zap } from "lucide-react";
import { Link } from "wouter";

// Available modules organized by category
const AVAILABLE_MODULES = {
  core: [
    { id: 'dashboard', name: 'Dashboard', description: 'Business overview and analytics', icon: BarChart },
    { id: 'user_management', name: 'User Management', description: 'User accounts and permissions', icon: Users },
    { id: 'system_settings', name: 'System Settings', description: 'System configuration', icon: Settings }
  ],
  sales: [
    { id: 'customers', name: 'Customer Management', description: 'Customer relationships and contacts', icon: Users },
    { id: 'invoicing', name: 'Invoicing', description: 'Invoice creation and management', icon: FileText },
    { id: 'estimates', name: 'Estimates & Quotes', description: 'Quote and estimate management', icon: FileText },
    { id: 'sales_reports', name: 'Sales Reports', description: 'Sales analytics and reporting', icon: BarChart }
  ],
  purchasing: [
    { id: 'suppliers', name: 'Supplier Management', description: 'Supplier relationships and contacts', icon: Users },
    { id: 'purchases', name: 'Purchase Orders', description: 'Purchase order management', icon: ShoppingCart },
    { id: 'purchase_reports', name: 'Purchase Reports', description: 'Purchase analytics and reporting', icon: BarChart }
  ],
  inventory: [
    { id: 'products', name: 'Products & Services', description: 'Product and service catalog', icon: Package },
    { id: 'inventory', name: 'Inventory Management', description: 'Stock tracking and management', icon: Package },
    { id: 'inventory_reports', name: 'Inventory Reports', description: 'Inventory analytics and reporting', icon: BarChart }
  ],
  accounting: [
    { id: 'accounting', name: 'General Accounting', description: 'Complete accounting features', icon: Calculator },
    { id: 'banking', name: 'Banking', description: 'Bank account management', icon: DollarSign },
    { id: 'chart_of_accounts', name: 'Chart of Accounts', description: 'Account structure management', icon: Calculator },
    { id: 'journal_entries', name: 'Journal Entries', description: 'Manual journal entry recording', icon: Calculator },
    { id: 'financial_reports', name: 'Financial Reports', description: 'Comprehensive financial reporting', icon: BarChart }
  ],
  compliance: [
    { id: 'vat', name: 'VAT Management', description: 'South African VAT compliance', icon: Shield },
    { id: 'compliance', name: 'Compliance Management', description: 'Regulatory compliance tools', icon: Shield },
    { id: 'audit_trails', name: 'Audit Trails', description: 'Complete audit logging', icon: Shield }
  ],
  advanced: [
    { id: 'pos', name: 'Point of Sale', description: 'POS system for retail', icon: Smartphone },
    { id: 'projects', name: 'Project Management', description: 'Project tracking and billing', icon: Settings },
    { id: 'payroll', name: 'Payroll Management', description: 'Employee payroll processing', icon: Users },
    { id: 'advanced_reports', name: 'Advanced Reports', description: 'Business intelligence and analytics', icon: BarChart },
    { id: 'api_access', name: 'API Access', description: 'Third-party integrations', icon: Zap },
    { id: 'workflow_automation', name: 'Workflow Automation', description: 'Automated business processes', icon: Zap }
  ]
};

export default function SuperAdminPlanEdit() {
  const [, params] = useRoute("/super-admin/plans/:id");
  const planId = params?.id;
  const { toast } = useToast();
  const successModal = useSuccessModal();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  // Fetch plan details
  const { data: plan, isLoading } = useQuery({
    queryKey: ["/api/super-admin/subscription-plans", planId],
    enabled: !!planId,
  });

  // Initialize selected modules when plan data loads
  useEffect(() => {
    if (plan && (plan as any).features) {
      const moduleList = Array.isArray((plan as any).features) ? (plan as any).features : [];
      setSelectedModules(moduleList);
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
      const limitsText = formData.get("limits") as string;
      let limits = {};
      
      if (limitsText) {
        try {
          limits = JSON.parse(limitsText);
        } catch (error) {
          toast({
            title: "Error",
            description: "Invalid JSON format in limits field",
            variant: "destructive",
          });
          return;
        }
      }

      const data = {
        name: formData.get("name"),
        displayName: formData.get("displayName"),
        description: formData.get("description"),
        monthlyPrice: parseFloat(formData.get("monthlyPrice") as string),
        annualPrice: parseFloat(formData.get("annualPrice") as string),
        features: selectedModules, // Use visual selection instead of JSON
        limits,
        sortOrder: parseInt(formData.get("sortOrder") as string),
        isActive: formData.get("isActive") === "on",
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

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectAllInCategory = (categoryModules: any[]) => {
    const categoryIds = categoryModules.map(m => m.id);
    const allSelected = categoryIds.every(id => selectedModules.includes(id));
    
    if (allSelected) {
      // Remove all from category
      setSelectedModules(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      // Add all from category
      setSelectedModules(prev => Array.from(new Set([...prev, ...categoryIds])));
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
          <h1 className="text-3xl font-bold">Edit {(plan as any).displayName}</h1>
          <p className="text-muted-foreground">Modify subscription plan details and included modules</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Plan Details</TabsTrigger>
          <TabsTrigger value="modules">Module Selection</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription Plan Details</span>
              </CardTitle>
              <CardDescription>Update the subscription plan information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await handleUpdatePlan(formData);
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Plan Name (Internal)</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="e.g., basic" 
                      defaultValue={(plan as any).name}
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
                      defaultValue={(plan as any).displayName}
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
                    defaultValue={(plan as any).description}
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
                      defaultValue={(plan as any).monthlyPrice}
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
                      defaultValue={(plan as any).annualPrice}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input 
                      id="sortOrder" 
                      name="sortOrder" 
                      type="number"
                      defaultValue={(plan as any).sortOrder}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="limits">Usage Limits (JSON Object)</Label>
                  <Textarea 
                    id="limits" 
                    name="limits" 
                    placeholder='{"users": 5, "invoices": 100, "storage": "1GB"}'
                    defaultValue={JSON.stringify((plan as any).limits, null, 2)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JSON object with limit keys and values (optional)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isActive" 
                    name="isActive"
                    defaultChecked={(plan as any).isActive}
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
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Module Selection</span>
              </CardTitle>
              <CardDescription>
                Choose which modules are included in this subscription plan. Selected modules will be available to all companies using this plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Module Selection Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900">Selected Modules</h3>
                    <p className="text-sm text-blue-700">{selectedModules.length} modules included in this plan</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {selectedModules.length} Selected
                  </Badge>
                </div>
              </div>

              {/* Module Categories */}
              <div className="space-y-8">
                {Object.entries(AVAILABLE_MODULES).map(([categoryKey, categoryModules]) => {
                  const categoryName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
                  const selectedInCategory = categoryModules.filter(m => selectedModules.includes(m.id)).length;
                  const allSelected = selectedInCategory === categoryModules.length;

                  return (
                    <div key={categoryKey} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{categoryName} Modules</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedInCategory} of {categoryModules.length} modules selected
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllInCategory(categoryModules)}
                        >
                          {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryModules.map((module) => {
                          const isSelected = selectedModules.includes(module.id);
                          const IconComponent = module.icon;

                          return (
                            <div
                              key={module.id}
                              className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                              onClick={() => toggleModule(module.id)}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                                    <Check className="h-3 w-3" />
                                  </div>
                                </div>
                              )}

                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  isSelected ? "bg-primary/10" : "bg-gray-100"
                                }`}>
                                  <IconComponent className={`h-5 w-5 ${
                                    isSelected ? "text-primary" : "text-gray-600"
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{module.name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {module.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  onClick={() => {
                    // Create a mock form data to trigger save
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) {
                      const formData = new FormData(form);
                      handleUpdatePlan(formData);
                    }
                  }}
                  disabled={updatePlanMutation.isPending}
                >
                  {updatePlanMutation.isPending ? "Saving Modules..." : "Save Module Selection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
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