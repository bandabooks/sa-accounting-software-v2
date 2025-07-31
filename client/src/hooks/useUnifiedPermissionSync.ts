import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UnifiedPermissionState {
  roleId: number;
  moduleId: string;
  permissionType: string;
  enabled: boolean;
  source: 'subscription' | 'user_management';
}

interface PermissionSyncOptions {
  context: 'subscription' | 'user_management';
  subscriptionPlanId?: number;
}

/**
 * Unified hook for real-time permission state synchronization
 * Ensures both subscription interface and user management show identical states
 */
export function useUnifiedPermissionSync(options: PermissionSyncOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Main permission state query - source of truth
  const permissionStateQuery = useQuery({
    queryKey: ['/api/permissions/unified-state', options.subscriptionPlanId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.subscriptionPlanId) {
        params.append('planId', options.subscriptionPlanId.toString());
      }
      
      const response = await fetch(`/api/permissions/unified-state?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch unified permission state');
      }
      return response.json();
    },
    staleTime: 0, // Always fetch fresh data for real-time sync
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    refetchIntervalInBackground: true,
  });

  // Subscription plan module states query
  const subscriptionModulesQuery = useQuery({
    queryKey: ['/api/subscription/modules', options.subscriptionPlanId],
    queryFn: async () => {
      if (!options.subscriptionPlanId) return null;
      
      const response = await fetch(`/api/super-admin/subscription-plans/${options.subscriptionPlanId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription modules');
      }
      const plan = await response.json();
      return plan.features || [];
    },
    enabled: !!options.subscriptionPlanId,
  });

  // Permission toggle mutation with bi-directional sync
  const togglePermissionMutation = useMutation({
    mutationFn: async (data: UnifiedPermissionState) => {
      console.log(`[${options.context}] Toggling permission:`, data);
      
      const response = await fetch('/api/permissions/unified-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          context: options.context,
          subscriptionPlanId: options.subscriptionPlanId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle permission');
      }
      
      return response.json();
    },
    onSuccess: (result, variables) => {
      console.log(`[${options.context}] Permission sync successful:`, result);
      
      // Invalidate all related queries to trigger real-time sync
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/unified-state'] });
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/matrix'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/modules'] });
      
      // If this was from subscription interface, also invalidate plan data
      if (options.subscriptionPlanId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/super-admin/subscription-plans', options.subscriptionPlanId] 
        });
      }
      
      toast({
        title: "Permission Updated",
        description: `${variables.permissionType} permission for ${variables.moduleId} ${variables.enabled ? 'enabled' : 'disabled'} successfully`,
      });
    },
    onError: (error: Error, variables) => {
      console.error(`[${options.context}] Permission sync failed:`, error);
      
      toast({
        title: "Permission Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check if module is enabled in subscription plan
  const isModuleEnabledInSubscription = (moduleId: string): boolean => {
    if (!subscriptionModulesQuery.data) return true; // If no subscription data, allow all
    return subscriptionModulesQuery.data.includes(moduleId);
  };

  // Check if module is active (enabled in both subscription and role permissions)
  const isModuleActive = (moduleId: string, roleId?: number): boolean => {
    const subscriptionEnabled = isModuleEnabledInSubscription(moduleId);
    
    if (!permissionStateQuery.data || !roleId) {
      return subscriptionEnabled;
    }
    
    const rolePermissions = permissionStateQuery.data.permissions?.filter(
      (p: any) => p.roleId === roleId && p.moduleId === moduleId
    ) || [];
    
    const hasPermissions = rolePermissions.some((p: any) => p.enabled);
    
    return subscriptionEnabled && hasPermissions;
  };

  // Get permission state for specific role and module
  const getPermissionState = (roleId: number, moduleId: string, permissionType: string): boolean => {
    if (!permissionStateQuery.data) return false;
    
    const permission = permissionStateQuery.data.permissions?.find(
      (p: any) => p.roleId === roleId && p.moduleId === moduleId && p.permissionType === permissionType
    );
    
    return permission ? permission.enabled : false;
  };

  // Check if editing is allowed in current context
  const canEditPermissions = (): boolean => {
    // Super admin can always edit in both contexts
    // In user management, check if user has permission management rights
    // In subscription interface, allow editing plan modules
    return options.context === 'subscription' || 
           permissionStateQuery.data?.canEdit === true;
  };

  // Get restriction reason if editing is not allowed
  const getRestrictionReason = (moduleId: string): string | null => {
    if (canEditPermissions()) return null;
    
    if (!isModuleEnabledInSubscription(moduleId)) {
      return "Module not included in current subscription plan. Contact admin to upgrade.";
    }
    
    if (options.context === 'user_management') {
      return "Managed by subscription plan. Contact admin to change.";
    }
    
    return null;
  };

  return {
    // Data
    permissionState: permissionStateQuery.data,
    subscriptionModules: subscriptionModulesQuery.data,
    
    // Loading states
    isLoading: permissionStateQuery.isLoading || subscriptionModulesQuery.isLoading,
    isToggling: togglePermissionMutation.isPending,
    
    // Actions
    togglePermission: togglePermissionMutation.mutate,
    
    // State checkers
    isModuleActive,
    isModuleEnabledInSubscription,
    getPermissionState,
    canEditPermissions,
    getRestrictionReason,
    
    // Sync status
    lastSyncTime: permissionStateQuery.dataUpdatedAt,
    isSyncing: permissionStateQuery.isFetching,
  };
}