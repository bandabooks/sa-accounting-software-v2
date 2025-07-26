import { useQuery } from "@tanstack/react-query";

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

interface CompanySubscription {
  id: number;
  companyId: number;
  planId: number;
  status: string;
  billingPeriod: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  amount: string;
  paymentMethod: string | null;
  lastPaymentDate: string | null;
  nextBillingDate: string | null;
  plan?: SubscriptionPlan;
}

// Subscription Plan Module Access - matches server/default-permissions.ts
const SUBSCRIPTION_PLAN_MODULES = {
  basic: [
    'dashboard', 'sales', 'purchases', 'products', 'customers', 
    'basic_reports', 'basic_accounting'
  ],
  
  standard: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'accounting', 'banking', 'reports', 'inventory', 'vat',
    'compliance_basic'
  ],
  
  professional: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'accounting', 'banking', 'reports', 'inventory', 'vat',
    'compliance', 'pos', 'advanced_reports', 'projects',
    'payroll_basic'
  ],
  
  enterprise: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'accounting', 'banking', 'reports', 'inventory', 'vat',
    'compliance', 'pos', 'advanced_reports', 'projects',
    'payroll', 'advanced_analytics', 'api_access', 'custom_fields',
    'workflow_automation', 'multi_company'
  ]
};

export function useCompanySubscription() {
  const { data: subscription, isLoading, error } = useQuery<CompanySubscription>({
    queryKey: ["/api/company/subscription"],
    retry: false,
  });

  // Function to check if module is available for current subscription plan
  const isModuleAvailable = (module: string): boolean => {
    if (!subscription?.plan) {
      // Default to basic plan if no subscription found
      const basicModules = SUBSCRIPTION_PLAN_MODULES.basic;
      return basicModules.includes(module);
    }

    const planName = subscription.plan.name.toLowerCase();
    const planModules = SUBSCRIPTION_PLAN_MODULES[planName as keyof typeof SUBSCRIPTION_PLAN_MODULES];
    
    if (!planModules) {
      // Fallback to basic if plan not found
      return SUBSCRIPTION_PLAN_MODULES.basic.includes(module);
    }

    return planModules.includes(module);
  };

  // Function to get available modules for current plan
  const getAvailableModules = (): string[] => {
    if (!subscription?.plan) {
      return SUBSCRIPTION_PLAN_MODULES.basic;
    }

    const planName = subscription.plan.name.toLowerCase();
    return SUBSCRIPTION_PLAN_MODULES[planName as keyof typeof SUBSCRIPTION_PLAN_MODULES] || SUBSCRIPTION_PLAN_MODULES.basic;
  };

  return {
    subscription,
    isLoading,
    error,
    isModuleAvailable,
    getAvailableModules,
    currentPlan: subscription?.plan,
    planName: subscription?.plan?.name || 'basic'
  };
}