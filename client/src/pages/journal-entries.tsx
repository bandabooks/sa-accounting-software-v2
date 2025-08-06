import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJournalEntrySchema, type JournalEntryWithLines } from "@shared/schema";
import { Plus, Search, Edit, FileCheck, RotateCcw, Trash2, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";

const journalEntryFormSchema = insertJournalEntrySchema.omit({ 
  companyId: true, 
  createdBy: true, 
  createdAt: true, 
  updatedAt: true 
});

const journalLineSchema = z.object({
  accountId: z.union([z.string(), z.number()]).refine(val => {
    const num = typeof val === 'string' ? parseInt(val) : val;
    return !isNaN(num) && num > 0;
  }, "Account is required"),
  description: z.string().min(1, "Description is required"),
  debitAmount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Invalid debit amount"),
  creditAmount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Invalid credit amount"),
  reference: z.string().optional(),
});

const journalEntryWithLinesSchema = z.object({
  entry: journalEntryFormSchema,
  lines: z.array(journalLineSchema).min(2, "At least 2 journal lines are required"),
}).refine(data => {
  const totalDebits = data.lines.reduce((sum, line) => sum + parseFloat(line.debitAmount), 0);
  const totalCredits = data.lines.reduce((sum, line) => sum + parseFloat(line.creditAmount), 0);
  return Math.abs(totalDebits - totalCredits) < 0.01;
}, {
  message: "Total debits must equal total credits",
  path: ["lines"],
});

type JournalEntryFormData = z.infer<typeof journalEntryWithLinesSchema>;

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(parseFloat(amount));
};

