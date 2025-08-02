import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Building, Search, Filter, Mail, Phone, MapPin, Star, Eye, MessageCircle, ShoppingCart, Calendar, Award, TrendingUp, Users, Target, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  vatNumber: string | null;
  paymentTerms: number | null;
  category: string | null;
  notes: string | null;
  isActive: boolean | null;
  createdAt: string;
}

const supplierCategories = [
  'standard',
  'preferred',
  'strategic',
  'local',
  'international',
  'other'
];

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json() as Promise<Supplier[]>;
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/suppliers', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Supplier created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create supplier.",
        variant: "destructive",
      });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/suppliers/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setEditingSupplier(null);
      toast({
        title: "Success",
        description: "Supplier updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update supplier.",
        variant: "destructive",
      });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/suppliers/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "Success",
        description: "Supplier deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete supplier.",
        variant: "destructive",
      });
    },
  });

  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const activeSuppliers = filteredSuppliers.filter(supplier => supplier.isActive);
  const totalSuppliers = filteredSuppliers.length;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      postalCode: formData.get('postalCode') as string,
      vatNumber: formData.get('vatNumber') as string,
      paymentTerms: parseInt(formData.get('paymentTerms') as string) || 30,
      category: formData.get('category') as string,
      notes: formData.get('notes') as string,
      isActive: formData.get('isActive') === 'on',
    };

    if (editingSupplier) {
      updateSupplierMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createSupplierMutation.mutate(data);
    }
  };

  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Generate random ratings and performance data for visual enhancement
  const getSupplierRating = (supplierId: number) => {
    const ratings = [4.2, 4.5, 4.8, 3.9, 4.1, 4.7, 4.3, 4.6, 4.0, 4.4];
    return ratings[supplierId % ratings.length];
  };

  const getSupplierAvatar = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      preferred: "from-green-500 to-emerald-600",
      strategic: "from-purple-500 to-indigo-600",
      standard: "from-blue-500 to-cyan-600",
      local: "from-orange-500 to-red-600",
      international: "from-pink-500 to-rose-600",
      other: "from-gray-500 to-slate-600"
    };
    return colors[category as keyof typeof colors] || colors.standard;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          
          {/* Header Content */}
          <div className="relative p-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">Supplier Network</h1>
                <p className="text-blue-100 text-lg font-medium">Build strategic partnerships with reliable supplier relationships</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Relationship Management</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-medium">Performance Tracking</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Supplier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Supplier Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {formatCategoryName(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="supplier@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+27 11 123 4567"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    placeholder="0000"
                  />
                </div>
                <div>
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    name="vatNumber"
                    placeholder="4123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Input
                    id="paymentTerms"
                    name="paymentTerms"
                    type="number"
                    placeholder="30"
                    defaultValue="30"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes about supplier"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isActive" name="isActive" defaultChecked />
                <Label htmlFor="isActive">Active supplier</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSupplierMutation.isPending}>
                  {createSupplierMutation.isPending ? "Creating..." : "Create Supplier"}
                </Button>
              </div>
                  </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Suppliers Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Suppliers</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Building className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">{totalSuppliers}</div>
              <div className="flex items-center text-sm text-blue-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span>All Partners</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Suppliers Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Active Suppliers</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">{activeSuppliers.length}</div>
              <div className="flex items-center text-sm text-green-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <Target className="h-3 w-3" />
                  <span>Currently Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Categories</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">
                {new Set(filteredSuppliers.map(s => s.category)).size}
              </div>
              <div className="flex items-center text-sm text-purple-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <Award className="h-3 w-3" />
                  <span>Different Types</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Avg Payment Terms</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">
                {filteredSuppliers.length > 0 ? 
                  Math.round(filteredSuppliers.reduce((sum, s) => sum + (s.paymentTerms || 30), 0) / filteredSuppliers.length) : 0
                }
              </div>
              <div className="flex items-center text-sm text-orange-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <Calendar className="h-3 w-3" />
                  <span>Days Average</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filtering System */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search suppliers by name, email, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-lg focus:shadow-xl transition-all duration-300"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-64 h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-lg">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {supplierCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {formatCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gradient Category Chips */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                !selectedCategory || selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-gray-600 to-slate-700 text-white shadow-lg'
                  : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-gray-200/60'
              }`}
            >
              All Categories ({totalSuppliers})
            </button>
            {supplierCategories.map(category => {
              const count = filteredSuppliers.filter(s => s.category === category).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category
                      ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-lg`
                      : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-gray-200/60'
                  }`}
                >
                  {formatCategoryName(category)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Modern Supplier Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Supplier Network</h2>
            <div className="text-sm text-gray-600">
              {filteredSuppliers.length} suppliers {selectedCategory && selectedCategory !== 'all' && `in ${formatCategoryName(selectedCategory)}`}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <Building className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No suppliers found</h3>
                <p className="text-gray-600 mb-6">Start building your supplier network to grow your business</p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Supplier
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="group relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  {/* Category Gradient Header */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getCategoryColor(supplier.category || 'standard')}`}></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Supplier Avatar */}
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${getCategoryColor(supplier.category || 'standard')} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                          {getSupplierAvatar(supplier.name)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                            {supplier.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`bg-gradient-to-r ${getCategoryColor(supplier.category || 'standard')} text-white border-0 shadow-md`}>
                              {formatCategoryName(supplier.category || 'standard')}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-gray-600">{getSupplierRating(supplier.id)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      {supplier.email && (
                        <div className="flex items-center text-sm text-gray-600 p-2 bg-gray-50/60 rounded-lg">
                          <Mail className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-gray-600 p-2 bg-gray-50/60 rounded-lg">
                          <Phone className="h-4 w-4 mr-2 text-green-500" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.city && (
                        <div className="flex items-center text-sm text-gray-600 p-2 bg-gray-50/60 rounded-lg">
                          <MapPin className="h-4 w-4 mr-2 text-red-500" />
                          <span>{supplier.city}</span>
                        </div>
                      )}
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{supplier.paymentTerms || 30}</div>
                        <div className="text-xs text-gray-600">Payment Days</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {supplier.isActive ? "Active" : "Inactive"}
                        </div>
                        <div className="text-xs text-gray-600">Status</div>
                      </div>
                    </div>

                    {/* VAT Information */}
                    {supplier.vatNumber && (
                      <div className="flex items-center justify-between p-2 bg-purple-50/60 rounded-lg">
                        <span className="text-sm text-gray-600">VAT Number</span>
                        <span className="text-sm font-medium text-purple-600">{supplier.vatNumber}</span>
                      </div>
                    )}

                    {/* Relationship Timeline Indicator */}
                    <div className="flex items-center justify-between p-2 bg-orange-50/60 rounded-lg">
                      <span className="text-sm text-gray-600">Partnership</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-orange-500" />
                        <span className="text-sm font-medium text-orange-600">
                          {new Date(supplier.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Floating Action Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSupplier(supplier)}
                          className="group-hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSupplierMutation.mutate(supplier.id)}
                          className="group-hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Quick Contact Actions */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {supplier.email && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Contact
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50 transition-all duration-300"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Order
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      {/* Edit Modal */}
      <Dialog open={!!editingSupplier} onOpenChange={() => setEditingSupplier(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {editingSupplier && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Supplier Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingSupplier.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingSupplier.category || 'standard'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {formatCategoryName(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingSupplier.email || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingSupplier.phone || ''}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingSupplier.address || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={editingSupplier.city || ''}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    defaultValue={editingSupplier.postalCode || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    name="vatNumber"
                    defaultValue={editingSupplier.vatNumber || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Input
                    id="paymentTerms"
                    name="paymentTerms"
                    type="number"
                    defaultValue={editingSupplier.paymentTerms || 30}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingSupplier.notes || ''}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isActive" 
                  name="isActive" 
                  defaultChecked={editingSupplier.isActive || false}
                />
                <Label htmlFor="isActive">Active supplier</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingSupplier(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSupplierMutation.isPending}>
                  {updateSupplierMutation.isPending ? "Updating..." : "Update Supplier"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}