import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from 'date-fns';
import { professionalCategories, categoryColors } from '@shared/professionalCategories';
import { 
  Plus, 
  Search, 
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  Edit,
  Eye,
  Trash2,
  Filter,
  Download,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Circle,
  Zap,
  PenTool,
  Activity,
  TrendingUp,
  Settings,
  Mail,
  Send,
  Printer,
  FileSignature,
  RefreshCw,
  BarChart3
} from "lucide-react";

// Contract form schemas
const contractFormSchema = z.object({
  contractName: z.string().min(1, "Contract name is required"),
  contractType: z.enum(["service", "maintenance", "consulting", "development", "engagement", "other"]).default("service"),
  clientId: z.number({ required_error: "Client is required" }),
  projectId: z.number().optional(),
  startDate: z.date(),
  endDate: z.date(),
  value: z.number().min(0, "Contract value must be positive"),
  currency: z.string().default("ZAR"),
  status: z.enum(["draft", "active", "completed", "cancelled", "expired"]).default("draft"),
  description: z.string().optional(),
  terms: z.string().optional(),
  scope: z.string().optional(),
  deliverables: z.string().optional(),
  paymentTerms: z.string().optional(),
  invoiceSchedule: z.string().optional(),
  autoRenewal: z.boolean().default(false),
  reminderDays: z.number().min(1).max(365).default(30),
});

// Enhanced engagement letter template schema
const engagementLetterTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Template content is required'),
  defaultTerms: z.string().optional(),
  feeStructure: z.string().optional(),
  scope: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ContractFormData = z.infer<typeof contractFormSchema>;

