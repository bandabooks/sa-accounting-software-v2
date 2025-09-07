import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Calendar, Users, BarChart3, Clock, DollarSign, Target, TrendingUp, CheckCircle2, AlertTriangle, PauseCircle, XCircle, PlayCircle, Eye, Building2, Filter, Grid3X3, List, Search, SortAsc } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { insertProjectSchema, type ProjectWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertProjectSchema.omit({ 
  companyId: true, 
  createdBy: true,
  actualHours: true,
  actualCost: true,
  createdAt: true,
  updatedAt: true
});

export default function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    client: '',
    manager: '',
    billingType: '',
    dateRange: { start: '', end: '' },
    tags: [] as string[],
    showAtRisk: false,
    showOverBudget: false,
    showNoPM: false,
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' as 'asc' | 'desc' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("/api/projects", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "not_started",
      priority: "medium",
      isInternal: false,
      hourlyRate: 0,
      billingType: "tm",
      progressThroughTasks: true,
      sendProjectCreatedEmail: false,
      tags: [],
      estimatedHours: 0,
      budgetAmount: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values);
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not_started": return <PauseCircle className="h-4 w-4" />;
      case "planning": return <Target className="h-4 w-4" />;
      case "in_progress": return <PlayCircle className="h-4 w-4" />;
      case "under_review": return <Eye className="h-4 w-4" />;
      case "awaiting_sars_verifications": return <Building2 className="h-4 w-4" />;
      case "on_hold": return <PauseCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "finished": return <CheckCircle2 className="h-4 w-4" />;
      default: return <PauseCircle className="h-4 w-4" />;
    }
  };

  // Apply filters to projects
  const filteredProjects = projects.filter((project: any) => {
    // Search filter
    if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all' && project.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all' && project.priority !== filters.priority) {
      return false;
    }

    // Client filter
    if (filters.client && filters.client !== 'all' && project.customerId?.toString() !== filters.client) {
      return false;
    }

    // Billing type filter
    if (filters.billingType && filters.billingType !== 'all' && project.billingType !== filters.billingType) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start && project.startDate && new Date(project.startDate) < new Date(filters.dateRange.start)) {
      return false;
    }
    if (filters.dateRange.end && project.endDate && new Date(project.endDate) > new Date(filters.dateRange.end)) {
      return false;
    }

    // At Risk filter
    if (filters.showAtRisk) {
      const dueDate = project.endDate ? new Date(project.endDate) : null;
      const now = new Date();
      const daysDiff = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      const isAtRisk = daysDiff <= 7 && daysDiff > 0 && !['completed', 'finished', 'cancelled'].includes(project.status);
      if (!isAtRisk) return false;
    }

    // Over Budget filter
    if (filters.showOverBudget) {
      const budget = parseFloat(project.budgetAmount) || 0;
      const actual = parseFloat(project.actualCost) || 0;
      const isOverBudget = budget > 0 && actual > budget;
      if (!isOverBudget) return false;
    }

    // No PM filter
    if (filters.showNoPM && project.projectManagerId) {
      return false;
    }

    return true;
  });

  // Calculate comprehensive project statistics
  const projectStats = {
    total: projects.length,
    notStarted: projects.filter((p: any) => p.status === 'not_started').length,
    active: projects.filter((p: any) => p.status === 'in_progress').length,
    onHold: projects.filter((p: any) => p.status === 'on_hold').length,
    completed: projects.filter((p: any) => ['completed', 'finished'].includes(p.status)).length,
    overdue: projects.filter((p: any) => p.endDate && new Date(p.endDate) < new Date() && !['completed', 'finished', 'cancelled'].includes(p.status)).length,
    // At-Risk: due <= 7 days & <100% OR schedule slip
    atRisk: projects.filter((p: any) => {
      const dueDate = p.endDate ? new Date(p.endDate) : null;
      const now = new Date();
      const daysDiff = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      return daysDiff <= 7 && daysDiff > 0 && !['completed', 'finished', 'cancelled'].includes(p.status);
    }).length,
    // Over Budget: actual cost > budget
    overBudget: projects.filter((p: any) => {
      const budget = parseFloat(p.budgetAmount) || 0;
      const actual = parseFloat(p.actualCost) || 0;
      return budget > 0 && actual > budget;
    }).length,
    // No PM assigned
    noPM: projects.filter((p: any) => !p.projectManagerId).length,
    // Financial metrics
    totalBudget: projects.reduce((sum: number, p: any) => sum + (parseFloat(p.budgetAmount) || 0), 0),
    totalEstimatedHours: projects.reduce((sum: number, p: any) => sum + (parseFloat(p.estimatedHours) || 0), 0),
    unbilledHours: projects.reduce((sum: number, p: any) => {
      const estimated = parseFloat(p.estimatedHours) || 0;
      const actual = parseFloat(p.actualHours) || 0;
      return sum + Math.max(0, actual - (estimated * 0.1)); // Assuming 10% buffer for billing
    }, 0),
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">
            Track projects, manage teams, and monitor financial performance across your portfolio
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
              <DialogDescription>
                Create a comprehensive project with professional settings, team management, and budget tracking
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="project" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="project" className="font-semibold">Project</TabsTrigger>
                    <TabsTrigger value="settings" className="font-semibold">Project Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="project" className="space-y-6">
                    {/* Project Name & Customer */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Project Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter project name" {...field} className="border-gray-300" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Customer *</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                              <FormControl>
                                <SelectTrigger className="border-gray-300">
                                  <SelectValue placeholder="Select and begin typing" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">No Customer (Internal Project)</SelectItem>
                                {customers.map((customer: any) => (
                                  <SelectItem key={customer.id} value={customer.id.toString()}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Progress Through Tasks Checkbox */}
                    <FormField
                      control={form.control}
                      name="progressThroughTasks"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              Calculate progress through tasks
                            </FormLabel>
                            <div className="text-xs text-gray-600">
                              Progress 0%
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Billing Type & Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="billingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Billing Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-gray-300">
                                  <SelectValue placeholder="Fixed Rate" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tm">Time & Materials</SelectItem>
                                <SelectItem value="fixed_fee">Fixed Fee</SelectItem>
                                <SelectItem value="retainer">Retainer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-gray-300">
                                  <SelectValue placeholder="Not Started" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="awaiting_sars_verifications">Awaiting SARS Verifications</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="finished">Finished</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Total Rate & Estimated Hours */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budgetAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Total Rate</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00" 
                                {...field}
                                className="border-gray-300"
                                onChange={(e) => field.onChange(e.target.value || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estimatedHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Estimated Hours</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.25"
                                placeholder="0" 
                                {...field}
                                className="border-gray-300"
                                onChange={(e) => field.onChange(e.target.value || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Members & Deadline */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="projectManagerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Members</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                              <FormControl>
                                <SelectTrigger className="border-gray-300">
                                  <SelectValue placeholder="Select team members" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">No Members</SelectItem>
                                {users.map((user: any) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Deadline</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field}
                                value={field.value || ''}
                                className="border-gray-300"
                                onChange={(e) => field.onChange(e.target.value || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Start Date *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value || ''}
                              className="border-gray-300"
                              onChange={(e) => field.onChange(e.target.value || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Tags</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Add tags (comma separated)"
                              value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                              className="border-gray-300"
                              onChange={(e) => {
                                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                                field.onChange(tags);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Save as Template */}
                    <FormField
                      control={form.control}
                      name="isTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Save Project As Template</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "yes")} value={field.value ? "yes" : "no"}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300">
                                <SelectValue placeholder="No" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="yes">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Rich Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter detailed project description..."
                              className="min-h-[120px] border-gray-300 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Send Email Checkbox */}
                    <FormField
                      control={form.control}
                      name="sendProjectCreatedEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              Send project created email
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg font-medium">Advanced Project Settings</p>
                      <p className="text-sm mt-2">Configure recurring projects, automation, and advanced billing options</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg">
                    {createMutation.isPending ? "Creating..." : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Professional Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3 mb-6">
        {/* Total Projects */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {/* Filter all projects */}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Total Projects</p>
                <p className="text-xl font-bold text-blue-900">{projectStats.total}</p>
                <p className="text-[10px] text-blue-600 mt-0.5">All projects</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-full">
                <BarChart3 className="h-4 w-4 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Not Started */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {/* Filter not started */}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-700">Not Started</p>
                <p className="text-xl font-bold text-gray-900">{projectStats.notStarted}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">Pending start</p>
              </div>
              <div className="p-2 bg-gray-200 rounded-full">
                <PauseCircle className="h-4 w-4 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {/* Filter in progress */}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">In Progress</p>
                <p className="text-xl font-bold text-green-900">{projectStats.active}</p>
                <p className="text-[10px] text-green-600 mt-0.5">Active now</p>
              </div>
              <div className="p-2 bg-green-200 rounded-full">
                <PlayCircle className="h-4 w-4 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* On Hold */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {/* Filter on hold */}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-700">On Hold</p>
                <p className="text-xl font-bold text-yellow-900">{projectStats.onHold}</p>
                <p className="text-[10px] text-yellow-600 mt-0.5">Paused</p>
              </div>
              <div className="p-2 bg-yellow-200 rounded-full">
                <PauseCircle className="h-4 w-4 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {/* Filter completed */}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700">Completed</p>
                <p className="text-xl font-bold text-emerald-900">{projectStats.completed}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Finished</p>
              </div>
              <div className="p-2 bg-emerald-200 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* At Risk */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {/* Filter at risk */}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-700">At Risk</p>
                <p className="text-xl font-bold text-orange-900">{projectStats.atRisk}</p>
                <p className="text-[10px] text-orange-600 mt-0.5">Due ≤7 days</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-full">
                <AlertTriangle className="h-4 w-4 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Over Budget */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {/* Filter over budget */}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700">Over Budget</p>
                <p className="text-xl font-bold text-red-900">{projectStats.overBudget}</p>
                <p className="text-[10px] text-red-600 mt-0.5">Exceeded</p>
              </div>
              <div className="p-2 bg-red-200 rounded-full">
                <TrendingUp className="h-4 w-4 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No PM Assigned */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-pink-50 to-pink-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {/* Filter no PM */}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-pink-700">No PM</p>
                <p className="text-xl font-bold text-pink-900">{projectStats.noPM}</p>
                <p className="text-[10px] text-pink-600 mt-0.5">Unassigned</p>
              </div>
              <div className="p-2 bg-pink-200 rounded-full">
                <Users className="h-4 w-4 text-pink-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unbilled Hours */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {/* Show unbilled hours */}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-700">Unbilled Hours</p>
                <p className="text-xl font-bold text-indigo-900">{projectStats.unbilledHours.toFixed(1)}</p>
                <p className="text-[10px] text-indigo-600 mt-0.5">Ready to bill</p>
              </div>
              <div className="p-2 bg-indigo-200 rounded-full">
                <Clock className="h-4 w-4 text-indigo-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters Bar */}
      <Card className="mb-6 border-gray-200">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search and View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search projects..." 
                    className="pl-10 w-80" 
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.billingType} onValueChange={(value) => setFilters(prev => ({ ...prev, billingType: value }))}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Billing Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Billing</SelectItem>
                  <SelectItem value="tm">Time & Materials</SelectItem>
                  <SelectItem value="fixed_fee">Fixed Fee</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                </SelectContent>
              </Select>

              <Input 
                type="date" 
                placeholder="Start Date" 
                className="h-8"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
              />

              <Input 
                type="date" 
                placeholder="End Date" 
                className="h-8"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2">
              <Badge 
                variant={filters.showAtRisk ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, showAtRisk: !prev.showAtRisk }))}
              >
                At Risk
              </Badge>
              <Badge 
                variant={filters.showOverBudget ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, showOverBudget: !prev.showOverBudget }))}
              >
                Over Budget
              </Badge>
              <Badge 
                variant={filters.showNoPM ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, showNoPM: !prev.showNoPM }))}
              >
                No PM
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first project to track tasks and time
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        // List/Table View
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      { key: 'name', label: 'Name' },
                      { key: 'customer', label: 'Client' }, 
                      { key: 'projectManager', label: 'PM' },
                      { key: 'status', label: 'Status' },
                      { key: 'endDate', label: 'Due' },
                      { key: 'budgetAmount', label: 'Budget' },
                      { key: 'burnRate', label: 'Burn %' },
                      { key: 'margin', label: 'Margin' },
                      { key: 'invoiced', label: 'Invoiced' }
                    ].map((column) => (
                      <th 
                        key={column.key} 
                        className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSortConfig(prev => ({
                            key: column.key,
                            direction: prev.key === column.key && prev.direction === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          <SortAsc className={`h-3 w-3 ${sortConfig.key === column.key ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project: ProjectWithDetails) => {
                    const customer = customers.find((c: any) => c.id === project.customerId);
                    const manager = users.find((u: any) => u.id === project.projectManagerId);
                    const dueDate = project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No due date';
                    const budget = project.budgetAmount ? `R${parseFloat(project.budgetAmount).toLocaleString()}` : 'No budget';
                    const burnRate = project.budgetAmount ? 
                      `${Math.round(((project.actualCost || 0) / parseFloat(project.budgetAmount)) * 100)}%` : '0%';
                    const margin = project.budgetAmount ? 
                      `R${(parseFloat(project.budgetAmount) - (project.actualCost || 0)).toLocaleString()}` : 'N/A';
                    
                    return (
                      <tr key={project.id} className="border-b hover:bg-gray-50 cursor-pointer">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status).split(' ')[0]}`}></div>
                            <div>
                              <Link href={`/projects/${project.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                                {project.name}
                              </Link>
                              <div className="text-sm text-gray-500">{project.billingType === 'tm' ? 'Time & Materials' : project.billingType === 'fixed_fee' ? 'Fixed Fee' : project.billingType === 'retainer' ? 'Retainer' : project.billingType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                              {customer?.name?.charAt(0) || 'I'}
                            </div>
                            <span className="text-gray-900">{customer?.name || 'Internal'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {manager ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                                {manager.name?.charAt(0)}
                              </div>
                              <span className="text-gray-900">{manager.name}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-200">No PM</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(project.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(project.status)}
                              <span className="capitalize">{project.status.replace('_', ' ')}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-900">{dueDate}</td>
                        <td className="p-4 text-gray-900 font-medium">{budget}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  parseInt(burnRate) > 100 ? 'bg-red-500' : 
                                  parseInt(burnRate) > 80 ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(parseInt(burnRate), 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{burnRate}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-900 font-medium">{margin}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-gray-600">
                            R0
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Enhanced Grid/Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: ProjectWithDetails) => {
            const progress = project.totalTasks > 0 
              ? Math.round((project.completedTasks / project.totalTasks) * 100) 
              : 0;

            const customer = customers.find((c: any) => c.id === project.customerId);
            const manager = users.find((u: any) => u.id === project.projectManagerId);
            const dueDate = project.endDate ? new Date(project.endDate) : null;
            const isOverdue = dueDate && dueDate < new Date() && !['completed', 'finished', 'cancelled'].includes(project.status);
            const daysDiff = dueDate ? Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
            const budget = parseFloat(project.budgetAmount) || 0;
            const spent = parseFloat(project.actualCost) || 0;
            const burnPercentage = budget > 0 ? (spent / budget) * 100 : 0;
            const estimatedHours = parseFloat(project.estimatedHours) || 0;
            const actualHours = parseFloat(project.actualHours) || 0;

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        {/* Client Logo/Avatar */}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-700">
                            {customer?.name?.charAt(0) || 'I'}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-900">{project.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            {customer ? customer.name : "Internal Project"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={`${getStatusColor(project.status)} text-xs`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(project.status)}
                            <span>{project.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                        <Badge variant="outline" className={`${getPriorityColor(project.priority)} text-xs`}>
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Billing Type Badge */}
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs bg-gray-50">
                        {project.billingType === 'tm' ? 'Time & Materials' : project.billingType === 'fixed_fee' ? 'Fixed Fee' : project.billingType === 'retainer' ? 'Retainer' : 'Time & Materials'}
                      </Badge>
                      {daysDiff !== null && daysDiff > 0 && daysDiff <= 7 && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                          Due in {daysDiff}d
                        </Badge>
                      )}
                    </div>

                    {/* Budget vs Burn Ring */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <svg className="w-12 h-12 transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="#e5e7eb"
                              strokeWidth="4"
                              fill="none"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke={burnPercentage > 100 ? '#ef4444' : burnPercentage > 80 ? '#f59e0b' : '#10b981'}
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${Math.min(burnPercentage, 100) * 1.256} ${125.6}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {Math.round(burnPercentage)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">R{budget.toLocaleString()}</div>
                          <div className="text-gray-500">Budget</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{actualHours || estimatedHours}h</div>
                        <div className="text-xs text-gray-500">{actualHours ? 'Used' : 'Est.'}</div>
                      </div>
                    </div>

                    {/* Invoice Status */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                        ✓ Invoiced: R0
                      </Badge>
                      <div className="text-xs text-gray-500">
                        Progress: {progress}%
                      </div>
                    </div>

                    {/* Project Manager */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {manager ? (
                          <>
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-700">{manager.name?.charAt(0)}</span>
                            </div>
                            <span className="text-sm text-gray-700">{manager.name}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <Users className="h-3 w-3 text-red-600" />
                            </div>
                            <span className="text-sm text-red-600">No PM</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{dueDate ? dueDate.toLocaleDateString() : "No due date"}</span>
                      </div>
                    </div>
                    
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs w-full justify-center">
                        Overdue Project
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}