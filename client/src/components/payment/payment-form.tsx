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
import { CreditCard, DollarSign, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";

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
        throw new Error("Failed to record payment");
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
    { value: "cash", label: "Cash", icon: DollarSign },
    { value: "card", label: "Card", icon: CreditCard },
    { value: "eft", label: "EFT", icon: Receipt },
    { value: "payfast", label: "PayFast", icon: Receipt },
  ];

  const handleQuickAmount = (percentage: number) => {
    const amount = (parseFloat(remainingAmount) * percentage).toFixed(2);
    form.setValue("amount", amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Record Payment
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p>Invoice Total: {formatCurrency(invoiceTotal)}</p>
          <p>Remaining: {formatCurrency(remainingAmount)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(0.25)}
                    >
                      25%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(0.5)}
                    >
                      50%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(1)}
                    >
                      Full
                    </Button>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {method.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit To Bank Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankAccounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{account.accountName}</span>
                            <span className="text-sm text-gray-500">
                              {account.bankName} - {account.accountNumber}
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

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Receipt number, card ref, etc."
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional payment details..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}