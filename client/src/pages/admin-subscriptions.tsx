import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  DollarSign,
  Clock
} from "lucide-react";

interface SubscriptionInfo {
  id: number;
  companyId: number;
  planId: number;
  status: string;
  billingPeriod: string;
  amount: string;
  startDate: string;
  endDate: string;
  company?: {
    id: number;
    name: string;
    displayName?: string;
    email: string;
    subscriptionStatus?: string;
  };
  plan?: {
    id: number;
    name: string;
    displayName?: string;
    monthlyPrice: string;
  };
}

export default function AdminSubscriptions() {
  // Fetch trial subscriptions
  const { data: trialSubscriptions = [], isLoading: trialLoading, error: trialError } = useQuery<SubscriptionInfo[]>({
    queryKey: ["/api/super-admin/subscriptions/trial"],
    retry: 3,
  });

  // Fetch active subscriptions
  const { data: activeSubscriptions = [], isLoading: activeLoading, error: activeError } = useQuery<SubscriptionInfo[]>({
    queryKey: ["/api/super-admin/subscriptions/active"],
    retry: 3,
  });

  // Fetch overdue subscriptions
  const { data: overdueSubscriptions = [], isLoading: overdueLoading, error: overdueError } = useQuery<SubscriptionInfo[]>({
    queryKey: ["/api/super-admin/subscriptions/overdue"],
    retry: 3,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: string) => {
    return `R ${parseFloat(price).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTrialDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const totalTrialRevenue = trialSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount || '0'), 0);
  const totalActiveRevenue = activeSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount || '0'), 0);
  const totalOverdueRevenue = overdueSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount || '0'), 0);

  // Error handling
  if (trialError || activeError || overdueError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Subscription Data</h2>
          <p className="text-gray-600 mb-4">
            Error loading subscription monitoring data. This might be due to authentication or server issues.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            {trialError && <p>Trial data error: {trialError.message}</p>}
            {activeError && <p>Active data error: {activeError.message}</p>}
            {overdueError && <p>Overdue data error: {overdueError.message}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Beautiful Hero Header - Restored Original Design */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-3">Subscription Analytics Dashboard</h1>
                <p className="text-blue-100 text-lg font-medium">Real-time monitoring of trial conversions, active subscribers, and revenue metrics</p>
              </div>
              <div className="hidden sm:block">
                <TrendingUp className="h-12 w-12 text-white opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Summary Cards - Restored Original Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-8 w-8 opacity-80" />
              <span className="text-4xl font-black">{trialSubscriptions.length}</span>
            </div>
            <div className="text-sm opacity-90 font-bold mb-1">Trial Users</div>
            <div className="text-sm opacity-75 font-bold">Potential: {formatPrice(totalTrialRevenue.toString())}</div>
          </div>

          <div className="bg-green-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <CreditCard className="h-8 w-8 opacity-80" />
              <span className="text-4xl font-black">{activeSubscriptions.length}</span>
            </div>
            <div className="text-sm opacity-90 font-bold mb-1">Active Subscribers</div>
            <div className="text-sm opacity-75 font-bold">Revenue: {formatPrice(totalActiveRevenue.toString())}</div>
          </div>

          <div className="bg-red-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="h-8 w-8 opacity-80" />
              <span className="text-4xl font-black">{overdueSubscriptions.length}</span>
            </div>
            <div className="text-sm opacity-90 font-bold mb-1">Overdue Accounts</div>
            <div className="text-sm opacity-75 font-bold">At Risk: {formatPrice(totalOverdueRevenue.toString())}</div>
          </div>

          <div className="bg-purple-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-black">{formatPrice((totalActiveRevenue + totalOverdueRevenue).toString())}</span>
            </div>
            <div className="text-sm opacity-90 font-bold mb-1">Total MRR</div>
            <div className="text-sm opacity-75 font-bold">Monthly recurring revenue</div>
          </div>
        </div>

        {/* Compact Subscription Tables */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Tabs defaultValue="trial" className="space-y-0">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-none rounded-t-lg h-12">
              <TabsTrigger 
                value="trial" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-sm"
              >
                <Users className="h-3 w-3" />
                Trial ({trialSubscriptions.length})
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white text-sm"
              >
                <CreditCard className="h-3 w-3" />
                Active ({activeSubscriptions.length})
              </TabsTrigger>
              <TabsTrigger 
                value="overdue" 
                className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white text-sm"
              >
                <AlertTriangle className="h-3 w-3" />
                Overdue ({overdueSubscriptions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trial" className="mt-0 p-4">
              {trialLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading...</p>
                </div>
              ) : trialSubscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No trial subscriptions found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trialSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm text-gray-900 truncate">
                            {subscription.company?.displayName || subscription.company?.name || `Company ${subscription.companyId}`}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                            {subscription.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{subscription.company?.email || 'No email'}</p>
                        <p className="text-xs text-gray-400">Plan: {subscription.plan?.displayName || subscription.plan?.name || `Plan ${subscription.planId}`}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span className="font-medium text-sm text-blue-600">{calculateTrialDaysRemaining(subscription.endDate)}d</span>
                        </div>
                        <p className="text-xs text-gray-500">Expires: {formatDate(subscription.endDate)}</p>
                        <p className="text-sm font-medium text-green-600">{formatPrice(subscription.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-0 p-4">
              {activeLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading...</p>
                </div>
              ) : activeSubscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No active subscriptions found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-green-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm text-gray-900 truncate">
                            {subscription.company?.displayName || subscription.company?.name || `Company ${subscription.companyId}`}
                          </h3>
                          <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                            {subscription.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{subscription.company?.email || 'No email'}</p>
                        <p className="text-xs text-gray-400">Plan: {subscription.plan?.displayName || subscription.plan?.name || `Plan ${subscription.planId}`}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span className="font-medium text-sm text-green-600">{formatPrice(subscription.amount)}</span>
                        </div>
                        <p className="text-xs text-gray-500">Billing: {subscription.billingPeriod}</p>
                        <p className="text-xs text-gray-500">Renews: {formatDate(subscription.endDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="overdue" className="mt-0 p-4">
              {overdueLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading...</p>
                </div>
              ) : overdueSubscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No overdue subscriptions found</p>
                  <p className="text-green-600 text-sm mt-1">All accounts are up to date</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {overdueSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg"></div>
                      <div className="flex-1 min-w-0 ml-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm text-gray-900 truncate">
                            {subscription.company?.displayName || subscription.company?.name || `Company ${subscription.companyId}`}
                          </h3>
                          <Badge className="bg-red-100 text-red-800 text-xs px-2 py-1">
                            OVERDUE
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{subscription.company?.email || 'No email'}</p>
                        <p className="text-xs text-gray-400">Plan: {subscription.plan?.displayName || subscription.plan?.name || `Plan ${subscription.planId}`}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="flex items-center gap-1 mb-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span className="font-medium text-sm text-red-600">{formatPrice(subscription.amount)}</span>
                        </div>
                        <p className="text-xs text-red-600 font-medium">Due: {formatDate(subscription.endDate)}</p>
                        <p className="text-xs text-gray-500">Billing: {subscription.billingPeriod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}