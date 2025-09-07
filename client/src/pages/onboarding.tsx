import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Briefcase,
  FileText,
  DollarSign,
  Calendar,
  Globe
} from "lucide-react";

// Onboarding form schema
const onboardingSchema = z.object({
  // Company Information
  name: z.string().min(1, "Company name is required"),
  displayName: z.string().min(1, "Display name is required"),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and dashes allowed"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  vatNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  
  // Business Configuration
  industry: z.string().min(1, "Industry selection is required"),
  
  // VAT Settings
  isVatRegistered: z.boolean().default(false),
  vatPeriodMonths: z.number().default(2),
  vatSubmissionDay: z.number().default(25),
  
  // Subscription
  subscriptionPlan: z.string().min(1, "Subscription plan is required"),
  billingPeriod: z.enum(["monthly", "yearly"]).default("monthly")
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const industries = [
  { value: "general", label: "General Business", description: "Standard business accounts" },
  { value: "retail", label: "Retail & E-commerce", description: "Inventory management focused" },
  { value: "services", label: "Professional Services", description: "Service-based business accounts" },
  { value: "manufacturing", label: "Manufacturing", description: "Production and manufacturing accounts" },
  { value: "construction", label: "Construction", description: "Project-based construction accounts" },
  { value: "technology", label: "Technology & Software", description: "Tech company focused accounts" },
  { value: "healthcare", label: "Healthcare", description: "Healthcare specific accounts" },
  { value: "hospitality", label: "Hospitality & Tourism", description: "Hotel and tourism accounts" },
  { value: "transport", label: "Transport & Logistics", description: "Transportation business accounts" },
  { value: "agriculture", label: "Agriculture", description: "Agricultural business accounts" },
  { value: "nonprofit", label: "Non-Profit Organization", description: "Non-profit focused accounts" },
  { value: "education", label: "Education", description: "Educational institution accounts" }
];

const subscriptionPlans = [
  {
    id: "basic",
    name: "Basic Plan",
    monthlyPrice: "299.99",
    yearlyPrice: "3329.89",
    description: "Perfect for small businesses getting started",
    features: ["Customer Management", "Basic Invoicing", "Expense Tracking", "Financial Reports", "VAT Management", "Chart of Accounts"]
  },
  {
    id: "professional",
    name: "Professional Plan", 
    monthlyPrice: "679.99",
    yearlyPrice: "7519.89",
    description: "Advanced features for growing businesses",
    features: ["Everything in Basic", "Advanced Invoicing", "Inventory Management", "VAT Management", "Advanced Analytics", "Practice Management"],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    monthlyPrice: "1199.99", 
    yearlyPrice: "13299.89",
    description: "Full-featured solution for large organizations",
    features: ["Everything in Professional", "Multi-Company", "Payroll Management", "Point of Sale", "API Access", "Dedicated Support"]
  }
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [industryPreview, setIndustryPreview] = useState<any>(null);
  
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Check if user needs onboarding
  const { data: onboardingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/onboarding/status"],
    retry: false
  });

  // Get industry template preview
  const { data: industryTemplate } = useQuery({
    queryKey: ["/api/onboarding/industry-templates", selectedIndustry],
    enabled: !!selectedIndustry,
    retry: false
  });

  useEffect(() => {
    if (industryTemplate) {
      setIndustryPreview(industryTemplate);
    }
  }, [industryTemplate]);

  // Form setup
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      displayName: "",
      slug: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      vatNumber: "",
      registrationNumber: "",
      industry: "",
      isVatRegistered: false,
      vatPeriodMonths: 2,
      vatSubmissionDay: 25,
      subscriptionPlan: "professional",
      billingPeriod: "monthly"
    }
  });

  // Auto-fill display name and slug based on company name
  const watchName = form.watch("name");
  useEffect(() => {
    if (watchName && !form.getFieldState("displayName").isDirty) {
      form.setValue("displayName", watchName);
    }
    if (watchName && !form.getFieldState("slug").isDirty) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchName, form]);

  // Onboarding submission
  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      return apiRequest("/api/onboarding/setup", "POST", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Company Setup Complete!",
        description: "Welcome to Think MyBiz Accounting. Your company has been successfully configured.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete company setup. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Redirect if onboarding not needed
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.needsOnboarding) {
      setLocation("/dashboard");
    }
  }, [onboardingStatus, setLocation]);

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: OnboardingFormData) => {
    onboardingMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome to Think MyBiz Accounting
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Let's set up your company for professional accounting management
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
            
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about your business to configure your accounting system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company Ltd" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company" {...field} />
                          </FormControl>
                          <FormDescription>How your company name appears in the system</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Slug *</FormLabel>
                          <FormControl>
                            <Input placeholder="your-company" {...field} />
                          </FormControl>
                          <FormDescription>Used for web addresses (lowercase, no spaces)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@yourcompany.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+27 11 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Company registration number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Business Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Cape Town" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="8001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Business Configuration */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Business Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your business type and accounting structure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Type *</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedIndustry(value);
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry.value} value={industry.value}>
                                <div>
                                  <div className="font-medium">{industry.label}</div>
                                  <div className="text-sm text-gray-500">{industry.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This determines your default chart of accounts and product categories
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Industry Preview */}
                  {industryPreview && (
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <CardHeader>
                        <CardTitle className="text-lg">Your Industry Setup Preview</CardTitle>
                        <CardDescription>
                          Based on your industry selection, we'll create these accounts and categories for you
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Chart of Accounts ({industryPreview.accountsCount} accounts)
                            </h4>
                            <div className="space-y-2">
                              {industryPreview.chartOfAccounts.slice(0, 5).map((account: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{account.code} - {account.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {account.type}
                                  </Badge>
                                </div>
                              ))}
                              {industryPreview.accountsCount > 5 && (
                                <div className="text-sm text-gray-500">
                                  +{industryPreview.accountsCount - 5} more accounts...
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Product Categories ({industryPreview.categoriesCount} categories)
                            </h4>
                            <div className="space-y-2">
                              {industryPreview.productCategories.map((category: string, index: number) => (
                                <div key={index} className="text-sm">
                                  • {category}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: VAT Configuration */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    VAT Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your South African VAT settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="isVatRegistered"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            My company is VAT registered with SARS
                          </FormLabel>
                          <FormDescription>
                            Check this if your company is registered for VAT with the South African Revenue Service
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("isVatRegistered") && (
                    <>
                      <FormField
                        control={form.control}
                        name="vatNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Number</FormLabel>
                            <FormControl>
                              <Input placeholder="4123456789" {...field} />
                            </FormControl>
                            <FormDescription>Your 10-digit VAT registration number</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="vatPeriodMonths"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>VAT Period (Months)</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">Monthly (1 month)</SelectItem>
                                  <SelectItem value="2">Bi-monthly (2 months)</SelectItem>
                                  <SelectItem value="3">Quarterly (3 months)</SelectItem>
                                  <SelectItem value="6">Bi-annually (6 months)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vatSubmissionDay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>VAT Submission Day</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="7">7th of the month</SelectItem>
                                  <SelectItem value="25">25th of the month</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>When VAT returns are due</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {!form.watch("isVatRegistered") && (
                    <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                          <div className="text-yellow-600 dark:text-yellow-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">No VAT Registration</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                              Your company will be set up as non-VAT registered. VAT fields will be hidden throughout the system. 
                              You can enable VAT registration later in Settings if needed.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Subscription Plan */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Choose Your Plan
                  </CardTitle>
                  <CardDescription>
                    Select the subscription plan that fits your business needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="billingPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Period</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="max-w-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly (Save 17%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan) => (
                      <Card 
                        key={plan.id}
                        className={`cursor-pointer transition-all ${
                          form.watch("subscriptionPlan") === plan.id 
                            ? "ring-2 ring-primary border-primary" 
                            : "hover:border-gray-300"
                        } ${plan.popular ? "border-primary" : ""}`}
                        onClick={() => form.setValue("subscriptionPlan", plan.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            {plan.popular && (
                              <Badge variant="default">Popular</Badge>
                            )}
                          </div>
                          <div className="text-3xl font-bold">
                            R{form.watch("billingPeriod") === "yearly" ? plan.yearlyPrice : plan.monthlyPrice}
                            <span className="text-lg font-normal text-gray-500">
                              /{form.watch("billingPeriod") === "yearly" ? "year" : "month"}
                            </span>
                          </div>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={onboardingMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {onboardingMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}