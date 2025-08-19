import { FileText, CreditCard, Receipt, Clock, CheckCircle, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";

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
  showMore?: boolean;
}

export default function RecentActivities({ activities, showMore = false }: RecentActivitiesProps) {
  const [location, setLocation] = useLocation();
  
  const getNavigationPath = (activity: Activity) => {
    switch (activity.type) {
      case 'invoice':
        return `/invoices/${activity.id}`;
      case 'payment':
        return `/payments/${activity.id}`;
      case 'expense':
        return `/expenses/${activity.id}`;
      default:
        return `/invoices/${activity.id}`;
    }
  };
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
      'pending': { label: 'PENDING', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200' },
      'paid': { label: 'PAID', color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200' },
      'completed': { label: 'DONE', color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200' },
      'draft': { label: 'DRAFT', color: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200' },
      'sent': { label: 'SENT', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {showMore ? "No activities found" : "No recent activities"}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {showMore ? "Try adjusting your search terms" : "Your recent business activities will appear here"}
        </p>
      </div>
    );
  }

  const displayedActivities = showMore ? activities : activities.slice(0, 10);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Latest business updates
        </span>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Showing {displayedActivities.length} of {activities.length}
        </span>
      </div>
      
      {/* Display enhanced activities list with proper spacing */}
      <div className="space-y-2">
        {displayedActivities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type, activity.status);
            const iconColorClass = getActivityColor(activity.type, activity.status);
            
            // Determine the left border color based on activity type and status
            const getBorderColor = () => {
              if (activity.type === 'payment' || activity.status === 'paid') return 'border-l-green-500';
              if (activity.type === 'invoice' && activity.status === 'pending') return 'border-l-blue-500';
              if (activity.type === 'expense') return 'border-l-orange-500';
              if (activity.status === 'draft') return 'border-l-gray-400';
              return 'border-l-purple-500';
            };
            
            // Determine the background color based on activity type
            const getBackgroundColor = () => {
              if (activity.type === 'payment' || activity.status === 'paid') return 'bg-green-50 dark:bg-green-900/10';
              if (activity.type === 'invoice' && activity.status === 'pending') return 'bg-blue-50 dark:bg-blue-900/10';
              if (activity.type === 'expense') return 'bg-orange-50 dark:bg-orange-900/10';
              if (activity.status === 'draft') return 'bg-gray-50 dark:bg-gray-800/30';
              return 'bg-purple-50 dark:bg-purple-900/10';
            };
            
            return (
              <Link key={`${activity.type}-${activity.id || index}-${activity.date}`} href={getNavigationPath(activity)}>
                <div className={`group flex items-start space-x-3 p-3 rounded-lg border-l-4 ${getBorderColor()} ${getBackgroundColor()} hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center ${iconColorClass}`}>
                    <IconComponent size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600">
                        {activity.description}
                      </p>
                      <span className={`text-sm font-bold ${
                        activity.amount.startsWith('-') 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {formatCurrency(activity.amount.replace('-', ''))}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        {activity.customerName && (
                          <>
                            <span className="truncate max-w-[100px]">{activity.customerName}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatDistanceToNow(new Date(activity.date), { addSuffix: false })}</span>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}