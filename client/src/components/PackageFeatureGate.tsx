import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Crown, Zap, Star, AlertTriangle } from 'lucide-react';

export interface PackageFeatureGateProps {
  hasAccess: boolean;
  currentPackage: string;
  feature: string;
  limit?: number;
  currentUsage?: number;
  upgradeRequired?: boolean;
  children: React.ReactNode;
  upgradeMessage?: string;
}

const PACKAGE_DISPLAY_NAMES = {
  basic: 'Basic Compliance',
  standard: 'Standard Plus',
  premium: 'Premium Full Service',
  enterprise: 'Enterprise Custom'
} as const;

const PACKAGE_ICONS = {
  basic: CheckCircle,
  standard: Zap,
  premium: Star,
  enterprise: Crown
} as const;

export function PackageFeatureGate({
  hasAccess,
  currentPackage,
  feature,
  limit,
  currentUsage,
  upgradeRequired,
  children,
  upgradeMessage
}: PackageFeatureGateProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  if (hasAccess) {
    return (
      <div className="relative">
        {children}
        {limit && currentUsage !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Usage: {currentUsage} / {limit}</span>
              <Badge variant={currentUsage >= limit * 0.8 ? "destructive" : "secondary"}>
                {Math.round((currentUsage / limit) * 100)}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full transition-all ${
                  currentUsage >= limit * 0.8 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const packageDisplayName = PACKAGE_DISPLAY_NAMES[currentPackage as keyof typeof PACKAGE_DISPLAY_NAMES] || currentPackage;
  const PackageIcon = PACKAGE_ICONS[currentPackage as keyof typeof PACKAGE_ICONS] || AlertTriangle;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      
      <div className="absolute inset-0 bg-gray-50 bg-opacity-90 rounded-lg flex items-center justify-center backdrop-blur-sm">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-6 w-6 text-red-500 mr-2" />
              <Badge variant="outline" className="text-sm">
                Feature Locked
              </Badge>
            </div>
            <CardTitle className="text-lg">Upgrade Required</CardTitle>
            <CardDescription>
              This feature is not available in your current {packageDisplayName} plan.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {upgradeMessage && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Feature Restriction</AlertTitle>
                <AlertDescription>{upgradeMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <PackageIcon className="h-4 w-4" />
              <span>Current: {packageDisplayName}</span>
            </div>

            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="default">
                  <Crown className="h-4 w-4 mr-2" />
                  View Upgrade Options
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Upgrade Your Service Package</DialogTitle>
                  <DialogDescription>
                    Unlock this feature and more with a higher service package.
                  </DialogDescription>
                </DialogHeader>
                <PackageComparisonTable currentPackage={currentPackage} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface PackageComparisonTableProps {
  currentPackage: string;
}

function PackageComparisonTable({ currentPackage }: PackageComparisonTableProps) {
  const packages = [
    {
      type: 'standard',
      name: 'Standard Plus',
      price: 'R 599',
      icon: Zap,
      features: [
        'Up to 25 clients',
        'Advanced reports',
        'Automated reminders',
        'Priority support',
        'SARS basic integration',
        'Up to 8 users'
      ],
      popular: false
    },
    {
      type: 'premium',
      name: 'Premium Full Service',
      price: 'R 999',
      icon: Star,
      features: [
        'Up to 100 clients',
        'Custom reports',
        'Workflow automation',
        'Phone support',
        'Advanced SARS integration',
        'Up to 20 users',
        'Third-party integrations'
      ],
      popular: true
    },
    {
      type: 'enterprise',
      name: 'Enterprise Custom',
      price: 'R 1,999',
      icon: Crown,
      features: [
        'Unlimited clients',
        'AI assistance',
        'White-label billing',
        'Dedicated manager',
        'Custom API access',
        'Unlimited users',
        'Full customization'
      ],
      popular: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {packages.map((pkg) => {
        const isCurrentPackage = pkg.type === currentPackage;
        const Icon = pkg.icon;
        
        return (
          <Card 
            key={pkg.type} 
            className={`relative ${pkg.popular ? 'ring-2 ring-blue-500' : ''} ${isCurrentPackage ? 'opacity-50' : ''}`}
          >
            {pkg.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <div className="text-2xl font-bold text-blue-600">{pkg.price}</div>
              <div className="text-sm text-gray-500">per month</div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-2 text-sm">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full mt-4" 
                variant={isCurrentPackage ? "secondary" : "default"}
                disabled={isCurrentPackage}
              >
                {isCurrentPackage ? 'Current Plan' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default PackageFeatureGate;