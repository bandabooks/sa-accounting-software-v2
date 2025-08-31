import { Link } from "wouter";
import { 
  Eye, Edit, Trash2, MoreVertical, Receipt,
  CheckCircle, Clock, AlertCircle, DollarSign,
  Calendar, User, Tag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

interface MobileExpenseCardProps {
  expense: any;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

export function MobileExpenseCard({ 
  expense, 
  onEdit, 
  onDelete,
  onApprove,
  onReject
}: MobileExpenseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "paid": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle;
      case "pending": return Clock;
      case "rejected": return AlertCircle;
      case "paid": return DollarSign;
      default: return Receipt;
    }
  };

  const StatusIcon = getStatusIcon(expense.status);

  return (
    <div className="expense-mobile-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
      {/* Status Badge */}
      <div className={`expense-status ${expense.status}`}>
        {expense.status}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base mb-1">
            {expense.description || expense.merchant || "Expense"}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="h-3 w-3" />
            <span>{expense.category}</span>
          </div>
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
              <Link href={`/expenses/${expense.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {expense.status === "pending" && (
              <>
                <DropdownMenuItem onClick={() => onEdit?.(expense.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onApprove?.(expense.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReject?.(expense.id)}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onDelete?.(expense.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="font-semibold text-lg text-gray-900">
            {formatCurrency(expense.amount)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Date</span>
          <span className="text-sm text-gray-700 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(expense.date).toLocaleDateString()}
          </span>
        </div>
        
        {expense.employee && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Employee</span>
            <span className="text-sm text-gray-700 flex items-center gap-1">
              <User className="h-3 w-3" />
              {expense.employee}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {expense.status === "pending" && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onReject?.(expense.id)}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onApprove?.(expense.id)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </div>
      )}
    </div>
  );
}