import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Check, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  Crown,
  Users,
  FileText,
  Building,
  TrendingUp
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLocation } from "wouter";

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

export default function Subscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<string>("monthly");

  // Fetch current subscription
  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery<CompanySubscription>({
    queryKey: ["/api/company/subscription"],
  });

  // Fetch available plans
  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  // Request subscription change mutation
  const requestChangeMutation = useMutation({
    mutationFn: async ({ planId, billingPeriod }: { planId: number; billingPeriod: string }) => {
      return await apiRequest("POST", "/api/company/subscription/request", { planId, billingPeriod });
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your subscription change request has been submitted for review.",
      });
      setIsUpgradeDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/company/subscription"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit subscription change request",
        variant: "destructive",
      });
    },
  });

  const handlePlanRequest = () => {
    if (selectedPlan && selectedBillingPeriod) {
      requestChangeMutation.mutate({
        planId: selectedPlan,
        billingPeriod: selectedBillingPeriod
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: string) => {
    return `R ${parseFloat(price).toFixed(2)}`;
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing details
        </p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Current Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {currentSubscription.plan?.displayName || "Unknown Plan"}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentSubscription.plan?.description}
                  </p>
                </div>
                <Badge className={getStatusColor(currentSubscription.status)}>
                  {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Billing Period</Label>
                  <p className="text-lg font-semibold">
                    {currentSubscription.billingPeriod === "monthly" ? "Monthly" : "Annual"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-semibold">
                    {formatPrice(currentSubscription.amount)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Next Billing Date</Label>
                  <p className="text-lg font-semibold">
                    {currentSubscription.nextBillingDate 
                      ? formatDate(currentSubscription.nextBillingDate)
                      : "N/A"
                    }
                  </p>
                </div>
              </div>

              {currentSubscription.plan && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Plan Features</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentSubscription.plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-500 mb-4">
                You don't have an active subscription. Choose a plan to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Plans</h2>
          <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Crown className="h-4 w-4 mr-2" />
                Change Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Plan Change</DialogTitle>
                <DialogDescription>
                  Select a new plan and billing period. Your request will be reviewed by our team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plan">Select Plan</Label>
                  <Select value={selectedPlan?.toString()} onValueChange={(value) => setSelectedPlan(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.displayName} - {formatPrice(plan.monthlyPrice)}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billing">Billing Period</Label>
                  <Select value={selectedBillingPeriod} onValueChange={setSelectedBillingPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual (Save 17%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handlePlanRequest}
                  disabled={!selectedPlan || requestChangeMutation.isPending}
                  className="w-full"
                >
                  {requestChangeMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => {
            const isCurrentPlan = currentSubscription?.planId === plan.id;
            const monthlyPrice = parseFloat(plan.monthlyPrice);
            const annualPrice = parseFloat(plan.annualPrice);
            const monthlySavings = (monthlyPrice * 12) - annualPrice;

            return (
              <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                {isCurrentPlan && (
                  <Badge className="absolute -top-2 left-4 bg-primary text-white">
                    Current Plan
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.displayName}
                    {plan.name === 'enterprise' && <Crown className="h-5 w-5 text-yellow-500" />}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">
                        {formatPrice(plan.monthlyPrice)}
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(plan.annualPrice)}/year (Save {formatPrice(monthlySavings.toString())})
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Features included:</h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limits && Object.keys(plan.limits).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Plan Limits:</h4>
                        <div className="grid grid-cols-1 gap-1 text-sm">
                          {Object.entries(plan.limits).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="capitalize">{key}:</span>
                              <span className="font-medium">
                                {value === -1 ? "Unlimited" : value.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isCurrentPlan && (
                      <div className="space-y-2">
                        {plan.name === 'enterprise' ? (
                          <Button 
                            className="w-full" 
                            variant="default"
                            onClick={() => {
                              setSelectedPlan(plan.id);
                              setIsUpgradeDialogOpen(true);
                            }}
                          >
                            Contact Sales
                          </Button>
                        ) : (
                          <>
                            <Button 
                              className="w-full" 
                              variant="outline"
                              onClick={() => navigate(`/subscription/payment/${plan.id}/monthly`)}
                            >
                              Choose Monthly - {formatPrice(plan.monthlyPrice)}
                            </Button>
                            <Button 
                              className="w-full" 
                              variant="default"
                              onClick={() => navigate(`/subscription/payment/${plan.id}/annual`)}
                            >
                              Choose Annual - {formatPrice(plan.annualPrice)} (Save 17%)
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Billing History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSubscription?.lastPaymentDate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">
                    Payment for {currentSubscription.plan?.displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(currentSubscription.lastPaymentDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(currentSubscription.amount)}</p>
                  <Badge variant="outline" className="text-green-600">
                    Paid
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Billing History</h3>
              <p className="text-gray-500">
                Your billing history will appear here once you have an active subscription.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}