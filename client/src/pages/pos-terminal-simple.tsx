import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, Minus, Trash2, ShoppingCart, Calculator, 
  User, CreditCard, DollarSign, Search, Pause, Play,
  RotateCcw, Settings, Scan, Keyboard, Wifi, WifiOff
} from "lucide-react";

interface SaleItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  vatRate: number;
  vatAmount: number;
  netAmount: number;
}

interface PaymentData {
  paymentMethod: string;
  amount: number;
  amountTendered: number;
  bankAccountId?: number;
  reference?: string;
}

interface PendingSale {
  id: string;
  items: SaleItem[];
  customerId?: number;
  customerName?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  timestamp: Date;
}

export default function SimplePOSTerminal() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentMethod: 'cash',
    amount: 0,
    amountTendered: 0,
    bankAccountId: undefined,
    reference: ''
  });
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  
  // Refs for keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeTimeoutRef = useRef<NodeJS.Timeout>();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch data with proper error handling
  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<any[]>({
    queryKey: ['/api/customers'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: bankAccounts = [] } = useQuery<any[]>({
    queryKey: ['/api/bank-accounts'],
    staleTime: 5 * 60 * 1000,
  });

  // Keyboard shortcuts and barcode handling
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F1-F12 shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        // Focus customer selection - could open a modal or focus select
      } else if (e.key === 'F3') {
        e.preventDefault();
        suspendSale();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setShowResumeModal(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        clearSale();
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (saleItems.length > 0) setShowPaymentModal(true);
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
  }, [barcodeBuffer, saleItems]);

  // Barcode scanning function
  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode);
    if (product) {
      addToSale(product);
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

  // Suspend and Resume functions
  const suspendSale = () => {
    if (saleItems.length === 0) {
      toast({
        title: "No Sale to Suspend",
        description: "Add items to cart before suspending",
        variant: "destructive",
      });
      return;
    }
    
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const subtotal = saleItems.reduce((sum, item) => sum + item.netAmount, 0);
    const vatAmount = saleItems.reduce((sum, item) => sum + item.vatAmount, 0);
    
    const newPendingSale: PendingSale = {
      id: Date.now().toString(),
      items: [...saleItems],
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      subtotal,
      vatAmount,
      total: subtotal + vatAmount,
      timestamp: new Date(),
    };
    
    setPendingSales(prev => [...prev, newPendingSale]);
    clearSale();
    
    toast({
      title: "Sale Suspended",
      description: "Sale has been saved and can be resumed later",
    });
  };

  const resumeSale = (saleId: string) => {
    const sale = pendingSales.find(s => s.id === saleId);
    if (sale) {
      setSaleItems(sale.items);
      setSelectedCustomerId(sale.customerId || null);
      setPendingSales(prev => prev.filter(s => s.id !== saleId));
      setShowResumeModal(false);
      
      toast({
        title: "Sale Resumed",
        description: "Suspended sale has been restored",
      });
    }
  };

  const clearSale = () => {
    setSaleItems([]);
    setSelectedCustomerId(null);
    setSearchTerm("");
  };

  // Safe add to sale function
  const addToSale = (product: any) => {
    try {
      if (!product || !product.id) {
        toast({
          title: "Error",
          description: "Invalid product selected",
          variant: "destructive",
        });
        return;
      }

      const unitPrice = Number(product.unitPrice || product.price || 0);
      const vatRate = Number(product.vatRate || 15);
      
      if (unitPrice <= 0) {
        toast({
          title: "Error", 
          description: "Product must have a valid price",
          variant: "destructive",
        });
        return;
      }
      
      const existingItem = saleItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        setSaleItems(items =>
          items.map(item => {
            if (item.productId === product.id) {
              const newQuantity = item.quantity + 1;
              const total = newQuantity * unitPrice;
              const vatAmount = Number(((total * vatRate) / (100 + vatRate)).toFixed(2));
              const netAmount = Number((total - vatAmount).toFixed(2));
              
              return { 
                ...item, 
                quantity: newQuantity, 
                total: Number(total.toFixed(2)),
                vatRate,
                vatAmount,
                netAmount
              };
            }
            return item;
          })
        );
      } else {
        const total = Number(unitPrice.toFixed(2));
        const vatAmount = Number(((total * vatRate) / (100 + vatRate)).toFixed(2));
        const netAmount = Number((total - vatAmount).toFixed(2));
        
        const newItem: SaleItem = {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name || 'Unknown Product',
          price: unitPrice,
          quantity: 1,
          total,
          vatRate,
          vatAmount,
          netAmount
        };
        
        setSaleItems(items => [...items, newItem]);
      }
    } catch (error) {
      console.error('Error adding to sale:', error);
      toast({
        title: "Error",
        description: "Failed to add product to sale",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setSaleItems(items => 
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          if (newQuantity === 0) return null;
          
          const total = Number((newQuantity * item.price).toFixed(2));
          const vatAmount = Number(((total * item.vatRate) / (100 + item.vatRate)).toFixed(2));
          const netAmount = Number((total - vatAmount).toFixed(2));
          
          return { 
            ...item, 
            quantity: newQuantity, 
            total,
            vatAmount,
            netAmount
          };
        }
        return item;
      }).filter(Boolean) as SaleItem[]
    );
  };

  const removeItem = (id: string) => {
    setSaleItems(items => items.filter(item => item.id !== id));
  };

  // Safe calculations
  const subtotal = Number(saleItems.reduce((sum, item) => sum + (item.netAmount || 0), 0).toFixed(2));
  const totalVatAmount = Number(saleItems.reduce((sum, item) => sum + (item.vatAmount || 0), 0).toFixed(2));
  const grandTotal = Number((subtotal + totalVatAmount).toFixed(2));

  const filteredProducts = products.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.barcode?.includes(searchTerm) ||
    product?.sku?.includes(searchTerm)
  );

  // Process sale mutation
  const processSaleMutation = useMutation({
    mutationFn: async () => {
      if (saleItems.length === 0) {
        throw new Error('No items in cart');
      }

      const saleData = {
        sale: {
          terminalId: 1, // Default terminal ID
          customerId: selectedCustomerId,
          subtotal: subtotal,
          discountAmount: 0,
          vatAmount: totalVatAmount,
          total: grandTotal,
          paymentMethod: paymentData.paymentMethod,
          status: 'completed',
          saleDate: new Date().toISOString()
        },
        items: saleItems.map(item => ({
          productId: item.productId,
          description: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.price),
          discountPercent: 0,
          discountAmount: 0,
          vatRate: Number(item.vatRate),
          vatInclusive: false,
          vatAmount: Number(item.vatAmount),
          lineTotal: Number(item.total)
        })),
        payments: [{
          paymentMethod: paymentData.paymentMethod,
          amount: Number(paymentData.amount || grandTotal),
          amountTendered: Number(paymentData.amountTendered || grandTotal),
          changeDue: Number(changeDue),
          netAmount: Number(paymentData.amount || grandTotal), // Required field
          bankAccountId: paymentData.bankAccountId,
          reference: paymentData.reference || '',
          status: 'completed'
        }]
      };

      return await apiRequest('/api/pos/sales', 'POST', saleData);
    },
    onSuccess: () => {
      toast({
        title: "Sale Completed",
        description: `Sale processed successfully for R ${grandTotal.toFixed(2)}`,
      });
      
      // Reset the sale
      setSaleItems([]);
      setSelectedCustomerId(null);
      setShowPaymentModal(false);
      setIsProcessingSale(false);
      setPaymentData({ paymentMethod: 'cash', amount: 0, amountTendered: 0, reference: '' });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pos/sales'] });
    },
    onError: (error: any) => {
      setIsProcessingSale(false);
      toast({
        title: "Error",
        description: error?.message || "Failed to process sale",
        variant: "destructive",
      });
    },
  });

  const handleProcessPayment = () => {
    if (saleItems.length === 0) {
      toast({
        title: "Error",
        description: "No items in cart",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentData(prev => ({ 
      ...prev, 
      amount: grandTotal,
      amountTendered: grandTotal // Default to exact amount
    }));
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    // Validate amount tendered for cash payments
    if (paymentData.paymentMethod === 'cash' && paymentData.amountTendered < grandTotal) {
      toast({
        title: "Insufficient Amount",
        description: "Please enter an amount equal to or greater than the total due.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingSale(true);
    processSaleMutation.mutate();
  };

  // Calculate change due
  const changeDue = paymentData.amountTendered > grandTotal ? 
    Number((paymentData.amountTendered - grandTotal).toFixed(2)) : 0;

  if (productsLoading || customersLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calculator className="h-8 w-8 mx-auto mb-4 animate-spin" />
            <p>Loading POS Terminal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">POS Terminal</h1>
          <p className="text-gray-600 mt-1">Point of sale interface</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Calculator className="h-3 w-3 mr-1" />
          Terminal Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Search & Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCustomerId?.toString() || 'walk-in'}
                onValueChange={(value) => setSelectedCustomerId(value === 'walk-in' ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name} - {customer.email || 'No email'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Product Search
                </span>
                <Badge variant="outline" className="text-xs">
                  <Keyboard className="h-3 w-3 mr-1" />
                  F1
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search products, scan barcode, or press F1..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 mb-4"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <p>No products found</p>
                  </div>
                ) : (
                  filteredProducts.map((product: any) => (
                    <div
                      key={product.id}
                      onClick={() => addToSale(product)}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        R {Number(product.unitPrice || product.price || 0).toFixed(2)}
                      </div>
                      {product.barcode && (
                        <div className="text-xs text-gray-500">{product.barcode}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Shopping Cart & Totals */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={suspendSale}
                  disabled={saleItems.length === 0}
                  className="flex items-center"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Suspend (F3)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowResumeModal(true)}
                  disabled={pendingSales.length === 0}
                  className="flex items-center"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Resume (F4)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearSale}
                  disabled={saleItems.length === 0}
                  className="flex items-center"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear (F5)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                >
                  <Scan className="h-3 w-3 mr-1" />
                  Scan
                </Button>
              </div>
              {pendingSales.length > 0 && (
                <div className="mt-2 text-xs text-blue-600">
                  {pendingSales.length} suspended sale{pendingSales.length !== 1 ? 's' : ''}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart ({saleItems.length})
                </span>
                <Badge variant="outline" className="text-xs">
                  <Keyboard className="h-3 w-3 mr-1" />
                  F8 Pay
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {saleItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items in cart</p>
                  <p className="text-sm">Add products to start a sale</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {saleItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{item.name}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">R {item.total.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            @ R {item.price.toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Totals */}
          {saleItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span>R {totalVatAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>R {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleProcessPayment}
                  className="w-full mt-4"
                  size="lg"
                  disabled={isProcessingSale}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessingSale ? 'Processing...' : 'Process Payment'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <p className="text-sm text-gray-600">Complete the sale by processing payment</p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-center">Total: R {grandTotal.toFixed(2)}</div>
            </div>
            
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) => {
                  setPaymentData(prev => ({ 
                    ...prev, 
                    paymentMethod: value,
                    amountTendered: value === 'cash' ? grandTotal : grandTotal // Reset amount tendered
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="eft">EFT</SelectItem>
                  <SelectItem value="mobile">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Tendered - Required for cash, optional for others */}
            <div>
              <Label htmlFor="amountTendered">
                Amount Tendered {paymentData.paymentMethod === 'cash' ? '*' : '(Optional)'}
              </Label>
              <Input
                id="amountTendered"
                type="number"
                step="0.01"
                min="0"
                value={paymentData.amountTendered || ''}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  amountTendered: parseFloat(e.target.value) || 0 
                }))}
                placeholder="Enter amount tendered"
                className={
                  paymentData.paymentMethod === 'cash' && paymentData.amountTendered < grandTotal
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }
              />
              {paymentData.paymentMethod === 'cash' && paymentData.amountTendered < grandTotal && (
                <p className="text-red-500 text-sm mt-1">
                  Insufficient amount tendered. Please enter an amount equal to or greater than the total due.
                </p>
              )}
            </div>

            {/* Change Due Display - Always show for cash payments */}
            {paymentData.paymentMethod === 'cash' && (
              <div className={`border p-3 rounded-lg ${
                changeDue > 0 
                  ? "bg-green-50 border-green-200" 
                  : "bg-blue-50 border-blue-200"
              }`}>
                <div className={`font-bold text-lg ${
                  changeDue > 0 
                    ? "text-green-800" 
                    : "text-blue-800"
                }`}>
                  Change Due: R {changeDue.toFixed(2)}
                </div>
              </div>
            )}

            {/* Bank Account for non-cash payments */}
            {paymentData.paymentMethod !== 'cash' && (
              <div>
                <Label htmlFor="bankAccount">Bank Account</Label>
                <Select
                  value={paymentData.bankAccountId?.toString() || ''}
                  onValueChange={(value) => setPaymentData(prev => ({ 
                    ...prev, 
                    bankAccountId: value ? parseInt(value) : undefined 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountName} - {account.accountNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                value={paymentData.reference || ''}
                onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Payment reference"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingSale}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmPayment}
                disabled={
                  isProcessingSale || 
                  (paymentData.paymentMethod === 'cash' && paymentData.amountTendered < grandTotal)
                }
                className={
                  paymentData.paymentMethod === 'cash' && paymentData.amountTendered < grandTotal
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              >
                {isProcessingSale ? 'Processing...' : `Complete Sale - R ${grandTotal.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Sale Modal */}
      <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Resume Suspended Sale
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-64">
              {pendingSales.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No suspended sales</p>
              ) : (
                <div className="space-y-3">
                  {pendingSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => resumeSale(sale.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{sale.customerName}</div>
                        <Badge variant="outline">R {sale.total.toFixed(2)}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} • 
                        {new Date(sale.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowResumeModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg max-w-xs">
        <div className="font-medium mb-2">Keyboard Shortcuts:</div>
        <div className="space-y-1">
          <div>F1 - Search Products</div>
          <div>F3 - Suspend Sale</div>
          <div>F4 - Resume Sale</div>
          <div>F5 - Clear Cart</div>
          <div>F8 - Process Payment</div>
          <div>Numeric keys - Barcode scan</div>
        </div>
      </div>
    </div>
  );
}