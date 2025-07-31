import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Search, 
  Shield, 
  Users, 
  Eye, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  ChevronDown,
  ChevronRight,
  Save,
  Download,
  Info,
  ToggleLeft,
  ToggleRight,
  Lock,
  ShoppingCart,
  Package,
  DollarSign,
  FileText,
  BarChart3,
  Clipboard,
  CreditCard,
  Building2,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
  isSystemRole: boolean;
  userCount?: number;
}

interface Module {
  id: string;
  name: string;
  displayName: string;
  icon: React.ComponentType<any>;
  category: string;
  permissions: string[];
}

interface Permission {
  roleId: number;
  moduleId: string;
  permissionType: string;
  enabled: boolean;
}

const MODULES: Module[] = [
  { id: 'sales', name: 'Sales', displayName: 'Sales Management', icon: ShoppingCart, category: 'core', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'purchases', name: 'Purchases', displayName: 'Purchase Management', icon: Package, category: 'core', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'products', name: 'Products', displayName: 'Product Catalog', icon: Package, category: 'core', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'inventory', name: 'Inventory', displayName: 'Inventory Management', icon: Package, category: 'core', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'accounting', name: 'Accounting', displayName: 'General Ledger', icon: DollarSign, category: 'financial', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'reports', name: 'Reports', displayName: 'Financial Reports', icon: BarChart3, category: 'financial', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'pos', name: 'POS', displayName: 'Point of Sale', icon: CreditCard, category: 'sales', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'compliance', name: 'Compliance', displayName: 'Compliance Management', icon: Clipboard, category: 'compliance', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'users', name: 'Users', displayName: 'User Management', icon: Users, category: 'admin', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'settings', name: 'Settings', displayName: 'System Settings', icon: Settings, category: 'admin', permissions: ['view', 'create', 'edit', 'delete', 'manage'] },
];

const PERMISSION_TYPES = [
  { key: 'view', label: 'View', description: 'View and read data', icon: Eye },
  { key: 'create', label: 'Create', description: 'Create new records', icon: Plus },
  { key: 'edit', label: 'Edit', description: 'Modify existing records', icon: Edit },
  { key: 'delete', label: 'Delete', description: 'Remove existing records', icon: Trash2 },
  { key: 'manage', label: 'Manage', description: 'Full administrative control', icon: UserCheck },
];

