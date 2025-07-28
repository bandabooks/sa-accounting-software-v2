import { Plus, FileText, Users, Package, CreditCard, PieChart, Settings } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ActionShortcuts() {
  const quickActions = [
    {
      title: "Create Invoice",
      description: "Bill a customer",
      icon: FileText,
      href: "/invoices/new",
      color: "bg-blue-500 hover:bg-blue-600",
      frequency: "daily"
    },
    {
      title: "Add Customer",
      description: "New client",
      icon: Users,
      href: "/customers/new",
      color: "bg-green-500 hover:bg-green-600",
      frequency: "weekly"
    },
    {
      title: "Record Payment",
      description: "Log payment received",
      icon: CreditCard,
      href: "/payments/new",
      color: "bg-purple-500 hover:bg-purple-600",
      frequency: "daily"
    },
    {
      title: "New Estimate",
      description: "Quote a customer",
      icon: Plus,
      href: "/estimates/new",
      color: "bg-teal-500 hover:bg-teal-600",
      frequency: "weekly"
    }
  ];

  const managementActions = [
    {
      title: "Inventory",
      description: "Manage stock",
      icon: Package,
      href: "/inventory",
      color: "bg-orange-500 hover:bg-orange-600",
      frequency: "weekly"
    },
    {
      title: "Reports",
      description: "View insights",
      icon: PieChart,
      href: "/reports",
      color: "bg-indigo-500 hover:bg-indigo-600",
      frequency: "monthly"
    },
    {
      title: "Settings",
      description: "Configure system",
      icon: Settings,
      href: "/settings",
      color: "bg-gray-500 hover:bg-gray-600",
      frequency: "monthly"
    }
  ];

  const ActionCard = ({ action, size = "default" }: { action: any, size?: "default" | "compact" }) => {
    const Icon = action.icon;
    
    if (size === "compact") {
      return (
        <Button asChild variant="outline" className="h-auto p-3 flex-col space-y-2">
          <Link href={action.href}>
            <Icon size={16} />
            <span className="text-xs font-medium">{action.title}</span>
          </Link>
        </Button>
      );
    }

    return (
      <Link href={action.href}>
        <div className={`${action.color} text-white rounded-lg p-4 transition-all duration-200 hover:scale-105 cursor-pointer group`}>
          <div className="flex items-center justify-between mb-2">
            <Icon size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {action.frequency}
            </span>
          </div>
          <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
          <p className="text-xs opacity-90">{action.description}</p>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">Frequently used</span>
      </div>
      
      {/* Daily/Weekly Actions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Daily Operations</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <ActionCard key={index} action={action} />
          ))}
        </div>
      </div>
      
      {/* Management Actions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Management</h4>
        <div className="grid grid-cols-3 gap-3">
          {managementActions.map((action, index) => (
            <ActionCard key={index} action={action} size="compact" />
          ))}
        </div>
      </div>
    </div>
  );
}