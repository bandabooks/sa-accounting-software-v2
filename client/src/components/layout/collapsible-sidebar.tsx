import { Link, useLocation } from "wouter";
import React, { useState, useRef, useEffect } from "react";
import { 
  Calculator, ChartLine, FileText, Users, ShoppingCart, BarChart3, Receipt, 
  Settings, TrendingUp, Package, Building, Archive, Building2, BookOpen, 
  Landmark, BookOpenCheck, ReceiptText, ChevronDown, ChevronRight, 
  DollarSign, CreditCard, Box, Truck, PieChart, CheckCircle, Shield,
  Briefcase, FolderOpen, CheckSquare, Clock, Brain, UserCog, Key,
  Lock, ToggleLeft, Upload, Terminal, Zap, MessageCircle, PackageCheck, Mail, FileCheck, Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanySubscription } from "@/hooks/useCompanySubscription";
import { useSubscriptionNavigation } from "@/hooks/useSubscriptionNavigation";
import { UpgradePrompt } from "@/components/navigation/UpgradePrompt";

interface SidebarProps {
  isCollapsed?: boolean;
}

export default function CollapsibleSidebar({ isCollapsed = false }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { isModuleAvailable, currentPlan, subscription, planStatus, isSuperAdminOrOwner } = useCompanySubscription();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const navigationGroups = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: ChartLine,
      path: "/dashboard"
    },
    {
      id: "banking",
      label: "Banking",
      icon: Landmark,
      path: "/banking"
    },
    {
      id: "sales",
      label: "Sales",
      icon: DollarSign,
      items: [
        { path: "/invoices", label: "Invoices", icon: Receipt },
        { path: "/estimates", label: "Estimates", icon: FileText },
        { path: "/customers", label: "Customers", icon: Users }
      ]
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: Receipt,
      items: [
        { path: "/expenses", label: "Expenses", icon: Receipt },
        { path: "/suppliers", label: "Suppliers", icon: Building }
      ]
    },
    {
      id: "accounting",
      label: "Accounting",
      icon: Calculator,
      items: [
        { path: "/chart-of-accounts", label: "Chart of Accounts", icon: BookOpen },
        { path: "/journal-entries", label: "Journal Entries", icon: BookOpenCheck },
        { path: "/general-ledger", label: "General Ledger", icon: BookOpen },
        { path: "/bulk-capture", label: "Bulk Data Entry", icon: Upload }
      ]
    },
    {
      id: "vat",
      label: "VAT",
      icon: FileCheck,
      items: [
        { path: "/vat-management", label: "VAT Management", icon: FileCheck },
        { path: "/sars-integration", label: "SARS Integration", icon: Shield }
      ]
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      items: [
        { path: "/balance-sheet", label: "Balance Sheet", icon: PieChart },
        { path: "/profit-loss", label: "Profit & Loss", icon: TrendingUp }
      ]
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings"
    }
  ];

  const toggleGroup = (groupId: string) => {
    if (!isCollapsed) {
      setExpandedGroup(prev => prev === groupId ? null : groupId);
    }
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-72'} bg-gradient-to-b from-slate-50 via-white to-slate-50 shadow-2xl border-r border-slate-200/60 fixed h-full z-30 hidden lg:flex lg:flex-col backdrop-blur-sm transition-all duration-300`}>
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg flex-shrink-0">
              <Calculator className="text-white" size={24} />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">Taxnify</h1>
                <p className="text-blue-100 text-sm font-medium">Business & Compliance</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-1">
        {navigationGroups.map((group) => {
          const isActive = location === group.path || group.items?.some(item => location.startsWith(item.path));
          const isExpanded = expandedGroup === group.id;
          
          if (group.path && !group.items) {
            // Single item (no dropdown)
            const Icon = group.icon;
            return (
              <Link
                key={group.id}
                href={group.path}
                title={isCollapsed ? group.label : undefined}
                className={`group relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} px-4 py-3 text-slate-700 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-blue-500/25" 
                    : "hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 hover:text-green-800 hover:shadow-md"
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? "bg-white/20 shadow-md" 
                    : "bg-slate-100 group-hover:bg-white group-hover:shadow-sm"
                }`}>
                  <Icon size={18} className={isActive ? "text-white" : "text-slate-600 group-hover:text-slate-700"} />
                </div>
                {!isCollapsed && <span className="font-semibold tracking-tight">{group.label}</span>}
              </Link>
            );
          }
          
          // Group with dropdown
          return (
            <div key={group.id} className="mb-1">
              <button
                onClick={() => toggleGroup(group.id)}
                title={isCollapsed ? group.label : undefined}
                className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap transform hover:scale-[1.01] ${
                  isActive || isExpanded
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-blue-500/25" 
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 hover:text-green-800 hover:shadow-sm"
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                  <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                    isActive || isExpanded
                      ? "bg-white/20 shadow-md text-white" 
                      : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-600"
                  }`}>
                    {group.icon && <group.icon size={16} />}
                  </div>
                  {!isCollapsed && <span className="tracking-tight">{group.label}</span>}
                </div>
                {!isCollapsed && (
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${
                    isActive || isExpanded ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                    <ChevronDown size={16} />
                  </div>
                )}
              </button>
              
              {!isCollapsed && isExpanded && group.items && (
                <div className="ml-6 mt-2 space-y-1 rounded-lg p-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const itemIsActive = location.startsWith(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`group relative flex items-center space-x-3 px-3 py-2 text-xs rounded-md transition-all duration-200 border-l-3 ${
                          itemIsActive 
                            ? "bg-blue-100 text-blue-900 border-l-blue-500 shadow-sm font-semibold" 
                            : "bg-green-50 text-slate-700 hover:bg-amber-50 hover:text-amber-900 hover:border-l-amber-300 border-l-transparent hover:shadow-sm border border-green-200"
                        }`}
                      >
                        <div className={`p-1 rounded transition-all duration-200 ${
                          itemIsActive 
                            ? "bg-blue-200/50 text-blue-700" 
                            : "bg-green-200/70 text-slate-600 group-hover:bg-amber-200/70 group-hover:text-amber-600"
                        }`}>
                          <Icon size={12} />
                        </div>
                        <span className="font-medium text-xs leading-tight">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}