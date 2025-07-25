import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";

export default function SubscriptionCancel() {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-red-600">Payment Cancelled</h1>
          <p className="text-lg text-gray-600">
            Your payment was cancelled and no charges were made.
          </p>
        </div>

        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5" />
              <span>Payment Status</span>
            </CardTitle>
            <CardDescription>
              Your subscription payment was not completed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <HelpCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Need Help?</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    If you experienced issues during payment or have questions about our plans, 
                    please contact our support team.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">What You Can Do:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <RefreshCw className="h-3 w-3" />
                  <span>Try the payment process again</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowLeft className="h-3 w-3" />
                  <span>Return to subscription plans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <HelpCircle className="h-3 w-3" />
                  <span>Contact support for assistance</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4 justify-center">
          <Button onClick={() => navigate("/subscription")} variant="default">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}