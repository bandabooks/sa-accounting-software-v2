import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  MessageCircle, 
  BarChart3, 
  DollarSign, 
  Target,
  Sparkles,
  ChevronRight,
  Calendar,
  Users,
  PieChart,
  Send
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { 
  SpendingWizardProfile, 
  SpendingWizardConversation, 
  SpendingWizardMessage,
  SpendingWizardInsight,
  SpendingWizardTip 
} from "@shared/schema";

// Form schemas
const profileSchema = z.object({
  businessType: z.string().min(1, "Business type is required"),
  monthlyRevenue: z.string().optional(),
  monthlyExpenses: z.string().optional(),
  financialGoals: z.array(z.string()).default([]),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).default("moderate"),
});

const conversationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
});

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;
type ConversationForm = z.infer<typeof conversationSchema>;
type MessageForm = z.infer<typeof messageSchema>;

export default function SpendingWizard() {
  const { toast } = useToast();
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Profile setup form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessType: "",
      monthlyRevenue: "",
      monthlyExpenses: "",
      financialGoals: [],
      riskTolerance: "moderate",
    },
  });

  // New conversation form
  const conversationForm = useForm<ConversationForm>({
    resolver: zodResolver(conversationSchema),
    defaultValues: {
      title: "",
      category: "",
    },
  });

  // Message form
  const messageForm = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  // Queries
  const { data: profile, isLoading: profileLoading } = useQuery<SpendingWizardProfile>({
    queryKey: ["/api/wizard/profile"],
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<SpendingWizardConversation[]>({
    queryKey: ["/api/wizard/conversations"],
    enabled: !!profile,
  });

  const { data: insights = [], isLoading: insightsLoading } = useQuery<SpendingWizardInsight[]>({
    queryKey: ["/api/wizard/insights"],
    enabled: !!profile,
  });

  const { data: tips = [], isLoading: tipsLoading } = useQuery<SpendingWizardTip[]>({
    queryKey: ["/api/wizard/tips"],
    enabled: !!profile,
  });

  const { data: messages = [] } = useQuery<SpendingWizardMessage[]>({
    queryKey: ["/api/wizard/conversations", activeConversation, "messages"],
    enabled: !!activeConversation,
  });

  // Mutations
  const createProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => apiRequest("/api/wizard/profile", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wizard/profile"] });
      setShowProfileSetup(false);
      successModal.showSuccess({
        title: "Profile Created Successfully",
        description: "Your financial wizard profile has been set up and is ready to provide personalized insights.",
        confirmText: "Continue"
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: (data: ConversationForm) => apiRequest("/api/wizard/conversations", "POST", data),
    onSuccess: (newConversation: SpendingWizardConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wizard/conversations"] });
      setActiveConversation(newConversation.id);
      conversationForm.reset();
      successModal.showSuccess({
        title: "Conversation Started Successfully",
        description: "Your new financial discussion has been created and is ready for interactive guidance.",
        confirmText: "Continue"
      });
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: (data: { conversationId: number; content: string }) => 
      apiRequest(`/api/wizard/conversations/${data.conversationId}/messages`, "POST", {
        messageType: "user",
        content: data.content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wizard/conversations", activeConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wizard/conversations"] });
      messageForm.reset();
      
      // Simulate AI response after a brief delay
      setTimeout(() => {
        generateAIResponse();
      }, 1000);
    },
  });

  const generateInsightsMutation = useMutation({
    mutationFn: () => apiRequest("/api/wizard/insights/generate", "POST"),
    onSuccess: (insights: SpendingWizardInsight[]) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wizard/insights"] });
      toast({
        title: "Insights Generated", 
        description: `Generated ${insights.length} new financial insights based on your data.`,
      });
    },
  });

  const updateInsightStatusMutation = useMutation({
    mutationFn: (data: { insightId: number; status: string }) =>
      apiRequest(`/api/wizard/insights/${data.insightId}/status`, "PUT", { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wizard/insights"] });
    },
  });

  // Generate AI response (simulated)
  const generateAIResponse = async () => {
    if (!activeConversation) return;

    const aiResponses = [
      {
        content: "That's a great question! Based on your financial data, I can see some opportunities for optimization. Let me analyze your spending patterns...",
        illustration: "🤖",
        adviceType: "recommendation"
      },
      {
        content: "I notice your monthly expenses have increased by 15% compared to last quarter. Here are some strategies to manage this growth while maintaining quality.",
        illustration: "📊",
        adviceType: "insight"
      },
      {
        content: "For your business type, I recommend setting aside 20-25% of revenue for taxes and unexpected expenses. This creates a healthy financial buffer.",
        illustration: "💡",
        adviceType: "tip"
      }
    ];

    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

    try {
      await apiRequest(`/api/wizard/conversations/${activeConversation}/messages`, "POST", {
        messageType: "wizard",
        content: randomResponse.content,
        illustration: randomResponse.illustration,
        adviceType: randomResponse.adviceType,
        actionable: true,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/wizard/conversations", activeConversation, "messages"] });
    } catch (error) {
      console.error("Error generating AI response:", error);
    }
  };

  // Handle profile setup
  const handleProfileSetup = (data: ProfileForm) => {
    createProfileMutation.mutate({
      ...data,
      monthlyRevenue: data.monthlyRevenue || undefined,
      monthlyExpenses: data.monthlyExpenses || undefined,
    });
  };

  // Handle new conversation
  const handleNewConversation = (data: ConversationForm) => {
    createConversationMutation.mutate(data);
  };

  // Handle send message
  const handleSendMessage = (data: MessageForm) => {
    if (!activeConversation) return;
    createMessageMutation.mutate({
      conversationId: activeConversation,
      content: data.content,
    });
  };

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "urgent": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  // Show profile setup if no profile exists
  useEffect(() => {
    if (!profileLoading && !profile) {
      setShowProfileSetup(true);
    }
  }, [profile, profileLoading]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your financial wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            Smart Spending Wizard
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered financial advice tailored to your business
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            variant="outline"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
          <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Profile Setup
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Set Up Your Financial Profile</DialogTitle>
                <DialogDescription>
                  Help us understand your business to provide personalized advice.
                </DialogDescription>
              </DialogHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSetup)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="monthlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Revenue (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="monthlyExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Expenses (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 30000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="riskTolerance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Tolerance</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createProfileMutation.isPending}>
                    {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Financial Insights</TabsTrigger>
          <TabsTrigger value="conversations">AI Conversations</TabsTrigger>
          <TabsTrigger value="tips">Smart Tips</TabsTrigger>
        </TabsList>

        {/* Financial Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{insight.illustration}</span>
                      <Badge variant={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateInsightStatusMutation.mutate({
                        insightId: insight.id,
                        status: insight.status === "new" ? "viewed" : "dismissed"
                      })}
                    >
                      {insight.status === "new" ? "Mark Read" : "Dismiss"}
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  {insight.estimatedImpact && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <DollarSign className="h-4 w-4" />
                      Potential Impact: R{parseFloat(insight.estimatedImpact).toLocaleString()}
                    </div>
                  )}
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      {insight.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {insights.length === 0 && !insightsLoading && (
            <Card className="text-center py-8">
              <CardContent>
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No insights available yet. Generate insights to get personalized financial advice.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Conversations Tab */}
        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Conversations</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          New Chat
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Start New Conversation</DialogTitle>
                          <DialogDescription>
                            Begin a new financial discussion with your AI advisor.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...conversationForm}>
                          <form onSubmit={conversationForm.handleSubmit(handleNewConversation)} className="space-y-4">
                            <FormField
                              control={conversationForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Conversation Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Budget optimization for Q2" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={conversationForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="cash_flow">Cash Flow</SelectItem>
                                      <SelectItem value="expenses">Expense Management</SelectItem>
                                      <SelectItem value="investments">Investments</SelectItem>
                                      <SelectItem value="tax_planning">Tax Planning</SelectItem>
                                      <SelectItem value="general">General Advice</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full" disabled={createConversationMutation.isPending}>
                              {createConversationMutation.isPending ? "Creating..." : "Start Conversation"}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-64">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 cursor-pointer border-b hover:bg-muted transition-colors ${
                          activeConversation === conversation.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setActiveConversation(conversation.id)}
                      >
                        <h4 className="font-medium text-sm">{conversation.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {conversation.category.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {conversation.messageCount} messages
                          </span>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              {activeConversation ? (
                <Card className="h-96 flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {conversations.find(c => c.id === activeConversation)?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 flex ${
                            message.messageType === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.messageType === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-muted"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {message.illustration && (
                                <span className="text-lg">{message.illustration}</span>
                              )}
                              <p className="text-sm">{message.content}</p>
                            </div>
                            {message.adviceType && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {message.adviceType}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                    <Separator />
                    <div className="p-4">
                      <Form {...messageForm}>
                        <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="flex gap-2">
                          <FormField
                            control={messageForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input 
                                    placeholder="Type your message..." 
                                    {...field}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        messageForm.handleSubmit(handleSendMessage)();
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={createMessageMutation.isPending}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Select a conversation to start chatting with your AI financial advisor.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Smart Tips Tab */}
        <TabsContent value="tips" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip) => (
              <Card key={tip.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tip.illustration}</span>
                    <Badge variant="outline">{tip.category.replace('_', ' ')}</Badge>
                  </div>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tip.content}</p>
                  {tip.businessType !== "general" && (
                    <div className="mt-3">
                      <Badge variant="secondary" className="text-xs">
                        For {tip.businessType} businesses
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {tips.length === 0 && !tipsLoading && (
            <Card className="text-center py-8">
              <CardContent>
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No tips available yet. Complete your profile setup to receive personalized advice.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={successModal.hideSuccess}
        title={successModal.modalOptions.title}
        description={successModal.modalOptions.description}
        confirmText={successModal.modalOptions.confirmText}
      />
    </div>
  );
}