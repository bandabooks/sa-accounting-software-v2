import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ShoppingCart, Search, Plus, Minus, X, Calculator, Receipt, 
  Pause, Play, RotateCcw, Users, CreditCard, Banknote, 
  Smartphone, Gift, Settings, Save, Trash2, Edit, 
  Keyboard, Scan, Monitor, Printer, Wifi, WifiOff
} from "lucide-react";

interface CartItem {
  id: string;
  productId: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  discountPercent: number;
  discountAmount: number;
}

interface PendingSale {
  id: string;
  items: CartItem[];
  customerId?: number;
  customerName?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  timestamp: Date;
}

export default function EnhancedPOSTerminal() {
  // State Management
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  
  // Payment state
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'cash',
    amount: 0,
    amountTendered: 0,
    reference: '',
    cardType: '',
    authCode: '',
    splitPayments: [] as any[]
  });

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeTimeoutRef = useRef<NodeJS.Timeout>();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  const { data: bankAccounts = [] } = useQuery<any[]>({
    queryKey: ['/api/bank-accounts'],
  });

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.barcode?.includes(searchTerm)
  );

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalVAT = cart.reduce((sum, item) => sum + item.vatAmount, 0);
  const grandTotal = subtotal + totalVAT;

  // Keyboard shortcuts and barcode handling
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F1-F12 shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setShowCustomerModal(true);
      } else if (e.key === 'F3') {
        e.preventDefault();
        suspendSale();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setShowResumeModal(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        clearCart();
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) setShowPaymentModal(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        setShowRefundModal(true);
      } else if (e.key === 'F12') {
        e.preventDefault();
        setShowSettingsModal(true);
      }
      
      // Barcode scanning (numeric input)
      if (/^\d$/.test(e.key)) {
        setBarcodeBuffer(prev => prev + e.key);
        
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
        }
        
        barcodeTimeoutRef.current = setTimeout(() => {
          if (barcodeBuffer.length >= 8) {
            handleBarcodeScanned(barcodeBuffer + e.key);
          }
          setBarcodeBuffer("");
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, [barcodeBuffer, cart]);

  // Barcode scanning
  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode);
    if (product) {
      addToCart(product);
      toast({
        title: "Product Added",
        description: `${product.name} added to cart`,
      });
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode: ${barcode}`,
        variant: "destructive",
      });
    }
  };

  // Cart functions
  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      updateCartItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const vatRate = parseFloat(product.vatRate || 15);
      const unitPrice = parseFloat(product.unitPrice || 0);
      const vatAmount = (unitPrice * vatRate) / 100;
      const lineTotal = unitPrice + vatAmount;
      
      const newItem: CartItem = {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        sku: product.sku || '',
        price: unitPrice,
        quantity: 1,
        vatRate,
        vatAmount,
        lineTotal,
        discountPercent: 0,
        discountAmount: 0,
      };
      
      setCart(prev => [...prev, newItem]);
    }
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const vatAmount = (item.price * item.vatRate / 100) * newQuantity;
        const discountAmount = (item.price * newQuantity * item.discountPercent) / 100;
        const lineTotal = (item.price * newQuantity) + vatAmount - discountAmount;
        
        return {
          ...item,
          quantity: newQuantity,
          vatAmount,
          discountAmount,
          lineTotal,
        };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId(null);
    setSearchTerm("");
  };

  // Suspend and Resume functions
  const suspendSale = () => {
    if (cart.length === 0) {
      toast({
        title: "No Sale to Suspend",
        description: "Add items to cart before suspending",
        variant: "destructive",
      });
      return;
    }
    
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const newPendingSale: PendingSale = {
      id: Date.now().toString(),
      items: [...cart],
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      subtotal,
      vatAmount: totalVAT,
      total: grandTotal,
      timestamp: new Date(),
    };
    
    setPendingSales(prev => [...prev, newPendingSale]);
    clearCart();
    
    toast({
      title: "Sale Suspended",
      description: "Sale has been saved and can be resumed later",
    });
  };

  const resumeSale = (saleId: string) => {
    const sale = pendingSales.find(s => s.id === saleId);
    if (sale) {
      setCart(sale.items);
      setSelectedCustomerId(sale.customerId || null);
      setPendingSales(prev => prev.filter(s => s.id !== saleId));
      setShowResumeModal(false);
      
      toast({
        title: "Sale Resumed",
        description: "Suspended sale has been restored",
      });
    }
  };

  // Process sale mutation
  const processSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      return await apiRequest('/api/pos/sales', 'POST', saleData);
    },
    onSuccess: () => {
      toast({
        title: "Sale Completed",
        description: `Transaction processed successfully for R ${grandTotal.toFixed(2)}`,
      });
      
      clearCart();
      setShowPaymentModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/pos/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error?.message || "Failed to process sale",
        variant: "destructive",
      });
    },
  });

  const processSale = () => {
    if (cart.length === 0) return;
    
    const saleData = {
      sale: {
        terminalId: 1,
        customerId: selectedCustomerId,
        subtotal,
        discountAmount: 0,
        vatAmount: totalVAT,
        total: grandTotal,
        paymentMethod: paymentData.paymentMethod,
        status: 'completed',
        saleDate: new Date().toISOString()
      },
      items: cart.map(item => ({
        productId: item.productId,
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        discountPercent: item.discountPercent,
        discountAmount: item.discountAmount,
        vatRate: item.vatRate,
        vatInclusive: false,
        vatAmount: item.vatAmount,
        lineTotal: item.lineTotal
      })),
      payments: [{
        paymentMethod: paymentData.paymentMethod,
        amount: grandTotal,
        amountTendered: paymentData.amountTendered || grandTotal,
        changeDue: Math.max(0, (paymentData.amountTendered || grandTotal) - grandTotal),
        netAmount: grandTotal,
        reference: paymentData.reference || '',
        cardType: paymentData.cardType || null,
        authCode: paymentData.authCode || null,
        status: 'completed'
      }]
    };
    
    processSaleMutation.mutate(saleData);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          <WifiOff className="h-4 w-4 inline mr-2" />
          Working Offline - Transactions will sync when reconnected
        </div>
      )}

      {/* Left Panel - Products */}
      <div className="w-1/2 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search products or scan barcode (F1)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button size="sm" variant="outline">
              <Scan className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-3">
                  <div className="text-sm font-medium truncate">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.sku}</div>
                  <div className="text-lg font-bold text-blue-600 mt-1">
                    R {parseFloat(product.unitPrice || 0).toFixed(2)}
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    Stock: {product.stockQuantity || 0}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Cart and Controls */}
      <div className="w-1/2 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Point of Sale</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <Button size="sm" variant="outline" onClick={() => setShowSettingsModal(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Customer selection */}
          <div className="mt-3">
            <Select
              value={selectedCustomerId?.toString() || ''}
              onValueChange={(value) => setSelectedCustomerId(value ? parseInt(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Walk-in Customer (F2 to change)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Walk-in Customer</SelectItem>
                {customers.map((customer: any) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 bg-white">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No items in cart</p>
                  <p className="text-sm">Scan barcode or select products</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <Card key={item.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.sku}</div>
                          <div className="text-sm text-blue-600">
                            R {item.price.toFixed(2)} × {item.quantity} = R {item.lineTotal.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Totals and Actions */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT:</span>
              <span>R {totalVAT.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={suspendSale}
              disabled={cart.length === 0}
              className="h-12"
            >
              <Pause className="h-4 w-4 mr-2" />
              Suspend (F3)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowResumeModal(true)}
              disabled={pendingSales.length === 0}
              className="h-12"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume (F4)
            </Button>
            <Button 
              variant="outline" 
              onClick={clearCart}
              disabled={cart.length === 0}
              className="h-12"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear (F5)
            </Button>
            <Button 
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              className="h-12 bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay (F8)
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowRefundModal(true)}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Refund (F9)
            </Button>
            <Button 
              size="sm" 
              variant="outline"
            >
              <Receipt className="h-3 w-3 mr-1" />
              Reprint
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">R {grandTotal.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <Banknote className="h-4 w-4 inline mr-2" />
                    Cash
                  </SelectItem>
                  <SelectItem value="card">
                    <CreditCard className="h-4 w-4 inline mr-2" />
                    Card
                  </SelectItem>
                  <SelectItem value="mobile">
                    <Smartphone className="h-4 w-4 inline mr-2" />
                    Mobile Payment
                  </SelectItem>
                  <SelectItem value="voucher">
                    <Gift className="h-4 w-4 inline mr-2" />
                    Voucher
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentData.paymentMethod === 'cash' && (
              <div>
                <Label>Amount Tendered *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentData.amountTendered || ''}
                  onChange={(e) => setPaymentData(prev => ({ 
                    ...prev, 
                    amountTendered: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="Enter amount received"
                />
                {paymentData.amountTendered > 0 && (
                  <div className={`mt-2 p-2 rounded text-center font-bold ${
                    paymentData.amountTendered >= grandTotal
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    Change Due: R {Math.max(0, paymentData.amountTendered - grandTotal).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={processSale}
                disabled={
                  paymentData.paymentMethod === 'cash' && 
                  paymentData.amountTendered < grandTotal
                }
              >
                Complete Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Sale Modal */}
      <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resume Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {pendingSales.map((sale) => (
              <Card key={sale.id} className="p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => resumeSale(sale.id)}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{sale.customerName}</div>
                    <div className="text-sm text-gray-500">
                      {sale.items.length} items • {sale.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-lg font-bold">R {sale.total.toFixed(2)}</div>
                </div>
              </Card>
            ))}
            {pendingSales.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No suspended sales
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}