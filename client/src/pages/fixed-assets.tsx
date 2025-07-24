import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Calculator, Building2, TrendingDown, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";

interface FixedAsset {
  id: number;
  assetName: string;
  assetCode: string;
  category: string;
  description?: string;
  purchaseDate: string;
  purchasePrice: string;
  currentValue: string;
  depreciationMethod: string;
  usefulLife: number;
  residualValue: string;
  location?: string;
  supplier?: string;
  serialNumber?: string;
  warrantyExpiry?: string;
  status: string;
  disposalDate?: string;
  disposalValue?: string;
}

interface DepreciationRecord {
  id: number;
  period: string;
  depreciationAmount: string;
  accumulatedDepreciation: string;
  bookValue: string;
}

export default function FixedAssets() {
  const [activeTab, setActiveTab] = useState("assets");
  const { toast } = useToast();

  // Fetch fixed assets
  const { data: assets = [], isLoading: assetsLoading } = useQuery<FixedAsset[]>({
    queryKey: ["/api/fixed-assets"],
  });

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/fixed-assets/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-assets"] });
      toast({ title: "Success", description: "Fixed asset deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete fixed asset", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "disposed": return "bg-red-100 text-red-800";
      case "sold": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalAssetValue = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
  const activeAssets = assets.filter(asset => asset.status === "active").length;

  if (assetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fixed Assets Management</h1>
          <p className="text-gray-600 mt-1">Manage your company's fixed assets and depreciation</p>
        </div>
        <Link href="/fixed-assets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asset Value</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssetValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depreciation</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assets">Asset Register</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fixed Assets Register</CardTitle>
              <CardDescription>Complete list of all company fixed assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Fixed Assets</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first fixed asset</p>
                    <Link href="/fixed-assets/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Asset
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Asset Name</th>
                          <th className="text-left py-3 px-4 font-medium">Code</th>
                          <th className="text-left py-3 px-4 font-medium">Category</th>
                          <th className="text-left py-3 px-4 font-medium">Purchase Date</th>
                          <th className="text-left py-3 px-4 font-medium">Purchase Price</th>
                          <th className="text-left py-3 px-4 font-medium">Current Value</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((asset) => (
                          <tr key={asset.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{asset.assetName}</div>
                                {asset.description && (
                                  <div className="text-sm text-gray-600">{asset.description}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">{asset.assetCode}</td>
                            <td className="py-3 px-4 text-sm">{asset.category}</td>
                            <td className="py-3 px-4 text-sm">{formatDate(asset.purchaseDate)}</td>
                            <td className="py-3 px-4 text-sm">{formatCurrency(parseFloat(asset.purchasePrice))}</td>
                            <td className="py-3 px-4 text-sm">{formatCurrency(parseFloat(asset.currentValue))}</td>
                            <td className="py-3 px-4">
                              <Badge className={`capitalize ${getStatusColor(asset.status)}`}>
                                {asset.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Link href={`/fixed-assets/${asset.id}/edit`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteAssetMutation.mutate(asset.id)}
                                  disabled={deleteAssetMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Schedule</CardTitle>
              <CardDescription>View depreciation calculations for all assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Depreciation Reports</h3>
                <p className="text-gray-600 mb-4">Automated depreciation calculations and schedules</p>
                <Button>Generate Depreciation Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Categories</CardTitle>
              <CardDescription>Manage asset categories and depreciation settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Asset Categories</h3>
                <p className="text-gray-600 mb-4">Organize assets by category for better management</p>
                <Button>Manage Categories</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}