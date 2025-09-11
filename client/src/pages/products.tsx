import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Edit, Trash2, Package, Tag, DollarSign, Boxes, CheckCircle, AlertTriangle, Eye, Settings, Copy, Archive, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { MiniDashboard } from "@/components/MiniDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import ProductForm from "@/components/ProductForm";
import type { Product, ProductCategory } from "@shared/schema";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "products" | "services">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, reason: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["/api/product-categories"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    total: number;
    active: number;
    services: number;
    lowStock: number;
  }>({
    queryKey: ["/api/products/stats"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await apiRequest("/api/products", "POST", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/stats"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setIsCreateDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      return await apiRequest(`/api/products/${id}`, "PUT", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/stats"] });
      toast({
        title: "Success", 
        description: "Product updated successfully",
      });
      setIsCreateDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/products/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/stats"] });
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

  // Use loading states for comprehensive loading feedback including mutations - MUST be after ALL mutations
  useLoadingStates({
    loadingStates: [
      { isLoading: productsLoading, message: 'Loading products...' },
      { isLoading: statsLoading, message: 'Loading product statistics...' },
      { isLoading: createProductMutation.isPending, message: 'Creating product...' },
      { isLoading: updateProductMutation.isPending, message: 'Updating product...' },
      { isLoading: deleteProductMutation.isPending, message: 'Deleting product...' },
    ],
    progressSteps: ['Fetching products', 'Loading categories', 'Processing inventory'],
  });

  if (productsLoading) {
    return <PageLoader message="Loading products..." />;
  }

  // Deduplicate products first, then filter
  const uniqueProducts = (Array.isArray(products) ? products : [])
    .filter((product, index, self) => 
      // Remove duplicates based on product ID
      index === self.findIndex(p => p.id === product.id)
    );

  const filteredProducts = uniqueProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Prioritize statusFilter when both statusFilter and typeFilter are set
    if (statusFilter) {
      const matchesStatus = 
        (statusFilter === "active" && product.isActive !== false) ||
        (statusFilter === "services" && product.isService === true) ||
        (statusFilter === "lowStock" && product.isService !== true && 
         product.stockQuantity !== null && product.stockQuantity <= (product.minStockLevel || 10));
      return matchesSearch && matchesStatus;
    }

    // Only apply type filter if no status filter
    const matchesType = typeFilter === "all" || 
      (typeFilter === "products" && !product.isService) ||
      (typeFilter === "services" && product.isService);
    
    return matchesSearch && matchesType;
  });

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsCreateDialogOpen(true);
  };

  const handleProductSubmit = (productData: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setEditingProduct(null);
  };

  const handleProductCardClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  const handleStockAdjustment = () => {
    if (!selectedProduct || selectedProduct.isService) return;
    
    setStockAdjustment({ quantity: 0, reason: "" });
    setIsStockDialogOpen(true);
  };

  const submitStockAdjustment = async () => {
    if (!selectedProduct || stockAdjustment.quantity === 0) return;
    
    try {
      await apiRequest(`/api/products/${selectedProduct.id}/stock-adjustment`, "POST", {
        adjustment: stockAdjustment.quantity,
        reason: stockAdjustment.reason,
        newQuantity: (selectedProduct.stockQuantity || 0) + stockAdjustment.quantity
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/stats"] });
      toast({
        title: "Success",
        description: "Stock adjusted successfully",
      });
      setIsStockDialogOpen(false);
      setStockAdjustment({ quantity: 0, reason: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    const duplicatedProduct = {
      ...product,
      name: `${product.name} (Copy)`,
      sku: product.sku ? `${product.sku}-COPY` : undefined,
      id: undefined,
    };
    createProductMutation.mutate(duplicatedProduct);
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
      <MiniDashboard title="Products Overview">
        <DashboardCard
          title="Total Products"
          value={stats?.total || uniqueProducts.length}
          icon={Package}
          color="blue"
          onClick={() => setStatusFilter("")}
        />
        <DashboardCard
          title="Active"
          value={stats?.active || uniqueProducts.filter(p => p.isActive !== false).length}
          icon={CheckCircle}
          color="green"
          onClick={() => setStatusFilter("active")}
        />
        <DashboardCard
          title="Services"
          value={stats?.services || uniqueProducts.filter(p => p.isService === true).length}
          icon={Tag}
          color="purple"
          onClick={() => setStatusFilter("services")}
        />
        <DashboardCard
          title="Low Stock"
          value={stats?.lowStock || uniqueProducts.filter(p => p.isService !== true && 
            p.stockQuantity !== null && p.stockQuantity <= (p.minStockLevel || 10)).length}
          icon={AlertTriangle}
          color="orange"
          onClick={() => setStatusFilter("lowStock")}
        />
      </MiniDashboard>

      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products & Services</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your products and services inventory</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/products/categories">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              data-testid="button-manage-categories"
            >
              <Tag className="w-4 h-4" />
              Manage Categories
            </Button>
          </Link>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setEditingProduct(null);
                }}
                data-testid="button-add-product"
              >
                <Plus className="w-4 h-4" />
                Add Product/Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product/Service" : "Add New Product/Service"}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                onSubmit={handleProductSubmit}
                onCancel={handleDialogClose}
                isLoading={createProductMutation.isPending || updateProductMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Professional Filtering */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-products"
          />
        </div>
        
        <Tabs 
          value={typeFilter} 
          onValueChange={(value) => {
            setTypeFilter(value as any);
            // Clear status filter when switching type filter to avoid conflicts
            if (value !== "all") {
              setStatusFilter("");
            }
          }} 
          className="w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
            <TabsTrigger value="products" data-testid="filter-products">Products Only</TabsTrigger>
            <TabsTrigger value="services" data-testid="filter-services">Services Only</TabsTrigger>
          </TabsList>
        </Tabs>

        {(statusFilter || typeFilter !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter("");
              setTypeFilter("all");
            }}
            className="whitespace-nowrap"
            data-testid="button-clear-filter"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">

          {productsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <Card 
                    key={product.id} 
                    className="hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
                    onClick={() => handleProductCardClick(product)}
                    data-testid={`card-product-${product.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProduct(product);
                            }}
                            data-testid={`button-edit-product-${product.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`button-actions-product-${product.id}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductCardClick(product);
                                }}
                                data-testid={`menu-view-${product.id}`}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {!product.isService && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProduct(product);
                                    handleStockAdjustment();
                                  }}
                                  data-testid={`menu-stock-${product.id}`}
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Adjust Stock
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateProduct(product);
                                }}
                                data-testid={`menu-duplicate-${product.id}`}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProduct(product.id);
                                }}
                                className="text-red-600"
                                data-testid={`menu-delete-${product.id}`}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                <Button data-testid="button-add-product-empty">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              View detailed information and manage this product or service
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">SKU</Label>
                  <p className="text-sm text-gray-600" data-testid="text-product-sku">{selectedProduct.sku || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-gray-600" data-testid="text-product-category">{getCategoryName(selectedProduct.categoryId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge variant={selectedProduct.isService ? "secondary" : "default"}>
                    {selectedProduct.isService ? "Service" : "Product"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Price</Label>
                  <p className="text-lg font-bold" data-testid="text-product-price">{formatCurrency(selectedProduct.unitPrice)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {!selectedProduct.isService && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Current Stock</Label>
                      <p className="text-sm text-gray-600" data-testid="text-current-stock">{selectedProduct.stockQuantity || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Minimum Stock Level</Label>
                      <p className="text-sm text-gray-600">{selectedProduct.minStockLevel || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Stock Status</Label>
                      {(() => {
                        const status = getStockStatus(selectedProduct);
                        return status ? <Badge variant={status.variant}>{status.status}</Badge> : null;
                      })()}
                    </div>
                  </>
                )}
                
                <div>
                  <Label className="text-sm font-medium">VAT Rate</Label>
                  <p className="text-sm text-gray-600">{selectedProduct.vatRate || 0}%</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                </div>
              )}

              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    handleEditProduct(selectedProduct);
                  }}
                  data-testid="button-edit-from-details"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </Button>
                
                {!selectedProduct.isService && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      handleStockAdjustment();
                    }}
                    data-testid="button-adjust-stock-from-details"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Adjust Stock
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={() => handleDuplicateProduct(selectedProduct)}
                  data-testid="button-duplicate-from-details"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Make stock quantity adjustments with reason for audit trail
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Current Stock</Label>
                <p className="text-lg font-bold">{selectedProduct.stockQuantity || 0} units</p>
              </div>
              
              <div>
                <Label htmlFor="adjustment">Adjustment Quantity</Label>
                <Input
                  id="adjustment"
                  type="number"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment(prev => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 0
                  }))}
                  placeholder="Enter adjustment (+ to add, - to subtract)"
                  data-testid="input-stock-adjustment"
                />
                <p className="text-xs text-gray-500 mt-1">
                  New quantity will be: {(selectedProduct.stockQuantity || 0) + stockAdjustment.quantity}
                </p>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Adjustment</Label>
                <Textarea
                  id="reason"
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  placeholder="Enter reason for stock adjustment..."
                  data-testid="textarea-adjustment-reason"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={submitStockAdjustment}
                  disabled={stockAdjustment.quantity === 0 || !stockAdjustment.reason.trim()}
                  data-testid="button-submit-stock-adjustment"
                >
                  Submit Adjustment
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsStockDialogOpen(false);
                    setStockAdjustment({ quantity: 0, reason: "" });
                  }}
                  data-testid="button-cancel-stock-adjustment"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}