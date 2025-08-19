import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Plus } from "lucide-react";
import { insertCompanySchema } from "@shared/schema";
import { z } from "zod";

interface CompanyCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Industry options
const industryOptions = [
  { value: "general", label: "General Business" },
  { value: "professional_services", label: "Professional Services" },
  { value: "retail_wholesale", label: "Retail & Wholesale" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "construction", label: "Construction" },
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality_tourism", label: "Hospitality & Tourism" },
  { value: "nonprofit", label: "Non-Profit Organization" },
  { value: "other", label: "Other" }
];

export default function CompanyCreationForm({ isOpen, onClose, onSuccess }: CompanyCreationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa',
    vatNumber: '',
    registrationNumber: '',
    industry: 'general',
    subscriptionPlan: ''
  });

  const [manuallyEdited, setManuallyEdited] = useState({
    displayName: false,
    slug: false,
  });

  const [slugValidation, setSlugValidation] = useState({ isValid: true, message: '' });

  // Fetch subscription plans
  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/subscription-plans"],
  });



  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertCompanySchema>) => {
      return await apiRequest("/api/companies", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Company Created",
        description: "Your company has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/my"] });
      resetForm();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-fill displayName and slug based on name if not manually edited
    if (field === 'name' && value) {
      if (!manuallyEdited.displayName) {
        setFormData(prev => ({ ...prev, displayName: value }));
      }
      if (!manuallyEdited.slug) {
        const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        setFormData(prev => ({ ...prev, slug: generatedSlug }));
        validateSlug(generatedSlug);
      }
    }

    // Track manual edits
    if (field === 'displayName') {
      setManuallyEdited(prev => ({ ...prev, displayName: true }));
    }
    if (field === 'slug') {
      setManuallyEdited(prev => ({ ...prev, slug: true }));
      validateSlug(value);
    }
  };

  const validateSlug = (slug: string) => {
    if (!slug) {
      setSlugValidation({ isValid: false, message: 'URL slug is required' });
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugValidation({ isValid: false, message: 'URL slug can only contain lowercase letters, numbers, and hyphens' });
      return;
    }
    if (slug.length < 3) {
      setSlugValidation({ isValid: false, message: 'URL slug must be at least 3 characters' });
      return;
    }
    setSlugValidation({ isValid: true, message: 'URL slug is available' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      slug: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'South Africa',
      vatNumber: '',
      registrationNumber: '',
      industry: 'general',
      subscriptionPlan: ''
    });
    setManuallyEdited({ displayName: false, slug: false });
    setSlugValidation({ isValid: true, message: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation with subscription plan requirement
    if (!slugValidation.isValid || !formData.name || !formData.email || !formData.subscriptionPlan) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including subscription plan selection.",
        variant: "destructive",
      });
      return;
    }

    // Log submission data for verification
    console.log('Creating company with subscription plan:', formData.subscriptionPlan);
    
    const submissionData = {
      ...formData,
      subscriptionPlan: formData.subscriptionPlan as any, // Handle dynamic plan names from API
      subscriptionStatus: 'active' as const,
    };

    console.log('Final submission data:', submissionData);
    createCompanyMutation.mutate(submissionData);
  };

  const handleClose = () => {
    if (!createCompanyMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Create New Company
          </DialogTitle>
          <DialogDescription>
            Set up your new company quickly. All essential configurations will be initialized automatically.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="My Business"
                required 
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="displayName" className="flex items-center gap-2">
                Display Name *
                {!manuallyEdited.displayName && formData.name && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Auto-filled</span>
                )}
              </Label>
              <Input 
                id="displayName" 
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="My Business"
                required 
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="flex items-center gap-2">
                URL Slug *
                {!manuallyEdited.slug && formData.name && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Auto-generated</span>
                )}
              </Label>
              <Input 
                id="slug" 
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="my-company"
                required 
                className="w-full"
              />
              {slugValidation.message && (
                <p className={`text-xs mt-1 ${slugValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {slugValidation.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@mycompany.com"
                  required 
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+27 123 456 7890"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Business Street"
                className="w-full"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Cape Town"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input 
                  id="postalCode" 
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="8001"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select 
                  value={formData.country}
                  onValueChange={(value) => handleInputChange('country', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="South Africa">South Africa</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vatNumber">VAT Number</Label>
                <Input 
                  id="vatNumber" 
                  value={formData.vatNumber}
                  onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                  placeholder="4123456789"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input 
                  id="registrationNumber" 
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  placeholder="2023/123456/07"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={formData.industry}
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subscription Plan Selection - Enhanced with validation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Label htmlFor="subscriptionPlan" className="text-base font-medium text-blue-900">
                Select Subscription Plan *
              </Label>
              <p className="text-sm text-blue-700 mb-3">
                Choose the plan that best fits your business needs. This will determine your feature access and billing.
              </p>
              
              <Select 
                value={formData.subscriptionPlan}
                onValueChange={(value) => {
                  handleInputChange('subscriptionPlan', value);
                  // Log selection for verification
                  console.log('Subscription plan selected:', value);
                  const selectedPlan = Array.isArray(subscriptionPlans) ? subscriptionPlans.find((plan: any) => plan.name === value) : null;
                  if (selectedPlan) {
                    console.log('Plan details:', selectedPlan);
                  }
                }}
              >
                <SelectTrigger className={`bg-white ${!formData.subscriptionPlan ? 'border-red-300' : 'border-blue-300'}`}>
                  <SelectValue placeholder="Choose your subscription plan" />
                </SelectTrigger>
                <SelectContent>
                  {plansLoading ? (
                    <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                  ) : subscriptionPlans && Array.isArray(subscriptionPlans) && subscriptionPlans.length > 0 ? (
                    subscriptionPlans.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.name}>
                        <div className="flex flex-col">
                          <span className="font-medium">{plan.displayName}</span>
                          <span className="text-sm text-gray-600">R{plan.monthlyPrice}/month • {plan.description}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-plans" disabled>No subscription plans available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              {!formData.subscriptionPlan && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span>⚠️</span> Please select a subscription plan to continue
                </p>
              )}
              
              {formData.subscriptionPlan && (
                <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                  <span>✅</span> Selected: {(() => {
                    const plan = Array.isArray(subscriptionPlans) ? subscriptionPlans.find((p: any) => p.name === formData.subscriptionPlan) : null;
                    return plan ? `${plan.displayName} (${formData.subscriptionPlan})` : formData.subscriptionPlan;
                  })()}
                </p>
              )}
              
              <p className="text-xs text-blue-600 mt-2">
                💡 You can upgrade or downgrade your subscription plan anytime from company settings
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createCompanyMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                createCompanyMutation.isPending || 
                !slugValidation.isValid || 
                !formData.name || 
                !formData.email || 
                !formData.subscriptionPlan
              }
              className="flex items-center gap-2"
            >
              {createCompanyMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Company
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}