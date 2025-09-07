import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, DollarSign, UserPlus, Receipt, 
  CreditCard, TrendingUp, Building, Calculator 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";

interface ActivityItem {
  id: string;
  type: 'invoice' | 'payment' | 'customer' | 'expense' | 'vat' | 'general';
  title: string;
  description: string;
  amount?: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'overdue';
}

interface ActivityListProps {
  activities?: ActivityItem[];
  title?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'invoice': return <FileText className="h-4 w-4" />;
    case 'payment': return <DollarSign className="h-4 w-4" />;
    case 'customer': return <UserPlus className="h-4 w-4" />;
    case 'expense': return <Receipt className="h-4 w-4" />;
    case 'vat': return <Calculator className="h-4 w-4" />;
    default: return <Building className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string, status?: string) => {
  if (status === 'overdue') return 'text-red-600';
  switch (type) {
    case 'invoice': return 'text-blue-600';
    case 'payment': return 'text-green-600';
    case 'customer': return 'text-purple-600';
    case 'expense': return 'text-orange-600';
    case 'vat': return 'text-indigo-600';
    default: return 'text-gray-600';
  }
};

export default function ActivityList({ activities = [], title = "Recent Activity" }: ActivityListProps) {
  // Default activities if none provided
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'invoice',
      title: 'Invoice INV-2025-001 created',
      description: 'ABC Company Ltd • Due in 30 days',
      amount: '15,500.00',
      timestamp: '2h ago',
      status: 'pending'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment received',
      description: 'XYZ Trading Pty Ltd',
      amount: '8,200.00',
      timestamp: '4h ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'vat',
      title: 'VAT Return submitted',
      description: 'February 2025 VAT201',
      timestamp: '1d ago',
      status: 'completed'
    },
    {
      id: '4',
      type: 'customer',
      title: 'New customer added',
      description: 'Tech Solutions Pty Ltd',
      timestamp: '2d ago',
      status: 'completed'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {displayActivities.slice(0, 6).map((activity, index) => (
            <div 
              key={activity.id}
              className={`flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center ${
                activity.type === 'invoice' ? 'bg-blue-100' :
                activity.type === 'payment' ? 'bg-green-100' :
                activity.type === 'customer' ? 'bg-purple-100' :
                activity.type === 'expense' ? 'bg-orange-100' :
                activity.type === 'vat' ? 'bg-indigo-100' : 'bg-gray-100'
              }`}>
                <span className={getActivityColor(activity.type, activity.status)}>
                  {getActivityIcon(activity.type)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  {activity.status && (
                    <Badge 
                      variant={
                        activity.status === 'completed' ? 'default' :
                        activity.status === 'overdue' ? 'destructive' : 'secondary'
                      }
                      className="text-xs px-2 py-0 h-5"
                    >
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {activity.description}
                </p>
              </div>
              
              <div className="text-right flex-shrink-0">
                {activity.amount && (
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(activity.amount)}
                  </p>
                )}
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}