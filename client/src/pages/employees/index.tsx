import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Edit, Eye, Plus, Search, Users, DollarSign, Calendar, MapPin } from "lucide-react";
import { Employee } from "@shared/schema";
import { ACCOUNTING_ROLES } from "@shared/permissions-matrix";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EmployeeForm } from "./employee-form";

export default function EmployeesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: employees = [], isLoading, error } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    retry: false,
    refetchOnWindowFocus: false
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/employees/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredEmployees = employees.filter((employee: Employee) =>
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.idNumber.includes(searchTerm)
  );

  const activeEmployees = filteredEmployees.filter((emp: Employee) => emp.isActive);
  const inactiveEmployees = filteredEmployees.filter((emp: Employee) => !emp.isActive);

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return <Badge variant="secondary">Inactive</Badge>;
    
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "on_leave":
        return <Badge variant="outline" className="border-yellow-200 text-yellow-700">On Leave</Badge>;
      case "resigned":
        return <Badge variant="destructive">Resigned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Employee Management</h1>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Employee Module Setup Required</h3>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                The employee database tables are being initialized. Please wait a moment and refresh the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Employee Management</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Employee Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your workforce with comprehensive employee data and payroll integration
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{employees.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Staff</p>
              <p className="text-2xl font-bold text-green-600">{activeEmployees.length}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">
                {activeEmployees.filter((emp: Employee) => emp.status === 'on_leave').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payroll</p>
              <p className="text-2xl font-bold text-purple-600">
                R{activeEmployees.reduce((sum: number, emp: Employee) => sum + parseFloat(emp.basicSalary), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No employees found. {searchTerm && "Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee: Employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                      <p className="text-sm text-gray-500">{employee.idNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {employee.employmentType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {employee.email && (
                        <p className="text-sm">{employee.email}</p>
                      )}
                      {employee.phone && (
                        <p className="text-sm text-gray-500">{employee.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">R{parseFloat(employee.basicSalary).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                    <p className="text-xs text-gray-500">{employee.payrollFrequency}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.status, employee.isActive || false)}</TableCell>
                  <TableCell>{new Date(employee.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(employee)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Employee Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                    <p><span className="font-medium">ID Number:</span> {selectedEmployee.idNumber}</p>
                    <p><span className="font-medium">Email:</span> {selectedEmployee.email || "Not provided"}</p>
                    <p><span className="font-medium">Phone:</span> {selectedEmployee.phone || "Not provided"}</p>
                    <p><span className="font-medium">Address:</span> {selectedEmployee.address || "Not provided"}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Employment Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Position:</span> {selectedEmployee.position}</p>
                    <p><span className="font-medium">Department:</span> {selectedEmployee.department}</p>
                    <p><span className="font-medium">Start Date:</span> {new Date(selectedEmployee.startDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Employment Type:</span> {selectedEmployee.employmentType}</p>
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedEmployee.status, selectedEmployee.isActive || false)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Compensation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><span className="font-medium">Basic Salary:</span> R{parseFloat(selectedEmployee.basicSalary).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                  <p><span className="font-medium">Frequency:</span> {selectedEmployee.payrollFrequency}</p>
                </div>
              </div>
              
              {selectedEmployee.emergencyContact && typeof selectedEmployee.emergencyContact === 'object' && selectedEmployee.emergencyContact.name && (
                <div>
                  <h3 className="font-semibold mb-3">Emergency Contact</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedEmployee.emergencyContact.name}</p>
                    <p><span className="font-medium">Phone:</span> {selectedEmployee.emergencyContact.phone}</p>
                    <p><span className="font-medium">Relationship:</span> {selectedEmployee.emergencyContact.relationship}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Employee Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? "Add New Employee" : "Edit Employee"}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={selectedEmployee}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedEmployee(null);
              queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}