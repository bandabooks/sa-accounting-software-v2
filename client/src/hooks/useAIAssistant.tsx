import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AIMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  message: string;
  createdAt: string;
}

interface AIConversation {
  id: number;
  title: string;
  context?: string;
  contextId?: number;
  messages: AIMessage[];
}

interface UseAIAssistantOptions {
  context?: string;
  contextId?: number;
  autoHealthCheck?: boolean;
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Health check
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/ai/health'],
    enabled: options.autoHealthCheck !== false,
    retry: false,
  });

  // Get or create conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title?: string) => {
      const response = await apiRequest('/api/ai/conversations', 'POST', {
        title: title || 'New Conversation',
        context: options.context,
        contextId: options.contextId,
      });
      return response;
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start AI conversation',
        variant: 'destructive',
      });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!conversationId) {
        const conversation = await createConversationMutation.mutateAsync();
        setConversationId(conversation.id);
      }
      
      setIsTyping(true);
      const response = await apiRequest(`/api/ai/chat/${conversationId || conversation.id}`, 'POST', {
        message,
        context: options.context,
        contextId: options.contextId,
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/ai/conversations/${conversationId}`] 
      });
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: 'AI Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Get conversation history
  const { data: conversation } = useQuery<AIConversation>({
    queryKey: [`/api/ai/conversations/${conversationId}`],
    enabled: !!conversationId,
  });

  // AI-powered suggestions based on context
  const getSuggestionsMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('/api/ai/suggestions', 'POST', {
        prompt,
        context: options.context,
        contextId: options.contextId,
      });
      return response;
    },
  });

  // Analyze data with AI
  const analyzeDataMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/ai/analyze', 'POST', {
        data,
        context: options.context,
        contextId: options.contextId,
      });
      return response;
    },
  });

  return {
    // State
    conversationId,
    conversation,
    isTyping,
    isHealthy: health?.status === 'healthy',
    healthStatus: health,
    healthLoading,

    // Actions
    startConversation: createConversationMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    getSuggestions: getSuggestionsMutation.mutate,
    analyzeData: analyzeDataMutation.mutate,

    // Loading states
    isStartingConversation: createConversationMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    isGettingSuggestions: getSuggestionsMutation.isPending,
    isAnalyzing: analyzeDataMutation.isPending,
  };
}