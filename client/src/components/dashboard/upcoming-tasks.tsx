import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, AlertCircle, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Task {
  id: string;
  title: string;
  type: 'vat_return' | 'quote_followup' | 'report' | 'backup';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  description?: string;
}

export function UpcomingTasks() {
  // Mock tasks data - in production this would come from API
  const tasks: Task[] = [
    {
      id: '1',
      title: 'VAT Return Submission',
      type: 'vat_return',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      priority: 'high',
      description: 'Due in 3 days'
    },
    {
      id: '2',
      title: 'Follow up on Quote #567',
      type: 'quote_followup',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      priority: 'medium',
      description: 'Expires in 5 days'
    },
    {
      id: '3',
      title: 'Monthly Financial Report',
      type: 'report',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      priority: 'medium',
      description: 'Generate by month-end'
    },
    {
      id: '4',
      title: 'Backup System Data',
      type: 'backup',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      priority: 'low',
      description: 'Weekly backup scheduled'
    }
  ];

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'vat_return':
        return FileText;
      case 'quote_followup':
        return DollarSign;
      case 'report':
        return Calendar;
      case 'backup':
        return AlertCircle;
      default:
        return Calendar;
    }
  };

  const getTaskColor = (type: Task['type']) => {
    switch (type) {
      case 'vat_return':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'quote_followup':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'report':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case 'backup':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800 dark:text-white">Upcoming Tasks</CardTitle>
        <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
          Don't forget these important items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task) => {
            const IconComponent = getTaskIcon(task.type);
            const colorClass = getTaskColor(task.type);
            
            return (
              <div 
                key={task.id} 
                className="flex items-start space-x-2.5 p-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${colorClass}`}>
                  <IconComponent size={14} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {task.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}