import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Users, Plus, Settings } from "lucide-react";

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  userCount: number;
  permissions: string[];
  color: string;
}

interface RoleManagementProps {
  companyId: number;
  searchTerm?: string;
  className?: string;
}

export default function RoleManagement({ 
  companyId, 
  searchTerm = "",
  className = ""
}: RoleManagementProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Fetch roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ['/api/roles/company', companyId],
    enabled: !!companyId
  });

  // Mock role data
  const mockRoles: Role[] = [
    {
      id: 1,
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Platform owner with unlimited access to all systems and companies',
      userCount: 1,
      permissions: ['*'],
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 2,
      name: 'company_admin',
      displayName: 'Company Administrator',
      description: 'Full control over their company including users, settings, and all business operations',
      userCount: 2,
      permissions: ['company:manage', 'users:create', 'invoices:*', 'customers:*'],
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 3,
      name: 'accountant',
      displayName: 'Accountant',
      description: 'Full financial management with reporting capabilities but no system administration',
      userCount: 3,
      permissions: ['invoices:*', 'financial:view', 'reports:create', 'vat:*'],
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 4,
      name: 'bookkeeper',
      displayName: 'Bookkeeper',
      description: 'Data entry and basic transaction management without delete permissions',
      userCount: 4,
      permissions: ['invoices:create', 'expenses:create', 'banking:view'],
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 5,
      name: 'manager',
      displayName: 'Manager',
      description: 'Department oversight with reporting and team management capabilities',
      userCount: 2,
      permissions: ['dashboard:view', 'projects:manage', 'reports:departmental'],
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const roleData = roles || mockRoles;

  // Filter roles based on search term
  const filteredRoles = roleData.filter(role =>
    role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <Card 
            key={role.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedRole(role)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={role.color}>
                      <Shield className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{role.displayName}</CardTitle>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{role.userCount}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-sm">
                {role.description}
              </CardDescription>
              
              {/* Permission Preview */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Key Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission === '*' ? 'All Access' : permission.split(':')[0]}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">
                  View Users
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Role Card */}
        <Card className="border-dashed border-2 hover:bg-gray-50 cursor-pointer transition-colors">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
            <div className="p-3 bg-gray-100 rounded-full mb-3">
              <Plus className="h-6 w-6 text-gray-600" />
            </div>
            <CardTitle className="text-lg mb-2">Create New Role</CardTitle>
            <CardDescription className="text-sm mb-4">
              Define custom roles with specific permissions for your organization
            </CardDescription>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Role Details Panel */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={selectedRole.color}>
                    <Shield className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedRole.displayName}</CardTitle>
                  <CardDescription>{selectedRole.description}</CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">Edit Role</Button>
                <Button>Assign Users</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Count */}
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{selectedRole.userCount} users assigned to this role</p>
                <p className="text-sm text-muted-foreground">
                  Active across {selectedRole.userCount > 1 ? 'multiple departments' : '1 department'}
                </p>
              </div>
            </div>

            {/* All Permissions */}
            <div className="space-y-3">
              <h4 className="font-medium">Role Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedRole.permissions.map((permission, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="justify-start text-xs py-1"
                  >
                    {permission === '*' ? 'All System Access' : permission}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Industry Standard Info */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Industry Standard Role</h4>
              <p className="text-sm text-blue-700">
                This role follows industry-standard permissions based on common business practices. 
                Permissions are automatically configured to match real-world job responsibilities.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}