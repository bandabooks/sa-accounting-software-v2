import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CheckCircle, ArrowRight, Building, User, Mail, Lock, CreditCard, Zap, Shield, Users } from 'lucide-react';
import MarketingLayout from '@/components/layout/marketing-layout';
import { trialSignupSchema, type TrialSignupRequest } from '@shared/schema';

type TrialSignupForm = TrialSignupRequest;

export default function TrialSignup() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');

  // Get pre-selected plan from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedPlan = urlParams.get('plan') || 'professional';

  const form = useForm<TrialSignupForm>({
    resolver: zodResolver(trialSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      companyName: '',
      companySize: '',
      industry: '',
      planId: preselectedPlan,
      agreeToTerms: false,
      subscribeToUpdates: true
    },
  });

  // Available plans for trial signup
  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 'R29.99',
      description: 'Perfect for small businesses getting started',
      features: [
        'Invoice Management',
        'Customer Database',
        'Basic Reports',
        'Email Support'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: 'R79.99',
      description: 'Advanced features for growing businesses',
      features: [
        'Everything in Basic',
        'Purchase Orders',
        'Inventory Management',
        'Financial Reports',
        'Multi-Currency',
        'Priority Support'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 'R199.99',
      description: 'Full-featured solution for large organizations',
      features: [
        'Everything in Professional',
        'Multi-Company',
        'Advanced Analytics',
        'API Access',
        'Custom Integrations',
        'Dedicated Support'
      ],
      popular: false
    }
  ];

  const companySizes = [
    { value: 'solo', label: 'Just me (1 person)' },
    { value: 'small', label: 'Small team (2-10 people)' },
    { value: 'medium', label: 'Growing business (11-50 people)' },
    { value: 'large', label: 'Large company (50+ people)' }
  ];

  const industries = [
    { value: 'accounting', label: 'Accounting & Bookkeeping' },
    { value: 'consulting', label: 'Consulting Services' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'restaurant', label: 'Food & Beverage' },
    { value: 'construction', label: 'Construction & Trades' },
    { value: 'healthcare', label: 'Healthcare & Medical' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'nonprofit', label: 'Non-profit Organization' },
    { value: 'other', label: 'Other' }
  ];

  const signupMutation = useMutation({
    mutationFn: async (data: TrialSignupForm) => {
      const response = await apiRequest('/api/auth/trial-signup', 'POST', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Store authentication data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('sessionToken', data.sessionToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Invalidate auth queries to trigger re-authentication
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Welcome to Taxnify!",
        description: `Your 14-day free trial has started. Welcome aboard, ${data.user.name}!`,
      });
      
      // Wait a moment for authentication state to update, then redirect
      setTimeout(() => {
        // Redirect to dashboard for trial users since they've provided company info during signup
        setLocation('/dashboard?trial=welcome');
      }, 500);
    },
    onError: (error: Error) => {
      console.error('Signup error:', error);
      
      const errorMessage = error.message || 'Signup failed. Please try again.';
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TrialSignupForm) => {
    signupMutation.mutate(data);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your 14-Day Free Trial
            </h1>
            <p className="text-xl text-gray-600">
              No credit card required • Full access to all features • Cancel anytime
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-0.5 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Plan Selection */}
              {step === 1 && (
                <Card className="shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Zap className="text-blue-600" size={24} />
                      Choose Your Plan
                    </CardTitle>
                    <CardDescription>
                      Select the plan that best fits your business needs. You can change this anytime during your trial.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                            form.watch('planId') === plan.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => form.setValue('planId', plan.id)}
                        >
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                Most Popular
                              </span>
                            </div>
                          )}
                          
                          <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                              {plan.price}
                              <span className="text-sm text-gray-500">/month</span>
                            </div>
                            <p className="text-gray-600 text-sm">{plan.description}</p>
                          </div>
                          
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          
                          {form.watch('planId') === plan.id && (
                            <div className="absolute top-4 right-4">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="text-white" size={16} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="planId"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end mt-6">
                      <Button onClick={nextStep} className="px-8">
                        Continue
                        <ArrowRight className="ml-2" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Personal & Company Information */}
              {step === 2 && (
                <Card className="shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <User className="text-blue-600" size={24} />
                      Tell Us About You
                    </CardTitle>
                    <CardDescription>
                      We'll use this information to set up your account and company profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                              <Input placeholder="john@company.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                              <Input type="password" placeholder="Minimum 8 characters" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Company Information */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building size={20} />
                        Company Information
                      </h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Company Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="companySize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Size *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {companySizes.map((size) => (
                                      <SelectItem key={size.value} value={size.value}>
                                        {size.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Industry *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {industries.map((industry) => (
                                      <SelectItem key={industry.value} value={industry.value}>
                                        {industry.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Back
                      </Button>
                      <Button onClick={nextStep} className="px-8">
                        Continue
                        <ArrowRight className="ml-2" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Terms and Start Trial */}
              {step === 3 && (
                <Card className="shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Shield className="text-blue-600" size={24} />
                      Start Your Free Trial
                    </CardTitle>
                    <CardDescription>
                      Review your selection and agree to our terms to start your 14-day free trial
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Trial Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trial Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Selected Plan:</span>
                          <span className="font-medium">{plans.find(p => p.id === form.watch('planId'))?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Price:</span>
                          <span className="font-medium">{plans.find(p => p.id === form.watch('planId'))?.price}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trial Period:</span>
                          <span className="font-medium text-green-600">14 days FREE</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Trial starts:</span>
                          <span>Today</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Trial ends:</span>
                          <span>{new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                I agree to the{' '}
                                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                                  Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                                  Privacy Policy
                                </a>{' '}
                                *
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subscribeToUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Send me product updates, tips, and special offers
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Trial Benefits */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Your free trial includes:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>Full access to all features</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>No credit card required</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>Setup assistance available</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 px-8"
                        disabled={signupMutation.isPending}
                      >
                        {signupMutation.isPending ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Starting Trial...
                          </>
                        ) : (
                          <>
                            Start My Free Trial
                            <ArrowRight className="ml-2" size={16} />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in here
            </a>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}