import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Clock,
  ClockIcon,
  CalendarDays,
  Plus,
  Edit,
  MapPin,
  User,
  Timer,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  role: string;
  clockInTime: string;
  clockOutTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  totalHours?: number;
  overtimeHours?: number;
  status: string;
  notes?: string;
  location?: { lat: number; lng: number; address?: string };
  createdAt: string;
}

interface AttendanceSettings {
  defaultShiftStart: string;
  defaultShiftEnd: string;
  lateThreshold: number; // minutes
  overtimeThreshold: number; // hours
  autoClockOut: boolean;
  locationTracking: boolean;
}

export default function AttendancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings>({
    defaultShiftStart: "09:00",
    defaultShiftEnd: "17:00",
    lateThreshold: 15,
    overtimeThreshold: 8,
    autoClockOut: false,
    locationTracking: true,
  });

  const { data: attendance = [], isLoading, error } = useQuery({
    queryKey: ["/api/attendance", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/attendance?date=${selectedDate}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
    retry: false,
    refetchOnWindowFocus: false
  });

  const clockInMutation = useMutation({
    mutationFn: async (data: {
      employeeId: number;
      notes?: string;
    }) => {
      return await apiRequest("/api/attendance/clock-in", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          location: await getCurrentLocation(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setIsClockModalOpen(false);
      toast({
        title: "Success",
        description: "Employee clocked in successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clock in employee",
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (attendanceId: number) => {
      return await apiRequest(`/api/attendance/${attendanceId}/clock-out`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Employee clocked out successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clock out employee",
        variant: "destructive",
      });
    },
  });

  const manualEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/attendance/manual", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setIsManualEntryOpen(false);
      toast({
        title: "Success",
        description: "Manual attendance entry created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create manual attendance entry",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number; address?: string } | null> => {
    return new Promise((resolve) => {
      if (navigator.geolocation && attendanceSettings.locationTracking) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Simple address formatting for location display
            const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            
            resolve({ lat, lng, address });
          },
          () => resolve(null)
        );
      } else {
        resolve(null);
      }
    });
  };

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const totalStaff = employees.length;
    const present = attendance.filter(record => record.clockInTime && !record.clockOutTime).length;
    const absent = totalStaff - attendance.length;
    const lateArrivals = attendance.filter(record => {
      if (!record.clockInTime) return false;
      const clockInTime = new Date(`${selectedDate}T${record.clockInTime}`);
      const shiftStart = new Date(`${selectedDate}T${attendanceSettings.defaultShiftStart}`);
      return clockInTime > new Date(shiftStart.getTime() + attendanceSettings.lateThreshold * 60000);
    }).length;
    
    const totalHours = attendance.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const averageHours = totalStaff > 0 ? totalHours / totalStaff : 0;
    
    return { totalStaff, present, absent, lateArrivals, totalHours, averageHours };
  };

  const stats = getAttendanceStats();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return <Badge variant="default">Present</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "late":
        return <Badge variant="secondary">Late</Badge>;
      case "early_departure":
        return <Badge variant="outline">Early Departure</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "-";
    return format(new Date(timeString), "HH:mm");
  };

  const formatHours = (hours?: number) => {
    if (!hours) return "0.00";
    return hours.toFixed(2);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Employee Attendance
          </h1>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Attendance Module Setup Required
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                The attendance system is being initialized. Please wait a moment and refresh the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Employee Attendance</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Attendance & Time Tracking</h1>
          <p className="text-gray-600">
            Monitor staff clock-in/out times, attendance records, and working hours
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Attendance Settings</DialogTitle>
                <DialogDescription>
                  Configure attendance tracking and time management settings
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shift-start">Default Shift Start</Label>
                    <Input
                      id="shift-start"
                      type="time"
                      value={attendanceSettings.defaultShiftStart}
                      onChange={(e) => setAttendanceSettings(prev => ({
                        ...prev,
                        defaultShiftStart: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shift-end">Default Shift End</Label>
                    <Input
                      id="shift-end"
                      type="time"
                      value={attendanceSettings.defaultShiftEnd}
                      onChange={(e) => setAttendanceSettings(prev => ({
                        ...prev,
                        defaultShiftEnd: e.target.value
                      }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="late-threshold">Late Threshold (minutes)</Label>
                    <Input
                      id="late-threshold"
                      type="number"
                      value={attendanceSettings.lateThreshold}
                      onChange={(e) => setAttendanceSettings(prev => ({
                        ...prev,
                        lateThreshold: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtime-threshold">Overtime Threshold (hours)</Label>
                    <Input
                      id="overtime-threshold"
                      type="number"
                      value={attendanceSettings.overtimeThreshold}
                      onChange={(e) => setAttendanceSettings(prev => ({
                        ...prev,
                        overtimeThreshold: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-clock-out">Auto Clock-Out</Label>
                  <Switch
                    id="auto-clock-out"
                    checked={attendanceSettings.autoClockOut}
                    onCheckedChange={(checked) => setAttendanceSettings(prev => ({
                      ...prev,
                      autoClockOut: checked
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="location-tracking">Location Tracking</Label>
                  <Switch
                    id="location-tracking"
                    checked={attendanceSettings.locationTracking}
                    onCheckedChange={(checked) => setAttendanceSettings(prev => ({
                      ...prev,
                      locationTracking: checked
                    }))}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Track GPS location for clock-in/out {attendanceSettings.locationTracking ? 'enabled' : 'disabled'}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsSettingsOpen(false);
                  toast({
                    title: "Settings Saved",
                    description: "Attendance settings have been updated successfully"
                  });
                }}>
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manual Attendance Entry</DialogTitle>
                <DialogDescription>
                  Create a manual attendance record for an employee.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee: any) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => {
                    if (selectedEmployee) {
                      manualEntryMutation.mutate({
                        employeeId: parseInt(selectedEmployee),
                        date: selectedDate,
                        clockIn: "09:00",
                        clockOut: "17:00",
                        status: "present"
                      });
                    }
                  }}
                  disabled={!selectedEmployee || manualEntryMutation.isPending}
                >
                  Create Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isClockModalOpen} onOpenChange={setIsClockModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Clock In/Out
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clock In Employee</DialogTitle>
                <DialogDescription>
                  Select an employee to clock in for today.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee: any) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => {
                    if (selectedEmployee) {
                      clockInMutation.mutate({
                        employeeId: parseInt(selectedEmployee),
                      });
                    }
                  }}
                  disabled={!selectedEmployee || clockInMutation.isPending}
                >
                  Clock In
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Attendance Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Total Staff Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-12 w-12 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Present Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Absent Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-12 w-12 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Late Arrivals Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-12 w-12 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lateArrivals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Hours Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-12 w-12 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Hours Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-12 w-12 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters & Controls</h3>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">Export CSV</Button>
              <Button variant="outline" size="sm">Export PDF</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="date-filter">Date:</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="branch-filter">Branch:</Label>
              <Select defaultValue="all-branches">
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-branches">All Branches</SelectItem>
                  <SelectItem value="main-office">Main Office</SelectItem>
                  <SelectItem value="branch-1">Branch 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="staff-filter">Staff Member:</Label>
              <Select defaultValue="all-staff">
                <SelectTrigger>
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-staff">All Staff</SelectItem>
                  {employees.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Employee attendance for {format(new Date(selectedDate), "PPPP")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No attendance records found for the selected date and filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record: AttendanceRecord) => (
                  <TableRow key={record.id}>
                    <TableCell className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {record.employeeName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{record.role || 'Employee'}</Badge>
                    </TableCell>
                    <TableCell>{formatTime(record.clockInTime)}</TableCell>
                    <TableCell>{formatTime(record.clockOutTime)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {formatHours(record.totalHours)}h
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.location ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {record.location.address || `${record.location.lat.toFixed(4)}, ${record.location.lng.toFixed(4)}`}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!record.clockOutTime && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => clockOutMutation.mutate(record.id)}
                          disabled={clockOutMutation.isPending}
                        >
                          Clock Out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}