import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, CheckCircle, XCircle, AlertTriangle, Settings, FileText, Users, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SarsStatus {
  status: 'disconnected' | 'connected' | 'error';
  connected: boolean;
  linkedAt: string | null;
  lastSyncAt: string | null;
  error: string | null;
}

interface PayrollSubmission {
  id: string;
  submissionType: 'EMP201' | 'EMP501';
  periodMonth: number;
  periodYear: number;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'error';
  sarsReferenceNumber?: string;
  submittedAt?: string;
  error?: string;
}

interface IsvClientAccess {
  id: string;
  clientTaxNumber: string;
  clientName: string;
  accessLevel: 'full' | 'vat_only' | 'payroll_only';
  status: 'active' | 'suspended' | 'revoked';
  authorizedAt: string;
  lastAccessAt?: string;
}

export function SarsIntegration() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SARS connection status
  const { data: sarsStatus, isLoading } = useQuery<SarsStatus>({
    queryKey: ["/api/sars/status"],
    refetchInterval: 30000, // Check status every 30 seconds
  });

  // Fetch payroll submissions
  const { data: payrollSubmissions = [] } = useQuery<PayrollSubmission[]>({
    queryKey: ["/api/sars/payroll/submissions"],
    enabled: !!sarsStatus?.connected,
  });

  // Fetch ISV client access for tax practitioners
  const { data: isvClients = [] } = useQuery<IsvClientAccess[]>({
    queryKey: ["/api/sars/isv/access"],
    enabled: !!sarsStatus?.connected,
  });

  // Connect to SARS mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      // For sandbox mode, create connection directly
      await apiRequest("/api/sars/connect-sandbox", "POST");
      return { success: true };
    },
    onSuccess: (data: any) => {
      toast({
        title: "Connected to SARS Sandbox",
        description: "Sandbox connection established for testing",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sars/status"] });
      setIsConnecting(false);
    },
    onError: (error) => {
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to SARS",
        variant: "destructive",
      });
    },
  });

  // Test connection mutation
  const testMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/sars/test", "POST");
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Connection Test Successful",
          description: "SARS eFiling connection is working properly",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/sars/status"] });
      } else {
        toast({
          title: "Connection Test Failed",
          description: data.error || "Connection test failed",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test connection",
        variant: "destructive",
      });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/sars/disconnect", "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from SARS eFiling",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sars/status"] });
    },
    onError: (error) => {
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect",
        variant: "destructive",
      });
    },
  });

  // Check for connection success/error in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sarsParam = urlParams.get('sars');
    
    if (sarsParam === 'connected') {
      setIsConnecting(false);
      toast({
        title: "SARS Connected",
        description: "Successfully connected to SARS eFiling system",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sars/status"] });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (sarsParam === 'error') {
      setIsConnecting(false);
      const errorMessage = urlParams.get('message') || 'Connection failed';
      toast({
        title: "SARS Connection Failed",
        description: decodeURIComponent(errorMessage),
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast, queryClient]);

  const getStatusBadge = () => {
    if (isLoading) {
      return <Badge variant="secondary">Checking...</Badge>;
    }

    switch (sarsStatus?.status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>;
      case 'error':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>;
      default:
        return <Badge variant="secondary">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Not Connected
        </Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SARS eFiling Integration</h2>
          <p className="text-muted-foreground">
            Connect your company to SARS for automated VAT submissions
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Manage your SARS eFiling integration settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sarsStatus?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {sarsStatus.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Connection Status</div>
              <div className="text-sm text-muted-foreground">
                {sarsStatus?.connected ? 'Connected to SARS eFiling' : 'Not connected'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Last Connection</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(sarsStatus?.linkedAt || null)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Last Sync</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(sarsStatus?.lastSyncAt || null)}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!sarsStatus?.connected ? (
              <Button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending || isConnecting}
                className="flex items-center gap-2"
              >
                {connectMutation.isPending || isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Connect to SARS
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => testMutation.mutate()}
                  disabled={testMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {testMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Test Connection
                </Button>

                <Button
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  {disconnectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {sarsStatus?.connected && (
        <Card>
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
            <CardDescription>
              SARS eFiling integration features available for your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setLocation('/vat-returns')}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent hover:border-primary transition-colors cursor-pointer text-left"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">VAT201 Returns</div>
                  <div className="text-sm text-muted-foreground">
                    Submit VAT returns directly to SARS
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setLocation('/emp201')}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent hover:border-primary transition-colors cursor-pointer text-left"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">EMP201/EMP501</div>
                  <div className="text-sm text-muted-foreground">
                    Submit payroll returns to SARS
                  </div>
                </div>
              </button>

              <button 
                onClick={() => {
                  toast({
                    title: "ITR12/ITR14 Returns",
                    description: "Tax return submission coming soon. This feature is under development.",
                  });
                }}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent hover:border-primary transition-colors cursor-pointer text-left"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">ITR12/ITR14</div>
                  <div className="text-sm text-muted-foreground">
                    Individual and company tax returns
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {sarsStatus?.connected && (
        <Card>
          <CardHeader>
            <CardTitle>SARS Services</CardTitle>
            <CardDescription>
              Manage your SARS submissions and client access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="payroll" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="payroll">Payroll Returns</TabsTrigger>
                <TabsTrigger value="isv">Client Access</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="payroll" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">EMP201/EMP501 Submissions</h3>
                  <Button 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "New Payroll Submission",
                        description: "Navigate to Employee Management > Payroll to generate EMP201/EMP501 returns",
                      });
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    New Submission
                  </Button>
                </div>
                
                {payrollSubmissions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">{submission.submissionType}</TableCell>
                          <TableCell>{submission.periodMonth}/{submission.periodYear}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                submission.status === 'accepted' ? 'default' :
                                submission.status === 'submitted' ? 'secondary' :
                                submission.status === 'rejected' || submission.status === 'error' ? 'destructive' :
                                'outline'
                              }
                            >
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{submission.sarsReferenceNumber || '-'}</TableCell>
                          <TableCell>
                            {submission.submittedAt ? formatDate(submission.submittedAt) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No payroll submissions yet</p>
                    <p className="text-sm">Create your first EMP201 or EMP501 submission</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="isv" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">ISV Client Access</h3>
                  <Button 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Add SARS Client Access",
                        description: "Multi-client access for tax practitioners. Feature coming soon.",
                      });
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </div>
                
                {isvClients.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Tax Number</TableHead>
                        <TableHead>Access Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isvClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.clientName}</TableCell>
                          <TableCell>{client.clientTaxNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {client.accessLevel.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                client.status === 'active' ? 'default' :
                                client.status === 'suspended' ? 'secondary' :
                                'destructive'
                              }
                            >
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {client.lastAccessAt ? formatDate(client.lastAccessAt) : 'Never'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No client access configured</p>
                    <p className="text-sm">For Tax Practitioners: Authorize access to client companies</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <h3 className="text-lg font-medium">Compliance Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">VAT Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Next Due</span>
                        <Badge variant="outline">28 Feb 2025</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">EMP201 Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Next Due</span>
                        <Badge variant="outline">7 Feb 2025</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> SARS eFiling integration requires your company to be registered 
          with SARS and have the necessary permissions for electronic submissions. Contact your system 
          administrator if you need assistance with the initial setup.
        </AlertDescription>
      </Alert>
    </div>
  );
}