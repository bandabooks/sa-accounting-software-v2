import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Calculator, Download, FileText, Send, User, AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PayrollPeriod {
  id: number;
  periodName: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: string;
  totalEmployees: number;
  totalGrossPay: string;
  totalNetPay: string;
  totalPAYE: string;
  totalUIF: string;
  totalSDL: string;
  notes?: string;
  createdAt: string;
}

interface EmployeePayroll {
  id: number;
  employeeName: string;
  employeeNumber: string;
  basicSalary: string;
  allowances: string;
  overtime: string;
  commissions: string;
  bonuses: string;
  grossPay: string;
  payeTax: string;
  uifEmployee: string;
  medicalAidEmployee: string;
  pensionEmployee: string;
  otherDeductions: string;
  netPay: string;
  status: string;
}

interface PayrollSummary {
  totalEmployees: number;
  totalGrossPay: string;
  totalNetPay: string;
  totalDeductions: string;
  totalPAYE: string;
  totalUIF: string;
  totalSDL: string;
}

export default function Payroll() {
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [showNewPeriodDialog, setShowNewPeriodDialog] = useState(false);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payroll periods
  const { data: payrollPeriods, isLoading: periodsLoading } = useQuery({
    queryKey: ["/api/payroll/periods"],
    queryFn: () => fetch("/api/payroll/periods").then((res) => res.json()),
  });

  // Fetch payroll details for selected period
  const { data: payrollDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["/api/payroll/details", selectedPeriod],
    queryFn: () => selectedPeriod ? fetch(`/api/payroll/details/${selectedPeriod}`).then((res) => res.json()) : null,
    enabled: !!selectedPeriod,
  });

  // Fetch payroll summary
  const { data: payrollSummary } = useQuery({
    queryKey: ["/api/payroll/summary", selectedPeriod],
    queryFn: () => selectedPeriod ? fetch(`/api/payroll/summary/${selectedPeriod}`).then((res) => res.json()) : null,
    enabled: !!selectedPeriod,
  });

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then((res) => res.json()),
  });

  // Create payroll period mutation
  const createPeriodMutation = useMutation({
    mutationFn: (data: any) => 
      fetch("/api/payroll/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/periods"] });
      toast({
        title: "Success",
        description: "Payroll period created successfully.",
      });
      setShowNewPeriodDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payroll period.",
        variant: "destructive",
      });
    },
  });

  // Process payroll mutation
  const processPayrollMutation = useMutation({
    mutationFn: ({ periodId, data }: { periodId: number; data: any }) =>
      fetch(`/api/payroll/process/${periodId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Success",
        description: "Payroll processed successfully.",
      });
      setShowPayrollDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process payroll.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePeriod = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      periodName: formData.get("periodName"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      payDate: formData.get("payDate"),
      notes: formData.get("notes"),
    };

    createPeriodMutation.mutate(data);
  };

  const summary: PayrollSummary = payrollSummary || {
    totalEmployees: 0,
    totalGrossPay: "0.00",
    totalNetPay: "0.00",
    totalDeductions: "0.00",
    totalPAYE: "0.00",
    totalUIF: "0.00",
    totalSDL: "0.00",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage employee payroll, salaries, and tax compliance
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showNewPeriodDialog} onOpenChange={setShowNewPeriodDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                New Period
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Payroll Period</DialogTitle>
                <DialogDescription>
                  Set up a new payroll period for processing salaries.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePeriod} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="periodName">Period Name</Label>
                  <Input name="periodName" placeholder="e.g., January 2024" required />
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
                  <Label htmlFor="payDate">Pay Date</Label>
                  <Input type="date" name="payDate" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea name="notes" placeholder="Any additional notes" />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewPeriodDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPeriodMutation.isPending}>
                    {createPeriodMutation.isPending ? "Creating..." : "Create Period"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {selectedPeriod && (
            <Button>
              <Calculator className="h-4 w-4 mr-2" />
              Process Payroll
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="periods" className="space-y-6">
        <TabsList>
          <TabsTrigger value="periods">Payroll Periods</TabsTrigger>
          <TabsTrigger value="employees">Employee Payroll</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Periods</CardTitle>
              <CardDescription>
                Manage payroll periods and processing schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {periodsLoading ? (
                <div className="text-center py-8">Loading payroll periods...</div>
              ) : !payrollPeriods || payrollPeriods.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payroll periods found. Create your first period to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Pay Date</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(payrollPeriods as PayrollPeriod[]).map((period) => (
                      <TableRow key={period.id}>
                        <TableCell className="font-medium">
                          {period.periodName}
                        </TableCell>
                        <TableCell>
                          {format(new Date(period.startDate), "MMM dd")} -{" "}
                          {format(new Date(period.endDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(period.payDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{period.totalEmployees}</TableCell>
                        <TableCell>R{parseFloat(period.totalGrossPay).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              period.status === "completed"
                                ? "default"
                                : period.status === "processing"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {period.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPeriod(period.id)}
                            >
                              View
                            </Button>
                            {period.status === "completed" && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          {selectedPeriod ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Employees</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.totalEmployees}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gross Pay</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      R{parseFloat(summary.totalGrossPay).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      R{parseFloat(summary.totalNetPay).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">PAYE Tax</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      R{parseFloat(summary.totalPAYE).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Employee Payroll Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Payroll Details</CardTitle>
                  <CardDescription>
                    Individual payroll breakdown for selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {detailsLoading ? (
                    <div className="text-center py-8">Loading payroll details...</div>
                  ) : !payrollDetails || payrollDetails.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No payroll details found for this period.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Basic Salary</TableHead>
                            <TableHead>Allowances</TableHead>
                            <TableHead>Overtime</TableHead>
                            <TableHead>Gross Pay</TableHead>
                            <TableHead>PAYE</TableHead>
                            <TableHead>UIF</TableHead>
                            <TableHead>Net Pay</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(payrollDetails as EmployeePayroll[]).map((emp) => (
                            <TableRow key={emp.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{emp.employeeName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {emp.employeeNumber}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>R{parseFloat(emp.basicSalary).toLocaleString()}</TableCell>
                              <TableCell>R{parseFloat(emp.allowances).toLocaleString()}</TableCell>
                              <TableCell>R{parseFloat(emp.overtime).toLocaleString()}</TableCell>
                              <TableCell className="font-medium">
                                R{parseFloat(emp.grossPay).toLocaleString()}
                              </TableCell>
                              <TableCell>R{parseFloat(emp.payeTax).toLocaleString()}</TableCell>
                              <TableCell>R{parseFloat(emp.uifEmployee).toLocaleString()}</TableCell>
                              <TableCell className="font-medium text-green-600">
                                R{parseFloat(emp.netPay).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={emp.status === "paid" ? "default" : "outline"}>
                                  {emp.status}
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
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Payroll Period</h3>
                <p className="text-muted-foreground">
                  Choose a payroll period from the Periods tab to view employee details.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Reports</CardTitle>
              <CardDescription>
                Generate and download payroll reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium mb-1">Payslips</h3>
                    <p className="text-sm text-muted-foreground">
                      Individual employee payslips
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Calculator className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium mb-1">PAYE Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Tax calculations and deductions
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Send className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-medium mb-1">UIF Returns</h3>
                    <p className="text-sm text-muted-foreground">
                      UIF contribution reports
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}