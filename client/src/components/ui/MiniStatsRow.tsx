import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";

interface MiniStat {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'blue' | 'gray';
}

interface MiniStatsRowProps {
  stats?: MiniStat[];
}

export default function MiniStatsRow({ stats }: MiniStatsRowProps) {
  // Default stats if none provided
  const defaultStats: MiniStat[] = [
    {
      label: "Cash Inflow",
      value: formatCurrency("45,200.00"),
      change: "+12.5%",
      trend: 'up',
      color: 'green'
    },
    {
      label: "Cash Outflow", 
      value: formatCurrency("32,800.00"),
      change: "+8.2%",
      trend: 'up',
      color: 'red'
    },
    {
      label: "Net Position",
      value: formatCurrency("12,400.00"),
      change: "+15.3%",
      trend: 'up', 
      color: 'blue'
    }
  ];

  const displayStats = stats || defaultStats;

  const getColorClasses = (color: string, trend: string) => {
    const base = color === 'green' ? 'text-green-600' :
                 color === 'red' ? 'text-red-600' :
                 color === 'blue' ? 'text-blue-600' : 'text-gray-600';
    
    const changeColor = trend === 'up' ? 'text-green-600' :
                       trend === 'down' ? 'text-red-600' : 'text-gray-600';
    
    return { base, changeColor };
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {displayStats.map((stat, index) => {
        const { base, changeColor } = getColorClasses(stat.color || 'gray', stat.trend || 'neutral');
        
        return (
          <Card key={index} className="p-4 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
              <div className="flex items-center justify-between">
                <p className={`text-lg font-semibold ${base}`}>
                  {stat.value}
                </p>
                {stat.change && (
                  <div className={`flex items-center gap-1 ${changeColor}`}>
                    {stat.trend === 'up' && <ArrowUpIcon className="h-3 w-3" />}
                    {stat.trend === 'down' && <ArrowDownIcon className="h-3 w-3" />}
                    <span className="text-xs font-medium">{stat.change}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}