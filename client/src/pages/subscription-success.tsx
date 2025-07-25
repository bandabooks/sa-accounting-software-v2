import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Calendar, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SubscriptionSuccess() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate subscription cache to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/company/subscription"] });
  }, [queryClient]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Your subscription has been activated successfully.
          </p>
        </div>

        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Confirmation</span>
            </CardTitle>
            <CardDescription>
              Your payment has been processed and your subscription is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Billing starts immediately
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  All features now available
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-3 w-3" />
                  <span>Access all premium features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-3 w-3" />
                  <span>Manage your subscription settings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-3 w-3" />
                  <span>Download invoices from billing history</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4 justify-center">
          <Button onClick={() => navigate("/dashboard")} variant="default">
            Go to Dashboard
          </Button>
          <Button onClick={() => navigate("/subscription")} variant="outline">
            View Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}