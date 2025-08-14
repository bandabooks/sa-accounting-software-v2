import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Plus, Edit, Trash2, Eye, Copy, Check } from "lucide-react";

interface EmailTemplate {
  id: number;
  templateId: string;
  name: string;
  subject: string;
  category: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  isSystemTemplate: boolean;
  isActive: boolean;
  usageCount?: number;
  lastUsedAt?: string;
}

interface SMSTemplate {
  id: number;
  templateId: string;
  name: string;
  category: string;
  message: string;
  variables: string[];
  maxLength: number;
  isSystemTemplate: boolean;
  isActive: boolean;
  usageCount?: number;
  lastUsedAt?: string;
}

export default function TemplatesTab() {
  const [activeTab, setActiveTab] = useState("email");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | SMSTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch email templates
  const { data: emailData, isLoading: emailLoading } = useQuery({
    queryKey: ["/api/email-templates"],
    enabled: activeTab === "email",
  });

  // Fetch SMS templates
  const { data: smsData, isLoading: smsLoading } = useQuery({
    queryKey: ["/api/sms-templates"],
    enabled: activeTab === "sms",
  });

  const categories = activeTab === "email" 
    ? emailData?.categorized ? Object.keys(emailData.categorized) : []
    : smsData?.categorized ? Object.keys(smsData.categorized) : [];

  const templates = activeTab === "email" 
    ? emailData?.templates || []
    : smsData?.templates || [];

  const filteredTemplates = templates.filter((template: any) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.templateId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePreview = (template: EmailTemplate | SMSTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
    setIsEditing(false);
  };

  const handleEdit = (template: EmailTemplate | SMSTemplate) => {
    if (template.isSystemTemplate) {
      // Create a copy for editing
      setSelectedTemplate({
        ...template,
        id: 0,
        templateId: `${template.templateId}-custom`,
        name: `${template.name} (Custom)`,
        isSystemTemplate: false,
      });
    } else {
      setSelectedTemplate(template);
    }
    setIsEditing(true);
    setShowCreateDialog(true);
  };

  const handleCopy = (template: EmailTemplate | SMSTemplate) => {
    setSelectedTemplate({
      ...template,
      id: 0,
      templateId: `${template.templateId}-copy`,
      name: `${template.name} (Copy)`,
      isSystemTemplate: false,
    });
    setIsEditing(false);
    setShowCreateDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      const response = await fetch(`/api/${activeTab}-templates/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete template");

      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully.",
      });

      queryClient.invalidateQueries({ queryKey: [`/api/${activeTab}-templates`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const renderTemplateCard = (template: EmailTemplate | SMSTemplate) => {
    const isEmail = "subject" in template;
    
    return (
      <Card key={template.id} className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                {isEmail ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                {template.name}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                ID: {template.templateId}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={template.isSystemTemplate ? "secondary" : "default"}>
                {template.isSystemTemplate ? "System" : "Custom"}
              </Badge>
              <Badge variant={template.isActive ? "default" : "secondary"}>
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isEmail && (
              <div className="text-sm">
                <span className="font-medium">Subject:</span> {(template as EmailTemplate).subject}
              </div>
            )}
            <div className="text-sm text-muted-foreground line-clamp-2">
              {isEmail ? (template as EmailTemplate).bodyText : (template as SMSTemplate).message}
            </div>
            {template.variables && template.variables.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {template.variables.slice(0, 5).map((variable) => (
                  <Badge key={variable} variant="outline" className="text-xs">
                    {`{${variable}}`}
                  </Badge>
                ))}
                {template.variables.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.variables.length - 5} more
                  </Badge>
                )}
              </div>
            )}
            {template.usageCount !== undefined && (
              <div className="text-xs text-muted-foreground pt-2">
                Used {template.usageCount} times
                {template.lastUsedAt && ` • Last used ${new Date(template.lastUsedAt).toLocaleDateString()}`}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreview(template)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(template)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            {!template.isSystemTemplate && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Message Templates</h2>
          <p className="text-muted-foreground">
            Manage email and SMS templates for professional client communication
          </p>
        </div>
        <Button onClick={() => {
          setSelectedTemplate(null);
          setIsEditing(false);
          setShowCreateDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS Templates
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="email" className="mt-0">
            {emailLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading email templates...</div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No email templates found
                    {searchTerm && " matching your search"}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => renderTemplateCard(template as EmailTemplate))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sms" className="mt-0">
            {smsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading SMS templates...</div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No SMS templates found
                    {searchTerm && " matching your search"}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => renderTemplateCard(template as SMSTemplate))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              {"subject" in selectedTemplate ? (
                <>
                  <div>
                    <Label>Subject</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      {selectedTemplate.subject}
                    </div>
                  </div>
                  <div>
                    <Label>HTML Body</Label>
                    <div 
                      className="mt-1 p-3 bg-muted rounded-md"
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyHtml }}
                    />
                  </div>
                  <div>
                    <Label>Plain Text Body</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {selectedTemplate.bodyText}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <Label>Message</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {(selectedTemplate as SMSTemplate).message}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Length: {(selectedTemplate as SMSTemplate).message.length} / {(selectedTemplate as SMSTemplate).maxLength}
                  </div>
                </div>
              )}
              <div>
                <Label>Variables</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{${variable}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}