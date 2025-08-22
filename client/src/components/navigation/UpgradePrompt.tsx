import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, Crown, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface UpgradePromptProps {
  title: string;
  description: string;
  cta: string;
  feature?: string;
  compact?: boolean;
}

export function UpgradePrompt({ title, description, cta, feature, compact = false }: UpgradePromptProps) {
  if (compact) {
    return (
      <div className="p-4 border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">{title}</p>
            <p className="text-xs text-amber-700 truncate">{description}</p>
          </div>
          <Link href="/subscription">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg text-amber-900">{title}</CardTitle>
          </div>
          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-100">
            Premium
          </Badge>
        </div>
        <CardDescription className="text-amber-700">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <Zap className="h-3 w-3" />
            <span>Instant activation after upgrade</span>
          </div>
          <Link href="/subscription">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              {cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Access denied page component for protected routes
export function AccessDeniedPage({ feature }: { feature?: string }) {
  const upgradeInfo = {
    title: 'Access Restricted',
    description: 'This feature requires a higher subscription plan to access. Upgrade your plan to unlock this functionality.',
    cta: 'Upgrade Plan'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-amber-100 rounded-full">
                <AlertTriangle className="h-12 w-12 text-amber-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Feature Not Available</h1>
            <p className="text-lg text-gray-600">
              You need to upgrade your subscription plan to access this feature.
            </p>
          </div>
          
          <UpgradePrompt
            title={upgradeInfo.title}
            description={upgradeInfo.description}
            cta={upgradeInfo.cta}
            feature={feature}
          />
          
          <div className="pt-6">
            <Link href="/dashboard">
              <Button variant="outline">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradePrompt;