import { Link } from "wouter";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import type { InvoiceWithCustomer } from "@shared/schema";

interface RecentInvoicesProps {
  invoices: InvoiceWithCustomer[];
}

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <div className="space-y-3">
      {invoices.slice(0, 5).map((invoice) => (
        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/70 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <Link href={`/invoices/${invoice.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate">
                {invoice.invoiceNumber}
              </Link>
              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-gray-600 truncate">{invoice.customer.name}</div>
              <div className="text-sm font-bold text-gray-900 ml-2">
                {formatCurrency(invoice.total)}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(invoice.issueDate)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
