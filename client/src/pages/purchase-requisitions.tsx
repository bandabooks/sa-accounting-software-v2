import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, CheckCircle, Clock, AlertCircle, XCircle, Eye, Edit, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PurchaseRequisition {
  id: number;
  requisitionNumber: string;
  requestedBy: number;
  department?: string;
  requestDate: string;
  requiredDate?: string;
  status: string;
  priority: string;
  justification?: string;
  totalEstimatedCost: string;
  requestedByUser: {
    id: number;
    name: string;
  };
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  rejectionReason?: string;
}

export default function PurchaseRequisitions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRequisition, setSelectedRequisition] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requisitions = [], isLoading } = useQuery({
    queryKey: ["/api/purchase-requisitions"],
  });

  const approveRequisitionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/purchase-requisitions/${id}/approve`, {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requisitions"] });
      toast({
        title: "Success",
        description: "Purchase requisition approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to approve purchase requisition",
        variant: "destructive",
      });
    },
  });

  const rejectRequisitionMutation = useMutation({
    mutationFn: ({ id, rejectionReason }: { id: number; rejectionReason: string }) => 
      apiRequest(`/api/purchase-requisitions/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requisitions"] });
      setRejectionDialogOpen(false);
      setRejectionReason("");
      setSelectedRequisition(null);
      toast({
        title: "Success",
        description: "Purchase requisition rejected",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to reject purchase requisition",
        variant: "destructive",
      });
    },
  });

  const deleteRequisitionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/purchase-requisitions/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requisitions"] });
      toast({
        title: "Success",
        description: "Purchase requisition deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete purchase requisition",
        variant: "destructive",
      });
    },
  });

  const filteredRequisitions = requisitions.filter((requisition: PurchaseRequisition) => {
    const matchesSearch = 
      requisition.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requisition.requestedByUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requisition.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || requisition.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "draft":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "converted_to_po":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending_approval":
        return <Clock className="w-4 h-4" />;
      case "draft":
        return <FileText className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "converted_to_po":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "normal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const statusCounts = requisitions.reduce((acc: any, requisition: PurchaseRequisition) => {
    acc[requisition.status] = (acc[requisition.status] || 0) + 1;
    return acc;
  }, {});

  const handleReject = (id: number) => {
    setSelectedRequisition(id);
    setRejectionDialogOpen(true);
  };

  const submitRejection = () => {
    if (selectedRequisition && rejectionReason.trim()) {
      rejectRequisitionMutation.mutate({
        id: selectedRequisition,
        rejectionReason: rejectionReason.trim(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Purchase Requisitions</h1>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Purchase Requisitions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage purchase requests and approval workflow
          </p>
        </div>
        <Link href="/purchase-requisitions/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Requisition
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{requisitions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusCounts.pending_approval || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusCounts.approved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusCounts.rejected || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Converted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusCounts.converted_to_po || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by requisition number, requester, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="pending_approval">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="converted_to_po">Converted</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Requisitions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Purchase Requisitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequisitions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No purchase requisitions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedStatus !== "all" 
                  ? "Try adjusting your filters" 
                  : "Get started by creating your first purchase requisition"}
              </p>
              {!searchTerm && selectedStatus === "all" && (
                <Link href="/purchase-requisitions/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Requisition
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Requisition #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Requested By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Request Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Est. Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.map((requisition: PurchaseRequisition) => (
                    <tr key={requisition.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {requisition.requisitionNumber}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-900 dark:text-gray-100">
                          {requisition.requestedByUser?.name || 'Unknown User'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {requisition.department || 'General'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {new Date(requisition.requestDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getPriorityColor(requisition.priority)} w-fit`}>
                          {requisition.priority.charAt(0).toUpperCase() + requisition.priority.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusColor(requisition.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(requisition.status)}
                          {requisition.status.replace(/_/g, ' ').charAt(0).toUpperCase() + requisition.status.replace(/_/g, ' ').slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-700 dark:text-gray-300 font-medium">
                          R {parseFloat(requisition.totalEstimatedCost).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/purchase-requisitions/${requisition.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {requisition.status === "pending_approval" && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => approveRequisitionMutation.mutate(requisition.id)}
                                disabled={approveRequisitionMutation.isPending}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleReject(requisition.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {requisition.status === "draft" && (
                            <Link href={`/purchase-requisitions/${requisition.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteRequisitionMutation.mutate(requisition.id)}
                            disabled={deleteRequisitionMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase Requisition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason for Rejection *
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this requisition..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={submitRejection}
                disabled={!rejectionReason.trim() || rejectRequisitionMutation.isPending}
              >
                Reject Requisition
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}