import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Eye, FileText, Send, Check, X, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { estimatesApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import { useState } from "react";
import { MiniDashboard } from "@/components/MiniDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Estimates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: estimates, isLoading } = useQuery({
    queryKey: ["/api/estimates"],
    queryFn: estimatesApi.getAll
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/estimates/stats"],
    queryFn: () => apiRequest("/api/estimates/stats", "GET")
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest(`/api/estimates/${id}/status`, {
        method: "PUT",
        body: { status, notes }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates/stats"] });
      toast({
        title: "Status Updated",
        description: "Estimate status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update estimate status.",
        variant: "destructive",
      });
    },
  });

  const sendEstimateMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/estimates/${id}/send`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates/stats"] });
      toast({
        title: "Estimate Sent",
        description: "Estimate has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send estimate.",
        variant: "destructive",
      });
    },
  });

  const filteredEstimates = estimates?.filter(estimate => {
    const matchesSearch = estimate.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimate.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || estimate.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return Send;
      case "viewed": return Eye;
      case "accepted": return Check;
      case "rejected": return X;
      case "expired": return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft": return "gray";
      case "sent": return "blue";
      case "viewed": return "orange";
      case "accepted": return "green";
      case "rejected": return "red";
      case "expired": return "red";
      default: return "gray";
    }
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleSendEstimate = (id: number) => {
    sendEstimateMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mini Dashboard */}
      {stats && (
        <MiniDashboard title="Estimates Overview">
          <DashboardCard
            title="Total Estimates"
            value={stats.total}
            icon={FileText}
            color="blue"
            onClick={() => setStatusFilter("")}
          />
          <DashboardCard
            title="Draft"
            value={stats.draft}
            icon={FileText}
            color="gray"
            onClick={() => setStatusFilter("draft")}
          />
          <DashboardCard
            title="Sent"
            value={stats.sent}
            icon={Send}
            color="blue"
            onClick={() => setStatusFilter("sent")}
          />
          <DashboardCard
            title="Accepted"
            value={stats.accepted}
            icon={Check}
            color="green"
            onClick={() => setStatusFilter("accepted")}
          />
          <DashboardCard
            title="Rejected"
            value={stats.rejected}
            icon={X}
            color="red"
            onClick={() => setStatusFilter("rejected")}
          />
        </MiniDashboard>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 flex-1 max-w-2xl">
          <Input
            placeholder="Search estimates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          {statusFilter && (
            <Button
              variant="outline"
              onClick={() => setStatusFilter("")}
              className="whitespace-nowrap"
            >
              Clear Filter
            </Button>
          )}
        </div>
        <Link href="/estimates/new">
          <Button className="bg-secondary hover:bg-teal-800 text-white">
            <Plus size={16} className="mr-2" />
            New Estimate
          </Button>
        </Link>
      </div>

      {/* Estimates Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEstimates.map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {estimate.estimateNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{estimate.customer.name}</div>
                    <div className="text-sm text-gray-500">{estimate.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(estimate.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(estimate.expiryDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(estimate.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={getStatusBadgeColor(estimate.status) as any}
                      className="flex items-center gap-1 w-fit"
                    >
                      {(() => {
                        const Icon = getStatusIcon(estimate.status);
                        return <Icon size={12} />;
                      })()}
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Link href={`/estimates/${estimate.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                      </Link>
                      {estimate.status === "draft" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendEstimate(estimate.id)}
                          disabled={sendEstimateMutation.isPending}
                        >
                          <Send size={16} className="mr-1" />
                          Send
                        </Button>
                      )}
                      {(estimate.status === "sent" || estimate.status === "viewed") && (
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusUpdate(estimate.id, "accepted")}
                            disabled={updateStatusMutation.isPending}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Check size={16} className="mr-1" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusUpdate(estimate.id, "rejected")}
                            disabled={updateStatusMutation.isPending}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X size={16} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEstimates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? "No estimates found matching your search." : "No estimates yet."}
            </div>
            {!searchTerm && (
              <Link href="/estimates/new">
                <Button className="mt-4 bg-secondary hover:bg-teal-800 text-white">
                  Create your first estimate
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
