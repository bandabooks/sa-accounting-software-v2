import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency } from "@/lib/utils-invoice";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface ProfitLossChartProps {
  data: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

export default function ProfitLossChart({ data }: ProfitLossChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [period, setPeriod] = useState('all');
  const [customDateRange, setCustomDateRange] = useState<{from?: Date, to?: Date}>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);

  // Filter data based on selected period
  const filterDataByPeriod = (data: Array<any>, period: string) => {
    if (!data || data.length === 0) return data;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    switch (period) {
      case 'all':
        return data; // Show all data
      case 'custom': {
        if (!customDateRange.from || !customDateRange.to) return data;
        return data.filter(item => {
          // Parse the date format "Aug 01" or "Jul 01" into proper dates
          const [monthName, day] = item.month.split(' ');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = monthNames.indexOf(monthName);
          
          // Set time boundaries for selected range
          const fromDate = new Date(customDateRange.from!);
          fromDate.setHours(0, 0, 0, 0);
          const toDate = new Date(customDateRange.to!);
          toDate.setHours(23, 59, 59, 999);
          
          // Check if the selected date range includes any part of this month
          // For monthly data like "Aug 01", include it if the selected range overlaps with August
          const monthStart = new Date(currentYear, monthIndex, 1);
          const monthEnd = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59, 999);
          
          // Include this month's data if the custom range overlaps with any part of the month
          const rangeOverlapsMonth = (fromDate <= monthEnd) && (toDate >= monthStart);
          
          console.log('Custom date filtering:', {
            itemMonth: item.month,
            monthStart: monthStart.toDateString(),
            monthEnd: monthEnd.toDateString(),
            selectedFrom: fromDate.toDateString(),
            selectedTo: toDate.toDateString(),
            rangeOverlapsMonth: rangeOverlapsMonth
          });
          
          return rangeOverlapsMonth;
        });
      }
      case 'thismonth': {
        // Parse the month string format like "Aug 01" and check if it's current month/year
        return data.filter(item => {
          const itemDate = new Date(`${item.month} ${currentYear}`);
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });
      }
      case 'lastmonth': {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return data.filter(item => {
          const itemDate = new Date(`${item.month} ${lastMonthYear}`);
          return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear;
        });
      }
      case '3months': {
        const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
        return data.filter(item => {
          const itemDate = new Date(`${item.month} ${currentYear}`);
          return itemDate >= threeMonthsAgo;
        });
      }
      case '6months': {
        const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
        return data.filter(item => {
          const itemDate = new Date(`${item.month} ${currentYear}`);
          return itemDate >= sixMonthsAgo;
        });
      }
      case '12months': {
        const twelveMonthsAgo = new Date(currentYear, currentMonth - 11, 1);
        return data.filter(item => {
          const itemDate = new Date(`${item.month} ${currentYear}`);
          return itemDate >= twelveMonthsAgo;
        });
      }
      default:
        return data;
    }
  };

  // Process and format chart data with period filtering
  const filteredData = filterDataByPeriod(data || [], period);
  
  // Format labels based on period type
  const formatLabelForPeriod = (date: Date, period: string) => {
    switch (period) {
      case 'thisweek':
      case 'lastweek':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case 'thismonth':
      case 'lastmonth':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };
  
  const chartData = filteredData.length > 0 ? filteredData.map((item, index) => ({
    month: formatLabelForPeriod(new Date(item.month), period),
    revenue: Number(item.revenue) || 0,
    expenses: Number(item.expenses) || 0,
    profit: Number(item.profit) || 0
  })).reverse() : []; // Reverse to show chronological order
  
  // Show summary metrics for current period
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profit & Loss Overview</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Income vs Expenses comparison</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={period} onValueChange={(value) => {
              setPeriod(value);
              if (value === 'custom') {
                setShowDatePicker(true);
              }
            }}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="thismonth">This Month</SelectItem>
                <SelectItem value="lastmonth">Last Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {period === 'custom' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="text-xs"
              >
                {customDateRange.from && customDateRange.to 
                  ? `${customDateRange.from.toLocaleDateString()} - ${customDateRange.to.toLocaleDateString()}`
                  : 'Select Dates'
                }
              </Button>
            )}
            
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
        {/* Custom Date Range Picker */}
        {showDatePicker && period === 'custom' && (
          <div className="mb-6 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Date Range</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                <Popover open={showFromCalendar} onOpenChange={setShowFromCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.from ? (
                        format(customDateRange.from, "PPP")
                      ) : (
                        <span className="text-gray-500">Pick a start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange.from}
                      onSelect={(date) => {
                        setCustomDateRange(prev => ({ ...prev, from: date }));
                        setShowFromCalendar(false); // Close calendar after selection
                      }}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                <Popover open={showToCalendar} onOpenChange={setShowToCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.to ? (
                        format(customDateRange.to, "PPP")
                      ) : (
                        <span className="text-gray-500">Pick an end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange.to}
                      onSelect={(date) => {
                        setCustomDateRange(prev => ({ ...prev, to: date }));
                        setShowToCalendar(false); // Close calendar after selection
                      }}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setCustomDateRange({});
                  setShowDatePicker(false);
                  setShowFromCalendar(false);
                  setShowToCalendar(false);
                  setPeriod('all');
                }}
                className="text-gray-600 dark:text-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowDatePicker(false);
                  setShowFromCalendar(false);
                  setShowToCalendar(false);
                }}
                disabled={!customDateRange.from || !customDateRange.to}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Range
              </Button>
            </div>
          </div>
        )}
        
        
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `R ${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                      return `R ${(value / 1000).toFixed(0)}K`;
                    }
                    return `R ${value.toLocaleString()}`;
                  }}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `R ${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                      return `R ${(value / 1000).toFixed(0)}K`;
                    }
                    return `R ${value.toLocaleString()}`;
                  }}
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
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <div className="text-lg font-medium mb-2">No data available</div>
                <div className="text-sm">No transactions found for the selected period</div>
                <div className="text-xs mt-2 text-gray-400">
                  Try selecting a different time period or add some transactions
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Professional Legend */}
        <div className="flex items-center justify-center space-x-8 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Expenses</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Profit</span>
          </div>
        </div>
      </div>
    </div>
  );
}