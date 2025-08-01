import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Banknote, 
  Scan, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator, 
  Receipt, 
  User, 
  Clock,
  ShoppingCart,
  Percent,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Search,
  X,
  KeyboardIcon,
  CashIcon,
  Home
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItem {
  id: string;
  productId?: number;
  barcode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  vatRate: number;
  vatInclusive: boolean;
  lineTotal: number;
  notes?: string;
}

interface PaymentMethod {
  method: string;
  amount: number;
  reference?: string;
  changeAmount?: number;
}

interface CurrentShift {
  id: number;
  terminalId: number;
  userId: number;
  openingCash: number;
  currentCash: number;
  salesCount: number;
  totalSales: number;
  startTime: string;
}

export default function POSTerminal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // State Management
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [selectedCartIndex, setSelectedCartIndex] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [noteInput, setNoteInput] = useState('');

  // Get current terminal info (hardcoded for now, should come from terminal selection)
  const currentTerminalId = 1;

  // Data Queries
  const { data: currentShift, isLoading: shiftLoading, error: shiftError } = useQuery<CurrentShift>({
    queryKey: [`/api/pos/shifts/current?terminalId=${currentTerminalId}`],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['/api/products'],
    retry: 1,
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<any[]>({
    queryKey: ['/api/customers'],
    retry: 1,
  });

  // Mutations
  const createSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      return apiRequest('/api/pos/sales', 'POST', saleData);
    },
    onSuccess: () => {
      toast({
        title: "Sale Completed",
        description: "Transaction processed successfully",
      });
      clearCart();
      setShowPaymentDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/pos/current-shift'] });
    },
    onError: (error: any) => {
      toast({
        title: "Sale Failed",
        description: error.message || "Failed to process sale",
        variant: "destructive",
      });
    }
  });

  // Cart Operations
  const addToCart = (product: any, quantity: number = 1) => {
    const existingIndex = cart.findIndex(item => 
      item.productId === product.id || item.barcode === product.barcode
    );

    if (existingIndex >= 0) {
      updateCartQuantity(existingIndex, cart[existingIndex].quantity + quantity);
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        productId: product.id,
        barcode: product.barcode,
        description: product.name || product.description,
        quantity,
        unitPrice: parseFloat(product.sellingPrice || product.price || '0'),
        discountPercent: 0,
        discountAmount: 0,
        vatRate: parseFloat(product.vatRate || '15'),
        vatInclusive: product.vatInclusive || false,
        lineTotal: 0,
        notes: ''
      };
      
      newItem.lineTotal = calculateLineTotal(newItem);
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    newCart[index].lineTotal = calculateLineTotal(newCart[index]);
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId(null);
    setPaymentMethods([]);
  };

  const calculateLineTotal = (item: CartItem): number => {
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = item.discountPercent > 0 
      ? (baseAmount * item.discountPercent / 100) 
      : item.discountAmount;
    
    const discountedAmount = baseAmount - discountAmount;
    
    if (item.vatInclusive) {
      return discountedAmount;
    } else {
      return discountedAmount * (1 + item.vatRate / 100);
    }
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const cartDiscount = cart.reduce((sum, item) => {
    const baseAmount = item.quantity * item.unitPrice;
    return sum + (item.discountPercent > 0 
      ? (baseAmount * item.discountPercent / 100) 
      : item.discountAmount);
  }, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const cartVAT = cart.reduce((sum, item) => {
    const baseAmount = item.quantity * item.unitPrice - 
      (item.discountPercent > 0 
        ? (item.quantity * item.unitPrice * item.discountPercent / 100) 
        : item.discountAmount);
    
    if (item.vatInclusive) {
      return sum + (baseAmount * item.vatRate / (100 + item.vatRate));
    } else {
      return sum + (baseAmount * item.vatRate / 100);
    }
  }, 0);

  // Barcode handling
  const handleBarcodeInput = (barcode: string) => {
    const product = products.find((p: any) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode: ${barcode}`,
        variant: "destructive",
      });
    }
  };

  // Process payment
  const processPayment = () => {
    const totalPayment = paymentMethods.reduce((sum, p) => sum + p.amount, 0);
    
    if (totalPayment < cartTotal) {
      toast({
        title: "Insufficient Payment",
        description: `Payment required: R${((cartTotal ?? 0) - (totalPayment ?? 0)).toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      terminalId: currentTerminalId,
      customerId: selectedCustomerId,
      subtotal: cartSubtotal,
      discountAmount: cartDiscount,
      vatAmount: cartVAT,
      totalAmount: cartTotal,
      items: cart.map(item => ({
        productId: item.productId,
        barcode: item.barcode,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        discountAmount: item.discountAmount,
        vatRate: item.vatRate,
        vatInclusive: item.vatInclusive,
        lineTotal: item.lineTotal,
        notes: item.notes
      })),
      payments: paymentMethods.map(payment => ({
        paymentMethod: payment.method,
        amount: payment.amount,
        reference: payment.reference
      }))
    };

    createSaleMutation.mutate(saleData);
  };

  // Auto-focus barcode input
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 - Focus barcode
      if (e.key === 'F1') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
      // F2 - Customer lookup
      if (e.key === 'F2') {
        e.preventDefault();
        setShowCustomerDialog(true);
      }
      // F3 - Payment
      if (e.key === 'F3' && cart.length > 0) {
        e.preventDefault();
        setShowPaymentDialog(true);
      }
      // F4 - Clear cart
      if (e.key === 'F4') {
        e.preventDefault();
        clearCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length]);

  // Loading state
  const isLoading = shiftLoading || productsLoading || customersLoading;

  // Error state
  if (shiftError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">POS Terminal Error</h2>
            <p className="text-gray-600">
              There was an issue loading the POS terminal. Please refresh the page or contact support.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/pos-dashboard'} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to POS Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading POS Terminal</h2>
            <p className="text-gray-600">
              Preparing your point of sale terminal...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentShift) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>No Active Shift</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please start your shift before using the POS terminal.
            </p>
            <Button onClick={() => window.location.href = '/pos/shifts'}>
              <Clock className="h-4 w-4 mr-2" />
              Manage Shifts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard'}>
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Terminal #{currentTerminalId}</Badge>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Shift Active
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            Sales: {currentShift?.salesCount ?? 0}
          </Badge>
          <Badge variant="outline">
            Total: R{(currentShift?.totalSales ?? 0).toFixed(2)}
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main POS Interface */}
        <div className="flex-1 p-4 space-y-4">
          {/* Barcode Scanner & Search */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="barcode-input">Barcode Scanner (F1)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="barcode-input"
                      ref={barcodeInputRef}
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleBarcodeInput(barcodeInput);
                        }
                      }}
                      placeholder="Scan or enter barcode..."
                      className="font-mono"
                    />
                    <Button onClick={() => handleBarcodeInput(barcodeInput)}>
                      <Scan className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="product-search">Product Search</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="product-search"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                    />
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Product Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Add Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {products.slice(0, 12).map((product: any) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-16 text-xs flex flex-col items-center justify-center p-2"
                    onClick={() => addToCart(product)}
                  >
                    <div className="truncate w-full text-center">{product.name}</div>
                    <div className="text-green-600 font-semibold">R{(parseFloat(product.sellingPrice || '0') || 0).toFixed(2)}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Shopping Cart ({cart.length} items)</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowCustomerDialog(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Customer (F2)
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearCart}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear (F4)
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Scan a barcode or add products to start</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-muted-foreground">
                            R{(item.unitPrice ?? 0).toFixed(2)} × {item.quantity ?? 0}
                            {(item.discountPercent > 0 || item.discountAmount > 0) && (
                              <span className="text-red-600 ml-2">
                                -{(item.discountPercent ?? 0) > 0 ? `${item.discountPercent ?? 0}%` : `R${(item.discountAmount ?? 0).toFixed(2)}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(index, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCartIndex(index);
                              setShowDiscountDialog(true);
                            }}
                          >
                            <Percent className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="w-20 text-right font-semibold">
                          R{(item.lineTotal ?? 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Cart Summary & Checkout */}
        <div className="w-80 bg-white border-l p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R{(cartSubtotal ?? 0).toFixed(2)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-R{(cartDiscount ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>VAT:</span>
                <span>R{(cartVAT ?? 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>R{(cartTotal ?? 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {selectedCustomerId && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Customer Selected</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomerId(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Button
              className="w-full h-12"
              disabled={cart.length === 0 || createSaleMutation.isPending}
              onClick={() => setShowPaymentDialog(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now (F3)
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => console.log('Hold sale')}>
                Hold Sale
              </Button>
              <Button variant="outline" onClick={() => console.log('Quote')}>
                Quote
              </Button>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>F1:</span>
                <span>Barcode</span>
              </div>
              <div className="flex justify-between">
                <span>F2:</span>
                <span>Customer</span>
              </div>
              <div className="flex justify-between">
                <span>F3:</span>
                <span>Payment</span>
              </div>
              <div className="flex justify-between">
                <span>F4:</span>
                <span>Clear Cart</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Payment - R{(cartTotal ?? 0).toFixed(2)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={currentPaymentMethod} onValueChange={setCurrentPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="transfer">EFT Transfer</SelectItem>
                    <SelectItem value="voucher">Voucher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  const amount = parseFloat(paymentAmount);
                  if (amount > 0) {
                    setPaymentMethods([...paymentMethods, {
                      method: currentPaymentMethod,
                      amount,
                      reference: `${currentPaymentMethod}-${Date.now()}`
                    }]);
                    setPaymentAmount('');
                  }
                }}
              >
                Add Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => setPaymentAmount(cartTotal.toString())}
              >
                Exact Amount
              </Button>
            </div>

            {paymentMethods.length > 0 && (
              <div>
                <Label>Payment Methods</Label>
                <div className="space-y-2 mt-2">
                  {paymentMethods.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="capitalize">{payment.method}</span>
                      <span>R{(payment.amount ?? 0).toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPaymentMethods(paymentMethods.filter((_, i) => i !== index))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t flex justify-between font-semibold">
                  <span>Total Paid:</span>
                  <span>R{paymentMethods.reduce((sum, p) => sum + (p.amount ?? 0), 0).toFixed(2)}</span>
                </div>
                {paymentMethods.reduce((sum, p) => sum + (p.amount ?? 0), 0) > (cartTotal ?? 0) && (
                  <div className="flex justify-between text-green-600">
                    <span>Change:</span>
                    <span>R{(paymentMethods.reduce((sum, p) => sum + (p.amount ?? 0), 0) - (cartTotal ?? 0)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={processPayment}
              disabled={paymentMethods.reduce((sum, p) => sum + (p.amount ?? 0), 0) < (cartTotal ?? 0)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search customers..."
              onChange={(e) => {
                // Filter customers based on search
              }}
            />
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {customers.map((customer: any) => (
                  <Button
                    key={customer.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      setShowCustomerDialog(false);
                    }}
                  >
                    {customer.name} - {customer.email}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setSelectedCustomerId(null);
              setShowCustomerDialog(false);
            }}>
              Walk-in Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Discount Type</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={discountType === 'percentage' ? 'default' : 'outline'}
                  onClick={() => setDiscountType('percentage')}
                >
                  Percentage %
                </Button>
                <Button
                  variant={discountType === 'amount' ? 'default' : 'outline'}
                  onClick={() => setDiscountType('amount')}
                >
                  Amount R
                </Button>
              </div>
            </div>
            <div>
              <Label>Discount Value</Label>
              <Input
                type="number"
                step={discountType === 'percentage' ? '1' : '0.01'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '10' : '10.00'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedCartIndex !== null && discountValue) {
                const newCart = [...cart];
                if (discountType === 'percentage') {
                  newCart[selectedCartIndex].discountPercent = parseFloat(discountValue);
                  newCart[selectedCartIndex].discountAmount = 0;
                } else {
                  newCart[selectedCartIndex].discountAmount = parseFloat(discountValue);
                  newCart[selectedCartIndex].discountPercent = 0;
                }
                newCart[selectedCartIndex].lineTotal = calculateLineTotal(newCart[selectedCartIndex]);
                setCart(newCart);
                setShowDiscountDialog(false);
                setDiscountValue('');
                setSelectedCartIndex(null);
              }
            }}>
              Apply Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}