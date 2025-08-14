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
      // 1. Abort all in-flight requests
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();

      // 2. Cancel all active queries and mutations
      await queryClient.cancelQueries();

      // 3. Clear all caches for the old company
      queryClient.clear();

      // 4. Update company in backend
      const response = await fetch('/api/companies/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-Session-Token': localStorage.getItem('sessionToken') || '',
          'X-Company-ID': newCompanyId.toString(),
        },
        body: JSON.stringify({ companyId: newCompanyId }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to switch company');
      }

      const data = await response.json();

      // 5. Update local state and storage
      setCompanyId(newCompanyId);
      localStorage.setItem('activeCompanyId', newCompanyId.toString());

      // 6. Update URL with company parameter
      const url = new URL(window.location.href);
      url.searchParams.set('co', newCompanyId.toString());
      window.history.pushState({}, '', url.toString());

      // 7. Reconnect WebSocket if exists
      if (window.wsConnection) {
        // Leave old company room
        if (companyId) {
          window.wsConnection.send(JSON.stringify({
            type: 'leave_company',
            companyId: companyId,
          }));
        }
        
        // Join new company room
        window.wsConnection.send(JSON.stringify({
          type: 'join_company',
          companyId: newCompanyId,
        }));
      }

      // 8. Invalidate and refetch all queries with new companyId
      await queryClient.invalidateQueries();
      
      // 9. Force immediate refetch of dashboard data for instant updates
      await queryClient.refetchQueries({ 
        queryKey: ['/api/dashboard/stats'],
        type: 'active' 
      });

      toast({
        title: "Company switched",
        description: `Now viewing ${data.company.name}`,
      });

    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to switch company:', error);
        toast({
          title: "Error",
          description: "Failed to switch company",
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