import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Globe, CheckCircle, AlertTriangle, RefreshCw, Download, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SARSeFilingProps {
  companyId: number;
}

const SARSeFiling: React.FC<SARSeFilingProps> = ({ companyId }) => {
  const [syncProgress, setSyncProgress] = useState(0);
  const { toast } = useToast();

  // Fetch SARS integration status
  const { data: sarsStatus, isLoading, refetch } = useQuery({
    queryKey: ['/api/sars/integration/status', companyId],
    queryFn: () => apiRequest(`/api/sars/integration/status`, 'GET'),
  });

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: () => apiRequest('/api/sars/integration/sync', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "SARS Sync Complete",
        description: `Successfully synced ${data.recordsSynced} records`,
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Unable to sync with SARS eFiling. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleManualSync = () => {
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    syncMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">SARS eFiling Integration</h2>
        <p className="text-gray-600 dark:text-gray-400">Direct integration with South African Revenue Service eFiling system</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SARS eFiling Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${(sarsStatus as any)?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {(sarsStatus as any)?.connected ? 'Connected to SARS eFiling' : 'Disconnected from SARS eFiling'}
              </span>
              <Badge variant={(sarsStatus as any)?.connected ? 'default' : 'destructive'}>
                {(sarsStatus as any)?.status || 'Unknown'}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={syncMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>

          {syncMutation.isPending && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Syncing with SARS...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="w-full" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">VAT Vendor Number</p>
              <p className="font-medium">{(sarsStatus as any)?.vatVendorNumber || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Last Sync</p>
              <p className="font-medium">
                {(sarsStatus as any)?.lastSync ? new Date((sarsStatus as any).lastSync).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* eFiling Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              VAT201 Submissions
            </CardTitle>
            <CardDescription>
              Automated VAT201 return submissions to SARS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Submissions</span>
              <Badge variant="outline">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed This Year</span>
              <Badge variant="default">8</Badge>
            </div>
            <Button className="w-full" variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Submit VAT201
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              SARS Statements
            </CardTitle>
            <CardDescription>
              Download official statements from SARS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Statement of Account</span>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tax Clearance</span>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">VAT Certificate</span>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent eFiling Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "VAT201 Submitted", status: "success", date: "2025-01-25", reference: "VAT-2025-001" },
              { action: "Payment Notification", status: "info", date: "2025-01-20", reference: "PAY-2025-012" },
              { action: "Statement Downloaded", status: "success", date: "2025-01-15", reference: "STMT-2025-Q1" },
              { action: "Sync Completed", status: "success", date: "2025-01-10", reference: "SYNC-2025-003" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 
                    activity.status === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.reference}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert for compliance */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          SARS eFiling integration requires valid VAT registration and approved API credentials. 
          Contact SARS or your tax advisor for eFiling access setup.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SARSeFiling;