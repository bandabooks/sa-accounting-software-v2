import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Play, Square, Calendar, ArrowLeft, Filter } from "lucide-react";
import { Link } from "wouter";

export default function TimeEntriesPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Extract taskId from query params if present
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const taskIdParam = urlParams.get('taskId');

  const { data: timeEntries = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
  });

  // Filter time entries based on search and taskId parameter
  const filteredEntries = timeEntries.filter(entry => {
    const searchMatch = !searchQuery || 
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.task?.title && entry.task.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const taskMatch = !taskIdParam || entry.taskId?.toString() === taskIdParam;
    
    return searchMatch && taskMatch;
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTotalDuration = () => {
    return filteredEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <div className="flex items-center gap-4">
            <Link href="/tasks">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Time Tracking</h1>
              <p className="text-muted-foreground">
                {taskIdParam ? `Timesheet for specific task` : "View all time entries and track productivity"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{filteredEntries.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{formatDuration(getTotalDuration())}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{filteredEntries.filter(e => e.isRunning).length}</p>
              </div>
              <Square className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {formatDuration(
                    filteredEntries
                      .filter(e => {
                        const entryDate = new Date(e.startTime);
                        const weekStart = new Date();
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                        return entryDate >= weekStart;
                      })
                      .reduce((total, entry) => total + (entry.duration || 0), 0)
                  )}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search time entries by description or task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>
            Detailed view of all time tracking sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No time entries found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {taskIdParam ? "No time has been tracked for this task yet" : "Start tracking time on tasks to see entries here"}
              </p>
              <Link href="/tasks">
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Start Tracking Time
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry: any) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell>
                      {formatDate(entry.startTime)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {entry.task?.title || 'Unknown Task'}
                      </div>
                      {entry.task?.customer && (
                        <div className="text-sm text-muted-foreground">
                          {entry.task.customer.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.description}
                    </TableCell>
                    <TableCell>
                      {formatTime(entry.startTime)}
                    </TableCell>
                    <TableCell>
                      {entry.endTime ? formatTime(entry.endTime) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono">
                        {entry.duration ? formatDuration(entry.duration) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.isRunning ? "default" : "secondary"}>
                        {entry.isRunning ? "Running" : "Completed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.isBillable ? "default" : "outline"}>
                        {entry.isBillable ? "Billable" : "Non-billable"}
                      </Badge>
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