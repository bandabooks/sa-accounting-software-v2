import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, CheckCircle, AlertCircle, Landmark, Calendar, DollarSign, 
  RefreshCw, TrendingUp, Users, Clock, Target, Filter,
  Eye, ThumbsUp, ThumbsDown, ArrowRight, BarChart3,
  AlertTriangle, CheckSquare, X, Zap, Settings,
  Activity, Brain, Shield, Layers
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";

// Enhanced interfaces for SA reconciliation system
interface BankAccount {
  id: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currentBalance: string;
  accountType: string;
}

interface ReconciliationSession {
  id: number;
  sessionId: string;
  sessionName: string;
  bankAccountIds: number[];
  reconciliationType: 'automated' | 'manual' | 'hybrid';
  reconciliationPeriod: {
    from: string;
    to: string;
  };
  considerBankDelays: boolean;
  crossBankMatching: boolean;
  confidenceThreshold: number;
  autoApproveThreshold: number;
  status: string;
  totalTransactions: number;
  matchedTransactions: number;
  pendingReview: number;
  autoApproved: number;
  duplicatesFound: number;
  processingStarted?: string;
  processingCompleted?: string;
  errorMessages?: string[];
  createdAt: string;
}

interface TransactionMatch {
  id: number;
  sourceTransactionId: string;
  matchedTransactionId?: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'cross_bank' | 'delayed' | 'fee_pattern' | 'partial';
  saSpecificFactors: {
    bankDelayConsidered: boolean;
    referenceFormatMatched: boolean;
    crossBankTransfer: boolean;
    immediatePayment: boolean;
    withinEftWindow: boolean;
    feePatternMatch: boolean;
  };
  transactionDate: string;
  description: string;
  amount: string;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  autoApproved: boolean;
  reasoning: string;
  alternativeMatches: Array<{
    transactionId: string;
    confidence: number;
    reason: string;
  }>;
}

interface ReviewQueueItem {
  id: number;
  queuePosition: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reviewType: string;
  reviewReason: string;
  complexityScore: number;
  suggestedAction: string;
  transaction: {
    id: string;
    description: string;
    amount: string;
    date: string;
    bankName: string;
  };
  bankingComplexity: any;
  timelineAnalysis: any;
  assignedTo?: number;
  status: 'pending' | 'in_review' | 'escalated' | 'completed' | 'cancelled';
}

