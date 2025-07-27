import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Building, 
  FileText, 
  Receipt, 
  Package, 
  HardDrive, 
  Upload, 
  Download,
  Calendar,
  Clock,
  Zap,
  Shield,
  Info
} from "lucide-react";

// Define comprehensive subscription limits with modern SaaS standards
export const SUBSCRIPTION_LIMITS = {
  // User & Company Limits
  maxUsers: {
    id: "maxUsers",
    name: "Maximum Users",
    description: "Total number of users allowed per company",
    icon: Users,
    category: "access",
    type: "number",
    defaultValue: 5,
    options: [1, 3, 5, 10, 25, 50, 100, 250, 500, 1000, -1], // -1 = unlimited
    unit: "users"
  },
  maxCompanies: {
    id: "maxCompanies", 
    name: "Maximum Companies",
    description: "Number of companies/businesses user can manage",
    icon: Building,
    category: "access",
    type: "number",
    defaultValue: 1,
    options: [1, 3, 5, 10, 25, 50, 100, -1],
    unit: "companies"
  },
  
  // Document & Transaction Limits
  maxInvoicesPerMonth: {
    id: "maxInvoicesPerMonth",
    name: "Monthly Invoice Limit",
    description: "Maximum invoices that can be created per month",
    icon: FileText,
    category: "transactions",
    type: "number",
    defaultValue: 50,
    options: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, -1],
    unit: "invoices/month"
  },
  maxExpensesPerMonth: {
    id: "maxExpensesPerMonth",
    name: "Monthly Expense Limit", 
    description: "Maximum expenses that can be recorded per month",
    icon: Receipt,
    category: "transactions",
    type: "number",
    defaultValue: 100,
    options: [25, 50, 100, 250, 500, 1000, 2500, 5000, -1],
    unit: "expenses/month"
  },
  maxProducts: {
    id: "maxProducts",
    name: "Product Catalog Limit",
    description: "Total number of products/services in catalog",
    icon: Package,
    category: "inventory",
    type: "number", 
    defaultValue: 100,
    options: [25, 50, 100, 250, 500, 1000, 2500, 5000, -1],
    unit: "products"
  },

  // Storage & Performance Limits
  maxStorageGB: {
    id: "maxStorageGB",
    name: "Storage Limit",
    description: "Total file storage space allocation",
    icon: HardDrive,
    category: "storage",
    type: "number",
    defaultValue: 1,
    options: [0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, -1],
    unit: "GB"
  },
  maxFileUploadMB: {
    id: "maxFileUploadMB",
    name: "File Upload Size",
    description: "Maximum individual file upload size",
    icon: Upload,
    category: "storage",
    type: "number",
    defaultValue: 10,
    options: [5, 10, 25, 50, 100, 250, 500],
    unit: "MB"
  },

  // Time & Retention Limits
  dataRetentionMonths: {
    id: "dataRetentionMonths",
    name: "Data Retention Period",
    description: "How long historical data is kept",
    icon: Calendar,
    category: "retention",
    type: "number",
    defaultValue: 12,
    options: [6, 12, 24, 36, 60, 120, -1], // -1 = forever
    unit: "months"
  },
  sessionTimeoutHours: {
    id: "sessionTimeoutHours",
    name: "Session Timeout",
    description: "User session expiration time",
    icon: Clock,
    category: "security",
    type: "number",
    defaultValue: 8,
    options: [1, 2, 4, 8, 12, 24, 72],
    unit: "hours"
  },

  // Feature Limits
  apiCallsPerMonth: {
    id: "apiCallsPerMonth",
    name: "API Calls Per Month",
    description: "Monthly API usage allowance",
    icon: Zap,
    category: "integration",
    type: "number",
    defaultValue: 1000,
    options: [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, -1],
    unit: "calls/month"
  },

  // Boolean Features
  allowMultiCurrency: {
    id: "allowMultiCurrency",
    name: "Multi-Currency Support", 
    description: "Enable multiple currency transactions",
    icon: Shield,
    category: "features",
    type: "boolean",
    defaultValue: false
  },
  allowAPIAccess: {
    id: "allowAPIAccess",
    name: "API Access",
    description: "Enable REST API and integrations",
    icon: Zap,
    category: "features", 
    type: "boolean",
    defaultValue: false
  },
  allowAdvancedReporting: {
    id: "allowAdvancedReporting",
    name: "Advanced Reporting",
    description: "Custom reports and analytics",
    icon: FileText,
    category: "features",
    type: "boolean",
    defaultValue: false
  },
  allowDataExport: {
    id: "allowDataExport",
    name: "Data Export",
    description: "Export data in various formats",
    icon: Download,
    category: "features",
    type: "boolean",
    defaultValue: true
  }
};

