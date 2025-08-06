import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Edit, Trash2, MoreHorizontal, Eye, Star, DollarSign,
  Percent, Users, Package, Calendar, AlertCircle, CheckCircle,
  Target, TrendingUp, Award, Zap, Clock, Shield, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PricingRule {
  id: number;
  name: string;
  description: string;
  ruleType: "volume_discount" | "customer_tier" | "date_range" | "product_bundle";
  customerId?: number;
  customerName?: string;
  productId?: number;
  productName?: string;
  minimumQuantity?: number;
  maximumQuantity?: number;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  startDate?: string;
  endDate?: string;
  priority: number;
  requiresApproval: boolean;
  approvalLimit?: number;
  isActive: boolean;
  usageCount: number;
  totalSavings: number;
}

interface PricingTier {
  id: number;
  tierName: string;
  description: string;
  minimumValue: number;
  discountRate: number;
  customerCount: number;
}

interface PriceListCustomer {
  id: number;
  customerId: number;
  customerName: string;
  priceListName: string;
  discountRate: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
}

export default function DynamicPricingRules() {
  const [selectedTab, setSelectedTab] = useState("rules");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [ruleTypeFilter, setRuleTypeFilter] = useState<string>("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pricing rules
  const { data: pricingRules = [], isLoading } = useQuery<PricingRule[]>({
    queryKey: ["/api/pricing-rules"],
  });

  // Fetch pricing tiers
  const { data: pricingTiers = [], isLoading: tiersLoading } = useQuery<PricingTier[]>({
    queryKey: ["/api/customer-price-tiers"],
  });

  // Fetch customer price lists
  const { data: customerPriceLists = [], isLoading: priceListsLoading } = useQuery<PriceListCustomer[]>({
    queryKey: ["/api/customer-price-lists"],
  });

  // Fetch pricing statistics
  const { data: pricingStats = {} } = useQuery({
    queryKey: ["/api/pricing-rules/stats"],
  });

  // Toggle rule active status
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: number; isActive: boolean }) => {
      return await apiRequest(`/api/pricing-rules/${ruleId}`, "PATCH", { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-rules"] });
      toast({
        title: "Success",
        description: "Pricing rule updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing rule",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const getRuleTypeIcon = (ruleType: string) => {
    switch (ruleType) {
      case "volume_discount": return <Package className="h-4 w-4" />;
      case "customer_tier": return <Users className="h-4 w-4" />;
      case "date_range": return <Calendar className="h-4 w-4" />;
      case "product_bundle": return <Target className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getRuleTypeColor = (ruleType: string) => {
    switch (ruleType) {
      case "volume_discount": return "bg-blue-100 text-blue-800 border-blue-200";
      case "customer_tier": return "bg-purple-100 text-purple-800 border-purple-200";
      case "date_range": return "bg-green-100 text-green-800 border-green-200";
      case "product_bundle": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-800 border-red-200";
    if (priority >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const filteredRules = pricingRules.filter(rule => 
    ruleTypeFilter === "all" || rule.ruleType === ruleTypeFilter
  );

  return (
    <div className="p-6 space-y-6">
      {/* Dynamic Pricing Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
        
        <div className="relative p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white tracking-tight">Dynamic Pricing Rules</h1>
              <p className="text-orange-100 text-lg font-medium">Automated pricing optimization and intelligent discount management</p>
              
              {/* Pricing Performance Metrics */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">{formatCurrency(pricingStats.totalSavings || 0)}</span>
                  <span className="text-sm opacity-90">Total Savings</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">{pricingStats.activeRules || 0}</span>
                  <span className="text-sm opacity-90">Active Rules</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">{pricingStats.averageDiscount || 0}%</span>
                  <span className="text-sm opacity-90">Avg Discount</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                onClick={() => setShowTierModal(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Tiers
              </Button>
              <Button 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                onClick={() => setShowRuleModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Rules</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pricingStats.volumeRules || 0}</div>
            <p className="text-xs text-muted-foreground">Quantity-based discounts</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Tiers</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{pricingTiers.length}</div>
            <p className="text-xs text-muted-foreground">Loyalty-based pricing</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seasonal Rules</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pricingStats.seasonalRules || 0}</div>
            <p className="text-xs text-muted-foreground">Time-limited offers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bundle Deals</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pricingStats.bundleRules || 0}</div>
            <p className="text-xs text-muted-foreground">Product combinations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Pricing Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pricing Rules
          </TabsTrigger>
          <TabsTrigger value="tiers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Tiers
          </TabsTrigger>
          <TabsTrigger value="pricelists" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Lists
          </TabsTrigger>
        </TabsList>

        {/* Pricing Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <Select value={ruleTypeFilter} onValueChange={setRuleTypeFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by rule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rule Types</SelectItem>
                <SelectItem value="volume_discount">Volume Discounts</SelectItem>
                <SelectItem value="customer_tier">Customer Tiers</SelectItem>
                <SelectItem value="date_range">Seasonal Rules</SelectItem>
                <SelectItem value="product_bundle">Bundle Deals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-orange-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getRuleTypeIcon(rule.ruleType)}
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                      </div>
                      <CardDescription>{rule.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => 
                          toggleRuleMutation.mutate({ ruleId: rule.id, isActive: checked })
                        }
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Rule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rule Type and Priority */}
                  <div className="flex items-center gap-2">
                    <Badge className={getRuleTypeColor(rule.ruleType)}>
                      {rule.ruleType.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(rule.priority)} variant="outline">
                      Priority {rule.priority}
                    </Badge>
                    {rule.requiresApproval && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Approval Required
                      </Badge>
                    )}
                  </div>

                  {/* Discount Details */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        {rule.discountType === "percentage" ? (
                          <Percent className="h-4 w-4 text-green-500" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="font-semibold text-green-600">
                        {rule.discountType === "percentage" 
                          ? `${rule.discountValue}%` 
                          : formatCurrency(rule.discountValue)
                        }
                      </div>
                      <div className="text-xs text-gray-600">Discount</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="font-semibold text-blue-600">{rule.usageCount}</div>
                      <div className="text-xs text-gray-600">Times Used</div>
                    </div>
                  </div>

                  {/* Rule Criteria */}
                  <div className="space-y-2 text-sm">
                    {rule.customerName && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium">{rule.customerName}</span>
                      </div>
                    )}
                    
                    {rule.productName && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Product:</span>
                        <span className="font-medium">{rule.productName}</span>
                      </div>
                    )}
                    
                    {rule.minimumQuantity && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Min Qty:</span>
                        <span className="font-medium">{rule.minimumQuantity}</span>
                      </div>
                    )}
                  </div>

                  {/* Rule Performance */}
                  {rule.totalSavings > 0 && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Total Customer Savings</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(rule.totalSavings)}
                      </span>
                    </div>
                  )}

                  {/* Rule Validity */}
                  {rule.startDate && rule.endDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 border-t pt-3">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Valid: {new Date(rule.startDate).toLocaleDateString()} - {new Date(rule.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRules.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No pricing rules found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first pricing rule to start offering dynamic discounts.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowRuleModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pricing Rule
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Customer Tiers Tab */}
        <TabsContent value="tiers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card key={tier.id} className="hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      {tier.tierName}
                    </CardTitle>
                    <Badge className="bg-purple-100 text-purple-800">
                      {tier.discountRate}% Off
                    </Badge>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Minimum Spend</span>
                      <span className="font-semibold">{formatCurrency(tier.minimumValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customers</span>
                      <Badge variant="outline">{tier.customerCount}</Badge>
                    </div>
                  </div>

                  <Progress value={(tier.customerCount / 100) * 100} className="h-2" />

                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Manage Tier
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Add New Tier Card */}
            <Card 
              className="border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200 cursor-pointer"
              onClick={() => setShowTierModal(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <Plus className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Create New Tier</h3>
                <p className="text-sm text-gray-500 text-center">
                  Add a new customer loyalty tier with special pricing
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Price Lists Tab */}
        <TabsContent value="pricelists" className="space-y-6">
          <div className="space-y-4">
            {customerPriceLists.map((priceList) => (
              <Card key={priceList.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold">{priceList.customerName}</div>
                      <div className="text-sm text-gray-600">{priceList.priceListName}</div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">
                          {priceList.discountRate}% Discount
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          Valid until {priceList.validUntil ? new Date(priceList.validUntil).toLocaleDateString() : 'Indefinite'}
                        </div>
                      </div>
                      
                      <Switch checked={priceList.isActive} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}