export default function JournalEntries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryWithLines | null>(null);
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'create' | 'post' | 'reverse';
    entry?: JournalEntryWithLines;
    data?: any;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'create',
    onConfirm: () => {},
  });
  const [reverseDescription, setReverseDescription] = useState("");
  const { toast } = useToast();
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/journal-entries"],
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/chart-of-accounts"],
  });

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter((account: any) =>
    account.accountName.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
    account.accountCode.toLowerCase().includes(accountSearchTerm.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (data: JournalEntryFormData) => apiRequest("/api/journal-entries", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      setIsCreateDialogOpen(false);
      form.reset();
      successModal.showSuccess({
        title: "Journal Entry Created Successfully",
        description: "Your journal entry has been saved and added to the general ledger.",
        confirmText: "Continue"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive",
      });
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/journal-entries/${id}/post`, "PUT"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      successModal.showSuccess({
        title: "Journal Entry Posted Successfully",
        description: "The journal entry has been posted to the general ledger and is now final.",
        confirmText: "Continue"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post journal entry",
        variant: "destructive",
      });
    },
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, description }: { id: number; description: string }) =>
      apiRequest(`/api/journal-entries/${id}/reverse`, "POST", { description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      successModal.showSuccess({
        title: "Journal Entry Reversed Successfully",
        description: "The journal entry has been reversed and a new reversing entry has been created.",
        confirmText: "Continue"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reverse journal entry",
        variant: "destructive",
      });
    },
  });

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntryWithLinesSchema),
    defaultValues: {
      entry: {
        entryNumber: `je${Date.now().toString().slice(-8)}`,
        transactionDate: new Date().toISOString().split('T')[0],
        description: "",
        reference: "",
        totalDebit: "0.00",
        totalCredit: "0.00",
        sourceModule: "manual",
        sourceId: null,
      },
      lines: [
        { accountId: "", description: "", debitAmount: "0.00", creditAmount: "0.00", reference: "" },
        { accountId: "", description: "", debitAmount: "0.00", creditAmount: "0.00", reference: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const watchedLines = form.watch("lines");
  const totalDebits = watchedLines.reduce((sum, line) => sum + parseFloat(line.debitAmount || "0"), 0);
  const totalCredits = watchedLines.reduce((sum, line) => sum + parseFloat(line.creditAmount || "0"), 0);

  const filteredEntries = entries.filter((entry: JournalEntryWithLines) => {
    return (
      entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const onSubmit = (data: JournalEntryFormData) => {
    const entryData = {
      entry: {
        entryNumber: data.entry.entryNumber,
        transactionDate: data.entry.transactionDate,
        description: data.entry.description,
        reference: data.entry.reference || "",
        totalDebit: totalDebits.toFixed(2),
        totalCredit: totalCredits.toFixed(2),
        sourceModule: "manual",
        sourceId: null,
      },
      lines: data.lines.map(line => ({
        accountId: parseInt(line.accountId.toString()),
        description: line.description || "",
        debitAmount: parseFloat(line.debitAmount || "0").toFixed(2),
        creditAmount: parseFloat(line.creditAmount || "0").toFixed(2),
        reference: line.reference || "",
      })),
    };

    setConfirmDialog({
      isOpen: true,
      type: 'create',
      data: entryData,
      onConfirm: () => {
        createMutation.mutate(entryData);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setIsCreateDialogOpen(false);
      },
    });
  };

  const addLine = () => {
    append({ accountId: "", description: "", debitAmount: "0.00", creditAmount: "0.00", reference: "" });
  };

  const removeLine = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const handlePost = (entry: JournalEntryWithLines) => {
    setConfirmDialog({
      isOpen: true,
      type: 'post',
      entry,
      onConfirm: () => {
        postMutation.mutate(entry.id);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const handleReverse = (entry: JournalEntryWithLines) => {
    setReverseDescription("");
    setConfirmDialog({
      isOpen: true,
      type: 'reverse',
      entry,
      onConfirm: () => {
        if (reverseDescription.trim()) {
          reverseMutation.mutate({ id: entry.id, description: reverseDescription.trim() });
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setReverseDescription("");
        }
      },
    });
  };

  if (entriesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Journal Entries</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Record and manage accounting transactions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (open) {
            setAccountSearchTerm(""); // Clear search when dialog opens
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Journal Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Entry Header */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="entry.entryNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Number</FormLabel>
                        <FormControl>
                          <Input placeholder="JE-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entry.transactionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="entry.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Journal entry description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entry.reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Reference number or document" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Journal Lines */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Journal Lines</h3>
                    <Button type="button" variant="outline" onClick={addLine}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line
                    </Button>
                  </div>

                  {/* Simplified Table Layout */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 grid grid-cols-12 gap-2 text-sm font-medium text-gray-700">
                      <div className="col-span-4">Account</div>
                      <div className="col-span-2">Description</div>
                      <div className="col-span-2">Reference</div>
                      <div className="col-span-2">Debit</div>
                      <div className="col-span-2">Credit</div>
                    </div>
                    
                    {fields.map((field, index) => (
                      <div key={field.id} className="border-t px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-gray-50">
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name={`lines.${index}.accountId`}
                            render={({ field }) => (
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
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
                            )}
                          />
                        </div>

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`lines.${index}.description`}
                            render={({ field }) => (
                              <Input placeholder="Description" {...field} className="h-9" />
                            )}
                          />
                        </div>

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`lines.${index}.reference`}
                            render={({ field }) => (
                              <Input placeholder="Reference" {...field} className="h-9" />
                            )}
                          />
                        </div>

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`lines.${index}.debitAmount`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                className="h-9"
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  // Clear credit amount when debit is entered
                                  if (parseFloat(e.target.value) > 0) {
                                    form.setValue(`lines.${index}.creditAmount`, "0.00");
                                  }
                                }}
                              />
                            )}
                          />
                        </div>

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`lines.${index}.creditAmount`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                className="h-9"
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  // Clear debit amount when credit is entered
                                  if (parseFloat(e.target.value) > 0) {
                                    form.setValue(`lines.${index}.debitAmount`, "0.00");
                                  }
                                }}
                              />
                            )}
                          />
                        </div>

                        {fields.length > 2 && (
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(index)}
                              className="text-red-600 hover:text-red-700 h-9 w-9 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Totals Summary */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-600">Total Debits</div>
                        <div className="text-lg font-semibold text-blue-600">{formatCurrency(totalDebits.toFixed(2))}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Credits</div>
                        <div className="text-lg font-semibold text-green-600">{formatCurrency(totalCredits.toFixed(2))}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Balance</div>
                        <div className={`text-lg font-semibold ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(totalDebits - totalCredits) < 0.01 ? '✓ Balanced' : `${formatCurrency(Math.abs(totalDebits - totalCredits).toFixed(2))} Difference`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || Math.abs(totalDebits - totalCredits) >= 0.01}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Entry"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search journal entries by number, description, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries List */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No journal entries found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {entries.length === 0 
                ? "Create your first journal entry to record accounting transactions."
                : "No journal entries match your search criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry: JournalEntryWithLines) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {entry.entryNumber}
                      </h3>
                      <Badge variant={entry.isPosted ? "default" : "secondary"}>
                        {entry.isPosted ? "Posted" : "Draft"}
                      </Badge>
                      {entry.isReversed && (
                        <Badge variant="destructive">Reversed</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{entry.description}</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>Date: {format(new Date(entry.transactionDate), 'dd/MM/yyyy')}</div>
                      {entry.reference && <div>Reference: {entry.reference}</div>}
                      <div>Source: {entry.sourceModule}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-lg font-medium">
                      {formatCurrency(entry.totalDebit)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!entry.isPosted && !entry.isReversed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePost(entry)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          Post to Journal
                        </Button>
                      )}
                      {entry.isPosted && !entry.isReversed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReverse(entry)}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          Reverse Entry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Journal Lines */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    {entry.lines.map((line, index) => {
                      const account = accounts.find((acc: any) => acc.id === line.accountId);
                      return (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <span className="font-medium">
                              {account ? `${account.accountCode} - ${account.accountName}` : `Account ${line.accountId}`}
                            </span>
                            <div className="text-gray-600 dark:text-gray-400">{line.description}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 w-48 text-right">
                            <div className={parseFloat(line.debitAmount) > 0 ? "font-medium" : "text-gray-400"}>
                              {parseFloat(line.debitAmount) > 0 ? formatCurrency(line.debitAmount) : "-"}
                            </div>
                            <div className={parseFloat(line.creditAmount) > 0 ? "font-medium" : "text-gray-400"}>
                              {parseFloat(line.creditAmount) > 0 ? formatCurrency(line.creditAmount) : "-"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Journal Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Entry Number</label>
                  <div className="text-lg">{selectedEntry.entryNumber}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <div className="text-lg">{format(new Date(selectedEntry.transactionDate), 'dd/MM/yyyy')}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <div className="text-lg">{selectedEntry.description}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Journal Lines</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Account</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Debit</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedEntry.lines.map((line, index) => {
                        const account = accounts.find((acc: any) => acc.id === line.accountId);
                        return (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              {account ? `${account.accountCode} - ${account.accountName}` : `Account ${line.accountId}`}
                            </td>
                            <td className="px-4 py-3">{line.description}</td>
                            <td className="px-4 py-3 text-right">
                              {parseFloat(line.debitAmount) > 0 ? formatCurrency(line.debitAmount) : "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {parseFloat(line.creditAmount) > 0 ? formatCurrency(line.creditAmount) : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium" colSpan={2}>Total</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">
                          {formatCurrency(selectedEntry.totalDebit)}
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium">
                          {formatCurrency(selectedEntry.totalCredit)}
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, isOpen: open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.type === 'create' && (
                <>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Confirm Journal Entry Creation
                </>
              )}
              {confirmDialog.type === 'post' && (
                <>
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Confirm Post to Journal
                </>
              )}
              {confirmDialog.type === 'reverse' && (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Confirm Journal Entry Reversal
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {confirmDialog.type === 'create' && confirmDialog.data && (
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to create this journal entry?
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Entry Number:</span>
                      <span>{confirmDialog.data.entry.entryNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Amount:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(confirmDialog.data.entry.totalDebit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Transaction Date:</span>
                      <span>{format(new Date(confirmDialog.data.entry.transactionDate), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {confirmDialog.type === 'post' && confirmDialog.entry && (
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to post journal entry "{confirmDialog.entry.entryNumber}"?
                </p>
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">This action cannot be undone.</span>
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                    Once posted, this journal entry will be final and affect your financial reports.
                  </p>
                </div>
              </div>
            )}

            {confirmDialog.type === 'reverse' && confirmDialog.entry && (
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to reverse journal entry "{confirmDialog.entry.entryNumber}"?
                </p>
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This will create a new reversing entry to cancel out the original transaction.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reversal Description *
                  </label>
                  <Textarea
                    value={reverseDescription}
                    onChange={(e) => setReverseDescription(e.target.value)}
                    placeholder="Enter reason for reversal..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDialog.onConfirm}
              disabled={confirmDialog.type === 'reverse' && !reverseDescription.trim()}
              className={
                confirmDialog.type === 'post' 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : confirmDialog.type === 'reverse'
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {confirmDialog.type === 'create' && 'Create Entry'}
              {confirmDialog.type === 'post' && 'Post to Journal'}
              {confirmDialog.type === 'reverse' && 'Reverse Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={successModal.hideSuccess}
        title={successModal.modalOptions.title}
        description={successModal.modalOptions.description}
        confirmText={successModal.modalOptions.confirmText}
      />
    </div>
  );
}