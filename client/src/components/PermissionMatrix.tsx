import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Users, FileText, Package, Calculator, 
  ShoppingCart, Truck, Settings, Shield, Eye,
  CheckCircle, XCircle
} from "lucide-react";

// Define comprehensive module categories
const MODULE_CATEGORIES = {
  "Core System": {
    color: "from-blue-500 to-blue-600",
    modules: [
      { id: 'dashboard', name: 'Dashboard', description: 'Business overview and analytics' },
      { id: 'user_management', name: 'User Management', description: 'User accounts and permissions' },
      { id: 'system_settings', name: 'System Settings', description: 'System configuration' },
      { id: 'audit_logs', name: 'Audit Logs', description: 'System activity tracking' }
    ]
  },
  "Sales & Revenue": {
    color: "from-green-500 to-green-600", 
    modules: [
      { id: 'customers', name: 'Customers', description: 'Customer relationship management' },
      { id: 'invoicing', name: 'Invoicing', description: 'Invoice creation and management' },
      { id: 'estimates', name: 'Estimates', description: 'Quotes and estimates' },
      { id: 'pos_sales', name: 'Point of Sale', description: 'POS terminal and sales' }
    ]
  },
  "Purchases & Expenses": {
    color: "from-orange-500 to-orange-600",
    modules: [
      { id: 'suppliers', name: 'Suppliers', description: 'Supplier management' },
      { id: 'expenses', name: 'Expenses', description: 'Expense tracking and reporting' },
      { id: 'purchase_orders', name: 'Purchase Orders', description: 'Purchase order management' }
    ]
  },
  "Products & Inventory": {
    color: "from-purple-500 to-purple-600",
    modules: [
      { id: 'products_services', name: 'Products & Services', description: 'Product catalog management' },
      { id: 'inventory_management', name: 'Inventory Management', description: 'Stock tracking and control' }
    ]
  },
  "Accounting": {
    color: "from-indigo-500 to-indigo-600",
    modules: [
      { id: 'chart_of_accounts', name: 'Chart of Accounts', description: 'Accounting structure' },
      { id: 'journal_entries', name: 'Journal Entries', description: 'General ledger entries' },
      { id: 'banking', name: 'Banking', description: 'Bank account management' }
    ]
  },
  "Reports": {
    color: "from-cyan-500 to-cyan-600",
    modules: [
      { id: 'financial_reports', name: 'Financial Reports', description: 'Financial reporting and analysis' }
    ]
  },
  "Payroll": {
    color: "from-pink-500 to-pink-600",
    modules: [
      { id: 'payroll', name: 'Payroll', description: 'Employee payroll management' }
    ]
  },
  "Compliance": {
    color: "from-red-500 to-red-600",
    modules: [
      { id: 'vat_management', name: 'VAT Management', description: 'VAT compliance and returns' }
    ]
  }
};

// Standard user roles
const USER_ROLES = [
  { id: 'super_admin', name: 'Super Admin', description: 'Full system access', color: 'bg-red-500' },
  { id: 'company_admin', name: 'Company Admin', description: 'Full company access', color: 'bg-purple-500' },
  { id: 'manager', name: 'Manager', description: 'Management access', color: 'bg-blue-500' },
  { id: 'accountant', name: 'Accountant', description: 'Financial access', color: 'bg-green-500' },
  { id: 'employee', name: 'Employee', description: 'Basic access', color: 'bg-gray-500' }
];

// Permission matrix based on the table provided
const ROLE_PERMISSIONS = {
  company_admin: {
    dashboard: true, sales: true, purchases: true, products: true, 
    accounting: true, pos: true, reports: true, user_management: true, 
    settings: true, compliance: true
  },
  manager: {
    dashboard: true, sales: true, purchases: true, products: true,
    accounting: true, pos: true, reports: true, user_management: false,
    settings: false, compliance: true
  },
  accountant: {
    dashboard: true, sales: false, purchases: true, products: false,
    accounting: true, pos: false, reports: true, user_management: false,
    settings: false, compliance: true
  },
  employee: {
    dashboard: true, sales: false, purchases: false, products: false,
    accounting: false, pos: false, reports: false, user_management: false,
    settings: false, compliance: false
  }
};

