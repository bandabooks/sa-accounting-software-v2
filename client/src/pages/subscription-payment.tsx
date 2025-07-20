import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";

interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  limits: any;
}

interface PaymentRequest {
  paymentId: number;
  paymentUrl: string;
  paymentData: any;
  message: string;
}

export default function SubscriptionPayment() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/subscription/payment/:planId/:period");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const planId = params?.planId ? parseInt(params.planId) : null;
  const billingPeriod = params?.period as 'monthly' | 'annual';
  
  const [paymentStatus, setPaymentStatus] = useState<'selecting' | 'processing' | 'redirecting'>('selecting');

  // Fetch subscription plan details
  const { data: plan, isLoading: planLoading } = useQuery<SubscriptionPlan>({
    queryKey: ["/api/subscription-plans", planId],
    enabled: !!planId,
  });

  // Create payment request mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!planId || !billingPeriod) throw new Error("Missing plan or billing period");
      
      return await apiRequest("POST", "/api/company/subscription/request", {
        planId,
        billingPeriod
      });
    },
    onSuccess: (data: PaymentRequest) => {
      setPaymentStatus('redirecting');
      
      // Create form and submit to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.paymentUrl;
      form.style.display = 'none';
      
      // Add all payment data as hidden inputs
      Object.entries(data.paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      form.submit();
    },
    onError: (error: any) => {
      console.error("Payment creation failed:", error);
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setPaymentStatus('selecting');
    }
  });

  const handlePaymentSubmit = () => {
    setPaymentStatus('processing');
    createPaymentMutation.mutate();
  };

  if (!match || !planId || !billingPeriod) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Invalid Payment Request
            </CardTitle>
            <CardDescription>
              The payment link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/subscription")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Subscription Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (planLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Plan Not Found
            </CardTitle>
            <CardDescription>
              The requested subscription plan could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/subscription")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Subscription Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amount = billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const savings = billingPeriod === 'annual' 
    ? (parseFloat(plan.monthlyPrice) * 12 - parseFloat(plan.annualPrice)).toFixed(2)
    : null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Button 
          onClick={() => navigate("/subscription")} 
          variant="ghost" 
          size="sm"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
        <p className="text-gray-600">
          Secure payment processing powered by PayFast
        </p>
      </div>

      <div className="grid gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Review your subscription details before payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{plan.displayName}</h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {billingPeriod === 'annual' ? 'Annual Billing' : 'Monthly Billing'}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">R{amount}</div>
                <div className="text-sm text-gray-600">
                  {billingPeriod === 'annual' ? 'per year' : 'per month'}
                </div>
                {savings && (
                  <div className="text-sm text-green-600 font-medium">
                    Save R{savings} annually
                  </div>
                )}
              </div>
            </div>

            {plan.features && plan.features.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Included Features:</h4>
                <ul className="text-sm space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>
              Secure payment processing via PayFast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">PayFast Secure Payment</div>
                  <div className="text-sm text-gray-600">
                    Credit Card, Debit Card, EFT, or Mobile Payment
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Your payment information is processed securely by PayFast</p>
                <p>• We do not store your payment details</p>
                <p>• All transactions are encrypted and protected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Action */}
        <Card>
          <CardContent className="pt-6">
            {paymentStatus === 'selecting' && (
              <Button 
                onClick={handlePaymentSubmit}
                className="w-full h-12 text-lg"
                disabled={createPaymentMutation.isPending}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Payment - R{amount}
              </Button>
            )}
            
            {paymentStatus === 'processing' && (
              <div className="text-center py-4">
                <LoadingSpinner />
                <p className="mt-2 text-gray-600">Setting up secure payment...</p>
              </div>
            )}
            
            {paymentStatus === 'redirecting' && (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">Redirecting to PayFast...</p>
                <p className="text-sm text-gray-600 mt-1">
                  Please wait while we redirect you to complete your payment.
                </p>
              </div>
            )}
            
            <div className="text-center mt-4 text-xs text-gray-500">
              By proceeding, you agree to our Terms of Service and Privacy Policy.
              Your subscription will be activated immediately upon successful payment.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}