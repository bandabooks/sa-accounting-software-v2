import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Users, Plus, Filter, Search, Settings, Trash2, Edit,
  Target, TrendingUp, DollarSign, Calendar, MapPin,
  CheckCircle, Clock, AlertCircle, Building, Briefcase
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

interface CustomerSegment {
  id: number;
  name: string;
  description: string;
  criteria: {
    rules: Array<{
      field: string;
      operator: string;
      value: any;
      logic?: 'AND' | 'OR';
    }>;
    conditions: 'all' | 'any';
  };
  color: string;
  isActive: boolean;
  autoUpdate: boolean;
  memberCount: number;
  lastUpdated: string;
  createdBy: number;
  customers?: any[];
}

const SEGMENT_COLORS = [
  { value: "#3B82F6", label: "Blue", preview: "bg-blue-100 text-blue-800" },
  { value: "#10B981", label: "Green", preview: "bg-green-100 text-green-800" },
  { value: "#F59E0B", label: "Yellow", preview: "bg-yellow-100 text-yellow-800" },
  { value: "#EF4444", label: "Red", preview: "bg-red-100 text-red-800" },
  { value: "#8B5CF6", label: "Purple", preview: "bg-purple-100 text-purple-800" },
  { value: "#06B6D4", label: "Cyan", preview: "bg-cyan-100 text-cyan-800" },
  { value: "#EC4899", label: "Pink", preview: "bg-pink-100 text-pink-800" },
  { value: "#84CC16", label: "Lime", preview: "bg-lime-100 text-lime-800" }
];

const SEGMENT_FIELDS = [
  { value: "lifecycleStage", label: "Lifecycle Stage", type: "select", options: ["prospect", "lead", "customer", "advocate", "champion", "dormant"] },
  { value: "leadSource", label: "Lead Source", type: "select", options: ["direct", "website", "referral", "social_media", "advertisement"] },
  { value: "category", label: "Customer Category", type: "select", options: ["standard", "premium", "wholesale", "vip"] },
  { value: "industry", label: "Industry", type: "text" },
  { value: "companySize", label: "Company Size", type: "select", options: ["startup", "small", "medium", "large", "enterprise"] },
  { value: "annualRevenue", label: "Annual Revenue", type: "number" },
  { value: "creditLimit", label: "Credit Limit", type: "number" },
  { value: "paymentTerms", label: "Payment Terms", type: "number" },
  { value: "city", label: "City", type: "text" },
  { value: "createdAt", label: "Registration Date", type: "date" },
  { value: "lastContactDate", label: "Last Contact Date", type: "date" }
];

const OPERATORS = [
  { value: "equals", label: "Equals", types: ["text", "select", "number"] },
  { value: "not_equals", label: "Not Equals", types: ["text", "select", "number"] },
  { value: "contains", label: "Contains", types: ["text"] },
  { value: "not_contains", label: "Not Contains", types: ["text"] },
  { value: "greater_than", label: "Greater Than", types: ["number", "date"] },
  { value: "less_than", label: "Less Than", types: ["number", "date"] },
  { value: "greater_equal", label: "Greater or Equal", types: ["number", "date"] },
  { value: "less_equal", label: "Less or Equal", types: ["number", "date"] },
  { value: "between", label: "Between", types: ["number", "date"] },
  { value: "in", label: "In List", types: ["text", "select", "number"] },
  { value: "not_in", label: "Not In List", types: ["text", "select", "number"] },
  { value: "is_empty", label: "Is Empty", types: ["text"] },
  { value: "is_not_empty", label: "Is Not Empty", types: ["text"] }
];

