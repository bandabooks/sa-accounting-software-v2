import { useState, useEffect } from "react";
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
  retirementFund: string;
  otherDeductions: string;
  totalDeductions: string;
  netPay: string;
  status: string;
  paymentMethod: string;
  paymentReference?: string;
}

interface SarsReturn {
  id: number;
  returnType: string;
  period: string;
  taxYear: string;
  status: string;
  submissionDate?: string;
  totalEmployees: number;
  totalPAYE: string;
  totalUIF: string;
  totalSDL: string;
  sarsReference?: string;
  createdAt: string;
}

interface PayrollSettings {
  id?: number;
  sarsRegistrationNumber?: string;
  payeReference?: string;
  uifReference?: string;
  sdlReference?: string;
  defaultPayPeriod?: string;
  defaultPayDay?: number;
  autoProcessPayroll?: boolean;
  autoSubmitReturns?: boolean;
  uifContributionRate?: string;
  sdlContributionRate?: string;
}

export default function Payroll() {
  const [activeTab, setActiveTab] = useState("periods");
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [isCreatePeriodOpen, setIsCreatePeriodOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerateEMP201Open, setIsGenerateEMP201Open] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payroll periods
  const { data: payrollPeriods = [], isLoading: isLoadingPeriods } = useQuery<PayrollPeriod[]>({
    queryKey: ["/api/payroll/periods"],
    queryFn: async () => {
      const response = await fetch("/api/payroll/periods");
      if (!response.ok) throw new Error("Failed to fetch payroll periods");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch employee payrolls for selected period
  const { data: employeePayrolls = [], isLoading: isLoadingPayrolls } = useQuery<EmployeePayroll[]>({
    queryKey: ["/api/payroll/employee-payrolls", selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/payroll/employee-payrolls${selectedPeriod ? `?periodId=${selectedPeriod}` : ""}`);
      if (!response.ok) throw new Error("Failed to fetch employee payrolls");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch SARS returns
  const { data: sarsReturns = [], isLoading: isLoadingSarsReturns } = useQuery<SarsReturn[]>({
    queryKey: ["/api/payroll/sars-returns"],
    queryFn: async () => {
      const response = await fetch("/api/payroll/sars-returns");
      if (!response.ok) throw new Error("Failed to fetch SARS returns");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch payroll settings
  const { data: payrollSettings = {}, isLoading: isLoadingSettings } = useQuery<PayrollSettings>({
    queryKey: ["/api/payroll/settings"],
    queryFn: async () => {
      const response = await fetch("/api/payroll/settings");
      if (!response.ok) throw new Error("Failed to fetch payroll settings");
      const data = await response.json();
      return data || {};
    },
  });

  // Create payroll period mutation
  const createPeriodMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/payroll/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create payroll period");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/periods"] });
      setIsCreatePeriodOpen(false);
      toast({ title: "Success", description: "Payroll period created successfully" });
    },
  });

  // Process payroll mutation
  const processPayrollMutation = useMutation({
    mutationFn: async (periodId: number) => {
      const response = await fetch(`/api/payroll/periods/${periodId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to process payroll");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/periods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/employee-payrolls"] });
      toast({ title: "Success", description: "Payroll processed successfully" });
    },
  });

  // Generate EMP201 mutation
  const generateEMP201Mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/payroll/sars/emp201", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to generate EMP201");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/sars-returns"] });
      setIsGenerateEMP201Open(false);
      toast({ title: "Success", description: "EMP201 return generated successfully" });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: PayrollSettings) => {
      const response = await fetch("/api/payroll/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/settings"] });
      setIsSettingsOpen(false);
      toast({ title: "Success", description: "Payroll settings updated successfully" });
    },
  });

  const handleCreatePeriod = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      periodName: formData.get("periodName"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      payDate: formData.get("payDate"),
    };
    createPeriodMutation.mutate(data);
  };

  const handleGenerateEMP201 = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      period: formData.get("period"),
    };
    generateEMP201Mutation.mutate(data);
  };

  const handleUpdateSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: PayrollSettings = {
      sarsRegistrationNumber: formData.get("sarsRegistrationNumber")?.toString() || "",
      payeReference: formData.get("payeReference")?.toString() || "",
      uifReference: formData.get("uifReference")?.toString() || "",
      sdlReference: formData.get("sdlReference")?.toString() || "",
      defaultPayPeriod: formData.get("defaultPayPeriod")?.toString() || "monthly",
      defaultPayDay: parseInt(formData.get("defaultPayDay")?.toString() || "25"),
      uifContributionRate: formData.get("uifContributionRate")?.toString() || "1.00",
      sdlContributionRate: formData.get("sdlContributionRate")?.toString() || "1.00",
      autoProcessPayroll: formData.get("autoProcessPayroll") === "on",
      autoSubmitReturns: formData.get("autoSubmitReturns") === "on",
    };
    updateSettingsMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      case "submitted": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(num);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600">SARS-compliant payroll processing and EMP returns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            Settings
          </Button>
          <Button onClick={() => setIsCreatePeriodOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            New Period
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="periods">Payroll Periods</TabsTrigger>
          <TabsTrigger value="payrolls">Employee Payrolls</TabsTrigger>
          <TabsTrigger value="sars">SARS Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Periods</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payrollPeriods.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    payrollPeriods
                      .filter((p: PayrollPeriod) => new Date(p.startDate).getMonth() === new Date().getMonth())
                      .reduce((sum: number, p: PayrollPeriod) => sum + parseFloat(p.totalNetPay || "0"), 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Net pay</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total PAYE</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    payrollPeriods.reduce((sum: number, p: PayrollPeriod) => sum + parseFloat(p.totalPAYE || "0"), 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">All periods</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total UIF</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    payrollPeriods.reduce((sum: number, p: PayrollPeriod) => sum + parseFloat(p.totalUIF || "0"), 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">All periods</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Periods</CardTitle>
              <CardDescription>Manage payroll periods and processing</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPeriods ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="w-6 h-6 animate-spin mr-2" />
                  Loading periods...
                </div>
              ) : payrollPeriods.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No payroll periods found</p>
                  <Button onClick={() => setIsCreatePeriodOpen(true)}>Create First Period</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payrollPeriods.map((period: PayrollPeriod) => (
                    <div key={period.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{period.periodName}</h3>
                          <p className="text-sm text-gray-600">
                            {format(new Date(period.startDate), "MMM dd")} - {format(new Date(period.endDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(period.status)}>
                            {period.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          {period.status === "draft" && (
                            <Button
                              size="sm"
                              onClick={() => processPayrollMutation.mutate(period.id)}
                              disabled={processPayrollMutation.isPending}
                            >
                              <Calculator className="w-4 h-4 mr-1" />
                              Process
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPeriod(period.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Employees:</span>
                          <span className="ml-2 font-medium">{period.totalEmployees}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Gross Pay:</span>
                          <span className="ml-2 font-medium">{formatCurrency(period.totalGrossPay)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Net Pay:</span>
                          <span className="ml-2 font-medium">{formatCurrency(period.totalNetPay)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Pay Date:</span>
                          <span className="ml-2 font-medium">{format(new Date(period.payDate), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payrolls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Payrolls</CardTitle>
              <CardDescription>Individual employee payroll details</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPeriod && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Showing payrolls for period: {payrollPeriods.find((p: PayrollPeriod) => p.id === selectedPeriod)?.periodName}
                  </p>
                </div>
              )}
              
              {isLoadingPayrolls ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="w-6 h-6 animate-spin mr-2" />
                  Loading payrolls...
                </div>
              ) : !Array.isArray(employeePayrolls) || employeePayrolls.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No payroll data found</p>
                  {selectedPeriod && (
                    <p className="text-sm text-gray-400 mt-2">Process the selected period to generate payrolls</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2 text-left">Employee</th>
                        <th className="border border-gray-200 p-2 text-right">Basic Salary</th>
                        <th className="border border-gray-200 p-2 text-right">Allowances</th>
                        <th className="border border-gray-200 p-2 text-right">Gross Pay</th>
                        <th className="border border-gray-200 p-2 text-right">PAYE</th>
                        <th className="border border-gray-200 p-2 text-right">UIF</th>
                        <th className="border border-gray-200 p-2 text-right">Deductions</th>
                        <th className="border border-gray-200 p-2 text-right">Net Pay</th>
                        <th className="border border-gray-200 p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(employeePayrolls) && employeePayrolls.map((payroll: EmployeePayroll) => (
                        <tr key={payroll.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 p-2">
                            <div>
                              <div className="font-medium">{payroll.employeeName}</div>
                              <div className="text-sm text-gray-500">{payroll.employeeNumber}</div>
                            </div>
                          </td>
                          <td className="border border-gray-200 p-2 text-right">{formatCurrency(payroll.basicSalary)}</td>
                          <td className="border border-gray-200 p-2 text-right">{formatCurrency(payroll.allowances)}</td>
                          <td className="border border-gray-200 p-2 text-right font-medium">{formatCurrency(payroll.grossPay)}</td>
                          <td className="border border-gray-200 p-2 text-right">{formatCurrency(payroll.payeTax)}</td>
                          <td className="border border-gray-200 p-2 text-right">{formatCurrency(payroll.uifEmployee)}</td>
                          <td className="border border-gray-200 p-2 text-right">{formatCurrency(payroll.totalDeductions)}</td>
                          <td className="border border-gray-200 p-2 text-right font-bold text-green-600">{formatCurrency(payroll.netPay)}</td>
                          <td className="border border-gray-200 p-2 text-center">
                            <Badge className={getStatusColor(payroll.status)}>
                              {payroll.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sars" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">SARS Returns</h2>
              <p className="text-gray-600">Generate and submit EMP201, EMP501, and other SARS returns</p>
            </div>
            <Button onClick={() => setIsGenerateEMP201Open(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Generate EMP201
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLoadingSarsReturns ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="w-6 h-6 animate-spin mr-2" />
                  Loading SARS returns...
                </div>
              ) : sarsReturns.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No SARS returns generated yet</p>
                  <Button onClick={() => setIsGenerateEMP201Open(true)}>Generate First Return</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sarsReturns.map((sarsReturn: SarsReturn) => (
                    <div key={sarsReturn.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{sarsReturn.returnType} - {sarsReturn.period}</h3>
                          <p className="text-sm text-gray-600">Tax Year: {sarsReturn.taxYear}</p>
                          {sarsReturn.sarsReference && (
                            <p className="text-sm text-gray-600">SARS Ref: {sarsReturn.sarsReference}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(sarsReturn.status)}>
                            {sarsReturn.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          {sarsReturn.status === "generated" && (
                            <Button size="sm">
                              <Send className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Employees:</span>
                          <span className="ml-2 font-medium">{sarsReturn.totalEmployees}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">PAYE:</span>
                          <span className="ml-2 font-medium">{formatCurrency(sarsReturn.totalPAYE)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">UIF:</span>
                          <span className="ml-2 font-medium">{formatCurrency(sarsReturn.totalUIF)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">SDL:</span>
                          <span className="ml-2 font-medium">{formatCurrency(sarsReturn.totalSDL)}</span>
                        </div>
                      </div>
                      {sarsReturn.submissionDate && (
                        <p className="text-sm text-gray-600 mt-2">
                          Submitted: {format(new Date(sarsReturn.submissionDate), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Payroll Period Dialog */}
      <Dialog open={isCreatePeriodOpen} onOpenChange={setIsCreatePeriodOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payroll Period</DialogTitle>
            <DialogDescription>Set up a new payroll processing period</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePeriod} className="space-y-4">
            <div>
              <Label htmlFor="periodName">Period Name</Label>
              <Input
                id="periodName"
                name="periodName"
                placeholder="e.g., January 2025"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="payDate">Pay Date</Label>
              <Input
                id="payDate"
                name="payDate"
                type="date"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreatePeriodOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPeriodMutation.isPending}>
                {createPeriodMutation.isPending ? "Creating..." : "Create Period"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate EMP201 Dialog */}
      <Dialog open={isGenerateEMP201Open} onOpenChange={setIsGenerateEMP201Open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate EMP201 Return</DialogTitle>
            <DialogDescription>Generate monthly employer reconciliation return</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerateEMP201} className="space-y-4">
            <div>
              <Label htmlFor="period">Period (YYYY-MM)</Label>
              <Input
                id="period"
                name="period"
                placeholder="e.g., 2025-01"
                pattern="[0-9]{4}-[0-9]{2}"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsGenerateEMP201Open(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={generateEMP201Mutation.isPending}>
                {generateEMP201Mutation.isPending ? "Generating..." : "Generate Return"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payroll Settings</DialogTitle>
            <DialogDescription>Configure SARS registration and payroll processing settings</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sarsRegistrationNumber">SARS Registration Number</Label>
                <Input
                  id="sarsRegistrationNumber"
                  name="sarsRegistrationNumber"
                  defaultValue={payrollSettings.sarsRegistrationNumber || ""}
                  placeholder="e.g., 9999999999"
                />
              </div>
              <div>
                <Label htmlFor="payeReference">PAYE Reference</Label>
                <Input
                  id="payeReference"
                  name="payeReference"
                  defaultValue={payrollSettings.payeReference || ""}
                  placeholder="e.g., 7999999999"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uifReference">UIF Reference</Label>
                <Input
                  id="uifReference"
                  name="uifReference"
                  defaultValue={payrollSettings.uifReference || ""}
                  placeholder="e.g., U999999999"
                />
              </div>
              <div>
                <Label htmlFor="sdlReference">SDL Reference</Label>
                <Input
                  id="sdlReference"
                  name="sdlReference"
                  defaultValue={payrollSettings.sdlReference || ""}
                  placeholder="e.g., L999999999"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultPayPeriod">Default Pay Period</Label>
                <Select name="defaultPayPeriod" defaultValue={payrollSettings.defaultPayPeriod || "monthly"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="defaultPayDay">Default Pay Day</Label>
                <Input
                  id="defaultPayDay"
                  name="defaultPayDay"
                  type="number"
                  min="1"
                  max="31"
                  defaultValue={payrollSettings.defaultPayDay || "25"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uifContributionRate">UIF Rate (%)</Label>
                <Input
                  id="uifContributionRate"
                  name="uifContributionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={payrollSettings.uifContributionRate || "1.00"}
                />
              </div>
              <div>
                <Label htmlFor="sdlContributionRate">SDL Rate (%)</Label>
                <Input
                  id="sdlContributionRate"
                  name="sdlContributionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={payrollSettings.sdlContributionRate || "1.00"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}