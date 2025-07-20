import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Activity, Clock, Eye, Edit, Trash2, Plus, Search, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function SuperAdminAuditLogs() {
  const [, params] = useRoute("/super-admin/companies/:companyId/audit-logs");
  const companyId = params?.companyId;
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  // Fetch audit logs for the company
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["/api/super-admin/audit-logs/company", companyId],
    enabled: !!companyId,
  });

  // Fetch company details
  const { data: company } = useQuery({
    queryKey: ["/api/super-admin/companies", companyId],
    enabled: !!companyId,
  });

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <Plus className="h-4 w-4 text-green-600" />;
      case 'update': case 'edit': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'view': case 'read': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-50 border-green-200';
      case 'update': case 'edit': return 'bg-blue-50 border-blue-200';
      case 'delete': return 'bg-red-50 border-red-200';
      case 'view': case 'read': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Filter logs based on search term and action filter
  const filteredLogs = auditLogs?.filter((log: any) => {
    const matchesSearch = !searchTerm || 
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action?.toLowerCase() === actionFilter;
    
    return matchesSearch && matchesAction;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/super-admin/companies/${companyId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Company
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            {company ? `${company.displayName} - Complete audit trail` : 'Company audit trail'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs by description, resource, or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Activity Timeline</span>
            </div>
            <Badge variant="outline">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Complete audit trail showing all user activities and system changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground mb-2">
                {searchTerm || actionFilter !== "all" ? "No Matching Activities" : "No Activity Yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || actionFilter !== "all" 
                  ? "Try adjusting your search criteria or filters."
                  : "User activities and system changes will appear here as they occur."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log: any) => (
                <div key={log.id} className={`p-4 rounded-lg border ${getActionColor(log.action)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {log.action.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {log.resourceType}
                          </Badge>
                          {log.resourceId && (
                            <Badge variant="outline" className="text-xs">
                              ID: {log.resourceId}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(log.createdAt || log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <p className="font-medium text-sm text-gray-900 mb-1">
                        {log.description || `${log.action} ${log.resourceType} ${log.resourceId || ''}`}
                      </p>
                      
                      {log.details && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {log.details}
                        </p>
                      )}

                      {log.user && (
                        <div className="text-xs text-muted-foreground mb-2">
                          <span className="font-medium">User:</span> {log.user.name} ({log.user.email})
                        </div>
                      )}
                      
                      {(log.oldValues || log.newValues) && (
                        <div className="mt-2 text-xs bg-white/50 p-2 rounded border">
                          <div className="font-medium mb-1">Changes:</div>
                          {log.oldValues && (
                            <div className="mb-1">
                              <span className="font-medium text-red-600">Before:</span>
                              <span className="ml-2 text-muted-foreground">
                                {typeof log.oldValues === 'string' ? log.oldValues : JSON.stringify(log.oldValues, null, 2)}
                              </span>
                            </div>
                          )}
                          {log.newValues && (
                            <div>
                              <span className="font-medium text-green-600">After:</span>
                              <span className="ml-2 text-muted-foreground">
                                {typeof log.newValues === 'string' ? log.newValues : JSON.stringify(log.newValues, null, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}