import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Clock, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BankCaptureWizard } from "@/components/bank-capture/BankCaptureWizard";
import { ImportBatchList } from "@/components/bank-capture/ImportBatchList";

export default function BankCapture() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const accountId = urlParams.get('accountId');
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  // Fetch import batches
  const { data: batches, isLoading } = useQuery({
    queryKey: ['/api/bank/import-batches', accountId],
    enabled: true,
  });

  // Fetch bank accounts for dropdown
  const { data: bankAccounts } = useQuery({
    queryKey: ['/api/bank-accounts'],
  });

  const handleStartNewImport = () => {
    if (!accountId && bankAccounts?.length > 0) {
      navigate(`/bank/capture?accountId=${bankAccounts[0].id}`);
    }
    setSelectedBatchId(null);
  };

  const handleViewBatch = (batchId: number) => {
    setSelectedBatchId(batchId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processing: { color: "bg-blue-100 text-blue-800", icon: Clock, label: "Processing" },
      parsed: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle, label: "Parsed" },
      validated: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Validated" },
      completed: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle, label: "Completed" },
      failed: { color: "bg-red-100 text-red-800", icon: AlertCircle, label: "Failed" },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: AlertCircle, label: "Cancelled" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  if (selectedBatchId) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Bank Statement Import</h1>
            <p className="text-muted-foreground mt-2">
              Review and manage your bank statement import batch
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedBatchId(null)}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Back to Imports
          </Button>
        </div>

        <BankCaptureWizard 
          batchId={selectedBatchId} 
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/bank/import-batches'] });
            setSelectedBatchId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bank Capture: Statement Upload</h1>
          <p className="text-muted-foreground mt-2">
            Import and process bank statements with automatic duplicate detection and validation
          </p>
        </div>
        <Button 
          onClick={handleStartNewImport}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Statement
        </Button>
      </div>

      {!accountId && bankAccounts?.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <div>
                <p className="font-medium text-yellow-800">Select Bank Account</p>
                <p className="text-sm text-yellow-700">Choose a bank account to start importing statements</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {bankAccounts.slice(0, 3).map((account: any) => (
                <Button
                  key={account.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/bank/capture?accountId=${account.id}`)}
                  className="text-yellow-800 border-yellow-300"
                >
                  {account.accountName} - {account.bankName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Imports</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <ImportBatchList 
            batches={batches?.slice(0, 10) || []}
            isLoading={isLoading}
            onViewBatch={handleViewBatch}
            title="Recent Imports"
            emptyMessage="No recent imports found. Upload a bank statement to get started."
          />
        </TabsContent>

        <TabsContent value="processing">
          <ImportBatchList 
            batches={batches?.filter((b: any) => ['processing', 'parsed', 'validated'].includes(b.status)) || []}
            isLoading={isLoading}
            onViewBatch={handleViewBatch}
            title="Processing Imports"
            emptyMessage="No imports currently being processed."
          />
        </TabsContent>

        <TabsContent value="completed">
          <ImportBatchList 
            batches={batches?.filter((b: any) => b.status === 'completed') || []}
            isLoading={isLoading}
            onViewBatch={handleViewBatch}
            title="Completed Imports"
            emptyMessage="No completed imports found."
          />
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSpreadsheet className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{batches?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Imports</p>
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
                <p className="text-2xl font-bold">
                  {batches?.reduce((sum: number, batch: any) => sum + (batch.newRows || 0), 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Transactions Imported</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {batches?.reduce((sum: number, batch: any) => sum + (batch.duplicateRows || 0), 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Duplicates Skipped</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {batches?.filter((b: any) => ['processing', 'parsed', 'validated'].includes(b.status)).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Import Wizard */}
      {accountId && !selectedBatchId && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} />
              Start New Import
            </CardTitle>
            <CardDescription>
              Upload a bank statement file (CSV, OFX, QIF) to begin the import process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BankCaptureWizard 
              bankAccountId={parseInt(accountId)}
              onComplete={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/bank/import-batches'] });
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}