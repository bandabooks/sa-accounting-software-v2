import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency } from "@/lib/utils-invoice";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfitLossChartProps {
  data: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  chartType?: 'bar' | 'line';
}

export default function ProfitLossChart({ data, chartType: propChartType }: ProfitLossChartProps) {
  const displayChartType = propChartType || 'bar';

  // Process and format chart data
  const chartData = (data || []).map((item, index) => ({
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    revenue: Number(item.revenue) || 0,
    expenses: Number(item.expenses) || 0,
    profit: Number(item.profit) || 0
  })).reverse(); // Reverse to show chronological order

  // If being used in the new dashboard, return a simpler version
  if (propChartType !== undefined) {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {displayChartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#3b82f6" />
              <Bar dataKey="expenses" fill="#ef4444" />
              <Bar dataKey="profit" fill="#10b981" />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  }

  // Original chart with its own controls
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [period, setPeriod] = useState('6months');
  
  console.log('Chart Data:', chartData); // Debug log

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profit & Loss Overview</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Income vs Expenses comparison</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="h-8 px-3"
              >
                Bar
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-8 px-3"
              >
                Line
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-600" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `R${value.toLocaleString()}`}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value.toString()), 
                    name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
                  ]}
                  labelFormatter={(label) => `${label} 2025`}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="revenue"
                />
                <Bar 
                  dataKey="expenses" 
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="expenses"
                />
                <Bar 
                  dataKey="profit" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="profit"
                />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-600" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `R${value.toLocaleString()}`}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value.toString()), 
                    name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
                  ]}
                  labelFormatter={(label) => `${label} 2025`}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  name="expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="profit"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Profit</span>
          </div>
        </div>
      </div>
    </div>
  );
}