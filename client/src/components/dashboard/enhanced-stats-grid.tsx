import { ChartLine, Clock, Users, Receipt, TrendingUp, TrendingDown, Banknote, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";
import BankComplianceCard from "./bank-compliance-card";
import { useLocation } from "wouter";

interface EnhancedStatsGridProps {
  stats: {
    totalRevenue: string;
    outstandingInvoices: string;
    totalCustomers: number;
    vatDue: string;
    outstandingInvoiceCount: number;
    paidInvoiceCount: number;
    receivablesAging?: {
      totalReceivables: string;
      days0to30: string;
      days31to60: string;
      days61to90: string;
      days90Plus: string;
    };
    payablesAging?: {
      totalPayables: string;
      days0to30: string;
      days31to60: string;
      days61to90: string;
      days90Plus: string;
    };
    cashFlowSummary?: {
      currentCashPosition: string;
      todayInflow: string;
      todayOutflow: string;
      netCashFlow: string;
    };
    bankBalances?: Array<{
      accountName: string;
      balance: string;
      accountNumber: string;
    }>;
    complianceAlerts?: Array<{
      type: string;
      message: string;
      severity: 'high' | 'medium' | 'low';
      action: string;
    }>;
  };
}

export default function EnhancedStatsGrid({ stats }: EnhancedStatsGridProps) {
  const [, setLocation] = useLocation();

  const mainStatCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: `${stats.paidInvoiceCount} ${stats.paidInvoiceCount === 1 ? 'invoice' : 'invoices'} paid`,
      changeType: "positive",
      icon: ChartLine,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      onClick: () => setLocation("/advanced-analytics?report=profit-loss")
    },
    {
      title: "Outstanding Invoices", 
      value: formatCurrency(stats.outstandingInvoices),
      change: `${stats.outstandingInvoiceCount} ${stats.outstandingInvoiceCount === 1 ? 'invoice' : 'invoices'} pending`,
      changeType: "neutral",
      icon: Clock,
      iconBg: "bg-amber-100 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      onClick: () => setLocation("/invoices?filter=outstanding")
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      change: `${stats.totalCustomers} ${stats.totalCustomers === 1 ? 'customer' : 'customers'}`,
      changeType: "positive",
      icon: Users,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: () => setLocation("/customers")
    },
    {
      title: "VAT Due",
      value: formatCurrency(stats.vatDue),
      change: "From paid invoices",
      changeType: "warning",
      icon: Receipt,
      iconBg: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      onClick: () => setLocation("/vat-returns")
    }
  ];

  // Enhanced cards for receivables and payables
  const enhancedCards = [];

  if (stats.receivablesAging) {
    enhancedCards.push({
      title: "Total Receivables",
      value: formatCurrency(stats.receivablesAging.totalReceivables),
      aging: {
        "0-30 days": formatCurrency(stats.receivablesAging.days0to30),
        "31-60 days": formatCurrency(stats.receivablesAging.days31to60),
        "61-90 days": formatCurrency(stats.receivablesAging.days61to90),
        "90+ days": formatCurrency(stats.receivablesAging.days90Plus)
      },
      icon: TrendingUp,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      onClick: () => setLocation("/advanced-analytics?report=aged-receivables")
    });
  }

  if (stats.payablesAging) {
    enhancedCards.push({
      title: "Total Payables",
      value: formatCurrency(stats.payablesAging.totalPayables),
      aging: {
        "0-30 days": formatCurrency(stats.payablesAging.days0to30),
        "31-60 days": formatCurrency(stats.payablesAging.days31to60),
        "61-90 days": formatCurrency(stats.payablesAging.days61to90),
        "90+ days": formatCurrency(stats.payablesAging.days90Plus)
      },
      icon: TrendingDown,
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      onClick: () => setLocation("/advanced-analytics?report=aged-payables")
    });
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStatCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              onClick={stat.onClick}
              data-stat-card={stat.title.toLowerCase().replace(/\s+/g, '-')}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className={`text-sm font-medium mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                    stat.changeType === 'warning' ? 'text-red-600 dark:text-red-400' :
                    'text-amber-600 dark:text-amber-400'
                  }`}>
                    {stat.changeType === 'positive' && "↗ "}
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110`}>
                  <Icon className={`${stat.iconColor}`} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Receivables & Payables Cards */}
      {enhancedCards.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enhancedCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div 
                key={index} 
                onClick={card.onClick}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{card.title}</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110`}>
                    <Icon className={`${card.iconColor}`} size={24} />
                  </div>
                </div>
                
                {/* Aging Summary */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Aging Summary</p>
                  {Object.entries(card.aging).map(([period, amount]) => (
                    <div key={period} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{period}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cash Flow & Bank/Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash Flow Summary */}
          {stats.cashFlowSummary && (
            <div 
              onClick={() => setLocation("/cash-flow-forecasting")}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Flow Summary</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.cashFlowSummary.currentCashPosition)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                  <Banknote className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">30-Day Inflow</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    +{formatCurrency(stats.cashFlowSummary.todayInflow)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">30-Day Outflow</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatCurrency(stats.cashFlowSummary.todayOutflow)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Net Cash Flow</span>
                  <span className={`font-medium ${
                    parseFloat(stats.cashFlowSummary.netCashFlow) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(stats.cashFlowSummary.netCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bank Accounts / Compliance Alerts Card */}
          <BankComplianceCard 
            bankBalances={stats.bankBalances || []}
            complianceAlerts={stats.complianceAlerts || []}
          />
        </div>
    </div>
  );
}