export default function CustomerSegments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [newSegment, setNewSegment] = useState<{
    name: string;
    description: string;
    color: string;
    autoUpdate: boolean;
    criteria: { 
      rules: Array<{ field: string; operator: string; value: string; logic: "AND" | "OR" }>; 
      conditions: "all" | "any" 
    };
  }>({
    name: "",
    description: "",
    color: "#3B82F6",
    autoUpdate: true,
    criteria: { rules: [{ field: "", operator: "", value: "", logic: "AND" as const }], conditions: "all" as const }
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: segments = [], isLoading } = useQuery({
    queryKey: ["/api/customer-segments"],
    queryFn: () => apiRequest("/api/customer-segments", "GET").then(res => res.json())
  });

  const createSegmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/customer-segments", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-segments"] });
      setIsCreateOpen(false);
      setNewSegment({
        name: "",
        description: "",
        color: "#3B82F6",
        autoUpdate: true,
        criteria: { rules: [{ field: "", operator: "", value: "", logic: "AND" }], conditions: "all" }
      });
      toast({
        title: "Segment Created",
        description: "Customer segment has been created successfully.",
      });
    }
  });

  const updateSegmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/customer-segments/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-segments"] });
      toast({
        title: "Segment Updated",
        description: "Customer segment has been updated successfully.",
      });
    }
  });

  const deleteSegmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/customer-segments/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-segments"] });
      toast({
        title: "Segment Deleted",
        description: "Customer segment has been deleted successfully.",
      });
    }
  });

  // Use loading states for comprehensive loading feedback including mutations
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading customer segments...' },
      { isLoading: createSegmentMutation.isPending, message: 'Creating segment...' },
      { isLoading: updateSegmentMutation.isPending, message: 'Updating segment...' },
      { isLoading: deleteSegmentMutation.isPending, message: 'Deleting segment...' },
    ],
    progressSteps: ['Fetching segments', 'Loading analytics', 'Processing data'],
  });

  if (isLoading) {
    return <PageLoader message="Loading customer segments..." />;
  }

  const filteredSegments = segments.filter((segment: CustomerSegment) =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColorPreview = (color: string) => {
    const colorConfig = SEGMENT_COLORS.find(c => c.value === color);
    return colorConfig?.preview || "bg-gray-100 text-gray-800";
  };

  const addCriteriaRule = () => {
    setNewSegment(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        rules: [...prev.criteria.rules, { field: "", operator: "", value: "", logic: "AND" }]
      }
    }));
  };

  const removeCriteriaRule = (index: number) => {
    setNewSegment(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        rules: prev.criteria.rules.filter((_, i) => i !== index)
      }
    }));
  };

  const updateCriteriaRule = (index: number, field: string, value: any) => {
    setNewSegment(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        rules: prev.criteria.rules.map((rule, i) =>
          i === index ? { ...rule, [field]: value } : rule
        )
      }
    }));
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Customer Segments</h1>
                    <p className="text-white/80 text-lg">Intelligent customer grouping and targeting</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setIsCreateOpen(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Segment
              </Button>
            </div>
          </div>
        </div>

        {/* Segment Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Total</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{segments.length}</p>
                <p className="text-sm text-gray-600">Active Segments</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Customers</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {segments.reduce((sum: number, seg: CustomerSegment) => sum + seg.memberCount, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Members</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-800">Auto</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {segments.filter((seg: CustomerSegment) => seg.autoUpdate).length}
                </p>
                <p className="text-sm text-gray-600">Auto-Update</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <Badge className="bg-orange-100 text-orange-800">Performance</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
                <p className="text-sm text-gray-600">Match Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="segments" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-lg bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="segments" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segments" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search segments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                />
              </div>
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSegments.map((segment: CustomerSegment) => (
                <Card key={segment.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: segment.color }}
                        ></div>
                        <CardTitle className="text-lg">{segment.name}</CardTitle>
                      </div>
                      <Badge className={getColorPreview(segment.color)}>
                        {segment.memberCount} customers
                      </Badge>
                    </div>
                    {segment.description && (
                      <p className="text-sm text-gray-600">{segment.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Auto-update:</span>
                      <Badge variant={segment.autoUpdate ? "default" : "secondary"}>
                        {segment.autoUpdate ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={segment.isActive ? "default" : "secondary"}>
                        {segment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600">
                      Last updated: {formatDate(segment.lastUpdated)}
                    </div>

                    <div className="text-sm">
                      <p className="text-gray-600 mb-1">Criteria:</p>
                      <p className="font-medium">
                        {segment.criteria.rules.length} rule{segment.criteria.rules.length !== 1 ? 's' : ''} 
                        ({segment.criteria.conditions === 'all' ? 'Match all' : 'Match any'})
                      </p>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1"
                              onClick={() => setSelectedSegment(segment)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" 
                              onClick={() => deleteSegmentMutation.mutate(segment.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Segment Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {segments.slice(0, 5).map((segment: CustomerSegment) => (
                    <div key={segment.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: segment.color }}
                          ></div>
                          <span className="font-medium">{segment.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{segment.memberCount} customers</span>
                      </div>
                      <Progress 
                        value={(segment.memberCount / Math.max(...segments.map((s: CustomerSegment) => s.memberCount))) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Segment Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-semibold text-green-600">+12 customers</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold text-green-600">+47 customers</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Quarter</span>
                      <span className="font-semibold text-green-600">+128 customers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Segment Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Customer Segment</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Segment Name</Label>
                  <Input 
                    placeholder="Enter segment name"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select 
                    value={newSegment.color} 
                    onValueChange={(value) => setNewSegment(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENT_COLORS.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: color.value }}
                            ></div>
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe this segment..."
                  value={newSegment.description}
                  onChange={(e) => setNewSegment(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newSegment.autoUpdate}
                  onCheckedChange={(checked) => setNewSegment(prev => ({ ...prev, autoUpdate: checked }))}
                />
                <Label>Auto-update membership when criteria match</Label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Segment Criteria</Label>
                  <Button variant="outline" size="sm" onClick={addCriteriaRule}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Rule
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Match:</Label>
                  <Select 
                    value={newSegment.criteria.conditions}
                    onValueChange={(value: "all" | "any") => 
                      setNewSegment(prev => ({ ...prev, criteria: { ...prev.criteria, conditions: value } }))
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All conditions (AND)</SelectItem>
                      <SelectItem value="any">Any condition (OR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {newSegment.criteria.rules.map((rule, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Select 
                        value={rule.field}
                        onValueChange={(value) => updateCriteriaRule(index, 'field', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEGMENT_FIELDS.map(field => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select 
                        value={rule.operator}
                        onValueChange={(value) => updateCriteriaRule(index, 'operator', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATORS.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input 
                        placeholder="Value"
                        value={rule.value}
                        onChange={(e) => updateCriteriaRule(index, 'value', e.target.value)}
                        className="flex-1"
                      />

                      {newSegment.criteria.rules.length > 1 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeCriteriaRule(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createSegmentMutation.mutate(newSegment)}
                  disabled={!newSegment.name || createSegmentMutation.isPending}
                >
                  {createSegmentMutation.isPending ? "Creating..." : "Create Segment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}