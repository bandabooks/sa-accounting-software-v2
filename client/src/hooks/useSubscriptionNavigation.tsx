import { useMemo } from "react";
import { useCompanySubscription } from "@/hooks/useCompanySubscription";

// Feature key mapping for navigation items
const FEATURE_KEYS = {
  // Core modules
  'dashboard': 'dashboard',
  'banking': 'banking',
  'cash-flow-forecasting': 'advanced_reports',
  
  // Sales & Revenue
  'sales-dashboard': 'sales',
  'invoices': 'invoicing',
  'estimates': 'estimates',
  'sales-orders': 'sales',
  'credit-notes': 'sales',
  'customer-payments': 'sales',
  'deliveries': 'sales',
  'customers': 'customer_management',
  'sales-reports': 'sales',
  
  // Purchases & Expenses
  'purchase-dashboard': 'purchases',
  'expenses': 'expenses',
  'bills': 'expenses',
  'purchase-orders': 'purchases',
  'suppliers': 'suppliers',
  'goods-receipts': 'purchases',
  'purchase-requisitions': 'purchases',
  'payment-flows': 'purchases',
  'three-way-matching': 'purchases',
  'recurring-expenses': 'expenses',
  'expense-approvals': 'expenses',
  'exception-dashboard': 'purchases',
  'purchase-reports': 'purchases',
  
  // Accounting
  'chart-of-accounts': 'chart_of_accounts',
  'journal-entries': 'journal_entries',
  'general-ledger': 'chart_of_accounts',
  'fixed-assets': 'chart_of_accounts',
  'bulk-capture': 'chart_of_accounts',
  'budgeting': 'advanced_reports',
  
  // Employee Management
  'employees': 'payroll',
  'employees/payroll': 'payroll',
  'employees/attendance': 'payroll',
  
  // Products & Inventory
  'products': 'products_services',
  'professional-services': 'products_services',
  'inventory': 'inventory',
  'warehouses': 'inventory',
  'product-lots': 'inventory',
  'product-serials': 'inventory',
  'stock-counts': 'inventory',
  'reorder-rules': 'inventory',
  'product-bundles': 'inventory',
  'inventory-reports': 'inventory',
  
  // VAT Management
  'vat-management': 'vat_management',
  'vat-settings': 'vat_management',
  'vat-types': 'vat_management',
  'vat-returns': 'vat_management',
  'emp201': 'vat_management',
  'vat-transaction-analysis': 'vat_management',
  'vat-reports': 'vat_management',
  'vat-preparation': 'vat_management',
  'vat-history': 'vat_management',
  
  // Compliance
  'compliance-dashboard': 'compliance_dashboard',
  'compliance-clients': 'compliance_clients', 
  'cipc-compliance': 'cipc_compliance',
  'labour-compliance': 'labour_compliance',
  'compliance-tasks': 'compliance_tasks',
  'compliance-calendar': 'compliance_calendar',
  'compliance-documents': 'compliance_documents',
  
  // Reports
  'financial-reports': 'financial_reports',
  'business-reports': 'financial_reports',
  'general-reports': 'financial_reports',
  'reports/financial': 'financial_reports',
  
  // Point of Sale
  'pos-dashboard': 'pos_sales',
  'pos-terminal': 'pos_sales',
  'pos-shifts': 'pos_sales',
  'pos-terminals': 'pos_sales',
  
  // Projects & Operations
  'projects': 'projects',
  'tasks': 'projects',
  'time-tracking': 'projects',
  
  // Settings & Admin
  'settings': 'company_settings',
  'enterprise-settings': 'company_settings',
  'user-management': 'user_management',
  'companies': 'user_management',
  'subscription': 'company_settings',
  
  // Integration & Advanced
  'integrations': 'workflow_automation',
  'alerts': 'workflow_automation',
  'ai-monitor': 'workflow_automation'
};

// Upgrade prompts for disabled features
const UPGRADE_PROMPTS = {
  'purchases': {
    title: 'Purchase Management',
    description: 'Upgrade to access advanced purchase management, supplier tracking, and procurement workflows.',
    cta: 'Upgrade to Professional'
  },
  'expenses': {
    title: 'Expense Management', 
    description: 'Unlock powerful expense tracking, approval workflows, and financial controls.',
    cta: 'Upgrade to Professional'
  },
  'inventory': {
    title: 'Inventory Management',
    description: 'Enable comprehensive inventory tracking, warehouse management, and stock optimization.',
    cta: 'Upgrade to Professional'
  },
  'payroll': {
    title: 'Employee & Payroll Management',
    description: 'Access full HR capabilities including payroll processing, attendance tracking, and employee management.',
    cta: 'Upgrade to Professional'
  },
  'compliance_management': {
    title: 'Advanced Compliance',
    description: 'Unlock professional compliance tools for tax practitioners and accounting firms.',
    cta: 'Upgrade to Enterprise'
  },
  'workflow_automation': {
    title: 'Automation & AI',
    description: 'Enable intelligent automation, AI matching, and advanced workflow capabilities.',
    cta: 'Upgrade to Enterprise'
  },
  'advanced_reports': {
    title: 'Advanced Analytics',
    description: 'Access sophisticated reporting, forecasting, and business intelligence tools.',
    cta: 'Upgrade to Professional'
  }
};

export function useSubscriptionNavigation() {
  const { subscription, hasFeature, isLoading } = useCompanySubscription();
  
  // Check if a navigation path is accessible
  const canAccessPath = useMemo(() => {
    return (path: string): boolean => {
      if (isLoading) return false;
      
      // Remove leading slash and extract clean path
      const cleanPath = path.replace(/^\//, '');
      
      // Get feature key for this path
      const featureKey = FEATURE_KEYS[cleanPath];
      
      // If no feature key mapped, allow access (for basic pages)
      if (!featureKey) return true;
      
      // Check if user has access to this feature
      return hasFeature(featureKey);
    };
  }, [hasFeature, isLoading]);
  
  // Get upgrade info for a disabled feature
  const getUpgradeInfo = useMemo(() => {
    return (path: string) => {
      const cleanPath = path.replace(/^\//, '');
      const featureKey = FEATURE_KEYS[cleanPath];
      
      if (!featureKey) return null;
      
      return UPGRADE_PROMPTS[featureKey] || {
        title: 'Premium Feature',
        description: 'This feature requires a plan upgrade to access.',
        cta: 'Upgrade Plan'
      };
    };
  }, []);
  
  // Filter navigation items based on subscription
  const filterNavigationItems = useMemo(() => {
    return (items: any[]): any[] => {
      if (isLoading) return [];
      
      return items.filter(item => {
        // Check if user has access to this navigation item
        return canAccessPath(item.path);
      });
    };
  }, [canAccessPath, isLoading]);
  
  // Check if entire navigation group should be visible
  const isGroupVisible = useMemo(() => {
    return (groupItems: any[]): boolean => {
      if (isLoading) return false;
      
      // Show group if at least one item is accessible
      return groupItems.some(item => canAccessPath(item.path));
    };
  }, [canAccessPath, isLoading]);
  
  return {
    canAccessPath,
    getUpgradeInfo,
    filterNavigationItems,
    isGroupVisible,
    subscription,
    hasFeature,
    isLoading
  };
}

export default useSubscriptionNavigation;