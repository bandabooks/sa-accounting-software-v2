import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Save, 
  CheckCircle,
  Clock,
  Calculator,
  CreditCard,
  Calendar,
  X,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

// Using the exact same structure as journal entries
interface BulkEntryLine {
  id?: number;
  accountId: number | string;
  description: string;
  debitAmount: string;
  creditAmount: string;
  reference?: string;
}

interface BulkEntry {
  id?: number;
  transactionDate: string;
  description: string;
  reference: string;
  totalDebit: string;
  totalCredit: string;
  lines: BulkEntryLine[];
}

const BulkCaptureNew = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [entries, setEntries] = useState<BulkEntry[]>([]);
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<BulkEntry[]>([]);

  // Fetch chart of accounts - same query as journal entries
  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/chart-of-accounts"],
  });

  // Filter accounts based on search term - same logic as journal entries
  const filteredAccounts = accounts.filter((account: any) =>
    account.accountName.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
    account.accountCode.toLowerCase().includes(accountSearchTerm.toLowerCase())
  );

  // Initialize entries with proper defaults
  const initializeEntries = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const defaultEntries: BulkEntry[] = Array.from({ length: 5 }, (_, i) => ({
      transactionDate: today,
      description: '',
      reference: '',
      totalDebit: '0.00',
      totalCredit: '0.00',
      lines: activeTab === 'income' ? [
        // Income: Credit Revenue Account, Debit Bank/Cash Account
        {
          accountId: '',
          description: '',
          debitAmount: '0.00',
          creditAmount: '0.00',
          reference: ''
        },
        {
          accountId: '',
          description: '',
          debitAmount: '0.00',
          creditAmount: '0.00',
          reference: ''
        }
      ] : [
        // Expense: Debit Expense Account, Credit Bank/Cash Account
        {
          accountId: '',
          description: '',
          debitAmount: '0.00',
          creditAmount: '0.00',
          reference: ''
        },
        {
          accountId: '',
          description: '',
          debitAmount: '0.00',
          creditAmount: '0.00',
          reference: ''
        }
      ]
    }));
    setEntries(defaultEntries);
  }, [activeTab]);

  // Initialize on mount and tab change
  useEffect(() => {
    initializeEntries();
  }, [initializeEntries]);

  // Update entry field - same validation logic as journal entries
  const updateEntry = useCallback((entryIndex: number, field: string, value: string) => {
    setEntries(prev => {
      const updated = [...prev];
      const entry = { ...updated[entryIndex] };
      (entry as any)[field] = value;
      updated[entryIndex] = entry;
      return updated;
    });
  }, []);

  // Update line field with balance calculation - same as journal entries
  const updateLine = useCallback((entryIndex: number, lineIndex: number, field: string, value: string | number) => {
    setEntries(prev => {
      const updated = [...prev];
      const entry = { ...updated[entryIndex] };
      const lines = [...entry.lines];
      const line = { ...lines[lineIndex] };
      
      (line as any)[field] = value;
      lines[lineIndex] = line;
      
      // Recalculate totals - same logic as journal entries
      const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debitAmount) || 0), 0);
      const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.creditAmount) || 0), 0);
      
      entry.lines = lines;
      entry.totalDebit = totalDebit.toFixed(2);
      entry.totalCredit = totalCredit.toFixed(2);
      
      updated[entryIndex] = entry;
      return updated;
    });
  }, []);

  // Add new line to entry
  const addLine = useCallback((entryIndex: number) => {
    setEntries(prev => {
      const updated = [...prev];
      const entry = { ...updated[entryIndex] };
      entry.lines = [...entry.lines, {
        accountId: '',
        description: '',
        debitAmount: '0.00',
        creditAmount: '0.00',
        reference: ''
      }];
      updated[entryIndex] = entry;
      return updated;
    });
  }, []);

  // Remove line from entry
  const removeLine = useCallback((entryIndex: number, lineIndex: number) => {
    setEntries(prev => {
      const updated = [...prev];
      const entry = { ...updated[entryIndex] };
      entry.lines = entry.lines.filter((_, idx) => idx !== lineIndex);
      
      // Recalculate totals
      const totalDebit = entry.lines.reduce((sum, l) => sum + (parseFloat(l.debitAmount) || 0), 0);
      const totalCredit = entry.lines.reduce((sum, l) => sum + (parseFloat(l.creditAmount) || 0), 0);
      entry.totalDebit = totalDebit.toFixed(2);
      entry.totalCredit = totalCredit.toFixed(2);
      
      updated[entryIndex] = entry;
      return updated;
    });
  }, []);

  // Add more entries
  const addMoreEntries = useCallback((count: number = 5) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntries: BulkEntry[] = Array.from({ length: count }, () => ({
      transactionDate: today,
      description: '',
      reference: '',
      totalDebit: '0.00',
      totalCredit: '0.00',
      lines: activeTab === 'income' ? [
        {
          accountId: '',
          description: '',
          debitAmount: '0.00',
          creditAmount: '0.00',
          reference: ''
        },
        {
          accountId: '',
          description: '',
          debitAmount: '0.00',
          creditAmount: '0.00',
          reference: ''
        }
      ] : [
        {
          accountId: '',
          description: '',
          debitAmount: '0.00',
          creditAmount: '0.00',
          reference: ''
        },
        {
          accountId: '',
          description: '',
          debitAmount: '0.00',
          creditAmount: '0.00',
          reference: ''
        }
      ]
    }));
    setEntries(prev => [...prev, ...newEntries]);
  }, [activeTab]);

  // Validate entries before submission - same validation as journal entries
  const validateEntries = useCallback(() => {
    const validEntries = entries.filter(entry => {
      // Must have description and at least one line with amount
      if (!entry.description.trim()) return false;
      
      // Must have balanced entries (debit = credit)
      const debitTotal = parseFloat(entry.totalDebit) || 0;
      const creditTotal = parseFloat(entry.totalCredit) || 0;
      if (Math.abs(debitTotal - creditTotal) > 0.01) return false;
      
      // Must have at least one non-zero amount
      const hasAmount = entry.lines.some(line => 
        (parseFloat(line.debitAmount) || 0) > 0 || (parseFloat(line.creditAmount) || 0) > 0
      );
      if (!hasAmount) return false;
      
      // All lines must have valid accounts
      const hasValidAccounts = entry.lines.every(line => 
        line.accountId && line.accountId !== ''
      );
      if (!hasValidAccounts) return false;
      
      return true;
    });
    
    return validEntries;
  }, [entries]);

  // Submit bulk entries - same API structure as journal entries
  const submitMutation = useMutation({
    mutationFn: async (validEntries: BulkEntry[]) => {
      const responses = [];
      
      for (const entry of validEntries) {
        const response = await apiRequest('/api/journal-entries', 'POST', {
          entry: {
            entryNumber: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            transactionDate: entry.transactionDate,
            description: entry.description,
            reference: entry.reference,
            totalDebit: entry.totalDebit,
            totalCredit: entry.totalCredit,
            sourceModule: activeTab === 'income' ? 'bulk-income' : 'bulk-expense',
            sourceId: null
          },
          lines: entry.lines.map(line => ({
            accountId: typeof line.accountId === 'string' ? parseInt(line.accountId) : line.accountId,
            description: line.description || entry.description,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            reference: line.reference || entry.reference
          }))
        });
        responses.push(response);
      }
      
      return responses;
    },
    onSuccess: (responses) => {
      toast({
        title: "Success",
        description: `Successfully created ${responses.length} ${activeTab} entries`,
      });
      // Reset form
      initializeEntries();
      setShowConfirmDialog(false);
      setPendingSubmission([]);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to create ${activeTab} entries`,
        variant: "destructive",
      });
    },
  });

  // Handle submit button click
  const handleSubmit = useCallback(() => {
    const validEntries = validateEntries();
    
    if (validEntries.length === 0) {
      toast({
        title: "No Valid Entries",
        description: "Please ensure all entries have descriptions, balanced amounts, and valid accounts selected.",
        variant: "destructive",
      });
      return;
    }
    
    setPendingSubmission(validEntries);
    setShowConfirmDialog(true);
  }, [validateEntries, toast]);

  // Confirm submission
  const confirmSubmit = useCallback(() => {
    if (pendingSubmission.length > 0) {
      submitMutation.mutate(pendingSubmission);
    }
  }, [pendingSubmission, submitMutation]);

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    const validEntries = validateEntries();
    const totalAmount = validEntries.reduce((sum, entry) => 
      sum + (parseFloat(entry.totalDebit) || 0), 0
    );
    
    return {
      validEntries: validEntries.length,
      totalEntries: entries.length,
      totalAmount: totalAmount.toFixed(2)
    };
  }, [entries, validateEntries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Calculator className="mr-3 h-8 w-8" />
              Bulk Capture
            </h1>
            <p className="text-blue-100 mt-2">
              Professional bulk entry for {activeTab} transactions using proven journal entry logic
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Active Entries</div>
            <div className="text-2xl font-bold">{summaryStats.validEntries}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'income' | 'expense')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Income Capture
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex items-center">
            <TrendingDown className="w-4 h-4 mr-2" />
            Expense Capture
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valid Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {summaryStats.validEntries} / {summaryStats.totalEntries}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  R {summaryStats.totalAmount}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Entry Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={activeTab === 'income' ? 'default' : 'secondary'} className="text-sm">
                  {activeTab === 'income' ? 'Income' : 'Expense'} Entries
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => addMoreEntries(5)}>
                <Plus className="w-4 h-4 mr-2" />
                Add 5 Entries
              </Button>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={submitMutation.isPending || summaryStats.validEntries === 0}
              className={`${
                activeTab === 'income' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              {submitMutation.isPending ? 'Saving...' : `Save ${summaryStats.validEntries} Entries`}
            </Button>
          </div>

          {/* Entries */}
          <div className="space-y-6">
            {entries.map((entry, entryIndex) => (
              <Card key={entryIndex} className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Entry {entryIndex + 1}</span>
                    <div className="flex items-center space-x-2">
                      {/* Balance indicator */}
                      {Math.abs(parseFloat(entry.totalDebit) - parseFloat(entry.totalCredit)) < 0.01 ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Balanced
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <X className="w-3 h-3 mr-1" />
                          Unbalanced
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        Dr: R{entry.totalDebit} | Cr: R{entry.totalCredit}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Entry header fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`date-${entryIndex}`}>Transaction Date</Label>
                      <Input
                        id={`date-${entryIndex}`}
                        type="date"
                        value={entry.transactionDate}
                        onChange={(e) => updateEntry(entryIndex, 'transactionDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`description-${entryIndex}`}>Description *</Label>
                      <Input
                        id={`description-${entryIndex}`}
                        value={entry.description}
                        onChange={(e) => updateEntry(entryIndex, 'description', e.target.value)}
                        placeholder={`${activeTab === 'income' ? 'Revenue' : 'Expense'} description...`}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`reference-${entryIndex}`}>Reference</Label>
                      <Input
                        id={`reference-${entryIndex}`}
                        value={entry.reference}
                        onChange={(e) => updateEntry(entryIndex, 'reference', e.target.value)}
                        placeholder="Reference number..."
                      />
                    </div>
                  </div>

                  {/* Journal Lines */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Journal Lines</Label>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => addLine(entryIndex)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Line
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800 grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <div className="col-span-3">Account</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-2">Debit</div>
                        <div className="col-span-2">Credit</div>
                        <div className="col-span-1">Reference</div>
                        <div className="col-span-1">Actions</div>
                      </div>

                      {entry.lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="grid grid-cols-12 gap-2 p-3 border-t">
                          {/* Account Select */}
                          <div className="col-span-3">
                            <Select
                              value={line.accountId ? line.accountId.toString() : ''}
                              onValueChange={(value) => updateLine(entryIndex, lineIndex, 'accountId', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                <div className="sticky top-0 p-2 border-b bg-white dark:bg-gray-950">
                                  <Input
                                    placeholder="Search accounts..."
                                    value={accountSearchTerm}
                                    onChange={(e) => setAccountSearchTerm(e.target.value)}
                                    className="h-8"
                                  />
                                </div>
                                {filteredAccounts.map((account: any) => (
                                  <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.accountCode} - {account.accountName}
                                  </SelectItem>
                                ))}
                                {filteredAccounts.length === 0 && accountSearchTerm && (
                                  <div className="p-2 text-sm text-gray-500 text-center">
                                    No accounts found matching "{accountSearchTerm}"
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Description */}
                          <div className="col-span-3">
                            <Input
                              value={line.description}
                              onChange={(e) => updateLine(entryIndex, lineIndex, 'description', e.target.value)}
                              placeholder="Line description..."
                              className="h-9"
                            />
                          </div>

                          {/* Debit */}
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={line.debitAmount}
                              onChange={(e) => updateLine(entryIndex, lineIndex, 'debitAmount', e.target.value)}
                              placeholder="0.00"
                              className="h-9"
                            />
                          </div>

                          {/* Credit */}
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={line.creditAmount}
                              onChange={(e) => updateLine(entryIndex, lineIndex, 'creditAmount', e.target.value)}
                              placeholder="0.00"
                              className="h-9"
                            />
                          </div>

                          {/* Reference */}
                          <div className="col-span-1">
                            <Input
                              value={line.reference || ''}
                              onChange={(e) => updateLine(entryIndex, lineIndex, 'reference', e.target.value)}
                              placeholder="Ref"
                              className="h-9"
                            />
                          </div>

                          {/* Actions */}
                          <div className="col-span-1">
                            {entry.lines.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLine(entryIndex, lineIndex)}
                                className="h-9 w-9 p-0 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirm Bulk Entry Creation
            </DialogTitle>
            <DialogDescription className="text-base">
              You are about to create <strong>{pendingSubmission.length}</strong> {activeTab} journal entries.
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm space-y-1">
                  <div><strong>Total Amount:</strong> R {summaryStats.totalAmount}</div>
                  <div><strong>Entry Type:</strong> {activeTab === 'income' ? 'Income' : 'Expense'}</div>
                  <div><strong>Source Module:</strong> bulk-{activeTab}</div>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone. The entries will be posted to your general ledger.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmSubmit}
              disabled={submitMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitMutation.isPending ? 'Creating...' : 'Create Entries'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkCaptureNew;