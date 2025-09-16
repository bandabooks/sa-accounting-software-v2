import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Users, Clock, CheckCircle, AlertCircle, Eye, Edit3, Send, Search, Filter, Download, Mail, PenTool, MoreVertical, BarChart3, CheckCircle2, Award, Briefcase, Calculator, Building, BookOpen, Shield, Globe, TrendingUp, Settings, DollarSign, Activity, Calendar, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface ContractTemplate {
  id: number;
  name: string;
  category: string;
  description: string;
  servicePackage: string;
  bodyMd: string;
  fields: string[];
  createdAt: string;
  updatedAt: string;
}

interface Contract {
  id: number;
  templateId?: number;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  templateName?: string;
  projectId?: number;
  status: string;
  value?: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  issued: "bg-blue-100 text-blue-800", 
  signed: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function ContractsV2() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch contracts
  const { data: contractsResponse = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts", selectedStatus === "all" ? undefined : selectedStatus],
    queryFn: () => apiRequest(`/api/contracts${selectedStatus !== "all" ? `?status=${selectedStatus}` : ""}`),
  });

  const contracts = Array.isArray(contractsResponse) ? contractsResponse : [];

  // Fetch contract templates
  const { data: templatesResponse = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/contract-templates"],
    queryFn: () => apiRequest("/api/contract-templates"),
  });

  const templates = Array.isArray(templatesResponse) ? templatesResponse : [];

  // Calculate dashboard statistics
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c: Contract) => c.status === 'active').length;
  const expiringContracts = contracts.filter((c: Contract) => {
    if (!c.expiresAt) return false;
    const expiryDate = new Date(c.expiresAt);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  }).length;
  const totalValue = contracts.reduce((sum: number, contract: Contract) => sum + (contract.value || 0), 0);

  const quickActions = [
    {
      title: "Create Contract",
      description: "Create a new professional contract",
      icon: FileText,
      action: () => setLocation("/contracts/create"),
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
    },
    {
      title: "Generate Engagement Letter",
      description: "Create professional engagement letters",
      icon: Mail,
      action: () => setLocation("/contracts/templates"),
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    {
      title: "Create Template",
      description: "Design custom contract templates",
      icon: Plus,
      action: () => setLocation("/contracts/templates"),
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
    },
    {
      title: "View Analytics",
      description: "Contract performance insights",
      icon: BarChart3,
      action: () => toast({ title: "Analytics", description: "Analytics dashboard coming soon!" }),
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100"
    }
  ];

  return (
    <div className="space-y-6" data-testid="contracts-v2-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            Contracts Module
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1" data-testid="page-description">
            Professional contract management with engagement letter automation and e-signature integration
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setLocation("/contracts/create")}
            className="bg-blue-600 hover:bg-blue-700" 
            data-testid="button-start-work"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Work
          </Button>
          <Button 
            onClick={() => setLocation("/contracts/create")}
            data-testid="button-create-contract"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Contract
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500" data-testid="card-total-contracts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dashboard</p>
                <p className="text-sm text-gray-500 mt-1">Total Contracts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="text-total-contracts">
                  {totalContracts}
                </p>
                <p className="text-xs text-gray-500 mt-1">All time contracts</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500" data-testid="card-active-contracts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contracts</p>
                <p className="text-sm text-gray-500 mt-1">Active Contracts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="text-active-contracts">
                  {activeContracts}
                </p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500" data-testid="card-expiring-soon">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement Letters</p>
                <p className="text-sm text-gray-500 mt-1">Expiring Soon</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="text-expiring-soon">
                  {expiringContracts}
                </p>
                <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500" data-testid="card-total-value">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">E-Signatures</p>
                <p className="text-sm text-gray-500 mt-1">Total Value</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="text-total-value">
                  R {totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active contracts</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Streamline your contract management workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-200 ${action.color}`}
                onClick={action.action}
                data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <action.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Contracts Table */}
      <Card data-testid="card-recent-contracts">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Contracts</CardTitle>
              <CardDescription>Latest contract activity and status updates</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contracts</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-contracts"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {contractsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-state">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No contracts found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by creating your first professional contract or engagement letter.
              </p>
              <Button onClick={() => setLocation("/contracts/create")} data-testid="button-create-first-contract">
                <Plus className="w-4 h-4 mr-2" />
                Create First Contract
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts
                .filter((contract: Contract) => 
                  contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  contract.templateName?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 10)
                .map((contract: Contract) => (
                  <div 
                    key={contract.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/contracts/${contract.id}`)}
                    data-testid={`contract-row-${contract.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white" data-testid={`contract-name-${contract.id}`}>
                          {contract.templateName || `Contract #${contract.id}`}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`contract-customer-${contract.id}`}>
                          {contract.customerName} • {format(new Date(contract.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {contract.value && (
                        <span className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`contract-value-${contract.id}`}>
                          R {contract.value.toLocaleString()}
                        </span>
                      )}
                      <Badge className={statusColors[contract.status as keyof typeof statusColors]} data-testid={`contract-status-${contract.id}`}>
                        {contract.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`contract-menu-${contract.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setLocation(`/contracts/${contract.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Contract
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="w-4 h-4 mr-2" />
                            Send to Client
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}