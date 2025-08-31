import { Link } from "wouter";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import type { InvoiceWithCustomer } from "@shared/schema";

interface RecentInvoicesProps {
  invoices: InvoiceWithCustomer[];
}

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    <Link href={`/invoices/${invoice.id}`} className="hover:text-blue-600 transition-colors">
                      {invoice.invoiceNumber}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(invoice.issueDate)}
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.customer.name}</div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.total)}
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
