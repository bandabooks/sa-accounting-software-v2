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
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
} from "lucide-react";

interface LeaveRequest {
  id: number;
  employeeName: string;
  employeeNumber: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
  approvedBy?: string;
  approvalDate?: string;
  comments?: string;
}

interface LeaveBalance {
  id: number;
  employeeName: string;
  employeeNumber: string;
  annualLeave: number;
  sickLeave: number;
  maternityLeave: number;
  paternityLeave: number;
  studyLeave: number;
  familyResponsibility: number;
}

const leaveTypes = [
  "Annual Leave",
  "Sick Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Study Leave",
  "Family Responsibility",
  "Compassionate Leave",
  "Unpaid Leave",
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

export default function LeaveManagement() {
  const [selectedTab, setSelectedTab] = useState<"requests" | "balances">("requests");
  const [showNewLeaveDialog, setShowNewLeaveDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leave requests
  const { data: leaveRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/leave-requests"],
    queryFn: () => fetch("/api/leave-requests").then((res) => res.json()),
  });

  // Fetch leave balances
  const { data: leaveBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ["/api/leave-balances"],
    queryFn: () => fetch("/api/leave-balances").then((res) => res.json()),
  });

  // Fetch employees for dropdown
  const { data: employees } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then((res) => res.json()),
  });

  // Create leave request mutation
  const createLeaveRequest = useMutation({
    mutationFn: (data: any) => apiRequest("/api/leave-requests", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: "Success",
        description: "Leave request submitted successfully.",
      });
      setShowNewLeaveDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit leave request.",
        variant: "destructive",
      });
    },
  });

  // Update leave request status mutation
  const updateLeaveStatus = useMutation({
    mutationFn: ({ id, status, comments }: { id: number; status: string; comments?: string }) =>
      apiRequest(`/api/leave-requests/${id}/status`, "PUT", { status, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: "Success",
        description: "Leave request status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update leave request status.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitLeaveRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      employeeId: formData.get("employeeId"),
      leaveType: formData.get("leaveType"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      reason: formData.get("reason"),
    };

    createLeaveRequest.mutate(data);
  };

  const filteredRequests = leaveRequests?.filter((request: LeaveRequest) => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage employee leave requests and balances
          </p>
        </div>
        <Dialog open={showNewLeaveDialog} onOpenChange={setShowNewLeaveDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Leave Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
              <DialogDescription>
                Fill in the details for the leave request.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitLeaveRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Select name="employeeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((employee: any) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} ({employee.employeeNumber || employee.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select name="leaveType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input type="date" name="startDate" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input type="date" name="endDate" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea 
                  name="reason" 
                  placeholder="Please provide a reason for leave request"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewLeaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLeaveRequest.isPending}>
                  {createLeaveRequest.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        <button
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            selectedTab === "requests"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setSelectedTab("requests")}
        >
          <Calendar className="h-4 w-4 mr-2 inline" />
          Leave Requests
        </button>
        <button
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            selectedTab === "balances"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setSelectedTab("balances")}
        >
          <User className="h-4 w-4 mr-2 inline" />
          Leave Balances
        </button>
      </div>

      {selectedTab === "requests" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>
                  View and manage all leave requests
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="text-center py-8">Loading leave requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leave requests found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request: LeaveRequest) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.employeeNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{request.leaveType}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(request.startDate), "MMM dd")} -{" "}
                          {format(new Date(request.endDate), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>{request.days} days</TableCell>
                      <TableCell>
                        <Badge className={statusColors[request.status]}>
                          {statusIcons[request.status]}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.appliedDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() =>
                                updateLeaveStatus.mutate({
                                  id: request.id,
                                  status: "approved",
                                })
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() =>
                                updateLeaveStatus.mutate({
                                  id: request.id,
                                  status: "rejected",
                                })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === "balances" && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Balances</CardTitle>
            <CardDescription>
              Current leave balances for all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <div className="text-center py-8">Loading leave balances...</div>
            ) : !leaveBalances || leaveBalances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leave balance data available.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Annual</TableHead>
                    <TableHead>Sick</TableHead>
                    <TableHead>Maternity</TableHead>
                    <TableHead>Paternity</TableHead>
                    <TableHead>Study</TableHead>
                    <TableHead>Family</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveBalances.map((balance: LeaveBalance) => (
                    <TableRow key={balance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{balance.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {balance.employeeNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{balance.annualLeave} days</TableCell>
                      <TableCell>{balance.sickLeave} days</TableCell>
                      <TableCell>{balance.maternityLeave} days</TableCell>
                      <TableCell>{balance.paternityLeave} days</TableCell>
                      <TableCell>{balance.studyLeave} days</TableCell>
                      <TableCell>{balance.familyResponsibility} days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}