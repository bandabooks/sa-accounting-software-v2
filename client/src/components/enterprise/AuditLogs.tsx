import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Shield,
  Lock,
  User,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AuditLogEntry {
  id: number;
  action: string;
  resource: string;
  userId: number;
  userName: string;
  timestamp: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogsProps {
  auditLogs?: AuditLogEntry[];
}

export default function AuditLogs({ auditLogs }: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return User;
      case 'create':
        return CheckCircle;
      case 'update':
      case 'edit':
        return Settings;
      case 'delete':
        return AlertTriangle;
      case 'view':
      case 'access':
        return Eye;
      case 'security':
      case '2fa_enabled':
      case '2fa_disabled':
        return Shield;
      default:
        return FileText;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'text-green-600 bg-green-100';
      case 'update':
      case 'edit':
        return 'text-blue-600 bg-blue-100';
      case 'delete':
        return 'text-red-600 bg-red-100';
      case 'login':
        return 'text-green-600 bg-green-100';
      case 'logout':
        return 'text-gray-600 bg-gray-100';
      case 'security':
      case '2fa_enabled':
      case '2fa_disabled':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = () => {
    if (!auditLogs) return;
    
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userName,
        log.action,
        log.resource,
        JSON.stringify(log.details || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!auditLogs) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];
  const uniqueUsers = [...new Set(auditLogs.map(log => log.userName))];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesUser = userFilter === 'all' || log.userName === userFilter;
    
    return matchesSearch && matchesAction && matchesUser;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <History className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Enterprise Activity Logs</CardTitle>
                <CardDescription>
                  Comprehensive audit trail of all enterprise feature activities
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {filteredLogs.length} entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportLogs} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Activity Timeline ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No audit logs match your search criteria</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  const actionColor = getActionColor(log.action);
                  
                  return (
                    <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${actionColor} flex-shrink-0`}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {log.action}
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">
                                {log.resource}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(log.timestamp)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <User className="h-3 w-3" />
                              <span>{log.userName}</span>
                              {log.ipAddress && (
                                <>
                                  <span>•</span>
                                  <span className="text-xs">{log.ipAddress}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                              <div className="flex items-center mb-1">
                                <FileText className="h-3 w-3 mr-1" />
                                <span className="font-medium">Details:</span>
                              </div>
                              <div className="ml-4 space-y-1">
                                {Object.entries(log.details).map(([key, value]) => (
                                  <div key={key} className="flex">
                                    <span className="font-medium w-20">{key}:</span>
                                    <span className="text-gray-500">{JSON.stringify(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <History className="mr-2 h-4 w-4" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Recent Activity:</p>
              <ul className="space-y-1 text-gray-600">
                <li>Total entries: {auditLogs.length}</li>
                <li>Filtered results: {filteredLogs.length}</li>
                <li>Active users: {uniqueUsers.length}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Action Types:</p>
              <ul className="space-y-1 text-gray-600">
                {uniqueActions.slice(0, 3).map(action => (
                  <li key={action}>
                    {action}: {auditLogs.filter(log => log.action === action).length}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Time Range:</p>
              <ul className="space-y-1 text-gray-600">
                {auditLogs.length > 0 && (
                  <>
                    <li>Latest: {formatTimestamp(auditLogs[0]?.timestamp)}</li>
                    <li>Oldest: {formatTimestamp(auditLogs[auditLogs.length - 1]?.timestamp)}</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}