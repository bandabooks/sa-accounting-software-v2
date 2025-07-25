import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChartOfAccountSchema, type ChartOfAccountWithBalance } from "@shared/schema";
import { Plus, Search, Edit, Trash2, FileText, BarChart, TrendingUp, Building2, Zap, Power, PowerOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const accountFormSchema = insertChartOfAccountSchema.omit({ companyId: true, createdAt: true, updatedAt: true });

type AccountFormData = z.infer<typeof accountFormSchema>;

const accountTypes = [
  { value: "Asset", label: "Asset" },
  { value: "Liability", label: "Liability" },
  { value: "Equity", label: "Equity" },
  { value: "Revenue", label: "Revenue" },
  { value: "Cost of Goods Sold", label: "Cost of Goods Sold" },
  { value: "Expense", label: "Expense" },
];

const assetSubTypes = ["Current Asset", "Fixed Asset", "Other Asset"];
const liabilitySubTypes = ["Current Liability", "Long-term Liability"];
const equitySubTypes = ["Owner's Equity", "Retained Earnings"];
const revenueSubTypes = ["Operating Revenue", "Non-operating Revenue"];
const cogsSubTypes = ["Direct Materials", "Direct Labor", "Manufacturing Overhead", "Finished Goods"];
const expenseSubTypes = ["Operating Expense", "Non-operating Expense"];

const getSubTypes = (accountType: string) => {
  switch (accountType) {
    case "Asset": return assetSubTypes;
    case "Liability": return liabilitySubTypes;
    case "Equity": return equitySubTypes;
    case "Revenue": return revenueSubTypes;
    case "Cost of Goods Sold": return cogsSubTypes;
    case "Expense": return expenseSubTypes;
    default: return [];
  }
};

const getAccountTypeColor = (type: string) => {
  switch (type) {
    case "Asset": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Liability": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "Equity": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Revenue": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Cost of Goods Sold": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "Expense": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const formatCurrency = (amount: string | number | null | undefined) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  // Handle NaN, null, undefined, or invalid values
  if (isNaN(value as number) || value == null) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(0);
  }
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(value as number);
};

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccountWithBalance | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rawAccounts = [], isLoading } = useQuery({
    queryKey: ["/api/chart-of-accounts"],
  });

  // Deduplication logic - keep only first occurrence of each account code
  const accounts = React.useMemo(() => {
    const seen = new Set<string>();
    const deduplicatedAccounts: ChartOfAccountWithBalance[] = [];
    
    (rawAccounts as ChartOfAccountWithBalance[]).forEach(account => {
      if (!seen.has(account.accountCode)) {
        seen.add(account.accountCode);
        deduplicatedAccounts.push(account);
      }
    });
    
    // Sort by account code for consistent display
    return deduplicatedAccounts.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }, [rawAccounts]);

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("/api/chart-of-accounts/seed-sa", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      toast({
        title: "Success",
        description: "South African Chart of Accounts has been set up successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set up Chart of Accounts",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AccountFormData) => apiRequest("/api/chart-of-accounts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<AccountFormData>) =>
      apiRequest(`/api/chart-of-accounts/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      setEditingAccount(null);
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/chart-of-accounts/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const toggleActivationMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest(`/api/chart-of-accounts/${id}/toggle`, "PATCH", { isActive }),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      toast({
        title: "Success",
        description: `Account ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message?.includes("permissions") 
          ? "You don't have permission to manage account activation"
          : "Failed to toggle account activation",
        variant: "destructive",
      });
    },
  });

  const handleToggleActivation = (account: ChartOfAccountWithBalance) => {
    toggleActivationMutation.mutate({
      id: account.id,
      isActive: !account.isActive,
    });
  };

  const createForm = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      accountCode: "",
      accountName: "",
      description: "",
      accountType: "Asset",
      accountSubType: "Current Asset",
      normalBalance: "Debit",
      level: 2,
      isActive: true,
      isSystemAccount: false,
      taxType: undefined,
    },
  });

  const editForm = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      accountCode: "",
      accountName: "",
      description: "",
      accountType: "Asset",
      accountSubType: "Current Asset",
      normalBalance: "Debit",
      level: 2,
      isActive: true,
      isSystemAccount: false,
      taxType: undefined,
    },
  });

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = 
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || account.accountType === selectedType;
    return matchesSearch && matchesType;
  });

  const accountTypeGroups = filteredAccounts.reduce((groups: Record<string, ChartOfAccountWithBalance[]>, account) => {
    const type = account.accountType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {});

  const onCreateSubmit = (data: AccountFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: AccountFormData) => {
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, ...data });
    }
  };

  const handleEdit = (account: ChartOfAccountWithBalance) => {
    setEditingAccount(account);
    editForm.reset({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      accountSubType: account.accountSubType,
      normalBalance: account.normalBalance,
      level: account.level,
      isActive: account.isActive,
      isSystemAccount: account.isSystemAccount,
      description: account.description || "",
      taxType: account.taxType || undefined,
    });
  };

  const handleDelete = (account: ChartOfAccountWithBalance) => {
    if (account.isSystemAccount) {
      toast({
        title: "Error",
        description: "Cannot delete system accounts",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${account.accountName}"?`)) {
      deleteMutation.mutate(account.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Chart of Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your accounting structure and account categories
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {accounts.length === 0 && (
            <Button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Setup SA Chart of Accounts
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="accountCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Code</FormLabel>
                          <FormControl>
                            <Input placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="5" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Current Assets" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accountTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="accountSubType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sub Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sub type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getSubTypes(createForm.watch("accountType")).map((subType) => (
                                <SelectItem key={subType} value={subType}>
                                  {subType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="normalBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Normal Balance</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select balance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Debit">Debit</SelectItem>
                            <SelectItem value="Credit">Credit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Account description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search accounts by code, name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Total Accounts: <span className="font-medium text-gray-900 dark:text-gray-100">{accounts.length}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Active: <span className="font-medium text-green-600">{accounts.filter(a => a.isActive).length}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Unique Codes: <span className="font-medium text-blue-600">{new Set(accounts.map(a => a.accountCode)).size}</span></span>
            </div>
            {filteredAccounts.length !== accounts.length && (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Filtered: <span className="font-medium text-orange-600">{filteredAccounts.length}</span></span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      {Object.keys(accountTypeGroups).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No accounts found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {accounts.length === 0 
                ? "Get started by setting up the South African Chart of Accounts or creating your first account."
                : "No accounts match your search criteria. Try adjusting your search terms or filters."
              }
            </p>
            {accounts.length === 0 && (
              <Button
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="mr-2"
              >
                <Zap className="h-4 w-4 mr-2" />
                Setup SA Chart of Accounts
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(accountTypeGroups).map(([type, typeAccounts]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className={getAccountTypeColor(type)}>
                    {type}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    ({(typeAccounts as ChartOfAccountWithBalance[]).length} accounts)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(typeAccounts as ChartOfAccountWithBalance[]).map((account) => (
                    <div
                      key={account.id}
                      className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-gray-600 dark:text-gray-400">
                                {account.accountCode}
                              </span>
                              {account.isSystemAccount && (
                                <Badge variant="secondary" className="text-xs">
                                  System
                                </Badge>
                              )}
                              <Badge 
                                variant={account.isActive ? "default" : "secondary"} 
                                className={`text-xs ${account.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                              >
                                {account.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <h3 className={`font-medium ${account.isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'}`}>
                              {account.accountName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {account.accountSubType} • {account.normalBalance} Balance
                              {account.taxType && ` • ${account.taxType}`}
                            </p>
                            {account.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {account.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(account.currentBalance)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Level {account.level}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer">
                                <Switch
                                  checked={account.isActive}
                                  onCheckedChange={() => handleToggleActivation(account)}
                                  disabled={toggleActivationMutation.isPending}
                                  className={account.isActive ? "data-[state=checked]:bg-green-500" : ""}
                                />
                                {account.isActive ? (
                                  <Power className="h-4 w-4 text-green-600" />
                                ) : (
                                  <PowerOff className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{account.isActive ? 'Account is active - click to deactivate' : 'Account is inactive - click to activate'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!account.isSystemAccount && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(account)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="accountCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Code</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={editingAccount.isSystemAccount} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            disabled={editingAccount.isSystemAccount}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={editingAccount.isSystemAccount}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="accountSubType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={editingAccount.isSystemAccount}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getSubTypes(editForm.watch("accountType")).map((subType) => (
                              <SelectItem key={subType} value={subType}>
                                {subType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Account description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingAccount(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Updating..." : "Update Account"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}