interface EngagementLetterTemplate {
  id: number;
  name: string;
  serviceType: string;
  description?: string;
  content: string;
  defaultTerms?: string;
  feeStructure?: string;
  scope?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// E-Signature interfaces
interface SignatureProvider {
  id: number;
  organizationId: number;
  name: string;
  providerType: 'builtin' | 'docusign' | 'adobe_sign' | 'hellosign' | 'pandadoc' | 'signnow' | 'other';
  apiKey: string;
  isActive: boolean;
  isDefault: boolean;
  settings: any;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SignatureWorkflow {
  id: number;
  organizationId: number;
  contractId?: number;
  workflowName: string;
  documentTitle: string;
  providerId: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'expired';
  signingOrder: 'sequential' | 'parallel';
  expiresAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SignatureRequest {
  id: number;
  workflowId: number;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signingOrder: number;
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined' | 'expired';
  secureSigningLink: string;
  documentTitle: string;
  expiresAt: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  reminderCount: number;
  reminderSentAt?: string;
  signatureData?: string;
  signedIpAddress?: string;
  signedUserAgent?: string;
  signedLocation?: string;
  viewedIpAddress?: string;
  viewedUserAgent?: string;
  createdBy: string;
  createdAt: string;
}

interface DashboardStats {
  totalContracts: string;
  activeContracts: string;
  expiredContracts: string;
  totalValue: string;
}

// =================== BUILT-IN SIGNATURE CANVAS COMPONENT ===================
interface SignatureCanvasProps {
  onSignatureChange: (signature: string) => void;
  width?: number;
  height?: number;
}

function SignatureCanvas({ onSignatureChange, width = 400, height = 200 }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Convert to base64 and notify parent
    const signature = canvas.toDataURL('image/png');
    onSignatureChange(signature);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    setIsEmpty(true);
    onSignatureChange('');
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border border-gray-200 rounded cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isEmpty ? 'Sign above using your mouse or touchpad' : 'Signature captured'}
        </p>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={clearSignature}
          disabled={isEmpty}
        >
          Clear Signature
        </Button>
      </div>
    </div>
  );
}

// Main Contracts Component
export default function ContractsV2() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch contracts
  const { data: contractsResponse = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts", statusFilter === "all" ? undefined : statusFilter],
    queryFn: async () => apiRequest(`/api/contracts${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`),
  });

  const contracts = Array.isArray(contractsResponse) ? contractsResponse : [];

  // Fetch engagement letter templates (68 professional templates)
  const { data: templatesResponse = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/contracts/templates"],
    retry: 3,
  });

  const templates = Array.isArray(templatesResponse) ? templatesResponse : [];

  // Fetch signature workflows
  const { data: workflowsResponse = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ["/api/signature-workflows"],
    queryFn: async () => apiRequest("/api/signature-workflows"),
  });

  const workflows = Array.isArray(workflowsResponse) ? workflowsResponse : [];

  // Fetch signature providers
  const { data: providersResponse = [], isLoading: providersLoading } = useQuery({
    queryKey: ["/api/signature-providers"],
    queryFn: async () => apiRequest("/api/signature-providers"),
  });

  const providers = Array.isArray(providersResponse) ? providersResponse : [];

  // Dashboard statistics
  const dashboardStats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter((c: any) => c.status === 'active').length,
    expiredContracts: contracts.filter((c: any) => c.status === 'expired').length,
    totalValue: contracts.reduce((sum: number, contract: any) => sum + (contract.value || 0), 0),
  };

  // Contract form
  const contractForm = useForm<ContractFormData>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      contractType: "service",
      currency: "ZAR",
      status: "draft",
      autoRenewal: false,
      reminderDays: 30,
    },
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (contractData: ContractFormData) => {
      return apiRequest('/api/contracts', 'POST', contractData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      setShowContractDialog(false);
      contractForm.reset();
      toast({
        title: 'Contract Created',
        description: 'Contract has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Creating Contract',
        description: error.message || 'Failed to create contract',
        variant: 'destructive',
      });
    },
  });

  const handleCreateContract = (data: ContractFormData) => {
    createContractMutation.mutate(data);
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    expired: "bg-orange-100 text-orange-800"
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return Circle;
      case 'active': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return AlertTriangle;
      case 'expired': return Clock;
      default: return Circle;
    }
  };

  return (
    <div className="space-y-6" data-testid="contracts-module">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts Module</h1>
          <p className="text-muted-foreground">
            Professional contract management with engagement letter automation and e-signature integration
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setActiveTab("dashboard")} variant="outline" data-testid="button-start-work">
            <Activity className="h-4 w-4 mr-2" />
            Start Work
          </Button>
          <Button onClick={() => setShowContractDialog(true)} data-testid="button-create-contract">
            <Plus className="h-4 w-4 mr-2" />
            Create Contract
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="engagement-letters" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Engagement Letters
          </TabsTrigger>
          <TabsTrigger value="e-signatures" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            E-Signatures
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-contracts">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Contracts</p>
                    <p className="text-3xl font-bold" data-testid="text-total-contracts">
                      {dashboardStats.totalContracts}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">All time contracts</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-active-contracts">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                    <p className="text-3xl font-bold" data-testid="text-active-contracts">
                      {dashboardStats.activeContracts}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Currently active</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-expiring-soon">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                    <p className="text-3xl font-bold" data-testid="text-expiring-soon">
                      {dashboardStats.expiredContracts}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-value">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-3xl font-bold" data-testid="text-total-value">
                      R {dashboardStats.totalValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Active contracts</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Streamline your contract management workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowContractDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                      <Plus className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Create Contract</h3>
                    <p className="text-sm text-muted-foreground">Start a new contract</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("engagement-letters")}>
                  <CardContent className="p-6 text-center">
                    <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Generate Engagement Letter</h3>
                    <p className="text-sm text-muted-foreground">Professional engagement letters</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTemplateDialog(true)}>
                  <CardContent className="p-6 text-center">
                    <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Create Template</h3>
                    <p className="text-sm text-muted-foreground">Design custom templates</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("e-signatures")}>
                  <CardContent className="p-6 text-center">
                    <div className="p-3 bg-orange-100 rounded-lg w-fit mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-2">View Analytics</h3>
                    <p className="text-sm text-muted-foreground">Contract insights</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contracts</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowContractDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No contracts found</h3>
                        <p className="text-muted-foreground mb-4">Get started by creating your first contract.</p>
                        <Button onClick={() => setShowContractDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Contract
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts
                    .filter((contract: any) => 
                      contract.contractName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      contract.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((contract: any) => {
                      const StatusIcon = getStatusIcon(contract.status);
                      return (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.contractName}</TableCell>
                          <TableCell>{contract.clientName || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {contract.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {contract.startDate ? format(new Date(contract.startDate), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {contract.value ? `R ${contract.value.toLocaleString()}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedContract(contract)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Engagement Letters Tab - Professional Template Management System */}
        <TabsContent value="engagement-letters" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Professional Template Management System</h2>
              <p className="text-muted-foreground">South African accounting and tax practice engagement letter templates meeting professional standards</p>
            </div>
            <Button onClick={() => setShowTemplateDialog(true)}>
              <Plus className="h-4 h-4 mr-2" />
              Custom Template
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">68</div>
                <div className="text-sm text-blue-700">Total Templates</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">11</div>
                <div className="text-sm text-green-700">Service Categories</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                <div className="text-sm text-purple-700">SA Compliant</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">Ready</div>
                <div className="text-sm text-orange-700">Professional Use</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="text-sm"
            >
              All Categories ({templates.length})
            </Button>
            {professionalCategories.map(category => {
              const categoryTemplates = templates.filter((t: any) => t.servicePackage === category.value);
              return (
                <Button 
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.value)}
                  className="text-sm"
                >
                  {category.label} ({categoryTemplates.length})
                </Button>
              );
            })}
          </div>

          {/* Template Grid */}
          {templatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">Create your first engagement letter template.</p>
              <Button onClick={() => setShowTemplateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter((template: any) => 
                  selectedCategory === "all" || template.servicePackage === selectedCategory
                )
                .map((template: any) => {
                  const category = professionalCategories.find(c => c.value === template.servicePackage);
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header with Professional Badge */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{template.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  Professional
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Service Type */}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {category?.label || template.servicePackage}
                            </p>
                          </div>

                          {/* Compliance Badges */}
                          <div className="flex gap-2">
                            <Badge className="bg-blue-100 text-blue-800 text-xs">SAICA</Badge>
                            <Badge className="bg-green-100 text-green-800 text-xs">SAIPA</Badge>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {template.description || `Comprehensive ${category?.label.toLowerCase()} and strategic consulting`}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                              <FileText className="h-4 w-4 mr-1" />
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>

        {/* E-Signatures Tab */}
        <TabsContent value="e-signatures" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">E-Signature Management</h2>
              <p className="text-muted-foreground">Professional digital signature workflows with full compliance and audit trails</p>
            </div>
            <Button onClick={() => setShowSignatureDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Signature Workflow
            </Button>
          </div>

          {/* E-Signature Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                    <p className="text-3xl font-bold">
                      {workflows.filter((w: any) => w.status === 'active').length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed This Month</p>
                    <p className="text-3xl font-bold">
                      {workflows.filter((w: any) => w.status === 'completed').length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Successfully signed</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Signatures</p>
                    <p className="text-3xl font-bold">
                      {workflows.filter((w: any) => w.status === 'draft').length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Providers</p>
                    <p className="text-3xl font-bold">
                      {providers.filter((p: any) => p.isActive).length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Configured services</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Signature Workflows */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Signature Workflows</CardTitle>
              <CardDescription>Latest e-signature activities</CardDescription>
            </CardHeader>
            <CardContent>
              {workflowsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-8">
                  <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No signature workflows</h3>
                  <p className="text-muted-foreground mb-4">Start your first digital signature workflow.</p>
                  <Button onClick={() => setShowSignatureDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workflow Name</TableHead>
                      <TableHead>Document Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflows.slice(0, 10).map((workflow: SignatureWorkflow) => (
                      <TableRow key={workflow.id}>
                        <TableCell className="font-medium">{workflow.workflowName}</TableCell>
                        <TableCell>{workflow.documentTitle}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[workflow.status as keyof typeof statusColors]}>
                            {workflow.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(workflow.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Contract Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Contract</DialogTitle>
            <DialogDescription>
              Enter the contract details to get started
            </DialogDescription>
          </DialogHeader>
          <Form {...contractForm}>
            <form onSubmit={contractForm.handleSubmit(handleCreateContract)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={contractForm.control}
                  name="contractName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contract name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contract type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="service">Service Contract</SelectItem>
                          <SelectItem value="maintenance">Maintenance Contract</SelectItem>
                          <SelectItem value="consulting">Consulting Agreement</SelectItem>
                          <SelectItem value="development">Development Contract</SelectItem>
                          <SelectItem value="engagement">Engagement Letter</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={contractForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ZAR">ZAR (South African Rand)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={contractForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter contract description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowContractDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContractMutation.isPending}>
                  {createContractMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Contract
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}