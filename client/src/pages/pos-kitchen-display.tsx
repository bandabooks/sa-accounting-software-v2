import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ChefHat, Clock, CheckCircle, AlertCircle, 
  Play, Pause, RotateCcw, Timer, Utensils, Settings
} from "lucide-react";

interface KitchenOrder {
  id: number;
  saleId: number;
  orderNumber: string;
  customerName?: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimatedTime: number;
  elapsedTime: number;
  startTime?: string;
  completionTime?: string;
  items: KitchenOrderItem[];
  specialInstructions?: string;
  table?: string;
  createdAt: string;
}

interface KitchenOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready';
  cookingTime: number;
  specialRequests?: string;
  category: string;
}

interface KitchenSettings {
  autoAcceptOrders: boolean;
  soundNotifications: boolean;
  displayCompletedOrders: boolean;
  orderTimeout: number;
  kitchenSections: string[];
  defaultCookingTimes: Record<string, number>;
}

export default function POSKitchenDisplayPage() {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState<KitchenSettings>({
    autoAcceptOrders: true,
    soundNotifications: true,
    displayCompletedOrders: false,
    orderTimeout: 45,
    kitchenSections: ['Grill', 'Fryer', 'Salads', 'Drinks', 'Desserts'],
    defaultCookingTimes: {
      'Hot Food': 15,
      'Cold Food': 5,
      'Beverages': 3,
      'Desserts': 10
    }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch kitchen orders
  const { data: kitchenOrders = [] } = useQuery<KitchenOrder[]>({
    queryKey: ['/api/pos/kitchen-orders'],
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status, itemId }: { orderId: number; status: string; itemId?: number }) => {
      const endpoint = itemId ? 
        `/api/pos/kitchen-orders/${orderId}/items/${itemId}` : 
        `/api/pos/kitchen-orders/${orderId}`;
      return await apiRequest(endpoint, 'PUT', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/kitchen-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    },
  });

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/kitchen-orders'] });
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, queryClient]);

  const handleOrderStatusChange = (orderId: number, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus });
    
    if (newStatus === 'preparing') {
      toast({
        title: "Order Started",
        description: `Order ${getOrderNumber(orderId)} is now being prepared`,
      });
    } else if (newStatus === 'ready') {
      toast({
        title: "Order Ready",
        description: `Order ${getOrderNumber(orderId)} is ready for pickup`,
      });
    }
  };

  const handleItemStatusChange = (orderId: number, itemId: number, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus, itemId });
  };

  const getOrderNumber = (orderId: number) => {
    const order = kitchenOrders.find(o => o.id === orderId);
    return order?.orderNumber || `#${orderId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getTimeElapsed = (createdAt: string, startTime?: string) => {
    const start = startTime ? new Date(startTime) : new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return diff;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />;
      case 'preparing': return <ChefHat className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = kitchenOrders.filter(order => {
    if (!settings.displayCompletedOrders && (order.status === 'completed' || order.status === 'cancelled')) {
      return false;
    }
    if (selectedSection === 'all') return true;
    return order.items.some(item => item.category === selectedSection);
  });

  const newOrders = filteredOrders.filter(o => o.status === 'new');
  const preparingOrders = filteredOrders.filter(o => o.status === 'preparing');
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-6 w-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {autoRefresh ? `Auto-refresh ${refreshInterval}s` : 'Manual refresh'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Display */}
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/pos/kitchen-orders'] })}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Section Filter */}
        <div className="flex items-center space-x-2 mt-4">
          <span className="text-sm font-medium text-gray-700">Section:</span>
          <div className="flex space-x-2">
            <Button
              variant={selectedSection === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSection('all')}
            >
              All ({filteredOrders.length})
            </Button>
            {settings.kitchenSections.map((section) => {
              const count = filteredOrders.filter(o => 
                o.items.some(item => item.category === section)
              ).length;
              return (
                <Button
                  key={section}
                  variant={selectedSection === section ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSection(section)}
                >
                  {section} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Orders */}
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <h2 className="font-semibold text-blue-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              New Orders ({newOrders.length})
            </h2>
          </div>
          {newOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No new orders</p>
              </CardContent>
            </Card>
          ) : (
            newOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(order.priority)}`} />
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {order.orderType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Timer className="h-4 w-4" />
                      <span>{getTimeElapsed(order.createdAt)}m</span>
                    </div>
                  </div>
                  {order.customerName && (
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  )}
                  {order.table && (
                    <p className="text-sm font-medium">Table: {order.table}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b">
                        <div>
                          <span className="font-medium">{item.quantity}x {item.productName}</span>
                          {item.specialRequests && (
                            <p className="text-xs text-orange-600 mt-1">
                              Note: {item.specialRequests}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.cookingTime}m
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {order.specialInstructions && (
                    <div className="bg-yellow-50 p-2 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Special Instructions:</strong> {order.specialInstructions}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleOrderStatusChange(order.id, 'preparing')}
                    >
                      <ChefHat className="h-4 w-4 mr-2" />
                      Start Cooking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Preparing Orders */}
        <div className="space-y-4">
          <div className="bg-yellow-50 rounded-lg p-3">
            <h2 className="font-semibold text-yellow-900 flex items-center">
              <ChefHat className="h-5 w-5 mr-2" />
              Preparing ({preparingOrders.length})
            </h2>
          </div>
          {preparingOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders in preparation</p>
              </CardContent>
            </Card>
          ) : (
            preparingOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-yellow-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(order.priority)}`} />
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {order.orderType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-yellow-700 font-medium">
                      <Timer className="h-4 w-4" />
                      <span>{getTimeElapsed(order.createdAt, order.startTime)}m</span>
                    </div>
                  </div>
                  {order.customerName && (
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  )}
                  {order.table && (
                    <p className="text-sm font-medium">Table: {order.table}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.quantity}x {item.productName}</span>
                            <Badge className={getStatusColor(item.status)} size="sm">
                              {item.status}
                            </Badge>
                          </div>
                          {item.specialRequests && (
                            <p className="text-xs text-orange-600 mt-1">
                              Note: {item.specialRequests}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemStatusChange(order.id, item.id, 
                            item.status === 'pending' ? 'preparing' : 'ready'
                          )}
                        >
                          {item.status === 'pending' ? 'Start' : 'Ready'}
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleOrderStatusChange(order.id, 'new')}
                    >
                      Hold
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleOrderStatusChange(order.id, 'ready')}
                      disabled={order.items.some(item => item.status !== 'ready')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Ready
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Ready Orders */}
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-3">
            <h2 className="font-semibold text-green-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Ready for Pickup ({readyOrders.length})
            </h2>
          </div>
          {readyOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders ready</p>
              </CardContent>
            </Card>
          ) : (
            readyOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(order.priority)}`} />
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {order.orderType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-green-700 font-medium">
                      <Timer className="h-4 w-4" />
                      <span>{getTimeElapsed(order.createdAt, order.startTime)}m</span>
                    </div>
                  </div>
                  {order.customerName && (
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  )}
                  {order.table && (
                    <p className="text-sm font-medium">Table: {order.table}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1">
                        <span className="font-medium">{item.quantity}x {item.productName}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleOrderStatusChange(order.id, 'completed')}
                  >
                    <Utensils className="h-4 w-4 mr-2" />
                    Mark as Served
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Kitchen Display Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto-accept new orders</Label>
                <Switch
                  checked={settings.autoAcceptOrders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAcceptOrders: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sound notifications</Label>
                <Switch
                  checked={settings.soundNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show completed orders</Label>
                <Switch
                  checked={settings.displayCompletedOrders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, displayCompletedOrders: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto-refresh</Label>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}