import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  MessageCircle, 
  X, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  Calculator,
  HelpCircle,
  Loader2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  actionable_items?: string[];
  follow_up_questions?: string[];
  recommendations?: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
  }>;
}

interface AIAssistantWidgetProps {
  companyId: number;
  userId: number;
  currentPage?: string;
}

const QUERY_TYPES = [
  { id: 'business_insights', label: 'Business Insights', icon: TrendingUp, color: 'bg-blue-500' },
  { id: 'compliance_guidance', label: 'Compliance Help', icon: Shield, color: 'bg-green-500' },
  { id: 'financial_analysis', label: 'Financial Analysis', icon: Calculator, color: 'bg-purple-500' },
  { id: 'tax_optimization', label: 'Tax Optimization', icon: Lightbulb, color: 'bg-yellow-500' },
  { id: 'general_help', label: 'General Help', icon: HelpCircle, color: 'bg-gray-500' }
];

export function AIAssistantWidget({ companyId, userId, currentPage }: AIAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('general_help');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && insights === null) {
      loadDashboardInsights();
    }
  }, [isOpen, companyId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadDashboardInsights = async () => {
    try {
      const response = await fetch(`/api/ai-assistant/insights/${companyId}`)
        .then(res => res.json());
      setInsights(response);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiRequest('/api/ai-assistant/query', {
        method: 'POST',
        body: JSON.stringify({
          type: selectedType,
          query: inputText,
          context: {
            companyId,
            userId,
            currentPage
          }
        })
      });

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        confidence: response.confidence,
        sources: response.sources,
        actionable_items: response.actionable_items,
        follow_up_questions: response.follow_up_questions,
        recommendations: response.recommendations
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.",
        timestamp: new Date(),
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white h-14 w-14"
        >
          <Bot className="h-6 w-6" />
        </Button>
        {insights?.alerts?.length > 0 && (
          <div className="absolute -top-2 -left-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px]">
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Business Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Quick Insights */}
          {insights && (insights.insights?.length > 0 || insights.alerts?.length > 0) && (
            <div className="p-4 border-b bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Quick Insights</h4>
              <div className="space-y-2">
                {insights.insights?.slice(0, 2).map((insight: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-blue-700">
                    <TrendingUp className="h-3 w-3" />
                    {insight}
                  </div>
                ))}
                {insights.alerts?.slice(0, 1).map((alert: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Type Selector */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-1">
              {QUERY_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                  className="text-xs h-7"
                >
                  <type.icon className="h-3 w-3 mr-1" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                  <p>Hello! I'm your AI business assistant.</p>
                  <p>Ask me about your business performance, compliance, taxes, or general help.</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex gap-3",
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  )}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {message.type === 'assistant' && message.confidence && (
                      <div className="mt-2 text-xs opacity-70">
                        Confidence: {Math.round(message.confidence * 100)}%
                      </div>
                    )}

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs opacity-70 mb-1">Sources:</div>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-medium">Recommendations:</div>
                        {message.recommendations.map((rec, index) => (
                          <div key={index} className={cn(
                            "p-2 rounded border text-xs",
                            getPriorityColor(rec.priority)
                          )}>
                            <div className="font-medium">{rec.title}</div>
                            <div className="opacity-80">{rec.description}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {rec.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.follow_up_questions && message.follow_up_questions.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs opacity-70 mb-2">Suggested questions:</div>
                        <div className="space-y-1">
                          {message.follow_up_questions.slice(0, 3).map((question, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickQuestion(question)}
                              className="text-xs h-auto p-1 justify-start text-left whitespace-normal"
                            >
                              <MessageCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                              {question}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything about your business..."
                className="flex-1 min-h-0 resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button 
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}