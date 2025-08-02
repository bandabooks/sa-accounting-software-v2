import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, User, DollarSign, AlertCircle, Play, Square, Plus, Search, Calendar } from "lucide-react";

export default function POSShiftManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isStartShiftOpen, setIsStartShiftOpen] = useState(false);
  const [isEndShiftOpen, setIsEndShiftOpen] = useState(false);

  const currentShift = {
    id: "SHIFT-001",
    employee: "John Smith",
    terminal: "Terminal 1",
    startTime: "08:00 AM",
    startCash: 500.00,
    currentCash: 1250.00,
    status: "active"
  };

  const shifts = [
    {
      id: "SHIFT-001",
      employee: "John Smith",
      terminal: "Terminal 1",
      date: "2024-01-15",
      startTime: "08:00 AM",
      endTime: "16:00 PM",
      startCash: 500.00,
      endCash: 1250.00,
      totalSales: 3450.00,
      transactions: 47,
      status: "active"
    },
    {
      id: "SHIFT-002",
      employee: "Sarah Johnson",
      terminal: "Terminal 2",
      date: "2024-01-14",
      startTime: "08:00 AM",
      endTime: "16:00 PM",
      startCash: 500.00,
      endCash: 1150.00,
      totalSales: 2890.00,
      transactions: 38,
      status: "completed"
    },
    {
      id: "SHIFT-003",
      employee: "Mike Chen",
      terminal: "Terminal 1",
      date: "2024-01-14",
      startTime: "16:00 PM",
      endTime: "00:00 AM",
      startCash: 1150.00,
      endCash: 800.00,
      totalSales: 1970.00,
      transactions: 25,
      status: "completed"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><Play className="h-3 w-3 mr-1" />Active</Badge>;
      case "completed":
        return <Badge variant="secondary"><Square className="h-3 w-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shift Management</h1>
          <p className="text-muted-foreground">
            Manage POS shifts and cash drawer activities
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isStartShiftOpen} onOpenChange={setIsStartShiftOpen}>
            <DialogTrigger asChild>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Start Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Shift</DialogTitle>
                <DialogDescription>
                  Begin a new POS shift with opening cash count
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Input id="employee" defaultValue="John Smith" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terminal">Terminal</Label>
                  <Input id="terminal" defaultValue="Terminal 1" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-cash">Starting Cash Amount</Label>
                  <Input id="start-cash" type="number" step="0.01" placeholder="500.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea id="notes" placeholder="Any additional notes..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsStartShiftOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsStartShiftOpen(false)}>
                    Start Shift
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isEndShiftOpen} onOpenChange={setIsEndShiftOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Square className="h-4 w-4 mr-2" />
                End Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>End Current Shift</DialogTitle>
                <DialogDescription>
                  Complete the current shift with closing cash count
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Shift Details</Label>
                  <div className="bg-muted p-3 rounded-lg">
                    <p><strong>Employee:</strong> {currentShift.employee}</p>
                    <p><strong>Terminal:</strong> {currentShift.terminal}</p>
                    <p><strong>Start Time:</strong> {currentShift.startTime}</p>
                    <p><strong>Starting Cash:</strong> R{currentShift.startCash.toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-cash">Ending Cash Count</Label>
                  <Input id="end-cash" type="number" step="0.01" placeholder="1250.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variance-notes">Variance Notes (if any)</Label>
                  <Textarea id="variance-notes" placeholder="Explain any cash discrepancies..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEndShiftOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsEndShiftOpen(false)}>
                    End Shift
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Shift Overview */}
      {currentShift.status === "active" && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Current Active Shift
            </CardTitle>
            <CardDescription>
              Shift {currentShift.id} - {currentShift.employee} on {currentShift.terminal}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Time</p>
                <p className="font-medium">{currentShift.startTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Starting Cash</p>
                <p className="font-medium">R{currentShift.startCash.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Cash</p>
                <p className="font-medium">R{currentShift.currentCash.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">6h 45m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              On Terminal 1
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R3,450</div>
            <p className="text-xs text-muted-foreground">
              47 transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Variance</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R0.00</div>
            <p className="text-xs text-muted-foreground">
              No discrepancies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Shift Duration</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8h 15m</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shifts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shifts">All Shifts</TabsTrigger>
          <TabsTrigger value="analytics">Shift Analytics</TabsTrigger>
          <TabsTrigger value="cash-management">Cash Management</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift History</CardTitle>
              <CardDescription>
                View and manage all POS shifts
              </CardDescription>
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search shifts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{shift.employee}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{shift.id}</span>
                          <span>•</span>
                          <span>{shift.terminal}</span>
                          <span>•</span>
                          <span>{shift.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">{shift.startTime} - {shift.endTime}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Sales</p>
                        <p className="font-medium">R{shift.totalSales.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Cash</p>
                        <p className="font-medium">R{shift.startCash.toFixed(2)} → R{shift.endCash.toFixed(2)}</p>
                      </div>
                      {getStatusBadge(shift.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Shift Performance</CardTitle>
                <CardDescription>
                  Sales performance by shift
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto mb-2" />
                    <p>Shift performance chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Performance</CardTitle>
                <CardDescription>
                  Average sales per employee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <User className="h-12 w-12 mx-auto mb-2" />
                    <p>Employee performance chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cash-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Management</CardTitle>
              <CardDescription>
                Track cash drawer activities and variances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Cash management tools</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced cash tracking features coming soon
                </p>
                <Button variant="outline">Configure Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}