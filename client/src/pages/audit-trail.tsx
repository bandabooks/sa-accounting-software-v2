import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, SearchIcon, FilterIcon, DownloadIcon, RefreshCwIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: number;
  action: string;
  resource: string;
  resourceId: number | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  oldValues: any;
  newValues: any;
  userName: string | null;
  userEmail: string | null;
}

interface FilterOptions {
  users: Array<{ id: number; name: string; email: string }>;
  resources: Array<{ resource: string; count: number }>;
  actions: Array<{ action: string; count: number }>;
}

export default function AuditTrail() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: 'all',
    resource: 'all',
    action: 'all',
    page: 1,
    limit: 50
  });

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { data: auditData, refetch, isLoading } = useQuery({
    queryKey: ['/api/reports/audit-trail', filters],
    queryFn: async ({ queryKey }) => {
      const params = new URLSearchParams();
      const [, , filterParams] = queryKey;
      
      Object.entries(filterParams as typeof filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, String(value));
        }
      });

      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      const response = await fetch(`/api/reports/audit-trail?${params}`);
      if (!response.ok) throw new Error('Failed to fetch audit trail');
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'login': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'logout': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      case 'view': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource.toLowerCase()) {
      case 'invoice': return '📧';
      case 'customer': return '👤';
      case 'expense': return '💰';
      case 'user': return '👥';
      case 'role': return '🔐';
      case 'payment': return '💳';
      case 'product': return '📦';
      default: return '📄';
    }
  };

  const exportToCSV = () => {
    if (!auditData?.auditTrail) return;
    
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'IP Address', 'Details'].join(','),
      ...auditData.auditTrail.map((log: AuditLog) => [
        new Date(log.timestamp).toLocaleString(),
        log.userName || 'System',
        log.action,
        log.resource,
        log.resourceId || '',
        log.ipAddress || '',
        log.details || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail Report</h1>
          <p className="text-muted-foreground">
            Complete record of all user activities and system changes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={!auditData?.auditTrail?.length}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <FilterIcon className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={filters.userId} onValueChange={(value) => handleFilterChange('userId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {auditData?.filterOptions?.users?.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resource Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource</label>
              <Select value={filters.resource} onValueChange={(value) => handleFilterChange('resource', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {auditData?.filterOptions?.resources?.map((resource: any) => (
                    <SelectItem key={resource.resource} value={resource.resource}>
                      {resource.resource} ({resource.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {auditData?.filterOptions?.actions?.map((action: any) => (
                    <SelectItem key={action.action} value={action.action}>
                      {action.action} ({action.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Records per page */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Per Page</label>
              <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {auditData && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {((auditData.currentPage - 1) * filters.limit) + 1} to {Math.min(auditData.currentPage * filters.limit, auditData.totalCount)} of {auditData.totalCount} entries
          </span>
          <span>
            Page {auditData.currentPage} of {auditData.totalPages}
          </span>
        </div>
      )}

      {/* Audit Trail Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Resource</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">IP Address</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Loading audit trail...
                    </td>
                  </tr>
                ) : auditData?.auditTrail?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No audit records found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  auditData?.auditTrail?.map((log: AuditLog) => (
                    <tr key={log.id} className="hover:bg-muted/25">
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="font-medium">{log.userName || 'System'}</div>
                          {log.userEmail && (
                            <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn("text-xs", getActionBadgeColor(log.action))}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getResourceIcon(log.resource)}</span>
                          <span className="font-medium">{log.resource}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {log.resourceId || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {log.ipAddress || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.details ? (
                          <div className="max-w-xs truncate" title={log.details}>
                            {log.details}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {auditData && auditData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
            disabled={filters.page <= 1}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, auditData.totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(auditData.totalPages - 4, filters.page - 2)) + i;
              return (
                <Button
                  key={page}
                  variant={page === filters.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('page', page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', Math.min(auditData.totalPages, filters.page + 1))}
            disabled={filters.page >= auditData.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}