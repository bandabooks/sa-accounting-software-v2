import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Users, DollarSign, Clock, FileText, Activity, Settings, BarChart3, Receipt, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-semibold mb-2">Project not found</h3>
            <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
            <Link href="/projects">
              <Button>Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customer = customers.find((c: any) => c.id === project.customerId);
  const manager = users.find((u: any) => u.id === project.projectManagerId);
  const budget = parseFloat(project.budgetAmount) || 0;
  const spent = parseFloat(project.actualCost) || 0;
  const burnPercentage = budget > 0 ? (spent / budget) * 100 : 0;
  const estimatedHours = parseFloat(project.estimatedHours) || 0;
  const actualHours = parseFloat(project.actualHours) || 0;
  const progress = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started": return "bg-gray-100 text-gray-800";
      case "planning": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-green-100 text-green-800";
      case "under_review": return "bg-purple-100 text-purple-800";
      case "awaiting_sars_verifications": return "bg-orange-100 text-orange-800";
      case "on_hold": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-emerald-100 text-emerald-800";
      case "finished": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-gray-100 text-gray-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">
              {customer ? customer.name : "Internal Project"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className={getPriorityColor(project.priority)}>
            {project.priority} Priority
          </Badge>
        </div>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-2xl font-bold text-gray-900">R{budget.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total allocated</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours</p>
                <p className="text-2xl font-bold text-gray-900">{actualHours || estimatedHours}</p>
                <p className="text-xs text-gray-500 mt-1">{actualHours ? 'Actual' : 'Estimated'}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{progress}%</p>
                <p className="text-xs text-gray-500 mt-1">{project.completedTasks} of {project.totalTasks} tasks</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Burn Rate</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(burnPercentage)}%</p>
                <p className="text-xs text-gray-500 mt-1">Budget utilization</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Time</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Budget</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center space-x-2">
            <Folder className="h-4 w-4" />
            <span>Files</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Client</p>
                    <p className="text-gray-900">{customer?.name || 'Internal Project'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Project Manager</p>
                    <p className="text-gray-900">{manager?.name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Start Date</p>
                    <p className="text-gray-900">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Due Date</p>
                    <p className="text-gray-900">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Billing Type</p>
                    <p className="text-gray-900">{project.billingType?.replace('_', ' ') || 'Fixed Rate'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hourly Rate</p>
                    <p className="text-gray-900">R{project.hourlyRate || '0'}/hr</p>
                  </div>
                </div>
                
                {project.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                    <p className="text-gray-900">{project.description}</p>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress and Budget */}
            <Card>
              <CardHeader>
                <CardTitle>Progress & Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Project Progress</span>
                    <span className="text-sm text-gray-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Budget Utilization</span>
                    <span className="text-sm text-gray-600">{Math.round(burnPercentage)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(burnPercentage, 100)} 
                    className="h-3"
                    style={{
                      '--progress-foreground': burnPercentage > 100 ? '#ef4444' : burnPercentage > 80 ? '#f59e0b' : '#10b981'
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Spent: R{spent.toLocaleString()}</span>
                    <span>Budget: R{budget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estimated Hours</span>
                    <span className="text-sm font-medium">{estimatedHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Actual Hours</span>
                    <span className="text-sm font-medium">{actualHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining Budget</span>
                    <span className="text-sm font-medium">R{Math.max(0, budget - spent).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage project tasks and deliverables</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Task Management</p>
              <p className="text-sm mt-2">View and manage all project tasks, assign team members, and track progress</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>Track time spent on project activities</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Time Entries</p>
              <p className="text-sm mt-2">Log time, track billable hours, and monitor team productivity</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>Monitor project financials and budget allocation</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Budget Analysis</p>
              <p className="text-sm mt-2">Track expenses, monitor burn rate, and analyze profitability</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Generate and manage project invoices</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Invoice Management</p>
              <p className="text-sm mt-2">Create invoices, track payments, and manage billing cycles</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Files & Documents</CardTitle>
              <CardDescription>Manage project documents and attachments</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-gray-500">
              <Folder className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Document Management</p>
              <p className="text-sm mt-2">Upload, organize, and share project files and documents</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Recent project activities and updates</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Project Activity</p>
              <p className="text-sm mt-2">Track project updates, team comments, and milestone achievements</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Configure project parameters and permissions</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Project Configuration</p>
              <p className="text-sm mt-2">Manage project settings, team access, and advanced configurations</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}