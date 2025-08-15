import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  AlertTriangle, Bell, Calendar, Clock, CheckCircle, XCircle, 
  FileText, DollarSign, Users, Building, TrendingUp, AlertCircle,
  Eye, Archive, Trash2, Filter, Download, RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils-invoice";

interface Alert {
  id: number;
  type: 'vat' | 'invoice' | 'customer' | 'compliance' | 'system' | 'financial';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  actionRequired: boolean;
  dueDate?: string;
  amount?: string;
  status: 'active' | 'resolved' | 'dismissed';
  createdAt: string;
  actionUrl?: string;
}

export default function AlertsPage() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Mock alerts data - in real app this would come from API
  const alerts: Alert[] = [
    {
      id: 1,
      type: 'vat',
      priority: 'high',
      title: 'VAT Return Due in 3 Days',
      description: 'Your monthly VAT return for July 2024 is due on August 18, 2024. Ensure all invoices and expenses are captured.',
      actionRequired: true,
      dueDate: '2024-08-18',
      status: 'active',
      createdAt: '2024-08-15T10:00:00Z',
      actionUrl: '/vat/returns'
    },
    {
      id: 2,
      type: 'invoice',
      priority: 'medium',
      title: 'Overdue Invoice: INV-001234',
      description: 'Invoice INV-001234 for ABC Company is 15 days overdue.',
      actionRequired: true,
      amount: 'R 5,250.00',
      dueDate: '2024-07-30',
      status: 'active',
      createdAt: '2024-08-14T15:30:00Z',
      actionUrl: '/invoices/1234'
    },
    {
      id: 3,
      type: 'compliance',
      priority: 'medium',
      title: 'CIPC Annual Return Reminder',
      description: 'Your company annual return filing is due within 30 days.',
      actionRequired: true,
      dueDate: '2024-09-15',
      status: 'active',
      createdAt: '2024-08-14T09:15:00Z',
      actionUrl: '/compliance/cipc'
    },
    {
      id: 4,
      type: 'financial',
      priority: 'low',
      title: 'Bank Reconciliation Pending',
      description: 'You have 5 unreconciled bank transactions from last week.',
      actionRequired: false,
      status: 'active',
      createdAt: '2024-08-13T14:20:00Z',
      actionUrl: '/banking/reconciliation'
    },
    {
      id: 5,
      type: 'customer',
      priority: 'low',
      title: 'New Customer Registration',
      description: 'XYZ Corporation has registered and requires setup verification.',
      actionRequired: false,
      status: 'active',
      createdAt: '2024-08-12T11:45:00Z',
      actionUrl: '/customers/new-registrations'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'vat': return <FileText className="h-5 w-5" />;
      case 'invoice': return <DollarSign className="h-5 w-5" />;
      case 'customer': return <Users className="h-5 w-5" />;
      case 'compliance': return <Building className="h-5 w-5" />;
      case 'financial': return <TrendingUp className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'vat': return 'bg-purple-100 text-purple-800';
      case 'invoice': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'compliance': return 'bg-indigo-100 text-indigo-800';
      case 'financial': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (selectedTab !== "all" && alert.type !== selectedTab) return false;
    if (filterPriority !== "all" && alert.priority !== filterPriority) return false;
    if (selectedTab === "action-required" && !alert.actionRequired) return false;
    return alert.status === 'active';
  });

  const alertCounts = {
    all: alerts.filter(a => a.status === 'active').length,
    vat: alerts.filter(a => a.type === 'vat' && a.status === 'active').length,
    invoice: alerts.filter(a => a.type === 'invoice' && a.status === 'active').length,
    compliance: alerts.filter(a => a.type === 'compliance' && a.status === 'active').length,
    actionRequired: alerts.filter(a => a.actionRequired && a.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-600 mt-1">Monitor important notifications and required actions</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Priority: {filterPriority === 'all' ? 'All' : filterPriority}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterPriority('all')}>All Priorities</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('urgent')}>Urgent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('high')}>High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('medium')}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('low')}>Low</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Active</p>
                <p className="text-2xl font-bold text-gray-900">{alertCounts.all}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-orange-600">{alertCounts.actionRequired}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">VAT Related</p>
                <p className="text-2xl font-bold text-purple-600">{alertCounts.vat}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance</p>
                <p className="text-2xl font-bold text-indigo-600">{alertCounts.compliance}</p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Alerts ({alertCounts.all})</TabsTrigger>
          <TabsTrigger value="action-required">Action Required ({alertCounts.actionRequired})</TabsTrigger>
          <TabsTrigger value="vat">VAT ({alertCounts.vat})</TabsTrigger>
          <TabsTrigger value="invoice">Invoices ({alertCounts.invoice})</TabsTrigger>
          <TabsTrigger value="compliance">Compliance ({alertCounts.compliance})</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Alerts</h3>
                <p className="text-gray-600">
                  {selectedTab === "all" 
                    ? "Great! You have no active alerts at the moment." 
                    : `No ${selectedTab.replace('-', ' ')} alerts found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getAlertTypeColor(alert.type)}`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(alert.priority)}`}>
                              {alert.priority.toUpperCase()}
                            </Badge>
                            {alert.actionRequired && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created: {new Date(alert.createdAt).toLocaleDateString()}
                            </div>
                            {alert.dueDate && (
                              <div className="flex items-center gap-1 text-orange-600">
                                <Clock className="h-3 w-3" />
                                Due: {new Date(alert.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            {alert.amount && (
                              <div className="flex items-center gap-1 text-green-600">
                                <DollarSign className="h-3 w-3" />
                                {alert.amount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.actionUrl && (
                          <Button asChild size="sm" variant="outline">
                            <Link href={alert.actionUrl}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              •••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Dismiss
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}