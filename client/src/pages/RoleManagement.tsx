import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Plus, 
  Edit,
  Eye,
  Crown,
  Building,
  Settings,
  Check,
  X,
  AlertTriangle,
  Info,
  Calculator,
  FileText,
  UserCheck,
  DollarSign,
  CreditCard,
  Briefcase,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for creating a new role
const createRoleSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters"),
  displayName: z.string().min(3, "Display name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  level: z.number().min(1).max(10),
  permissions: z.array(z.string()),
  isSystemRole: z.boolean(),
  isActive: z.boolean(),
});

type CreateRoleData = z.infer<typeof createRoleSchema>;

interface SystemRole {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
  isSystemRole: boolean;
  isActive: boolean;
  permissionsList: string[];
  userCount?: number;
  createdAt: string;
  updatedAt?: string;
}

interface Permission {
  name: string;
  displayName: string;
  description: string;
  category: string;
}

// Comprehensive Business Roles as per user requirements
const BUSINESS_ROLE_DESCRIPTIONS = {
  "super_admin": {
    icon: Crown,
    color: "bg-red-500",
    title: "Super Admin (Platform Owner)",
    description: "Full access to all companies, billing, subscription, platform settings. Manage global roles, audit logs, system integrations.",
    level: 10,
    accessAreas: ["All Platform Functions", "Multi-Company Access", "Billing Management", "System Configuration"]
  },
  "company_admin": {
    icon: Building,
    color: "bg-blue-500", 
    title: "Company Admin/Owner",
    description: "Full access to all modules and settings for their company. Invite, create, and manage users within their company. Assign roles and permissions to other users. View and control billing for their company.",
    level: 9,
    accessAreas: ["All Company Modules", "User Management", "Role Assignment", "Company Settings", "Billing Control"]
  },
  "accountant": {
    icon: Calculator,
    color: "bg-green-500",
    title: "Accountant",
    description: "Access to core accounting features (invoicing, expenses, bank reconciliation, journals, VAT). Can view, create, and edit financial records. Cannot manage users or company settings (unless permission granted).",
    level: 7,
    accessAreas: ["Invoicing", "Expenses", "Bank Reconciliation", "Journals", "VAT Management", "Financial Reports"]
  },
  "bookkeeper": {
    icon: FileText,
    color: "bg-yellow-500",
    title: "Bookkeeper", 
    description: "Enter day-to-day transactions (sales, expenses, receipts, bills). Access to client, supplier, product, and transaction modules. Limited or no access to reporting and sensitive settings.",
    level: 6,
    accessAreas: ["Daily Transactions", "Client Management", "Supplier Management", "Product Management", "Basic Reporting"]
  },
  "auditor": {
    icon: Eye,
    color: "bg-purple-500",
    title: "Auditor",
    description: "Read-only access to financial data, transactions, and compliance modules. Can run and export reports, view logs, but cannot create or edit records.",
    level: 5,
    accessAreas: ["View Financial Data", "Generate Reports", "Export Data", "View Audit Logs", "Compliance Review"]
  },
  "manager": {
    icon: UserCheck,
    color: "bg-indigo-500",
    title: "Manager/Department Manager",
    description: "Access to relevant business units or departments (sales, inventory, payroll, projects, etc.). Approve transactions, view reports, limited edit rights for their area.",
    level: 6,
    accessAreas: ["Department Management", "Transaction Approval", "Team Reports", "Project Management", "Inventory Control"]
  },
  "sales_representative": {
    icon: DollarSign,
    color: "bg-teal-500",
    title: "Sales Representative",
    description: "Access to sales-related modules including customers, invoices, estimates, products. Limited access to financial reports.",
    level: 4,
    accessAreas: ["Customer Management", "Sales Processing", "Invoice Creation", "Estimates", "Product Catalog", "POS Access"]
  },
  "cashier": {
    icon: CreditCard,
    color: "bg-orange-500",
    title: "Cashier/POS Operator",
    description: "Use the Point of Sale module, process sales, print receipts. No access to back-office functions.",
    level: 3,
    accessAreas: ["POS Operations", "Sales Processing", "Receipt Handling", "Cash Management", "Customer Service"]
  },
  "payroll_admin": {
    icon: Briefcase,
    color: "bg-pink-500",
    title: "Payroll Administrator",
    description: "Access to payroll, employee management, leave, and salary modules. No access to sales or supplier data.",
    level: 6,
    accessAreas: ["Payroll Processing", "Employee Management", "Leave Management", "Salary Administration", "HR Reports"]
  },
  "compliance_officer": {
    icon: Shield,
    color: "bg-cyan-500",
    title: "Compliance Officer/Tax Practitioner",
    description: "Access to compliance modules (SARS, CIPC, Labour, VAT). Submit, track, and download compliance documents and reports.",
    level: 6,
    accessAreas: ["SARS Compliance", "CIPC Management", "Labour Compliance", "VAT Returns", "Tax Documentation"]
  },
  "employee": {
    icon: Users,
    color: "bg-gray-500",
    title: "Employee/Staff/Operator",
    description: "Access to only the modules necessary for their job (e.g., POS, sales entry, timesheets, tasks). Cannot view financial reports or manage company/users.",
    level: 2,
    accessAreas: ["Task Management", "Time Tracking", "Basic POS", "Limited Access", "Job-Specific Modules"]
  },
  "viewer": {
    icon: Eye,
    color: "bg-slate-500",
    title: "Viewer/Read-Only User",
    description: "Can only view data, reports, and dashboards. No editing or management rights.",
    level: 1,
    accessAreas: ["View-Only Access", "Dashboard Viewing", "Report Access", "Data Browsing", "No Edit Rights"]
  }
};

