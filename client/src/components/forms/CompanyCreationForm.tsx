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

// Comprehensive South African Industry Options (33 major business sectors)
const industryOptions = [
  { value: "general", label: "General Business" },
  { value: "professional_services", label: "Professional Services (Accounting, Legal, Consulting)" },
  { value: "retail_wholesale", label: "Retail & Wholesale Trade" },
  { value: "manufacturing", label: "Manufacturing & Production" },
  { value: "construction", label: "Construction & Building" },
  { value: "technology", label: "Information Technology & Software" },
  { value: "healthcare", label: "Healthcare & Medical Services" },
  { value: "hospitality_tourism", label: "Hospitality & Tourism" },
  { value: "agriculture", label: "Agriculture & Farming" },
  { value: "mining", label: "Mining & Mineral Extraction" },
  { value: "automotive", label: "Automotive & Motor Trade" },
  { value: "financial_services", label: "Financial Services & Banking" },
  { value: "transport_logistics", label: "Transport & Logistics" },
  { value: "education", label: "Education & Training" },
  { value: "real_estate", label: "Real Estate & Property" },
  { value: "telecommunications", label: "Telecommunications" },
  { value: "energy_utilities", label: "Energy & Utilities" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "textile_clothing", label: "Textile & Clothing" },
  { value: "media_entertainment", label: "Media & Entertainment" },
  { value: "security_services", label: "Security Services" },
  { value: "cleaning_maintenance", label: "Cleaning & Maintenance" },
  { value: "beauty_wellness", label: "Beauty & Wellness" },
  { value: "sports_recreation", label: "Sports & Recreation" },
  { value: "funeral_services", label: "Funeral Services" },
  { value: "insurance", label: "Insurance Services" },
  { value: "import_export", label: "Import & Export" },
  { value: "packaging", label: "Packaging & Materials" },
  { value: "printing_publishing", label: "Printing & Publishing" },
  { value: "waste_management", label: "Waste Management & Recycling" },
  { value: "nonprofit", label: "Non-Profit Organization" },
  { value: "government", label: "Government & Public Sector" },
  { value: "cooperative", label: "Cooperative & Community Enterprise" },
  { value: "other", label: "Other (Please Specify)" }
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
    customIndustry: '', // For "Other" option
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
      customIndustry: '',
      subscriptionPlan: ''
    });
    setManuallyEdited({ displayName: false, slug: false });
    setSlugValidation({ isValid: true, message: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation with custom industry check
    if (!slugValidation.isValid || !formData.name || !formData.email || !formData.subscriptionPlan) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including subscription plan selection.",
        variant: "destructive",
      });
      return;
    }

    // Validate custom industry if "other" is selected
    if (formData.industry === 'other' && !formData.customIndustry.trim()) {
      toast({
        title: "Industry Required",
        description: "Please specify your industry when 'Other' is selected.",
        variant: "destructive",
      });
      return;
    }

    // Log submission data for verification
    console.log('Creating company with subscription plan:', formData.subscriptionPlan);
    
    const submissionData = {
      ...formData,
      // Use custom industry text if "other" is selected
      industry: formData.industry === 'other' ? formData.customIndustry.trim() : formData.industry,
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
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            Create New Company
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Set up your new company quickly with our streamlined process. All essential configurations, 
            chart of accounts, and industry-specific settings will be initialized automatically based on your selection.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="space-y-6">
            {/* Company Identity Section */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Company Identity</h3>
              
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Company Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your company name"
                  required 
                  className="mt-1.5 h-11"
                  data-testid="input-company-name"
                />
              </div>

              <div>
                <Label htmlFor="displayName" className="text-sm font-medium flex items-center gap-2">
                  Display Name *
                  {!manuallyEdited.displayName && formData.name && (
                    <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded-full">Auto-filled</span>
                  )}
                </Label>
                <Input 
                  id="displayName" 
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="How your company name will appear"
                  required 
                  className="mt-1.5 h-11"
                  data-testid="input-display-name"
                />
              </div>

              <div>
                <Label htmlFor="slug" className="text-sm font-medium flex items-center gap-2">
                  URL Slug *
                  {!manuallyEdited.slug && formData.name && (
                    <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900 px-2 py-1 rounded-full">Auto-generated</span>
                  )}
                </Label>
                <Input 
                  id="slug" 
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="company-url-slug"
                  required 
                  className="mt-1.5 h-11"
                  data-testid="input-url-slug"
                />
                {slugValidation.message && (
                  <p className={`text-xs mt-2 ${slugValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {slugValidation.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@mycompany.com"
                    required 
                    className="mt-1.5 h-11"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+27 123 456 7890"
                    className="mt-1.5 h-11"
                    data-testid="input-phone"
                  />
                </div>
              </div>
            </div>

            {/* Business Address Section */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Business Address</h3>
              
              <div>
                <Label htmlFor="address" className="text-sm font-medium">Street Address</Label>
                <Textarea 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Business Street, Suite 100"
                  className="mt-1.5 min-h-[90px] resize-none"
                  rows={3}
                  data-testid="input-address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium">City</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Cape Town"
                    className="mt-1.5 h-11"
                    data-testid="input-city"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="8001"
                    className="mt-1.5 h-11"
                    data-testid="input-postal-code"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                  <Select 
                    value={formData.country}
                    onValueChange={(value) => handleInputChange('country', value)}
                  >
                    <SelectTrigger className="mt-1.5 h-11" data-testid="select-country">
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
            </div>

            {/* Registration Details Section */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Registration Details</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="vatNumber" className="text-sm font-medium">VAT Number</Label>
                  <Input 
                    id="vatNumber" 
                    value={formData.vatNumber}
                    onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                    placeholder="4123456789"
                    className="mt-1.5 h-11"
                    data-testid="input-vat-number"
                  />
                  <p className="text-xs text-gray-500 mt-1">South African VAT registration number (optional)</p>
                </div>
                <div>
                  <Label htmlFor="registrationNumber" className="text-sm font-medium">Company Registration Number</Label>
                  <Input 
                    id="registrationNumber" 
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    placeholder="2023/123456/07"
                    className="mt-1.5 h-11"
                    data-testid="input-registration-number"
                  />
                  <p className="text-xs text-gray-500 mt-1">CIPC registration number (optional)</p>
                </div>
              </div>
            </div>

            {/* Industry Selection Section */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Business Industry</h3>
              
              <div>
                <Label htmlFor="industry" className="text-sm font-medium">Select your industry *</Label>
                <Select 
                  value={formData.industry}
                  onValueChange={(value) => {
                    handleInputChange('industry', value);
                    // Clear custom industry if not "other"
                    if (value !== 'other') {
                      handleInputChange('customIndustry', '');
                    }
                  }}
                >
                  <SelectTrigger className="mt-1.5 h-11" data-testid="select-industry">
                    <SelectValue placeholder="Choose your business industry" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {industryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">This will determine your initial chart of accounts setup</p>
              </div>

              {/* Custom Industry Input - Shows when "Other" is selected */}
              {formData.industry === 'other' && (
                <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                  <Label htmlFor="customIndustry" className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Please specify your industry *
                  </Label>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mb-3 mt-1">
                    Describe your business industry or sector in a few words
                  </p>
                  <Input 
                    id="customIndustry" 
                    value={formData.customIndustry}
                    onChange={(e) => handleInputChange('customIndustry', e.target.value)}
                    placeholder="e.g., Custom Software Development, Event Planning, etc."
                    required={formData.industry === 'other'}
                    className="bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-600 h-11"
                    data-testid="input-custom-industry"
                  />
                  {formData.industry === 'other' && !formData.customIndustry && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <span>⚠️</span> Please specify your industry
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Subscription Plan Selection */}
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                    Subscription Plan *
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Choose the plan that best fits your business needs and budget
                  </p>
                </div>
              </div>
              
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
                <SelectTrigger 
                  className={`bg-white dark:bg-gray-800 h-12 ${!formData.subscriptionPlan ? 'border-red-300' : 'border-blue-300'}`}
                  data-testid="select-subscription-plan"
                >
                  <SelectValue placeholder="Choose your subscription plan" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {plansLoading ? (
                    <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                  ) : subscriptionPlans && Array.isArray(subscriptionPlans) && subscriptionPlans.length > 0 ? (
                    subscriptionPlans.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.name} className="p-3">
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium">{plan.displayName}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            R{plan.monthlyPrice}/month • {plan.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-plans" disabled>No subscription plans available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              {!formData.subscriptionPlan && (
                <p className="text-xs text-red-600 mt-3 flex items-center gap-1">
                  <span>⚠️</span> Please select a subscription plan to continue
                </p>
              )}
              
              {formData.subscriptionPlan && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                    <span>✅</span> Selected: {(() => {
                      const plan = Array.isArray(subscriptionPlans) ? subscriptionPlans.find((p: any) => p.name === formData.subscriptionPlan) : null;
                      return plan ? `${plan.displayName}` : formData.subscriptionPlan;
                    })()}
                  </p>
                </div>
              )}
              
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 flex items-center gap-1">
                <span>💡</span> You can upgrade or downgrade your subscription plan anytime from company settings
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createCompanyMutation.isPending}
              className="px-6 py-2.5 h-11"
              data-testid="button-cancel"
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
                !formData.subscriptionPlan ||
                (formData.industry === 'other' && !formData.customIndustry.trim())
              }
              className="flex items-center gap-2 px-6 py-2.5 h-11 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-create-company"
            >
              {createCompanyMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Company...
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