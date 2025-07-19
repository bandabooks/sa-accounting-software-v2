import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calculator, 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { VatType, VatReport, VatTransaction } from "@shared/schema";

const vatTypeSchema = z.object({
  code: z.string().min(1, "VAT code is required"),
  name: z.string().min(1, "VAT name is required"),
  rate: z.string().min(0, "VAT rate must be positive"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type VatTypeFormData = z.infer<typeof vatTypeSchema>;

export default function VatManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("types");
  const [isCreatingType, setIsCreatingType] = useState(false);

  // VAT Types Query
  const { data: vatTypes = [], isLoading: typesLoading } = useQuery<VatType[]>({
    queryKey: ["/api/vat-types"],
  });

  // VAT Reports Query
  const { data: vatReports = [], isLoading: reportsLoading } = useQuery<VatReport[]>({
    queryKey: ["/api/vat-reports"],
  });

  // VAT Transactions Query
  const { data: vatTransactions = [], isLoading: transactionsLoading } = useQuery<VatTransaction[]>({
    queryKey: ["/api/vat-transactions"],
  });

  // Form for creating VAT types
  const form = useForm<VatTypeFormData>({
    resolver: zodResolver(vatTypeSchema),
    defaultValues: {
      code: "",
      name: "",
      rate: "0.00",
      description: "",
      isActive: true,
    },
  });

  // Create VAT Type Mutation
  const createVatTypeMutation = useMutation({
    mutationFn: async (data: VatTypeFormData) => {
      return apiRequest("POST", "/api/vat-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vat-types"] });
      toast({
        title: "Success",
        description: "VAT type created successfully",
      });
      setIsCreatingType(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitVatType = (data: VatTypeFormData) => {
    createVatTypeMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case "submitted":
        return <Badge variant="default"><FileText className="w-3 h-3 mr-1" />Submitted</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "paid":
        return <Badge variant="default" className="bg-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">VAT Management</h1>
          <p className="text-gray-600 mt-2">Manage VAT types, returns, and compliance</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="types">VAT Types</TabsTrigger>
          <TabsTrigger value="returns">VAT Returns</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* VAT Types Tab */}
        <TabsContent value="types" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">VAT Types Configuration</h2>
            <Button onClick={() => setIsCreatingType(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add VAT Type
            </Button>
          </div>

          {/* Create VAT Type Form */}
          {isCreatingType && (
            <Card>
              <CardHeader>
                <CardTitle>Create New VAT Type</CardTitle>
                <CardDescription>Add a new VAT rate for your business transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitVatType)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., STD, ZER, EXE" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Standard Rate" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Rate (%) *</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="15.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreatingType(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createVatTypeMutation.isPending}>
                        {createVatTypeMutation.isPending ? "Creating..." : "Create VAT Type"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* VAT Types List */}
          <Card>
            <CardHeader>
              <CardTitle>Current VAT Types</CardTitle>
              <CardDescription>South African VAT rates configured for your business</CardDescription>
            </CardHeader>
            <CardContent>
              {typesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vatTypes.map((vatType) => (
                      <TableRow key={vatType.id}>
                        <TableCell>
                          <Badge variant="outline">{vatType.code}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{vatType.name}</TableCell>
                        <TableCell>{parseFloat(vatType.rate).toFixed(2)}%</TableCell>
                        <TableCell>
                          <Badge variant={vatType.isActive ? "default" : "secondary"}>
                            {vatType.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {vatType.description || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                            {!vatType.isSystemType && (
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-3 h-3" />
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

        {/* VAT Returns Tab */}
        <TabsContent value="returns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">VAT Returns (VAT201)</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create VAT Return
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>VAT Return History</CardTitle>
              <CardDescription>Track and manage your VAT201 submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : vatReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No VAT returns yet</h3>
                  <p className="mt-2 text-gray-600">Create your first VAT201 return to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Report Type</TableHead>
                      <TableHead>Output VAT</TableHead>
                      <TableHead>Input VAT</TableHead>
                      <TableHead>Net Payable</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vatReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {formatDate(new Date(report.periodStart))} - {formatDate(new Date(report.periodEnd))}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.reportType}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(report.outputVat)}</TableCell>
                        <TableCell>{formatCurrency(report.inputVat)}</TableCell>
                        <TableCell>
                          <span className={parseFloat(report.netVatPayable) > 0 ? "text-red-600" : "text-green-600"}>
                            {formatCurrency(report.netVatPayable)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-3 h-3" />
                            </Button>
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

        {/* VAT Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <h2 className="text-xl font-semibold">VAT Transaction History</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent VAT Transactions</CardTitle>
              <CardDescription>All transactions with VAT implications</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : vatTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <Calculator className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No VAT transactions yet</h3>
                  <p className="mt-2 text-gray-600">VAT transactions will appear here as you create invoices and expenses.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>VAT Rate</TableHead>
                      <TableHead>VAT Amount</TableHead>
                      <TableHead>Gross Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vatTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(new Date(transaction.transactionDate))}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.transactionType === "sale" ? "default" : "secondary"}>
                            {transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{formatCurrency(transaction.netAmount)}</TableCell>
                        <TableCell>{parseFloat(transaction.vatRate).toFixed(2)}%</TableCell>
                        <TableCell>{formatCurrency(transaction.vatAmount)}</TableCell>
                        <TableCell>{formatCurrency(transaction.grossAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VAT Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-xl font-semibold">VAT Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company VAT Registration</CardTitle>
                <CardDescription>Configure your VAT registration details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input id="vatNumber" placeholder="Enter your VAT number" />
                </div>
                <div>
                  <Label htmlFor="vatPeriod">VAT Return Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="bi-monthly">Bi-Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="submissionDate">Submission Date (Day of Month)</Label>
                  <Input id="submissionDate" type="number" min="1" max="28" placeholder="25" />
                </div>
                <Button>Save VAT Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default VAT Rates</CardTitle>
                <CardDescription>Standard South African VAT rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Standard Rate</span>
                    <Badge>15.00%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Zero-Rated</span>
                    <Badge variant="secondary">0.00%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Exempt</span>
                    <Badge variant="outline">N/A</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}