import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, CreditCard, Calendar, User, Mail, Phone, MapPin, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";

interface CustomerPortalData {
  customer: any;
  invoices: any[];
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export default function CustomerPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [customerData, setCustomerData] = useState<CustomerPortalData | null>(null);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/customer-portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomerData(data);
        setIsLoggedIn(true);
        toast({
          title: "Welcome",
          description: "Successfully logged into customer portal.",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const response = await fetch(`/api/customer-portal/invoice/${invoiceId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download invoice.",
        variant: "destructive",
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Customer Portal</CardTitle>
            <p className="text-gray-600">Access your invoices and account information</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {customerData.customer.name}</span>
              <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerData.invoices.length}</div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(customerData.totalAmount)}</div>
              <p className="text-xs text-gray-500">All invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(customerData.outstandingAmount)}</div>
              <p className="text-xs text-gray-500">Unpaid amount</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={16} />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Name</Label>
                <p className="text-sm">{customerData.customer.name}</p>
              </div>
              {customerData.customer.email && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm flex items-center gap-2">
                    <Mail size={14} />
                    {customerData.customer.email}
                  </p>
                </div>
              )}
              {customerData.customer.phone && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm flex items-center gap-2">
                    <Phone size={14} />
                    {customerData.customer.phone}
                  </p>
                </div>
              )}
              {customerData.customer.address && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm flex items-center gap-2">
                    <MapPin size={14} />
                    {customerData.customer.address}
                    {customerData.customer.city && `, ${customerData.customer.city}`}
                    {customerData.customer.postalCode && ` ${customerData.customer.postalCode}`}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-500">Payment Terms</Label>
                <p className="text-sm">{customerData.customer.paymentTerms || 30} days</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Credit Limit</Label>
                <p className="text-sm">{formatCurrency(customerData.customer.creditLimit || '0')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Invoice List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={16} />
                Your Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerData.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(invoice.issueDate)}
                        </p>
                      </div>
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.total)}</p>
                        <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download size={14} />
                        </Button>
                        {invoice.status !== "paid" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Payment",
                                description: "Payment functionality coming soon.",
                              });
                            }}
                          >
                            <CreditCard size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {customerData.invoices.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No invoices found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}