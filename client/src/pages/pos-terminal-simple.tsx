import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, Minus, Trash2, ShoppingCart, Calculator, 
  User, CreditCard, DollarSign
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
  bankAccountId?: number;
  reference?: string;
}

export default function SimplePOSTerminal() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentMethod: 'cash',
    amount: 0
  });
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  
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
        terminalId: 1, // Default terminal ID
        customerId: selectedCustomerId,
        subtotal: subtotal,
        discountAmount: 0,
        vatAmount: totalVatAmount,
        total: grandTotal,
        paymentMethod: paymentData.paymentMethod,
        status: 'completed',
        saleDate: new Date().toISOString(),
        items: saleItems.map(item => ({
          productId: item.productId,
          description: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          discountPercent: 0,
          discountAmount: 0,
          vatRate: item.vatRate,
          vatInclusive: false,
          vatAmount: item.vatAmount,
          lineTotal: item.total
        })),
        payments: [{
          paymentMethod: paymentData.paymentMethod,
          amount: paymentData.amount || grandTotal,
          bankAccountId: paymentData.bankAccountId,
          reference: paymentData.reference || '',
          authorizationCode: null
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
      setPaymentData({ paymentMethod: 'cash', amount: 0 });
      
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
    
    setPaymentData(prev => ({ ...prev, amount: grandTotal }));
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    setIsProcessingSale(true);
    processSaleMutation.mutate();
  };

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
              <CardTitle>Product Search</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search products by name, barcode, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              
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
          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart ({saleItems.length})
                </span>
                {saleItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSaleItems([])}
                  >
                    Clear All
                  </Button>
                )}
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
              <div className="text-lg font-bold">Total: R {grandTotal.toFixed(2)}</div>
            </div>
            
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
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
                disabled={isProcessingSale}
              >
                {isProcessingSale ? 'Processing...' : `Complete Sale - R ${grandTotal.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}