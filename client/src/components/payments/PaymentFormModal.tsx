import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, DollarSign } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useRealTimePayments } from "@/hooks/useRealTimePayments";
import { useCompany } from "@/contexts/CompanyContext";

const paymentFormSchema = z.object({
  invoiceId: z.coerce.number().min(1, "Please select an invoice"),
  bankAccountId: z.coerce.number().min(1, "Please select a bank account"),
  amount: z.string().min(1, "Amount is required"),
  paymentDate: z.date(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["completed", "pending", "failed"]).default("completed"),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId?: number;
  invoiceAmount?: string;
}

export function PaymentFormModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceAmount,
}: PaymentFormModalProps) {
  const { handlePaymentSuccess } = useRealTimePayments();
  const { companyId } = useCompany();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceId: invoiceId || 0,
      amount: invoiceAmount || "",
      paymentDate: new Date(),
      paymentMethod: "bank_transfer",
      status: "completed",
    },
  });

  // Fetch invoices for dropdown
  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
    enabled: !invoiceId, // Only fetch if no specific invoice provided
  });

  // Fetch bank accounts for dropdown
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ["/api/bank-accounts"],
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          amount: data.amount.toString(),
          paymentDate: data.paymentDate.toISOString(),
          companyId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (response) => {
      // For compatibility with the real-time hook, wrap the response
      if (response && typeof response === 'object') {
        handlePaymentSuccess({ payment: response, realTimeUpdates: { totalBankBalance: '0', totalRevenue: '0', bankAccounts: [], dashboardStats: {} } });
      }
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      console.error("Payment creation failed:", error);
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    createPaymentMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a payment received for an invoice. Dashboard metrics will update instantly.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!invoiceId && (
                <FormField
                  control={form.control}
                  name="invoiceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select invoice..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(invoices as any[]).map((invoice: any) => (
                            <SelectItem key={invoice.id} value={invoice.id.toString()}>
                              {invoice.invoiceNumber} - R{parseFloat(invoice.totalAmount).toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="bankAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank account..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(bankAccounts as any[]).map((account: any) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.accountName} - R{parseFloat(account.currentBalance || '0').toFixed(2)}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (R)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="card">Card Payment</SelectItem>
                        <SelectItem value="eft">EFT</SelectItem>
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
                      <Input placeholder="Payment reference..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional payment notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createPaymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPaymentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}