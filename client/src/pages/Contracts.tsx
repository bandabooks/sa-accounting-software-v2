import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Users, Clock, CheckCircle, AlertCircle, Eye, Edit3, Send, Search, Filter, Download, Mail, PenTool, MoreVertical, BarChart3, CheckCircle2 } from "lucide-react";
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
  mergeFields: string[];
  createdAt: string;
  updatedAt: string;
}

interface Contract {
  id: number;
  templateId: number;
  title: string;
  clientId: number;
  projectId?: number;
  status: string;
  value?: number;
  currency: string;
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

const statusIcons = {
  draft: Edit3,
  issued: Send,
  signed: Users,
  active: CheckCircle,
  completed: CheckCircle,
  cancelled: AlertCircle
};

export default function Contracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("contracts");

  // Fetch contracts
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts", selectedStatus === "all" ? undefined : selectedStatus],
    queryFn: () => apiRequest(`/api/contracts${selectedStatus !== "all" ? `?status=${selectedStatus}` : ""}`),
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/contracts/templates"],
    queryFn: () => apiRequest("/api/contracts/templates"),
  });

  // Filter contracts by search term
  const filteredContracts = (contracts || []).filter((contract: Contract) =>
    contract.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status statistics
  const statusStats = {
    total: (contracts || []).length,
    draft: (contracts || []).filter((c: Contract) => c.status === "draft").length,
    issued: (contracts || []).filter((c: Contract) => c.status === "issued").length,
    signed: (contracts || []).filter((c: Contract) => c.status === "signed").length,
    active: (contracts || []).filter((c: Contract) => c.status === "active").length,
    completed: (contracts || []).filter((c: Contract) => c.status === "completed").length,
  };

  // Issue contract mutation
  const issueContractMutation = useMutation({
    mutationFn: (contractId: number) => apiRequest(`/api/contracts/${contractId}/issue`, {
      method: "POST",
    }),
    onSuccess: () => {
      toast({
        title: "Contract Issued",
        description: "Contract has been issued successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: ({ contractId, email }: { contractId: number; email: string }) =>
      apiRequest(`/api/contracts/${contractId}/send-email`, {
        method: "POST",
        body: { email },
      }),
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Contract email has been sent successfully",
      });
    },
  });

  const handleCreateContract = () => {
    setLocation("/contracts/create");
  };

  const handleViewContract = (contractId: number) => {
    setLocation(`/contracts/${contractId}`);
  };

  const handleIssueContract = (contractId: number) => {
    issueContractMutation.mutate(contractId);
  };

  const handleSendEmail = (contractId: number, email: string) => {
    sendEmailMutation.mutate({ contractId, email });
  };

  const handleDownloadContract = (contractId: number) => {
    // Open contract view in new tab for download
    window.open(`/api/contracts/${contractId}/view`, '_blank');
  };

  const ContractCard = ({ contract }: { contract: Contract }) => {
    const StatusIcon = statusIcons[contract.status as keyof typeof statusIcons];
    
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-gray-900 truncate">
                {contract.title}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                #{contract.id} • {format(new Date(contract.createdAt), "MMM d, yyyy")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-xs ${statusColors[contract.status as keyof typeof statusColors]}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewContract(contract.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadContract(contract.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </DropdownMenuItem>
                  {contract.status === 'draft' && (
                    <DropdownMenuItem onClick={() => handleIssueContract(contract.id)}>
                      <Send className="mr-2 h-4 w-4" />
                      Issue Contract
                    </DropdownMenuItem>
                  )}
                  {(contract.status === 'issued' || contract.status === 'active') && (
                    <DropdownMenuItem onClick={() => handleSendEmail(contract.id, 'client@example.com')}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-medium text-gray-900">
                  {contract.value ? `${contract.currency} ${contract.value.toLocaleString()}` : 'Value TBD'}
                </span>
              </div>
              {contract.expiresAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Expires {format(new Date(contract.expiresAt), "MMM d")}</span>
                </div>
              )}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleViewContract(contract.id)}
              className="h-7 px-3 text-xs"
              data-testid={`button-view-contract-${contract.id}`}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TemplateCard = ({ template }: { template: ContractTemplate }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {template.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {template.category} • {template.servicePackage} package
            </CardDescription>
          </div>
          <Badge variant="outline">
            {template.mergeFields?.length || 0} fields
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {template.description}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            data-testid={`button-view-template-${template.id}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={handleCreateContract}
            data-testid={`button-use-template-${template.id}`}
          >
            <Plus className="w-4 h-4 mr-1" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const StatsCard = ({ title, value, icon: Icon, color }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contracts & Engagement Letters</h1>
          <p className="text-sm text-gray-600">Professional client agreements and service contracts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation('/contracts/templates')}>
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button onClick={handleCreateContract}>
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Ultra Compact Status Overview - 70% Height Reduction */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-1 mb-2">
        <div style={{height: '20px', padding: '2px 6px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: '7px', color: '#6b7280', lineHeight: '1'}}>Total</div>
            <div style={{fontSize: '9px', fontWeight: '600', color: '#111827', lineHeight: '1'}}>{statusStats.total}</div>
          </div>
          <BarChart3 style={{width: '10px', height: '10px', color: '#9ca3af', flexShrink: 0}} />
        </div>
        <div style={{height: '20px', padding: '2px 6px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: '7px', color: '#6b7280', lineHeight: '1'}}>Draft</div>
            <div style={{fontSize: '9px', fontWeight: '600', color: '#ea580c', lineHeight: '1'}}>{statusStats.draft}</div>
          </div>
          <Edit3 style={{width: '10px', height: '10px', color: '#fb923c', flexShrink: 0}} />
        </div>
        <div style={{height: '20px', padding: '2px 6px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: '7px', color: '#6b7280', lineHeight: '1'}}>Issued</div>
            <div style={{fontSize: '9px', fontWeight: '600', color: '#2563eb', lineHeight: '1'}}>{statusStats.issued}</div>
          </div>
          <Send style={{width: '10px', height: '10px', color: '#60a5fa', flexShrink: 0}} />
        </div>
        <div style={{height: '20px', padding: '2px 6px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: '7px', color: '#6b7280', lineHeight: '1'}}>Signed</div>
            <div style={{fontSize: '9px', fontWeight: '600', color: '#ca8a04', lineHeight: '1'}}>{statusStats.signed}</div>
          </div>
          <PenTool style={{width: '10px', height: '10px', color: '#facc15', flexShrink: 0}} />
        </div>
        <div style={{height: '20px', padding: '2px 6px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: '7px', color: '#6b7280', lineHeight: '1'}}>Active</div>
            <div style={{fontSize: '9px', fontWeight: '600', color: '#16a34a', lineHeight: '1'}}>{statusStats.active}</div>
          </div>
          <CheckCircle style={{width: '10px', height: '10px', color: '#4ade80', flexShrink: 0}} />
        </div>
        <div style={{height: '20px', padding: '2px 6px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: '7px', color: '#6b7280', lineHeight: '1'}}>Completed</div>
            <div style={{fontSize: '9px', fontWeight: '600', color: '#9333ea', lineHeight: '1'}}>{statusStats.completed}</div>
          </div>
          <CheckCircle2 style={{width: '10px', height: '10px', color: '#c084fc', flexShrink: 0}} />
        </div>
      </div>

      {/* Compact Search and Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[140px] h-9">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contracts Grid */}
      {contractsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse border border-gray-200">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="pt-2 pb-3">
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredContracts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredContracts.map((contract: Contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="w-10 h-10 text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No contracts found
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4 max-w-sm">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search criteria"
                : "Create your first engagement letter to get started"}
            </p>
            {!searchTerm && selectedStatus === "all" && (
              <Button onClick={handleCreateContract} className="h-9">
                <Plus className="w-4 h-4 mr-2" />
                Create Contract
              </Button>
                )}
              </CardContent>
            </Card>
          )}
    </div>
  );
}