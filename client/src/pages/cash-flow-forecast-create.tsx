import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Save, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CashFlowForecastFormData {
  name: string;
  description?: string;
  forecastType: string;
  startDate: string;
  endDate: string;
  basedOnHistorical: boolean;
  historicalMonths: number;
  confidence: string;
}

export default function CashFlowForecastCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CashFlowForecastFormData>({
    name: "",
    description: "",
    forecastType: "monthly",
    startDate: "",
    endDate: "",
    basedOnHistorical: true,
    historicalMonths: 12,
    confidence: "medium"
  });

  // Create cash flow forecast mutation
  const createForecastMutation = useMutation({
    mutationFn: (data: CashFlowForecastFormData) => apiRequest("/api/cash-flow-forecasts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-flow-forecasts"] });
      toast({ title: "Success", description: "Cash flow forecast created successfully" });
      setLocation("/cash-flow-forecasting");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create cash flow forecast", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createForecastMutation.mutate(formData);
  };

  const handleChange = (field: keyof CashFlowForecastFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const forecastTypes = [
    { value: "weekly", label: "Weekly Forecast" },
    { value: "monthly", label: "Monthly Forecast" },
    { value: "quarterly", label: "Quarterly Forecast" },
    { value: "rolling", label: "Rolling Forecast" }
  ];

  const confidenceLevels = [
    { value: "high", label: "High Confidence (80-95%)" },
    { value: "medium", label: "Medium Confidence (60-79%)" },
    { value: "low", label: "Low Confidence (Below 60%)" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => setLocation("/cash-flow-forecasting")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cash Flow Forecasting
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Cash Flow Forecast</h1>
          <p className="text-gray-600 mt-1">Set up a new cash flow forecast for financial planning</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Forecast Information
            </CardTitle>
            <CardDescription>Basic details about the cash flow forecast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Forecast Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Q1 2025 Cash Flow Forecast"
                  required
                />
              </div>
              <div>
                <Label htmlFor="forecastType">Forecast Type</Label>
                <Select value={formData.forecastType} onValueChange={(value) => handleChange("forecastType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select forecast type" />
                  </SelectTrigger>
                  <SelectContent>
                    {forecastTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
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
                placeholder="Describe the purpose and scope of this forecast"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecast Period</CardTitle>
            <CardDescription>Set the time period for the forecast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Historical Data Settings
            </CardTitle>
            <CardDescription>Configure how historical data is used for forecasting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="basedOnHistorical"
                checked={formData.basedOnHistorical}
                onCheckedChange={(checked) => handleChange("basedOnHistorical", checked as boolean)}
              />
              <Label htmlFor="basedOnHistorical">
                Base forecast on historical data
              </Label>
            </div>

            {formData.basedOnHistorical && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="historicalMonths">Historical Months</Label>
                  <Input
                    id="historicalMonths"
                    type="number"
                    min="3"
                    max="36"
                    value={formData.historicalMonths}
                    onChange={(e) => handleChange("historicalMonths", parseInt(e.target.value) || 12)}
                    placeholder="12"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Number of historical months to analyze (3-36 months)
                  </p>
                </div>
                <div>
                  <Label htmlFor="confidence">Confidence Level</Label>
                  <Select value={formData.confidence} onValueChange={(value) => handleChange("confidence", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select confidence level" />
                    </SelectTrigger>
                    <SelectContent>
                      {confidenceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
          <p className="text-blue-800 text-sm">
            After creating the forecast, you'll be able to add detailed line items for cash inflows and outflows, 
            review projections, and adjust parameters based on your business requirements.
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => setLocation("/cash-flow-forecasting")}>
            Cancel
          </Button>
          <Button type="submit" disabled={createForecastMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createForecastMutation.isPending ? "Creating..." : "Create Forecast"}
          </Button>
        </div>
      </form>
    </div>
  );
}