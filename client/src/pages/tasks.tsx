import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Calendar, User, Clock, CheckCircle2, Circle, Play, Pause, Paperclip, Square, Search, Filter, Target, AlertTriangle, MoreHorizontal } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { insertTaskSchema, type TaskWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Create a proper form schema with correct types
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "completed", "blocked"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  taskType: z.string().optional(), // Add compliance task type
  complianceType: z.string().optional(), // Add compliance category
  projectId: z.number().optional(),
  customerId: z.number().optional(),
  parentTaskId: z.number().optional(),
  assignedToId: z.number().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  completedDate: z.string().optional(),
  estimatedHours: z.string().optional(),
  actualHours: z.string().optional(),
  isInternal: z.boolean().default(false),
  isBillable: z.boolean().default(true),
  hourlyRate: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().default(false),
  recurringType: z.string().optional(),
  recurringInterval: z.number().optional(),
  recurringDaysOfWeek: z.array(z.number()).optional(),
  recurringDayOfMonth: z.number().optional(),
  recurringEndDate: z.string().optional(),
  recurringCount: z.number().optional(),
  parentRecurringTaskId: z.number().optional(),
  notes: z.string().optional() // Add notes field
});

export default function TasksPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [complianceFilter, setComplianceFilter] = useState<string>("all");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Task Templates
  const taskTemplates = [
    { id: "annual_returns", name: "Annual Company Returns", type: "compliance", compliance: "cipc", priority: "high", estimatedHours: "4" },
    { id: "vat_return", name: "Monthly VAT Return", type: "compliance", compliance: "sars", priority: "high", estimatedHours: "2" },
    { id: "paye_return", name: "Monthly PAYE Return", type: "compliance", compliance: "sars", priority: "high", estimatedHours: "1" },
    { id: "income_tax", name: "Annual Income Tax Return", type: "compliance", compliance: "sars", priority: "high", estimatedHours: "6" },
    { id: "provisional_tax", name: "Provisional Tax Return", type: "compliance", compliance: "sars", priority: "medium", estimatedHours: "2" },
    { id: "client_review", name: "Client File Review", type: "review", priority: "medium", estimatedHours: "1" },
    { id: "bank_reconciliation", name: "Monthly Bank Reconciliation", type: "project", priority: "medium", estimatedHours: "2" },
    { id: "uif_return", name: "UIF Return", type: "compliance", compliance: "labour", priority: "medium", estimatedHours: "1" },
    { id: "skills_development", name: "Skills Development Levy Return", type: "compliance", compliance: "labour", priority: "low", estimatedHours: "1" },
    { id: "document_request", name: "Client Document Request", type: "document_request", priority: "medium", estimatedHours: "0.5" }
  ];
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: activeTimeEntry } = useQuery<any>({
    queryKey: ["/api/time-entries/active"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("/api/tasks", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDialogOpen(false);
      form.reset();
      setAttachedFiles([]);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const startTimeMutation = useMutation({
    mutationFn: async ({ taskId, description }: { taskId: number; description?: string }) => {
      return await apiRequest("/api/time-entries", "POST", {
        taskId,
        description: description || "Time tracking",
        startTime: new Date().toISOString(),
        isRunning: true,
        isBillable: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/active"] });
      toast({
        title: "Success",
        description: "Time tracking started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start time tracking",
        variant: "destructive",
      });
    },
  });

  const stopTimeMutation = useMutation({
    mutationFn: async (timeEntryId: number) => {
      return await apiRequest(`/api/time-entries/${timeEntryId}/stop`, "PUT");
    },
    onSuccess: () => {
      // Immediately clear the active time entry to stop timers
      queryClient.setQueryData(["/api/time-entries/active"], null);
      // Then invalidate to refresh from server
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Time tracking stopped",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to stop time tracking",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      return await apiRequest(`/api/tasks/${taskId}`, "PUT", { 
        status,
        completedDate: status === 'completed' ? new Date() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: any }) => {
      return await apiRequest(`/api/tasks/${taskId}`, "PUT", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      isInternal: false,
      isBillable: true,
      progress: 0,
      isRecurring: false,
      estimatedHours: "",
      actualHours: "",
      hourlyRate: "",
      tags: [],
      taskType: "project", // Default to project task
      complianceType: "",
      notes: ""
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values);
  };

  const handleStartTime = (taskId: number) => {
    if (activeTimeEntry) {
      toast({
        title: "Active Time Entry",
        description: "Please stop the current time entry before starting a new one",
        variant: "destructive",
      });
      return;
    }
    startTimeMutation.mutate({ taskId });
  };

  const handleStopTime = (timeEntryId: number) => {
    stopTimeMutation.mutate(timeEntryId);
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  const handleDateChange = (taskId: number, field: string, value: string) => {
    updateTaskMutation.mutate({ 
      taskId, 
      updates: { [field]: value || null }
    });
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Running Timer Component
  const RunningTimer = ({ startTime }: { startTime: string }) => {
    const [elapsed, setElapsed] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Only start timer if there's an active time entry
      if (!activeTimeEntry) {
        setElapsed(0);
        return;
      }

      // Start the timer
      intervalRef.current = setInterval(() => {
        // Double check activeTimeEntry is still active
        if (!activeTimeEntry) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setElapsed(0);
          return;
        }

        const start = new Date(startTime).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - start) / 1000));
      }, 1000);

      // Cleanup function
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [startTime, activeTimeEntry]); // Re-run when activeTimeEntry changes

    const formatElapsed = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // Don't render timer if no active time entry
    if (!activeTimeEntry) {
      return null;
    }

    return <span>{formatElapsed(elapsed)}</span>;
  };


  const toggleTaskStatus = (task: TaskWithDetails) => {
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    updateStatusMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "review": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "blocked": return "bg-red-100 text-red-800";
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

  const filteredTasks = tasks.filter((task: TaskWithDetails) => {
    const statusMatch = (() => {
      if (filter === "all") return true;
      if (filter === "my") return task.assignedToId === 1; // Current user ID should come from auth
      if (filter === "active") return task.status === "in_progress";
      if (filter === "completed") return task.status === "completed";
      return true;
    })();
    
    const typeMatch = typeFilter === "all" || (task as any).taskType === typeFilter;
    const complianceMatch = complianceFilter === "all" || (task as any).complianceType === complianceFilter;
    
    // Search filter
    const searchMatch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.customer && task.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.assignedTo && task.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && typeMatch && complianceMatch && searchMatch;
  });

  // Calculate status counts
  const statusCounts = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = taskTemplates.find(t => t.id === templateId);
    if (template) {
      form.setValue('title', template.name);
      form.setValue('taskType', template.type);
      form.setValue('complianceType', template.compliance || '');
      form.setValue('priority', template.priority as any);
      form.setValue('estimatedHours', template.estimatedHours);
      setSelectedTemplate(templateId);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Track and manage all compliance tasks and deadlines
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to track work and time
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Task Templates */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Task Template (Optional)</Label>
                  <Select onValueChange={handleTemplateSelect} value={selectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from common practice tasks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Custom Task</SelectItem>
                      {taskTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter task description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Task Type and Compliance Category */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="taskType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "project"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select task type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="project">Project Task</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="follow_up">Follow Up</SelectItem>
                            <SelectItem value="document_request">Document Request</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="complianceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Category (Optional)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select compliance type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            <SelectItem value="sars">SARS</SelectItem>
                            <SelectItem value="cipc">CIPC</SelectItem>
                            <SelectItem value="labour">Labour</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project (Optional)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Project (Standalone Task)</SelectItem>
                            {projects.map((project: any) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
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
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer (Optional)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Customer (Internal Task)</SelectItem>
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
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
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
                
                <div className="grid grid-cols-2 gap-4">
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
                            value={field.value || ""} 
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ""} 
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assignedToId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
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
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurring Task</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value ? "true" : "false"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="false">One-time Task</SelectItem>
                            <SelectItem value="true">Recurring Task</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {form.watch("isRecurring") && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                    <FormField
                      control={form.control}
                      name="recurringType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat Every</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select interval" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Week</SelectItem>
                              <SelectItem value="biweekly">2 Weeks</SelectItem>
                              <SelectItem value="monthly">Month</SelectItem>
                              <SelectItem value="bimonthly">2 Months</SelectItem>
                              <SelectItem value="quarterly">3 Months</SelectItem>
                              <SelectItem value="semiannual">6 Months</SelectItem>
                              <SelectItem value="yearly">Year</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="recurringEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value || ""} 
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* File Upload Section - Compact */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Paperclip className="h-4 w-4" />
                    Attachments (Optional)
                  </Label>
                  <FileUpload
                    onFilesChange={setAttachedFiles}
                    maxFiles={5}
                    maxSizeMB={10}
                    acceptedTypes={[
                      "application/pdf",
                      "image/jpeg",
                      "image/png",
                      "image/gif",
                      "text/csv",
                      "application/vnd.ms-excel",
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      "application/msword",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      "text/plain"
                    ]}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details below.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <EditTaskFormContent 
              task={editingTask} 
              users={users}
              projects={projects}
              customers={customers}
              taskTemplates={taskTemplates}
              onClose={() => {
                setIsEditDialogOpen(false);
                setEditingTask(null);
              }}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
                setIsEditDialogOpen(false);
                setEditingTask(null);
                toast({
                  title: "Success",
                  description: "Task updated successfully",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{statusCounts.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{statusCounts.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{statusCounts.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Time Tracker */}
      {activeTimeEntry && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-medium">Time tracking active</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTimeEntry?.description || "Current task"}
                  </p>
                  {activeTimeEntry?.startTime && (
                    <div className="flex items-center text-sm font-medium text-green-700 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <RunningTimer startTime={activeTimeEntry.startTime} />
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStopTime(activeTimeEntry?.id)}
                disabled={stopTimeMutation.isPending}
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks by title or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Task Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="my">My Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first task to start tracking work and time
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task: TaskWithDetails) => (
                  <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTaskStatus(task)}
                        disabled={updateStatusMutation.isPending}
                        className="p-0 h-8 w-8"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{task.title}</div>
                      {task.customer && (
                        <div className="text-sm text-muted-foreground">Client: {task.customer.name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={task.status || 'todo'} 
                        onValueChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge className={getStatusColor(task.status || 'todo')}>
                              {(task.status || 'todo').replace('_', ' ')}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                              To Do
                            </div>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              In Progress
                            </div>
                          </SelectItem>
                          <SelectItem value="review">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              Review
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Complete
                            </div>
                          </SelectItem>
                          <SelectItem value="blocked">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              Blocked
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={formatDateForInput(task.startDate)}
                        onChange={(e) => handleDateChange(task.id, 'startDate', e.target.value)}
                        className="w-36 h-8 text-sm border-none hover:border-input focus:border-input bg-transparent hover:bg-muted/50"
                        placeholder="Select date"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={formatDateForInput(task.dueDate)}
                        onChange={(e) => handleDateChange(task.id, 'dueDate', e.target.value)}
                        className={`w-36 h-8 text-sm border-none hover:border-input focus:border-input bg-transparent hover:bg-muted/50 ${
                          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' 
                            ? 'text-red-600 font-medium' 
                            : ''
                        }`}
                        placeholder="Select date"
                      />
                    </TableCell>
                    <TableCell>
                      {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(task as any).taskType && (task as any).taskType !== 'project' && (
                          <Badge variant="secondary" className="text-xs">
                            {(task as any).taskType.replace('_', ' ')}
                          </Badge>
                        )}
                        {(task as any).complianceType && (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                            {(task as any).complianceType.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(task.priority || 'medium')}>
                        {task.priority || 'medium'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {task.status !== 'completed' && (
                          <>
                            {activeTimeEntry && (activeTimeEntry as any).taskId === task.id ? (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded text-sm font-medium">
                                  <Clock className="h-4 w-4 mr-1 animate-pulse" />
                                  <RunningTimer startTime={(activeTimeEntry as any).startTime} />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStopTime((activeTimeEntry as any).id)}
                                  disabled={stopTimeMutation.isPending}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Square className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartTime(task.id)}
                                disabled={!!activeTimeEntry || startTimeMutation.isPending}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setEditingTask(task);
                              setIsEditDialogOpen(true);
                            }}>
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/time-entries?taskId=${task.id}`} className="cursor-pointer">
                                View Timesheet
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this task?')) {
                                  // TODO: Add delete functionality
                                  toast({
                                    title: "Delete Task",
                                    description: "Task deletion will be implemented soon",
                                  });
                                }
                              }}
                            >
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

