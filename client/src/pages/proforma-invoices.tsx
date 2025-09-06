import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  DollarSign,
  Calendar,
  User,
  ArrowUpDown,
  Filter,
  Download,
  Mail,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type ProformaInvoice = {
  id: number;
  proformaNumber: string;
  customerId: number;
  issueDate: string;
  expiryDate: string;
  subtotal: string;
  vatAmount: string;
  total: string;
  status: "draft" | "sent" | "viewed" | "approved" | "rejected" | "expired" | "converted";
  notes?: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800", 
  viewed: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-600",
  converted: "bg-purple-100 text-purple-800"
};

export default function ProformaInvoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch proforma invoices
  const { data: proformaInvoices = [], isLoading, error } = useQuery({
    queryKey: ["/api/proforma-invoices"],
    retry: 1,
    onError: (error: any) => {
      console.error("Failed to fetch proforma invoices:", error);
    }
  });

  // Delete mutation
  const deleteProformaMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/proforma-invoices/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Proforma invoice deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/proforma-invoices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete proforma invoice",
        variant: "destructive",
      });
    },
  });

  // Convert to invoice mutation
  const convertToInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/proforma-invoices/${id}/convert-to-invoice`, "POST");
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Proforma invoice converted to invoice successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/proforma-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to convert to invoice",
        variant: "destructive",
      });
    },
  });

  // Filter proforma invoices
  const filteredProformaInvoices = proformaInvoices.filter((proforma: ProformaInvoice) => {
    const matchesSearch = 
      proforma.proformaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proforma.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || proforma.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalValue = filteredProformaInvoices.reduce((sum: number, proforma: ProformaInvoice) => 
    sum + parseFloat(proforma.total || "0"), 0
  );

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">Error loading proforma invoices. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" data-testid="proforma-invoices-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
            Proforma Invoices
          </h1>
          <p className="text-gray-600">Manage your proforma invoices and convert them to invoices</p>
        </div>
        <Link href="/proforma-invoices/create">
          <Button data-testid="button-create-proforma">
            <Plus className="w-4 h-4 mr-2" />
            Create Proforma Invoice
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Proforma Invoices</p>
                <p className="text-2xl font-bold" data-testid="stat-total-count">
                  {filteredProformaInvoices.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold" data-testid="stat-total-value">
                  R {totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold" data-testid="stat-draft-count">
                  {filteredProformaInvoices.filter((p: ProformaInvoice) => p.status === "draft").length}
                </p>
              </div>
              <Edit className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Awaiting Approval</p>
                <p className="text-2xl font-bold" data-testid="stat-pending-count">
                  {filteredProformaInvoices.filter((p: ProformaInvoice) => ["sent", "viewed"].includes(p.status)).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by proforma number or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="filter-status">
                  <Filter className="w-4 h-4 mr-2" />
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("sent")}>
                  Sent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("viewed")}>
                  Viewed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                  Rejected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("converted")}>
                  Converted
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Proforma Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Proforma Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading proforma invoices...</span>
            </div>
          ) : filteredProformaInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No proforma invoices found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all" ? "No proforma invoices match your current filters." : "Get started by creating your first proforma invoice."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/proforma-invoices/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Proforma Invoice
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proforma Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProformaInvoices.map((proforma: ProformaInvoice) => (
                    <TableRow key={proforma.id} data-testid={`row-proforma-${proforma.id}`}>
                      <TableCell className="font-medium">
                        <Link href={`/proforma-invoices/${proforma.id}`} className="text-blue-600 hover:text-blue-800">
                          {proforma.proformaNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {proforma.customer.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(proforma.issueDate).toLocaleDateString('en-ZA')}
                      </TableCell>
                      <TableCell>
                        {new Date(proforma.expiryDate).toLocaleDateString('en-ZA')}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[proforma.status]} data-testid={`status-${proforma.id}`}>
                          {proforma.status.charAt(0).toUpperCase() + proforma.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium" data-testid={`total-${proforma.id}`}>
                        R {parseFloat(proforma.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`actions-${proforma.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/proforma-invoices/${proforma.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/proforma-invoices/${proforma.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {proforma.status === "approved" && (
                              <DropdownMenuItem 
                                onClick={() => convertToInvoiceMutation.mutate(proforma.id)}
                                disabled={convertToInvoiceMutation.isPending}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Convert to Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => deleteProformaMutation.mutate(proforma.id)}
                              className="text-red-600"
                              disabled={deleteProformaMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}