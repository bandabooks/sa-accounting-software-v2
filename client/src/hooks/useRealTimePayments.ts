import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PaymentRealTimeUpdates {
  totalBankBalance: string;
  totalRevenue: string;
  bankAccounts: Array<{
    id: number;
    accountName: string;
    currentBalance: string;
  }>;
  invoice?: {
    id: number;
    status: string;
    paidAmount: string;
    totalAmount: string;
  } | null;
  dashboardStats: any;
}

interface PaymentResponse {
  payment: any;
  realTimeUpdates: PaymentRealTimeUpdates;
}

export function useRealTimePayments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePaymentSuccess = (response: PaymentResponse) => {
    const { payment, realTimeUpdates } = response;

    // Invalidate and update all relevant cache queries immediately
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
    
    if (payment.invoiceId) {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/${payment.invoiceId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/${payment.invoiceId}/payments`] });
    }

    // Update cached dashboard stats immediately with real-time data
    queryClient.setQueryData(["/api/dashboard/stats"], (oldData: any) => ({
      ...oldData,
      ...realTimeUpdates.dashboardStats,
      totalRevenue: realTimeUpdates.totalRevenue,
      bankBalance: realTimeUpdates.totalBankBalance
    }));

    // Update bank accounts cache
    queryClient.setQueryData(["/api/bank-accounts"], (oldData: any) => {
      if (!oldData) return realTimeUpdates.bankAccounts;
      
      return oldData.map((account: any) => {
        const updatedAccount = realTimeUpdates.bankAccounts.find(
          (updated) => updated.id === account.id
        );
        return updatedAccount ? { ...account, currentBalance: updatedAccount.currentBalance } : account;
      });
    });

    // Update specific invoice data if available
    if (realTimeUpdates.invoice) {
      queryClient.setQueryData(
        [`/api/invoices/${realTimeUpdates.invoice.id}`], 
        (oldData: any) => ({
          ...oldData,
          status: realTimeUpdates.invoice!.status,
          paidAmount: realTimeUpdates.invoice!.paidAmount
        })
      );
    }

    // Show success notification
    toast({
      title: "Payment Recorded Successfully",
      description: `Payment of R${parseFloat(payment.amount).toFixed(2)} has been processed. Dashboard updated instantly.`,
      duration: 4000,
    });

    // Optional: Trigger a subtle visual feedback
    triggerDashboardAnimation();
  };

  const triggerDashboardAnimation = () => {
    // Add subtle animation to dashboard stats to indicate real-time update
    const statsCards = document.querySelectorAll('[data-stat-card]');
    statsCards.forEach((card) => {
      card.classList.add('animate-pulse');
      setTimeout(() => card.classList.remove('animate-pulse'), 1000);
    });
  };

  return {
    handlePaymentSuccess,
    triggerDashboardAnimation
  };
}