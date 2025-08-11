import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  DollarSign,
  Calendar,
  FileText
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CommitStepProps {
  batchId: number;
  batchData: any;
  onComplete: (data: any) => void;
}

export function CommitStep({ batchId, batchData, onComplete }: CommitStepProps) {
  const { toast } = useToast();
  const [commitInProgress, setCommitInProgress] = useState(false);
  const [commitResults, setCommitResults] = useState<any>(null);
  const [autoCommit, setAutoCommit] = useState(false);

  // Fetch updated batch data
  const { data: currentBatchData, refetch } = useQuery({
    queryKey: ['/api/bank/import-batches', batchId],
    refetchInterval: commitInProgress ? 2000 : false,
  });

  // Commit batch mutation
  const commitBatchMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/bank/import-batches/${batchId}/commit`, {
        method: 'POST',
      });
    },
    onSuccess: (result) => {
      setCommitResults(result);
      setCommitInProgress(false);
      refetch();
      
      toast({
        title: "Import Completed Successfully",
        description: `Imported ${result.imported} transactions. ${result.skipped} duplicates skipped. ${result.failed} failed.`,
      });

      // Auto-complete after successful commit
      setTimeout(() => {
        onComplete({ 
          commitResults: result,
          batchData: currentBatchData 
        });
      }, 2000);
    },
    onError: (error: any) => {
      setCommitInProgress(false);
      toast({
        title: "Import Failed", 
        description: error.message || "Failed to import transactions",
        variant: "destructive"
      });
    }
  });

  // Auto-start commit if batch is validated and auto-commit is enabled
  useEffect(() => {
    const batch = currentBatchData || batchData;
    if (batch && batch.status === 'validated' && autoCommit && !commitInProgress && !commitResults) {
      setCommitInProgress(true);
      commitBatchMutation.mutate();
    }
  }, [currentBatchData, batchData, autoCommit]);

  const handleStartCommit = () => {
    setCommitInProgress(true);
    commitBatchMutation.mutate();
  };

  const handleRetryCommit = () => {
    setCommitResults(null);
    handleStartCommit();
  };

  const batch = currentBatchData || batchData;
  
  const getCommitProgress = () => {
    if (commitResults) return 100;
    if (commitInProgress) return 75;
    if (batch?.status === 'validated') return 50;
    return 25;
  };

  const formatCurrency = (amount: number | string) => {
    return `R ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            Import Transactions
          </CardTitle>
          <CardDescription>
            Final step: Import validated transactions into your bank account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Import Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Import Progress</span>
              <span className="text-sm text-muted-foreground">{getCommitProgress()}%</span>
            </div>
            <Progress value={getCommitProgress()} className="h-3" />
          </div>

          {/* Status Information */}
          {!commitInProgress && !commitResults && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Ready to import transactions</strong></p>
                  <p>Your bank statement has been validated and is ready for import into your account.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{batch?.newRows || 0}</p>
                      <p className="text-muted-foreground">New Transactions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-yellow-600">{batch?.duplicateRows || 0}</p>
                      <p className="text-muted-foreground">Duplicates (Skip)</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-red-600">{batch?.invalidRows || 0}</p>
                      <p className="text-muted-foreground">Invalid (Skip)</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{batch?.totalRows || 0}</p>
                      <p className="text-muted-foreground">Total Processed</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {commitInProgress && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Import in progress...</strong></p>
                  <p>Creating bank transactions from validated data. This may take a few moments.</p>
                  <p className="text-sm text-muted-foreground">
                    Please do not refresh or navigate away during the import process.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {commitResults && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p><strong>Import completed successfully!</strong></p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle size={20} className="text-green-600" />
                        <span className="font-semibold text-green-600">Successfully Imported</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{commitResults.imported}</p>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle size={20} className="text-yellow-600" />
                        <span className="font-semibold text-yellow-600">Skipped</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-700">{commitResults.skipped}</p>
                      <p className="text-sm text-muted-foreground">Duplicates</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle size={20} className="text-red-600" />
                        <span className="font-semibold text-red-600">Failed</span>
                      </div>
                      <p className="text-2xl font-bold text-red-700">{commitResults.failed || 0}</p>
                      <p className="text-sm text-muted-foreground">Errors</p>
                    </div>
                  </div>

                  {commitResults.imported > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Next steps:</strong> Your imported transactions are now available in your bank account. 
                        You can view them in the Bank Transactions page and begin reconciliation if needed.
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Import Summary Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <FileText size={18} />
                Import Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Batch Information</h5>
                    <div className="space-y-1 text-sm">
                      <p>Batch Number: <strong>#{batch?.batchNumber}</strong></p>
                      <p>File Name: <strong>{batch?.fileName}</strong></p>
                      <p>File Type: <strong>{batch?.fileType?.toUpperCase()}</strong></p>
                      <p>Status: <Badge className="ml-1">{batch?.status?.toUpperCase()}</Badge></p>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Transaction Summary</h5>
                    <div className="space-y-1 text-sm">
                      <p>Ready to Import: <strong className="text-green-600">{batch?.newRows || 0}</strong></p>
                      <p>Duplicates Detected: <strong className="text-yellow-600">{batch?.duplicateRows || 0}</strong></p>
                      <p>Invalid Transactions: <strong className="text-red-600">{batch?.invalidRows || 0}</strong></p>
                      <p>Total Processed: <strong className="text-blue-600">{batch?.totalRows || 0}</strong></p>
                    </div>
                  </div>
                </div>

                {commitResults && commitResults.imported > 0 && (
                  <div className="pt-4 border-t border-blue-200">
                    <h5 className="font-medium text-blue-700 mb-2">Import Results</h5>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div className="p-2 bg-green-100 rounded">
                        <p className="font-bold text-green-700">{commitResults.imported}</p>
                        <p className="text-green-600">Imported</p>
                      </div>
                      <div className="p-2 bg-yellow-100 rounded">
                        <p className="font-bold text-yellow-700">{commitResults.skipped}</p>
                        <p className="text-yellow-600">Skipped</p>
                      </div>
                      <div className="p-2 bg-red-100 rounded">
                        <p className="font-bold text-red-700">{commitResults.failed || 0}</p>
                        <p className="text-red-600">Failed</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            {commitResults?.failed > 0 && (
              <Button 
                variant="outline"
                onClick={handleRetryCommit}
                disabled={commitInProgress}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Retry Failed Imports
              </Button>
            )}

            <div className="flex gap-2 ml-auto">
              {!commitInProgress && !commitResults && (
                <Button 
                  onClick={handleStartCommit}
                  disabled={batch?.newRows === 0}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center gap-2"
                >
                  <Download size={16} />
                  Start Import ({batch?.newRows || 0} transactions)
                </Button>
              )}

              {commitResults && (
                <Button 
                  onClick={() => onComplete({ commitResults, batchData: batch })}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Complete Import Process
                </Button>
              )}
            </div>
          </div>

          {/* Process Information */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <h5 className="font-medium text-gray-700">What happens during import:</h5>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>New bank transactions are created in your accounting system</li>
                  <li>Each transaction includes date, description, reference, and amount</li>
                  <li>Duplicate transactions are automatically skipped to prevent errors</li>
                  <li>Invalid transactions are excluded and logged for review</li>
                  <li>Your bank account balance is updated accordingly</li>
                  <li>All changes are logged in the audit trail</li>
                </ul>
                <p className="mt-3 text-xs">
                  <strong>Note:</strong> Once imported, transactions can be viewed and managed in the Bank Transactions section.
                  You can categorize, reconcile, and generate reports from the imported data.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}