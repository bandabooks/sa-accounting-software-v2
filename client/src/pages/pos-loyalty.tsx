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
  Star, Plus, Edit, Trash2, Gift, DollarSign, 
  Users, TrendingUp, Award, Crown, Target, Heart
} from "lucide-react";

interface LoyaltyProgram {
  id: number;
  name: string;
  description: string;
  pointsPerRand: number;
  redemptionRate: number;
  minimumRedemption: number;
  isActive: boolean;
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  tierBonuses?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

interface CustomerLoyalty {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinDate: string;
  lastActivity: string;
  totalSpent: number;
  transactionCount: number;
}

export default function POSLoyaltyPage() {
  const [showCreateProgramModal, setShowCreateProgramModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLoyalty | null>(null);
  const [activeTab, setActiveTab] = useState<'programs' | 'members' | 'analytics'>('programs');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsPerRand: 1,
    redemptionRate: 100,
    minimumRedemption: 100,
    tierBonuses: {
      bronze: 0,
      silver: 10,
      gold: 20,
      platinum: 30
    }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch loyalty data
  const { data: loyaltyPrograms = [] } = useQuery<LoyaltyProgram[]>({
    queryKey: ['/api/pos/loyalty-programs'],
  });

  const { data: loyaltyMembers = [] } = useQuery<CustomerLoyalty[]>({
    queryKey: ['/api/pos/loyalty-members'],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  // Create loyalty program mutation
  const createProgramMutation = useMutation({
    mutationFn: async (programData: any) => {
      return await apiRequest('/api/pos/loyalty-programs', 'POST', programData);
    },
    onSuccess: () => {
      toast({
        title: "Loyalty Program Created",
        description: `"${formData.name}" loyalty program has been created successfully`,
      });
      setShowCreateProgramModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/pos/loyalty-programs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create loyalty program",
        variant: "destructive",
      });
    },
  });

  // Redeem points mutation
  const redeemPointsMutation = useMutation({
    mutationFn: async ({ customerId, points, amount }: { customerId: number; points: number; amount: number }) => {
      return await apiRequest('/api/pos/loyalty-redemption', 'POST', {
        customerId,
        points,
        amount,
        type: 'discount'
      });
    },
    onSuccess: () => {
      toast({
        title: "Points Redeemed",
        description: "Loyalty points have been successfully redeemed",
      });
      setShowRedeemModal(false);
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['/api/pos/loyalty-members'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem points",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pointsPerRand: 1,
      redemptionRate: 100,
      minimumRedemption: 100,
      tierBonuses: {
        bronze: 0,
        silver: 10,
        gold: 20,
        platinum: 30
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProgramMutation.mutate(formData);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="h-4 w-4 text-amber-600" />;
      case 'silver': return <Star className="h-4 w-4 text-gray-500" />;
      case 'gold': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'platinum': return <Crown className="h-4 w-4 text-purple-500" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeProgram = loyaltyPrograms.find(p => p.isActive);
  const totalPoints = loyaltyMembers.reduce((sum, member) => sum + member.currentPoints, 0);
  const averagePoints = loyaltyMembers.length > 0 ? totalPoints / loyaltyMembers.length : 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Programs</h1>
          <p className="text-gray-600 mt-1">Reward customers and build lasting relationships</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showCreateProgramModal} onOpenChange={setShowCreateProgramModal}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Loyalty Program</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Program Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., VIP Rewards"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointsPerRand">Points per R1 Spent</Label>
                    <Input
                      id="pointsPerRand"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pointsPerRand}
                      onChange={(e) => setFormData(prev => ({ ...prev, pointsPerRand: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your loyalty program..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="redemptionRate">Points for R1 Discount</Label>
                    <Input
                      id="redemptionRate"
                      type="number"
                      min="1"
                      value={formData.redemptionRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, redemptionRate: parseInt(e.target.value) || 100 }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumRedemption">Minimum Redemption</Label>
                    <Input
                      id="minimumRedemption"
                      type="number"
                      min="1"
                      value={formData.minimumRedemption}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimumRedemption: parseInt(e.target.value) || 100 }))}
                      required
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <Label className="text-base font-semibold">Tier Bonus Percentages</Label>
                  <div className="grid grid-cols-4 gap-4 mt-2">
                    <div>
                      <Label htmlFor="bronze">Bronze</Label>
                      <Input
                        id="bronze"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.tierBonuses.bronze}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          tierBonuses: { ...prev.tierBonuses, bronze: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="silver">Silver</Label>
                      <Input
                        id="silver"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.tierBonuses.silver}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          tierBonuses: { ...prev.tierBonuses, silver: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gold">Gold</Label>
                      <Input
                        id="gold"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.tierBonuses.gold}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          tierBonuses: { ...prev.tierBonuses, gold: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="platinum">Platinum</Label>
                      <Input
                        id="platinum"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.tierBonuses.platinum}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          tierBonuses: { ...prev.tierBonuses, platinum: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateProgramModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProgramMutation.isPending}>
                    {createProgramMutation.isPending ? 'Creating...' : 'Create Program'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'programs', label: 'Programs', icon: Gift },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyPrograms.filter(p => p.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyMembers.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Avg: {Math.round(averagePoints)} per member</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Points redeemed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === 'programs' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              Loyalty Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loyaltyPrograms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No loyalty programs yet</p>
                <p className="text-sm">Create your first loyalty program to start rewarding customers</p>
              </div>
            ) : (
              <div className="space-y-4">
                {loyaltyPrograms.map((program) => (
                  <div key={program.id} className={`border rounded-lg p-4 ${program.isActive ? 'bg-green-50 border-green-200' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${program.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Gift className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{program.name}</h3>
                            <Badge variant={program.isActive ? "default" : "secondary"}>
                              {program.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{program.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {program.pointsPerRand} points per R1
                            </span>
                            <span className="text-xs text-gray-500">
                              {program.redemptionRate} points = R1 discount
                            </span>
                            <span className="text-xs text-gray-500">
                              {program.totalMembers || 0} members
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'members' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Loyalty Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loyaltyMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No loyalty members yet</p>
                <p className="text-sm">Members will appear here as they join your loyalty programs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {loyaltyMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTierIcon(member.tier)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{member.customerName}</h3>
                            <Badge className={getTierColor(member.tier)}>
                              {member.tier.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{member.customerEmail}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              <Star className="h-3 w-3 inline mr-1" />
                              {member.currentPoints} points
                            </span>
                            <span className="text-xs text-gray-500">
                              R {member.totalSpent.toFixed(2)} spent
                            </span>
                            <span className="text-xs text-gray-500">
                              {member.transactionCount} transactions
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(member);
                            setShowRedeemModal(true);
                          }}
                          disabled={member.currentPoints < (activeProgram?.minimumRedemption || 100)}
                        >
                          Redeem Points
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Member Distribution by Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['bronze', 'silver', 'gold', 'platinum'].map((tier) => {
                  const count = loyaltyMembers.filter(m => m.tier === tier).length;
                  const percentage = loyaltyMembers.length > 0 ? (count / loyaltyMembers.length) * 100 : 0;
                  return (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTierIcon(tier)}
                        <span className="capitalize font-medium">{tier}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              tier === 'bronze' ? 'bg-amber-500' :
                              tier === 'silver' ? 'bg-gray-400' :
                              tier === 'gold' ? 'bg-yellow-500' :
                              'bg-purple-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Points per Member</span>
                  <span className="font-semibold">{Math.round(averagePoints)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Most Active Member</span>
                  <span className="font-semibold">
                    {loyaltyMembers.length > 0 ? 
                      loyaltyMembers.reduce((max, member) => 
                        member.transactionCount > (max?.transactionCount || 0) ? member : max
                      ).customerName : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Highest Point Balance</span>
                  <span className="font-semibold">
                    {loyaltyMembers.length > 0 ? 
                      Math.max(...loyaltyMembers.map(m => m.currentPoints)).toLocaleString() : '0'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Program Enrollment Rate</span>
                  <span className="font-semibold">85%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Redeem Points Modal */}
      <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Loyalty Points</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedCustomer.customerName}</h3>
                    <p className="text-sm text-gray-600">{selectedCustomer.customerEmail}</p>
                  </div>
                  <Badge className={getTierColor(selectedCustomer.tier)}>
                    {selectedCustomer.tier.toUpperCase()}
                  </Badge>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold text-blue-600">
                    {selectedCustomer.currentPoints} points available
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Redemption Amount</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 500, 1000].map((amount) => {
                    const discount = amount / (activeProgram?.redemptionRate || 100);
                    return (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        disabled={selectedCustomer.currentPoints < amount}
                        onClick={() => redeemPointsMutation.mutate({
                          customerId: selectedCustomer.customerId,
                          points: amount,
                          amount: discount
                        })}
                      >
                        {amount} pts<br />
                        <span className="text-xs">R {discount.toFixed(2)}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowRedeemModal(false)}>
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