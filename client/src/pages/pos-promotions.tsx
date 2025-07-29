import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Percent, Plus, Edit, Trash2, Calendar, DollarSign, 
  Tag, Gift, Users, TrendingUp, Star, CheckCircle
} from "lucide-react";

interface Promotion {
  id: number;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'category';
  value: number;
  startDate: string;
  endDate: string;
  minimumAmount: number;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

export default function POSPromotionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as const,
    value: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minimumAmount: 0,
    maxUsage: undefined as number | undefined,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[]
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch promotions
  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ['/api/pos/promotions'],
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/product-categories'],
  });

  // Create/Update promotion mutation
  const createPromotionMutation = useMutation({
    mutationFn: async (promotionData: any) => {
      if (editingPromotion) {
        return await apiRequest(`/api/pos/promotions/${editingPromotion.id}`, 'PUT', promotionData);
      } else {
        return await apiRequest('/api/pos/promotions', 'POST', promotionData);
      }
    },
    onSuccess: () => {
      toast({
        title: editingPromotion ? "Promotion Updated" : "Promotion Created",
        description: `Promotion "${formData.name}" has been ${editingPromotion ? 'updated' : 'created'} successfully`,
      });
      setShowCreateModal(false);
      setEditingPromotion(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/pos/promotions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save promotion",
        variant: "destructive",
      });
    },
  });

  // Toggle promotion status
  const togglePromotionMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest(`/api/pos/promotions/${id}/toggle`, 'PUT', { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/promotions'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minimumAmount: 0,
      maxUsage: undefined,
      applicableProducts: [],
      applicableCategories: []
    });
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
      minimumAmount: promotion.minimumAmount,
      maxUsage: promotion.maxUsage,
      applicableProducts: promotion.applicableProducts || [],
      applicableCategories: promotion.applicableCategories || []
    });
    setShowCreateModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPromotionMutation.mutate(formData);
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'fixed_amount': return <DollarSign className="h-4 w-4" />;
      case 'buy_x_get_y': return <Gift className="h-4 w-4" />;
      case 'category': return <Tag className="h-4 w-4" />;
      default: return <Percent className="h-4 w-4" />;
    }
  };

  const getPromotionValue = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}% OFF`;
      case 'fixed_amount':
        return `R ${promotion.value} OFF`;
      case 'buy_x_get_y':
        return `Buy ${Math.floor(promotion.value)} Get ${promotion.value % 1 * 10} Free`;
      case 'category':
        return `${promotion.value}% OFF Category`;
      default:
        return `${promotion.value}% OFF`;
    }
  };

  const activePromotions = promotions.filter(p => p.isActive);
  const expiredPromotions = promotions.filter(p => new Date(p.endDate) < new Date());
  const upcomingPromotions = promotions.filter(p => new Date(p.startDate) > new Date());

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions & Discounts</h1>
          <p className="text-gray-600 mt-1">Manage promotional campaigns and discount strategies</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingPromotion(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Promotion Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Summer Sale 2025"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Promotion Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Discount</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                      <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                      <SelectItem value="category">Category Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the promotion details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="value">
                    {formData.type === 'percentage' ? 'Discount %' : 
                     formData.type === 'fixed_amount' ? 'Amount (R)' : 'Buy X Get Y'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step={formData.type === 'percentage' ? '1' : '0.01'}
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimumAmount">Minimum Purchase (R)</Label>
                  <Input
                    id="minimumAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimumAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxUsage">Max Usage (Optional)</Label>
                  <Input
                    id="maxUsage"
                    type="number"
                    min="1"
                    value={formData.maxUsage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsage: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPromotionMutation.isPending}>
                  {createPromotionMutation.isPending ? 'Saving...' : editingPromotion ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePromotions.length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.length}</div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingPromotions.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Star className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredPromotions.length}</div>
            <p className="text-xs text-muted-foreground">Past campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Promotions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Active Promotions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePromotions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active promotions</p>
              <p className="text-sm">Create your first promotion to boost sales</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePromotions.map((promotion) => (
                <div key={promotion.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        {getPromotionIcon(promotion.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{promotion.name}</h3>
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {getPromotionValue(promotion)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Ends: {new Date(promotion.endDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Used: {promotion.usageCount}{promotion.maxUsage ? `/${promotion.maxUsage}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(promotion)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => togglePromotionMutation.mutate({ id: promotion.id, isActive: false })}
                      >
                        Deactivate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Promotions */}
      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No promotions created yet</p>
              <p className="text-sm">Start creating promotional campaigns to drive sales</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${promotion.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {getPromotionIcon(promotion.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{promotion.name}</h3>
                          <Badge variant={promotion.isActive ? "default" : "secondary"}>
                            {promotion.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge variant="outline">
                            {getPromotionValue(promotion)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Used: {promotion.usageCount}{promotion.maxUsage ? `/${promotion.maxUsage}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(promotion)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => togglePromotionMutation.mutate({ 
                          id: promotion.id, 
                          isActive: !promotion.isActive 
                        })}
                      >
                        {promotion.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}