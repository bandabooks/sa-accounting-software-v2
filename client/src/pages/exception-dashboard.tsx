import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Clock, CheckCircle, XCircle, ArrowUp, Bell, Eye, Play, RefreshCw } from "lucide-react";

interface PaymentException {
  id: number;
  title: string;
  description: string;
  exceptionType: string;
  severity: string;
  status: string;
  detectedAt: string;
  relatedInvoiceId?: number;
  relatedPurchaseOrderId?: number;
  relatedPaymentId?: number;
  amountExpected?: number;
  amountActual?: number;
  currencyCode: string;
  assignedTo?: number;
  detectedBy: number;
  resolvedBy?: number;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExceptionAlert {
  id: number;
  title: string;
  description: string;
  alertType: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
  exceptionId?: number;
}

export default function ExceptionDashboard() {
  const [selectedTab, setSelectedTab] = useState("exceptions");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedException, setSelectedException] = useState<PaymentException | null>(null);
  const [escalationReason, setEscalationReason] = useState("");
  const [resolution, setResolution] = useState("");

  const queryClient = useQueryClient();

  // Fetch payment exceptions
  const { data: exceptions = [], isLoading: exceptionsLoading } = useQuery({
    queryKey: ["/api/payment-exceptions"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch exception alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/exception-alerts"],
    refetchInterval: 15000, // Refresh every 15 seconds for real-time alerts
  });

  // Run automated detection mutation
  const runDetectionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/payment-exceptions/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to run detection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exception-alerts"] });
    },
  });

  // Resolve exception mutation
  const resolveExceptionMutation = useMutation({
    mutationFn: async (data: { id: number; resolution: string }) => {
      const response = await fetch(`/api/payment-exceptions/${data.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: data.resolution }),
      });
      if (!response.ok) throw new Error("Failed to resolve exception");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-exceptions"] });
      setResolution("");
      setSelectedException(null);
    },
  });

  // Escalate exception mutation
  const escalateExceptionMutation = useMutation({
    mutationFn: async (data: { id: number; escalationReason: string; toUserId: number }) => {
      const response = await fetch(`/api/payment-exceptions/${data.id}/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalationReason: data.escalationReason,
          toUserId: data.toUserId,
          escalationLevel: "management",
        }),
      });
      if (!response.ok) throw new Error("Failed to escalate exception");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-exceptions"] });
      setEscalationReason("");
      setSelectedException(null);
    },
  });

  // Mark alert as read mutation
  const markAlertReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/exception-alerts/${alertId}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to mark alert as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exception-alerts"] });
    },
  });

  // Ensure exceptions is always an array and filter based on search and filters
  const safeExceptions = Array.isArray(exceptions) ? exceptions : [];
  const filteredExceptions = safeExceptions.filter((exception: PaymentException) => {
    if (!exception) return false;
    
    const matchesSearch = searchQuery === "" || 
      (exception.title && exception.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exception.description && exception.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || statusFilter === "" || exception.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || severityFilter === "" || exception.severity === severityFilter;
    const matchesType = typeFilter === "all" || typeFilter === "" || exception.exceptionType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "investigating": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "escalated": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "resolved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "dismissed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return <AlertTriangle className="h-4 w-4" />;
      case "investigating": return <Clock className="h-4 w-4" />;
      case "escalated": return <ArrowUp className="h-4 w-4" />;
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      case "dismissed": return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const unreadAlertsCount = safeAlerts.filter((alert: ExceptionAlert) => alert && !alert.isRead).length;

  // Show loading state
  if (exceptionsLoading || alertsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading exception data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exception Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage payment flow exceptions and compliance alerts
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadAlertsCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <Bell className="h-3 w-3 mr-1" />
              {unreadAlertsCount} alerts
            </Badge>
          )}
          <Button
            onClick={() => runDetectionMutation.mutate()}
            disabled={runDetectionMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {runDetectionMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Detection
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Exceptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {safeExceptions.filter((e: PaymentException) => e && e.status === "open").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {safeExceptions.filter((e: PaymentException) => e && e.severity === "critical").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {safeExceptions.filter((e: PaymentException) => e && e.status === "investigating").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {unreadAlertsCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="exceptions">Payment Exceptions</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {unreadAlertsCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadAlertsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exceptions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search exceptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Exception Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="amount_mismatch">Amount Mismatch</SelectItem>
                      <SelectItem value="duplicate_supplier">Duplicate Supplier</SelectItem>
                      <SelectItem value="duplicate_payment">Duplicate Payment</SelectItem>
                      <SelectItem value="missing_documents">Missing Documents</SelectItem>
                      <SelectItem value="approval_bypass">Approval Bypass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exceptions List */}
          <div className="space-y-4">
            {exceptionsLoading ? (
              <div className="text-center py-8">Loading exceptions...</div>
            ) : filteredExceptions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No exceptions found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredExceptions.map((exception: PaymentException) => (
                <Card key={exception.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{exception.title}</h3>
                          <Badge className={getSeverityColor(exception.severity)}>
                            {exception.severity}
                          </Badge>
                          <Badge className={getStatusColor(exception.status)}>
                            {getStatusIcon(exception.status)}
                            <span className="ml-1">{exception.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exception.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Type: {exception.exceptionType.replace("_", " ")}</span>
                          <span>Detected: {new Date(exception.detectedAt).toLocaleDateString()}</span>
                          {exception.amountExpected && exception.amountActual && (
                            <span>
                              Expected: {exception.currencyCode} {exception.amountExpected} | 
                              Actual: {exception.currencyCode} {exception.amountActual}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedException(exception)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Exception Details</DialogTitle>
                              <DialogDescription>
                                Manage this payment flow exception
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <Label>Exception ID</Label>
                                  <div className="text-sm font-mono">{exception.id}</div>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Badge className={getStatusColor(exception.status)}>
                                    {exception.status}
                                  </Badge>
                                </div>
                                <div>
                                  <Label>Severity</Label>
                                  <Badge className={getSeverityColor(exception.severity)}>
                                    {exception.severity}
                                  </Badge>
                                </div>
                                <div>
                                  <Label>Type</Label>
                                  <div className="text-sm">{exception.exceptionType.replace("_", " ")}</div>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Description</Label>
                                <p className="text-sm text-muted-foreground mt-1">{exception.description}</p>
                              </div>

                              {exception.status !== "resolved" && exception.status !== "dismissed" && (
                                <div className="space-y-4 pt-4 border-t">
                                  <div>
                                    <Label htmlFor="resolution">Resolution</Label>
                                    <Textarea
                                      id="resolution"
                                      placeholder="Describe how this exception was resolved..."
                                      value={resolution}
                                      onChange={(e) => setResolution(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => {
                                        if (resolution.trim()) {
                                          resolveExceptionMutation.mutate({
                                            id: exception.id,
                                            resolution: resolution.trim(),
                                          });
                                        }
                                      }}
                                      disabled={!resolution.trim() || resolveExceptionMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Resolve
                                    </Button>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline">
                                          <ArrowUp className="h-4 w-4 mr-1" />
                                          Escalate
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Escalate Exception</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label htmlFor="escalation-reason">Escalation Reason</Label>
                                            <Textarea
                                              id="escalation-reason"
                                              placeholder="Why is this exception being escalated?"
                                              value={escalationReason}
                                              onChange={(e) => setEscalationReason(e.target.value)}
                                            />
                                          </div>
                                          <Button
                                            onClick={() => {
                                              if (escalationReason.trim()) {
                                                escalateExceptionMutation.mutate({
                                                  id: exception.id,
                                                  escalationReason: escalationReason.trim(),
                                                  toUserId: 1, // Default to admin for now
                                                });
                                              }
                                            }}
                                            disabled={!escalationReason.trim() || escalateExceptionMutation.isPending}
                                            className="w-full"
                                          >
                                            Escalate to Management
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alertsLoading ? (
              <div className="text-center py-8">Loading alerts...</div>
            ) : safeAlerts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No alerts at this time.</p>
                </CardContent>
              </Card>
            ) : (
              safeAlerts.map((alert: ExceptionAlert) => (
                <Card key={alert.id} className={`hover:shadow-md transition-shadow ${!alert.isRead ? 'ring-2 ring-blue-200' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-semibold ${!alert.isRead ? 'text-blue-700' : ''}`}>
                            {alert.title}
                          </h3>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {!alert.isRead && (
                            <Badge variant="secondary">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Type: {alert.alertType.replace("_", " ")}</span>
                          <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!alert.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAlertReadMutation.mutate(alert.id)}
                            disabled={markAlertReadMutation.isPending}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}