export default function ModernPermissionsInterface() {
  const { toast } = useToast();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
  const [exportLoading, setExportLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/rbac/system-roles'],
  });

  // Fetch permissions matrix - always fetch, not just when role selected
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/permissions/matrix'],
    // Remove the enabled condition to always fetch permissions
  });

  // Clear pending changes when role changes
  React.useEffect(() => {
    setPendingChanges(new Map());
  }, [selectedRoleId]);

  // Debug permissions data structure
  React.useEffect(() => {
    if (permissionsData) {
      console.log('=== PERMISSIONS DATA STRUCTURE ===');
      console.log('Full data:', permissionsData);
      if (permissionsData.roles) {
        permissionsData.roles.forEach((role: any) => {
          console.log(`Role ${role.id} (${role.name}):`, role.permissions);
          console.log(`Role ${role.id} permissions type:`, typeof role.permissions);
          if (role.permissions && typeof role.permissions === 'string') {
            try {
              const parsed = JSON.parse(role.permissions);
              console.log(`Role ${role.id} parsed permissions:`, parsed);
            } catch (e) {
              console.log(`Role ${role.id} permission parse error:`, e);
            }
          } else if (role.permissions && typeof role.permissions === 'object') {
            console.log(`Role ${role.id} permissions as object:`, role.permissions);
            console.log(`Role ${role.id} permissions keys:`, Object.keys(role.permissions));
          }
        });
      }
      console.log('=== END PERMISSIONS DEBUG ===');
    }
  }, [permissionsData, selectedRoleId]);

  // Permission toggle mutation
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ roleId, moduleId, permissionType, enabled }: {
      roleId: number;
      moduleId: string;
      permissionType: string;
      enabled: boolean;
    }) => {
      const token = localStorage.getItem('authToken');
      const sessionToken = localStorage.getItem('sessionToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (sessionToken) {
        headers['X-Session-Token'] = sessionToken;
      }
      
      const response = await fetch('/api/permissions/toggle', {
        method: 'POST',
        headers,
        body: JSON.stringify({ roleId, moduleId, permissionType, enabled }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update permission: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Permission Saved",
        description: data.message || "Permission updated successfully",
        duration: 3000,
      });
      
      // Invalidate and refetch the permissions matrix immediately
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/matrix'] });
      queryClient.refetchQueries({ queryKey: ['/api/permissions/matrix'] });
      
      // Clear pending changes after data refresh
      setTimeout(() => {
        const key = `${data.roleId || selectedRoleId}-${data.moduleId}-${data.permissionType}`;
        setPendingChanges(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      }, 100);
    },
    onError: (error: any) => {
      console.error('Permission save error:', error);
      toast({
        title: "❌ Save Failed",
        description: error.message || "Failed to save permission - please try again",
        variant: "destructive",
        duration: 5000,
      });
      
      // Clear pending changes on error so UI shows correct state
      const key = `${selectedRoleId}-${error.moduleId || 'unknown'}-${error.permissionType || 'unknown'}`;
      setPendingChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    },
  });

  // Export permissions functionality
  const handleExportPermissions = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/permissions/export', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }),
          ...(localStorage.getItem('sessionToken') && {
            'X-Session-Token': localStorage.getItem('sessionToken')
          })
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Export response error:', errorData);
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }
      
      // Create and download the HTML file for PDF conversion
      const htmlData = await response.text();
      const blob = new Blob([htmlData], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `permissions-export-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Permissions report has been exported (open in browser and print to PDF)",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export permissions data",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // View audit log functionality
  const handleViewAuditLog = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-Session-Token': localStorage.getItem('sessionToken') || '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      
      const logs = await response.json();
      setAuditLogs(logs);
      setShowAuditModal(true);
    } catch (error) {
      toast({
        title: "Failed to Load Audit Logs",
        description: "Could not retrieve audit log data",
        variant: "destructive",
      });
    }
  };

  const selectedRole = (roles as Role[]).find((role: Role) => role.id === selectedRoleId);
  const filteredModules = MODULES.filter(module => 
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const isPermissionEnabled = (moduleId: string, permissionType: string): boolean => {
    const key = `${selectedRoleId}-${moduleId}-${permissionType}`;
    
    // Check pending changes first
    if (pendingChanges.has(key)) {
      return pendingChanges.get(key)!;
    }
    
    // Super admin always has all permissions
    if (selectedRole?.name === 'super_admin') {
      return true;
    }
    
    // Check from server data
    if (permissionsData?.roles && selectedRoleId) {
      const role = permissionsData.roles.find((r: any) => r.id === selectedRoleId);
      if (role?.permissions) {
        let permissions = role.permissions;
        
        // Handle JSON string permissions (from database)
        if (typeof permissions === 'string') {
          try {
            permissions = JSON.parse(permissions);
          } catch (e) {
            console.warn('Failed to parse permissions JSON:', permissions);
            return false;
          }
        }
        
        // Handle array permissions (current format)
        if (Array.isArray(permissions)) {
          const permissionKey = `${moduleId}:${permissionType}`;
          const result = permissions.includes(permissionKey);
          console.log(`✓ Array permission check: ${permissionKey} = ${result}`);
          return result;
        }
        
        // Handle object permissions (fallback format)
        if (typeof permissions === 'object' && permissions !== null) {
          const modulePermissions = permissions[moduleId];
          if (modulePermissions && typeof modulePermissions === 'object') {
            const result = modulePermissions[permissionType] === true;
            console.log(`✓ Object permission check: ${moduleId}:${permissionType} = ${result}`);
            return result;
          }
        }
      }
    }
    
    // Default to false
    return false;
  };

  const togglePermission = (moduleId: string, permissionType: string) => {
    if (!selectedRoleId) return;
    
    // Prevent editing Super Admin role
    if (selectedRole?.name === 'super_admin') {
      toast({
        title: "Protected Role",
        description: "Super Admin permissions cannot be modified",
        variant: "destructive",
      });
      return;
    }

    const currentValue = isPermissionEnabled(moduleId, permissionType);
    const newValue = !currentValue;
    
    // Update local state for immediate feedback
    const key = `${selectedRoleId}-${moduleId}-${permissionType}`;
    setPendingChanges(prev => new Map(prev.set(key, newValue)));

    // Call API
    togglePermissionMutation.mutate({
      roleId: selectedRoleId,
      moduleId,
      permissionType,
      enabled: newValue,
    });
  };

  const enableAllForModule = (moduleId: string) => {
    if (!selectedRoleId || selectedRole?.name === 'super_admin') return;
    
    PERMISSION_TYPES.forEach(permission => {
      const key = `${selectedRoleId}-${moduleId}-${permission.key}`;
      setPendingChanges(prev => new Map(prev.set(key, true)));
      
      togglePermissionMutation.mutate({
        roleId: selectedRoleId,
        moduleId,
        permissionType: permission.key,
        enabled: true,
      });
    });
  };

  const disableAllForModule = (moduleId: string) => {
    if (!selectedRoleId || selectedRole?.name === 'super_admin') return;
    
    PERMISSION_TYPES.forEach(permission => {
      const key = `${selectedRoleId}-${moduleId}-${permission.key}`;
      setPendingChanges(prev => new Map(prev.set(key, false)));
      
      togglePermissionMutation.mutate({
        roleId: selectedRoleId,
        moduleId,
        permissionType: permission.key,
        enabled: false,
      });
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Modern Permissions Management</h2>
            <p className="text-muted-foreground">Configure role-based module permissions with dropdown selection and real-time feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('authToken');
                  const sessionToken = localStorage.getItem('sessionToken');
                  
                  const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                  };
                  
                  if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                  }
                  
                  if (sessionToken) {
                    headers['X-Session-Token'] = sessionToken;
                  }
                  
                  const response = await fetch('/api/admin/initialize-default-modules', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({}),
                    credentials: 'include',
                  });
                  
                  if (!response.ok) {
                    throw new Error(`Failed to initialize permissions: ${response.statusText}`);
                  }
                  
                  const result = await response.json();
                  
                  if (result.success) {
                    // Show prominent success notification using toast but with better positioning
                    toast({
                      title: "✅ Success!",
                      description: "Default module access initialized for all users successfully",
                      duration: 5000,
                      className: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-green-50 border-green-200 text-green-800",
                    });
                    
                    // Refresh the permissions data
                    queryClient.invalidateQueries({ queryKey: ['/api/permissions/matrix'] });
                  }
                } catch (error: any) {
                  console.error('Initialize permissions error:', error);
                  toast({
                    title: "Error", 
                    description: error.message || "Failed to initialize default modules",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Initialize Default Permissions
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportPermissions}
              disabled={exportLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportLoading ? 'Exporting...' : 'Export'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewAuditLog}
            >
              <Info className="h-4 w-4 mr-2" />
              Audit Log
            </Button>
          </div>
        </div>

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Role to Configure</label>
                <Select 
                  value={selectedRoleId?.toString() || ""} 
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    setSelectedRoleId(id);
                    
                    // Clear pending changes when switching roles
                    setPendingChanges(new Map());
                    
                    // Clear expanded modules when switching roles for fresh view
                    setExpandedModules(new Set());
                    
                    // Force refetch permissions for the new role
                    queryClient.invalidateQueries({ queryKey: ['/api/permissions/matrix'] });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: Role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Badge variant={role.name === 'super_admin' ? 'destructive' : 'secondary'}>
                            Level {role.level}
                          </Badge>
                          {role.displayName}
                          {role.name === 'super_admin' && <Lock className="h-3 w-3" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRole && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">{selectedRole.displayName}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{selectedRole.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Level: {selectedRole.level}</span>
                    <span>Users: {selectedRole.userCount || 0}</span>
                    {selectedRole.name === 'super_admin' && (
                      <Badge variant="destructive" className="text-xs">Protected</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedRoleId && (
          <>
            {/* Module Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Module Icons Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  System Modules
                  <Badge variant="secondary">{filteredModules.length} modules</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
                  {filteredModules.map((module) => {
                    const IconComponent = module.icon;
                    const isExpanded = expandedModules.has(module.id);
                    return (
                      <Tooltip key={module.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isExpanded ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleModule(module.id)}
                            className="h-16 w-full flex flex-col items-center gap-1 p-2"
                          >
                            <IconComponent className="h-5 w-5" />
                            <span className="text-xs font-medium truncate w-full">{module.name}</span>
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{module.displayName}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Expanded Module Permissions */}
            {Array.from(expandedModules).filter(moduleId => 
              filteredModules.some(m => m.id === moduleId)
            ).map((moduleId) => {
              const module = MODULES.find(m => m.id === moduleId);
              if (!module) return null;

              const IconComponent = module.icon;
              
              return (
                <Card key={moduleId} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {module.displayName}
                        <Badge variant="outline">{module.category}</Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => enableAllForModule(moduleId)}
                          disabled={selectedRole?.name === 'super_admin'}
                        >
                          Enable All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disableAllForModule(moduleId)}
                          disabled={selectedRole?.name === 'super_admin'}
                        >
                          Disable All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModule(moduleId)}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {PERMISSION_TYPES.map((permission) => {
                        const isEnabled = isPermissionEnabled(moduleId, permission.key);
                        const PermissionIcon = permission.icon;
                        const isProtected = selectedRole?.name === 'super_admin';
                        
                        return (
                          <div
                            key={permission.key}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                          >
                            <div className="flex items-center gap-2">
                              <PermissionIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{permission.label}</div>
                                <div className="text-xs text-muted-foreground">{permission.description}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isProtected && <Lock className="h-3 w-3 text-muted-foreground" />}
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() => togglePermission(moduleId, permission.key)}
                                disabled={isProtected}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Permission Types Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Permission Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {PERMISSION_TYPES.map((permission) => {
                    const IconComponent = permission.icon;
                    return (
                      <div key={permission.key} className="flex items-center gap-2 p-2 border rounded">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{permission.label}</div>
                          <div className="text-xs text-muted-foreground">{permission.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Audit Log Modal */}
      <Dialog open={showAuditModal} onOpenChange={setShowAuditModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log - Permissions Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit log entries found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="font-medium">{log.userName || 'System'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.timestamp || log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-2">{log.resource} - {log.details || 'No details'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}