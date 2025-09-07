import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Clock, FileText, ExternalLink, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Filing {
  id: string;
  title: string;
  type: 'VAT201' | 'EMP201' | 'EMP501' | 'IT12' | 'CIPC' | 'Other';
  dueDate: string;
  daysUntilDue: number;
  status: 'urgent' | 'due_soon' | 'upcoming';
  description?: string;
  actionUrl?: string;
}

interface DueFilingsListProps {
  filings?: Filing[];
  showAll?: boolean;
}

export default function DueFilingsList({ filings, showAll = false }: DueFilingsListProps) {
  const [filterType, setFilterType] = useState<string>('All');
  // Default filings if none provided
  const defaultFilings: Filing[] = [
    {
      id: '1',
      title: 'VAT Return',
      type: 'VAT201',
      dueDate: '25 Mar 2025',
      daysUntilDue: 3,
      status: 'urgent',
      description: 'February 2025 VAT Return',
      actionUrl: '/vat-returns'
    },
    {
      id: '2',
      title: 'Employee Tax Certificate',
      type: 'EMP201',
      dueDate: '7 Apr 2025',
      daysUntilDue: 16,
      status: 'due_soon',
      description: 'March 2025 PAYE Return',
      actionUrl: '/payroll'
    },
    {
      id: '3',
      title: 'Provisional Tax',
      type: 'IT12',
      dueDate: '30 Apr 2025',
      daysUntilDue: 39,
      status: 'upcoming',
      description: '2nd Provisional Payment 2025',
      actionUrl: '/tax-returns'
    }
  ];

  const displayFilings = filings || defaultFilings;
  
  // Filter filings based on selected filter
  const filteredFilings = displayFilings.filter(filing => {
    if (filterType === 'All') return true;
    if (filterType === 'My Clients') return filing.type === 'VAT201' || filing.type === 'EMP201';
    if (filterType === 'Entity') return filing.type === 'CIPC';
    if (filterType === 'Service') return filing.type === 'IT12';
    return true;
  });
  
  const itemsToShow = showAll ? filteredFilings : filteredFilings.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'due_soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent': return <AlertTriangle className="h-3 w-3" />;
      case 'due_soon': return <Clock className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const getPriorityOrder = (status: string) => {
    switch (status) {
      case 'urgent': return 0;
      case 'due_soon': return 1;
      default: return 2;
    }
  };

  const sortedFilings = [...itemsToShow].sort((a, b) => {
    const priorityDiff = getPriorityOrder(a.status) - getPriorityOrder(b.status);
    if (priorityDiff !== 0) return priorityDiff;
    return a.daysUntilDue - b.daysUntilDue;
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Due Filings
          </CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-7" aria-label="Filter filings">
                  <Filter className="h-3 w-3 mr-1" />
                  {filterType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('All')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('My Clients')}>My Clients</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('Entity')}>Entity</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('Service')}>Service</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/practice-dashboard">
              <Button size="sm" variant="outline" className="text-xs h-7" aria-label="View all filings">
                View All
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sortedFilings.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No upcoming filings</p>
          </div>
        ) : (
          <div className="space-y-0">
            {sortedFilings.map((filing, index) => (
              <div 
                key={filing.id}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                  filing.status === 'urgent' ? 'bg-red-50/50' : 
                  filing.status === 'due_soon' ? 'bg-yellow-50/50' : 'bg-white'
                }`}
              >
                <div className="flex-shrink-0">
                  <Badge className={`text-xs px-2 py-1 h-6 ${getStatusColor(filing.status)}`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(filing.status)}
                      {filing.type}
                    </span>
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {filing.title}
                    </p>
                    <Badge 
                      variant={filing.status === 'urgent' ? 'destructive' : 'secondary'}
                      className="text-xs px-2 py-0 h-5"
                    >
                      {filing.daysUntilDue === 0 ? 'Today' : 
                       filing.daysUntilDue === 1 ? 'Tomorrow' :
                       `${filing.daysUntilDue} days`}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {filing.description} • Due {filing.dueDate}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  {filing.actionUrl && (
                    <Link href={filing.actionUrl}>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        File
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}