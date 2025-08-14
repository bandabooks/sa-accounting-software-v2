import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Repeat } from "lucide-react";
import { format, addDays, addMonths, addYears } from "date-fns";
import { cn } from "@/lib/utils";

interface Supplier {
  id: number;
  name: string;
  email?: string;
  paymentTerms: number;
}

interface ExpenseCategory {
  id: number;
  accountName: string;
  accountCode: string;
}

export default function RecurringExpenseCreate() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [vatType, setVatType] = useState("standard");
  const [vatRate, setVatRate] = useState("15.00");
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [autoApprove, setAutoApprove] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  const [notes, setNotes] = useState("");

  // Fetch suppliers
  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
    staleTime: 300000,
  });

  // Fetch expense categories
  const { data: categories } = useQuery<ExpenseCategory[]>({
    queryKey: ['/api/chart-of-accounts', { type: 'expense' }],
    staleTime: 300000,
  });

  // Create recurring expense mutation
  const createRecurringExpenseMutation = useMutation({
    mutationFn: async (templateData: any) => {
      return apiRequest("/api/recurring-expenses", {
        method: "POST",
        body: JSON.stringify(templateData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] });
      toast({
        title: "Template Created",
        description: "Recurring expense template created successfully.",
      });
      setLocation("/recurring-expenses");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create recurring expense template.",
        variant: "destructive",
      });
    },
  });

  const calculateNextDueDate = () => {
    switch (frequency) {
      case "weekly":
        return addDays(startDate, 7);
      case "monthly":
        return addMonths(startDate, 1);
      case "quarterly":
        return addMonths(startDate, 3);
      case "annually":
        return addYears(startDate, 1);
      default:
        return addMonths(startDate, 1);
    }
  };

  const calculateVatAmount = () => {
    if (vatType === "exempt" || vatType === "zero") return "0.00";
    const rate = parseFloat(vatRate) / 100;
    const baseAmount = parseFloat(amount || "0");
    return (baseAmount * rate).toFixed(2);
  };

  const calculateTotalAmount = () => {
    const baseAmount = parseFloat(amount || "0");
    const vat = parseFloat(calculateVatAmount());
    return (baseAmount + vat).toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const templateData = {
      templateName: templateName.trim(),
      description: description.trim(),
      supplierId: supplierId ? parseInt(supplierId) : null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      amount,
      vatType,
      vatRate,
      frequency,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
      nextDueDate: calculateNextDueDate().toISOString().split('T')[0],
      autoApprove,
      reminderDays,
      notes: notes.trim(),
      isActive: true
    };

    createRecurringExpenseMutation.mutate(templateData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/recurring-expenses")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recurring Expenses
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Recurring Expense Template</h1>
            <p className="text-gray-600 mt-1">Automate repetitive expenses like rent, utilities, and subscriptions</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
                <CardDescription>
                  Set up the basic details for your recurring expense
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="templateName">Template Name *</Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., Office Rent, Software Subscriptions"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this recurring expense..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplier">Supplier (Optional)</Label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Supplier</SelectItem>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Expense Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.accountCode} - {category.accountName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
                <CardDescription>
                  Set the amount and VAT details for each occurrence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (Excluding VAT) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="vatType">VAT Type</Label>
                    <Select value={vatType} onValueChange={setVatType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard VAT (15%)</SelectItem>
                        <SelectItem value="zero">Zero-rated (0%)</SelectItem>
                        <SelectItem value="exempt">VAT Exempt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="vatRate">VAT Rate (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value)}
                      disabled={vatType === "exempt" || vatType === "zero"}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Subtotal:</span>
                      <div className="font-medium">R {amount || "0.00"}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">VAT:</span>
                      <div className="font-medium">R {calculateVatAmount()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <div className="font-bold text-lg">R {calculateTotalAmount()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recurrence Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Recurrence Settings</CardTitle>
                <CardDescription>
                  Configure when and how often this expense should be generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select value={frequency} onValueChange={setFrequency} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reminderDays">Reminder (days before)</Label>
                    <Input
                      id="reminderDays"
                      type="number"
                      min="0"
                      max="30"
                      value={reminderDays}
                      onChange={(e) => setReminderDays(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>End Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>No end date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoApprove"
                    checked={autoApprove}
                    onCheckedChange={setAutoApprove}
                  />
                  <Label htmlFor="autoApprove" className="text-sm font-medium">
                    Auto-approve generated expenses
                  </Label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  When enabled, expenses generated from this template will be automatically approved without manual review.
                </p>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about this recurring expense..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-5 w-5" />
                  Template Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Template Name:</span>
                    <div className="font-medium">{templateName || "Untitled Template"}</div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Amount per occurrence:</span>
                    <div className="text-lg font-bold">R {calculateTotalAmount()}</div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Frequency:</span>
                    <div className="font-medium capitalize">{frequency}</div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Next due:</span>
                    <div className="font-medium">{format(calculateNextDueDate(), "PPP")}</div>
                  </div>

                  {supplierId && (
                    <div>
                      <span className="text-sm text-gray-600">Supplier:</span>
                      <div className="font-medium">
                        {suppliers?.find(s => s.id.toString() === supplierId)?.name}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-gray-600">Auto-approve:</span>
                    <div className="font-medium">{autoApprove ? "Yes" : "No"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Estimated Annual Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    R {(() => {
                      const total = parseFloat(calculateTotalAmount());
                      switch (frequency) {
                        case "weekly": return (total * 52).toFixed(2);
                        case "monthly": return (total * 12).toFixed(2);
                        case "quarterly": return (total * 4).toFixed(2);
                        case "annually": return total.toFixed(2);
                        default: return (total * 12).toFixed(2);
                      }
                    })()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Based on {frequency} frequency
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={createRecurringExpenseMutation.isPending}
              >
                {createRecurringExpenseMutation.isPending ? "Creating..." : "Create Template"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/recurring-expenses")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}