import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle, ArrowRight, Download, Calendar } from "lucide-react";

interface CompanySubscription {
  id: number;
  status: string;
  billingPeriod: string;
  startDate: string;
  endDate: string;
  amount: string;
  plan: {
    displayName: string;
    description: string;
    features: string[];
  };
}

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [match] = useRoute("/subscription/success");
  const [countdown, setCountdown] = useState(10);
  
  // Fetch current subscription to confirm activation
  const { data: subscription, isLoading } = useQuery<CompanySubscription>({
    queryKey: ["/api/company/subscription"],
    refetchInterval: 2000, // Poll every 2 seconds for subscription activation
  });

  // Auto-redirect countdown
  useEffect(() => {
    if (!subscription?.id) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [subscription?.id, navigate]);

  if (!match) {
    navigate("/subscription");
    return null;
  }

  if (isLoading || !subscription) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <LoadingSpinner />
              <h2 className="text-xl font-semibold mt-4 mb-2">
                Processing Your Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your subscription activation...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = subscription.status === 'active';
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600">
          Your subscription has been {isActive ? 'activated' : 'processed'} successfully.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>
              Your Think Mybiz Accounting subscription is now active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plan:</span>
              <span>{subscription.plan.displayName}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Badge variant={isActive ? "default" : "secondary"}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Billing:</span>
              <span className="capitalize">{subscription.billingPeriod}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount:</span>
              <span className="font-semibold">R{subscription.amount}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Active From:</span>
              <span>{formatDate(subscription.startDate)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Next Billing:</span>
              <span>{formatDate(subscription.endDate)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Features Included */}
        {subscription.plan.features && subscription.plan.features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Features Included</CardTitle>
              <CardDescription>
                Everything included in your {subscription.plan.displayName} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {subscription.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>
              Start using your accounting platform immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">1</span>
              </div>
              <div>
                <div className="font-medium">Set up your company profile</div>
                <div className="text-sm text-gray-600">
                  Complete your company information and preferences
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">2</span>
              </div>
              <div>
                <div className="font-medium">Create your first invoice</div>
                <div className="text-sm text-gray-600">
                  Start by adding customers and creating invoices
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">3</span>
              </div>
              <div>
                <div className="font-medium">Explore advanced features</div>
                <div className="text-sm text-gray-600">
                  Discover reporting, inventory, and financial management tools
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate("/dashboard")} 
            className="flex-1"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Go to Dashboard
            {subscription.id && countdown > 0 && (
              <span className="ml-2 text-xs opacity-75">
                (auto-redirect in {countdown}s)
              </span>
            )}
          </Button>
          
          <Button 
            onClick={() => navigate("/subscription")} 
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
        </div>

        {/* Support Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-center text-sm">
              <p className="font-medium text-blue-800 mb-1">
                Need help getting started?
              </p>
              <p className="text-blue-600">
                Contact our support team at{" "}
                <a href="mailto:support@thinkmybiz.com" className="underline">
                  support@thinkmybiz.com
                </a>
                {" "}or visit our help center for tutorials and guides.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}