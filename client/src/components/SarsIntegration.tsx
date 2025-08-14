import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, CheckCircle, XCircle, AlertTriangle, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SarsStatus {
  status: 'disconnected' | 'connected' | 'error';
  connected: boolean;
  linkedAt: string | null;
  lastSyncAt: string | null;
  error: string | null;
}

export function SarsIntegration() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SARS connection status
  const { data: sarsStatus, isLoading } = useQuery<SarsStatus>({
    queryKey: ["/api/sars/status"],
    refetchInterval: 30000, // Check status every 30 seconds
  });

  // Connect to SARS mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/sars/auth-url");
      return response;
    },
    onSuccess: (data) => {
      setIsConnecting(true);
      // Redirect to SARS OAuth
      window.location.href = data.authUrl;
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
      return await apiRequest("/api/sars/test", {
        method: "POST",
      });
    },
    onSuccess: (data) => {
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
      return await apiRequest("/api/sars/disconnect", {
        method: "DELETE",
      });
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
                {formatDate(sarsStatus?.linkedAt)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Last Sync</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(sarsStatus?.lastSyncAt)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">VAT201 Submissions</div>
                  <div className="text-sm text-muted-foreground">
                    Submit VAT returns directly to SARS
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Status Tracking</div>
                  <div className="text-sm text-muted-foreground">
                    Track submission status and responses
                  </div>
                </div>
              </div>
            </div>
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