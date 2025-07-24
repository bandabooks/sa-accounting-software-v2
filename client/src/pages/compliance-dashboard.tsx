import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Building2,
  Briefcase,
  Scale,
  Plus,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface ComplianceDashboardStats {
  clients: {
    total: number;
    active: number;
    onboarding: number;
  };
  tasks: {
    total: number;
    pending: number;
    overdue: number;
    urgent: number;
  };
  upcomingDeadlines: Array<{
    id: number;
    title: string;
    eventDate: string;
    eventType: string;
    complianceType: string;
    clientId?: number;
  }>;
}

export default function ComplianceDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/compliance/dashboard"],
    queryFn: () => apiRequest("/api/compliance/dashboard", "GET").then(res => res.json()),
  });

  const { data: recentTasks } = useQuery({
    queryKey: ["/api/compliance/tasks", { limit: 5 }],
    queryFn: () => apiRequest("/api/compliance/tasks?limit=5", "GET").then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const dashboardStats: ComplianceDashboardStats = stats || {
    clients: { total: 0, active: 0, onboarding: 0 },
    tasks: { total: 0, pending: 0, overdue: 0, urgent: 0 },
    upcomingDeadlines: []
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Management</h1>
          <p className="text-gray-600 mt-1">
            Centralized South African compliance tracking for SARS, CIPC, and Labour requirements
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/compliance/clients/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </Button>
          </Link>
          <Link href="/compliance/tasks/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Total Clients</p>
                <p className="text-2xl font-bold text-blue-900">{dashboardStats.clients.total}</p>
                <p className="text-xs text-blue-600">{dashboardStats.clients.active} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Onboarding</p>
                <p className="text-2xl font-bold text-green-900">{dashboardStats.clients.onboarding}</p>
                <p className="text-xs text-green-600">in progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-700">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-900">{dashboardStats.tasks.pending}</p>
                <p className="text-xs text-orange-600">{dashboardStats.tasks.overdue} overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-600 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Urgent Tasks</p>
                <p className="text-2xl font-bold text-red-900">{dashboardStats.tasks.urgent}</p>
                <p className="text-xs text-red-600">requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Modules */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="h-5 w-5 mr-2" />
                Compliance Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/compliance/sars">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="p-3 bg-green-600 rounded-lg mx-auto w-fit mb-3">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-green-900">SARS Compliance</h3>
                      <p className="text-sm text-green-700 mt-1">Tax, VAT, PAYE, eFiling</p>
                      <Badge variant="secondary" className="mt-2 bg-green-200 text-green-800">
                        {/* You could add pending SARS items count here */}
                        Active
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/compliance/cipc">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="p-3 bg-blue-600 rounded-lg mx-auto w-fit mb-3">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-blue-900">CIPC Compliance</h3>
                      <p className="text-sm text-blue-700 mt-1">Annual Returns, Changes</p>
                      <Badge variant="secondary" className="mt-2 bg-blue-200 text-blue-800">
                        Active
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/compliance/labour">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <div className="p-3 bg-purple-600 rounded-lg mx-auto w-fit mb-3">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-purple-900">Labour Compliance</h3>
                      <p className="text-sm text-purple-700 mt-1">UIF, SDL, COIDA</p>
                      <Badge variant="secondary" className="mt-2 bg-purple-200 text-purple-800">
                        Active
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Tasks
                </CardTitle>
                <Link href="/compliance/tasks">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTasks && recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {task.priority === 'urgent' ? <AlertCircle className="h-4 w-4" /> :
                           task.priority === 'high' ? <AlertTriangle className="h-4 w-4" /> :
                           <FileText className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.complianceType || 'General'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {format(new Date(task.dueDate), 'MMM dd')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent tasks</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardStats.upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {dashboardStats.upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{deadline.title}</p>
                          <p className="text-sm text-gray-600 capitalize">{deadline.complianceType || deadline.eventType}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(deadline.eventDate), 'MMM dd')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/compliance/clients">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Clients
                  </Button>
                </Link>
                <Link href="/compliance/calendar">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                </Link>
                <Link href="/compliance/documents">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Document Library
                  </Button>
                </Link>
                <Link href="/compliance/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Compliance Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}