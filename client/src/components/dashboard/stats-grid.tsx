import { ChartLine, Clock, Users, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";
import { useLocation } from "wouter";

interface StatsGridProps {
  stats: {
    totalRevenue: string;
    outstandingInvoices: string;
    totalCustomers: number;
    vatDue: string;
    outstandingInvoiceCount: number;
    paidInvoiceCount: number;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const [, setLocation] = useLocation();

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: `${stats.paidInvoiceCount} ${stats.paidInvoiceCount === 1 ? 'invoice' : 'invoices'} paid`,
      changeType: "positive",
      icon: ChartLine,
      iconBg: "bg-green-100",
      iconColor: "text-accent",
      onClick: () => setLocation("/financial-reports?report=profit-loss")
    },
    {
      title: "Outstanding Invoices", 
      value: formatCurrency(stats.outstandingInvoices),
      change: `${stats.outstandingInvoiceCount} ${stats.outstandingInvoiceCount === 1 ? 'invoice' : 'invoices'} pending`,
      changeType: "neutral",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      onClick: () => setLocation("/invoices?filter=outstanding")
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      change: `${stats.totalCustomers} ${stats.totalCustomers === 1 ? 'customer' : 'customers'}`,
      changeType: "positive",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      onClick: () => setLocation("/customers")
    },
    {
      title: "VAT Due",
      value: formatCurrency(stats.vatDue),
      change: "From paid invoices",
      changeType: "warning",
      icon: Receipt,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      onClick: () => setLocation("/vat-returns")
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-750"
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${
                  stat.changeType === 'positive' ? 'text-accent' :
                  stat.changeType === 'warning' ? 'text-red-600' :
                  'text-amber-600'
                }`}>
                  {stat.changeType === 'positive' && "↗ "}
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} dark:${stat.iconBg}/20 rounded-lg flex items-center justify-center`}>
                <Icon className={`${stat.iconColor} dark:${stat.iconColor}`} size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
