import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tablet, Users, Package, CreditCard, Receipt, BarChart3, 
  Settings, Plus, ShoppingCart, Calculator, Clock
} from "lucide-react";

export default function POSPage() {
  const [location] = useLocation();
  const [newSaleOpen, setNewSaleOpen] = useState(false);

  const handleNewSale = () => {
    window.location.href = "/pos/terminal";
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-gray-600 mt-1">Complete POS solution for retail operations</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Clock className="h-3 w-3 mr-1" />
            Shift Active
          </Badge>
          <Button onClick={handleNewSale}>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R 2,450.00</div>
            <p className="text-xs text-muted-foreground">12 transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash in Drawer</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R 850.00</div>
            <p className="text-xs text-muted-foreground">Opening: R 200.00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Average: R 52.13</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">New: 3</p>
          </CardContent>
        </Card>
      </div>

      {/* POS Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "terminal", label: "POS Terminal", icon: Tablet, path: "/pos/terminal" },
            { id: "products", label: "Product Catalog", icon: Package, path: "/products" },
            { id: "customers", label: "Customers", icon: Users, path: "/customers" },
            { id: "reports", label: "Reports", icon: BarChart3, path: "/pos/reports" },
            { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
          ].map((tab) => (
            <Link key={tab.id} href={tab.path}>
              <a className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                location === tab.path
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </a>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Selection or Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                POS Terminal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <Tablet className="h-24 w-24 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  POS Terminal Interface
                </h3>
                <p className="text-gray-600 mb-6">
                  Complete POS terminal with product catalog, barcode scanning, 
                  payment processing, and receipt printing.
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    <strong>Backend Infrastructure:</strong> ✅ Complete (100%)
                </p>
                <Button 
                  onClick={handleNewSale} 
                  className="mb-4"
                  size="lg"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Open POS Terminal
                </Button>
                <p className="text-sm text-gray-500">
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>✅ Sales Processing</div>
                    <div>✅ Payment Methods</div>
                    <div>✅ Inventory Integration</div>
                    <div>✅ Shift Management</div>
                    <div>✅ Refund System</div>
                    <div>✅ Loyalty Programs</div>
                    <div>✅ Promotions Engine</div>
                    <div>✅ Real-time Reporting</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Current Sale/Receipt */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Current Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No items in cart</p>
                  <p className="text-sm">Scan or select products to start</p>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R 0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (15%):</span>
                    <span>R 0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>R 0.00</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" disabled>
                  Process Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Manage Shift
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                POS Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}