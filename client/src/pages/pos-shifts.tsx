import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Plus, DollarSign, AlertTriangle, CheckCircle, 
  Users, Calculator, CreditCard, Package, TrendingUp
} from "lucide-react";
import { useCollaborationIndicators } from "@/hooks/useCollaborationIndicators";
import { CollaborationIndicators } from "@/components/collaboration/CollaborationIndicators";
import { ActivityTracker } from "@/components/collaboration/ActivityTracker";

export default function POSShiftsPage() {
  const [currentShift, setCurrentShift] = useState({
    id: 1,
    startTime: "2025-01-24T08:00:00",
    openingAmount: 200.00,
    cashSales: 1450.00,
    cardSales: 1000.00,
    totalSales: 2450.00,
    status: "active"
  });

  const { collaborationState, updateActivity, requestShiftLock, releaseShiftLock } = useCollaborationIndicators();

  const handleCriticalOperation = (operation: string, activityKey: any) => {
    updateActivity(activityKey);
    requestShiftLock(operation);
    // In a real implementation, you would perform the operation here
    // and then release the lock when done
  };

  return (
    <ActivityTracker activity="VIEWING_SHIFT" location="shift-management">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Collaboration Indicators */}
        <CollaborationIndicators
          activeUsers={collaborationState.activeUsers}
          shiftLocked={collaborationState.shiftLocked}
          lockOwner={collaborationState.lockOwner}
          currentActivity={collaborationState.currentActivity}
          onActivityUpdate={(activity) => updateActivity(activity as any)}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600 mt-1">Manage POS shifts and cash drawer operations</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Clock className="h-3 w-3 mr-1" />
            Shift Active
          </Badge>
          <Button variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Close Shift
          </Button>
        </div>
      </div>

      {/* Current Shift Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shift Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6h 24m</div>
            <p className="text-xs text-muted-foreground">Started: 08:00 AM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R 200.00</div>
            <p className="text-xs text-muted-foreground">Cash drawer opening</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R 2,450.00</div>
            <p className="text-xs text-muted-foreground">12 transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Cash</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R 1,650.00</div>
            <p className="text-xs text-muted-foreground">Opening + Cash Sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shift Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Current Shift Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Shift Start Time</label>
                  <p className="text-lg font-semibold">January 24, 2025 - 08:00 AM</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Cashier</label>
                  <p className="text-lg font-semibold">Production Administrator</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Payment Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      <span>Cash Sales</span>
                    </div>
                    <span className="font-semibold">R 1,450.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Card Sales</span>
                    </div>
                    <span className="font-semibold">R 1,000.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center font-bold">
                    <span>Total Sales</span>
                    <span>R 2,450.00</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Transaction Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Total Sales</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">47</div>
                    <div className="text-sm text-gray-600">Items Sold</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-gray-600">Customers</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shift Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Cash Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Current Cash in Drawer</label>
                <div className="text-2xl font-bold text-green-600">R 1,650.00</div>
                <p className="text-xs text-gray-500">Expected amount based on sales</p>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleCriticalOperation("Cash Drop", "CASH_DROP")}
                  disabled={collaborationState.shiftLocked}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Cash Drop
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleCriticalOperation("Count Drawer", "COUNTING_DRAWER")}
                  disabled={collaborationState.shiftLocked}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Count Drawer
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleCriticalOperation("Float Adjustment", "FLOAT_ADJUSTMENT")}
                  disabled={collaborationState.shiftLocked}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Float Adjustment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Shift Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => updateActivity("TAKING_BREAK")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Take Break
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleCriticalOperation("Switch Cashier", "SWITCH_CASHIER")}
                disabled={collaborationState.shiftLocked}
              >
                <Users className="h-4 w-4 mr-2" />
                Switch Cashier
              </Button>
              <Button 
                className="w-full" 
                variant="destructive"
                onClick={() => handleCriticalOperation("Close Shift", "CLOSING_SHIFT")}
                disabled={collaborationState.shiftLocked}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Close Shift
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Jan 23, 2025", cashier: "John Smith", duration: "8h 15m", sales: "R 3,200.00", status: "closed" },
              { date: "Jan 22, 2025", cashier: "Sarah Wilson", duration: "7h 45m", sales: "R 2,850.00", status: "closed" },
              { date: "Jan 21, 2025", cashier: "Mike Johnson", duration: "8h 30m", sales: "R 4,100.00", status: "closed" }
            ].map((shift, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">{shift.status}</Badge>
                  <div>
                    <p className="font-medium">{shift.date}</p>
                    <p className="text-sm text-gray-600">{shift.cashier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{shift.sales}</p>
                  <p className="text-sm text-gray-600">{shift.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </ActivityTracker>
  );
}