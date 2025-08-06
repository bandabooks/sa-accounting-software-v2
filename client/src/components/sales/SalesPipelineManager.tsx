import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { 
  Plus, MoreHorizontal, Edit, Trash2, Eye, Phone, Mail, Calendar,
  DollarSign, Percent, User, Clock, Target, TrendingUp, AlertCircle,
  CheckCircle, ArrowRight, Filter, Search, SortAsc
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PipelineStage {
  id: number;
  name: string;
  color: string;
  probability: number;
  position: number;
  opportunities: Opportunity[];
}

interface Opportunity {
  id: number;
  opportunityNumber: string;
  title: string;
  expectedValue: number;
  probability: number;
  customerId?: number;
  customerName?: string;
  assignedTo?: number;
  assignedToName?: string;
  expectedCloseDate?: string;
  priority: "low" | "medium" | "high";
  status: "active" | "won" | "lost";
  tags?: string[];
}

export default function SalesPipelineManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [showStageModal, setShowStageModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pipeline stages with opportunities
  const { data: pipelineStages = [], isLoading } = useQuery<PipelineStage[]>({
    queryKey: ["/api/sales-pipeline/stages"],
  });

  // Fetch pipeline statistics
  const { data: pipelineStats = {} } = useQuery({
    queryKey: ["/api/sales-pipeline/stats"],
  });

  // Move opportunity between stages
  const moveOpportunityMutation = useMutation({
    mutationFn: async ({ opportunityId, newStageId, newPosition }: {
      opportunityId: number;
      newStageId: number;
      newPosition: number;
    }) => {
      return await apiRequest(`/api/sales-opportunities/${opportunityId}/move`, "PUT", {
        stageId: newStageId,
        position: newPosition
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-pipeline/stages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales-pipeline/stats"] });
      toast({
        title: "Success",
        description: "Opportunity moved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to move opportunity",
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const sourceStageId = parseInt(result.source.droppableId);
    const destStageId = parseInt(result.destination.droppableId);
    const opportunityId = parseInt(result.draggableId);

    if (sourceStageId !== destStageId || result.source.index !== result.destination.index) {
      moveOpportunityMutation.mutate({
        opportunityId,
        newStageId: destStageId,
        newPosition: result.destination.index
      });
    }
  }, [moveOpportunityMutation]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const getWeightedValue = (opportunity: Opportunity) => {
    return (opportunity.expectedValue * opportunity.probability) / 100;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4 h-96">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Pipeline Header with Analytics */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
        
        <div className="relative p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white tracking-tight">Sales Pipeline</h1>
              <p className="text-blue-100 text-lg font-medium">Visual deal tracking with drag-and-drop pipeline management</p>
              
              {/* Pipeline Performance Metrics */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">{formatCurrency(pipelineStats.totalValue || 0)}</span>
                  <span className="text-sm opacity-90">Total Pipeline</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">{formatCurrency(pipelineStats.weightedValue || 0)}</span>
                  <span className="text-sm opacity-90">Weighted Value</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">{pipelineStats.averageDealSize || 0}</span>
                  <span className="text-sm opacity-90">Avg Deal Size</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                onClick={() => setShowStageModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stage
              </Button>
              <Button 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                onClick={() => setShowOpportunityModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Opportunity
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="me">Assigned to Me</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Interactive Pipeline Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="bg-gray-50 rounded-xl p-4 min-h-[600px]">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: stage.color }}
                  ></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                    <p className="text-sm text-gray-600">{stage.probability}% win rate</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Stage
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Stage
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Stage Statistics */}
              <div className="bg-white p-3 rounded-lg mb-4 border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Stage Value</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(stage.opportunities.reduce((sum, opp) => sum + opp.expectedValue, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Deals</span>
                  <span className="font-semibold text-gray-900">{stage.opportunities.length}</span>
                </div>
              </div>

              {/* Droppable Area for Opportunities */}
              <Droppable droppableId={stage.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 min-h-[200px] ${
                      snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg p-2' : ''
                    }`}
                  >
                    {stage.opportunities.map((opportunity, index) => (
                      <Draggable
                        key={opportunity.id}
                        draggableId={opportunity.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-all duration-200 ${
                              snapshot.isDragging ? 'rotate-2 shadow-2xl scale-105' : 'hover:shadow-md'
                            }`}
                          >
                            <CardContent className="p-4">
                              {/* Opportunity Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 truncate">{opportunity.title}</h4>
                                  <p className="text-sm text-gray-600 truncate">{opportunity.customerName || 'No Customer'}</p>
                                </div>
                                <Badge className={`ml-2 ${getPriorityColor(opportunity.priority)}`}>
                                  {opportunity.priority}
                                </Badge>
                              </div>

                              {/* Value and Probability */}
                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Expected Value</span>
                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(opportunity.expectedValue)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Weighted Value</span>
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(getWeightedValue(opportunity))}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">Probability</span>
                                    <span className="text-sm font-medium">{opportunity.probability}%</span>
                                  </div>
                                  <Progress value={opportunity.probability} className="h-2" />
                                </div>
                              </div>

                              {/* Assignee and Actions */}
                              <div className="flex items-center justify-between pt-3 border-t">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                          {opportunity.assignedToName ? opportunity.assignedToName.substring(0, 2).toUpperCase() : 'UN'}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{opportunity.assignedToName || 'Unassigned'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Phone className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Mail className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => setSelectedOpportunity(opportunity)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {/* Add Opportunity Button */}
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                      onClick={() => setShowOpportunityModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Opportunity
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}