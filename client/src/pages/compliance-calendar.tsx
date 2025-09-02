import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Users,
  TrendingUp
} from "lucide-react";

// Event interface for type safety
interface ComplianceEvent {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'scheduled' | 'pending' | 'overdue';
  type: 'VAT' | 'PAYE' | 'CIPC' | 'Labour' | 'Task' | 'EMP201' | 'ITR12';
  client?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  description?: string;
  dueTime?: string;
}

// Event type configurations for better organization
const EVENT_TYPE_CONFIG = {
  VAT: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FileText },
  PAYE: { color: 'bg-green-100 text-green-800 border-green-200', icon: Users },
  EMP201: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: FileText },
  ITR12: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: FileText },
  CIPC: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: FileText },
  Labour: { color: 'bg-red-100 text-red-800 border-red-200', icon: Users },
  Task: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock }
};

export default function ComplianceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Fetch real data from API
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: complianceData = [] } = useQuery({
    queryKey: ["/api/compliance-tracker"],
    retry: false // Don't retry if endpoint doesn't exist yet
  });

  // Convert tasks and compliance data to calendar events
  const events = useMemo(() => {
    const taskEvents: ComplianceEvent[] = tasks
      .filter((task: any) => task.dueDate)
      .map((task: any) => ({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate.split('T')[0],
        status: task.status === 'completed' ? 'completed' : 
                task.status === 'in_progress' ? 'scheduled' :
                new Date(task.dueDate) < new Date() ? 'overdue' : 'pending',
        type: 'Task' as const,
        client: task.customer?.name,
        priority: task.priority || 'medium',
        assignedTo: task.assignedUser?.name,
        description: task.description,
        dueTime: task.dueDate ? new Date(task.dueDate).toLocaleTimeString('en-ZA', {
          hour: '2-digit',
          minute: '2-digit'
        }) : undefined
      }));

    // Add compliance events (when API is available)
    const complianceEvents: ComplianceEvent[] = [];

    return [...taskEvents, ...complianceEvents];
  }, [tasks, complianceData]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Filtered events based on search and filter criteria
  const filteredEvents = useMemo(() => {
    return events.filter((event: ComplianceEvent) => {
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesPriority = selectedPriority === 'all' || event.priority === selectedPriority;
      
      return matchesSearch && matchesType && matchesPriority;
    });
  }, [events, searchQuery, filterType, selectedPriority]);

  const getEventsForDate = (day: number): ComplianceEvent[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter((event: ComplianceEvent) => event.date === dateStr);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const thisMonth = filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    });
    
    const overdue = filteredEvents.filter(event => 
      event.status === 'overdue' || (new Date(event.date) < now && event.status !== 'completed')
    );
    
    const thisWeek = filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
    
    const completed = filteredEvents.filter(event => event.status === 'completed');
    
    return {
      thisMonth: thisMonth.length,
      overdue: overdue.length,
      thisWeek: thisWeek.length,
      completed: completed.length,
      total: filteredEvents.length,
      completionRate: filteredEvents.length > 0 ? Math.round((completed.length / filteredEvents.length) * 100) : 0
    };
  }, [filteredEvents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-50 text-green-700 border-green-200";
      case "scheduled": return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "overdue": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle2;
      case "overdue": return AlertTriangle;
      case "scheduled": return Clock;
      default: return Clock;
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();
    const isToday = (day: number) => {
      return today.getDate() === day && 
             today.getMonth() === currentDate.getMonth() && 
             today.getFullYear() === currentDate.getFullYear();
    };

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 h-28 border border-gray-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const eventsForDay = getEventsForDate(day);
      const todayClass = isToday(day) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50';
      
      days.push(
        <div key={day} className={`p-2 h-28 border border-gray-100 ${todayClass} transition-colors`}>
          <div className={`font-medium text-sm mb-1 ${isToday(day) ? 'text-blue-700' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-0.5 overflow-hidden">
            {eventsForDay.slice(0, 3).map(event => {
              const StatusIcon = getStatusIcon(event.status);
              const typeConfig = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG];
              
              return (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded-sm border ${typeConfig.color} truncate flex items-center gap-1 cursor-pointer hover:shadow-sm transition-shadow`}
                  title={`${event.title}${event.client ? ` - ${event.client}` : ''}${event.dueTime ? ` at ${event.dueTime}` : ''}`}
                >
                  <StatusIcon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{event.title}</span>
                </div>
              );
            })}
            {eventsForDay.length > 3 && (
              <div className="text-xs text-gray-500 pl-1">
                +{eventsForDay.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Calendar</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage deadlines, tasks, and compliance activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: 'month' | 'week' | 'list') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">This Month</p>
                <p className="text-lg font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Overdue</p>
                <p className="text-lg font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">This Week</p>
                <p className="text-lg font-bold text-amber-600">{stats.thisWeek}</p>
              </div>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-lg font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Completion</p>
                <p className="text-lg font-bold text-purple-600">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="VAT">VAT</SelectItem>
            <SelectItem value="PAYE">PAYE</SelectItem>
            <SelectItem value="EMP201">EMP201</SelectItem>
            <SelectItem value="ITR12">ITR12</SelectItem>
            <SelectItem value="CIPC">CIPC</SelectItem>
            <SelectItem value="Labour">Labour</SelectItem>
            <SelectItem value="Task">Tasks</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {filteredEvents.length} events
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={previousMonth} className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-0 border-t">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-2 text-center text-xs font-semibold text-gray-600 bg-gray-50 border-b border-r border-gray-100">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0">
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription className="text-xs">Next 30 days</CardDescription>
            </CardHeader>
            <CardContent className="p-4 max-h-96 overflow-y-auto">
              {filteredEvents.filter(event => {
                const eventDate = new Date(event.date);
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                return eventDate <= thirtyDaysFromNow && eventDate >= new Date();
              }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).length > 0 ? (
                <div className="space-y-3">
                  {filteredEvents
                    .filter(event => {
                      const eventDate = new Date(event.date);
                      const thirtyDaysFromNow = new Date();
                      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                      return eventDate <= thirtyDaysFromNow && eventDate >= new Date();
                    })
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 10)
                    .map((event: ComplianceEvent) => {
                      const StatusIcon = getStatusIcon(event.status);
                      const typeConfig = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG];
                      
                      return (
                        <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-2 flex-1">
                              <StatusIcon className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900 mb-1">{event.title}</h4>
                                {event.client && <p className="text-xs text-gray-600 mb-1">{event.client}</p>}
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs border ${typeConfig.color}`} variant="outline">
                                    {event.type}
                                  </Badge>
                                  {event.priority && event.priority !== 'medium' && (
                                    <Badge className={`text-xs ${getPriorityColor(event.priority)}`} variant="secondary">
                                      {event.priority}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge className={`text-xs border ${getStatusColor(event.status)} ml-2`} variant="outline">
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {new Date(event.date).toLocaleDateString('en-ZA', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                              {event.dueTime && ` at ${event.dueTime}`}
                            </p>
                            {event.assignedTo && (
                              <p className="text-xs text-gray-500">{event.assignedTo}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No Upcoming Events</h3>
                  <p className="text-xs text-gray-600 mb-4">
                    No events scheduled for the next 30 days.
                  </p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Type Legend */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Event Types</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm border ${config.color}`}></div>
                      <IconComponent className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-700">{type}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}