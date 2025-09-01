import { useQuery } from '@tanstack/react-query';

export interface PackageFeatureCheck {
  hasAccess: boolean;
  limit?: number;
  currentUsage?: number;
  packageType: string;
  upgradeRequired?: boolean;
}

export interface ServicePackage {
  id: number;
  packageType: string;
  displayName: string;
  description: string;
  monthlyPrice: string;
  annualPrice?: string;
  setupFee: string;
  maxClients?: number;
  maxUsers?: number;
  priority: number;
  isActive: boolean;
}

/**
 * Hook to check feature access for a specific client
 */
export function useFeatureAccess(clientId: number, featureKey: string) {
  return useQuery<PackageFeatureCheck>({
    queryKey: ['feature-access', clientId, featureKey],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}/feature-access/${featureKey}`);
      if (!response.ok) {
        throw new Error('Failed to check feature access');
      }
      return response.json();
    },
    enabled: !!clientId && !!featureKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check multiple features at once
 */
export function useMultipleFeatureAccess(clientId: number, features: string[]) {
  return useQuery<Record<string, PackageFeatureCheck>>({
    queryKey: ['multiple-features', clientId, features],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}/check-features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features }),
      });
      if (!response.ok) {
        throw new Error('Failed to check features');
      }
      return response.json();
    },
    enabled: !!clientId && features.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get available service packages
 */
export function useServicePackages() {
  return useQuery<ServicePackage[]>({
    queryKey: ['service-packages'],
    queryFn: async () => {
      const response = await fetch('/api/service-packages');
      if (!response.ok) {
        throw new Error('Failed to fetch service packages');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get features for a specific package
 */
export function usePackageFeatures(packageType: string) {
  return useQuery({
    queryKey: ['package-features', packageType],
    queryFn: async () => {
      const response = await fetch(`/api/service-packages/${packageType}/features`);
      if (!response.ok) {
        throw new Error('Failed to fetch package features');
      }
      return response.json();
    },
    enabled: !!packageType,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to get package comparison data
 */
export function usePackageComparison(currentPackage: string) {
  return useQuery({
    queryKey: ['package-comparison', currentPackage],
    queryFn: async () => {
      const response = await fetch(`/api/service-packages/${currentPackage}/compare`);
      if (!response.ok) {
        throw new Error('Failed to get package comparison');
      }
      return response.json();
    },
    enabled: !!currentPackage,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to get client subscription details
 */
export function useClientSubscription(clientId: number) {
  return useQuery({
    queryKey: ['client-subscription', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}/subscription`);
      if (!response.ok) {
        throw new Error('Failed to fetch client subscription');
      }
      return response.json();
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Feature constants for easy reference
export const FEATURES = {
  COMPLIANCE: {
    BASIC_REPORTS: 'compliance.basic_reports',
    ADVANCED_REPORTS: 'compliance.advanced_reports',
    CUSTOM_REPORTS: 'compliance.custom_reports',
    CLIENT_MANAGEMENT: 'compliance.client_management',
    TASK_TRACKING: 'compliance.task_tracking',
    AUTOMATED_REMINDERS: 'compliance.automated_reminders',
    WORKFLOW_AUTOMATION: 'compliance.workflow_automation',
    AI_ASSISTANCE: 'compliance.ai_assistance'
  },
  BILLING: {
    MANUAL_INVOICING: 'billing.manual_invoicing',
    AUTOMATED_BILLING: 'billing.automated_billing',
    ADVANCED_ANALYTICS: 'billing.advanced_analytics',
    WHITE_LABEL: 'billing.white_label'
  },
  INTEGRATION: {
    SARS_BASIC: 'integration.sars_basic',
    SARS_ADVANCED: 'integration.sars_advanced',
    THIRD_PARTY: 'integration.third_party',
    CUSTOM_API: 'integration.custom_api'
  },
  SUPPORT: {
    EMAIL: 'support.email',
    PRIORITY: 'support.priority',
    PHONE: 'support.phone',
    DEDICATED_MANAGER: 'support.dedicated_manager'
  },
  USERS: {
    LIMIT: 'users.limit'
  }
} as const;