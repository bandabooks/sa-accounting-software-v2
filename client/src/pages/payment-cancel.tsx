import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCcw, HelpCircle } from "lucide-react";

export default function PaymentCancel() {
  const [, navigate] = useLocation();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <XCircle className="h-10 w-10 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold text-orange-700 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600">
          Your payment was cancelled and no charges were made to your account.
        </p>
      </div>

      <div className="grid gap-6">
        {/* What Happened */}
        <Card>
          <CardHeader>
            <CardTitle>What Happened?</CardTitle>
            <CardDescription>
              Your payment process was interrupted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              The payment process was cancelled before completion. This could have happened because:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• You clicked the back button or closed the payment window</li>
              <li>• The payment session expired due to inactivity</li>
              <li>• There was a technical issue with the payment provider</li>
              <li>• You chose to cancel the transaction</li>
            </ul>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                ✓ No charges were made to your account
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What Would You Like to Do?</CardTitle>
            <CardDescription>
              Choose your next action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button 
                onClick={() => navigate("/subscription")} 
                className="justify-start h-auto p-4"
              >
                <RefreshCcw className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Try Payment Again</div>
                  <div className="text-sm opacity-75">
                    Return to subscription plans and retry payment
                  </div>
                </div>
              </Button>

              <Button 
                onClick={() => navigate("/dashboard")} 
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Return to Dashboard</div>
                  <div className="text-sm opacity-75">
                    Continue using the platform with current plan
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Common Payment Issues
            </CardTitle>
            <CardDescription>
              Troubleshooting tips for successful payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Payment Method Issues</div>
                <div className="text-gray-600">
                  Ensure your card has sufficient funds and is enabled for online payments.
                  Contact your bank if you're experiencing card declines.
                </div>
              </div>
              
              <div>
                <div className="font-medium text-gray-900">Browser Issues</div>
                <div className="text-gray-600">
                  Try disabling browser extensions, clearing cache, or using a different browser.
                  Ensure JavaScript is enabled.
                </div>
              </div>
              
              <div>
                <div className="font-medium text-gray-900">Connection Issues</div>
                <div className="text-gray-600">
                  Check your internet connection and try again. Avoid using public Wi-Fi
                  for payment transactions.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-center text-sm">
              <p className="font-medium text-blue-800 mb-2">
                Still Having Issues?
              </p>
              <p className="text-blue-600 mb-3">
                Our support team is here to help you complete your subscription.
              </p>
              <div className="space-y-2">
                <div>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:billing@thinkmybiz.com" className="underline">
                    billing@thinkmybiz.com
                  </a>
                </div>
                <div>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+27123456789" className="underline">
                    +27 12 345 6789
                  </a>
                </div>
                <div className="text-xs text-blue-500 mt-2">
                  Support hours: Monday - Friday, 8:00 AM - 5:00 PM SAST
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}