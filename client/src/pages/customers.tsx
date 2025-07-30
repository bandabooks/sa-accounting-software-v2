import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Eye, Edit, Trash2, Users, UserCheck, UserX, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customersApi } from "@/lib/api";
import { useState } from "react";
import { MiniDashboard } from "@/components/MiniDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { apiRequest } from "@/lib/queryClient";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: customersApi.getAll
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/customers/stats"],
    queryFn: () => apiRequest("/api/customers/stats", "GET").then(res => res.json())
  });

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = !statusFilter || 
      (statusFilter === "active" && (customer as any).isActive !== false) ||
      (statusFilter === "inactive" && (customer as any).isActive === false) ||
      (statusFilter === "portal" && customer.portalAccess === true);
    return matchesSearch && matchesStatus;
  }) || [];

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
        <MiniDashboard title="Customers Overview">
          <DashboardCard
            title="Total Customers"
            value={stats.total}
            icon={Users}
            color="blue"
            onClick={() => setStatusFilter("")}
          />
          <DashboardCard
            title="Active"
            value={stats.active}
            icon={UserCheck}
            color="green"
            onClick={() => setStatusFilter("active")}
          />
          <DashboardCard
            title="Inactive"
            value={stats.inactive}
            icon={UserX}
            color="red"
            onClick={() => setStatusFilter("inactive")}
          />
          <DashboardCard
            title="Portal Access"
            value={stats.withPortalAccess}
            icon={Shield}
            color="purple"
            onClick={() => setStatusFilter("portal")}
          />
        </MiniDashboard>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 flex-1 max-w-2xl">
          <Input
            placeholder="Search customers..."
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
        <Button asChild className="bg-primary hover:bg-blue-800">
          <Link href="/customers/new">
            <Plus size={16} className="mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VAT Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{customer.city}</div>
                    {customer.postalCode && (
                      <div className="text-gray-500">{customer.postalCode}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.vatNumber || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/customers/${customer.id}`}>
                        <Eye size={16} />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? "No customers found matching your search." : "No customers yet."}
            </div>
            {!searchTerm && (
              <Button asChild className="mt-4">
                <Link href="/customers/new">Add your first customer</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
