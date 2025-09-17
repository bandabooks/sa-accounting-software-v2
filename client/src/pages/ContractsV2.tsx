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
import StartWorkingButton from "@/components/StartWorkingButton";
import AITooltip, { FieldHelp, ModuleHelp } from '@/components/AITooltip';
import AITemplatePreview from '@/components/AITemplatePreview';
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
  clientId: z.coerce.number({ required_error: "Client is required" }),
  projectId: z.coerce.number().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  value: z.coerce.number().min(0, "Contract value must be positive"),
  currency: z.string().default("ZAR"),
  status: z.enum(["draft", "active", "completed", "cancelled", "expired"]).default("draft"),
  description: z.string().optional(),
  terms: z.string().optional(),
  scope: z.string().optional(),
  deliverables: z.string().optional(),
  paymentTerms: z.string().optional(),
  invoiceSchedule: z.string().optional(),
  autoRenewal: z.boolean().default(false),
  reminderDays: z.coerce.number().min(1).max(365).default(30),
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
          data-testid="canvas-signature"
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
          data-testid="button-clear-signature"
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Fetch contracts
  const { data: contractsResponse = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts", statusFilter === "all" ? undefined : statusFilter],
    queryFn: async () => apiRequest(`/api/contracts${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`),
  });

  const contracts = Array.isArray(contractsResponse) ? contractsResponse : [];

  // Fetch engagement letter templates (68 professional templates)
  const { data: templatesResponse = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/contracts/templates"],
    queryFn: async () => {
      const response = await apiRequest("/api/contracts/templates", "GET");
      return await response.json();
    },
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
        title: "Contract Created",
        description: "Contract has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contract.",
        variant: "destructive",
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
    expired: "bg-orange-100 text-orange-800",
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts Management</h1>
          <p className="text-muted-foreground">
            Professional contract management with AI-powered templates and e-signatures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModuleHelp context="contracts" className="mr-2" />
          <StartWorkingButton />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="engagement-letters" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="e-signatures" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            E-Signatures
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-contracts">{dashboardStats.totalContracts}</div>
                <p className="text-xs text-muted-foreground">All time contracts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-contracts">{dashboardStats.activeContracts}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-expired-contracts">{dashboardStats.expiredContracts}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-value">
                  R {dashboardStats.totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Active contracts</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common contract management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => setShowContractDialog(true)} className="h-20 flex-col gap-2" variant="outline">
                  <Plus className="h-6 w-6" />
                  Create Contract
                </Button>
                <Button onClick={() => setActiveTab('engagement-letters')} className="h-20 flex-col gap-2" variant="outline">
                  <Mail className="h-6 w-6" />
                  Browse Templates
                </Button>
                <Button onClick={() => setActiveTab('e-signatures')} className="h-20 flex-col gap-2" variant="outline">
                  <FileSignature className="h-6 w-6" />
                  E-Signatures
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Contracts</h2>
              <p className="text-muted-foreground">Manage your business contracts and agreements</p>
            </div>
            <Button onClick={() => setShowContractDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-contracts"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div>
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No contracts found</h3>
                          <p className="text-muted-foreground mb-4">Get started by creating your first contract.</p>
                          <Button onClick={() => setShowContractDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Contract
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((contract: any) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contract.contractName || contract.title}</p>
                            <p className="text-sm text-muted-foreground">{contract.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>{contract.clientName || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contract.contractType || contract.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(contract.status)}
                              {contract.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {contract.value ? `R ${contract.value.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>{format(new Date(contract.endDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowPreviewDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowContractDialog(true);
                                contractForm.setValue('contractType', 'engagement');
                                contractForm.setValue('description', `Based on template: ${template.name}`);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              }
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
                  <h3 className="text-lg font-medium mb-2">No signature workflows yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first signature workflow to start collecting signatures.</p>
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
                      <TableHead>Created</TableHead>
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
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
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
              Add a new contract to your system
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
                          <SelectItem value="service">Service Agreement</SelectItem>
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

              {/* Client Information */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={contractForm.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter client name or select from list" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contractForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Link to project (optional)" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={contractForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contractForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Value and Payment */}
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
                          <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Terms */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={contractForm.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="net30">Net 30 Days</SelectItem>
                          <SelectItem value="net60">Net 60 Days</SelectItem>
                          <SelectItem value="net90">Net 90 Days</SelectItem>
                          <SelectItem value="immediate">Immediate Payment</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contractForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending Approval</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
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
                        className="resize-none"
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Contract"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.servicePackage && (
                <Badge variant="outline" className="mt-2">
                  {professionalCategories.find(c => c.value === selectedTemplate.servicePackage)?.label}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 rounded-lg">
            {selectedTemplate?.bodyMd ? (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: selectedTemplate.bodyMd
                    .replace(/{{(\w+)}}/g, '<span class="bg-yellow-200 px-1 rounded">[$1]</span>')
                    .replace(/\n/g, '<br />')
                    .replace(/#{1,6}\s(.+)/g, '<h3 class="font-bold text-lg mt-4 mb-2">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
              </div>
            ) : (
              <p className="text-muted-foreground">No preview available</p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              <strong>Template Fields:</strong> {selectedTemplate?.fields?.length ? 
                JSON.parse(selectedTemplate.fields).join(', ') : 
                'No custom fields'}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowPreviewDialog(false);
                setShowContractDialog(true);
                contractForm.setValue('contractType', 'engagement');
                contractForm.setValue('description', `Based on template: ${selectedTemplate?.name}`);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}