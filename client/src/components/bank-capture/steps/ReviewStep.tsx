import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, CheckCircle, AlertTriangle, DollarSign, Calendar, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface ReviewStepProps {
  batchId: number;
  batchData: any;
  onComplete: (data: any) => void;
}

export function ReviewStep({ batchId, batchData, onComplete }: ReviewStepProps) {
  const { toast } = useToast();
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);

  // Fetch queue items
  const { data: queueData, refetch } = useQuery({
    queryKey: ['/api/bank/import-batches', batchId],
    refetchInterval: false,
  });

  // Toggle import selection mutation
  const toggleImportMutation = useMutation({
    mutationFn: async ({ itemId, willImport }: { itemId: number, willImport: boolean }) => {
      return apiRequest(`/api/bank/import-queue/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ willImport }),
      });
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed", 
        description: error.message || "Failed to update transaction",
        variant: "destructive"
      });
    }
  });

  const handleToggleImport = (itemId: number, willImport: boolean) => {
    toggleImportMutation.mutate({ itemId, willImport });
  };

  const handleContinue = () => {
    onComplete({ queueData });
  };

  const queueItems = queueData?.queueItems || [];
  const validItems = queueItems.filter((item: any) => item.status === 'validated' || item.status === 'duplicate');
  const invalidItems = queueItems.filter((item: any) => item.status === 'invalid');
  const duplicateItems = queueItems.filter((item: any) => item.status === 'duplicate');
  const itemsToImport = queueItems.filter((item: any) => item.willImport);

  const formatCurrency = (amount: number | string) => {
    return `R ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM yyyy');
  };

  const getStatusBadge = (status: string) => {
    const config = {
      validated: { color: "bg-green-100 text-green-800", label: "Ready" },
      duplicate: { color: "bg-yellow-100 text-yellow-800", label: "Duplicate" },
      invalid: { color: "bg-red-100 text-red-800", label: "Invalid" },
    };

    const statusInfo = config[status as keyof typeof config] || config.validated;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Review Import Queue
          </CardTitle>
          <CardDescription>
            Review transactions before importing. You can include or exclude individual transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{queueItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-green-600">{itemsToImport.length}</p>
                <p className="text-sm text-muted-foreground">Will Import</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{duplicateItems.length}</p>
                <p className="text-sm text-muted-foreground">Duplicates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-red-600">{invalidItems.length}</p>
                <p className="text-sm text-muted-foreground">Invalid</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-duplicates" 
                checked={showDuplicates}
                onCheckedChange={setShowDuplicates}
              />
              <label htmlFor="show-duplicates" className="text-sm font-medium">
                Show Duplicates ({duplicateItems.length})
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-invalid" 
                checked={showInvalid}
                onCheckedChange={setShowInvalid}
              />
              <label htmlFor="show-invalid" className="text-sm font-medium">
                Show Invalid ({invalidItems.length})
              </label>
            </div>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Preview</CardTitle>
              <CardDescription>
                Review and adjust which transactions will be imported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Import</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queueItems
                      .filter((item: any) => {
                        if (item.status === 'duplicate' && !showDuplicates) return false;
                        if (item.status === 'invalid' && !showInvalid) return false;
                        return true;
                      })
                      .slice(0, 50) // Limit display to first 50 items
                      .map((item: any) => (
                        <TableRow key={item.id} className={item.willImport ? '' : 'opacity-50'}>
                          <TableCell>
                            <Checkbox
                              checked={item.willImport}
                              onCheckedChange={(checked) => 
                                handleToggleImport(item.id, checked as boolean)
                              }
                              disabled={item.status === 'invalid' || toggleImportMutation.isPending}
                            />
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-muted-foreground" />
                              {formatDate(item.postingDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-64">
                              <p className="truncate font-medium">{item.description}</p>
                              {item.normalizedDescription !== item.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  Normalized: {item.normalizedDescription}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">{item.reference || 'N/A'}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <DollarSign size={14} className="text-muted-foreground" />
                              <span className={`font-medium ${
                                item.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(Math.abs(item.amount))}
                              </span>
                              {item.amount > 0 ? (
                                <span className="text-xs text-green-600">CR</span>
                              ) : (
                                <span className="text-xs text-red-600">DR</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.balance && (
                              <span className="text-muted-foreground">
                                {formatCurrency(item.balance)}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {queueItems.length > 50 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Showing first 50 transactions. All {queueItems.length} transactions will be processed during import.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Validation Issues */}
          {invalidItems.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>{invalidItems.length} invalid transactions found:</strong></p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {invalidItems.slice(0, 5).map((item: any, index: number) => (
                      <li key={index}>
                        Row {item.rowNumber}: {item.validationErrors?.join(', ') || 'Invalid data format'}
                      </li>
                    ))}
                  </ul>
                  {invalidItems.length > 5 && (
                    <p className="text-sm">... and {invalidItems.length - 5} more invalid transactions</p>
                  )}
                  <p className="text-sm font-medium">These transactions will be excluded from import.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Import Summary */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">Import Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-700">Transactions to Import</p>
                  <p className="text-2xl font-bold text-green-800">{itemsToImport.length}</p>
                </div>
                <div>
                  <p className="font-medium text-green-700">Total Debits</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(
                      itemsToImport
                        .filter((item: any) => item.amount < 0)
                        .reduce((sum: number, item: any) => sum + Math.abs(item.amount), 0)
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-green-700">Total Credits</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      itemsToImport
                        .filter((item: any) => item.amount > 0)
                        .reduce((sum: number, item: any) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-300">
                <p className="text-sm text-green-700">
                  Ready to import {itemsToImport.length} transactions into your bank account.
                  {duplicateItems.length > 0 && ` ${duplicateItems.length} duplicates will be skipped.`}
                  {invalidItems.length > 0 && ` ${invalidItems.length} invalid transactions will be excluded.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleContinue}
              disabled={itemsToImport.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Proceed to Import ({itemsToImport.length} transactions)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}