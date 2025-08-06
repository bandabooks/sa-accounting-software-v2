import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  TrendingUp, Target, Calendar, BarChart3, PieChart, LineChart,
  DollarSign, Percent, Users, Award, AlertCircle, CheckCircle,
  Plus, Edit, Trash2, Eye, Filter, Download, RefreshCw,
  Activity, Zap, Clock, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ForecastData {
  id: number;
  forecastName: string;
  period: "monthly" | "quarterly" | "yearly";
  startDate: string;
  endDate: string;
  targetRevenue: number;
  forecastedRevenue: number;
  actualRevenue: number;
  confidence: number;
  methodology: "pipeline" | "historical" | "weighted";
  notes?: string;
  isActive: boolean;
}

interface PipelineData {
  stageId: number;
  stageName: string;
  opportunityCount: number;
  totalValue: number;
  weightedValue: number;
  probability: number;
  averageDealSize: number;
}

interface ForecastAccuracy {
  period: string;
  forecasted: number;
  actual: number;
  accuracy: number;
  variance: number;
}

export default function SalesForecastingDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedMethodology, setSelectedMethodology] = useState("pipeline");
  const [showCreateForecastModal, setShowCreateForecastModal] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<ForecastData | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active forecasts
  const { data: forecasts = [], isLoading } = useQuery<ForecastData[]>({
    queryKey: ["/api/sales-forecasts", selectedPeriod],
  });

  // Fetch pipeline data for forecasting
  const { data: pipelineData = [], isLoading: pipelineLoading } = useQuery<PipelineData[]>({
    queryKey: ["/api/sales-pipeline/forecast-data"],
  });

  // Fetch forecast accuracy history
  const { data: accuracyHistory = [], isLoading: accuracyLoading } = useQuery<ForecastAccuracy[]>({
    queryKey: ["/api/sales-forecasts/accuracy-history"],
  });

  // Fetch forecast statistics
  const { data: forecastStats = {} } = useQuery({
    queryKey: ["/api/sales-forecasts/stats"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600";
    if (variance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <ArrowUp className="h-4 w-4" />;
    if (variance < 0) return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return { label: "High", color: "text-green-600", bg: "bg-green-100" };
    if (confidence >= 60) return { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "Low", color: "text-red-600", bg: "bg-red-100" };
  };

  const getMethodologyIcon = (methodology: string) => {
    switch (methodology) {
      case "pipeline": return <BarChart3 className="h-4 w-4" />;
      case "historical": return <LineChart className="h-4 w-4" />;
      case "weighted": return <PieChart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Sales Forecasting Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
        
        <div className="relative p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white tracking-tight">Sales Forecasting</h1>
              <p className="text-blue-100 text-lg font-medium">Predictive analytics and intelligent revenue projections</p>
              
              {/* Key Forecast Metrics */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">{formatCurrency(forecastStats.totalPipeline || 0)}</span>
                  <span className="text-sm opacity-90">Pipeline Value</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">{forecastStats.forecastAccuracy || 0}%</span>
                  <span className="text-sm opacity-90">Accuracy</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">{forecastStats.confidenceScore || 0}%</span>
                  <span className="text-sm opacity-90">Confidence</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-white/20 backdrop-blur-sm text-white border border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                onClick={() => setShowCreateForecastModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Forecast
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Forecast</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(forecastStats.currentForecast || 0)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <div className={`flex items-center gap-1 ${getVarianceColor(forecastStats.forecastVariance || 0)}`}>
                {getVarianceIcon(forecastStats.forecastVariance || 0)}
                <span>{Math.abs(forecastStats.forecastVariance || 0)}%</span>
              </div>
              <span className="ml-2">vs target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievement Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{forecastStats.achievementRate || 0}%</div>
            <Progress value={forecastStats.achievementRate || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Pipeline</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(forecastStats.weightedPipeline || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Probability-adjusted value</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Cycle</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{forecastStats.averageDealCycle || 0} days</div>
            <p className="text-xs text-muted-foreground">From opportunity to close</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Forecasting Content */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Forecasts</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy History</TabsTrigger>
        </TabsList>

        {/* Current Forecasts Tab */}
        <TabsContent value="current" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {forecasts.map((forecast) => {
              const confidenceLevel = getConfidenceLevel(forecast.confidence);
              const achievementRate = forecast.actualRevenue / forecast.targetRevenue * 100;
              const variance = ((forecast.actualRevenue - forecast.forecastedRevenue) / forecast.forecastedRevenue) * 100;
              
              return (
                <Card key={forecast.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getMethodologyIcon(forecast.methodology)}
                          {forecast.forecastName}
                        </CardTitle>
                        <CardDescription className="capitalize">
                          {forecast.period} forecast • {forecast.methodology} methodology
                        </CardDescription>
                      </div>
                      <Badge className={`${confidenceLevel.bg} ${confidenceLevel.color}`}>
                        {confidenceLevel.label} Confidence
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Forecast Values */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">Target</div>
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(forecast.targetRevenue)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">Forecasted</div>
                        <div className="font-semibold text-blue-600">
                          {formatCurrency(forecast.forecastedRevenue)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">Actual</div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(forecast.actualRevenue)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Achievement Rate</span>
                          <span className="text-sm font-medium">{achievementRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={achievementRate} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Confidence Level</span>
                          <span className="text-sm font-medium">{forecast.confidence}%</span>
                        </div>
                        <Progress value={forecast.confidence} className="h-2" />
                      </div>
                    </div>

                    {/* Forecast Accuracy */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Forecast Accuracy</span>
                      </div>
                      <div className={`flex items-center gap-1 font-semibold ${getVarianceColor(variance)}`}>
                        {getVarianceIcon(variance)}
                        <span>{Math.abs(variance).toFixed(1)}% {variance >= 0 ? 'over' : 'under'}</span>
                      </div>
                    </div>

                    {/* Forecast Period */}
                    <div className="text-sm text-gray-600 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(forecast.startDate).toLocaleDateString()} - {new Date(forecast.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {forecasts.length === 0 && (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No forecasts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first sales forecast to start predicting revenue.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateForecastModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Forecast
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Pipeline Analysis Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Pipeline Forecast Analysis
              </CardTitle>
              <CardDescription>
                Revenue projections based on current sales pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineData.map((stage) => (
                  <div key={stage.stageId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="space-y-1">
                      <div className="font-medium">{stage.stageName}</div>
                      <div className="text-sm text-gray-600">
                        {stage.opportunityCount} opportunities • {stage.probability}% win rate
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(stage.totalValue)}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {formatCurrency(stage.weightedValue)} weighted
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accuracy History Tab */}
        <TabsContent value="accuracy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Forecast Accuracy History
              </CardTitle>
              <CardDescription>
                Historical performance of sales forecasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accuracyHistory.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{record.period}</div>
                      <div className="text-sm text-gray-600">
                        Forecasted: {formatCurrency(record.forecasted)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Actual: {formatCurrency(record.actual)}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge 
                        className={
                          record.accuracy >= 90 
                            ? "bg-green-100 text-green-800" 
                            : record.accuracy >= 75 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {record.accuracy.toFixed(1)}% Accurate
                      </Badge>
                      <div className={`text-sm font-medium ${getVarianceColor(record.variance)}`}>
                        {record.variance > 0 ? '+' : ''}{record.variance.toFixed(1)}% variance
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}