import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils-invoice";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SimpleProfitLossChartProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  loading?: boolean;
}

export default function SimpleProfitLossChart({ 
  totalRevenue, 
  totalExpenses, 
  netProfit, 
  loading = false 
}: SimpleProfitLossChartProps) {
  
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  // Prepare data for charts
  const barData = [
    {
      name: 'Current Period',
      Revenue: totalRevenue,
      Expenses: totalExpenses,
      'Net Profit': netProfit
    }
  ];

  const pieData = [
    { name: 'Revenue', value: totalRevenue, color: '#22c55e' },
    { name: 'Expenses', value: totalExpenses, color: '#ef4444' },
    { name: 'Net Profit', value: netProfit, color: '#3b82f6' }
  ];

  const COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <div className="space-y-6">
      {/* Professional Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Financial Overview</span>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span>Expenses</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span>Profit</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatTooltipValue(value), '']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>


      {/* Professional Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%
              </div>
              <div className="text-sm text-gray-600">Profit Margin</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalRevenue > 0 ? (totalExpenses / totalRevenue * 100).toFixed(1) : '0.0'}%
              </div>
              <div className="text-sm text-gray-600">Expense Ratio</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit >= 0 ? 'Profitable' : 'Loss'}
              </div>
              <div className="text-sm text-gray-600">Performance Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}