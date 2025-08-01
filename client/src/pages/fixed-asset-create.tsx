import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface FixedAssetFormData {
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
}

export default function FixedAssetCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FixedAssetFormData>({
    assetName: "",
    assetCode: "",
    category: "",
    description: "",
    purchaseDate: "",
    purchasePrice: "",
    currentValue: "",
    depreciationMethod: "straight_line",
    usefulLife: 5,
    residualValue: "0.00",
    location: "",
    supplier: "",
    serialNumber: "",
    warrantyExpiry: "",
    status: "active"
  });

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: (data: FixedAssetFormData) => apiRequest("/api/fixed-assets", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-assets"] });
      toast({ title: "Success", description: "Fixed asset created successfully" });
      setLocation("/fixed-assets");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create fixed asset", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.assetName || !formData.assetCode || !formData.category || !formData.purchaseDate || !formData.purchasePrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Set current value to purchase price if not set
    const dataToSubmit = {
      ...formData,
      usefulLife: Number(formData.usefulLife),
      purchasePrice: Number(formData.purchasePrice).toFixed(2),
      currentValue: Number(formData.currentValue || formData.purchasePrice).toFixed(2),
      residualValue: Number(formData.residualValue || 0).toFixed(2)
    };

    createAssetMutation.mutate(dataToSubmit);
  };

  const handleChange = (field: keyof FixedAssetFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const assetCategories = [
    "Building",
    "Equipment",
    "Vehicle",
    "Furniture",
    "Computer Hardware",
    "Software",
    "Machinery",
    "Tools",
    "Land",
    "Other"
  ];

  const depreciationMethods = [
    { value: "straight_line", label: "Straight Line" },
    { value: "declining_balance", label: "Declining Balance" },
    { value: "units_of_production", label: "Units of Production" },
    { value: "sum_of_years", label: "Sum of Years Digits" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => setLocation("/fixed-assets")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fixed Assets
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Fixed Asset</h1>
          <p className="text-gray-600 mt-1">Enter the details for your new fixed asset</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Asset Information
            </CardTitle>
            <CardDescription>Basic details about the fixed asset</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assetName">Asset Name *</Label>
                <Input
                  id="assetName"
                  value={formData.assetName}
                  onChange={(e) => handleChange("assetName", e.target.value)}
                  placeholder="e.g., Office Building, Company Vehicle"
                  required
                />
              </div>
              <div>
                <Label htmlFor="assetCode">Asset Code *</Label>
                <Input
                  id="assetCode"
                  value={formData.assetCode}
                  onChange={(e) => handleChange("assetCode", e.target.value)}
                  placeholder="e.g., FA001, EQ002"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Additional details about the asset"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase & Financial Details</CardTitle>
            <CardDescription>Purchase information and financial details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchaseDate">Purchase Date *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleChange("purchaseDate", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleChange("supplier", e.target.value)}
                  placeholder="Supplier name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange("purchasePrice", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="currentValue">Current Value</Label>
                <Input
                  id="currentValue"
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(e) => handleChange("currentValue", e.target.value)}
                  placeholder="0.00 (defaults to purchase price)"
                />
              </div>
              <div>
                <Label htmlFor="residualValue">Residual Value</Label>
                <Input
                  id="residualValue"
                  type="number"
                  step="0.01"
                  value={formData.residualValue}
                  onChange={(e) => handleChange("residualValue", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Depreciation Settings</CardTitle>
            <CardDescription>Configure depreciation method and useful life</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                <Select 
                  value={formData.depreciationMethod} 
                  onValueChange={(value) => handleChange("depreciationMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {depreciationMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="usefulLife">Useful Life (Years)</Label>
                <Input
                  id="usefulLife"
                  type="number"
                  min="1"
                  value={formData.usefulLife}
                  onChange={(e) => handleChange("usefulLife", parseInt(e.target.value) || 1)}
                  placeholder="5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Location, serial number, and warranty information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Asset location"
                />
              </div>
              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange("serialNumber", e.target.value)}
                  placeholder="Serial or model number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => handleChange("warrantyExpiry", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => setLocation("/fixed-assets")}>
            Cancel
          </Button>
          <Button type="submit" disabled={createAssetMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createAssetMutation.isPending ? "Creating..." : "Create Asset"}
          </Button>
        </div>
      </form>
    </div>
  );
}