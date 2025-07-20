import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { VatStatusToggle } from "@/components/vat-management/vat-status-toggle";
import { 
  FileText, 
  BarChart3, 
  Settings, 
  Calculator, 
  Shield, 
  CheckCircle2,
  Circle,
  Info,
  DollarSign,
  TrendingUp,
  Calendar,
  Archive,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";

interface VatType {
  id: number;
  code: string;
  name: string;
  rate: string;
  description: string;
  isActive: boolean;
  isSystemType: boolean;
  category: string;
}

export default function VatManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMenu, setSelectedMenu] = useState("transaction-types");

  // Mock company ID - in real app this would come from context
  const companyId = 4;

  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  const { data: vatTypes } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-types"],
    enabled: !!vatSettings?.isVatRegistered,
  });

  const seedVatTypesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/vat-types/seed", {});
    },
    onSuccess: () => {
      toast({
        title: "VAT Types Seeded",
        description: "Default South African VAT types have been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "vat-types"] });
    },
  });

  const toggleVatTypeMutation = useMutation({
    mutationFn: async ({ vatTypeId, isActive }: { vatTypeId: number; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/companies/${companyId}/vat-types/${vatTypeId}`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "VAT Type Updated",
        description: "VAT type status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "vat-types"] });
    },
  });

  const menuItems = [
    { id: "vat201-returns", label: "VAT201 Returns", icon: FileText, disabled: !vatSettings?.isVatRegistered },
    { id: "vat-reports", label: "VAT Reports", icon: BarChart3, disabled: !vatSettings?.isVatRegistered },
    { id: "vat-summary", label: "VAT Summary Report", icon: TrendingUp, disabled: !vatSettings?.isVatRegistered },
    { id: "vat-detailed", label: "VAT Detailed Report", icon: Archive, disabled: !vatSettings?.isVatRegistered },
    { id: "vat-module", label: "VAT Module", icon: Calculator, disabled: false },
    { id: "transaction-types", label: "VAT Transaction Types", icon: Settings, disabled: false },
    { id: "sars-compliance", label: "SARS Compliance", icon: Shield, disabled: !vatSettings?.isVatRegistered },
    { id: "cipc-compliance", label: "CIPC Compliance", icon: Shield, disabled: false },
  ];

  const vatTypeCategories = [
    {
      title: "VAT Inclusive",
      description: "VAT is included in the price. Amount = Price × 1.15, VAT = Amount × 0.15",
      example: "Example: R115 includes R15 VAT on R100",
      color: "blue",
      types: ["STD"]
    },
    {
      title: "VAT Exclusive",
      description: "VAT is added to the price. VAT = Amount × 0.15, Total = Amount + VAT",
      example: "Example: R100 + R15 VAT = R115 total",
      color: "green",
      types: ["STD"]
    },
    {
      title: "Zero Rated",
      description: "VAT rate is 0% but input VAT can still be claimed. Common for exports.",
      example: "Example: Export sales at 0% VAT",
      color: "orange",
      types: ["ZER"]
    },
    {
      title: "Exempt",
      description: "No VAT is charged and no input VAT can be claimed. Common for financial services.",
      example: "Example: Bank fees, insurance premiums",
      color: "purple",
      types: ["EXE"]
    },
    {
      title: "No VAT",
      description: "No VAT is charged on the transaction. Used for non-VAT registered entities.",
      example: "Example: R100 with no additional VAT",
      color: "gray",
      types: ["NR", "OUT"]
    }
  ];

  const renderTransactionTypes = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">VAT Transaction Types</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure and manage VAT calculation methods for your business</p>
      </div>

      {!vatSettings?.isVatRegistered && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">VAT Registration Required</h3>
                <p className="text-sm text-yellow-700">Enable VAT registration in settings to access all VAT features and types.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {vatTypeCategories.map((category, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className={`bg-${category.color}-50 border-b border-${category.color}-200`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Circle className={`h-4 w-4 text-${category.color}-600 fill-current`} />
                  <CardTitle className={`text-${category.color}-800`}>{category.title}</CardTitle>
                  {!vatSettings?.isVatRegistered && category.types.includes("STD") && (
                    <Badge variant="outline" className="text-gray-500">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                  {vatSettings?.isVatRegistered && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Active
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {category.types.map(type => (
                    <Badge key={type} variant="secondary" className="font-mono">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">{category.description}</p>
              <p className={`text-sm text-${category.color}-600 font-medium`}>{category.example}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Available VAT Types
          </CardTitle>
          <CardDescription>
            South African standard VAT types for your business transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!vatSettings?.isVatRegistered ? (
            <div className="text-center py-8 text-gray-500">
              <EyeOff className="mx-auto h-12 w-12 mb-3" />
              <p>VAT types are only available for VAT-registered companies.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Manage active VAT types for your company</span>
                <Button 
                  onClick={() => seedVatTypesMutation.mutate()}
                  disabled={seedVatTypesMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  Seed Default Types
                </Button>
              </div>
              
              {vatTypes?.map((vatType: VatType) => (
                <div key={vatType.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono w-12 justify-center">
                      {vatType.code}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{vatType.name}</h4>
                      <p className="text-sm text-gray-600">{vatType.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{vatType.rate}%</Badge>
                    {vatType.isSystemType ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    ) : (
                      <Switch 
                        checked={vatType.isActive}
                        onCheckedChange={(checked) => 
                          toggleVatTypeMutation.mutate({ vatTypeId: vatType.id, isActive: checked })
                        }
                        disabled={toggleVatTypeMutation.isPending}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderVATModule = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">VAT Module Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure your company's VAT registration and compliance settings</p>
      </div>

      <VatStatusToggle 
        companyId={companyId}
        initialSettings={vatSettings || {
          isVatRegistered: false,
          vatNumber: "",
          vatRegistrationDate: undefined,
          vatPeriodMonths: 2,
          vatSubmissionDay: 25
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            VAT Treatment Guide
          </CardTitle>
          <CardDescription>
            Understanding different VAT calculation methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">For VAT Registered Companies</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">Standard Rate (15%)</h4>
                  <p className="text-sm text-green-700">Most goods and services</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">Zero-Rated (0%)</h4>
                  <p className="text-sm text-blue-700">Exports, basic foodstuffs</p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800">Exempt (0%)</h4>
                  <p className="text-sm text-purple-700">Financial services, rent</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">For Non-VAT Companies</h3>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="h-4 w-4 text-gray-500" />
                  <h4 className="font-medium text-gray-800">VAT Not Applicable</h4>
                </div>
                <p className="text-sm text-gray-600">
                  All VAT fields are automatically hidden from invoices, reports, and transactions. 
                  No VAT calculations are performed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComingSoon = (title: string) => (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">Advanced VAT features and reporting</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {title} functionality will be available in the next update. This will include:
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Automated VAT calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">SARS-compliant reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">VAT201 form generation</span>
                </div>
              </div>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Period-based calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Audit trail integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Export capabilities</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (selectedMenu) {
      case "transaction-types":
        return renderTransactionTypes();
      case "vat-module":
        return renderVATModule();
      case "vat201-returns":
        return renderComingSoon("VAT201 Returns");
      case "vat-reports":
        return renderComingSoon("VAT Reports");
      case "vat-summary":
        return renderComingSoon("VAT Summary Report");
      case "vat-detailed":
        return renderComingSoon("VAT Detailed Report");
      case "sars-compliance":
        return renderComingSoon("SARS Compliance");
      case "cipc-compliance":
        return renderComingSoon("CIPC Compliance");
      default:
        return renderTransactionTypes();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-blue-600 dark:text-blue-400">VAT Management</h1>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedMenu(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedMenu === item.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : item.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-left">{item.label}</span>
                {item.disabled && !vatSettings?.isVatRegistered && (
                  <EyeOff className="h-3 w-3 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}