interface PermissionMatrixProps {
  modulePermissions: Record<string, Record<string, boolean>>;
  onPermissionChange: (roleId: string, moduleId: string, enabled: boolean) => void;
  isLoading?: boolean;
}

export default function PermissionMatrix({ 
  modulePermissions, 
  onPermissionChange, 
  isLoading = false 
}: PermissionMatrixProps) {
  
  // Map modules to permission categories
  const mapModuleToCategory = (moduleId: string): string => {
    // Core System modules
    if (['dashboard', 'user_management', 'system_settings', 'audit_logs'].includes(moduleId)) {
      return moduleId === 'dashboard' ? 'dashboard' : 
             moduleId === 'user_management' ? 'user_management' : 'settings';
    }
    
    // Sales modules
    if (['customers', 'invoicing', 'estimates', 'pos_sales'].includes(moduleId)) {
      return moduleId === 'pos_sales' ? 'pos' : 'sales';
    }
    
    // Purchase modules  
    if (['suppliers', 'expenses', 'purchase_orders'].includes(moduleId)) {
      return 'purchases';
    }
    
    // Product modules
    if (['products_services', 'inventory_management'].includes(moduleId)) {
      return 'products';
    }
    
    // Accounting modules
    if (['chart_of_accounts', 'journal_entries', 'banking'].includes(moduleId)) {
      return 'accounting';
    }
    
    // Reports
    if (moduleId === 'financial_reports') {
      return 'reports';
    }
    
    // Compliance
    if (moduleId === 'vat_management') {
      return 'compliance';
    }
    
    return 'dashboard'; // Default fallback
  };

  const handlePermissionToggle = (roleId: string, moduleId: string) => {
    const category = mapModuleToCategory(moduleId);
    const currentValue = modulePermissions[roleId]?.[category] || false;
    onPermissionChange(roleId, category, !currentValue);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role-Based Permission Matrix
        </CardTitle>
        <CardDescription>
          Configure module access permissions for each user role using checkboxes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Role</th>
                <th className="text-center p-2 font-semibold">Dashboard</th>
                <th className="text-center p-2 font-semibold">Sales</th>
                <th className="text-center p-2 font-semibold">Purchases</th>
                <th className="text-center p-2 font-semibold">Products</th>
                <th className="text-center p-2 font-semibold">Accounting</th>
                <th className="text-center p-2 font-semibold">POS</th>
                <th className="text-center p-2 font-semibold">Reports</th>
                <th className="text-center p-2 font-semibold">User Management</th>
                <th className="text-center p-2 font-semibold">Settings</th>
                <th className="text-center p-2 font-semibold">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {USER_ROLES.map((role) => (
                <tr key={role.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Dashboard */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.dashboard || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'dashboard', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                  
                  {/* Sales */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.sales || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'sales', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                  
                  {/* Purchases */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.purchases || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'purchases', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                  
                  {/* Products */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.products || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'products', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                  
                  {/* Accounting */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.accounting || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'accounting', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                  
                  {/* POS */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.pos || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'pos', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                  
                  {/* Reports */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.reports || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'reports', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                  
                  {/* User Management */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.user_management || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'user_management', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                  
                  {/* Settings */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.settings || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'settings', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                  
                  {/* Compliance */}
                  <td className="text-center p-2">
                    <Checkbox
                      checked={modulePermissions[role.id]?.compliance || false}
                      onCheckedChange={(checked) => onPermissionChange(role.id, 'compliance', checked as boolean)}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Permission Categories:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div><strong>Dashboard:</strong> Analytics, metrics</div>
            <div><strong>Sales:</strong> Customers, invoicing</div>
            <div><strong>Purchases:</strong> Suppliers, expenses</div>
            <div><strong>Products:</strong> Inventory, catalog</div>
            <div><strong>Accounting:</strong> Charts, journal entries</div>
            <div><strong>POS:</strong> Point of sale operations</div>
            <div><strong>Reports:</strong> Financial reports</div>
            <div><strong>User Mgmt:</strong> User administration</div>
            <div><strong>Settings:</strong> System configuration</div>
            <div><strong>Compliance:</strong> VAT, tax management</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}