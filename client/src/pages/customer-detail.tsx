import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, FileText, DollarSign, Clock, Mail, Download, ArrowLeft, Shield } from "lucide-react";
import { customersApi, invoicesApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils-invoice";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { generateCustomerStatement } from "@/lib/customer-statement";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

export default function CustomerDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  
  const customerId = parseInt(params.id || "0");

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["/api/customers", customerId],
    queryFn: () => customersApi.getById(customerId),
    enabled: customerId > 0
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices", "customer", customerId],
    queryFn: () => invoicesApi.getByCustomer(customerId),
    enabled: customerId > 0
  });

  const updateCustomerMutation = useMutation({
    mutationFn: (data: any) => customersApi.update(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customerId] });
      setIsEditModalOpen(false);
      toast({
        title: "Customer Updated",
        description: "Customer information has been updated successfully.",
      });
    },
  });

  const setupPortalMutation = useMutation({
    mutationFn: (data: { portalAccess: boolean; portalPassword?: string }) => 
      customersApi.setupPortal(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customerId] });
      setIsPortalModalOpen(false);
      toast({
        title: "Portal Access Updated",
        description: "Customer portal access has been updated successfully.",
      });
    },
  });

  // Use loading states for comprehensive loading feedback including mutations
  useLoadingStates({
    loadingStates: [
      { isLoading: customerLoading, message: 'Loading customer details...' },
      { isLoading: invoicesLoading, message: 'Loading customer invoices...' },
      { isLoading: updateCustomerMutation.isPending, message: 'Updating customer...' },
      { isLoading: setupPortalMutation.isPending, message: 'Setting up portal access...' },
    ],
    progressSteps: ['Fetching customer data', 'Loading invoice history', 'Preparing dashboard'],
  });

  if (customerLoading || invoicesLoading) {
    return <PageLoader message="Loading customer details..." />;
  }

  const handleGenerateStatement = async () => {
    if (!customer || !invoices) return;
    
    try {
      // Prepare enhanced statement data
      const statementData = {
        customer,
        company: {
          displayName: 'THINK MYBIZ ACCOUNTING',
          email: 'accounts@thinkmybiz.com',
          phone: '+27 66 210 5631'
        },
        invoices,
        periodStart: invoices.length > 0 ? invoices[invoices.length - 1].issueDate : undefined,
        periodEnd: new Date().toISOString().split('T')[0],
        includePayments: true,
        includePendingInvoices: true
      };
      
      const pdf = await generateCustomerStatement(statementData);
      const fileName = `Statement_${customer.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Professional Statement Generated",
        description: "Enhanced customer statement has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating statement:", error);
      toast({
        title: "Statement Generation Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (customerLoading || invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Customer not found</div>
        <Button onClick={() => setLocation("/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const totalInvoices = invoices?.length || 0;
  const totalAmount = invoices?.reduce((sum, inv) => sum + parseFloat(inv.total), 0) || 0;
  const paidAmount = invoices?.filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + parseFloat(inv.total), 0) || 0;
  const outstandingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/customers")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant={customer.category === "premium" ? "default" : "secondary"}>
                {customer.category ? customer.category.charAt(0).toUpperCase() + customer.category.slice(1) : 'Standard'}
              </Badge>
              {customer.portalAccess && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield size={12} />
                  Portal Access
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPortalModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Shield size={16} />
            Portal
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateStatement}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Statement
          </Button>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-gray-500">All invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-gray-500">Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(outstandingAmount)}</div>
            <p className="text-xs text-gray-500">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details and Invoice History */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{customer.email || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{customer.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">
                    {customer.address && (
                      <>
                        {customer.address}
                        {customer.city && `, ${customer.city}`}
                        {customer.postalCode && ` ${customer.postalCode}`}
                      </>
                    )}
                    {!customer.address && "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">VAT Number</Label>
                  <p className="text-sm">{customer.vatNumber || "Not provided"}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Credit Limit</Label>
                  <p className="text-sm">{formatCurrency(customer.creditLimit || "0")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Payment Terms</Label>
                  <p className="text-sm">{customer.paymentTerms || 30} days</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Category</Label>
                  <p className="text-sm">{customer.category ? customer.category.charAt(0).toUpperCase() + customer.category.slice(1) : 'Standard'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="text-sm">{customer.notes || "No notes"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices?.map((invoice) => (
                  <div key={invoice.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">{formatDate(invoice.issueDate)}</p>
                      </div>
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.total)}</p>
                      <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                    </div>
                  </div>
                ))}
                {(!invoices || invoices.length === 0) && (
                  <p className="text-center text-gray-500 py-8">No invoices found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Statements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Generate and download customer statements</p>
                <Button onClick={handleGenerateStatement} className="flex items-center gap-2">
                  <Download size={16} />
                  Generate Statement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <EditCustomerForm
            customer={customer}
            onSave={(data) => updateCustomerMutation.mutate(data)}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateCustomerMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Portal Access Modal */}
      <Dialog open={isPortalModalOpen} onOpenChange={setIsPortalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Portal Access</DialogTitle>
          </DialogHeader>
          <PortalSetupForm
            customer={customer}
            onSave={(data) => setupPortalMutation.mutate(data)}
            onCancel={() => setIsPortalModalOpen(false)}
            isLoading={setupPortalMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditCustomerForm({ customer, onSave, onCancel, isLoading }: {
  customer: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    city: customer.city || '',
    postalCode: customer.postalCode || '',
    vatNumber: customer.vatNumber || '',
    creditLimit: customer.creditLimit || '0.00',
    paymentTerms: customer.paymentTerms || 30,
    category: customer.category || 'standard',
    notes: customer.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="vatNumber">VAT Number</Label>
          <Input
            id="vatNumber"
            value={formData.vatNumber}
            onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="creditLimit">Credit Limit</Label>
          <Input
            id="creditLimit"
            type="number"
            step="0.01"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
          <Input
            id="paymentTerms"
            type="number"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: parseInt(e.target.value) })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="wholesale">Wholesale</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

function PortalSetupForm({ customer, onSave, onCancel, isLoading }: {
  customer: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    portalAccess: customer.portalAccess || false,
    portalPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="portalAccess"
          checked={formData.portalAccess}
          onCheckedChange={(checked) => setFormData({ ...formData, portalAccess: checked })}
        />
        <Label htmlFor="portalAccess">Enable Portal Access</Label>
      </div>
      
      {formData.portalAccess && (
        <div>
          <Label htmlFor="portalPassword">Portal Password</Label>
          <Input
            id="portalPassword"
            type="password"
            value={formData.portalPassword}
            onChange={(e) => setFormData({ ...formData, portalPassword: e.target.value })}
            placeholder="Enter a secure password"
            required={formData.portalAccess}
          />
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}