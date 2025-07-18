import { ChartLine, Clock, Users, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";

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
  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: `${stats.paidInvoiceCount} ${stats.paidInvoiceCount === 1 ? 'invoice' : 'invoices'} paid`,
      changeType: "positive",
      icon: ChartLine,
      iconBg: "bg-green-100",
      iconColor: "text-accent"
    },
    {
      title: "Outstanding Invoices", 
      value: formatCurrency(stats.outstandingInvoices),
      change: `${stats.outstandingInvoiceCount} ${stats.outstandingInvoiceCount === 1 ? 'invoice' : 'invoices'} pending`,
      changeType: "neutral",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      change: `${stats.totalCustomers} ${stats.totalCustomers === 1 ? 'customer' : 'customers'}`,
      changeType: "positive",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-primary"
    },
    {
      title: "VAT Due",
      value: formatCurrency(stats.vatDue),
      change: "From paid invoices",
      changeType: "warning",
      icon: Receipt,
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${
                  stat.changeType === 'positive' ? 'text-accent' :
                  stat.changeType === 'warning' ? 'text-red-600' :
                  'text-amber-600'
                }`}>
                  {stat.changeType === 'positive' && "↗ "}
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`${stat.iconColor}`} size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
