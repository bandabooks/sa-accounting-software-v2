import { FileText, CreditCard, Receipt, Clock, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: number;
  type: 'invoice' | 'payment' | 'expense';
  description: string;
  amount: string;
  date: string;
  status: string;
  customerName?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'invoice':
        return FileText;
      case 'payment':
        return CreditCard;
      case 'expense':
        return Receipt;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string, status: string) => {
    if (type === 'payment' || status === 'paid') return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    if (type === 'expense') return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
    if (status === 'pending') return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20';
    if (status === 'draft') return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' },
      'paid': { label: 'Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      'completed': { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
      'sent': { label: 'Sent', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Business Activities</h3>
        <div className="text-center py-8">
          <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No recent activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Business Activities</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">Last 10 activities</span>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const IconComponent = getActivityIcon(activity.type, activity.status);
          const iconColorClass = getActivityColor(activity.type, activity.status);
          
          return (
            <div key={`${activity.type}-${activity.id || index}-${activity.date}`} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconColorClass}`}>
                <IconComponent size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(activity.status)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    {activity.customerName && (
                      <span>{activity.customerName}</span>
                    )}
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</span>
                  </div>
                  
                  <span className={`text-sm font-medium ${
                    activity.amount.startsWith('-') 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {activity.amount.startsWith('-') ? '' : '+'}
                    {formatCurrency(activity.amount.replace('-', ''))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          View all activities
        </button>
      </div>
    </div>
  );
}