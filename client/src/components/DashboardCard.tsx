import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "green" | "blue" | "orange" | "red" | "purple" | "teal" | "gray";
  subtitle?: string;
  onClick?: () => void;
}

const colorClasses = {
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    hover: "hover:bg-green-100 dark:hover:bg-green-900/30"
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30"
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    icon: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30"
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    hover: "hover:bg-red-100 dark:hover:bg-red-900/30"
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    icon: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-900/30"
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-900/20",
    icon: "text-teal-600 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800",
    hover: "hover:bg-teal-100 dark:hover:bg-teal-900/30"
  },
  gray: {
    bg: "bg-gray-50 dark:bg-gray-900/20",
    icon: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-800",
    hover: "hover:bg-gray-100 dark:hover:bg-gray-900/30"
  }
};

export function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle, 
  onClick 
}: DashboardCardProps) {
  const colorClass = colorClasses[color];
  
  return (
    <div 
      className={`
        ${colorClass.bg} ${colorClass.border} ${onClick ? `${colorClass.hover} cursor-pointer` : ''} 
        border rounded-lg p-6 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {(value || 0).toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`${colorClass.icon} p-3 rounded-lg ${colorClass.bg} border ${colorClass.border}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}