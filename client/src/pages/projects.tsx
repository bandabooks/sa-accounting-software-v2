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
import { Plus, Calendar, Users, BarChart3, Clock, DollarSign, Target, TrendingUp, CheckCircle2, AlertTriangle, PauseCircle, XCircle, PlayCircle, Eye, Building2 } from "lucide-react";
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
      billingType: "fixed_rate",
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

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'in_progress').length,
    completed: projects.filter((p: any) => ['completed', 'finished'].includes(p.status)).length,
    overdue: projects.filter((p: any) => p.endDate && new Date(p.endDate) < new Date() && !['completed', 'finished', 'cancelled'].includes(p.status)).length,
    totalBudget: projects.reduce((sum: number, p: any) => sum + (parseFloat(p.budgetAmount) || 0), 0),
    totalEstimatedHours: projects.reduce((sum: number, p: any) => sum + (parseFloat(p.estimatedHours) || 0), 0),
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
                                <SelectItem value="fixed_rate">Fixed Rate</SelectItem>
                                <SelectItem value="project_hours">Project Hours</SelectItem>
                                <SelectItem value="task_hours">Task Hours</SelectItem>
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
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter project description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="projectManagerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Manager</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Project Manager</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        {/* Total Projects */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
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

        {/* Active Projects */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Active Projects</p>
                <p className="text-xl font-bold text-green-900">{projectStats.active}</p>
                <p className="text-[10px] text-green-600 mt-0.5">In progress</p>
              </div>
              <div className="p-2 bg-green-200 rounded-full">
                <PlayCircle className="h-4 w-4 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Projects */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700">Completed</p>
                <p className="text-xl font-bold text-emerald-900">{projectStats.completed}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Finished projects</p>
              </div>
              <div className="p-2 bg-emerald-200 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Projects */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700">Overdue</p>
                <p className="text-xl font-bold text-red-900">{projectStats.overdue}</p>
                <p className="text-[10px] text-red-600 mt-0.5">Past deadline</p>
              </div>
              <div className="p-2 bg-red-200 rounded-full">
                <AlertTriangle className="h-4 w-4 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Budget */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700">Total Budget</p>
                <p className="text-xl font-bold text-purple-900">R{projectStats.totalBudget.toLocaleString()}</p>
                <p className="text-[10px] text-purple-600 mt-0.5">Project budgets</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-full">
                <DollarSign className="h-4 w-4 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Hours */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-700">Estimated Hours</p>
                <p className="text-xl font-bold text-orange-900">{projectStats.totalEstimatedHours}</p>
                <p className="text-[10px] text-orange-600 mt-0.5">Total estimated</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-full">
                <Clock className="h-4 w-4 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {projects.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: ProjectWithDetails) => {
            const progress = project.totalTasks > 0 
              ? Math.round((project.completedTasks / project.totalTasks) * 100) 
              : 0;

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col space-y-1 items-end">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.customer && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {project.customer.name}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{project.completedTasks} of {project.totalTasks} tasks</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                      </div>
                      {project.hourlyRate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-1" />
                          R{project.hourlyRate}/hr
                        </div>
                      )}
                    </div>
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