import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Banknote, 
  CreditCard as CardIcon, 
  Building2, 
  Smartphone,
  CheckCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";

const paymentFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  paymentMethod: z.enum(["cash", "card", "eft", "payfast"]),
  bankAccountId: z.string().min(1, "Bank account is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  invoiceTotal: string;
  remainingAmount: string;
  onPaymentAdded: (paymentAmount?: string) => void;
}

export default function PaymentModal({ 
  isOpen,
  onClose,
  invoiceId, 
  invoiceTotal, 
  remainingAmount, 
  onPaymentAdded 
}: PaymentModalProps) {
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
    if (isOpen) {
      form.reset({
        amount: remainingAmount,
        paymentMethod: "cash",
        bankAccountId: "",
        reference: "",
        notes: "",
      });
    }
  }, [remainingAmount, isOpen, form]);

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
        throw new Error("Failed to record payment");
      }

      // Reset form and notify parent with payment amount
      const paymentAmount = data.amount;
      form.reset();
      onPaymentAdded(paymentAmount);
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-bold text-gray-900">Record Payment</span>
            </div>
            <Badge variant={isPaidInFull ? "default" : "secondary"} className="text-sm">
              {isPaidInFull ? "Paid in Full" : "Outstanding Balance"}
            </Badge>
          </DialogTitle>
          
          <Separator className="my-4" />
          
          {/* Invoice Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-blue-600 text-sm uppercase tracking-wide font-semibold">Invoice Total</div>
              <div className="text-3xl font-bold text-blue-900 mt-1">{formatCurrency(invoiceTotal)}</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
              <div className="text-red-600 text-sm uppercase tracking-wide font-semibold">Amount Due</div>
              <div className={`text-3xl font-bold mt-1 ${isPaidInFull ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(remainingAmount)}
              </div>
            </div>
          </div>
        </DialogHeader>

        {isPaidInFull ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-700 mb-3">Payment Complete</h3>
            <p className="text-gray-600 text-lg">This invoice has been paid in full.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Amount Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-bold text-gray-800">
                          Payment Amount
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold text-lg">R</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-10 text-2xl font-bold h-16 border-2 focus:border-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <div className="flex gap-3 mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => handleQuickAmount(0.25)}
                            className="flex-1 h-12"
                          >
                            25%
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => handleQuickAmount(0.5)}
                            className="flex-1 h-12"
                          >
                            50%
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => handleQuickAmount(1)}
                            className="flex-1 h-12 bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                          >
                            Full Amount
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Payment Method Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Payment Method
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            const isSelected = field.value === method.value;
                            return (
                              <div
                                key={method.value}
                                onClick={() => field.onChange(method.value)}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all hover:border-blue-400 hover:scale-105 ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200 shadow-lg' 
                                    : 'border-gray-300 hover:bg-gray-50 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                  <span className={`font-semibold text-lg ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {method.label}
                                  </span>
                                </div>
                                <p className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
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
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border">
                  <FormField
                    control={form.control}
                    name="bankAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Deposit To Bank Account
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-16 text-lg">
                              <SelectValue placeholder="Select bank account..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bankAccounts
                              .sort((a: any, b: any) => {
                                // Put system default (first account) at the top
                                if (a.isSystemDefault) return -1;
                                if (b.isSystemDefault) return 1;
                                return a.accountName.localeCompare(b.accountName);
                              })
                              .map((account: any) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  <div className="flex justify-between items-center w-full">
                                    <div className="text-left">
                                      <div className="font-semibold">{account.accountName}</div>
                                      <div className="text-sm text-gray-600">
                                        {account.bankName} - {account.accountNumber} | Balance: {formatCurrency(account.currentBalance || 0)}
                                      </div>
                                    </div>
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
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Additional Details (Optional)
                  </h4>
                  
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Reference Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Receipt number, transaction ID, etc."
                            className="h-12"
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
                        <FormLabel className="text-sm font-semibold text-gray-700">Payment Notes</FormLabel>
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

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-14 text-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-2 h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-xl" 
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
                        Record Payment - {formatCurrency(form.watch("amount") || "0")}
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}