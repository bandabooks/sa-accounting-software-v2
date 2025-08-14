import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Clock, Landmark, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BankFeedDashboard } from "@/components/stitch/BankFeedDashboard";

export default function BankCaptureFixed() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("bank-feeds");

  // Fetch bank accounts from Chart of Accounts
  const { data: bankAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    select: (data: any) => {
      // Filter for bank accounts (Asset type, codes 1110-1199)
      if (!Array.isArray(data)) return [];
      return data.filter((account: any) => 
        account.accountType === 'Asset' && 
        account.accountCode >= '1110' && 
        account.accountCode <= '1199'
      );
    }
  });

  // Mock data for demonstration - in production, this would come from the API
  const mockBatches = [
    {
      id: 1,
      batchNumber: "IMP-2025-0001",
      fileName: "bank_statement_jan_2025.csv",
      bankAccountName: "FNB Business Account",
      status: "completed",
      totalRows: 150,
      newRows: 145,
      duplicateRows: 5,
      uploadedAt: new Date("2025-01-15"),
      uploaderName: "Admin User"
    },
    {
      id: 2,
      batchNumber: "IMP-2025-0002",
      fileName: "nedbank_statement.ofx",
      bankAccountName: "Nedbank Current",
      status: "processing",
      totalRows: 75,
      newRows: 0,
      duplicateRows: 0,
      uploadedAt: new Date("2025-01-20"),
      uploaderName: "Admin User"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processing: { color: "bg-blue-100 text-blue-800", icon: Clock, label: "Processing" },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Completed" },
      failed: { color: "bg-red-100 text-red-800", icon: AlertCircle, label: "Failed" }
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

  if (accountsLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bank capture module...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bank Capture & Feeds</h1>
          <p className="text-muted-foreground mt-2">
            Import bank statements or connect to automated bank feeds for real-time transaction syncing
          </p>
        </div>
        <Button 
          onClick={() => navigate('/banking')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Statement
        </Button>
      </div>

      {/* Bank Accounts Overview */}
      {bankAccounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {bankAccounts.slice(0, 3).map((account: any) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Landmark className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{account.accountName}</p>
                      <p className="text-xs text-muted-foreground">{account.accountCode}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="font-semibold">R {account.balance || '0.00'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bank-feeds" className="flex items-center gap-2">
            <Landmark size={16} />
            Bank Feeds
          </TabsTrigger>
          <TabsTrigger value="recent">Recent Imports</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="bank-feeds">
          <BankFeedDashboard />
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Imports</CardTitle>
              <CardDescription>Your recently uploaded bank statements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className="text-muted-foreground" size={20} />
                      <div>
                        <p className="font-medium">{batch.fileName}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">{batch.bankAccountName}</span>
                          <span className="text-xs text-muted-foreground">
                            {batch.uploadedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{batch.newRows} transactions</p>
                        <p className="text-xs text-muted-foreground">{batch.duplicateRows} duplicates</p>
                      </div>
                      {getStatusBadge(batch.status)}
                    </div>
                  </div>
                ))}
                {mockBatches.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent imports found. Upload a bank statement to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Processing Imports</CardTitle>
              <CardDescription>Statements currently being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBatches.filter(b => b.status === 'processing').map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className="text-muted-foreground" size={20} />
                      <div>
                        <p className="font-medium">{batch.fileName}</p>
                        <p className="text-xs text-muted-foreground">{batch.bankAccountName}</p>
                      </div>
                    </div>
                    {getStatusBadge(batch.status)}
                  </div>
                ))}
                {mockBatches.filter(b => b.status === 'processing').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No imports currently being processed.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Imports</CardTitle>
              <CardDescription>Successfully processed statements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBatches.filter(b => b.status === 'completed').map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className="text-muted-foreground" size={20} />
                      <div>
                        <p className="font-medium">{batch.fileName}</p>
                        <p className="text-xs text-muted-foreground">{batch.bankAccountName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{batch.newRows} imported</p>
                        <p className="text-xs text-muted-foreground">{batch.duplicateRows} skipped</p>
                      </div>
                      {getStatusBadge(batch.status)}
                    </div>
                  </div>
                ))}
                {mockBatches.filter(b => b.status === 'completed').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed imports found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
                <p className="text-2xl font-bold">{mockBatches.length}</p>
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
                  {mockBatches.reduce((sum, batch) => sum + batch.newRows, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Transactions</p>
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
                  {mockBatches.reduce((sum, batch) => sum + batch.duplicateRows, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Duplicates</p>
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
                  {mockBatches.filter(b => b.status === 'processing').length}
                </p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}