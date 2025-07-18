import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Link, useLocation } from "wouter";
import { Calculator, ChartLine, FileText, Users, ShoppingCart, BarChart3, Receipt, CreditCard, Settings, TrendingUp, DollarSign, Package, Building, Archive, Building2, BookOpen } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: ChartLine },
  { path: "/invoices", label: "Invoices", icon: FileText },
  { path: "/estimates", label: "Estimates", icon: FileText },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/suppliers", label: "Suppliers", icon: Building },
  { path: "/purchase-orders", label: "Purchase Orders", icon: Package },
  { path: "/products", label: "Products", icon: Package },
  { path: "/inventory", label: "Inventory", icon: Archive },
  { path: "/expenses", label: "Expenses", icon: Receipt },
  { path: "/chart-of-accounts", label: "Chart of Accounts", icon: Calculator },
  { path: "/journal-entries", label: "Journal Entries", icon: BookOpen },
  { path: "/financial-reports", label: "Financial Reports", icon: TrendingUp },
  { path: "/reports", label: "Business Reports", icon: BarChart3 },
  { path: "/companies", label: "Companies", icon: Building2 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden touch-icon-button">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full bg-white">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Calculator className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Think Mybiz</h1>
                <p className="text-sm text-gray-500">Accounting</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`mobile-nav-item flex items-center space-x-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors ${
                      isActive ? "bg-primary text-white hover:bg-primary-dark" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={16} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}