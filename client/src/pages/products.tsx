import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Edit, Trash2, Package, Tag, DollarSign, Boxes, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { MiniDashboard } from "@/components/MiniDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import type { Product, ProductCategory } from "@shared/schema";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["/api/product-categories"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/products/stats"],
    queryFn: () => apiRequest("/api/products/stats", "GET")
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/products/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === "active" && product.isActive !== false) ||
      (statusFilter === "services" && product.type === "service") ||
      (statusFilter === "lowStock" && product.type === "product" && 
       product.stockQuantity !== null && product.stockQuantity <= (product.lowStockThreshold || 10));
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "No Category";
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown Category";
  };

  const getStockStatus = (product: Product) => {
    if (product.isService) return null;
    
    const quantity = product.stockQuantity || 0;
    const minLevel = product.minStockLevel || 0;
    
    if (quantity <= 0) return { status: "Out of Stock", variant: "destructive" as const };
    if (quantity <= minLevel) return { status: "Low Stock", variant: "secondary" as const };
    return { status: "In Stock", variant: "default" as const };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mini Dashboard */}
      {stats && (
        <MiniDashboard title="Products Overview">
          <DashboardCard
            title="Total Products"
            value={stats.total}
            icon={Package}
            color="blue"
            onClick={() => setStatusFilter("")}
          />
          <DashboardCard
            title="Active"
            value={stats.active}
            icon={CheckCircle}
            color="green"
            onClick={() => setStatusFilter("active")}
          />
          <DashboardCard
            title="Services"
            value={stats.services}
            icon={Tag}
            color="purple"
            onClick={() => setStatusFilter("services")}
          />
          <DashboardCard
            title="Low Stock"
            value={stats.lowStock}
            icon={AlertTriangle}
            color="orange"
            onClick={() => setStatusFilter("lowStock")}
          />
        </MiniDashboard>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products & Services</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your products and services inventory</p>
        </div>
        <div className="flex gap-4">
          <Link href="/products/categories">
            <Button variant="outline" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Manage Categories
            </Button>
          </Link>
          <Link href="/products/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {statusFilter && (
          <Button
            variant="outline"
            onClick={() => setStatusFilter("")}
            className="whitespace-nowrap"
          >
            Clear Filter
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products & Services</CardTitle>
          <CardDescription>All your products and services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {product.sku && (
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {product.sku}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/products/${product.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteProductMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Price</span>
                          <span className="font-bold text-lg">{formatCurrency(product.unitPrice)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Category</span>
                          <span className="text-sm">{getCategoryName(product.categoryId)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Type</span>
                          <Badge variant={product.isService ? "secondary" : "default"}>
                            {product.isService ? "Service" : "Product"}
                          </Badge>
                        </div>

                        {stockStatus && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Stock Status</span>
                            <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
                          </div>
                        )}

                        {!product.isService && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Quantity</span>
                            <span className="text-sm font-medium">{product.stockQuantity || 0}</span>
                          </div>
                        )}

                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!productsLoading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No products match your search." : "Get started by adding your first product."}
              </p>
              <Link href="/products/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}