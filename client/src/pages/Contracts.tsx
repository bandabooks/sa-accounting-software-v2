import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Users, Clock, CheckCircle, AlertCircle, Eye, Edit3, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  const filteredContracts = contracts.filter((contract: Contract) =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status statistics
  const statusStats = {
    total: contracts.length,
    draft: contracts.filter((c: Contract) => c.status === "draft").length,
    issued: contracts.filter((c: Contract) => c.status === "issued").length,
    signed: contracts.filter((c: Contract) => c.status === "signed").length,
    active: contracts.filter((c: Contract) => c.status === "active").length,
    completed: contracts.filter((c: Contract) => c.status === "completed").length,
  };

  const handleCreateContract = () => {
    // TODO: Open contract creation modal/page
    toast({
      title: "Contract Creation",
      description: "Contract creation interface coming soon",
    });
  };

  const handleViewContract = (contractId: number) => {
    // TODO: Navigate to contract details page
    toast({
      title: "Contract Details",
      description: `Viewing contract ${contractId}`,
    });
  };

  const ContractCard = ({ contract }: { contract: Contract }) => {
    const StatusIcon = statusIcons[contract.status as keyof typeof statusIcons];
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {contract.title}
              </CardTitle>
              <CardDescription className="mt-1">
                Contract #{contract.id} • Created {format(new Date(contract.createdAt), "MMM d, yyyy")}
              </CardDescription>
            </div>
            <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            {contract.value && (
              <div>
                <span className="font-medium">Value:</span> {contract.currency} {contract.value.toLocaleString()}
              </div>
            )}
            {contract.expiresAt && (
              <div>
                <span className="font-medium">Expires:</span> {format(new Date(contract.expiresAt), "MMM d, yyyy")}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewContract(contract.id)}
              data-testid={`button-view-contract-${contract.id}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            {contract.status === "draft" && (
              <Button
                variant="outline"
                size="sm"
                data-testid={`button-edit-contract-${contract.id}`}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600 mt-1">
            Manage engagement letters and professional agreements
          </p>
        </div>
        <Button onClick={handleCreateContract} data-testid="button-create-contract">
          <Plus className="w-4 h-4 mr-2" />
          New Contract
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-96">
          <TabsTrigger value="contracts" data-testid="tab-contracts">
            Contracts
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Total Contracts"
              value={statusStats.total}
              icon={FileText}
              color="bg-blue-500"
            />
            <StatsCard
              title="Draft"
              value={statusStats.draft}
              icon={Edit3}
              color="bg-gray-500"
            />
            <StatsCard
              title="Issued"
              value={statusStats.issued}
              icon={Send}
              color="bg-blue-500"
            />
            <StatsCard
              title="Active"
              value={statusStats.active}
              icon={CheckCircle}
              color="bg-green-500"
            />
            <StatsCard
              title="Completed"
              value={statusStats.completed}
              icon={CheckCircle}
              color="bg-purple-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-contracts"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48" data-testid="select-contract-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-status-all">All Statuses</SelectItem>
                <SelectItem value="draft" data-testid="option-status-draft">Draft</SelectItem>
                <SelectItem value="issued" data-testid="option-status-issued">Issued</SelectItem>
                <SelectItem value="signed" data-testid="option-status-signed">Signed</SelectItem>
                <SelectItem value="active" data-testid="option-status-active">Active</SelectItem>
                <SelectItem value="completed" data-testid="option-status-completed">Completed</SelectItem>
                <SelectItem value="cancelled" data-testid="option-status-cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contracts Grid */}
          {contractsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredContracts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContracts.map((contract: Contract) => (
                <ContractCard key={contract.id} contract={contract} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No contracts found
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchTerm || selectedStatus !== "all"
                    ? "Try adjusting your search criteria"
                    : "Create your first engagement letter to get started"}
                </p>
                {!searchTerm && selectedStatus === "all" && (
                  <Button onClick={handleCreateContract} data-testid="button-create-first-contract">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Contract
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Templates Grid */}
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template: ContractTemplate) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No templates available
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Create your first contract template to streamline your engagement process
                </p>
                <Button data-testid="button-create-template">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}