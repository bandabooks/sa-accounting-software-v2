import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Play, Square, Calendar as CalendarIcon, ArrowLeft, Filter, TrendingUp, Activity, Target, BarChart3, X, Users, Briefcase, Building } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, LineChart, Line } from "recharts";
import { format } from "date-fns";

type TimeFilter = "today" | "this_week" | "this_month" | "last_month" | "custom";

interface AdvancedFilters {
  customer: string;
  taskType: string;
  project: string;
  status: string;
  billable: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export default function TimeEntriesPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("this_month");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    customer: "all",
    taskType: "all",
    project: "all",
    status: "all",
    billable: "all",
    dateFrom: null,
    dateTo: null
  });
  
  // Extract taskId from query params if present
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const taskIdParam = urlParams.get('taskId');

  const { data: timeEntries = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const taskTypes = Array.from(new Set(tasks.map(task => task.category).filter(Boolean)));
    const projects = Array.from(new Set(tasks.map(task => task.project).filter(Boolean)));
    const customerNames = customers.map(customer => customer.name);
    
    return {
      taskTypes,
      projects,
      customers: customerNames
    };
  }, [tasks, customers]);

  // Enhanced filtering logic
  const getFilteredTimeEntries = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // Handle date filtering
    if (timeFilter === "custom" && advancedFilters.dateFrom && advancedFilters.dateTo) {
      startDate = advancedFilters.dateFrom;
      endDate = advancedFilters.dateTo;
    } else {
      switch (timeFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "this_week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case "this_month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last_month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    return timeEntries.filter(entry => {
      // Date filtering
      const entryDate = new Date(entry.startTime);
      const dateMatch = entryDate >= startDate && entryDate <= endDate;

      // Search filtering
      const searchMatch = !searchQuery || 
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.task?.title && entry.task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entry.task?.customer?.name && entry.task.customer.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Task ID parameter filtering
      const taskMatch = !taskIdParam || entry.taskId?.toString() === taskIdParam;

      // Advanced filters
      const customerMatch = !advancedFilters.customer || advancedFilters.customer === "all" || 
        entry.task?.customer?.name === advancedFilters.customer;
      
      const taskTypeMatch = !advancedFilters.taskType || advancedFilters.taskType === "all" || 
        entry.task?.category === advancedFilters.taskType;
      
      const projectMatch = !advancedFilters.project || advancedFilters.project === "all" || 
        entry.task?.project === advancedFilters.project;
      
      const statusMatch = !advancedFilters.status || advancedFilters.status === "all" || 
        (advancedFilters.status === "running" && entry.isRunning) ||
        (advancedFilters.status === "completed" && !entry.isRunning);
      
      const billableMatch = !advancedFilters.billable || advancedFilters.billable === "all" || 
        (advancedFilters.billable === "billable" && entry.isBillable) ||
        (advancedFilters.billable === "non-billable" && !entry.isBillable);
      
      return dateMatch && searchMatch && taskMatch && customerMatch && 
             taskTypeMatch && projectMatch && statusMatch && billableMatch;
    });
  }, [timeEntries, timeFilter, searchQuery, taskIdParam, advancedFilters]);

  // Generate daily chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const data: any[] = [];
    
    let daysToShow = 31;
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (timeFilter === "custom" && advancedFilters.dateFrom && advancedFilters.dateTo) {
      startDate = advancedFilters.dateFrom;
      const diffTime = Math.abs(advancedFilters.dateTo.getTime() - advancedFilters.dateFrom.getTime());
      daysToShow = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else if (timeFilter === "today") {
      daysToShow = 1;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeFilter === "this_week") {
      daysToShow = 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
    } else if (timeFilter === "last_month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      daysToShow = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate();
      startDate = lastMonth;
    }

    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayEntries = getFilteredTimeEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate.toDateString() === currentDate.toDateString();
      });

      const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
      const billableHours = dayEntries.filter(e => e.isBillable).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
      
      data.push({
        day: currentDate.getDate(),
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: currentDate.toISOString().split('T')[0],
        totalHours: Number(totalHours.toFixed(2)),
        billableHours: Number(billableHours.toFixed(2)),
        entries: dayEntries.length,
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
      });
    }

    return data;
  }, [getFilteredTimeEntries, timeFilter, advancedFilters.dateFrom, advancedFilters.dateTo]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (seconds: number) => {
    const hours = (seconds / 3600).toFixed(1);
    return `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTotalDuration = () => {
    return getFilteredTimeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  const getBillableDuration = () => {
    return getFilteredTimeEntries.filter(e => e.isBillable).reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  const getAverageDailyHours = () => {
    const totalHours = getTotalDuration() / 3600;
    const activeDays = chartData.filter(d => d.totalHours > 0).length;
    return activeDays > 0 ? (totalHours / activeDays).toFixed(1) : "0.0";
  };

  const clearFilters = () => {
    setAdvancedFilters({
      customer: "all",
      taskType: "all",
      project: "all",
      status: "all",
      billable: "all",
      dateFrom: null,
      dateTo: null
    });
    setTimeFilter("this_month");
    setSearchQuery("");
  };

  const hasActiveFilters = () => {
    return searchQuery || 
           (advancedFilters.customer && advancedFilters.customer !== "all") || 
           (advancedFilters.taskType && advancedFilters.taskType !== "all") || 
           (advancedFilters.project && advancedFilters.project !== "all") || 
           (advancedFilters.status && advancedFilters.status !== "all") || 
           (advancedFilters.billable && advancedFilters.billable !== "all") ||
           timeFilter === "custom";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          <p className="text-blue-600">{`Total: ${payload[0].value}h`}</p>
          <p className="text-green-600">{`Billable: ${payload[1].value}h`}</p>
          <p className="text-gray-500">{`Entries: ${payload[0].payload.entries}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4">
            <Link href="/tasks">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Time Analytics</h1>
              <p className="text-gray-600">
                {taskIdParam ? `Detailed timesheet analysis for specific task` : "Professional time tracking and productivity insights"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Select value={timeFilter} onValueChange={(value) => {
            setTimeFilter(value as TimeFilter);
            if (value !== "custom") {
              setAdvancedFilters(prev => ({ ...prev, dateFrom: null, dateTo: null }));
            }
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Time</p>
                <p className="text-3xl font-bold text-blue-900">{formatHours(getTotalDuration())}</p>
                <p className="text-xs text-blue-600 mt-1">{getFilteredTimeEntries.length} entries</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Billable Time</p>
                <p className="text-3xl font-bold text-green-900">{formatHours(getBillableDuration())}</p>
                <p className="text-xs text-green-600 mt-1">
                  {((getBillableDuration() / getTotalDuration() || 0) * 100).toFixed(0)}% billable
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Daily Average</p>
                <p className="text-3xl font-bold text-purple-900">{getAverageDailyHours()}h</p>
                <p className="text-xs text-purple-600 mt-1">per active day</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Activity className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Active Days</p>
                <p className="text-3xl font-bold text-orange-900">
                  {chartData.filter(d => d.totalHours > 0).length}
                </p>
                <p className="text-xs text-orange-600 mt-1">of {chartData.length} days</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Target className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Activity Chart */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Daily Activity Overview
              </CardTitle>
              <CardDescription className="text-gray-600">
                Track your work patterns and productivity spikes throughout the {timeFilter === "custom" ? "selected period" : timeFilter.replace('_', ' ')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="billableGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280" 
                  fontSize={12} 
                  tick={{ fontSize: 11 }}
                  interval={chartData.length > 15 ? 2 : 0}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12} 
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalHours"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#totalGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="billableHours"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#billableGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Total Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Billable Hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search time entries by description, task, or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                    {hasActiveFilters() && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                        {[
                          searchQuery, 
                          advancedFilters.customer !== "all" ? advancedFilters.customer : null,
                          advancedFilters.taskType !== "all" ? advancedFilters.taskType : null,
                          advancedFilters.project !== "all" ? advancedFilters.project : null,
                          advancedFilters.status !== "all" ? advancedFilters.status : null,
                          advancedFilters.billable !== "all" ? advancedFilters.billable : null,
                          timeFilter === "custom" ? "custom" : null
                        ].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Advanced Filters
                    </DialogTitle>
                    <DialogDescription>
                      Filter your time entries by client, task type, project, and more for precise analysis
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Client/Customer Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Client/Customer
                      </label>
                      <Select 
                        value={advancedFilters.customer} 
                        onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, customer: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All clients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All clients</SelectItem>
                          {filterOptions.customers.map((customer, index) => (
                            <SelectItem key={index} value={customer || `customer-${index}`}>{customer || 'Unknown Customer'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Task Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Task Type
                      </label>
                      <Select 
                        value={advancedFilters.taskType} 
                        onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, taskType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All task types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All task types</SelectItem>
                          {filterOptions.taskTypes.map((type, index) => (
                            <SelectItem key={index} value={type || `type-${index}`}>{type || 'Unknown Type'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Project Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Project
                      </label>
                      <Select 
                        value={advancedFilters.project} 
                        onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, project: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All projects</SelectItem>
                          {filterOptions.projects.map((project, index) => (
                            <SelectItem key={index} value={project || `project-${index}`}>{project || 'Unknown Project'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status and Billable Filters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select 
                          value={advancedFilters.status} 
                          onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Billable</label>
                        <Select 
                          value={advancedFilters.billable} 
                          onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, billable: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All entries" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All entries</SelectItem>
                            <SelectItem value="billable">Billable only</SelectItem>
                            <SelectItem value="non-billable">Non-billable only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Custom Date Range */}
                    {timeFilter === "custom" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Custom Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {advancedFilters.dateFrom ? format(advancedFilters.dateFrom, "PPP") : "From date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={advancedFilters.dateFrom || undefined}
                                onSelect={(date) => setAdvancedFilters(prev => ({ ...prev, dateFrom: date || null }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {advancedFilters.dateTo ? format(advancedFilters.dateTo, "PPP") : "To date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={advancedFilters.dateTo || undefined}
                                onSelect={(date) => setAdvancedFilters(prev => ({ ...prev, dateTo: date || null }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                    <Button onClick={() => setShowAdvancedFilters(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {hasActiveFilters() && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Time Entries Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-900">Time Entries Detail</CardTitle>
          <CardDescription className="text-gray-600">
            Comprehensive view of all time tracking sessions with detailed client and project metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {getFilteredTimeEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Clock className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">No time entries found</h3>
              <p className="text-gray-600 text-center mb-4">
                {hasActiveFilters() ? "Try adjusting your filters to see more results" : 
                 taskIdParam ? "No time has been tracked for this task yet" : 
                 "Start tracking time on tasks to see detailed analytics here"}
              </p>
              {!hasActiveFilters() && (
                <Link href="/tasks">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Tracking Time
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Client</TableHead>
                    <TableHead className="font-semibold text-gray-700">Task</TableHead>
                    <TableHead className="font-semibold text-gray-700">Description</TableHead>
                    <TableHead className="font-semibold text-gray-700">Start Time</TableHead>
                    <TableHead className="font-semibold text-gray-700">End Time</TableHead>
                    <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Billable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredTimeEntries.map((entry: any) => (
                    <TableRow key={entry.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium">
                        {formatDate(entry.startTime)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {entry.task?.customer?.name || 'No Client'}
                            </div>
                            {entry.task?.project && (
                              <div className="text-xs text-gray-500">
                                {entry.task.project}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {entry.task?.title || 'Unknown Task'}
                        </div>
                        {entry.task?.category && (
                          <div className="text-sm text-gray-500">
                            {entry.task.category}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-gray-700">
                          {entry.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatTime(entry.startTime)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {entry.endTime ? formatTime(entry.endTime) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono font-semibold text-blue-600">
                          {entry.duration ? formatDuration(entry.duration) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={entry.isRunning ? "default" : "secondary"}
                          className={entry.isRunning ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-700"}
                        >
                          {entry.isRunning ? "Running" : "Completed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={entry.isBillable ? "default" : "outline"}
                          className={entry.isBillable ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "border-gray-300 text-gray-600"}
                        >
                          {entry.isBillable ? "Billable" : "Non-billable"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}