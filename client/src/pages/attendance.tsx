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
  MapPin,
  CheckCircle,
  XCircle,
  Timer,
  User,
  BarChart,
} from "lucide-react";

interface AttendanceRecord {
  id: number;
  employeeName: string;
  employeeNumber: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  status: "present" | "absent" | "late" | "early_departure";
  location?: string;
  notes?: string;
  date: string;
}

interface AttendanceStats {
  totalStaff: number;
  present: number;
  absent: number;
  lateArrivals: number;
  totalHours: number;
  averageHours: number;
}

const statusColors = {
  present: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  absent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  early_departure: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showClockInDialog, setShowClockInDialog] = useState(false);
  const [showClockOutDialog, setShowClockOutDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attendance records
  const { data: attendanceRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/attendance", selectedDate],
    queryFn: () => fetch(`/api/attendance?date=${selectedDate}`).then((res) => res.json()),
  });

  // Fetch attendance stats
  const { data: attendanceStats } = useQuery({
    queryKey: ["/api/attendance/stats", selectedDate],
    queryFn: () => fetch(`/api/attendance/stats?date=${selectedDate}`).then((res) => res.json()),
  });

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then((res) => res.json()),
  });

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: (data: any) => 
      fetch("/api/attendance/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/stats"] });
      toast({
        title: "Success",
        description: "Employee clocked in successfully.",
      });
      setShowClockInDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clock in employee.",
        variant: "destructive",
      });
    },
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/attendance/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/stats"] });
      toast({
        title: "Success",
        description: "Employee clocked out successfully.",
      });
      setShowClockOutDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clock out employee.",
        variant: "destructive",
      });
    },
  });

  const handleClockIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      employeeId: formData.get("employeeId"),
      location: formData.get("location"),
      notes: formData.get("notes"),
      clockInTime: new Date().toISOString(),
    };

    clockInMutation.mutate(data);
  };

  const handleClockOut = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      recordId: selectedEmployee,
      notes: formData.get("notes"),
      clockOutTime: new Date().toISOString(),
    };

    clockOutMutation.mutate(data);
  };

  const stats: AttendanceStats = attendanceStats || {
    totalStaff: 0,
    present: 0,
    absent: 0,
    lateArrivals: 0,
    totalHours: 0,
    averageHours: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Monitor staff attendance and working hours
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Dialog open={showClockInDialog} onOpenChange={setShowClockInDialog}>
            <DialogTrigger asChild>
              <Button>
                <ClockIcon className="h-4 w-4 mr-2" />
                Clock In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clock In Employee</DialogTitle>
                <DialogDescription>
                  Record employee clock in time and location.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleClockIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee</Label>
                  <Select name="employeeId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {(employees as any[])?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name} ({employee.employeeNumber || employee.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    name="location" 
                    placeholder="Office location or work site"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea 
                    name="notes" 
                    placeholder="Any additional notes"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowClockInDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={clockInMutation.isPending}>
                    {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Timer className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lateArrivals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageHours.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Daily attendance for {format(new Date(selectedDate), "MMMM dd, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="text-center py-8">Loading attendance records...</div>
          ) : !attendanceRecords || attendanceRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for this date.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(attendanceRecords as AttendanceRecord[]).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.employeeNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.clockIn ? format(new Date(record.clockIn), "HH:mm") : "-"}
                    </TableCell>
                    <TableCell>
                      {record.clockOut ? format(new Date(record.clockOut), "HH:mm") : "-"}
                    </TableCell>
                    <TableCell>
                      {record.totalHours ? `${record.totalHours.toFixed(1)}h` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[record.status]}>
                        {record.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          {record.location}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {!record.clockOut && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmployee(record.id);
                            setShowClockOutDialog(true);
                          }}
                        >
                          Clock Out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Clock Out Dialog */}
      <Dialog open={showClockOutDialog} onOpenChange={setShowClockOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clock Out Employee</DialogTitle>
            <DialogDescription>
              Record employee clock out time.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClockOut} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                name="notes" 
                placeholder="Any additional notes about the shift"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowClockOutDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={clockOutMutation.isPending}>
                {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}