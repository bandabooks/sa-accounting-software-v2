import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Send, 
  User, 
  Bot, 
  Calculator, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  context?: string;
  contextId?: string;
}

interface AIChatProps {
  context?: string;
  contextId?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

const suggestedQuestions = [
  {
    icon: Calculator,
    text: "Help me understand my cash flow",
    category: "financial"
  },
  {
    icon: FileText,
    text: "Review my latest invoice for accuracy",
    category: "invoice"
  },
  {
    icon: TrendingUp,
    text: "What are my top performing products?",
    category: "analytics"
  },
  {
    icon: AlertCircle,
    text: "Check VAT compliance for this period",
    category: "compliance"
  }
];

export default function AIChat({ 
  context, 
  contextId, 
  isMinimized = false, 
  onToggleMinimize, 
  onClose 
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/ai/chat', 'POST', {
        conversationId,
        message,
        context,
        contextId,
      });
    },
    onSuccess: (data: any) => {
      if (!conversationId) {
        setConversationId(data.conversationId);
      }
      
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_assistant',
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        context: data.context,
        contextId: data.contextId,
      }]);
    },
    onError: (error) => {
      toast({
        title: "AI Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      console.error("AI Chat error:", error);
    },
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
      context,
      contextId,
    };

    setMessages(prev => [...prev, newMessage]);
    chatMutation.mutate(input);
    setInput('');
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="h-12 w-12 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
        >
          <Brain className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] z-50 shadow-xl border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          <div className="flex space-x-1">
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-[calc(100%-80px)] p-4">
        <ScrollArea className="flex-1 pr-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
                👋 Hello! I'm your AI assistant. I can help you with:
              </div>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleSuggestedQuestion(question.text)}
                  >
                    <question.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{question.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="flex space-x-2 pt-3 border-t">
          <Input
            placeholder="Ask me anything about your business..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={chatMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || chatMutation.isPending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}