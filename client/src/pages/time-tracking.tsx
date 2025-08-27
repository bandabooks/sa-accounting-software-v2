import { useState } from "react";
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
import { Plus, Play, Pause, Clock, Calendar, DollarSign, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertTimeEntrySchema, insertProjectSchema, insertTaskSchema, type TimeEntryWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertTimeEntrySchema.omit({ companyId: true, userId: true });
const projectFormSchema = insertProjectSchema.omit({ companyId: true, createdBy: true });
const taskFormSchema = insertTaskSchema.omit({ companyId: true, createdBy: true });

export default function TimeTrackingPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Project form
  const projectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planning",
      priority: "medium",
      isInternal: false,
      hourlyRate: "0",
    },
  });

  // Task form
  const taskForm = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      isInternal: false,
      isBillable: true,
      progress: 0,
    },
  });

  // Update current time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  });

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ["/api/time-entries"],
  });

  const { data: activeTimeEntry } = useQuery({
    queryKey: ["/api/time-entries/active"],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("/api/time-entries", "POST", {
        ...data,
        startTime: new Date(),
        isRunning: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/active"] });
      setIsDialogOpen(false);
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
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/active"] });
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

  const deleteMutation = useMutation({
    mutationFn: async (timeEntryId: number) => {
      return await apiRequest(`/api/time-entries/${timeEntryId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Success",
        description: "Time entry deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete time entry",
        variant: "destructive",
      });
    },
  });

  // Project creation mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      const response = await apiRequest("/api/projects", "POST", data);
      return response.json();
    },
    onSuccess: (newProject: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateProjectOpen(false);
      // Set the new project in the main form
      form.setValue("projectId", newProject.id);
      projectForm.reset();
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

  // Task creation mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      const response = await apiRequest("/api/tasks", "POST", data);
      return response.json();
    },
    onSuccess: (newTask: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsCreateTaskOpen(false);
      // Set the new task in the main form
      form.setValue("taskId", newTask.id);
      taskForm.reset();
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      isBillable: true,
      hourlyRate: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (activeTimeEntry) {
      toast({
        title: "Active Time Entry",
        description: "Please stop the current time entry before starting a new one",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(values);
  };

  const handleStopTime = () => {
    if (activeTimeEntry && activeTimeEntry.id) {
      stopTimeMutation.mutate(activeTimeEntry.id);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getActiveTimeDisplay = () => {
    if (!activeTimeEntry) return null;
    
    const startTime = new Date(activeTimeEntry.startTime);
    const currentTime = new Date();
    const elapsedSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    
    return formatDuration(elapsedSeconds);
  };

  const totalTimeToday = timeEntries
    .filter((entry: TimeEntryWithDetails) => {
      const entryDate = new Date(entry.startTime);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString() && !entry.isRunning;
    })
    .reduce((total: number, entry: TimeEntryWithDetails) => total + (entry.duration || 0), 0);

  const totalBillableToday = timeEntries
    .filter((entry: TimeEntryWithDetails) => {
      const entryDate = new Date(entry.startTime);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString() && entry.isBillable && !entry.isRunning;
    })
    .reduce((total: number, entry: TimeEntryWithDetails) => total + (entry.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground">
            Track your time and manage work hours
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">{currentTime}</p>
          <p className="text-sm text-muted-foreground">System Clock</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTimeEntry ? getActiveTimeDisplay() : "00:00:00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeTimeEntry ? "Currently tracking" : "No active tracking"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTimeToday)}</div>
            <p className="text-xs text-muted-foreground">
              Total tracked today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totalBillableToday.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Billable amount today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Time Entry */}
      {activeTimeEntry && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <h3 className="font-medium text-lg">Currently Tracking</h3>
                  <p className="text-muted-foreground">
                    {activeTimeEntry.description || "No description"}
                  </p>
                  {activeTimeEntry.task && (
                    <p className="text-sm text-muted-foreground">
                      Task: {activeTimeEntry.task.title}
                    </p>
                  )}
                  {activeTimeEntry.project && (
                    <p className="text-sm text-muted-foreground">
                      Project: {activeTimeEntry.project.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="text-3xl font-mono font-bold text-green-600">
                  {getActiveTimeDisplay()}
                </div>
                <Button
                  variant="outline"
                  onClick={handleStopTime}
                  disabled={stopTimeMutation.isPending}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Timer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start New Timer */}
      {!activeTimeEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Start New Timer</CardTitle>
            <CardDescription>
              Begin tracking time for a task or project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Start Timer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Start Time Tracking</DialogTitle>
                    <DialogDescription>
                      Start tracking time for a task or project
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="What are you working on?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="projectId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project (Optional)</FormLabel>
                              <Select onValueChange={(value) => {
                                if (value === "create-new") {
                                  setIsCreateProjectOpen(true);
                                } else {
                                  field.onChange(value === "none" ? undefined : parseInt(value));
                                }
                              }} value={field.value?.toString() || "none"}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">No Project</SelectItem>
                                  <SelectItem value="create-new">
                                    <div className="flex items-center">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Create New Project
                                    </div>
                                  </SelectItem>
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
                          name="taskId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task (Optional)</FormLabel>
                              <Select onValueChange={(value) => {
                                if (value === "create-new") {
                                  setIsCreateTaskOpen(true);
                                } else {
                                  field.onChange(value === "none" ? undefined : parseInt(value));
                                }
                              }} value={field.value?.toString() || "none"}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select task" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">No Task</SelectItem>
                                  <SelectItem value="create-new">
                                    <div className="flex items-center">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Create New Task
                                    </div>
                                  </SelectItem>
                                  {tasks.map((task: any) => (
                                    <SelectItem key={task.id} value={task.id.toString()}>
                                      {task.title}
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
                          name="isBillable"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billable</FormLabel>
                              <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value ? "true" : "false"}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="true">Billable</SelectItem>
                                  <SelectItem value="false">Non-billable</SelectItem>
                                </SelectContent>
                              </Select>
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

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                          <Play className="h-4 w-4 mr-2" />
                          {createMutation.isPending ? "Starting..." : "Start Timer"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {/* Project Creation Dialog */}
              <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Add a new project for time tracking
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...projectForm}>
                    <form onSubmit={projectForm.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={projectForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter project name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={projectForm.control}
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
                      <FormField
                        control={projectForm.control}
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
                                <SelectItem value="none">Internal Project</SelectItem>
                                {(customers as any[]).map((customer: any) => (
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
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateProjectOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createProjectMutation.isPending}>
                          {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {/* Task Creation Dialog */}
              <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task for time tracking
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...taskForm}>
                    <form onSubmit={taskForm.handleSubmit((data) => createTaskMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={taskForm.control}
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
                        control={taskForm.control}
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
                      <FormField
                        control={taskForm.control}
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
                                <SelectItem value="none">No Project</SelectItem>
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
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={taskForm.control}
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
                        <FormField
                          control={taskForm.control}
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
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createTaskMutation.isPending}>
                          {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>
            Your recent time tracking history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No time entries yet</h3>
              <p className="text-muted-foreground">
                Start your first timer to begin tracking time
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeEntries.slice(0, 10).map((entry: TimeEntryWithDetails) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{entry.description || "No description"}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span>{new Date(entry.startTime).toLocaleDateString()}</span>
                      <span>
                        {new Date(entry.startTime).toLocaleTimeString()} - 
                        {entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : "Running"}
                      </span>
                      {entry.project && <span>Project: {entry.project.name}</span>}
                      {entry.task && <span>Task: {entry.task.title}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">
                        {entry.duration ? formatTime(entry.duration) : "Running"}
                      </div>
                      {entry.isBillable && entry.amount && (
                        <div className="text-sm text-muted-foreground">
                          R{entry.amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.isBillable && (
                        <Badge variant="secondary">Billable</Badge>
                      )}
                      {!entry.isRunning && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(entry.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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