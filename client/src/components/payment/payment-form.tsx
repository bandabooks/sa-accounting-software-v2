import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign, Receipt, Banknote, CreditCard as CardIcon, Building2, Smartphone } from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";
import { apiRequest } from "@/lib/queryClient";

const paymentFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  paymentMethod: z.enum(["cash", "card", "eft", "payfast"]),
  bankAccountId: z.string().min(1, "Bank account is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  invoiceId: number;
  invoiceTotal: string;
  remainingAmount: string;
  onPaymentAdded: () => void;
}

export default function PaymentForm({ 
  invoiceId, 
  invoiceTotal, 
  remainingAmount, 
  onPaymentAdded 
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch bank accounts
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ["/api/bank-accounts"],
  });

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: remainingAmount,
      paymentMethod: "cash",
      bankAccountId: "",
      reference: "",
      notes: "",
    },
  });

  // Update amount when remaining amount changes
  useEffect(() => {
    const currentAmount = form.getValues("amount");
    if (remainingAmount !== currentAmount) {
      form.setValue("amount", remainingAmount);
    }
  }, [remainingAmount, form]);

  // Reset form when remaining amount changes
  useEffect(() => {
    form.reset({
      amount: remainingAmount,
      paymentMethod: "cash",
      bankAccountId: "",
      reference: "",
      notes: "",
    });
  }, [remainingAmount, form]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          bankAccountId: parseInt(data.bankAccountId),
          invoiceId,
          status: "completed",
        }),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      // Reset form and notify parent
      form.reset({
        amount: "",
        paymentMethod: "cash",
        bankAccountId: "",
        reference: "",
        notes: "",
      });
      onPaymentAdded();
    } catch (error) {
      console.error("Error recording payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: Banknote, description: "Physical cash payment" },
    { value: "card", label: "Card", icon: CardIcon, description: "Credit or debit card" },
    { value: "eft", label: "EFT", icon: Building2, description: "Electronic funds transfer" },
    { value: "payfast", label: "PayFast", icon: Smartphone, description: "Online payment gateway" },
  ];

  const handleQuickAmount = (percentage: number) => {
    const amount = (parseFloat(remainingAmount) * percentage).toFixed(2);
    form.setValue("amount", amount);
  };

  const remainingAmountFloat = parseFloat(remainingAmount);
  const isPaidInFull = remainingAmountFloat <= 0;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Record Payment</span>
          </div>
          <Badge variant={isPaidInFull ? "default" : "secondary"} className="text-sm">
            {isPaidInFull ? "Paid in Full" : "Outstanding Balance"}
          </Badge>
        </CardTitle>
        
        <Separator className="my-3" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-gray-500 text-xs uppercase tracking-wide font-medium">Invoice Total</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(invoiceTotal)}</div>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-gray-500 text-xs uppercase tracking-wide font-medium">Amount Due</div>
            <div className={`text-2xl font-bold ${isPaidInFull ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(remainingAmount)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isPaidInFull ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">Payment Complete</h3>
            <p className="text-gray-600">This invoice has been paid in full.</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Amount Section */}
              <div className="bg-white p-4 rounded-lg border">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Payment Amount
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8 text-lg font-semibold h-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <div className="flex gap-2 mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmount(0.25)}
                          className="flex-1"
                        >
                          25%
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmount(0.5)}
                          className="flex-1"
                        >
                          50%
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmount(1)}
                          className="flex-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                        >
                          Full Amount
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Method Section */}
              <div className="bg-white p-4 rounded-lg border">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Method
                      </FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          const isSelected = field.value === method.value;
                          return (
                            <div
                              key={method.value}
                              onClick={() => field.onChange(method.value)}
                              className={`cursor-pointer p-3 rounded-lg border-2 transition-all hover:border-blue-300 ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                  {method.label}
                                </span>
                              </div>
                              <p className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                {method.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bank Account Section */}
              <div className="bg-white p-4 rounded-lg border">
                <FormField
                  control={form.control}
                  name="bankAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Deposit To Bank Account
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 mt-2">
                            <SelectValue placeholder="Select bank account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bankAccounts.map((account: any) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              <div className="flex flex-col py-1">
                                <span className="font-medium">{account.accountName}</span>
                                <span className="text-sm text-gray-500">
                                  {account.bankName} - {account.accountNumber} ({formatCurrency(account.currentBalance || 0)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Details Section */}
              <div className="bg-white p-4 rounded-lg border space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Additional Details (Optional)
                </h4>
                
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-600">Reference Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Receipt number, transaction ID, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-600">Payment Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional payment details, conditions, or remarks..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg" 
                disabled={isSubmitting || isPaidInFull}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Record Payment
                  </div>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}