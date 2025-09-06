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
  MoreHorizontal
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
  const [activeTab, setActiveTab] = useState("contract-info");

  // Fetch contract details
  const { data: contract, isLoading: contractLoading } = useQuery({
    queryKey: [`/api/contracts/${contractId}`],
    enabled: !!contractId,
  });

  // Fetch all SA professional templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
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
    mutationFn: async () => {
      return apiRequest(`/api/contracts/${contractId}/send-email`, "POST");
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
    emailContractMutation.mutate();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // PDF download functionality
    toast({
      title: "PDF Download",
      description: "PDF download will be implemented.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Documents</h1>
            <p className="text-gray-600">Contract management and templates</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEmailContract}>
            <Send className="w-4 h-4 mr-2" />
            View Contract
          </Button>
          <Button variant="outline" onClick={handlePrintPDF}>
            <Printer className="w-4 h-4 mr-2" />
          </Button>
          <Button variant="outline" onClick={handleEmailContract}>
            <Send className="w-4 h-4 mr-2" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                More
                <MoreHorizontal className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEmailContract}>
                <Send className="w-4 h-4 mr-2" />
                View Contract
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="contract-info">Contract Information</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="renewal-history">Renewal History</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="templates" className="relative">
            Templates
            <Badge variant="secondary" className="ml-2 text-xs">
              {templates.length}
            </Badge>
          </TabsTrigger>
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
                  <p className="text-gray-900">{contract.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900">{contract.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Value</label>
                  <p className="text-gray-900">{contract.currency} {contract.value?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">{format(new Date(contract.createdAt), "PPP")}</p>
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
                    <Template className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No attachments available.</p>
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
              <p className="text-gray-600">No renewal history available.</p>
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