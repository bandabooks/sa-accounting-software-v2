import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  date: string;
  status: 'upcoming' | 'due' | 'completed' | 'overdue';
  type: 'vat' | 'payroll' | 'income' | 'compliance';
}

interface TimelineStripProps {
  items?: TimelineItem[];
}

export default function TimelineStrip({ items }: TimelineStripProps) {
  // Default timeline items if none provided
  const defaultItems: TimelineItem[] = [
    {
      id: '1',
      title: 'VAT Return (VAT201)',
      date: 'Due 25 Mar',
      status: 'due',
      type: 'vat'
    },
    {
      id: '2', 
      title: 'EMP201 Filing',
      date: 'Due 7 Apr',
      status: 'upcoming',
      type: 'payroll'
    },
    {
      id: '3',
      title: 'Provisional Tax',
      date: 'Due 28 Feb',
      status: 'overdue',
      type: 'income'
    },
    {
      id: '4',
      title: 'CIPC Filing',
      date: 'Due 30 Apr',
      status: 'upcoming',
      type: 'compliance'
    }
  ];

  const displayItems = items || defaultItems;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'due': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'due': return <AlertTriangle className="h-3 w-3" />;
      case 'overdue': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Compliance Timeline</h3>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2">
        {displayItems.map((item) => (
          <div 
            key={item.id}
            className="flex-shrink-0 min-w-[140px] p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-xs px-2 py-1 h-6 ${getStatusColor(item.status)}`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(item.status)}
                  {item.status}
                </span>
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{item.title}</p>
            <p className="text-xs text-gray-600">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}