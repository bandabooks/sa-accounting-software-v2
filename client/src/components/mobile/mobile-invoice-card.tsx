import { Link } from "wouter";
import { 
  Eye, Edit, Send, Download, MoreVertical,
  CheckCircle, AlertCircle, Clock, FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils-invoice";

interface MobileInvoiceCardProps {
  invoice: any;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onSend?: (id: number) => void;
  onDuplicate?: (id: number) => void;
}

export function MobileInvoiceCard({ 
  invoice, 
  onEdit, 
  onDelete, 
  onSend,
  onDuplicate 
}: MobileInvoiceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      case "sent": return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "sent": return Send;
      case "overdue": return AlertCircle;
      case "draft": return FileText;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(invoice.status);

  return (
    <div className={`invoice-mobile-card ${invoice.status} bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              #{invoice.invoiceNumber}
            </h3>
            <Badge className={`${getStatusColor(invoice.status)} text-xs`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {invoice.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{invoice.customer?.name}</p>
        </div>
        
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/invoices/${invoice.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            {invoice.status === "draft" && (
              <>
                <DropdownMenuItem onClick={() => onEdit?.(invoice.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSend?.(invoice.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onDuplicate?.(invoice.id)}>
              <FileText className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="font-semibold text-lg text-gray-900">
            {formatCurrency(parseFloat(invoice.total || "0"))}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Date</span>
          <span className="text-sm text-gray-700">
            {formatDate(new Date(invoice.createdAt))}
          </span>
        </div>
        
        {invoice.dueDate && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Due</span>
            <span className="text-sm text-gray-700">
              {formatDate(new Date(invoice.dueDate))}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <Link href={`/invoices/${invoice.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>
        {invoice.status === "draft" && (
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onSend?.(invoice.id)}
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        )}
      </div>
    </div>
  );
}