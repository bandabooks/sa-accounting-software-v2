import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Shield, Download, Filter } from "lucide-react";

interface PermissionMatrix {
  roles: string[];
  modules: string[];
  permissions: Record<string, Record<string, boolean>>;
}

interface PermissionsMatrixProps {
  companyId: number;
  searchTerm?: string;
  className?: string;
}

export default function PermissionsMatrix({ 
  companyId, 
  searchTerm = "",
  className = ""
}: PermissionsMatrixProps) {
  const [selectedModule, setSelectedModule] = useState<string>('all');

  // Fetch permissions matrix
  const { data: matrix, isLoading } = useQuery({
    queryKey: ['/api/permissions/matrix', companyId],
    enabled: !!companyId
  });

  // Mock permissions matrix data
  const mockMatrix: PermissionMatrix = {
    roles: [
      'Super Administrator',
      'Company Administrator', 
      'Accountant',
      'Bookkeeper',
      'Manager',
      'Sales Representative',
      'Cashier',
      'Viewer'
    ],
    modules: [
      'Dashboard',
      'Invoicing',
      'Customers',
      'Expenses',
      'Inventory',
      'Payroll',
      'VAT Management',
      'Financial Reports',
      'User Management',
      'Settings'
    ],
    permissions: {
      'Dashboard': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': true,
        'Bookkeeper': true,
        'Manager': true,
        'Sales Representative': true,
        'Cashier': false,
        'Viewer': true
      },
      'Invoicing': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': true,
        'Bookkeeper': true,
        'Manager': false,
        'Sales Representative': true,
        'Cashier': false,
        'Viewer': false
      },
      'Customers': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': true,
        'Bookkeeper': true,
        'Manager': false,
        'Sales Representative': true,
        'Cashier': false,
        'Viewer': false
      },
      'Expenses': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': true,
        'Bookkeeper': true,
        'Manager': true,
        'Sales Representative': false,
        'Cashier': false,
        'Viewer': false
      },
      'Inventory': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': false,
        'Bookkeeper': false,
        'Manager': true,
        'Sales Representative': false,
        'Cashier': false,
        'Viewer': false
      },
      'Payroll': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': true,
        'Bookkeeper': false,
        'Manager': false,
        'Sales Representative': false,
        'Cashier': false,
        'Viewer': false
      },
      'VAT Management': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': true,
        'Bookkeeper': false,
        'Manager': false,
        'Sales Representative': false,
        'Cashier': false,
        'Viewer': false
      },
      'Financial Reports': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': true,
        'Bookkeeper': false,
        'Manager': true,
        'Sales Representative': false,
        'Cashier': false,
        'Viewer': false
      },
      'User Management': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': false,
        'Bookkeeper': false,
        'Manager': false,
        'Sales Representative': false,
        'Cashier': false,
        'Viewer': false
      },
      'Settings': {
        'Super Administrator': true,
        'Company Administrator': true,
        'Accountant': false,
        'Bookkeeper': false,
        'Manager': false,
        'Sales Representative': false,
        'Cashier': false,
        'Viewer': false
      }
    }
  };

  const matrixData = matrix || mockMatrix;

  // Filter modules based on search term and selection
  const filteredModules = matrixData.modules.filter(module => {
    const matchesSearch = module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedModule === 'all' || module === selectedModule;
    return matchesSearch && matchesFilter;
  });

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super administrator':
        return 'bg-red-100 text-red-800';
      case 'company administrator':
        return 'bg-blue-100 text-blue-800';
      case 'accountant':
        return 'bg-green-100 text-green-800';
      case 'bookkeeper':
        return 'bg-yellow-100 text-yellow-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Modules</option>
            {matrixData.modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Filter className="h-3 w-3" />
            <span>{filteredModules.length} modules shown</span>
          </Badge>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Matrix
        </Button>
      </div>

      {/* Permissions Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Role-Based Permissions Matrix</span>
          </CardTitle>
          <CardDescription>
            Overview of module access permissions for each role in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Module</TableHead>
                  {matrixData.roles.map(role => (
                    <TableHead key={role} className="text-center min-w-32">
                      <Badge className={getRoleColor(role)} variant="outline">
                        {role.split(' ')[0]}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.map(module => (
                  <TableRow key={module}>
                    <TableCell className="font-medium">
                      {module}
                    </TableCell>
                    {matrixData.roles.map(role => (
                      <TableCell key={`${module}-${role}`} className="text-center">
                        {getPermissionIcon(matrixData.permissions[module]?.[role] || false)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{matrixData.roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Modules</p>
                <p className="text-2xl font-bold">{matrixData.modules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Permissions</p>
                <p className="text-2xl font-bold">
                  {Object.values(matrixData.permissions)
                    .flatMap(rolePerms => Object.values(rolePerms))
                    .filter(Boolean).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Industry Standard Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Industry-Standard Permissions</h4>
              <p className="text-sm text-blue-700 mt-1">
                This permissions matrix follows industry best practices based on real-world job responsibilities. 
                Permissions are automatically configured to match standards from leading business software platforms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}