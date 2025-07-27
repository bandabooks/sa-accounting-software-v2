import { useAuth } from "@/hooks/useAuth";
import SubscriptionUsageDashboard from "@/components/subscription/SubscriptionUsageDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Building } from "lucide-react";

export default function SubscriptionUsageDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please log in to view your subscription usage dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usage Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your subscription usage and get predictive insights
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <BarChart3 className="h-3 w-3" />
          <span>Real-time Data</span>
        </Badge>
      </div>

      {/* Main Dashboard */}
      <SubscriptionUsageDashboard 
        companyId={2}
        timeRange="30d"
      />
    </div>
  );
}