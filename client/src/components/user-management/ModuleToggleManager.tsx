import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { apiRequest } from "@/lib/queryClient";
import {
  Settings,
  Users,
  FileText,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  Calculator,
  Banknote,
  Receipt,
  Briefcase,
  Shield,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock
} from "lucide-react";

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  dependencies: string[];
  isActive: boolean;
  isAvailable: boolean;
  requiredPlan: string;
  permissions: string[];
}

interface ModuleToggleManagerProps {
  companyId?: number;
  subscriptionPlan?: string;
  className?: string;
}

export default function ModuleToggleManager({ 
  companyId, 
  subscriptionPlan = 'basic',
  className = ""
}: ModuleToggleManagerProps) {
  const [processingModules, setProcessingModules] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { showSuccess } = useSuccessModal();

  // Fetch current module configuration  
  const { data: moduleConfig, isLoading } = useQuery({
    queryKey: ['/api/modules/configuration', companyId],
    enabled: !!companyId
  });

  // Mock module configuration data (replace with real API data)
  const mockModules: ModuleConfig[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Main business overview and analytics dashboard',
      icon: BarChart3,
      category: 'Core',
      dependencies: [],
      isActive: true,
      isAvailable: true,
      requiredPlan: 'basic',
      permissions: ['dashboard:view']
    },
    {
      id: 'invoices',
      name: 'Invoicing',
      description: 'Create and manage customer invoices',
      icon: FileText,
      category: 'Sales',
      dependencies: ['customers'],
      isActive: true,
      isAvailable: true,
      requiredPlan: 'basic',
      permissions: ['invoices:create', 'invoices:edit', 'invoices:view']
    },
    {
      id: 'customers',
      name: 'Customer Management',
      description: 'Manage customer database and relationships',
      icon: Users,
      category: 'Sales',
      dependencies: [],
      isActive: true,
      isAvailable: true,
      requiredPlan: 'basic',
      permissions: ['customers:create', 'customers:edit', 'customers:view']
    },
    {
      id: 'expenses',
      name: 'Expense Management',
      description: 'Track and manage business expenses',
      icon: DollarSign,
      category: 'Financial',
      dependencies: [],
      isActive: true,
      isAvailable: true,
      requiredPlan: 'basic',
      permissions: ['expenses:create', 'expenses:edit', 'expenses:view']
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      description: 'Track stock levels and manage inventory',
      icon: Package,
      category: 'Operations',
      dependencies: ['products'],
      isActive: false,
      isAvailable: true,
      requiredPlan: 'professional',
      permissions: ['inventory:create', 'inventory:edit', 'inventory:view']
    },
    {
      id: 'pos',
      name: 'Point of Sale',
      description: 'Complete POS system for retail operations',
      icon: ShoppingCart,
      category: 'Operations',
      dependencies: ['products', 'customers', 'inventory'],
      isActive: false,
      isAvailable: true,
      requiredPlan: 'enterprise',
      permissions: ['pos:create', 'pos:manage', 'pos:view']
    },
    {
      id: 'payroll',
      name: 'Payroll Management',
      description: 'Employee payroll and benefits management',
      icon: Calculator,
      category: 'HR',
      dependencies: ['chart_of_accounts'],
      isActive: false,
      isAvailable: true,
      requiredPlan: 'professional',
      permissions: ['payroll:create', 'payroll:edit', 'payroll:view']
    },
    {
      id: 'vat',
      name: 'VAT Management',
      description: 'South African VAT compliance and reporting',
      icon: Receipt,
      category: 'Compliance',
      dependencies: [],
      isActive: false,
      isAvailable: true,
      requiredPlan: 'professional',
      permissions: ['vat:create', 'vat:edit', 'vat:view']
    }
  ];

  const modules = moduleConfig || mockModules;

  // Group modules by category
  const modulesByCategory = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleConfig[]>);

  // Toggle module activation
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ moduleId, isActive }: { moduleId: string; isActive: boolean }) => {
      return apiRequest(`/api/modules/${moduleId}/toggle`, {
        method: 'POST',
        body: { companyId, isActive }
      });
    },
    onMutate: ({ moduleId }) => {
      setProcessingModules(prev => new Set(prev).add(moduleId));
    },
    onSuccess: (data, { moduleId, isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/modules/configuration'] });
      showSuccess(
        'Module Updated',
        `${modules.find(m => m.id === moduleId)?.name} has been ${isActive ? 'activated' : 'deactivated'} successfully.`
      );
    },
    onError: (error, { moduleId }) => {
      console.error('Failed to toggle module:', error);
    },
    onSettled: (data, error, { moduleId }) => {
      setProcessingModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
    }
  });

  const handleModuleToggle = (moduleId: string, newState: boolean) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    // Always allow toggle for testing - remove availability restrictions temporarily
    console.log(`Toggling module ${moduleId} from ${module.isActive} to ${newState}`);

    // Check dependencies if activating
    if (newState) {
      const missingDependencies = module.dependencies.filter(depId => {
        const depModule = modules.find(m => m.id === depId);
        return !depModule?.isActive;
      });

      if (missingDependencies.length > 0) {
        console.log(`Auto-activating dependencies: ${missingDependencies.join(', ')}`);
        // Auto-activate dependencies
        missingDependencies.forEach(depId => {
          toggleModuleMutation.mutate({ moduleId: depId, isActive: true });
        });
      }
    }

    // Proceed with the toggle
    toggleModuleMutation.mutate({ moduleId, isActive: newState });
  };

  const getModuleStatusBadge = (module: ModuleConfig) => {
    if (!module.isAvailable) {
      return <Badge variant="secondary" className="flex items-center space-x-1">
        <Lock className="h-3 w-3" />
        <span>Requires {module.requiredPlan}</span>
      </Badge>;
    }
    
    if (module.isActive) {
      return <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3" />
        <span>Active</span>
      </Badge>;
    }
    
    return <Badge variant="outline" className="flex items-center space-x-1">
      <AlertTriangle className="h-3 w-3" />
      <span>Inactive</span>
    </Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{category} Modules</span>
              <Badge variant="outline">
                {categoryModules.filter(m => m.isActive).length} / {categoryModules.length} Active
              </Badge>
            </CardTitle>
            <CardDescription>
              Manage {category.toLowerCase()} modules and features for your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryModules.map((module) => (
              <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <module.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{module.name}</h4>
                      {getModuleStatusBadge(module)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                    
                    {module.dependencies.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <span>Requires:</span>
                        {module.dependencies.map(depId => {
                          const depModule = modules.find(m => m.id === depId);
                          return (
                            <Badge key={depId} variant="outline" className="text-xs">
                              {depModule?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">Permissions:</p>
                          {module.permissions.map(permission => (
                            <p key={permission} className="text-xs">{permission}</p>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Switch
                    checked={module.isActive}
                    onCheckedChange={(checked) => handleModuleToggle(module.id, checked)}
                    disabled={!module.isAvailable || processingModules.has(module.id)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Plan Information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Current Plan: {subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)}</strong>
          <br />
          Some modules may require a higher subscription plan. Contact support to upgrade your plan for access to advanced features.
        </AlertDescription>
      </Alert>
    </div>
  );
}