import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface SimplePLChartProps {
  revenue: number;
  expenses: number;
  netProfit: number;
}

const SimplePLChart: React.FC<SimplePLChartProps> = ({ revenue, expenses, netProfit }) => {
  // Create chart data from the summary totals
  const chartData = [
    {
      name: "Sep 2025",
      revenue: revenue,
      expenses: expenses,
      profit: netProfit,
    }
  ];

  const formatCurrency = (value: number) => {
    return `R${value.toLocaleString('en-ZA', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Profit & Loss Overview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly revenue vs expenses analysis
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Net Profit'
                ]}
                labelFormatter={(label) => `Period: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                iconType="rect"
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#10b981" 
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                fill="#ef4444" 
                name="Expenses"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="profit" 
                fill="#3b82f6" 
                name="Net Profit"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(revenue)}
            </div>
            <div className="text-sm text-muted-foreground">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(expenses)}
            </div>
            <div className="text-sm text-muted-foreground">Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(netProfit)}
            </div>
            <div className="text-sm text-muted-foreground">Net Profit</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplePLChart;