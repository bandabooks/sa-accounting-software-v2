import React from "react";
import { Banknote, TrendingUp, Receipt, FileWarning, PiggyBank, AlertTriangle } from "lucide-react";

export type KPIVariant = "bank" | "revenue" | "profit" | "receivables" | "payables" | "vat";

const STYLES: Record<KPIVariant, {bg: string; ring: string; icon: JSX.Element}> = {
  bank:        { bg: "bg-emerald-50 dark:bg-emerald-950", ring: "ring-emerald-200 dark:ring-emerald-800", icon: <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> },
  revenue:     { bg: "bg-indigo-50 dark:bg-indigo-950",  ring: "ring-indigo-200 dark:ring-indigo-800",  icon: <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
  profit:      { bg: "bg-teal-50 dark:bg-teal-950",     ring: "ring-teal-200 dark:ring-teal-800",     icon: <Banknote className="w-5 h-5 text-teal-600 dark:text-teal-400" /> },
  receivables: { bg: "bg-sky-50 dark:bg-sky-950",       ring: "ring-sky-200 dark:ring-sky-800",       icon: <Receipt className="w-5 h-5 text-sky-600 dark:text-sky-400" /> },
  payables:    { bg: "bg-amber-50 dark:bg-amber-950",   ring: "ring-amber-200 dark:ring-amber-800",   icon: <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" /> },
  vat:         { bg: "bg-violet-50 dark:bg-violet-950", ring: "ring-violet-200 dark:ring-violet-800", icon: <FileWarning className="w-5 h-5 text-violet-600 dark:text-violet-400" /> },
};

export interface KPIStatProps {
  variant: KPIVariant;
  title: string;
  value: string;
  subtitle?: string;
  negative?: boolean;
  hasWarning?: boolean;
  warningTooltip?: string;
  onClick?: () => void;
}

export default function KPIStat({
  variant, 
  title, 
  value, 
  subtitle, 
  negative = false,
  hasWarning = false,
  warningTooltip,
  onClick
}: KPIStatProps) {
  const s = STYLES[variant];
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={`${s.bg} ring-1 ${s.ring} rounded-2xl p-4 shadow-sm transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : undefined}
      data-testid={`kpi-card-${variant}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</span>
        <div className="flex items-center space-x-1">
          {hasWarning && (
            <div className="relative group">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              {warningTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {warningTooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                </div>
              )}
            </div>
          )}
          {s.icon}
        </div>
      </div>
      <div 
        className={`mt-2 text-2xl font-semibold ${negative ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-white"}`}
        aria-label={`${title}: ${value}`}
      >
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      )}
    </div>
  );
}