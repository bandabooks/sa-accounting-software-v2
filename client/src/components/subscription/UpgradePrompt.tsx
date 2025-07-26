import { Link } from "wouter";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UpgradePromptProps {
  title?: string;
  description?: string;
  requiredPlan?: string;
  currentPlan?: string;
  feature?: string;
  className?: string;
}

export function UpgradePrompt({ 
  title = "Feature Not Available",
  description = "This feature requires a higher subscription plan.",
  requiredPlan = "Professional",
  currentPlan = "Basic",
  feature,
  className = ""
}: UpgradePromptProps) {
  return (
    <Card className={`border-dashed border-2 border-gray-300 ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <CardTitle className="text-gray-700">{title}</CardTitle>
        <CardDescription className="text-gray-500">
          {description}
          {feature && (
            <span className="block mt-2 font-medium">
              "{feature}" is available in {requiredPlan} plan and above.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Current Plan:</span>
              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                {currentPlan}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Required:</span>
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-primary" />
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                  {requiredPlan}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="sm" className="flex items-center gap-2">
            <Link href="/subscription">
              <Crown className="h-4 w-4" />
              Upgrade Plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/pricing">
              View Pricing
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function UpgradePromptInline({ 
  feature,
  requiredPlan = "Professional",
  currentPlan = "Basic",
  className = ""
}: {
  feature: string;
  requiredPlan?: string;
  currentPlan?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        <Lock className="h-4 w-4 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-700">{feature}</p>
          <p className="text-xs text-gray-500">Requires {requiredPlan} plan</p>
        </div>
      </div>
      <Button asChild size="sm" variant="outline" className="text-xs">
        <Link href="/subscription">
          Upgrade
        </Link>
      </Button>
    </div>
  );
}