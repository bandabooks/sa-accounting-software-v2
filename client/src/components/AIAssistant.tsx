import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface AIContext {
  currentPage: string;
  currentAction?: string;
  selectedData?: any;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Hi! I\'m your AI assistant. I can help you with accounting tasks, answer questions about VAT, explain features, and guide you through the system. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current context
  const getContext = (): AIContext => {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    
    let currentPage = 'Dashboard';
    let currentAction = undefined;
    
    if (pathParts[1]) {
      currentPage = pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1).replace('-', ' ');
    }
    
    if (pathParts[2]) {
      currentAction = pathParts[2];
    }
    
    return {
      currentPage,
      currentAction
    };
  };

  // Check AI health
  const { data: healthStatus } = useQuery<{
    status: 'healthy' | 'degraded' | 'error';
    message: string;
    anthropicConnected: boolean;
    apiKeyConfigured: boolean;
    remainingQuota: number | null;
    lastChecked: string;
    error?: string;
  }>({
    queryKey: ['/api/ai/health'],
    refetchInterval: 60000,
    enabled: isOpen
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ message, context }: { message: string; context: AIContext }) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          context,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: (data: { response: string }) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error: any) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // Handle send message
  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    const context = getContext();
    sendMessage.mutate({ message: input.trim(), context });
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Copy message to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Quick action buttons based on context
  const getQuickActions = () => {
    const context = getContext();
    const actions = [];
    
    if (context.currentPage.includes('Invoice')) {
      actions.push('How do I create an invoice?');
      actions.push('Explain VAT calculation');
    } else if (context.currentPage.includes('Customer')) {
      actions.push('How to add a new customer?');
      actions.push('Customer statement guide');
    } else if (context.currentPage.includes('Expense')) {
      actions.push('How to record an expense?');
      actions.push('Expense categories explained');
    } else {
      actions.push('What can you help me with?');
      actions.push('Show me getting started guide');
    }
    
    return actions;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed z-50 shadow-2xl transition-all duration-300",
      isMinimized 
        ? "bottom-6 right-6 w-80 h-14" 
        : "bottom-6 right-6 w-96 h-[600px] flex flex-col"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            {!isMinimized && healthStatus && (
              <Badge 
                variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {healthStatus.status === 'healthy' ? 'Online' : 'Limited'}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2 relative group",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.error
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {sendMessage.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {getQuickActions().map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setInput(action);
                      handleSend();
                    }}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* API Key Warning */}
          {healthStatus?.status === 'error' && (
            <Alert variant="destructive" className="mx-4 mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                AI service is not configured. Please add API key in settings.
              </AlertDescription>
            </Alert>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={sendMessage.isPending || healthStatus?.status === 'error'}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending || healthStatus?.status === 'error'}
                size="icon"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}