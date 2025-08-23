import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Building2,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Banknote,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { Link } from 'wouter';

interface ClientSummary {
  id: number;
  name: string;
  tradingName?: string;
  businessType: string;
  status: 'active' | 'inactive' | 'pending';
  servicePackage: string;
  monthlyFee: string;
  assignedTo?: string;
  lastActivity?: string;
  complianceStatus: 'compliant' | 'warning' | 'overdue';
  outstandingTasks: number;
  yearEndDue?: string;
  vatReturns?: {
    next: string;
    status: 'current' | 'overdue';
  };
}

export default function PracticeDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [selectedView, setSelectedView] = useState<'overview' | 'calendar' | 'tasks'>('overview');

  // Fetch practice clients
  const { data: practiceClients = [], isLoading } = useQuery({
    queryKey: ['/api/practice/clients'],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return [
        {
          id: 1,
          name: "Acme Construction (Pty) Ltd",
          tradingName: "Acme Builders",
          businessType: "pty",
          status: "active",
          servicePackage: "premium",
          monthlyFee: "4500.00",
          assignedTo: "Current User",
          lastActivity: "2 days ago",
          complianceStatus: "compliant",
          outstandingTasks: 2,
          yearEndDue: "2024-02-28",
          vatReturns: { next: "2024-01-31", status: "current" }
        },
        {
          id: 2,
          name: "Green Valley Restaurant CC",
          businessType: "cc",
          status: "active",
          servicePackage: "standard",
          monthlyFee: "2800.00",
          assignedTo: "Current User",
          lastActivity: "1 week ago",
          complianceStatus: "warning",
          outstandingTasks: 5,
          yearEndDue: "2024-06-30",
          vatReturns: { next: "2024-01-31", status: "overdue" }
        },
        {
          id: 3,
          name: "Tech Solutions SA",
          businessType: "pty",
          status: "pending",
          servicePackage: "basic",
          monthlyFee: "1200.00",
          assignedTo: "Current User",
          lastActivity: "3 days ago",
          complianceStatus: "overdue",
          outstandingTasks: 8,
          yearEndDue: "2024-04-30",
          vatReturns: { next: "2023-12-31", status: "overdue" }
        }
      ] as ClientSummary[];
    }
  });

  // Filter clients based on search and filters
  const filteredClients = practiceClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (client.tradingName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesPackage = packageFilter === 'all' || client.servicePackage === packageFilter;
    
    return matchesSearch && matchesStatus && matchesPackage;
  });

  // Calculate metrics
  const totalClients = practiceClients.length;
  const activeClients = practiceClients.filter(c => c.status === 'active').length;
  const totalMonthlyRevenue = practiceClients.reduce((sum, client) => sum + parseFloat(client.monthlyFee), 0);
  const clientsWithIssues = practiceClients.filter(c => c.complianceStatus !== 'compliant').length;
  const totalOutstandingTasks = practiceClients.reduce((sum, client) => sum + client.outstandingTasks, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading practice dashboard...</div>;
  }

  return (
    <div className="space-y-6" data-testid="practice-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Practice Dashboard</h1>
          <p className="text-gray-600">Manage your client portfolio and track service delivery</p>
        </div>
        <Button data-testid="button-add-client">
          <Plus className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{totalClients}</p>
                <p className="text-sm text-gray-500">{activeClients} active</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">R{totalMonthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
              <Banknote className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Issues</p>
                <p className="text-3xl font-bold text-gray-900">{clientsWithIssues}</p>
                <p className="text-sm text-red-600">Needs attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{totalOutstandingTasks}</p>
                <p className="text-sm text-yellow-600">Across all clients</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-client-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={packageFilter} onValueChange={setPackageFilter}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-package-filter">
                <SelectValue placeholder="Package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Client Portfolio ({filteredClients.length})</h2>
        
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No clients found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {client.name}
                          </h3>
                          {client.tradingName && (
                            <p className="text-sm text-gray-600 mb-2">T/A {client.tradingName}</p>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            {getStatusBadge(client.status)}
                            <Badge variant="outline" className="capitalize">
                              {client.servicePackage}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {client.businessType.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getComplianceBadge(client.complianceStatus)}
                          <span className="text-lg font-semibold text-gray-900">
                            R{parseFloat(client.monthlyFee).toLocaleString()}/mo
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Outstanding Tasks</p>
                          <p className="text-lg font-semibold text-red-600">{client.outstandingTasks}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Year-End Due</p>
                          <p className="text-sm text-gray-900">{client.yearEndDue}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Next VAT Return</p>
                          <div className="flex items-center gap-1">
                            <span className={`text-sm ${client.vatReturns?.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                              {client.vatReturns?.next}
                            </span>
                            {client.vatReturns?.status === 'overdue' && (
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Last activity: {client.lastActivity}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-view-client-${client.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-manage-client-${client.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-reports-client-${client.id}`}>
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Reports
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}