import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

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

// Subscription Plan Module Access - Enhanced with VAT, expense, and purchase modules
const SUBSCRIPTION_PLAN_MODULES = {
  trial: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'expenses', 'invoices', 'estimates', 'accounting', 'banking',
    'reports', 'inventory', 'vat', 'vat_management', 'chart_of_accounts', 
    'journal_entries', 'payments', 'settings', 'suppliers', 'purchase_orders',
    'expense_management', 'vat_returns', 'vat_reporting', 'basic_reports', 
    'basic_accounting'
  ],
  
  basic: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'expenses', 'invoices', 'estimates', 'accounting', 'banking',
    'reports', 'inventory', 'vat', 'vat_management', 'chart_of_accounts', 
    'journal_entries', 'payments', 'settings', 'suppliers', 'purchase_orders',
    'expense_management', 'vat_returns', 'vat_reporting', 'basic_reports', 
    'basic_accounting'
  ],
  
  standard: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'expenses', 'invoices', 'estimates', 'accounting', 'banking', 
    'reports', 'inventory', 'vat', 'chart_of_accounts', 'journal_entries',
    'payments', 'settings', 'compliance_basic'
  ],
  
  professional: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'expenses', 'invoices', 'estimates', 'accounting', 'banking', 
    'reports', 'inventory', 'vat', 'chart_of_accounts', 'journal_entries',
    'payments', 'settings', 'compliance', 'pos', 'advanced_reports', 
    'projects', 'payroll_basic'
  ],
  
  enterprise: [
    'dashboard', 'sales', 'purchases', 'products', 'customers',
    'expenses', 'invoices', 'estimates', 'accounting', 'banking', 
    'reports', 'inventory', 'vat', 'chart_of_accounts', 'journal_entries',
    'payments', 'settings', 'compliance', 'pos', 'advanced_reports', 
    'projects', 'payroll', 'advanced_analytics', 'api_access', 
    'custom_fields', 'workflow_automation', 'multi_company'
  ]
};

export function useCompanySubscription() {
  const { user } = useAuth();
  const { data: subscription, isLoading, error } = useQuery<CompanySubscription>({
    queryKey: ["/api/company/subscription"],
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401') || error?.message?.includes('authentication')) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  // Check if user is super admin or software owner
  const isSuperAdminOrOwner = user?.role === "super_admin" || 
                              user?.username === "sysadmin_7f3a2b8e" || 
                              user?.email === "accounts@thinkmybiz.com";

  // Function to check if module is available for current subscription plan
  const isModuleAvailable = (module: string): boolean => {
    // Super admin and software owner have access to all modules
    if (isSuperAdminOrOwner) {
      return true;
    }

    if (!subscription?.plan) {
      // Default to trial access if no subscription found
      const trialModules = SUBSCRIPTION_PLAN_MODULES.trial;
      return trialModules.includes(module);
    }

    // For trial status, use trial modules regardless of plan
    if (subscription.status === 'trial') {
      const trialModules = SUBSCRIPTION_PLAN_MODULES.trial;
      return trialModules.includes(module);
    }

    const planName = subscription.plan.name.toLowerCase();
    const planModules = SUBSCRIPTION_PLAN_MODULES[planName as keyof typeof SUBSCRIPTION_PLAN_MODULES];
    
    if (!planModules) {
      // Fallback to trial if plan not found
      return SUBSCRIPTION_PLAN_MODULES.trial.includes(module);
    }

    return planModules.includes(module);
  };

  // Function to get available modules for current plan
  const getAvailableModules = (): string[] => {
    // Super admin and software owner have access to all modules
    if (isSuperAdminOrOwner) {
      return Object.values(SUBSCRIPTION_PLAN_MODULES).flat();
    }

    if (!subscription?.plan) {
      return SUBSCRIPTION_PLAN_MODULES.trial;
    }

    // For trial status, use trial modules
    if (subscription.status === 'trial') {
      return SUBSCRIPTION_PLAN_MODULES.trial;
    }

    const planName = subscription.plan.name.toLowerCase();
    return SUBSCRIPTION_PLAN_MODULES[planName as keyof typeof SUBSCRIPTION_PLAN_MODULES] || SUBSCRIPTION_PLAN_MODULES.trial;
  };

  return {
    subscription,
    isLoading,
    error,
    isModuleAvailable,
    getAvailableModules,
    currentPlan: subscription?.plan,
    planName: subscription?.plan?.name || 'trial',
    planStatus: subscription?.status || 'trial',
    isSuperAdminOrOwner
  };
}