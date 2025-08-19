import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormProps {
  employee?: Employee | null;
  onSuccess: () => void;
}

export function EmployeeForm({ employee, onSuccess }: EmployeeFormProps) {
  const { toast } = useToast();
  const isEditing = !!employee;

  // Form state
  const [formData, setFormData] = useState({
    employeeNumber: employee?.employeeNumber || "",
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    idNumber: employee?.idNumber || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    address: employee?.address || "",
    position: employee?.position || "",
    department: employee?.department || "",
    startDate: employee?.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : "",
    employmentType: employee?.employmentType || 'permanent',
    status: employee?.status || 'active',
    basicSalary: employee?.basicSalary || "",
    payrollFrequency: employee?.payrollFrequency || 'monthly',
    emergencyContactName: (employee?.emergencyContact && typeof employee.emergencyContact === 'object' && 'name' in employee.emergencyContact) ? employee.emergencyContact.name : "",
    emergencyContactPhone: (employee?.emergencyContact && typeof employee.emergencyContact === 'object' && 'phone' in employee.emergencyContact) ? employee.emergencyContact.phone : "",
    emergencyContactRelationship: (employee?.emergencyContact && typeof employee.emergencyContact === 'object' && 'relationship' in employee.emergencyContact) ? employee.emergencyContact.relationship : "",
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        basicSalary: parseFloat(data.basicSalary.toString()),
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelationship,
        },
      };
      
      if (isEditing && employee) {
        return await apiRequest(`/api/employees/${employee.id}`, "PUT", payload);
      } else {
        return await apiRequest("/api/employees", "POST", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Employee ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployeeMutation.mutate(formData);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          
          <div>
            <Label htmlFor="employeeNumber">Employee Number</Label>
            <Input
              id="employeeNumber"
              value={formData.employeeNumber}
              onChange={(e) => updateFormData('employeeNumber', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => updateFormData('idNumber', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
            />
          </div>
        </div>

        {/* Employment Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Employment Details</h3>

          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => updateFormData('position', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => updateFormData('department', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateFormData('startDate', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="employmentType">Employment Type</Label>
            <Select value={formData.employmentType} onValueChange={(value) => updateFormData('employmentType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="basicSalary">Basic Salary (R)</Label>
            <Input
              id="basicSalary"
              type="number"
              step="0.01"
              value={formData.basicSalary}
              onChange={(e) => updateFormData('basicSalary', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="payrollFrequency">Payroll Frequency</Label>
            <Select value={formData.payrollFrequency} onValueChange={(value) => updateFormData('payrollFrequency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="emergencyContactName">Name</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="emergencyContactPhone">Phone</Label>
            <Input
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
            <Input
              id="emergencyContactRelationship"
              value={formData.emergencyContactRelationship}
              onChange={(e) => updateFormData('emergencyContactRelationship', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="submit"
          disabled={createEmployeeMutation.isPending}
        >
          {createEmployeeMutation.isPending 
            ? (isEditing ? "Updating..." : "Creating...")
            : (isEditing ? "Update Employee" : "Create Employee")
          }
        </Button>
      </div>
    </form>
  );
}