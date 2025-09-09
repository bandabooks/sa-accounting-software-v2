import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CompanyContextType {
  companyId: number | null;
  switchCompany: (newCompanyId: number) => Promise<void>;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// AbortController for canceling in-flight requests
let abortController: AbortController | null = null;

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load initial company from localStorage or API
  useEffect(() => {
    const loadCompany = async () => {
      try {
        // Check localStorage first
        const storedCompanyId = localStorage.getItem('activeCompanyId');
        if (storedCompanyId) {
          setCompanyId(parseInt(storedCompanyId));
        } else {
          // Fetch from API
          const response = await fetch('/api/companies/active', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'X-Session-Token': localStorage.getItem('sessionToken') || '',
            },
          });
          if (response.ok) {
            const data = await response.json();
            setCompanyId(data.id);
            localStorage.setItem('activeCompanyId', data.id.toString());
          }
        }
      } catch (error) {
        console.error('Failed to load active company:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompany();
  }, []);

  const switchCompany = useCallback(async (newCompanyId: number) => {
    if (newCompanyId === companyId) return;

    setIsLoading(true);

    try {
      // 1. Update local state immediately for instant UI feedback
      setCompanyId(newCompanyId);
      localStorage.setItem('activeCompanyId', newCompanyId.toString());

      // 2. Optimistic cache invalidation for instant UI updates - invalidate ALL company-specific data
      queryClient.invalidateQueries({ queryKey: ['/api/companies/active'] });
      
      // Invalidate all dashboard queries (including company-specific ones)
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/priority-actions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-activity'] });
      
      // Invalidate other company-specific data
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chart-of-accounts'] });
      
      // Clear ALL cached queries to ensure fresh data for new company
      queryClient.clear();

      // 3. Update company in backend
      const response = await fetch('/api/companies/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-Session-Token': localStorage.getItem('sessionToken') || '',
          'X-Company-ID': newCompanyId.toString(),
        },
        body: JSON.stringify({ companyId: newCompanyId }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Company switch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          companyId: newCompanyId
        });
        
        // Revert local state on failure
        setCompanyId(companyId);
        
        throw new Error(`Failed to switch company: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // 4. WebSocket notification (non-blocking)
      if (window.wsConnection) {
        window.wsConnection.send(JSON.stringify({
          type: 'switch_company',
          oldCompanyId: companyId,
          newCompanyId: newCompanyId,
        }));
      }
      
      toast({
        title: "Company switched",
        description: `Now viewing ${data.company?.name || 'selected company'}`,
      });

    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to switch company:', error);
        toast({
          title: "Error",
          description: "Failed to switch company. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast]);

  return (
    <CompanyContext.Provider value={{ companyId, switchCompany, isLoading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

// Helper to get company ID for query keys
export function getCompanyId(): number {
  const storedId = localStorage.getItem('activeCompanyId');
  return storedId ? parseInt(storedId) : 0;
}

// Extend window type for WebSocket connection
declare global {
  interface Window {
    wsConnection?: WebSocket;
  }
}