// Available permissions organized by category
const PERMISSION_CATEGORIES = {
  "Dashboard": [
    { name: "dashboard:view", displayName: "View Dashboard", description: "Access to main dashboard" }
  ],
  "User Management": [
    { name: "users:view", displayName: "View Users", description: "View user lists and profiles" },
    { name: "users:create", displayName: "Create Users", description: "Create new user accounts" },
    { name: "users:update", displayName: "Update Users", description: "Edit user information" },
    { name: "users:delete", displayName: "Delete Users", description: "Remove user accounts" },
    { name: "users:assign_roles", displayName: "Assign Roles", description: "Assign roles to users" }
  ],
  "Customer Management": [
    { name: "customers:view", displayName: "View Customers", description: "View customer lists and details" },
    { name: "customers:create", displayName: "Create Customers", description: "Add new customers" },
    { name: "customers:update", displayName: "Update Customers", description: "Edit customer information" },
    { name: "customers:delete", displayName: "Delete Customers", description: "Remove customers" }
  ],
  "Financial Management": [
    { name: "invoices:view", displayName: "View Invoices", description: "Access invoice lists and details" },
    { name: "invoices:create", displayName: "Create Invoices", description: "Generate new invoices" },
    { name: "invoices:update", displayName: "Update Invoices", description: "Edit invoice information" },
    { name: "invoices:delete", displayName: "Delete Invoices", description: "Remove invoices" },
    { name: "invoices:send", displayName: "Send Invoices", description: "Email invoices to customers" },
    { name: "invoices:approve", displayName: "Approve Invoices", description: "Approve invoices for sending" },
    { name: "financial:view", displayName: "View Financial Reports", description: "Access financial reports" },
    { name: "financial:export", displayName: "Export Financial Data", description: "Export financial information" }
  ],
  "POS Management": [
    { name: "pos:view", displayName: "View POS", description: "Access POS system" },
    { name: "pos:process_sales", displayName: "Process Sales", description: "Process POS transactions" },
    { name: "pos:handle_returns", displayName: "Handle Returns", description: "Process POS returns" },
    { name: "pos:cash_management", displayName: "Cash Management", description: "Manage cash drawer operations" },
    { name: "pos:manage_shifts", displayName: "Manage Shifts", description: "Open/close POS shifts" },
    { name: "pos:manage_terminals", displayName: "Manage Terminals", description: "Configure POS terminals" },
    { name: "pos:view_reports", displayName: "View POS Reports", description: "Access POS reporting" }
  ],
  "System Administration": [
    { name: "roles:view", displayName: "View Roles", description: "View system roles" },
    { name: "roles:create", displayName: "Create Roles", description: "Create new roles" },
    { name: "roles:update", displayName: "Update Roles", description: "Edit existing roles" },
    { name: "permissions:grant", displayName: "Grant Permissions", description: "Grant permissions to users/roles" },
    { name: "permissions:revoke", displayName: "Revoke Permissions", description: "Remove permissions from users/roles" },
    { name: "settings:view", displayName: "View Settings", description: "Access system settings" },
    { name: "settings:update", displayName: "Update Settings", description: "Modify system configuration" },
    { name: "audit:view", displayName: "View Audit Logs", description: "Access audit trail information" }
  ]
};

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all system roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery<SystemRole[]>({
    queryKey: ["/api/rbac/system-roles"],
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleData) => {
      return apiRequest("/api/rbac/roles", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/system-roles"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Role created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleData & { id: number }) => {
      return apiRequest(`/api/rbac/roles/${data.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/system-roles"] });
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateRoleData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      level: 5,
      permissions: [],
      isSystemRole: false,
      isActive: true,
    },
  });

  const editForm = useForm<CreateRoleData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      level: 5,
      permissions: [],
      isSystemRole: false,
      isActive: true,
    },
  });

  const onCreateRole = (data: CreateRoleData) => {
    createRoleMutation.mutate(data);
  };

  const onUpdateRole = (data: CreateRoleData) => {
    if (!selectedRole) return;
    updateRoleMutation.mutate({ ...data, id: selectedRole.id });
  };

  const handleEditRole = (role: SystemRole) => {
    setSelectedRole(role);
    editForm.reset({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      permissions: role.permissionsList || [],
      isSystemRole: role.isSystemRole,
      isActive: role.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const getRoleBadge = (role: SystemRole) => {
    if (role.name === 'super_admin') {
      return (
        <Badge variant="destructive" className="flex items-center">
          <Crown className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      );
    }
    if (role.name === 'company_admin') {
      return (
        <Badge variant="default" className="flex items-center">
          <Building className="h-3 w-3 mr-1" />
          Company Admin
        </Badge>
      );
    }
    if (role.isSystemRole) {
      return (
        <Badge variant="secondary" className="flex items-center">
          <Shield className="h-3 w-3 mr-1" />
          System Role
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center">
        <Settings className="h-3 w-3 mr-1" />
        Custom Role
      </Badge>
    );
  };

  const getAllPermissions = () => {
    const allPermissions: Permission[] = [];
    Object.entries(PERMISSION_CATEGORIES).forEach(([category, permissions]) => {
      permissions.forEach(permission => {
        allPermissions.push({ ...permission, category });
      });
    });
    return allPermissions;
  };

  // Render business role overview cards
  const renderBusinessRoleOverview = () => {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold mb-2">Comprehensive Business Role System</h2>
          <p className="text-gray-600">Professional role hierarchy designed for accounting and business management platforms</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(BUSINESS_ROLE_DESCRIPTIONS).map(([roleKey, roleInfo]) => {
            const IconComponent = roleInfo.icon;
            const existingRole = systemRoles?.find((r: SystemRole) => r.name === roleKey);
            
            return (
              <Card key={roleKey} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${roleInfo.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${roleInfo.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{roleInfo.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Level {roleInfo.level}
                          </Badge>
                          {existingRole && (
                            <Badge variant="outline" className="text-xs">
                              {existingRole.userCount || 0} users
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {roleInfo.description}
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700">Key Access Areas:</div>
                    <div className="flex flex-wrap gap-1">
                      {roleInfo.accessAreas.slice(0, 3).map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {roleInfo.accessAreas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{roleInfo.accessAreas.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  {existingRole && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-green-600">
                          <Check className="h-3 w-3" />
                          <span>Active</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditRole(existingRole)}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                  {!existingRole && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <X className="h-3 w-3" />
                          <span>Not Created</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            form.reset({
                              name: roleKey,
                              displayName: roleInfo.title,
                              description: roleInfo.description,
                              level: roleInfo.level,
                              permissions: [],
                              isSystemRole: true,
                              isActive: true,
                            });
                            setIsCreateDialogOpen(true);
                          }}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-gray-600">Create and manage system roles with granular permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions and access levels.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateRole)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="role_name_lowercase" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                          />
                        </FormControl>
                        <FormDescription>
                          Internal name for the role (lowercase, underscores)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Role Display Name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Human-readable name shown in interface
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this role can do and its purpose..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Level (1-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Higher levels have more authority
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isSystemRole"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>System Role</FormLabel>
                          <FormDescription>
                            Applies across all companies
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Role can be assigned to users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <FormDescription>
                        Select the permissions this role should have
                      </FormDescription>
                      <div className="space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                        {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                          <div key={category}>
                            <h4 className="font-medium text-sm text-gray-900 mb-2">{category}</h4>
                            <div className="grid grid-cols-1 gap-2 ml-4">
                              {permissions.map((permission) => (
                                <label key={permission.name} className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={field.value.includes(permission.name)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        field.onChange([...field.value, permission.name]);
                                      } else {
                                        field.onChange(field.value.filter(p => p !== permission.name));
                                      }
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <span className="font-medium">{permission.displayName}</span>
                                  <span className="text-gray-500">- {permission.description}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRoleMutation.isPending}>
                    Create Role
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>System Roles</span>
              </CardTitle>
              <CardDescription>
                Manage role definitions and their associated permissions
              </CardDescription>
            </CardHeader>
        <CardContent>
          {rolesLoading ? (
            <div className="text-center py-8">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No roles found</div>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{role.displayName}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                      <p className="text-xs text-gray-500">Level {role.level} • {role.permissionsList?.length || 0} permissions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getRoleBadge(role)}
                    <div className="flex items-center space-x-1">
                      <Badge variant={role.isActive ? "default" : "secondary"}>
                        {role.isActive ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRole(role)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!role.isSystemRole && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </CardContent>
          </Card>

      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Role Details: {selectedRole.displayName}</span>
            </CardTitle>
            <CardDescription>
              Complete information about {selectedRole.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Role Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedRole.name}</div>
                  <div><strong>Display Name:</strong> {selectedRole.displayName}</div>
                  <div><strong>Description:</strong> {selectedRole.description}</div>
                  <div><strong>Level:</strong> {selectedRole.level}</div>
                  <div><strong>Type:</strong> {selectedRole.isSystemRole ? "System Role" : "Custom Role"}</div>
                  <div><strong>Status:</strong> {selectedRole.isActive ? "Active" : "Inactive"}</div>
                  <div><strong>Users:</strong> {selectedRole.userCount || 0} assigned</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Permissions ({selectedRole.permissionsList?.length || 0})</h4>
                <div className="max-h-60 overflow-y-auto">
                  {selectedRole.permissionsList && selectedRole.permissionsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedRole.permissionsList.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace(/[_:]/g, ' ').toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No permissions assigned</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Role Dialog */}
      {selectedRole && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role: {selectedRole.displayName}</DialogTitle>
              <DialogDescription>
                Modify role settings and permissions.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onUpdateRole)} className="space-y-4">
                {/* Similar form fields as create dialog, but using editForm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Role Display Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Level (1-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Role can be assigned to users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateRoleMutation.isPending}>
                    Update Role
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}