export default function EnhancedReconciliation() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedMatches, setSelectedMatches] = useState<number[]>([]);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [bulkApprovalDialogOpen, setBulkApprovalDialogOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<ReviewQueueItem | null>(null);
  const [newSession, setNewSession] = useState({
    sessionName: "",
    bankAccountIds: [] as number[],
    reconciliationType: "hybrid" as const,
    periodFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodTo: new Date().toISOString().split('T')[0],
    considerBankDelays: true,
    crossBankMatching: true,
    confidenceThreshold: 0.75,
    autoApproveThreshold: 0.90
  });
  const { toast } = useToast();

  // Fetch bank accounts
  const { data: bankAccounts = [], isLoading: accountsLoading } = useQuery<BankAccount[]>({
    queryKey: ["/api/bank-accounts"],
  });

  // Fetch reconciliation sessions
  const { data: reconciliationSessions = [], isLoading: sessionsLoading } = useQuery<ReconciliationSession[]>({
    queryKey: ["/api/enhanced-reconciliation/sessions"],
  });

  // Fetch transaction matches for selected session
  const { data: transactionMatches = [], isLoading: matchesLoading } = useQuery<TransactionMatch[]>({
    queryKey: ["/api/enhanced-reconciliation/matches", selectedSession],
    enabled: !!selectedSession,
  });

  // Fetch review queue
  const { data: reviewQueue = [], isLoading: reviewQueueLoading } = useQuery<ReviewQueueItem[]>({
    queryKey: ["/api/enhanced-reconciliation/review-queue"],
  });

  // Fetch reconciliation analytics
  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/enhanced-reconciliation/analytics"],
  });

  // Create reconciliation session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/enhanced-reconciliation/sessions", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-reconciliation/sessions"] });
      setSessionDialogOpen(false);
      resetNewSession();
      toast({ title: "Success", description: "Enhanced reconciliation session started successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to start reconciliation session", 
        variant: "destructive" 
      });
    },
  });

  // Approve transaction matches mutation
  const approveMatchesMutation = useMutation({
    mutationFn: (matchIds: number[]) => 
      apiRequest("/api/enhanced-reconciliation/matches/bulk-approve", "POST", { matchIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-reconciliation/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-reconciliation/review-queue"] });
      setSelectedMatches([]);
      toast({ title: "Success", description: "Transaction matches approved successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to approve matches", 
        variant: "destructive" 
      });
    },
  });

  // Complete review item mutation
  const completeReviewMutation = useMutation({
    mutationFn: (data: { itemId: number; decision: string; notes?: string }) =>
      apiRequest(`/api/enhanced-reconciliation/review-queue/${data.itemId}/complete`, "POST", {
        decision: data.decision,
        notes: data.notes
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-reconciliation/review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enhanced-reconciliation/matches"] });
      setReviewDialogOpen(false);
      setSelectedReviewItem(null);
      toast({ title: "Success", description: "Review item completed successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to complete review", 
        variant: "destructive" 
      });
    },
  });

  const resetNewSession = () => {
    setNewSession({
      sessionName: "",
      bankAccountIds: [],
      reconciliationType: "hybrid",
      periodFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      periodTo: new Date().toISOString().split('T')[0],
      considerBankDelays: true,
      crossBankMatching: true,
      confidenceThreshold: 0.75,
      autoApproveThreshold: 0.90
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "review_required": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 bg-green-50";
    if (confidence >= 0.7) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleMatchSelect = (matchId: number, checked: boolean) => {
    if (checked) {
      setSelectedMatches([...selectedMatches, matchId]);
    } else {
      setSelectedMatches(selectedMatches.filter(id => id !== matchId));
    }
  };

  const handleStartSession = () => {
    if (!newSession.sessionName || newSession.bankAccountIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a session name and select at least one bank account",
        variant: "destructive"
      });
      return;
    }

    const sessionData = {
      ...newSession,
      reconciliationPeriod: {
        from: newSession.periodFrom,
        to: newSession.periodTo
      }
    };

    createSessionMutation.mutate(sessionData);
  };

  const renderSAFactors = (factors: TransactionMatch['saSpecificFactors']) => (
    <div className="flex flex-wrap gap-1">
      {factors.bankDelayConsidered && <Badge variant="outline" className="text-xs">Bank Delay</Badge>}
      {factors.referenceFormatMatched && <Badge variant="outline" className="text-xs">Ref Match</Badge>}
      {factors.crossBankTransfer && <Badge variant="outline" className="text-xs">Cross-Bank</Badge>}
      {factors.immediatePayment && <Badge variant="outline" className="text-xs">Immediate</Badge>}
      {factors.withinEftWindow && <Badge variant="outline" className="text-xs">EFT Window</Badge>}
      {factors.feePatternMatch && <Badge variant="outline" className="text-xs">Fee Pattern</Badge>}
    </div>
  );

  if (accountsLoading || sessionsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced SA Reconciliation</h1>
          <p className="text-gray-600 mt-1">AI-powered reconciliation with South African banking intelligence</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Start Enhanced Reconciliation Session</DialogTitle>
                <DialogDescription>
                  Configure a new reconciliation session with SA banking intelligence
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionName">Session Name *</Label>
                  <Input
                    id="sessionName"
                    placeholder="e.g., Monthly Reconciliation - October 2024"
                    value={newSession.sessionName}
                    onChange={(e) => setNewSession(prev => ({ ...prev, sessionName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Bank Accounts *</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`account-${account.id}`}
                          checked={newSession.bankAccountIds.includes(account.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewSession(prev => ({
                                ...prev,
                                bankAccountIds: [...prev.bankAccountIds, account.id]
                              }));
                            } else {
                              setNewSession(prev => ({
                                ...prev,
                                bankAccountIds: prev.bankAccountIds.filter(id => id !== account.id)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`account-${account.id}`} className="text-sm">
                          {account.accountName} ({account.bankName}) - {account.accountNumber}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodFrom">Period From *</Label>
                    <Input
                      id="periodFrom"
                      type="date"
                      value={newSession.periodFrom}
                      onChange={(e) => setNewSession(prev => ({ ...prev, periodFrom: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodTo">Period To *</Label>
                    <Input
                      id="periodTo"
                      type="date"
                      value={newSession.periodTo}
                      onChange={(e) => setNewSession(prev => ({ ...prev, periodTo: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reconciliation Type</Label>
                  <Select
                    value={newSession.reconciliationType}
                    onValueChange={(value: any) => setNewSession(prev => ({ ...prev, reconciliationType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automated">Automated</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Recommended)</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="considerDelays">Consider SA Bank Delays</Label>
                    <Switch
                      id="considerDelays"
                      checked={newSession.considerBankDelays}
                      onCheckedChange={(checked) => setNewSession(prev => ({ ...prev, considerBankDelays: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="crossBank">Cross-Bank Matching</Label>
                    <Switch
                      id="crossBank"
                      checked={newSession.crossBankMatching}
                      onCheckedChange={(checked) => setNewSession(prev => ({ ...prev, crossBankMatching: checked }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confidenceThreshold">Confidence Threshold</Label>
                    <Input
                      id="confidenceThreshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={newSession.confidenceThreshold}
                      onChange={(e) => setNewSession(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                    />
                    <p className="text-xs text-gray-500">Minimum confidence for auto-matching</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="autoApproveThreshold">Auto-Approve Threshold</Label>
                    <Input
                      id="autoApproveThreshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={newSession.autoApproveThreshold}
                      onChange={(e) => setNewSession(prev => ({ ...prev, autoApproveThreshold: parseFloat(e.target.value) }))}
                    />
                    <p className="text-xs text-gray-500">Minimum confidence for auto-approval</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSessionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartSession}
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? "Starting..." : "Start Session"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" asChild>
            <Link href="/bank-reconciliation">
              <Settings className="h-4 w-4 mr-2" />
              Legacy Reconciliation
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Match Rate</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.autoMatchRate ? `${(analytics.autoMatchRate * 100).toFixed(1)}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">AI matching accuracy</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.averageConfidence ? `${(analytics.averageConfidence * 100).toFixed(1)}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Match confidence score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Queue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analytics.reviewQueueVolume || reviewQueue.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Items pending review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Bank Transfers</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.crossBankTransfers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Detected this period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions">Sessions</TabsTrigger>
          <TabsTrigger value="matches" data-testid="tab-matches">Matches</TabsTrigger>
          <TabsTrigger value="review" data-testid="tab-review">Review Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sessions Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Sessions
                </CardTitle>
                <CardDescription>Latest reconciliation activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reconciliationSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{session.sessionName}</div>
                        <div className="text-sm text-gray-500">
                          {session.totalTransactions} transactions • {(session.matchedTransactions / session.totalTransactions * 100).toFixed(1)}% matched
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(session.status)}>
                          {session.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(session.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* High Priority Review Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  High Priority Reviews
                </CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reviewQueue
                    .filter(item => item.priority === 'high' || item.priority === 'urgent')
                    .slice(0, 5)
                    .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium truncate">{item.transaction.description}</div>
                        <div className="text-sm text-gray-500">{item.reviewReason}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatCurrency(parseFloat(item.transaction.amount))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {reviewQueue.filter(item => item.priority === 'high' || item.priority === 'urgent').length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      No high priority reviews pending
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Reconciliation Sessions</CardTitle>
                  <CardDescription>Manage enhanced reconciliation sessions with SA banking intelligence</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Filter by session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sessions</SelectItem>
                      {reconciliationSessions.map((session) => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.sessionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reconciliationSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
                    <p className="text-gray-600 mb-4">Start your first enhanced reconciliation session</p>
                    <Button onClick={() => setSessionDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Start First Session
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Session</th>
                          <th className="text-left py-3 px-4 font-medium">Period</th>
                          <th className="text-left py-3 px-4 font-medium">Progress</th>
                          <th className="text-left py-3 px-4 font-medium">Confidence</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reconciliationSessions.map((session) => {
                          const progressPercentage = session.totalTransactions > 0 
                            ? (session.matchedTransactions / session.totalTransactions) * 100 
                            : 0;
                          
                          return (
                            <tr key={session.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-medium">{session.sessionName}</div>
                                  <div className="text-sm text-gray-500">
                                    {session.reconciliationType} • {session.bankAccountIds.length} accounts
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {formatDate(session.reconciliationPeriod.from)} - {formatDate(session.reconciliationPeriod.to)}
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>{session.matchedTransactions}/{session.totalTransactions}</span>
                                    <span>{progressPercentage.toFixed(1)}%</span>
                                  </div>
                                  <Progress value={progressPercentage} className="h-2" />
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={getConfidenceColor(session.autoApproveThreshold)}>
                                  {(session.autoApproveThreshold * 100).toFixed(0)}%
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={getStatusColor(session.status)}>
                                  {session.status.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedSession(session.id.toString())}
                                    data-testid={`button-view-session-${session.id}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {session.status === "processing" && (
                                    <Button variant="outline" size="sm" disabled>
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Transaction Matches</CardTitle>
                  <CardDescription>Review and approve AI-generated transaction matches</CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedMatches.length > 0 && (
                    <Button 
                      onClick={() => approveMatchesMutation.mutate(selectedMatches)}
                      disabled={approveMatchesMutation.isPending}
                      data-testid="button-bulk-approve"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Approve Selected ({selectedMatches.length})
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => setBulkApprovalDialogOpen(true)}
                    data-testid="button-bulk-approval-settings"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Bulk Approval
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedSession ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Session</h3>
                  <p className="text-gray-600">Choose a reconciliation session to view transaction matches</p>
                </div>
              ) : matchesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : transactionMatches.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
                  <p className="text-gray-600">No transaction matches for this session</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {transactionMatches.length} matches found • {transactionMatches.filter(m => m.autoApproved).length} auto-approved
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        High Confidence: {transactionMatches.filter(m => m.confidence >= 0.9).length}
                      </Badge>
                      <Badge variant="outline">
                        Medium: {transactionMatches.filter(m => m.confidence >= 0.7 && m.confidence < 0.9).length}
                      </Badge>
                      <Badge variant="outline">
                        Low: {transactionMatches.filter(m => m.confidence < 0.7).length}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">
                            <Checkbox
                              checked={selectedMatches.length === transactionMatches.filter(m => m.status === 'pending').length}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMatches(transactionMatches.filter(m => m.status === 'pending').map(m => m.id));
                                } else {
                                  setSelectedMatches([]);
                                }
                              }}
                            />
                          </th>
                          <th className="text-left py-3 px-4 font-medium">Transaction</th>
                          <th className="text-left py-3 px-4 font-medium">Match Type</th>
                          <th className="text-left py-3 px-4 font-medium">Confidence</th>
                          <th className="text-left py-3 px-4 font-medium">SA Factors</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionMatches.map((match) => (
                          <tr key={match.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              {match.status === 'pending' && (
                                <Checkbox
                                  checked={selectedMatches.includes(match.id)}
                                  onCheckedChange={(checked) => handleMatchSelect(match.id, checked as boolean)}
                                />
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium truncate max-w-xs">{match.description}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <span>{formatCurrency(parseFloat(match.amount))}</span>
                                  <span>•</span>
                                  <span>{formatDate(match.transactionDate)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="capitalize">
                                {match.matchType.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getConfidenceColor(match.confidence)}`}>
                                {(match.confidence * 100).toFixed(1)}%
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {renderSAFactors(match.saSpecificFactors)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={getStatusColor(match.status)}
                                  data-testid={`badge-status-${match.id}`}
                                >
                                  {match.status.replace('_', ' ')}
                                </Badge>
                                {match.autoApproved && (
                                  <Zap className="h-4 w-4 text-yellow-500" title="Auto-approved" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  title="View Details"
                                  data-testid={`button-view-match-${match.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {match.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-green-600 hover:text-green-700"
                                      title="Approve"
                                      data-testid={`button-approve-match-${match.id}`}
                                    >
                                      <ThumbsUp className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-red-600 hover:text-red-700"
                                      title="Reject"
                                      data-testid={`button-reject-match-${match.id}`}
                                    >
                                      <ThumbsDown className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manual Review Queue</CardTitle>
                  <CardDescription>Complex transactions requiring manual review and decision</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reviewQueueLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : reviewQueue.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Review Queue Empty</h3>
                  <p className="text-gray-600">No items requiring manual review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {reviewQueue.filter(item => item.status === 'pending').length} items pending review
                    </p>
                    <div className="flex gap-2">
                      {['urgent', 'high', 'medium', 'low'].map(priority => (
                        <Badge key={priority} variant="outline" className={getPriorityColor(priority)}>
                          {priority}: {reviewQueue.filter(item => item.priority === priority).length}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {reviewQueue
                      .sort((a, b) => {
                        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
                      })
                      .map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                              <Badge variant="outline">
                                {item.reviewType.replace('_', ' ')}
                              </Badge>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="font-medium">{item.transaction.description}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {formatCurrency(parseFloat(item.transaction.amount))} • {formatDate(item.transaction.date)} • {item.transaction.bankName}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Complexity: {(item.complexityScore * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Position: #{item.queuePosition}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          <strong>Review Reason:</strong> {item.reviewReason}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Suggested: <span className="font-medium">{item.suggestedAction.replace('_', ' ')}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedReviewItem(item);
                                setReviewDialogOpen(true);
                              }}
                              data-testid={`button-review-item-${item.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                            {item.status === 'pending' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600"
                                  onClick={() => completeReviewMutation.mutate({
                                    itemId: item.id,
                                    decision: 'approved'
                                  })}
                                  data-testid={`button-approve-review-${item.id}`}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => completeReviewMutation.mutate({
                                    itemId: item.id,
                                    decision: 'rejected'
                                  })}
                                  data-testid={`button-reject-review-${item.id}`}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Item Detail Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Transaction</DialogTitle>
            <DialogDescription>
              Detailed review of complex transaction requiring manual decision
            </DialogDescription>
          </DialogHeader>
          {selectedReviewItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transaction Details</Label>
                  <div className="text-sm space-y-1 mt-1">
                    <div><strong>Description:</strong> {selectedReviewItem.transaction.description}</div>
                    <div><strong>Amount:</strong> {formatCurrency(parseFloat(selectedReviewItem.transaction.amount))}</div>
                    <div><strong>Date:</strong> {formatDate(selectedReviewItem.transaction.date)}</div>
                    <div><strong>Bank:</strong> {selectedReviewItem.transaction.bankName}</div>
                  </div>
                </div>
                <div>
                  <Label>Review Information</Label>
                  <div className="text-sm space-y-1 mt-1">
                    <div><strong>Priority:</strong> <Badge className={getPriorityColor(selectedReviewItem.priority)}>{selectedReviewItem.priority}</Badge></div>
                    <div><strong>Type:</strong> {selectedReviewItem.reviewType.replace('_', ' ')}</div>
                    <div><strong>Complexity:</strong> {(selectedReviewItem.complexityScore * 100).toFixed(0)}%</div>
                    <div><strong>Position:</strong> #{selectedReviewItem.queuePosition}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Review Reason</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                  {selectedReviewItem.reviewReason}
                </div>
              </div>
              
              <div>
                <Label>Suggested Action</Label>
                <div className="text-sm font-medium mt-1">
                  {selectedReviewItem.suggestedAction.replace('_', ' ')}
                </div>
              </div>
              
              <div>
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Add notes about your decision..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              className="text-red-600"
              onClick={() => {
                if (selectedReviewItem) {
                  completeReviewMutation.mutate({
                    itemId: selectedReviewItem.id,
                    decision: 'rejected',
                    notes: (document.getElementById('reviewNotes') as HTMLTextAreaElement)?.value
                  });
                }
              }}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              className="text-green-600"
              onClick={() => {
                if (selectedReviewItem) {
                  completeReviewMutation.mutate({
                    itemId: selectedReviewItem.id,
                    decision: 'approved',
                    notes: (document.getElementById('reviewNotes') as HTMLTextAreaElement)?.value
                  });
                }
              }}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Approval Settings Dialog */}
      <Dialog open={bulkApprovalDialogOpen} onOpenChange={setBulkApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Approval Settings</DialogTitle>
            <DialogDescription>
              Configure criteria for bulk approval of transaction matches
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulkConfidence">Minimum Confidence Threshold</Label>
              <Input
                id="bulkConfidence"
                type="number"
                min="0.5"
                max="1"
                step="0.05"
                defaultValue="0.9"
              />
              <p className="text-xs text-gray-500">Matches above this confidence will be approved</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Maximum Amount Threshold</Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.01"
                placeholder="1000.00"
              />
              <p className="text-xs text-gray-500">Maximum transaction amount for auto-approval</p>
            </div>
            
            <div className="space-y-3">
              <Label>Allowed Match Types</Label>
              <div className="space-y-2">
                {['exact', 'fuzzy', 'cross_bank', 'delayed', 'fee_pattern'].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={type} defaultChecked={type === 'exact' || type === 'fuzzy'} />
                    <Label htmlFor={type} className="text-sm capitalize">
                      {type.replace('_', ' ')} matches
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setBulkApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              <CheckSquare className="h-4 w-4 mr-2" />
              Apply Bulk Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}