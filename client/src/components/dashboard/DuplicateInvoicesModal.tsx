import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Trash2, Eye, AlertTriangle, Calendar, DollarSign, 
  FileText, User, CheckCircle, X 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface DuplicateInvoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  total: number;
  createdAt: string;
}

interface DuplicateGroup {
  id: string;
  customer: {
    id: number;
    name: string;
  };
  amount: number;
  invoices: DuplicateInvoice[];
}

interface DuplicateInvoicesData {
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  summary: {
    groupCount: number;
    totalAmount: number;
  };
}

interface DuplicateInvoicesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateInvoicesModal({ open, onOpenChange }: DuplicateInvoicesModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resolvedGroups, setResolvedGroups] = useState<Set<string>>(new Set());

  const { data: duplicatesData, isLoading } = useQuery<DuplicateInvoicesData>({
    queryKey: ['/api/dashboard/duplicates'],
    enabled: open, // Only fetch when modal is open
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolveGroup = (groupId: string, action: 'keep-first' | 'keep-latest' | 'manual') => {
    setResolvedGroups(prev => new Set([...Array.from(prev), groupId]));
    
    toast({
      title: "Group Resolved",
      description: `Duplicate group marked as resolved using ${action.replace('-', ' ')} strategy.`,
    });

    // Refresh dashboard data after resolving
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/business'] });
  };

  const visibleGroups = duplicatesData?.duplicateGroups.filter(group => 
    !Array.from(resolvedGroups).includes(group.id)
  ) || [];

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Duplicate Invoices...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
            Duplicate Invoices Detection
          </DialogTitle>
          <DialogDescription>
            Review and resolve potential duplicate invoices found in your system.
          </DialogDescription>
        </DialogHeader>

        {duplicatesData && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Duplicate Groups</p>
                      <p className="text-2xl font-bold">{visibleGroups.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Total Affected</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(visibleGroups.reduce((sum, group) => 
                          sum + (group.amount * group.invoices.length), 0
                        ))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-purple-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Customers Affected</p>
                      <p className="text-2xl font-bold">
                        {new Set(visibleGroups.map(group => group.customer.id)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resolved Groups Message */}
            {resolvedGroups.size > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-green-800">
                    {resolvedGroups.size} duplicate group(s) have been resolved in this session.
                  </p>
                </div>
              </div>
            )}

            {/* Duplicate Groups */}
            {visibleGroups.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Duplicate Invoice Groups</h3>
                {visibleGroups.map((group) => (
                  <Card key={group.id} className="border-yellow-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                          <span>{group.customer.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {group.invoices.length} duplicates
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-700">
                            {formatCurrency(group.amount)}
                          </p>
                          <p className="text-sm text-gray-600">per invoice</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Invoice List */}
                      <div className="space-y-3 mb-4">
                        {group.invoices.map((invoice, index) => (
                          <div 
                            key={invoice.id} 
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div>
                                  <p className="font-medium">
                                    Invoice #{invoice.invoiceNumber}
                                    {index === 0 && (
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        Original
                                      </Badge>
                                    )}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatDate(invoice.invoiceDate)}
                                    </span>
                                    <Badge className={getStatusColor(invoice.status)} variant="secondary">
                                      {invoice.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-600">
                                Created: {formatDate(invoice.createdAt)}
                              </p>
                              <Link href={`/invoices/${invoice.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      {/* Resolution Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>Choose how to resolve this duplicate group:</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveGroup(group.id, 'keep-first')}
                          >
                            Keep Original
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveGroup(group.id, 'keep-latest')}
                          >
                            Keep Latest
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleResolveGroup(group.id, 'manual')}
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All Duplicate Groups Resolved
                </h3>
                <p className="text-gray-600">
                  {resolvedGroups.size > 0 
                    ? "You've successfully resolved all duplicate invoice groups in this session."
                    : "No duplicate invoices found in your system."
                  }
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {visibleGroups.length > 0 && (
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Refresh data
                      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/duplicates'] });
                      setResolvedGroups(new Set());
                    }}
                  >
                    Refresh Data
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}