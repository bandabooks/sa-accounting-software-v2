import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  Paperclip, 
  RefreshCw, 
  CheckSquare, 
  StickyNote,
  Plus,
  Eye,
  Edit,
  Send,
  Printer,
  Download,
  Copy,
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ContractTemplate {
  id: number;
  name: string;
  version: number;
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
  templateId: number;
  customerId: number;
  status: string;
  title: string;
  value: number;
  currency: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

const servicePackageColors = {
  basic: "bg-gray-100 text-gray-800",
  standard: "bg-blue-100 text-blue-800", 
  premium: "bg-purple-100 text-purple-800",
  enterprise: "bg-green-100 text-green-800"
};

export default function ContractDetail() {
  const params = useParams();
  const contractId = params.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch contract details
  const { data: contract, isLoading: contractLoading } = useQuery<Contract>({
    queryKey: [`/api/contracts/${contractId}`],
    enabled: !!contractId,
  });

  // Fetch all SA professional templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/contracts/templates"],
  });

  // Insert template mutation
  const insertTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return apiRequest(`/api/contracts/${contractId}/insert-template`, "POST", {
        templateId
      });
    },
    onSuccess: () => {
      toast({
        title: "Template Inserted",
        description: "The template has been successfully inserted into the contract.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to insert template.",
        variant: "destructive",
      });
    },
  });

  // Email contract mutation
  const emailContractMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest(`/api/contracts/${contractId}/send-email`, "POST", { email });
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Contract has been sent to the client via email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send email.",
        variant: "destructive",
      });
    },
  });

  if (contractLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contract Not Found</h1>
          <p className="text-gray-600">The requested contract could not be found.</p>
        </div>
      </div>
    );
  }

  const handleInsertTemplate = (templateId: number) => {
    insertTemplateMutation.mutate(templateId);
  };

  const handleEmailContract = () => {
    // For now, use a default email - in a real app, this would come from customer data
    emailContractMutation.mutate('client@example.com');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleViewPDFNewTab = () => {
    window.open(`/api/contracts/${contractId}/pdf`, '_blank');
  };

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = `/api/contracts/${contractId}/pdf?download=true`;
    link.download = `contract-${contractId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRenewContract = () => {
    // Navigate to create a new contract based on this one
    window.location.href = `/contracts/create?renewal=${contractId}`;
  };

  // Renewal mutation
  const renewContractMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/contracts/${contractId}/renew`, "POST");
    },
    onSuccess: (response: any) => {
      toast({
        title: "Contract Renewed",
        description: `New contract #${response.id} has been created based on this contract.`,
      });
      // Navigate to the new contract
      window.location.href = `/contracts/${response.id}`;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to renew contract.",
        variant: "destructive",
      });
    },
  });

  // Fetch renewal history
  const { data: renewalHistory = [], isLoading: renewalHistoryLoading } = useQuery<Contract[]>({
    queryKey: [`/api/contracts/${contractId}/renewals`],
    enabled: !!contractId,
  });

  const handleAddAttachment = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        toast({
          title: "Files Selected",
          description: `${files.length} file(s) selected for upload.`,
        });
        // TODO: Implement file upload to server
      }
    };
    input.click();
  };


  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
            className="p-2 h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{contract?.title || 'Contract Details'}</h1>
            <p className="text-sm text-gray-600">Contract #{contractId} - {contract ? format(new Date(contract.createdAt), 'MMM d, yyyy') : ''}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`/api/contracts/${contractId}/view`, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEmailContract}
            disabled={emailContractMutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {emailContractMutation.isPending ? 'Sending...' : 'Email'}
          </Button>
          
          {/* PDF Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                View PDF
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewPDFNewTab}>
                <Eye className="w-4 h-4 mr-2" />
                View PDF in New Tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintPDF}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                More
                <MoreHorizontal className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRenewContract}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Renew Contract
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckSquare className="w-4 h-4 mr-2" />
                Mark as signed
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Compact Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
        </TabsList>

        {/* Contract Information Tab */}
        <TabsContent value="contract-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <p className="text-gray-900">{contract?.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900">{contract?.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Value</label>
                  <p className="text-gray-900">{contract?.currency} {contract?.value?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">{contract?.createdAt ? format(new Date(contract.createdAt), "PPP") : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Content</CardTitle>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <span>Available merge fields</span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Contract content display area */}
              <div className="bg-white p-6 rounded-lg border min-h-96">
                <div className="space-y-4">
                  <p className="text-gray-800">{"{"}dark_logo_image_with_uri{"}"}</p>
                  <div className="space-y-2">
                    <p>To : {"{"}contact_firstname{"}"} {"{"}contact_lastname{"}"}</p>
                    <p>{"{"}client_company{"}"}</p>
                  </div>
                  <p>{"{"}contract_subject{"}"}</p>
                  <p>{"{"}contract_created_at{"}"}</p>
                  <div className="space-y-2">
                    <p>Start Date:{"{"}contract_datestart{"}"}</p>
                    <p>Expiry Date :{"{"}contract_dateend{"}"}</p>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold">WHY AN EMPLOYER NEED TO REGISTER WITH CF?</h3>
                    <p className="text-gray-700">
                      According to the law, an employer must insure his/her workers against occupational injuries or diseases contracted during the course of employment. CF is not insuring the employer's business but, insuring the workers.
                    </p>
                    
                    <h3 className="text-lg font-semibold">REGISTERING AS AN EMPLOYER</h3>
                    <p className="text-gray-700">
                      According to law, an employer must register with the Compensation Fund (CF) within 7 after appointing an employee/s.
                    </p>
                    
                    <p className="text-gray-700">For Employers - if you want to apply for registration at CF:</p>
                    <ul className="list-disc ml-6 text-gray-700 space-y-1">
                      <li>Register online <span className="text-blue-600">www.labour.gov.za</span>, click Online Services, click ROE Online (CFonline.labour.gov.za) or</li>
                      <li>Complete the Registration Form</li>
                      <li>Attach the CIPC certificate, UIF Proof of Registration, ID copies of the owners/directors, a proof of the business residence.</li>
                      <li>For the Non-Profit Organisation (NPO), attach the CIPC certificate, UIF Proof of Registration, NPO certificate, ID copies of the owners/directors, a proof of the business residence</li>
                      <li>For the Trust</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab - This is the main focus */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Professional Templates</h3>
              <p className="text-gray-600">Select from {templates.length} South African professional engagement letter templates</p>
            </div>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="space-y-4">
            {templatesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : templates.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
                    <p className="text-gray-600">No professional templates have been set up yet.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              templates.map((template: ContractTemplate) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={servicePackageColors[template.servicePackage as keyof typeof servicePackageColors]}
                          >
                            {template.servicePackage}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            v{template.version}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        {template.fields && template.fields.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Merge fields: {template.fields.length} available
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInsertTemplate(template.id)}
                          disabled={insertTemplateMutation.isPending}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Insert
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleInsertTemplate(template.id)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Insert Template
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Other Tabs (placeholder content) */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Attachments
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddAttachment}
                  data-testid="button-add-attachment"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Attachment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No attachments uploaded yet</p>
                <p className="text-sm text-gray-500">Click "Add Attachment" or drag files here to upload</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Renewals Tab */}
        <TabsContent value="renewals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Contract Renewals
                  </CardTitle>
                  <CardDescription>
                    Manage contract renewals and view renewal history
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleRenewContract}
                  disabled={renewContractMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {renewContractMutation.isPending ? "Creating..." : "Renew Contract"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Contract Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Contract</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium">{contract?.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2">{contract?.createdAt ? format(new Date(contract.createdAt), "MMM d, yyyy") : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Value:</span>
                    <span className="ml-2">{contract?.currency} {contract?.value?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expires:</span>
                    <span className="ml-2">{contract?.expiresAt ? format(new Date(contract.expiresAt), "MMM d, yyyy") : 'No expiry'}</span>
                  </div>
                </div>
              </div>

              {/* Renewal History */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Renewal History
                </h4>
                
                {renewalHistoryLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                    ))}
                  </div>
                ) : renewalHistory.length > 0 ? (
                  <div className="space-y-3">
                    {renewalHistory.map((renewal: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Contract #{renewal.id}</p>
                            <p className="text-sm text-gray-600">
                              Renewed on {format(new Date(renewal.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="mb-1">
                              {renewal.status}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              {renewal.currency} {renewal.value?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No renewal history found</p>
                    <p className="text-sm">This contract has not been renewed yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No comments available.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewal-history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Renewal History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="default" 
                  onClick={handleRenewContract}
                  className="bg-gray-800 hover:bg-gray-700"
                  data-testid="button-renew-contract"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Renew Contract
                </Button>
              </div>
              <p className="text-gray-600">Renewals for this contract are not found</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No tasks available.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="w-5 h-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No notes available.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}