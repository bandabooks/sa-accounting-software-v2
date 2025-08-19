import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, SearchIcon, FilterIcon, DownloadIcon, RefreshCwIcon, Users, Activity, Clock, Eye, UserCheck, Shield } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
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

interface AdminAuditLog {
  id: number;
  userId: number;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
  user: {
    username: string;
    name: string;
  };
}

interface FilterOptions {
  users: Array<{ id: number; name: string; email: string }>;
  resources: Array<{ resource: string; count: number }>;
  actions: Array<{ action: string; count: number }>;
}

export default function AuditTrail() {
  // State with default values to prevent undefined errors
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: 'all',
    resource: 'all',
    action: 'all',
    page: 1,
    limit: 50
  });

  // Set default dates to today for immediate functionality
  const today = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const [endDate, setEndDate] = useState<Date | undefined>(today);

  // Error boundary state
  const [hasError, setHasError] = useState(false);

  // Reset error state when component updates successfully
  useEffect(() => {
    if (hasError) {
      setHasError(false);
    }
  }, [hasError]);

  // Wrap the entire component in try-catch to prevent white screens
  if (hasError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Audit Trail Report</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Something went wrong loading the audit trail.</p>
            <Button 
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }} 
              className="mt-4"
            >
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Real-time activity stats 
  const { data: activityStats, refetch: refetchStats, error: statsError } = useQuery({
    queryKey: ['/api/user-activity/stats'],
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
  });

  // Online users tracking
  const { data: onlineUsers, refetch: refetchOnlineUsers, error: onlineUsersError } = useQuery({
    queryKey: ['/api/user-activity/online'],
    refetchInterval: 15000,
    retry: 3,
    retryDelay: 1000,
  });

  // Admin audit logs
  const { data: adminAuditLogs, refetch: refetchAdminLogs, error: adminLogsError } = useQuery({
    queryKey: ["/api/admin/audit-logs"],
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
  });

  // System stats
  const { data: userStats, error: userStatsError } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: 3,
    retryDelay: 1000,
  });

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchOnlineUsers();
      refetchAdminLogs();
    }, 60000);
    return () => clearInterval(interval);
  }, [refetchStats, refetchOnlineUsers, refetchAdminLogs]);

  const { data: auditData, refetch, isLoading, error: auditDataError } = useQuery({
    queryKey: ['/api/reports/audit-trail', filters, startDate, endDate],
    queryFn: async ({ queryKey }) => {
      try {
        const params = new URLSearchParams();
        const [, , filterParams, queryStartDate, queryEndDate] = queryKey;
        
        // Add filter parameters
        if (filterParams && typeof filterParams === 'object') {
          Object.entries(filterParams as typeof filters).forEach(([key, value]) => {
            if (value && value !== 'all' && key !== 'page') {
              params.append(key, String(value));
            }
          });
        }

        // Add date parameters  
        if (queryStartDate && queryStartDate instanceof Date) {
          params.append('startDate', queryStartDate.toISOString());
        }
        if (queryEndDate && queryEndDate instanceof Date) {
          params.append('endDate', queryEndDate.toISOString());
        }

        // Add pagination
        params.append('page', String(filters.page));
        params.append('limit', String(filters.limit));

        const response = await fetch(`/api/reports/audit-trail?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'X-Session-Token': localStorage.getItem('sessionToken') || '',
            'X-Company-ID': localStorage.getItem('activeCompanyId') || '',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error(`Audit trail fetch failed: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch audit trail: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Audit Trail Data Retrieved:', data);
        return data;
      } catch (error) {
        console.error('Audit trail query error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    enabled: !!(startDate && endDate), // Only run query when dates are set
  });

  // Debug logging for authentication issues (after all hooks declared)
  useEffect(() => {
    if (statsError) {
      console.error('Activity Stats Error Details:', {
        message: statsError.message,
        name: statsError.name,
        cause: statsError.cause
      });
    }
    if (onlineUsersError) {
      console.error('Online Users Error Details:', {
        message: onlineUsersError.message,
        name: onlineUsersError.name,
        cause: onlineUsersError.cause
      });
    }
    if (adminLogsError) {
      console.error('Admin Logs Error Details:', {
        message: adminLogsError.message,
        name: adminLogsError.name,
        cause: adminLogsError.cause
      });
    }
    if (auditDataError) {
      console.error('Audit Data Error Details:', {
        message: auditDataError.message,
        name: auditDataError.name,
        cause: auditDataError.cause
      });
    }
  }, [statsError, onlineUsersError, adminLogsError, auditDataError]);

  // Debug success states
  useEffect(() => {
    if (activityStats) {
      console.log('Activity Stats Retrieved Successfully:', activityStats);
    }
    if (onlineUsers) {
      console.log('Online Users Retrieved Successfully:', onlineUsers);
    }
  }, [activityStats, onlineUsers]);
  


  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Filter the User Activity data using the main filters with comprehensive null safety
  const filteredUserActivity = React.useMemo(() => {
    try {
      const statsData = activityStats as any;
      const recentActions = statsData?.recentActions;
      if (!recentActions || !Array.isArray(recentActions)) {
        return [];
      }

      return recentActions.filter((log: any) => {
        if (!log) return false;

        // User filter - using main filter state
        if (filters.userId !== 'all') {
          const matchesUser = log.userName && log.userName.toLowerCase().includes(filters.userId.toLowerCase());
          if (!matchesUser) return false;
        }

        // Action filter - using main filter state
        if (filters.action !== 'all' && log.action !== filters.action) {
          return false;
        }

        // Resource filter - using main filter state
        if (filters.resource !== 'all' && log.resource !== filters.resource) {
          return false;
        }

        // Date filters - using main date state
        if (startDate || endDate) {
          try {
            const logDate = new Date(log.timestamp);
            if (isNaN(logDate.getTime())) return true; // Skip invalid dates
            if (startDate && logDate < startDate) return false;
            if (endDate && logDate > endDate) return false;
          } catch (error) {
            console.warn('Date filter error:', error);
            return true; // Include items with date errors
          }
        }

        return true;
      }).slice(0, filters.limit || 50);
    } catch (error) {
      console.error('Filter error:', error);
      return [];
    }
  }, [(activityStats as any)?.recentActions, filters, startDate, endDate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
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
            onClick={() => {
              refetch();
              refetchStats();
              refetchOnlineUsers();
            }}
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

      {/* Real-time Activity Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Online Users */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              Currently Online
            </CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {(onlineUsers as any)?.count || 0}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              {(onlineUsers as any)?.count === 1 ? 'user active' : 'users active'}
            </p>
            {(onlineUsers as any)?.users && Array.isArray((onlineUsers as any).users) && (onlineUsers as any).users.length > 0 && (
              <div className="mt-2 space-y-1">
                {(onlineUsers as any).users.slice(0, 3).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-green-800 dark:text-green-200">{user.name}</span>
                    <span className="text-green-600 dark:text-green-400">
                      {user.lastActivity && formatDistanceToNow(new Date(user.lastActivity), { addSuffix: true })}
                    </span>
                  </div>
                ))}
                {(onlineUsers as any).users.length > 3 && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    +{(onlineUsers as any).users.length - 3} more
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Actions
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {activityStats?.totalActions || activityStats?.todayActions || 0}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              total system activities
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Users with Activity
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {activityStats?.totalUsers || 0}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              unique users recorded
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {activityStats?.recentActions?.length || 0}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              latest actions
            </p>
            {activityStats?.recentActions && activityStats.recentActions.length > 0 && (
              <div className="mt-2 space-y-1">
                {activityStats.recentActions.slice(0, 2).map((action: any, index: number) => (
                  <div key={index} className="text-xs">
                    <div className="font-medium text-amber-800 dark:text-amber-200">
                      {action.userName} · {action.action}
                    </div>
                    <div className="text-amber-600 dark:text-amber-400">
                      {action.resource} · {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>



      {/* User Activity Section - Mirror from Admin Panel */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-amber-800 dark:text-amber-200">
                <Activity className="h-5 w-5 mr-2" />
                User Activity
              </CardTitle>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Recent user actions and system events
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Total Users Stats from User Management */}
              <div className="bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2 text-center border border-amber-200 dark:border-amber-700">
                <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  {userStats?.length || 0}
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300">Total Users</div>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2 text-center border border-amber-200 dark:border-amber-700">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                  {userStats?.filter((u: any) => u.isActive)?.length || 0}
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300">Active Users</div>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2 text-center border border-amber-200 dark:border-amber-700">
                <div className="text-lg font-bold text-red-700 dark:text-red-300">
                  {userStats?.filter((u: any) => !u.isActive)?.length || 0}
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300">Inactive Users</div>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2 text-center border border-amber-200 dark:border-amber-700">
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {userStats?.filter((u: any) => u.role === 'super_admin' || u.role === 'admin')?.length || 0}
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300">Super Admins</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {((adminAuditLogs && Array.isArray(adminAuditLogs) && adminAuditLogs.length > 0) || (filteredUserActivity && Array.isArray(filteredUserActivity) && filteredUserActivity.length > 0)) ? (
            <div className="bg-white/70 dark:bg-black/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-amber-200 dark:border-amber-700">
                    <TableHead className="text-amber-800 dark:text-amber-200">User</TableHead>
                    <TableHead className="text-amber-800 dark:text-amber-200">Action</TableHead>
                    <TableHead className="text-amber-800 dark:text-amber-200">Details</TableHead>
                    <TableHead className="text-amber-800 dark:text-amber-200">IP Address</TableHead>
                    <TableHead className="text-amber-800 dark:text-amber-200">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((adminAuditLogs && Array.isArray(adminAuditLogs) && adminAuditLogs.length > 0) ? adminAuditLogs.slice(0, 10) : (filteredUserActivity || [])).map((log: any, index: number) => (
                    <TableRow key={log.id || index} className="border-amber-100 dark:border-amber-800 hover:bg-amber-50/50 dark:hover:bg-amber-950/50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-amber-900 dark:text-amber-100">
                            {log.user?.name || log.userName || 'System'}
                          </div>
                          <div className="text-sm text-amber-600 dark:text-amber-400">
                            @{log.user?.username || 'system'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-600"
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-amber-900 dark:text-amber-100">
                        {log.details || `Manual ${log.action} audit log for today`}
                      </TableCell>
                      <TableCell className="text-amber-700 dark:text-amber-300">
                        {log.ipAddress || '127.0.0.1'}
                      </TableCell>
                      <TableCell className="text-amber-700 dark:text-amber-300">
                        {formatDate(log.timestamp || log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(adminAuditLogs && Array.isArray(adminAuditLogs) && adminAuditLogs.length > 10) && (
                <div className="px-4 py-3 text-center border-t border-amber-200 dark:border-amber-700">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Showing latest 10 of {adminAuditLogs?.length || 0} activities. View Admin Panel for complete list.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-black/20 rounded-lg border border-amber-200 dark:border-amber-700 p-8 text-center">
              <Activity className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-700 dark:text-amber-300">No recent user activity available</p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                Activity logs will appear here as users interact with the system
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters for Full Audit Trail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <FilterIcon className="h-5 w-5 mr-2" />
            Full Audit Trail Filters
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
      {auditData && auditData.totalCount !== undefined && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {Math.max(1, ((auditData.currentPage || filters.page) - 1) * filters.limit + 1)} to {Math.min((auditData.currentPage || filters.page) * filters.limit, auditData.totalCount || 0)} of {auditData.totalCount || 0} entries
          </span>
          <span>
            Page {auditData.currentPage || filters.page} of {auditData.totalPages || 1}
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
                ) : !auditData || !auditData.auditTrail || auditData.auditTrail.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      {auditDataError ? 'Error loading audit trail. Please try refreshing.' : 'No audit records found for the selected filters.'}
                    </td>
                  </tr>
                ) : (
                  (auditData.auditTrail || []).map((log: any, index: number) => (
                    <tr key={log.id || index} className="hover:bg-muted/25">
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