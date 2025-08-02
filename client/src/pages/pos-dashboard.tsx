import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Terminal, 
  Clock, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Settings, 
  BarChart3,
  CreditCard,
  Users,
  ShoppingCart,
  Home,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'wouter';

export default function POSDashboard() {
  const [, setLocation] = useLocation();
  // Data Queries
  const { data: terminals = [] } = useQuery<any[]>({
    queryKey: ['/api/pos/terminals'],
  });

  const { data: currentShifts = [] } = useQuery<any[]>({
    queryKey: ['/api/pos/shifts?status=open'],
    refetchInterval: 30000,
  });

  const { data: todayStats } = useQuery<{ totalSales: number; transactionCount: number; averageTransaction: number }>({
    queryKey: [`/api/pos/sales/stats?date=${new Date().toISOString().split('T')[0]}`],
    refetchInterval: 60000,
  });

  const activeShifts = currentShifts.length;
  const totalTerminals = terminals.length;
  const todaySales = todayStats?.totalSales || 0;
  const todayTransactions = todayStats?.transactionCount || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">POS Dashboard</h1>
          <p className="text-muted-foreground">Point of Sale management and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            <Home className="h-4 w-4 mr-2" />
            Main Dashboard
          </Button>
          <Button onClick={() => window.location.href = '/pos/terminal'}>
            <Terminal className="h-4 w-4 mr-2" />
            Open POS
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-green-300 hover:bg-green-50"
          onClick={() => setLocation("/business-reports?report=sales")}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">R{(Number(todaySales) || 0).toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Today's Sales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-blue-300 hover:bg-blue-50"
          onClick={() => setLocation("/pos/terminal")}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{todayTransactions}</div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-orange-300 hover:bg-orange-50"
          onClick={() => setLocation("/pos/shifts")}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{activeShifts}</div>
                <div className="text-sm text-muted-foreground">Active Shifts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-purple-300 hover:bg-purple-50"
          onClick={() => setLocation("/pos/terminals")}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{totalTerminals}</div>
                <div className="text-sm text-muted-foreground">Total Terminals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/pos/terminal'}
            >
              <CreditCard className="h-6 w-6" />
              <span>Start Sale</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/pos/shifts'}
            >
              <Clock className="h-6 w-6" />
              <span>Manage Shifts</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/pos/terminals'}
            >
              <Terminal className="h-6 w-6" />
              <span>Terminals</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/business-reports'}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Shifts Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Active Shifts ({activeShifts})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeShifts === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No active shifts</p>
              <p className="text-sm text-muted-foreground mb-4">Start a shift to begin using POS terminals</p>
              <Button onClick={() => window.location.href = '/pos/shifts'}>
                <Clock className="h-4 w-4 mr-2" />
                Open Shift
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentShifts.map((shift: any) => (
                <div key={shift.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Terminal className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-semibold">
                        {shift.terminalName || `Terminal #${shift.terminalId}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started at {format(new Date(shift.startTime), 'HH:mm')} • 
                        {shift.salesCount ?? 0} sales • R{(Number(shift.totalSales) || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => window.location.href = `/pos/terminal?terminalId=${shift.terminalId}`}
                    >
                      Use POS
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terminal Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Terminal Status</CardTitle>
        </CardHeader>
        <CardContent>
          {terminals.length === 0 ? (
            <div className="text-center py-8">
              <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No terminals configured</p>
              <p className="text-sm text-muted-foreground mb-4">Add POS terminals to start processing sales</p>
              <Button onClick={() => window.location.href = '/pos/terminals'}>
                <Terminal className="h-4 w-4 mr-2" />
                Add Terminal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {terminals.map((terminal: any) => (
                <div key={terminal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Terminal className="h-4 w-4" />
                      <span className="font-semibold">{terminal.name}</span>
                    </div>
                    <Badge variant="outline" className={
                      terminal.currentShiftId 
                        ? 'bg-green-100 text-green-800' 
                        : terminal.status === 'active' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {terminal.currentShiftId ? 'In Use' : terminal.status === 'active' ? 'Ready' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {terminal.location}
                  </div>
                  <div className="flex space-x-2">
                    {terminal.currentShiftId ? (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.location.href = `/pos/terminal?terminalId=${terminal.id}`}
                      >
                        Use POS
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.location.href = `/pos/shifts?terminalId=${terminal.id}`}
                      >
                        Start Shift
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                R{(Number(todayTransactions) || 0) > 0 ? ((Number(todaySales) || 0) / (Number(todayTransactions) || 1)).toFixed(0) : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Transaction</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {activeShifts > 0 ? Math.round(todayTransactions / activeShifts) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Sales per Shift</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {terminals.filter((t: any) => t.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Ready Terminals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {format(new Date(), 'MMM dd')}
              </div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}