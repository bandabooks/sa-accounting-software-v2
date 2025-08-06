import { useState, useEffect } from "react";
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
import { insertJournalEntrySchema, type JournalEntryWithLines, type ChartOfAccount } from "@shared/schema";
import { Plus, Search, Edit, FileCheck, RotateCcw, Trash2, BookOpen, Calculator } from "lucide-react";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/use-success-modal";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { calculateVAT, SA_VAT_TYPES, formatCurrency } from "@shared/vat-utils";

// Enhanced form schema with VAT integration
const journalEntryFormSchema = insertJournalEntrySchema.omit({ 
  companyId: true, 
  createdBy: true, 
  createdAt: true, 
  updatedAt: true,
  reference: true, // Remove reference from entry level
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
  vatRate: z.string().default("0"),
  vatInclusive: z.boolean().default(false),
  vatAmount: z.string().default("0.00"),
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

// Account search component
function AccountSearchSelect({ 
  accounts, 
  value, 
  onSelect, 
  placeholder 
}: { 
  accounts: ChartOfAccount[]; 
  value: string; 
  onSelect: (value: string) => void; 
  placeholder: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredAccounts = accounts.filter(account =>
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAccount = accounts.find(acc => acc.id.toString() === value);

  return (
    <Select value={value} onValueChange={onSelect} open={isOpen} onOpenChange={setIsOpen}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {selectedAccount && `${selectedAccount.accountCode} - ${selectedAccount.accountName}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-full">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              <div className="flex flex-col">
                <span className="font-medium">{account.accountCode} - {account.accountName}</span>
                <span className="text-xs text-muted-foreground">{account.accountType}</span>
              </div>
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default function JournalEntriesEnhanced() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryWithLines | null>(null);
  const { toast } = useToast();
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/journal-entries"],
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/chart-of-accounts"],
  });

  // Get next entry number
  const { data: nextNumberData } = useQuery({
    queryKey: ["/api/journal-entries/next-number"],
    enabled: isCreateDialogOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: JournalEntryFormData) => apiRequest("/api/journal-entries", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries/next-number"] });
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

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntryWithLinesSchema),
    defaultValues: {
      entry: {
        entryNumber: "",
        transactionDate: new Date().toISOString().split('T')[0],
        description: "",
        totalDebit: "0.00",
        totalCredit: "0.00",
        sourceModule: "manual",
        sourceId: null,
      },
      lines: [
        { 
          accountId: "", 
          description: "", 
          debitAmount: "0.00", 
          creditAmount: "0.00", 
          reference: "",
          vatRate: "0",
          vatInclusive: false,
          vatAmount: "0.00"
        },
        { 
          accountId: "", 
          description: "", 
          debitAmount: "0.00", 
          creditAmount: "0.00", 
          reference: "",
          vatRate: "0",
          vatInclusive: false,
          vatAmount: "0.00"
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Update entry number when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && nextNumberData?.entryNumber) {
      form.setValue("entry.entryNumber", nextNumberData.entryNumber);
    }
  }, [isCreateDialogOpen, nextNumberData, form]);

  const watchedLines = form.watch("lines");
  const totalDebits = watchedLines.reduce((sum, line) => sum + parseFloat(line.debitAmount || "0"), 0);
  const totalCredits = watchedLines.reduce((sum, line) => sum + parseFloat(line.creditAmount || "0"), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const calculateLineVAT = (lineIndex: number) => {
    const line = watchedLines[lineIndex];
    const amount = parseFloat(line.debitAmount || line.creditAmount || "0");
    const vatRate = parseFloat(line.vatRate || "0");
    
    if (amount > 0 && vatRate > 0) {
      const vatCalc = calculateVAT(amount, vatRate, line.vatInclusive);
      form.setValue(`lines.${lineIndex}.vatAmount`, vatCalc.vatAmount.toFixed(2));
      
      // Update the amount to net if VAT inclusive
      if (line.vatInclusive) {
        if (line.debitAmount !== "0.00") {
          form.setValue(`lines.${lineIndex}.debitAmount`, vatCalc.netAmount.toFixed(2));
        } else {
          form.setValue(`lines.${lineIndex}.creditAmount`, vatCalc.netAmount.toFixed(2));
        }
      }
    } else {
      form.setValue(`lines.${lineIndex}.vatAmount`, "0.00");
    }
  };

  const filteredEntries = entries.filter((entry: JournalEntryWithLines) => {
    return (
      entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const onSubmit = (data: JournalEntryFormData) => {
    const entryData = {
      entry: {
        entryNumber: data.entry.entryNumber,
        transactionDate: data.entry.transactionDate,
        description: data.entry.description,
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
        vatRate: parseFloat(line.vatRate || "0").toFixed(2),
        vatInclusive: line.vatInclusive,
        vatAmount: parseFloat(line.vatAmount || "0").toFixed(2),
      })),
    };
    createMutation.mutate(entryData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              Journal Entries
            </h1>
            <p className="text-blue-100 text-lg">
              Manage manual journal entries with VAT calculations and account search
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                New Journal Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Journal Entry
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Entry Header Section */}
                  <Card className="border-2 border-blue-100">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                      <CardTitle className="text-lg">Entry Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="entry.entryNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Entry Number</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly className="bg-gray-50 font-mono" />
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
                                <Input type="date" {...field} />
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
                              <Textarea 
                                {...field} 
                                placeholder="Describe the purpose of this journal entry..."
                                className="min-h-[80px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Journal Lines Section */}
                  <Card className="border-2 border-green-100">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Journal Lines</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ 
                            accountId: "", 
                            description: "", 
                            debitAmount: "0.00", 
                            creditAmount: "0.00", 
                            reference: "",
                            vatRate: "0",
                            vatInclusive: false,
                            vatAmount: "0.00"
                          })}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Line
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <Card key={field.id} className="border border-gray-200 bg-gray-50">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                                {/* Account Selection */}
                                <div className="lg:col-span-3">
                                  <FormField
                                    control={form.control}
                                    name={`lines.${index}.accountId`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Account</FormLabel>
                                        <FormControl>
                                          <AccountSearchSelect
                                            accounts={accounts}
                                            value={field.value.toString()}
                                            onSelect={field.onChange}
                                            placeholder="Select account"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                {/* Description */}
                                <div className="lg:col-span-2">
                                  <FormField
                                    control={form.control}
                                    name={`lines.${index}.description`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                          <Input {...field} placeholder="Line description" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                {/* Debit Amount */}
                                <div className="lg:col-span-2">
                                  <FormField
                                    control={form.control}
                                    name={`lines.${index}.debitAmount`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Debit</FormLabel>
                                        <FormControl>
                                          <Input 
                                            {...field} 
                                            type="number" 
                                            step="0.01"
                                            onChange={(e) => {
                                              field.onChange(e);
                                              if (parseFloat(e.target.value) > 0) {
                                                form.setValue(`lines.${index}.creditAmount`, "0.00");
                                              }
                                              calculateLineVAT(index);
                                            }}
                                            className="text-right font-mono"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                {/* Credit Amount */}
                                <div className="lg:col-span-2">
                                  <FormField
                                    control={form.control}
                                    name={`lines.${index}.creditAmount`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Credit</FormLabel>
                                        <FormControl>
                                          <Input 
                                            {...field} 
                                            type="number" 
                                            step="0.01"
                                            onChange={(e) => {
                                              field.onChange(e);
                                              if (parseFloat(e.target.value) > 0) {
                                                form.setValue(`lines.${index}.debitAmount`, "0.00");
                                              }
                                              calculateLineVAT(index);
                                            }}
                                            className="text-right font-mono"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                {/* VAT Rate */}
                                <div className="lg:col-span-1">
                                  <FormField
                                    control={form.control}
                                    name={`lines.${index}.vatRate`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>VAT %</FormLabel>
                                        <FormControl>
                                          <Select value={field.value} onValueChange={(value) => {
                                            field.onChange(value);
                                            calculateLineVAT(index);
                                          }}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="0%" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {SA_VAT_TYPES.map((vatType) => (
                                                <SelectItem key={vatType.code} value={vatType.rate.toString()}>
                                                  {vatType.rate}% - {vatType.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                {/* Reference */}
                                <div className="lg:col-span-1">
                                  <FormField
                                    control={form.control}
                                    name={`lines.${index}.reference`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Ref</FormLabel>
                                        <FormControl>
                                          <Input {...field} placeholder="Reference" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                {/* Actions */}
                                <div className="lg:col-span-1 flex items-end">
                                  {fields.length > 2 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* VAT Information */}
                              {parseFloat(watchedLines[index]?.vatAmount || "0") > 0 && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-4 text-sm">
                                    <Calculator className="h-4 w-4 text-blue-600" />
                                    <span className="text-blue-700">
                                      VAT Amount: <strong>{formatCurrency(parseFloat(watchedLines[index]?.vatAmount || "0"))}</strong>
                                    </span>
                                    <FormField
                                      control={form.control}
                                      name={`lines.${index}.vatInclusive`}
                                      render={({ field }) => (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={(e) => {
                                              field.onChange(e.target.checked);
                                              calculateLineVAT(index);
                                            }}
                                            className="rounded border-gray-300"
                                          />
                                          <span className="text-blue-700">VAT Inclusive</span>
                                        </label>
                                      )}
                                    />
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Totals Section */}
                  <Card className="border-2 border-purple-100">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">Total Debits</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(totalDebits)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">Total Credits</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalCredits)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">Balance</p>
                          <div className="flex items-center justify-center gap-2">
                            {isBalanced ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-4 py-2">
                                ✓ Balanced
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-lg px-4 py-2">
                                Out of Balance: {formatCurrency(Math.abs(totalDebits - totalCredits))}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <DialogFooter className="gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isBalanced || createMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Journal Entry"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search journal entries by number or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="grid gap-4">
        {entriesLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Loading journal entries...</p>
            </CardContent>
          </Card>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No journal entries found matching your search." : "No journal entries created yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry: JournalEntryWithLines) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{entry.entryNumber}</h3>
                      <Badge variant={entry.isPosted ? "default" : "secondary"}>
                        {entry.isPosted ? "Posted" : "Draft"}
                      </Badge>
                      {entry.isReversed && (
                        <Badge variant="destructive">Reversed</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{entry.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Date: {format(new Date(entry.transactionDate), "dd MMM yyyy")}</span>
                      <span>Amount: {formatCurrency(parseFloat(entry.totalDebit))}</span>
                      <span>Lines: {entry.lines?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!entry.isPosted && (
                      <Button variant="ghost" size="sm">
                        <FileCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <SuccessModal />
    </div>
  );
}