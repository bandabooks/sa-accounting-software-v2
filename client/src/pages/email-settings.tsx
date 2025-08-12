import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, Settings, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmailStatus {
  service: {
    configured: boolean;
    provider: string | null;
    details: string;
  };
  isSuperAdmin: boolean;
  statistics: {
    pendingEmails: number;
    sentToday: number;
  };
  canSendTestEmail: boolean;
}

interface EmailQueueItem {
  id: number;
  to: string;
  subject: string;
  status: string;
  attempts: number;
  errorMessage?: string;
  createdAt: string;
  sentAt?: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  templateType: string;
  isActive: boolean;
}

export default function EmailSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState("");
  const [testType, setTestType] = useState<"basic" | "welcome" | "invoice" | "reminder">("basic");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  // Fetch email service status
  const { data: status, isLoading: statusLoading } = useQuery<EmailStatus>({
    queryKey: ["/api/email/status"],
  });

  // Fetch email queue
  const { data: emailQueue, isLoading: queueLoading } = useQuery<EmailQueueItem[]>({
    queryKey: ["/api/email/queue"],
    enabled: selectedTab === "queue",
  });

  // Fetch email templates
  const { data: templates, isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email/templates"],
    enabled: selectedTab === "templates",
  });

  // Send test email mutation
  const sendTestEmail = useMutation({
    mutationFn: async (data: { to: string; testType: string; message?: string }) => {
      const response = await apiRequest("/api/email/test", "POST", data);
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: `Test email successfully sent to ${testEmail}`,
      });
      setTestEmail("");
      setCustomMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/email/queue"] });
    },
    onError: (error: any) => {
      // Enhanced error handling with provider details
      let description = error.message || "Please check your email configuration";
      
      if (error.hint) {
        description = error.hint;
      } else if (error.error) {
        // Show provider error (limited to 300 chars)
        description = error.error;
      }
      
      toast({
        title: error.message || "Failed to send test email",
        description: description,
        variant: "destructive",
      });
    },
  });

  // Retry failed email mutation
  const retryEmail = useMutation({
    mutationFn: async (emailId: number) => {
      const response = await apiRequest(`/api/email/queue/${emailId}/retry`, "POST");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email queued for retry",
        description: "The email will be sent again shortly",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/queue"] });
    },
    onError: () => {
      toast({
        title: "Failed to retry email",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Clear failed emails mutation
  const clearFailedEmails = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/email/queue/clear?status=failed", "DELETE");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Failed emails cleared",
        description: "All failed emails have been removed from the queue",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/queue"] });
    },
  });

  const handleSendTestEmail = () => {
    if (!testEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    sendTestEmail.mutate({
      to: testEmail,
      testType,
      message: customMessage || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "sending":
        return <Badge className="bg-blue-500"><Send className="w-3 h-3 mr-1" />Sending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (statusLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Configuration</h1>
        <p className="text-muted-foreground">Manage email service, test delivery, and view email queue</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test">Test Email</TabsTrigger>
          <TabsTrigger value="queue">Email Queue</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Service Status
              </CardTitle>
              <CardDescription>Current email service configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {status?.service.configured ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Configured
                  </Badge>
                )}
              </div>
              {status?.service.provider && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Provider</span>
                  <Badge variant="outline">{status.service.provider.toUpperCase()}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Details</span>
                <span className="text-sm text-muted-foreground">{status?.service.details}</span>
              </div>
              {status?.statistics && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending Emails</span>
                    <Badge variant="secondary">{status.statistics.pendingEmails}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sent Today</span>
                    <Badge variant="secondary">{status.statistics.sentToday}</Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {!status?.service.configured && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="w-5 h-5" />
                  Configuration Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 mb-4">
                  Email service is not configured. Contact your system administrator to configure environment variables.
                </p>
                <Tabs defaultValue="sendgrid" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sendgrid">SendGrid (Recommended)</TabsTrigger>
                    <TabsTrigger value="smtp">SMTP</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sendgrid" className="space-y-4 mt-4">
                    <div className="space-y-4 p-4 bg-white rounded-lg border">
                      <h4 className="font-medium">SendGrid Configuration</h4>
                      <div className="space-y-2">
                        <Label htmlFor="sendgrid-api">API Key</Label>
                        <Input 
                          id="sendgrid-api"
                          type="password"
                          placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxx"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Set SENDGRID_API_KEY environment variable</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sendgrid-from">From Email</Label>
                        <Input 
                          id="sendgrid-from"
                          type="email"
                          placeholder="noreply@yourdomain.com"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Set SENDGRID_FROM_EMAIL (must be verified in SendGrid)</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sendgrid-name">From Name</Label>
                        <Input 
                          id="sendgrid-name"
                          type="text"
                          placeholder="Your Company Name"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Set SENDGRID_FROM_NAME environment variable</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="smtp" className="space-y-4 mt-4">
                    <div className="space-y-4 p-4 bg-white rounded-lg border">
                      <h4 className="font-medium">SMTP Configuration</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="smtp-host">Host</Label>
                          <Input 
                            id="smtp-host"
                            type="text"
                            placeholder="smtp.gmail.com"
                            disabled
                          />
                          <p className="text-xs text-muted-foreground">Set SMTP_HOST</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtp-port">Port</Label>
                          <Input 
                            id="smtp-port"
                            type="number"
                            placeholder="587"
                            disabled
                          />
                          <p className="text-xs text-muted-foreground">Set SMTP_PORT</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp-user">Username</Label>
                        <Input 
                          id="smtp-user"
                          type="email"
                          placeholder="your-email@gmail.com"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Set SMTP_USER environment variable</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp-pass">Password</Label>
                        <Input 
                          id="smtp-pass"
                          type="password"
                          placeholder="••••••••••••"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Set SMTP_PASS (use App Password for Gmail)</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send Test Email
              </CardTitle>
              <CardDescription>Test your email configuration by sending a test email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Recipient Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testType">Email Type</Label>
                <Select value={testType} onValueChange={(value: any) => setTestType(value)}>
                  <SelectTrigger id="testType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Test</SelectItem>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="invoice">Invoice Notification</SelectItem>
                    <SelectItem value="reminder">Payment Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {testType === "basic" && (
                <div className="space-y-2">
                  <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                  <Textarea
                    id="customMessage"
                    placeholder="Enter a custom message for the test email..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <Button
                onClick={handleSendTestEmail}
                disabled={!status?.canSendTestEmail || sendTestEmail.isPending}
                className="w-full"
              >
                {sendTestEmail.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Queue</CardTitle>
                  <CardDescription>Recent emails and their delivery status</CardDescription>
                </div>
                {status?.isSuperAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearFailedEmails.mutate()}
                    disabled={clearFailedEmails.isPending}
                  >
                    Clear Failed
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {queueLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : emailQueue?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No emails in queue
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {emailQueue?.map((email) => (
                      <div key={email.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(email.status)}
                              <span className="text-sm text-muted-foreground">
                                {new Date(email.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{email.subject}</p>
                            <p className="text-sm text-muted-foreground">To: {email.to}</p>
                            {email.errorMessage && (
                              <p className="text-sm text-red-600">Error: {email.errorMessage}</p>
                            )}
                            {email.attempts > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Attempts: {email.attempts}
                              </p>
                            )}
                          </div>
                          {email.status === "failed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => retryEmail.mutate(email.id)}
                              disabled={retryEmail.isPending}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Manage reusable email templates</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsTemplateDialogOpen(true);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : templates?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No email templates configured
                </div>
              ) : (
                <div className="space-y-2">
                  {templates?.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{template.name}</p>
                            <Badge variant="outline">{template.templateType}</Badge>
                            {template.isActive ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTemplate(template);
                            setIsTemplateDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}