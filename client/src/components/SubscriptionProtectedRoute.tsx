import { ReactNode } from "react";
import { useSubscriptionNavigation } from "@/hooks/useSubscriptionNavigation";
import { AccessDeniedPage } from "@/components/navigation/UpgradePrompt";
import { useLocation } from "wouter";

interface SubscriptionProtectedRouteProps {
  children: ReactNode;
  featureKey?: string;
  fallback?: ReactNode;
}

export function SubscriptionProtectedRoute({ 
  children, 
  featureKey, 
  fallback 
}: SubscriptionProtectedRouteProps) {
  const [location] = useLocation();
  const { canAccessPath, getUpgradeInfo, isLoading } = useSubscriptionNavigation();
  
  // Show loading state while checking subscription
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Check if user can access this path
  const hasAccess = featureKey ? 
    canAccessPath(`/${featureKey}`) : 
    canAccessPath(location);
  
  if (!hasAccess) {
    // Return custom fallback or default access denied page
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return <AccessDeniedPage feature={featureKey} />;
  }
  
  return <>{children}</>;
}

export default SubscriptionProtectedRoute;