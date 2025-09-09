import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export interface KPIStatProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'default' | 'compact';
  className?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  subtitle?: string;
  loading?: boolean;
}

const variantClasses = {
  default: "border-gray-200 bg-white",
  success: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
  warning: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100",
  danger: "border-red-200 bg-gradient-to-br from-red-50 to-red-100",
  info: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
  purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100"
};

const iconVariantClasses = {
  default: "text-gray-500",
  success: "text-green-600",
  warning: "text-yellow-600",
  danger: "text-red-600",
  info: "text-blue-600",
  purple: "text-purple-600"
};

const titleVariantClasses = {
  default: "text-gray-700",
  success: "text-green-800",
  warning: "text-yellow-800",
  danger: "text-red-800",
  info: "text-blue-800",
  purple: "text-purple-800"
};

const valueVariantClasses = {
  default: "text-gray-900",
  success: "text-green-900",
  warning: "text-yellow-900",
  danger: "text-red-900",
  info: "text-blue-900",
  purple: "text-purple-900"
};

export function KPIStat({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default',
  size = 'default',
  className,
  badge,
  subtitle,
  loading = false,
  ...props
}: KPIStatProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format numbers with proper currency/percentage formatting
      if (val >= 1000000) {
        return `R${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `R${(val / 1000).toFixed(1)}k`;
      } else if (val < 0) {
        return `-R${Math.abs(val).toFixed(2)}`;
      } else {
        return `R${val.toFixed(2)}`;
      }
    }
    return String(val);
  };

  const formatChange = (changeValue: number): string => {
    const absChange = Math.abs(changeValue);
    if (absChange >= 100) {
      return `${changeValue > 0 ? '+' : '-'}${absChange.toFixed(0)}%`;
    }
    return `${changeValue > 0 ? '+' : '-'}${absChange.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md",
        variantClasses[variant],
        size === 'compact' ? "p-3" : "",
        className
      )} {...props}>
        <CardContent className={size === 'compact' ? "p-3" : "p-6"}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
            {subtitle && <div className="h-3 bg-gray-200 rounded w-2/3"></div>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={cn(
        "transition-all duration-200 hover:shadow-md border-l-4",
        variantClasses[variant],
        size === 'compact' ? "p-2" : "",
        className
      )} 
      {...props}
    >
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        size === 'compact' ? "pb-1" : "pb-2"
      )}>
        <CardTitle className={cn(
          "text-sm font-medium",
          titleVariantClasses[variant]
        )}>
          {title}
          {badge && (
            <Badge 
              variant={badge.variant || "secondary"} 
              className="ml-2 text-xs"
            >
              {badge.text}
            </Badge>
          )}
        </CardTitle>
        {Icon && (
          <Icon className={cn(
            size === 'compact' ? "h-4 w-4" : "h-5 w-5",
            iconVariantClasses[variant]
          )} />
        )}
      </CardHeader>
      <CardContent className={size === 'compact' ? "pt-0 pb-2" : ""}>
        <div className={cn(
          "text-2xl font-bold tracking-tight",
          size === 'compact' ? "text-xl" : "",
          valueVariantClasses[variant]
        )} data-testid={`value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {formatValue(value)}
        </div>
        {subtitle && (
          <p className={cn(
            "text-xs text-muted-foreground mt-1",
            titleVariantClasses[variant]
          )}>
            {subtitle}
          </p>
        )}
        {change && (
          <div className={cn(
            "flex items-center text-xs mt-1",
            change.type === 'increase' ? "text-green-600" : 
            change.type === 'decrease' ? "text-red-600" : "text-gray-600"
          )}>
            {change.type === 'increase' ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : change.type === 'decrease' ? (
              <TrendingDown className="mr-1 h-3 w-3" />
            ) : null}
            <span data-testid={`change-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {formatChange(change.value)} {change.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export compact variant for convenience
export function CompactKPIStat(props: Omit<KPIStatProps, 'size'>) {
  return <KPIStat {...props} size="compact" />;
}

// Export preset variants for common use cases
export function SuccessKPIStat(props: Omit<KPIStatProps, 'variant'>) {
  return <KPIStat {...props} variant="success" />;
}

export function WarningKPIStat(props: Omit<KPIStatProps, 'variant'>) {
  return <KPIStat {...props} variant="warning" />;
}

export function DangerKPIStat(props: Omit<KPIStatProps, 'variant'>) {
  return <KPIStat {...props} variant="danger" />;
}

export function InfoKPIStat(props: Omit<KPIStatProps, 'variant'>) {
  return <KPIStat {...props} variant="info" />;
}

export function PurpleKPIStat(props: Omit<KPIStatProps, 'variant'>) {
  return <KPIStat {...props} variant="purple" />;
}