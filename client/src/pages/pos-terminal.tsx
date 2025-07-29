import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary, POSErrorFallback } from "@/components/ErrorBoundary";
import { apiRequest } from "@/lib/queryClient";
import { 
  Tablet, Scan, CreditCard, Receipt, Plus, Minus, 
  ShoppingCart, Calculator, Trash2, DollarSign, User, Check
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
  barcode?: string;
}

interface PaymentModalData {
  paymentMethod: string;
  amount: number;
  bankAccountId?: number;
  reference?: string;
}

export default function POSTerminalPage() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentModalData>({
    paymentMethod: 'cash',
    amount: 0
  });
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch real data
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  const { data: bankAccounts = [] } = useQuery<any[]>({
    queryKey: ['/api/bank-accounts'],
  });

  const addToSale = (product: any) => {
    const existingItem = saleItems.find(item => item.id === product.id.toString());
    const unitPrice = parseFloat(product.unitPrice || product.price || 0);
    const vatRate = parseFloat(product.vatRate || 15);
    
    if (existingItem) {
      setSaleItems(items => 
        items.map(item => {
          if (item.id === product.id.toString()) {
            const newQuantity = item.quantity + 1;
            const total = newQuantity * unitPrice;
            const vatAmount = (total * vatRate) / (100 + vatRate);
            const netAmount = total - vatAmount;
            
            return { 
              ...item, 
              quantity: newQuantity, 
              total,
              vatAmount,
              netAmount
            };
          }
          return item;
        })
      );
    } else {
      const total = unitPrice;
      const vatAmount = (total * vatRate) / (100 + vatRate);
      const netAmount = total - vatAmount;
      
      setSaleItems(items => [...items, {
        id: product.id.toString(),
        productId: product.id,
        name: product.name,
        price: unitPrice,
        quantity: 1,
        total,
        vatRate,
        vatAmount,
        netAmount,
        barcode: product.barcode
      }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setSaleItems(items => 
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          if (newQuantity === 0) return null;
          
          const total = newQuantity * item.price;
          const vatAmount = (total * item.vatRate) / (100 + item.vatRate);
          const netAmount = total - vatAmount;
          
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

  // Calculate totals with proper VAT handling and null safety
  const subtotal = saleItems.reduce((sum, item) => sum + (item.netAmount || 0), 0);
  const totalVatAmount = saleItems.reduce((sum, item) => sum + (item.vatAmount || 0), 0);
  const grandTotal = subtotal + totalVatAmount;

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm) ||
    product.sku?.includes(searchTerm)
  );

  // Payment processing mutation
  const processSaleMutation = useMutation({
    mutationFn: async () => {
      if (saleItems.length === 0) {
        throw new Error('No items in cart');
      }

      const saleData = {
        customerId: selectedCustomerId,
        totalAmount: grandTotal,
        subtotalAmount: subtotal,
        vatAmount: totalVatAmount,
        paymentMethod: paymentData.paymentMethod,
        paymentStatus: 'completed',
        saleDate: new Date().toISOString(),
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalAmount: item.total,
          vatRate: item.vatRate,
          vatAmount: item.vatAmount,
          netAmount: item.netAmount
        })),
        payments: [{
          paymentMethod: paymentData.paymentMethod,
          amount: paymentData.amount,
          bankAccountId: paymentData.bankAccountId,
          reference: paymentData.reference
        }]
      };

      const response = await apiRequest('/api/pos/sales', 'POST', {
        sale: saleData,
        items: saleData.items,
        payments: saleData.payments
      });
      return response;
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
      setPaymentData({ paymentMethod: 'cash', amount: 0 });
      
      // Refresh inventory and other data
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process sale",
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

  return (
    <ErrorBoundary fallback={POSErrorFallback}>
      <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">POS Terminal</h1>
          <p className="text-gray-600 mt-1">Complete point of sale interface</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Calculator className="h-3 w-3 mr-1" />
          Terminal Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Search & Catalog */}
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
                value={selectedCustomerId?.toString() || ''}
                onValueChange={(value) => setSelectedCustomerId(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Walk-in Customer</SelectItem>
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
              <CardTitle className="flex items-center">
                <Scan className="h-5 w-5 mr-2" />
                Product Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Input
                  type="text"
                  placeholder="Search products, SKU, or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Scan className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToSale(product)}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">R {product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{product.barcode}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Current Sale */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Current Sale
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSaleItems([])}
                  disabled={saleItems.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sale Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {saleItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No items in cart</p>
                    <p className="text-sm">Scan or select products to start</p>
                  </div>
                ) : (
                  saleItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">R {item.price.toFixed(2)} each</p>
                      </div>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="w-16 text-right">
                        <p className="font-medium">R {item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              {saleItems.length > 0 && (
                <>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal (Excl VAT):</span>
                      <span>R {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT:</span>
                      <span>R {totalVatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>R {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  {selectedCustomerId && (
                    <div className="bg-blue-50 p-2 rounded text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-blue-800">
                          Customer: {customers.find(c => c.id === selectedCustomerId)?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Payment Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleProcessPayment}
                      disabled={processSaleMutation.isPending}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {processSaleMutation.isPending ? 'Processing...' : 'Process Payment'}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setPaymentData(prev => ({ 
                            ...prev, 
                            paymentMethod: 'cash',
                            amount: grandTotal 
                          }));
                          setShowPaymentModal(true);
                        }}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Cash
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setPaymentData(prev => ({ 
                            ...prev, 
                            paymentMethod: 'card',
                            amount: grandTotal 
                          }));
                          setShowPaymentModal(true);
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Card
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Process Payment
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Total Amount */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-2xl font-bold text-gray-900">
                  R {grandTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
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

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            {/* Bank Account (for card/EFT) */}
            {(paymentData.paymentMethod === 'card' || paymentData.paymentMethod === 'eft') && (
              <div className="space-y-2">
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

            {/* Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                placeholder="Payment reference"
                value={paymentData.reference || ''}
                onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
              />
            </div>

            {/* Change Due */}
            {paymentData.paymentMethod === 'cash' && paymentData.amount > grandTotal && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-green-600">Change Due</div>
                  <div className="text-lg font-bold text-green-800">
                    R {(paymentData.amount - grandTotal).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
                disabled={processSaleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={confirmPayment}
                disabled={processSaleMutation.isPending || paymentData.amount < grandTotal}
              >
                <Check className="h-4 w-4 mr-2" />
                {processSaleMutation.isPending ? 'Processing...' : 'Complete Sale'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ErrorBoundary>
  );
}