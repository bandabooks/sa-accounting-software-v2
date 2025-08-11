import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Loader2, RefreshCw, Eye } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ValidationStepProps {
  batchId: number;
  onComplete: (data: any) => void;
}

export function ValidationStep({ batchId, onComplete }: ValidationStepProps) {
  const { toast } = useToast();
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  // Fetch batch data
  const { data: batchData, refetch: refetchBatch } = useQuery({
    queryKey: ['/api/bank/import-batches', batchId],
    refetchInterval: validationInProgress ? 2000 : false,
  });

  // Validate batch mutation
  const validateBatchMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/bank/import-batches/${batchId}/validate`, {
        method: 'POST',
      });
    },
    onSuccess: (result) => {
      setValidationResults(result);
      setValidationInProgress(false);
      refetchBatch();
      toast({
        title: "Validation Complete",
        description: `Found ${result.newRows} new transactions and ${result.duplicateRows} duplicates.`,
      });
    },
    onError: (error: any) => {
      setValidationInProgress(false);
      toast({
        title: "Validation Failed", 
        description: error.message || "Failed to validate batch",
        variant: "destructive"
      });
    }
  });

  // Auto-start validation if batch is ready
  useEffect(() => {
    if (batchData && batchData.status === 'parsed' && !validationInProgress && !validationResults) {
      setValidationInProgress(true);
      validateBatchMutation.mutate();
    }
  }, [batchData]);

  const handleRetryValidation = () => {
    setValidationInProgress(true);
    setValidationResults(null);
    validateBatchMutation.mutate();
  };

  const handleContinueToReview = () => {
    onComplete({ 
      validationResults,
      batchData 
    });
  };

  const getValidationProgress = () => {
    if (!batchData) return 0;
    if (batchData.status === 'processing') return 25;
    if (batchData.status === 'parsed') return 50;
    if (batchData.status === 'validated' || validationResults) return 100;
    return 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={20} />
            Data Validation & Duplicate Detection
          </CardTitle>
          <CardDescription>
            Validating imported data and checking for duplicate transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Validation Progress</span>
              <span className="text-sm text-muted-foreground">{getValidationProgress()}%</span>
            </div>
            <Progress value={getValidationProgress()} className="h-3" />
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {batchData?.totalRows || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Rows</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {validationResults?.newRows || batchData?.newRows || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">New Transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {validationResults?.duplicateRows || batchData?.duplicateRows || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Duplicates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {validationResults?.invalidRows || batchData?.invalidRows || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Invalid Rows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Status */}
          {validationInProgress && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Validation in progress...</strong></p>
                  <p>Checking for duplicate transactions within ±3 days with similar amounts and descriptions.</p>
                  <p className="text-sm text-muted-foreground">
                    This process may take a few moments depending on your transaction history.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validationResults && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Validation completed successfully!</strong></p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{validationResults.newRows}</p>
                      <p className="text-muted-foreground">Ready to import</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-yellow-600">{validationResults.duplicateRows}</p>
                      <p className="text-muted-foreground">Duplicates found</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-red-600">{validationResults.invalidRows}</p>
                      <p className="text-muted-foreground">Invalid rows</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{validationResults.totalRows}</p>
                      <p className="text-muted-foreground">Total processed</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Duplicate Detection Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm text-blue-800">Duplicate Detection Logic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700 space-y-2">
                <p>Transactions are considered duplicates when they match on:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Same bank account</li>
                  <li>Transaction dates within ±3 days</li>
                  <li>Identical transaction amounts</li>
                  <li>Similar descriptions (normalized)</li>
                  <li>Same reference numbers (if available)</li>
                </ul>
                <p className="mt-2">
                  <strong>Note:</strong> Duplicate transactions will be automatically excluded from import 
                  but can be reviewed and manually included if needed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={handleRetryValidation}
              disabled={validationInProgress}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Retry Validation
            </Button>

            <Button 
              onClick={handleContinueToReview}
              disabled={!validationResults || validationInProgress}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Continue to Review
            </Button>
          </div>

          {/* Validation Summary */}
          {validationResults && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Validation Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-green-700 mb-2">Ready for Import</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• {validationResults.newRows} new transactions validated</li>
                    <li>• All required fields present</li>
                    <li>• Date and amount formats verified</li>
                    <li>• No duplicates detected in this set</li>
                  </ul>
                </div>
                
                {validationResults.duplicateRows > 0 && (
                  <div>
                    <h5 className="font-medium text-yellow-700 mb-2">Duplicates Detected</h5>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• {validationResults.duplicateRows} potential duplicates found</li>
                      <li>• Matched against existing transactions</li>
                      <li>• Will be excluded from import by default</li>
                      <li>• Can be reviewed and manually included</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}