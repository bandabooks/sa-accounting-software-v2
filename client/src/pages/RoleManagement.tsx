import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Crown,
  Building,
  Calculator,
  FileText,
  UserCheck,
  DollarSign,
  CreditCard,
  Briefcase,
  Users,
  Eye
} from "lucide-react";

// Comprehensive Business Roles as per user requirements
const BUSINESS_ROLE_DESCRIPTIONS = {
  "super_admin": {
    icon: Crown,
    color: "from-purple-600 to-pink-600",
    level: 10,
    description: "Platform owners with unrestricted access to all system functions, cross-company operations, and administrative controls.",
    accessAreas: ["System Administration", "All Companies", "Global Settings", "Platform Management"],
    userCount: 1
  },
  "company_admin": {
    icon: Building,
    color: "from-blue-600 to-indigo-600", 
    level: 9,
    description: "Highest authority within individual companies with full access to all company data and settings, but no cross-company access.",
    accessAreas: ["Company Management", "All Modules", "User Management", "Company Settings"],
    userCount: 3
  },
  "accountant": {
    icon: Calculator,
    color: "from-green-600 to-emerald-600",
    level: 7,
    description: "Qualified accounting professionals with comprehensive access to financial data, reporting, and transaction management.",
    accessAreas: ["Financial Reports", "Chart of Accounts", "Journal Entries", "Tax Management"],
    userCount: 5
  },
  "bookkeeper": {
    icon: FileText,
    color: "from-teal-600 to-cyan-600",
    level: 6,
    description: "Daily transaction recording specialists focused on data entry, invoice management, and basic financial operations.",
    accessAreas: ["Transaction Entry", "Invoice Management", "Basic Reports", "Customer Management"],
    userCount: 8
  },
  "auditor": {
    icon: UserCheck,
    color: "from-orange-600 to-red-600",
    level: 6,
    description: "External or internal auditors with read-only access to financial records and comprehensive reporting capabilities.",
    accessAreas: ["Read-Only Financial Data", "Audit Reports", "Compliance Documents", "Historical Records"],
    userCount: 2
  },
  "manager": {
    icon: Users,
    color: "from-slate-600 to-gray-600",
    level: 5,
    description: "Department managers with access to relevant operational data, reporting, and limited administrative functions.",
    accessAreas: ["Department Reports", "Team Management", "Operational Data", "Performance Metrics"],
    userCount: 12
  },
  "sales_rep": {
    icon: DollarSign,
    color: "from-yellow-600 to-orange-600",
    level: 4,
    description: "Sales team members focused on customer management, quotes, invoices, and sales-related reporting.",
    accessAreas: ["Customer Management", "Sales Quotes", "Invoice Creation", "Sales Reports"],
    userCount: 15
  },
  "cashier": {
    icon: CreditCard,
    color: "from-pink-600 to-rose-600",
    level: 3,
    description: "Point-of-sale operators handling daily cash transactions, payment processing, and basic customer interactions.",
    accessAreas: ["POS System", "Payment Processing", "Daily Cash Reports", "Basic Customer Info"],
    userCount: 6
  },
  "payroll_admin": {
    icon: Briefcase,
    color: "from-indigo-600 to-purple-600",
    level: 6,
    description: "Specialized payroll processing with access to employee data, salary calculations, and compliance reporting.",
    accessAreas: ["Payroll Processing", "Employee Management", "Tax Calculations", "Compliance Reports"],
    userCount: 4
  },
  "compliance_officer": {
    icon: Shield,
    color: "from-emerald-600 to-green-600",
    level: 7,
    description: "Regulatory compliance specialists with access to audit trails, compliance reports, and regulatory documentation.",
    accessAreas: ["Compliance Monitoring", "Regulatory Reports", "Audit Trails", "Policy Management"],
    userCount: 3
  },
  "employee": {
    icon: Users,
    color: "from-blue-500 to-blue-600",
    level: 2,
    description: "General staff members with basic access to personal information, timesheets, and relevant operational functions.",
    accessAreas: ["Personal Dashboard", "Timesheet Entry", "Basic Reports", "Company Announcements"],
    userCount: 25
  },
  "viewer": {
    icon: Eye,
    color: "from-gray-500 to-slate-600",
    level: 1,
    description: "Limited read-only access for stakeholders, investors, or external parties requiring basic visibility.",
    accessAreas: ["Read-Only Dashboards", "Basic Reports", "Public Information", "Summary Data"],
    userCount: 8
  }
};

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch system roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/rbac/roles"],
  });

  const getRoleIcon = (roleName: string) => {
    const roleKey = roleName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const roleInfo = BUSINESS_ROLE_DESCRIPTIONS[roleKey as keyof typeof BUSINESS_ROLE_DESCRIPTIONS];
    if (roleInfo) {
      const IconComponent = roleInfo.icon;
      return <IconComponent className="h-8 w-8" />;
    }
    return <Shield className="h-8 w-8" />;
  };

  const getRoleDescription = (roleName: string) => {
    const roleKey = roleName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const roleInfo = BUSINESS_ROLE_DESCRIPTIONS[roleKey as keyof typeof BUSINESS_ROLE_DESCRIPTIONS];
    return roleInfo || {
      description: "System role with specific permissions",
      accessAreas: ["Various System Functions"],
      userCount: 0,
      level: 1,
      color: "from-gray-500 to-slate-600"
    };
  };

  const getRoleBadge = (role: any) => {
    if (role.level >= 9) {
      return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Super Admin</Badge>;
    } else if (role.level >= 7) {
      return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">Admin</Badge>;
    } else if (role.level >= 5) {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">Manager</Badge>;
    } else if (role.level >= 3) {
      return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">User</Badge>;
    } else {
      return <Badge variant="secondary">Basic</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-gray-600 mt-2">
            Manage comprehensive business roles and permissions for your organization
          </p>
        </div>
      </div>

      <Tabs defaultValue="business-overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business-overview">Business Role Overview</TabsTrigger>
          <TabsTrigger value="system-management">System Role Management</TabsTrigger>
        </TabsList>

        <TabsContent value="business-overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6" />
                <span>Comprehensive Business Roles</span>
              </CardTitle>
              <CardDescription>
                Overview of all business roles implemented in your organization based on industry best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(BUSINESS_ROLE_DESCRIPTIONS).map(([roleKey, roleInfo]) => (
                  <Card key={roleKey} className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${roleInfo.color}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${roleInfo.color} text-white`}>
                            <roleInfo.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">
                              {roleKey.replace(/_/g, ' ')}
                            </h3>
                            <Badge variant="outline" className="text-xs mt-1">
                              Level {roleInfo.level}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {roleInfo.userCount} users
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {roleInfo.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Access Areas
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {roleInfo.accessAreas.map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>System Roles</span>
              </CardTitle>
              <CardDescription>
                Active system roles and their current configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <div className="text-center py-8">Loading roles...</div>
              ) : roles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No roles found</div>
              ) : (
                <div className="space-y-4">
                  {roles.map((role: any) => (
                    <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            {getRoleIcon(role.name)}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-lg">{role.displayName}</h3>
                          <p className="text-sm text-gray-600">{getRoleDescription(role.name).description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">Level {role.level}</span>
                            <span className="text-xs text-gray-500">
                              {role.permissionsList?.length || 0} permissions
                            </span>
                            <Badge variant={role.isActive ? "default" : "secondary"} className="text-xs">
                              {role.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getRoleBadge(role)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRole(role)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}