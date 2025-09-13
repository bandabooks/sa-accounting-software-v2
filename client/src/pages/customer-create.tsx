import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { customersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useGlobalNotification } from "@/contexts/NotificationContext";
import { useCompany } from "@/contexts/CompanyContext";
import { User, Mail, Phone, MapPin, Building2, Hash, ArrowLeft, Save, UserPlus, MapPinIcon } from "lucide-react";
import type { InsertCustomer } from "@shared/schema";

export default function CustomerCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { showSuccess } = useGlobalNotification();
  const { companyId } = useCompany();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InsertCustomer>({
    companyId: companyId || 0,
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    vatNumber: ""
  });

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: async (customer) => {
      // Wait for cache invalidation to complete before navigating
      await queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      
      showSuccess(
        "Customer Created Successfully",
        `${customer.name} has been added to your customer database.`
      );
      setLocation("/customers");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const updateField = (field: keyof InsertCustomer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/customers")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Card */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-blue-500 text-white">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add New Customer
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Create a new customer profile for your business
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
              <User className="h-5 w-5 text-blue-500" />
              <span>Contact Information</span>
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Basic contact details for your customer
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Customer Name *</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter customer's full name"
                  required
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="customer@company.com"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>Phone Number</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+27 11 123 4567"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span>VAT Number</span>
                </Label>
                <Input
                  id="vatNumber"
                  value={formData.vatNumber || ""}
                  onChange={(e) => updateField('vatNumber', e.target.value)}
                  placeholder="4123456789"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
                  data-testid="input-vat"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For VAT-registered customers in South Africa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-green-500" />
              <span>Address Information</span>
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Physical address for invoicing and correspondence
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>Street Address</span>
              </Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123 Main Street, Business Park"
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
                data-testid="input-address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                  <span>City</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Johannesburg"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
                  data-testid="input-city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span>Postal Code</span>
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode || ""}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="2196"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
                  data-testid="input-postal"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                * Required fields must be completed
              </div>
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/customers")}
                  className="min-w-[120px] h-11 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  data-testid="button-cancel"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="min-w-[140px] h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Customer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