export const LIMIT_CATEGORIES = {
  access: { name: "Access & Users", color: "bg-blue-500", icon: Users },
  transactions: { name: "Transactions", color: "bg-green-500", icon: FileText },
  inventory: { name: "Inventory & Products", color: "bg-purple-500", icon: Package },
  storage: { name: "Storage & Files", color: "bg-orange-500", icon: HardDrive },
  retention: { name: "Data Retention", color: "bg-indigo-500", icon: Calendar },
  security: { name: "Security", color: "bg-red-500", icon: Shield },
  integration: { name: "Integration & API", color: "bg-teal-500", icon: Zap },
  features: { name: "Feature Toggles", color: "bg-gray-500", icon: Info }
};

interface LimitConfigurationPanelProps {
  selectedLimits: Record<string, any>;
  onLimitsChange: (limits: Record<string, any>) => void;
  planName: string;
}

export default function LimitConfigurationPanel({
  selectedLimits,
  onLimitsChange,
  planName
}: LimitConfigurationPanelProps) {
  const [limits, setLimits] = useState<Record<string, any>>({});

  // Initialize limits from props
  useEffect(() => {
    // Set default values for all limits if not already set
    const defaultLimits = Object.entries(SUBSCRIPTION_LIMITS).reduce((acc, [key, limit]) => {
      acc[key] = selectedLimits[key] !== undefined ? selectedLimits[key] : limit.defaultValue;
      return acc;
    }, {} as Record<string, any>);
    
    setLimits(defaultLimits);
    onLimitsChange(defaultLimits);
  }, [selectedLimits]);

  const updateLimit = (limitId: string, value: any) => {
    const newLimits = { ...limits, [limitId]: value };
    setLimits(newLimits);
    onLimitsChange(newLimits);
  };

  const renderNumberLimit = (limitId: string, limit: any) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <limit.icon className="h-4 w-4 text-gray-600" />
            <div>
              <Label className="text-sm font-medium">{limit.name}</Label>
              <p className="text-xs text-gray-500">{limit.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {limits[limitId] === -1 ? "Unlimited" : `${limits[limitId]} ${limit.unit}`}
          </Badge>
        </div>
        <Select
          value={limits[limitId]?.toString() || limit.defaultValue.toString()}
          onValueChange={(value) => updateLimit(limitId, value === "-1" ? -1 : parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limit.options.map((option: number) => (
              <SelectItem key={option} value={option.toString()}>
                {option === -1 ? "Unlimited" : `${option} ${limit.unit}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderBooleanLimit = (limitId: string, limit: any) => {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-3">
          <limit.icon className="h-5 w-5 text-gray-600" />
          <div>
            <Label className="text-base font-medium">{limit.name}</Label>
            <p className="text-sm text-gray-600">{limit.description}</p>
          </div>
        </div>
        <Switch
          checked={limits[limitId] || false}
          onCheckedChange={(checked) => updateLimit(limitId, checked)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Subscription Limits & Features</span>
          </CardTitle>
          <CardDescription>
            Configure usage limits and feature availability for the <strong>{planName}</strong> subscription plan.
            These limits control what users can access and how much they can use.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Limit Categories */}
      {Object.entries(LIMIT_CATEGORIES).map(([categoryKey, category]) => {
        const categoryLimits = Object.entries(SUBSCRIPTION_LIMITS).filter(
          ([, limit]) => limit.category === categoryKey
        );

        if (categoryLimits.length === 0) return null;

        return (
          <Card key={categoryKey}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <category.icon className="h-5 w-5 text-gray-600" />
                <span>{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryLimits.length} limits
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categoryLimits.map(([limitId, limit]) => (
                  <div key={limitId}>
                    {limit.type === "number" 
                      ? renderNumberLimit(limitId, limit)
                      : renderBooleanLimit(limitId, limit)
                    }
                    {limitId !== categoryLimits[categoryLimits.length - 1][0] && (
                      <Separator />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Limits Summary</CardTitle>
          <CardDescription>Overview of all configured limits for this plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(limits).map(([limitId, value]) => {
              const limit = SUBSCRIPTION_LIMITS[limitId as keyof typeof SUBSCRIPTION_LIMITS];
              if (!limit) return null;

              return (
                <div key={limitId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <limit.icon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">{limit.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {limit.type === "boolean" 
                      ? (value ? "Enabled" : "Disabled")
                      : (value === -1 ? "Unlimited" : `${value} ${(limit as any).unit || ""}`)
                    }
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> These limits are enforced at the application level. Users will receive 
          appropriate notifications when approaching or exceeding their plan limits. 
          Unlimited options should be used carefully for enterprise plans only.
        </AlertDescription>
      </Alert>
    </div>
  );
}