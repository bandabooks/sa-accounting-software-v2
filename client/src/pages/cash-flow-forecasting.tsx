import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, TrendingUp, TrendingDown, Activity, Calendar, DollarSign, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

interface CashFlowForecast {
  id: number;
  name: string;
  description?: string;
  forecastType: string;
  startDate: string;
  endDate: string;
  basedOnHistorical: boolean;
  historicalMonths: number;
  confidence: string;
  createdBy: number;
  createdAt: string;
  lines?: CashFlowForecastLine[];
}

interface CashFlowForecastLine {
  id: number;
  period: string;
  category: string;
  subcategory: string;
  description?: string;
  forecastAmount: string;
  actualAmount: string;
  variance: string;
  probability: string;
}

interface CashFlowProjection {
  period: string;
  inflowProjection: number;
  outflowProjection: number;
  netProjection: number;
  confidence: string;
}

export default function CashFlowForecasting() {
  const [activeTab, setActiveTab] = useState("forecasts");
  const [selectedMonths, setSelectedMonths] = useState("12");
  const { toast } = useToast();

  // Fetch cash flow forecasts
  const { data: forecasts = [], isLoading: forecastsLoading } = useQuery<CashFlowForecast[]>({
    queryKey: ["/api/cash-flow-forecasts"],
  });

  // Fetch cash flow projections
  const { data: projections = [], isLoading: projectionsLoading } = useQuery<CashFlowProjection[]>({
    queryKey: ["/api/cash-flow-projections", selectedMonths],
  });

  // Use loading states for comprehensive loading feedback
  useLoadingStates({
    loadingStates: [
      { isLoading: forecastsLoading, message: 'Loading cash flow forecasts...' },
      { isLoading: projectionsLoading, message: 'Loading financial projections...' },
    ],
    progressSteps: ['Fetching forecast data', 'Processing financial projections', 'Calculating trends'],
  });

  if (forecastsLoading || projectionsLoading) {
    return <PageLoader message="Loading cash flow forecasting..." />;
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getForecastTypeColor = (type: string) => {
    switch (type) {
      case "weekly": return "bg-blue-100 text-blue-800";
      case "monthly": return "bg-green-100 text-green-800";
      case "quarterly": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalForecasts = forecasts.length;
  const activeForecasts = forecasts.filter(forecast => 
    new Date(forecast.endDate) > new Date()
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Flow Forecasting</h1>
          <p className="text-gray-600 mt-1">Predict and plan your future cash flows with confidence</p>
        </div>
        <Link href="/cash-flow-forecasts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Forecast
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forecasts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalForecasts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forecasts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeForecasts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Month Projection</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projections.length > 0 ? formatCurrency(projections[0]?.netProjection || 0) : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="forecasts">Cash Flow Forecasts</TabsTrigger>
          <TabsTrigger value="projections">Automated Projections</TabsTrigger>
          <TabsTrigger value="analysis">Variance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Forecasts</CardTitle>
              <CardDescription>Create and manage detailed cash flow forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecasts.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Cash Flow Forecasts</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first cash flow forecast</p>
                    <Link href="/cash-flow-forecasts/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Forecast
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {forecasts.map((forecast) => (
                      <Card key={forecast.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{forecast.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {forecast.description}
                              </CardDescription>
                            </div>
                            <div className="flex space-x-1">
                              <Badge className={`capitalize ${getConfidenceColor(forecast.confidence)}`}>
                                {forecast.confidence}
                              </Badge>
                              <Badge className={`capitalize ${getForecastTypeColor(forecast.forecastType)}`}>
                                {forecast.forecastType}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Period:</span>
                              <span>{formatDate(forecast.startDate)} - {formatDate(forecast.endDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Historical Data:</span>
                              <span>{forecast.basedOnHistorical ? `${forecast.historicalMonths} months` : "Manual"}</span>
                            </div>
                            <div className="flex justify-between pt-2">
                              <Link href={`/cash-flow-forecasts/${forecast.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm">
                                Generate Report
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Automated Cash Flow Projections</CardTitle>
                  <CardDescription>AI-powered projections based on historical data</CardDescription>
                </div>
                <Select value={selectedMonths} onValueChange={setSelectedMonths}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Projection period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {projectionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : projections.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Projection Data</h3>
                  <p className="text-gray-600 mb-4">Insufficient historical data for projections</p>
                  <Button>Analyze Historical Data</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Period</th>
                        <th className="text-left py-3 px-4 font-medium">Projected Inflow</th>
                        <th className="text-left py-3 px-4 font-medium">Projected Outflow</th>
                        <th className="text-left py-3 px-4 font-medium">Net Cash Flow</th>
                        <th className="text-left py-3 px-4 font-medium">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projections.map((projection, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">{projection.period}</td>
                          <td className="py-3 px-4 text-sm text-green-600">
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              {formatCurrency(projection.inflowProjection)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-red-600">
                            <div className="flex items-center">
                              <TrendingDown className="h-4 w-4 mr-1" />
                              {formatCurrency(projection.outflowProjection)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={projection.netProjection >= 0 ? "text-green-600" : "text-red-600"}>
                              {formatCurrency(projection.netProjection)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`capitalize ${getConfidenceColor(projection.confidence)}`}>
                              {projection.confidence}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forecast Variance Analysis</CardTitle>
              <CardDescription>Compare forecasted vs actual cash flows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Variance Analysis</h3>
                <p className="text-gray-600 mb-4">Track accuracy of your cash flow predictions</p>
                <Button>Generate Analysis Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}