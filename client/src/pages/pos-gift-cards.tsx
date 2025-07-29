import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Gift, CreditCard, Plus, Search, Calendar, 
  DollarSign, User, Eye, Download, Mail, Send
} from "lucide-react";

interface GiftCard {
  id: number;
  cardNumber: string;
  initialValue: number;
  currentBalance: number;
  purchaseDate: string;
  expiryDate?: string;
  isActive: boolean;
  purchasedBy?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  transactions: GiftCardTransaction[];
}

interface GiftCardTransaction {
  id: number;
  type: 'purchase' | 'redemption' | 'refund';
  amount: number;
  date: string;
  saleId?: number;
  description: string;
}

interface NewGiftCard {
  initialValue: number;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  expiryDate?: string;
  purchasedBy?: string;
}

export default function POSGiftCardsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'create'>('active');
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [redeemAmount, setRedeemAmount] = useState("");
  
  const [newCard, setNewCard] = useState<NewGiftCard>({
    initialValue: 0,
    recipientName: '',
    recipientEmail: '',
    message: '',
    expiryDate: '',
    purchasedBy: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch gift cards
  const { data: giftCards = [] } = useQuery<GiftCard[]>({
    queryKey: ['/api/pos/gift-cards'],
  });

  // Create gift card mutation
  const createGiftCardMutation = useMutation({
    mutationFn: async (cardData: NewGiftCard) => {
      return await apiRequest('/api/pos/gift-cards', 'POST', cardData);
    },
    onSuccess: () => {
      toast({
        title: "Gift Card Created",
        description: "New gift card has been issued successfully",
      });
      setShowCreateModal(false);
      setNewCard({
        initialValue: 0,
        recipientName: '',
        recipientEmail: '',
        message: '',
        expiryDate: '',
        purchasedBy: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pos/gift-cards'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create gift card",
        variant: "destructive",
      });
    },
  });

  // Redeem gift card mutation
  const redeemGiftCardMutation = useMutation({
    mutationFn: async ({ cardId, amount }: { cardId: number; amount: number }) => {
      return await apiRequest(`/api/pos/gift-cards/${cardId}/redeem`, 'PUT', { amount });
    },
    onSuccess: () => {
      toast({
        title: "Gift Card Redeemed",
        description: `R ${redeemAmount} has been applied to the sale`,
      });
      setShowRedeemModal(false);
      setSelectedCard(null);
      setRedeemAmount("");
      queryClient.invalidateQueries({ queryKey: ['/api/pos/gift-cards'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem gift card",
        variant: "destructive",
      });
    },
  });

  // Send gift card email mutation
  const sendGiftCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      return await apiRequest(`/api/pos/gift-cards/${cardId}/send-email`, 'POST', {});
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Gift card details have been emailed to the recipient",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send gift card email",
        variant: "destructive",
      });
    },
  });

  const handleCreateGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.initialValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    createGiftCardMutation.mutate(newCard);
  };

  const handleRedeemGiftCard = () => {
    if (!selectedCard || !redeemAmount || parseFloat(redeemAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid redemption amount",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(redeemAmount);
    if (amount > selectedCard.currentBalance) {
      toast({
        title: "Error",
        description: "Redemption amount exceeds card balance",
        variant: "destructive",
      });
      return;
    }
    
    redeemGiftCardMutation.mutate({ cardId: selectedCard.id, amount });
  };

  const filteredCards = giftCards.filter(card => {
    const matchesSearch = 
      card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'active':
        return matchesSearch && card.status === 'active' && card.currentBalance > 0;
      case 'history':
        return matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'redeemed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const generateCardNumber = () => {
    return 'GC' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gift Card Management</h1>
          <p className="text-gray-600 mt-1">Issue, track, and redeem gift cards</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Gift Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Gift Card</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGiftCard} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Gift Card Value (R)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={newCard.initialValue || ''}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      initialValue: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
                  <Input
                    id="recipientName"
                    value={newCard.recipientName}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      recipientName: e.target.value 
                    }))}
                    placeholder="Gift recipient name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="recipientEmail">Recipient Email (Optional)</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={newCard.recipientEmail}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      recipientEmail: e.target.value 
                    }))}
                    placeholder="recipient@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={newCard.message}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      message: e.target.value 
                    }))}
                    placeholder="Happy birthday! Enjoy your gift..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newCard.expiryDate}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      expiryDate: e.target.value 
                    }))}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createGiftCardMutation.isPending}>
                    {createGiftCardMutation.isPending ? 'Creating...' : 'Create Gift Card'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Cards</p>
                <p className="text-xl font-bold">
                  {giftCards.filter(c => c.status === 'active' && c.currentBalance > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Outstanding</p>
                <p className="text-xl font-bold">
                  R {giftCards.reduce((sum, card) => sum + card.currentBalance, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Redeemed Today</p>
                <p className="text-xl font-bold">
                  {giftCards.filter(c => {
                    const today = new Date().toDateString();
                    return c.transactions.some(t => 
                      t.type === 'redemption' && 
                      new Date(t.date).toDateString() === today
                    );
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-xl font-bold">
                  {giftCards.filter(c => {
                    if (!c.expiryDate) return false;
                    const expiry = new Date(c.expiryDate);
                    const thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                    return expiry <= thirtyDaysFromNow && c.status === 'active';
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'active', label: 'Active Cards', icon: Gift },
          { id: 'history', label: 'All Cards', icon: Calendar },
          { id: 'create', label: 'Quick Issue', icon: Plus }
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

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by card number, recipient name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Gift Cards List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Gift Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No gift cards found</p>
              <p className="text-sm">Create your first gift card to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCards.map((card) => (
                <div key={card.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Gift className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{card.cardNumber}</h3>
                          <Badge className={getStatusColor(card.status)}>
                            {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            Balance: R {card.currentBalance.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600">
                            Original: R {card.initialValue.toFixed(2)}
                          </span>
                          {card.recipientName && (
                            <span className="text-sm text-gray-600">
                              For: {card.recipientName}
                            </span>
                          )}
                        </div>
                        {card.expiryDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(card.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {card.status === 'active' && card.currentBalance > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCard(card);
                            setShowRedeemModal(true);
                          }}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Redeem
                        </Button>
                      )}
                      {card.recipientEmail && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendGiftCardMutation.mutate(card.id)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Resend
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redeem Gift Card Modal */}
      <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Redeem Gift Card</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Card Number</div>
                <div className="font-semibold">{selectedCard.cardNumber}</div>
                <div className="text-sm text-gray-600 mt-2">Available Balance</div>
                <div className="text-lg font-bold text-green-600">
                  R {selectedCard.currentBalance.toFixed(2)}
                </div>
              </div>
              
              <div>
                <Label htmlFor="redeemAmount">Redemption Amount (R)</Label>
                <Input
                  id="redeemAmount"
                  type="number"
                  min="0.01"
                  max={selectedCard.currentBalance}
                  step="0.01"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRedeemModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRedeemGiftCard}
                  disabled={redeemGiftCardMutation.isPending}
                >
                  {redeemGiftCardMutation.isPending ? 'Redeeming...' : 'Apply to Sale'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}