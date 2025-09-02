import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, Clock, AlertTriangle, Plus, Search, Filter, Edit, Trash2, Play, Pause, Square } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ComplianceTask, InsertComplianceTask } from "@shared/schema";

// Form validation schema
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  taskType: z.string().min(1, "Task type is required"),
  status: z.enum(["todo", "in_progress", "review", "completed", "blocked"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  complianceType: z.string().optional(),
  assignedTo: z.number().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  completedAt: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringType: z.string().optional(),
  recurringInterval: z.number().optional(),
  recurringEndDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function ComplianceTasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ComplianceTask | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks and active time entry
  const { data: tasks = [], isLoading } = useQuery<ComplianceTask[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: activeTimeEntry } = useQuery<any>({
    queryKey: ["/api/time-entries/active"],
  });

  // Create form
  const createForm = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      taskType: "compliance",
      status: "todo" as const,
      priority: "medium" as const,
      complianceType: "",
      notes: "",
      startDate: "",
      dueDate: "",
      isRecurring: false,
      recurringType: "",
      recurringInterval: 1,
      recurringEndDate: "",
    },
  });

  // Edit form
  const editForm = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      taskType: "compliance",
      status: "todo" as const,
      priority: "medium" as const,
      complianceType: "",
      notes: "",
      startDate: "",
      dueDate: "",
      isRecurring: false,
      recurringType: "",
      recurringInterval: 1,
      recurringEndDate: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) => apiRequest("/api/tasks", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaskFormData> }) => 
      apiRequest(`/api/tasks/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsEditDialogOpen(false);
      setEditingTask(null);
      editForm.reset();
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

  // Time tracking mutations
  const startTimeMutation = useMutation({
    mutationFn: async ({ taskId, description }: { taskId: number; description?: string }) => {
      return await apiRequest("/api/time-entries", "POST", {
        taskId,
        description: description || "Working on task",
        startTime: new Date().toISOString(),
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
      return await apiRequest(`/api/time-entries/${timeEntryId}`, "PUT", {
        endTime: new Date().toISOString(),
      });
    },
    onSuccess: (data, timeEntryId) => {
      // Immediately clear the active time entry to stop the timer completely
      queryClient.setQueryData(["/api/time-entries/active"], null);
      
      // Force a re-render to stop all timer components
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

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      return await apiRequest(`/api/tasks/${taskId}`, "PUT", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "review": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "blocked": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "medium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Time tracking helper functions
  const handleStartTime = (taskId: number) => {
    if (activeTimeEntry && activeTimeEntry.taskId !== taskId) {
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

  // Running Timer Component
  const RunningTimer = ({ startTime, timeEntryId }: { startTime: string; timeEntryId: number }) => {
    const [elapsed, setElapsed] = useState(0);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
      // Check if this time entry is still active
      if (!activeTimeEntry || activeTimeEntry.id !== timeEntryId) {
        setIsActive(false);
        return;
      }

      setIsActive(true);
      
      const interval = setInterval(() => {
        // Double-check the time entry is still active
        if (!activeTimeEntry || activeTimeEntry.id !== timeEntryId) {
          setIsActive(false);
          clearInterval(interval);
          return;
        }
        
        const start = new Date(startTime).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - start) / 1000));
      }, 1000);

      return () => {
        clearInterval(interval);
        setIsActive(false);
      };
    }, [startTime, timeEntryId, activeTimeEntry]);

    const formatElapsed = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // Don't render if this time entry is no longer active
    if (!isActive || !activeTimeEntry || activeTimeEntry.id !== timeEntryId) {
      return null;
    }

    return <span>{formatElapsed(elapsed)}</span>;
  };

  const toggleTaskStatus = (task: ComplianceTask) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    updateStatusMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };


  const getTypeColor = (type: string) => {
    switch (type) {
      case "sars": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "cipc": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "labour": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleCreateTask = (data: TaskFormData) => {
    // Transform empty strings to undefined for optional fields to avoid database errors
    const transformedData = {
      ...data,
      startDate: data.startDate && data.startDate.trim() !== "" ? data.startDate : undefined,
      dueDate: data.dueDate && data.dueDate.trim() !== "" ? data.dueDate : undefined,
      recurringEndDate: data.recurringEndDate && data.recurringEndDate.trim() !== "" ? data.recurringEndDate : undefined,
      // Transform empty strings to undefined for optional fields
      description: data.description && data.description.trim() !== "" ? data.description : undefined,
      notes: data.notes && data.notes.trim() !== "" ? data.notes : undefined,
      complianceType: data.complianceType && data.complianceType.trim() !== "" ? data.complianceType : undefined,
      recurringType: data.recurringType && data.recurringType.trim() !== "" ? data.recurringType : undefined,
    };
    createMutation.mutate(transformedData);
  };

  const handleEditTask = (data: TaskFormData) => {
    if (editingTask) {
      // Transform empty strings to undefined for optional fields to avoid database errors
      const transformedData = {
        ...data,
        startDate: data.startDate && data.startDate.trim() !== "" ? data.startDate : undefined,
        dueDate: data.dueDate && data.dueDate.trim() !== "" ? data.dueDate : undefined,
        recurringEndDate: data.recurringEndDate && data.recurringEndDate.trim() !== "" ? data.recurringEndDate : undefined,
        // Transform empty strings to undefined for optional fields
        description: data.description && data.description.trim() !== "" ? data.description : undefined,
        notes: data.notes && data.notes.trim() !== "" ? data.notes : undefined,
        complianceType: data.complianceType && data.complianceType.trim() !== "" ? data.complianceType : undefined,
        recurringType: data.recurringType && data.recurringType.trim() !== "" ? data.recurringType : undefined,
      };
      updateMutation.mutate({ id: editingTask.id, data: transformedData });
    }
  };

  const handleEditClick = (task: ComplianceTask) => {
    setEditingTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || "",
      taskType: task.taskType,
      status: (task.status as any) || "todo",
      priority: (task.priority as any) || "medium",
      complianceType: task.complianceType || "",
      startDate: (task as any).startDate ? new Date((task as any).startDate).toISOString().split('T')[0] : "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      notes: task.notes || "",
      isRecurring: (task as any).isRecurring || false,
      recurringType: (task as any).recurringType || "",
      recurringEndDate: (task as any).recurringEndDate ? new Date((task as any).recurringEndDate).toISOString().split('T')[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const filteredTasks = tasks.filter((task: ComplianceTask) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || selectedType === "all" || task.complianceType === selectedType;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || task.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(task => task.status === "in_progress").length;
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== "completed";
  }).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Task Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage all compliance tasks and deadlines
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new compliance task to track and manage.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateTask)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Task description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={createForm.control}
                    name="taskType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Type</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                    control={createForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
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
                    control={createForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
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
                    control={createForm.control}
                    name="complianceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Type</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sars">SARS</SelectItem>
                            <SelectItem value="cipc">CIPC</SelectItem>
                            <SelectItem value="labour">Labour</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Type</FormLabel>
                        <Select value={field.value ? "recurring" : "one-time"} onValueChange={(value) => field.onChange(value === "recurring")}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="one-time">One-time Task</SelectItem>
                            <SelectItem value="recurring">Recurring Task</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {createForm.watch("isRecurring") && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                    <FormField
                      control={createForm.control}
                      name="recurringType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat Every</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="recurringEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                <FormField
                  control={createForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Tasks</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">In Progress</p>
                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">{inProgressTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Overdue</p>
                <p className="text-xl font-bold text-red-900 dark:text-red-100">{overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search tasks by title or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Compliance Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sars">SARS</SelectItem>
                <SelectItem value="cipc">CIPC</SelectItem>
                <SelectItem value="labour">Labour</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task: ComplianceTask) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{task.title}</h3>
                      <div className="flex space-x-2">
                        {task.complianceType && (
                          <Badge className={getTypeColor(task.complianceType)}>
                            {task.complianceType.toUpperCase()}
                          </Badge>
                        )}
                        <Badge className={getPriorityColor((task.priority as any) || "medium")}>
                          {(task.priority as any) || "medium"}
                        </Badge>
                        <Badge className={getStatusColor((task.status as any) || "todo")}>
                          {(task.status as any) || "todo"}
                        </Badge>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                      {task.dueDate && (
                        <>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>Task Type: {task.taskType}</span>
                      {task.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Assigned to: User {task.assignedTo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    {/* Active timer display */}
                    {activeTimeEntry && activeTimeEntry.taskId === task.id && (
                      <div className="flex items-center bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1 text-sm">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-blue-700 dark:text-blue-300 font-medium">
                          <RunningTimer 
                            startTime={activeTimeEntry.startTime} 
                            timeEntryId={activeTimeEntry.id}
                          />
                        </span>
                      </div>
                    )}
                    
                    {/* Time tracking buttons */}
                    {activeTimeEntry && activeTimeEntry.taskId === task.id ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStopTime(activeTimeEntry.id)}
                        disabled={stopTimeMutation.isPending}
                        className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Stop Timer
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStartTime(task.id)}
                        disabled={startTimeMutation.isPending}
                        className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Timer
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(task)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => toggleTaskStatus(task)}
                      disabled={updateStatusMutation.isPending}
                      className="text-sm"
                    >
                      {(task.status as any) === "completed" ? "Mark Todo" : "Mark Complete"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Tasks Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't created any compliance tasks yet, or no tasks match your current filters.
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditTask)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Task description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="taskType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Type</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
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
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
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
                  control={editForm.control}
                  name="complianceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Type</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sars">SARS</SelectItem>
                          <SelectItem value="cipc">CIPC</SelectItem>
                          <SelectItem value="labour">Labour</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}